import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
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
    MapPin,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Loader from "../../../components/main/Loader";
import InventoryManagement from "../../../components/pharmcy/InventoryManagement";
import LeafletMap from "../../../components/pharmcy/LeafletMap";

const PharmacyDashboardContent = () => {
    const [pharmacyData, setPharmacyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [locationData, setLocationData] = useState({
        latitude: 19.0760, // Default Mumbai coordinates
        longitude: 72.8777,
        name: "",
        address: ""
    });
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const searchParams = new URLSearchParams(routerLocation.search);
    const view = searchParams.get("view") || "overview";

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
                const pharmacy = response.data.data;
                setPharmacyData(pharmacy);

                // First set sensible defaults from pharmacy profile
                const baseLocation = {
                    latitude: 19.0760,
                    longitude: 72.8777,
                    name: pharmacy.pharmacyName || "",
                    address: pharmacy.address || "",
                };

                setLocationData(baseLocation);

                // Then try to load saved location for this pharmacy
                let hasSavedLocation = false;
                try {
                    const locationRes = await axios.get(
                        `http://localhost:5000/api/pharmacyLocation/${pharmacy._id}/location`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (locationRes.data?.success && locationRes.data.data?.location) {
                        const loc = locationRes.data.data.location;
                        const [lng, lat] = loc.coordinates || [];
                        if (lat && lng) {
                            setLocationData({
                                latitude: lat,
                                longitude: lng,
                                name: locationRes.data.data.name || baseLocation.name,
                                address: locationRes.data.data.address || baseLocation.address,
                            });
                            hasSavedLocation = true;
                        }
                    }
                } catch (locErr) {
                    console.warn("No saved pharmacy location yet or error loading it:", locErr.response?.data || locErr.message);
                }

                // If there is no saved location, fall back to browser's current location
                if (!hasSavedLocation && typeof window !== "undefined" && navigator.geolocation) {
                    console.log("No saved pharmacy location, using current browser location");
                    handleUseCurrentLocation();
                }

                console.log("Fetched pharmacy data:", pharmacy);
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

    const handleLocationChange = async (updatedLocation) => {
        if (!pharmacyData) return;

        setLocationData(prev => ({
            ...prev,
            ...updatedLocation,
        }));

        try {
            const token = await getToken();
            const putRes = await axios.put(
                `http://localhost:5000/api/pharmacyLocation/${pharmacyData._id}/location`,
                {
                    latitude: updatedLocation.latitude,
                    longitude: updatedLocation.longitude,
                    name: updatedLocation.name || locationData.name,
                    address: updatedLocation.address || locationData.address,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Location updated successfully", putRes.data);

            // Verify and sync with backend state
            try {
                const verifyRes = await axios.get(
                    `http://localhost:5000/api/pharmacyLocation/${pharmacyData._id}/location`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (verifyRes.data?.success && verifyRes.data.data?.location) {
                    const loc = verifyRes.data.data.location;
                    const [lng, lat] = loc.coordinates || [];
                    if (lat && lng) {
                        setLocationData(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                            name: verifyRes.data.data.name || prev.name,
                            address: verifyRes.data.data.address || prev.address,
                        }));
                        console.log("Verified location from DB", verifyRes.data.data);
                    }
                } else {
                    console.warn("Location PUT succeeded but verify GET did not return location", verifyRes.data);
                }
            } catch (verifyErr) {
                console.warn("Location verify failed:", verifyErr.response?.data || verifyErr.message);
            }
        } catch (error) {
            console.error("Error updating location:", error.response?.data || error.message);
        }
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const updated = {
                        latitude,
                        longitude,
                        name: locationData.name,
                        address: locationData.address,
                    };
                    setLocationData(prev => ({ ...prev, ...updated }));
                    handleLocationChange(updated);
                },
                (error) => {
                    console.error("Error getting current location:", error);
                    alert("Unable to get your current location. Please enable location services.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    // When user opens the dedicated location view, try to use live current location
    // so the Leaflet map shows real-time position instead of only the default coords.
    useEffect(() => {
        if (view === "location") {
            console.log("Location view opened, attempting to use current browser location");
            handleUseCurrentLocation();
        }
    }, [view]);

    if (loading) return <Loader />;
    if (!pharmacyData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-2">
                        Pharmacy Not Found
                    </h2>
                    <p className="text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                        Please complete your pharmacy registration first.
                    </p>
                </div>
            </div>
        );
    }

    // Dedicated Inventory view (opened from Quick Actions)
    if (view === "inventory") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--color-light-background)] to-[var(--color-light-background-secondary)] dark:from-[var(--color-dark-background)] dark:to-[var(--color-dark-background-secondary)]">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                            Manage Inventory
                        </h1>
                        <button
                            onClick={() => navigate("/pharmacy/dashboard")}
                            className="px-4 py-2 rounded-md text-sm bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:opacity-90"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md">
                        <InventoryManagement ownerId={pharmacyData._id} />
                    </div>
                </div>
            </div>
        );
    }

    // Dedicated Location view (opened from Quick Actions)
    if (view === "location") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--color-light-background)] to-[var(--color-light-background-secondary)] dark:from-[var(--color-dark-background)] dark:to-[var(--color-dark-background-secondary)]">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                            Manage Pharmacy Location
                        </h1>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleUseCurrentLocation}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm flex items-center gap-2"
                            >
                                <MapPin className="w-4 h-4" />
                                Use My Current Location
                            </button>
                            <button
                                onClick={() => navigate("/pharmacy/dashboard")}
                                className="px-4 py-2 rounded-md text-sm bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:opacity-90"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>

                    <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md">
                        <LeafletMap
                            latitude={locationData.latitude}
                            longitude={locationData.longitude}
                            pharmacyName={locationData.name}
                            address={locationData.address}
                            onLocationChange={handleLocationChange}
                            height="500px"
                            clickable={true}
                            showAddLocation={true}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Default overview dashboard view
    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-light-background)] to-[var(--color-light-background-secondary)] dark:from-[var(--color-dark-background)] dark:to-[var(--color-dark-background-secondary)]">
            <div className="max-w-8xl mx-auto">
                {/* Enhanced Header with Gradient */}
                <div className="relative mb-4 overflow-hidden rounded-3xl dark:bg-dark-bg bg-light-surface p-8 text-light-primary-text dark:text-dark-primary-text">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                            <div className="relative">
                                <div className="w-30 h-30 rounded-full object-cover border-4 border-white/30 shadow-lg bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] flex items-center justify-center">
                                    <Building2 className="w-16 h-16 text-white" />
                                    <div className="w-30 h-30 rounded-full object-cover border-4 border-white/30 shadow-lg bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] flex items-center justify-center">
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
                                    <p className="text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        Pharmacy Information
                                    </p>
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center p-3 gap-1 rounded-xl">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Pharmacy Name:
                                    </span>
                                    <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {pharmacyData.pharmacyName}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 gap-1 rounded-xl">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Owner Name:
                                    </span>
                                    <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {pharmacyData.ownerName}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 gap-1 rounded-xl">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        License Number:
                                    </span>
                                    <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {pharmacyData.licenseNumber}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 gap-1 rounded-xl">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Phone:
                                    </span>
                                    <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {pharmacyData.phone}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 gap-1 rounded-xl">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Email:
                                    </span>
                                    <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {pharmacyData.email}
                                    </span>
                                </div>
                                {pharmacyData.alternatePhone && (
                                    <div className="flex items-center p-3 gap-1 rounded-xl">
                                        <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                            Alternate Phone:
                                        </span>
                                        <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                            {pharmacyData.alternatePhone}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center p-3 gap-1 rounded-xl">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        District:
                                    </span>
                                    <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {pharmacyData.district}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 gap-1 rounded-xl">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        State:
                                    </span>
                                    <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {pharmacyData.state}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 gap-1 rounded-xl">
                                    <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                        Pincode:
                                    </span>
                                    <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                        {pharmacyData.pincode}
                                    </span>
                                </div>
                            </div>
                            <div className="flex p-3 gap-1 mt-4 rounded-xl">
                                <span className="text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                    Address:
                                </span>
                                <span className="text-sm font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    {pharmacyData.address}
                                </span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="dark:bg-dark-bg bg-light-surface rounded-2xl py-6 px-4 shadow-md hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-6 flex items-center">
                                <Plus className="w-5 h-5 mr-2 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]" />
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                {[
                                    {
                                        icon: ShoppingBag,
                                        label: "Manage Inventory",
                                        color: "bg-blue-500",
                                        action: () => navigate("/pharmacy/dashboard?view=inventory")
                                    },
                                    {
                                        icon: MapPin,
                                        label: "Manage Location",
                                        color: "bg-green-500",
                                        action: () => navigate("/pharmacy/dashboard?view=location")
                                    },
                                    {
                                        icon: FileTextIcon,
                                        label: "View Orders",
                                        color: "bg-purple-500",
                                    },
                                    {
                                        icon: Users,
                                        label: "Manage Customers",
                                        color: "bg-orange-500",
                                    },
                                ].map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={action.action}
                                        className="w-full flex items-center space-x-3 p-3 rounded-xl bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] hover:bg-[var(--color-light-primary)]/5 dark:hover:bg-[var(--color-dark-primary)]/5 transition-colors group">
                                        <div
                                            className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                                            <action.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] group-hover:text-[var(--color-light-primary)] dark:group-hover:text-[var(--color-dark-primary)]">
                                            {action.label}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] ml-auto" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-6 flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]" />
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

                    {/* No inline inventory/location sections here; they open as dedicated views using the `view` query param. */}
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboardContent;
