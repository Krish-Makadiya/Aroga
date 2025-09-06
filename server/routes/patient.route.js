// server/routes/patient.route.js
const express = require("express");
const router = express.Router();
const Patient = require("../schema/patient.schema");
const { createPatient, getAllPatients, getPatientByClerkId } = require("../controllers/patient.controller");

// Create a new patient (inline validation)
router.post("/create-patient", createPatient);

// Get all patients
router.get("/all-patients", getAllPatients);

// Get a patient by Clerk user ID
router.get("/get-patient/:clerkUserId", getPatientByClerkId);

module.exports = router;
