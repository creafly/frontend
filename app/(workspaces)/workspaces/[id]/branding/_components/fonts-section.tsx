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
	IconTypography,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import {
	useFonts,
	useCreateFont,
	useUpdateFont,
	useDeleteFont,
	useDeleteFontsBatch,
} from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";
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
import type { BrandFont } from "@/types/branding";

const ITEMS_PER_PAGE = 12;

interface FontRow {
	id: string;
	name: string;
	fontFamily: string;
	fontWeight: string;
}

const FONT_WEIGHTS = [
	{ value: "100", label: "Thin" },
	{ value: "200", label: "Extra Light" },
	{ value: "300", label: "Light" },
	{ value: "400", label: "Regular" },
	{ value: "500", label: "Medium" },
	{ value: "600", label: "Semi Bold" },
	{ value: "700", label: "Bold" },
	{ value: "800", label: "Extra Bold" },
	{ value: "900", label: "Black" },
];

interface FontFamilyItem {
	value: string;
	label: string;
	category: "sansSerif" | "serif" | "monospace" | "display";
}

const FONT_FAMILIES_LIST: FontFamilyItem[] = [
	{ value: "Inter", label: "Inter", category: "sansSerif" },
	{ value: "Open Sans", label: "Open Sans", category: "sansSerif" },
	{ value: "Roboto", label: "Roboto", category: "sansSerif" },
	{ value: "Lato", label: "Lato", category: "sansSerif" },
	{ value: "Montserrat", label: "Montserrat", category: "sansSerif" },
	{ value: "Poppins", label: "Poppins", category: "sansSerif" },
	{ value: "Nunito", label: "Nunito", category: "sansSerif" },
	{ value: "Raleway", label: "Raleway", category: "sansSerif" },
	{ value: "Source Sans Pro", label: "Source Sans Pro", category: "sansSerif" },
	{ value: "Ubuntu", label: "Ubuntu", category: "sansSerif" },
	{ value: "Work Sans", label: "Work Sans", category: "sansSerif" },
	{ value: "Manrope", label: "Manrope", category: "sansSerif" },
	{ value: "DM Sans", label: "DM Sans", category: "sansSerif" },
	{ value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", category: "sansSerif" },
	{ value: "Outfit", label: "Outfit", category: "sansSerif" },
	{ value: "Playfair Display", label: "Playfair Display", category: "serif" },
	{ value: "Merriweather", label: "Merriweather", category: "serif" },
	{ value: "Georgia", label: "Georgia", category: "serif" },
	{ value: "Times New Roman", label: "Times New Roman", category: "serif" },
	{ value: "Lora", label: "Lora", category: "serif" },
	{ value: "PT Serif", label: "PT Serif", category: "serif" },
	{ value: "Libre Baskerville", label: "Libre Baskerville", category: "serif" },
	{ value: "Crimson Text", label: "Crimson Text", category: "serif" },
	{ value: "Source Serif Pro", label: "Source Serif Pro", category: "serif" },
	{ value: "Cormorant Garamond", label: "Cormorant Garamond", category: "serif" },
	{ value: "JetBrains Mono", label: "JetBrains Mono", category: "monospace" },
	{ value: "Fira Code", label: "Fira Code", category: "monospace" },
	{ value: "Source Code Pro", label: "Source Code Pro", category: "monospace" },
	{ value: "Roboto Mono", label: "Roboto Mono", category: "monospace" },
	{ value: "IBM Plex Mono", label: "IBM Plex Mono", category: "monospace" },
	{ value: "Monaco", label: "Monaco", category: "monospace" },
	{ value: "Consolas", label: "Consolas", category: "monospace" },
	{ value: "Oswald", label: "Oswald", category: "display" },
	{ value: "Bebas Neue", label: "Bebas Neue", category: "display" },
	{ value: "Abril Fatface", label: "Abril Fatface", category: "display" },
	{ value: "Righteous", label: "Righteous", category: "display" },
	{ value: "Archivo Black", label: "Archivo Black", category: "display" },
];

interface FontFamilyComboboxProps {
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

function FontFamilyCombobox({
	value,
	onValueChange,
	placeholder = "Select or type a font...",
	className,
	disabled = false,
}: FontFamilyComboboxProps) {
	const selectedItem = FONT_FAMILIES_LIST.find((f) => f.value === value) ?? null;

	return (
		<ComboboxPrimitive.Root
			items={FONT_FAMILIES_LIST}
			value={selectedItem}
			onValueChange={(item: FontFamilyItem | null) => {
				onValueChange(item?.value ?? "");
			}}
			disabled={disabled}
		>
			<InputGroup className={cn("w-auto", className)}>
				<ComboboxPrimitive.Input
					render={<InputGroupInput disabled={disabled} />}
					placeholder={placeholder}
				/>
				<InputGroupAddon align="inline-end">
					<InputGroupButton
						size="icon-xs"
						variant="ghost"
						asChild
						data-slot="input-group-button"
						className="data-pressed:bg-transparent"
						disabled={disabled}
					>
						<ComboboxPrimitive.Trigger
							data-slot="combobox-trigger"
							className="[&_svg:not([class*='size-'])]:size-4"
						>
							<IconChevronDown className="text-muted-foreground size-4 pointer-events-none" />
						</ComboboxPrimitive.Trigger>
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
			<ComboboxPrimitive.Portal>
				<ComboboxPrimitive.Positioner
					side="bottom"
					sideOffset={6}
					align="start"
					className="isolate z-50"
				>
					<ComboboxPrimitive.Popup
						data-slot="combobox-content"
						className="bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 ring-foreground/10 max-h-72 min-w-36 overflow-hidden rounded-lg shadow-md ring-1 duration-100 relative w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin)"
					>
						<ComboboxPrimitive.Empty
							data-slot="combobox-empty"
							className="text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex"
						>
							Type a custom font name
						</ComboboxPrimitive.Empty>
						<ComboboxPrimitive.List
							data-slot="combobox-list"
							className="no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0 overscroll-contain"
						>
							{(item: FontFamilyItem) => (
								<ComboboxPrimitive.Item
									key={item.value}
									data-slot="combobox-item"
									className="data-highlighted:bg-accent data-highlighted:text-accent-foreground gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50"
									value={item}
								>
									<span style={{ fontFamily: item.value }}>{item.label}</span>
									<ComboboxPrimitive.ItemIndicator
										render={
											<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
										}
									>
										<IconCheck className="pointer-events-none size-4" />
									</ComboboxPrimitive.ItemIndicator>
								</ComboboxPrimitive.Item>
							)}
						</ComboboxPrimitive.List>
					</ComboboxPrimitive.Popup>
				</ComboboxPrimitive.Positioner>
			</ComboboxPrimitive.Portal>
		</ComboboxPrimitive.Root>
	);
}

interface FontsSectionProps {
	tenantId: string;
}

export function FontsSection({ tenantId }: FontsSectionProps) {
	const t = useTranslations();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isBatchCreateOpen, setIsBatchCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteFontId, setDeleteFontId] = useState<string | null>(null);
	const [selectedFont, setSelectedFont] = useState<BrandFont | null>(null);

	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);

	const [name, setName] = useState("");
	const [fontFamily, setFontFamily] = useState("");
	const [fontWeight, setFontWeight] = useState("400");

	const [batchRows, setBatchRows] = useState<FontRow[]>([
		{ id: crypto.randomUUID(), name: "", fontFamily: "", fontWeight: "400" },
	]);
	const [isBatchCreating, setIsBatchCreating] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);

	const { data: fontsData, isLoading } = useFonts(tenantId, {
		limit: ITEMS_PER_PAGE,
		offset: (currentPage - 1) * ITEMS_PER_PAGE,
	});

	const fonts = fontsData?.fonts || [];
	const totalFonts = fontsData?.total || 0;
	const totalPages = Math.ceil(totalFonts / ITEMS_PER_PAGE);

	const createFont = useCreateFont();
	const updateFont = useUpdateFont();
	const deleteFont = useDeleteFont();
	const deleteFontsBatch = useDeleteFontsBatch();

	const resetForm = () => {
		setName("");
		setFontFamily("");
		setFontWeight("400");
		setSelectedFont(null);
	};

	const resetBatchForm = () => {
		setBatchRows([{ id: crypto.randomUUID(), name: "", fontFamily: "", fontWeight: "400" }]);
	};

	const addBatchRow = () => {
		setBatchRows([
			...batchRows,
			{ id: crypto.randomUUID(), name: "", fontFamily: "", fontWeight: "400" },
		]);
	};

	const removeBatchRow = (id: string) => {
		if (batchRows.length > 1) {
			setBatchRows(batchRows.filter((row) => row.id !== id));
		}
	};

	const updateBatchRow = (id: string, field: keyof Omit<FontRow, "id">, newValue: string) => {
		setBatchRows(batchRows.map((row) => (row.id === id ? { ...row, [field]: newValue } : row)));
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !fontFamily.trim()) return;

		try {
			await createFont.mutateAsync({
				tenantId,
				request: { name: name.trim(), fontFamily: fontFamily.trim(), fontWeight },
			});
			toast.success(t.branding.fontCreated);
			setIsCreateOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.fontCreateFailed);
		}
	};

	const handleBatchCreate = async (e: React.FormEvent) => {
		e.preventDefault();

		const validRows = batchRows.filter((row) => row.name.trim() && row.fontFamily.trim());
		if (validRows.length === 0) return;

		setIsBatchCreating(true);
		let successCount = 0;
		let failCount = 0;

		for (const row of validRows) {
			try {
				await createFont.mutateAsync({
					tenantId,
					request: {
						name: row.name.trim(),
						fontFamily: row.fontFamily.trim(),
						fontWeight: row.fontWeight,
					},
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
			toast.error(t.branding.fontCreateFailed);
		}
	};

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedFont || !name.trim() || !fontFamily.trim()) return;

		try {
			await updateFont.mutateAsync({
				tenantId,
				fontId: selectedFont.id,
				request: { name: name.trim(), fontFamily: fontFamily.trim(), fontWeight },
			});
			toast.success(t.branding.fontUpdated);
			setIsEditOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding.fontUpdateFailed);
		}
	};

	const handleDelete = async () => {
		if (!deleteFontId) return;

		try {
			await deleteFont.mutateAsync({ tenantId, fontId: deleteFontId });
			toast.success(t.branding.fontDeleted);
			setDeleteFontId(null);
		} catch {
			toast.error(t.branding.fontDeleteFailed);
		}
	};

	const openEditDialog = (font: BrandFont) => {
		setSelectedFont(font);
		setName(font.name);
		setFontFamily(font.fontFamily);
		setFontWeight(font.fontWeight);
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
		setSelectedIds(new Set(fonts.map((f) => f.id)));
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
			await deleteFontsBatch.mutateAsync({
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

	const sortedFonts = fonts;

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
					<TypographyH3 size="xs">{t.branding.fonts}</TypographyH3>
					<TypographyMuted>{t.branding.fontsDescription}</TypographyMuted>
				</div>
				<div className="flex flex-wrap gap-2">
					{isSelectionMode ? (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={selectedIds.size === fonts.length ? deselectAll : selectAll}
							>
								{selectedIds.size === fonts.length ? (
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
							{fonts.length > 0 && (
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
								{t.branding.addFont}
							</Button>
						</>
					)}
				</div>
			</div>

			{sortedFonts.length === 0 && totalFonts === 0 ? (
				<div className="flex-1 flex items-center justify-center min-h-60">
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon" size="lg">
								<Icon icon={IconTypography} size="xl" className="text-muted-foreground" />
							</EmptyMedia>
							<EmptyTitle>{t.branding.noFonts}</EmptyTitle>
							<EmptyDescription>{t.branding.noFontsDescription}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => setIsCreateOpen(true)}>
								<Icon icon={IconPlus} size="sm" className="mr-2" />
								{t.branding.addFont}
							</Button>
						</EmptyContent>
					</Empty>
				</div>
			) : (
				<>
					<div className="space-y-2">
						{sortedFonts.map((font) => (
							<div
								key={font.id}
								className={`flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors ${
									isSelectionMode && selectedIds.has(font.id) ? "ring-2 ring-primary" : ""
								}`}
								onClick={isSelectionMode ? () => toggleSelection(font.id) : undefined}
							>
								{isSelectionMode && (
									<div className="mr-4">
										<Checkbox
											checked={selectedIds.has(font.id)}
											onCheckedChange={() => toggleSelection(font.id)}
										/>
									</div>
								)}
								<div className="flex-1">
									<TypographyP className="font-medium mt-0">{font.name}</TypographyP>
									<TypographyMuted>
										{font.fontFamily.split(",")} -{" "}
										{FONT_WEIGHTS.find((w) => w.value === font.fontWeight)?.label ||
											font.fontWeight}
									</TypographyMuted>
								</div>
								{!isSelectionMode && (
									<div className="flex gap-1">
										<Button variant="ghost" size="icon" onClick={() => openEditDialog(font)}>
											<Icon icon={IconEdit} size="sm" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive"
											onClick={() => setDeleteFontId(font.id)}
										>
											<Icon icon={IconTrash} size="sm" />
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
						totalItems={totalFonts}
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
							<DialogTitle>{t.branding.addFont}</DialogTitle>
							<DialogDescription>{t.branding.addFontDescription}</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.fontName}>
										{t.branding.fontName}
									</FieldLabelWithTooltip>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Heading"
										required
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.fontFamily}>
										{t.branding.fontFamily}
									</FieldLabelWithTooltip>
									<FontFamilyCombobox
										value={fontFamily}
										onValueChange={setFontFamily}
										placeholder={t.branding.selectOrTypeFont}
										className="w-full"
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.fontWeight}>
										{t.branding.fontWeight}
									</FieldLabelWithTooltip>
									<Select value={fontWeight} onValueChange={setFontWeight}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{FONT_WEIGHTS.map((weight) => (
												<SelectItem key={weight.value} value={weight.value}>
													{weight.label} ({weight.value})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							</FieldGroup>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
								{t.common.cancel}
							</Button>
							<Button type="submit" disabled={createFont.isPending}>
								{createFont.isPending && (
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
							<DialogTitle>{t.branding.editFont}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.fontName}>
										{t.branding.fontName}
									</FieldLabelWithTooltip>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.fontFamily}>
										{t.branding.fontFamily}
									</FieldLabelWithTooltip>
									<FontFamilyCombobox
										value={fontFamily}
										onValueChange={setFontFamily}
										placeholder={t.branding.selectOrTypeFont}
										className="w-full"
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding.tooltips.fontWeight}>
										{t.branding.fontWeight}
									</FieldLabelWithTooltip>
									<Select value={fontWeight} onValueChange={setFontWeight}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{FONT_WEIGHTS.map((weight) => (
												<SelectItem key={weight.value} value={weight.value}>
													{weight.label} ({weight.value})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							</FieldGroup>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
								{t.common.cancel}
							</Button>
							<Button type="submit" disabled={updateFont.isPending}>
								{updateFont.isPending && (
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
							<DialogTitle>{t.branding.batchCreateFonts}</DialogTitle>
							<DialogDescription>{t.branding.batchCreateFontsDescription}</DialogDescription>
						</DialogHeader>
						<ScrollArea className="flex-1 max-h-[60vh] py-4">
							<div className="space-y-4 pr-4">
								{batchRows.map((row) => (
									<div
										key={row.id}
										className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/30"
									>
										<div className="flex flex-col gap-3">
											<div className="min-w-0">
												<FieldLabelWithTooltip tooltip={t.branding.tooltips.fontName}>
													{t.branding.fontName}
												</FieldLabelWithTooltip>
												<Input
													value={row.name}
													onChange={(e) => updateBatchRow(row.id, "name", e.target.value)}
													placeholder="Heading"
												/>
											</div>
											<div className="min-w-0">
												<FieldLabelWithTooltip tooltip={t.branding.tooltips.fontFamily}>
													{t.branding.fontFamily}
												</FieldLabelWithTooltip>
												<FontFamilyCombobox
													value={row.fontFamily}
													onValueChange={(value) => updateBatchRow(row.id, "fontFamily", value)}
													placeholder={t.branding.selectFont}
													className="w-full"
												/>
											</div>
											<div className="min-w-0">
												<FieldLabelWithTooltip tooltip={t.branding.tooltips.fontWeight}>
													{t.branding.fontWeight}
												</FieldLabelWithTooltip>
												<Select
													value={row.fontWeight}
													onValueChange={(value) => updateBatchRow(row.id, "fontWeight", value)}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{FONT_WEIGHTS.map((weight) => (
															<SelectItem key={weight.value} value={weight.value}>
																{weight.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="flex justify-end">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeBatchRow(row.id)}
												disabled={batchRows.length === 1}
												className="text-destructive hover:text-destructive"
											>
												<Icon icon={IconTrash} size="sm" className="mr-1" />
												{t.common.delete}
											</Button>
										</div>
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
									disabled={
										isBatchCreating ||
										batchRows.every((r) => !r.name.trim() || !r.fontFamily.trim())
									}
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

			<AlertDialog open={!!deleteFontId} onOpenChange={(open) => !open && setDeleteFontId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.branding.deleteFont}</AlertDialogTitle>
						<AlertDialogDescription>{t.branding.deleteFontConfirm}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteFont.isPending && (
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
							{deleteFontsBatch.isPending && (
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
