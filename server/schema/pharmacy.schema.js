const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
    {
        // Basic Information
        pharmacyName: {
            type: String,
            required: [true, "Pharmacy name is required"],
            trim: true,
            maxlength: [100, "Pharmacy name cannot exceed 100 characters"],
        },

        ownerName: {
            type: String,
            required: [true, "Owner name is required"],
            trim: true,
            maxlength: [100, "Owner name cannot exceed 100 characters"],
        },

        licenseNumber: {
            type: String,
            required: [true, "Pharmacy license number is required"],
            trim: true,
            uppercase: true,
            unique: true,
            maxlength: [50, "License number cannot exceed 50 characters"],
        },

        // Contact Information
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

        alternatePhone: {
            type: String,
            trim: true,
            validate: {
                validator: function (value) {
                    if (!value) return true;
                    return /^[\+]?[1-9][\d]{0,15}$/.test(value);
                },
                message: "Please enter a valid alternate phone number",
            },
        },

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

        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true,
            validate: {
                validator: function (value) {
                    return /^\d{6}$/.test(value);
                },
                message: "Pincode must be a 6-digit number",
            },
        },

        // Business Information
        registrationType: {
            type: String,
            required: [true, "Registration type is required"],
            enum: {
                values: [
                    "Sole Proprietorship",
                    "Partnership",
                    "Private Limited",
                    "Public Limited",
                    "LLP",
                    "Other",
                ],
                message: "Invalid registration type",
            },
        },

        gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            validate: {
                validator: function (value) {
                    if (!value) return true;
                    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                        value
                    );
                },
                message: "Invalid GST number format",
            },
        },

        // Operating Hours
        operatingHours: [
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
                isOpen: {
                    type: Boolean,
                    default: true,
                },
                openTime: {
                    type: String,
                    validate: {
                        validator: function (value) {
                            if (!this.isOpen) return true;
                            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                value
                            );
                        },
                        message: "Time must be in HH:MM format (24-hour)",
                    },
                },
                closeTime: {
                    type: String,
                    validate: {
                        validator: function (value) {
                            if (!this.isOpen) return true;
                            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                value
                            );
                        },
                        message: "Time must be in HH:MM format (24-hour)",
                    },
                },
            },
        ],

        // Services
        services: [
            {
                type: String,
                enum: [
                    "Prescription Medicines",
                    "OTC Medicines",
                    "Medical Equipment",
                    "Health Supplements",
                    "Home Delivery",
                    "Online Consultation",
                    "Health Check-ups",
                    "Vaccination",
                    "Medicine Refill",
                    "Other",
                ],
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

        // Additional Information
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
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

// Create and export the model
const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
module.exports = Pharmacy;

