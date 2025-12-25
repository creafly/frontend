"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IconArrowLeft, IconCircleCheck, IconKey } from "@tabler/icons-react";
import { Icon, TypographyH1 } from "@/components/typography";
import { identityApi } from "@/lib/api/identity";
import { useTranslations } from "@/providers/i18n-provider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabelWithTooltip,
} from "@/components/ui/field";

type ResetPasswordFields = "newPassword" | "confirmPassword";

function ResetPasswordForm() {
	const t = useTranslations();
	const searchParams = useSearchParams();
	const { fieldErrors, handleError, clearFieldError, clearAllErrors } =
		useFieldErrors<ResetPasswordFields>();

	const token = searchParams.get("token") || "";

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearAllErrors();

		if (newPassword !== confirmPassword) {
			toast.error(t.auth.passwordMismatch);
			return;
		}

		if (!token) {
			toast.error(t.auth.invalidResetToken);
			return;
		}

		setIsLoading(true);

		try {
			await identityApi.resetPassword(token, newPassword);
			setIsSuccess(true);
			toast.success(t.auth.passwordResetSuccess);
		} catch (error) {
			handleError(error, t.auth.invalidResetToken);
		} finally {
			setIsLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
						<Icon icon={IconKey} size="lg" />
					</div>
					<TypographyH1 size="xs">{t.auth.resetPasswordTitle}</TypographyH1>
					<FieldDescription className="max-w-xs">{t.auth.invalidResetToken}</FieldDescription>
				</div>

				<Button asChild variant="outline" className="w-full">
					<Link href="/forgot-password">{t.auth.forgotPassword}</Link>
				</Button>

				<Button asChild variant="ghost" className="w-full">
					<Link href="/login">
						<Icon icon={IconArrowLeft} size="sm" className="mr-2" />
						{t.auth.returnToLogin}
					</Link>
				</Button>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
						<Icon icon={IconCircleCheck} size="lg" />
					</div>
					<TypographyH1 size="xs">{t.auth.resetPasswordTitle}</TypographyH1>
					<FieldDescription className="max-w-xs">{t.auth.passwordResetSuccess}</FieldDescription>
				</div>

				<Button asChild className="w-full">
					<Link href="/login">{t.auth.returnToLogin}</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<form onSubmit={handleSubmit}>
				<FieldGroup>
					<div className="flex flex-col items-center gap-2 text-center">
						<Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
							<Image src="/logo.svg" alt="Creafly" width={32} height={32} />
						</Link>
						<TypographyH1 size="xs" className="mt-4">
							{t.auth.resetPasswordTitle}
						</TypographyH1>
						<FieldDescription>{t.auth.resetPasswordSubtitle}</FieldDescription>
					</div>

					<Field data-invalid={!!fieldErrors.newPassword}>
						<FieldLabelWithTooltip htmlFor="newPassword" tooltip={t.auth.tooltips.password}>
							{t.auth.newPassword}
						</FieldLabelWithTooltip>
						<PasswordInput
							id="newPassword"
							placeholder={t.auth.newPasswordPlaceholder}
							value={newPassword}
							onChange={(e) => {
								setNewPassword(e.target.value);
								clearFieldError("newPassword");
							}}
							required
							disabled={isLoading}
						/>
						<FieldError>{fieldErrors.newPassword}</FieldError>
					</Field>

					<Field data-invalid={!!fieldErrors.confirmPassword}>
						<FieldLabelWithTooltip
							htmlFor="confirmPassword"
							tooltip={t.auth.tooltips.confirmPassword}
						>
							{t.auth.confirmNewPassword}
						</FieldLabelWithTooltip>
						<PasswordInput
							id="confirmPassword"
							placeholder={t.auth.confirmNewPasswordPlaceholder}
							value={confirmPassword}
							onChange={(e) => {
								setConfirmPassword(e.target.value);
								clearFieldError("confirmPassword");
							}}
							required
							disabled={isLoading}
						/>
						<FieldError>{fieldErrors.confirmPassword}</FieldError>
					</Field>

					<Field>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? t.auth.resettingPassword : t.auth.resetPassword}
						</Button>
					</Field>

					<Field>
						<Button asChild variant="ghost" className="w-full">
							<Link href="/login">
								<Icon icon={IconArrowLeft} size="sm" className="mr-2" />
								{t.auth.backToLogin}
							</Link>
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</div>
	);
}

export function ResetPasswordPageClient() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Suspense
					fallback={
						<div className="flex items-center justify-center">
							<div className="animate-spin rounded-full size-8 border-b-2 border-primary" />
						</div>
					}
				>
					<ResetPasswordForm />
				</Suspense>
			</div>
		</div>
	);
}
