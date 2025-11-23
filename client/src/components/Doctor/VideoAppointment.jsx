import * as React from "react";
import { useEffect, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import axios from "axios";
import PatientDetailsDialog from "./PatientDetailsDialog";
import PatientPrescriptionDialog from "./PatientPrescriptionDialog";
import { useParams } from "react-router-dom";

function randomID(len) {
    let result = "";
    if (result) return result;
    var chars =
            "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
        maxPos = chars.length,
        i;
    len = len || 5;
    for (i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
}

export function getUrlParams(url = window.location.href) {
    let urlStr = url.split("?")[1];
    return new URLSearchParams(urlStr || "");
}

export default function VideoAppointment() {
    const { role = "" } = useParams();

    const normalizedRole =
        typeof role === "string"
            ? role.toLowerCase()
            : String(role || "").toLowerCase();

    const isDoctorView = normalizedRole === "doctor";

    // Get appointment ID from URL - this should be the appointment's MongoDB _id
    const appointmentIdFromUrl = getUrlParams().get("roomID");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(true);

    // Use appointment ID as roomID for ZegoCloud
    const roomID = selectedAppointment?._id || appointmentIdFromUrl;

    useEffect(() => {
        const updateMeetingLink = async () => {
            // Wait for appointment to be loaded to get the actual appointment ID
            if (!selectedAppointment?._id) return;

            try {
                // Construct meeting URL with role and appointment ID
                // window.location.pathname should already include /video-appointment/:role
                const meetingUrl =
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    window.location.pathname +
                    "?roomID=" +
                    selectedAppointment._id;

                const API_BASE_URL =
                    import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

                const response = await axios.put(
                    `${API_BASE_URL}/api/appointment/${selectedAppointment._id}/meeting-link`,
                    {
                        meetingLink: meetingUrl,
                    }
                );

                if (response.data?.success) {
                    console.log(
                        "Meeting link updated successfully:",
                        meetingUrl
                    );
                }
            } catch (error) {
                console.error("Error updating meeting link:", error);
            }
        };

        updateMeetingLink();
    }, [selectedAppointment?._id]);

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            // Require appointment ID from URL - no fallback to random ID
            if (!appointmentIdFromUrl) {
                console.error("Appointment ID (roomID) is required in URL");
                setLoadingDetails(false);
                return;
            }
            try {
                setLoadingDetails(true);
                const API_BASE_URL =
                    import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
                const { data } = await axios.get(
                    `${API_BASE_URL}/api/appointment/${appointmentIdFromUrl}`
                );

                if (data?.success) {
                    setSelectedAppointment(data.data);
                } else {
                    setSelectedAppointment(null);
                }
            } catch (error) {
                console.error("Failed to fetch appointment details:", error);
                setSelectedAppointment(null);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchAppointmentDetails();
    }, [appointmentIdFromUrl]);

    // Initialize meeting when roomID is available
    useEffect(() => {
        const container = document.querySelector('.myCallContainer');
        if (!container || !roomID) {
            return;
        }

        const initializeMeeting = async () => {
            try {
                // generate Kit Token
                const appID = 909640328;
                const serverSecret = "17dd38d36ceacce75350b72ab523289f";
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appID,
                    serverSecret,
                    roomID, // Use appointment ID as room ID
                    randomID(5), // User ID (can be random)
                    randomID(5) // User name (can be random)
                );

                // Create instance object from Kit Token.
                const zp = ZegoUIKitPrebuilt.create(kitToken);
                // start the call
                zp.joinRoom({
                    container: container,
                    sharedLinks: [
                        {
                            name: "Personal link",
                            showScreenSharingButton: false,
                            url:
                                window.location.protocol +
                                "//" +
                                window.location.host +
                                window.location.pathname +
                                "?roomID=" +
                                roomID,
                        },
                    ],
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                    },
                });
            } catch (error) {
                console.error("Error initializing meeting:", error);
            }
        };

        initializeMeeting();

        // Cleanup function
        return () => {
            // Cleanup if needed
        };
    }, [roomID]);

    const handleAppointmentUpdated = (updatedAppointment) => {
        setSelectedAppointment(updatedAppointment);
    };

    const actionDisabled = !selectedAppointment || loadingDetails;

    // Show error if appointment ID is not available
    if (!appointmentIdFromUrl) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                        Appointment ID Required
                    </h2>
                    <p className="text-red-600 dark:text-red-300">
                        Please access this page with a valid appointment ID in the URL.
                        <br />
                        Expected format: /video-appointment/{normalizedRole}?roomID=APPOINTMENT_ID
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen">
            {isDoctorView && (
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button
                        onClick={() => setIsDetailsOpen(true)}
                        disabled={actionDisabled}
                        className="bg-white/90 text-gray-800 px-4 py-2 rounded-md shadow border border-gray-200 backdrop-blur disabled:opacity-60 disabled:cursor-not-allowed hover:bg-white transition">
                        {loadingDetails ? "Loading..." : "Patient Details"}
                    </button>
                    <button
                        onClick={() => setIsPrescriptionOpen(true)}
                        disabled={actionDisabled}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
                        Add Prescription
                    </button>
                </div>
            )}

            {loadingDetails && !selectedAppointment && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-10">
                    <div className="text-center">
                        <p className="text-lg font-medium">Loading appointment details...</p>
                    </div>
                </div>
            )}

            <div
                className="myCallContainer"
                style={{ width: "100vw", height: "100vh" }}></div>

            {isDoctorView && (
                <>
                    <PatientDetailsDialog
                        appointment={selectedAppointment}
                        isOpen={isDetailsOpen}
                        onClose={() => setIsDetailsOpen(false)}
                    />

                    <PatientPrescriptionDialog
                        appointmentId={selectedAppointment?._id}
                        existingPrescription={
                            selectedAppointment?.prescription || []
                        }
                        isOpen={isPrescriptionOpen}
                        onClose={() => setIsPrescriptionOpen(false)}
                        onUpdated={handleAppointmentUpdated}
                    />
                </>
            )}
        </div>
    );
}
