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
    X,
    Plus,
} from "lucide-react";
import { toast } from "react-hot-toast";

const COMMON_SYMPTOMS = [
    "Fever",
    "Cough",
    "Headache",
    "Stomach Pain",
    "Cold/Flu",
    "Back Pain",
    "Fatigue",
    "Chest Pain",
    "Shortness of Breath",
    "Skin Rash",
    "Joint Pain",
    "Sore Throat",
    "Nausea",
    "Dizziness",
];

const GetAppointmentContent = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getToken } = useAuth();
    const { user } = useUser();
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [appointmentForm, setAppointmentForm] = useState({
        date: "",
        time: "",
        appointmentType: "offline",
        symptomInput: "",
        symptoms: [],
        reports: "",
    });

    const API_BASE_URL =
        import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

    useEffect(() => {
        if (!user) return;
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const token = await getToken();
                const res = await axios.get(
                    `${API_BASE_URL}/api/doctor/verified-doctors`,
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

    const validateAppointmentDate = (date, time) => {
        if (!date || !time)
            return { ok: false, msg: "Please select both date and time." };
        const inputValue = `${date}T${time}`;
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
        return { ok: true, date: d, inputValue };
    };

    const handleBook = async () => {
        if (!selectedDoctor) {
            toast.error("Please select a doctor before booking.");
            return;
        }

        const v = validateAppointmentDate(
            appointmentForm.date,
            appointmentForm.time
        );
        if (!v.ok) {
            toast.error(v.msg);
            return;
        }
        
        try {
            const summary = await axios.get(
                `${API_BASE_URL}/api/ai/generate-questions`,
                {
                    params: { prompt: `Give me a short summary of the following symptoms: ${appointmentForm.symptoms.join(", ")} in 80 words` },
                }
            );
            const aiSummary = summary.data.content;

            const payload = {
                doctorId: selectedDoctor._id,
                patientId: user.id,
                scheduledAt: v.inputValue,
                amount: selectedDoctor.consultationFee ?? 0,
                appointmentType: appointmentForm.appointmentType,
                symptoms: appointmentForm.symptoms,
                reports: appointmentForm.reports.trim(),
                aiSummary: aiSummary,
            };

            const token = await getToken();
            const res = await axios.post(
                `${API_BASE_URL}/api/appointment/create-appointment`,
                payload,
                token
                    ? {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                    : undefined
            );

            console.log("Book appointment:", res.data);
            toast.success("Appointment booked successfully!");
            closeBookingModal();
        } catch (e) {
            console.log(e);
            toast.error(
                e.response?.data?.message || "Failed to create appointment."
            );
        }
    };

    const openBookingModal = (doctor) => {
        setSelectedDoctor(doctor);
        setBookingModalOpen(true);
    };

    const closeBookingModal = () => {
        setBookingModalOpen(false);
        setSelectedDoctor(null);
        setAppointmentForm({
            date: "",
            time: "",
            appointmentType: "offline",
            symptomInput: "",
            symptoms: [],
            reports: "",
        });
    };

    const handleAppointmentFormChange = (field, value) => {
        setAppointmentForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddSymptom = () => {
        const value = appointmentForm.symptomInput.trim();
        if (!value) return;
        setAppointmentForm((prev) => ({
            ...prev,
            symptoms: prev.symptoms.includes(value)
                ? prev.symptoms
                : [...prev.symptoms, value],
            symptomInput: "",
        }));
    };

    const handleSymptomKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleAddSymptom();
        }
    };

    const removeSymptom = (symptom) => {
        setAppointmentForm((prev) => ({
            ...prev,
            symptoms: prev.symptoms.filter((item) => item !== symptom),
        }));
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

                            <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center justify-end mt-1">
                                    <IndianRupee className="w-5 h-5  text-emerald-600" />
                                    <span className="text-xl text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {doc.consultationFee ?? 0}
                                    </span>
                                    <span className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                        / consultation
                                    </span>
                                </div>

                            <div className="mt-3 flex justify-end gap-2">
                                <button
                                    onClick={() => openBookingModal(doc)}
                                    className="px-4 py-2 rounded-lg bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:bg-[var(--color-light-primary-dark)] dark:hover:bg-[var(--color-dark-primary-dark)] transition-colors">
                                    Book Appointment
                                </button>
                            </div>
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

            {bookingModalOpen && selectedDoctor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div style={{scrollbarWidth: "none"}} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-bg)] p-6 shadow-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                    Booking with
                                </p>
                                <h3 className="text-2xl font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Dr. {selectedDoctor.fullName}
                                </h3>
                                <p className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                    {selectedDoctor.specialty || "General Practice"}
                                </p>
                            </div>
                            <button
                                onClick={closeBookingModal}
                                className="rounded-full p-2 hover:bg-[var(--color-light-primary)]/10 dark:hover:bg-[var(--color-dark-primary)]/10 transition">
                                <X className="h-5 w-5 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        Appointment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={appointmentForm.date}
                                        onChange={(e) =>
                                            handleAppointmentFormChange("date", e.target.value)
                                        }
                                        className="mt-2 w-full rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] px-3 py-2 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        Appointment Time
                                    </label>
                                    <input
                                        type="time"
                                        step="900"
                                        value={appointmentForm.time}
                                        onChange={(e) =>
                                            handleAppointmentFormChange("time", e.target.value)
                                        }
                                        className="mt-2 w-full rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] px-3 py-2 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Appointment Type
                                </label>
                                <div className="mt-3 flex gap-3">
                                    {["online", "offline"].map((type) => {
                                        const selected =
                                            appointmentForm.appointmentType === type;
                                        return (
                                            <button
                                                key={type}
                                                onClick={() =>
                                                    handleAppointmentFormChange(
                                                        "appointmentType",
                                                        type
                                                    )
                                                }
                                                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                                                    selected
                                                        ? "border-transparent bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                                                        : "border-[var(--color-light-secondary-text)]/30 dark:border-[var(--color-dark-secondary-text)]/30 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                                                }`}>
                                                {type}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Symptoms
                                </label>
                                <p className="mt-1 text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                    Select common symptoms or add your own.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {COMMON_SYMPTOMS.map((symptom) => {
                                        const active = appointmentForm.symptoms.includes(
                                            symptom
                                        );
                                        return (
                                            <button
                                                type="button"
                                                key={symptom}
                                                onClick={() =>
                                                    active
                                                        ? removeSymptom(symptom)
                                                        : setAppointmentForm((prev) => ({
                                                              ...prev,
                                                              symptoms: [...prev.symptoms, symptom],
                                                          }))
                                                }
                                                className={`rounded-full px-3 py-1 text-sm capitalize transition ${
                                                    active
                                                        ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                                                        : "bg-[var(--color-light-primary)]/10 text-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)]/10 dark:text-[var(--color-dark-primary)]"
                                                }`}>
                                                {symptom}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. fever, headache"
                                        value={appointmentForm.symptomInput}
                                        onChange={(e) =>
                                            handleAppointmentFormChange(
                                                "symptomInput",
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={handleSymptomKeyDown}
                                        className="flex-1 rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] px-3 py-2 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                                    />
                                    <button
                                        onClick={handleAddSymptom}
                                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-light-primary)] px-4 py-2 text-white hover:bg-[var(--color-light-primary-dark)] dark:bg-[var(--color-dark-primary)] dark:hover:bg-[var(--color-dark-primary-dark)]">
                                        <Plus className="h-4 w-4" />
                                        Add
                                    </button>
                                </div>
                                {appointmentForm.symptoms.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {appointmentForm.symptoms.map((symptom) => (
                                            <span
                                                key={symptom}
                                                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-light-primary)]/10 px-3 py-1 text-sm text-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)]/20 dark:text-[var(--color-dark-primary)]">
                                                {symptom}
                                                <button
                                                    onClick={() => removeSymptom(symptom)}
                                                    className="rounded-full p-1 hover:bg-[var(--color-light-primary)]/20 dark:hover:bg-[var(--color-dark-primary)]/20">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Reports / Previous Diagnosis (Optional)
                                </label>
                                <textarea
                                    rows={4}
                                    value={appointmentForm.reports}
                                    onChange={(e) =>
                                        handleAppointmentFormChange("reports", e.target.value)
                                    }
                                    className="mt-2 w-full rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] px-3 py-2 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                                    placeholder="Share any important medical history, lab results, or recent observations."
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                Consultation Fee:{" "}
                                <span className="font-semibold ml-2 text-2xl text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    ₹{selectedDoctor.consultationFee ?? 0}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={closeBookingModal}
                                    className="rounded-lg border border-[var(--color-light-secondary-text)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-light-secondary-text)] hover:bg-[var(--color-light-secondary-text)]/10 dark:border-[var(--color-dark-secondary-text)]/30 dark:text-[var(--color-dark-secondary-text)] dark:hover:bg-[var(--color-dark-secondary-text)]/10">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBook}
                                    className="rounded-lg bg-[var(--color-light-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-light-primary-dark)] dark:bg-[var(--color-dark-primary)] dark:hover:bg-[var(--color-dark-primary-dark)]">
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GetAppointmentContent;
