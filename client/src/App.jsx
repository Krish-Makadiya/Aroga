import { ArrowRight } from "lucide-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/auth/SignInPage";
import Onboarding from "./pages/auth/Onboarding";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRedirect from "./components/auth/RoleRedirect";
import PatientDashboard from "./pages/dashboards/PatientDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* Auth */}
                <Route path="/sign-in" element={<SignInPage />} />

                {/* Onboarding */}
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Dashboards */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <RoleRedirect />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/patient"
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/doctor"
                    element={
                        <ProtectedRoute requiredRole="Doctor">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin"
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
