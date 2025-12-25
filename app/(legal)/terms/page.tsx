import type { Metadata } from "next";
import { TermsPageClient } from "./terms-page-client";

export const metadata: Metadata = {
	title: "Terms of Service",
	description:
		"Read Creafly's terms of service and usage policies for our AI-powered email template generation platform.",
	openGraph: {
		title: "Terms of Service | Creafly",
		description:
			"Read Creafly's terms of service and usage policies for our AI-powered email template generation platform.",
	},
};

export default function TermsPage() {
	return <TermsPageClient />;
}
