const express = require("express");
const router = express.Router();
const controller = require("../controllers/pharmacy_location.controller");

router.post("/", controller.createPharmacy);
router.put("/:id/location", controller.updateLocation);
router.get("/:id/location", controller.getLocationByOwner);
router.get("/nearby", controller.getNearby);

module.exports = router;
