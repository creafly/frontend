"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	IconSend,
	IconSparkles,
	IconCheck,
	IconLoader2,
	IconPaperclip,
	IconTemplate,
	IconChevronDown,
	IconDatabase,
} from "@tabler/icons-react";
import { Icon } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_DOMAIN } from "@/lib/constants";

interface ChatMockupProps {
	isActive: boolean;
}

type Phase = "idle" | "typing" | "sending" | "generating" | "responding" | "showing-email" | "complete";

const USER_MESSAGE = "Create a newsletter about our summer sale";
const AI_RESPONSE =
	"I'll create a vibrant newsletter highlighting your summer sale with eye-catching deals and a clear call-to-action.";

const EMAIL_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 12px; background: #fff; }
    h1 { color: #1a1a1a; font-size: 18px; margin-bottom: 8px; }
    p { color: #666; line-height: 1.4; margin-bottom: 8px; font-size: 12px; }
    .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 12px; }
    .highlight { color: #ef4444; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Summer Sale!</h1>
  <p>Get up to <span class="highlight">50% off</span> on selected items.</p>
  <p>Limited time offer - don't miss out!</p>
  <a href="#" class="button">Shop Now</a>
</body>
</html>`;

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	isEmail?: boolean;
}

interface AgentStep {
	id: string;
	message: string;
	status: "pending" | "in_progress" | "completed";
}

const AGENT_STEPS: Omit<AgentStep, "status">[] = [
	{ id: "1", message: "Analyzing your request..." },
	{ id: "2", message: "Selecting template style..." },
	{ id: "3", message: "Generating content..." },
];

export function ChatMockup({ isActive }: ChatMockupProps) {
	const [phase, setPhase] = useState<Phase>("idle");
	const [typedText, setTypedText] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [displayedResponse, setDisplayedResponse] = useState("");
	const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const resetDemo = useCallback(() => {
		setPhase("idle");
		setTypedText("");
		setMessages([]);
		setDisplayedResponse("");
		setAgentSteps([]);
		setCurrentStepIndex(0);
	}, []);

	useEffect(() => {
		if (!isActive) {
			const timer = setTimeout(() => resetDemo(), 0);
			return () => clearTimeout(timer);
		}

		const timer = setTimeout(() => setPhase("typing"), 600);
		return () => clearTimeout(timer);
	}, [isActive, resetDemo]);

	useEffect(() => {
		if (phase !== "typing") return;

		if (typedText.length < USER_MESSAGE.length) {
			const timer = setTimeout(() => {
				setTypedText(USER_MESSAGE.slice(0, typedText.length + 1));
			}, 60);
			return () => clearTimeout(timer);
		} else {
			const timer = setTimeout(() => setPhase("sending"), 500);
			return () => clearTimeout(timer);
		}
	}, [phase, typedText]);

	useEffect(() => {
		if (phase !== "sending") return;

		const timer = setTimeout(() => {
			setMessages([{ id: "1", role: "user", content: USER_MESSAGE }]);
			setTypedText("");
		}, 0);

		const phaseTimer = setTimeout(() => setPhase("generating"), 300);
		return () => {
			clearTimeout(timer);
			clearTimeout(phaseTimer);
		};
	}, [phase]);

	useEffect(() => {
		if (phase !== "generating") return;

		setAgentSteps([{ ...AGENT_STEPS[0], status: "in_progress" }]);
		setCurrentStepIndex(0);

		const stepIntervals: NodeJS.Timeout[] = [];

		AGENT_STEPS.forEach((step, index) => {
			if (index === 0) return;

			const timeout = setTimeout(() => {
				setAgentSteps((prev) => {
					const updated = prev.map((s, i) =>
						i === index - 1 ? { ...s, status: "completed" as const } : s
					);
					return [...updated, { ...step, status: "in_progress" as const }];
				});
				setCurrentStepIndex(index);
			}, index * 700);

			stepIntervals.push(timeout);
		});

		const completeTimer = setTimeout(() => {
			setAgentSteps((prev) =>
				prev.map((s) => ({ ...s, status: "completed" as const }))
			);
			setTimeout(() => setPhase("responding"), 400);
		}, AGENT_STEPS.length * 700);

		return () => {
			stepIntervals.forEach(clearTimeout);
			clearTimeout(completeTimer);
		};
	}, [phase]);

	useEffect(() => {
		if (phase !== "responding") return;

		if (displayedResponse.length === 0) {
			const timer = setTimeout(() => {
				const newText = AI_RESPONSE.slice(0, 2);
				setDisplayedResponse(newText);
				setMessages((prev) => [...prev, { id: "2", role: "assistant", content: newText }]);
			}, 100);
			return () => clearTimeout(timer);
		}

		if (displayedResponse.length < AI_RESPONSE.length) {
			const timer = setTimeout(() => {
				const newText = AI_RESPONSE.slice(0, displayedResponse.length + 2);
				setDisplayedResponse(newText);
				setMessages((prev) => prev.map((m) => (m.id === "2" ? { ...m, content: newText } : m)));
			}, 30);
			return () => clearTimeout(timer);
		} else {
			const timer = setTimeout(() => setPhase("showing-email"), 500);
			return () => clearTimeout(timer);
		}
	}, [phase, displayedResponse]);

	useEffect(() => {
		if (phase !== "showing-email") return;

		setMessages((prev) =>
			prev.map((m) => (m.id === "2" ? { ...m, isEmail: true } : m))
		);
		const timer = setTimeout(() => setPhase("complete"), 3000);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "complete") return;

		const timer = setTimeout(() => {
			resetDemo();
			setTimeout(() => setPhase("typing"), 600);
		}, 4000);
		return () => clearTimeout(timer);
	}, [phase, resetDemo]);

	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30 rounded-t-lg">
				<div className="flex gap-1">
					<div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
					<div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
					<div className="h-2.5 w-2.5 rounded-full bg-success/60" />
				</div>
				<div className="flex-1 mx-2">
					<div className="h-6 rounded-md bg-background/80 flex items-center px-3 text-xs text-muted-foreground">
						{APP_DOMAIN}/chat
					</div>
				</div>
			</div>

			<div className="flex-1 p-4 bg-background/50 rounded-b-lg overflow-hidden flex flex-col">
				<div className="flex-1 space-y-3 overflow-y-auto">
					<AnimatePresence>
						{phase === "idle" && messages.length === 0 && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="h-full flex flex-col items-center justify-center"
							>
								<motion.div
									className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3"
									animate={{ scale: [1, 1.05, 1] }}
									transition={{ duration: 2, repeat: Infinity }}
								>
									<Icon icon={IconSparkles} size="lg" className="text-primary" />
								</motion.div>
								<div className="text-sm font-medium">How can I help you today?</div>
								<div className="text-xs text-muted-foreground mt-1">
									Describe the email you want to create
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					<AnimatePresence mode="popLayout">
						{messages.map((message) => (
							<motion.div
								key={message.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
							>
								<div
									className={cn(
										"max-w-[85%] px-3 py-2 rounded-2xl text-sm",
										message.role === "user"
											? "bg-primary text-primary-foreground rounded-br-sm"
											: "bg-muted"
									)}
								>
									{message.content}
									{message.role === "assistant" && phase === "responding" && (
										<motion.span
											className="inline-block w-1.5 h-4 bg-foreground/60 ml-0.5 rounded-full"
											animate={{ opacity: [1, 0] }}
											transition={{ duration: 0.5, repeat: Infinity }}
										/>
									)}
									{message.isEmail && phase !== "responding" && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="mt-2 overflow-hidden rounded-lg border border-border/50 bg-white"
										>
											<iframe
												srcDoc={EMAIL_HTML}
												className="w-full h-32 pointer-events-none"
												title="Email preview"
											/>
										</motion.div>
									)}
								</div>
							</motion.div>
						))}
					</AnimatePresence>

					<AnimatePresence>
						{phase === "generating" && agentSteps.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								className="flex flex-col gap-1.5"
							>
								<AnimatePresence mode="popLayout">
									{agentSteps.map((step, index) => (
										<motion.div
											key={step.id}
											initial={{ opacity: 0, x: -10, height: 0 }}
											animate={{ opacity: 1, x: 0, height: "auto" }}
											exit={{ opacity: 0, x: 10, height: 0 }}
											transition={{
												duration: 0.2,
												delay: index === agentSteps.length - 1 ? 0.05 : 0,
											}}
											className="flex items-center gap-2"
										>
											<div className="flex items-center justify-center w-5 h-5 shrink-0">
												{step.status === "completed" ? (
													<motion.div
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
														transition={{ type: "spring", stiffness: 500, damping: 25 }}
														className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/20"
													>
														<Icon icon={IconCheck} size="xs" className="text-primary" />
													</motion.div>
												) : (
													<motion.div
														animate={{ rotate: 360 }}
														transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
													>
														<Icon icon={IconLoader2} size="sm" className="text-muted-foreground" />
													</motion.div>
												)}
											</div>
											<motion.span
												className={cn(
													"text-sm transition-colors duration-200",
													step.status === "completed"
														? "text-muted-foreground"
														: "text-foreground font-medium"
												)}
												animate={{
													opacity: step.status === "in_progress" ? [0.7, 1, 0.7] : 1,
												}}
												transition={{
													duration: 1.5,
													repeat: step.status === "in_progress" ? Infinity : 0,
													ease: "easeInOut",
												}}
											>
												{step.message}
											</motion.span>
										</motion.div>
									))}
								</AnimatePresence>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<div className="pt-3 border-t border-border/50 mt-3">
					<div
						className={cn(
							"bg-muted/50 rounded-2xl border transition-all overflow-hidden",
							phase === "typing" ? "border-primary/50 ring-1 ring-primary/20" : "border-border/50"
						)}
					>
						<div className="flex items-center gap-2 px-3 py-2">
							<div className="flex-1 text-sm min-h-8 flex items-center">
								{typedText ? (
									<span className="text-foreground">{typedText}</span>
								) : (
									<span className="text-muted-foreground/60">Describe your email...</span>
								)}
								{phase === "typing" && (
									<motion.span
										className="inline-block w-0.5 h-4 bg-primary ml-0.5"
										animate={{ opacity: [1, 0] }}
										transition={{ duration: 0.5, repeat: Infinity }}
									/>
								)}
							</div>
							<Button
								size="sm"
								className={cn(
									"h-8 w-8 p-0 rounded-full transition-all shadow-lg shadow-primary/25",
									typedText.length > 0 ? "opacity-100" : "opacity-50"
								)}
							>
								<Icon icon={IconSend} size="sm" />
							</Button>
						</div>

						<div className="flex items-center gap-1 px-2 py-1.5">
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 text-muted-foreground"
							>
								<Icon icon={IconPaperclip} size="sm" />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 text-muted-foreground"
							>
								<Icon icon={IconDatabase} size="sm" />
							</Button>

							<Button
								variant="ghost"
								size="sm"
								className="h-7 px-2 text-muted-foreground gap-1"
							>
								<Icon icon={IconTemplate} size="sm" />
								<span className="text-xs">Template</span>
								<Icon icon={IconChevronDown} size="xs" className="opacity-60" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
