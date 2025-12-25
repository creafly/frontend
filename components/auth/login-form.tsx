"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconShieldCheck } from "@tabler/icons-react";
import { Icon, TypographyH1 } from "@/components/typography";
import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "@/providers/i18n-provider";
import { useCookieConsent } from "@/providers/cookie-consent-provider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabelWithTooltip,
} from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type LoginFormFields = "email" | "password" | "code";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
	const t = useTranslations();
	const router = useRouter();
	const { login, loginVerifyTOTP } = useAuth();
	const { hasConsent } = useCookieConsent();
	const { fieldErrors, handleError, clearFieldError, clearAllErrors } =
		useFieldErrors<LoginFormFields>();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const [showTOTP, setShowTOTP] = useState(false);
	const [tempToken, setTempToken] = useState("");
	const [totpCode, setTotpCode] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearAllErrors();

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
			handleError(error, t.auth.loginError);
		} finally {
			setIsLoading(false);
		}
	};

	const handleTOTPSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearAllErrors();

		if (totpCode.length !== 6) {
			toast.error(t.auth.totpCodeRequired);
			return;
		}

		setIsLoading(true);

		try {
			await loginVerifyTOTP(tempToken, totpCode);
			toast.success(t.auth.loginSuccess);
			router.replace("/workspaces");
		} catch (error) {
			handleError(error, t.auth.totpVerificationError);
			setTotpCode("");
		} finally {
			setIsLoading(false);
		}
	};

	const handleBackToLogin = () => {
		setShowTOTP(false);
		setTempToken("");
		setTotpCode("");
		clearAllErrors();
	};

	if (showTOTP) {
		return (
			<div className={cn("flex flex-col gap-6", className)} {...props}>
				<form onSubmit={handleTOTPSubmit}>
					<FieldGroup>
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<Icon icon={IconShieldCheck} size="lg" />
							</div>
							<TypographyH1 size="xs">{t.auth.twoFactorAuth}</TypographyH1>
							<FieldDescription>{t.auth.enterTotpCode}</FieldDescription>
						</div>

						<Field data-invalid={!!fieldErrors.code} className="flex flex-col items-center">
							<InputOTP
								className="justify-center"
								maxLength={6}
								value={totpCode}
								onChange={(value) => {
									setTotpCode(value);
									clearFieldError("code");
								}}
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
							<FieldError>{fieldErrors.code}</FieldError>
						</Field>

						<Field>
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading || totpCode.length !== 6}
							>
								{isLoading ? t.auth.verifying : t.auth.verify}
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
								{t.auth.backToLogin}
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
						<Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
							<Image src="/logo.svg" alt="Creafly" width={32} height={32} />
						</Link>
						<TypographyH1 size="xs" className="mt-4">
							{t.auth.welcomeTo}
						</TypographyH1>
						<FieldDescription>
							{t.auth.noAccount} <Link href="/register">{t.auth.register}</Link>
						</FieldDescription>
					</div>

					<Field data-invalid={!!fieldErrors.email}>
						<FieldLabelWithTooltip htmlFor="email" tooltip={t.auth.tooltips.email}>
							{t.auth.email}
						</FieldLabelWithTooltip>
						<Input
							id="email"
							type="email"
							placeholder={t.auth.emailPlaceholder}
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								clearFieldError("email");
							}}
							required
							disabled={isLoading}
						/>
						<FieldError>{fieldErrors.email}</FieldError>
					</Field>

					<Field data-invalid={!!fieldErrors.password}>
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
							onChange={(e) => {
								setPassword(e.target.value);
								clearFieldError("password");
							}}
							required
							disabled={isLoading}
						/>
						<FieldError>{fieldErrors.password}</FieldError>
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
