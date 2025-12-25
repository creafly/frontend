import type { Metadata } from "next";
import { VerifyEmailPageClient } from "./verify-email-page-client";

export const metadata: Metadata = {
	title: "Verify Email",
	description: "Verify your email address to complete your Creafly account setup.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function VerifyEmailPage() {
	return <VerifyEmailPageClient />;
}
