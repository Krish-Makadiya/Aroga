// server/controllers/doctor.controller.js

const Doctor = require("../schema/doctor.schema");
const Appointment = require("../schema/appointment.schema");

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

        const doctor = await Doctor.create({
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            licenseFile: licenseFile || "",
            idProofFile: idProofFile || "",
            affiliation: affiliation || "",
            experience: experience || "0",
            telemedicineConsent:
                telemedicineConsent !== undefined ? telemedicineConsent : true,
            clerkUserId,
        });

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

// ===== Availability & Slots =====

// Helper: convert HH:MM to minutes
function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

// Helper: format minutes to HH:MM
function toHHMM(mins) {
    const h = Math.floor(mins / 60)
        .toString()
        .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
}

// Helper: day name from date string YYYY-MM-DD
function dayName(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    const names = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    return names[d.getDay()];
}

// POST /api/doctor/availability - set weekly availability ranges
exports.setAvailability = async (req, res) => {
    try {
        const clerkUserId = req.auth?.userId || req.body.clerkUserId;
        if (!clerkUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const { availableSlots } = req.body; // [{ day, startTime, endTime }]
        if (!Array.isArray(availableSlots)) {
            return res.status(400).json({ success: false, message: "availableSlots must be an array" });
        }
        const doctor = await Doctor.findOneAndUpdate(
            { clerkUserId },
            { $set: { availableSlots } },
            { new: true }
        );
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
        res.json({ success: true, data: doctor.availableSlots });
    } catch (error) {
        console.error("setAvailability error:", error);
        res.status(500).json({ success: false, message: "Failed to save availability" });
    }
};

// GET /api/doctor/availability - get weekly availability
exports.getAvailability = async (req, res) => {
    try {
        const clerkUserId = req.auth?.userId || req.query.clerkUserId;
        if (!clerkUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const doctor = await Doctor.findOne({ clerkUserId }).select("availableSlots");
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
        res.json({ success: true, data: doctor.availableSlots || [] });
    } catch (error) {
        console.error("getAvailability error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch availability" });
    }
};

// POST /api/doctor/blackouts - add a blackout (freeze window) for date
exports.addBlackout = async (req, res) => {
    try {
        const clerkUserId = req.auth?.userId || req.body.clerkUserId;
        if (!clerkUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const { date, startTime, endTime } = req.body;
        if (!date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: "date, startTime, endTime are required" });
        }
        const doctor = await Doctor.findOneAndUpdate(
            { clerkUserId },
            { $push: { blackouts: { date, startTime, endTime } } },
            { new: true }
        );
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
        res.json({ success: true, data: doctor.blackouts });
    } catch (error) {
        console.error("addBlackout error:", error);
        res.status(500).json({ success: false, message: "Failed to add blackout" });
    }
};

// DELETE /api/doctor/blackouts/:index - remove blackout by index
exports.removeBlackout = async (req, res) => {
    try {
        const clerkUserId = req.auth?.userId || req.query.clerkUserId;
        const index = Number(req.params.index);
        if (!clerkUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        if (Number.isNaN(index)) {
            return res.status(400).json({ success: false, message: "Invalid index" });
        }
        const doctor = await Doctor.findOne({ clerkUserId });
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
        if (!Array.isArray(doctor.blackouts) || index < 0 || index >= doctor.blackouts.length) {
            return res.status(400).json({ success: false, message: "Blackout not found" });
        }
        doctor.blackouts.splice(index, 1);
        await doctor.save();
        res.json({ success: true, data: doctor.blackouts });
    } catch (error) {
        console.error("removeBlackout error:", error);
        res.status(500).json({ success: false, message: "Failed to remove blackout" });
    }
};

// GET /api/doctor/:doctorId/slots?date=YYYY-MM-DD - list 20-min available slots
exports.getAvailableSlotsForDate = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;
        if (!doctorId || !date) {
            return res.status(400).json({ success: false, message: "doctorId and date are required" });
        }
        const doctor = await Doctor.findById(doctorId).select("availableSlots blackouts");
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

        const day = dayName(date);
        const ranges = (doctor.availableSlots || []).filter((r) => r.day === day);
        if (ranges.length === 0) return res.json({ success: true, data: [] });

        // Build blackout intervals for that date
        const blackouts = (doctor.blackouts || []).filter((b) => b.date === date);
        const blackoutIntervals = blackouts.map((b) => [toMinutes(b.startTime), toMinutes(b.endTime)]);

        // Fetch booked appointments for the day (LOCAL time window)
        // Using local boundaries avoids UTC date-shift that can miss matches
        const dayStart = new Date(`${date}T00:00:00`);
        const dayEnd = new Date(`${date}T23:59:59.999`);
        const booked = await Appointment.find({ doctorId, scheduledAt: { $gte: dayStart, $lte: dayEnd } })
            .select("scheduledAt");
        const bookedSet = new Set(
            booked.map((a) => {
                const d = new Date(a.scheduledAt);
                // Compare in LOCAL time to match availability ranges
                const hh = d.getHours().toString().padStart(2, "0");
                const mm = d.getMinutes().toString().padStart(2, "0");
                return `${hh}:${mm}`;
            })
        );

        // Generate 20-min slots inside ranges, exclude blackouts and booked
        const result = [];
        for (const r of ranges) {
            const start = toMinutes(r.startTime);
            const end = toMinutes(r.endTime);
            for (let t = start; t + 20 <= end; t += 20) {
                const hhmm = toHHMM(t);
                // exclude if inside a blackout
                const inBlackout = blackoutIntervals.some(([s, e]) => t >= s && t < e);
                if (inBlackout) continue;
                if (bookedSet.has(hhmm)) continue;
                result.push(hhmm);
            }
        }

        res.json({ success: true, data: result });
    } catch (error) {
        console.error("getAvailableSlotsForDate error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch slots" });
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
        const doctors = await Doctor.find({
            verificationStatus: "verified",
        }).select(
            "fullName specialty rating experience consultationFee languages"
        );
        res.json({ success: true, data: doctors });
    } catch (error) {
        console.error("Get verified doctors error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch verified doctors",
        });
    }
};
