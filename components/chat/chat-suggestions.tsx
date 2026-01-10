"use client";

import { Icon } from "@/components/typography";
import { IconMail, IconLock, IconNews, IconShoppingCart, IconPhoto, IconVideo, IconSparkles, IconPalette, IconMovie, IconBrandInstagram } from "@tabler/icons-react";
import { useTranslations } from "@/providers/i18n-provider";
import type { ContentType } from "@/types";

interface ChatSuggestionsProps {
	contentType: ContentType;
	onSelect: (text: string) => void;
}

export function ChatSuggestions({ contentType, onSelect }: ChatSuggestionsProps) {
	const t = useTranslations();

	const templateSuggestions = [
		{ icon: IconMail, text: t.chat.examples.welcome },
		{ icon: IconLock, text: t.chat.examples.passwordReset },
		{ icon: IconNews, text: t.chat.examples.newsletter },
		{ icon: IconShoppingCart, text: t.chat.examples.orderConfirmation },
	];

	const imageSuggestions = [
		{ icon: IconSparkles, text: t.chat.suggestions?.image?.hero || "Generate a hero image for landing page" },
		{ icon: IconPalette, text: t.chat.suggestions?.image?.product || "Create a product showcase image" },
		{ icon: IconPhoto, text: t.chat.suggestions?.image?.banner || "Design a promotional banner" },
		{ icon: IconBrandInstagram, text: t.chat.suggestions?.image?.social || "Create social media post image" },
	];

	const videoSuggestions = [
		{ icon: IconMovie, text: t.chat.suggestions?.video?.promo || "Create a promotional video intro" },
		{ icon: IconSparkles, text: t.chat.suggestions?.video?.product || "Generate product demo animation" },
		{ icon: IconVideo, text: t.chat.suggestions?.video?.social || "Make a short social media video" },
		{ icon: IconBrandInstagram, text: t.chat.suggestions?.video?.story || "Create an Instagram story video" },
	];

	const suggestions = contentType === "template" ? templateSuggestions : contentType === "image" ? imageSuggestions : videoSuggestions;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
			{suggestions.map((item, index) => (
				<button
					key={index}
					onClick={() => onSelect(item.text)}
					className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all text-left group"
				>
					<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
						<Icon icon={item.icon} size="md" className="text-primary" />
					</div>
					<span className="text-sm font-medium">{item.text}</span>
				</button>
			))}
		</div>
	);
}
