const express = require("express");
const Appointment = require("../schema/appointment.schema");
const Emergency = require("../schema/emergency.schema");
const mongoose = require("mongoose");
const { sendSms } = require("../config/sms.config");
const router = express.Router();
const Patient = require("../schema/patient.schema");
const { translate } = require("@vitalets/google-translate-api");

router.post("/room-create", async (req, res) => {
    try {
        const { room_id } = req.body;

        const roomObjectId = new mongoose.Types.ObjectId(room_id);
        await Appointment.findByIdAndUpdate(
            roomObjectId,
            { roomStartedAt: new Date(Date.now()) },
            { new: true }
        );

        return res.status(200).json({ message: "Room created", roomObjectId });
    } catch (error) {
        console.error("Error creating room:", error);
        return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});

router.post("/room-closed", async (req, res) => {
    try {
        const { room_id } = req.body;

        const roomObjectId = new mongoose.Types.ObjectId(room_id);
        const appt = await Appointment.findByIdAndUpdate(
            roomObjectId,
            { roomEndedAt: new Date(Date.now()), status: "completed" },
            { new: true }
        );

        const patientId = appt.patientId;
        const patient = await Patient.findById(patientId);

        console.log("Appointment completed for patient:", patient);
        console.log("Appointment:", appt);

        const phone = patient.phone.startsWith("+91")
            ? patient.phone
            : "+91" + patient.phone;

        const message = `Dear ${patient.fullName}, your appointment has been completed. Dont forget to provide feedback to the doctor. Your Prescription will be available in your profile.`;
        const result = await translate(message, {
            to: patient.language || "en",
        });
        sendSms(phone, result.text);

        return res.status(200).json({ message: "Room closed", roomObjectId });
    } catch (error) {
        console.error("Error closing room:", error);
        return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});

router.post("/room-login", async (req, res) => {
    try {
        const { room_id } = req.body;

        const roomId = new mongoose.Types.ObjectId(room_id);
        await Appointment.findByIdAndUpdate(
            roomId,
            { patientJoinedAt: new Date(Date.now()) },
            { new: true }
        );

        return res.status(200).json({ message: "Patient joined room" });
    } catch (error) {
        console.error("Error patient joining room:", error);
        return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});

router.post("/room-logout", async (req, res) => {
    try {
        const { room_id } = req.body;
        const roomId = new mongoose.Types.ObjectId(room_id);

        await Appointment.findByIdAndUpdate(
            roomId,
            { patientLeftAt: new Date(Date.now()) },
            { new: true }
        );

        return res.status(200).json({ message: "Patient left room" });
    } catch (error) {
        console.error("Error patient leaving room:", error);
        return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});

router.post("/emergency/room-create", async (req, res) => {
    try {
        const { room_id } = req.body;

        if (!room_id) {
            return res.status(400).json({
                message: "room_id is required for emergency room-create",
            });
        }

        // First 24 chars correspond to the doctor's ObjectId in the roomID
        const doctorIdStr = room_id.substring(0, 24);
        let doctorObjectId;
        try {
            doctorObjectId = new mongoose.Types.ObjectId(doctorIdStr);
        } catch (e) {
            console.error(
                "Invalid doctorId extracted from room_id:",
                doctorIdStr
            );
            return res.status(400).json({
                message:
                    "Invalid doctorId in room_id for emergency room-create",
            });
        }

        console.log("Emergency room-create webhook payload:", req.body);
        console.log('=======> 1');
        // Mark the latest matching emergency for this doctor as active
        // Condition: same doctorId, not yet completed
        const emergency = await Emergency.findOneAndUpdate(
            { doctorId: doctorObjectId, isCompleted: false },
            {
                isActive: true,
                isCompleted: false,
            },
            { new: true, sort: { createdAt: -1 } }
        );

        console.log('=======> 1');
        if (!emergency) {
            return res.status(404).json({
                message:
                "Emergency record not found for room-create with this doctorId",
            });
        }

        console.log("Emergency marked as active:", emergency._id);

        return res.status(200).json({
            message: "Emergency room created",
            emergencyId: emergency._id,
            doctorId: doctorIdStr,
        });
    } catch (error) {
        console.error("Error in emergency room-create webhook:", error);
        return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});

router.post("/emergency/room-closed", async (req, res) => {
    try {
        const { room_id } = req.body;

        if (!room_id) {
            return res.status(400).json({
                message: "room_id is required for emergency room-closed",
            });
        }

        // First 24 chars correspond to the doctor's ObjectId in the roomID
        const doctorIdStr = room_id.substring(0, 24);
        let doctorObjectId;
        try {
            doctorObjectId = new mongoose.Types.ObjectId(doctorIdStr);
        } catch (e) {
            console.error(
                "Invalid doctorId extracted from room_id:",
                doctorIdStr
            );
            return res.status(400).json({
                message:
                    "Invalid doctorId in room_id for emergency room-closed",
            });
        }

        console.log("Emergency room-closed webhook payload:", req.body);

        // Mark the latest matching emergency for this doctor as completed/inactive
        const emergency = await Emergency.findOneAndUpdate(
            { doctorId: doctorObjectId, isCompleted: false },
            {
                isActive: false,
                isCompleted: true,
                completedAt: new Date(),
            },
            { new: true, sort: { createdAt: -1 } }
        );
        console.log('=======> 2');
        if (!emergency) {
            return res.status(404).json({
                message:
                    "Emergency record not found for room-closed with this doctorId",
            });
        }

        console.log("Emergency marked as completed:", emergency._id);

        return res.status(200).json({
            message: "Emergency room closed and marked as completed",
            emergencyId: emergency._id,
            doctorId: doctorIdStr,
        });
    } catch (error) {
        console.error("Error in emergency room-closed webhook:", error);
        return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;
