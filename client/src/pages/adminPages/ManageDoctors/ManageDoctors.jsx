import { useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import ManageDoctorsContent from "./ManageDoctorsContent";
import { useState } from "react";
import VerifiedDoctorsContent from "./VerifiedDoctorsContent";

export default function ManageDoctors({ tabs }) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("manage-doctor");

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
                            activeTab === "manage-doctor"
                                ? "bg-light-primary text-white dark:bg-dark-primary"
                                : "bg-transparent text-light-primary-text dark:text-dark-primary-text"
                        }`}
                        onClick={() => setActiveTab("manage-doctor")}>
                        Manage Doctors
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "verified-doctors"
                                ? "bg-light-primary text-white dark:bg-dark-primary"
                                : "bg-transparent text-light-primary-text dark:text-dark-primary-text"
                        }`}
                        onClick={() => setActiveTab("verified-doctors")}>
                        Verified Doctors
                    </button>
                </div>
                {activeTab === "manage-doctor" && <ManageDoctorsContent />}
                {activeTab === "verified-doctors" && <VerifiedDoctorsContent />}
            </div>
        </div>
    );
}
