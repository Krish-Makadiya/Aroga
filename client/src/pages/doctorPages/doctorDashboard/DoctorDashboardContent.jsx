import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
    User,
    Stethoscope,
    Mail,
    Phone,
    MapPin,
    Award,
    Clock,
    DollarSign,
    Star,
    CheckCircle,
    AlertCircle,
    XCircle,
    Calendar,
    Settings,
    Activity,
    TrendingUp,
    Users,
    FileText,
    Shield,
    Globe,
    Edit,
    Bell,
} from "lucide-react";
import Loader from "../../../components/main/Loader";

const DoctorDashboardContent = () => {
    const [doctorData, setDoctorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { user } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchDoctorData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const token = await getToken();
                const response = await axios.get(
                    `http://localhost:5000/api/doctor/get-doctor/${user.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setDoctorData(response.data.data);
                console.log("Fetched doctor data:", response.data);
            } catch (error) {
                console.error(
                    "Error fetching doctor data:",
                    error.response?.data || error.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData();

        // Update time every minute
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timeInterval);
    }, [user, getToken]);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getVerificationStatusColor = (status) => {
        switch (status) {
            case "verified":
                return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300";
            case "pending":
                return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300";
            case "rejected":
                return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300";
            case "new":
                return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300";
            default:
                return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300";
        }
    };

    const getVerificationIcon = (status) => {
        switch (status) {
            case "verified":
                return <CheckCircle className="w-4 h-4" />;
            case "pending":
                return <Clock className="w-4 h-4" />;
            case "rejected":
                return <XCircle className="w-4 h-4" />;
            case "new":
                return <Bell className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    if (loading) return <Loader />;

    if (!doctorData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--color-light-background)] to-[var(--color-light-background-secondary)] dark:from-[var(--color-dark-background)] dark:to-[var(--color-dark-background-secondary)]">
                <div className="max-w-8xl mx-auto p-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-2">
                                Doctor Profile Not Found
                            </h3>
                            <p className="text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                Please complete your doctor registration first.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-light-background)] to-[var(--color-light-background-secondary)] dark:from-[var(--color-dark-background)] dark:to-[var(--color-dark-background-secondary)]">
            <div className="max-w-8xl mx-auto">
                {/* Enhanced Header with Gradient */}
                <div className="relative mb-4 overflow-hidden rounded-3xl dark:bg-dark-bg bg-light-surface p-8 text-light-primary-text dark:text-dark-primary-text">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                            <div className="relative">
                                <img
                                    src={user.imageUrl}
                                    alt="Profile"
                                    className="w-30 h-30 rounded-full object-cover border-4 border-white/30 shadow-lg"
                                />
                                <div className="absolute -bottom-0 -right-0 w-8 h-8 bg-dark-surface rounded-full flex items-center justify-center">
                                    <Stethoscope className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col">
                                    <h1 className="text-4xl font-bold">
                                        {getGreeting()}, Dr.{" "}
                                        {doctorData.fullName}!
                                    </h1>
                                    <p className="text-light-secondary-text text-lg">
                                        Here's your practice overview today
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4 mt-4">
                                    <span className="text-sm">
                                        {formatDate(currentTime)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-light-bg dark:bg-dark-surface backdrop-blur-sm rounded-2xl p-4 text-center">
                                <Activity className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">Rating</p>
                                <p className="text-2xl font-bold">
                                    {doctorData.rating?.average || 0}
                                </p>
                            </div>
                            <div className="bg-light-bg dark:bg-dark-surface backdrop-blur-sm rounded-2xl p-4 text-center">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">
                                    Experience
                                </p>
                                <p className="text-2xl font-bold">
                                    {doctorData.experience}y
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
                    {/* Professional Information Card */}
                    <div className="lg:col-span-2 dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center">
                                <User className="w-6 h-6 mr-3 text-light-primary dark:text-dark-primary" />
                                <p className="text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Professional Information
                                </p>
                            </h2>
                            <button className="p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-surface transition-colors">
                                <Edit className="w-5 h-5 text-light-secondary-text dark:text-dark-secondary-text" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Full Name
                                    </label>
                                    <p className="text-light-primary-text dark:text-dark-primary-text font-medium">
                                        Dr. {doctorData.fullName}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Specialty
                                    </label>
                                    <p className="text-light-primary-text dark:text-dark-primary-text capitalize">
                                        {doctorData.specialty}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Qualifications
                                    </label>
                                    <p className="text-light-primary-text dark:text-dark-primary-text">
                                        {doctorData.qualifications}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Registration Number
                                    </label>
                                    <p className="text-light-primary-text dark:text-dark-primary-text font-mono">
                                        {doctorData.registrationNumber}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Experience
                                    </label>
                                    <p className="text-light-primary-text dark:text-dark-primary-text">
                                        {doctorData.experience} years
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Affiliation
                                    </label>
                                    <p className="text-light-primary-text dark:text-dark-primary-text">
                                        {doctorData.affiliation ||
                                            "Not specified"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center">
                                <Mail className="w-5 h-5 mr-3 text-light-primary dark:text-dark-primary" />
                                <p className="text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Contact
                                </p>
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-light-secondary-text dark:text-dark-secondary-text" />
                                <span className="text-light-primary-text dark:text-dark-primary-text text-sm">
                                    {doctorData.email}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-light-secondary-text dark:text-dark-secondary-text" />
                                <span className="text-light-primary-text dark:text-dark-primary-text text-sm">
                                    {doctorData.phone}
                                </span>
                            </div>
                            {doctorData.address && (
                                <div className="flex items-start space-x-3">
                                    <MapPin className="w-4 h-4 text-light-secondary-text dark:text-dark-secondary-text mt-0.5" />
                                    <div>
                                        <p className="text-light-primary-text dark:text-dark-primary-text text-sm">
                                            {doctorData.address}
                                        </p>
                                        <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">
                                            {doctorData.district},{" "}
                                            {doctorData.state}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Verification Status Card */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center">
                                <Shield className="w-5 h-5 mr-3 text-light-primary dark:text-dark-primary" />
                                <p className="text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Status
                                </p>
                            </h2>
                        </div>
                        <div className="text-center">
                            <div
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-3 ${getVerificationStatusColor(
                                    doctorData.verificationStatus
                                )}`}>
                                {getVerificationIcon(
                                    doctorData.verificationStatus
                                )}
                                {doctorData.verificationStatus}
                            </div>
                            <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                {doctorData.verificationStatus === "new" &&
                                    "Your profile is newly created. Please complete verification to start practicing."}
                                {doctorData.verificationStatus === "pending" &&
                                    "Your profile is under review. We'll notify you once verified."}
                                {doctorData.verificationStatus === "verified" &&
                                    "Your profile has been verified and is live."}
                                {doctorData.verificationStatus === "rejected" &&
                                    "Please check the verification notes and resubmit your documents."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Second Row */}
                {doctorData.verificationStatus === "new" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Quick Start Card */}
        <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                        Get Started
                    </h2>
                    <p className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                        Complete setup to start earning
                    </p>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                        �� Start Earning in 3 Steps
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">1</span>
                            </div>
                            <span className="text-blue-700 dark:text-blue-300">Upload documents</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">2</span>
                            </div>
                            <span className="text-blue-700 dark:text-blue-300">Set consultation fee</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">3</span>
                            </div>
                            <span className="text-blue-700 dark:text-blue-300">Add availability</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-green-800 dark:text-green-200">
                            ₹500-2000
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            per consultation
                        </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-purple-800 dark:text-purple-200">
                            50+ patients
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                            monthly
                        </p>
                    </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
                    Complete Setup
                </button>
            </div>
        </div>

        {/* Verification Info Card */}
        <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                        Verification
                    </h2>
                    <p className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                        Takes 48 hours to verify
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                        ⏰ What happens next?
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-yellow-700 dark:text-yellow-300">Upload your documents</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-yellow-700 dark:text-yellow-300">We verify your credentials</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-yellow-700 dark:text-yellow-300">You're approved & can start earning</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">
                        📄 You'll need:
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <li>• Medical License</li>
                        <li>• Government ID</li>
                        <li>• Passport photo</li>
                    </ul>
                </div>

                <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                    <Bell className="w-3 h-3" />
                    <span>We'll notify you when ready</span>
                </div>
            </div>
        </div>
    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
                        {/* Rating & Reviews Card */}
                        <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center">
                                    <Star className="w-5 h-5 mr-3 text-light-primary dark:text-dark-primary" />
                                    <p className="text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        Rating & Reviews
                                    </p>
                                </h2>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                    <span className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">
                                        {doctorData.rating?.average || 0}
                                    </span>
                                </div>
                                <p className="text-light-secondary-text dark:text-dark-secondary-text text-sm mb-4">
                                    Based on {doctorData.rating?.count || 0}{" "}
                                    reviews
                                </p>
                                <div className="bg-light-bg dark:bg-dark-surface rounded-lg p-3">
                                    <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                        No reviews yet
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Consultation Fee Card */}
                        <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center">
                                    <DollarSign className="w-5 h-5 mr-3 text-light-primary dark:text-dark-primary" />
                                    <p className="text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        Consultation Fee
                                    </p>
                                </h2>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2">
                                    ₹{doctorData.consultationFee || 0}
                                </p>
                                <p className="text-light-secondary-text dark:text-dark-secondary-text text-sm">
                                    Per consultation
                                </p>
                                <button className="mt-4 px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark transition-colors text-sm">
                                    Update Fee
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center">
                                    <Settings className="w-5 h-5 mr-3 text-light-primary dark:text-dark-primary" />
                                    <p className="text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        Quick Actions
                                    </p>
                                </h2>
                            </div>
                            <div className="space-y-3">
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-light-bg dark:bg-dark-surface hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors">
                                    <Calendar className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                    <span className="text-light-primary-text dark:text-dark-primary-text text-sm">
                                        Manage Schedule
                                    </span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-light-bg dark:bg-dark-surface hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors">
                                    <Users className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                    <span className="text-light-primary-text dark:text-dark-primary-text text-sm">
                                        View Patients
                                    </span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-light-bg dark:bg-dark-surface hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors">
                                    <Edit className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                    <span className="text-light-primary-text dark:text-dark-primary-text text-sm">
                                        Edit Profile
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Third Row - Languages and Additional Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                    {/* Languages Card */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center">
                                <Globe className="w-5 h-5 mr-3 text-light-primary dark:text-dark-primary" />
                                <p className="text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Languages
                                </p>
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {doctorData.languages &&
                            doctorData.languages.length > 0 ? (
                                doctorData.languages.map((language, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary rounded-full text-sm">
                                        {language}
                                    </span>
                                ))
                            ) : (
                                <p className="text-light-secondary-text dark:text-dark-secondary-text text-sm">
                                    No languages specified
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Telemedicine Status Card */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center">
                                <Stethoscope className="w-5 h-5 mr-3 text-light-primary dark:text-dark-primary" />
                                <p className="text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Telemedicine
                                </p>
                            </h2>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                {doctorData.telemedicineConsent ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-500" />
                                )}
                                <span className="text-lg font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {doctorData.telemedicineConsent
                                        ? "Enabled"
                                        : "Disabled"}
                                </span>
                            </div>
                            <p className="text-light-secondary-text dark:text-dark-secondary-text text-sm">
                                {doctorData.telemedicineConsent
                                    ? "You can provide online consultations"
                                    : "Enable telemedicine to provide online consultations"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboardContent;
