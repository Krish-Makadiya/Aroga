import { useEffect, useState } from "react";
import axios from "axios";

const emptyRow = { medicine: "", dosage: "", frequency: "", notes: "" };

export default function PatientPrescriptionDialog({
    appointmentId,
    isOpen,
    onClose,
    existingPrescription = [],
    onUpdated,
}) {
    const [rows, setRows] = useState([emptyRow]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (existingPrescription?.length) {
                setRows(existingPrescription);
            } else {
                setRows([emptyRow]);
            }
        }
    }, [isOpen, existingPrescription]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (index, field, value) => {
        setRows((prev) =>
            prev.map((row, idx) =>
                idx === index ? { ...row, [field]: value } : row
            )
        );
    };

    const addRow = () => setRows((prev) => [...prev, emptyRow]);

    const removeRow = (index) =>
        setRows((prev) => prev.filter((_, idx) => idx !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!appointmentId) return;
        setSubmitting(true);
        try {
            const API_BASE_URL =
                import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            const payload = rows.filter((row) => row.medicine.trim());

            const { data } = await axios.put(
                `${API_BASE_URL}/api/appointment/${appointmentId}/prescription`,
                {
                    prescription: payload,
                }
            );

            if (data?.success) {
                onUpdated?.(data.data);
                onClose();
            }
        } catch (error) {
            console.error("Failed to save prescription:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-dark-bg p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Write Prescription
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {rows.map((row, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-300">
                                    Medicine *
                                </label>
                                <input
                                    type="text"
                                    value={row.medicine}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            "medicine",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-300">
                                    Dosage
                                </label>
                                <input
                                    type="text"
                                    value={row.dosage}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            "dosage",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-300">
                                    Frequency
                                </label>
                                <input
                                    type="text"
                                    value={row.frequency}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            "frequency",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-300">
                                    Notes
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={row.notes}
                                        onChange={(e) =>
                                            handleChange(
                                                index,
                                                "notes",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {rows.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="px-2 py-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={addRow}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">
                            + Add Medicine
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                                {submitting ? "Saving..." : "Save Prescription"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

