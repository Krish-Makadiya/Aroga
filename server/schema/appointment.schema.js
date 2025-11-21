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
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending",
            index: true,
        },

        appointmentType: {
            type: String,
            enum: ["online", "offline"],
            default: "offline",
            index: true,
        },
        meetingLink: {
            type: String, // video link when telemedicine
            trim: true,
            default: "",
        },
        roomStartedAt: {
            type: Date,
            default: null,
        },
        roomEndedAt: {
            type: Date,
            default: null,
        },
        patientJoinedAt: {
            type: Date,
            default: null,
        },
        patientLeftAt: {
            type: Date,
            default: null,
        },
        symptoms: {
            type: [
                {
                    type: String,
                    trim: true,
                },
            ],
            default: [],
        },
        prescription: {
            type: [
                {
                    medicine: { type: String, trim: true, required: true },
                    dosage: { type: String, trim: true, default: "" },
                    frequency: { type: String, trim: true, default: "" },
                    notes: { type: String, trim: true, default: "" },
                },
            ],
            default: [],
        },
        reports: {
            type: String,
            trim: true,
            default: "",
        },
        aiSummary: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        payment: {
            status: {
                type: String,
                enum: ["pending", "authorized", "paid", "refunded", "failed"],
                default: "pending",
            },
            paymentId: { type: String, trim: true, default: "" },
            orderId: { type: String, trim: true, default: "" },
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
