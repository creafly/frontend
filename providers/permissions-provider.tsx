"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
	useRef,
	type ReactNode,
} from "react";
import { useAuth } from "./auth-provider";
import { identityApi } from "@/lib/api/identity";

export const PERMISSIONS = {
	ROLES_VIEW: "roles:view",
	ROLES_MANAGE: "roles:manage",
	CLAIMS_VIEW: "claims:view",
	CLAIMS_MANAGE: "claims:manage",
	USERS_VIEW: "users:view",
	USERS_MANAGE: "users:manage",
	SUPPORT_VIEW: "support:view",
	SUPPORT_MANAGE: "support:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

interface Claim {
	id: string;
	type: string;
	value: string;
	createdAt: string;
}

interface PermissionsState {
	claims: Claim[];
	permissions: string[];
	isLoading: boolean;
	error: Error | null;
}

interface PermissionsContextValue extends PermissionsState {
	hasPermission: (permission: Permission | string) => boolean;
	hasAllPermissions: (...permissions: (Permission | string)[]) => boolean;
	hasAnyPermission: (...permissions: (Permission | string)[]) => boolean;
	refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

const getInitialState = (): PermissionsState => ({
	claims: [],
	permissions: [],
	isLoading: false,
	error: null,
});

export function PermissionsProvider({ children }: { children: ReactNode }) {
	const { tokens, isAuthenticated } = useAuth();
	const [state, setState] = useState<PermissionsState>(getInitialState);
	const wasAuthenticatedRef = useRef(isAuthenticated);

	const fetchPermissions = useCallback(async () => {
		const accessToken = tokens?.accessToken;
		if (!accessToken || !isAuthenticated) {
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const response = await identityApi.getMyClaims(accessToken);
			setState({
				claims: response.claims,
				permissions: response.permissions,
				isLoading: false,
				error: null,
			});
		} catch (err) {
			setState({
				claims: [],
				permissions: [],
				isLoading: false,
				error: err instanceof Error ? err : new Error("Failed to fetch permissions"),
			});
		}
	}, [tokens, isAuthenticated]);

	const refreshPermissions = useCallback(async () => {
		await fetchPermissions();
	}, [fetchPermissions]);

	const hasPermission = useCallback(
		(permission: Permission | string): boolean => {
			return state.permissions.includes(permission);
		},
		[state.permissions]
	);

	const hasAllPermissions = useCallback(
		(...permissions: (Permission | string)[]): boolean => {
			return permissions.every((p) => state.permissions.includes(p));
		},
		[state.permissions]
	);

	const hasAnyPermission = useCallback(
		(...permissions: (Permission | string)[]): boolean => {
			return permissions.some((p) => state.permissions.includes(p));
		},
		[state.permissions]
	);

	useEffect(() => {
		const wasAuthenticated = wasAuthenticatedRef.current;
		wasAuthenticatedRef.current = isAuthenticated;

		if (!isAuthenticated && wasAuthenticated) {
			setState(getInitialState());
			return;
		}

		if (isAuthenticated && !wasAuthenticated) {
			fetchPermissions();
		}
	}, [isAuthenticated, fetchPermissions]);

	useEffect(() => {
		if (isAuthenticated && state.claims.length === 0 && !state.isLoading) {
			fetchPermissions();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const value = useMemo<PermissionsContextValue>(
		() => ({
			...state,
			hasPermission,
			hasAllPermissions,
			hasAnyPermission,
			refreshPermissions,
		}),
		[state, hasPermission, hasAllPermissions, hasAnyPermission, refreshPermissions]
	);

	return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions(): PermissionsContextValue {
	const context = useContext(PermissionsContext);
	if (!context) {
		throw new Error("usePermissions must be used within a PermissionsProvider");
	}
	return context;
}

export function useCheckPermission(permission: Permission | string) {
	const { hasPermission, isLoading } = usePermissions();
	const can = hasPermission(permission);
	return { can, cannot: !can, isLoading };
}

export function useCheckPermissions(...permissions: (Permission | string)[]) {
	const { hasAllPermissions, hasAnyPermission, isLoading } = usePermissions();
	return {
		canAll: hasAllPermissions(...permissions),
		canAny: hasAnyPermission(...permissions),
		isLoading,
	};
}
