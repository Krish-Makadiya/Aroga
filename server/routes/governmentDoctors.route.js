// server/routes/governmentDoctors.route.js
const express = require("express");
const router = express.Router();
const governmentDoctorController = require("../controllers/governmentDoctor.controller");

// POST /api/government-doctors - Create a new government doctor
router.post("/", governmentDoctorController.createGovernmentDoctor);

// GET /api/government-doctors - Get all government doctors
router.get("/", governmentDoctorController.getAllGovernmentDoctors);

// GET /api/government-doctors/:id - Get a single government doctor by ID
router.get("/:id", governmentDoctorController.getGovernmentDoctorById);

module.exports = router;

