export { en, type Translations } from "./locales/en";
export { ru } from "./locales/ru";

import { en } from "./locales/en";
import { ru } from "./locales/ru";

export const locales = {
	en,
	ru,
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = "en";

export function getTranslations(locale: Locale) {
	return locales[locale] ?? locales[defaultLocale];
}
