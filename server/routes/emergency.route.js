// server/routes/emergency.route.js
const express = require("express");
const router = express.Router();
const emergencyController = require("../controllers/emergency.controller");
const { sendSms } = require("../config/sms.config");
const Emergencies = require("../schema/emergency.schema");
const GovDoctors = require("../schema/governmentDoctor.schema");

// POST /api/emergency - Create a new emergency record
router.post("/", emergencyController.createEmergency);

// GET /api/emergency - Get all emergency records
router.get("/", emergencyController.getAllEmergencies);

// GET /api/emergency/:id - Get a single emergency record by ID
router.get("/:id", emergencyController.getEmergencyById);

// PUT /api/emergency/:id - Update an emergency record
router.put("/:id", emergencyController.updateEmergency);

// DELETE /api/emergency/:id - Delete an emergency record
router.delete("/:id", emergencyController.deleteEmergency);

// POST /api/emergency/:id/generate-video-link - Generate video call link for emergency
router.post("/:id/generate-video-link", emergencyController.generateVideoCallLink);

router.post("/send-sms", async (req, res) => {
    try {
        const { selectedDoctor, selectedEmergency, link } = req.body;

        const doctorName = selectedDoctor.fullName;
        const patientName = selectedEmergency.fullName;

        const Patientmessage = `Emergency Appointment Confirmed!\n\nDear ${patientName},\nYour emergency appointment has been booked with Dr. ${doctorName}. Please be ready. You will be contacted by the doctor as soon as possible. \n\n LINK: ${link}`;
        const Doctormessage = `Emergency Appointment Alert!\n\nDr. ${doctorName},\nYou have been assigned to an emergency patient: ${patientName} (Phone: ${selectedEmergency.phone}). Please contact the patient urgently and proceed as necessary. \n\n LINK: ${link}`;

        // Add +91 at beginning of numbers (if not already in E.164 format)
        let patientTo = selectedEmergency.phone.startsWith("+91")
            ? selectedEmergency.phone
            : `+91${selectedEmergency.phone}`;
        let doctorTo =
            selectedDoctor.phone && selectedDoctor.phone.startsWith("+91")
                ? selectedDoctor.phone
                : `+91${selectedDoctor.phone}`;

        const emergencyId = selectedEmergency._id;
        let smsPat = null;
        let smsDoc = null;
        let smsErrors = [];

        // Try to send SMS to patient
        try {
            smsPat = await sendSms(patientTo, Patientmessage);
            console.log("Patient SMS sent successfully:", smsPat?.sid);
        } catch (error) {
            console.error("Failed to send SMS to patient:", error);
            smsErrors.push("Patient SMS failed");
        }

        // Try to send SMS to doctor
        try {
            smsDoc = await sendSms(doctorTo, Doctormessage);
            console.log("Doctor SMS sent successfully:", smsDoc?.sid);
        } catch (error) {
            console.error("Failed to send SMS to doctor:", error);
            smsErrors.push("Doctor SMS failed");
        }

        console.log(link);
        // Save the video link in the emergency schema
        const done = await Emergencies.findByIdAndUpdate(
            emergencyId,
            { videoCallLink: link },
            { new: true }
        );

        console.log("=============");
        console.log("Patient SMS:", smsPat ? "Success" : "Failed");
        console.log("=============");
        console.log("Doctor SMS:", smsDoc ? "Success" : "Failed");
        console.log("=============");

        // Always delete the emergency record after attempting to send SMS
        // This ensures the emergency disappears from the UI after processing
        try {
            await Emergencies.findByIdAndDelete(emergencyId);
            console.log(`Emergency record ${emergencyId} deleted after SMS processing`);
        } catch (deleteError) {
            console.error("Error deleting emergency record:", deleteError);
            return res.status(500).json({
                success: false,
                message: "Failed to delete emergency record",
                error: deleteError.message,
            });
        }

        // Return success even if some SMS failed, as long as deletion succeeded
        return res.json({
            success: true,
            message: smsErrors.length > 0 
                ? `Emergency processed. Some SMS failed: ${smsErrors.join(", ")}`
                : "SMS sent successfully and emergency record removed",
            smsStatus: {
                patient: smsPat ? "sent" : "failed",
                doctor: smsDoc ? "sent" : "failed",
            },
        });
    } catch (e) {
        console.error("Error in send-sms route:", e);
        return res.status(500).json({
            success: false,
            message: "Failed to process emergency",
            error: e.message,
        });
    }
});

module.exports = router;
