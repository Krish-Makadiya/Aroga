// server/routes/patient.route.js
const express = require("express");
const router = express.Router();
const Patient = require("../schema/patient.schema");
const { createPatient, getAllPatients, getAllPatientsWithLocation, getPatientByClerkId, getPatientWithEvents, getMedicationReminders, addMedicationReminder, updateMedicationReminder, deleteMedicationReminder, setPreferredLanguage, updateLocation } = require("../controllers/patient.controller");

// Create a new patient (inline validation)
router.post("/create-patient", createPatient);

// Get all patients
router.get("/all-patients", getAllPatients);

// Get all patients with location (for admin map)
router.get("/all-patients/location", getAllPatientsWithLocation);

// Get a patient by Clerk user ID
router.get("/get-patient/:clerkUserId", getPatientByClerkId);

// Medication reminders
router.get('/:clerkUserId/reminders', getMedicationReminders);
router.post('/:clerkUserId/reminders', addMedicationReminder);
router.put('/:clerkUserId/reminders/:reminderId', updateMedicationReminder);
router.delete('/:clerkUserId/reminders/:reminderId', deleteMedicationReminder);

router.get('/:patientId', getPatientWithEvents);

router.post('/:clerkUserId/language', setPreferredLanguage);

// Update patient location
router.put('/:clerkUserId/location', updateLocation);

module.exports = router;
