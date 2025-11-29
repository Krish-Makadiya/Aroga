const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctor.controller");

// POST /api/doctor/create-doctor - Create a new doctor
router.post("/create-doctor", doctorController.createDoctor);

// GET /api/doctor - Get all doctors
router.get("/", doctorController.getAllDoctors);

// GET /api/doctor/get-doctor/:clerkUserId - Get single doctor by clerkUserId
router.get("/get-doctor/:clerkUserId", doctorController.getDoctorByClerkUserId);

// POST or PUT /api/doctor/profile - Upsert doctor profile
router.post("/profile", doctorController.upsertDoctorProfile);

router.get("/verified-doctors", doctorController.getVerifiedDoctors);

// Availability & blackout management
router.post("/availability", doctorController.setAvailability);
router.get("/availability", doctorController.getAvailability);
router.post("/blackouts", doctorController.addBlackout);
router.delete("/blackouts/:index", doctorController.removeBlackout);

// List available 20-min slots for a specific date
router.get("/:doctorId/slots", doctorController.getAvailableSlotsForDate);

module.exports = router;