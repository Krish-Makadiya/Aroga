import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { MapPin, Phone, Pill, Search, Crosshair, SlidersHorizontal } from "lucide-react";

const KM_TO_METERS = 1000;

const MedicineSearchContent = () => {
    const { getToken } = useAuth();

    const [activeTab, setActiveTab] = useState("medicine");

    // Medicine search state
    const [medicines, setMedicines] = useState([]);
    const [medLoading, setMedLoading] = useState(false);
    const [medError, setMedError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Nearby medical search state
    const [radiusKm, setRadiusKm] = useState(5);
    const [userLocation, setUserLocation] = useState(null);
    const [nearby, setNearby] = useState([]);
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const [nearbyError, setNearbyError] = useState("");

    const [pharmaciesById, setPharmaciesById] = useState({});

    // Derived categories for filter
    const categories = useMemo(() => {
        const set = new Set();
        medicines.forEach((m) => {
            if (m.category) set.add(m.category);
        });
        return Array.from(set);
    }, [medicines]);

    // Filtered medicines according to search + category
    const filteredMedicines = useMemo(() => {
        let list = medicines;

        if (searchTerm.trim()) {
            const s = searchTerm.toLowerCase();
            list = list.filter((m) => {
                return (
                    m.name?.toLowerCase().includes(s) ||
                    m.category?.toLowerCase().includes(s) ||
                    m.manufacturer?.toLowerCase().includes(s) ||
                    m.description?.toLowerCase().includes(s)
                );
            });
        }

        if (categoryFilter !== "all") {
            list = list.filter((m) => m.category === categoryFilter);
        }

        return list;
    }, [medicines, searchTerm, categoryFilter]);

    // Load medicines when first switching to medicine tab
    useEffect(() => {
        if (activeTab !== "medicine") return;
        if (medicines.length > 0 || medLoading) return;
        const fetchMeds = async () => {
            try {
                setMedLoading(true);
                setMedError("");
                const token = await getToken();
                const res = await axios.get("http://localhost:5000/api/medicine", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const raw = Array.isArray(res.data?.data) ? res.data.data : [];
                setMedicines(raw);

                // Ensure pharmacy details are loaded so we can show
                // which medical store has each medicine
                try {
                    await ensurePharmaciesLoaded();
                } catch (err) {
                    console.error("[MedicineSearch] load pharmacies error", err.response?.data || err.message);
                }
            } catch (e) {
                console.error("[MedicineSearch] fetch medicines error", e.response?.data || e.message);
                setMedError("Unable to load medicines right now.");
            } finally {
                setMedLoading(false);
            }
        };
        fetchMeds();
    }, [activeTab, medicines.length, medLoading, getToken]);

    // Load pharmacies list once (for joining with locations)
    const ensurePharmaciesLoaded = async () => {
        if (Object.keys(pharmaciesById).length > 0) return;
        const token = await getToken();
        const res = await axios.get("http://localhost:5000/api/pharmacy", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const map = {};
        data.forEach((p) => {
            if (p._id) map[p._id] = p;
        });
        setPharmaciesById(map);
    };

    const handleUseCurrentLocation = async () => {
        if (!navigator.geolocation) {
            setNearbyError("Geolocation is not supported by your browser.");
            return;
        }

        setNearbyError("");
        setNearbyLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setUserLocation(coords);

                try {
                    await ensurePharmaciesLoaded();
                    const token = await getToken();
                    const res = await axios.get(
                        `http://localhost:5000/api/pharmacyLocation/nearby`,
                        {
                            params: {
                                lat: coords.lat,
                                lng: coords.lng,
                                radius: radiusKm * KM_TO_METERS,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const raw = Array.isArray(res.data) ? res.data : [];
                    setNearby(raw);
                } catch (e) {
                    console.error("[MedicineSearch] nearby error", e.response?.data || e.message);
                    setNearbyError("Unable to find nearby medical stores right now.");
                } finally {
                    setNearbyLoading(false);
                }
            },
            (err) => {
                console.error("[MedicineSearch] geolocation error", err);
                setNearbyLoading(false);
                setNearbyError("Unable to get your current location. Please allow location access.");
            }
        );
    };

    const renderMedicineTab = () => {
        return (
            <div className="space-y-4">
                <div className="bg-light-surface dark:bg-dark-bg rounded-2xl p-5 shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Pill className="w-6 h-6 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]" />
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Search for Medicines
                                </h2>
                                <p className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                    Search by medicine name, category, manufacturer or composition.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, type, category, manufacturer..."
                                className="w-full pl-9 pr-3 py-2 rounded-md border border-[var(--color-light-secondary-text)]/30 dark:border-[var(--color-dark-secondary-text)]/30 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] text-sm text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] min-w-[160px]"
                        >
                            <option
                                value="all"
                                className="bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                            >
                                All Categories
                            </option>
                            {categories.map((c) => (
                                <option
                                    key={c}
                                    value={c}
                                    className="bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                                >
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {medLoading && (
                        <p className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                            Loading medicines...
                        </p>
                    )}
                    {medError && (
                        <p className="text-xs text-red-500 dark:text-red-400">{medError}</p>
                    )}

                    {!medLoading && filteredMedicines.length === 0 && !medError && (
                        <p className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                            No medicines found. Try a different search.
                        </p>
                    )}

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredMedicines.map((m) => {
                            const pharmacy = m.ownerId ? pharmaciesById[m.ownerId] : null;
                            const phone = pharmacy?.phone;
                            const displayName = pharmacy?.pharmacyName;
                            const address = pharmacy?.address;
                            const mapsUrl = displayName || address
                                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${displayName || ""} ${address || ""}`)}`
                                : null;

                            return (
                                <div
                                    key={m._id}
                                    className="rounded-xl border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] p-3 flex flex-col gap-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                            {m.name}
                                        </h3>
                                        {m.category && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-light-primary)]/10 dark:bg-[var(--color-dark-primary)]/20 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]">
                                                {m.category}
                                            </span>
                                        )}
                                    </div>
                                    {m.manufacturer && (
                                        <p className="text-[11px] text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                            Manufacturer: <span className="font-medium">{m.manufacturer}</span>
                                        </p>
                                    )}
                                    {m.description && (
                                        <p className="text-[11px] text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] line-clamp-3">
                                            {m.description}
                                        </p>
                                    )}
                                    {(m.mrp || m.price) && (
                                        <p className="text-[11px] text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mt-1">
                                            {m.price && (
                                                <span className="mr-2">Price: ₹{m.price}</span>
                                            )}
                                            {m.mrp && (
                                                <span className="text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                                    MRP: ₹{m.mrp}
                                                </span>
                                            )}
                                        </p>
                                    )}

                                    {pharmacy ? (
                                        <div className="mt-2 pt-2 border-t border-[var(--color-light-secondary-text)]/10 dark:border-[var(--color-dark-secondary-text)]/15">
                                            <p className="text-[10px] uppercase tracking-wide text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] mb-1">
                                                Available at
                                            </p>
                                            <p className="text-xs font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                                {displayName}
                                            </p>
                                            {address && (
                                                <p className="text-[11px] text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                                    {address}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {phone && (
                                                    <a
                                                        href={`tel:${phone}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-light-primary)]/10 dark:bg-[var(--color-dark-primary)]/15 text-[10px] font-medium text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)] hover:bg-[var(--color-light-primary)]/20 dark:hover:bg-[var(--color-dark-primary)]/25"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        Call Medical
                                                    </a>
                                                )}

                                                {mapsUrl && (
                                                    <a
                                                        href={mapsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-light-bg dark:bg-dark-bg text-[10px] font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] border border-[var(--color-light-secondary-text)]/30 dark:border-[var(--color-dark-secondary-text)]/30 hover:bg-[var(--color-light-primary)]/5 dark:hover:bg-[var(--color-dark-primary)]/10"
                                                    >
                                                        <MapPin className="w-3 h-3" />
                                                        View Location
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-[11px] text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                            Medical store details not linked for this medicine.
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-light-surface dark:bg-dark-bg rounded-2xl p-4 shadow-md text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                    Tip: To find a medical store near you, switch to the <span className="font-semibold">Medical Near Me</span> tab above.
                </div>
            </div>
        );
    };

    const renderNearbyTab = () => {
        return (
            <div className="space-y-4">
                <div className="bg-light-surface dark:bg-dark-bg rounded-2xl p-5 shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]" />
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Medical Near Me
                                </h2>
                                <p className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                    Use your current location to find nearby medical stores.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <SlidersHorizontal className="w-4 h-4 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]" />
                            <div className="flex flex-col w-full">
                                <label className="text-[11px] text-[var(--color-light-primary-text)] dark:text-white dark:!text-white mb-1">

                                    Search radius: {radiusKm} km
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={25}
                                    value={radiusKm}
                                    onChange={(e) => setRadiusKm(parseInt(e.target.value, 10) || 1)}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={nearbyLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white text-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Crosshair className="w-4 h-4" />
                            {nearbyLoading ? "Searching..." : "Use My Current Location"}
                        </button>
                    </div>

                    {userLocation && (
                        <p className="text-[11px] text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] mb-2">
                            Using your approximate location.
                        </p>
                    )}

                    {nearbyError && (
                        <p className="text-xs text-red-500 dark:text-red-400 mb-2">{nearbyError}</p>
                    )}

                    {!nearbyLoading && nearby.length === 0 && !nearbyError && (
                        <p className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                            No nearby medical stores found yet. Try searching again with a larger radius.
                        </p>
                    )}

                    <div className="mt-4 space-y-3">
                        {nearby.map((loc) => {
                            const coords = Array.isArray(loc.location?.coordinates)
                                ? loc.location.coordinates
                                : null;
                            const lng = coords ? coords[0] : null;
                            const lat = coords ? coords[1] : null;
                            const pharmacy = loc.ownerId ? pharmaciesById[loc.ownerId] : null;
                            const phone = pharmacy?.phone;
                            const displayName = pharmacy?.pharmacyName || loc.name || "Medical Store";
                            const address = pharmacy?.address || loc.address || "Address not available";

                            const mapsUrl = lat && lng
                                ? `https://www.google.com/maps?q=${lat},${lng}`
                                : null;

                            return (
                                <div
                                    key={loc._id}
                                    className="rounded-xl border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] p-3 flex flex-col gap-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] cursor-default">
                                            {displayName}
                                        </h3>
                                    </div>

                                    <p className="text-[11px] text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] flex items-start gap-1">
                                        <MapPin className="w-3.5 h-3.5 mt-[2px]" />
                                        <span>{address}</span>
                                    </p>

                                    {phone && (
                                        <p className="text-[11px] text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            <a
                                                href={`tel:${phone}`}
                                                className="text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)] hover:underline"
                                            >
                                                {phone} (Tap to call)
                                            </a>
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {phone && (
                                            <a
                                                href={`tel:${phone}`}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-light-primary)]/10 dark:bg-[var(--color-dark-primary)]/15 text-[10px] font-medium text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)] hover:bg-[var(--color-light-primary)]/20 dark:hover:bg-[var(--color-dark-primary)]/25"
                                            >
                                                <Phone className="w-3 h-3" />
                                                Call Now
                                            </a>
                                        )}

                                        {mapsUrl && (
                                            <a
                                                href={mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-light-bg dark:bg-dark-bg text-[10px] font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] border border-[var(--color-light-secondary-text)]/30 dark:border-[var(--color-dark-secondary-text)]/30 hover:bg-[var(--color-light-primary)]/5 dark:hover:bg-[var(--color-dark-primary)]/10"
                                            >
                                                <MapPin className="w-3 h-3" />
                                                View on Google Maps
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-light-background)] to-[var(--color-light-background-secondary)] dark:from-[var(--color-dark-background)] dark:to-[var(--color-dark-background-secondary)]">
            <div className="max-w-7xl mx-auto">
                <div className="relative mb-4 overflow-hidden rounded-3xl dark:bg-dark-bg bg-light-surface p-6 text-light-primary-text dark:text-dark-primary-text">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Search className="w-6 h-6 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]" />
                                <h1 className="text-2xl font-bold">
                                    Find Medicines & Medical Stores
                                </h1>
                            </div>
                            <p className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                Search medicines by name or category and quickly locate nearby medical stores with click-to-call and map directions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex gap-4 border-b border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20">
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none text-sm ${activeTab === "medicine"
                            ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                            : "bg-transparent text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                            }`}
                        onClick={() => setActiveTab("medicine")}
                    >
                        Search Medicines
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none text-sm ${activeTab === "nearby"
                            ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                            : "bg-transparent text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                            }`}
                        onClick={() => setActiveTab("nearby")}
                    >
                        Medical Near Me
                    </button>
                </div>

                {activeTab === "medicine" && renderMedicineTab()}
                {activeTab === "nearby" && renderNearbyTab()}
            </div>
        </div>
    );
};

export default MedicineSearchContent;
