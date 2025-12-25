"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineEmailPreview } from "@/components/email-preview";
import {
	useCreateTemplate,
	useConversation,
	useCreateConversation,
	useAddMessageToConversation,
} from "@/hooks/use-api";
import { useGenerationJob, useActiveJobs } from "@/hooks/use-jobs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTranslations, useI18n } from "@/providers/i18n-provider";
import { renderBlocksToHtml } from "@/lib/render-blocks";
import { getTenantId } from "@/lib/tenant";
import {
	IconSend,
	IconBookmark,
	IconCreditCard,
	IconLayoutSidebarLeftCollapse,
	IconLayoutSidebarLeftExpand,
	IconMail,
	IconLock,
	IconNews,
	IconShoppingCart,
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
} from "@/types";
import { TypographyH1, TypographyP, TypographyMuted, Icon } from "@/components/typography";
import { BlurFade } from "@/components/ui/blur-fade";
import { ConversationList } from "@/components/chat/conversation-list";
import { UserMessage } from "@/components/chat/user-message";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	type?: "email" | "conversation" | "subscription_error";
	html?: string;
	template?: string;
	subject?: string;
	summary?: string;
	props?: Record<string, unknown>;
	blocks?: Block[];
	tokenUsage?: TokenUsage;
}

export default function ChatPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const workspaceSlug = params.id as string;

	const selectedConversationId = searchParams.get("conversation");

	const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage("chat-sidebar-collapsed", false);

	const [localMessagesState, setLocalMessagesState] = useState<{
		conversationId: string | null;
		messages: Message[];
	}>({ conversationId: null, messages: [] });

	const [input, setInput] = useState("");
	const [currentTemplate, setCurrentTemplate] = useState<CurrentTemplate | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const messageIdCounter = useRef(0);
	const pendingConversationIdRef = useRef<string | null>(null);
	const pendingUserInputRef = useRef<string | null>(null);

	const createTemplate = useCreateTemplate();
	const createConversation = useCreateConversation();
	const addMessage = useAddMessageToConversation();
	const t = useTranslations();
	const { locale } = useI18n();
	const tenantId = getTenantId() || "";

	const setLocalMessagesRef = useRef<
		(updater: Message[] | ((prev: Message[]) => Message[])) => void
	>(() => {});
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
				const assistantMessage: Message = {
					id: (++messageIdCounter.current).toString(),
					role: "assistant",
					content: result.content,
					type: "conversation",
					tokenUsage: convertedTokenUsage,
				};
				setLocalMessagesRef.current((prev) => [...prev, assistantMessage]);

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

				const assistantMessage: Message = {
					id: (++messageIdCounter.current).toString(),
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
				};

				setLocalMessagesRef.current((prev) => [...prev, assistantMessage]);

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
				const errorMessage: Message = {
					id: (++messageIdCounter.current).toString(),
					role: "assistant",
					content: "An unexpected response format was received",
					type: "conversation",
				};
				setLocalMessagesRef.current((prev) => [...prev, errorMessage]);
			}
		},
		[tenantId]
	);

	const handleJobError = useCallback((error: string, errorCode: string | null) => {
		if (errorCode === "INSUFFICIENT_TOKENS" || errorCode === "NO_ACTIVE_SUBSCRIPTION") {
			const errorMessage: Message = {
				id: (++messageIdCounter.current).toString(),
				role: "assistant",
				content: tRef.current.errors.noActiveSubscription,
				type: "subscription_error",
			};
			setLocalMessagesRef.current((prev) => [...prev, errorMessage]);
		} else {
			const errorMessage: Message = {
				id: (++messageIdCounter.current).toString(),
				role: "assistant",
				content: error,
				type: "conversation",
			};
			setLocalMessagesRef.current((prev) => [...prev, errorMessage]);
		}
	}, []);

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

	const localMessages = useMemo(
		() =>
			localMessagesState.conversationId === selectedConversationId
				? localMessagesState.messages
				: [],
		[localMessagesState, selectedConversationId]
	);

	const localMessagesRef = useRef<Message[]>(localMessages);
	useEffect(() => {
		localMessagesRef.current = localMessages;
	}, [localMessages]);

	const setLocalMessages = useCallback(
		(updater: Message[] | ((prev: Message[]) => Message[])) => {
			setLocalMessagesState((prev) => ({
				conversationId: selectedConversationId,
				messages:
					typeof updater === "function"
						? updater(prev.conversationId === selectedConversationId ? prev.messages : [])
						: updater,
			}));
		},
		[selectedConversationId]
	);

	useEffect(() => {
		setLocalMessagesRef.current = setLocalMessages;
	}, [setLocalMessages]);

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
			type: msg.type as "email" | "conversation" | "subscription_error" | undefined,
			html: msg.html || undefined,
			template: msg.template || undefined,
			subject: msg.subject || undefined,
			summary: msg.summary || undefined,
			props: msg.props as Record<string, unknown> | undefined,
			blocks: msg.blocks as Block[] | undefined,
			tokenUsage: msg.tokenUsage as TokenUsage | undefined,
		}));
	}, [conversationData]);

	const messages = useMemo(() => {
		if (localMessages.length === 0) {
			return loadedMessages;
		}

		const loadedContents = new Set(loadedMessages.map((m) => `${m.role}:${m.content}`));

		const newLocalMessages = localMessages.filter(
			(m) => !loadedContents.has(`${m.role}:${m.content}`)
		);

		return [...loadedMessages, ...newLocalMessages];
	}, [loadedMessages, localMessages]);

	const isGeneratingInCurrentConversation = useMemo(() => {
		if (!generationJob.isRunning) return false;

		const { activeConversationId } = generationJob;

		if (activeConversationId) {
			return activeConversationId === selectedConversationId;
		}

		return !selectedConversationId;
	}, [generationJob, selectedConversationId]);

	const prevLoadedMessagesLengthRef = useRef(0);
	const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const currentLocalMessages = localMessagesRef.current;

		if (
			loadedMessages.length > prevLoadedMessagesLengthRef.current &&
			currentLocalMessages.length > 0
		) {
			const loadedContents = new Set(loadedMessages.map((m) => `${m.role}:${m.content}`));

			const hasLocalInLoaded = currentLocalMessages.some((m) =>
				loadedContents.has(`${m.role}:${m.content}`)
			);

			if (hasLocalInLoaded) {
				if (cleanupTimeoutRef.current) {
					clearTimeout(cleanupTimeoutRef.current);
				}

				cleanupTimeoutRef.current = setTimeout(() => {
					const latestLocalMessages = localMessagesRef.current;
					const remaining = latestLocalMessages.filter(
						(m) => !loadedContents.has(`${m.role}:${m.content}`)
					);
					if (remaining.length !== latestLocalMessages.length) {
						setLocalMessages(remaining);
					}
				}, 100);
			}
		}
		prevLoadedMessagesLengthRef.current = loadedMessages.length;

		return () => {
			if (cleanupTimeoutRef.current) {
				clearTimeout(cleanupTimeoutRef.current);
			}
		};
	}, [loadedMessages, setLocalMessages]);

	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isGeneratingInCurrentConversation) return;

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

		const userMessage: Message = {
			id: (++messageIdCounter.current).toString(),
			role: "user",
			content: input,
		};

		setLocalMessages((prev) => [...prev, userMessage]);
		const userInput = input;
		setInput("");

		pendingConversationIdRef.current = conversationId;
		pendingUserInputRef.current = userInput;

		try {
			await addMessage.mutateAsync({
				tenantId,
				conversationId,
				message: { role: "user", content: userInput },
			});
		} catch (error) {
			console.error("Failed to save user message:", error);
		}

		try {
			if (currentTemplate) {
				await generationJob.startRefine({
					tenantId,
					task: userInput,
					existingTemplate: currentTemplate.template,
					existingProps: currentTemplate.props || {},
					existingBlocks: currentTemplate.blocks as Record<string, unknown>[] | undefined,
					conversationId,
					language: locale === "ru" ? "ru-RU" : "en-US",
				});
			} else {
				await generationJob.startGenerate({
					tenantId,
					task: userInput,
					language: locale === "ru" ? "ru-RU" : "en-US",
					conversationId,
				});
			}
		} catch (error) {
			const errorMessage: Message = {
				id: (++messageIdCounter.current).toString(),
				role: "assistant",
				content: error instanceof Error ? error.message : "Failed to start generation",
				type: "conversation",
			};
			setLocalMessages((prev) => [...prev, errorMessage]);
		}
	};

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
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
										<button
											onClick={() => setInput(t.chat.examples.welcome)}
											className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all text-left group"
										>
											<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
												<Icon icon={IconMail} size="md" className="text-primary" />
											</div>
											<span className="text-sm font-medium">{t.chat.examples.welcome}</span>
										</button>
										<button
											onClick={() => setInput(t.chat.examples.passwordReset)}
											className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all text-left group"
										>
											<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
												<Icon icon={IconLock} size="md" className="text-primary" />
											</div>
											<span className="text-sm font-medium">{t.chat.examples.passwordReset}</span>
										</button>
										<button
											onClick={() => setInput(t.chat.examples.newsletter)}
											className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all text-left group"
										>
											<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
												<Icon icon={IconNews} size="md" className="text-primary" />
											</div>
											<span className="text-sm font-medium">{t.chat.examples.newsletter}</span>
										</button>
										<button
											onClick={() => setInput(t.chat.examples.orderConfirmation)}
											className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all text-left group"
										>
											<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
												<Icon icon={IconShoppingCart} size="md" className="text-primary" />
											</div>
											<span className="text-sm font-medium">
												{t.chat.examples.orderConfirmation}
											</span>
										</button>
									</div>
								</BlurFade>
							</div>
						) : null}

						<AnimatePresence mode="popLayout">
							{messages.map((message, index) => (
								<motion.div
									key={`${message.role}:${message.content.slice(0, 50)}`}
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
											<UserMessage content={message.content} />
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

				<div className="p-4 bg-linear-to-t from-background via-background to-transparent">
					<form onSubmit={handleSubmit}>
						<div className="max-w-3xl mx-auto">
							<div className="relative group">
								<div className="absolute -inset-0.5 bg-linear-to-r from-primary/50 via-primary/30 to-primary/50 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-500" />
								<div className="relative flex gap-2 bg-background rounded-xl p-1.5 border border-border/50 group-focus-within:border-primary/30 transition-colors">
									<Input
										value={input}
										onChange={(e) => setInput(e.target.value)}
										placeholder={t.chat.inputPlaceholder}
										disabled={isGeneratingInCurrentConversation}
										className="flex-1 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
									/>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Button
											type="submit"
											disabled={!input.trim() || isGeneratingInCurrentConversation}
											className="rounded-lg px-4 shadow-lg shadow-primary/25 disabled:shadow-none"
										>
											<motion.div
												animate={input.trim() ? { x: [0, 2, 0] } : {}}
												transition={{
													repeat: Infinity,
													duration: 1.5,
													ease: "easeInOut",
												}}
											>
												<Icon icon={IconSend} size="sm" />
											</motion.div>
										</Button>
									</motion.div>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
