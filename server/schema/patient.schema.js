const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        // Basic Information
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            maxlength: [100, "Full name cannot exceed 100 characters"],
        },

        dob: {
            type: Date,
            required: [true, "Date of birth is required"],
            validate: {
                validator: function (value) {
                    return value < new Date();
                },
                message: "Date of birth must be in the past",
            },
        },

        gender: {
            type: String,
            required: [true, "Gender is required"],
            enum: {
                values: ["male", "female", "other"],
                message:
                    "Gender must be one of: Male, Female, Other",
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

        govIdType: {
            type: String,
            required: [true, "Government ID type is required"],
            enum: {
                values: [
                    "aadhar",
                    "pan",
                    "passport",
                    "driving-license",
                    "voter-id",
                ],
                message: "Invalid government ID type",
            },
        },

        govIdNumber: {
            type: String,
            required: [true, "Government ID number is required"],
            trim: true,
            uppercase: true,
            unique: true,
            maxlength: [20, "Government ID number cannot exceed 20 characters"],
        },

        emergencyContactName: {
            type: String,
            required: [true, "Emergency contact name is required"],
            trim: true,
            maxlength: [
                100,
                "Emergency contact name cannot exceed 100 characters",
            ],
        },

        emergencyContactPhone: {
            type: String,
            required: [true, "Emergency contact phone is required"],
            trim: true,
            validate: {
                validator: function (value) {
                    return /^[\+]?[1-9][\d]{0,15}$/.test(value);
                },
                message: "Please enter a valid emergency contact phone number",
            },
        },

        medicalHistory: {
            type: String,
            required: [true, "Medical history is required"],
            trim: true,
            maxlength: [1000, "Medical history cannot exceed 1000 characters"],
        },

        telemedicineConsent: {
            type: Boolean,
            required: [true, "Telemedicine consent is required"],
            default: false,
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
const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
