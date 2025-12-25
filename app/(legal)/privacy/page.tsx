import type { Metadata } from "next";
import { PrivacyPageClient } from "./privacy-page-client";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "Learn how Creafly collects, uses, and protects your personal information. Read our privacy policy.",
	openGraph: {
		title: "Privacy Policy | Creafly",
		description: "Learn how Creafly collects, uses, and protects your personal information.",
	},
};

export default function PrivacyPage() {
	return <PrivacyPageClient />;
}
