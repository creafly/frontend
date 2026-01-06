"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/providers/i18n-provider";
import { Icon } from "@/components/typography";
import { IconFile, IconPhoto } from "@tabler/icons-react";
import type { Attachment } from "@/types";

interface UserMessageProps {
	content: string;
	maxLines?: number;
	attachments?: Attachment[];
}

export function UserMessage({ content, maxLines = 4, attachments }: UserMessageProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isClamped, setIsClamped] = useState(false);
	const contentRef = useRef<HTMLParagraphElement>(null);
	const t = useTranslations();

	useEffect(() => {
		if (contentRef.current) {
			const lineHeight = parseInt(getComputedStyle(contentRef.current).lineHeight) || 24;
			const maxHeight = lineHeight * maxLines;
			setIsClamped(contentRef.current.scrollHeight > maxHeight);
		}
	}, [content, maxLines]);

	return (
		<div className="relative space-y-2">
			{attachments && attachments.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-2">
					{attachments.map((attachment, index) => (
						<div key={index} className="relative">
							{attachment.type === "image" ? (
								<a
									href={attachment.url}
									target="_blank"
									rel="noopener noreferrer"
									className="block"
								>
									<img
										src={attachment.url}
										alt={attachment.name}
										className="w-16 h-16 object-cover rounded-lg border border-primary-foreground/20 hover:opacity-80 transition-opacity"
									/>
								</a>
							) : (
								<a
									href={attachment.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2 hover:bg-primary-foreground/20 transition-colors"
								>
									<Icon icon={IconFile} size="sm" className="text-primary-foreground/70" />
									<span className="text-xs text-primary-foreground/70 max-w-24 truncate">
										{attachment.name}
									</span>
								</a>
							)}
						</div>
					))}
				</div>
			)}
			<p
				ref={contentRef}
				className={cn(
					"break-words",
					!isExpanded && isClamped && "line-clamp-4"
				)}
			>
				{content}
			</p>
			{isClamped && (
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className="text-primary-foreground/70 hover:text-primary-foreground text-sm mt-1 underline underline-offset-2"
				>
					{isExpanded ? t.chat.showLess : t.chat.showMore}
				</button>
			)}
		</div>
	);
}
