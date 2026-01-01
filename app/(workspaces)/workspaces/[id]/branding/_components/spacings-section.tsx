"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconPlus, IconTrash, IconEdit, IconLoader2, IconCopyPlus } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useCreateSpacing, useUpdateSpacing, useDeleteSpacing } from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { BrandSpacing } from "@/types/branding";

interface SpacingRow {
	id: string;
	name: string;
	value: number;
}

interface SpacingsSectionProps {
	tenantId: string;
	spacings: BrandSpacing[];
}

export function SpacingsSection({ tenantId, spacings }: SpacingsSectionProps) {
	const t = useTranslations();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isBatchCreateOpen, setIsBatchCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteSpacingId, setDeleteSpacingId] = useState<string | null>(null);
	const [selectedSpacing, setSelectedSpacing] = useState<BrandSpacing | null>(null);

	const [name, setName] = useState("");
	const [value, setValue] = useState(16);

	const [batchRows, setBatchRows] = useState<SpacingRow[]>([
		{ id: crypto.randomUUID(), name: "", value: 16 },
	]);
	const [isBatchCreating, setIsBatchCreating] = useState(false);

	const createSpacing = useCreateSpacing();
	const updateSpacing = useUpdateSpacing();
	const deleteSpacing = useDeleteSpacing();

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
			toast.success(t.branding?.spacingCreated || "Spacing created");
			setIsCreateOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding?.spacingCreateFailed || "Failed to create spacing");
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
			toast.success(
				(t.branding?.batchCreateSuccess || "{count} items created successfully").replace(
					"{count}",
					String(successCount)
				)
			);
			setIsBatchCreateOpen(false);
			resetBatchForm();
		} else if (successCount > 0) {
			toast.warning(
				(t.branding?.batchCreatePartial || "{success} of {total} items created")
					.replace("{success}", String(successCount))
					.replace("{total}", String(validRows.length))
			);
		} else {
			toast.error(t.branding?.spacingCreateFailed || "Failed to create spacings");
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
			toast.success(t.branding?.spacingUpdated || "Spacing updated");
			setIsEditOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding?.spacingUpdateFailed || "Failed to update spacing");
		}
	};

	const handleDelete = async () => {
		if (!deleteSpacingId) return;

		try {
			await deleteSpacing.mutateAsync({ tenantId, spacingId: deleteSpacingId });
			toast.success(t.branding?.spacingDeleted || "Spacing deleted");
			setDeleteSpacingId(null);
		} catch {
			toast.error(t.branding?.spacingDeleteFailed || "Failed to delete spacing");
		}
	};

	const openEditDialog = (spacing: BrandSpacing) => {
		setSelectedSpacing(spacing);
		setName(spacing.name);
		setValue(spacing.value);
		setIsEditOpen(true);
	};

	const sortedSpacings = [...spacings].sort((a, b) => a.order - b.order);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium">{t.branding?.spacings || "Spacings"}</h3>
					<p className="text-sm text-muted-foreground">
						{t.branding?.spacingsDescription || "Define spacing values in pixels"}
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setIsBatchCreateOpen(true)}>
						<IconCopyPlus className="mr-2 h-4 w-4" />
						{t.branding?.addMultiple || "Add Multiple"}
					</Button>
					<Button onClick={() => setIsCreateOpen(true)}>
						<IconPlus className="mr-2 h-4 w-4" />
						{t.branding?.addSpacing || "Add Spacing"}
					</Button>
				</div>
			</div>

			{sortedSpacings.length === 0 ? (
				<div className="text-center py-8 border rounded-lg bg-card">
					<p className="text-muted-foreground">
						{t.branding?.noSpacings || "No spacings defined yet"}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{sortedSpacings.map((spacing) => (
						<div
							key={spacing.id}
							className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
						>
							<div className="flex items-center justify-center mb-3">
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
								<p className="font-medium text-sm">{spacing.name}</p>
								<p className="text-xs text-muted-foreground">{spacing.value}px</p>
							</div>
							<div className="flex justify-center gap-1 mt-2">
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									onClick={() => openEditDialog(spacing)}
								>
									<IconEdit className="h-3 w-3" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-destructive hover:text-destructive"
									onClick={() => setDeleteSpacingId(spacing.id)}
								>
									<IconTrash className="h-3 w-3" />
								</Button>
							</div>
						</div>
					))}
				</div>
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
							<DialogTitle>{t.branding?.addSpacing || "Add Spacing"}</DialogTitle>
							<DialogDescription>
								{t.branding?.addSpacingDescription || "Add a new spacing value"}
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.spacingName}>
										{t.branding?.spacingName || "Name"}
									</FieldLabelWithTooltip>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Small"
										required
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.spacingValue}>
										{t.branding?.spacingValue || "Value (px)"}
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
								{createSpacing.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
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
							<DialogTitle>{t.branding?.editSpacing || "Edit Spacing"}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.spacingName}>
										{t.branding?.spacingName || "Name"}
									</FieldLabelWithTooltip>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.spacingValue}>
										{t.branding?.spacingValue || "Value (px)"}
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
								{updateSpacing.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
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
							<DialogTitle>
								{t.branding?.batchCreateSpacings || "Add Multiple Spacings"}
							</DialogTitle>
							<DialogDescription>
								{t.branding?.batchCreateSpacingsDescription ||
									"Add multiple spacing values at once"}
							</DialogDescription>
						</DialogHeader>
						<ScrollArea className="flex-1 max-h-[60vh] py-4">
							<div className="space-y-4 pr-4">
								{batchRows.map((row) => (
									<div
										key={row.id}
										className="flex flex-col sm:items-end gap-3 p-3 border rounded-lg bg-muted/30"
									>
										<div className="flex-1 min-w-0 w-full">
											<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.spacingName}>
												{t.branding?.spacingName || "Name"}
											</FieldLabelWithTooltip>
											<Input
												value={row.name}
												onChange={(e) => updateBatchRow(row.id, "name", e.target.value)}
												placeholder="Small"
											/>
										</div>
										<div className="flex-1 min-w-0 w-full">
											<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.spacingValue}>
												{t.branding?.spacingValue || "Value (px)"}
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
											<IconTrash className="h-4 w-4 mr-1" />
											{t.common.delete}
										</Button>
									</div>
								))}
							</div>
						</ScrollArea>
						<div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t">
							<Button type="button" variant="outline" onClick={addBatchRow}>
								<IconPlus className="mr-2 h-4 w-4" />
								{t.branding?.addRow || "Add Row"}
							</Button>
							<div className="flex gap-2 justify-end">
								<Button type="button" variant="outline" onClick={() => setIsBatchCreateOpen(false)}>
									{t.common.cancel}
								</Button>
								<Button
									type="submit"
									disabled={isBatchCreating || batchRows.every((r) => !r.name.trim())}
								>
									{isBatchCreating && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
									{isBatchCreating ? t.branding?.creatingItems || "Creating..." : t.common.create}
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
						<AlertDialogTitle>{t.branding?.deleteSpacing || "Delete Spacing"}</AlertDialogTitle>
						<AlertDialogDescription>
							{t.branding?.deleteSpacingConfirm || "Are you sure you want to delete this spacing?"}
						</AlertDialogDescription>
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
		</div>
	);
}
