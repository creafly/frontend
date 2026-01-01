"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineEmailPreview } from "@/components/email-preview";
import { useEmailJson, useCreateTemplate } from "@/hooks/use-api";
import { useTranslations, useI18n } from "@/providers/i18n-provider";
import { renderBlocksToHtml } from "@/lib/render-blocks";
import { getTenantId } from "@/lib/tenant";
import { ApiError } from "@/lib/api/client";
import { IconSend, IconBookmark, IconSparkles, IconCreditCard } from "@tabler/icons-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import type { Block, TokenUsage, CurrentTemplate } from "@/types";
import { TypographyH2, TypographyP } from "@/components/typography";
import { BlurFade } from "@/components/ui/blur-fade";

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
	const workspaceSlug = params.id as string;
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [currentTemplate, setCurrentTemplate] = useState<CurrentTemplate | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const messageIdCounter = useRef(0);

	const emailJson = useEmailJson();
	const createTemplate = useCreateTemplate();
	const t = useTranslations();
	const { locale } = useI18n();

	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || emailJson.isPending) return;

		const tenantId = getTenantId();
		if (!tenantId) {
			toast.error("No tenant selected");
			return;
		}

		const userMessage: Message = {
			id: (++messageIdCounter.current).toString(),
			role: "user",
			content: input,
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");

		try {
			const result = await emailJson.mutateAsync({
				task: input,
				tenantId,
				locale: locale === "ru" ? "ru-RU" : "en-US",
				...(currentTemplate && { currentTemplate }),
			});

			if (result.type === "conversation" && result.message) {
				const assistantMessage: Message = {
					id: (++messageIdCounter.current).toString(),
					role: "assistant",
					content: result.message,
					type: "conversation",
					tokenUsage: result.tokenUsage,
				};
				setMessages((prev) => [...prev, assistantMessage]);
			} else if (result.output) {
				let html = result.html;
				let blocks: Block[] = [];

				if (
					result.output.template === "media_digest" &&
					result.output.props?.blocks &&
					Array.isArray(result.output.props.blocks)
				) {
					blocks = result.output.props.blocks as Block[];
				}

				if (!html && blocks.length > 0) {
					html = renderBlocksToHtml(blocks);
				}

				if (!html) {
					html = `<html><body><h1>${result.output.subject}</h1><p>Template type: ${result.output.template}</p></body></html>`;
				}

				const summary =
					result.output.summary ||
					t.chat.emailGenerated.replace("{subject}", result.output.subject);

				setCurrentTemplate({
					template: result.output.template,
					subject: result.output.subject,
					props: result.output.props,
					blocks,
				});

				const assistantMessage: Message = {
					id: (++messageIdCounter.current).toString(),
					role: "assistant",
					content: summary,
					type: "email",
					html,
					template: result.output.template,
					subject: result.output.subject,
					summary: result.output.summary,
					props: result.output.props,
					blocks,
					tokenUsage: result.tokenUsage,
				};

				setMessages((prev) => [...prev, assistantMessage]);
			} else {
				const errorMessage: Message = {
					id: (++messageIdCounter.current).toString(),
					role: "assistant",
					content: "An unexpected response format was received",
					type: "conversation",
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
		} catch (error) {
			if (error instanceof ApiError && error.code === "NO_ACTIVE_SUBSCRIPTION") {
				const errorMessage: Message = {
					id: (++messageIdCounter.current).toString(),
					role: "assistant",
					content: t.errors.noActiveSubscription,
					type: "subscription_error",
				};
				setMessages((prev) => [...prev, errorMessage]);
			} else {
				const errorMessage: Message = {
					id: (++messageIdCounter.current).toString(),
					role: "assistant",
					content: error instanceof Error ? error.message : "An error occurred",
					type: "conversation",
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
		}
	};

	const handleSaveTemplate = async (message: Message) => {
		if (!message.template || !message.subject) return;

		const tenantId = getTenantId();
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
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "An error occurred");
		}
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 flex flex-col overflow-hidden">
				<div ref={scrollContainerRef} className="flex-1 p-4 overflow-auto">
					<div className="max-w-3xl mx-auto space-y-4">
						{messages.length === 0 && (
							<div className="text-center py-16">
								<BlurFade delay={0.1}>
									<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 mb-6">
										<IconSparkles className="size-8 text-primary" />
									</div>
								</BlurFade>
								<BlurFade delay={0.2}>
									<TypographyH2 className="mb-2">{t.chat.startConversation}</TypographyH2>
								</BlurFade>
								<BlurFade delay={0.3}>
									<TypographyP className="text-muted-foreground max-w-md mx-auto mb-8">
										{t.chat.startDescription}
									</TypographyP>
								</BlurFade>
								<BlurFade delay={0.4}>
									<div className="flex flex-wrap gap-2 justify-center">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setInput(t.chat.examples.welcome)}
											className="transition-all hover:border-primary/50 hover:bg-primary/5"
										>
											{t.chat.examples.welcome}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setInput(t.chat.examples.passwordReset)}
											className="transition-all hover:border-primary/50 hover:bg-primary/5"
										>
											{t.chat.examples.passwordReset}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setInput(t.chat.examples.newsletter)}
											className="transition-all hover:border-primary/50 hover:bg-primary/5"
										>
											{t.chat.examples.newsletter}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setInput(t.chat.examples.orderConfirmation)}
											className="transition-all hover:border-primary/50 hover:bg-primary/5"
										>
											{t.chat.examples.orderConfirmation}
										</Button>
									</div>
								</BlurFade>
							</div>
						)}

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
											<p>{message.content}</p>
										) : message.type === "subscription_error" ? (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ duration: 0.5 }}
												className="relative"
											>
												<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
													<div className="flex items-start gap-3">
														<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/20 shrink-0">
															<IconCreditCard className="size-5 text-amber-600 dark:text-amber-400" />
														</div>
														<div className="space-y-3">
															<p className="text-foreground leading-relaxed">{message.content}</p>
															<Button asChild size="sm" variant="default">
																<Link href={`/workspaces/${workspaceSlug}/subscription`}>
																	<IconCreditCard className="size-4 mr-1.5" />
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
													<p className="text-foreground leading-relaxed">{message.content}</p>
													{message.tokenUsage && (
														<p className="text-xs text-muted-foreground mt-2">
															{message.tokenUsage.totalTokens} tokens
														</p>
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
																	<IconBookmark className="size-4 mr-1.5" />
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

						{emailJson.isPending && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex justify-start"
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
									{t.chat.generating}
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
										disabled={emailJson.isPending}
										className="flex-1 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
									/>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Button
											type="submit"
											disabled={!input.trim() || emailJson.isPending}
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
												<IconSend className="size-4" />
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
