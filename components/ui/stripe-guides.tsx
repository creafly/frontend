"use client";

import { cn } from "@/lib/utils";
import { CONTAINER_MAX_WIDTH, CONTAINER_PADDING_X } from "@/components/container";

interface StripeGuidesProps {
	lines?: number;
	className?: string;
	lineClassName?: string;
	fade?: boolean;
	color?: string;
	opacity?: number;
	edgeOnly?: boolean;
	innerLineOpacityRatio?: number;
	innerLineDashed?: boolean;
}

export function StripeGuides({
	lines = 5,
	className,
	lineClassName,
	fade = true,
	color,
	opacity = 0.1,
	edgeOnly = false,
	innerLineOpacityRatio = 1,
	innerLineDashed = true,
}: StripeGuidesProps) {
	const baseColor = color || "currentColor";

	const edgeLineStyle = {
		backgroundColor: baseColor,
		opacity: opacity,
	};

	const innerLineStyle = {
		opacity: opacity * innerLineOpacityRatio,
		...(innerLineDashed
			? {
					background: `repeating-linear-gradient(to bottom, ${baseColor} 0, ${baseColor} 4px, transparent 4px, transparent 8px)`,
			  }
			: {
					backgroundColor: baseColor,
			  }),
	};

	return (
		<div
			className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
			aria-hidden="true"
		>
			<div
				className={cn("relative h-full w-full mx-auto", CONTAINER_MAX_WIDTH, CONTAINER_PADDING_X)}
			>
				<div className="absolute inset-0 flex justify-between">
					{edgeOnly ? (
						<>
							<div className={cn("h-full w-px", lineClassName)} style={edgeLineStyle} />
							<div className={cn("h-full w-px", lineClassName)} style={edgeLineStyle} />
						</>
					) : (
						Array.from({ length: lines }).map((_, index) => {
							const isEdge = index === 0 || index === lines - 1;
							return (
								<div
									key={index}
									className={cn("h-full w-px", lineClassName)}
									style={isEdge ? edgeLineStyle : innerLineStyle}
								/>
							);
						})
					)}
				</div>

				{fade && (
					<div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-background to-transparent z-10" />
				)}

				{fade && (
					<div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent z-10" />
				)}
			</div>
		</div>
	);
}

interface StripeGuidesWrapperProps {
	children: React.ReactNode;
	guidesProps?: StripeGuidesProps;
	className?: string;
}

export function StripeGuidesWrapper({
	children,
	guidesProps,
	className,
}: StripeGuidesWrapperProps) {
	return (
		<div className={cn("relative", className)}>
			<StripeGuides {...guidesProps} />
			{children}
		</div>
	);
}
