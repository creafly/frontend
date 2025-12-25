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
	IconBorderRadius,
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
	useRadii,
	useCreateRadius,
	useUpdateRadius,
	useDeleteRadius,
	useDeleteRadiiBatch,
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
import { Field, FieldGroup, FieldLabelWithTooltip } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardPagination } from "@/components/ui/card-pagination";
import type { BrandRadius } from "@/types/branding";

const ITEMS_PER_PAGE = 12;

interface RadiusRow {
	id: string;
	name: string;
	value: number;
}

interface RadiiSectionProps {
	tenantId: string;
}

export function RadiiSection({ tenantId }: RadiiSectionProps) {
	const t = useTranslations();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isBatchCreateOpen, setIsBatchCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteRadiusId, setDeleteRadiusId] = useState<string | null>(null);
	const [selectedRadius, setSelectedRadius] = useState<BrandRadius | null>(null);

	const [name, setName] = useState("");
	const [value, setValue] = useState(8);

	const [batchRows, setBatchRows] = useState<RadiusRow[]>([
		{ id: crypto.randomUUID(), name: "", value: 8 },
	]);
	const [isBatchCreating, setIsBatchCreating] = useState(false);

	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);

	const { data: radiiData, isLoading } = useRadii(tenantId, {
		limit: ITEMS_PER_PAGE,
		offset: (currentPage - 1) * ITEMS_PER_PAGE,
	});

	const radii = radiiData?.radii || [];
	const totalRadii = radiiData?.total || 0;
	const totalPages = Math.ceil(totalRadii / ITEMS_PER_PAGE);

	const createRadius = useCreateRadius();
	const updateRadius = useUpdateRadius();
	const deleteRadius = useDeleteRadius();
	const deleteRadiiBatch = useDeleteRadiiBatch();

	const resetForm = () => {
		setName("");
		setValue(8);
		setSelectedRadius(null);
	};

	const resetBatchForm = () => {
		setBatchRows([{ id: crypto.randomUUID(), name: "", value: 8 }]);
	};

	const addBatchRow = () => {
		setBatchRows([...batchRows, { id: crypto.randomUUID(), name: "", value: 8 }]);
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
			await createRadius.mutateAsync({
				tenantId,
				request: { name: name.trim(), value },
			});
			toast.success(t.branding.radiusCreated);
			setIsCreateOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.radiusCreateFailed);
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
				await createRadius.mutateAsync({
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
			toast.error(t.branding.radiusCreateFailed);
		}
	};

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedRadius || !name.trim()) return;

		try {
			await updateRadius.mutateAsync({
				tenantId,
				radiusId: selectedRadius.id,
				request: { name: name.trim(), value },
			});
			toast.success(t.branding.radiusUpdated);
			setIsEditOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.radiusUpdateFailed);
		}
	};

	const handleDelete = async () => {
		if (!deleteRadiusId) return;

		try {
			await deleteRadius.mutateAsync({ tenantId, radiusId: deleteRadiusId });
			toast.success(t.branding.radiusDeleted);
			setDeleteRadiusId(null);
		} catch {
			toast.error(t.branding.radiusDeleteFailed);
		}
	};

	const openEditDialog = (radius: BrandRadius) => {
		setSelectedRadius(radius);
		setName(radius.name);
		setValue(radius.value);
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
		setSelectedIds(new Set(radii.map((r) => r.id)));
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
			await deleteRadiiBatch.mutateAsync({
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

	const sortedRadii = radii;

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
					<TypographyH3 size="xs">{t.branding.radii}</TypographyH3>
					<TypographyMuted>{t.branding.radiiDescription}</TypographyMuted>
				</div>
				<div className="flex flex-wrap gap-2">
					{isSelectionMode ? (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={selectedIds.size === radii.length ? deselectAll : selectAll}
							>
								{selectedIds.size === radii.length ? (
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
							{radii.length > 0 && (
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
								{t.branding.addRadius}
							</Button>
						</>
					)}
				</div>
			</div>

			{sortedRadii.length === 0 && totalRadii === 0 ? (
				<div className="flex-1 flex items-center justify-center min-h-60">
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon" size="lg">
								<Icon icon={IconBorderRadius} size="xl" className="text-muted-foreground" />
							</EmptyMedia>
							<EmptyTitle>{t.branding.noRadii}</EmptyTitle>
							<EmptyDescription>{t.branding.noRadiiDescription}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => setIsCreateOpen(true)}>
								<Icon icon={IconPlus} size="sm" className="mr-2" />
								{t.branding.addRadius}
							</Button>
						</EmptyContent>
					</Empty>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
						{sortedRadii.map((radius) => (
							<div
								key={radius.id}
								className={`p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors relative ${
									isSelectionMode && selectedIds.has(radius.id) ? "ring-2 ring-primary" : ""
								}`}
								onClick={isSelectionMode ? () => toggleSelection(radius.id) : undefined}
							>
								{isSelectionMode && (
									<div className="absolute top-2 left-2">
										<Checkbox
											checked={selectedIds.has(radius.id)}
											onCheckedChange={() => toggleSelection(radius.id)}
											onClick={(e) => e.stopPropagation()}
										/>
									</div>
								)}
								<div className="flex items-center justify-center mb-3">
									<div className="w-12 h-12 bg-primary" style={{ borderRadius: radius.value }} />
								</div>
								<div className="text-center">
									<TypographyP className="font-medium text-sm mt-0">{radius.name}</TypographyP>
									<TypographyMuted className="text-xs">{radius.value}px</TypographyMuted>
								</div>
								{!isSelectionMode && (
									<div className="flex justify-center gap-1 mt-2">
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={() => openEditDialog(radius)}
										>
											<Icon icon={IconEdit} size="xs" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-destructive hover:text-destructive"
											onClick={() => setDeleteRadiusId(radius.id)}
										>
											<Icon icon={IconTrash} size="xs" />
										</Button>
									</div>
								)}
							</div>
						))}
					</div>

					<CardPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						totalItems={totalRadii}
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
							<DialogTitle>{t.branding.addRadius}</DialogTitle>
							<DialogDescription>{t.branding.addRadiusDescription}</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.radiusName}>
										{t.branding.radiusName}
									</FieldLabelWithTooltip>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Small"
										required
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.radiusValue}>
										{t.branding.radiusValue}
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
							<Button type="submit" disabled={createRadius.isPending}>
								{createRadius.isPending && (
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
							<DialogTitle>{t.branding.editRadius}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.radiusName}>
										{t.branding.radiusName}
									</FieldLabelWithTooltip>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.radiusValue}>
										{t.branding.radiusValue}
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
							<Button type="submit" disabled={updateRadius.isPending}>
								{updateRadius.isPending && (
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
							<DialogTitle>{t.branding.batchCreateRadii}</DialogTitle>
							<DialogDescription>{t.branding.batchCreateRadiiDescription}</DialogDescription>
						</DialogHeader>
						<ScrollArea className="flex-1 max-h-[60vh] py-4">
							<div className="space-y-3 pr-4">
								{batchRows.map((row) => (
									<div
										key={row.id}
										className="flex flex-col sm:items-end gap-3 p-3 border rounded-lg bg-muted/30"
									>
										<div className="flex-1 w-full">
											<FieldLabelWithTooltip tooltip={t.branding.tooltips.radiusName}>
												{t.branding.radiusName}
											</FieldLabelWithTooltip>
											<Input
												value={row.name}
												onChange={(e) => updateBatchRow(row.id, "name", e.target.value)}
												placeholder="Small"
											/>
										</div>
										<div className="w-full">
											<FieldLabelWithTooltip tooltip={t.branding.tooltips.radiusValue}>
												{t.branding.radiusValue}
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
											className="text-destructive hover:text-destructive sm:h-10"
										>
											<Icon icon={IconTrash} size="sm" className="mr-1" />
											{t.common.delete}
										</Button>
									</div>
								))}
							</div>
						</ScrollArea>
						<DialogFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
							<Button type="button" variant="outline" onClick={addBatchRow}>
								<Icon icon={IconPlus} size="sm" className="mr-2" />
								{t.branding.addRow}
							</Button>
							<div className="flex flex-col sm:flex-row gap-2">
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
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!deleteRadiusId}
				onOpenChange={(open) => !open && setDeleteRadiusId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.branding.deleteRadius}</AlertDialogTitle>
						<AlertDialogDescription>{t.branding.deleteRadiusConfirm}</AlertDialogDescription>
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
						<AlertDialogTitle>{t.branding.deleteRadius}</AlertDialogTitle>
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
							{deleteRadiiBatch.isPending && (
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
