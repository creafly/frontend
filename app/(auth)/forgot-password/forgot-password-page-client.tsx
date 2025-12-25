"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { IconArrowLeft, IconCircleCheck } from "@tabler/icons-react";
import { Icon, TypographyH1 } from "@/components/typography";

import { identityApi } from "@/lib/api/identity";
import { useTranslations } from "@/providers/i18n-provider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabelWithTooltip,
} from "@/components/ui/field";
import { ApiError } from "@/lib/api/fetch-with-retry";

export function ForgotPasswordPageClient() {
	const t = useTranslations();
	const { fieldErrors, handleError, clearFieldError, clearAllErrors } = useFieldErrors<"email">();

	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearAllErrors();
		setIsLoading(true);

		try {
			await identityApi.forgotPassword(email);
			setIsSubmitted(true);
			toast.success(t.auth.resetLinkSent);
		} catch (error) {
			if (error instanceof ApiError && error.status >= 500) {
				toast.error("An error occurred. Please try again.");
			} else if (error instanceof ApiError && error.isValidationError()) {
				handleError(error);
			} else {
				setIsSubmitted(true);
				toast.success(t.auth.resetLinkSent);
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<div className="w-full max-w-sm">
					<div className="flex flex-col gap-6">
						<div className="flex flex-col items-center gap-4 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
								<Icon icon={IconCircleCheck} size="lg" />
							</div>
							<TypographyH1 size="xs">{t.auth.forgotPasswordTitle}</TypographyH1>
							<FieldDescription className="max-w-xs">{t.auth.resetLinkSent}</FieldDescription>
						</div>

						<Button asChild variant="outline" className="w-full">
							<Link href="/login">
								<Icon icon={IconArrowLeft} size="sm" className="mr-2" />
								{t.auth.returnToLogin}
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<Link
									href="/"
									className="flex items-center gap-2 transition-opacity hover:opacity-70"
								>
									<Image src="/logo.svg" alt="Creafly" width={32} height={32} />
								</Link>
								<TypographyH1 size="xs" className="mt-4">
									{t.auth.forgotPasswordTitle}
								</TypographyH1>
								<FieldDescription>{t.auth.forgotPasswordSubtitle}</FieldDescription>
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

							<Field>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? t.auth.sendingResetLink : t.auth.sendResetLink}
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
			</div>
		</div>
	);
}
