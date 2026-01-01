"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconPlus, IconTrash, IconEdit, IconLoader2, IconCopyPlus } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useCreateColor, useUpdateColor, useDeleteColor } from "@/hooks/use-branding";
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
import type { BrandColor } from "@/types/branding";

interface ColorRow {
	id: string;
	name: string;
	value: string;
}

interface ColorsSectionProps {
	tenantId: string;
	colors: BrandColor[];
}

export function ColorsSection({ tenantId, colors }: ColorsSectionProps) {
	const t = useTranslations();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isBatchCreateOpen, setIsBatchCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteColorId, setDeleteColorId] = useState<string | null>(null);
	const [selectedColor, setSelectedColor] = useState<BrandColor | null>(null);

	const [name, setName] = useState("");
	const [value, setValue] = useState("#000000");

	const [batchRows, setBatchRows] = useState<ColorRow[]>([
		{ id: crypto.randomUUID(), name: "", value: "#000000" },
	]);
	const [isBatchCreating, setIsBatchCreating] = useState(false);

	const createColor = useCreateColor();
	const updateColor = useUpdateColor();
	const deleteColor = useDeleteColor();

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
			toast.success(t.branding?.colorCreated || "Color created");
			setIsCreateOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding?.colorCreateFailed || "Failed to create color");
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
			toast.error(t.branding?.colorCreateFailed || "Failed to create colors");
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
			toast.success(t.branding?.colorUpdated || "Color updated");
			setIsEditOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding?.colorUpdateFailed || "Failed to update color");
		}
	};

	const handleDelete = async () => {
		if (!deleteColorId) return;

		try {
			await deleteColor.mutateAsync({ tenantId, colorId: deleteColorId });
			toast.success(t.branding?.colorDeleted || "Color deleted");
			setDeleteColorId(null);
		} catch {
			toast.error(t.branding?.colorDeleteFailed || "Failed to delete color");
		}
	};

	const openEditDialog = (color: BrandColor) => {
		setSelectedColor(color);
		setName(color.name);
		setValue(color.value);
		setIsEditOpen(true);
	};

	const sortedColors = [...colors].sort((a, b) => a.order - b.order);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium">{t.branding?.colors || "Colors"}</h3>
					<p className="text-sm text-muted-foreground">
						{t.branding?.colorsDescription || "Define your brand color palette"}
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setIsBatchCreateOpen(true)}>
						<IconCopyPlus className="mr-2 h-4 w-4" />
						{t.branding?.addMultiple || "Add Multiple"}
					</Button>
					<Button onClick={() => setIsCreateOpen(true)}>
						<IconPlus className="mr-2 h-4 w-4" />
						{t.branding?.addColor || "Add Color"}
					</Button>
				</div>
			</div>

			{sortedColors.length === 0 ? (
				<div className="text-center py-8 border rounded-lg bg-card">
					<p className="text-muted-foreground">{t.branding?.noColors || "No colors defined yet"}</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{sortedColors.map((color) => (
						<div
							key={color.id}
							className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
						>
							<div
								className="w-full h-16 rounded-md mb-3 border"
								style={{ backgroundColor: color.value }}
							/>
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-sm">{color.name}</p>
									<p className="text-xs text-muted-foreground uppercase">{color.value}</p>
								</div>
								<div className="flex gap-1">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => openEditDialog(color)}
									>
										<IconEdit className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-destructive hover:text-destructive"
										onClick={() => setDeleteColorId(color.id)}
									>
										<IconTrash className="h-4 w-4" />
									</Button>
								</div>
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
							<DialogTitle>{t.branding?.addColor || "Add Color"}</DialogTitle>
							<DialogDescription>
								{t.branding?.addColorDescription || "Add a new color to your brand palette"}
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.colorName}>
										{t.branding?.colorName || "Name"}
									</FieldLabelWithTooltip>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Primary"
										required
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.colorValue}>
										{t.branding?.colorValue || "Color"}
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
								{createColor.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
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
							<DialogTitle>{t.branding?.editColor || "Edit Color"}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.colorName}>
										{t.branding?.colorName || "Name"}
									</FieldLabelWithTooltip>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.colorValue}>
										{t.branding?.colorValue || "Color"}
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
								{updateColor.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
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
							<DialogTitle>{t.branding?.batchCreateColors || "Add Multiple Colors"}</DialogTitle>
							<DialogDescription>
								{t.branding?.batchCreateColorsDescription ||
									"Add multiple colors at once to your brand palette"}
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
											<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.colorName}>
												{t.branding?.colorName || "Name"}
											</FieldLabelWithTooltip>
											<Input
												value={row.name}
												onChange={(e) => updateBatchRow(row.id, "name", e.target.value)}
												placeholder="Primary"
											/>
										</div>
										<div className="flex-1 min-w-0 w-full">
											<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.colorValue}>
												{t.branding?.colorValue || "Color"}
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
											<IconTrash className="h-4 w-4 mr-1" />
											{t.common.delete}
										</Button>
									</div>
								))}
							</div>
						</ScrollArea>
						<div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t z-10 bg-card">
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

			<AlertDialog open={!!deleteColorId} onOpenChange={(open) => !open && setDeleteColorId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.branding?.deleteColor || "Delete Color"}</AlertDialogTitle>
						<AlertDialogDescription>
							{t.branding?.deleteColorConfirm || "Are you sure you want to delete this color?"}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteColor.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
							{t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
