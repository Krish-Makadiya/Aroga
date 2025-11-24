import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
    Bell,
    Building2,
    CheckCircle,
    ChevronRight,
    Clock,
    FileText as FileTextIcon,
    Package,
    Plus,
    Settings,
    ShoppingBag,
    Star,
    Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Loader from "../../../components/main/Loader";

const PharmacyDashboardContent = () => {
    const [pharmacyData, setPharmacyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { user } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {
        fetchPharmacyData();
    }, [user, getToken]);

    const fetchPharmacyData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const token = await getToken();
            const response = await axios.get(
                `http://localhost:5000/api/pharmacy/get-pharmacy/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data.success) {
                setPharmacyData(response.data.data);
                console.log("Fetched pharmacy data:", response.data.data);
            }
        } catch (error) {
            console.error(
                "Error fetching pharmacy data:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
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

    const getVerificationBadge = (status) => {
        switch (status) {
            case "verified":
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        Verified
                    </span>
                );
            case "pending":
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        Pending
                    </span>
                );
            case "rejected":
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
                        New
                    </span>
                );
        }
    };

    if (loading) return <Loader />;
    if (!pharmacyData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2">
                        Pharmacy Not Found
                    </h2>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text">
                        Please complete your pharmacy registration first.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-light-background to-light-background-secondary dark:from-dark-background dark:to-dark-background-secondary">
            <div className="max-w-8xl mx-auto">
                {/* Enhanced Header with Gradient */}
                <div className="relative mb-4 overflow-hidden rounded-3xl dark:bg-dark-bg bg-light-surface p-8 text-light-primary-text dark:text-dark-primary-text">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                            <div className="relative">
                                <div className="w-30 h-30 rounded-full object-cover border-4 border-white/30 shadow-lg bg-light-primary dark:bg-dark-primary flex items-center justify-center">
                                    <Building2 className="w-16 h-16 text-white" />
                                </div>
                                <div className="absolute -bottom-0 -right-0 w-8 h-8 bg-dark-surface rounded-full flex items-center justify-center">
                                    {pharmacyData.verificationStatus === "verified" && (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col">
                                    <h1 className="text-4xl font-bold">
                                        {getGreeting()}, {pharmacyData.ownerName}!
                                    </h1>
                                    <p className="text-light-secondary-text text-lg">
                                        {pharmacyData.pharmacyName}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4 mt-4">
                                    <span className="text-sm">
                                        {formatDate(currentTime)}
                                    </span>
                                    {getVerificationBadge(pharmacyData.verificationStatus)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-light-bg dark:bg-dark-surface backdrop-blur-sm rounded-2xl p-4 text-center">
                                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                                <p className="text-sm font-medium">
                                    Rating
                                </p>
                                <p className="text-2xl font-bold">
                                    {pharmacyData.rating?.average?.toFixed(1) || "0.0"}
                                </p>
                                <p className="text-xs text-light-secondary-text">
                                    ({pharmacyData.rating?.count || 0} reviews)
                                </p>
                            </div>
                            <div className="bg-light-bg dark:bg-dark-surface backdrop-blur-sm rounded-2xl p-4 text-center">
                                <Package className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">
                                    Services
                                </p>
                                <p className="text-2xl font-bold">
                                    {pharmacyData.services?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
                    {/* Pharmacy Information Card */}
                    <div className="lg:col-span-2 dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center">
                                <Building2 className="w-6 h-6 mr-3 text-light-primary dark:text-dark-primary" />
                                <p className="text-light-primary-text dark:text-dark-primary-text">
                                    Pharmacy Information
                                </p>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center p-3 gap-1 rounded-xl">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Pharmacy Name:
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {pharmacyData.pharmacyName}
                                </span>
                            </div>
                            <div className="flex items-center p-3 gap-1 rounded-xl">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Owner Name:
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {pharmacyData.ownerName}
                                </span>
                            </div>
                            <div className="flex items-center p-3 gap-1 rounded-xl">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    License Number:
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {pharmacyData.licenseNumber}
                                </span>
                            </div>
                            <div className="flex items-center p-3 gap-1 rounded-xl">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Phone:
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {pharmacyData.phone}
                                </span>
                            </div>
                            <div className="flex items-center p-3 gap-1 rounded-xl">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Email:
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {pharmacyData.email}
                                </span>
                            </div>
                            {pharmacyData.alternatePhone && (
                                <div className="flex items-center p-3 gap-1 rounded-xl">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Alternate Phone:
                                    </span>
                                    <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                        {pharmacyData.alternatePhone}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center p-3 gap-1 rounded-xl">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    District:
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {pharmacyData.district}
                                </span>
                            </div>
                            <div className="flex items-center p-3 gap-1 rounded-xl">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    State:
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {pharmacyData.state}
                                </span>
                            </div>
                            <div className="flex items-center p-3 gap-1 rounded-xl">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Pincode:
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {pharmacyData.pincode}
                                </span>
                            </div>
                        </div>
                        <div className="flex p-3 gap-1 mt-4 rounded-xl">
                            <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                Address:
                            </span>
                            <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                {pharmacyData.address}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl py-6 px-4 shadow-md hover:shadow-xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-6 flex items-center">
                            <Plus className="w-5 h-5 mr-2 text-light-primary dark:text-dark-primary" />
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            {[
                                {
                                    icon: ShoppingBag,
                                    label: "Manage Inventory",
                                    color: "bg-blue-500",
                                },
                                {
                                    icon: FileTextIcon,
                                    label: "View Orders",
                                    color: "bg-green-500",
                                },
                                {
                                    icon: Users,
                                    label: "Manage Customers",
                                    color: "bg-purple-500",
                                },
                                {
                                    icon: Package,
                                    label: "Add Products",
                                    color: "bg-orange-500",
                                },
                            ].map((action, index) => (
                                <button
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

                    {/* Notifications */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-6 flex items-center">
                            <Bell className="w-5 h-5 mr-2 text-light-primary dark:text-dark-primary" />
                            Notifications
                        </h3>
                        <div className="space-y-3">
                            {pharmacyData.verificationStatus === "pending" && (
                                <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Your pharmacy verification is pending
                                    </p>
                                </div>
                            )}
                            {pharmacyData.verificationStatus === "rejected" && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                        Your pharmacy verification was rejected
                                    </p>
                                </div>
                            )}
                            {pharmacyData.verificationStatus === "verified" && (
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                        ✓ Your pharmacy is verified
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Secondary Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    {/* Business Details */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-6 flex items-center">
                            <FileTextIcon className="w-5 h-5 mr-2 text-light-primary dark:text-dark-primary" />
                            Business Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Registration Type
                                </span>
                                <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                    {pharmacyData.registrationType}
                                </span>
                            </div>
                            {pharmacyData.gstNumber && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        GST Number
                                    </span>
                                    <span className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text">
                                        {pharmacyData.gstNumber}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Verification Status
                                </span>
                                <span className="text-sm font-semibold">
                                    {getVerificationBadge(pharmacyData.verificationStatus)}
                                </span>
                            </div>
                            {pharmacyData.description && (
                                <div className="p-3 rounded-xl bg-light-background dark:bg-dark-background">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text block mb-2">
                                        Description
                                    </span>
                                    <span className="text-sm text-light-primary-text dark:text-dark-primary-text">
                                        {pharmacyData.description}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-6 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-light-primary dark:text-dark-primary" />
                            Operating Hours
                        </h3>
                        <div className="space-y-2">
                            {pharmacyData.operatingHours && pharmacyData.operatingHours.length > 0 ? (
                                pharmacyData.operatingHours.map((hours, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 rounded-xl bg-light-background dark:bg-dark-background">
                                        <span className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                            {hours.day}
                                        </span>
                                        {hours.isOpen ? (
                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                {hours.openTime} - {hours.closeTime}
                                            </span>
                                        ) : (
                                            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                Closed
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                    Operating hours not set
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Services Offered */}
                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-6 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-light-primary dark:text-dark-primary" />
                            Services Offered
                        </h3>
                        <div className="space-y-2">
                            {pharmacyData.services && pharmacyData.services.length > 0 ? (
                                pharmacyData.services.map((service, index) => (
                                    <div
                                        key={index}
                                        className="p-2 rounded-xl bg-light-background dark:bg-dark-background">
                                        <span className="text-sm font-medium text-light-primary-text dark:text-dark-primary-text">
                                            • {service}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                    No services listed
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-6 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-light-primary dark:text-dark-primary" />
                        Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-xl bg-light-background dark:bg-dark-background">
                            <p className="text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text mb-1">
                                Pharmacy ID:
                            </p>
                            <p className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text truncate">
                                {pharmacyData._id}
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
                                {formatDate(pharmacyData.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboardContent;
