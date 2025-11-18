import React, { useState } from "react";
import {
    Stethoscope,
    Calendar,
    IndianRupee,
    CheckCircle2,
    Clock,
    Mail,
    Phone,
    Star,
    Link as LinkIcon,
    FileText,
    User2,
    ThumbsUp,
    ThumbsDown,
    Info,
    XCircle,
    CreditCard,
    Receipt,
} from "lucide-react";
import Drawer from "../main/Drawer";
import toast from "react-hot-toast";
import axios from "axios";
import { useRazorpay } from "react-razorpay";

const AppointmentsList = ({ appointments }) => {
    const [open, setOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [processingPaymentId, setProcessingPaymentId] = useState(null);

    const { Razorpay } = useRazorpay();

    const savePaymentEntry = async ({
        appointmentId,
        status,
        orderId,
        paymentId,
    }) => {
        const response = await axios.post(
            `http://localhost:5000/api/payment/save-payment`,
            {
                appointmentId,
                status,
                orderId,
                paymentId,
            }
        );
        if (!response.data?.success) {
            throw new Error(response.data?.message || "Unable to save payment");
        }
        return response.data.data;
    };

    const paymentClickHandler = async (appointmentId, amount) => {
        try {
            const res = await axios.post(
                "http://localhost:5000/api/payment/create-order",
                { amount },
                { headers: { "Content-Type": "application/json" } }
            );

            var options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: res.data.data.amount,
                currency: "INR",
                name: "Arogya",
                description: "Test Transaction",
                image: "https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600",
                order_id: res.data.data.id,
                handler: (res) =>
                    savePaymentEntry({
                        appointmentId,
                        status: "paid",
                        orderId: res.razorpay_order_id,
                        paymentId: res.razorpay_payment_id,
                    }),
                prefill: {
                    //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
                    name: "Gaurav Kumar", //your customer's name
                    email: "gaurav.kumar@example.com",
                    contact: "+919876543210", //Provide the customer's phone number for better conversion rates
                },
                notes: {
                    address: "Razorpay Corporate Office",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            var rzp1 = new Razorpay(options);

            rzp1.on("payment.failed", function (response) {
                alert(response.error.code);
                alert(response.error.description);
                alert(response.error.source);
                alert(response.error.step);
                alert(response.error.reason);
                alert(response.error.metadata.order_id);
                alert(response.error.metadata.payment_id);
            });

            rzp1.open();
        } catch (error) {
            console.error("Error creating payment order:", error);
            toast.error("Error creating payment order");
        }
    };

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appt) => {
                const doc = appt.doctorId;
                const date = new Date(appt.scheduledAt);
                return (
                    <div
                        key={appt._id}
                        className="rounded-2xl dark:bg-dark-bg bg-light-surface p-5 shadow-md border border-[var(--color-light-primary)]/10 dark:border-[var(--color-dark-primary)]/10 flex flex-col gap-3">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-light-primary)]/10 dark:bg-[var(--color-dark-primary)]/10 flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                            Dr. {doc?.fullName || "Unknown"}
                                        </h3>
                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                            <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                            Appointment
                                        </span>
                                    </div>
                                    {doc?.rating?.average && (
                                        <span className="flex items-center gap-1 text-xs px-3 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ml-2">
                                            <div className="flex gap-1 items-center">
                                                <Star size={20} />
                                                <p>
                                                    {doc.rating.average.toFixed(
                                                        1
                                                    )}
                                                </p>
                                            </div>
                                            <span className="ml-1">
                                                ({doc.rating.count ?? 0})
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-1">
                                    {doc?.qualifications && (
                                        <p className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                            | {doc.qualifications}
                                        </p>
                                    )}
                                    {doc?.id && (
                                        <p className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                            ID: {doc.id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <hr className="my-1 border-[var(--color-light-secondary-text)]/10 dark:border-[var(--color-dark-secondary-text)]/10" />
                        {/* Appointment Info */}
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <span className="text-md font-medium text-light-primary-text dark:text-dark-primary-text">
                                    {date.toLocaleDateString()}{" "}
                                    {date.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {appt.status === "pending" && (
                                    <span className="flex items-center gap-1 text-sm capitalize px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 font-semibold">
                                        <Clock className="w-4 h-4 text-yellow-500" />{" "}
                                        Pending
                                    </span>
                                )}
                                {appt.status === "confirmed" && (
                                    <span className="flex items-center gap-1 text-sm capitalize px-2 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-semibold">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />{" "}
                                        Confirmed
                                    </span>
                                )}
                                {appt.status === "completed" && (
                                    <span className="flex items-center gap-1 text-sm capitalize px-2 py-1 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-semibold">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />{" "}
                                        Completed
                                    </span>
                                )}
                                {appt.status === "cancelled" && (
                                    <span className="flex items-center gap-1 text-sm capitalize px-2 py-1 rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-semibold">
                                        <XCircle className="w-4 h-4 text-red-500" />{" "}
                                        Cancelled
                                    </span>
                                )}
                                {[
                                    "pending",
                                    "confirmed",
                                    "completed",
                                    "cancelled",
                                ].indexOf(appt.status) === -1 && (
                                    <span className="flex items-center gap-1 text-sm capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 font-semibold">
                                        <Clock className="w-4 h-4 text-gray-500" />{" "}
                                        {appt.status}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-emerald-600" />
                                <span className="text-lg text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    {doc?.consultationFee ?? appt.amount ?? 0}
                                </span>
                                <span className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                    / consultation
                                </span>
                            </div>
                        </div>

                        <hr className="my-1 border-[var(--color-light-secondary-text)]/10 dark:border-[var(--color-dark-secondary-text)]/10" />

                        {/* Doctor Contact */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-6 items-center mt-1">
                                {doc?.email && (
                                    <span className="flex items-center gap-1 text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                        <Mail className="w-4 h-4 mr-1" />{" "}
                                        {doc.email}
                                    </span>
                                )}
                                {doc?.phone && (
                                    <span className="flex items-center gap-1 text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                        <Phone className="w-4 h-4 mr-1" />{" "}
                                        {doc.phone}
                                    </span>
                                )}
                            </div>
                            {/* Meeting Link */}
                            {appt.meetingLink && (
                                <div className="flex items-center gap-1 mt-1">
                                    <LinkIcon className="w-4 h-4 text-blue-500" />
                                    <a
                                        href={appt.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 underline break-all">
                                        Join Meeting
                                    </a>
                                </div>
                            )}
                            {/* Payment Info */}
                            {appt.payment && (
                                <div className="flex flex-col gap-2 mt-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <CreditCard className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                            Payment Status:
                                        </span>
                                        {appt.payment.status === "paid" && (
                                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-semibold">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Paid
                                            </span>
                                        )}
                                        {appt.payment.status === "pending" && (
                                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 font-semibold">
                                                <Clock className="w-3 h-3" />
                                                Pending
                                            </span>
                                        )}
                                        {appt.payment.status === "failed" && (
                                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-semibold">
                                                <XCircle className="w-3 h-3" />
                                                Failed
                                            </span>
                                        )}
                                        {![
                                            "paid",
                                            "pending",
                                            "failed",
                                        ].includes(appt.payment.status) && (
                                            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 font-semibold capitalize">
                                                {appt.payment.status}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 ml-6">
                                        {appt.payment.orderId && (
                                            <div className="flex items-center gap-1 text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                                <Receipt className="w-3.5 h-3.5 mr-0.5" />
                                                <span>
                                                    Order ID:{" "}
                                                    {appt.payment.orderId}
                                                </span>
                                            </div>
                                        )}
                                        {appt.payment.paymentId && (
                                            <div className="flex items-center gap-1 text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                                <CreditCard className="w-3.5 h-3.5 mr-0.5" />
                                                <span>
                                                    Payment ID:{" "}
                                                    {appt.payment.paymentId}
                                                </span>
                                            </div>
                                        )}
                                        {appt.payment.paidAt && (
                                            <div className="flex items-center gap-1 text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                                <Calendar className="w-3.5 h-3.5 mr-0.5" />
                                                <span>
                                                    Paid on:{" "}
                                                    {new Date(
                                                        appt.payment.paidAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Review/Rating */}
                            {(appt.rating || appt.review) && (
                                <div className="flex items-center gap-1 mt-1">
                                    <ThumbsUp className="w-4 h-4 text-green-500" />
                                    {appt.rating && (
                                        <span className="text-xs">
                                            Rated: {appt.rating} / 5
                                        </span>
                                    )}
                                    {appt.review && (
                                        <span className="text-xs italic text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                            "{appt.review}"
                                        </span>
                                    )}
                                </div>
                            )}
                            {/* Meta Info */}
                            <div className="flex flex-wrap gap-1 items-center mt-2 text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                <Info className="w-4 h-4" />
                                <span>Appointment ID: {appt._id}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            {appt.status === "confirmed" &&
                                appt.payment?.status !== "paid" && (
                                    <button
                                        onClick={() =>
                                            paymentClickHandler(
                                                appt._id,
                                                appt.amount ??
                                                    doc?.consultationFee ??
                                                    0
                                            )
                                        }
                                        disabled={
                                            processingPaymentId === appt._id
                                        }
                                        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition">
                                        {processingPaymentId === appt._id
                                            ? "Processing..."
                                            : "Pay Now"}
                                    </button>
                                )}
                            {appt.payment?.status === "paid" && (
                                <span className="flex items-center gap-1 text-sm px-3 py-2 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-semibold">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Paid
                                </span>
                            )}
                            <button
                                className="bg-light-primary dark:bg-dark-primary py-2 px-4 rounded-md"
                                onClick={() => {
                                    setSelectedDoctor(doc);
                                    setOpen(true);
                                }}>
                                View Doctor
                            </button>
                        </div>
                        {open && selectedDoctor && (
                            <Drawer
                                open={open}
                                setOpen={setOpen}
                                doctor={selectedDoctor}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default AppointmentsList;
