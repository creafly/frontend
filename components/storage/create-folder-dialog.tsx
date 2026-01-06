"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconFolderPlus, IconLoader2 } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { Icon } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateFolder } from "@/hooks/use-storage";

interface CreateFolderDialogProps {
	tenantId: string;
	parentId?: string;
	trigger?: React.ReactNode;
	onSuccess?: () => void;
}

export function CreateFolderDialog({
	tenantId,
	parentId,
	trigger,
	onSuccess,
}: CreateFolderDialogProps) {
	const t = useTranslations();
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");

	const createFolder = useCreateFolder();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) return;

		try {
			await createFolder.mutateAsync({
				tenantId,
				data: {
					name: name.trim(),
					parentId,
				},
			});
			toast.success(t.storage.folderCreated);
			setName("");
			setOpen(false);
			onSuccess?.();
		} catch {
			toast.error(t.storage.folderCreateFailed);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm">
						<Icon icon={IconFolderPlus} className="mr-2" />
						{t.storage.createFolder}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t.storage.createFolder}</DialogTitle>
						<DialogDescription>{t.storage.createFolderDescription}</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label htmlFor="folder-name">{t.storage.folderName}</Label>
						<Input
							id="folder-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t.storage.folderNamePlaceholder}
							className="mt-2"
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button type="submit" disabled={!name.trim() || createFolder.isPending}>
							{createFolder.isPending && <Icon icon={IconLoader2} className="mr-2 animate-spin" />}
							{t.common.create}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
