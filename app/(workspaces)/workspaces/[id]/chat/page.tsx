"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { InlineEmailPreview } from "@/components/email-preview";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSuggestions } from "@/components/chat/chat-suggestions";
import {
	useCreateTemplate,
	useConversation,
	useCreateConversation,
	useAddMessageToConversation,
} from "@/hooks/use-api";
import { useUploadFromUrl } from "@/hooks/use-storage";
import { useUploadFile, useGetPresignedUrl } from "@/hooks/use-storage";
import { useGenerationJob, useActiveJobs, JobsApiError } from "@/hooks/use-jobs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTranslations, useI18n } from "@/providers/i18n-provider";
import { renderBlocksToHtml } from "@/lib/render-blocks";
import { getTenantId } from "@/lib/tenant";
import {
	IconBookmark,
	IconCreditCard,
	IconLayoutSidebarLeftCollapse,
	IconLayoutSidebarLeftExpand,
	IconPhoto,
	IconVideo,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type {
	Block,
	TokenUsage,
	CurrentTemplate,
	ConversationMessage,
	GenerationResult,
	JobTokenUsage,
	ContentType,
	ImageContent,
	VideoContent,
	ImageJobSettings,
	VideoJobSettings,
	Attachment,
} from "@/types";
import type { StorageFile } from "@/types/storage";
import { TypographyH1, TypographyP, TypographyMuted, Icon } from "@/components/typography";
import { BlurFade } from "@/components/ui/blur-fade";
import { ConversationList } from "@/components/chat/conversation-list";
import { UserMessage } from "@/components/chat/user-message";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	type?: "email" | "conversation" | "subscription_error" | "image" | "video";
	html?: string;
	template?: string;
	subject?: string;
	summary?: string;
	props?: Record<string, unknown>;
	blocks?: Block[];
	tokenUsage?: TokenUsage;
	imageContent?: ImageContent;
	videoContent?: VideoContent;
	attachments?: Attachment[];
}

interface AttachedFile {
	id: string;
	file: File;
	preview?: string;
	fromStorage?: boolean;
	storageFile?: StorageFile;
}

export default function ChatPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const workspaceSlug = params.id as string;

	const selectedConversationId = searchParams.get("conversation");

	const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage("chat-sidebar-collapsed", false);

	const [input, setInput] = useState("");
	const [contentType, setContentType] = useState<ContentType>("template");
	const [currentTemplate, setCurrentTemplate] = useState<CurrentTemplate | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const pendingConversationIdRef = useRef<string | null>(null);

	const createTemplate = useCreateTemplate();
	const createConversation = useCreateConversation();
	const addMessage = useAddMessageToConversation();
	const uploadFromUrl = useUploadFromUrl();
	const uploadFile = useUploadFile();
	const getPresignedUrl = useGetPresignedUrl();
	const t = useTranslations();
	const { locale } = useI18n();
	const tenantId = getTenantId() || "";

	const addMessageRef = useRef<typeof addMessage>(addMessage);
	const tRef = useRef(t);

	const handleJobComplete = useCallback(
		async (result: GenerationResult, html: string | null, tokenUsage: JobTokenUsage | null) => {
			const conversationId = pendingConversationIdRef.current;
			const currentTenantId = tenantId;

			const convertedTokenUsage: TokenUsage | undefined = tokenUsage
				? {
						promptTokens: tokenUsage.inputTokens,
						completionTokens: tokenUsage.outputTokens,
						totalTokens: tokenUsage.totalTokens,
				  }
				: undefined;

		if (result.type === "conversation" && result.content) {
			if (conversationId) {
				try {
					await addMessageRef.current.mutateAsync({
						tenantId: currentTenantId,
						conversationId,
						message: {
							role: "assistant",
							content: result.content,
							type: "conversation",
							tokenUsage: convertedTokenUsage,
						},
					});
				} catch (error) {
					console.error("Failed to save assistant message:", error);
				}
			}
		} else if (result.type === "image") {
			const imageContent = result.imageContent;
			const summary = imageContent?.summary || tRef.current.chat.media.imageGenerated;

			if (conversationId) {
				try {
					await addMessageRef.current.mutateAsync({
						tenantId: currentTenantId,
						conversationId,
						message: {
							role: "assistant",
							content: summary,
							type: "image",
							imageContent,
							tokenUsage: convertedTokenUsage,
						},
					});
				} catch (error) {
					console.error("Failed to save image message:", error);
				}
			}
		} else if (result.type === "video") {
			const videoContent = result.videoContent;
			const summary = videoContent?.summary || tRef.current.chat.media.videoGenerated;

			if (conversationId) {
				try {
					await addMessageRef.current.mutateAsync({
						tenantId: currentTenantId,
						conversationId,
						message: {
							role: "assistant",
							content: summary,
							type: "video",
							videoContent,
							tokenUsage: convertedTokenUsage,
						},
					});
				} catch (error) {
					console.error("Failed to save video message:", error);
				}
			}
		} else if (result.template) {
			let finalHtml = html || result.html;
			let blocks: Block[] = [];

			if (result.template === "media_digest" && result.blocks && Array.isArray(result.blocks)) {
				blocks = result.blocks as unknown as Block[];
			}

			if (!finalHtml && blocks.length > 0) {
				finalHtml = renderBlocksToHtml(blocks);
			}

			if (!finalHtml) {
				finalHtml = `<html><body><h1>${result.subject}</h1><p>Template type: ${result.template}</p></body></html>`;
			}

			const summary =
				result.summary ||
				tRef.current.chat.emailGenerated.replace("{subject}", result.subject || "");

			setCurrentTemplate({
				template: result.template,
				subject: result.subject || "",
				props: result.props || {},
				blocks,
			});

			if (conversationId) {
				try {
					await addMessageRef.current.mutateAsync({
						tenantId: currentTenantId,
						conversationId,
						message: {
							role: "assistant",
							content: summary,
							type: "email",
							html: finalHtml,
							template: result.template,
							subject: result.subject,
							summary: result.summary,
							props: result.props,
							blocks,
							tokenUsage: convertedTokenUsage,
						},
					});
				} catch (error) {
					console.error("Failed to save email message:", error);
				}
			}
		} else {
			if (conversationId) {
				try {
					await addMessageRef.current.mutateAsync({
						tenantId: currentTenantId,
						conversationId,
						message: {
							role: "assistant",
							content: "An unexpected response format was received",
							type: "conversation",
						},
					});
				} catch (error) {
					console.error("Failed to save error message:", error);
				}
			}
		}
		},
		[tenantId]
	);

	const handleJobError = useCallback(
		async (error: string, errorCode: string | null) => {
			const conversationId = pendingConversationIdRef.current;
			const currentTenantId = tenantId;

		if (errorCode === "INSUFFICIENT_TOKENS" || errorCode === "NO_ACTIVE_SUBSCRIPTION") {
			if (conversationId) {
				try {
					await addMessageRef.current.mutateAsync({
						tenantId: currentTenantId,
						conversationId,
						message: {
							role: "assistant",
							content: tRef.current.errors.noActiveSubscription,
							type: "subscription_error",
						},
					});
				} catch (saveError) {
					console.error("Failed to save error message:", saveError);
				}
			}
		} else {
			if (conversationId) {
				try {
					await addMessageRef.current.mutateAsync({
						tenantId: currentTenantId,
						conversationId,
						message: {
							role: "assistant",
							content: error,
							type: "conversation",
						},
					});
				} catch (saveError) {
					console.error("Failed to save error message:", saveError);
				}
			}
		}
		},
		[tenantId]
	);

	const generationJob = useGenerationJob({
		onComplete: handleJobComplete,
		onError: handleJobError,
	});

	const { data: activeJobs } = useActiveJobs(tenantId, {
		enabled: !generationJob.isRunning,
	});

	const hasReconnected = useRef(false);
	useEffect(() => {
		if (
			activeJobs &&
			activeJobs.length > 0 &&
			!hasReconnected.current &&
			!generationJob.isRunning
		) {
			const activeJob = selectedConversationId
				? activeJobs.find((job) => {
						return (
							job.status === "pending" || job.status === "processing" || job.status === "streaming"
						);
				  })
				: activeJobs[0];

			if (activeJob) {
				hasReconnected.current = true;
				generationJob.reconnectToJob(activeJob);
			}
		}
	}, [activeJobs, selectedConversationId, generationJob]);

	useEffect(() => {
		hasReconnected.current = false;
	}, [selectedConversationId]);

	useEffect(() => {
		addMessageRef.current = addMessage;
	}, [addMessage]);

	useEffect(() => {
		tRef.current = t;
	}, [t]);

	const handleSelectConversation = (id: string | null) => {
		setCurrentTemplate(null);
		if (id) {
			router.push(`/workspaces/${workspaceSlug}/chat?conversation=${id}`, { scroll: false });
		} else {
			router.push(`/workspaces/${workspaceSlug}/chat`, { scroll: false });
		}
	};

	const { data: conversationData } = useConversation(tenantId, selectedConversationId);

	const loadedMessages = useMemo<Message[]>(() => {
		if (!conversationData?.conversation?.messages) {
			return [];
		}
		return conversationData.conversation.messages.map((msg: ConversationMessage) => ({
			id: msg.id,
			role: msg.role as "user" | "assistant",
			content: msg.content,
			type: msg.type as
				| "email"
				| "conversation"
				| "subscription_error"
				| "image"
				| "video"
				| undefined,
			html: msg.html || undefined,
			template: msg.template || undefined,
			subject: msg.subject || undefined,
			summary: msg.summary || undefined,
			props: msg.props as Record<string, unknown> | undefined,
			blocks: msg.blocks as Block[] | undefined,
			tokenUsage: msg.tokenUsage as TokenUsage | undefined,
			imageContent: msg.imageContent as ImageContent | undefined,
			videoContent: msg.videoContent as VideoContent | undefined,
		attachments: msg.attachments as Attachment[] | undefined,
	}));
}, [conversationData]);

const messages = loadedMessages;

const isGeneratingInCurrentConversation = useMemo(() => {
		if (!generationJob.isRunning) return false;

		const { activeConversationId } = generationJob;

		if (activeConversationId) {
			return activeConversationId === selectedConversationId;
		}

	return !selectedConversationId;
}, [generationJob, selectedConversationId]);

useEffect(() => {
	if (scrollContainerRef.current) {
		scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
	}
}, [messages]);

const handleSaveTemplate = async (message: Message) => {
		if (!message.template || !message.subject) return;

		if (!tenantId) {
			toast.error("No tenant selected");
			return;
		}

		try {
			const result = await createTemplate.mutateAsync({
				tenantId,
				name: message.subject,
				subject: message.subject,
				template: message.template,
				props: message.props || {},
				blocks: message.blocks || [],
			});

			toast.success(t.templates.templateSaved.replace("{name}", result.template.name));
			router.push(`/workspaces/${workspaceSlug}/templates/${result.template.id}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "An error occurred");
		}
	};

	const handleSaveMediaToStorage = async (
		mediaUrl: string,
		prompt: string,
		mediaType: "image" | "video"
	) => {
		if (!tenantId) {
			toast.error("No tenant selected");
			return;
		}

		if (!mediaUrl) {
			toast.error(t.storage.saveToStorageFailed);
			return;
		}

		const sanitizedPrompt = prompt
			.slice(0, 50)
			.replace(/[^a-zA-Z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.toLowerCase();
		const timestamp = Date.now();
		const extension = mediaType === "image" ? "png" : "mp4";
		const fileName = `${sanitizedPrompt || mediaType}-${timestamp}.${extension}`;

		try {
			await uploadFromUrl.mutateAsync({
				tenantId,
				url: mediaUrl,
				fileName,
				fileType: mediaType,
			});
			toast.success(t.storage.savedToStorage);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t.storage.saveToStorageFailed);
		}
	};

	const handleChatInputSubmit = async (
		inputText: string,
		type: ContentType,
		files: AttachedFile[],
		imageSettings: ImageJobSettings,
		videoSettings: VideoJobSettings
	) => {
		if (!inputText.trim() || isGeneratingInCurrentConversation) return;

		if (!tenantId) {
			toast.error("No tenant selected");
			return;
		}

		let conversationId = selectedConversationId;
		if (!conversationId) {
			try {
				const newConversation = await createConversation.mutateAsync({
					tenantId,
				});
				conversationId = newConversation.conversation.id;
				handleSelectConversation(conversationId);
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Failed to create conversation");
				return;
			}
		}

		let attachments: Attachment[] = [];
		if (files.length > 0) {
			try {
				attachments = await Promise.all(
					files.map(async (attachedFile) => {
						if (attachedFile.fromStorage && attachedFile.storageFile) {
							const presignedUrlResult = await getPresignedUrl.mutateAsync({
								tenantId,
								fileId: attachedFile.storageFile.id,
								expiryMinutes: 60,
							});
							return {
								type: attachedFile.storageFile.contentType.startsWith("image/")
									? "image"
									: "document",
								url: presignedUrlResult.url,
								name: attachedFile.storageFile.originalName,
								contentType: attachedFile.storageFile.contentType,
							} as Attachment;
						}

						const fileType = attachedFile.file.type.startsWith("image/")
							? "image"
							: attachedFile.file.type.startsWith("video/")
							? "video"
							: "document";
						const uploadResult = await uploadFile.mutateAsync({
							tenantId,
							file: attachedFile.file,
							fileType,
						});
						const presignedUrlResult = await getPresignedUrl.mutateAsync({
							tenantId,
							fileId: uploadResult.file.id,
							expiryMinutes: 60,
						});
						return {
							type: uploadResult.file.contentType.startsWith("image/") ? "image" : "document",
							url: presignedUrlResult.url,
							name: uploadResult.file.originalName,
							contentType: uploadResult.file.contentType,
						} as Attachment;
					})
				);
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Failed to upload files");
				return;
			}
		}

		pendingConversationIdRef.current = conversationId;

		try {
			await addMessage.mutateAsync({
				tenantId,
				conversationId,
				message: {
					role: "user",
					content: inputText,
					attachments: attachments.length > 0 ? attachments : undefined,
				},
			});
		} catch (error) {
			console.error("Failed to save user message:", error);
			return;
		}

		try {
			if (currentTemplate && type === "template") {
				await generationJob.startRefine({
					tenantId,
					task: inputText,
					existingTemplate: currentTemplate.template,
					existingProps: currentTemplate.props || {},
					existingBlocks: currentTemplate.blocks as Record<string, unknown>[] | undefined,
					conversationId,
					language: locale === "ru" ? "ru-RU" : "en-US",
					attachments: attachments.length > 0 ? attachments : undefined,
				});
			} else {
				await generationJob.startGenerate({
					tenantId,
					task: inputText,
					contentType: type,
					conversationId,
					language: locale === "ru" ? "ru-RU" : "en-US",
					imageSettings: type === "image" ? imageSettings : undefined,
					videoSettings: type === "video" ? videoSettings : undefined,
					attachments: attachments.length > 0 ? attachments : undefined,
				});
			}
		} catch (error) {
			if (error instanceof JobsApiError && error.code === "NO_ACTIVE_SUBSCRIPTION") {
				try {
					await addMessage.mutateAsync({
						tenantId,
						conversationId,
						message: {
							role: "assistant",
							type: "subscription_error",
							content: t.errors.noActiveSubscription,
						},
					});
				} catch (saveError) {
					console.error("Failed to save error message:", saveError);
				}
			} else {
				try {
					await addMessage.mutateAsync({
						tenantId,
						conversationId,
						message: {
							role: "assistant",
							content: error instanceof Error ? error.message : "An error occurred",
							type: "conversation",
						},
					});
				} catch (saveError) {
					console.error("Failed to save error message:", saveError);
				}
			}
		}
	};

	return (
		<div className="flex h-full overflow-hidden">
			<div
				className={cn(
					"shrink-0 hidden md:block transition-all duration-300 ease-in-out",
					sidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
				)}
			>
				<ConversationList
					selectedConversationId={selectedConversationId}
					onSelectConversation={handleSelectConversation}
				/>
			</div>

			<div className="flex-1 flex flex-col overflow-hidden">
				<div className="absolute flex items-center gap-2 p-2 border-b border-border/50 md:border-b-0">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 hidden md:flex"
						onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
						title={sidebarCollapsed ? t.chat.showConversations : t.chat.hideConversations}
					>
						{sidebarCollapsed ? (
							<Icon icon={IconLayoutSidebarLeftExpand} size="sm" />
						) : (
							<Icon icon={IconLayoutSidebarLeftCollapse} size="sm" />
						)}
					</Button>
				</div>

				<div ref={scrollContainerRef} className="flex-1 p-4 overflow-auto">
					<div className="max-w-3xl mx-auto space-y-4 min-h-full flex flex-col">
						{messages.length === 0 ? (
							<div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center">
								<BlurFade delay={0.1}>
									<motion.div
										className="relative mb-8"
										animate={{
											y: [0, -8, 0],
										}}
										transition={{
											duration: 3,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									>
										<div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-150" />
										<Image src="/logo.svg" alt="Creafly" width={40} height={40} />
									</motion.div>
								</BlurFade>
								<BlurFade delay={0.2}>
									<TypographyH1 className="mb-3 text-3xl md:text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
										{t.chat.startConversation}
									</TypographyH1>
								</BlurFade>
								<BlurFade delay={0.3}>
									<TypographyP className="text-muted-foreground max-w-lg mx-auto mb-10 text-base md:text-lg">
										{t.chat.startDescription}
									</TypographyP>
								</BlurFade>
								<BlurFade delay={0.4}>
									<TypographyMuted className="mb-4">{t.chat.tryAsking}</TypographyMuted>
									<ChatSuggestions contentType={contentType} onSelect={setInput} />
								</BlurFade>
							</div>
						) : null}

						<AnimatePresence mode="popLayout">
							{messages.map((message, index) => (
								<motion.div
									key={message.id}
									initial={{ opacity: 0, y: 20, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -10, scale: 0.95 }}
									transition={{
										duration: 0.3,
										ease: [0.21, 0.47, 0.32, 0.98],
										delay: index === messages.length - 1 ? 0 : 0,
									}}
									className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-[85%] ${
											message.role === "user"
												? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2 shadow-lg shadow-primary/20"
												: "space-y-4"
										}`}
									>
										{message.role === "user" ? (
											<UserMessage content={message.content} attachments={message.attachments} />
										) : message.type === "subscription_error" ? (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ duration: 0.5 }}
												className="relative"
											>
												<div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
													<div className="flex items-start gap-3">
														<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/20 shrink-0">
															<Icon icon={IconCreditCard} size="md" className="text-warning" />
														</div>
														<div className="space-y-3">
															<TypographyP className="text-foreground leading-relaxed mt-0">
																{message.content}
															</TypographyP>
															<Button asChild size="sm" variant="default">
																<Link href={`/workspaces/${workspaceSlug}/subscription`}>
																	<Icon icon={IconCreditCard} size="sm" className="mr-1.5" />
																	{t.errors.noActiveSubscriptionLink}
																</Link>
															</Button>
														</div>
													</div>
												</div>
											</motion.div>
										) : (
											<>
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ duration: 0.5 }}
													className="relative"
												>
													<TypographyP className="text-foreground leading-relaxed mt-0">
														{message.content}
													</TypographyP>
													{message.tokenUsage && (
														<TypographyMuted className="text-xs mt-2">
															{message.tokenUsage.totalTokens} tokens
														</TypographyMuted>
													)}
												</motion.div>

												{message.html && (
													<motion.div
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ duration: 0.3, delay: 0.2 }}
													>
														<InlineEmailPreview
															html={message.html}
															subject={message.subject}
															headerContent={
																<Button
																	size="sm"
																	onClick={() => handleSaveTemplate(message)}
																	disabled={createTemplate.isPending}
																	className="shadow-lg shadow-primary/20"
																>
																	<Icon icon={IconBookmark} size="sm" className="mr-1.5" />
																	{createTemplate.isPending ? t.common.saving : t.chat.saveAndEdit}
																</Button>
															}
														/>
													</motion.div>
												)}

												{message.imageContent &&
													(message.imageContent.prompt || message.imageContent.imageUrl) && (
														<motion.div
															initial={{ opacity: 0, y: 10 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ duration: 0.3, delay: 0.2 }}
															className="mt-3"
														>
															<div className="bg-card border border-border rounded-xl p-4 space-y-3">
																<div className="flex items-center justify-between">
																	<div className="flex items-center gap-2">
																		<Icon icon={IconPhoto} size="sm" className="text-primary" />
																		<span className="font-medium text-sm">
																			{t.chat.contentType.image}
																		</span>
																	</div>
																	<Button
																		size="sm"
																		variant="outline"
																		disabled={uploadFromUrl.isPending || !message.imageContent?.imageUrl}
																		onClick={() =>
																			handleSaveMediaToStorage(
																				message.imageContent!.imageUrl!,
																				message.imageContent!.prompt,
																				"image"
																			)
																		}
																	>
																		<Icon icon={IconBookmark} size="sm" className="mr-1.5" />
																		{uploadFromUrl.isPending ? t.common.saving : t.chat.media.saveMedia}
																	</Button>
																</div>

																<div className="space-y-2">
																	<div>
																		<TypographyMuted className="text-xs uppercase tracking-wide mb-1">
																			{t.chat.media.prompt}
																		</TypographyMuted>
																		<TypographyP className="text-sm bg-muted/50 rounded-lg p-3 mt-0">
																			{message.imageContent.prompt}
																		</TypographyP>
																	</div>

																	{message.imageContent.negativePrompt && (
																		<div>
																			<TypographyMuted className="text-xs uppercase tracking-wide mb-1">
																				{t.chat.media.negativePrompt}
																			</TypographyMuted>
																			<TypographyP className="text-sm bg-muted/50 rounded-lg p-3 mt-0 text-muted-foreground">
																				{message.imageContent.negativePrompt}
																			</TypographyP>
																		</div>
																	)}

																	<div className="flex flex-wrap gap-3 text-xs">
																		{message.imageContent.aspectRatio && (
																			<div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-1">
																				<span className="text-muted-foreground">
																					{t.chat.media.aspectRatio}:
																				</span>
																				<span className="font-medium">
																					{message.imageContent.aspectRatio}
																				</span>
																			</div>
																		)}
																		{message.imageContent.style && (
																			<div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-1">
																				<span className="text-muted-foreground">
																					{t.chat.media.style}:
																				</span>
																				<span className="font-medium">
																					{message.imageContent.style}
																				</span>
																			</div>
																		)}
																	</div>
																</div>
															</div>
														</motion.div>
													)}

												{message.videoContent && (
													<motion.div
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ duration: 0.3, delay: 0.2 }}
														className="mt-3"
													>
														<div className="bg-card border border-border rounded-xl p-4 space-y-3">
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-2">
																	<Icon icon={IconVideo} size="sm" className="text-primary" />
																	<span className="font-medium text-sm">
																		{t.chat.contentType.video}
																	</span>
																</div>
																<Button
																	size="sm"
																	variant="outline"
																	disabled={uploadFromUrl.isPending || !message.videoContent?.videoUrl}
																	onClick={() =>
																		handleSaveMediaToStorage(
																			message.videoContent!.videoUrl!,
																			message.videoContent!.prompt,
																			"video"
																		)
																	}
																>
																	<Icon icon={IconBookmark} size="sm" className="mr-1.5" />
																	{uploadFromUrl.isPending ? t.common.saving : t.chat.media.saveMedia}
																</Button>
															</div>

															{message.videoContent.videoUrl && (
																<div className="rounded-lg overflow-hidden bg-muted/30">
																	<video
																		src={message.videoContent.videoUrl}
																		controls
																		className="w-full max-h-80 object-contain"
																		poster={message.videoContent.thumbnailUrl}
																	/>
																</div>
															)}

															<div className="space-y-2">
																<div>
																	<TypographyMuted className="text-xs uppercase tracking-wide mb-1">
																		{t.chat.media.prompt}
																	</TypographyMuted>
																	<TypographyP className="text-sm bg-muted/50 rounded-lg p-3 mt-0">
																		{message.videoContent.prompt}
																	</TypographyP>
																</div>

																<div className="flex flex-wrap gap-3 text-xs">
																	{message.videoContent.aspectRatio && (
																		<div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-1">
																			<span className="text-muted-foreground">
																				{t.chat.media.aspectRatio}:
																			</span>
																			<span className="font-medium">
																				{message.videoContent.aspectRatio}
																			</span>
																		</div>
																	)}
																	{message.videoContent.durationSeconds && (
																		<div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-1">
																			<span className="text-muted-foreground">
																				{t.chat.media.duration}:
																			</span>
																			<span className="font-medium">
																				{message.videoContent.durationSeconds}s
																			</span>
																		</div>
																	)}
																	{message.videoContent.style && (
																		<div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-1">
																			<span className="text-muted-foreground">
																				{t.chat.media.style}:
																			</span>
																			<span className="font-medium">
																				{message.videoContent.style}
																			</span>
																		</div>
																	)}
																</div>
															</div>
														</div>
													</motion.div>
												)}
											</>
										)}
									</div>
								</motion.div>
							))}
						</AnimatePresence>

						{isGeneratingInCurrentConversation && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex justify-start items-center gap-2"
							>
								<motion.span
									className="text-base font-medium text-muted-foreground"
									animate={{
										opacity: [0.4, 1, 0.4],
									}}
									transition={{
										duration: 1.5,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								>
									{generationJob.progressMessage || t.chat.generating}
								</motion.span>
							</motion.div>
						)}
					</div>
				</div>

				<ChatInput
					tenantId={tenantId}
					onSubmit={handleChatInputSubmit}
					disabled={isGeneratingInCurrentConversation}
					contentType={contentType}
					onContentTypeChange={setContentType}
					value={input}
					onValueChange={setInput}
				/>
			</div>
		</div>
	);
}
