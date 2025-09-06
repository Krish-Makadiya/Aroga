import { useAuth, useUser } from "@clerk/clerk-react";
import { Shield, Stethoscope, User, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ROLES = ["Patient", "Doctor", "Admin"];

export default function OnboardingForm() {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();
    const [role, setRole] = useState("");
    const [saving, setSaving] = useState(false);
    const { getToken } = useAuth();

    const [patient, setPatient] = useState({
        fullName: "",
        dob: "",
        gender: "",
        address: "",
        district: "",
        phone: "",
        email: "",
        govIdType: "",
        govIdNumber: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        medicalHistory: "",
        clerkUserId: user.id,
        telemedicineConsent: true,
    });

    const [doctor, setDoctor] = useState({
        fullName: "",
        qualifications: "",
        registrationNumber: "",
        specialty: "",
        phone: "",
        email: "",
        licenseFile: null,
        idProofFile: null,
        affiliation: "",
        experience: "",
        telemedicineConsent: true,
    });

    const [admin, setAdmin] = useState({
        userId: "",
        password: "",
    });

    // Check if user has already completed onboarding
    useEffect(() => {
        if (isLoaded && user && user.unsafeMetadata?.onboardingCompleted) {
            const userRole = user.unsafeMetadata.role;
            if (userRole) {
                navigate(`/dashboard/${userRole.toLowerCase()}`);
            }
        }
    }, [isLoaded, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role) return;

        setSaving(true);
        try {
            let backendUrl = "";
            let backendBody = {};

            if (role === "Patient") {
                backendUrl = "http://localhost:5000/api/patient/create-patient";
                backendBody = patient;
            } else if (role === "Doctor") {
                backendUrl = "http://localhost:5000/api/doctor/create-doctor";
                backendBody = doctor;
            } else if (role === "Admin") {
                backendUrl = "http://localhost:5000/api/admin/create-admin";
                backendBody = admin;
            }

            const token = await getToken();

            if (backendUrl) {
                console.log(backendBody);
                const response = await axios.post(backendUrl, backendBody, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("Backend response:", response.data);
            }

            // Update Clerk metadata as before
            if (user) {
                await user.update({
                    unsafeMetadata: {
                        role: role,
                        onboardingCompleted: true,
                        ...(role === "Patient" && { patientData: patient }),
                        ...(role === "Doctor" && { doctorData: doctor }),
                        ...(role === "Admin" && { adminData: admin }),
                    },
                });
                console.log("User metadata updated successfully");
            }

            navigate(`/dashboard/${role.toLowerCase()}`);
        } catch (error) {
            // Axios error handling
            if (error.response) {
                console.error("Backend error:", error.response.data);
            } else {
                console.error("Error submitting form:", error.message);
            }
        } finally {
            setSaving(false);
        }
    };

    // Show loading state while Clerk is loading
    if (!isLoaded) {
        return <Loader />;
    }

    // Show message if user is not authenticated
    if (!user) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-light-primary-text dark:text-dark-primary-text mb-4">
                        Authentication Required
                    </h1>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text">
                        Please sign in to complete onboarding.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form className="max-w-4xl mx-auto py-8" onSubmit={handleSubmit}>
            <div>
                <h1 className="text-4xl font-bold text-light-primary-text dark:text-dark-primary-text">
                    Onboarding
                </h1>
            </div>

            {/* Role Selection Section */}
            <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 pb-12">
                <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                    Select Your Role
                </p>

                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {ROLES.map((roleOption) => {
                        const isSelected = role === roleOption;
                        const getIcon = () => {
                            switch (roleOption) {
                                case "Patient":
                                    return <User className="w-8 h-8" />;
                                case "Doctor":
                                    return <Stethoscope className="w-8 h-8" />;
                                case "Admin":
                                    return <Shield className="w-8 h-8" />;
                                default:
                                    return <UserCircle className="w-8 h-8" />;
                            }
                        };

                        const getDescription = () => {
                            switch (roleOption) {
                                case "Patient":
                                    return "Access medical services, book appointments, and manage your health records";
                                case "Doctor":
                                    return "Provide medical consultations, manage patients, and access medical tools";
                                case "Admin":
                                    return "Manage system settings, users, and oversee platform operations";
                                default:
                                    return "";
                            }
                        };

                        return (
                            <div
                                key={roleOption}
                                className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
                                    isSelected
                                        ? "border-light-primary dark:border-dark-primary bg-light-primary/10 dark:bg-dark-primary/10"
                                        : "border-light-secondary-text/20 dark:border-dark-secondary-text/20 bg-light-surface/50 dark:bg-dark-surface/50 hover:border-light-secondary-text/40 dark:hover:border-dark-secondary-text/40 hover:bg-light-surface/70 dark:hover:bg-dark-surface/70"
                                }`}
                                onClick={() => setRole(roleOption)}>
                                <div className="flex flex-col items-center text-center">
                                    <div
                                        className={`mb-4 transition-colors duration-200 ${
                                            isSelected
                                                ? "text-light-primary dark:text-dark-primary"
                                                : "text-light-secondary-text dark:text-dark-secondary-text"
                                        }`}>
                                        {getIcon()}
                                    </div>
                                    <h3
                                        className={`text-lg font-semibold mb-2 ${
                                            isSelected
                                                ? "text-light-primary dark:text-dark-primary"
                                                : "text-light-primary-text dark:text-dark-primary-text"
                                        }`}>
                                        {roleOption}
                                    </h3>
                                    <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text leading-relaxed">
                                        {getDescription()}
                                    </p>
                                </div>

                                {/* Radio button indicator */}
                                <div className="absolute top-4 right-4">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                                            isSelected
                                                ? "border-light-primary dark:border-dark-primary bg-light-primary dark:bg-dark-primary"
                                                : "border-light-secondary-text/30 dark:border-dark-secondary-text/30 bg-transparent"
                                        }`}>
                                        {isSelected && (
                                            <div className="w-full h-full rounded-full bg-light-primary-text dark:bg-dark-primary-text scale-50"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {role === "Patient" && (
                <div className="space-y-12">
                    <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Patient Information
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Please provide your personal and medical
                            information.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-fullName"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Full Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="patient-fullName"
                                        name="patient-fullName"
                                        type="text"
                                        value={patient.fullName}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                fullName: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-dob"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Date of Birth
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="patient-dob"
                                        name="patient-dob"
                                        type="date"
                                        value={patient.dob}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                dob: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-gender"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Gender
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="patient-gender"
                                        name="patient-gender"
                                        value={patient.gender}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                gender: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        required>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-phone"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Phone Number
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="patient-phone"
                                        name="patient-phone"
                                        type="tel"
                                        value={patient.phone}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label
                                    htmlFor="patient-address"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Address
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="patient-address"
                                        name="patient-address"
                                        rows={3}
                                        value={patient.address}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                address: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your complete address"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-district"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    District
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="patient-district"
                                        name="patient-district"
                                        type="text"
                                        value={patient.district}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                district: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your district"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-email"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Email Address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="patient-email"
                                        name="patient-email"
                                        type="email"
                                        value={patient.email}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                email: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-govIdType"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Government ID Type
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="patient-govIdType"
                                        name="patient-govIdType"
                                        value={patient.govIdType}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                govIdType: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        required>
                                        <option value="">Select ID Type</option>
                                        <option value="aadhar">
                                            Aadhar Card
                                        </option>
                                        <option value="pan">PAN Card</option>
                                        <option value="passport">
                                            Passport
                                        </option>
                                        <option value="driving-license">
                                            Driving License
                                        </option>
                                        <option value="voter-id">
                                            Voter ID
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-govIdNumber"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Government ID Number
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="patient-govIdNumber"
                                        name="patient-govIdNumber"
                                        type="text"
                                        value={patient.govIdNumber}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                govIdNumber: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your ID number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-emergencyContactName"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Emergency Contact Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="patient-emergencyContactName"
                                        name="patient-emergencyContactName"
                                        type="text"
                                        value={patient.emergencyContactName}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                emergencyContactName:
                                                    e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter emergency contact name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="patient-emergencyContactPhone"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Emergency Contact Phone
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="patient-emergencyContactPhone"
                                        name="patient-emergencyContactPhone"
                                        type="tel"
                                        value={patient.emergencyContactPhone}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                emergencyContactPhone:
                                                    e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter emergency contact phone"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label
                                    htmlFor="patient-medicalHistory"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Medical History
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="patient-medicalHistory"
                                        name="patient-medicalHistory"
                                        rows={4}
                                        value={patient.medicalHistory}
                                        onChange={(e) =>
                                            setPatient({
                                                ...patient,
                                                medicalHistory: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Please describe any relevant medical history, allergies, or ongoing conditions"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <div className="flex flex-col justify-center">
                                    <div className="flex h-6 shrink-0 gap-2 items-center">
                                        <div className="group grid size-4 grid-cols-1">
                                            <input
                                                id="patient-telemedicineConsent"
                                                name="patient-telemedicineConsent"
                                                type="checkbox"
                                                checked={
                                                    patient.telemedicineConsent
                                                }
                                                onChange={(e) =>
                                                    setPatient({
                                                        ...patient,
                                                        telemedicineConsent:
                                                            e.target.checked,
                                                    })
                                                }
                                                className="col-start-1 row-start-1 appearance-none rounded-sm border border-light-secondary-text/20 dark:border-dark-secondary-text/20 bg-light-surface/50 dark:bg-dark-surface/50 checked:border-light-primary dark:checked:border-dark-primary checked:bg-light-primary dark:checked:bg-dark-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-primary dark:focus-visible:outline-dark-primary"
                                                required
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
                                        <label
                                            htmlFor="patient-telemedicineConsent"
                                            className="font-medium text-light-primary-text dark:text-dark-primary-text">
                                            I consent to telemedicine
                                            consultations
                                        </label>
                                    </div>
                                    <div className="text-sm/6">
                                        <p className="text-light-secondary-text dark:text-dark-secondary-text">
                                            By checking this box, you agree to
                                            receive medical consultations via
                                            video calls or other digital means.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {role === "Doctor" && (
                <div className="space-y-12">
                    <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Doctor Information
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Please provide your professional and qualification
                            details.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="doctor-fullName"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Full Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="doctor-fullName"
                                        name="doctor-fullName"
                                        type="text"
                                        value={doctor.fullName}
                                        onChange={(e) =>
                                            setDoctor({
                                                ...doctor,
                                                fullName: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="doctor-specialty"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Medical Specialty
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="doctor-specialty"
                                        name="doctor-specialty"
                                        type="text"
                                        value={doctor.specialty}
                                        onChange={(e) =>
                                            setDoctor({
                                                ...doctor,
                                                specialty: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="e.g., Cardiology, Neurology, etc."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="doctor-qualifications"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Qualifications
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="doctor-qualifications"
                                        name="doctor-qualifications"
                                        type="text"
                                        value={doctor.qualifications}
                                        onChange={(e) =>
                                            setDoctor({
                                                ...doctor,
                                                qualifications: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="e.g., MBBS, MD, etc."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="doctor-registrationNumber"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Registration Number
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="doctor-registrationNumber"
                                        name="doctor-registrationNumber"
                                        type="text"
                                        value={doctor.registrationNumber}
                                        onChange={(e) =>
                                            setDoctor({
                                                ...doctor,
                                                registrationNumber:
                                                    e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Medical registration number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="doctor-experience"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Years of Experience
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="doctor-experience"
                                        name="doctor-experience"
                                        type="number"
                                        value={doctor.experience}
                                        onChange={(e) =>
                                            setDoctor({
                                                ...doctor,
                                                experience: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Years of experience"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="doctor-affiliation"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Hospital/Affiliation
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="doctor-affiliation"
                                        name="doctor-affiliation"
                                        type="text"
                                        value={doctor.affiliation}
                                        onChange={(e) =>
                                            setDoctor({
                                                ...doctor,
                                                affiliation: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Current hospital or clinic"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="doctor-phone"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Contact Number
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="doctor-phone"
                                        name="doctor-phone"
                                        type="tel"
                                        value={doctor.phone}
                                        onChange={(e) =>
                                            setDoctor({
                                                ...doctor,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your contact number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="doctor-email"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Email Address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="doctor-email"
                                        name="doctor-email"
                                        type="email"
                                        value={doctor.email}
                                        onChange={(e) =>
                                            setDoctor({
                                                ...doctor,
                                                email: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label
                                    htmlFor="doctor-licenseFile"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Medical License File
                                </label>
                                <div className="mt-2">
                                    <div className="flex justify-center rounded-lg border border-dashed border-light-secondary-text/25 dark:border-dark-secondary-text/25 px-6 py-10">
                                        <div className="text-center">
                                            <UserCircle
                                                aria-hidden="true"
                                                className="mx-auto size-12 text-light-secondary-text dark:text-dark-secondary-text"
                                            />
                                            <div className="mt-4 flex text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                                                <label
                                                    htmlFor="doctor-licenseFile"
                                                    className="relative cursor-pointer rounded-md bg-transparent font-semibold text-light-primary dark:text-dark-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-light-primary dark:focus-within:outline-dark-primary hover:text-light-primary-hover dark:hover:text-dark-primary-hover">
                                                    <span>
                                                        Upload License File
                                                    </span>
                                                    <input
                                                        id="doctor-licenseFile"
                                                        name="doctor-licenseFile"
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) =>
                                                            setDoctor({
                                                                ...doctor,
                                                                licenseFile:
                                                                    e.target
                                                                        .files[0],
                                                            })
                                                        }
                                                        className="sr-only"
                                                        required
                                                    />
                                                </label>
                                                <p className="pl-1">
                                                    or drag and drop
                                                </p>
                                            </div>
                                            <p className="text-xs/5 text-light-secondary-text dark:text-dark-secondary-text">
                                                PDF, JPG, PNG up to 10MB
                                            </p>
                                            {doctor.licenseFile && (
                                                <p className="mt-2 text-sm text-light-success dark:text-dark-success">
                                                    Selected:{" "}
                                                    {doctor.licenseFile.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label
                                    htmlFor="doctor-idProofFile"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    ID Proof File
                                </label>
                                <div className="mt-2">
                                    <div className="flex justify-center rounded-lg border border-dashed border-light-secondary-text/25 dark:border-dark-secondary-text/25 px-6 py-10">
                                        <div className="text-center">
                                            <UserCircle
                                                aria-hidden="true"
                                                className="mx-auto size-12 text-light-secondary-text dark:text-dark-secondary-text"
                                            />
                                            <div className="mt-4 flex text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                                                <label
                                                    htmlFor="doctor-idProofFile"
                                                    className="relative cursor-pointer rounded-md bg-transparent font-semibold text-light-primary dark:text-dark-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-light-primary dark:focus-within:outline-dark-primary hover:text-light-primary-hover dark:hover:text-dark-primary-hover">
                                                    <span>Upload ID Proof</span>
                                                    <input
                                                        id="doctor-idProofFile"
                                                        name="doctor-idProofFile"
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) =>
                                                            setDoctor({
                                                                ...doctor,
                                                                idProofFile:
                                                                    e.target
                                                                        .files[0],
                                                            })
                                                        }
                                                        className="sr-only"
                                                        required
                                                    />
                                                </label>
                                                <p className="pl-1">
                                                    or drag and drop
                                                </p>
                                            </div>
                                            <p className="text-xs/5 text-light-secondary-text dark:text-dark-secondary-text">
                                                PDF, JPG, PNG up to 10MB
                                            </p>
                                            {doctor.idProofFile && (
                                                <p className="mt-2 text-sm text-light-success dark:text-dark-success">
                                                    Selected:{" "}
                                                    {doctor.idProofFile.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {role === "Admin" && (
                <div className="space-y-12">
                    <div className="border-b border-light-secondary-text/20 dark:border-dark-secondary-text/20 py-8">
                        <h2 className="text-base/7 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Administrator Sign In
                        </h2>
                        <p className="mt-1 text-sm/6 text-light-secondary-text dark:text-dark-secondary-text">
                            Please provide your administrative credentials to
                            sign in.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="admin-userId"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    User ID
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="admin-userId"
                                        name="admin-userId"
                                        type="text"
                                        value={admin.userId}
                                        onChange={(e) =>
                                            setAdmin({
                                                ...admin,
                                                userId: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your admin user ID"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label
                                    htmlFor="admin-password"
                                    className="block text-sm/6 font-medium text-light-primary-text dark:text-dark-primary-text">
                                    Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="admin-password"
                                        name="admin-password"
                                        type="password"
                                        value={admin.password}
                                        onChange={(e) =>
                                            setAdmin({
                                                ...admin,
                                                password: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-light-surface/50 dark:bg-dark-surface/50 px-3 py-1.5 text-base text-light-primary-text dark:text-dark-primary-text outline-1 -outline-offset-1 outline-light-secondary-text/20 dark:outline-dark-secondary-text/20 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-2 focus:-outline-offset-2 focus:outline-light-primary dark:focus:outline-dark-primary sm:text-sm/6"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {role && (
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        onClick={() => setRole("")}
                        className="text-sm/6 font-semibold text-light-primary-text dark:text-dark-primary-text hover:text-light-secondary-text dark:hover:text-dark-secondary-text">
                        Back to Role Selection
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-light-primary dark:bg-dark-primary px-3 py-2 text-sm font-semibold text-light-primary-text dark:text-dark-primary-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-primary dark:focus-visible:outline-dark-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? "Saving..." : "Complete Onboarding"}
                    </button>
                </div>
            )}
        </form>
    );
}
