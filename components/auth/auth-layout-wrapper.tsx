"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { StripeGuides } from "@/components/ui/stripe-guides";

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			router.replace("/workspaces");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (isAuthenticated) {
		return null;
	}

	return (
		<div className="relative min-h-svh">
			<StripeGuides className="fixed inset-0 z-0" fade={false} opacity={0.06} />

			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-150 h-150 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-100 h-100 rounded-full bg-chart-1/10 blur-3xl" />
			</div>

			<div className="relative z-10">{children}</div>
		</div>
	);
}
