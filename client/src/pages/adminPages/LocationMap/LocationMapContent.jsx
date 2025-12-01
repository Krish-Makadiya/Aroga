import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { MapPin, Users, Stethoscope, RefreshCw } from "lucide-react";

const LocationMapContent = () => {
    const mapRef = useRef(null);
    const map = useRef(null);
    const patientMarkersRef = useRef([]);
    const doctorMarkersRef = useRef([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPatients, setShowPatients] = useState(true);
    const [showDoctors, setShowDoctors] = useState(true);
    const { getToken } = useAuth();

    // Custom marker icons for patients (green) and doctors (blue)
    const createCustomIcon = (color, type) => {
        return L.divIcon({
            className: "custom-marker",
            html: `
                <div style="
                    background-color: ${color};
                    width: 30px;
                    height: 30px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        transform: rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 16px;
                    ">${type === "patient" ? "P" : "D"}</div>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });
    };

    const patientIcon = createCustomIcon("#10b981", "patient"); // Green
    const doctorIcon = createCustomIcon("#3b82f6", "doctor"); // Blue

    // Fix Leaflet default marker icons
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
    }, []);

    // Fetch patients and doctors with location
    const fetchLocations = async () => {
        try {
            setLoading(true);
            const token = await getToken();

            // Fetch patients and doctors in parallel
            const [patientsRes, doctorsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_SERVER_URL}/api/patient/all-patients/location`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${import.meta.env.VITE_SERVER_URL}/api/doctor/all-doctors/location`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const patientsData = patientsRes.data?.data || [];
            const doctorsData = doctorsRes.data?.data || [];

            // Filter out entries without valid location
            const validPatients = patientsData.filter(
                (p) =>
                    p.location?.latitude &&
                    p.location?.longitude &&
                    typeof p.location.latitude === "number" &&
                    typeof p.location.longitude === "number"
            );
            const validDoctors = doctorsData.filter(
                (d) =>
                    d.location?.latitude &&
                    d.location?.longitude &&
                    typeof d.location.latitude === "number" &&
                    typeof d.location.longitude === "number"
            );

            setPatients(validPatients);
            setDoctors(validDoctors);
        } catch (error) {
            console.error("Error fetching locations:", error);
            setPatients([]);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || map.current) return;

        // Default center (India - can be adjusted based on your data)
        map.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map.current);

        // Ensure map renders correctly
        const invalidate = () => {
            if (map.current) {
                map.current.invalidateSize();
            }
        };
        setTimeout(invalidate, 100);
        window.addEventListener("resize", invalidate);

        return () => {
            window.removeEventListener("resize", invalidate);
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Update markers when data or visibility changes
    useEffect(() => {
        if (!map.current || loading) return;

        // Clear existing markers
        patientMarkersRef.current.forEach((marker) => {
            map.current.removeLayer(marker);
        });
        doctorMarkersRef.current.forEach((marker) => {
            map.current.removeLayer(marker);
        });
        patientMarkersRef.current = [];
        doctorMarkersRef.current = [];

        // Add patient markers if visible
        if (showPatients) {
            patients.forEach((patient) => {
                const marker = L.marker(
                    [patient.location.latitude, patient.location.longitude],
                    { icon: patientIcon }
                ).addTo(map.current);

                const popupContent = `
                    <div style="min-width: 200px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <div style="width: 12px; height: 12px; background-color: #10b981; border-radius: 50%;"></div>
                            <b style="font-size: 14px; color: #10b981;">Patient</b>
                        </div>
                        <b style="font-size: 14px; color: #1f2937;">${
                            patient.fullName || "N/A"
                        }</b><br/>
                        ${
                            patient.phone
                                ? `<div style="margin: 5px 0; font-size: 12px; color: #666;">📞 ${patient.phone}</div>`
                                : ""
                        }
                        ${
                            patient.email
                                ? `<div style="margin: 5px 0; font-size: 12px; color: #666;">✉️ ${patient.email}</div>`
                                : ""
                        }
                        ${
                            patient.address
                                ? `<p style="margin: 5px 0; font-size: 12px; color: #666;">📍 ${patient.address}</p>`
                                : ""
                        }
                        ${
                            patient.district || patient.state
                                ? `<div style="margin-top: 5px; font-size: 11px; color: #888;">${
                                      patient.district || ""
                                  }${
                                      patient.district && patient.state
                                          ? ", "
                                          : ""
                                  }${patient.state || ""}</div>`
                                : ""
                        }
                        <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #ddd; font-size: 10px; color: #888;">
                            Lat: ${patient.location.latitude.toFixed(6)}<br/>
                            Lng: ${patient.location.longitude.toFixed(6)}
                        </div>
                    </div>
                `;

                marker.bindPopup(popupContent);
                patientMarkersRef.current.push(marker);
            });
        }

        // Add doctor markers if visible
        if (showDoctors) {
            doctors.forEach((doctor) => {
                const marker = L.marker(
                    [doctor.location.latitude, doctor.location.longitude],
                    { icon: doctorIcon }
                ).addTo(map.current);

                const popupContent = `
                    <div style="min-width: 200px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <div style="width: 12px; height: 12px; background-color: #3b82f6; border-radius: 50%;"></div>
                            <b style="font-size: 14px; color: #3b82f6;">Doctor</b>
                        </div>
                        <b style="font-size: 14px; color: #1f2937;">${
                            doctor.fullName || "N/A"
                        }</b><br/>
                        ${
                            doctor.specialty
                                ? `<div style="margin: 5px 0; font-size: 12px; color: #666;">🏥 ${doctor.specialty}</div>`
                                : ""
                        }
                        ${
                            doctor.phone
                                ? `<div style="margin: 5px 0; font-size: 12px; color: #666;">📞 ${doctor.phone}</div>`
                                : ""
                        }
                        ${
                            doctor.email
                                ? `<div style="margin: 5px 0; font-size: 12px; color: #666;">✉️ ${doctor.email}</div>`
                                : ""
                        }
                        ${
                            doctor.consultationFee
                                ? `<div style="margin: 5px 0; font-size: 12px; color: #666;">💰 ₹${doctor.consultationFee}</div>`
                                : ""
                        }
                        ${
                            doctor.address
                                ? `<p style="margin: 5px 0; font-size: 12px; color: #666;">📍 ${doctor.address}</p>`
                                : ""
                        }
                        ${
                            doctor.district || doctor.state
                                ? `<div style="margin-top: 5px; font-size: 11px; color: #888;">${
                                      doctor.district || ""
                                  }${
                                      doctor.district && doctor.state
                                          ? ", "
                                          : ""
                                  }${doctor.state || ""}</div>`
                                : ""
                        }
                        <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #ddd; font-size: 10px; color: #888;">
                            Lat: ${doctor.location.latitude.toFixed(6)}<br/>
                            Lng: ${doctor.location.longitude.toFixed(6)}
                        </div>
                    </div>
                `;

                marker.bindPopup(popupContent);
                doctorMarkersRef.current.push(marker);
            });
        }

        // Fit map to show all markers if there are any
        if (
            (showPatients && patients.length > 0) ||
            (showDoctors && doctors.length > 0)
        ) {
            const allMarkers = [
                ...(showPatients ? patientMarkersRef.current : []),
                ...(showDoctors ? doctorMarkersRef.current : []),
            ];
            if (allMarkers.length > 0) {
                const group = new L.featureGroup(allMarkers);
                map.current.fitBounds(group.getBounds().pad(0.1));
            }
        }
    }, [patients, doctors, showPatients, showDoctors, loading]);

    // Fetch locations on mount
    useEffect(() => {
        fetchLocations();
    }, [getToken]);

    return (
        <div className="relative w-full h-screen">
            {/* Control Panel */}
            <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-dark-surface rounded-lg shadow-lg p-4 min-w-[250px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Location Map
                    </h3>
                    <button
                        onClick={fetchLocations}
                        disabled={loading}
                        className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        title="Refresh locations">
                        <RefreshCw
                            className={`w-4 h-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                    </button>
                </div>

                {loading && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Loading locations...
                    </div>
                )}

                {/* Toggle Controls */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Patients ({patients.length})
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Doctors ({doctors.length})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />
        </div>
    );
};

export default LocationMapContent;
