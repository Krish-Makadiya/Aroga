import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import DoctorDashboardContent from "./DoctorDashboardContent";

const DoctorDashboard = ({tabs}) => {
    const location = useLocation();

    const getActiveTab = () => {
        return (
            tabs.find((tab) => tab.path === location.pathname)?.name ||
            tabs[0].name
        );
    };

    return (
        <div className="flex relative">
            <Sidebar tabs={tabs} getActiveTab={getActiveTab} />

            <div className="min-h-screen w-full bg-light-bg dark:bg-dark-surface md:py-10 md:px-5 py-5">
                <DoctorDashboardContent/>
            </div>
        </div>
    );
};

export default DoctorDashboard;