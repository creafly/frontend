"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconLoader2, IconLock } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { identityApi } from "@/lib/api/identity";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Icon } from "@/components/typography";

type ChangePasswordFields = "currentPassword" | "newPassword" | "confirmPassword";

export function ChangePasswordForm() {
	const t = useTranslations();
	const { tokens } = useAuth();
	const { fieldErrors, handleError, clearFieldError, clearAllErrors } =
		useFieldErrors<ChangePasswordFields>();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const mutation = useMutation({
		mutationFn: async () => {
			if (!tokens?.accessToken) throw new Error("No access token");
			return identityApi.changePassword(tokens.accessToken, {
				currentPassword,
				newPassword,
			});
		},
		onSuccess: () => {
			toast.success(t.profile.passwordChanged);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			clearAllErrors();
		},
		onError: (error) => {
			handleError(error, "Failed to change password");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		clearAllErrors();
		if (newPassword !== confirmPassword) {
			toast.error(t.profile.passwordMismatch);
			return;
		}
		mutation.mutate();
	};

	return (
		<Card variant="ghost">
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-muted">
						<Icon icon={IconLock} size="lg" className="text-muted-foreground" />
					</div>
					<div>
						<CardTitle>{t.profile.changePassword}</CardTitle>
						<CardDescription>{t.profile.securityDescription}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<FieldGroup>
						<Field data-invalid={!!fieldErrors.currentPassword}>
							<FieldLabel>{t.profile.currentPassword}</FieldLabel>
							<PasswordInput
								value={currentPassword}
								onChange={(e) => {
									setCurrentPassword(e.target.value);
									clearFieldError("currentPassword");
								}}
								required
							/>
							<FieldError>{fieldErrors.currentPassword}</FieldError>
						</Field>
						<Field data-invalid={!!fieldErrors.newPassword}>
							<FieldLabel>{t.profile.newPassword}</FieldLabel>
							<PasswordInput
								value={newPassword}
								onChange={(e) => {
									setNewPassword(e.target.value);
									clearFieldError("newPassword");
								}}
								required
								minLength={8}
							/>
							<FieldError>{fieldErrors.newPassword}</FieldError>
						</Field>
						<Field data-invalid={!!fieldErrors.confirmPassword}>
							<FieldLabel>{t.profile.confirmNewPassword}</FieldLabel>
							<PasswordInput
								value={confirmPassword}
								onChange={(e) => {
									setConfirmPassword(e.target.value);
									clearFieldError("confirmPassword");
								}}
								required
								minLength={8}
							/>
							<FieldError>{fieldErrors.confirmPassword}</FieldError>
						</Field>
					</FieldGroup>
					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? (
							<>
								<Icon icon={IconLoader2} size="sm" className="mr-2 animate-spin" />
								{t.common.loading}
							</>
						) : (
							t.profile.changePassword
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
