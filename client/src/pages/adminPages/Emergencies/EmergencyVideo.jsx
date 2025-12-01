import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const ZegoUIKitPrebuilt = window.ZegoUIKitPrebuilt;

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

// Helper function to get URL parameters
function getUrlParams(url = window.location.href) {
    let urlStr = url.split("?")[1];
    console.log("URL Parameters:", url);
    return new URLSearchParams(urlStr || "");
}

export default function EmergencyVideo() {
    const [searchParams] = useSearchParams();
    console.log("Search Params:", searchParams);
    // Get roomID from URL parameter - this ensures both users use the same ID
    const roomIDFromUrl =
        searchParams.get("roomID") || getUrlParams().get("roomID");

    // Use the roomID from URL, or show error if not provided
    const [roomID, setRoomID] = useState(roomIDFromUrl);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!roomIDFromUrl) {
            setError(
                "Room ID is required. Please provide roomID in the URL: ?roomID=YOUR_ROOM_ID"
            );
            console.error("Room ID is required in URL");
            return;
        }

        setRoomID(roomIDFromUrl);
        console.log("Using Room ID from URL:", roomIDFromUrl);
    }, [roomIDFromUrl]);

    // Initialize meeting when roomID is available
    useEffect(() => {
        const container = document.querySelector(".myCallContainer");
        if (!container || !roomID) {
            return;
        }

        const initializeMeeting = async () => {
            try {
                const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");

                // Generate Kit Token with consistent roomID
                const appID = parseInt(
                    import.meta.env.VITE_ZEGOCCLOUD_EMERGENCY_APP_ID
                );
                const serverSecret = import.meta.env
                    .VITE_ZEGOCLOUD_EMERGENCY_SERVER_SECRET;

                // Use consistent roomID from URL - both users will use the same ID
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appID,
                    serverSecret,
                    roomID, // Consistent room ID from URL - both users join same room
                    randomID(5), // User ID (unique per user)
                    randomID(5) // User name (unique per user)
                );

                console.log("Joining room with ID:", roomID);

                // Create instance object from Kit Token
                const zp = ZegoUIKitPrebuilt.create(kitToken);

                // Start the call
                zp.joinRoom({
                    container: container,
                    sharedLinks: [
                        {
                            name: "Emergency Video Call",
                            showScreenSharingButton: false,
                            url:
                                window.location.protocol +
                                "//" +
                                window.location.host +
                                "/emergency-appointment" +
                                "?roomID=" +
                                roomID.toString() +
                                "%" +
                                Date.now().toString(),
                        },
                    ],
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                    },
                });
            } catch (error) {
                console.error("Error initializing meeting:", error);
                setError("Failed to initialize video call: " + error.message);
            }
        };

        initializeMeeting();

        // Cleanup function
        return () => {
            // Cleanup if needed
        };
    }, [roomID]);

    if (error) {
        return (
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "20px",
                    backgroundColor: "#f3f4f6",
                }}>
                <div
                    style={{
                        padding: "20px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        maxWidth: "500px",
                        textAlign: "center",
                    }}>
                    <h2 style={{ color: "#ef4444", marginBottom: "10px" }}>
                        Error
                    </h2>
                    <p style={{ color: "#6b7280", marginBottom: "20px" }}>
                        {error}
                    </p>
                    <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                        Make sure the URL includes:{" "}
                        <code>?roomID=YOUR_ROOM_ID</code>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="myCallContainer"
            style={{ width: "100vw", height: "100vh" }}></div>
    );
}
