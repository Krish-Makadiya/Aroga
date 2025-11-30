import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function RoleRedirect() {
	const { isLoaded, user } = useUser();
	if (!isLoaded) return null;
	const rawRole = user?.publicMetadata?.role || user?.unsafeMetadata?.role;
	const role = typeof rawRole === "string" ? rawRole.trim().toLowerCase() : null;
	if (!role) return <Navigate to="/onboarding" replace />;

	// Map known roles to the routes used in App.jsx
	if (role === "patient") return <Navigate to="/patient/dashboard" replace />;
	if (role === "doctor") return <Navigate to="/doctor/dashboard" replace />;
	if (role === "pharmacy") return <Navigate to="/pharmacy/dashboard" replace />;
	if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
	return <Navigate to="/onboarding" replace />;
}


