// server/controllers/patient.controller.js
const Patient = require("../schema/patient.schema");

exports.createPatient = async (req, res) => {
    const {
        fullName,
        dob,
        gender,
        phone,
        email,
        address,
        district,
        govIdType,
        govIdNumber,
        emergencyContactName,
        emergencyContactPhone,
        medicalHistory,
        telemedicineConsent,
        alergies,
        operations,
        ongoingMedications,
        permanentMedications,
        majorDiseases,
        clerkUserId,
    } = req.body;

    const errors = [];

    // Inline validation
    if (
        !fullName ||
        typeof fullName !== "string" ||
        fullName.trim() === "" ||
        fullName.length > 100
    )
        errors.push(
            "fullName is required and must be a non-empty string (max 100 chars)"
        );
    if (
        !address ||
        typeof address !== "string" ||
        address.trim() === "" ||
        address.length > 200
    )
        errors.push(
            "address is required and must be a non-empty string (max 200 chars)"
        );
    if (
        !district ||
        typeof district !== "string" ||
        district.trim() === "" ||
        district.length > 50
    )
        errors.push(
            "district is required and must be a non-empty string (max 50 chars)"
        );
    if (
        !govIdNumber ||
        typeof govIdNumber !== "string" ||
        govIdNumber.trim() === "" ||
        govIdNumber.length > 20
    )
        errors.push(
            "govIdNumber is required and must be a non-empty string (max 20 chars)"
        );
    if (
        !emergencyContactName ||
        typeof emergencyContactName !== "string" ||
        emergencyContactName.trim() === "" ||
        emergencyContactName.length > 100
    )
        errors.push(
            "emergencyContactName is required and must be a non-empty string (max 100 chars)"
        );
    if (
        !medicalHistory ||
        typeof medicalHistory !== "string" ||
        medicalHistory.trim() === "" ||
        medicalHistory.length > 1000
    )
        errors.push(
            "medicalHistory is required and must be a non-empty string (max 1000 chars)"
        );
    if (
        !clerkUserId ||
        typeof clerkUserId !== "string" ||
        clerkUserId.trim() === ""
    )
        errors.push("clerkUserId is required and must be a non-empty string");

    // dob
    if (!dob || isNaN(Date.parse(dob))) {
        errors.push("dob is required and must be a valid date");
    } else if (new Date(dob) >= new Date()) {
        errors.push("dob must be in the past");
    }

    // gender
    const allowedGenders = ["male", "female", "other"];
    if (!allowedGenders.includes(gender)) {
        errors.push("gender must be one of: " + allowedGenders.join(", "));
    }

    // phone
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phone || !phoneRegex.test(phone)) {
        errors.push("phone is required and must be a valid phone number");
    }

    // email
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push("email is required and must be a valid email address");
    }

    // govIdType
    const allowedGovIdTypes = [
        "aadhar",
        "pan",
        "passport",
        "driving-license",
        "voter-id",
    ];
    if (!allowedGovIdTypes.includes(govIdType)) {
        errors.push(
            "govIdType must be one of: " + allowedGovIdTypes.join(", ")
        );
    }

    // emergencyContactPhone
    if (!emergencyContactPhone || !phoneRegex.test(emergencyContactPhone)) {
        errors.push(
            "emergencyContactPhone is required and must be a valid phone number"
        );
    }

    // telemedicineConsent
    if (typeof telemedicineConsent !== "boolean") {
        errors.push("telemedicineConsent is required and must be a boolean");
    }

    // Optional repeatable fields validation (if provided)
    const validateStringArray = (arr, name) => {
        if (arr === undefined || arr === null) return;
        if (!Array.isArray(arr)) return errors.push(`${name} must be an array of strings`);
        for (const v of arr) {
            if (typeof v !== 'string') return errors.push(`${name} must contain only strings`);
            if (v.trim().length === 0) return errors.push(`${name} must not contain empty strings`);
            if (v.length > 200) return errors.push(`${name} items must be at most 200 characters`);
        }
    };

    validateStringArray(alergies, 'alergies');
    validateStringArray(operations, 'operations');
    validateStringArray(ongoingMedications, 'ongoingMedications');
    validateStringArray(permanentMedications, 'permanentMedications');
    validateStringArray(majorDiseases, 'majorDiseases');

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res
            .status(400)
            .json({ error: "Validation failed", details: errors });
    }

    // If validation passes, create the patient
    try {
        const patient = await Patient.create({
            fullName,
            dob,
            gender,
            phone,
            email,
            address,
            district,
            govIdType,
            govIdNumber,
            emergencyContactName,
            emergencyContactPhone,
            medicalHistory,
            telemedicineConsent,
            // optional arrays (ensure fallback to empty arrays)
            alergies: Array.isArray(alergies) ? alergies.map(s => s.trim()) : [],
            operations: Array.isArray(operations) ? operations.map(s => s.trim()) : [],
            ongoingMedications: Array.isArray(ongoingMedications) ? ongoingMedications.map(s => s.trim()) : [],
            permanentMedications: Array.isArray(permanentMedications) ? permanentMedications.map(s => s.trim()) : [],
            majorDiseases: Array.isArray(majorDiseases) ? majorDiseases.map(s => s.trim()) : [],
            clerkUserId,
        });
        res.status(201).json({
            message: "Patient created successfully",
            patient,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({
                error: "Patient with this Clerk user ID already exists.",
            });
        }
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

// Get a patient by Clerk user ID (from params)
exports.getPatientByClerkId = async (req, res) => {
    try {
        const { clerkUserId } = req.params;
        if (!clerkUserId) {
            return res.status(400).json({
                error: "clerkUserId is required in the request params",
            });
        }
        const patient = await Patient.findOne({ clerkUserId });
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

exports.getPatientWithEvents = async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await Patient.findById(patientId).populate('events');
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};