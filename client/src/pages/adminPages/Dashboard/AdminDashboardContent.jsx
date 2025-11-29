import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { Users, UserCheck, MapPin, Calendar, DollarSign } from "lucide-react";

const StatCard = ({ title, value, icon, color = "bg-blue-500" }) => (
    <div className="p-4 rounded-2xl shadow-md bg-white dark:bg-dark-surface">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md text-white ${color}`}>{icon}</div>
            <div>
                <div className="text-xs text-muted">{title}</div>
                <div className="text-xl font-bold">{value}</div>
            </div>
        </div>
    </div>
);

const AdminDashboardContent = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const { getToken } = useAuth();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const token = await getToken().catch(() => null);
                const base = import.meta.env.VITE_SERVER_URL || "";
                const res = await axios.get(`${base}/api/admin/overview`, {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                });
                if (!mounted) return;
                setOverview(res.data.data || null);
            } catch (err) {
                console.error(
                    "Failed to load admin overview",
                    err?.response?.data || err?.message || err
                );
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [getToken]);

    if (loading)
        return (
            <div className="min-h-[300px] flex items-center justify-center">
                Loading...
            </div>
        );

    if (!overview)
        return <div className="p-6">No overview data available.</div>;

    const {
        counts,
        appointmentsByStatus = {},
        upcoming = [],
        revenue = {},
        recentPatients = [],
    } = overview;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Admin dashboard</h1>
                    <p className="text-sm text-muted mt-1">
                        High-level overview of platform metrics
                    </p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Patients"
                    value={counts?.patients ?? 0}
                    icon={<Users className="w-5 h-5" />}
                    color={"bg-indigo-600"}
                />
                <StatCard
                    title="Doctors"
                    value={counts?.doctors ?? 0}
                    icon={<UserCheck className="w-5 h-5" />}
                    color={"bg-emerald-600"}
                />
                <StatCard
                    title="Pharmacies"
                    value={counts?.pharmacies ?? 0}
                    icon={<MapPin className="w-5 h-5" />}
                    color={"bg-rose-600"}
                />
                <StatCard
                    title="Appointments"
                    value={counts?.appointments ?? 0}
                    icon={<Calendar className="w-5 h-5" />}
                    color={"bg-sky-600"}
                />
            </div>

            {/* Second row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">
                            Appointments by status
                        </h3>
                        <span className="text-xs text-muted">Overview</span>
                    </div>
                    <div className="space-y-2">
                        {["pending", "confirmed", "completed", "cancelled"].map(
                            (s) => (
                                <div
                                    key={s}
                                    className="flex items-center justify-between text-sm">
                                    <div className="capitalize text-xs text-muted">
                                        {s}
                                    </div>
                                    <div className="font-semibold">
                                        {appointmentsByStatus[s] || 0}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Revenue</h3>
                        <div className="text-xs text-muted">
                            Paid appointments: {revenue.paidAppointments || 0}
                        </div>
                    </div>
                    <div className="text-2xl font-bold">
                        ₹{Number(revenue.total || 0).toLocaleString()}
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Upcoming (24h)</h3>
                        <span className="text-xs text-muted">
                            Next 24 hours
                        </span>
                    </div>
                    <div className="space-y-2 text-sm">
                        {upcoming.length === 0 && (
                            <div className="text-muted">
                                No upcoming appointments
                            </div>
                        )}
                        {upcoming.map((a) => (
                            <div
                                key={a._id}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-light-background/50 dark:hover:bg-dark-background/50 transition-colors">
                                <div>
                                    <div className="font-semibold">
                                        {a.patientId?.fullName || "—"}
                                    </div>
                                    <div className="text-xs text-muted">
                                        {a.doctorId?.fullName || "—"}
                                    </div>
                                </div>
                                <div className="text-xs text-muted">
                                    {new Date(a.scheduledAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent users */}
            <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface shadow-md">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Recent patient signups</h3>
                    <span className="text-xs text-muted">Latest</span>
                </div>
                <div className="divide-y">
                    {recentPatients.length === 0 && (
                        <div className="text-muted p-2">No recent signups</div>
                    )}
                    {recentPatients.map((p) => (
                        <div
                            key={p._id}
                            className="p-2 flex items-center justify-between">
                            <div>
                                <div className="font-semibold">
                                    {p.fullName}
                                </div>
                                <div className="text-xs text-muted">
                                    {p.email || p.phone}
                                </div>
                            </div>
                            <div className="text-xs text-muted">
                                {new Date(p.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardContent;
