"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { CheckCircle, RefreshCw } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TypographyH1 } from "@/components/typography";
import { FieldDescription, FieldGroup, Field } from "@/components/ui/field";
import { StripeGuides } from "@/components/ui/stripe-guides";

const RESEND_COOLDOWN = 60;

export function VerifyEmailPageClient() {
	const t = useTranslations();
	const router = useRouter();
	const { user, isAuthenticated, isLoading, verifyEmail, resendVerificationEmail, logout } =
		useAuth();

	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const [isVerifying, setIsVerifying] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const [isSuccess, setIsSuccess] = useState(false);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login");
		}
	}, [isAuthenticated, isLoading, router]);

	useEffect(() => {
		if (!isLoading && user?.emailVerified) {
			router.replace("/workspaces");
		}
	}, [isLoading, user, router]);

	useEffect(() => {
		if (resendCooldown > 0) {
			const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [resendCooldown]);

	const handleVerify = useCallback(async () => {
		const fullCode = code.join("");
		if (fullCode.length !== 6 || isVerifying) return;

		setIsVerifying(true);
		try {
			const result = await verifyEmail(fullCode);
			if (result.success) {
				setIsSuccess(true);
				toast.success(t.auth.emailVerification?.success || "Email verified successfully!");
				setTimeout(() => {
					router.replace("/workspaces");
				}, 1500);
			} else {
				toast.error(result.error || t.auth.emailVerification?.invalidCode || "Invalid code");
				setCode(["", "", "", "", "", ""]);
				inputRefs.current[0]?.focus();
			}
		} finally {
			setIsVerifying(false);
		}
	}, [code, isVerifying, verifyEmail, router, t]);

	useEffect(() => {
		const fullCode = code.join("");
		if (fullCode.length === 6) {
			handleVerify();
		}
	}, [code, handleVerify]);

	const handleInputChange = (index: number, value: string) => {
		if (value && !/^\d+$/.test(value)) return;

		const newCode = [...code];

		if (value.length > 1) {
			const digits = value.slice(0, 6).split("");
			digits.forEach((digit, i) => {
				if (index + i < 6) {
					newCode[index + i] = digit;
				}
			});
			setCode(newCode);
			const nextIndex = Math.min(index + digits.length, 5);
			inputRefs.current[nextIndex]?.focus();
			return;
		}

		newCode[index] = value;
		setCode(newCode);

		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleResend = async () => {
		if (resendCooldown > 0 || isResending) return;

		setIsResending(true);
		try {
			const result = await resendVerificationEmail();
			if (result.success) {
				toast.success(t.auth.emailVerification?.codeSent || "Verification code sent!");
				setResendCooldown(RESEND_COOLDOWN);
			} else {
				toast.error(
					result.error || t.auth.emailVerification?.resendFailed || "Failed to resend code"
				);
			}
		} finally {
			setIsResending(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!isAuthenticated || user?.emailVerified) {
		return null;
	}

	return (
		<div className="relative min-h-svh">
			<StripeGuides className="fixed inset-0 z-0" fade={false} opacity={0.06} />

			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-150 h-150 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-100 h-100 rounded-full bg-chart-1/10 blur-3xl" />
			</div>

			<div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<div className="w-full max-w-sm">
					<div className="flex flex-col gap-6">
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<Link
									href="/"
									className="flex items-center gap-2 transition-opacity hover:opacity-70"
								>
									<Image src="/logo.svg" alt="Creafly" width={32} height={32} />
								</Link>

								{isSuccess ? (
									<div className="mt-4 flex flex-col items-center gap-4">
										<CheckCircle className="h-16 w-16 text-green-500" />
										<TypographyH1 size="xs">
											{t.auth.emailVerification?.successTitle || "Email Verified!"}
										</TypographyH1>
										<FieldDescription>
											{t.auth.emailVerification?.redirecting || "Redirecting to your workspaces..."}
										</FieldDescription>
									</div>
								) : (
									<>
										<TypographyH1 size="xs" className="mt-2">
											{t.auth.emailVerification?.title || "Verify your email"}
										</TypographyH1>
										<FieldDescription className="max-w-xs">
											{t.auth.emailVerification?.description ||
												`We've sent a 6-digit code to ${user?.email}. Enter it below to verify your email.`}
										</FieldDescription>
									</>
								)}
							</div>

							{!isSuccess && (
								<>
									<Field>
										<div className="flex justify-center gap-2">
											{code.map((digit, index) => (
												<Input
													key={index}
													ref={(el) => {
														inputRefs.current[index] = el;
													}}
													type="text"
													inputMode="numeric"
													maxLength={6}
													value={digit}
													onChange={(e) => handleInputChange(index, e.target.value)}
													onKeyDown={(e) => handleKeyDown(index, e)}
													disabled={isVerifying}
													className={cn(
														"h-12 w-12 text-center text-lg font-semibold",
														"focus:ring-2 focus:ring-primary"
													)}
													autoFocus={index === 0}
												/>
											))}
										</div>
									</Field>

									<Field>
										<Button
											type="button"
											variant="outline"
											className="w-full"
											onClick={handleResend}
											disabled={resendCooldown > 0 || isResending}
										>
											<RefreshCw className={cn("mr-2 h-4 w-4", isResending && "animate-spin")} />
											{resendCooldown > 0
												? `${t.auth.emailVerification?.resendIn || "Resend in"} ${resendCooldown}s`
												: t.auth.emailVerification?.resend || "Resend code"}
										</Button>
									</Field>

									<Field>
										<Button
											type="button"
											variant="ghost"
											className="w-full"
											onClick={() => {
												logout();
												router.replace("/login");
											}}
										>
											{t.auth.emailVerification?.useAnotherAccount || "Use a different account"}
										</Button>
									</Field>
								</>
							)}
						</FieldGroup>
					</div>
				</div>
			</div>
		</div>
	);
}
