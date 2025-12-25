import type { Metadata } from "next";
import { ForgotPasswordPageClient } from "./forgot-password-page-client";

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "Reset your Creafly account password. We'll send you a link to create a new password.",
	openGraph: {
		title: "Forgot Password | Creafly",
		description: "Reset your Creafly account password.",
	},
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordPageClient />;
}
