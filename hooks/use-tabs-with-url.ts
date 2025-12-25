"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface UseTabsWithUrlOptions {
	paramName?: string;
	defaultTab: string;
	replace?: boolean;
	scroll?: boolean;
}

interface UseTabsWithUrlReturn {
	activeTab: string;
	setActiveTab: (tab: string) => void;
	tabsProps: {
		value: string;
		onValueChange: (value: string) => void;
	};
}

/**
 * Hook for syncing tab state with URL search params.
 * This allows users to share URLs with specific tabs selected
 * and preserves tab state when navigating back/forward.
 *
 * @example
 * ```tsx
 * const { tabsProps } = useTabsWithUrl({ defaultTab: "general" })
 *
 * <Tabs {...tabsProps}>
 *   <TabsList>
 *     <TabsTrigger value="general">General</TabsTrigger>
 *     <TabsTrigger value="members">Members</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="general">...</TabsContent>
 *   <TabsContent value="members">...</TabsContent>
 * </Tabs>
 * ```
 */
export function useTabsWithUrl(options: UseTabsWithUrlOptions): UseTabsWithUrlReturn {
	const { paramName = "tab", defaultTab, replace = true, scroll = false } = options;

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const activeTab = useMemo(() => {
		return searchParams.get(paramName) || defaultTab;
	}, [searchParams, paramName, defaultTab]);

	const setActiveTab = useCallback(
		(tab: string) => {
			const params = new URLSearchParams(searchParams.toString());

			if (tab === defaultTab) {
				params.delete(paramName);
			} else {
				params.set(paramName, tab);
			}

			const queryString = params.toString();
			const url = queryString ? `${pathname}?${queryString}` : pathname;

			if (replace) {
				router.replace(url, { scroll });
			} else {
				router.push(url, { scroll });
			}
		},
		[router, pathname, searchParams, paramName, defaultTab, replace, scroll]
	);

	const tabsProps = useMemo(
		() => ({
			value: activeTab,
			onValueChange: setActiveTab,
		}),
		[activeTab, setActiveTab]
	);

	return {
		activeTab,
		setActiveTab,
		tabsProps,
	};
}
