// server/controllers/emergency.controller.js

const Emergency = require("../schema/emergency.schema");
const { sendSms } = require("../config/sms.config");
const dotenv = require("dotenv");
dotenv.config();

// Create a new emergency record
exports.createEmergency = async (req, res) => {
    try {
        const { fullName, phone, location } = req.body;

        // Validation
        if (
            !fullName ||
            typeof fullName !== "string" ||
            fullName.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Full name is required and must be a non-empty string",
            });
        }

        if (!phone || typeof phone !== "string" || phone.trim() === "") {
            return res.status(400).json({
                success: false,
                message:
                    "Phone number is required and must be a non-empty string",
            });
        }

        // Validate phone format
        const phoneRegex =
            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format",
            });
        }

        // Validate location (required by schema)
        if (!location || typeof location !== "object") {
            return res.status(400).json({
                success: false,
                message:
                    "Location is required and must be an object with latitude and longitude",
            });
        }

        if (
            typeof location.latitude !== "number" ||
            location.latitude < -90 ||
            location.latitude > 90
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Latitude is required and must be a number between -90 and 90",
            });
        }

        if (
            typeof location.longitude !== "number" ||
            location.longitude < -180 ||
            location.longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Longitude is required and must be a number between -180 and 180",
            });
        }

        // Create emergency record
        const emergency = await Emergency.create({
            fullName: fullName.trim(),
            phone: phone.trim(),
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
            },
        });

        //sending message to admin
        const message = `New Emergency SOS Alert: ${fullName} - ${phone}. Please check the emergency record and assign a doctor to the patient.`;

        sendSms(
            process.env.TEST_PHONE_NUMBER,
            message
        ).catch((err) => {
            console.error("Error sending SMS:", err);
        });

        return res.status(201).json({
            success: true,
            message: "Emergency record created successfully",
            data: emergency,
        });
    } catch (error) {
        console.error("Create emergency error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create emergency record",
            error: error.message,
        });
    }
};

// Get all emergency records
exports.getAllEmergencies = async (req, res) => {
    try {
        const emergencies = await Emergency.find({}, "-videoCallLink")
            .populate(
                "doctorId",
                "fullName specialty phone email consultationFee availableSlots"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: emergencies,
        });
    } catch (error) {
        console.error("Get all emergencies error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch emergency records",
            error: error.message,
        });
    }
};

// Get a single emergency record by ID
exports.getEmergencyById = async (req, res) => {
    try {
        const { id } = req.params;

        const emergency = await Emergency.findById(id).populate(
            "doctorId",
            "fullName specialty phone email"
        );

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency record not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: emergency,
        });
    } catch (error) {
        console.error("Get emergency by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch emergency record",
            error: error.message,
        });
    }
};

// Update emergency record (e.g., add video call link)
exports.updateEmergency = async (req, res) => {
    try {
        const { id } = req.params;
        const { videoCallLink, doctorId, location } = req.body;

        const updateData = {};
        if (videoCallLink !== undefined)
            updateData.videoCallLink = videoCallLink;
        if (doctorId !== undefined) updateData.doctorId = doctorId;
        if (location !== undefined) {
            // Validate location
            if (
                typeof location.latitude !== "number" ||
                location.latitude < -90 ||
                location.latitude > 90
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Latitude must be a number between -90 and 90",
                });
            }

            if (
                typeof location.longitude !== "number" ||
                location.longitude < -180 ||
                location.longitude > 180
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Longitude must be a number between -180 and 180",
                });
            }
            updateData.location = location;
        }

        const emergency = await Emergency.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("doctorId", "fullName specialty phone email");

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency record updated successfully",
            data: emergency,
        });
    } catch (error) {
        console.error("Update emergency error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update emergency record",
            error: error.message,
        });
    }
};

// Generate video call link for emergency (uses emergency ID as roomID)
exports.generateVideoCallLink = async (req, res) => {
    try {
        const { id } = req.params;
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const emergency = await Emergency.findById(id);
        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency record not found",
            });
        }

        // Use emergency ID as roomID for consistent video calls
        const roomID = emergency._id.toString();
        const videoCallLink = `${baseUrl}/emer-appointment/?roomID=${roomID}`;

        // Update emergency with video call link
        emergency.videoCallLink = videoCallLink;
        await emergency.save();

        console.log("Generated video call link for emergency:", id);
        console.log("Room ID:", roomID);
        console.log("Video Call Link:", videoCallLink);

        return res.status(200).json({
            success: true,
            message: "Video call link generated successfully",
            data: {
                emergencyId: emergency._id,
                roomID: roomID,
                videoCallLink: videoCallLink,
            },
        });
    } catch (error) {
        console.error("Generate video call link error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate video call link",
            error: error.message,
        });
    }
};

// Delete emergency record
exports.deleteEmergency = async (req, res) => {
    try {
        const { id } = req.params;

        const emergency = await Emergency.findByIdAndDelete(id);

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency record deleted successfully",
        });
    } catch (error) {
        console.error("Delete emergency error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete emergency record",
            error: error.message,
        });
    }
};
