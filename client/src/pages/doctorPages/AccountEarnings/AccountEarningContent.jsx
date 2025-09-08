import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Edit3, Eye, EyeOff, FileText, Save } from "lucide-react";
import React, { useEffect, useState } from "react";

const AccountEarningContent = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const { user } = useUser();
    const { getToken } = useAuth();

    const [formData, setFormData] = useState({});

    useEffect(() => {
        getDoctorInfo();
    }, []);

    const getDoctorInfo = async () => {
        try {
            const token = await getToken();
            const res = await axios.get(
                `http://localhost:5000/api/doctor/get-doctor/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(res.data.data);
            setFormData(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleArrayChange = (field, value) => {
        const newArray = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
        setFormData((prev) => ({
            ...prev,
            [field]: newArray,
        }));
    };

    const handleSave = () => {
        setIsLoading(true);

        setTimeout(() => {
            console.log("Saving Complete Doctor Profile:", formData);
            setIsLoading(false);
            setIsEditing(false);
            alert("Profile updated successfully!");
        }, 1000);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        window.location.reload();
    };

    const InputField = ({
        label,
        type = "text",
        value,
        onChange,
        placeholder,
        required = false,
        disabled = false,
        className = "",
    }) => (
        <div className={`sm:col-span-3 ${className}`}>
            <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-2">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || !isEditing}
                    className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );

    const TextAreaField = ({
        label,
        value,
        onChange,
        placeholder,
        required = false,
        rows = 3,
        className = "",
    }) => (
        <div className={`col-span-full ${className}`}>
            <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-2">
                <textarea
                    rows={rows}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={!isEditing}
                    className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );

    const SelectField = ({
        label,
        value,
        onChange,
        options,
        disabled = false,
        className = "",
    }) => (
        <div className={`sm:col-span-3 ${className}`}>
            <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                {label}
            </label>
            <div className="mt-2">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled || !isEditing}
                    className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    const CheckboxField = ({
        label,
        checked,
        onChange,
        disabled = false,
        className = "",
    }) => (
        <div className={`col-span-full ${className}`}>
            <div className="flex flex-col justify-center">
                <div className="flex h-6 shrink-0 gap-2 items-center">
                    <div className="group grid size-4 grid-cols-1">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => onChange(e.target.checked)}
                            disabled={disabled || !isEditing}
                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-light-secondary-text/20 dark:border-dark-secondary-text/20 bg-light-surface/50 dark:bg-dark-surface/50 checked:border-light-primary dark:checked:border-dark-primary checked:bg-light-primary dark:checked:bg-dark-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-primary dark:focus-visible:outline-dark-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <svg
                            fill="none"
                            viewBox="0 0 14 14"
                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-light-primary-text dark:stroke-dark-primary-text">
                            <path
                                d="M3 8L6 11L11 3.5"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-checked:opacity-100"
                            />
                        </svg>
                    </div>
                    <label className="font-medium text-light-primary-text dark:text-dark-primary-text">
                        {label}
                    </label>
                </div>
            </div>
        </div>
    );

    const TermsAndConditions = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-light-primary-text dark:text-dark-primary-text">
                            Terms & Conditions
                        </h2>
                        <button
                            onClick={() => setShowTerms(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <EyeOff className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4 text-sm text-light-secondary-text dark:text-dark-secondary-text">
                        <div>
                            <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
                                1. Service Agreement
                            </h3>
                            <p>
                                By using our platform, you agree to provide
                                accurate medical information and maintain
                                professional standards. You are responsible for
                                all medical advice provided to patients.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
                                2. Payment Terms
                            </h3>
                            <p>
                                Consultation fees are set by you. We charge a
                                10% platform fee. Payments are processed within
                                48 hours of consultation completion. Minimum
                                payout is ₹1000.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
                                3. Privacy & Data Protection
                            </h3>
                            <p>
                                Patient data is confidential and protected. You
                                must comply with HIPAA and local medical privacy
                                laws. We use encryption for all data
                                transmission.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
                                4. Professional Liability
                            </h3>
                            <p>
                                You are responsible for maintaining valid
                                medical licenses and insurance. The platform is
                                not liable for medical malpractice or
                                professional negligence.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
                                5. Platform Rules
                            </h3>
                            <p>
                                No discrimination, harassment, or unprofessional
                                behavior. Maintain accurate availability.
                                Respond to patient inquiries within 24 hours.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
                                6. Termination
                            </h3>
                            <p>
                                Either party may terminate this agreement with
                                30 days notice. We reserve the right to suspend
                                accounts for violations of these terms.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                checked={acceptedTerms}
                                onChange={(e) =>
                                    setAcceptedTerms(e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                                htmlFor="acceptTerms"
                                className="text-sm text-light-primary-text dark:text-dark-primary-text">
                                I have read and agree to these terms
                            </label>
                        </div>
                        <button
                            onClick={() => setShowTerms(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto py-8">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <h1 className="text-4xl font-bold text-light-primary-text dark:text-dark-primary-text">
                            Complete Doctor Profile
                        </h1>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Manage your professional information, payment
                            settings, and preferences
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="flex items-center gap-2 rounded-md bg-light-primary dark:bg-dark-primary px-3 py-2 text-sm font-semibold text-light-primary-text dark:text-dark-primary-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-primary dark:focus-visible:outline-dark-primary hover:opacity-90">
                                <Edit3 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="text-sm/6 font-semibold text-light-primary-text dark:text-dark-primary-text hover:text-light-secondary-text dark:hover:text-dark-secondary-text">
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Save className="w-4 h-4" />
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Basic Information Section */}
                    <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Basic Information
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Your professional and personal details
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <InputField
                                label="Full Name"
                                value={formData.fullName}
                                onChange={(value) =>
                                    handleInputChange("fullName", value)
                                }
                                placeholder="Enter your full name"
                                required
                            />

                            <InputField
                                label="Medical Specialty"
                                value={formData.specialty}
                                onChange={(value) =>
                                    handleInputChange("specialty", value)
                                }
                                placeholder="e.g., Cardiology, Neurology"
                                required
                            />

                            <InputField
                                label="Qualifications"
                                value={formData.qualifications}
                                onChange={(value) =>
                                    handleInputChange("qualifications", value)
                                }
                                placeholder="e.g., MBBS, MD, etc."
                                required
                            />

                            <InputField
                                label="Registration Number"
                                value={formData.registrationNumber}
                                onChange={(value) =>
                                    handleInputChange(
                                        "registrationNumber",
                                        value
                                    )
                                }
                                placeholder="Medical registration number"
                                required
                            />

                            <InputField
                                label="Years of Experience"
                                type="number"
                                value={formData.experience}
                                onChange={(value) =>
                                    handleInputChange("experience", value)
                                }
                                placeholder="Years of experience"
                                required
                            />

                            <InputField
                                label="Hospital/Affiliation"
                                value={formData.affiliation}
                                onChange={(value) =>
                                    handleInputChange("affiliation", value)
                                }
                                placeholder="Current hospital or clinic"
                                required
                            />

                            <InputField
                                label="Contact Number"
                                type="tel"
                                value={formData.phone}
                                onChange={(value) =>
                                    handleInputChange("phone", value)
                                }
                                placeholder="Enter your contact number"
                                required
                            />

                            <InputField
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(value) =>
                                    handleInputChange("email", value)
                                }
                                placeholder="Enter your email address"
                                required
                            />
                            {formData.languages > 0 && (
                                <InputField
                                    label="Languages (comma separated)"
                                    value={formData.languages.join(", ")}
                                    onChange={(value) =>
                                        handleArrayChange("languages", value)
                                    }
                                    placeholder="e.g., English, Hindi, Gujarati"
                                />
                            )}

                            <TextAreaField
                                label="Professional Bio"
                                value={formData.bio}
                                onChange={(value) =>
                                    handleInputChange("bio", value)
                                }
                                placeholder="Brief description of your expertise and experience"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Address Information Section */}
                    <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Address Information
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Your practice location details
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <TextAreaField
                                label="Address"
                                value={formData.address}
                                onChange={(value) =>
                                    handleInputChange("address", value)
                                }
                                placeholder="Enter your complete address"
                                required
                            />

                            <InputField
                                label="District"
                                value={formData.district}
                                onChange={(value) =>
                                    handleInputChange("district", value)
                                }
                                placeholder="Enter your district"
                                required
                            />

                            <InputField
                                label="State"
                                value={formData.state}
                                onChange={(value) =>
                                    handleInputChange("state", value)
                                }
                                placeholder="Enter your state"
                                required
                            />
                        </div>
                    </div>

                    {/* Professional Settings Section */}
                    <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Professional Settings
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Configure your practice and consultation settings
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <InputField
                                label="Consultation Fee (₹)"
                                type="number"
                                value={formData.consultationFee}
                                onChange={(value) =>
                                    handleInputChange(
                                        "consultationFee",
                                        parseInt(value) || 0
                                    )
                                }
                                placeholder="Enter your consultation fee"
                                required
                            />

                            <CheckboxField
                                label="I consent to telemedicine consultations"
                                checked={formData.telemedicineConsent}
                                onChange={(value) =>
                                    handleInputChange(
                                        "telemedicineConsent",
                                        value
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* Payment & Banking Section */}
                    <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Payment & Banking
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Set up your payment methods and banking information
                        </p>

                        {formData.bankAccount && (
                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <InputField
                                    label="Account Number"
                                    value={
                                        formData.bankAccount.accountNumber
                                            ? formData.bankAccount.accountNumber
                                            : ""
                                    }
                                    onChange={(value) =>
                                        handleInputChange(
                                            "bankAccount.accountNumber",
                                            value
                                        )
                                    }
                                    placeholder="Enter your account number"
                                    required
                                />

                                <InputField
                                    label="IFSC Code"
                                    value={
                                        formData.bankAccount.ifscCode || null
                                    }
                                    onChange={(value) =>
                                        handleInputChange(
                                            "bankAccount.ifscCode",
                                            value
                                        )
                                    }
                                    placeholder="e.g., SBIN0001234"
                                    required
                                />

                                <InputField
                                    label="Bank Name"
                                    value={
                                        formData.bankAccount.bankName || null
                                    }
                                    onChange={(value) =>
                                        handleInputChange(
                                            "bankAccount.bankName",
                                            value
                                        )
                                    }
                                    placeholder="Enter bank name"
                                    required
                                />

                                <InputField
                                    label="Account Holder Name"
                                    value={
                                        formData.bankAccount
                                            .accountHolderName || null
                                    }
                                    onChange={(value) =>
                                        handleInputChange(
                                            "bankAccount.accountHolderName",
                                            value
                                        )
                                    }
                                    placeholder="Enter account holder name"
                                    required
                                />

                                <InputField
                                    label="Branch Name"
                                    value={formData.bankAccount.branchName}
                                    onChange={(value) =>
                                        handleInputChange(
                                            "bankAccount.branchName",
                                            value
                                        )
                                    }
                                    placeholder="Enter branch name"
                                />

                                <InputField
                                    label="UPI ID"
                                    value={formData.upiId}
                                    onChange={(value) =>
                                        handleInputChange("upiId", value)
                                    }
                                    placeholder="e.g., yourname@paytm"
                                />

                                <SelectField
                                    label="Preferred Payment Method"
                                    value={formData.paymentMethod}
                                    onChange={(value) =>
                                        handleInputChange(
                                            "paymentMethod",
                                            value
                                        )
                                    }
                                    options={[
                                        {
                                            value: "bank_transfer",
                                            label: "Bank Transfer",
                                        },
                                        { value: "upi", label: "UPI" },
                                        {
                                            value: "wallet",
                                            label: "Digital Wallet",
                                        },
                                    ]}
                                />
                            </div>
                        )}
                    </div>

                    {/* Payout Preferences Section */}
                    <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Payout Preferences
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Configure how and when you receive payments
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <SelectField
                                label="Payout Frequency"
                                value={formData.payoutFrequency}
                                onChange={(value) =>
                                    handleInputChange("payoutFrequency", value)
                                }
                                options={[
                                    { value: "weekly", label: "Weekly" },
                                    { value: "bi-weekly", label: "Bi-weekly" },
                                    { value: "monthly", label: "Monthly" },
                                ]}
                            />

                            <InputField
                                label="Minimum Payout Amount (₹)"
                                type="number"
                                value={formData.minimumPayoutAmount}
                                onChange={(value) =>
                                    handleInputChange(
                                        "minimumPayoutAmount",
                                        parseInt(value) || 0
                                    )
                                }
                                placeholder="Enter minimum payout amount"
                            />

                            <InputField
                                label="Preferred Payout Day"
                                type="number"
                                value={formData.preferredPayoutDay}
                                onChange={(value) =>
                                    handleInputChange(
                                        "preferredPayoutDay",
                                        parseInt(value) || 1
                                    )
                                }
                                placeholder="Day of month (1-31)"
                            />

                            <CheckboxField
                                label="Enable Auto Payout"
                                checked={formData.autoPayout}
                                onChange={(value) =>
                                    handleInputChange("autoPayout", value)
                                }
                            />
                        </div>
                    </div>

                    {/* Tax Information Section */}
                    <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Tax Information
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Provide tax details for compliance
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <InputField
                                label="PAN Number"
                                value={formData.panNumber}
                                onChange={(value) =>
                                    handleInputChange("panNumber", value)
                                }
                                placeholder="e.g., ABCDE1234F"
                            />

                            <InputField
                                label="GST Number"
                                value={formData.gstNumber}
                                onChange={(value) =>
                                    handleInputChange("gstNumber", value)
                                }
                                placeholder="e.g., 22ABCDE1234F1Z5"
                            />

                            <CheckboxField
                                label="Tax Exempt"
                                checked={formData.taxExempt}
                                onChange={(value) =>
                                    handleInputChange("taxExempt", value)
                                }
                            />
                        </div>
                    </div>

                    {/* Terms and Conditions Section */}
                    <div className="py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Terms & Conditions
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Please review and accept our terms of service
                        </p>

                        <div className="mt-6">
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            Service Agreement & Terms
                                        </h3>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Review our terms of service, payment
                                            policies, and professional
                                            guidelines
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowTerms(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                                    <Eye className="w-4 h-4" />
                                    View Terms
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-sm/6 font-semibold text-light-primary-text dark:text-dark-primary-text hover:text-light-secondary-text dark:hover:text-dark-secondary-text">
                            View Terms & Conditions
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="rounded-md bg-light-primary dark:bg-dark-primary px-3 py-2 text-sm font-semibold text-light-primary-text dark:text-dark-primary-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-primary dark:focus-visible:outline-dark-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? "Saving..." : "Save Complete Profile"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Terms and Conditions Modal */}
            {showTerms && <TermsAndConditions />}
        </div>
    );
};

export default AccountEarningContent;
