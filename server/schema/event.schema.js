const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor", // Only if you have a Doctor schema
            required: false,
        },
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            maxlength: [100, "Event title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Event description cannot exceed 500 characters"],
            default: "",
        },
        date: {
            type: String,
            required: [true, "Event date is required"],
            validate: {
                validator: function (value) {
                    return /^\d{4}-\d{2}-\d{2}$/.test(value);
                },
                message: "Date must be in YYYY-MM-DD format",
            },
        },
        time: {
            type: String,
            required: [true, "Event time is required"],
            validate: {
                validator: function (value) {
                    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
                },
                message: "Time must be in HH:MM format (24-hour)",
            },
        },
        type: {
            type: String,
            required: [true, "Event type is required"],
            enum: {
                values: ["appointment", "medication", "exercise", "other"],
                message:
                    "Event type must be one of: appointment, medication, exercise, other",
            },
        },
    },
    {
        timestamps: true,
    }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
