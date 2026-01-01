"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle, KeyRound } from "lucide-react";

import { identityApi, IdentityApiError } from "@/lib/api/identity";
import { useTranslations } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Field, FieldDescription, FieldGroup, FieldLabelWithTooltip } from "@/components/ui/field";

function ResetPasswordForm() {
	const t = useTranslations();
	const searchParams = useSearchParams();

	const token = searchParams.get("token") || "";

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toast.error(t.auth.passwordMismatch);
			return;
		}

		if (!token) {
			setError(t.auth.invalidResetToken);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await identityApi.resetPassword(token, newPassword);
			setIsSuccess(true);
			toast.success(t.auth.passwordResetSuccess);
		} catch (err) {
			if (err instanceof IdentityApiError) {
				setError(err.message);
				toast.error(err.message);
			} else {
				setError(t.auth.invalidResetToken);
				toast.error(t.auth.invalidResetToken);
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
						<KeyRound className="size-6" />
					</div>
					<h1 className="text-xl font-bold">{t.auth.resetPasswordTitle}</h1>
					<FieldDescription className="max-w-xs">{t.auth.invalidResetToken}</FieldDescription>
				</div>

				<Button asChild variant="outline" className="w-full">
					<Link href="/forgot-password">{t.auth.forgotPassword}</Link>
				</Button>

				<Button asChild variant="ghost" className="w-full">
					<Link href="/login">
						<ArrowLeft className="mr-2 size-4" />
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
					<div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
						<CheckCircle className="size-6" />
					</div>
					<h1 className="text-xl font-bold">{t.auth.resetPasswordTitle}</h1>
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
						<Link href="/" className="flex flex-col items-center gap-2 font-medium">
							<div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<Mail className="size-4" />
							</div>
							<span className="sr-only">Hexaend</span>
						</Link>
						<h1 className="text-xl font-bold">{t.auth.resetPasswordTitle}</h1>
						<FieldDescription>{t.auth.resetPasswordSubtitle}</FieldDescription>
					</div>

					<Field>
						<FieldLabelWithTooltip htmlFor="newPassword" tooltip={t.auth.tooltips.password}>
							{t.auth.newPassword}
						</FieldLabelWithTooltip>
						<PasswordInput
							id="newPassword"
							placeholder={t.auth.newPasswordPlaceholder}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
							disabled={isLoading}
						/>
					</Field>

					<Field>
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
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							disabled={isLoading}
						/>
					</Field>

					<Field>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? t.auth.resettingPassword : t.auth.resetPassword}
						</Button>
					</Field>

					<Field>
						<Button asChild variant="ghost" className="w-full">
							<Link href="/login">
								<ArrowLeft className="mr-2 size-4" />
								{t.auth.backToLogin}
							</Link>
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
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
