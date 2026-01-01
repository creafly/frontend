"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

import { identityApi, IdentityApiError } from "@/lib/api/identity";
import { useTranslations } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabelWithTooltip } from "@/components/ui/field";

export default function ForgotPasswordPage() {
	const t = useTranslations();

	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await identityApi.forgotPassword(email);
			setIsSubmitted(true);
			toast.success(t.auth.resetLinkSent);
		} catch (error) {
			if (error instanceof IdentityApiError && error.status >= 500) {
				toast.error("An error occurred. Please try again.");
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
			<div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<div className="w-full max-w-sm">
					<div className="flex flex-col gap-6">
						<div className="flex flex-col items-center gap-4 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
								<CheckCircle className="size-6" />
							</div>
							<h1 className="text-xl font-bold">{t.auth.forgotPasswordTitle}</h1>
							<FieldDescription className="max-w-xs">{t.auth.resetLinkSent}</FieldDescription>
						</div>

						<Button asChild variant="outline" className="w-full">
							<Link href="/login">
								<ArrowLeft className="mr-2 size-4" />
								{t.auth.returnToLogin}
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-sm">
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
								<h1 className="text-xl font-bold">{t.auth.forgotPasswordTitle}</h1>
								<FieldDescription>{t.auth.forgotPasswordSubtitle}</FieldDescription>
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
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? t.auth.sendingResetLink : t.auth.sendResetLink}
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
			</div>
		</div>
	);
}
