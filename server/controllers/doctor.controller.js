// server/controllers/doctor.controller.js

const Doctor = require("../schema/doctor.schema");

// Create a new doctor
exports.createDoctor = async (req, res) => {
    try {
        const {
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            licenseFile,
            idProofFile,
            affiliation,
            experience,
            telemedicineConsent,
        } = req.body;

        const clerkUserId = req.auth?.userId;

        if (
            !fullName ||
            !qualifications ||
            !registrationNumber ||
            !specialty ||
            !phone ||
            !email
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: fullName, qualifications, registrationNumber, specialty, phone, email",
            });
        }

        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const existingDoctor = await Doctor.findOne({
            $or: [
                { email },
                { phone },
                { registrationNumber },
                { clerkUserId },
            ],
        });

        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor with this email, phone, registration number, or user account already exists",
            });
        }

        const doctor = await Doctor.create({
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            licenseFile: licenseFile || "",
            idProofFile: idProofFile || "",
            affiliation: affiliation || "",
            experience: experience || "0",
            telemedicineConsent:
                telemedicineConsent !== undefined ? telemedicineConsent : true,
            clerkUserId,
        });

        res.status(201).json({
            success: true,
            message: "Doctor registered successfully",
            data: {
                id: doctor._id,
                fullName: doctor.fullName,
                specialty: doctor.specialty,
                email: doctor.email,
                verificationStatus: doctor.verificationStatus,
            },
        });
    } catch (error) {
        console.error("Doctor registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ isActive: true })
            .select(
                "fullName specialty email phone verificationStatus rating experience"
            )
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: doctors,
        });
    } catch (error) {
        console.error("Get doctors error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch doctors",
            error: error.message,
        });
    }
};

// Get a single doctor by clerkUserId
exports.getDoctorByClerkUserId = async (req, res) => {
    try {
        const { clerkUserId } = req.params;
        const doctor = await Doctor.findOne({ clerkUserId });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        res.json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error("Get doctor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch doctor",
            error: error.message,
        });
    }
};

// Upsert (create or update) doctor profile
exports.upsertDoctorProfile = async (req, res) => {
    try {
        // Extract all relevant fields from req.body
        const {
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            affiliation,
            experience,
            bio,
            languages,
            address,
            district,
            state,
            consultationFee,
            telemedicineConsent,
            bankAccount,
            upiId,
            paymentMethod,
        } = req.body;

        // Get clerkUserId from auth (or req.body as fallback for testing)
        const clerkUserId = req.auth?.userId || req.body.clerkUserId;

        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Build the update object
        const update = {
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            affiliation,
            experience,
            bio,
            languages,
            address,
            district,
            state,
            consultationFee,
            telemedicineConsent,
            bankAccount,
            upiId,
            paymentMethod,
            clerkUserId,
            verificationStatus: "pending",
        };

        // Remove undefined fields (so we don't overwrite with undefined)
        Object.keys(update).forEach((key) => {
            if (update[key] === undefined) delete update[key];
        });

        // Upsert: update if exists, otherwise create
        const doctor = await Doctor.findOneAndUpdate(
            { clerkUserId },
            { $set: update },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            message: "Doctor profile saved successfully",
            data: doctor,
        });
    } catch (error) {
        console.error("Upsert doctor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save doctor profile",
            error: error.message,
        });
    }
};

// List only verified doctors
exports.getVerifiedDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({
            verificationStatus: "verified",
        }).select(
            "fullName specialty rating experience consultationFee languages"
        );
        res.json({ success: true, data: doctors });
    } catch (error) {
        console.error("Get verified doctors error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch verified doctors",
        });
    }
};
