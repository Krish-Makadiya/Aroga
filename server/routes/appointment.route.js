// server/routes/appointment.route.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Appointment = require("../schema/appointment.schema");
const Patient = require("../schema/patient.schema");
const Doctor = require("../schema/doctor.schema");
const Event = require("../schema/event.schema");
const Rating = require("../schema/rating.schema");
const cloudinary = require("../config/cloudinary");

const multer = require("multer");
const { sendSms } = require("../config/sms.config");
const { translate } = require("@vitalets/google-translate-api");
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/appointment - create with minimal fields
router.post(
    "/create-appointment",
    upload.single("reportFile"),
    async (req, res) => {
        try {
            const {
                doctorId,
                patientId,
                scheduledAt,
                amount,
                appointmentType = "offline",
                meetingLink = "",
                symptoms = [],
                prescription = [],
                reports = "",
                reportFile,
                aiSummary = "",
            } = req.body;
            // const file = req.file;

            if (!patientId || !doctorId || !scheduledAt || !amount) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Missing required fields: patientId, doctorId, scheduledAt, amount",
                });
            }

            const validAppointmentTypes = ["online", "offline"];
            if (!validAppointmentTypes.includes(appointmentType)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "appointmentType must be either 'online' or 'offline'",
                });
            }

            const when = new Date(scheduledAt);
            if (isNaN(when.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid scheduledAt datetime",
                });
            }

            const patient = await Patient.findOne({ clerkUserId: patientId });
            if (!patient) {
                return res
                    .status(404)
                    .json({ success: false, message: "Patient not found" });
            }

            const normalizedSymptoms = Array.isArray(symptoms)
                ? symptoms.filter(Boolean)
                : [];
            const normalizedPrescription = Array.isArray(prescription)
                ? prescription
                : [];

            let reportFileUrl = "";
            if (req.file) {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: "auto",
                            folder: "appointment_reports",
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(req.file.buffer);
                });
                reportFileUrl = uploadResult.secure_url;
            }

            const appointment = await Appointment.create({
                patientId: patient.id,
                doctorId,
                scheduledAt: when,
                amount: amount,
                appointmentType,
                meetingLink,
                symptoms: normalizedSymptoms,
                prescription: normalizedPrescription,
                reports,
                aiSummary,
                cloudinaryFileUrl: reportFileUrl,
            });

            // Create corresponding event
            const event = await Event.create({
                patientId: patient.id,
                doctorId,
                title: "Appointment",
                description: "Scheduled medical appointment.",
                date: when.toISOString().split("T")[0], // Format: YYYY-MM-DD
                time: when.toTimeString().split(" ")[0].substring(0, 5), // Format: HH:MM
                type: "appointment",
            });

            const newPhone = patient.phone.startsWith("+91")
                ? patient.phone
                : "+91" + patient.phone;

            const message = `Dear ${patient.fullName}, your appointment request has been sent successfully, you will be notified once it is confirmed.`;
            const result = await translate(message, { to: patient.language || "en" });

            sendSms(newPhone, result.text).catch((err) => {
                console.error("Error sending SMS:", err);
            });

            return res.status(201).json({
                success: true,
                data: {
                    appointment,
                    event,
                },
            });
        } catch (error) {
            console.error("Create appointment error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create appointment",
                error: error.message,
            });
        }
    }
);

// GET /api/appointment/patient/:clerkUserId - get all appointments for a patient
router.get("/patient/:clerkUserId", async (req, res) => {
    try {
        const { clerkUserId } = req.params;
        console.log(
            "Fetching appointments for patient clerkUserId:",
            clerkUserId
        );
        if (!clerkUserId) {
            return res
                .status(400)
                .json({ success: false, message: "Missing clerkUserId" });
        }

        // Find patient by clerkUserId
        const patient = await Patient.findOne({ clerkUserId });
        if (!patient) {
            return res
                .status(404)
                .json({ success: false, message: "Patient not found" });
        }

        // Find all appointments for this patient
        const appointments = await Appointment.find({ patientId: patient._id })
            .populate(
                "doctorId",
                "fullName qualification specialty consultationFee experience verificationStatus languages bio district state rating email phone"
            )
            .populate("patientId", "fullName email phone")
            .populate("ratingId", "rating review")
            .sort({ scheduledAt: -1 });
        console.log(appointments);

        return res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        console.error("Get patient appointments error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointments",
            error: error.message,
        });
    }
});

// GET /api/appointment/doctor/:clerkUserId - get all appointments for a doctor
router.get("/doctor/:clerkUserId", async (req, res) => {
    try {
        const { clerkUserId } = req.params;
        if (!clerkUserId) {
            return res
                .status(400)
                .json({ success: false, message: "Missing clerkUserId" });
        }

        // Find doctor by clerkUserId
        const doctor = await Doctor.findOne({ clerkUserId });
        if (!doctor) {
            return res
                .status(404)
                .json({ success: false, message: "Doctor not found" });
        }

        // Find all appointments for this doctor
        const appointments = await Appointment.find({ doctorId: doctor.id })
            .populate(
                "patientId",
                "fullName email phone district state dob gender address govIdType govIdNumber emergencyContactName emergencyContactPhone medicalHistory  alergies operations ongoingMedications permanentMedications majorDiseases telemedicineConsent clerkUserId"
            )
            .populate(
                "doctorId",
                "fullName qualifications specialty consultationFee experience verificationStatus languages bio district state rating email phone"
            )
            .sort({ scheduledAt: -1 });

        return res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        console.error("Get doctor appointments error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch doctor appointments",
            error: error.message,
        });
    }
});

// GET /api/appointment/:id - get appointment by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const newId = new mongoose.Types.ObjectId(id);
        if (!mongoose.Types.ObjectId.isValid(newId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid appointment id" });
        }

        const appointment = await Appointment.findById(newId)
            .populate(
                "patientId",
                "fullName email phone district state dob gender address govIdType govIdNumber emergencyContactName emergencyContactPhone medicalHistory alergies operations ongoingMedications permanentMedications majorDiseases telemedicineConsent clerkUserId"
            )
            .populate(
                "doctorId",
                "fullName qualifications specialty consultationFee experience verificationStatus languages bio district state rating email phone"
            );

        if (!appointment) {
            return res
                .status(404)
                .json({ success: false, message: "Appointment not found" });
        }

        return res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.error("Get appointment by id error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointment",
            error: error.message,
        });
    }
});

// PUT /api/appointment/:id/status - update appointment status (confirm/cancel)
router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = [
            "pending",
            "confirmed",
            "completed",
            "cancelled",
        ];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid status. Must be one of: pending, confirmed, completed, cancelled",
            });
        }

        // Check if appointment exists
        const existingAppointment = await Appointment.findById(id);
        if (!existingAppointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        // Update appointment status
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            {
                status,
                updatedAt: new Date(),
            },
            { new: true }
        )
            .populate("patientId", "fullName email phone language")
            .populate("doctorId", "fullName email phone");

        const newPhone = appointment.patientId.phone.startsWith("+91")
            ? appointment.patientId.phone
            : "+91" + appointment.patientId.phone;

        const message = `Dear ${
            appointment.patientId.fullName
        }, your appointment scheduled on ${
            appointment.scheduledAt.toISOString().split("T")[0]
        } at ${appointment.scheduledAt
            .toTimeString()
            .split(" ")[0]
            .substring(
                0,
                5
            )} has been ${status}. Link will be shared once doctor joins the meeting.`;

        const result = await translate(message, { to:    "en" });

        sendSms(newPhone, result.text).catch((err) => {
            console.error("Error sending SMS:", err);
        });

        return res.status(200).json({
            success: true,
            message: `Appointment ${status} successfully`,
            data: appointment,
        });
    } catch (error) {
        console.error("Update appointment status error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update appointment status",
            error: error.message,
        });
    }
});

// PUT /api/appointment/:id/meeting-link - update meeting link
router.put("/:id/meeting-link", async (req, res) => {
    try {
        const { id } = req.params;
        const { meetingLink } = req.body;

        if (!meetingLink) {
            return res.status(400).json({
                success: false,
                message: "meetingLink is required",
            });
        }

        // Check if appointment exists
        const existingAppointment = await Appointment.findById(id);
        if (!existingAppointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        const newMeetingLink = meetingLink.replace("doctor", "patient");
        console.log(newMeetingLink);

        // Update meeting link
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            {
                meetingLink: newMeetingLink,
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Meeting link updated successfully",
            data: appointment,
        });
    } catch (error) {
        console.error("Update meeting link error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update meeting link",
            error: error.message,
        });
    }
});

// PUT /api/appointment/:id/prescription - update prescription list
router.put("/:id/prescription", async (req, res) => {
    try {
        const { id } = req.params;
        const { prescription } = req.body;

        const newId = new mongoose.Types.ObjectId(id);
        if (!Array.isArray(prescription)) {
            return res.status(400).json({
                success: false,
                message: "prescription must be an array",
            });
        }

        const existingAppointment = await Appointment.findById(newId);
        if (!existingAppointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        const sanitized = prescription
            .map((item) => ({
                medicine: item?.medicine?.trim() || "",
                dosage: item?.dosage?.trim() || "",
                frequency: item?.frequency?.trim() || "",
                notes: item?.notes?.trim() || "",
            }))
            .filter((item) => item.medicine);

        const appointment = await Appointment.findByIdAndUpdate(
            newId,
            { prescription: sanitized },
            { new: true }
        )
            .populate("patientId", "fullName email phone")
            .populate("doctorId", "fullName email phone");

        return res.status(200).json({
            success: true,
            message: "Prescription updated successfully",
            data: appointment,
        });
    } catch (error) {
        console.error("Update prescription error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update prescription",
            error: error.message,
        });
    }
});

// POST /api/appointment/create-event - create a standalone event
router.post("/create-event", async (req, res) => {
    try {
        const {
            patientClerkId, // Clerk user ID to find patient
            doctorId, // Optional doctor ID
            title,
            description = "",
            date, // YYYY-MM-DD format
            time, // HH:MM format
            type = "appointment",
        } = req.body;

        // Required checks
        if (!patientClerkId || !title || !date || !time) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: patientClerkId, title, date, time",
            });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: "Date must be in YYYY-MM-DD format",
            });
        }

        // Validate time format
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            return res.status(400).json({
                success: false,
                message: "Time must be in HH:MM format (24-hour)",
            });
        }

        // Find patient by clerkUserId
        const patient = await Patient.findOne({ clerkUserId: patientClerkId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        // Create event
        const event = await Event.create({
            patientId: patient._id,
            doctorId: doctorId || null,
            title,
            description,
            date,
            time,
            type,
        });

        return res.status(201).json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error("Create event error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create event",
            error: error.message,
        });
    }
});

// POST /api/appointment/:appointmentId/rating - Save or update a rating for an appointment
router.post("/:appointmentId/rating", async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { patientId, doctorId, rating, review } = req.body;
        if (!patientId || !doctorId || !rating) {
            return res.status(400).json({
                success: false,
                message: "patientId, doctorId, and rating are required",
            });
        }

        console.log(patientId, doctorId, rating, review);
        const patient = await Patient.findOne({ clerkUserId: patientId });
        if (!patient) {
            return res.status(400).json({
                success: false,
                message: "user with this ID not found",
            });
        }
        // Upsert: If a rating by this patient for this appointment exists, update; otherwise, create
        let record = await Rating.findOneAndUpdate(
            { appointmentId },
            { doctorId, rating, review },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        // Also update the ratingId field in the related appointment
        await Appointment.findByIdAndUpdate(appointmentId, {
            ratingId: record._id,
        });

        if (doctorId && rating) {
            const doc = await Doctor.findById(doctorId);
            if (doc) {
                let prevAvg = doc.rating?.average || 0;
                let prevCount = doc.rating?.count || 0;
                let newAvg =
                    (prevAvg * prevCount + Number(rating)) / (prevCount + 1);
                let newCount = prevCount + 1;
                await Doctor.findByIdAndUpdate(doctorId, {
                    $set: {
                        "rating.average": newAvg,
                        "rating.count": newCount,
                    },
                });
            }
        }

        return res
            .status(200)
            .json({ success: true, data: record, message: "Rating saved" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/doctor/:doctorId/ratings - Get all ratings for a doctor
router.get("/doctor/:doctorId/ratings", async (req, res) => {
    try {
        const { doctorId } = req.params;
        const records = await Rating.find({ doctorId })
            .sort({ createdAt: -1 })
            .select("-__v");
        return res.status(200).json({ success: true, data: records });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/appointment/admin/all - Get all appointments for admin (with full patient and doctor details)
router.get("/admin/all", async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate(
                "patientId",
                "fullName email phone district state dob gender address govIdType govIdNumber emergencyContactName emergencyContactPhone medicalHistory alergies operations ongoingMedications permanentMedications majorDiseases telemedicineConsent clerkUserId"
            )
            .populate(
                "doctorId",
                "fullName qualifications specialty consultationFee experience verificationStatus languages bio district state rating email phone registrationNumber affiliation"
            )
            .populate("ratingId", "rating review")
            .sort({ scheduledAt: -1 });

        return res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        console.error("Get all appointments error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointments",
            error: error.message,
        });
    }
});

module.exports = router;
