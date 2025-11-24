import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
    Activity,
    AlertCircle,
    Bell,
    Calendar as CalendarIcon,
    CheckCircle,
    ChevronRight,
    FileText as FileTextIcon,
    Heart,
    Pill,
    Plus,
    Settings,
    Stethoscope,
    TrendingUp,
    User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Calendar from "../../../components/Dashboard/Calendar";
import Loader from "../../../components/main/Loader";
import { useNavigate } from "react-router-dom";

const PatientDashboardContent = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { user } = useUser();
    const { getToken } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, [user, getToken]);

    const fetchUserData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const token = await getToken();
            const response = await axios.get(
                `http://localhost:5000/api/patient/get-patient/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUserData(response.data);
            console.log("Fetched user data:", response.data);
        } catch (error) {
            console.error(
                "Error fetching user data:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const calculateAge = (dob) => {
        if (!dob) return "";
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-light-background to-light-background-secondary dark:from-dark-background dark:to-dark-background-secondary">
            <div className="max-w-8xl mx-auto md:px-0 px-3">
                {/* Enhanced Header with Gradient */}
                <div className="relative mb-4 overflow-hidden rounded-3xl dark:bg-dark-bg bg-light-surface md:p-8 p-4 text-light-primary-text dark:text-dark-primary-text">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex md:flex-row flex-col items-center space-x-6 mb-6 lg:mb-0">
                            <div className="relative">
                                <img
                                    src={user.imageUrl}
                                    alt="Profile"
                                    className="md:w-30 md:h-30 h-20 w-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
                                />
                                <div className="absolute -bottom-0 -right-0 w-8 h-8 bg-dark-surface rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="">
                                <div className="flex flex-col">
                                    <h1 className="md:text-4xl text-xl font-bold">
                                        {getGreeting()}, {user.firstName}{" "}
                                        {user.lastName}!
                                    </h1>
                                    <p className="text-light-secondary-text md:text-lg text-sm">
                                        Here's your health overview today
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4 mt-4">
                                    <span className="md:text-sm text-xs">
                                        {formatDate(currentTime)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-light-bg dark:bg-dark-surface backdrop-blur-sm rounded-2xl p-4 text-center">
                                <Activity className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">
                                    Health Score
                                </p>
                                <p className="md:text-2xl text-xl font-bold">
                                    95%
                                </p>
                            </div>
                            <div className="bg-light-bg dark:bg-dark-surface backdrop-blur-sm rounded-2xl p-4 text-center">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">
                                    Active Days
                                </p>
                                <p className="md:text-2xl text-xl font-bold">
                                    7
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
                    {/* Personal Information Card */}
                    <div className="lg:col-span-2 dark:bg-dark-bg bg-light-surface rounded-2xl md:p-6 p-4 py-6 shadow-md hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between md:mb-6 mb-3">
                            <h2 className="md:text-2xl text-xl font-bold flex items-center">
                                <User className="w-6 h-6 md:mr-3 mr-1 text-light-primary dark:text-dark-primary" />
                                <p className="text-light-primary-text dark:text-dark-primary-text">
                                    Personal Information
                                </p>
                            </h2>
                            {/* <button className="p-2 rounded-lg bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary hover:bg-light-primary/20 dark:hover:bg-dark-primary/20 transition-colors">
                                <Edit3 className="w-4 h-4" />
                            </button> */}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-2">
                            <div className="flex items-center md:p-3 px-3 gap-1 rounded-xl">
                                <span className="md:text-sm text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Full Name:
                                </span>
                                <span className="md:text-sm text-xs font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {userData.fullName}
                                </span>
                            </div>
                            <div className="flex items-center  md:p-3 px-3 gap-1 rounded-xl">
                                <span className="md:text-sm text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    DOB:
                                </span>
                                <span className="md:text-sm text-xs font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {formatDate(userData.dob)}
                                </span>
                            </div>
                            <div className="flex items-center md:p-3 px-3 gap-1 rounded-xl">
                                <span className="md:text-sm text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Age:
                                </span>
                                <span className="md:text-sm text-xs font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {calculateAge(userData.dob)}
                                </span>
                            </div>
                            <div className="flex items-center md:p-3 px-3 gap-1 rounded-xl">
                                <span className="md:text-sm text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Gender:
                                </span>
                                <span className="md:text-sm text-xs font-semibold capitalize text-light-primary-text dark:text-dark-primary-text">
                                    {userData.gender}
                                </span>
                            </div>
                            <div className="flex items-center md:p-3 px-3 gap-1 rounded-xl">
                                <span className="md:text-sm text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Phone:
                                </span>
                                <span className="md:text-sm text-xs font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {userData.phone}
                                </span>
                            </div>
                            <div className="flex md:p-3 px-3 gap-1 rounded-xl">
                                <span className="md:text-sm text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    District:
                                </span>
                                <span className="md:text-sm text-xs font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {userData.district}
                                </span>
                            </div>
                        </div>
                        <div className="flex md:p-3 px-3 gap-1 md:mt-4 mt-2 rounded-xl">
                            <span className="md:text-sm text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                Address:
                            </span>
                            <span className="md:text-sm text-xs font-semibold text-light-primary-text dark:text-dark-primary-text">
                                {userData.address}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl py-6 px-4 shadow-md hover:shadow-xl transition-all duration-300">
                        <h3 className="md:text-2xl text-xl font-bold text-light-primary-text dark:text-dark-primary-text md:mb-6 mb-4 flex items-center">
                            <Plus className="w-5 h-5 md:mr-3 mr-1 text-light-primary dark:text-dark-primary" />
                            Quick Actions
                        </h3>
                        <div className="md:space-y-3">
                            {[
                                {
                                    icon: CalendarIcon,
                                    label: "Book Appointment",
                                    color: "bg-blue-500",
                                    navigateTo: "/patient/get-appointment",
                                },
                                {
                                    icon: Stethoscope,
                                    label: "AI Symptom Check",
                                    color: "bg-green-500",
                                    navigateTo: "/patient/symptom-checker",
                                },
                                {
                                    icon: FileTextIcon,
                                    label: "View Reports",
                                    color: "bg-purple-500",
                                },
                                {
                                    icon: Pill,
                                    label: "Medication Reminder",
                                    color: "bg-orange-500",
                                },
                            ].map((action, index) => (
                                <button
                                    onClick={() => {
                                        if (action.navigateTo) {
                                            navigate(action.navigateTo);
                                        }
                                    }}
                                    key={index}
                                    className="w-full flex items-center space-x-3 p-3 rounded-xl bg-light-background dark:bg-dark-background hover:bg-light-primary/5 dark:hover:bg-dark-primary/5 transition-colors group">
                                    <div
                                        className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                                        <action.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text group-hover:text-light-primary dark:group-hover:text-dark-primary">
                                        {action.label}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-light-secondary-text dark:text-dark-secondary-text ml-auto" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Health Reminders */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
                        <h3 className="md:text-2xl text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-6 flex items-center">
                            <Bell className="w-5 h-5 md:mr-3 mr-1 text-light-primary dark:text-dark-primary" />
                            Health Reminders
                        </h3>
                        <div className="space-y-3"></div>
                    </div>
                </div>

                {/* Secondary Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    {/* Medical Details */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl md:p-6 p-4 shadow-md hover:shadow-xl transition-all duration-300">
                        <h3 className="md:text-2xl text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-6 flex items-center">
                            <Heart className="w-5 h-5 md:mr-3 mr-1 text-light-primary dark:text-dark-primary" />
                            Medical Details
                        </h3>
                        <div className="md:space-y-4 space-y-2">
                            <div className="flex md:flex-row flex-col md:items-center items-start md:justify-between justify-start p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Medical History
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {userData.medicalHistory}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Govt. ID Type
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {userData.govIdType}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Govt. ID Number
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {userData.govIdNumber}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Telemedicine Consent
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl md:p-6 p-4 shadow-lg border border-red-200 dark:border-red-800/30 hover:shadow-xl transition-all duration-300">
                        <h3 className="md:text-2xl text-xl font-bold text-red-800 dark:text-red-200 mb-6 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                            Emergency Contact
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20">
                                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                    Name:
                                </span>
                                <span className="text-sm font-bold text-red-800 dark:text-red-200">
                                    {userData.emergencyContactName}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20">
                                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                    Phone:
                                </span>
                                <span className="text-sm font-bold text-red-800 dark:text-red-200">
                                    {userData.emergencyContactPhone}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl md:p-6 p-4 shadow-md hover:shadow-xl transition-all duration-300">
                        <h3 className="md:text-2xl text-xl font-bold text-light-primary-text dark:text-dark-primary-text md:mb-6 mb-4 flex items-center">
                            <Settings className="w-5 h-5 mr-2 text-light-primary dark:text-dark-primary" />
                            Account Information
                        </h3>
                        <div className="md:space-y-3">
                            <div className="p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                <p className="text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                    Patient ID:
                                </p>
                                <p className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text truncate">
                                    {userData._id}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                <p className="text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                    User ID:
                                </p>
                                <p className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text truncate">
                                    {user.id}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                <p className="text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                    Account Created:
                                </p>
                                <p className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text truncate">
                                    {formatDate(userData.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Event Calendar */}
                <Calendar patientId={userData._id} />
            </div>
        </div>
    );
};

export default PatientDashboardContent;
