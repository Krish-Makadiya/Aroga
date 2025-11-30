import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import EmergencyAppointmentForm from "./EmergencyAppointmentForm";

const EmergencySOSButton = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const { user } = useUser();
    const { getToken } = useAuth();

    // Check for nearby hospitals (10km radius)
    const checkNearbyHospitals = async (latitude, longitude) => {
        try {
            setIsChecking(true);
            
            // Use Overpass API to find hospitals within 10km
            const radius = 1000; // 8km in meters
            const overpassUrl = "https://overpass-api.de/api/interpreter";
            
            const query = `
                [out:json][timeout:25];
                (
                    node["amenity"="hospital"](around:${radius},${latitude},${longitude});
                    way["amenity"="hospital"](around:${radius},${latitude},${longitude});
                );
                out center;
            `;

            const response = await fetch(overpassUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `data=${encodeURIComponent(query)}`,
            });

            const data = await response.json();
            const hospitals = data.elements || [];

            console.log(hospitals);
            // If no hospitals found within 10km, enable SOS button
            setIsEnabled(hospitals.length === 0);
        } catch (error) {
            console.error("Error checking nearby hospitals:", error);
            // On error, enable SOS button as a safety measure
            setIsEnabled(true);
        } finally {
            setIsChecking(false);
        }
    };

    // Get user location and check for hospitals
    useEffect(() => {
        if (!navigator.geolocation) {
            // If geolocation not available, enable SOS button
            setIsEnabled(true);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                checkNearbyHospitals(latitude, longitude);
            },
            (error) => {
                console.error("Error getting location:", error);
                // On error, enable SOS button as a safety measure
                setIsEnabled(true);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    const handleSOSClick = () => {
        if (!isEnabled && !isChecking) {
            setShowForm(true);
        }
    };

    return (
        <>
            {!isEnabled && (
                <button
                    onClick={handleSOSClick}
                    disabled={isChecking}
                    className="fixed bottom-6 left-6 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl transform transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 animate-pulse"
                    style={{
                        boxShadow: "0 4px 20px rgba(220, 38, 38, 0.6)",
                    }}
                    title="Emergency SOS - No hospitals nearby"
                >
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-bold text-lg">SOS</span>
                </button>
            )}

            {showForm && (
                <EmergencyAppointmentForm
                    isOpen={showForm}
                    onClose={() => setShowForm(false)}
                    userLocation={userLocation}
                    userId={user?.id}
                />
            )}
        </>
    );
};

export default EmergencySOSButton;

