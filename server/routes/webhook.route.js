const express = require("express");
const Appointment = require("../schema/appointment.schema");
const mongoose = require("mongoose");
const router = express.Router();

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
        await Appointment.findByIdAndUpdate(
            roomObjectId,
            { roomEndedAt: new Date(Date.now()), status: "completed" },
            { new: true }
        );

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

module.exports = router;
