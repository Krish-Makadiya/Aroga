const express = require("express");
const router = express.Router();
const {
    addEvent,
    editEvent,
    deleteEvent,
    getPatientEvents,
} = require("../controllers/event.controller");

// Add a new event for a patient
router.post("/patients/:patientId/events", addEvent);

// Edit an event
router.put("/patients/:patientId/events/:eventId", editEvent);

// Delete an event
router.delete("/patients/:patientId/events/:eventId", deleteEvent);

// Get all events for a patient
router.get("/patients/:patientId/events", getPatientEvents);

module.exports = router;
