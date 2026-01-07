"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	IconGripVertical,
	IconTrash,
	IconCopy,
	IconTextSize,
	IconPhoto,
	IconClick,
	IconSquare,
	IconAlignLeft,
	IconAlignCenter,
	IconAlignRight,
} from "@tabler/icons-react";
import { Icon } from "@/components/typography";
import { cn } from "@/lib/utils";
import { APP_DOMAIN } from "@/lib/constants";

interface InteractivePreviewMockupProps {
	isActive: boolean;
}

type Phase = "idle" | "selecting" | "spacing" | "dragging" | "editing" | "complete";

interface Block {
	id: string;
	type: "heading" | "text" | "image" | "button";
	content: string;
	paddingTop?: number;
	paddingBottom?: number;
}

const initialBlocks: Block[] = [
	{ id: "1", type: "heading", content: "Summer Sale!", paddingTop: 16, paddingBottom: 8 },
	{ id: "2", type: "text", content: "Get up to 50% off on selected items", paddingTop: 8, paddingBottom: 8 },
	{ id: "3", type: "image", content: "product-banner.jpg", paddingTop: 12, paddingBottom: 12 },
	{ id: "4", type: "button", content: "Shop Now", paddingTop: 16, paddingBottom: 16 },
];

const blockIcons = {
	heading: IconTextSize,
	text: IconSquare,
	image: IconPhoto,
	button: IconClick,
};

export function InteractivePreviewMockup({ isActive }: InteractivePreviewMockupProps) {
	const [phase, setPhase] = useState<Phase>("idle");
	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
	const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
	const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
	const [showSpacingControls, setShowSpacingControls] = useState(false);
	const [animatedPadding, setAnimatedPadding] = useState(16);

	const resetDemo = useCallback(() => {
		setPhase("idle");
		setSelectedBlockId(null);
		setBlocks(initialBlocks);
		setDraggedBlockId(null);
		setShowSpacingControls(false);
		setAnimatedPadding(16);
	}, []);

	useEffect(() => {
		if (!isActive) {
			const timer = setTimeout(() => resetDemo(), 0);
			return () => clearTimeout(timer);
		}

		const timer = setTimeout(() => setPhase("selecting"), 800);
		return () => clearTimeout(timer);
	}, [isActive, resetDemo]);

	useEffect(() => {
		if (phase !== "selecting") return;

		const timer = setTimeout(() => {
			setSelectedBlockId("1");
			setShowSpacingControls(true);
			setTimeout(() => setPhase("spacing"), 600);
		}, 600);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "spacing") return;

		let currentPadding = 16;
		const targetPadding = 32;
		const interval = setInterval(() => {
			currentPadding += 1;
			setAnimatedPadding(currentPadding);
			setBlocks((prev) =>
				prev.map((b) => (b.id === "1" ? { ...b, paddingBottom: currentPadding } : b))
			);
			if (currentPadding >= targetPadding) {
				clearInterval(interval);
				setTimeout(() => {
					setShowSpacingControls(false);
					setSelectedBlockId("2");
					setPhase("dragging");
				}, 800);
			}
		}, 50);

		return () => clearInterval(interval);
	}, [phase]);

	useEffect(() => {
		if (phase !== "dragging") return;

		const initTimer = setTimeout(() => setDraggedBlockId("2"), 0);

		const timer = setTimeout(() => {
			setBlocks((prev) => {
				const newBlocks = [...prev];
				const draggedIndex = newBlocks.findIndex((b) => b.id === "2");
				const [removed] = newBlocks.splice(draggedIndex, 1);
				newBlocks.splice(0, 0, removed);
				return newBlocks;
			});
			setDraggedBlockId(null);
			setTimeout(() => setPhase("editing"), 500);
		}, 1500);
		return () => {
			clearTimeout(initTimer);
			clearTimeout(timer);
		};
	}, [phase]);

	useEffect(() => {
		if (phase !== "editing") return;

		const timer = setTimeout(() => {
			setSelectedBlockId("1");
			setTimeout(() => setPhase("complete"), 2000);
		}, 800);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "complete") return;

		const timer = setTimeout(() => {
			resetDemo();
			setTimeout(() => setPhase("selecting"), 800);
		}, 3000);
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
						{APP_DOMAIN}/templates/edit
					</div>
				</div>
			</div>

			<div className="flex-1 flex bg-background/50 rounded-b-lg overflow-hidden">
				<div className="w-16 border-r border-border/50 p-2 space-y-2">
					<div className="text-[10px] font-medium text-muted-foreground text-center mb-2">
						Blocks
					</div>
					{Object.entries(blockIcons).map(([type, IconComponent]) => (
						<motion.div
							key={type}
							className="h-10 rounded-lg bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Icon icon={IconComponent} size="sm" className="text-muted-foreground" />
						</motion.div>
					))}
				</div>

				<div className="flex-1 p-3 overflow-hidden">
					<div className="h-full bg-white rounded-lg border border-border/50 p-3 overflow-hidden">
						<div className="space-y-2">
							<AnimatePresence mode="popLayout">
								{blocks.map((block) => (
									<motion.div
										key={block.id}
										layout
										initial={{ opacity: 0, y: 20 }}
										animate={{
											opacity: draggedBlockId === block.id ? 0.5 : 1,
											y: 0,
											scale: draggedBlockId === block.id ? 1.02 : 1,
										}}
										exit={{ opacity: 0, y: -10 }}
										transition={{
											layout: { duration: 0.3, type: "spring" },
											opacity: { duration: 0.2 },
										}}
										className={cn(
											"group relative rounded-lg border p-2 transition-all",
											selectedBlockId === block.id
												? "border-primary ring-2 ring-primary/20 bg-primary/5"
												: "border-transparent hover:border-border bg-muted/30"
										)}
										style={{
											paddingTop: block.paddingTop ? `${block.paddingTop}px` : undefined,
											paddingBottom: block.paddingBottom ? `${block.paddingBottom}px` : undefined,
										}}
									>
										{selectedBlockId === block.id && showSpacingControls && (
											<>
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-0.5 bg-white rounded px-1 py-0.5 shadow-sm z-10"
												>
													{(["left", "center", "right"] as const).map((align) => {
														const AlignIcon = align === "left" ? IconAlignLeft : align === "center" ? IconAlignCenter : IconAlignRight;
														return (
															<div
																key={align}
																className={cn(
																	"w-5 h-5 flex items-center justify-center rounded cursor-pointer",
																	align === "center" ? "bg-primary text-white" : "text-muted-foreground"
																)}
															>
																<AlignIcon size={12} />
															</div>
														);
													})}
												</motion.div>

												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="absolute top-0 left-0 right-0 h-1.5 bg-green-500/40 rounded-t cursor-ns-resize"
												/>

												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="absolute bottom-0 left-0 right-0 h-1.5 bg-green-500/80 rounded-b cursor-ns-resize"
												/>
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded"
												>
													{animatedPadding}px
												</motion.div>

												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="absolute top-1/2 -left-2 -translate-y-1/2 w-1.5 h-6 bg-blue-500/50 rounded cursor-ew-resize"
												/>
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="absolute top-1/2 -right-2 -translate-y-1/2 w-1.5 h-6 bg-blue-500/50 rounded cursor-ew-resize"
												/>

												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500/60 rounded-full cursor-nwse-resize"
												/>
											</>
										)}

										<div className="flex items-center gap-2">
											<div
												className={cn(
													"opacity-0 group-hover:opacity-100 transition-opacity cursor-grab",
													selectedBlockId === block.id && "opacity-100"
												)}
											>
												<Icon icon={IconGripVertical} size="xs" className="text-muted-foreground" />
											</div>

											<div className="flex-1 min-w-0">
												{block.type === "heading" && (
													<div className="font-bold text-sm text-foreground truncate">
														{block.content}
													</div>
												)}
												{block.type === "text" && (
													<div className="text-xs text-muted-foreground truncate">
														{block.content}
													</div>
												)}
												{block.type === "image" && (
													<div className="h-12 bg-linear-to-r from-primary/20 to-chart-1/20 rounded flex items-center justify-center">
														<Icon icon={IconPhoto} size="sm" className="text-muted-foreground" />
													</div>
												)}
												{block.type === "button" && (
													<div className="inline-flex px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium">
														{block.content}
													</div>
												)}
											</div>

											{selectedBlockId === block.id && (
												<motion.div
													initial={{ opacity: 0, scale: 0.8 }}
													animate={{ opacity: 1, scale: 1 }}
													className="flex gap-1"
												>
													<div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
														<Icon icon={IconCopy} size="xs" className="text-muted-foreground" />
													</div>
													<div className="h-6 w-6 rounded bg-destructive/10 flex items-center justify-center">
														<Icon icon={IconTrash} size="xs" className="text-destructive" />
													</div>
												</motion.div>
											)}
										</div>

										{draggedBlockId === block.id && (
											<motion.div
												className="absolute inset-0 border-2 border-dashed border-primary rounded-lg"
												animate={{ opacity: [0.5, 1, 0.5] }}
												transition={{ duration: 0.8, repeat: Infinity }}
											/>
										)}
									</motion.div>
								))}
							</AnimatePresence>

							{phase === "dragging" && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 32 }}
									exit={{ opacity: 0, height: 0 }}
									className="border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center"
								>
									<span className="text-[10px] text-primary">Drop here</span>
								</motion.div>
							)}
						</div>
					</div>
				</div>

				<AnimatePresence>
					{selectedBlockId && phase === "editing" && (
						<motion.div
							initial={{ width: 0, opacity: 0 }}
							animate={{ width: 100, opacity: 1 }}
							exit={{ width: 0, opacity: 0 }}
							className="border-l border-border/50 p-2 overflow-hidden"
						>
							<div className="text-[10px] font-medium text-muted-foreground mb-2">Style</div>
							<div className="space-y-2">
								<div className="flex gap-1">
									{["#1a1a2e", "#6366f1", "#10b981", "#f59e0b"].map((color) => (
										<motion.div
											key={color}
											className="h-5 w-5 rounded border border-border/50 cursor-pointer"
											style={{ backgroundColor: color }}
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
										/>
									))}
								</div>
								<div className="text-[10px] text-muted-foreground">Font Size</div>
								<div className="h-5 bg-muted/50 rounded flex items-center px-2 text-[10px]">
									16px
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
