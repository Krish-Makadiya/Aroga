const cron = require("node-cron");
const Appointment = require("../schema/appointment.schema");
const { sendSms } = require("./sms.config");
const { translate } = require("@vitalets/google-translate-api");

// Helper to ensure phone number is in E.164 style (very small, conservative normalization)
function normalizePhone(phone) {
    if (!phone || typeof phone !== "string") return null;
    phone = phone.trim();
    // If already starts with +, assume it's E.164
    if (phone.startsWith("+")) return phone;
    // Basic heuristic for India numbers (10 digits) -> prefix +91
    if (/^\d{10}$/.test(phone)) return "+91" + phone;
    // If number looks like '0' prefixed local number: remove leading 0 and try +91
    if (/^0\d{10}$/.test(phone)) return "+91" + phone.slice(1);
    // Otherwise return the raw string (the SMS provider will validate)
    return phone;
}

function startReminderCron({
    every = "* * * * *",
    windowMinutes = 10,
    limit = 50,
} = {}) {
    // Safety: don't start if sendSms is not configured
    console.log("[reminderCronJob] checking sendSms helper availability");
    if (!sendSms) {
        console.warn(
            "[reminderCronJob] sendSms helper not available — cron will not start"
        );
        return;
    }

    cron.schedule(
        every,
        async () => {
            try {
                console.log("[reminderCronJob] running scheduled task");
                const now = new Date();
                const in30 = new Date(
                    now.getTime() + windowMinutes * 60 * 1000
                );

                const appointments = await Appointment.find({
                    scheduledAt: { $gte: now, $lt: in30 },
                    status: "confirmed",
                    $or: [
                        { reminderSent: false },
                        { reminderSent: { $exists: false } },
                    ],
                })
                    .limit(limit)
                    .populate("patientId", "fullName phone language")
                    .populate("doctorId", "fullName phone");

                if (!appointments || appointments.length === 0) return;

                for (const apt of appointments) {
                    try {
                        const patient = apt.patientId;
                        const doctor = apt.doctorId;

                        if (
                            !patient ||
                            !patient.phone ||
                            !doctor ||
                            !doctor.phone
                        ) {
                            console.warn(
                                `[reminderCronJob] missing patient/doctor info for appointment ${apt._id}`
                            );
                            continue;
                        }

                        const patientTo = normalizePhone(patient.phone);
                        const doctorTo = normalizePhone(doctor.phone);

                        if (!patientTo || !doctorTo) {
                            console.warn(
                                `[reminderCronJob] invalid phone for appointment ${apt._id}: patient ${patient.phone}, doctor ${doctor.phone}`
                            );
                            continue;
                        }

                        const scheduledAt = new Date(apt.scheduledAt);
                        const formatted = scheduledAt.toLocaleString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        });

                        const Patientmessage = `Reminder: Hi ${
                            patient.fullName || "there"
                        }, you have an appointment at ${formatted}.`;
                        const Doctormessage = `Reminder: Hi ${
                            doctor.fullName || "there"
                        }, you have an appointment at ${formatted} with ${
                            patient.fullName || "a patient"
                        }.`;

                        const patientResult = await translate(Patientmessage, { to: patient.language || "en" });
                        const doctorResult = await translate(Doctormessage, { to: "en" });

                        await sendSms(patientTo, patientResult.text);
                        await sendSms(doctorTo, doctorResult.text);

                        // mark as sent
                        apt.reminderSent = true;
                        apt.reminderSentAt = new Date();
                        // Save with caution — do not await too long if sending many
                        try {
                            await apt.save();
                        } catch (saveErr) {
                            console.error(
                                `[reminderCronJob] failed saving reminder flag for ${apt._id}:`,
                                saveErr.message || saveErr
                            );
                        }

                        // Log the recipient numbers we attempted to notify — avoid referencing undefined identifiers
                        console.log(
                            `[reminderCronJob] reminder sent for appointment ${apt._id} -> patient:${patientTo} doctor:${doctorTo}`
                        );
                    } catch (err) {
                        console.error(
                            "[reminderCronJob] send loop error:",
                            err.message || err
                        );
                        // continue to next appointment
                    }
                }
            } catch (err) {
                console.error(
                    "[reminderCronJob] error during scheduled run:",
                    err.message || err
                );
            }
        },
        {
            timezone: process.env.REMINDER_CRON_TZ || "Asia/Kolkata",
        }
    );

    console.log(
        "[reminderCronJob] started — schedule:",
        every,
        "windowMinutes:",
        windowMinutes
    );
}

module.exports = { startReminderCron };
