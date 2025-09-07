const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        // Basic Information
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            maxlength: [100, "Full name cannot exceed 100 characters"],
        },

        qualifications: {
            type: String,
            required: [true, "Qualifications are required"],
            trim: true,
            maxlength: [500, "Qualifications cannot exceed 500 characters"],
        },

        registrationNumber: {
            type: String,
            required: [true, "Medical registration number is required"],
            trim: true,
            uppercase: true,
            unique: true,
            maxlength: [20, "Registration number cannot exceed 20 characters"],
        },

        specialty: {
            type: String,
            required: [true, "Medical specialty is required"],
            trim: true,
            enum: {
                values: [
                    "General Practice",
                    "Cardiology",
                    "Dermatology",
                    "Endocrinology",
                    "Gastroenterology",
                    "Gynecology",
                    "Hematology",
                    "Infectious Disease",
                    "Internal Medicine",
                    "Nephrology",
                    "Neurology",
                    "Oncology",
                    "Ophthalmology",
                    "Orthopedics",
                    "Pediatrics",
                    "Psychiatry",
                    "Pulmonology",
                    "Radiology",
                    "Rheumatology",
                    "Urology",
                    "Emergency Medicine",
                    "Anesthesiology",
                    "Pathology",
                    "Physical Medicine",
                    "Preventive Medicine",
                    "other",
                ],
                message: "Invalid medical specialty",
            },
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            unique: true,
            validate: {
                validator: function (value) {
                    return /^[\+]?[1-9][\d]{0,15}$/.test(value);
                },
                message: "Please enter a valid phone number",
            },
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            unique: true,
            validate: {
                validator: function (value) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                        value
                    );
                },
                message: "Please enter a valid email address",
            },
        },

        // Professional Information
        affiliation: {
            type: String,
            required: [true, "Hospital/Clinic affiliation is required"],
            trim: true,
            maxlength: [200, "Affiliation cannot exceed 200 characters"],
        },

        experience: {
            type: String,
            required: [true, "Years of experience is required"],
            trim: true,
            validate: {
                validator: function (value) {
                    const years = parseInt(value);
                    return !isNaN(years) && years >= 0 && years <= 50;
                },
                message:
                    "Experience must be a valid number between 0 and 50 years",
            },
        },

        // Additional Professional Details
        consultationFee: {
            type: Number,
            default: 0,
            min: [0, "Consultation fee cannot be negative"],
        },

        availableSlots: [
            {
                day: {
                    type: String,
                    enum: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ],
                },
                startTime: {
                    type: String,
                    validate: {
                        validator: function (value) {
                            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                value
                            );
                        },
                        message: "Time must be in HH:MM format (24-hour)",
                    },
                },
                endTime: {
                    type: String,
                    validate: {
                        validator: function (value) {
                            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                value
                            );
                        },
                        message: "Time must be in HH:MM format (24-hour)",
                    },
                },
            },
        ],

        // Verification Status
        verificationStatus: {
            type: String,
            enum: ["new", "pending", "verified", "rejected"],
            default: "new",
        },

        verifiedAt: {
            type: Date,
        },

        // Telemedicine
        telemedicineConsent: {
            type: Boolean,
            required: [true, "Telemedicine consent is required"],
            default: true,
        },

        // Additional Information
        bio: {
            type: String,
            trim: true,
            maxlength: [1000, "Bio cannot exceed 1000 characters"],
        },

        languages: [
            {
                type: String,
                trim: true,
            },
        ],

        // Address Information
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            maxlength: [200, "Address cannot exceed 200 characters"],
        },

        district: {
            type: String,
            required: [true, "District is required"],
            trim: true,
            maxlength: [50, "District name cannot exceed 50 characters"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
            maxlength: [50, "State name cannot exceed 50 characters"],
        },

        // Rating and Reviews
        rating: {
            average: {
                type: Number,
                default: 0,
                min: [0, "Rating cannot be less than 0"],
                max: [5, "Rating cannot be more than 5"],
            },
            count: {
                type: Number,
                default: 0,
                min: [0, "Rating count cannot be negative"],
            },
        },

        // Clerk Integration
        clerkUserId: {
            type: String,
            required: [true, "Clerk user ID is required"],
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// // Index for better query performance
// doctorSchema.index({ specialty: 1 });
// doctorSchema.index({ verificationStatus: 1 });
// doctorSchema.index({ isActive: 1 });
// doctorSchema.index({ rating: -1 });
// doctorSchema.index({ location: '2dsphere' }); // For geospatial queries if needed

// Create and export the model
const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
