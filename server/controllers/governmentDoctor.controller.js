// server/controllers/governmentDoctor.controller.js

const GovDoctors = require("../schema/governmentDoctor.schema");

// Create a new government doctor
exports.createGovernmentDoctor = async (req, res) => {
    try {
        const { fullName, specialty, experience } = req.body;

        // Validation
        if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Full name is required and must be a non-empty string",
            });
        }

        if (!specialty || typeof specialty !== "string" || specialty.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Specialty is required and must be a non-empty string",
            });
        }

        if (experience === undefined || typeof experience !== "number" || experience < 0) {
            return res.status(400).json({
                success: false,
                message: "Experience is required and must be a non-negative number",
            });
        }

        // Create government doctor
        const doctor = await GovDoctors.create({
            fullName: fullName.trim(),
            specialty: specialty.trim(),
            experience: experience,
        });

        // Console log the created document
        console.log("=== Created Government Doctor ===");
        console.log("Document:", JSON.stringify(doctor, null, 2));

        return res.status(201).json({
            success: true,
            message: "Government doctor created successfully",
            data: doctor,
        });
    } catch (error) {
        console.error("Create government doctor error:", error);
        
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create government doctor",
            error: error.message,
        });
    }
};

// Get all government doctors
exports.getAllGovernmentDoctors = async (req, res) => {
    try {
        const doctors = await GovDoctors.find().sort({ createdAt: -1 });
        
        // Console log all documents
        console.log("=== All Government Doctors ===");
        console.log("Total count:", doctors.length);
        console.log("Documents:", JSON.stringify(doctors, null, 2));
        
        return res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors,
        });
    } catch (error) {
        console.error("Get all government doctors error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch government doctors",
            error: error.message,
        });
    }
};

// Get a single government doctor by ID
exports.getGovernmentDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await GovDoctors.findById(id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Government doctor not found",
            });
        }

        // Console log the document
        console.log("=== Government Doctor by ID ===");
        console.log("Document:", JSON.stringify(doctor, null, 2));

        return res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error("Get government doctor by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch government doctor",
            error: error.message,
        });
    }
};

