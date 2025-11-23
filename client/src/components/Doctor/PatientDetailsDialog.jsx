import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import {
    X,
    User,
    Calendar,
    Phone,
    Mail,
    MapPin,
    FileText,
    Pill,
    AlertCircle,
    Stethoscope,
    Clock,
    CheckCircle2,
    Info,
    History,
} from "lucide-react";

const PatientDetailsDialog = ({ appointment, isOpen, onClose }) => {
    const { getToken } = useAuth();
    const [previousAppointments, setPreviousAppointments] = useState([]);
    const [loadingPrevious, setLoadingPrevious] = useState(false);

    useEffect(() => {
        if (isOpen && appointment?.patientId?.clerkUserId) {
            fetchPreviousAppointments();
        } else {
            setPreviousAppointments([]);
        }
    }, [isOpen, appointment]);

    const fetchPreviousAppointments = async () => {
        if (!appointment?.patientId?.clerkUserId) {
            setPreviousAppointments([]);
            return;
        }

        try {
            setLoadingPrevious(true);
            const token = await getToken();
            const API_BASE_URL =
                import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            const res = await axios.get(
                `${API_BASE_URL}/api/appointment/patient/${appointment.patientId.clerkUserId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Filter out current appointment and sort by date
            const previous = (res.data?.data || [])
                .filter((apt) => apt._id !== appointment._id)
                .sort(
                    (a, b) =>
                        new Date(b.scheduledAt) - new Date(a.scheduledAt)
                );
            setPreviousAppointments(previous);
        } catch (err) {
            console.error("Error fetching previous appointments:", err);
            setPreviousAppointments([]);
        } finally {
            setLoadingPrevious(false);
        }
    };

    if (!isOpen || !appointment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                style={{ scrollbarWidth: "none" }}
                className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-light-surface dark:bg-dark-bg p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-light-secondary-text dark:text-dark-secondary-text">
                            Appointment Details
                        </p>
                        <h3 className="text-2xl font-semibold text-light-primary-text dark:text-dark-primary-text mt-1">
                            {appointment.patientId?.fullName || "Unknown Patient"}
                        </h3>
                        <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text mt-1">
                            Appointment ID: {appointment._id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition">
                        <X className="h-5 w-5 text-light-secondary-text dark:text-dark-secondary-text" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Patient Personal Information */}
                    <section className="bg-light-bg dark:bg-dark-surface rounded-xl p-5 border border-light-secondary-text/10 dark:border-dark-secondary-text/10">
                        <h4 className="text-lg font-semibold text-light-primary-text dark:text-dark-primary-text mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Patient Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                    Full Name
                                </p>
                                <p className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                    {appointment.patientId?.fullName || "N/A"}
                                </p>
                            </div>
                            {appointment.patientId?.dob && (
                                <div>
                                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                        Date of Birth
                                    </p>
                                    <p className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                        {new Date(
                                            appointment.patientId.dob
                                        ).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            )}
                            {appointment.patientId?.gender && (
                                <div>
                                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                        Gender
                                    </p>
                                    <p className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text capitalize">
                                        {appointment.patientId.gender}
                                    </p>
                                </div>
                            )}
                            {appointment.patientId?.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                            Phone
                                        </p>
                                        <p className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                            {appointment.patientId.phone}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {appointment.patientId?.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                            Email
                                        </p>
                                        <p className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                            {appointment.patientId.email}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {appointment.patientId?.emergencyContactName && (
                                <div>
                                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                        Emergency Contact
                                    </p>
                                    <p className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                        {
                                            appointment.patientId
                                                .emergencyContactName
                                        }
                                        {appointment.patientId
                                            .emergencyContactPhone &&
                                            ` - ${appointment.patientId.emergencyContactPhone}`}
                                    </p>
                                </div>
                            )}
                            {appointment.patientId?.medicalHistory && (
                                <div className="md:col-span-2">
                                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                        Medical History
                                    </p>
                                    <p className="text-sm text-light-primary-text dark:text-dark-primary-text bg-light-bg dark:bg-dark-bg p-3 rounded-lg border border-light-secondary-text/10 dark:border-dark-secondary-text/10">
                                        {appointment.patientId.medicalHistory}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Appointment Medical Information */}
                    <section className="bg-light-bg dark:bg-dark-surface rounded-xl p-5 border border-light-secondary-text/10 dark:border-dark-secondary-text/10">
                        <h4 className="text-lg font-semibold text-light-primary-text dark:text-dark-primary-text mb-4 flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-green-500" />
                            Current Appointment Details
                        </h4>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                                            Scheduled Date & Time
                                        </p>
                                        <p className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                            {new Date(
                                                appointment.scheduledAt
                                            ).toLocaleDateString("en-IN", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <p className="text-sm text-light-primary-text dark:text-dark-primary-text">
                                            {new Date(
                                                appointment.scheduledAt
                                            ).toLocaleTimeString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                        Appointment Type
                                    </p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                                        {appointment.appointmentType || "offline"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                        Status
                                    </p>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            appointment.status === "confirmed"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                : appointment.status ===
                                                  "pending"
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                : appointment.status ===
                                                  "completed"
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                        }`}>
                                        {appointment.status}
                                    </span>
                                </div>
                                {appointment.payment && (
                                    <div>
                                        <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                            Payment Status
                                        </p>
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                appointment.payment.status ===
                                                "paid"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                            }`}>
                                            {appointment.payment.status ===
                                            "paid" ? (
                                                <CheckCircle2 className="w-3 h-3" />
                                            ) : (
                                                <Clock className="w-3 h-3" />
                                            )}
                                            {appointment.payment.status}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {appointment.symptoms &&
                                appointment.symptoms.length > 0 && (
                                    <div>
                                        <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-orange-500" />
                                            Symptoms
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {appointment.symptoms.map(
                                                (symptom, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-xs font-medium">
                                                        {symptom}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {appointment.prescription &&
                                appointment.prescription.length > 0 && (
                                    <div>
                                        <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-2 flex items-center gap-2">
                                            <Pill className="w-4 h-4 text-purple-500" />
                                            Prescription
                                        </p>
                                        <div className="space-y-2">
                                            {appointment.prescription.map(
                                                (med, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-light-surface dark:bg-dark-bg p-3 rounded-lg border border-light-secondary-text/10 dark:border-dark-secondary-text/10">
                                                        <p className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                                            {med.medicine}
                                                        </p>
                                                        {med.dosage && (
                                                            <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                                                                Dosage:{" "}
                                                                {med.dosage}
                                                            </p>
                                                        )}
                                                        {med.frequency && (
                                                            <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                                                                Frequency:{" "}
                                                                {med.frequency}
                                                            </p>
                                                        )}
                                                        {med.notes && (
                                                            <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mt-1">
                                                                Notes:{" "}
                                                                {med.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {appointment.reports && (
                                <div>
                                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-red-500" />
                                        Reports
                                    </p>
                                    <div className="bg-light-surface dark:bg-dark-bg p-3 rounded-lg border border-light-secondary-text/10 dark:border-dark-secondary-text/10">
                                        <p className="text-sm text-light-primary-text dark:text-dark-primary-text whitespace-pre-wrap">
                                            {appointment.reports}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {appointment.aiSummary && (
                                <div>
                                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-blue-500" />
                                        AI Summary
                                    </p>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-light-primary-text dark:text-dark-primary-text whitespace-pre-wrap">
                                            {appointment.aiSummary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {appointment.meetingLink && (
                                <div>
                                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-2">
                                        Meeting Link
                                    </p>
                                    <a
                                        href={appointment.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 dark:text-blue-400 underline break-all">
                                        {appointment.meetingLink}
                                    </a>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Previous Appointments/Reports */}
                    {loadingPrevious ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                Loading previous appointments...
                            </p>
                        </div>
                    ) : previousAppointments.length > 0 ? (
                        <section className="bg-light-bg dark:bg-dark-surface rounded-xl p-5 border border-light-secondary-text/10 dark:border-dark-secondary-text/10">
                            <h4 className="text-lg font-semibold text-light-primary-text dark:text-dark-primary-text mb-4 flex items-center gap-2">
                                <History className="w-5 h-5 text-purple-500" />
                                Previous Appointments ({previousAppointments.length})
                            </h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {previousAppointments.map((prevAppt) => (
                                    <div
                                        key={prevAppt._id}
                                        className="bg-light-surface dark:bg-dark-bg p-3 rounded-lg border border-light-secondary-text/10 dark:border-dark-secondary-text/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                                {new Date(
                                                    prevAppt.scheduledAt
                                                ).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    prevAppt.status ===
                                                    "completed"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                        : prevAppt.status ===
                                                          "cancelled"
                                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                                }`}>
                                                {prevAppt.status}
                                            </span>
                                        </div>
                                        {prevAppt.symptoms &&
                                            prevAppt.symptoms.length > 0 && (
                                                <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                                    Symptoms:{" "}
                                                    {prevAppt.symptoms.join(
                                                        ", "
                                                    )}
                                                </p>
                                            )}
                                        {prevAppt.reports && (
                                            <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text line-clamp-2">
                                                Reports:{" "}
                                                {prevAppt.reports.substring(
                                                    0,
                                                    100
                                                )}
                                                {prevAppt.reports.length > 100 &&
                                                    "..."}
                                            </p>
                                        )}
                                        {prevAppt.doctorId?.fullName && (
                                            <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mt-1">
                                                Doctor: Dr.{" "}
                                                {prevAppt.doctorId.fullName}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-light-secondary-text/10 dark:border-dark-secondary-text/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailsDialog;

