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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <div className="flex relative">
            <Sidebar tabs={tabs} getActiveTab={() => activeTab} />
            <div className="min-h-screen w-full bg-light-bg dark:bg-dark-surface md:py-8 md:px-5 py-5">
                <div className="mb-4 flex gap-4 border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20">
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "new-appointments"
                                ? "bg-light-primary text-white dark:bg-dark-primary"
                                : "bg-transparent text-light-primary-text dark:text-dark-primary-text"
                        }`}
                        onClick={() => setActiveTab("new-appointments")}
                    >
                        New Appointments
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "upcoming-appointments"
                                ? "bg-light-primary text-white dark:bg-dark-primary"
                                : "bg-transparent text-light-primary-text dark:text-dark-primary-text"
                        }`}
                        onClick={() => setActiveTab("upcoming-appointments")}
                    >
                        Upcoming Appointments
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "completed-appointments"
                                ? "bg-light-primary text-white dark:bg-dark-primary"
                                : "bg-transparent text-light-primary-text dark:text-dark-primary-text"
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
                        {activeTab === "new-appointments" && <NewAppointments />}
                        {activeTab === "upcoming-appointments" && <UpcomingAppointments />}
                        {activeTab === "completed-appointments" && <CompletedAppointments />}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
