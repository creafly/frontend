"use client";

import { motion, AnimatePresence } from "motion/react";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/typography";

export interface AgentStep {
	id: string;
	message: string;
	status: "pending" | "in_progress" | "completed";
}

interface AgentStepsProps {
	steps: AgentStep[];
	className?: string;
}

export function AgentSteps({ steps, className }: AgentStepsProps) {
	if (steps.length === 0) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={cn("flex flex-col gap-1.5", className)}
		>
			<AnimatePresence mode="popLayout">
				{steps.map((step, index) => (
					<motion.div
						key={step.id}
						initial={{ opacity: 0, x: -10, height: 0 }}
						animate={{ opacity: 1, x: 0, height: "auto" }}
						exit={{ opacity: 0, x: 10, height: 0 }}
						transition={{
							duration: 0.2,
							delay: index === steps.length - 1 ? 0.05 : 0,
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
	);
}
