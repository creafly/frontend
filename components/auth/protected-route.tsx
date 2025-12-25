"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireEmailVerification?: boolean;
}

export function ProtectedRoute({ children, requireEmailVerification = true }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login");
		}
	}, [isAuthenticated, isLoading, router]);

	useEffect(() => {
		if (
			!isLoading &&
			isAuthenticated &&
			requireEmailVerification &&
			user &&
			!user.emailVerified &&
			pathname !== "/verify-email"
		) {
			router.replace("/verify-email");
		}
	}, [isAuthenticated, isLoading, user, requireEmailVerification, pathname, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	if (requireEmailVerification && user && !user.emailVerified && pathname !== "/verify-email") {
		return null;
	}

	return <>{children}</>;
}
