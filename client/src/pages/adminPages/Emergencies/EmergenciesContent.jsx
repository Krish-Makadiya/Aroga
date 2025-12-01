import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import {
    AlertTriangle,
    User,
    Phone,
    MapPin,
    Clock,
    Calendar,
    Stethoscope,
    Video,
    CheckCircle2,
    XCircle,
    Loader2,
    Users,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

const EmergenciesContent = ({ doctors = [] }) => {
    const [emergencies, setEmergencies] = useState([]);
    const [emergencyAppointments, setEmergencyAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const { getToken } = useAuth();

    // Fetch all emergencies and emergency appointments
    useEffect(() => {
        fetchEmergencies();
    }, []);

    const fetchEmergencies = async () => {
        try {
            setLoading(true);
            const token = await getToken();

            // Fetch emergency records
            const emergenciesRes = await axios.get(
                "http://localhost:5000/api/emergency",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Fetch all appointments and filter for emergency ones
            const appointmentsRes = await axios.get(
                "http://localhost:5000/api/appointment/admin/all",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const allAppointments = appointmentsRes.data?.data || [];
            const emergencyApts = allAppointments.filter(
                (apt) => apt.emergency === true
            );

            setEmergencies(emergenciesRes.data?.data || []);
            setEmergencyAppointments(emergencyApts);
        } catch (error) {
            console.error("Error fetching emergencies:", error);
            toast.error("Failed to load emergency records");
        } finally {
            setLoading(false);
        }
    };

    // Handle booking emergency appointment
    const handleBookAppointment = async () => {
        if (!selectedDoctor) {
            toast.error("Please select all required fields");
            return;
        }

        try {
            console.log("Selected Doctor:", selectedDoctor);
            console.log("Selected Emergency (Patient):", selectedEmergency);
            const token = await getToken();

            const currentTimeMillis = Date.now();
            const currentTimeString = currentTimeMillis.toString();
            console.log(currentTimeString);

            const link =
                window.location.protocol +
                "//" +
                window.location.host +
                "/emergency-appointment" +
                "?roomID=" +
                selectedDoctor._id.toString() +
                currentTimeString;

            const appointmentData = {
                selectedDoctor,
                selectedEmergency,
                link,
            };

            const response = await axios.post(
                "http://localhost:5000/api/emergency/send-sms",
                appointmentData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                toast.success(
                    "SMS sent successfully! Emergency contact removed."
                );
                setBookingModalOpen(false);
                setSelectedEmergency(null);
                setSelectedDoctor(null);
                setSelectedSlot("");
                setSelectedDate("");

                // Remove the emergency from the UI immediately
                setEmergencies((prev) =>
                    prev.filter((e) => e._id !== selectedEmergency._id)
                );

                // Also refresh the list to ensure consistency
                fetchEmergencies();
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            toast.error(
                error.response?.data?.message ||
                    "Failed to book emergency appointment"
            );
        }
    };

    // Format date for input
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Get next 7 days
    const getNext7Days = () => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            dates.push(`${year}-${month}-${day}`);
        }
        return dates;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Only show emergencies that are not completed
    const activeEmergencyRecords = emergencies.filter((e) => !e.isCompleted);

    const allEmergencies = [
        ...activeEmergencyRecords.map((e) => ({
            ...e,
            type: "emergency_record",
        })),
        ...emergencyAppointments.map((apt) => ({
            ...apt,
            type: "emergency_appointment",
            fullName:
                apt.patientId?.fullName ||
                apt.emergencyDetails?.fullName ||
                "Unknown",
            phone: apt.patientId?.phone || apt.emergencyDetails?.phone || "N/A",
            location:
                apt.emergencyDetails?.location ||
                apt.patientId?.location ||
                null,
        })),
    ];

    return (
        <div className="p-6 bg-light-bg dark:bg-dark-bg min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Emergency Cases
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage emergency appointments and requests
                </p>
            </div>

            {/* Emergency Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allEmergencies.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            No emergency cases found
                        </p>
                    </div>
                ) : (
                    allEmergencies.map((emergency, index) => (
                        <div
                            key={emergency._id || index}
                            className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 border-l-4 border-red-500">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                        {emergency.type === "emergency_record"
                                            ? "EMERGENCY REQUEST"
                                            : "EMERGENCY APPOINTMENT"}
                                    </span>
                                </div>

                                {/* Status badge based on type */}
                                {emergency.type === "emergency_appointment" &&
                                    emergency.status && (
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${
                                                emergency.status === "completed"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                    : emergency.status ===
                                                      "active"
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                            }`}>
                                            {emergency.status.toUpperCase()}
                                        </span>
                                    )}
                                {emergency.type === "emergency_record" && (
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${
                                            emergency.isCompleted
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                : emergency.isActive
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                        }`}>
                                        {emergency.isCompleted
                                            ? "COMPLETED"
                                            : emergency.isActive
                                            ? "ACTIVE"
                                            : "PENDING"}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-semibold">
                                        {emergency.fullName}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Phone className="w-4 h-4" />
                                    <span>{emergency.phone}</span>
                                </div>

                                {emergency.location && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-xs">
                                            {emergency.location.latitude.toFixed(
                                                4
                                            )}
                                            ,{" "}
                                            {emergency.location.longitude.toFixed(
                                                4
                                            )}
                                        </span>
                                    </div>
                                )}

                                {emergency.scheduledAt && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs">
                                            {new Date(
                                                emergency.scheduledAt
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                {emergency.videoCallLink && (
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Video className="w-4 h-4" />
                                        <a
                                            href={emergency.videoCallLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs underline">
                                            Video Call Link
                                        </a>
                                    </div>
                                )}

                                {emergency.doctorId &&
                                    typeof emergency.doctorId === "object" && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Stethoscope className="w-4 h-4" />
                                            <span className="text-xs">
                                                Dr.{" "}
                                                {emergency.doctorId.fullName}
                                            </span>
                                        </div>
                                    )}
                            </div>

                            {emergency.type === "emergency_record" &&
                                !emergency.doctorId && (
                                    <button
                                        onClick={() => {
                                            setSelectedEmergency(emergency);
                                            setBookingModalOpen(true);
                                            setSelectedDate(getTodayDate());
                                        }}
                                        className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm">
                                        Book Appointment
                                    </button>
                                )}
                        </div>
                    ))
                )}
            </div>

            {/* Booking Modal */}
            {bookingModalOpen && selectedEmergency && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                Book Emergency Appointment
                            </h2>
                            <button
                                onClick={() => {
                                    setBookingModalOpen(false);
                                    setSelectedEmergency(null);
                                    setSelectedDoctor(null);
                                    setSelectedSlot("");
                                    setSelectedDate("");
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Patient Information
                                </label>
                                <div className="bg-gray-50 dark:bg-dark-bg p-3 rounded">
                                    <p className="font-semibold">
                                        {selectedEmergency.fullName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedEmergency.phone}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Doctor{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedDoctor || ""}
                                    onChange={(e) => {
                                        const doctorId = e.target.value;
                                        const chosenDoctor =
                                            doctors && doctors.length > 0
                                                ? doctors.find(
                                                      (doc) =>
                                                          doc._id === doctorId
                                                  )
                                                : null;
                                        setSelectedDoctor(chosenDoctor);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-bg dark:text-white">
                                    <option value="">Choose a doctor</option>
                                    {doctors && doctors.length > 0 ? (
                                        doctors.map((doctor) => (
                                            <option
                                                key={doctor._id}
                                                value={doctor._id}>
                                                {doctor.fullName} -{" "}
                                                {doctor.specialty}{" "}
                                                {doctor.consultationFee
                                                    ? `(₹${doctor.consultationFee})`
                                                    : ""}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>
                                            No doctors available
                                        </option>
                                    )}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setBookingModalOpen(false);
                                        setSelectedEmergency(null);
                                        setSelectedDoctor(null);
                                        setSelectedSlot("");
                                        setSelectedDate("");
                                    }}
                                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg transition">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBookAppointment}
                                    disabled={!selectedDoctor}
                                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition">
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergenciesContent;
