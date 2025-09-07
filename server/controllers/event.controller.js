const Event = require('../schema/event.schema');
const Patient = require('../schema/patient.schema');

// Add a new event for a patient
exports.addEvent = async (req, res) => {
    try {
        const { patientId } = req.params;
        const eventData = { ...req.body, patientId };

        const event = await Event.create(eventData);

        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Edit an event
exports.editEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });
        if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });
        res.json(updatedEvent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(eventId);
        if (!deletedEvent) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all events for a patient
exports.getPatientEvents = async (req, res) => {
    try {
        const { patientId } = req.params;
        const events = await Event.find({ patientId });
        res.json(events);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};