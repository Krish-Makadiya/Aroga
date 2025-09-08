// server/routes/appointment.route.js
const express = require("express");
const router = express.Router();
const Appointment = require("../schema/appointment.schema");

// POST /api/appointment - create with minimal fields
router.post("/create-appointment", async (req, res) => {
    try {
        const {
            patientId, // ObjectId (Patient)
            doctorId, // ObjectId (Doctor)
            scheduledAt, // ISO datetime string
            price, // { amount, currency }
            payment, // { method, status, transactionId, paidAt }
        } = req.body;

        // Required checks
        if (!patientId || !doctorId || !scheduledAt || !price?.amount) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: patientId, doctorId, scheduledAt, price.amount",
            });
        }

        const when = new Date(scheduledAt);
        if (isNaN(when.getTime())) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Invalid scheduledAt datetime",
                });
        }

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            scheduledAt: when,
            price: {
                amount: price.amount,
                currency: "INR",
            },
            payment: {
                status: payment?.status || "pending",
                transactionId: payment?.transactionId || "",
                paidAt: payment?.paidAt || null,
            },
        });

        return res.status(201).json({ success: true, data: appointment });
    } catch (error) {
        console.error("Create appointment error:", error);
        return res
            .status(500)
            .json({
                success: false,
                message: "Failed to create appointment",
                error: error.message,
            });
    }
});

module.exports = router;
