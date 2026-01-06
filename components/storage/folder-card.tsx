"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	IconFolder,
	IconDotsVertical,
	IconPencil,
	IconTrash,
	IconLoader2,
	IconArrowRight,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { Icon, TypographyP, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateFolder, useDeleteFolder } from "@/hooks/use-storage";
import type { FolderWithCounts } from "@/types/storage";
import { cn } from "@/lib/utils";

interface FolderCardProps {
	folder: FolderWithCounts;
	tenantId: string;
	onNavigate: (folderId: string) => void;
	isSelectionMode?: boolean;
	isSelected?: boolean;
	onSelect?: () => void;
}

export function FolderCard({
	folder,
	tenantId,
	onNavigate,
	isSelectionMode,
	isSelected,
	onSelect,
}: FolderCardProps) {
	const t = useTranslations();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showRenameDialog, setShowRenameDialog] = useState(false);
	const [newName, setNewName] = useState(folder.name);

	const updateFolder = useUpdateFolder();
	const deleteFolder = useDeleteFolder();

	const handleRename = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newName.trim() || newName === folder.name) {
			setShowRenameDialog(false);
			return;
		}

		try {
			await updateFolder.mutateAsync({
				tenantId,
				folderId: folder.id,
				data: { name: newName.trim() },
			});
			toast.success(t.storage.folderRenamed);
			setShowRenameDialog(false);
		} catch {
			toast.error(t.storage.folderRenameFailed);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteFolder.mutateAsync({
				tenantId,
				folderId: folder.id,
			});
			toast.success(t.storage.folderDeleted);
			setShowDeleteDialog(false);
		} catch {
			toast.error(t.storage.folderDeleteFailed);
		}
	};

	const handleClick = () => {
		if (isSelectionMode) {
			onSelect?.();
		} else {
			onNavigate(folder.id);
		}
	};

	return (
		<>
			<div
				className={cn(
					"flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer group",
					isSelectionMode && isSelected && "ring-2 ring-primary"
				)}
				onClick={handleClick}
			>
				<div className="flex-shrink-0">
					<Icon icon={IconFolder} size="xl" className="text-primary" />
				</div>
				<div className="flex-1 min-w-0">
					<TypographyP className="font-medium truncate mt-0">{folder.name}</TypographyP>
					<TypographyMuted>
						{t.storage.itemsCount
							.replace("{folders}", String(folder.folderCount))
							.replace("{files}", String(folder.fileCount))}
					</TypographyMuted>
				</div>
				{!isSelectionMode && (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={(e) => {
								e.stopPropagation();
								onNavigate(folder.id);
							}}
						>
							<Icon icon={IconArrowRight} />
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={(e) => e.stopPropagation()}
								>
									<Icon icon={IconDotsVertical} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										setNewName(folder.name);
										setShowRenameDialog(true);
									}}
								>
									<Icon icon={IconPencil} className="mr-2" />
									{t.storage.renameFolder}
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onClick={(e) => {
										e.stopPropagation();
										setShowDeleteDialog(true);
									}}
								>
									<Icon icon={IconTrash} className="mr-2" />
									{t.storage.deleteFolder}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>

			<Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
				<DialogContent>
					<form onSubmit={handleRename}>
						<DialogHeader>
							<DialogTitle>{t.storage.renameFolder}</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<Label htmlFor="rename-folder">{t.storage.folderName}</Label>
							<Input
								id="rename-folder"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder={t.storage.folderNamePlaceholder}
								className="mt-2"
								autoFocus
							/>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setShowRenameDialog(false)}>
								{t.common.cancel}
							</Button>
							<Button type="submit" disabled={!newName.trim() || updateFolder.isPending}>
								{updateFolder.isPending && (
									<Icon icon={IconLoader2} className="mr-2 animate-spin" />
								)}
								{t.common.save}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.storage.deleteFolder}</AlertDialogTitle>
						<AlertDialogDescription>{t.storage.deleteFolderConfirm}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteFolder.isPending && <Icon icon={IconLoader2} className="mr-2 animate-spin" />}
							{t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
