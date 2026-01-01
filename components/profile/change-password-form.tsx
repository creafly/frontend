"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconLoader2, IconLock } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { identityApi, IdentityApiError } from "@/lib/api/identity";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export function ChangePasswordForm() {
	const t = useTranslations();
	const { tokens } = useAuth();

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
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to change password");
			}
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error(t.profile.passwordMismatch);
			return;
		}
		mutation.mutate();
	};

	return (
		<Card clear>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-muted">
						<IconLock className="h-6 w-6 text-muted-foreground" />
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
						<Field>
							<FieldLabel>{t.profile.currentPassword}</FieldLabel>
							<PasswordInput
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								required
							/>
						</Field>
						<Field>
							<FieldLabel>{t.profile.newPassword}</FieldLabel>
							<PasswordInput
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
								minLength={8}
							/>
						</Field>
						<Field>
							<FieldLabel>{t.profile.confirmNewPassword}</FieldLabel>
							<PasswordInput
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								minLength={8}
							/>
						</Field>
					</FieldGroup>
					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? (
							<>
								<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
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
