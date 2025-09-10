// server/routes/appointment.route.js
const express = require("express");
const router = express.Router();
const Appointment = require("../schema/appointment.schema");
const Patient = require("../schema/patient.schema");
const Doctor = require("../schema/doctor.schema");

// POST /api/appointment - create with minimal fields
router.post("/create-appointment", async (req, res) => {
    try {
        const {
            doctorId, // ObjectId (Patient)
            patientClerkId, // ObjectId (Doctor)
            scheduledAt, // ISO datetime string
            amount, // { amount, currency }
        } = req.body;

        console.log("1");
        // Required checks
        if (!patientClerkId || !doctorId || !scheduledAt || !amount) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: patientClerkId, doctorId, scheduledAt, amount",
            });
        }

        const when = new Date(scheduledAt);
        if (isNaN(when.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid scheduledAt datetime",
            });
        }

        console.log("2");
        const patient = await Patient.findOne({ clerkUserId: patientClerkId });
        console.log(patient);

        const appointment = await Appointment.create({
            patientId: patient.id,
            doctorId,
            scheduledAt: when,
            amount: amount,
        });
        console.log("3");

        return res.status(201).json({ success: true, data: appointment });
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
        return res
            .status(500)
            .json({
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
            return res.status(400).json({ success: false, message: "Missing clerkUserId" });
        }

        // Find doctor by clerkUserId
        const doctor = await Doctor.findOne({ clerkUserId });
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // Find all appointments for this doctor
        const appointments = await Appointment.find({ doctorId: doctor.id })
        .populate(
            "patientId",
            "fullName email phone district state"
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


module.exports = router;
