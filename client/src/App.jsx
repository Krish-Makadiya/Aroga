import { ArrowRight, Book, Brain, ChartColumnIncreasing, DollarSign, FileText, Headset, LayoutDashboard, Phone } from "lucide-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Onboarding from "./pages/auth/Onboarding";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRedirect from "./components/auth/RoleRedirect";
import PatientDashboard from "./pages/dashboards/PatientDashboard/PatientDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

const tabs = [
    {
        id: 1,
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/patient/dashboard",
    },
    {
        id: 2,
        name: "Symptoms Checker",
        icon: LayoutDashboard,
        path: "/patient/symptom-checker",
    },
];

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />

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
                    path="/patient/dashboard"
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <PatientDashboard tabs={tabs}/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/symptom-checker"
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <PatientDashboard tabs={tabs}/>
                        </ProtectedRoute>
                    }
                />

                
                {/* <Route
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
                /> */}

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
