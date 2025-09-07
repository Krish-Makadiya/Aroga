const express = require('express');
const router = express.Router();
const Doctor = require('../schema/doctor.schema');

// POST /api/doctor - Create a new doctor
router.post('/create-doctor', async (req, res) => {
    try {
        // Extract only the required fields from req.body
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
            telemedicineConsent
        } = req.body;

        // Get clerkUserId from auth
        const clerkUserId = req.auth?.userId;

        // Basic validation for required fields
        if (!fullName || !qualifications || !registrationNumber || !specialty || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fullName, qualifications, registrationNumber, specialty, phone, email'
            });
        }

        // Validate clerkUserId
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Check if doctor already exists
        const existingDoctor = await Doctor.findOne({
            $or: [
                { email: email },
                { phone: phone },
                { registrationNumber: registrationNumber },
                { clerkUserId: clerkUserId }
            ]
        });

        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message: 'Doctor with this email, phone, registration number, or user account already exists'
            });
        }

        // Create new doctor using Doctor.create()
        const doctor = await Doctor.create({
            fullName,
            qualifications,
            registrationNumber,
            specialty,
            phone,
            email,
            licenseFile: licenseFile || '',
            idProofFile: idProofFile || '',
            affiliation: affiliation || '',
            experience: experience || '0',
            telemedicineConsent: telemedicineConsent !== undefined ? telemedicineConsent : true,
            clerkUserId
        });

        res.status(201).json({
            success: true,
            message: 'Doctor registered successfully',
            data: {
                id: doctor._id,
                fullName: doctor.fullName,
                specialty: doctor.specialty,
                email: doctor.email,
                verificationStatus: doctor.verificationStatus
            }
        });

    } catch (error) {
        console.error('Doctor registration error:', error);

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET /api/doctor - Get all doctors
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find({ isActive: true })
            .select('fullName specialty email phone verificationStatus rating experience')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: doctors
        });

    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctors',
            error: error.message
        });
    }
});

// GET /api/doctor/:id - Get single doctor
router.get('/get-doctor/:clerkUserId', async (req, res) => {
    try {
        const { clerkUserId } = req.params;
        const doctor = await Doctor.findOne({ clerkUserId: clerkUserId });
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor',
            error: error.message
        });
    }
});

module.exports = router;