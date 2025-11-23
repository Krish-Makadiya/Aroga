const express = require("express");
const router = express.Router();
const womenHealthController = require("../controllers/womenhealth.controller.js");

// POST /api/womenhealth/period-day
router.post("/period-day", womenHealthController.addOrUpdatePeriodDay);

// POST /api/womenhealth/daily-log
router.post("/daily-log", womenHealthController.addOrUpdateDailyLog);

// GET /api/womenhealth/:userId
router.get("/:userId", womenHealthController.getWomenHealthByUserId);

module.exports = router;
