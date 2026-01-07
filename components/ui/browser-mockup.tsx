"use client";

import { cn } from "@/lib/utils";
import { APP_DOMAIN } from "@/lib/constants";
import { TypographyMuted } from "@/components/typography";
import { BorderBeam } from "@/components/ui/border-beam";

interface BrowserMockupProps {
	url?: string;
	children: React.ReactNode;
	className?: string;
	showBorderBeam?: boolean;
	borderBeamSize?: number;
	borderBeamDuration?: number;
	borderBeamDelay?: number;
	noPadding?: boolean;
}

export function BrowserMockup({
	url = APP_DOMAIN,
	children,
	className,
	showBorderBeam = false,
	borderBeamSize = 300,
	borderBeamDuration = 15,
	borderBeamDelay = 5,
	noPadding = false,
}: BrowserMockupProps) {
	return (
		<div
			className={cn(
				"relative rounded-xl border bg-background shadow-2xl overflow-hidden",
				className
			)}
		>
			<div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
				<div className="flex gap-1.5">
					<div className="h-3 w-3 rounded-full bg-destructive/60" />
					<div className="h-3 w-3 rounded-full bg-warning/60" />
					<div className="h-3 w-3 rounded-full bg-success/60" />
				</div>
				<div className="flex-1 mx-4">
					<div className="h-6 rounded-md bg-muted flex items-center justify-center px-3">
						<TypographyMuted className="text-xs">{url}</TypographyMuted>
					</div>
				</div>
			</div>

			<div
				className={cn(
					"bg-linear-to-br from-muted/30 to-muted/10",
					!noPadding && "p-6"
				)}
			>
				{children}
			</div>

			{showBorderBeam && (
				<BorderBeam size={borderBeamSize} duration={borderBeamDuration} delay={borderBeamDelay} />
			)}
		</div>
	);
}
