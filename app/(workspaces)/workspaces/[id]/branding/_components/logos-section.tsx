"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	IconPlus,
	IconTrash,
	IconEdit,
	IconLoader2,
	IconPhoto,
	IconSquare,
	IconSquareCheck,
	IconX,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import {
	useLogos,
	useCreateLogo,
	useUpdateLogo,
	useDeleteLogo,
	useDeleteLogosBatch,
} from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabelWithTooltip } from "@/components/ui/field";
import { CardPagination } from "@/components/ui/card-pagination";
import { Icon, TypographyH3, TypographyMuted, TypographyP } from "@/components/typography";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { BrandLogo } from "@/types/branding";

const ITEMS_PER_PAGE = 12;

type LogoType = "primary" | "secondary" | "favicon" | "icon";

interface LogosSectionProps {
	tenantId: string;
}

export function LogosSection({ tenantId }: LogosSectionProps) {
	const t = useTranslations();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteLogoId, setDeleteLogoId] = useState<string | null>(null);
	const [selectedLogo, setSelectedLogo] = useState<BrandLogo | null>(null);

	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);

	const [name, setName] = useState("");
	const [type, setType] = useState<LogoType>("primary");
	const [fileUrl, setFileUrl] = useState("");

	const [currentPage, setCurrentPage] = useState(1);

	const { data: logosData, isLoading } = useLogos(tenantId, {
		limit: ITEMS_PER_PAGE,
		offset: (currentPage - 1) * ITEMS_PER_PAGE,
	});

	const logos = logosData?.logos || [];
	const totalLogos = logosData?.total || 0;
	const totalPages = Math.ceil(totalLogos / ITEMS_PER_PAGE);

	const createLogo = useCreateLogo();
	const updateLogo = useUpdateLogo();
	const deleteLogo = useDeleteLogo();
	const deleteLogosBatch = useDeleteLogosBatch();

	const resetForm = () => {
		setName("");
		setType("primary");
		setFileUrl("");
		setSelectedLogo(null);
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !fileUrl.trim()) return;

		try {
			await createLogo.mutateAsync({
				tenantId,
				request: {
					name: name.trim(),
					type,
					fileUrl: fileUrl.trim(),
				},
			});
			toast.success(t.branding.logoCreated);
			setIsCreateOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.logoCreateFailed);
		}
	};

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedLogo || !name.trim()) return;

		try {
			await updateLogo.mutateAsync({
				tenantId,
				logoId: selectedLogo.id,
				request: {
					name: name.trim(),
					type,
					fileUrl: fileUrl.trim() || undefined,
				},
			});
			toast.success(t.branding.logoUpdated);
			setIsEditOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.logoUpdateFailed);
		}
	};

	const handleDelete = async () => {
		if (!deleteLogoId) return;

		try {
			await deleteLogo.mutateAsync({ tenantId, logoId: deleteLogoId });
			toast.success(t.branding.logoDeleted);
			setDeleteLogoId(null);
		} catch {
			toast.error(t.branding.logoDeleteFailed);
		}
	};

	const openEditDialog = (logo: BrandLogo) => {
		setSelectedLogo(logo);
		setName(logo.name);
		setType(logo.type);
		setFileUrl(logo.fileUrl || "");
		setIsEditOpen(true);
	};

	const toggleSelection = (id: string) => {
		setSelectedIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	const selectAll = () => {
		setSelectedIds(new Set(logos.map((l) => l.id)));
	};

	const deselectAll = () => {
		setSelectedIds(new Set());
	};

	const exitSelectionMode = () => {
		setIsSelectionMode(false);
		setSelectedIds(new Set());
	};

	const handleBatchDelete = async () => {
		try {
			await deleteLogosBatch.mutateAsync({
				tenantId,
				request: { ids: Array.from(selectedIds) },
			});
			toast.success(t.branding.batchDeleteSuccess.replace("{count}", String(selectedIds.size)));
			setIsBatchDeleteOpen(false);
			exitSelectionMode();
		} catch {
			toast.error(t.branding.batchDeleteFailed);
		}
	};

	const getLogoTypeLabel = (logoType: LogoType): string => {
		return t.branding.logoTypes?.[logoType] || logoType;
	};

	const sortedLogos = logos;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Icon icon={IconLoader2} size="lg" className="animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="h-full space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<TypographyH3 size="xs">{t.branding.logos}</TypographyH3>
					<TypographyMuted>{t.branding.logosDescription}</TypographyMuted>
				</div>
				<div className="flex flex-wrap gap-2">
					{isSelectionMode ? (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={selectedIds.size === logos.length ? deselectAll : selectAll}
							>
								{selectedIds.size === logos.length ? (
									<>
										<Icon icon={IconSquare} size="sm" className="mr-2" />
										{t.common.deselectAll}
									</>
								) : (
									<>
										<Icon icon={IconSquareCheck} size="sm" className="mr-2" />
										{t.common.selectAll}
									</>
								)}
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => setIsBatchDeleteOpen(true)}
								disabled={selectedIds.size === 0}
							>
								<Icon icon={IconTrash} size="sm" className="mr-2" />
								{t.branding.deleteSelected} ({selectedIds.size})
							</Button>
							<Button variant="ghost" size="sm" onClick={exitSelectionMode}>
								<Icon icon={IconX} size="sm" className="mr-2" />
								{t.common.cancel}
							</Button>
						</>
					) : (
						<>
							{logos.length > 0 && (
								<Button variant="outline" onClick={() => setIsSelectionMode(true)}>
									<Icon icon={IconSquareCheck} size="sm" className="mr-2" />
									{t.branding.selectItems}
								</Button>
							)}
							<Button onClick={() => setIsCreateOpen(true)}>
								<Icon icon={IconPlus} size="sm" className="mr-2" />
								{t.branding.addLogo}
							</Button>
						</>
					)}
				</div>
			</div>

			{sortedLogos.length === 0 && totalLogos === 0 ? (
				<div className="flex-1 flex items-center justify-center min-h-60">
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon" size="lg">
								<Icon icon={IconPhoto} size="xl" className="text-muted-foreground" />
							</EmptyMedia>
							<EmptyTitle>{t.branding.noLogos}</EmptyTitle>
							<EmptyDescription>{t.branding.noLogosDescription}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => setIsCreateOpen(true)}>
								<Icon icon={IconPlus} size="md" className="mr-2" />
								{t.branding.addLogo}
							</Button>
						</EmptyContent>
					</Empty>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{sortedLogos.map((logo) => (
							<div
								key={logo.id}
								className={`p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors ${
									isSelectionMode && selectedIds.has(logo.id) ? "ring-2 ring-primary" : ""
								}`}
								onClick={isSelectionMode ? () => toggleSelection(logo.id) : undefined}
							>
								{isSelectionMode && (
									<div className="flex justify-end mb-2">
										<Checkbox
											checked={selectedIds.has(logo.id)}
											onCheckedChange={() => toggleSelection(logo.id)}
										/>
									</div>
								)}
								<div className="w-full h-24 rounded-md mb-3 border bg-muted/30 flex items-center justify-center overflow-hidden">
									{logo.fileUrl ? (
										<img
											src={logo.fileUrl}
											alt={logo.name}
											className="max-w-full max-h-full object-contain"
										/>
									) : (
										<Icon icon={IconPhoto} size="xl" className="text-muted-foreground" />
									)}
								</div>
								<div className="flex items-center justify-between">
									<div className="min-w-0 flex-1">
										<TypographyP className="font-medium text-sm truncate mt-0">
											{logo.name}
										</TypographyP>
										<TypographyMuted className="text-xs">
											{getLogoTypeLabel(logo.type)}
										</TypographyMuted>
									</div>
									{!isSelectionMode && (
										<div className="flex gap-1 ml-2">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => openEditDialog(logo)}
											>
												<Icon icon={IconEdit} size="sm" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive hover:text-destructive"
												onClick={() => setDeleteLogoId(logo.id)}
											>
												<Icon icon={IconTrash} size="sm" />
											</Button>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
					<CardPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						totalItems={totalLogos}
						itemsPerPage={ITEMS_PER_PAGE}
						labels={{
							showing: t.common.showing,
							of: t.common.of,
							items: t.branding.logos.toLowerCase(),
						}}
					/>
				</>
			)}

			<Dialog
				open={isCreateOpen}
				onOpenChange={(open) => {
					setIsCreateOpen(open);
					if (!open) resetForm();
				}}
			>
				<DialogContent>
					<form onSubmit={handleCreate}>
						<DialogHeader>
							<DialogTitle>{t.branding.addLogo}</DialogTitle>
							<DialogDescription>{t.branding.addLogoDescription}</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.logoName}>
										{t.branding.logoName}
									</FieldLabelWithTooltip>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Main Logo"
										required
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.logoType}>
										{t.branding.logoType}
									</FieldLabelWithTooltip>
									<Select value={type} onValueChange={(v) => setType(v as LogoType)}>
										<SelectTrigger>
											<SelectValue placeholder={t.branding.selectLogoType} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="primary">{t.branding.logoTypes.primary}</SelectItem>
											<SelectItem value="secondary">{t.branding.logoTypes.secondary}</SelectItem>
											<SelectItem value="favicon">{t.branding.logoTypes.favicon}</SelectItem>
											<SelectItem value="icon">{t.branding.logoTypes.icon}</SelectItem>
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.logoFile}>
										{t.branding.logoFile}
									</FieldLabelWithTooltip>
									<Input
										value={fileUrl}
										onChange={(e) => setFileUrl(e.target.value)}
										placeholder="https://example.com/logo.png"
										type="url"
										required
									/>
								</Field>
							</FieldGroup>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
								{t.common.cancel}
							</Button>
							<Button type="submit" disabled={createLogo.isPending}>
								{createLogo.isPending && (
									<Icon icon={IconLoader2} size="sm" className="mr-2 animate-spin" />
								)}
								{t.common.create}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isEditOpen}
				onOpenChange={(open) => {
					setIsEditOpen(open);
					if (!open) resetForm();
				}}
			>
				<DialogContent>
					<form onSubmit={handleEdit}>
						<DialogHeader>
							<DialogTitle>{t.branding.editLogo}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.logoName}>
										{t.branding.logoName}
									</FieldLabelWithTooltip>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.logoType}>
										{t.branding.logoType}
									</FieldLabelWithTooltip>
									<Select value={type} onValueChange={(v) => setType(v as LogoType)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="primary">{t.branding.logoTypes.primary}</SelectItem>
											<SelectItem value="secondary">{t.branding.logoTypes.secondary}</SelectItem>
											<SelectItem value="favicon">{t.branding.logoTypes.favicon}</SelectItem>
											<SelectItem value="icon">{t.branding.logoTypes.icon}</SelectItem>
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.logoFile}>
										{t.branding.logoFile}
									</FieldLabelWithTooltip>
									<Input
										value={fileUrl}
										onChange={(e) => setFileUrl(e.target.value)}
										placeholder="https://example.com/logo.png"
										type="url"
									/>
								</Field>
							</FieldGroup>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
								{t.common.cancel}
							</Button>
							<Button type="submit" disabled={updateLogo.isPending}>
								{updateLogo.isPending && (
									<Icon icon={IconLoader2} size="sm" className="mr-2 animate-spin" />
								)}
								{t.common.save}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={!!deleteLogoId} onOpenChange={(open) => !open && setDeleteLogoId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.branding.deleteLogo}</AlertDialogTitle>
						<AlertDialogDescription>{t.branding.deleteLogoConfirm}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteLogo.isPending && (
								<Icon icon={IconLoader2} size="sm" className="mr-2 animate-spin" />
							)}
							{t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={isBatchDeleteOpen} onOpenChange={setIsBatchDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.branding.deleteSelected}</AlertDialogTitle>
						<AlertDialogDescription>
							{t.branding.batchDeleteConfirm.replace("{count}", String(selectedIds.size))}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleBatchDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteLogosBatch.isPending && (
								<Icon icon={IconLoader2} size="sm" className="mr-2 animate-spin" />
							)}
							{t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
