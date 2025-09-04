import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Send, Check, X } from "lucide-react";

const ROLES = ["Patient", "Doctor", "Admin"];

export default function OnboardingForm() {
	const { user } = useUser();
	const navigate = useNavigate();
	const [role, setRole] = useState("");
	const [saving, setSaving] = useState(false);
	const [otpSent, setOtpSent] = useState(false);

	const [patient, setPatient] = useState({
		fullName: "",
		dob: "",
		gender: "",
		address: "",
		district: "",
		phone: "",
		phoneOtp: "",
		email: "",
		govIdType: "",
		govIdNumber: "",
		emergencyContactName: "",
		emergencyContactPhone: "",
		medicalHistory: "",
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
		designation: "",
		permissions: "",
		twoFactor: true,
		auditConsent: true,
	});

	function classInput() {
		return "w-full rounded-md border border-[color:oklch(var(--color-light-primary)_/_0.3)] dark:border-[color:oklch(var(--color-dark-primary)_/_0.3)] bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-surface)] px-3 py-2 text-sm text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] placeholder:text-[color:oklch(var(--color-light-secondary-text)_/_0.8)] dark:placeholder:text-[color:oklch(var(--color-dark-secondary-text)_/_0.8)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]";
	}
	function labelCls() {
		return "block text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]";
	}
	function sectionCardCls() {
		return "rounded-lg border border-[color:oklch(var(--color-light-primary)_/_0.15)] dark:border-[color:oklch(var(--color-dark-primary)_/_0.2)] bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-surface)] p-4 shadow-sm";
	}

	const primaryBtn = "rounded-md bg-[var(--color-light-primary)] hover:bg-[var(--color-light-primary-hover)] dark:bg-[var(--color-dark-primary)] dark:hover:bg-[var(--color-dark-primary-hover)] text-white";
	const outlineBtn = "rounded-md border border-[color:oklch(var(--color-light-primary)_/_0.4)] hover:border-[var(--color-light-primary)] dark:border-[color:oklch(var(--color-dark-primary)_/_0.4)] dark:hover:border-[var(--color-dark-primary)] text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]";

	async function submitRoleOnly() {
		if (!role) return;
		setSaving(true);
		await user.update({ unsafeMetadata: { role } });
		setSaving(false);
	}

	function handleSendOtp() {
		if (!patient.phone) return;
		setOtpSent(true);
		console.log("OTP sent to:", patient.phone);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (!role) return;
		setSaving(true);
		await user.update({ unsafeMetadata: { role } });
		let payload = { role };
		if (role === "Patient") {
			payload = { ...payload, ...patient };
		} else if (role === "Doctor") {
			payload = {
				...payload,
				...doctor,
				licenseFile: doctor.licenseFile?.name || null,
				idProofFile: doctor.idProofFile?.name || null,
			};
		} else if (role === "Admin") {
			payload = { ...payload, ...admin };
		}
		console.log("Onboarding submission:", payload);
		setSaving(false);
		if (role === "Patient") navigate("/dashboard/patient", { replace: true });
		else if (role === "Doctor") navigate("/dashboard/doctor", { replace: true });
		else navigate("/dashboard/admin", { replace: true });
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">Account Onboarding</h1>
				<p className="text-sm text-[color:oklch(var(--color-light-secondary-text)_/_0.9)] dark:text-[color:oklch(var(--color-dark-secondary-text)_/_0.9)]">Choose your role and complete the minimal registration form.</p>
			</div>

			<div className={sectionCardCls()}>
				<p className="mb-3 text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">Select your role</p>
				<div className="flex flex-wrap gap-3">
					{ROLES.map((r) => (
						<button
							key={r}
							type="button"
							onClick={() => setRole(r)}
							className={`${role === r ? `${"rounded-md px-4 py-2 text-sm border border-[var(--color-light-primary)] bg-[var(--color-light-primary)] text-white dark:border-[var(--color-dark-primary)] dark:bg-[var(--color-dark-primary)]"}` : `${"rounded-md px-4 py-2 text-sm border border-[color:oklch(var(--color-light-primary)_/_0.4)] hover:border-[var(--color-light-primary)] text-[var(--color-light-primary-text)] dark:border-[color:oklch(var(--color-dark-primary)_/_0.4)] dark:hover:border-[var(--color-dark-primary)] dark:text-[var(--color-dark-primary-text)]"}`}`}
						>
							{r}
						</button>
					))}
				</div>
				{!role && <div className="mt-3 text-xs text-[var(--color-light-fail)] dark:text-[var(--color-dark-fail)]">Please select a role to continue.</div>}
			</div>

			{role && (
				<form onSubmit={handleSubmit} className="mt-6 space-y-6">
					{role === "Patient" && (
						<div className={sectionCardCls()}>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label className={labelCls()}>Full Name</label>
									<input className={classInput()} value={patient.fullName} onChange={(e) => setPatient({ ...patient, fullName: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Date of Birth</label>
									<input type="date" className={classInput()} value={patient.dob} onChange={(e) => setPatient({ ...patient, dob: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Gender</label>
									<select className={classInput()} value={patient.gender} onChange={(e) => setPatient({ ...patient, gender: e.target.value })} required>
										<option value="">Select</option>
										<option>Male</option>
										<option>Female</option>
										<option>Other</option>
										<option>Prefer not to say</option>
									</select>
								</div>
								<div>
									<label className={labelCls()}>Email (optional)</label>
									<input type="email" className={classInput()} value={patient.email} onChange={(e) => setPatient({ ...patient, email: e.target.value })} placeholder="name@example.com" />
								</div>
								<div className="md:col-span-2">
									<label className={labelCls()}>Address (village/town)</label>
									<input className={classInput()} value={patient.address} onChange={(e) => setPatient({ ...patient, address: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>District</label>
									<input className={classInput()} value={patient.district} onChange={(e) => setPatient({ ...patient, district: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Phone Number</label>
									<div className="flex gap-2">
										<input className={classInput()} value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })} placeholder="+91XXXXXXXXXX" required />
										<button type="button" onClick={handleSendOtp} className="whitespace-nowrap rounded-md bg-primary px-3 py-2 text-sm text-white">
											<Send className="mr-1 inline-block" size={16} />{otpSent ? "Resend OTP" : "Send OTP"}
										</button>
									</div>
									{otpSent && (
										<div className="mt-2">
											<label className={labelCls()}>Enter OTP</label>
											<input className={classInput()} value={patient.phoneOtp} onChange={(e) => setPatient({ ...patient, phoneOtp: e.target.value })} placeholder="6-digit code" />
										</div>
									)}
								</div>
								<div>
									<label className={labelCls()}>Govt ID Type</label>
									<select className={classInput()} value={patient.govIdType} onChange={(e) => setPatient({ ...patient, govIdType: e.target.value })}>
										<option value="">Select</option>
										<option>Aadhaar</option>
										<option>Voter ID</option>
										<option>Passport</option>
										<option>Other</option>
									</select>
								</div>
								<div>
									<label className={labelCls()}>Govt ID Number</label>
									<input className={classInput()} value={patient.govIdNumber} onChange={(e) => setPatient({ ...patient, govIdNumber: e.target.value })} />
								</div>
								<div>
									<label className={labelCls()}>Emergency Contact Name</label>
									<input className={classInput()} value={patient.emergencyContactName} onChange={(e) => setPatient({ ...patient, emergencyContactName: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Emergency Contact Phone</label>
									<input className={classInput()} value={patient.emergencyContactPhone} onChange={(e) => setPatient({ ...patient, emergencyContactPhone: e.target.value })} required />
								</div>
								<div className="md:col-span-2">
									<label className={labelCls()}>Medical History (optional)</label>
									<textarea className={classInput()} rows={3} value={patient.medicalHistory} onChange={(e) => setPatient({ ...patient, medicalHistory: e.target.value })} />
								</div>
								<div className="md:col-span-2">
									<label className="inline-flex items-center gap-2 text-sm text-primary">
										<input type="checkbox" checked={patient.telemedicineConsent} onChange={(e) => setPatient({ ...patient, telemedicineConsent: e.target.checked })} />
										Consent for telemedicine consultation
									</label>
								</div>
							</div>
						</div>
					)}

					{role === "Doctor" && (
						<div className={sectionCardCls()}>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label className={labelCls()}>Full Name</label>
									<input className={classInput()} value={doctor.fullName} onChange={(e) => setDoctor({ ...doctor, fullName: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Qualifications</label>
									<input className={classInput()} placeholder="MBBS / MD / AYUSH" value={doctor.qualifications} onChange={(e) => setDoctor({ ...doctor, qualifications: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>MCI/State Registration Number</label>
									<input className={classInput()} value={doctor.registrationNumber} onChange={(e) => setDoctor({ ...doctor, registrationNumber: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Specialty (optional)</label>
									<input className={classInput()} value={doctor.specialty} onChange={(e) => setDoctor({ ...doctor, specialty: e.target.value })} />
								</div>
								<div>
									<label className={labelCls()}>Phone</label>
									<input className={classInput()} value={doctor.phone} onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Email</label>
									<input type="email" className={classInput()} value={doctor.email} onChange={(e) => setDoctor({ ...doctor, email: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Professional License (upload)</label>
									<input type="file" className={classInput()} onChange={(e) => setDoctor({ ...doctor, licenseFile: e.target.files?.[0] || null })} />
								</div>
								<div>
									<label className={labelCls()}>Identity Proof (upload)</label>
									<input type="file" className={classInput()} onChange={(e) => setDoctor({ ...doctor, idProofFile: e.target.files?.[0] || null })} />
								</div>
								<div className="md:col-span-2">
									<label className={labelCls()}>Affiliation (Hospital/Clinic)</label>
									<input className={classInput()} value={doctor.affiliation} onChange={(e) => setDoctor({ ...doctor, affiliation: e.target.value })} />
								</div>
								<div className="md:col-span-2">
									<label className={labelCls()}>Experience (optional)</label>
									<textarea className={classInput()} rows={3} value={doctor.experience} onChange={(e) => setDoctor({ ...doctor, experience: e.target.value })} />
								</div>
								<div className="md:col-span-2">
									<label className="inline-flex items-center gap-2 text-sm text-primary">
										<input type="checkbox" checked={doctor.telemedicineConsent} onChange={(e) => setDoctor({ ...doctor, telemedicineConsent: e.target.checked })} />
										Consent to practice via Telemedicine
									</label>
								</div>
							</div>
						</div>
					)}

					{role === "Admin" && (
						<div className={sectionCardCls()}>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label className={labelCls()}>Predefined User ID</label>
									<input className={classInput()} value={admin.userId} onChange={(e) => setAdmin({ ...admin, userId: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Secure Password</label>
									<input type="password" className={classInput()} value={admin.password} onChange={(e) => setAdmin({ ...admin, password: e.target.value })} required />
								</div>
								<div>
									<label className={labelCls()}>Role designation</label>
									<select className={classInput()} value={admin.designation} onChange={(e) => setAdmin({ ...admin, designation: e.target.value })} required>
										<option value="">Select</option>
										<option>super admin</option>
										<option>moderator</option>
										<option>support staff</option>
									</select>
								</div>
								<div>
									<label className={labelCls()}>Permissions (summary)</label>
									<input className={classInput()} placeholder="comma separated" value={admin.permissions} onChange={(e) => setAdmin({ ...admin, permissions: e.target.value })} />
								</div>
								<div className="md:col-span-2 flex flex-col gap-2">
									<label className="inline-flex items-center gap-2 text-sm text-primary">
										<input type="checkbox" checked={admin.twoFactor} onChange={(e) => setAdmin({ ...admin, twoFactor: e.target.checked })} />
										Two-factor authentication recommended
									</label>
									<label className="inline-flex items-center gap-2 text-sm text-primary">
										<input type="checkbox" checked={admin.auditConsent} onChange={(e) => setAdmin({ ...admin, auditConsent: e.target.checked })} />
										Enable audit trail logging of all admin actions
									</label>
								</div>
							</div>
						</div>
					)}

					<div className="flex items-center justify-between">
						<button type="button" onClick={submitRoleOnly} className={`${outlineBtn} px-4 py-2 text-sm`} disabled={!role || saving}>
							Save Role Only
						</button>
						<button type="button" onClick={() => navigate("/")} className="text-sm/6 font-semibold text-white flex items-center gap-1">
							<X size={16} /> Cancel
						</button>
						<button type="submit" className={`${primaryBtn} px-5 py-2 text-sm font-medium disabled:opacity-60 flex items-center gap-1`} disabled={saving || !role}>
							<Check size={16} /> {saving ? "Submitting..." : "Save"}
						</button>
					</div>
				</form>
			)}
		</div>
	);
}


