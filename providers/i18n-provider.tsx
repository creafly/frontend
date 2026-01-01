"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { type Locale, type Translations, getTranslations, defaultLocale } from "@/lib/i18n";

interface I18nContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: Translations;
	isHydrated: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "app-locale";

function getStoredLocale(): Locale | null {
	if (typeof window === "undefined") return null;

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "en" || stored === "ru") return stored;

	return null;
}

function getBrowserLocale(): Locale {
	if (typeof window === "undefined") return defaultLocale;

	const browserLang = navigator.language.split("-")[0];
	if (browserLang === "ru") return "ru";

	return defaultLocale;
}

function getInitialLocale(): Locale {
	if (typeof window === "undefined") return defaultLocale;
	return getStoredLocale() ?? getBrowserLocale();
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
	const [isHydrated] = useState(typeof window !== "undefined");

	const setLocale = useCallback((newLocale: Locale) => {
		setLocaleState(newLocale);
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_KEY, newLocale);
		}
	}, []);

	const t = useMemo(() => getTranslations(locale), [locale]);

	const value = useMemo(
		() => ({
			locale,
			setLocale,
			t,
			isHydrated,
		}),
		[locale, setLocale, t, isHydrated]
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
}

export function useTranslations() {
	return useI18n().t;
}

export function useLocale() {
	return useI18n().locale;
}
