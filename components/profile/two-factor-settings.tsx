"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	IconShieldCheck,
	IconShieldOff,
	IconLoader2,
	IconCopy,
	IconCheck,
	IconEye,
	IconEyeOff,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { identityApi, IdentityApiError } from "@/lib/api/identity";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function TwoFactorSettings() {
	const t = useTranslations();
	const { tokens } = useAuth();
	const queryClient = useQueryClient();

	const [isSetupOpen, setIsSetupOpen] = useState(false);
	const [isDisableOpen, setIsDisableOpen] = useState(false);
	const [setupData, setSetupData] = useState<{
		secret: string;
		qrCodePng: string;
	} | null>(null);
	const [verificationCode, setVerificationCode] = useState("");
	const [disablePassword, setDisablePassword] = useState("");
	const [showSecret, setShowSecret] = useState(false);
	const [copied, setCopied] = useState(false);

	const { data: totpStatus, isLoading: isLoadingStatus } = useQuery({
		queryKey: ["totp-status"],
		queryFn: async () => {
			if (!tokens?.accessToken) throw new Error("No access token");
			return identityApi.getTotpStatus(tokens.accessToken);
		},
		enabled: !!tokens?.accessToken,
	});

	const setupMutation = useMutation({
		mutationFn: async () => {
			if (!tokens?.accessToken) throw new Error("No access token");
			return identityApi.setupTotp(tokens.accessToken);
		},
		onSuccess: (response) => {
			setSetupData({
				secret: response.data.secret,
				qrCodePng: response.data.qrCodePng,
			});
			setIsSetupOpen(true);
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to setup 2FA");
			}
		},
	});

	const enableMutation = useMutation({
		mutationFn: async (code: string) => {
			if (!tokens?.accessToken) throw new Error("No access token");
			return identityApi.enableTotp(tokens.accessToken, code);
		},
		onSuccess: () => {
			toast.success(t.twoFactor.enabledSuccess);
			setIsSetupOpen(false);
			setSetupData(null);
			setVerificationCode("");
			queryClient.invalidateQueries({ queryKey: ["totp-status"] });
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error(t.twoFactor.invalidCode);
			}
		},
	});

	const disableMutation = useMutation({
		mutationFn: async (password: string) => {
			if (!tokens?.accessToken) throw new Error("No access token");
			return identityApi.disableTotp(tokens.accessToken, password);
		},
		onSuccess: () => {
			toast.success(t.twoFactor.disabledSuccess);
			setIsDisableOpen(false);
			setDisablePassword("");
			queryClient.invalidateQueries({ queryKey: ["totp-status"] });
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to disable 2FA");
			}
		},
	});

	const handleCopySecret = async () => {
		if (setupData?.secret) {
			await navigator.clipboard.writeText(setupData.secret);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleEnableSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (verificationCode.length === 6) {
			enableMutation.mutate(verificationCode);
		}
	};

	const handleDisableSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (disablePassword) {
			disableMutation.mutate(disablePassword);
		}
	};

	const isEnabled = totpStatus?.enabled ?? false;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{isEnabled ? (
						<div className="p-2 rounded-lg bg-green-500/10">
							<IconShieldCheck className="h-5 w-5 text-green-500" />
						</div>
					) : (
						<div className="p-2 rounded-lg bg-muted">
							<IconShieldOff className="h-5 w-5 text-muted-foreground" />
						</div>
					)}
					<div>
						<p className="font-medium">{t.twoFactor.title}</p>
						<p className="text-sm text-muted-foreground">{t.twoFactor.description}</p>
					</div>
				</div>
				<Badge
					variant={isEnabled ? "default" : "secondary"}
					className={cn(isEnabled && "bg-green-500 hover:bg-green-600")}
				>
					{isEnabled ? t.twoFactor.enabled : t.twoFactor.disabled}
				</Badge>
			</div>

			{isLoadingStatus ? (
				<div className="flex items-center justify-center py-4">
					<IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			) : isEnabled ? (
				<Button variant="destructive" size="sm" onClick={() => setIsDisableOpen(true)}>
					{t.twoFactor.disable}
				</Button>
			) : (
				<Button size="sm" onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending}>
					{setupMutation.isPending ? (
						<>
							<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
							{t.common.loading}
						</>
					) : (
						t.twoFactor.setup
					)}
				</Button>
			)}

			<Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
				<DialogContent className="sm:max-w-md">
					<form onSubmit={handleEnableSubmit}>
						<DialogHeader>
							<DialogTitle>{t.twoFactor.setup}</DialogTitle>
							<DialogDescription>{t.twoFactor.scanQrCodeDescription}</DialogDescription>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{setupData?.qrCodePng && (
								<div className="flex justify-center">
									<div className="p-4 bg-white rounded-lg">
										<img
											src={`data:image/png;base64,${setupData.qrCodePng}`}
											alt="TOTP QR Code"
											className="w-48 h-48"
										/>
									</div>
								</div>
							)}

							<div className="space-y-2">
								<FieldLabel>{t.twoFactor.manualEntry}</FieldLabel>
								<FieldDescription>{t.twoFactor.manualEntryDescription}</FieldDescription>
								<div className="flex items-center gap-2">
									<Input
										type={showSecret ? "text" : "password"}
										value={setupData?.secret || ""}
										readOnly
										className="font-mono text-sm"
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() => setShowSecret(!showSecret)}
									>
										{showSecret ? (
											<IconEyeOff className="h-4 w-4" />
										) : (
											<IconEye className="h-4 w-4" />
										)}
									</Button>
									<Button type="button" variant="outline" size="icon" onClick={handleCopySecret}>
										{copied ? (
											<IconCheck className="h-4 w-4 text-green-500" />
										) : (
											<IconCopy className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>

							<FieldGroup>
								<Field>
									<FieldLabel>{t.twoFactor.verificationCode}</FieldLabel>
									<div className="flex justify-center">
										<InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
											<InputOTPGroup>
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>
									</div>
								</Field>
							</FieldGroup>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsSetupOpen(false);
									setSetupData(null);
									setVerificationCode("");
								}}
							>
								{t.common.cancel}
							</Button>
							<Button
								type="submit"
								disabled={verificationCode.length !== 6 || enableMutation.isPending}
							>
								{enableMutation.isPending ? (
									<>
										<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
										{t.twoFactor.verifying}
									</>
								) : (
									t.twoFactor.verify
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
				<DialogContent className="sm:max-w-md">
					<form onSubmit={handleDisableSubmit}>
						<DialogHeader>
							<DialogTitle>{t.twoFactor.disableConfirm}</DialogTitle>
							<DialogDescription>{t.twoFactor.disableDescription}</DialogDescription>
						</DialogHeader>

						<FieldGroup className="py-4">
							<Field>
								<FieldLabel>{t.twoFactor.enterPassword}</FieldLabel>
								<PasswordInput
									value={disablePassword}
									onChange={(e) => setDisablePassword(e.target.value)}
									placeholder={t.twoFactor.passwordPlaceholder}
									required
								/>
							</Field>
						</FieldGroup>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsDisableOpen(false);
									setDisablePassword("");
								}}
							>
								{t.common.cancel}
							</Button>
							<Button
								type="submit"
								variant="destructive"
								disabled={!disablePassword || disableMutation.isPending}
							>
								{disableMutation.isPending ? (
									<>
										<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
										{t.common.loading}
									</>
								) : (
									t.twoFactor.disable
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
