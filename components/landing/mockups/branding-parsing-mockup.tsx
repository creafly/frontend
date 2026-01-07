"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	IconWorld,
	IconLoader2,
	IconCheck,
	IconPalette,
	IconTypography,
	IconPhoto,
} from "@tabler/icons-react";
import { Icon } from "@/components/typography";
import { cn } from "@/lib/utils";
import { APP_DOMAIN } from "@/lib/constants";

interface BrandingParsingMockupProps {
	isActive: boolean;
}

type Phase = "idle" | "typing" | "parsing" | "extracting" | "complete";

const DEMO_URL = "creafly.ai";

const extractedItems = [
	{ icon: IconPalette, label: "Colors", value: "6 colors found", color: "#6366f1" },
	{ icon: IconTypography, label: "Fonts", value: "Inter, Playfair", color: "#10b981" },
	{ icon: IconPhoto, label: "Logos", value: "2 logos found", color: "#f59e0b" },
];

export function BrandingParsingMockup({ isActive }: BrandingParsingMockupProps) {
	const [phase, setPhase] = useState<Phase>("idle");
	const [typedUrl, setTypedUrl] = useState("");

	const resetDemo = useCallback(() => {
		setPhase("idle");
		setTypedUrl("");
	}, []);

	useEffect(() => {
		if (!isActive) {
			const timer = setTimeout(() => resetDemo(), 0);
			return () => clearTimeout(timer);
		}

		const timer = setTimeout(() => setPhase("typing"), 500);
		return () => clearTimeout(timer);
	}, [isActive, resetDemo]);

	useEffect(() => {
		if (phase !== "typing") return;

		if (typedUrl.length < DEMO_URL.length) {
			const timer = setTimeout(() => {
				setTypedUrl(DEMO_URL.slice(0, typedUrl.length + 1));
			}, 80);
			return () => clearTimeout(timer);
		} else {
			const timer = setTimeout(() => setPhase("parsing"), 600);
			return () => clearTimeout(timer);
		}
	}, [phase, typedUrl]);

	useEffect(() => {
		if (phase !== "parsing") return;

		const timer = setTimeout(() => setPhase("extracting"), 1800);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "extracting") return;

		const timer = setTimeout(() => setPhase("complete"), 2000);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "complete") return;

		const timer = setTimeout(() => {
			resetDemo();
			setTimeout(() => setPhase("typing"), 500);
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
						{APP_DOMAIN}/branding
					</div>
				</div>
			</div>

			<div className="flex-1 p-4 bg-background/50 rounded-b-lg overflow-hidden">
				<div className="mb-6">
					<div className="text-xs font-medium text-muted-foreground mb-2">Website URL</div>
					<div className="relative">
						<div
							className={cn(
								"flex items-center gap-2 h-10 px-3 rounded-lg border bg-background transition-all",
								phase === "typing" ? "border-primary ring-2 ring-primary/20" : "border-border"
							)}
						>
							<Icon icon={IconWorld} size="sm" className="text-muted-foreground" />
							<div className="flex-1 text-sm">
								{typedUrl ? (
									<span className="text-foreground">{typedUrl}</span>
								) : (
									<span className="text-muted-foreground/60">Enter your website URL...</span>
								)}
								{phase === "typing" && (
									<motion.span
										className="inline-block w-0.5 h-4 bg-primary ml-0.5"
										animate={{ opacity: [1, 0] }}
										transition={{ duration: 0.5, repeat: Infinity }}
									/>
								)}
							</div>
							<AnimatePresence mode="wait">
								{phase === "parsing" && (
									<motion.div
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
									>
										<Icon icon={IconLoader2} size="sm" className="text-primary animate-spin" />
									</motion.div>
								)}
								{(phase === "extracting" || phase === "complete") && (
									<motion.div
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center"
									>
										<Icon icon={IconCheck} size="xs" className="text-success" />
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				<AnimatePresence>
					{phase === "parsing" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="mb-6"
						>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
								>
									<Icon icon={IconLoader2} size="sm" className="text-primary" />
								</motion.div>
								<span>Analyzing website...</span>
							</div>
							<motion.div
								className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								<motion.div
									className="h-full bg-linear-to-r from-primary to-chart-1"
									initial={{ width: "0%" }}
									animate={{ width: "100%" }}
									transition={{ duration: 1.5, ease: "easeInOut" }}
								/>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{(phase === "extracting" || phase === "complete") && (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
							<div className="text-xs font-medium text-muted-foreground mb-3">
								Extracted Brand Assets
							</div>
							{extractedItems.map((item, index) => (
								<motion.div
									key={item.label}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.2 }}
									className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
								>
									<div
										className="h-9 w-9 rounded-lg flex items-center justify-center"
										style={{ backgroundColor: `${item.color}20` }}
									>
										<item.icon size={16} style={{ color: item.color }} />
									</div>
									<div className="flex-1">
										<div className="text-sm font-medium">{item.label}</div>
										<div className="text-xs text-muted-foreground">{item.value}</div>
									</div>
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
										className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center"
									>
										<Icon icon={IconCheck} size="xs" className="text-success" />
									</motion.div>
								</motion.div>
							))}

							{phase === "complete" && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 }}
									className="pt-3 flex gap-2"
								>
									{["#1a1a2e", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#f8fafc"].map(
										(color, i) => (
											<motion.div
												key={color}
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
												className="h-8 w-8 rounded-lg border border-border/50 shadow-sm"
												style={{ backgroundColor: color }}
											/>
										)
									)}
								</motion.div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
