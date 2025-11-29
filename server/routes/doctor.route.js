const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctor.controller");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/doctor/create-doctor - Create a new doctor
// accept two files: licenseFile and idProofFile
router.post(
	"/create-doctor",
	upload.fields([
		{ name: 'licenseFile', maxCount: 1 },
		{ name: 'idProofFile', maxCount: 1 },
	]),
	doctorController.createDoctor
);

// GET /api/doctor - Get all doctors
router.get("/", doctorController.getAllDoctors);

// GET /api/doctor/get-doctor/:clerkUserId - Get single doctor by clerkUserId
router.get("/get-doctor/:clerkUserId", doctorController.getDoctorByClerkUserId);

// POST or PUT /api/doctor/profile - Upsert doctor profile
router.post("/profile", doctorController.upsertDoctorProfile);

router.get("/verified-doctors", doctorController.getVerifiedDoctors);
// detailed verified doctors with stats
router.get('/verified-doctors/detailed', doctorController.getVerifiedDoctorsWithStats);
// GET /api/doctor/verified-doctors/patients - list verified doctors + their unique patients
router.get('/verified-doctors/patients', doctorController.getVerifiedDoctorsWithPatients);

// GET /api/doctor/pending-doctors - Get all pending doctors (for admin)
router.get("/pending-doctors", doctorController.getPendingDoctors);

// PUT /api/doctor/:doctorId/verify - Verify a doctor
router.put("/:doctorId/verify", doctorController.verifyDoctor);

module.exports = router;