"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	IconSend,
	IconBookmark,
	IconMessage,
	IconTemplate,
	IconSettings,
	IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import Image from "next/image";
import { Icon, TypographyP } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DemoMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	isEmail?: boolean;
}

interface ChatDemoMockupProps {
	userMessage?: string;
	aiSummary?: string;
	emailSubject?: string;
	emailHtml?: string;
	generatingText?: string;
	inputPlaceholder?: string;
	saveButtonText?: string;
	emptyStateTitle?: string;
	emptyStateDescription?: string;
	autoStartDelay?: number;
	typingSpeed?: number;
	loop?: boolean;
	loopDelay?: number;
	className?: string;
}

const DEFAULT_USER_MESSAGE = "Create a welcome email for new users";
const DEFAULT_AI_SUMMARY =
	"I've created a welcome email with a friendly greeting, key features overview, and a call-to-action button.";
const DEFAULT_EMAIL_SUBJECT = "Welcome to Creafly!";
const DEFAULT_EMAIL_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 16px; background: #fff; }
    .container { max-width: 100%; }
    h1 { color: #1a1a1a; font-size: 20px; margin-bottom: 12px; }
    p { color: #666; line-height: 1.5; margin-bottom: 10px; font-size: 13px; }
    .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 13px; }
    .features { background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 12px 0; }
    .feature { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; font-size: 12px; color: #444; }
    .feature:last-child { margin-bottom: 0; }
    .check { color: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Creafly!</h1>
    <p>Hi there! We're thrilled to have you on board.</p>
    <div class="features">
      <div class="feature"><span class="check">✓</span> AI-powered email generation</div>
      <div class="feature"><span class="check">✓</span> Beautiful templates</div>
      <div class="feature"><span class="check">✓</span> Easy customization</div>
    </div>
    <p>Ready to create your first email?</p>
    <a href="#" class="button">Get Started</a>
  </div>
</body>
</html>`;

type DemoPhase =
	| "empty"
	| "typing"
	| "sending"
	| "generating"
	| "showing-summary"
	| "showing-email"
	| "complete";

export function ChatDemoMockup({
	userMessage = DEFAULT_USER_MESSAGE,
	aiSummary = DEFAULT_AI_SUMMARY,
	emailSubject = DEFAULT_EMAIL_SUBJECT,
	emailHtml = DEFAULT_EMAIL_HTML,
	generatingText = "Generating response...",
	inputPlaceholder = "Describe the email you want to create...",
	saveButtonText = "Save & Edit",
	emptyStateTitle = "What can I help you with?",
	emptyStateDescription = "Describe the email you want to create",
	autoStartDelay = 1500,
	typingSpeed = 50,
	loop = true,
	loopDelay = 5000,
	className,
}: ChatDemoMockupProps) {
	const [phase, setPhase] = useState<DemoPhase>("empty");
	const [typedText, setTypedText] = useState("");
	const [messages, setMessages] = useState<DemoMessage[]>([]);
	const emailPreviewRef = useRef<HTMLIFrameElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const resetDemo = useCallback(() => {
		setPhase("empty");
		setTypedText("");
		setMessages([]);
	}, []);

	const startDemo = useCallback(() => {
		setPhase("typing");
	}, []);

	useEffect(() => {
		const timer = setTimeout(startDemo, autoStartDelay);
		return () => clearTimeout(timer);
	}, [autoStartDelay, startDemo]);

	useEffect(() => {
		if (phase !== "typing") return;

		if (typedText.length < userMessage.length) {
			const timer = setTimeout(() => {
				setTypedText(userMessage.slice(0, typedText.length + 1));
			}, typingSpeed);
			return () => clearTimeout(timer);
		} else {
			const timer = setTimeout(() => setPhase("sending"), 500);
			return () => clearTimeout(timer);
		}
	}, [phase, typedText, userMessage, typingSpeed]);

	useEffect(() => {
		if (phase !== "sending") return;

		setTimeout(() => {
			setMessages([{ id: "1", role: "user", content: userMessage }]);
			setTypedText("");
		}, 0);

		const timer = setTimeout(() => setPhase("generating"), 300);
		return () => clearTimeout(timer);
	}, [phase, userMessage]);

	useEffect(() => {
		if (phase !== "generating") return;

		const timer = setTimeout(() => setPhase("showing-summary"), 2500);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "showing-summary") return;

		setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{ id: "2", role: "assistant", content: aiSummary, isEmail: true },
			]);
		}, 0);

		const timer = setTimeout(() => setPhase("showing-email"), 500);
		return () => clearTimeout(timer);
	}, [phase, aiSummary]);

	useEffect(() => {
		if (phase !== "showing-email") return;

		const timer = setTimeout(() => setPhase("complete"), 300);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "complete" || !loop) return;

		const timer = setTimeout(() => {
			resetDemo();
			setTimeout(startDemo, autoStartDelay);
		}, loopDelay);
		return () => clearTimeout(timer);
	}, [phase, loop, loopDelay, startDemo, resetDemo, autoStartDelay]);

	useEffect(() => {
		if (phase !== "complete") return;

		const iframe = emailPreviewRef.current;
		if (!iframe) return;

		const scrollEmail = () => {
			try {
				const doc = iframe.contentDocument || iframe.contentWindow?.document;
				if (!doc) return;

				const scrollHeight = doc.body?.scrollHeight || 0;
				const viewportHeight = iframe.clientHeight;
				const maxScroll = scrollHeight - viewportHeight;

				if (maxScroll <= 0) return;

				let scrollPos = 0;
				const scrollStep = 1;
				const scrollInterval = setInterval(() => {
					scrollPos += scrollStep;
					if (scrollPos >= maxScroll) {
						clearInterval(scrollInterval);
					} else {
						doc.documentElement.scrollTop = scrollPos;
						doc.body.scrollTop = scrollPos;
					}
				}, 30);

				return () => clearInterval(scrollInterval);
			} catch {}
		};

		const timer = setTimeout(scrollEmail, 500);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (messages.length === 0) return;

		const container = chatContainerRef.current;
		if (!container) return;

		const scrollToBottom = () => {
			container.scrollTo({
				top: container.scrollHeight,
				behavior: "smooth",
			});
		};

		const timer = setTimeout(scrollToBottom, 100);
		return () => clearTimeout(timer);
	}, [messages, phase]);

	return (
		<div className={cn("flex h-105 bg-background rounded-lg", className)}>
			<div className="w-12 border-r border-border/50 flex flex-col items-center py-3 gap-1 shrink-0">
				<div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
					<span className="text-xs font-bold text-primary">W</span>
				</div>

				<div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
					<Icon icon={IconMessage} size="sm" />
				</div>
				<div className="w-8 h-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground">
					<Icon icon={IconTemplate} size="sm" />
				</div>

				<div className="flex-1" />

				<div className="w-8 h-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground">
					<Icon icon={IconSettings} size="sm" />
				</div>
			</div>

			<div className="flex-1 flex flex-col overflow-hidden relative">
				<div className="absolute top-2 left-2 z-10">
					<Button variant="ghost" size="icon" className="h-7 w-7">
						<Icon icon={IconLayoutSidebarLeftExpand} size="sm" />
					</Button>
				</div>

				<div ref={chatContainerRef} className="flex-1 overflow-auto p-4">
					<div className="space-y-3 h-full flex flex-col">
						<AnimatePresence>
							{phase === "empty" && messages.length === 0 && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="flex-1 flex flex-col items-center justify-center text-center"
								>
									<motion.div
										className="relative mb-4"
										animate={{ y: [0, -4, 0] }}
										transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
									>
										<div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-150" />
										<Image src="/logo.svg" alt="Creafly" width={32} height={32} />
									</motion.div>
									<h3 className="text-sm font-semibold mb-1">{emptyStateTitle}</h3>
									<p className="text-xs text-muted-foreground">{emptyStateDescription}</p>
								</motion.div>
							)}
						</AnimatePresence>

						<AnimatePresence mode="popLayout">
							{messages.map((message) => (
								<motion.div
									key={message.id}
									initial={{ opacity: 0, y: 20, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -10, scale: 0.95 }}
									transition={{
										duration: 0.3,
										ease: [0.21, 0.47, 0.32, 0.98],
									}}
									className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
								>
									<div
										className={cn(
											"max-w-[85%]",
											message.role === "user"
												? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2 shadow-lg shadow-primary/20"
												: "space-y-3"
										)}
									>
										{message.role === "user" ? (
											<span className="text-sm">{message.content}</span>
										) : (
											<>
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ duration: 0.5 }}
												>
													<TypographyP className="text-foreground leading-relaxed mt-0 text-sm">
														{message.content}
													</TypographyP>
												</motion.div>

												{message.isEmail && phase === "complete" && (
													<motion.div
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ duration: 0.3, delay: 0.2 }}
													>
														<div className="overflow-hidden rounded-lg border border-border/50 bg-background shadow-md">
															<div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 bg-muted/30">
																<span className="text-xs font-medium text-foreground truncate flex-1 mr-2">
																	{emailSubject}
																</span>
																<Button
																	size="sm"
																	className="h-6 px-2 text-xs shadow-sm"
																	onClick={(e) => e.preventDefault()}
																>
																	<Icon icon={IconBookmark} size="xs" className="mr-1" />
																	{saveButtonText}
																</Button>
															</div>
															<div className="bg-white">
																<iframe
																	ref={emailPreviewRef}
																	srcDoc={emailHtml}
																	className="w-full h-45 pointer-events-none"
																	title="Email preview"
																/>
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

						{phase === "generating" && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex justify-start items-center gap-2"
							>
								<motion.span
									className="text-sm font-medium text-muted-foreground"
									animate={{
										opacity: [0.4, 1, 0.4],
									}}
									transition={{
										duration: 1.5,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								>
									{generatingText}
								</motion.span>
							</motion.div>
						)}
					</div>
				</div>

				<div className="p-3 border-t border-border/50">
					<div className="relative">
						<div
							className={cn(
								"flex gap-2 bg-muted/30 rounded-lg p-1.5 border transition-colors",
								phase === "typing" ? "border-primary/30" : "border-border/50"
							)}
						>
							<div className="flex-1 px-3 py-1.5 text-sm min-h-8 flex items-center">
								{typedText ? (
									<span className="text-foreground">{typedText}</span>
								) : (
									<span className="text-muted-foreground/60">{inputPlaceholder}</span>
								)}
								{phase === "typing" && (
									<motion.span
										className="inline-block w-0.5 h-4 bg-primary ml-0.5"
										animate={{ opacity: [1, 0] }}
										transition={{ duration: 0.5, repeat: Infinity }}
									/>
								)}
							</div>
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button
									size="sm"
									disabled={phase !== "typing" || typedText.length === 0}
									className={cn(
										"rounded-md px-3 h-8 transition-all",
										typedText.length > 0 && phase === "typing"
											? "shadow-lg shadow-primary/25"
											: "opacity-50"
									)}
								>
									<motion.div
										animate={typedText.length > 0 && phase === "typing" ? { x: [0, 2, 0] } : {}}
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
			</div>
		</div>
	);
}
