// server/routes/patient.route.js
const express = require("express");
const router = express.Router();
const Patient = require("../schema/patient.schema");
const { createPatient, getAllPatients, getPatientByClerkId, getPatientWithEvents } = require("../controllers/patient.controller");

// Create a new patient (inline validation)
router.post("/create-patient", createPatient);

// Get all patients
router.get("/all-patients", getAllPatients);

// Get a patient by Clerk user ID
router.get("/get-patient/:clerkUserId", getPatientByClerkId);

// Medication reminders
router.get('/:clerkUserId/reminders', require('../controllers/patient.controller').getMedicationReminders);
router.post('/:clerkUserId/reminders', require('../controllers/patient.controller').addMedicationReminder);
router.put('/:clerkUserId/reminders/:reminderId', require('../controllers/patient.controller').updateMedicationReminder);
router.delete('/:clerkUserId/reminders/:reminderId', require('../controllers/patient.controller').deleteMedicationReminder);

router.get('/:patientId', getPatientWithEvents);


module.exports = router;
