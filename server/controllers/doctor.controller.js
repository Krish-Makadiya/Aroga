// server/controllers/doctor.controller.js

const Doctor = require("../schema/doctor.schema");
const Appointment = require('../schema/appointment.schema');
const Rating = require('../schema/rating.schema');
const Patient = require('../schema/patient.schema');
const cloudinary = require("../config/cloudinary");

// Create a new doctor
exports.createDoctor = async (req, res) => {
    try {
        const {
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            licenseFile,
            idProofFile,
            affiliation,
            experience,
            telemedicineConsent,
        } = req.body;

        const clerkUserId = req.auth?.userId;

        if (
            !fullName ||
            !qualifications ||
            !registrationNumber ||
            !specialty ||
            !phone ||
            !email
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: fullName, qualifications, registrationNumber, specialty, phone, email",
            });
        }

        console.log(fullName, qualifications, registrationNumber, specialty, phone, email, clerkUserId);

        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const existingDoctor = await Doctor.findOne({
            $or: [
                { email },
                { phone },
                { registrationNumber },
                { clerkUserId },
            ],
        });

        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor with this email, phone, registration number, or user account already exists",
            });
        }

        // Support receiving two files via multer.fields: licenseFile and idProofFile
        let licenseFileUrl = "";
        let idProofFileUrl = "";

        async function uploadBufferToCloud(buffer, folder = 'doctor_docs') {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto', folder }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
                stream.end(buffer);
            });
            return uploadResult?.secure_url || '';
        }

        // multer.fields populates req.files as an object: { licenseFile: [file], idProofFile: [file] }
        if (req.files && req.files.licenseFile && req.files.licenseFile[0]) {
            try {
                licenseFileUrl = await uploadBufferToCloud(req.files.licenseFile[0].buffer, 'doctor_docs');
            } catch (err) {
                console.error('[doctor.createDoctor] license upload failed:', err.message || err);
            }
        }

        if (req.files && req.files.idProofFile && req.files.idProofFile[0]) {
            try {
                idProofFileUrl = await uploadBufferToCloud(req.files.idProofFile[0].buffer, 'doctor_docs');
            } catch (err) {
                console.error('[doctor.createDoctor] idProof upload failed:', err.message || err);
            }
        }

        console.log("License File URL:", licenseFileUrl);
        console.log("ID Proof File URL:", idProofFileUrl);

        const doctor = await Doctor.create({
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            licenseFile: licenseFileUrl || "",
            idProofFile: idProofFileUrl || "",
            affiliation: affiliation || "",
            experience: experience || "0",
            telemedicineConsent:
                telemedicineConsent !== undefined ? telemedicineConsent : true,
            clerkUserId,
        });

        console.log("Doctor created:", doctor);

        res.status(201).json({
            success: true,
            message: "Doctor registered successfully",
            data: {
                id: doctor._id,
                fullName: doctor.fullName,
                specialty: doctor.specialty,
                email: doctor.email,
                verificationStatus: doctor.verificationStatus,
            },
        });
    } catch (error) {
        console.error("Doctor registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ isActive: true })
            .select(
                "fullName specialty email phone verificationStatus rating experience"
            )
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: doctors,
        });
    } catch (error) {
        console.error("Get doctors error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch doctors",
            error: error.message,
        });
    }
};

// Get a single doctor by clerkUserId
exports.getDoctorByClerkUserId = async (req, res) => {
    try {
        const { clerkUserId } = req.params;
        const doctor = await Doctor.findOne({ clerkUserId });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        res.json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error("Get doctor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch doctor",
            error: error.message,
        });
    }
};

// Upsert (create or update) doctor profile
exports.upsertDoctorProfile = async (req, res) => {
    try {
        // Extract all relevant fields from req.body
        const {
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            affiliation,
            experience,
            bio,
            languages,
            address,
            district,
            state,
            consultationFee,
            telemedicineConsent,
            bankAccount,
            upiId,
            paymentMethod,
        } = req.body;

        // Get clerkUserId from auth (or req.body as fallback for testing)
        const clerkUserId = req.auth?.userId || req.body.clerkUserId;

        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Build the update object
        const update = {
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            affiliation,
            experience,
            bio,
            languages,
            address,
            district,
            state,
            consultationFee,
            telemedicineConsent,
            bankAccount,
            upiId,
            paymentMethod,
            clerkUserId,
            verificationStatus: "pending",
        };

        // Remove undefined fields (so we don't overwrite with undefined)
        Object.keys(update).forEach((key) => {
            if (update[key] === undefined) delete update[key];
        });

        // Upsert: update if exists, otherwise create
        const doctor = await Doctor.findOneAndUpdate(
            { clerkUserId },
            { $set: update },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            message: "Doctor profile saved successfully",
            data: doctor,
        });
    } catch (error) {
        console.error("Upsert doctor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save doctor profile",
            error: error.message,
        });
    }
};

// List only verified doctors
exports.getVerifiedDoctors = async (req, res) => {
    try {
        let query = { verificationStatus: "verified" };
        let selectFields = null;
        // If ?full=true, return full documents (all fields inc. docs and bank)
        if (!req.query.full || req.query.full !== "true") {
            selectFields = [
                "fullName specialty qualifications registrationNumber phone email licenseFile idProofFile affiliation experience consultationFee languages rating bio verificationStatus ",
                "address district state ",
                "bankAccount.accountNumber bankAccount.ifscCode bankAccount.bankName bankAccount.accountHolderName bankAccount.branchName ",
                "upiId"
            ].join("");
        }
        const doctors = await Doctor.find(query)
            .select(selectFields)
            .sort({ createdAt: -1 });
        res.json({ success: true, data: doctors });
    } catch (error) {
        console.error("Get verified doctors error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch verified doctors",
        });
    }
};

// List pending doctors (for admin verification)
exports.getPendingDoctors = async (req, res) => {
    try {
        let query = { verificationStatus: "pending" };
        let selectFields = null;
        // If ?full=true, return full documents (all fields inc. docs and bank)
        if (!req.query.full || req.query.full !== "true") {
            selectFields = [
                "fullName specialty qualifications registrationNumber phone email licenseFile idProofFile affiliation experience consultationFee languages rating bio verificationStatus ",
                "address district state ",
                "bankAccount.accountNumber bankAccount.ifscCode bankAccount.bankName bankAccount.accountHolderName bankAccount.branchName ",
                "upiId createdAt"
            ].join("");
        }
        const doctors = await Doctor.find(query)
            .select(selectFields)
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: doctors });
    } catch (error) {
        console.error("Get pending doctors error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending doctors",
        });
    }
};

// Verify a doctor (update verificationStatus to "verified")
exports.verifyDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID is required",
            });
        }

        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            {
                verificationStatus: "verified",
                verifiedAt: new Date(),
            },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        res.json({
            success: true,
            message: "Doctor verified successfully",
            data: doctor,
        });
    } catch (error) {
        console.error("Verify doctor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify doctor",
            error: error.message,
        });
    }
};

// Return verified doctors with aggregated stats (appointments, ratings, patients count)
exports.getVerifiedDoctorsWithStats = async (req, res) => {
    try {
        // Query param to control active/inactive
        // Default: active = true (doctors working with patients)
        const activeParam = typeof req.query.active !== 'undefined' ? String(req.query.active).toLowerCase() : 'true';
        const active = activeParam === 'false' ? false : true;

        const selectFields = (String(req.query.full) === 'true')
            ? undefined // return full document
            : 'fullName specialty phone email consultationFee experience languages bio _id verificationStatus';

        // Find verified doctors with provided active flag
        const doctors = await Doctor.find({ verificationStatus: 'verified', isActive: active }).select(selectFields);

        const doctorIds = doctors.map(d => d._id);

        // Appointments aggregation per doctor
        const now = new Date();
        const next24 = new Date(now.getTime() + 24*60*60*1000);

        // Consider only confirmed/completed appointments as 'working with patients'
        const apptAgg = await Appointment.aggregate([
            { $match: { doctorId: { $in: doctorIds }, status: { $in: ['confirmed','completed'] } } },
            { $group: {
                _id: '$doctorId',
                totalAppointments: { $sum: 1 },
                upcoming24: { $sum: { $cond: [ { $and: [ { $gte: ['$scheduledAt', now] }, { $lt: ['$scheduledAt', next24] } ] }, 1, 0 ] } },
                patients: { $addToSet: '$patientId' },
                lastAppointmentAt: { $max: '$scheduledAt' }
            } }
        ]);

        // ratings per doctor
        const ratingAgg = await Rating.aggregate([
            { $match: { doctorId: { $in: doctorIds } } },
            { $group: { _id: '$doctorId', avgRating: { $avg: '$rating' }, ratingCount: { $sum: 1 } } }
        ]);

        // Build lookup maps
        const apptMap = new Map(apptAgg.map(a => [String(a._id), a]));
        const ratingMap = new Map(ratingAgg.map(r => [String(r._id), r]));

        const result = doctors.map(doc => {
            const key = String(doc._id);
            const a = apptMap.get(key) || { totalAppointments: 0, upcoming24: 0, patients: [] };
            const r = ratingMap.get(key) || { avgRating: null, ratingCount: 0 };
            return {
                _id: doc._id,
                fullName: doc.fullName,
                specialty: doc.specialty,
                phone: doc.phone,
                email: doc.email,
                consultationFee: doc.consultationFee,
                experience: doc.experience,
                languages: doc.languages,
                bio: doc.bio,
                verificationStatus: doc.verificationStatus,
                stats: {
                    totalAppointments: a.totalAppointments || 0,
                    upcoming24: a.upcoming24 || 0,
                    uniquePatients: (a.patients || []).length,
                    lastAppointmentAt: a.lastAppointmentAt || null,
                    avgRating: r.avgRating ? Number(r.avgRating.toFixed(2)) : null,
                    ratingCount: r.ratingCount || 0,
                }
            };
        });

        // If active=true we keep only those with appointments (working with patients).
        // If active=false (inactive doctors) return all verified inactive docs regardless of appointment counts.
        const filtered = active ? result.filter(d => (d.stats?.totalAppointments || 0) > 0) : result;
        console.log(filtered);
        return res.json({ success: true, data: filtered, meta: { active, returned: filtered.length } });
    } catch (err) {
        console.error('[doctor.getVerifiedDoctorsWithStats] error', err.message || err);
        return res.status(500).json({ success: false, message: 'Failed to load doctors', error: err.message });
    }
};

// Get verified doctors and their unique patients
exports.getVerifiedDoctorsWithPatients = async (req, res) => {
    try {
        // find all verified doctors
        const doctors = await Doctor.find({ verificationStatus: 'verified' }).select('fullName specialty _id email phone');

        if (!doctors || doctors.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const doctorIds = doctors.map(d => d._id);

        // aggregate unique patient ids per doctor from appointments
        const agg = await Appointment.aggregate([
            { $match: { doctorId: { $in: doctorIds } } },
            { $group: { _id: { doctorId: '$doctorId' }, patients: { $addToSet: '$patientId' } } }
        ]);

        // build map doctorId -> [patientIds]
        const map = new Map();
        for (const row of agg) {
            const docId = String(row._id.doctorId || row._id);
            map.set(docId, row.patients || []);
        }

        // collect all patient ids to fetch details in one query
        const allPatientIds = new Set();
        for (const arr of map.values()) {
            for (const pid of arr) allPatientIds.add(String(pid));
        }

        let patientDocs = [];
        if (allPatientIds.size > 0) {
            patientDocs = await Patient.find({ _id: { $in: Array.from(allPatientIds) } }).select('fullName phone email dob district');
        }

        const patientById = new Map(patientDocs.map(p => [String(p._id), p]));

        const result = doctors.map(doc => {
            const pids = map.get(String(doc._id)) || [];
            const patients = pids.map(pid => patientById.get(String(pid))).filter(Boolean);
            return {
                _id: doc._id,
                fullName: doc.fullName,
                specialty: doc.specialty,
                email: doc.email,
                phone: doc.phone,
                patients,
            };
        });

        return res.json({ success: true, data: result });
    } catch (err) {
        console.error('[doctor.getVerifiedDoctorsWithPatients] error', err.message || err);
        return res.status(500).json({ success: false, message: 'Failed to fetch doctors with patients', error: err.message });
    }
};
