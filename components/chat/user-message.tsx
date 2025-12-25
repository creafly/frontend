"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/providers/i18n-provider";

interface UserMessageProps {
	content: string;
	maxLines?: number;
}

export function UserMessage({ content, maxLines = 4 }: UserMessageProps) {
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
		<div className="relative">
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
