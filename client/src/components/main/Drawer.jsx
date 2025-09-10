import { useState } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";

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
                                    <div className="px-4 sm:px-6">
                                        <DialogTitle className="text-base font-semibold text-light-primary-text dark:text-dark-primary-text">
                                            Panel title
                                        </DialogTitle>
                                    </div>
                                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                        {/* Your content */}
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
