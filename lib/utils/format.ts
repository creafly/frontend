import type { Locale } from "@/lib/i18n";

export function formatDate(
	dateString: string,
	locale: Locale,
	options?: Intl.DateTimeFormatOptions
): string {
	const localeString = locale === "ru" ? "ru-RU" : "en-US";
	const defaultOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "short",
		day: "numeric",
	};
	return new Date(dateString).toLocaleDateString(localeString, options ?? defaultOptions);
}

export function formatDateTime(dateString: string, locale: Locale): string {
	return formatDate(dateString, locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
