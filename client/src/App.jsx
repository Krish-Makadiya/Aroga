import { ArrowRight, Book, Brain, ChartColumnIncreasing, DollarSign, FileText, Headset, LayoutDashboard, Phone, Pill, Settings, Venus } from "lucide-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Onboarding from "./pages/auth/Onboarding";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRedirect from "./components/auth/RoleRedirect";
import PatientDashboard from "./pages/patientPages/PatientDashboard/PatientDashboard";
import DoctorDashboard from "./pages/doctorPages/DoctorDashboard/DoctorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import SymptomChecker from "./pages/patientPages/SymptomChecker/SymptomChecker";
import WomensHealth from "./pages/patientPages/WomensHealth/WomensHealth";
import AccountEarning from "./pages/doctorPages/AccountEarnings/AccountEarning";
import GetAppointment from "./pages/patientPages/GetAppointment/GetAppointment";

const patientTabs = [
    {
        id: 1,
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/patient/dashboard",
    },
    {
        id: 2,
        name: "Symptoms Checker",
        icon: Pill,
        path: "/patient/symptom-checker",
    },
    {
        id: 3,
        name: "Women’s Health",
        icon: Venus,
        path: "/patient/womens-health",
    },
    {
        id: 4,
        name: "Get Appointment",
        icon: Venus,
        path: "/patient/get-appointment",
    },
];

const doctorTabs = [
    {
        id: 1,
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/doctor/dashboard",
    },
    {
        id: 2,
        name: "Account & Earning",
        icon: DollarSign,
        path: "/doctor/account-earning",
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
                            <PatientDashboard tabs={patientTabs}/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/symptom-checker"
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <SymptomChecker tabs={patientTabs}/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/womens-health"
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <WomensHealth tabs={patientTabs}/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/get-appointment"
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <GetAppointment tabs={patientTabs}/>
                        </ProtectedRoute>
                    }
                />

                {/* TODO: DOCTORS */}
                <Route
                    path="/doctor/dashboard"
                    element={
                        <ProtectedRoute requiredRole="Doctor">
                            <DoctorDashboard tabs={doctorTabs} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor/account-earning"
                    element={
                        <ProtectedRoute requiredRole="Doctor">
                            <AccountEarning tabs={doctorTabs} />
                        </ProtectedRoute>
                    }
                />


                {/*<Route
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
