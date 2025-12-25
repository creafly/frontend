"use client";

import { IconSparkles, IconBrain, IconMailFilled } from "@tabler/icons-react";
import { Icon } from "@/components/typography";

export function AppMockupContent() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
						<Icon icon={IconSparkles} size="sm" className="text-primary" />
					</div>
					<div className="h-4 w-32 bg-muted rounded" />
				</div>
				<div className="flex gap-2">
					<div className="h-8 w-20 bg-muted rounded-md" />
					<div className="h-8 w-8 bg-primary rounded-md" />
				</div>
			</div>

			<div className="rounded-lg border bg-background p-4 space-y-3">
				<div className="h-6 w-3/4 bg-muted rounded" />
				<div className="h-4 w-full bg-muted/60 rounded" />
				<div className="h-4 w-5/6 bg-muted/60 rounded" />
				<div className="h-20 w-full bg-linear-to-r from-primary/10 to-chart-1/10 rounded-lg border border-dashed border-primary/30 flex items-center justify-center">
					<Icon icon={IconMailFilled} size="xl" className="text-primary/40" />
				</div>
				<div className="h-4 w-2/3 bg-muted/60 rounded" />
				<div className="flex gap-2 pt-2">
					<div className="h-9 w-28 bg-primary rounded-md" />
					<div className="h-9 w-28 bg-muted rounded-md" />
				</div>
			</div>

			<div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
				<div className="flex items-center gap-2 mb-2">
					<Icon icon={IconBrain} size="sm" className="text-primary" />
					<div className="h-3 w-24 bg-primary/30 rounded" />
				</div>
				<div className="h-3 w-full bg-primary/20 rounded mb-1" />
				<div className="h-3 w-4/5 bg-primary/20 rounded" />
			</div>
		</div>
	);
}
