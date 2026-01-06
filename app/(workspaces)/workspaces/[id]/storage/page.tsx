"use client";

import { use, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
	IconArrowLeft,
	IconLoader2,
	IconUpload,
	IconTrash,
	IconFile,
	IconPhoto,
	IconFileText,
	IconCopy,
	IconSquareCheck,
	IconSquare,
	IconX,
	IconCloudUpload,
	IconBrandAbstract,
	IconVideo,
	IconFolderPlus,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { Icon, TypographyH1, TypographyMuted, TypographyP } from "@/components/typography";
import { useResolveTenantSlug, useTenant, useCurrentSubscription, usePlan } from "@/hooks/use-api";
import {
	useFiles,
	useFolders,
	useUploadFile,
	useDeleteFile,
	useBatchDeleteFiles,
	useGetPresignedUrl,
	useStorageUsage,
} from "@/hooks/use-storage";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CardPagination } from "@/components/ui/card-pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { StorageFile, FileType, FolderWithCounts } from "@/types/storage";
import Container from "@/components/container";
import { cn } from "@/lib/utils";
import { CreateFolderDialog } from "@/components/storage/create-folder-dialog";
import { FolderCard } from "@/components/storage/folder-card";
import { StorageBreadcrumb } from "@/components/storage/storage-breadcrumb";

const ITEMS_PER_PAGE = 12;

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(contentType: string, fileType?: string) {
	if (fileType === "logo") {
		return <Icon icon={IconBrandAbstract} size="xl" className="text-primary" />;
	}
	if (contentType.startsWith("image/")) {
		return <Icon icon={IconPhoto} size="xl" className="text-info" />;
	}
	if (contentType === "application/pdf" || contentType === "text/markdown") {
		return <Icon icon={IconFileText} size="xl" className="text-destructive" />;
	}
	return <Icon icon={IconFile} size="xl" className="text-muted-foreground" />;
}

type FilterType = "all" | FileType;

export default function StoragePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const t = useTranslations();

	const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [copyingFileId, setCopyingFileId] = useState<string | null>(null);
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
	const [isDragOver, setIsDragOver] = useState(false);
	const [filterType, setFilterType] = useState<FilterType>("all");
	const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
	const dropZoneRef = useRef<HTMLDivElement>(null);

	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
	const { data: resolvedTenant, isLoading: isResolving } = useResolveTenantSlug(
		isUUID ? undefined : id
	);
	const resolvedTenantId = isUUID ? id : resolvedTenant?.id;

	const { data: tenantData, isLoading: isTenantLoading } = useTenant(resolvedTenantId);
	const { data: filesData, isLoading: isFilesLoading } = useFiles(resolvedTenantId || "", {
		folderId: currentFolderId,
		type: filterType === "all" ? undefined : filterType,
		limit: ITEMS_PER_PAGE,
		offset: (currentPage - 1) * ITEMS_PER_PAGE,
	});
	const { data: foldersData, isLoading: isFoldersLoading } = useFolders(resolvedTenantId || "", {
		parentId: currentFolderId,
	});
	const { data: subscription } = useCurrentSubscription(resolvedTenantId || "");
	const { data: plan } = usePlan(subscription?.planId || "");

	const uploadFile = useUploadFile();
	const deleteFile = useDeleteFile();
	const batchDeleteFiles = useBatchDeleteFiles();
	const getPresignedUrl = useGetPresignedUrl();
	const { data: storageUsageData } = useStorageUsage(resolvedTenantId || "");

	const tenant = tenantData?.tenant;
	const files = filesData?.files || [];
	const totalFiles = filesData?.total || 0;
	const folders = foldersData?.folders || [];
	const storageLimit = plan?.storageLimit || 100 * 1024 * 1024;
	const isLoading = isResolving || isTenantLoading || isFilesLoading || isFoldersLoading;

	const totalPages = Math.ceil(totalFiles / ITEMS_PER_PAGE);

	const totalSize = storageUsageData?.used || 0;

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
					folderId: currentFolderId,
				});
				toast.success(t.storage.uploadSuccess);
			} catch {
				toast.error(t.storage.uploadFailed);
			} finally {
				setIsUploading(false);
				e.target.value = "";
			}
		},
		[resolvedTenantId, uploadFile, t, currentFolderId]
	);

	const handleFileDrop = useCallback(
		async (files: FileList) => {
			if (!resolvedTenantId || files.length === 0) return;

			setIsUploading(true);
			let successCount = 0;
			let failCount = 0;

			for (const file of Array.from(files)) {
				try {
					await uploadFile.mutateAsync({
						tenantId: resolvedTenantId,
						file,
						fileType: file.type.startsWith("image/") ? "image" : "document",
						folderId: currentFolderId,
					});
					successCount++;
				} catch {
					failCount++;
				}
			}

			setIsUploading(false);

			if (successCount > 0 && failCount === 0) {
				toast.success(
					files.length === 1
						? t.storage.uploadSuccess
						: t.storage.batchUploadSuccess.replace("{count}", String(successCount))
				);
			} else if (successCount > 0 && failCount > 0) {
				toast.warning(
					t.storage.batchUploadPartial
						.replace("{success}", String(successCount))
						.replace("{total}", String(files.length))
				);
			} else {
				toast.error(t.storage.uploadFailed);
			}
		},
		[resolvedTenantId, uploadFile, t, currentFolderId]
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
			setIsDragOver(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragOver(false);

			const files = e.dataTransfer.files;
			if (files.length > 0) {
				handleFileDrop(files);
			}
		},
		[handleFileDrop]
	);

	const handleDelete = async () => {
		if (!deleteFileId || !resolvedTenantId) return;

		try {
			await deleteFile.mutateAsync({ tenantId: resolvedTenantId, fileId: deleteFileId });
			toast.success(t.storage.deleteSuccess);
			setDeleteFileId(null);
		} catch {
			toast.error(t.storage.deleteFailed);
		}
	};

	const toggleFileSelection = (fileId: string) => {
		setSelectedFiles((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(fileId)) {
				newSet.delete(fileId);
			} else {
				newSet.add(fileId);
			}
			return newSet;
		});
	};

	const toggleSelectAll = () => {
		if (selectedFiles.size === files.length) {
			setSelectedFiles(new Set());
		} else {
			setSelectedFiles(new Set(files.map((f) => f.id)));
		}
	};

	const handleBatchDelete = async () => {
		if (selectedFiles.size === 0 || !resolvedTenantId) return;

		try {
			const result = await batchDeleteFiles.mutateAsync({
				tenantId: resolvedTenantId,
				fileIds: Array.from(selectedFiles),
			});
			const deletedCount = result.deleted?.length || 0;
			const failedCount = result.failed?.length || 0;

			if (deletedCount > 0 && failedCount === 0) {
				toast.success(t.storage.batchDeleteSuccess.replace("{count}", String(deletedCount)));
			} else if (deletedCount > 0 && failedCount > 0) {
				toast.warning(
					t.storage.batchDeletePartial
						.replace("{deleted}", String(deletedCount))
						.replace("{total}", String(deletedCount + failedCount))
				);
			} else {
				toast.error(t.storage.batchDeleteFailed);
			}

			setSelectedFiles(new Set());
			setIsSelectionMode(false);
		} catch {
			toast.error(t.storage.batchDeleteFailed);
		}
	};

	const exitSelectionMode = () => {
		setIsSelectionMode(false);
		setSelectedFiles(new Set());
	};

	const handleFilterChange = (value: string) => {
		setFilterType(value as FilterType);
		setCurrentPage(1);
		exitSelectionMode();
	};

	const handleFolderNavigate = (folderId?: string) => {
		setCurrentFolderId(folderId);
		setCurrentPage(1);
		exitSelectionMode();
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
			toast.success(t.common.linkCopied);
		} catch {
			toast.error(t.storage.copyLinkFailed);
		} finally {
			setCopyingFileId(null);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full min-h-96">
				<Icon icon={IconLoader2} size="xl" className="animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!tenant) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-96">
				<TypographyMuted className="mb-4">{t.workspaces.workspaceNotFound}</TypographyMuted>
				<Link href="/workspaces">
					<Button variant="outline">
						<Icon icon={IconArrowLeft} className="mr-2" />
						{t.workspaces.backToWorkspaces}
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<Container className="max-w-full">
			<div className="flex flex-wrap items-center justify-between mb-6 gap-2">
				<div className="flex items-center gap-4">
					<div>
						<TypographyH1 size="sm">{t.storage.title}</TypographyH1>
						<TypographyMuted>{t.storage.subtitle}</TypographyMuted>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{isSelectionMode ? (
						<>
							<Button variant="outline" size="sm" onClick={toggleSelectAll}>
								{selectedFiles.size === files.length ? (
									<Icon icon={IconSquareCheck} className="mr-2" />
								) : (
									<Icon icon={IconSquare} className="mr-2" />
								)}
								{selectedFiles.size === files.length ? t.common.deselectAll : t.common.selectAll}
							</Button>
							<Button
								variant="destructive"
								size="sm"
								disabled={selectedFiles.size === 0 || batchDeleteFiles.isPending}
								onClick={handleBatchDelete}
							>
								{batchDeleteFiles.isPending ? (
									<Icon icon={IconLoader2} className="mr-2 animate-spin" />
								) : (
									<Icon icon={IconTrash} className="mr-2" />
								)}
								{t.storage.deleteSelected} ({selectedFiles.size})
							</Button>
							<Button variant="ghost" size="sm" onClick={exitSelectionMode}>
								<Icon icon={IconX} />
							</Button>
						</>
					) : (
						<>
							{totalFiles > 0 && (
								<Button variant="outline" onClick={() => setIsSelectionMode(true)}>
									<Icon icon={IconSquareCheck} className="mr-2" />
									{t.storage.selectFiles}
								</Button>
							)}
							<CreateFolderDialog
								tenantId={resolvedTenantId || ""}
								parentId={currentFolderId}
								trigger={
									<Button variant="outline">
										<Icon icon={IconFolderPlus} className="mr-2" />
										{t.storage.createFolder}
									</Button>
								}
							/>
							<input
								type="file"
								id="file-upload"
								className="hidden"
								onChange={handleFileUpload}
								accept="image/*,.pdf,.txt,.md"
							/>
							<label htmlFor="file-upload">
								<Button asChild disabled={isUploading}>
									<span>
										{isUploading ? (
											<Icon icon={IconLoader2} className="mr-2 animate-spin" />
										) : (
											<Icon icon={IconUpload} className="mr-2" />
										)}
										{t.storage.uploadFile}
									</span>
								</Button>
							</label>
						</>
					)}
				</div>
			</div>

			<div className="mb-6 p-4 border rounded-lg bg-card">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium">{t.storage.usage}</span>
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
				<TypographyMuted className="text-xs mt-1">
					{totalFiles} {t.storage.files}
				</TypographyMuted>
			</div>

			<Tabs value={filterType} onValueChange={handleFilterChange} className="mb-6">
				<TabsList>
					<TabsTrigger value="all" className="gap-2">
						<Icon icon={IconFile} size="sm" />
						{t.storage.filterAll}
					</TabsTrigger>
					<TabsTrigger value="image" className="gap-2">
						<Icon icon={IconPhoto} size="sm" />
						{t.storage.filterImages}
					</TabsTrigger>
					<TabsTrigger value="document" className="gap-2">
						<Icon icon={IconFileText} size="sm" />
						{t.storage.filterDocuments}
					</TabsTrigger>
					<TabsTrigger value="logo" className="gap-2">
						<Icon icon={IconBrandAbstract} size="sm" />
						{t.storage.filterLogos}
					</TabsTrigger>
					<TabsTrigger value="video" className="gap-2">
						<Icon icon={IconVideo} size="sm" />
						{t.storage.filterVideos}
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<StorageBreadcrumb
				tenantId={resolvedTenantId || ""}
				currentFolderId={currentFolderId}
				onNavigate={handleFolderNavigate}
			/>

			{totalFiles === 0 && folders.length === 0 ? (
				<div
					ref={dropZoneRef}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className="flex-1 flex items-center justify-center"
				>
					<Empty
						className={cn(
							"min-h-80 transition-all duration-200 border-2",
							isDragOver ? "border-primary bg-primary/5 border-solid" : "border-dashed"
						)}
					>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<motion.div
									animate={isDragOver ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
								>
									<Icon
										icon={isDragOver ? IconCloudUpload : IconFile}
										size="lg"
										className={cn(
											"transition-colors",
											isDragOver ? "text-primary" : "text-muted-foreground"
										)}
									/>
								</motion.div>
							</EmptyMedia>
							<EmptyTitle>
								{isDragOver
									? t.storage.dropToUpload
									: currentFolderId
									? t.storage.emptyFolder
									: filterType !== "all"
									? t.storage.noFilesInCategory
									: t.storage.noFiles}
							</EmptyTitle>
							<EmptyDescription>
								{isDragOver
									? t.storage.releaseToUpload
									: currentFolderId
									? t.storage.emptyFolderDescription
									: t.storage.noFilesDescription}
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<AnimatePresence>
								{!isDragOver && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="flex items-center gap-2"
									>
										<CreateFolderDialog
											tenantId={resolvedTenantId || ""}
											parentId={currentFolderId}
											trigger={
												<Button variant="outline">
													<Icon icon={IconFolderPlus} className="mr-2" />
													{t.storage.createFolder}
												</Button>
											}
										/>
										<input
											type="file"
											id="file-upload-empty"
											className="hidden"
											onChange={handleFileUpload}
											accept="image/*,.pdf,.txt,.md"
											multiple
										/>
										<label htmlFor="file-upload-empty">
											<Button asChild disabled={isUploading}>
												<span>
													{isUploading ? (
														<Icon icon={IconLoader2} className="mr-2 animate-spin" />
													) : (
														<Icon icon={IconUpload} className="mr-2" />
													)}
													{t.storage.uploadFile}
												</span>
											</Button>
										</label>
									</motion.div>
								)}
							</AnimatePresence>
						</EmptyContent>
					</Empty>
				</div>
			) : (
				<div
					ref={dropZoneRef}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className="relative"
				>
					<AnimatePresence>
						{isDragOver && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg"
							>
								<div className="flex flex-col items-center gap-2">
									<motion.div
										animate={{ y: [0, -8, 0] }}
										transition={{ duration: 1, repeat: Infinity }}
									>
										<Icon icon={IconCloudUpload} size="2xl" className="text-primary" />
									</motion.div>
									<span className="text-sm font-medium text-primary">{t.storage.dropToUpload}</span>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{folders.map((folder: FolderWithCounts) => (
							<FolderCard
								key={folder.id}
								folder={folder}
								tenantId={resolvedTenantId || ""}
								onNavigate={handleFolderNavigate}
								isSelectionMode={isSelectionMode}
							/>
						))}
						{files.map((file: StorageFile) => (
							<div
								key={file.id}
								className={`flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors ${
									isSelectionMode && selectedFiles.has(file.id) ? "ring-2 ring-primary" : ""
								}`}
								onClick={isSelectionMode ? () => toggleFileSelection(file.id) : undefined}
								style={isSelectionMode ? { cursor: "pointer" } : undefined}
							>
								{isSelectionMode && (
									<Checkbox
										checked={selectedFiles.has(file.id)}
										onCheckedChange={() => toggleFileSelection(file.id)}
										onClick={(e) => e.stopPropagation()}
									/>
								)}
								{getFileIcon(file.contentType, file.fileType)}
								<div className="flex-1 min-w-0">
									<TypographyP className="font-medium truncate mt-0">
										{file.originalName}
									</TypographyP>
									<TypographyMuted>
										{formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
									</TypographyMuted>
								</div>
								{!isSelectionMode && (
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleCopyLink(file.id)}
											disabled={copyingFileId === file.id}
											title={t.common.copyLink}
										>
											{copyingFileId === file.id ? (
												<Icon icon={IconLoader2} className="animate-spin" />
											) : (
												<Icon icon={IconCopy} />
											)}
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive"
											onClick={() => setDeleteFileId(file.id)}
										>
											<Icon icon={IconTrash} />
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
						totalItems={totalFiles}
						itemsPerPage={ITEMS_PER_PAGE}
						labels={{
							previous: t.common.previous,
							next: t.common.next,
							of: t.common.of,
							showing: t.common.showing,
							items: t.common.items,
						}}
					/>
				</div>
			)}

			<AlertDialog open={!!deleteFileId} onOpenChange={(open) => !open && setDeleteFileId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.storage.deleteFile}</AlertDialogTitle>
						<AlertDialogDescription>{t.storage.deleteConfirm}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteFile.isPending && <Icon icon={IconLoader2} className="mr-2 animate-spin" />}
							{t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Container>
	);
}
