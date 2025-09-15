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

    const [formData, setFormData] = useState({
        fullName: '',
        specialty: '',
        qualifications: '',
        registrationNumber: '',
        experience: '',
        affiliation: '',
        phone: '',
        email: '',
        bio: '',
        address: '',
        district: '',
        state: '',
        consultationFee: '',
        telemedicineConsent: false,
        upiId: '',
        paymentMethod: 'bank_transfer',
        bankAccountNumber: '',
        bankIfscCode: '',
        bankName: '',
        bankAccountHolderName: '',
        bankBranchName: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

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
            const doctorData = res.data.data;
            setFormData({
                fullName: doctorData.fullName || '',
                specialty: doctorData.specialty || '',
                qualifications: doctorData.qualifications || '',
                registrationNumber: doctorData.registrationNumber || '',
                experience: doctorData.experience || '',
                affiliation: doctorData.affiliation || '',
                phone: doctorData.phone || '',
                email: doctorData.email || '',
                bio: doctorData.bio || '',
                address: doctorData.address || '',
                district: doctorData.district || '',
                state: doctorData.state || '',
                consultationFee: doctorData.consultationFee || '',
                telemedicineConsent: doctorData.telemedicineConsent || false,
                upiId: doctorData.upiId || '',
                paymentMethod: doctorData.paymentMethod || 'bank_transfer',
                bankAccountNumber: doctorData.bankAccount?.accountNumber || '',
                bankIfscCode: doctorData.bankAccount?.ifscCode || '',
                bankName: doctorData.bankAccount?.bankName || '',
                bankAccountHolderName: doctorData.bankAccount?.accountHolderName || '',
                bankBranchName: doctorData.bankAccount?.branchName || ''
            });
        } catch (error) {
            console.log(error);
        }
    };


    const handleSave = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            console.log("FORMDATA: ", formData);
            const res = await axios.post(
                "http://localhost:5000/api/doctor/profile",
                {
                    ...formData,
                    bankAccount: {
                        accountNumber: formData.bankAccountNumber,
                        ifscCode: formData.bankIfscCode,
                        bankName: formData.bankName,
                        accountHolderName: formData.bankAccountHolderName,
                        branchName: formData.bankBranchName
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Doctor profile saved:", res.data);
            alert("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving doctor profile:", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || !isEditing}
                    className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50  dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
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
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={!isEditing}
                    className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-3 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
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
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled || !isEditing}
                    className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed">
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
                            checked={checked || false}
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
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto py-4">
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
                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Medical Specialty <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleChange}
                                        placeholder="e.g., Cardiology, Neurology"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Qualifications <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="qualifications"
                                        value={formData.qualifications}
                                        onChange={handleChange}
                                        placeholder="e.g., MBBS, MD, etc."
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Registration Number <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleChange}
                                        placeholder="Medical registration number"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Years of Experience <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        placeholder="Years of experience"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Hospital/Affiliation <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="affiliation"
                                        value={formData.affiliation}
                                        onChange={handleChange}
                                        placeholder="Current hospital or clinic"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your contact number"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email address"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            {/* <InputField
                                label="Languages (comma separated)"
                                value={
                                    formData.languages
                                        ? formData.languages.join(", ")
                                        : []
                                }
                                onChange={(value) =>
                                    handleArrayChange("languages", value)
                                }
                                placeholder="e.g., English, Hindi, Gujarati"
                            /> */}

                            <div className="col-span-full">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Professional Bio
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        rows={3}
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Brief description of your expertise and experience"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-3 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
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
                            <div className="col-span-full">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        rows={3}
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter your complete address"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-3 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    District <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        placeholder="Enter your district"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Enter your state"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
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
                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Consultation Fee (₹) <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        name="consultationFee"
                                        value={formData.consultationFee}
                                        onChange={handleChange}
                                        placeholder="Enter your consultation fee"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <div className="flex flex-col justify-center">
                                    <div className="flex h-6 shrink-0 gap-2 items-center">
                                        <div className="group grid size-4 grid-cols-1">
                                            <input
                                                type="checkbox"
                                                name="telemedicineConsent"
                                                checked={formData.telemedicineConsent}
                                                onChange={handleChange}
                                                disabled={!isEditing}
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
                                            I consent to telemedicine consultations
                                        </label>
                                    </div>
                                </div>
                            </div>

                            
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

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="bankAccountNumber"
                                        value={formData.bankAccountNumber}
                                        onChange={handleChange}
                                        placeholder="Enter your account number"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    IFSC Code <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="bankIfscCode"
                                        value={formData.bankIfscCode}
                                        onChange={handleChange}
                                        placeholder="e.g., SBIN0001234"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Bank Name <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        placeholder="Enter bank name"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Account Holder Name <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="bankAccountHolderName"
                                        value={formData.bankAccountHolderName}
                                        onChange={handleChange}
                                        placeholder="Enter account holder name"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Branch Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="bankBranchName"
                                        value={formData.bankBranchName}
                                        onChange={handleChange}
                                        placeholder="Enter branch name"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    UPI ID
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="upiId"
                                        value={formData.upiId}
                                        onChange={handleChange}
                                        placeholder="e.g., yourname@paytm"
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-2 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Preferred Payment Method
                                </label>
                                <div className="mt-2">
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="block w-full rounded-md bg-light-surface dark:bg-dark-bg px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6 disabled:bg-light-surface/50 dark:disabled:bg-dark-bg/50 disabled:cursor-not-allowed">
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="upi">UPI</option>
                                        <option value="wallet">Digital Wallet</option>
                                    </select>
                                </div>
                            </div>
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
