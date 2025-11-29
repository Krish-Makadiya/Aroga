import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";

// Static locations data
const staticLocations = [
    {
        id: 1,
        name: "Lt Gen Shivdev Singh Civil Hospital",
        address: "Lt Gen Shivdev Singh Civil Hospital, Nabha, Punjab - 147201",
        latitude: 30.372326,
        longitude: 76.145926,
        phone: "+91 98765 41001",
        email: "civilhospital_nabha@example.com",
        mapLink: "https://maps.app.goo.gl/AYgeLqTtTDfDL1U66",
    },
    {
        id: 2,
        name: "Jain Hospital Nabha",
        address: "Jain Hospital Nabha, Punjab",
        latitude: 30.369387,
        longitude: 76.142731,
        phone: "+91 98765 41002",
        email: "jainhospital@example.com",
        mapLink: "https://maps.app.goo.gl/vvUL5h7YMd1AFfVk8",
    },
    {
        id: 3,
        name: "Raj General Hospital",
        address: "Raj General Hospital, Nabha, Punjab",
        latitude: 30.368518,
        longitude: 76.144431,
        phone: "+91 98765 41003",
        email: "rajgeneral@example.com",
        mapLink: "https://maps.app.goo.gl/5M3R2oRXtZFMHj9E6",
    },
    {
        id: 4,
        name: "Amardeep Hospital",
        address: "Amardeep Hospital, Near Land Mortgage Bank, Basant Pura Mohalla, Nabha, Punjab - 147201",
        latitude: 30.371447,
        longitude: 76.149195,
        phone: "+91 98765 41004",
        email: "amardeep@example.com",
        mapLink: "https://maps.app.goo.gl/maP6R8xNfxMoxfhM7",
    },
    {
        id: 5,
        name: "Shreya Hospital",
        address: "Shreya Hospital, Nabha, Punjab",
        latitude: 30.372112,
        longitude: 76.139943,
        phone: "+91 98765 41005",
        email: "shreyahospital@example.com",
        mapLink: "https://maps.app.goo.gl/AQ4X4VAWRXYnsgXM6",
    },
    {
        id: 6,
        name: "Divine Hospital",
        address: "Divine Hospital, Nabha, Punjab - 147201",
        latitude: 30.372731,
        longitude: 76.142287,
        phone: "+91 98765 41006",
        email: "divinehospital@example.com",
        mapLink: "https://maps.app.goo.gl/7Vd8cja8DCUjDE6K9",
    },
    {
        id: 7,
        name: "Sawhney Hospital and Maternity Home",
        address: "Sawhney Hospital and Maternity Home, Nabha, Punjab",
        latitude: 30.375419,
        longitude: 76.155166,
        phone: "+91 98765 41007",
        email: "sawhneyhospital@example.com",
        mapLink: "https://maps.app.goo.gl/k6ynDABgEv43VQ7V8",
    },
    {
        id: 8,
        name: "Nabha Medicare Hospital",
        address: "Nabha Medicare Hospital, Nabha, Punjab",
        latitude: 30.386675,
        longitude: 76.1511,
        phone: "+91 98765 41008",
        email: "nabhamedicare@example.com",
        mapLink: "https://maps.app.goo.gl/TXxzbYyXa36yNqYc6",
    },
    {
        id: 9,
        name: "Jiwan Nursing Home",
        address: "Jiwan Nursing Home, Nabha, Punjab",
        latitude: 30.376967,
        longitude: 76.148051,
        phone: "+91 98765 41009",
        email: "jiwannursinghome@example.com",
        mapLink: "https://maps.app.goo.gl/VFE41bWoNrQaDAEZ6",
    },
    {
        id: 10,
        name: "Sukhmani Hospital (Orthopedic & General Hospital)",
        address: "Sukhmani Hospital, Nabha, Punjab",
        latitude: 30.36662,
        longitude: 76.152303,
        phone: "+91 98765 41010",
        email: "sukhmanihospital@example.com",
        mapLink: "https://maps.app.goo.gl/3bEoDbz3A2uWDFY17",
    }
];


const LocationMapContent = () => {
    const mapRef = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);

    // Calculate center point of all locations
    const centerLat =
        staticLocations.reduce((sum, loc) => sum + loc.latitude, 0) /
        staticLocations.length;
    const centerLng =
        staticLocations.reduce((sum, loc) => sum + loc.longitude, 0) /
        staticLocations.length;

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

    // Initialize map with static markers
    useEffect(() => {
        if (!mapRef.current || map.current) return;

        // Initialize map centered on average of all locations
        map.current = L.map(mapRef.current).setView([centerLat, centerLng], 12);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map.current);

        // Create markers for each static location
        staticLocations.forEach((location) => {
            const marker = L.marker([location.latitude, location.longitude], {
                draggable: false, // Static markers - not draggable
            }).addTo(map.current);

            // Create popup content
            const popupContent = `
                <div style="min-width: 200px;">
                    <b style="font-size: 14px; color: #2563eb;">${
                        location.name
                    }</b><br/>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">${
                        location.address
                    }</p>
                    <div style="margin-top: 8px; font-size: 11px;">
                        <div style="margin: 3px 0;">📞 ${location.phone}</div>
                        <div style="margin: 3px 0;">✉️ ${location.email}</div>
                        <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #ddd; color: #888;">
                            Lat: ${location.latitude.toFixed(6)}<br/>
                            Lng: ${location.longitude.toFixed(6)}
                        </div>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            markersRef.current.push(marker);
        });

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
            markersRef.current = [];
        };
    }, []);

    // Function to focus on a specific location
    const focusOnLocation = (location) => {
        if (map.current) {
            map.current.setView([location.latitude, location.longitude], 15);
            // Open popup for the selected marker
            const marker = markersRef.current.find(
                (m) =>
                    m.getLatLng().lat === location.latitude &&
                    m.getLatLng().lng === location.longitude
            );
            if (marker) {
                marker.openPopup();
            }
        }
    };

    return (
        <div className="">
            <div className="">
                <div
                    ref={mapRef}
                    className="w-full h-screen "
                    style={{ zIndex: 0 }}
                />
            </div>
        </div>
    );
};

export default LocationMapContent;
