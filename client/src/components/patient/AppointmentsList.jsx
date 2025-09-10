import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react";
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
} from "lucide-react";
import Drawer from "../main/Drawer";

const AppointmentsList = ({ appointments }) => {
    const [open, setOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

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
                                <div className="flex items-center gap-1 mt-1">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs  text-light-secondary-text dark:text-dark-secondary-text">
                                        Payment: {appt.payment.status}
                                    </span>
                                    {appt.payment.transactionId && (
                                        <span className="text-xs">
                                            | Txn: {appt.payment.transactionId}
                                        </span>
                                    )}
                                    {appt.payment.paidAt && (
                                        <span className="text-xs">
                                            | Paid:{" "}
                                            {new Date(
                                                appt.payment.paidAt
                                            ).toLocaleString()}
                                        </span>
                                    )}
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
                                <span>
                                    Created:{" "}
                                    {new Date(appt.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <button className="bg-light-primary dark:bg-dark-primary py-2 px-4 w-fit rounded-md self-end"
                            onClick={() => {
                                setSelectedDoctor(doc);
                                setOpen(true);
                            }}>
                            View Doctor
                        </button>
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
