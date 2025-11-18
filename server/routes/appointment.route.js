// server/routes/appointment.route.js
const express = require("express");
const router = express.Router();
const Appointment = require("../schema/appointment.schema");
const Patient = require("../schema/patient.schema");
const Doctor = require("../schema/doctor.schema");
const Event = require("../schema/event.schema");

// POST /api/appointment - create with minimal fields
router.post("/create-appointment", async (req, res) => {
    try {
        const {
            doctorId, // ObjectId (Patient)
            patientId, // ObjectId (Doctor)
            scheduledAt, // ISO datetime string
            amount, // { amount, currency }
            appointmentType = "offline",
            meetingLink = "",
            symptoms = [],
            prescription = [],
            reports = "",
            aiSummary = "",
        } = req.body;

        console.log(doctorId, patientId, scheduledAt, amount);
        // Required checks
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
                message: "appointmentType must be either 'online' or 'offline'",
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
        });
        console.log("3");

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
});

// GET /api/appointment/patient/:clerkUserId - get all appointments for a patient
router.get("/patient/:clerkUserId", async (req, res) => {
    try {
        const { clerkUserId } = req.params;
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
            .sort({ scheduledAt: -1 });

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
            .populate("patientId", "fullName email phone district state")
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
            .populate("patientId", "fullName email phone")
            .populate("doctorId", "fullName email phone");

        console.log(`Appointment ${id} status updated to: ${status}`);

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

module.exports = router;
