import { useState } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    TransitionChild,
} from "@headlessui/react";
import {
    X,
    Phone,
    Mail,
    MapPin,
    Star,
    CheckCircle2,
    Calendar,
    User2,
    IndianRupee,
} from "lucide-react";

export default function Drawer({ open, setOpen, doctor }) {
    console.log(doctor);

    return (
        <div>
            <Dialog open={open} onClose={setOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-light-bg/50 dark:bg-dark-bg/50 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
                />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <DialogPanel
                                transition
                                className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700">
                                <TransitionChild>
                                    <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4">
                                        <button
                                            type="button"
                                            onClick={() => setOpen(false)}
                                            className="relative rounded-md text-light-primary hover:text-light-primary-hover dark:text-dark-primary hover:dark:text-dark-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                                            <span className="absolute -inset-2.5" />
                                            <span className="sr-only">
                                                Close panel
                                            </span>
                                            <X
                                                aria-hidden="true"
                                                className="w-6 h-6"
                                            />
                                        </button>
                                    </div>
                                </TransitionChild>

                                <div className="relative flex h-full flex-col overflow-y-auto bg-light-surface dark:bg-dark-surface py-6 shadow-xl after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-white/10">
                                    <div className="px-6 sm:px-8">
                                        <DialogTitle className="md:text-xl font-bold text-light-primary-text dark:text-dark-primary-text leading-tight">
                                            {doctor?.fullName
                                                ? `Dr. ${doctor.fullName}`
                                                : "Doctor Profile"}
                                        </DialogTitle>
                                    </div>

                                    <div className="relative mt-6 flex-1 px-6 sm:px-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 flex items-center justify-center font-semibold text-light-primary dark:text-dark-primary">
                                                    {doctor?.fullName
                                                        ? doctor.fullName
                                                              .split(" ")
                                                              .map((n) => n[0])
                                                              .slice(0, 2)
                                                              .join("")
                                                        : "DR"}
                                                </div>

                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl md:text-lg font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                            {doctor?.fullName ||
                                                                "Dr. —"}
                                                        </h3>
                                                        {doctor?.verificationStatus ===
                                                            "verified" && (
                                                            <span className="inline-flex w-fit items-center gap-1 text-sm p-1 rounded-full bg-green-100 dark:bg-green-900/30 text-light-success dark:text-dark-success">
                                                                <CheckCircle2 />
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-xs font-medium text-light-secondary-text dark:text-dark-secondary-text">
                                                        ID:{" "}
                                                        {doctor?.id ||
                                                            doctor?._id}
                                                    </div>
                                                    <div className="text-sm md:text-base text-light-secondary-text dark:text-dark-secondary-text mt-2">
                                                        {doctor?.specialty ||
                                                            "General Practice"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1 text-light-secondary-text dark:text-dark-secondary-text">
                                                    <div className="text-xs uppercase tracking-wide font-medium">
                                                        Rating
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="inline-flex items-center justify-center p-2 rounded-full bg-yellow-50 dark:bg-yellow-900/10">
                                                            <Star className="text-yellow-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xl font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                                {(
                                                                    doctor
                                                                        ?.rating
                                                                        ?.average ??
                                                                    0
                                                                ).toFixed(1)}
                                                            </div>
                                                            <div className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                                                {doctor?.rating
                                                                    ?.count ??
                                                                    0}{" "}
                                                                reviews
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1 text-light-secondary-text dark:text-dark-secondary-text">
                                                    <div className="text-xs uppercase tracking-wide font-medium">
                                                        Experience
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="inline-flex items-center justify-center p-2 rounded-full bg-blue-50 dark:bg-blue-900/10">
                                                            <Calendar className="text-blue-500" />
                                                        </div>
                                                        <div className="text-xl font-semibold text-light-primary-text dark:text-dark-primary-text">
                                                            {doctor?.experience
                                                                ? `${doctor.experience} yrs`
                                                                : "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {doctor?.bio && (
                                                <div className="text-sm md:text-base text-light-primary-text dark:text-dark-primary-text leading-relaxed max-h-[40vh] overflow-auto">
                                                    {doctor.bio}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-5 h-5 text-light-secondary-text dark:text-dark-secondary-text mt-1" />
                                                    <div>
                                                        <div className="text-xs uppercase text-light-secondary-text dark:text-dark-secondary-text">
                                                            Email
                                                        </div>
                                                        <div className="mt-1 text-base text-light-primary-text dark:text-dark-primary-text break-all">
                                                            {doctor?.email ||
                                                                "—"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-5 h-5 text-light-secondary-text dark:text-dark-secondary-text mt-1" />
                                                    <div>
                                                        <div className="text-xs uppercase text-light-secondary-text dark:text-dark-secondary-text">
                                                            Phone
                                                        </div>
                                                        <div className="mt-1 text-base text-light-primary-text dark:text-dark-primary-text">
                                                            {doctor?.phone ||
                                                                "—"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-5 h-5 text-light-secondary-text dark:text-dark-secondary-text mt-1" />
                                                    <div>
                                                        <div className="text-xs uppercase text-light-secondary-text dark:text-dark-secondary-text">
                                                            Location
                                                        </div>
                                                        <div className="mt-1 text-base text-light-primary-text dark:text-dark-primary-text">
                                                            {doctor?.district ||
                                                            doctor?.state
                                                                ? `${
                                                                      doctor?.district ||
                                                                      ""
                                                                  }${
                                                                      doctor?.district &&
                                                                      doctor?.state
                                                                          ? ", "
                                                                          : ""
                                                                  }${
                                                                      doctor?.state ||
                                                                      ""
                                                                  }`
                                                                : "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start gap-2">
                                                <div className="text-xs uppercase text-light-secondary-text dark:text-dark-secondary-text">
                                                    Languages
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.isArray(
                                                        doctor?.languages
                                                    ) &&
                                                    doctor.languages.length >
                                                        0 ? (
                                                        doctor.languages.map(
                                                            (l, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-3 py-1 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 text-sm text-light-primary dark:text-dark-primary">
                                                                    {l}
                                                                </span>
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                                            Not specified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
