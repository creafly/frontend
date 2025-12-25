import type { Metadata } from "next";
import { ResetPasswordPageClient } from "./reset-password-page-client";

export const metadata: Metadata = {
	title: "Reset Password",
	description: "Create a new password for your Creafly account.",
	openGraph: {
		title: "Reset Password | Creafly",
		description: "Create a new password for your Creafly account.",
	},
};

export default function ResetPasswordPage() {
	return <ResetPasswordPageClient />;
}
