"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGenerationJob } from "@/hooks/use-jobs";
import { useTranslations, useI18n } from "@/providers/i18n-provider";
import { getTenantId } from "@/lib/tenant";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
	IconSend,
	IconX,
	IconSparkles,
	IconCheck,
	IconGripVertical,
	IconCreditCard,
} from "@tabler/icons-react";
import { Icon, TypographyH3, TypographyP, TypographyMuted } from "@/components/typography";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import type { Block, TokenUsage, GenerationResult, JobTokenUsage } from "@/types";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	blocks?: Block[];
	tokenUsage?: TokenUsage;
	isSubscriptionError?: boolean;
}

interface RefinementChatProps {
	templateType: string;
	subject: string;
	blocks: Block[];
	props?: Record<string, unknown>;
	onApplyChanges: (blocks: Block[], subject: string) => void;
	isOpen: boolean;
	onClose: () => void;
	workspaceSlug: string;
}

export function RefinementChat({
	templateType,
	subject,
	blocks,
	props,
	onApplyChanges,
	isOpen,
	onClose,
	workspaceSlug,
}: RefinementChatProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [pendingBlocks, setPendingBlocks] = useState<Block[] | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const constraintsRef = useRef<HTMLDivElement>(null);
	const dragControls = useDragControls();
	const t = useTranslations();
	const { locale } = useI18n();

	const currentBlocksRef = useRef<Block[]>(blocks);
	useEffect(() => {
		if (messages.length > 0) {
			const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant" && m.blocks);
			if (lastAssistantMessage?.blocks) {
				currentBlocksRef.current = lastAssistantMessage.blocks;
			}
		} else {
			currentBlocksRef.current = blocks;
		}
	}, [messages, blocks]);

	const handleJobComplete = useCallback(
		(result: GenerationResult, html: string | null, tokenUsage: JobTokenUsage | null) => {
			const convertedTokenUsage: TokenUsage | undefined = tokenUsage
				? {
						promptTokens: tokenUsage.inputTokens,
						completionTokens: tokenUsage.outputTokens,
						totalTokens: tokenUsage.totalTokens,
				  }
				: undefined;

			if (result.template) {
				const newBlocks =
					result.template === "media_digest" && result.blocks && Array.isArray(result.blocks)
						? (result.blocks as unknown as Block[])
						: pendingBlocks || blocks;

				const assistantMessage: Message = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: result.summary || t.refinement.changesApplied,
					blocks: newBlocks,
					tokenUsage: convertedTokenUsage,
				};

				setMessages((prev) => [...prev, assistantMessage]);
				setPendingBlocks(null);
			} else if (result.type === "conversation" && result.content) {
				const assistantMessage: Message = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: result.content,
					tokenUsage: convertedTokenUsage,
				};
				setMessages((prev) => [...prev, assistantMessage]);
			} else {
				const errorMessage: Message = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: t.errors.refineFailed,
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
		},
		[blocks, pendingBlocks, t.refinement.changesApplied, t.errors.refineFailed]
	);

	const handleJobError = useCallback(
		(error: string, errorCode: string | null) => {
			if (errorCode === "INSUFFICIENT_TOKENS" || errorCode === "NO_ACTIVE_SUBSCRIPTION") {
				const errorMessage: Message = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: t.errors.noActiveSubscription,
					isSubscriptionError: true,
				};
				setMessages((prev) => [...prev, errorMessage]);
			} else {
				const errorMessage: Message = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: error || t.errors.refineFailed,
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
		},
		[t.errors.noActiveSubscription, t.errors.refineFailed]
	);

	const generationJob = useGenerationJob({
		onComplete: handleJobComplete,
		onError: handleJobError,
	});

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || generationJob.isRunning) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input,
		};

		setMessages((prev) => [...prev, userMessage]);
		const userInput = input;
		setInput("");

		try {
			const tenantId = getTenantId();
			if (!tenantId) {
				toast.error("No tenant selected");
				return;
			}

			const currentBlocks = currentBlocksRef.current;
			setPendingBlocks(currentBlocks);

			await generationJob.startRefine({
				tenantId,
				task: userInput,
				existingTemplate: templateType,
				existingProps: {
					...props,
					blocks: currentBlocks,
				},
				existingBlocks: currentBlocks as unknown as Record<string, unknown>[],
				language: locale === "ru" ? "ru-RU" : "en-US",
			});
		} catch (error) {
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: error instanceof Error ? error.message : t.errors.refineFailed,
			};
			setMessages((prev) => [...prev, errorMessage]);
		}
	};

	const handleApplyChanges = (message: Message) => {
		if (message.blocks) {
			onApplyChanges(message.blocks, subject);
		}
	};

	if (!isOpen) return null;

	return (
		<>
			<div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />

			<motion.div
				initial={{ opacity: 0, scale: 0.9, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.9, y: 20 }}
				transition={{ type: "spring", damping: 25, stiffness: 300 }}
				drag
				dragControls={dragControls}
				dragListener={false}
				dragMomentum={false}
				dragConstraints={constraintsRef}
				dragElastic={0.1}
				className="fixed bottom-4 right-4 w-96 z-50 flex flex-col max-h-125 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/20"
			>
				<div
					onPointerDown={(e) => dragControls.start(e)}
					className="flex items-center justify-between px-4 py-3 border-b border-border/50 cursor-grab active:cursor-grabbing shrink-0 select-none"
				>
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-primary/20 to-primary/5">
							<Icon icon={IconSparkles} size="sm" className="text-primary" />
						</div>
						<TypographyH3 size="2xs">{t.refinement.title}</TypographyH3>
					</div>
					<div className="flex items-center gap-1">
						<Icon icon={IconGripVertical} size="sm" className="text-muted-foreground" />
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onClose}
							className="hover:bg-destructive/10 hover:text-destructive"
						>
							<Icon icon={IconX} size="sm" />
						</Button>
					</div>
				</div>

				<ScrollArea className="flex-1 px-4">
					<div ref={scrollRef} className="space-y-3 py-4">
						{messages.length === 0 && (
							<div className="text-center text-muted-foreground py-4 text-sm">
								<p>{t.refinement.startDescription}</p>
								<div className="mt-3 space-y-1 text-xs text-left">
									<TypographyP className="font-medium mt-0">{t.refinement.examples.title}:</TypographyP>
									<ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
										<li>{t.refinement.examples.formal}</li>
										<li>{t.refinement.examples.cta}</li>
										<li>{t.refinement.examples.colors}</li>
									</ul>
								</div>
							</div>
						)}

						<AnimatePresence mode="popLayout">
							{messages.map((message) => (
								<motion.div
									key={message.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className={cn("text-sm", message.role === "user" ? "text-right" : "text-left")}
								>
									<div
										className={cn(
											"inline-block max-w-[85%] px-3 py-2 rounded-2xl",
											message.role === "user"
												? "bg-primary text-primary-foreground rounded-br-sm"
												: message.isSubscriptionError
												? "bg-warning/10 border border-warning/20"
												: "bg-muted/70 rounded-bl-sm"
										)}
									>
										{message.isSubscriptionError ? (
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<Icon icon={IconCreditCard} size="sm" className="text-warning shrink-0" />
													<p>{message.content}</p>
												</div>
												<Button asChild size="sm" variant="default" className="w-full">
													<Link href={`/workspaces/${workspaceSlug}/subscription`}>
														<Icon icon={IconCreditCard} size="xs" className="mr-1.5" />
														{t.errors.noActiveSubscriptionLink}
													</Link>
												</Button>
											</div>
										) : (
											<>
												<p>{message.content}</p>
												{message.role === "assistant" && message.blocks && (
													<Button
														size="sm"
														className="mt-2 w-full shadow-lg shadow-primary/20"
														onClick={() => handleApplyChanges(message)}
													>
														<Icon icon={IconCheck} size="xs" className="mr-1.5" />
														{t.refinement.applyChanges}
													</Button>
												)}
												{message.tokenUsage && (
													<TypographyMuted className="text-xs opacity-60 mt-1.5">
														{message.tokenUsage.totalTokens} tokens
													</TypographyMuted>
												)}
											</>
										)}
									</div>
								</motion.div>
							))}
						</AnimatePresence>

					{generationJob.isRunning && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex justify-start"
						>
							<motion.span
								className="text-sm text-muted-foreground"
								animate={{ opacity: [0.4, 1, 0.4] }}
								transition={{
									duration: 1.5,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							>
								{generationJob.progressMessage || t.refinement.refining}
							</motion.span>
						</motion.div>
					)}
					</div>
				</ScrollArea>

				<form onSubmit={handleSubmit} className="p-3 border-t border-border/50 shrink-0">
					<div className="relative group">
						<div className="absolute -inset-0.5 bg-linear-to-r from-primary/30 via-primary/20 to-primary/30 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
						<div className="relative flex gap-2 bg-muted/30 rounded-xl p-1.5 border border-border/50 group-focus-within:border-primary/30 transition-colors">
							<Input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={t.refinement.placeholder}
								disabled={generationJob.isRunning}
								className="flex-1 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
							/>
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button
									type="submit"
									size="icon"
									disabled={!input.trim() || generationJob.isRunning}
									className="rounded-lg shadow-lg shadow-primary/25 disabled:shadow-none"
								>
									<Icon icon={IconSend} size="sm" />
								</Button>
							</motion.div>
						</div>
					</div>
				</form>
			</motion.div>
		</>
	);
}
