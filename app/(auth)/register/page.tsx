import type { Metadata } from "next";
import { RegisterPageClient } from "./register-page-client";

export const metadata: Metadata = {
	title: "Create Account",
	description: "Create your free Creafly account and start generating beautiful email templates with AI.",
	openGraph: {
		title: "Create Account | Creafly",
		description: "Create your free Creafly account and start generating beautiful email templates with AI.",
	},
};

export default function RegisterPage() {
	return <RegisterPageClient />;
}
