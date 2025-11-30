// server/routes/patient.route.js
const express = require("express");
const router = express.Router();
const {
    createPatient,
    getAllPatients,
    getPatientByClerkId,
    getPatientWithEvents,
    getPrescribedMedications,
    getAppointmentHistory,
    getPersonalMedicalRecords,
    addPersonalMedicalRecord,
    deleteMedicalRecord,
} = require("../controllers/patient.controller");
const { upload } = require("../middleware/upload");

// Existing routes
router.post("/create-patient", createPatient);
router.get("/all-patients", getAllPatients);
router.get("/get-patient/:clerkUserId", getPatientByClerkId);

// New medical history routes
router.get("/prescribed-medications", getPrescribedMedications);
router.get("/appointment-history", getAppointmentHistory);
router.get("/medical-records", getPersonalMedicalRecords);
router.post(
    "/medical-records",
    upload.single('file'),
    addPersonalMedicalRecord
);
router.delete("/medical-records/:recordId", deleteMedicalRecord);


router.get("/:patientId", getPatientWithEvents);

module.exports = router;