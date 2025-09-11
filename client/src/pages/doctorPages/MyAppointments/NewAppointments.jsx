import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

const NewAppointments = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const token = await getToken();
                const res = await axios.get(
                    `http://localhost:5000/api/appointment/doctor/${user.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!mounted) return;
                setAppointments(res.data?.data || []);
            } catch (err) {
                setError("Failed to load appointments");
                console.error(err?.response?.data || err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [user, getToken]);

    const handleUpdateAppointmentStatus = async (appointment, newStatus) => {
        try {
            const token = await getToken();
            console.log(
                `${
                    newStatus === "confirmed" ? "Confirming" : "Cancelling"
                } appointment:`,
                appointment
            );

            // Make API call to update appointment status
            const response = await axios.put(
                `http://localhost:5000/api/appointment/${appointment._id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(response.data);
            console.log(`Appointment ${newStatus}:`, {
                appointmentId: appointment._id,
                patientName: appointment.patientId?.fullName,
                scheduledAt: appointment.scheduledAt,
                amount: appointment.amount,
                newStatus: newStatus,
                response: response.data,
            });

            setAppointments(
                appointments.map((appt) =>
                    appt._id === appointment._id ? response.data : appt
                )
            );
        } catch (error) {
            console.error(
                `Error ${
                    newStatus === "confirmed" ? "confirming" : "cancelling"
                } appointment:`,
                error
            );
            alert(
                `Failed to ${
                    newStatus === "confirmed" ? "confirm" : "cancel"
                } appointment. Please try again.`
            );
        }
    };

    const handleViewDetails = (appointment) => {
        console.log("Viewing appointment details:", {
            appointmentId: appointment._id,
            patientId: appointment.patientId?._id,
            patientName: appointment.patientId?.fullName,
            doctorId: appointment.doctorId?._id,
            doctorName: appointment.doctorId?.fullName,
            scheduledAt: appointment.scheduledAt,
            status: appointment.status,
            amount: appointment.amount,
            meetingLink: appointment.meetingLink,
            paymentStatus: appointment.payment?.status,
            paymentMethod: appointment.payment?.method,
            rating: appointment.rating,
            review: appointment.review,
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt,
        });

        // You could open a modal or navigate to a details page here
        alert(
            `Appointment Details:\n\nPatient: ${
                appointment.patientId?.fullName
            }\nScheduled: ${new Date(
                appointment.scheduledAt
            ).toLocaleString()}\nStatus: ${appointment.status}\nAmount: ₹${
                appointment.amount
            }\n\nCheck console for full details.`
        );
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    // Filter for pending appointments only
    const pendingAppointments = appointments.filter(
        (appt) => appt.status === "pending"
    );

    console.log("All appointments:", appointments);
    console.log("Pending appointments:", pendingAppointments);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-light-primary-text dark:text-dark-primary-text mb-4">
                New Appointments ({pendingAppointments.length})
            </h2>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {pendingAppointments.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-light-secondary-text dark:text-dark-secondary-text">
                        No pending appointments found.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                        <div
                            key={appointment._id}
                            className="bg-light-surface dark:bg-dark-bg rounded-xl p-6 border border-light-secondary-text/20 dark:border-dark-secondary-text/20 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Left Section - Patient Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {appointment.patientId?.fullName?.charAt(
                                                0
                                            ) || "P"}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                {appointment.patientId
                                                    ?.fullName ||
                                                    "Unknown Patient"}
                                            </h3>
                                            <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                                Patient ID:{" "}
                                                {appointment.patientId?._id ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                Scheduled:
                                            </span>
                                            <p className="font-medium text-light-primary-text dark:text-dark-primary-text">
                                                {new Date(
                                                    appointment.scheduledAt
                                                ).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                            <p className="text-light-secondary-text dark:text-dark-secondary-text">
                                                {new Date(
                                                    appointment.scheduledAt
                                                ).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                Consultation Fee:
                                            </span>
                                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                ₹{appointment.amount || 0}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                Status:
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ml-2">
                                                {appointment.status}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-light-secondary-text dark:text-dark-secondary-text">
                                                Appointment ID:
                                            </span>
                                            <p className="font-mono text-xs text-light-primary-text dark:text-dark-primary-text">
                                                {appointment._id}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section - Actions */}
                                <div className="flex flex-col gap-3 lg:min-w-[200px]">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                handleUpdateAppointmentStatus(
                                                    appointment,
                                                    "confirmed"
                                                )
                                            }
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleUpdateAppointmentStatus(
                                                    appointment,
                                                    "cancelled"
                                                )
                                            }
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                            Cancel
                                        </button>
                                    </div>

                                    <button
                                        onClick={() =>
                                            handleViewDetails(appointment)
                                        }
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewAppointments;
