const mongoose = require("mongoose");

// Government Doctor Schema
const governmentDoctorsSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            maxlength: [100, "Full name cannot exceed 100 characters"],
        },
        specialty: {
            type: String,
            required: [true, "Specialty is required"],
            trim: true,
            maxlength: [100, "Specialty cannot exceed 100 characters"],
        },
        experience: {
            type: Number,
            required: [true, "Experience is required"],
            min: [0, "Experience cannot be negative"],
            max: [100, "Experience cannot exceed 100 years"],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Register the model if not already registered (to prevent OverwriteModelError in dev environments)
const GovDoctors = mongoose.model("GovDoctors", governmentDoctorsSchema);

module.exports = GovDoctors;
