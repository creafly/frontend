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
	IconPalette,
	IconRefresh,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { Icon, TypographyH3, TypographyMuted, TypographyP } from "@/components/typography";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import {
	useColors,
	useCreateColor,
	useUpdateColor,
	useDeleteColor,
	useDeleteColorsBatch,
	useRestoreColor,
	useRestoreColorsBatch,
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
import type { BrandColor } from "@/types/branding";

const ITEMS_PER_PAGE = 12;

interface ColorRow {
	id: string;
	name: string;
	value: string;
}

interface ColorsSectionProps {
	tenantId: string;
}

export function ColorsSection({ tenantId }: ColorsSectionProps) {
	const t = useTranslations();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isBatchCreateOpen, setIsBatchCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteColorId, setDeleteColorId] = useState<string | null>(null);
	const [selectedColor, setSelectedColor] = useState<BrandColor | null>(null);

	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [showDeleted, setShowDeleted] = useState(false);

	const [name, setName] = useState("");
	const [value, setValue] = useState("#000000");

	const [batchRows, setBatchRows] = useState<ColorRow[]>([
		{ id: crypto.randomUUID(), name: "", value: "#000000" },
	]);
	const [isBatchCreating, setIsBatchCreating] = useState(false);

	const { data: colorsData, isLoading } = useColors(tenantId, {
		limit: ITEMS_PER_PAGE,
		offset: (currentPage - 1) * ITEMS_PER_PAGE,
		includeDeleted: showDeleted,
	});

	const colors = colorsData?.colors || [];
	const totalColors = colorsData?.total || 0;
	const totalPages = Math.ceil(totalColors / ITEMS_PER_PAGE);

	const createColor = useCreateColor();
	const updateColor = useUpdateColor();
	const deleteColor = useDeleteColor();
	const deleteColorsBatch = useDeleteColorsBatch();
	const restoreColor = useRestoreColor();
	const restoreColorsBatch = useRestoreColorsBatch();

	const resetForm = () => {
		setName("");
		setValue("#000000");
		setSelectedColor(null);
	};

	const resetBatchForm = () => {
		setBatchRows([{ id: crypto.randomUUID(), name: "", value: "#000000" }]);
	};

	const addBatchRow = () => {
		setBatchRows([...batchRows, { id: crypto.randomUUID(), name: "", value: "#000000" }]);
	};

	const removeBatchRow = (id: string) => {
		if (batchRows.length > 1) {
			setBatchRows(batchRows.filter((row) => row.id !== id));
		}
	};

	const updateBatchRow = (id: string, field: "name" | "value", newValue: string) => {
		setBatchRows(batchRows.map((row) => (row.id === id ? { ...row, [field]: newValue } : row)));
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		try {
			await createColor.mutateAsync({
				tenantId,
				request: { name: name.trim(), value },
			});
			toast.success(t.branding.colorCreated);
			setIsCreateOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.colorCreateFailed);
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
				await createColor.mutateAsync({
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
			toast.error(t.branding.colorCreateFailed);
		}
	};

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedColor || !name.trim()) return;

		try {
			await updateColor.mutateAsync({
				tenantId,
				colorId: selectedColor.id,
				request: { name: name.trim(), value },
			});
			toast.success(t.branding.colorUpdated);
			setIsEditOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.colorUpdateFailed);
		}
	};

	const handleDelete = async () => {
		if (!deleteColorId) return;

		try {
			await deleteColor.mutateAsync({ tenantId, colorId: deleteColorId });
			toast.success(t.branding.colorDeleted);
			setDeleteColorId(null);
		} catch {
			toast.error(t.branding.colorDeleteFailed);
		}
	};

	const openEditDialog = (color: BrandColor) => {
		setSelectedColor(color);
		setName(color.name);
		setValue(color.value);
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
		setSelectedIds(new Set(colors.map((c) => c.id)));
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
			await deleteColorsBatch.mutateAsync({
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

	const handleRestore = async (colorId: string) => {
		try {
			await restoreColor.mutateAsync({ tenantId, colorId });
			toast.success(t.branding.colorRestored);
		} catch {
			toast.error(t.branding.colorRestoreFailed);
		}
	};

	const handleBatchRestore = async () => {
		try {
			await restoreColorsBatch.mutateAsync({
				tenantId,
				request: { ids: Array.from(selectedIds) },
			});
			toast.success(t.branding.batchRestoreSuccess.replace("{count}", String(selectedIds.size)));
			exitSelectionMode();
		} catch {
			toast.error(t.branding.batchRestoreFailed);
		}
	};

	const sortedColors = colors;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Icon icon={IconLoader2} size="lg" className="animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<TypographyH3 size="xs">{t.branding.colors}</TypographyH3>
					<TypographyMuted>{t.branding.colorsDescription}</TypographyMuted>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-2 mr-2">
						<Switch
							id="show-deleted-colors"
							checked={showDeleted}
							onCheckedChange={setShowDeleted}
						/>
						<Label htmlFor="show-deleted-colors" className="text-sm cursor-pointer">
							{t.common.showDeleted}
						</Label>
					</div>
					{isSelectionMode ? (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={selectedIds.size === colors.length ? deselectAll : selectAll}
							>
								{selectedIds.size === colors.length ? (
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
									disabled={selectedIds.size === 0 || restoreColorsBatch.isPending}
								>
									{restoreColorsBatch.isPending ? (
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
							{colors.length > 0 && (
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
								{t.branding.addColor}
							</Button>
						</>
					)}
				</div>
			</div>

			{sortedColors.length === 0 && totalColors === 0 ? (
				<div className="flex-1 flex items-center justify-center min-h-60">
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon" size="lg">
								<Icon icon={IconPalette} size="xl" className="text-muted-foreground" />
							</EmptyMedia>
							<EmptyTitle>{t.branding.noColors}</EmptyTitle>
							<EmptyDescription>{t.branding.noColorsDescription}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => setIsCreateOpen(true)}>
								<Icon icon={IconPlus} size="sm" className="mr-2" />
								{t.branding.addColor}
							</Button>
						</EmptyContent>
					</Empty>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{sortedColors.map((color) => {
							const isDeleted = !!color.deletedAt;
							return (
								<div
									key={color.id}
									className={`p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors ${
										isSelectionMode && selectedIds.has(color.id) ? "ring-2 ring-primary" : ""
									} ${isDeleted ? "opacity-60" : ""}`}
									onClick={isSelectionMode ? () => toggleSelection(color.id) : undefined}
								>
									{isSelectionMode && (
										<div className="flex justify-end mb-2">
											<Checkbox
												checked={selectedIds.has(color.id)}
												onCheckedChange={() => toggleSelection(color.id)}
											/>
										</div>
									)}
									<div
										className={`w-full h-16 rounded-md mb-3 border ${isDeleted ? "grayscale" : ""}`}
										style={{ backgroundColor: color.value }}
									/>
									<div className="flex items-center justify-between">
										<div>
											<TypographyP className={`font-medium text-sm mt-0 ${isDeleted ? "line-through" : ""}`}>
												{color.name}
											</TypographyP>
											<TypographyMuted className="text-xs uppercase">{color.value}</TypographyMuted>
											{isDeleted && (
												<TypographyMuted className="text-xs text-destructive">
													{t.common.deleted}
												</TypographyMuted>
											)}
										</div>
										{!isSelectionMode && (
											<div className="flex gap-1">
												{isDeleted ? (
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={() => handleRestore(color.id)}
														disabled={restoreColor.isPending}
													>
														{restoreColor.isPending ? (
															<Icon icon={IconLoader2} size="sm" className="animate-spin" />
														) : (
															<Icon icon={IconRefresh} size="sm" />
														)}
													</Button>
												) : (
													<>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															onClick={() => openEditDialog(color)}
														>
															<Icon icon={IconEdit} size="sm" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
															onClick={() => setDeleteColorId(color.id)}
														>
															<Icon icon={IconTrash} size="sm" />
														</Button>
													</>
												)}
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>

					<CardPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						totalItems={totalColors}
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
							<DialogTitle>{t.branding.addColor}</DialogTitle>
							<DialogDescription>{t.branding.addColorDescription}</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.colorName}>
										{t.branding.colorName}
									</FieldLabelWithTooltip>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Primary"
										required
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.colorValue}>
										{t.branding.colorValue}
									</FieldLabelWithTooltip>
									<div className="flex gap-2">
										<Input
											type="color"
											value={value}
											onChange={(e) => setValue(e.target.value)}
											className="w-16 h-10 p-1 cursor-pointer"
										/>
										<Input
											value={value}
											onChange={(e) => setValue(e.target.value)}
											placeholder="#000000"
											className="flex-1"
										/>
									</div>
								</Field>
							</FieldGroup>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
								{t.common.cancel}
							</Button>
							<Button type="submit" disabled={createColor.isPending}>
								{createColor.isPending && (
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
							<DialogTitle>{t.branding.editColor}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.colorName}>
										{t.branding.colorName}
									</FieldLabelWithTooltip>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.colorValue}>
										{t.branding.colorValue}
									</FieldLabelWithTooltip>
									<div className="flex gap-2">
										<Input
											type="color"
											value={value}
											onChange={(e) => setValue(e.target.value)}
											className="w-16 h-10 p-1 cursor-pointer"
										/>
										<Input
											value={value}
											onChange={(e) => setValue(e.target.value)}
											className="flex-1"
										/>
									</div>
								</Field>
							</FieldGroup>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
								{t.common.cancel}
							</Button>
							<Button type="submit" disabled={updateColor.isPending}>
								{updateColor.isPending && (
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
							<DialogTitle>{t.branding.batchCreateColors}</DialogTitle>
							<DialogDescription>{t.branding.batchCreateColorsDescription}</DialogDescription>
						</DialogHeader>
						<ScrollArea className="flex-1 max-h-[60vh] py-4">
							<div className="space-y-4 pr-4">
								{batchRows.map((row) => (
									<div
										key={row.id}
										className="flex flex-col sm:items-end gap-3 p-3 border rounded-lg bg-muted/30"
									>
										<div className="flex-1 min-w-0 w-full">
											<FieldLabelWithTooltip tooltip={t.branding.tooltips.colorName}>
												{t.branding.colorName}
											</FieldLabelWithTooltip>
											<Input
												value={row.name}
												onChange={(e) => updateBatchRow(row.id, "name", e.target.value)}
												placeholder="Primary"
											/>
										</div>
										<div className="flex-1 min-w-0 w-full">
											<FieldLabelWithTooltip tooltip={t.branding.tooltips.colorValue}>
												{t.branding.colorValue}
											</FieldLabelWithTooltip>
											<div className="flex gap-2">
												<Input
													type="color"
													value={row.value}
													onChange={(e) => updateBatchRow(row.id, "value", e.target.value)}
													className="w-12 h-10 p-1 cursor-pointer shrink-0"
												/>
												<Input
													value={row.value}
													onChange={(e) => updateBatchRow(row.id, "value", e.target.value)}
													className="flex-1 min-w-0"
												/>
											</div>
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
						<div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t z-10 bg-card">
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

			<AlertDialog open={!!deleteColorId} onOpenChange={(open) => !open && setDeleteColorId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.branding.deleteColor}</AlertDialogTitle>
						<AlertDialogDescription>{t.branding.deleteColorConfirm}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteColor.isPending && (
								<Icon icon={IconLoader2} size="md" className="mr-2 animate-spin" />
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
							{deleteColorsBatch.isPending && (
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
