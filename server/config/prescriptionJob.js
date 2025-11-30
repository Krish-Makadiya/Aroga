const cron = require("node-cron");
const Patient = require("../schema/patient.schema");
const { sendSms } = require("./sms.config");
const { translate } =  require("@vitalets/google-translate-api");

function normalizePhone(phone) {
    if (!phone || typeof phone !== "string") return null;
    phone = phone.trim();
    if (phone.startsWith("+")) return phone;
    if (/^\d{10}$/.test(phone)) return "+91" + phone;
    if (/^0\d{10}$/.test(phone)) return "+91" + phone.slice(1);
    return phone;
}

function startPrescriptionCron({ every = "* * * * *", limit = 50 } = {}) {
    console.log("[prescriptionJob] checking sendSms availability");
    if (!sendSms) {
        console.warn(
            "[prescriptionJob] sendSms helper is not available — cron will not start"
        );
        return;
    }

    cron.schedule(
        every,
        async () => {
            try {
                console.log("[prescriptionJob] running scheduled task");

                // Find patients who have active medication reminders
                const patients = await Patient.find({
                    "medicationReminders.active": true,
                })
                    .limit(limit)
                    .select("fullName phone medicationReminders language");

                if (!patients || patients.length === 0) return;

                console.log(
                    `[prescriptionJob] found ${patients.length} patients with active medication reminders`
                );

                // timezone for matching times
                const tz = "Asia/Kolkata";

                // Current local HH:MM in the configured timezone
                const nowParts = new Date()
                    .toLocaleString("en-GB", {
                        timeZone: tz,
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    .split(":");
                const nowHM = `${nowParts[0]}:${nowParts[1]}`; // e.g. '08:05'

                for (const patient of patients) {
                    try {
                        if (!patient || !patient.phone) {
                            console.warn(
                                `[prescriptionJob] missing patient phone for patient ${
                                    patient && patient._id
                                }`
                            );
                            continue;
                        }

                        const to = normalizePhone(patient.phone);
                        if (!to) {
                            console.warn(
                                `[prescriptionJob] invalid patient phone for ${patient._id}: ${patient.phone}`
                            );
                            continue;
                        }

                        const reminders = Array.isArray(
                            patient.medicationReminders
                        )
                            ? patient.medicationReminders
                            : [];
                        let modified = false;

                        for (const rem of reminders) {
                            try {
                                if (!rem || !rem.active) continue;
                                if (!rem.time || String(rem.time).trim() === "")
                                    continue;

                                const remTime = String(rem.time).trim();
                                // Only notify when time matches the current timezone minute
                                if (remTime !== nowHM) continue;

                                // Build message for this reminder
                                const parts = [];
                                parts.push(
                                    `${rem.medicine}${
                                        rem.dosage ? ` ${rem.dosage}` : ""
                                    }`
                                );
                                if (rem.frequency) parts.push(rem.frequency);
                                if (rem.note) parts.push(`Note: ${rem.note}`);

                                const message = `Hi ${
                                    patient.fullName || "there"
                                }, it's time for your medicine (${parts.join(
                                    " · "
                                )}).`;

                                // use api to convert whole messege to marathi
                                const result = await translate(message, { to: patient.language || "en" });
                                console.log(result.text);
                                await sendSms(to, result.text);

                                rem.lastNotifiedAt = new Date();
                                modified = true;

                                console.log(
                                    `[prescriptionJob] sent medication notification for patient ${patient._id} reminder ${rem._id} -> ${to}`
                                );
                            } catch (err) {
                                console.error(
                                    "[prescriptionJob] reminder send error:",
                                    err.message || err
                                );
                            }
                        }

                        if (modified) {
                            try {
                                await patient.save();
                            } catch (saveErr) {
                                console.error(
                                    "[prescriptionJob] failed saving patient reminder flags",
                                    saveErr.message || saveErr
                                );
                            }
                        }
                    } catch (err) {
                        console.error(
                            "[prescriptionJob] patient loop error:",
                            err.message || err
                        );
                    }
                }
            } catch (err) {
                console.error(
                    "[prescriptionJob] scheduled run error:",
                    err.message || err
                );
            }
        },
        { timezone: process.env.PRESCRIPTION_CRON_TZ || "Asia/Kolkata" }
    );

    console.log(
        "[prescriptionJob] started — schedule:",
        every,
        "limit:",
        limit
    );
}

module.exports = { startPrescriptionCron };
