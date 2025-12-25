"use client";

import { RegisterForm } from "@/components/auth/register-form";

export function RegisterPageClient() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-md">
				<RegisterForm />
			</div>
		</div>
	);
}
