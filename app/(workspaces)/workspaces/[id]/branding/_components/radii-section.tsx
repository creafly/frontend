"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconPlus, IconTrash, IconEdit, IconLoader2, IconCopyPlus } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useCreateRadius, useUpdateRadius, useDeleteRadius } from "@/hooks/use-branding";
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
import type { BrandRadius } from "@/types/branding";

interface RadiusRow {
	id: string;
	name: string;
	value: number;
}

interface RadiiSectionProps {
	tenantId: string;
	radii: BrandRadius[];
}

export function RadiiSection({ tenantId, radii }: RadiiSectionProps) {
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

	const createRadius = useCreateRadius();
	const updateRadius = useUpdateRadius();
	const deleteRadius = useDeleteRadius();

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
			toast.success(t.branding?.radiusCreated || "Radius created");
			setIsCreateOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding?.radiusCreateFailed || "Failed to create radius");
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
			toast.error(t.branding?.radiusCreateFailed || "Failed to create radii");
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
			toast.success(t.branding?.radiusUpdated || "Radius updated");
			setIsEditOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding?.radiusUpdateFailed || "Failed to update radius");
		}
	};

	const handleDelete = async () => {
		if (!deleteRadiusId) return;

		try {
			await deleteRadius.mutateAsync({ tenantId, radiusId: deleteRadiusId });
			toast.success(t.branding?.radiusDeleted || "Radius deleted");
			setDeleteRadiusId(null);
		} catch {
			toast.error(t.branding?.radiusDeleteFailed || "Failed to delete radius");
		}
	};

	const openEditDialog = (radius: BrandRadius) => {
		setSelectedRadius(radius);
		setName(radius.name);
		setValue(radius.value);
		setIsEditOpen(true);
	};

	const sortedRadii = [...radii].sort((a, b) => a.order - b.order);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium">{t.branding?.radii || "Border Radii"}</h3>
					<p className="text-sm text-muted-foreground">
						{t.branding?.radiiDescription || "Define border radius values in pixels"}
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setIsBatchCreateOpen(true)}>
						<IconCopyPlus className="mr-2 h-4 w-4" />
						{t.branding?.addMultiple || "Add Multiple"}
					</Button>
					<Button onClick={() => setIsCreateOpen(true)}>
						<IconPlus className="mr-2 h-4 w-4" />
						{t.branding?.addRadius || "Add Radius"}
					</Button>
				</div>
			</div>

			{sortedRadii.length === 0 ? (
				<div className="text-center py-8 border rounded-lg bg-card">
					<p className="text-muted-foreground">{t.branding?.noRadii || "No radii defined yet"}</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{sortedRadii.map((radius) => (
						<div
							key={radius.id}
							className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
						>
							<div className="flex items-center justify-center mb-3">
								<div className="w-12 h-12 bg-primary" style={{ borderRadius: radius.value }} />
							</div>
							<div className="text-center">
								<p className="font-medium text-sm">{radius.name}</p>
								<p className="text-xs text-muted-foreground">{radius.value}px</p>
							</div>
							<div className="flex justify-center gap-1 mt-2">
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									onClick={() => openEditDialog(radius)}
								>
									<IconEdit className="h-3 w-3" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-destructive hover:text-destructive"
									onClick={() => setDeleteRadiusId(radius.id)}
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
							<DialogTitle>{t.branding?.addRadius || "Add Radius"}</DialogTitle>
							<DialogDescription>
								{t.branding?.addRadiusDescription || "Add a new border radius value"}
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.radiusName}>
										{t.branding?.radiusName || "Name"}
									</FieldLabelWithTooltip>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Small"
										required
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.radiusValue}>
										{t.branding?.radiusValue || "Value (px)"}
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
								{createRadius.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
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
							<DialogTitle>{t.branding?.editRadius || "Edit Radius"}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.radiusName}>
										{t.branding?.radiusName || "Name"}
									</FieldLabelWithTooltip>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.radiusValue}>
										{t.branding?.radiusValue || "Value (px)"}
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
								{updateRadius.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
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
							<DialogTitle>{t.branding?.batchCreateRadii || "Add Multiple Radii"}</DialogTitle>
							<DialogDescription>
								{t.branding?.batchCreateRadiiDescription ||
									"Add multiple border radius values at once"}
							</DialogDescription>
						</DialogHeader>
						<ScrollArea className="flex-1 max-h-[60vh] py-4">
							<div className="space-y-3 pr-4">
								{batchRows.map((row) => (
									<div
										key={row.id}
										className="flex flex-col sm:items-end gap-3 p-3 border rounded-lg bg-muted/30"
									>
										<div className="flex-1 w-full">
											<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.radiusName}>
												{t.branding?.radiusName || "Name"}
											</FieldLabelWithTooltip>
											<Input
												value={row.name}
												onChange={(e) => updateBatchRow(row.id, "name", e.target.value)}
												placeholder="Small"
											/>
										</div>
										<div className="w-full">
											<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.radiusValue}>
												{t.branding?.radiusValue || "Value (px)"}
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
											<IconTrash className="h-4 w-4 mr-1" />
											{t.common.delete}
										</Button>
									</div>
								))}
							</div>
						</ScrollArea>
						<DialogFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
							<Button type="button" variant="outline" onClick={addBatchRow}>
								<IconPlus className="mr-2 h-4 w-4" />
								{t.branding?.addRow || "Add Row"}
							</Button>
							<div className="flex flex-col sm:flex-row gap-2">
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
						<AlertDialogTitle>{t.branding?.deleteRadius || "Delete Radius"}</AlertDialogTitle>
						<AlertDialogDescription>
							{t.branding?.deleteRadiusConfirm || "Are you sure you want to delete this radius?"}
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
