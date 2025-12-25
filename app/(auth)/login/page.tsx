import type { Metadata } from "next";
import { LoginPageClient } from "./login-page-client";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign in to your Creafly account to create AI-powered email templates.",
	openGraph: {
		title: "Sign In | Creafly",
		description: "Sign in to your Creafly account to create AI-powered email templates.",
	},
};

export default function LoginPage() {
	return <LoginPageClient />;
}
