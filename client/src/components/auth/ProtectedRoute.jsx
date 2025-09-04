import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function ProtectedRoute({ children, requiredRole }) {
	const location = useLocation();
	const { isLoaded, isSignedIn, user } = useUser();

	if (!isLoaded) return null;
	if (!isSignedIn) {
		return <Navigate to="/" replace state={{ from: location }} />;
	}

	const role = user?.unsafeMetadata?.role;
	if (requiredRole && role !== requiredRole) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
}


