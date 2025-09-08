// server/schema/appointment.schema.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        // Core links
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            index: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
            index: true,
        },

        // Scheduling
        scheduledAt: {
            type: Date, // exact start datetime (UTC)
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "in_progress",
                "completed",
                "cancelled",
                "no_show",
                "rescheduled",
            ],
            default: "pending",
            index: true,
        },

        meetingLink: {
            type: String, // video link when telemedicine
            trim: true,
            default: "",
        },

        price: {
            amount: { type: Number, required: true, min: 0 },
            currency: { type: String, default: "INR" },
        },
        payment: {
            status: {
                type: String,
                enum: ["pending", "authorized", "paid", "refunded", "failed"],
                default: "pending",
            },
            transactionId: { type: String, trim: true, default: "" },
            paidAt: { type: Date, default: null },
        },

        // Post-appointment
        rating: {
            type: Number, // 1-5
            min: 1,
            max: 5,
            default: null,
        },
        review: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },

        // cancellation: {
        //     isCancelled: { type: Boolean, default: false },
        //     cancelledBy: {
        //         type: String,
        //         enum: ["patient", "doctor", "system"],
        //         default: null,
        //     },
        //     reason: { type: String, trim: true, maxlength: 500, default: "" },
        //     cancelledAt: { type: Date, default: null },
        //     refundEligible: { type: Boolean, default: false },
        // },
        // reschedule: {
        //     rescheduleCount: { type: Number, default: 0, min: 0 },
        //     lastRescheduledAt: { type: Date, default: null },
        //     previousSlots: {
        //         type: [
        //             {
        //                 scheduledAt: Date,
        //                 durationMinutes: Number,
        //             },
        //         ],
        //         default: [],
        //     },
        // },
    },
    {
        timestamps: true,
    }
);

// // Helpful compound indexes
// appointmentSchema.index({ doctorId: 1, scheduledAt: 1 });
// appointmentSchema.index({ patientId: 1, scheduledAt: 1 });
// appointmentSchema.index({ "payment.status": 1 });
// appointmentSchema.index({ status: 1, isTelemedicine: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
