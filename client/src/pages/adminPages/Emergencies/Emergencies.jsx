import { useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import EmergenciesContent from "./EmergenciesContent";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import VerifiedDoctorsContent from "./VerifiedDoctorsContent";

export default function Emergencies({ tabs }) {
    const location = useLocation();
    const [doctors, setDoctors] = useState([]);
    const [showDoctors, setShowDoctors] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [activeTab, setActiveTab] = useState("emergencies");
    const { getToken } = useAuth();

    const fetchDoctors = async () => {
        if (doctors.length > 0) {
            setShowDoctors(!showDoctors);
            return;
        }

        try {
            setLoadingDoctors(true);
            const token = await getToken();
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/government-doctors`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("======");
            console.log(response);
            setDoctors(response.data.data || []);
            setShowDoctors(true);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast.error("Failed to load doctors");
        } finally {
            setLoadingDoctors(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const getActiveTab = () => {
        return (
            tabs.find((tab) => tab.path === location.pathname)?.name ||
            tabs[0].name
        );
    };

    return (
        <div className="flex relative">
            <Sidebar tabs={tabs} getActiveTab={getActiveTab} />

            <div className="min-h-screen w-full bg-light-bg dark:bg-dark-surface md:py-8 md:px-5 py-5">
                <div className="mb-4 flex gap-4 border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20">
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "emergencies"
                                ? "bg-light-primary text-white dark:bg-dark-primary"
                                : "bg-transparent text-light-primary-text dark:text-dark-primary-text"
                        }`}
                        onClick={() => setActiveTab("emergencies")}>
                        Emergency Cases
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "doctors"
                                ? "bg-light-primary text-white dark:bg-dark-primary"
                                : "bg-transparent text-light-primary-text dark:text-dark-primary-text"
                        }`}
                        onClick={() => setActiveTab("doctors")}>
                        Government Doctors
                    </button>
                </div>
                {activeTab === "emergencies" && <EmergenciesContent doctors={doctors} />}
                {activeTab === "doctors" && <VerifiedDoctorsContent doctors={doctors} />}
            </div>
        </div>
    );
}
