import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const InputField = ({
    label,
    name,
    type,
    placeholder,
    required = false,
    value,
    onChange,
    error,
    options,
}) => {
    const inputClasses = `mt-1 block w-full px-3 py-2 border ${error
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-[var(--color-dark-primary)] dark:focus:ring-[var(--color-dark-primary)]"
        } rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]`;

    return (
        <div>
            <label className="block text-sm font-medium text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {type === "select" ? (
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={inputClasses}
                >
                    {options?.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            ) : type === "textarea" ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    rows={3}
                    className={inputClasses}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    className={inputClasses}
                />
            )}

            {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
        </div>
    );
};

export default function InventoryManagement({ ownerId }) {
    const { getToken } = useAuth();

    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        manufacturer: "",
        batchNumber: "",
        expiryDate: "",
        quantity: "",
        minStockLevel: "",
        price: "",
        mrp: "",
        description: "",
    });

    const categories = [
        "Antibiotics",
        "Pain Relief",
        "Vitamins & Supplements",
        "Cardiovascular",
        "Diabetes",
        "Respiratory",
        "Digestive",
        "Skin Care",
        "Eye Care",
        "Other",
    ];

    // Load medicines on mount
    useEffect(() => {
        fetchMedicines();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchMedicines = async () => {
        try {
            console.log("[Inventory] fetching medicines...", { ownerId });
            const token = await getToken();
            const response = await axios.get("http://localhost:5000/api/medicine", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: ownerId ? { ownerId } : undefined,
            });

            console.log("[Inventory] fetch response", response.data);

            const raw = Array.isArray(response.data?.data) ? response.data.data : [];
            const medicinesData = raw.map((m) => ({ ...m, id: m._id || m.id }));

            console.log("[Inventory] mapped medicines", medicinesData);

            setMedicines(medicinesData);
            setFilteredMedicines(medicinesData);
        } catch (error) {
            console.error(
                "[Inventory] fetch error",
                error.response?.data || error.message
            );
            setMedicines([]);
            setFilteredMedicines([]);
        }
    };

    // Filter logic
    useEffect(() => {
        let f = medicines;

        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            f = f.filter(
                (m) =>
                    m.name?.toLowerCase().includes(s) ||
                    m.batchNumber?.toLowerCase().includes(s) ||
                    m.manufacturer?.toLowerCase().includes(s)
            );
        }

        if (filterCategory !== "all") {
            f = f.filter((m) => m.category === filterCategory);
        }

        if (filterStatus !== "all") {
            f = f.filter((m) => m.status === filterStatus);
        }

        setFilteredMedicines(f);
    }, [medicines, searchTerm, filterCategory, filterStatus]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const determineStatus = (q, min, exp) => {
        const today = new Date();
        const expiry = new Date(exp);

        if (!exp || Number.isNaN(expiry.getTime())) return "in_stock";
        if (expiry < today) return "expired";
        if (q === 0) return "out_of_stock";
        if (q <= min) return "low_stock";
        return "in_stock";
    };

    const validateForm = () => {
        const e = {};
        if (!formData.name) e.name = "Required";
        if (!formData.category) e.category = "Required";
        if (!formData.batchNumber) e.batchNumber = "Required";
        if (!formData.expiryDate) e.expiryDate = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const quantity = parseInt(formData.quantity || "0", 10);
        const minLevel = parseInt(formData.minStockLevel || "0", 10);
        const status = determineStatus(quantity, minLevel, formData.expiryDate);

        const medicineData = {
            ...formData,
            quantity,
            minStockLevel: minLevel,
            price: formData.price ? parseFloat(formData.price) : 0,
            mrp: formData.mrp ? parseFloat(formData.mrp) : 0,
            status,
            ownerId,
        };

        try {
            const token = await getToken();
            console.log("[Inventory] saving medicine", {
                editing: !!editingMedicine,
                payload: medicineData,
            });

            let res;
            if (editingMedicine) {
                const id = editingMedicine._id || editingMedicine.id;
                res = await axios.put(`http://localhost:5000/api/medicine/${id}`, medicineData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                res = await axios.post("http://localhost:5000/api/medicine", medicineData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            console.log("[Inventory] save response", res.data);
            await fetchMedicines();
            resetForm();
        } catch (error) {
            console.error(
                "[Inventory] save error",
                error.response?.data || error.message
            );
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            manufacturer: "",
            batchNumber: "",
            expiryDate: "",
            quantity: "",
            minStockLevel: "",
            price: "",
            mrp: "",
            description: "",
        });
        setEditingMedicine(null);
        setErrors({});
        setShowAddForm(false);
    };

    const handleEdit = (med) => {
        setFormData({
            name: med.name || "",
            category: med.category || "",
            manufacturer: med.manufacturer || "",
            batchNumber: med.batchNumber || "",
            expiryDate: med.expiryDate || "",
            quantity: med.quantity ?? "",
            minStockLevel: med.minStockLevel ?? "",
            price: med.price ?? "",
            mrp: med.mrp ?? "",
            description: med.description || "",
        });
        setEditingMedicine(med);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = await getToken();
            console.log("[Inventory] deleting medicine", id);
            const res = await axios.delete(`http://localhost:5000/api/medicine/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("[Inventory] delete response", res.data);
            await fetchMedicines();
        } catch (error) {
            console.error(
                "[Inventory] delete error",
                error.response?.data || error.message
            );
        }
    };

    return (
        <div className="space-y-6 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Inventory Management</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 rounded-md text-sm bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:opacity-90"
                >
                    + Add Medicine
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="p-4 bg-light-surface dark:bg-dark-bg shadow-md rounded-md space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleFormChange}
                                error={errors.name}
                            />

                            <InputField
                                label="Category"
                                name="category"
                                type="select"
                                required
                                value={formData.category}
                                onChange={handleFormChange}
                                options={[
                                    { value: "", label: "Select Category" },
                                    ...categories.map((c) => ({ value: c, label: c })),
                                ]}
                                error={errors.category}
                            />

                            <InputField
                                label="Batch Number"
                                name="batchNumber"
                                type="text"
                                required
                                value={formData.batchNumber}
                                onChange={handleFormChange}
                                error={errors.batchNumber}
                            />

                            <InputField
                                label="Expiry Date"
                                name="expiryDate"
                                type="date"
                                required
                                value={formData.expiryDate}
                                onChange={handleFormChange}
                                error={errors.expiryDate}
                            />

                            <InputField
                                label="Quantity"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleFormChange}
                            />

                            <InputField
                                label="MRP"
                                name="mrp"
                                type="number"
                                value={formData.mrp}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-[var(--color-dark-primary-text)] hover:bg-gray-50 dark:hover:bg-dark-surface"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-md bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white text-sm hover:opacity-90"
                            >
                                {editingMedicine ? "Update Medicine" : "Add Medicine"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    placeholder="Search by name, batch, manufacturer"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm w-full md:w-1/3 bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                />

                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
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

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                >
                    <option
                        value="all"
                        className="bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                    >
                        All Status
                    </option>
                    <option
                        value="in_stock"
                        className="bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                    >
                        In Stock
                    </option>
                    <option
                        value="low_stock"
                        className="bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                    >
                        Low Stock
                    </option>
                    <option
                        value="out_of_stock"
                        className="bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                    >
                        Out of Stock
                    </option>
                    <option
                        value="expired"
                        className="bg-white dark:bg-dark-surface text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                    >
                        Expired
                    </option>
                </select>
            </div>

            {/* Medicines Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 px-2">Medicine</th>
                            <th className="text-left py-2 px-2">Batch</th>
                            <th className="text-left py-2 px-2">Qty</th>
                            <th className="text-left py-2 px-2">Status</th>
                            <th className="text-left py-2 px-2">Expiry</th>
                            <th className="text-left py-2 px-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMedicines.map((m) => (
                            <tr key={m._id || m.id} className="border-b last:border-0">
                                <td className="py-2 px-2">{m.name}</td>
                                <td className="py-2 px-2">{m.batchNumber}</td>
                                <td className="py-2 px-2">{m.quantity}</td>
                                <td className="py-2 px-2 capitalize">{m.status?.replace("_", " ")}</td>
                                <td className="py-2 px-2">{m.expiryDate}</td>
                                <td className="py-2 px-2 space-x-2">
                                    <button
                                        onClick={() => handleEdit(m)}
                                        className="text-indigo-600 hover:underline"
                                    >
                                        update
                                    </button>
                                    <button
                                        onClick={() => handleDelete(m._id || m.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredMedicines.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No medicines found.</p>
            )}
        </div>
    );
}

