import type { Metadata } from "next";
import { AuthLayoutWrapper } from "@/components/auth/auth-layout-wrapper";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}
