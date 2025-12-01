import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    UserCircle,
    Mail,
    Phone,
    FileText,
    BadgeCheck,
    Stethoscope,
    Star,
    X,
} from "lucide-react";

const DocumentViewerModal = ({ open, onClose, url }) => {
    if (!open || !url) return null;
    const isPdf = url.toLowerCase().endsWith(".pdf");
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/.test(url.toLowerCase());
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-dark-bg rounded-xl p-4 shadow-xl max-w-2xl w-full relative flex flex-col items-center">
                <button
                    className="absolute top-2 right-2 text-gray-800 dark:text-gray-200"
                    onClick={onClose}>
                    <X />
                </button>
                {isPdf ? (
                    <iframe
                        src={url}
                        title="Document"
                        className="w-full h-[70vh] rounded"
                    />
                ) : isImage ? (
                    <img
                        src={url}
                        alt="Document"
                        className="max-h-[70vh] w-auto rounded"
                    />
                ) : (
                    <p>
                        Document preview unavailable.{" "}
                        <a
                            className="text-blue-600 underline"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer">
                            Open in new tab
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
};

const InfoItem = ({ icon: Icon, label, value, color }) =>
    value ? (
        <div className="flex items-center gap-2 text-sm text-light-primary-text dark:text-dark-primary-text mb-1">
            <Icon className={`w-4 h-4 ${color || ""}`} />
            <span className="font-semibold mr-1">{label}:</span>
            <span className="break-all">{value}</span>
        </div>
    ) : null;

const BankInfo = ({ bankAccount, upiId }) => {
    if (!bankAccount && !upiId) return null;
    return (
        <div className="rounded-lg bg-gradient-to-br from-blue-50/80 via-green-50/80 to-blue-100/60 dark:from-blue-900/30 dark:via-green-900/20 dark:to-blue-700/30 border border-blue-100 dark:border-blue-900/40 p-4 my-2 flex flex-col gap-2">
            <div className="text-base font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                Bank/UPI Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <InfoItem
                    icon={FileText}
                    label="Account Holder"
                    value={bankAccount?.accountHolderName}
                />
                <InfoItem
                    icon={FileText}
                    label="Bank"
                    value={bankAccount?.bankName}
                />
                <InfoItem
                    icon={FileText}
                    label="Account Number"
                    value={bankAccount?.accountNumber}
                />
                <InfoItem
                    icon={FileText}
                    label="IFSC"
                    value={bankAccount?.ifscCode}
                />
                <InfoItem
                    icon={FileText}
                    label="Branch Name"
                    value={bankAccount?.branchName}
                />
                <InfoItem icon={FileText} label="UPI ID" value={upiId} />
            </div>
        </div>
    );
};

const DoctorCard = ({ doctor, onDocView }) => (
    <div className="w-full bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-8 border border-light-primary/10 dark:border-dark-primary/10 mb-6">
        <div className="flex gap-6 items-center mb-3 flex-wrap">
            <div className="rounded-full bg-light-primary/20 dark:bg-dark-primary/20 w-20 h-20 flex items-center justify-center">
                <UserCircle className="w-14 h-14 text-light-primary dark:text-dark-primary" />
            </div>
            <div className="flex-1 min-w-[200px]">
                <h2 className="text-2xl font-bold text-light-primary-text dark:text-dark-primary-text flex items-center gap-1 mb-1">
                    Dr. {doctor.fullName}
                    {doctor.verificationStatus === "verified" && (
                        <BadgeCheck className="text-green-500 ml-0.5" />
                    )}
                </h2>
                <div className="flex gap-2 flex-wrap items-center text-base text-light-secondary-text dark:text-dark-secondary-text mb-1">
                    <span>
                        <Stethoscope className="w-5 h-5 inline-block mr-1 text-blue-600 dark:text-blue-400" />
                        {doctor.specialty}
                    </span>
                    {doctor.qualifications && (
                        <span>| {doctor.qualifications}</span>
                    )}
                    {doctor.experience && (
                        <span>| {doctor.experience} yrs exp</span>
                    )}
                </div>
                {doctor.affiliation && (
                    <InfoItem
                        icon={FileText}
                        label="Affiliation"
                        value={doctor.affiliation}
                        color="text-indigo-400"
                    />
                )}
                {doctor.bio && doctor.bio.trim() && (
                    <div className="mt-2 text-[15px] leading-snug text-gray-600 dark:text-gray-300 italic">
                        "{doctor.bio.trim()}"
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1 min-w-[170px] items-end">
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg font-semibold">
                        {doctor.rating?.average
                            ? doctor.rating.average.toFixed(1)
                            : "N/A"}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({doctor.rating?.count ?? 0})
                    </span>
                </div>
                {doctor.consultationFee && (
                    <div className="flex items-center text-sm text-emerald-700 dark:text-emerald-300 mt-1 font-semibold">
                        ₹{doctor.consultationFee}{" "}
                        <span className="ml-0.5 text-xs font-normal">
                            /consultation
                        </span>
                    </div>
                )}
            </div>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-3 my-2">
            <InfoItem
                icon={Mail}
                label="Email"
                value={doctor.email}
                color="text-blue-700"
            />
            <InfoItem
                icon={Phone}
                label="Phone"
                value={doctor.phone}
                color="text-green-600"
            />
            <InfoItem
                icon={FileText}
                label="Registration No."
                value={doctor.registrationNumber}
                color="text-indigo-600"
            />
            <InfoItem
                icon={FileText}
                label="District"
                value={doctor.district}
                color="text-orange-500"
            />
            <InfoItem
                icon={FileText}
                label="State"
                value={doctor.state}
                color="text-purple-500"
            />
            <InfoItem
                icon={FileText}
                label="Address"
                value={doctor.address}
                color="text-sky-500"
            />
            {doctor.languages && doctor.languages.length && (
                <InfoItem
                    icon={FileText}
                    label="Languages"
                    value={doctor.languages.join(", ")}
                    color="text-pink-500"
                />
            )}
        </div>
        <BankInfo bankAccount={doctor.bankAccount} upiId={doctor.upiId} />
        {/* Documents section */}
        <div className="flex flex-wrap gap-2 mt-2">
            {doctor.licenseFile && (
                <button
                    onClick={() => onDocView(doctor.licenseFile)}
                    className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition gap-1 font-medium mt-1">
                    <FileText className="w-4 h-4" /> View License
                </button>
            )}
            {doctor.idProofFile && (
                <button
                    onClick={() => onDocView(doctor.idProofFile)}
                    className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 rounded hover:bg-green-100 dark:hover:bg-green-800 transition gap-1 font-medium mt-1">
                    <FileText className="w-4 h-4" /> View ID Proof
                </button>
            )}
        </div>
    </div>
);

const VerifiedDoctorsContent = () => {
    const [doctors, setDoctors] = useState([]);
    const [docModalUrl, setDocModalUrl] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_SERVER_URL}/api/doctor/verified-doctors?full=true`
                );
                setDoctors(data.data || []);
            } catch (err) {
                console.error("Error fetching verified doctors:", err);
                setDoctors([]);
            }
        };
        fetchDoctors();
    }, []);

    return (
        <div className="p-6 bg-light-bg dark:bg-dark-bg min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-light-primary-text dark:text-dark-primary-text">
                Verified Doctors ({doctors.length})
            </h1>
            {doctors.length === 0 ? (
                <div className="text-center py-12 text-light-secondary-text dark:text-dark-secondary-text">
                    <p className="text-lg">No verified doctors found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-7">
                    {doctors.map((doctor) => (
                        <DoctorCard
                            key={doctor._id}
                            doctor={doctor}
                            onDocView={(url) => {
                                setDocModalUrl(url);
                                setModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            )}
            <DocumentViewerModal
                open={modalOpen}
                url={docModalUrl}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
};

export default VerifiedDoctorsContent;