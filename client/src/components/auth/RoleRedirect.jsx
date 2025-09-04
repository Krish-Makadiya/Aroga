import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function RoleRedirect() {
	const { isLoaded, user } = useUser();
	if (!isLoaded) return null;
	const role = user?.publicMetadata?.role || user?.unsafeMetadata?.role;
	if (!role) return <Navigate to="/onboarding" replace />;
	if (role === "Patient") return <Navigate to="/dashboard/patient" replace />;
	if (role === "Doctor") return <Navigate to="/dashboard/doctor" replace />;
	if (role === "Admin") return <Navigate to="/dashboard/admin" replace />;
	return <Navigate to="/onboarding" replace />;
}


