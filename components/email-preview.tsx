"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconDeviceDesktop, IconDeviceTablet, IconDeviceMobile } from "@tabler/icons-react";
import { type ViewportSize, getIframeWidth } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EmailPreviewProps {
	html: string;
	defaultViewport?: ViewportSize;
	height?: string;
	fullWidth?: boolean;
	showCard?: boolean;
	headerContent?: React.ReactNode;
}

export function EmailPreview({
	html,
	defaultViewport = "desktop",
	fullWidth = false,
	showCard = true,
	headerContent,
}: EmailPreviewProps) {
	const [viewportSize, setViewportSize] = useState<ViewportSize>(defaultViewport);

	const content = (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between pb-3 shrink-0">
				{headerContent}
				<Tabs value={viewportSize} onValueChange={(v) => setViewportSize(v as ViewportSize)}>
					<TabsList>
						<TabsTrigger value="desktop">
							<IconDeviceDesktop className="size-4" />
						</TabsTrigger>
						<TabsTrigger value="tablet">
							<IconDeviceTablet className="size-4" />
						</TabsTrigger>
						<TabsTrigger value="mobile">
							<IconDeviceMobile className="size-4" />
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<div className="flex-1 flex justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/20">
				<iframe
					srcDoc={html}
					className="bg-white"
					style={{
						width: getIframeWidth(viewportSize),
						height: "100%",
						maxWidth: "100%",
					}}
				/>
			</div>
		</div>
	);

	if (!showCard) {
		return content;
	}

	return (
		<Card clear className="h-full">
			<CardContent className={cn("h-full", fullWidth && "max-w-full w-full")}>
				{content}
			</CardContent>
		</Card>
	);
}

interface InlineEmailPreviewProps {
	html: string;
	subject?: string;
	defaultViewport?: ViewportSize;
	headerContent?: React.ReactNode;
}

export function InlineEmailPreview({
	html,
	subject,
	defaultViewport = "desktop",
	headerContent,
}: InlineEmailPreviewProps) {
	const [viewportSize, setViewportSize] = useState<ViewportSize>(defaultViewport);

	return (
		<div className="overflow-hidden rounded-xl border border-border/50 bg-background shadow-lg shadow-black/5">
			<div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30">
				<span className="text-sm font-medium text-foreground truncate flex-1 mr-3">{subject}</span>
				<div className="flex items-center gap-2">
					<Tabs value={viewportSize} onValueChange={(v) => setViewportSize(v as ViewportSize)}>
						<TabsList className="h-8">
							<TabsTrigger value="desktop" className="px-2.5 py-1.5">
								<IconDeviceDesktop className="size-4" />
							</TabsTrigger>
							<TabsTrigger value="tablet" className="px-2.5 py-1.5">
								<IconDeviceTablet className="size-4" />
							</TabsTrigger>
							<TabsTrigger value="mobile" className="px-2.5 py-1.5">
								<IconDeviceMobile className="size-4" />
							</TabsTrigger>
						</TabsList>
					</Tabs>
					{headerContent}
				</div>
			</div>
			<div className="flex justify-center bg-muted/20">
				<iframe
					srcDoc={html}
					className="bg-white"
					style={{
						width: getIframeWidth(viewportSize),
						height: "400px",
						maxWidth: "100%",
					}}
					title={`Email preview: ${subject}`}
				/>
			</div>
		</div>
	);
}
