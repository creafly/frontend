"use client";

import { createContext, useContext, useState, useCallback } from "react";

export interface CookiePreferences {
	necessary: boolean;
	analytics: boolean;
	marketing: boolean;
}

interface CookieConsentContextType {
	hasConsent: boolean;
	preferences: CookiePreferences;
	showBanner: boolean;
	acceptAll: () => void;
	acceptNecessary: () => void;
	savePreferences: (preferences: CookiePreferences) => void;
	openSettings: () => void;
	closeSettings: () => void;
	isSettingsOpen: boolean;
}

const COOKIE_CONSENT_KEY = "hexaend_cookie_consent";
const COOKIE_PREFERENCES_KEY = "hexaend_cookie_preferences";

const defaultPreferences: CookiePreferences = {
	necessary: true,
	analytics: false,
	marketing: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

function getInitialState() {
	if (typeof window === "undefined") {
		return { hasConsent: false, showBanner: false, preferences: defaultPreferences };
	}

	const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
	const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

	if (consent === "true") {
		let prefs = defaultPreferences;
		if (savedPreferences) {
			try {
				prefs = JSON.parse(savedPreferences);
			} catch {
				prefs = defaultPreferences;
			}
		}
		return { hasConsent: true, showBanner: false, preferences: prefs };
	}

	return { hasConsent: false, showBanner: true, preferences: defaultPreferences };
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
	const [state] = useState(getInitialState);
	const [hasConsent, setHasConsent] = useState(state.hasConsent);
	const [showBanner, setShowBanner] = useState(state.showBanner);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [preferences, setPreferences] = useState<CookiePreferences>(state.preferences);

	const acceptAll = useCallback(() => {
		const allAccepted: CookiePreferences = {
			necessary: true,
			analytics: true,
			marketing: true,
		};
		localStorage.setItem(COOKIE_CONSENT_KEY, "true");
		localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
		setPreferences(allAccepted);
		setHasConsent(true);
		setShowBanner(false);
		setIsSettingsOpen(false);
	}, []);

	const acceptNecessary = useCallback(() => {
		const necessaryOnly: CookiePreferences = {
			necessary: true,
			analytics: false,
			marketing: false,
		};
		localStorage.setItem(COOKIE_CONSENT_KEY, "true");
		localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(necessaryOnly));
		setPreferences(necessaryOnly);
		setHasConsent(true);
		setShowBanner(false);
		setIsSettingsOpen(false);
	}, []);

	const savePreferences = useCallback((newPreferences: CookiePreferences) => {
		const prefs = { ...newPreferences, necessary: true };
		localStorage.setItem(COOKIE_CONSENT_KEY, "true");
		localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
		setPreferences(prefs);
		setHasConsent(true);
		setShowBanner(false);
		setIsSettingsOpen(false);
	}, []);

	const openSettings = useCallback(() => {
		setIsSettingsOpen(true);
	}, []);

	const closeSettings = useCallback(() => {
		setIsSettingsOpen(false);
	}, []);

	return (
		<CookieConsentContext.Provider
			value={{
				hasConsent,
				preferences,
				showBanner,
				acceptAll,
				acceptNecessary,
				savePreferences,
				openSettings,
				closeSettings,
				isSettingsOpen,
			}}
		>
			{children}
		</CookieConsentContext.Provider>
	);
}

export function useCookieConsent() {
	const context = useContext(CookieConsentContext);
	if (!context) {
		throw new Error("useCookieConsent must be used within a CookieConsentProvider");
	}
	return context;
}
