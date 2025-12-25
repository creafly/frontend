"use client";

import { createContext, useContext, type ReactNode } from "react";
import { FlagProvider, useFlag, useVariant, useFlagsStatus } from "@unleash/proxy-client-react";
import type { IConfig } from "@unleash/proxy-client-react";

const UNLEASH_URL = process.env.NEXT_PUBLIC_UNLEASH_URL || "";
const UNLEASH_CLIENT_KEY = process.env.NEXT_PUBLIC_UNLEASH_CLIENT_KEY || "";
const UNLEASH_APP_NAME = process.env.NEXT_PUBLIC_UNLEASH_APP_NAME || "frontend";

interface FeatureFlagsContextValue {
	isEnabled: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
	isEnabled: false,
});

interface FeatureFlagsProviderProps {
	children: ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
	if (!UNLEASH_URL || !UNLEASH_CLIENT_KEY) {
		return (
			<FeatureFlagsContext.Provider value={{ isEnabled: false }}>
				{children}
			</FeatureFlagsContext.Provider>
		);
	}

	const config: IConfig = {
		url: UNLEASH_URL,
		clientKey: UNLEASH_CLIENT_KEY,
		appName: UNLEASH_APP_NAME,
		refreshInterval: 15,
		disableMetrics: true,
	};

	return (
		<FeatureFlagsContext.Provider value={{ isEnabled: true }}>
			<FlagProvider config={config}>{children}</FlagProvider>
		</FeatureFlagsContext.Provider>
	);
}

export function useFeatureFlagsContext(): FeatureFlagsContextValue {
	return useContext(FeatureFlagsContext);
}

export function useFeatureFlag(flagName: string): boolean {
	const { isEnabled: isUnleashEnabled } = useFeatureFlagsContext();
	const flagValue = useFlag(flagName);

	if (!isUnleashEnabled) {
		return false;
	}

	return flagValue;
}

export function useFeatureVariant(flagName: string) {
	const { isEnabled: isUnleashEnabled } = useFeatureFlagsContext();
	const variant = useVariant(flagName);

	if (!isUnleashEnabled) {
		return undefined;
	}

	return variant;
}

export function useFeatureFlagsStatus() {
	const { isEnabled: isUnleashEnabled } = useFeatureFlagsContext();
	const status = useFlagsStatus();

	if (!isUnleashEnabled) {
		return { flagsReady: true, flagsError: null };
	}

	return status;
}

export function Feature({
	flag,
	children,
	fallback = null,
}: {
	flag: string;
	children: ReactNode;
	fallback?: ReactNode;
}) {
	const isEnabled = useFeatureFlag(flag);
	return isEnabled ? <>{children}</> : <>{fallback}</>;
}

export function HideIfEnabled({
	flag,
	children,
	fallback = null,
}: {
	flag: string;
	children: ReactNode;
	fallback?: ReactNode;
}) {
	const isEnabled = useFeatureFlag(flag);
	return isEnabled ? <>{fallback}</> : <>{children}</>;
}
