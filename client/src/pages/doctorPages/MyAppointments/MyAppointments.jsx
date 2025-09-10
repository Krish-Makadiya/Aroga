import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import Sidebar from "../../../components/Sidebar";
import NewAppointments from "./NewAppointments";
import UpcomingAppointments from "./UpcomingAppointments";
import CompletedAppointments from "./CompletedAppointments";

const MyAppointments = ({ tabs }) => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("upcoming-appointments");
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
                    `http://localhost:5000/api/appointment/doctor/${user.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!mounted) return;
                setAppointments(res.data?.data || []);
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

    // Filtering logic
    const pendingAppointments = appointments.filter(
        (appt) => appt.status === "pending"
    );
    console.log(pendingAppointments);
    const upcomingAppointments = appointments.filter(
        (appt) => appt.status === "confirmed"
    );
    console.log(upcomingAppointments);
    const completedAppointments = appointments.filter(
        (appt) => appt.status === "completed" || appt.status === "cancelled"
    );
    console.log(completedAppointments);

    return (
        <div className="flex relative">
            <Sidebar tabs={tabs} getActiveTab={() => activeTab} />
            <div className="min-h-screen w-full bg-light-bg dark:bg-dark-surface md:py-8 md:px-5 py-5">
                <div className="mb-4 flex gap-4 border-b border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20">
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "new-appointments"
                                ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                                : "bg-transparent text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                        }`}
                        onClick={() => setActiveTab("new-appointments")}
                    >
                        New Appointments
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "upcoming-appointments"
                                ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                                : "bg-transparent text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                        }`}
                        onClick={() => setActiveTab("upcoming-appointments")}
                    >
                        Upcoming Appointments
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "completed-appointments"
                                ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                                : "bg-transparent text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                        }`}
                        onClick={() => setActiveTab("completed-appointments")}
                    >
                        Completed Appointments
                    </button>
                </div>
                {loading ? (
                    <div className="p-6">Loading appointments…</div>
                ) : error ? (
                    <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
                ) : (
                    <>
                        {activeTab === "new-appointments" && <NewAppointments appointments={pendingAppointments} />}
                        {activeTab === "upcoming-appointments" && <UpcomingAppointments appointments={upcomingAppointments} />}
                        {activeTab === "completed-appointments" && <CompletedAppointments appointments={completedAppointments} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
