import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
	return (
		<div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
			<SignIn redirectUrl="/onboarding" afterSignInUrl="/onboarding" />
		</div>
	);
}


