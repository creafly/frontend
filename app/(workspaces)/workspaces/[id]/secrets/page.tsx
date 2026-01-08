"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
	IconArrowLeft,
	IconLoader2,
	IconPlus,
	IconTrash,
	IconEdit,
	IconKey,
	IconEye,
	IconEyeOff,
	IconCopy,
	IconSearch,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { Icon, TypographyH1, TypographyMuted, TypographyP } from "@/components/typography";
import { useResolveTenantSlug, useTenant } from "@/hooks/use-api";
import { useSecrets, useCreateSecret, useUpdateSecret, useDeleteSecret } from "@/hooks/use-secrets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardPagination } from "@/components/ui/card-pagination";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { Secret } from "@/types/secrets";
import Container from "@/components/container";

const ITEMS_PER_PAGE = 12;

interface SecretFormData {
	name: string;
	description: string;
	value: string;
}

const initialFormData: SecretFormData = {
	name: "",
	description: "",
	value: "",
};

export default function SecretsPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const t = useTranslations();

	const [deleteSecretId, setDeleteSecretId] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
	const [formData, setFormData] = useState<SecretFormData>(initialFormData);
	const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
	const { data: resolvedTenant, isLoading: isResolving } = useResolveTenantSlug(
		isUUID ? undefined : id
	);
	const resolvedTenantId = isUUID ? id : resolvedTenant?.id;

	const { data: tenantData, isLoading: isTenantLoading } = useTenant(resolvedTenantId);
	const { data: secretsData, isLoading: isSecretsLoading } = useSecrets(resolvedTenantId || "", {
		limit: ITEMS_PER_PAGE,
		offset: (currentPage - 1) * ITEMS_PER_PAGE,
		search: debouncedSearch || undefined,
	});

	const createSecret = useCreateSecret();
	const updateSecret = useUpdateSecret();
	const deleteSecret = useDeleteSecret();

	const tenant = tenantData?.tenant;
	const secrets = secretsData?.secrets || [];
	const totalSecrets = secretsData?.total || 0;
	const isLoading = isResolving || isTenantLoading || isSecretsLoading;
	const totalPages = Math.ceil(totalSecrets / ITEMS_PER_PAGE);

	const handleSearchChange = useCallback((value: string) => {
		setSearchQuery(value);
		const timeoutId = setTimeout(() => {
			setDebouncedSearch(value);
			setCurrentPage(1);
		}, 300);
		return () => clearTimeout(timeoutId);
	}, []);

	const handleOpenCreate = () => {
		setEditingSecret(null);
		setFormData(initialFormData);
		setIsFormOpen(true);
	};

	const handleOpenEdit = (secret: Secret) => {
		setEditingSecret(secret);
		setFormData({
			name: secret.name,
			description: secret.description || "",
			value: "",
		});
		setIsFormOpen(true);
	};

	const handleCloseForm = () => {
		setIsFormOpen(false);
		setEditingSecret(null);
		setFormData(initialFormData);
	};

	const handleSubmit = async () => {
		if (!resolvedTenantId) return;

		try {
			if (editingSecret) {
				await updateSecret.mutateAsync({
					tenantId: resolvedTenantId,
					secretId: editingSecret.id,
					request: {
						name: formData.name || undefined,
						description: formData.description || undefined,
						value: formData.value || undefined,
					},
				});
				toast.success(t.secrets.secretUpdated);
			} else {
				await createSecret.mutateAsync({
					tenantId: resolvedTenantId,
					request: {
						name: formData.name,
						description: formData.description || undefined,
						value: formData.value,
					},
				});
				toast.success(t.secrets.secretCreated);
			}
			handleCloseForm();
		} catch {
			toast.error(editingSecret ? t.secrets.secretUpdateFailed : t.secrets.secretCreateFailed);
		}
	};

	const handleDelete = async () => {
		if (!deleteSecretId || !resolvedTenantId) return;

		try {
			await deleteSecret.mutateAsync({ tenantId: resolvedTenantId, secretId: deleteSecretId });
			toast.success(t.secrets.secretDeleted);
			setDeleteSecretId(null);
		} catch {
			toast.error(t.secrets.secretDeleteFailed);
		}
	};

	const toggleSecretVisibility = (secretId: string) => {
		setVisibleSecrets((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(secretId)) {
				newSet.delete(secretId);
			} else {
				newSet.add(secretId);
			}
			return newSet;
		});
	};

	const handleCopyValue = async (secret: Secret) => {
		if (secret.value) {
			await navigator.clipboard.writeText(secret.value);
			toast.success(t.secrets.valueCopied);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full min-h-96">
				<Icon icon={IconLoader2} size="xl" className="animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!tenant) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-96">
				<TypographyMuted className="mb-4">{t.workspaces.workspaceNotFound}</TypographyMuted>
				<Link href="/workspaces">
					<Button variant="outline">
						<Icon icon={IconArrowLeft} className="mr-2" />
						{t.workspaces.backToWorkspaces}
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<Container className="max-w-full">
			<div className="flex flex-wrap items-center justify-between mb-6 gap-2">
				<div className="flex items-center gap-4">
					<div>
						<TypographyH1 size="sm">{t.secrets.title}</TypographyH1>
						<TypographyMuted>{t.secrets.subtitle}</TypographyMuted>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={handleOpenCreate}>
						<Icon icon={IconPlus} className="mr-2" />
						{t.secrets.createSecret}
					</Button>
				</div>
			</div>

			<div className="mb-6">
				<div className="relative max-w-md">
					<Icon
						icon={IconSearch}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						placeholder={t.secrets.searchPlaceholder}
						value={searchQuery}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{totalSecrets === 0 ? (
				<div className="flex-1 flex items-center justify-center">
					<Empty className="min-h-80 border-2 border-dashed">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon icon={IconKey} size="lg" className="text-muted-foreground" />
							</EmptyMedia>
							<EmptyTitle>{t.secrets.noSecrets}</EmptyTitle>
							<EmptyDescription>{t.secrets.noSecretsDescription}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={handleOpenCreate}>
								<Icon icon={IconPlus} className="mr-2" />
								{t.secrets.createSecret}
							</Button>
						</EmptyContent>
					</Empty>
				</div>
			) : (
				<div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<AnimatePresence mode="popLayout">
							{secrets.map((secret: Secret) => (
								<motion.div
									key={secret.id}
									layout
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="flex flex-col gap-3 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex items-center gap-3 min-w-0">
											<Icon icon={IconKey} size="lg" className="text-primary shrink-0" />
											<div className="min-w-0">
												<TypographyP className="font-medium truncate mt-0">
													{secret.name}
												</TypographyP>
												{secret.description && (
													<TypographyMuted className="text-xs truncate">
														{secret.description}
													</TypographyMuted>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
										<code className="flex-1 text-sm font-mono truncate">
											{visibleSecrets.has(secret.id) && secret.value
												? secret.value
												: t.secrets.masked}
										</code>
										{secret.hasValue && (
											<>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7"
													onClick={() => toggleSecretVisibility(secret.id)}
													title={
														visibleSecrets.has(secret.id)
															? t.secrets.hideValue
															: t.secrets.showValue
													}
												>
													<Icon
														icon={visibleSecrets.has(secret.id) ? IconEyeOff : IconEye}
														size="sm"
													/>
												</Button>
												{visibleSecrets.has(secret.id) && secret.value && (
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() => handleCopyValue(secret)}
														title={t.secrets.copyValue}
													>
														<Icon icon={IconCopy} size="sm" />
													</Button>
												)}
											</>
										)}
									</div>

									<div className="flex items-center justify-between pt-2 border-t">
										<TypographyMuted className="text-xs">
											{new Date(secret.createdAt).toLocaleDateString()}
										</TypographyMuted>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => handleOpenEdit(secret)}
											>
												<Icon icon={IconEdit} size="sm" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive hover:text-destructive"
												onClick={() => setDeleteSecretId(secret.id)}
											>
												<Icon icon={IconTrash} size="sm" />
											</Button>
										</div>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</div>

					<CardPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						totalItems={totalSecrets}
						itemsPerPage={ITEMS_PER_PAGE}
						labels={{
							previous: t.common.previous,
							next: t.common.next,
							of: t.common.of,
							showing: t.common.showing,
							items: t.common.items,
						}}
					/>
				</div>
			)}

			<Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingSecret ? t.secrets.editSecret : t.secrets.createSecret}
						</DialogTitle>
						<DialogDescription>
							{editingSecret ? t.secrets.tooltips.description : t.secrets.tooltips.value}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">{t.secrets.secretName}</Label>
							<Input
								id="name"
								placeholder={t.secrets.secretNamePlaceholder}
								value={formData.name}
								onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">{t.secrets.secretDescription}</Label>
							<Textarea
								id="description"
								placeholder={t.secrets.secretDescriptionPlaceholder}
								value={formData.description}
								onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
								rows={2}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="value">{t.secrets.secretValue}</Label>
							<Input
								id="value"
								type="password"
								placeholder={
									editingSecret
										? "Leave empty to keep current value"
										: t.secrets.secretValuePlaceholder
								}
								value={formData.value}
								onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleCloseForm}>
							{t.common.cancel}
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={
								(!editingSecret && (!formData.name || !formData.value)) ||
								createSecret.isPending ||
								updateSecret.isPending
							}
						>
							{(createSecret.isPending || updateSecret.isPending) && (
								<Icon icon={IconLoader2} className="mr-2 animate-spin" />
							)}
							{editingSecret ? t.common.save : t.common.create}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!deleteSecretId}
				onOpenChange={(open) => !open && setDeleteSecretId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.secrets.deleteSecret}</AlertDialogTitle>
						<AlertDialogDescription>{t.secrets.deleteSecretConfirm}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteSecret.isPending && <Icon icon={IconLoader2} className="mr-2 animate-spin" />}
							{t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Container>
	);
}
