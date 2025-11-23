const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        // References
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            index: true,
        },
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

        // Rating (1-5)
        rating: {
            type: Number,
            required: true,
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
            validate: {
                validator: function (value) {
                    return Number.isInteger(value) && value >= 1 && value <= 5;
                },
                message: "Rating must be an integer between 1 and 5",
            },
        },

        // Review text
        review: {
            type: String,
            trim: true,
            maxlength: [2000, "Review cannot exceed 2000 characters"],
            default: "",
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Compound indexes for efficient queries
ratingSchema.index({ doctorId: 1, createdAt: -1 }); // Get doctor's reviews sorted by date
ratingSchema.index({ appointmentId: 1 }, { unique: true }); // One rating per appointment
ratingSchema.index({ patientId: 1, createdAt: -1 }); // Get patient's reviews sorted by date

// Pre-save middleware to ensure one rating per appointment
ratingSchema.pre("save", async function (next) {
    if (this.isNew) {
        const existingRating = await mongoose
            .model("Rating")
            .findOne({ appointmentId: this.appointmentId });
        if (existingRating) {
            return next(
                new Error("Rating already exists for this appointment")
            );
        }
    }
    next();
});

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;

