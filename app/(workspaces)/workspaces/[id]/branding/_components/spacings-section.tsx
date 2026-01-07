"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	IconPlus,
	IconTrash,
	IconEdit,
	IconLoader2,
	IconCopyPlus,
	IconSquare,
	IconSquareCheck,
	IconX,
	IconPaint,
	IconRefresh,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import {
	useSpacings,
	useCreateSpacing,
	useUpdateSpacing,
	useDeleteSpacing,
	useDeleteSpacingsBatch,
	useRestoreSpacing,
	useRestoreSpacingsBatch,
} from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { Field, FieldGroup, FieldLabelWithTooltip } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import type { BrandSpacing } from "@/types/branding";

const ITEMS_PER_PAGE = 12;

interface SpacingRow {
	id: string;
	name: string;
	value: number;
}

interface SpacingsSectionProps {
	tenantId: string;
}

export function SpacingsSection({ tenantId }: SpacingsSectionProps) {
	const t = useTranslations();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isBatchCreateOpen, setIsBatchCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteSpacingId, setDeleteSpacingId] = useState<string | null>(null);
	const [selectedSpacing, setSelectedSpacing] = useState<BrandSpacing | null>(null);

	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
	const [showDeleted, setShowDeleted] = useState(false);

	const [name, setName] = useState("");
	const [value, setValue] = useState(16);

	const [batchRows, setBatchRows] = useState<SpacingRow[]>([
		{ id: crypto.randomUUID(), name: "", value: 16 },
	]);
	const [isBatchCreating, setIsBatchCreating] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);

	const { data: spacingsData, isLoading } = useSpacings(tenantId, {
		limit: ITEMS_PER_PAGE,
		offset: (currentPage - 1) * ITEMS_PER_PAGE,
		includeDeleted: showDeleted,
	});

	const spacings = spacingsData?.spacings || [];
	const totalSpacings = spacingsData?.total || 0;
	const totalPages = Math.ceil(totalSpacings / ITEMS_PER_PAGE);

	const createSpacing = useCreateSpacing();
	const updateSpacing = useUpdateSpacing();
	const deleteSpacing = useDeleteSpacing();
	const deleteSpacingsBatch = useDeleteSpacingsBatch();
	const restoreSpacing = useRestoreSpacing();
	const restoreSpacingsBatch = useRestoreSpacingsBatch();

	const resetForm = () => {
		setName("");
		setValue(16);
		setSelectedSpacing(null);
	};

	const resetBatchForm = () => {
		setBatchRows([{ id: crypto.randomUUID(), name: "", value: 16 }]);
	};

	const addBatchRow = () => {
		setBatchRows([...batchRows, { id: crypto.randomUUID(), name: "", value: 16 }]);
	};

	const removeBatchRow = (id: string) => {
		if (batchRows.length > 1) {
			setBatchRows(batchRows.filter((row) => row.id !== id));
		}
	};

	const updateBatchRow = (id: string, field: "name" | "value", newValue: string | number) => {
		setBatchRows(batchRows.map((row) => (row.id === id ? { ...row, [field]: newValue } : row)));
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		try {
			await createSpacing.mutateAsync({
				tenantId,
				request: { name: name.trim(), value },
			});
			toast.success(t.branding.spacingCreated);
			setIsCreateOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.spacingCreateFailed);
		}
	};

	const handleBatchCreate = async (e: React.FormEvent) => {
		e.preventDefault();

		const validRows = batchRows.filter((row) => row.name.trim());
		if (validRows.length === 0) return;

		setIsBatchCreating(true);
		let successCount = 0;
		let failCount = 0;

		for (const row of validRows) {
			try {
				await createSpacing.mutateAsync({
					tenantId,
					request: { name: row.name.trim(), value: row.value },
				});
				successCount++;
			} catch {
				failCount++;
			}
		}

		setIsBatchCreating(false);

		if (failCount === 0) {
			toast.success(t.branding.batchCreateSuccess.replace("{count}", String(successCount)));
			setIsBatchCreateOpen(false);
			resetBatchForm();
		} else if (successCount > 0) {
			toast.warning(
				t.branding.batchCreatePartial
					.replace("{success}", String(successCount))
					.replace("{total}", String(validRows.length))
			);
		} else {
			toast.error(t.branding.spacingCreateFailed);
		}
	};

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedSpacing || !name.trim()) return;

		try {
			await updateSpacing.mutateAsync({
				tenantId,
				spacingId: selectedSpacing.id,
				request: { name: name.trim(), value },
			});
			toast.success(t.branding.spacingUpdated);
			setIsEditOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.spacingUpdateFailed);
		}
	};

	const handleDelete = async () => {
		if (!deleteSpacingId) return;

		try {
			await deleteSpacing.mutateAsync({ tenantId, spacingId: deleteSpacingId });
			toast.success(t.branding.spacingDeleted);
			setDeleteSpacingId(null);
		} catch {
			toast.error(t.branding.spacingDeleteFailed);
		}
	};

	const openEditDialog = (spacing: BrandSpacing) => {
		setSelectedSpacing(spacing);
		setName(spacing.name);
		setValue(spacing.value);
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
		setSelectedIds(new Set(spacings.map((s) => s.id)));
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
			await deleteSpacingsBatch.mutateAsync({
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

	const handleRestore = async (spacingId: string) => {
		try {
			await restoreSpacing.mutateAsync({ tenantId, spacingId });
			toast.success(t.branding.spacingRestored);
		} catch {
			toast.error(t.branding.spacingRestoreFailed);
		}
	};

	const handleBatchRestore = async () => {
		try {
			await restoreSpacingsBatch.mutateAsync({
				tenantId,
				request: { ids: Array.from(selectedIds) },
			});
			toast.success(t.branding.batchRestoreSuccess.replace("{count}", String(selectedIds.size)));
			exitSelectionMode();
		} catch {
			toast.error(t.branding.batchRestoreFailed);
		}
	};

	const sortedSpacings = spacings;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Icon icon={IconLoader2} size="lg" className="animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex flex-1 items-center justify-between gap-4">
					<div>
						<TypographyH3 size="xs">{t.branding.spacings}</TypographyH3>
						<TypographyMuted>{t.branding.spacingsDescription}</TypographyMuted>
					</div>
					<div className="flex items-center gap-2">
						<Switch
							id="show-deleted-spacings"
							checked={showDeleted}
							onCheckedChange={setShowDeleted}
						/>
						<Label htmlFor="show-deleted-spacings" className="text-sm text-muted-foreground">
							{t.common.showDeleted}
						</Label>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					{isSelectionMode ? (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={selectedIds.size === spacings.length ? deselectAll : selectAll}
							>
								{selectedIds.size === spacings.length ? (
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
							{showDeleted && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleBatchRestore}
									disabled={selectedIds.size === 0 || restoreSpacingsBatch.isPending}
								>
									{restoreSpacingsBatch.isPending ? (
										<Icon icon={IconLoader2} size="sm" className="mr-2 animate-spin" />
									) : (
										<Icon icon={IconRefresh} size="sm" className="mr-2" />
									)}
									{t.branding.restoreSelected} ({selectedIds.size})
								</Button>
							)}
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
							{spacings.length > 0 && (
								<Button variant="outline" onClick={() => setIsSelectionMode(true)}>
									<Icon icon={IconSquareCheck} size="sm" className="mr-2" />
									{t.branding.selectItems}
								</Button>
							)}
							<Button variant="outline" onClick={() => setIsBatchCreateOpen(true)}>
								<Icon icon={IconCopyPlus} size="sm" className="mr-2" />
								{t.branding.addMultiple}
							</Button>
							<Button onClick={() => setIsCreateOpen(true)}>
								<Icon icon={IconPlus} size="sm" className="mr-2" />
								{t.branding.addSpacing}
							</Button>
						</>
					)}
				</div>
			</div>

			{sortedSpacings.length === 0 && totalSpacings === 0 ? (
				<div className="flex-1 flex items-center justify-center min-h-60">
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon" size="lg">
								<Icon icon={IconPaint} size="xl" className="text-muted-foreground" />
							</EmptyMedia>
							<EmptyTitle>{t.branding.noSpacings}</EmptyTitle>
							<EmptyDescription>{t.branding.noSpacingsDescription}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => setIsCreateOpen(true)}>
								<Icon icon={IconPlus} size="sm" className="mr-2" />
								{t.branding.addSpacing}
							</Button>
						</EmptyContent>
					</Empty>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
						{sortedSpacings.map((spacing) => {
							const isDeleted = !!spacing.deletedAt;
							return (
								<div
									key={spacing.id}
									className={`p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors ${
										isSelectionMode && selectedIds.has(spacing.id) ? "ring-2 ring-primary" : ""
									} ${isDeleted ? "opacity-60" : ""}`}
									onClick={isSelectionMode ? () => toggleSelection(spacing.id) : undefined}
								>
									{isSelectionMode && (
										<div className="flex justify-end mb-2">
											<Checkbox
												checked={selectedIds.has(spacing.id)}
												onCheckedChange={() => toggleSelection(spacing.id)}
											/>
										</div>
									)}
									<div
										className={`flex items-center justify-center mb-3 ${
											isDeleted ? "grayscale" : ""
										}`}
									>
										<div
											className="bg-primary rounded"
											style={{
												width: spacing.value,
												height: spacing.value,
												maxWidth: 64,
												maxHeight: 64,
											}}
										/>
									</div>
									<div className="text-center">
										<TypographyP
											className={`font-medium text-sm mt-0 ${isDeleted ? "line-through" : ""}`}
										>
											{spacing.name}
										</TypographyP>
										<TypographyMuted className="text-xs">{spacing.value}px</TypographyMuted>
										{isDeleted && (
											<TypographyMuted className="text-destructive text-xs">
												{t.common.deleted}
											</TypographyMuted>
										)}
									</div>
									{!isSelectionMode && (
										<div className="flex justify-center gap-1 mt-2">
											{isDeleted ? (
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7"
													onClick={() => handleRestore(spacing.id)}
													disabled={restoreSpacing.isPending}
												>
													{restoreSpacing.isPending ? (
														<Icon icon={IconLoader2} size="xs" className="animate-spin" />
													) : (
														<Icon icon={IconRefresh} size="xs" />
													)}
												</Button>
											) : (
												<>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() => openEditDialog(spacing)}
													>
														<Icon icon={IconEdit} size="xs" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 text-destructive hover:text-destructive"
														onClick={() => setDeleteSpacingId(spacing.id)}
													>
														<Icon icon={IconTrash} size="xs" />
													</Button>
												</>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>

					<CardPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						totalItems={totalSpacings}
						itemsPerPage={ITEMS_PER_PAGE}
						labels={{
							previous: t.common.previous,
							next: t.common.next,
							of: t.common.of,
							showing: t.common.showing,
							items: t.common.items,
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
							<DialogTitle>{t.branding.addSpacing}</DialogTitle>
							<DialogDescription>{t.branding.addSpacingDescription}</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.spacingName}>
										{t.branding.spacingName}
									</FieldLabelWithTooltip>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Small"
										required
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.spacingValue}>
										{t.branding.spacingValue}
									</FieldLabelWithTooltip>
									<Input
										type="number"
										value={value}
										onChange={(e) => setValue(Number(e.target.value))}
										min={0}
										required
									/>
								</Field>
							</FieldGroup>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
								{t.common.cancel}
							</Button>
							<Button type="submit" disabled={createSpacing.isPending}>
								{createSpacing.isPending && (
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
							<DialogTitle>{t.branding.editSpacing}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.spacingName}>
										{t.branding.spacingName}
									</FieldLabelWithTooltip>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.spacingValue}>
										{t.branding.spacingValue}
									</FieldLabelWithTooltip>
									<Input
										type="number"
										value={value}
										onChange={(e) => setValue(Number(e.target.value))}
										min={0}
										required
									/>
								</Field>
							</FieldGroup>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
								{t.common.cancel}
							</Button>
							<Button type="submit" disabled={updateSpacing.isPending}>
								{updateSpacing.isPending && (
									<Icon icon={IconLoader2} size="sm" className="mr-2 animate-spin" />
								)}
								{t.common.save}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isBatchCreateOpen}
				onOpenChange={(open) => {
					setIsBatchCreateOpen(open);
					if (!open) resetBatchForm();
				}}
			>
				<DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
					<form onSubmit={handleBatchCreate} className="flex flex-col flex-1 overflow-hidden">
						<DialogHeader>
							<DialogTitle>{t.branding.batchCreateSpacings}</DialogTitle>
							<DialogDescription>{t.branding.batchCreateSpacingsDescription}</DialogDescription>
						</DialogHeader>
						<ScrollArea className="flex-1 max-h-[60vh] py-4">
							<div className="space-y-4 pr-4">
								{batchRows.map((row) => (
									<div
										key={row.id}
										className="flex flex-col sm:items-end gap-3 p-3 border rounded-lg bg-muted/30"
									>
										<div className="flex-1 min-w-0 w-full">
											<FieldLabelWithTooltip tooltip={t.branding.tooltips.spacingName}>
												{t.branding.spacingName}
											</FieldLabelWithTooltip>
											<Input
												value={row.name}
												onChange={(e) => updateBatchRow(row.id, "name", e.target.value)}
												placeholder="Small"
											/>
										</div>
										<div className="flex-1 min-w-0 w-full">
											<FieldLabelWithTooltip tooltip={t.branding.tooltips.spacingValue}>
												{t.branding.spacingValue}
											</FieldLabelWithTooltip>
											<Input
												type="number"
												value={row.value}
												onChange={(e) => updateBatchRow(row.id, "value", Number(e.target.value))}
												min={0}
											/>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeBatchRow(row.id)}
											disabled={batchRows.length === 1}
											className="text-destructive hover:text-destructive shrink-0 self-end sm:self-auto sm:h-10"
										>
											<Icon icon={IconTrash} size="sm" className="mr-1" />
											{t.common.delete}
										</Button>
									</div>
								))}
							</div>
						</ScrollArea>
						<div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t">
							<Button type="button" variant="outline" onClick={addBatchRow}>
								<Icon icon={IconPlus} size="sm" className="mr-2" />
								{t.branding.addRow}
							</Button>
							<div className="flex gap-2 justify-end">
								<Button type="button" variant="outline" onClick={() => setIsBatchCreateOpen(false)}>
									{t.common.cancel}
								</Button>
								<Button
									type="submit"
									disabled={isBatchCreating || batchRows.every((r) => !r.name.trim())}
								>
									{isBatchCreating && (
										<Icon icon={IconLoader2} size="sm" className="mr-2 animate-spin" />
									)}
									{isBatchCreating ? t.branding.creatingItems : t.common.create}
								</Button>
							</div>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!deleteSpacingId}
				onOpenChange={(open) => !open && setDeleteSpacingId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.branding.deleteSpacing}</AlertDialogTitle>
						<AlertDialogDescription>{t.branding.deleteSpacingConfirm}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
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
							{deleteSpacingsBatch.isPending && (
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
