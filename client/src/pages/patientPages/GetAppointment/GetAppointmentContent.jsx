// client/src/pages/patientPages/GetAppointment/GetAppointmentContent.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
    Stethoscope,
    Star,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    Clock,
    CheckCircle2,
    Calendar,
    User2,
    IndianRupee,
} from "lucide-react";
import { toast } from "react-hot-toast";

const GetAppointmentContent = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getToken } = useAuth();
    const { user } = useUser();
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        if (!user) return;
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const token = await getToken();
                const res = await axios.get(
                    "http://localhost:5000/api/doctor/verified-doctors",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!mounted) return;
                setDoctors(res.data?.data || []);
            } catch (err) {
                setError("Failed to load doctors");
                console.error(err?.response?.data || err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [user, getToken]);

    const validateAppointmentDate = (inputValue) => {
        if (!inputValue)
            return { ok: false, msg: "Please select a date and time." };

        const d = new Date(inputValue);
        if (isNaN(d.getTime()))
            return { ok: false, msg: "Invalid date/time selected." };

        const now = new Date();
        const oneHourMs = 60 * 60 * 1000;

        if (d.getTime() < now.getTime()) {
            return { ok: false, msg: "Selected time is in the past." };
        }
        if (d.getTime() < now.getTime() + oneHourMs) {
            return {
                ok: false,
                msg: "Please choose a time at least 1 hour from now.",
            };
        }

        const mins = d.getMinutes();
        if (!(mins === 0 || mins === 15 || mins === 30 || mins === 45)) {
            return {
                ok: false,
                msg: "Please select a 30-minute slot (:00, :15, :30, or :45).",
            };
        }
        return { ok: true, date: d };
    };

    const handleBook = (doctor) => {
        const v = validateAppointmentDate(selectedDate);
        if (!v.ok) {
            toast.error(v.msg);
            return;
        }

        // proceed
        console.log("Book appointment:", {
            doctorId: doctor._id,
            doctorName: doctor.fullName,
            scheduledAt: selectedDate, // keep local string for backend or convert as needed
            price: doctor.consultationFee ?? 0,
        });
        toast.success("Slot looks good. Proceeding to book…");
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl dark:bg-dark-bg bg-light-surface p-6 h-44"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-light-background)] to-[var(--color-light-background-secondary)] dark:from-[var(--color-dark-background)] dark:to-[var(--color-dark-background-secondary)]">
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                        Find a Verified Doctor
                    </h1>
                    <p className="text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                        All doctors listed below are identity-verified and
                        available for appointments.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doc) => (
                        <div
                            key={doc._id}
                            className="rounded-2xl dark:bg-dark-bg bg-light-surface p-5 shadow-md hover:shadow-xl transition-all duration-200 border border-transparent hover:border-[var(--color-light-primary)]/20 dark:hover:border-[var(--color-dark-primary)]/20">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-light-primary)]/10 dark:bg-[var(--color-dark-primary)]/10 flex items-center justify-center">
                                        <Stethoscope className="w-6 h-6 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                                Dr. {doc.fullName}
                                            </h3>
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                                <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                                Verified
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] capitalize">
                                            {doc.specialty ||
                                                "General Practice"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                        <Star className="w-6 h-6 text-yellow-500" />
                                        <span className="text-md text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                            {(doc.rating?.average ?? 0).toFixed(
                                                1
                                            )}
                                        </span>
                                        <span className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                            ({doc.rating?.count ?? 0})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {doc.languages?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {doc.languages.map((lang, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 text-xs rounded-full bg-[var(--color-light-primary)]/10 dark:bg-[var(--color-dark-primary)]/10 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="datetime-local"
                                        step="1800" // 30 minutes
                                        value={
                                            selectedDoctor?._id === doc._id
                                                ? selectedDate
                                                : ""
                                        }
                                        onChange={(e) =>
                                            setSelectedDate(e.target.value)
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                                    />
                                </div>
                                <div className="flex items-center justify-end mt-1">
                                    <IndianRupee className="w-5 h-5  text-emerald-600" />
                                    <span className="text-xl text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {doc.consultationFee ?? 0}
                                    </span>
                                    <span className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                        / consultation
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 flex justify-end gap-2">
                                <button
                                    onClick={() => handleBook(doc)}
                                    className="px-4 py-2 rounded-lg bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:bg-[var(--color-light-primary-dark)] dark:hover:bg-[var(--color-dark-primary-dark)] transition-colors">
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {doctors.length === 0 && (
                    <div className="mt-8 text-center text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                        No verified doctors available yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GetAppointmentContent;
