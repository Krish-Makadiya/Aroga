import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export default function CreateBill({ ownerId, pharmacyName }) {
    const { getToken } = useAuth();

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [discountPercent, setDiscountPercent] = useState("");

    const [items, setItems] = useState([{ name: "", quantity: 1, price: 0 }]);

    const [activeIndex, setActiveIndex] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    const [dropdownPos, setDropdownPos] = useState({
        top: 0,
        left: 0,
        width: 0,
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleItemChange = (index, field, value) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: value };
        setItems(next);

        // update dropdown position
        if (field === "name") {
            setActiveIndex(index);
            const el = document.getElementById(`med-input-${index}`);
            if (el) {
                const rect = el.getBoundingClientRect();
                setDropdownPos({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width,
                });
            }

            fetchSuggestions(value, index);
        }
    };

    const fetchSuggestions = async (query, index) => {
        if (!ownerId) return;
        const trimmed = (query || "").trim();
        if (!trimmed) {
            setSuggestions([]);
            return;
        }

        try {
            setSuggestionsLoading(true);
            const token = await getToken();
            const res = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/pharmacyBill/medicine/suggestions`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { q: trimmed, ownerId },
                }
            );

            const raw = Array.isArray(res.data?.data) ? res.data.data : [];
            setActiveIndex(index);
            setSuggestions(raw);
        } catch (err) {
            console.error("[CreateBill] suggestions error", err);
            setSuggestions([]);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const handleSelectSuggestion = (index, suggestion) => {
        const normalizedName = (suggestion.name || "").trim();
        if (!normalizedName) {
            return;
        }

        const next = [...items];
        const existingIndex = next.findIndex(
            (it, i) =>
                i !== index &&
                (it.name || "").trim().toLowerCase() === normalizedName.toLowerCase()
        );

        if (existingIndex !== -1) {
            const existing = next[existingIndex];
            const existingQty = Number(existing.quantity) || 0;
            const currentQty = Number(next[index].quantity) || 1;
            next[existingIndex] = {
                ...existing,
                quantity: existingQty + currentQty,
                price: suggestion.price ?? existing.price ?? 0,
            };
            if (index !== existingIndex) {
                next.splice(index, 1);
            }
        } else {
            next[index] = {
                ...next[index],
                name: normalizedName,
                price: suggestion.price ?? next[index].price,
            };
        }

        setItems(next);
        setSuggestions([]);
        setActiveIndex(null);
    };

    const addItemRow = () => {
        setItems((prev) => [...prev, { name: "", quantity: 1, price: 0 }]);
    };

    const removeItemRow = (index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const grossTotal = items.reduce((sum, item) => {
        const q = Number(item.quantity) || 0;
        const p = Number(item.price) || 0;
        return sum + q * p;
    }, 0);

    const safeDiscountPercent = Math.min(
        Math.max(Number(discountPercent) || 0, 0),
        100
    );
    const discountAmount = (grossTotal * safeDiscountPercent) / 100;
    const finalTotal = grossTotal - discountAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const cleanedItems = items
            .map((i) => ({
                name: (i.name || "").trim(),
                quantity: Number(i.quantity) || 0,
            }))
            .filter((i) => i.name && i.quantity > 0);

        if (!customerName.trim()) {
            setError("Customer name is required");
            return;
        }

        if (cleanedItems.length === 0) {
            setError("Add at least one medicine with quantity > 0");
            return;
        }

        try {
            setSubmitting(true);
            const token = await getToken();
            const payload = {
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                ownerId,
                notes: notes.trim(),
                items: cleanedItems,
                discountPercent: safeDiscountPercent,
            };

            const res = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/pharmacyBill`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Bill created successfully. Inventory has been updated.");

            setCustomerName("");
            setCustomerPhone("");
            setNotes("");
            setItems([{ name: "", quantity: 1, price: 0 }]);
        } catch (err) {
            console.error("[CreateBill] submit error", err);
            const msg = err.response?.data?.message || "Failed to create bill";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const activeItemName =
        activeIndex !== null && items[activeIndex]
            ? (items[activeIndex].name || "").trim()
            : "";

    return (
        <div className="space-y-6 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
            <div>
                <h2 className="text-2xl font-bold mb-1">Create Bill</h2>
                {pharmacyName && (
                    <p className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                        {pharmacyName}
                    </p>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Customer Name *</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Customer Phone</label>
                        <input
                            type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Discount (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface"
                        />
                    </div>
                </div>

                {/* Medicines */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Medicines</h3>
                        <button
                            type="button"
                            onClick={addItemRow}
                            className="px-3 py-1 rounded-md text-xs bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:opacity-90"
                        >
                            + Add Medicine
                        </button>
                    </div>

                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-2">Medicine Name</th>
                                    <th className="text-left py-2 px-2">Quantity</th>
                                    <th className="text-left py-2 px-2">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} className="border-b last:border-0 align-top">
                                        <td className="py-2 px-2 w-full">
                                            <div className="relative">
                                                <input
                                                    id={`med-input-${index}`}
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) =>
                                                        handleItemChange(index, "name", e.target.value)
                                                    }
                                                    placeholder="Type medicine name"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface"
                                                />
                                            </div>
                                        </td>

                                        <td className="py-2 px-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleItemChange(index, "quantity", e.target.value)
                                                }
                                                className="w-24 px-2 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface"
                                            />
                                        </td>

                                        <td className="py-2 px-2">
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(index)}
                                                disabled={items.length === 1}
                                                className="text-red-600 hover:underline text-xs disabled:opacity-50"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Total */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] space-y-1">
                        <div>Subtotal: ₹{grossTotal}</div>
                        <div>Discount ({safeDiscountPercent}%): -₹{discountAmount}</div>
                    </div>
                    <div className="text-xl font-bold">
                        Payable Total: ₹{finalTotal}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 rounded-md bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white text-sm hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? "Creating Bill..." : "Create Bill"}
                    </button>
                </div>
            </form>

            {/* Floating Suggestion Dropdown */}
            {activeIndex !== null && activeItemName && (
                <div
                    className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-indigo-500/40 
                               rounded-lg shadow-2xl text-xs z-[9999] max-h-60 overflow-y-auto"
                    style={{
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                    }}
                >
                    {suggestionsLoading && (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-300">
                            Searching medicines...
                        </div>
                    )}

                    {!suggestionsLoading && suggestions.length > 0 &&
                        suggestions.slice(0, 50).map((s) => (
                            <button
                                key={s._id}
                                type="button"
                                onClick={() => handleSelectSuggestion(activeIndex, s)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            >
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {s.name}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Price: ₹{s.price ?? 0} · Stock: {s.quantity ?? 0}
                                </div>
                            </button>
                        ))}

                    {!suggestionsLoading && suggestions.length === 0 && (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-300">
                            No medicines found for "{activeItemName}". Please check spelling.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
