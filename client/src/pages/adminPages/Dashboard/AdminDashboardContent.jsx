import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import {
    Users,
    UserCheck,
    MapPin,
    Calendar,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Activity,
    ArrowUpRight,
    Phone,
    Mail,
} from "lucide-react";

const StatCard = ({ title, value, icon, color, subtitle }) => {
    // Extract base color name for badge styling
    const colorMap = {
        'from-indigo': { bg: 'bg-indigo-100', text: 'text-indigo-700', darkBg: 'dark:bg-indigo-900/30', darkText: 'dark:text-indigo-300' },
        'from-emerald': { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-300' },
        'from-rose': { bg: 'bg-rose-100', text: 'text-rose-700', darkBg: 'dark:bg-rose-900/30', darkText: 'dark:text-rose-300' },
        'from-sky': { bg: 'bg-sky-100', text: 'text-sky-700', darkBg: 'dark:bg-sky-900/30', darkText: 'dark:text-sky-300' },
    };
    
    const baseColor = Object.keys(colorMap).find(c => color.includes(c)) || 'from-indigo';
    const badgeColors = colorMap[baseColor] || colorMap['from-indigo'];

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800">
            <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${color} shadow-lg`}>
                        {icon}
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeColors.bg} ${badgeColors.text} ${badgeColors.darkBg} ${badgeColors.darkText}`}>
                        <Activity className="w-3 h-3 inline mr-1" />
                        Live
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value?.toLocaleString() || 0}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status, count, total }) => {
    const statusConfig = {
        pending: { 
            bgColor: "bg-amber-500", 
            textColor: "text-amber-700 dark:text-amber-400",
            iconColor: "text-amber-600 dark:text-amber-400",
            icon: Clock, 
            label: "Pending" 
        },
        confirmed: { 
            bgColor: "bg-blue-500", 
            textColor: "text-blue-700 dark:text-blue-400",
            iconColor: "text-blue-600 dark:text-blue-400",
            icon: CheckCircle2, 
            label: "Confirmed" 
        },
        completed: { 
            bgColor: "bg-emerald-500", 
            textColor: "text-emerald-700 dark:text-emerald-400",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            icon: CheckCircle2, 
            label: "Completed" 
        },
        cancelled: { 
            bgColor: "bg-red-500", 
            textColor: "text-red-700 dark:text-red-400",
            iconColor: "text-red-600 dark:text-red-400",
            icon: XCircle, 
            label: "Cancelled" 
        },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{config.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{count || 0}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${config.bgColor}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );

    if (!overview)
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
                    <p className="text-gray-600 dark:text-gray-400">Unable to load dashboard overview</p>
                </div>
            </div>
        );

    const {
        counts,
        appointmentsByStatus = {},
        upcoming = [],
        revenue = {},
        recentPatients = [],
    } = overview;

    const totalAppointments = counts?.appointments || 0;
    const totalStatusCount = Object.values(appointmentsByStatus).reduce((a, b) => a + b, 0);
    const completionRate = totalAppointments > 0 
        ? ((appointmentsByStatus.completed || 0) / totalAppointments * 100).toFixed(1)
        : 0;

    return (
        <div className="min-h-screen bg-light-bg">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Comprehensive insights into your platform's performance
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Data</span>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <StatCard
                    title="Total Patients"
                    value={counts?.patients ?? 0}
                    icon={<Users className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                    subtitle="Registered users"
                />
                <StatCard
                    title="Active Doctors"
                    value={counts?.doctors ?? 0}
                    icon={<UserCheck className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    subtitle="Verified professionals"
                />
                <StatCard
                    title="Pharmacies"
                    value={counts?.pharmacies ?? 0}
                    icon={<MapPin className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-br from-rose-500 to-rose-600"
                    subtitle="Partner locations"
                />
                <StatCard
                    title="Appointments"
                    value={counts?.appointments ?? 0}
                    icon={<Calendar className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-br from-sky-500 to-sky-600"
                    subtitle={`${completionRate}% completed`}
                />
            </div>

            {/* Secondary Stats and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Appointments Status Breakdown */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Appointments Status
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Distribution across all statuses
                            </p>
                        </div>
                        <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Total: {totalStatusCount}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {["pending", "confirmed", "completed", "cancelled"].map((status) => (
                            <StatusBadge
                                key={status}
                                status={status}
                                count={appointmentsByStatus[status] || 0}
                                total={totalStatusCount}
                            />
                        ))}
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-8 h-8 text-white/90" />
                        <TrendingUp className="w-5 h-5 text-white/80" />
                    </div>
                    <div className="mb-2">
                        <p className="text-emerald-100 text-sm font-medium mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold">₹{Number(revenue.total || 0).toLocaleString()}</p>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                        <div className="flex items-center justify-between">
                            <span className="text-emerald-100 text-sm">Paid Appointments</span>
                            <span className="text-white font-semibold">{revenue.paidAppointments || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Appointments and Recent Patients */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Upcoming Appointments */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Upcoming Appointments
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Next 24 hours
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {upcoming.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming appointments</p>
                            </div>
                        ) : (
                            upcoming.map((appointment) => (
                                <div
                                    key={appointment._id}
                                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {appointment.patientId?.fullName || "Unknown Patient"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    Dr. {appointment.doctorId?.fullName || "Unknown Doctor"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    {new Date(appointment.scheduledAt).toLocaleString('en-IN', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                                {appointment.status || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Patients */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Recent Signups
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Latest patient registrations
                            </p>
                        </div>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {recentPatients.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent signups</p>
                            </div>
                        ) : (
                            recentPatients.map((patient) => (
                                <div
                                    key={patient._id}
                                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-xs font-bold">
                                                        {patient.fullName?.charAt(0)?.toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {patient.fullName || "Unknown"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 ml-10">
                                                {patient.phone && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {patient.phone}
                                                        </p>
                                                    </div>
                                                )}
                                                {patient.email && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                                                            {patient.email}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                                {new Date(patient.createdAt).toLocaleDateString('en-IN', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-600">
                                                {new Date(patient.createdAt).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardContent;
