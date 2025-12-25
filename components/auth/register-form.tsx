"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TypographyH1 } from "@/components/typography";

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

type RegisterFormFields =
	| "email"
	| "username"
	| "password"
	| "firstName"
	| "lastName"
	| "confirmPassword";

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
	const t = useTranslations();
	const router = useRouter();
	const { register } = useAuth();
	const { hasConsent } = useCookieConsent();
	const { fieldErrors, handleError, clearFieldError, clearAllErrors } =
		useFieldErrors<RegisterFormFields>();

	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearAllErrors();

		if (!hasConsent) {
			toast.error(t.auth.cookieConsentRequired);
			return;
		}

		if (password !== confirmPassword) {
			toast.error(t.auth.passwordMismatch);
			return;
		}

		setIsLoading(true);

		try {
			await register({ email, username: username || undefined, password, firstName, lastName });
			toast.success(t.auth.registerSuccess);
			router.replace("/workspaces");
		} catch (error) {
			handleError(error, t.auth.registerError);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<form onSubmit={handleSubmit}>
				<FieldGroup>
					<div className="flex flex-col items-center gap-2 text-center">
						<Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
							<Image src="/logo.svg" alt="Creafly" width={32} height={32} />
						</Link>
						<TypographyH1 size="xs" className="mt-4">
							{t.auth.registerTitle}
						</TypographyH1>
						<FieldDescription>
							{t.auth.haveAccount} <Link href="/login">{t.auth.login}</Link>
						</FieldDescription>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<Field data-invalid={!!fieldErrors.firstName}>
							<FieldLabelWithTooltip htmlFor="firstName" tooltip={t.auth.tooltips.firstName}>
								{t.auth.firstName}
							</FieldLabelWithTooltip>
							<Input
								id="firstName"
								type="text"
								placeholder={t.auth.firstNamePlaceholder}
								value={firstName}
								onChange={(e) => {
									setFirstName(e.target.value);
									clearFieldError("firstName");
								}}
								required
								disabled={isLoading}
							/>
							<FieldError>{fieldErrors.firstName}</FieldError>
						</Field>
						<Field data-invalid={!!fieldErrors.lastName}>
							<FieldLabelWithTooltip htmlFor="lastName" tooltip={t.auth.tooltips.lastName}>
								{t.auth.lastName}
							</FieldLabelWithTooltip>
							<Input
								id="lastName"
								type="text"
								placeholder={t.auth.lastNamePlaceholder}
								value={lastName}
								onChange={(e) => {
									setLastName(e.target.value);
									clearFieldError("lastName");
								}}
								required
								disabled={isLoading}
							/>
							<FieldError>{fieldErrors.lastName}</FieldError>
						</Field>
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

					<Field data-invalid={!!fieldErrors.username}>
						<FieldLabelWithTooltip htmlFor="username" tooltip={t.auth.tooltips.username}>
							{t.auth.username}
						</FieldLabelWithTooltip>
						<Input
							id="username"
							type="text"
							placeholder={t.auth.usernamePlaceholder}
							value={username}
							onChange={(e) => {
								setUsername(e.target.value);
								clearFieldError("username");
							}}
							disabled={isLoading}
						/>
						<FieldError>{fieldErrors.username}</FieldError>
					</Field>

					<Field data-invalid={!!fieldErrors.password}>
						<FieldLabelWithTooltip htmlFor="password" tooltip={t.auth.tooltips.password}>
							{t.auth.password}
						</FieldLabelWithTooltip>
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
							minLength={6}
						/>
						<FieldError>{fieldErrors.password}</FieldError>
					</Field>

					<Field data-invalid={!!fieldErrors.confirmPassword}>
						<FieldLabelWithTooltip
							htmlFor="confirmPassword"
							tooltip={t.auth.tooltips.confirmPassword}
						>
							{t.auth.confirmPassword}
						</FieldLabelWithTooltip>
						<PasswordInput
							id="confirmPassword"
							placeholder={t.auth.passwordPlaceholder}
							value={confirmPassword}
							onChange={(e) => {
								setConfirmPassword(e.target.value);
								clearFieldError("confirmPassword");
							}}
							required
							disabled={isLoading}
							minLength={6}
						/>
						<FieldError>{fieldErrors.confirmPassword}</FieldError>
					</Field>

					<Field>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? t.auth.registering : t.auth.registerButton}
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
