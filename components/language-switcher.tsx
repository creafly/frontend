"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/providers/i18n-provider";
import { IconLanguage } from "@tabler/icons-react";
import { Icon } from "@/components/typography";

const languages = [
	{ code: "en", label: "English" },
	{ code: "ru", label: "Русский" },
] as const;

export function LanguageSwitcher() {
	const { locale, setLocale } = useI18n();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="size-9">
					<Icon icon={IconLanguage} size="sm" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{languages.map((lang) => (
					<DropdownMenuItem
						key={lang.code}
						onClick={() => setLocale(lang.code)}
						className={locale === lang.code ? "bg-accent" : ""}
					>
						{lang.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
