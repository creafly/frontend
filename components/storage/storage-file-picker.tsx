"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon, TypographyMuted } from "@/components/typography";
import {
	IconFile,
	IconPhoto,
	IconFileText,
	IconBrandAbstract,
	IconVideo,
	IconLoader2,
	IconCheck,
	IconDatabase,
} from "@tabler/icons-react";
import { useTranslations } from "@/providers/i18n-provider";
import { useFiles, useGetPresignedUrl } from "@/hooks/use-storage";
import { cn } from "@/lib/utils";
import type { StorageFile, FileType } from "@/types/storage";

interface StorageFilePickerProps {
	tenantId: string;
	onSelect: (file: StorageFile, presignedUrl: string) => void;
	trigger?: React.ReactNode;
	allowedTypes?: FileType[];
	multiple?: boolean;
	maxFiles?: number;
}

const ITEMS_PER_PAGE = 12;

function getFileIcon(file: StorageFile) {
	if (file.contentType.startsWith("image/")) return IconPhoto;
	if (file.contentType.startsWith("video/")) return IconVideo;
	if (file.fileType === "logo") return IconBrandAbstract;
	return IconFileText;
}

export function StorageFilePicker({
	tenantId,
	onSelect,
	trigger,
	allowedTypes,
	multiple = false,
	maxFiles = 5,
}: StorageFilePickerProps) {
	const t = useTranslations();
	const [open, setOpen] = useState(false);
	const [filterType, setFilterType] = useState<FileType | "all">("all");
	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
	const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

	const getPresignedUrl = useGetPresignedUrl();

	const { data: filesData, isLoading } = useFiles(tenantId, {
		type: filterType === "all" ? undefined : filterType,
		limit: ITEMS_PER_PAGE,
		all: true,
	});

	const files = filesData?.files || [];

	const handleFilterChange = useCallback((value: string) => {
		setFilterType(value as FileType | "all");
	}, []);

	const handleFileSelect = useCallback(
		async (file: StorageFile) => {
			setLoadingFileId(file.id);
			try {
				const result = await getPresignedUrl.mutateAsync({
					tenantId,
					fileId: file.id,
					expiryMinutes: 60,
				});
				onSelect(file, result.url);
				if (!multiple) {
					setOpen(false);
				} else {
					setSelectedFiles((prev) => {
						const next = new Set(prev);
						if (next.has(file.id)) {
							next.delete(file.id);
						} else if (next.size < maxFiles) {
							next.add(file.id);
						}
						return next;
					});
				}
			} finally {
				setLoadingFileId(null);
			}
		},
		[getPresignedUrl, tenantId, onSelect, multiple, maxFiles]
	);

	const filteredTypes: (FileType | "all")[] = allowedTypes
		? ["all", ...allowedTypes]
		: ["all", "image", "document", "logo", "video"];

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button type="button" variant="ghost" size="icon" className="h-8 w-8">
						<Icon icon={IconDatabase} size="sm" />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>{t.storage.selectFromStorage}</DialogTitle>
				</DialogHeader>

				<Tabs value={filterType} onValueChange={handleFilterChange} className="mb-4">
					<TabsList>
						{filteredTypes.includes("all") && (
							<TabsTrigger value="all" className="gap-2">
								<Icon icon={IconFile} size="sm" />
								{t.storage.filterAll}
							</TabsTrigger>
						)}
						{filteredTypes.includes("image") && (
							<TabsTrigger value="image" className="gap-2">
								<Icon icon={IconPhoto} size="sm" />
								{t.storage.filterImages}
							</TabsTrigger>
						)}
						{filteredTypes.includes("document") && (
							<TabsTrigger value="document" className="gap-2">
								<Icon icon={IconFileText} size="sm" />
								{t.storage.filterDocuments}
							</TabsTrigger>
						)}
						{filteredTypes.includes("logo") && (
							<TabsTrigger value="logo" className="gap-2">
								<Icon icon={IconBrandAbstract} size="sm" />
								{t.storage.filterLogos}
							</TabsTrigger>
						)}
						{filteredTypes.includes("video") && (
							<TabsTrigger value="video" className="gap-2">
								<Icon icon={IconVideo} size="sm" />
								{t.storage.filterVideos}
							</TabsTrigger>
						)}
					</TabsList>
				</Tabs>

				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Icon icon={IconLoader2} size="lg" className="animate-spin text-muted-foreground" />
						</div>
					) : files.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Icon icon={IconFile} size="lg" className="text-muted-foreground mb-2" />
							<TypographyMuted>{t.storage.noFilesInCategory}</TypographyMuted>
						</div>
					) : (
						<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
							{files.map((file) => {
								const isSelected = selectedFiles.has(file.id);
								const isLoading = loadingFileId === file.id;
								const FileIcon = getFileIcon(file);

								return (
									<button
										key={file.id}
										type="button"
										onClick={() => handleFileSelect(file)}
										disabled={isLoading}
										className={cn(
											"relative group aspect-square rounded-lg border-2 overflow-hidden transition-all",
											"hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary",
											isSelected ? "border-primary" : "border-border"
										)}
									>
										{file.contentType.startsWith("image/") ? (
											<Image
												src={file.url}
												alt={file.originalName}
												fill
												className="object-cover"
												sizes="(max-width: 640px) 33vw, 25vw"
											/>
										) : file.contentType.startsWith("video/") ? (
											<div className="w-full h-full bg-muted flex items-center justify-center">
												<Icon icon={IconVideo} size="lg" className="text-muted-foreground" />
											</div>
										) : (
											<div className="w-full h-full bg-muted flex items-center justify-center">
												<Icon icon={FileIcon} size="lg" className="text-muted-foreground" />
											</div>
										)}

										<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
											<p className="text-xs text-white truncate">{file.originalName}</p>
										</div>

										{isLoading && (
											<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
												<Icon icon={IconLoader2} size="md" className="animate-spin text-white" />
											</div>
										)}

										{isSelected && !isLoading && (
											<div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
												<Icon icon={IconCheck} size="sm" className="text-primary-foreground" />
											</div>
										)}
									</button>
								);
							})}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
