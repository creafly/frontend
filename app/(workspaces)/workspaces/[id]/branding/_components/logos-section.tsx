"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconPlus, IconTrash, IconEdit, IconLoader2, IconPhoto } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useCreateLogo, useUpdateLogo, useDeleteLogo } from "@/hooks/use-branding";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabelWithTooltip } from "@/components/ui/field";
import type { BrandLogo } from "@/types/branding";

type LogoType = "primary" | "secondary" | "favicon" | "icon";

interface LogosSectionProps {
	tenantId: string;
	logos: BrandLogo[];
}

export function LogosSection({ tenantId, logos }: LogosSectionProps) {
	const t = useTranslations();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteLogoId, setDeleteLogoId] = useState<string | null>(null);
	const [selectedLogo, setSelectedLogo] = useState<BrandLogo | null>(null);

	const [name, setName] = useState("");
	const [type, setType] = useState<LogoType>("primary");
	const [fileUrl, setFileUrl] = useState("");

	const createLogo = useCreateLogo();
	const updateLogo = useUpdateLogo();
	const deleteLogo = useDeleteLogo();

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
			toast.success(t.branding?.logoCreated || "Logo created");
			setIsCreateOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding?.logoCreateFailed || "Failed to create logo");
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
			toast.success(t.branding?.logoUpdated || "Logo updated");
			setIsEditOpen(false);
			resetForm();
		} catch {
			toast.error(t.branding?.logoUpdateFailed || "Failed to update logo");
		}
	};

	const handleDelete = async () => {
		if (!deleteLogoId) return;

		try {
			await deleteLogo.mutateAsync({ tenantId, logoId: deleteLogoId });
			toast.success(t.branding?.logoDeleted || "Logo deleted");
			setDeleteLogoId(null);
		} catch {
			toast.error(t.branding?.logoDeleteFailed || "Failed to delete logo");
		}
	};

	const openEditDialog = (logo: BrandLogo) => {
		setSelectedLogo(logo);
		setName(logo.name);
		setType(logo.type);
		setFileUrl(logo.fileUrl || "");
		setIsEditOpen(true);
	};

	const getLogoTypeLabel = (logoType: LogoType): string => {
		return t.branding?.logoTypes?.[logoType] || logoType;
	};

	const sortedLogos = [...logos].sort((a, b) => a.order - b.order);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium">{t.branding?.logos || "Logos"}</h3>
					<p className="text-sm text-muted-foreground">
						{t.branding?.logosDescription || "Upload and manage your brand logos"}
					</p>
				</div>
				<Button onClick={() => setIsCreateOpen(true)}>
					<IconPlus className="mr-2 h-4 w-4" />
					{t.branding?.addLogo || "Add Logo"}
				</Button>
			</div>

			{sortedLogos.length === 0 ? (
				<div className="text-center py-8 border rounded-lg bg-card">
					<IconPhoto className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
					<p className="text-muted-foreground">{t.branding?.noLogos || "No logos uploaded yet"}</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{sortedLogos.map((logo) => (
						<div
							key={logo.id}
							className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
						>
							<div className="w-full h-24 rounded-md mb-3 border bg-muted/30 flex items-center justify-center overflow-hidden">
								{logo.fileUrl ? (
									<img
										src={logo.fileUrl}
										alt={logo.name}
										className="object-contain max-h-full max-w-full"
									/>
								) : (
									<IconPhoto className="h-8 w-8 text-muted-foreground" />
								)}
							</div>
							<div className="flex items-center justify-between">
								<div className="min-w-0 flex-1">
									<p className="font-medium text-sm truncate">{logo.name}</p>
									<p className="text-xs text-muted-foreground">{getLogoTypeLabel(logo.type)}</p>
								</div>
								<div className="flex gap-1 ml-2">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => openEditDialog(logo)}
									>
										<IconEdit className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-destructive hover:text-destructive"
										onClick={() => setDeleteLogoId(logo.id)}
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
							<DialogTitle>{t.branding?.addLogo || "Add Logo"}</DialogTitle>
							<DialogDescription>
								{t.branding?.addLogoDescription || "Upload a new logo for your brand"}
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.logoName}>
										{t.branding?.logoName || "Name"}
									</FieldLabelWithTooltip>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Main Logo"
										required
									/>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.logoType}>
										{t.branding?.logoType || "Logo Type"}
									</FieldLabelWithTooltip>
									<Select value={type} onValueChange={(v) => setType(v as LogoType)}>
										<SelectTrigger>
											<SelectValue placeholder={t.branding?.selectLogoType || "Select logo type"} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="primary">
												{t.branding?.logoTypes?.primary || "Primary Logo"}
											</SelectItem>
											<SelectItem value="secondary">
												{t.branding?.logoTypes?.secondary || "Secondary Logo"}
											</SelectItem>
											<SelectItem value="favicon">
												{t.branding?.logoTypes?.favicon || "Favicon"}
											</SelectItem>
											<SelectItem value="icon">{t.branding?.logoTypes?.icon || "Icon"}</SelectItem>
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.logoFile}>
										{t.branding?.logoFile || "Logo URL"}
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
								{createLogo.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
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
							<DialogTitle>{t.branding?.editLogo || "Edit Logo"}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<FieldGroup>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.logoName}>
										{t.branding?.logoName || "Name"}
									</FieldLabelWithTooltip>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.logoType}>
										{t.branding?.logoType || "Logo Type"}
									</FieldLabelWithTooltip>
									<Select value={type} onValueChange={(v) => setType(v as LogoType)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="primary">
												{t.branding?.logoTypes?.primary || "Primary Logo"}
											</SelectItem>
											<SelectItem value="secondary">
												{t.branding?.logoTypes?.secondary || "Secondary Logo"}
											</SelectItem>
											<SelectItem value="favicon">
												{t.branding?.logoTypes?.favicon || "Favicon"}
											</SelectItem>
											<SelectItem value="icon">{t.branding?.logoTypes?.icon || "Icon"}</SelectItem>
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabelWithTooltip tooltip={t.branding?.tooltips?.logoFile}>
										{t.branding?.logoFile || "Logo URL"}
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
								{updateLogo.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
								{t.common.save}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={!!deleteLogoId} onOpenChange={(open) => !open && setDeleteLogoId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.branding?.deleteLogo || "Delete Logo"}</AlertDialogTitle>
						<AlertDialogDescription>
							{t.branding?.deleteLogoConfirm || "Are you sure you want to delete this logo?"}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteLogo.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
							{t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
