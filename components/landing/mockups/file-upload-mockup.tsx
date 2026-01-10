"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	IconUpload,
	IconFile,
	IconCheck,
	IconPhoto,
	IconFileTypePdf,
	IconFolder,
	IconChevronRight,
	IconHome,
} from "@tabler/icons-react";
import { Icon } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_DOMAIN } from "@/lib/constants";

interface FileUploadMockupProps {
	isActive: boolean;
}

type Phase = "idle" | "navigating" | "hovering" | "uploading" | "processing" | "complete";

interface FolderItem {
	id: string;
	name: string;
	fileCount: number;
	folderCount: number;
}

interface FileItem {
	name: string;
	icon: typeof IconFile;
	size: string;
	color: string;
}

const demoFolders: FolderItem[] = [
	{ id: "1", name: "Marketing", fileCount: 12, folderCount: 2 },
	{ id: "2", name: "Campaigns", fileCount: 8, folderCount: 0 },
];

const demoFiles: FileItem[] = [
	{ name: "brand-guidelines.pdf", icon: IconFileTypePdf, size: "2.4 MB", color: "#ef4444" },
	{ name: "product-photos.zip", icon: IconPhoto, size: "15.2 MB", color: "#10b981" },
];

interface BreadcrumbItem {
	id?: string;
	name: string;
}

export function FileUploadMockup({ isActive }: FileUploadMockupProps) {
	const [phase, setPhase] = useState<Phase>("idle");
	const [uploadProgress, setUploadProgress] = useState(0);
	const [completedFiles, setCompletedFiles] = useState<number[]>([]);
	const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);

	const resetDemo = useCallback(() => {
		setPhase("idle");
		setUploadProgress(0);
		setCompletedFiles([]);
		setBreadcrumb([]);
	}, []);

	useEffect(() => {
		if (!isActive) {
			const timer = setTimeout(() => resetDemo(), 0);
			return () => clearTimeout(timer);
		}

		const timer = setTimeout(() => setPhase("navigating"), 800);
		return () => clearTimeout(timer);
	}, [isActive, resetDemo]);

	useEffect(() => {
		if (phase !== "navigating") return;

		const timer1 = setTimeout(() => {
			setBreadcrumb([{ name: "Marketing", id: "1" }]);
		}, 600);

		const timer2 = setTimeout(() => {
			setBreadcrumb([
				{ name: "Marketing", id: "1" },
				{ name: "Campaigns", id: "2" },
			]);
		}, 1200);

		const timer3 = setTimeout(() => {
			setPhase("hovering");
		}, 1800);

		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
			clearTimeout(timer3);
		};
	}, [phase]);

	useEffect(() => {
		if (phase !== "hovering") return;

		const timer = setTimeout(() => setPhase("uploading"), 1200);
		return () => clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "uploading") return;

		const interval = setInterval(() => {
			setUploadProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					return 100;
				}
				return prev + 3;
			});
		}, 50);

		return () => clearInterval(interval);
	}, [phase]);

	useEffect(() => {
		if (phase === "uploading" && uploadProgress >= 100) {
			const timer = setTimeout(() => setPhase("processing"), 300);
			return () => clearTimeout(timer);
		}
	}, [phase, uploadProgress]);

	useEffect(() => {
		if (phase !== "processing") return;

		const completeNextFile = (index: number) => {
			if (index >= demoFiles.length) {
				setTimeout(() => setPhase("complete"), 500);
				return;
			}

			setTimeout(() => {
				setCompletedFiles((prev) => [...prev, index]);
				completeNextFile(index + 1);
			}, 600);
		};

		completeNextFile(0);
	}, [phase]);

	useEffect(() => {
		if (phase !== "complete") return;

		const timer = setTimeout(() => {
			resetDemo();
			setTimeout(() => setPhase("navigating"), 800);
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
						{APP_DOMAIN}/storage
					</div>
				</div>
			</div>

			<div className="flex-1 p-4 bg-background/50 rounded-b-lg overflow-hidden">
				<AnimatePresence mode="wait">
					{breadcrumb.length > 0 && (
						<motion.nav
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex items-center gap-1 text-sm mb-3 overflow-x-auto"
						>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 px-2 flex-shrink-0"
							>
								<Icon icon={IconHome} size="sm" className="mr-1" />
								Root
							</Button>

							{breadcrumb.map((item, index) => (
								<motion.div
									key={item.id || index}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className="flex items-center gap-1 flex-shrink-0"
								>
									<Icon icon={IconChevronRight} size="sm" className="text-muted-foreground" />
									<Button
										variant="ghost"
										size="sm"
										className={cn(
											"h-7 px-2",
											index === breadcrumb.length - 1 && "font-medium"
										)}
									>
										{item.name}
									</Button>
								</motion.div>
							))}
						</motion.nav>
					)}
				</AnimatePresence>

				{phase === "idle" || phase === "navigating" ? (
					<div className="space-y-2">
						<div className="text-xs font-medium text-muted-foreground mb-2">Folders</div>
						{demoFolders.map((folder, index) => (
							<motion.div
								key={folder.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{
									opacity: breadcrumb.length > index ? 0.5 : 1,
									y: 0,
									scale: breadcrumb.length > index ? 0.98 : 1,
								}}
								transition={{ delay: index * 0.1 }}
								className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
							>
								<div className="flex-shrink-0">
									<Icon icon={IconFolder} size="xl" className="text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-medium text-sm truncate">{folder.name}</div>
									<div className="text-xs text-muted-foreground">
										{folder.folderCount} folders, {folder.fileCount} files
									</div>
								</div>
							</motion.div>
						))}
					</div>
				) : (
					<>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className={cn(
								"relative h-28 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2",
								phase === "hovering"
									? "border-primary bg-primary/5"
									: phase === "uploading" || phase === "processing" || phase === "complete"
									? "border-success/50 bg-success/5"
									: "border-border bg-muted/30"
							)}
						>
							<AnimatePresence mode="wait">
								{phase === "hovering" && (
									<motion.div
										key="hovering"
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.9 }}
										className="flex flex-col items-center gap-2"
									>
										<motion.div
											className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"
											animate={{ y: [0, -5, 0] }}
											transition={{ duration: 0.6, repeat: Infinity }}
										>
											<Icon icon={IconUpload} size="md" className="text-primary" />
										</motion.div>
										<div className="text-sm font-medium text-primary">Drop to upload</div>
									</motion.div>
								)}

								{(phase === "uploading" || phase === "processing" || phase === "complete") && (
									<motion.div
										key="uploading"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="w-full px-6"
									>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium">
												{phase === "uploading"
													? "Uploading..."
													: phase === "processing"
													? "Processing..."
													: "Complete!"}
											</span>
											<span className="text-sm text-muted-foreground">
												{Math.round(uploadProgress)}%
											</span>
										</div>
										<div className="h-2 bg-muted rounded-full overflow-hidden">
											<motion.div
												className={cn(
													"h-full rounded-full",
													phase === "complete" ? "bg-success" : "bg-linear-to-r from-primary to-chart-1"
												)}
												initial={{ width: 0 }}
												animate={{ width: `${uploadProgress}%` }}
											/>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>

						<div className="mt-4 space-y-2">
							<div className="text-xs font-medium text-muted-foreground mb-2">Uploaded Files</div>
							{demoFiles.map((file, index) => (
								<motion.div
									key={file.name}
									initial={{ opacity: 0, y: 10 }}
									animate={{
										opacity:
											phase === "uploading" || phase === "processing" || phase === "complete" ? 1 : 0.4,
										y: 0,
									}}
									transition={{ delay: index * 0.1 }}
									className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50"
								>
									<div
										className="h-8 w-8 rounded-lg flex items-center justify-center"
										style={{ backgroundColor: `${file.color}20` }}
									>
										<file.icon size={16} style={{ color: file.color }} />
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium truncate">{file.name}</div>
										<div className="text-xs text-muted-foreground">{file.size}</div>
									</div>
									<AnimatePresence>
										{completedFiles.includes(index) && (
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												transition={{ type: "spring" }}
												className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center"
											>
												<Icon icon={IconCheck} size="xs" className="text-success" />
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
