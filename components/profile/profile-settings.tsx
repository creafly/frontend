"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconLoader2, IconUser } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { identityApi, IdentityApiError } from "@/lib/api/identity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

interface ProfileInfoFormProps {
	compact?: boolean;
}

export function ProfileInfoForm({ compact = false }: ProfileInfoFormProps) {
	const t = useTranslations();
	const { user, tokens } = useAuth();
	const queryClient = useQueryClient();

	const [firstName, setFirstName] = useState(user?.firstName || "");
	const [lastName, setLastName] = useState(user?.lastName || "");
	const [username, setUsername] = useState(user?.username || "");

	const updateMutation = useMutation({
		mutationFn: async () => {
			if (!tokens?.accessToken) throw new Error("No access token");
			return identityApi.updateProfile(tokens.accessToken, {
				firstName: firstName || undefined,
				lastName: lastName || undefined,
				username: username || undefined,
			});
		},
		onSuccess: () => {
			toast.success(t.profile.saved);
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to update profile");
			}
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateMutation.mutate();
	};

	if (compact) {
		return (
			<form onSubmit={handleSubmit} className="space-y-4">
				<FieldGroup>
					<div className="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel>{t.profile.firstName}</FieldLabel>
							<Input
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder={t.auth.firstNamePlaceholder}
							/>
						</Field>
						<Field>
							<FieldLabel>{t.profile.lastName}</FieldLabel>
							<Input
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder={t.auth.lastNamePlaceholder}
							/>
						</Field>
					</div>
					<Field>
						<FieldLabel>{t.profile.username}</FieldLabel>
						<Input
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder={t.auth.usernamePlaceholder}
						/>
					</Field>
				</FieldGroup>
				<Button type="submit" disabled={updateMutation.isPending}>
					{updateMutation.isPending ? (
						<>
							<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
							{t.profile.saving}
						</>
					) : (
						t.profile.save
					)}
				</Button>
			</form>
		);
	}

	return (
		<Card clear>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-muted">
						<IconUser className="h-6 w-6 text-muted-foreground" />
					</div>
					<div>
						<CardTitle>{t.profile.personalInfo}</CardTitle>
						<CardDescription>{t.profile.personalInfoDescription}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<FieldGroup>
						<div className="grid grid-cols-2 gap-4">
							<Field>
								<FieldLabel>{t.profile.firstName}</FieldLabel>
								<Input
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									placeholder={t.auth.firstNamePlaceholder}
								/>
							</Field>
							<Field>
								<FieldLabel>{t.profile.lastName}</FieldLabel>
								<Input
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									placeholder={t.auth.lastNamePlaceholder}
								/>
							</Field>
						</div>
						<Field>
							<FieldLabel>{t.profile.username}</FieldLabel>
							<Input
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder={t.auth.usernamePlaceholder}
							/>
						</Field>
						<Field>
							<FieldLabel>{t.profile.email}</FieldLabel>
							<Input value={user?.email || ""} disabled />
						</Field>
					</FieldGroup>
					<Button type="submit" disabled={updateMutation.isPending}>
						{updateMutation.isPending ? (
							<>
								<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
								{t.profile.saving}
							</>
						) : (
							t.profile.save
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
