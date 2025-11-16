const express = require("express");
const router = express.Router();
const pharmacyController = require("../controllers/pharmacy.controller");

// POST /api/pharmacy/create-pharmacy - Create a new pharmacy
router.post("/create-pharmacy", pharmacyController.createPharmacy);

// GET /api/pharmacy - Get all pharmacies (with optional filters)
router.get("/", pharmacyController.getAllPharmacies);

// GET /api/pharmacy/get-pharmacy/:clerkUserId - Get single pharmacy by clerkUserId
router.get("/get-pharmacy/:clerkUserId", pharmacyController.getPharmacyByClerkUserId);

// GET /api/pharmacy/verified-pharmacies - Get only verified pharmacies
router.get("/verified-pharmacies", pharmacyController.getVerifiedPharmacies);

// PUT /api/pharmacy/profile - Update pharmacy profile
router.put("/profile", pharmacyController.updatePharmacyProfile);

module.exports = router;

