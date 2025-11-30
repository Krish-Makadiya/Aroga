// server/controllers/patient.controller.js
const { translate } = require("@vitalets/google-translate-api");
const { sendSms } = require("../config/sms.config");
const Patient = require("../schema/patient.schema");
const Appointment = require("../schema/appointment.schema");
const Prescription = require("../schema/prescription.schema");
const MedicalRecord = require("../schema/medicalRecord.schema");
const { parseMedicalDocument } = require("../config/ai.config");

exports.createPatient = async (req, res) => {
    // ... (Your existing createPatient code is fine, keep it as is) ...
    const {
        fullName, dob, gender, phone, email, address, district,
        govIdType, govIdNumber, emergencyContactName, emergencyContactPhone,
        medicalHistory, telemedicineConsent, clerkUserId,
    } = req.body;

    // ... (Keep your existing validation logic) ...
    const errors = [];
    if (!fullName) errors.push("fullName is required");
    // ... (shortened for brevity, keep your original validation) ...

    if (errors.length > 0) {
        return res.status(400).json({ error: "Validation failed", details: errors });
    }

    try {
        const patient = await Patient.create(req.body); // Simplified for brevity
        res.status(201).json({ message: "Patient created successfully", patient });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

// ... (Keep getAllPatients, getPatientByClerkId, getPatientWithEvents as they are) ...
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

exports.getPatientByClerkId = async (req, res) => {
    try {
        const { clerkUserId } = req.params;
        const patient = await Patient.findOne({ clerkUserId });
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

exports.getPatientWithEvents = async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await Patient.findById(patientId).populate("events");
        if (!patient)
            return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};



// Get prescribed medications
exports.getPrescribedMedications = async (req, res) => {
  try {
    
    const { clerkUserId } = req.query; 

    if (!clerkUserId) {
        return res.status(400).json({ message: "clerkUserId query param is required" });
    }

    const patient = await Patient.findOne({ clerkUserId });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const prescriptions = await Prescription.find({
      patientId: patient._id,
      status: "active",
    })
      .sort({ prescribedDate: -1 })
      .populate("doctorId", "name");

    res.json(prescriptions);
  } catch (error) {
    console.error("Error fetching medications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get appointment history
exports.getAppointmentHistory = async (req, res) => {
  try {
    const { clerkUserId } = req.query;
    if (!clerkUserId) return res.status(401).json({ message: "Unauthorized" });

    const patient = await Patient.findOne({ clerkUserId });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const appointments = await Appointment.find({
      patientId: patient._id,
      status: { $in: ["completed", "cancelled"] },
    })
      .sort({ date: -1, time: -1 })
      .populate("doctorId", "name");

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get personal medical records
exports.getPersonalMedicalRecords = async (req, res) => {
  try {
    const userId = req.user?.id || req.auth?.userId; 
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const patient = await Patient.findOne({ clerkUserId: userId });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const records = await MedicalRecord.find({ patientId: patient._id }).sort({
      date: -1,
    });

    res.json(records);
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATED: Add a new personal medical record (Local Storage Support)
exports.addPersonalMedicalRecord = async (req, res) => {
  try {
   
    const { type, date, notes, clerkUserId } = req.body;

    if (!clerkUserId) {
        return res.status(400).json({ message: "clerkUserId is required" });
    }

    const patient = await Patient.findOne({ clerkUserId });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    let fileUrl = "";

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const record = new MedicalRecord({
      patientId: patient._id,
      type,
      date,
      notes,
      fileUrl,
    });

    await record.save();
    res.status(201).json(record);
  } catch (error) {
    console.error("Error adding medical record:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a personal medical record
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user?.id || req.auth?.userId; 
    
    const patient = await Patient.findOne({ clerkUserId: userId });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const record = await MedicalRecord.findOne({
      _id: recordId,
      patientId: patient._id,
    });

    if (!record) return res.status(404).json({ message: "Record not found" });

    await MedicalRecord.deleteOne({ _id: recordId });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting medical record:", error);
    res.status(500).json({ message: "Server error" });
  }
};