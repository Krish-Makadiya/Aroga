import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
    Stethoscope,
    Calendar,
    IndianRupee,
    CheckCircle2,
    Clock,
    Mail,
    Phone,
    Star,
    Link as LinkIcon,
    FileText,
    User2,
    ThumbsUp,
    ThumbsDown,
    Info,
} from "lucide-react";
import AppointmentsList from "../../../components/patient/AppointmentsList";

const PatientAppointments = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const token = await getToken();
                const res = await axios.get(
                    `http://localhost:5000/api/appointment/patient/${user.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!mounted) return;
                const completed = Array.isArray(res.data?.data)
                    ? res.data.data.filter((appt) => appt.status === "confirmed")
                    : [];
                setAppointments(completed);
            } catch (err) {
                setError("Failed to load appointments");
                console.error(err?.response?.data || err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [user, getToken]);

    if (loading) {
        return <div className="p-6">Loading appointments…</div>;
    }
    if (error) {
        return (
            <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
        );
    }
    if (appointments.length === 0) {
        return (
            <div className="p-6 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                No appointments found.
            </div>
        );
    }

    console.log(appointments);

    return (
        <AppointmentsList appointments={appointments}/>
    );
};

export default PatientAppointments;
