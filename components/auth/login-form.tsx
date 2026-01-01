"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, ShieldCheck } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "@/providers/i18n-provider";
import { useCookieConsent } from "@/providers/cookie-consent-provider";
import { IdentityApiError } from "@/lib/api/identity";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field, FieldDescription, FieldGroup, FieldLabelWithTooltip } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
	const t = useTranslations();
	const router = useRouter();
	const { login, loginVerifyTOTP } = useAuth();
	const { hasConsent } = useCookieConsent();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const [showTOTP, setShowTOTP] = useState(false);
	const [tempToken, setTempToken] = useState("");
	const [totpCode, setTotpCode] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!hasConsent) {
			toast.error(t.auth.cookieConsentRequired);
			return;
		}

		setIsLoading(true);

		try {
			const result = await login({ email, password });

			if (result.totpRequired && result.tempToken) {
				setTempToken(result.tempToken);
				setShowTOTP(true);
				setIsLoading(false);
				return;
			}

			if (result.success) {
				toast.success(t.auth.loginSuccess);
				router.replace("/workspaces");
			}
		} catch (error) {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error(t.auth.loginError);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleTOTPSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (totpCode.length !== 6) {
			toast.error(t.auth.totpCodeRequired || "Please enter the 6-digit code");
			return;
		}

		setIsLoading(true);

		try {
			await loginVerifyTOTP(tempToken, totpCode);
			toast.success(t.auth.loginSuccess);
			router.replace("/workspaces");
		} catch (error) {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error(t.auth.totpVerificationError || "Invalid verification code");
			}
			setTotpCode("");
		} finally {
			setIsLoading(false);
		}
	};

	const handleBackToLogin = () => {
		setShowTOTP(false);
		setTempToken("");
		setTotpCode("");
	};

	if (showTOTP) {
		return (
			<div className={cn("flex flex-col gap-6", className)} {...props}>
				<form onSubmit={handleTOTPSubmit}>
					<FieldGroup>
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<ShieldCheck className="size-6" />
							</div>
							<h1 className="text-xl font-bold">
								{t.auth.twoFactorAuth || "Two-Factor Authentication"}
							</h1>
							<FieldDescription>
								{t.auth.enterTotpCode || "Enter the 6-digit code from your authenticator app"}
							</FieldDescription>
						</div>

						<Field className="flex flex-col items-center">
							<InputOTP
								className="justify-center"
								maxLength={6}
								value={totpCode}
								onChange={(value) => setTotpCode(value)}
								disabled={isLoading}
							>
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
						</Field>

						<Field>
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading || totpCode.length !== 6}
							>
								{isLoading ? t.auth.verifying || "Verifying..." : t.auth.verify || "Verify"}
							</Button>
						</Field>

						<Field>
							<Button
								type="button"
								variant="ghost"
								className="w-full"
								onClick={handleBackToLogin}
								disabled={isLoading}
							>
								{t.auth.backToLogin || "Back to login"}
							</Button>
						</Field>
					</FieldGroup>
				</form>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<form onSubmit={handleSubmit}>
				<FieldGroup>
					<div className="flex flex-col items-center gap-2 text-center">
						<Link href="/" className="flex flex-col items-center gap-2 font-medium">
							<div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<Mail className="size-4" />
							</div>
							<span className="sr-only">Creafly</span>
						</Link>
						<h1 className="text-xl font-bold">{t.auth.welcomeTo}</h1>
						<FieldDescription>
							{t.auth.noAccount} <Link href="/register">{t.auth.register}</Link>
						</FieldDescription>
					</div>

					<Field>
						<FieldLabelWithTooltip htmlFor="email" tooltip={t.auth.tooltips.email}>
							{t.auth.email}
						</FieldLabelWithTooltip>
						<Input
							id="email"
							type="email"
							placeholder={t.auth.emailPlaceholder}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading}
						/>
					</Field>

					<Field>
						<div className="flex items-center justify-between">
							<FieldLabelWithTooltip htmlFor="password" tooltip={t.auth.tooltips.password}>
								{t.auth.password}
							</FieldLabelWithTooltip>
							<Link
								href="/forgot-password"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								{t.auth.forgotPassword}
							</Link>
						</div>
						<PasswordInput
							id="password"
							placeholder={t.auth.passwordPlaceholder}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={isLoading}
						/>
					</Field>

					<Field>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? t.auth.loggingIn : t.auth.loginButton}
						</Button>
					</Field>
				</FieldGroup>
			</form>

			<FieldDescription className="px-6 text-center">
				{t.auth.termsText} <Link href="/terms">{t.auth.termsLink}</Link> и{" "}
				<Link href="/privacy">{t.auth.privacyLink}</Link>.
			</FieldDescription>
		</div>
	);
}
