"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRefineTemplate } from "@/hooks/use-api";
import { useTranslations, useI18n } from "@/providers/i18n-provider";
import { getTenantId } from "@/lib/tenant";
import { ApiError } from "@/lib/api/client";
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
import { motion, AnimatePresence, useDragControls } from "motion/react";
import type { Block, TokenUsage } from "@/types";

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
	const scrollRef = useRef<HTMLDivElement>(null);
	const constraintsRef = useRef<HTMLDivElement>(null);
	const dragControls = useDragControls();
	const refineTemplate = useRefineTemplate();
	const t = useTranslations();
	const { locale } = useI18n();

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || refineTemplate.isPending) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input,
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");

		try {
			const tenantId = getTenantId();
			if (!tenantId) {
				toast.error("No tenant selected");
				return;
			}

			const currentBlocks =
				messages.length > 0 ? messages[messages.length - 1].blocks ?? blocks : blocks;

			const result = await refineTemplate.mutateAsync({
				task: input,
				tenantId,
				locale: locale === "ru" ? "ru-RU" : "en-US",
				currentTemplate: {
					template: templateType,
					subject,
					props: {
						...props,
						blocks: currentBlocks,
					},
					blocks: currentBlocks,
				},
			});

			if (result.output) {
				const newBlocks =
					result.output.template === "media_digest" &&
					result.output.props?.blocks &&
					Array.isArray(result.output.props.blocks)
						? (result.output.props.blocks as Block[])
						: currentBlocks;

				const assistantMessage: Message = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: result.output.summary || t.refinement.changesApplied,
					blocks: newBlocks,
					tokenUsage: result.tokenUsage,
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
		} catch (error) {
			if (error instanceof ApiError && error.code === "NO_ACTIVE_SUBSCRIPTION") {
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
					content: error instanceof Error ? error.message : t.errors.refineFailed,
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
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
							<IconSparkles className="size-4 text-primary" />
						</div>
						<h3 className="font-semibold text-sm">{t.refinement.title}</h3>
					</div>
					<div className="flex items-center gap-1">
						<IconGripVertical className="size-4 text-muted-foreground" />
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onClose}
							className="hover:bg-destructive/10 hover:text-destructive"
						>
							<IconX className="size-4" />
						</Button>
					</div>
				</div>

				<ScrollArea className="flex-1 px-4">
					<div ref={scrollRef} className="space-y-3 py-4">
						{messages.length === 0 && (
							<div className="text-center text-muted-foreground py-4 text-sm">
								<p>{t.refinement.startDescription}</p>
								<div className="mt-3 space-y-1 text-xs text-left">
									<p className="font-medium">{t.refinement.examples.title}:</p>
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
												? "bg-amber-500/10 border border-amber-500/20"
												: "bg-muted/70 rounded-bl-sm"
										)}
									>
										{message.isSubscriptionError ? (
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<IconCreditCard className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
													<p>{message.content}</p>
												</div>
												<Button asChild size="sm" variant="default" className="w-full">
													<Link href={`/workspaces/${workspaceSlug}/subscription`}>
														<IconCreditCard className="size-3 mr-1.5" />
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
														<IconCheck className="size-3 mr-1.5" />
														{t.refinement.applyChanges}
													</Button>
												)}
												{message.tokenUsage && (
													<p className="text-xs opacity-60 mt-1.5">
														{message.tokenUsage.totalTokens} tokens
													</p>
												)}
											</>
										)}
									</div>
								</motion.div>
							))}
						</AnimatePresence>

						{refineTemplate.isPending && (
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
									{t.refinement.refining}
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
								disabled={refineTemplate.isPending}
								className="flex-1 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
							/>
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button
									type="submit"
									size="icon"
									disabled={!input.trim() || refineTemplate.isPending}
									className="rounded-lg shadow-lg shadow-primary/25 disabled:shadow-none"
								>
									<IconSend className="size-4" />
								</Button>
							</motion.div>
						</div>
					</div>
				</form>
			</motion.div>
		</>
	);
}
