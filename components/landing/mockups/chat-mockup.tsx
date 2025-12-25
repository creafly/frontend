"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconSend, IconSparkles } from "@tabler/icons-react";
import { Icon } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMockupProps {
	isActive: boolean;
}

type Phase = "idle" | "typing" | "sending" | "generating" | "responding" | "complete";

const USER_MESSAGE = "Create a newsletter about our summer sale";
const AI_RESPONSE =
	"I'll create a vibrant newsletter highlighting your summer sale with eye-catching deals and a clear call-to-action.";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
}

export function ChatMockup({ isActive }: ChatMockupProps) {
	const [phase, setPhase] = useState<Phase>("idle");
	const [typedText, setTypedText] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [displayedResponse, setDisplayedResponse] = useState("");

	const resetDemo = useCallback(() => {
		setPhase("idle");
		setTypedText("");
		setMessages([]);
		setDisplayedResponse("");
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

		const timer = setTimeout(() => setPhase("responding"), 1500);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "responding") return;

		if (displayedResponse.length === 0) {
			const timer = setTimeout(() => {
				setMessages((prev) => [...prev, { id: "2", role: "assistant", content: "" }]);
			}, 0);
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
			const timer = setTimeout(() => setPhase("complete"), 500);
			return () => clearTimeout(timer);
		}
	}, [phase, displayedResponse]);

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
						app.creafly.ai/chat
					</div>
				</div>
			</div>

			<div className="flex-1 p-4 bg-background/50 rounded-b-lg overflow-hidden flex flex-col">
				<div className="flex-1 space-y-3 overflow-hidden">
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
								</div>
							</motion.div>
						))}
					</AnimatePresence>

					<AnimatePresence>
						{phase === "generating" && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								className="flex items-center gap-2"
							>
								<div className="flex gap-1">
									{[0, 1, 2].map((i) => (
										<motion.div
											key={i}
											className="h-2 w-2 rounded-full bg-primary"
											animate={{ y: [0, -4, 0] }}
											transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
										/>
									))}
								</div>
								<span className="text-xs text-muted-foreground">AI is thinking...</span>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<div className="pt-3 border-t border-border/50 mt-3">
					<div
						className={cn(
							"flex items-center gap-2 bg-muted/50 rounded-lg p-1.5 border transition-all",
							phase === "typing" ? "border-primary/50 ring-1 ring-primary/20" : "border-border/50"
						)}
					>
						<div className="flex-1 px-3 py-1.5 text-sm min-h-8 flex items-center">
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
								"h-7 w-7 p-0 rounded-md transition-all",
								typedText.length > 0 ? "opacity-100" : "opacity-50"
							)}
						>
							<Icon icon={IconSend} size="xs" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
