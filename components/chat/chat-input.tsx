"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/typography";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	IconSend,
	IconPhoto,
	IconTemplate,
	IconVideo,
	IconPaperclip,
	IconX,
	IconSettings,
	IconUpload,
	IconChevronDown,
	IconDatabase,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "@/providers/i18n-provider";
import { StorageFilePicker } from "@/components/storage/storage-file-picker";
import type { ContentType } from "@/types";
import type { StorageFile } from "@/types/storage";

interface AttachedFile {
	id: string;
	file: File;
	preview?: string;
	fromStorage?: boolean;
	storageFile?: StorageFile;
}

interface ImageSettings {
	aspectRatio: string;
	style: string;
	negativePrompt: string;
}

interface VideoSettings {
	aspectRatio: string;
	style: string;
	duration: string;
}

interface ChatInputProps {
	tenantId: string;
	onSubmit: (
		input: string,
		contentType: ContentType,
		files: AttachedFile[],
		imageSettings: ImageSettings,
		videoSettings: VideoSettings
	) => void;
	disabled?: boolean;
	contentType: ContentType;
	onContentTypeChange: (type: ContentType) => void;
	value?: string;
	onValueChange?: (value: string) => void;
}

const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
	aspectRatio: "1:1",
	style: "realistic",
	negativePrompt: "",
};
const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
	aspectRatio: "16:9",
	style: "cinematic",
	duration: "5",
};

export function ChatInput({
	tenantId,
	onSubmit,
	disabled = false,
	contentType,
	onContentTypeChange,
	value,
	onValueChange,
}: ChatInputProps) {
	const [internalInput, setInternalInput] = useState("");
	
	const input = value ?? internalInput;
	const setInput = (newValue: string) => {
		if (onValueChange) {
			onValueChange(newValue);
		} else {
			setInternalInput(newValue);
		}
	};
	const [imageSettings, setImageSettings] = useState<ImageSettings>(DEFAULT_IMAGE_SETTINGS);
	const [videoSettings, setVideoSettings] = useState<VideoSettings>(DEFAULT_VIDEO_SETTINGS);
	const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const t = useTranslations();

	const handleFileSelect = (files: FileList | null) => {
		if (!files) return;
		const maxFiles = 5;
		const maxSize = 10 * 1024 * 1024;
		const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain", "text/markdown"];

		const newFiles: AttachedFile[] = [];
		for (let i = 0; i < files.length && attachedFiles.length + newFiles.length < maxFiles; i++) {
			const file = files[i];
			if (!allowedTypes.includes(file.type)) continue;
			if (file.size > maxSize) continue;

			const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
			newFiles.push({ id: crypto.randomUUID(), file, preview });
		}
		setAttachedFiles((prev) => [...prev, ...newFiles]);
	};

	const handleRemoveFile = (id: string) => {
		setAttachedFiles((prev) => {
			const file = prev.find((f) => f.id === id);
			if (file?.preview && !file.fromStorage) URL.revokeObjectURL(file.preview);
			return prev.filter((f) => f.id !== id);
		});
	};

	const handleStorageFileSelect = async (storageFile: StorageFile, presignedUrl: string) => {
		if (attachedFiles.length >= 5) return;

		const response = await fetch(presignedUrl);
		const blob = await response.blob();
		const file = new File([blob], storageFile.originalName, { type: storageFile.contentType });

		const preview = storageFile.contentType.startsWith("image/") ? presignedUrl : undefined;

		setAttachedFiles((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				file,
				preview,
				fromStorage: true,
				storageFile,
			},
		]);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		handleFileSelect(e.dataTransfer.files);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || disabled) return;
		onSubmit(input, contentType, attachedFiles, imageSettings, videoSettings);
		setInput("");
		setAttachedFiles([]);
	};

	return (
		<div
			className="p-4 bg-linear-to-t from-background via-background to-transparent"
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<form onSubmit={handleSubmit}>
				<div className="max-w-3xl mx-auto space-y-3">
					<AnimatePresence>
						{attachedFiles.length > 0 && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="flex flex-wrap gap-2"
							>
								{attachedFiles.map((file) => (
									<motion.div
										key={file.id}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
										className="relative group"
									>
										<div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 border border-border/50">
											{file.preview ? (
												<img
													src={file.preview}
													alt={file.file.name}
													className="w-8 h-8 object-cover rounded"
												/>
											) : (
												<div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
													<Icon icon={IconPaperclip} size="sm" className="text-muted-foreground" />
												</div>
											)}
											<span className="text-sm text-foreground max-w-32 truncate">
												{file.file.name}
											</span>
											<button
												type="button"
												onClick={() => handleRemoveFile(file.id)}
												className="text-muted-foreground hover:text-destructive transition-colors"
											>
												<Icon icon={IconX} size="xs" />
											</button>
										</div>
									</motion.div>
								))}
							</motion.div>
						)}
					</AnimatePresence>

					<AnimatePresence>
						{isDragging && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="absolute inset-4 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center z-10"
							>
								<div className="text-center">
									<Icon icon={IconUpload} size="lg" className="text-primary mx-auto mb-2" />
									<p className="text-primary font-medium">{t.chat.attachments.dropzoneActive}</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					<input
						ref={fileInputRef}
						type="file"
						multiple
						accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/markdown,.txt,.md"
						className="hidden"
						onChange={(e) => handleFileSelect(e.target.files)}
					/>

					<div className="bg-muted/50 rounded-2xl border border-border/50 focus-within:border-primary/30 transition-colors overflow-hidden">
						<div className="flex items-center gap-2 px-3 py-2">
							<Input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={t.chat.inputPlaceholder}
								disabled={disabled}
								className="flex-1 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-10 px-1"
							/>
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button
									type="submit"
									disabled={!input.trim() || disabled}
									size="icon"
									className="rounded-full h-9 w-9 shadow-lg shadow-primary/25 disabled:shadow-none"
								>
									<Icon icon={IconSend} size="sm" />
								</Button>
							</motion.div>
						</div>

						<div className="flex items-center gap-1 px-2 py-1.5">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => fileInputRef.current?.click()}
								disabled={disabled || attachedFiles.length >= 5}
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
								title={t.chat.attachments.uploadFromDevice}
							>
								<Icon icon={IconPaperclip} size="sm" />
							</Button>

							<StorageFilePicker
								tenantId={tenantId}
								onSelect={handleStorageFileSelect}
								allowedTypes={["image", "document"]}
								trigger={
									<Button
										type="button"
										variant="ghost"
										size="icon"
										disabled={disabled || attachedFiles.length >= 5}
										className="h-8 w-8 text-muted-foreground hover:text-foreground"
										title={t.storage.selectFromStorage}
									>
										<Icon icon={IconDatabase} size="sm" />
									</Button>
								}
							/>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										disabled={disabled}
										className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1.5"
									>
										<Icon
											icon={
												contentType === "template"
													? IconTemplate
													: contentType === "image"
													? IconPhoto
													: IconVideo
											}
											size="sm"
										/>
										<span className="text-xs">
											{contentType === "template"
												? t.chat.contentType.template
												: contentType === "image"
												? t.chat.contentType.image
												: t.chat.contentType.video}
										</span>
										<Icon icon={IconChevronDown} size="xs" className="opacity-60" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-40 p-1" align="start">
									<div className="flex flex-col">
										<Button
											type="button"
											variant={contentType === "template" ? "secondary" : "ghost"}
											size="sm"
											onClick={() => onContentTypeChange("template")}
											className="justify-start gap-2 h-9"
										>
											<Icon icon={IconTemplate} size="sm" />
											{t.chat.contentType.template}
										</Button>
										<Button
											type="button"
											variant={contentType === "image" ? "secondary" : "ghost"}
											size="sm"
											onClick={() => onContentTypeChange("image")}
											className="justify-start gap-2 h-9"
										>
											<Icon icon={IconPhoto} size="sm" />
											{t.chat.contentType.image}
										</Button>
										<Button
											type="button"
											variant={contentType === "video" ? "secondary" : "ghost"}
											size="sm"
											onClick={() => onContentTypeChange("video")}
											className="justify-start gap-2 h-9"
										>
											<Icon icon={IconVideo} size="sm" />
											{t.chat.contentType.video}
										</Button>
									</div>
								</PopoverContent>
							</Popover>

							{(contentType === "image" || contentType === "video") && (
								<Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
									<PopoverTrigger asChild>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											disabled={disabled}
											className="h-8 w-8 text-muted-foreground hover:text-foreground"
										>
											<Icon icon={IconSettings} size="sm" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-80" align="start">
										{contentType === "image" ? (
											<div className="space-y-4">
												<div className="font-medium text-sm">{t.chat.settings.imageSettings}</div>
												<div className="space-y-2">
													<label className="text-sm text-muted-foreground">
														{t.chat.media.aspectRatio}
													</label>
													<Select
														value={imageSettings.aspectRatio}
														onValueChange={(v) =>
															setImageSettings((p) => ({ ...p, aspectRatio: v }))
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="1:1">
																{t.chat.settings.aspectRatios.square}
															</SelectItem>
															<SelectItem value="16:9">
																{t.chat.settings.aspectRatios.landscape}
															</SelectItem>
															<SelectItem value="9:16">
																{t.chat.settings.aspectRatios.portrait}
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<label className="text-sm text-muted-foreground">
														{t.chat.media.style}
													</label>
													<Select
														value={imageSettings.style}
														onValueChange={(v) => setImageSettings((p) => ({ ...p, style: v }))}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="realistic">
																{t.chat.settings.styles.realistic}
															</SelectItem>
															<SelectItem value="artistic">
																{t.chat.settings.styles.artistic}
															</SelectItem>
															<SelectItem value="cinematic">
																{t.chat.settings.styles.cinematic}
															</SelectItem>
															<SelectItem value="anime">{t.chat.settings.styles.anime}</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<label className="text-sm text-muted-foreground">
														{t.chat.media.negativePrompt}
													</label>
													<Textarea
														value={imageSettings.negativePrompt}
														onChange={(e) =>
															setImageSettings((p) => ({ ...p, negativePrompt: e.target.value }))
														}
														placeholder={t.chat.settings.negativePromptPlaceholder}
														className="min-h-16 resize-none"
													/>
												</div>
											</div>
										) : (
											<div className="space-y-4">
												<div className="font-medium text-sm">{t.chat.settings.videoSettings}</div>
												<div className="space-y-2">
													<label className="text-sm text-muted-foreground">
														{t.chat.media.aspectRatio}
													</label>
													<Select
														value={videoSettings.aspectRatio}
														onValueChange={(v) =>
															setVideoSettings((p) => ({ ...p, aspectRatio: v }))
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="16:9">
																{t.chat.settings.aspectRatios.landscape}
															</SelectItem>
															<SelectItem value="9:16">
																{t.chat.settings.aspectRatios.portrait}
															</SelectItem>
															<SelectItem value="1:1">
																{t.chat.settings.aspectRatios.square}
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<label className="text-sm text-muted-foreground">
														{t.chat.media.style}
													</label>
													<Select
														value={videoSettings.style}
														onValueChange={(v) => setVideoSettings((p) => ({ ...p, style: v }))}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="cinematic">
																{t.chat.settings.styles.cinematic}
															</SelectItem>
															<SelectItem value="realistic">
																{t.chat.settings.styles.realistic}
															</SelectItem>
															<SelectItem value="artistic">
																{t.chat.settings.styles.artistic}
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<label className="text-sm text-muted-foreground">
														{t.chat.media.duration}
													</label>
													<Select
														value={videoSettings.duration}
														onValueChange={(v) => setVideoSettings((p) => ({ ...p, duration: v }))}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="5">{t.chat.settings.durations.short}</SelectItem>
															<SelectItem value="10">{t.chat.settings.durations.medium}</SelectItem>
															<SelectItem value="15">{t.chat.settings.durations.long}</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
										)}
									</PopoverContent>
								</Popover>
							)}

							<div className="flex-1" />

							{attachedFiles.length > 0 && (
								<span className="text-xs text-muted-foreground">{attachedFiles.length}/5</span>
							)}
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
