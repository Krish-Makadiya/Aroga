import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function ProtectedRoute({ children, requiredRole }) {
	const location = useLocation();
	const { isLoaded, isSignedIn, user } = useUser();

	if (!isLoaded) return null;
	if (!isSignedIn) {
		return <Navigate to="/" replace state={{ from: location }} />;
	}

	const rawRole = user?.publicMetadata?.role || user?.unsafeMetadata?.role || "";
	const role = typeof rawRole === "string" ? rawRole.trim().toLowerCase() : "";

	if (requiredRole) {
		const required = String(requiredRole).trim().toLowerCase();
		if (role !== required) {
			return <Navigate to="/dashboard" replace />;
		}
	}

	return children;
}


