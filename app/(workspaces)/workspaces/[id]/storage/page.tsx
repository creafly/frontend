"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
	IconArrowLeft,
	IconLoader2,
	IconUpload,
	IconTrash,
	IconFile,
	IconPhoto,
	IconFileText,
	IconCopy,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useResolveTenantSlug, useTenant, useCurrentSubscription, usePlan } from "@/hooks/use-api";
import { useFiles, useUploadFile, useDeleteFile, useGetPresignedUrl } from "@/hooks/use-storage";
import { Button } from "@/components/ui/button";
import { CardPagination } from "@/components/ui/card-pagination";
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
import type { StorageFile } from "@/types/storage";

const ITEMS_PER_PAGE = 12;

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(contentType: string) {
	if (contentType.startsWith("image/")) {
		return <IconPhoto className="h-8 w-8 text-blue-500" />;
	}
	if (contentType === "application/pdf") {
		return <IconFileText className="h-8 w-8 text-red-500" />;
	}
	return <IconFile className="h-8 w-8 text-gray-500" />;
}

export default function StoragePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const t = useTranslations();

	const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [copyingFileId, setCopyingFileId] = useState<string | null>(null);

	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
	const { data: resolvedTenant, isLoading: isResolving } = useResolveTenantSlug(
		isUUID ? undefined : id
	);
	const resolvedTenantId = isUUID ? id : resolvedTenant?.id;

	const { data: tenantData, isLoading: isTenantLoading } = useTenant(resolvedTenantId);
	const { data: filesData, isLoading: isFilesLoading } = useFiles(resolvedTenantId || "");
	const { data: subscription } = useCurrentSubscription(resolvedTenantId || "");
	const { data: plan } = usePlan(subscription?.planId || "");

	const uploadFile = useUploadFile();
	const deleteFile = useDeleteFile();
	const getPresignedUrl = useGetPresignedUrl();

	const tenant = tenantData?.tenant;
	const allFiles = filesData?.files || [];
	const storageLimit = plan?.storageLimit || 100 * 1024 * 1024;
	const isLoading = isResolving || isTenantLoading || isFilesLoading;

	const totalPages = Math.ceil(allFiles.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const files = allFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	const handleFileUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file || !resolvedTenantId) return;

			setIsUploading(true);
			try {
				await uploadFile.mutateAsync({
					tenantId: resolvedTenantId,
					file,
					fileType: file.type.startsWith("image/") ? "image" : "document",
				});
				toast.success(t.storage?.uploadSuccess || "File uploaded successfully");
			} catch {
				toast.error(t.storage?.uploadFailed || "Failed to upload file");
			} finally {
				setIsUploading(false);
				e.target.value = "";
			}
		},
		[resolvedTenantId, uploadFile, t]
	);

	const handleDelete = async () => {
		if (!deleteFileId || !resolvedTenantId) return;

		try {
			await deleteFile.mutateAsync({ tenantId: resolvedTenantId, fileId: deleteFileId });
			toast.success(t.storage?.deleteSuccess || "File deleted");
			setDeleteFileId(null);
		} catch {
			toast.error(t.storage?.deleteFailed || "Failed to delete file");
		}
	};

	const handleCopyLink = async (fileId: string) => {
		if (!resolvedTenantId) return;

		setCopyingFileId(fileId);
		try {
			const result = await getPresignedUrl.mutateAsync({
				tenantId: resolvedTenantId,
				fileId,
				expiryMinutes: 60,
			});
			await navigator.clipboard.writeText(result.url);
			toast.success(t.common.linkCopied || "Link copied to clipboard");
		} catch {
			toast.error(t.storage?.copyLinkFailed || "Failed to copy link");
		} finally {
			setCopyingFileId(null);
		}
	};

	const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full min-h-96">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!tenant) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-96">
				<p className="text-muted-foreground mb-4">
					{t.workspaces?.workspaceNotFound || "Workspace not found"}
				</p>
				<Link href="/workspaces">
					<Button variant="outline">
						<IconArrowLeft className="mr-2 h-4 w-4" />
						{t.workspaces?.backToWorkspaces || "Back to Workspaces"}
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="w-full py-8 px-4">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">{t.storage?.title || "Storage"}</h1>
						<p className="text-muted-foreground">
							{t.storage?.subtitle || "Manage your uploaded files"}
						</p>
					</div>
				</div>
				<div>
					<input
						type="file"
						id="file-upload"
						className="hidden"
						onChange={handleFileUpload}
						accept="image/*,.pdf"
					/>
					<label htmlFor="file-upload">
						<Button asChild disabled={isUploading}>
							<span>
								{isUploading ? (
									<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<IconUpload className="mr-2 h-4 w-4" />
								)}
								{t.storage?.uploadFile || "Upload File"}
							</span>
						</Button>
					</label>
				</div>
			</div>

			<div className="mb-6 p-4 border rounded-lg bg-card">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium">{t.storage?.usage || "Storage Usage"}</span>
					<span className="text-sm text-muted-foreground">
						{formatFileSize(totalSize)} {t.common.of} {formatFileSize(storageLimit)}
					</span>
				</div>
				<div className="h-2 bg-muted rounded-full overflow-hidden">
					<div
						className="h-full bg-primary transition-all"
						style={{ width: `${Math.min((totalSize / storageLimit) * 100, 100)}%` }}
					/>
				</div>
				<p className="text-xs text-muted-foreground mt-1">
					{allFiles.length} {t.storage?.files || "files"}
				</p>
			</div>

			{allFiles.length === 0 ? (
				<div className="text-center py-12 border rounded-lg bg-card">
					<IconFile className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<p className="text-muted-foreground">{t.storage?.noFiles || "No files uploaded yet"}</p>
				</div>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{files.map((file: StorageFile) => (
							<div
								key={file.id}
								className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
							>
								{getFileIcon(file.contentType)}
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">{file.originalName}</p>
									<p className="text-sm text-muted-foreground">
										{formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
									</p>
								</div>
								<div className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleCopyLink(file.id)}
										disabled={copyingFileId === file.id}
										title={t.common.copyLink}
									>
										{copyingFileId === file.id ? (
											<IconLoader2 className="h-4 w-4 animate-spin" />
										) : (
											<IconCopy className="h-4 w-4" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="text-destructive hover:text-destructive"
										onClick={() => setDeleteFileId(file.id)}
									>
										<IconTrash className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>

					<CardPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						totalItems={allFiles.length}
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

			<AlertDialog open={!!deleteFileId} onOpenChange={(open) => !open && setDeleteFileId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.storage?.deleteFile || "Delete File"}</AlertDialogTitle>
						<AlertDialogDescription>
							{t.storage?.deleteConfirm || "Are you sure you want to delete this file?"}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteFile.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
							{t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
