import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import OnboardingForm from "../components/OnboardingForm";

export default function Onboarding() {
    const { isLoaded, isSignedIn } = useUser();
    const navigate = useNavigate();

    if (!isLoaded) return null;
    if (!isSignedIn) {
        navigate("/sign-in", { replace: true });
        return null;
    }

    return <OnboardingForm />;
}
