import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    Calendar,
    Clock,
    User,
    Stethoscope,
    Mail,
    Phone,
    MapPin,
    FileText,
    IndianRupee,
    CheckCircle2,
    XCircle,
    AlertCircle,
    CreditCard,
    Star,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const AdminAppointmentsContent = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    "http://localhost:5000/api/appointment/admin/all"
                );
                setAppointments(data.data || []);
            } catch (err) {
                console.error("Error fetching appointments:", err);
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    // Generate date range (30 days back and 30 days forward)
    const dateRange = useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(new Date(date));
        }
        return dates;
    }, []);

    // Group appointments by date
    const appointmentsByDate = useMemo(() => {
        const grouped = {};
        appointments.forEach((apt) => {
            const aptDate = new Date(apt.scheduledAt);
            const dateKey = aptDate.toISOString().split("T")[0]; // YYYY-MM-DD
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(apt);
        });
        return grouped;
    }, [appointments]);

    // Get selected date key
    const selectedDateKey = selectedDate.toISOString().split("T")[0];
    const selectedDateAppointments = appointmentsByDate[selectedDateKey] || [];

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    // Check if date is today
    const isToday = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    // Check if date has appointments
    const hasAppointments = (date) => {
        const dateKey = date.toISOString().split("T")[0];
        return appointmentsByDate[dateKey]?.length > 0;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                bg: "bg-yellow-100 dark:bg-yellow-900/30",
                text: "text-yellow-800 dark:text-yellow-300",
                icon: AlertCircle,
            },
            confirmed: {
                bg: "bg-blue-100 dark:bg-blue-900/30",
                text: "text-blue-800 dark:text-blue-300",
                icon: CheckCircle2,
            },
            completed: {
                bg: "bg-green-100 dark:bg-green-900/30",
                text: "text-green-800 dark:text-green-300",
                icon: CheckCircle2,
            },
            cancelled: {
                bg: "bg-red-100 dark:bg-red-900/30",
                text: "text-red-800 dark:text-red-300",
                icon: XCircle,
            },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                <Icon className="w-4 h-4" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const scrollToDate = (date) => {
        const dateKey = date.toISOString().split("T")[0];
        const element = document.getElementById(`date-${dateKey}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", inline: "center" });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-primary dark:border-dark-primary mx-auto"></div>
                    <p className="mt-4 text-light-secondary-text dark:text-dark-secondary-text">
                        Loading appointments...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-light-bg dark:bg-dark-bg min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-light-primary-text dark:text-dark-primary-text">
                All Appointments
            </h1>

            {/* Date Scrollbar */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => {
                            const prevDate = new Date(selectedDate);
                            prevDate.setDate(prevDate.getDate() - 1);
                            setSelectedDate(prevDate);
                            scrollToDate(prevDate);
                        }}
                        className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-light-primary-text dark:text-dark-primary-text">
                        {formatDate(selectedDate)}
                    </h2>
                    <button
                        onClick={() => {
                            const nextDate = new Date(selectedDate);
                            nextDate.setDate(nextDate.getDate() + 1);
                            setSelectedDate(nextDate);
                            scrollToDate(nextDate);
                        }}
                        className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-light-primary/20 scrollbar-track-transparent">
                    <div className="flex gap-3 min-w-max p-2">
                        {dateRange.map((date) => {
                            const dateKey = date.toISOString().split("T")[0];
                            const isSelected = dateKey === selectedDateKey;
                            const hasApts = hasAppointments(date);
                            const isTodayDate = isToday(date);

                            return (
                                <button
                                    key={dateKey}
                                    id={`date-${dateKey}`}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-lg border-2 transition-all ${
                                        isSelected
                                            ? "border-light-primary dark:border-dark-primary bg-light-primary/10 dark:bg-dark-primary/10"
                                            : "border-light-secondary-text/20 dark:border-dark-secondary-text/20 hover:border-light-primary/50 dark:hover:border-dark-primary/50"
                                    } ${isTodayDate ? "ring-2 ring-blue-400" : ""}`}>
                                    <span
                                        className={`text-xs font-medium ${
                                            isSelected
                                                ? "text-light-primary dark:text-dark-primary"
                                                : "text-light-secondary-text dark:text-dark-secondary-text"
                                        }`}>
                                        {date.toLocaleDateString("en-US", {
                                            weekday: "short",
                                        })}
                                    </span>
                                    <span
                                        className={`text-lg font-bold mt-1 ${
                                            isSelected
                                                ? "text-light-primary dark:text-dark-primary"
                                                : "text-light-primary-text dark:text-dark-primary-text"
                                        }`}>
                                        {date.getDate()}
                                    </span>
                                    {hasApts && (
                                        <span className="mt-1 w-2 h-2 rounded-full bg-green-500"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Appointments for Selected Date */}
            <div className="space-y-6">
                {selectedDateAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-light-surface dark:bg-dark-surface rounded-xl">
                        <Calendar className="w-16 h-16 mx-auto text-light-secondary-text dark:text-dark-secondary-text mb-4" />
                        <p className="text-lg text-light-secondary-text dark:text-dark-secondary-text">
                            No appointments scheduled for this date
                        </p>
                    </div>
                ) : (
                    selectedDateAppointments.map((apt) => {
                        const aptDate = new Date(apt.scheduledAt);
                        const patient = apt.patientId;
                        const doctor = apt.doctorId;

                        return (
                            <div
                                key={apt._id}
                                className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg p-6 border border-light-primary/10 dark:border-dark-primary/10">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-light-primary/20 dark:bg-dark-primary/20 flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-light-primary dark:text-dark-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-light-secondary-text dark:text-dark-secondary-text" />
                                                <span className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                                    {aptDate.toLocaleTimeString("en-US", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getStatusBadge(apt.status)}
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                                        apt.appointmentType === "online"
                                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                                            : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
                                                    }`}>
                                                    {apt.appointmentType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                            <IndianRupee className="w-5 h-5" />
                                            <span className="text-xl">{apt.amount}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Patient Information */}
                                    <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40">
                                        <div className="flex items-center gap-2 mb-3">
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">
                                                Patient Information
                                            </h3>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                    Name:
                                                </span>
                                                <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                    {patient?.fullName || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-blue-600" />
                                                <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                    {patient?.email || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-green-600" />
                                                <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                    {patient?.phone || "N/A"}
                                                </span>
                                            </div>
                                            {patient?.dob && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-purple-600" />
                                                    <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                        DOB:{" "}
                                                        {new Date(
                                                            patient.dob
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {patient?.gender && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                        Gender:
                                                    </span>
                                                    <span className="text-light-secondary-text dark:text-dark-secondary-text capitalize">
                                                        {patient.gender}
                                                    </span>
                                                </div>
                                            )}
                                            {patient?.district && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-orange-600" />
                                                    <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                        {patient.district}
                                                        {patient?.state && `, ${patient.state}`}
                                                    </span>
                                                </div>
                                            )}
                                            {patient?.address && (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-sky-600 mt-0.5" />
                                                    <span className="text-light-secondary-text dark:text-dark-secondary-text text-xs">
                                                        {patient.address}
                                                    </span>
                                                </div>
                                            )}
                                            {patient?.emergencyContactName && (
                                                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                                    <span className="text-xs font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                        Emergency Contact:
                                                    </span>
                                                    <div className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                                                        {patient.emergencyContactName} -{" "}
                                                        {patient.emergencyContactPhone}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Doctor Information */}
                                    <div className="bg-green-50/50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-900/40">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            <h3 className="text-lg font-bold text-green-900 dark:text-green-300">
                                                Doctor Information
                                            </h3>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                    Dr. {doctor?.fullName || "N/A"}
                                                </span>
                                                {doctor?.rating?.average && (
                                                    <div className="flex items-center gap-1 ml-2">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="text-xs font-medium">
                                                            {doctor.rating.average.toFixed(1)} (
                                                            {doctor.rating.count})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {doctor?.specialty && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                        {doctor.specialty}
                                                    </span>
                                                </div>
                                            )}
                                            {doctor?.qualifications && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-light-secondary-text dark:text-dark-secondary-text text-xs">
                                                        {doctor.qualifications}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-blue-600" />
                                                <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                    {doctor?.email || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-green-600" />
                                                <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                    {doctor?.phone || "N/A"}
                                                </span>
                                            </div>
                                            {doctor?.registrationNumber && (
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-indigo-600" />
                                                    <span className="text-light-secondary-text dark:text-dark-secondary-text text-xs">
                                                        Reg: {doctor.registrationNumber}
                                                    </span>
                                                </div>
                                            )}
                                            {doctor?.affiliation && (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                                                    <span className="text-light-secondary-text dark:text-dark-secondary-text text-xs">
                                                        {doctor.affiliation}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Appointment Details */}
                                {(apt.symptoms?.length > 0 ||
                                    apt.prescription?.length > 0 ||
                                    apt.reports ||
                                    apt.payment) && (
                                    <div className="mt-4 pt-4 border-t border-light-secondary-text/10 dark:border-dark-secondary-text/10">
                                        {apt.symptoms?.length > 0 && (
                                            <div className="mb-3">
                                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                    Symptoms:
                                                </span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {apt.symptoms.map((symptom, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs">
                                                            {symptom}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {apt.payment && (
                                            <div className="mb-3 flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-emerald-600" />
                                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                    Payment:
                                                </span>
                                                <span
                                                    className={`text-sm font-medium ${
                                                        apt.payment.status === "paid"
                                                            ? "text-green-600 dark:text-green-400"
                                                            : "text-yellow-600 dark:text-yellow-400"
                                                    }`}>
                                                    {apt.payment.status.toUpperCase()}
                                                </span>
                                                {apt.payment.orderId && (
                                                    <span className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                                                        (Order: {apt.payment.orderId})
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {apt.prescription?.length > 0 && (
                                            <div>
                                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                    Prescription:
                                                </span>
                                                <div className="mt-1 space-y-1">
                                                    {apt.prescription.map((pres, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="text-xs text-light-secondary-text dark:text-dark-secondary-text bg-gray-50 dark:bg-gray-900/30 p-2 rounded">
                                                            <span className="font-medium">
                                                                {pres.medicine}
                                                            </span>
                                                            {pres.dosage && (
                                                                <span className="ml-2">
                                                                    - {pres.dosage} ({pres.frequency})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AdminAppointmentsContent;
