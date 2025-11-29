const Patient = require('../schema/patient.schema');
const Doctor = require('../schema/doctor.schema');
const Pharmacy = require('../schema/pharmacy.schema');
const Appointment = require('../schema/appointment.schema');
const mongoose = require('mongoose');

exports.getOverview = async (req, res) => {
    try {
        const now = new Date();

        const [patientsCount, doctorsCount, pharmaciesCount, appointmentsCount] = await Promise.all([
            Patient.countDocuments(),
            Doctor.countDocuments(),
            Pharmacy.countDocuments(),
            Appointment.countDocuments(),
        ]);

        // appointments by status
        const apptStatusAgg = await Appointment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const appointmentsByStatus = apptStatusAgg.reduce((acc, it) => { acc[it._id] = it.count; return acc; }, {});

        // upcoming appointments in next 24 hours (limit 10)
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const upcoming = await Appointment.find({ scheduledAt: { $gte: now, $lt: tomorrow } })
            .limit(10)
            .sort({ scheduledAt: 1 })
            .populate('patientId', 'fullName phone')
            .populate('doctorId', 'fullName phone');

        // revenue: sum of amount for paid appointments
        const revenueAgg = await Appointment.aggregate([
            { $match: { 'payment.status': 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const revenueTotal = revenueAgg[0]?.total || 0;
        const paidAppointments = revenueAgg[0]?.count || 0;

        // recent signups (patients) last 7 days
        const recentPatients = await Patient.find().sort({ createdAt: -1 }).limit(6).select('fullName createdAt phone email');

        return res.json({
            success: true,
            data: {
                counts: {
                    patients: patientsCount,
                    doctors: doctorsCount,
                    pharmacies: pharmaciesCount,
                    appointments: appointmentsCount,
                },
                appointmentsByStatus,
                upcoming,
                revenue: { total: revenueTotal, paidAppointments },
                recentPatients,
            }
        });
    } catch (err) {
        console.error('[admin.getOverview] error', err.message || err);
        return res.status(500).json({ success: false, message: 'Failed to fetch overview', error: err.message });
    }
};
