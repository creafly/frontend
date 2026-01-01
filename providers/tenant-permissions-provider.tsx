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

export const TENANT_PERMISSIONS = {
	TEMPLATES_VIEW: "templates:view",
	TEMPLATES_CREATE: "templates:create",
	TEMPLATES_UPDATE: "templates:update",
	TEMPLATES_DELETE: "templates:delete",
	TEMPLATES_MANAGE: "templates:manage",
	MEMBERS_VIEW: "members:view",
	MEMBERS_CREATE: "members:create",
	MEMBERS_UPDATE: "members:update",
	MEMBERS_DELETE: "members:delete",
	MEMBERS_MANAGE: "members:manage",
	ROLES_VIEW: "roles:view",
	ROLES_CREATE: "roles:create",
	ROLES_UPDATE: "roles:update",
	ROLES_DELETE: "roles:delete",
	ROLES_MANAGE: "roles:manage",
	TENANT_VIEW: "tenant:view",
	TENANT_UPDATE: "tenant:update",
	TENANT_DELETE: "tenant:delete",
	TENANT_MANAGE: "tenant:manage",
	BRANDING_VIEW: "branding:view",
	BRANDING_UPDATE: "branding:update",
	BRANDING_MANAGE: "branding:manage",
	ANALYTICS_VIEW: "analytics:view",
	ANALYTICS_MANAGE: "analytics:manage",
	EMAIL_GENERATE: "email:generate",
	EMAIL_PREVIEW: "email:preview",
	EMAIL_MANAGE: "email:manage",
} as const;

export type TenantPermission = (typeof TENANT_PERMISSIONS)[keyof typeof TENANT_PERMISSIONS];

interface Claim {
	id: string;
	type: string;
	value: string;
	createdAt: string;
}

interface TenantPermissionsState {
	claims: Claim[];
	permissions: string[];
	isLoading: boolean;
	error: Error | null;
	tenantId: string | null;
}

interface TenantPermissionsContextValue extends TenantPermissionsState {
	hasPermission: (permission: TenantPermission | string) => boolean;
	hasAllPermissions: (...permissions: (TenantPermission | string)[]) => boolean;
	hasAnyPermission: (...permissions: (TenantPermission | string)[]) => boolean;
	refreshPermissions: () => Promise<void>;
	setTenant: (tenantId: string | null) => void;
}

const TenantPermissionsContext = createContext<TenantPermissionsContextValue | null>(null);

export function TenantPermissionsProvider({ children }: { children: ReactNode }) {
	const { tokens, isAuthenticated } = useAuth();
	const [state, setState] = useState<TenantPermissionsState>({
		claims: [],
		permissions: [],
		isLoading: false,
		error: null,
		tenantId: null,
	});

	const currentTenantIdRef = useRef<string | null>(null);
	const fetchingRef = useRef<string | null>(null);

	const fetchPermissions = useCallback(
		async (tenantId: string | null) => {
			if (!tokens?.accessToken || !isAuthenticated) {
				setState((prev) => ({
					...prev,
					claims: [],
					permissions: [],
					isLoading: false,
					error: null,
				}));
				return;
			}

			if (!tenantId) {
				setState((prev) => ({
					...prev,
					claims: [],
					permissions: [],
					isLoading: false,
					error: null,
					tenantId: null,
				}));
				currentTenantIdRef.current = null;
				return;
			}

			if (fetchingRef.current === tenantId || currentTenantIdRef.current === tenantId) {
				return;
			}

			fetchingRef.current = tenantId;
			currentTenantIdRef.current = tenantId;

			setState((prev) => ({ ...prev, isLoading: true, error: null, tenantId }));

			try {
				const response = await identityApi.getMyClaims(tokens.accessToken, tenantId);
				setState({
					claims: response.claims,
					permissions: response.permissions,
					isLoading: false,
					error: null,
					tenantId,
				});
			} catch (err) {
				setState((prev) => ({
					...prev,
					claims: [],
					permissions: [],
					isLoading: false,
					error: err instanceof Error ? err : new Error("Failed to fetch permissions"),
				}));
			} finally {
				fetchingRef.current = null;
			}
		},
		[tokens?.accessToken, isAuthenticated]
	);

	const setTenant = useCallback(
		(tenantId: string | null) => {
			if (tenantId !== currentTenantIdRef.current) {
				fetchPermissions(tenantId);
			}
		},
		[fetchPermissions]
	);

	const refreshPermissions = useCallback(async () => {
		const tenantId = currentTenantIdRef.current;
		if (tenantId) {
			currentTenantIdRef.current = null;
			fetchingRef.current = null;
			await fetchPermissions(tenantId);
		}
	}, [fetchPermissions]);

	const hasPermission = useCallback(
		(permission: TenantPermission | string): boolean => {
			return state.permissions.includes(permission);
		},
		[state.permissions]
	);

	const hasAllPermissions = useCallback(
		(...permissions: (TenantPermission | string)[]): boolean => {
			return permissions.every((p) => state.permissions.includes(p));
		},
		[state.permissions]
	);

	const hasAnyPermission = useCallback(
		(...permissions: (TenantPermission | string)[]): boolean => {
			return permissions.some((p) => state.permissions.includes(p));
		},
		[state.permissions]
	);

	useEffect(() => {
		if (!isAuthenticated) {
			currentTenantIdRef.current = null;
			fetchingRef.current = null;
			setState({
				claims: [],
				permissions: [],
				isLoading: false,
				error: null,
				tenantId: null,
			});
		}
	}, [isAuthenticated]);

	const value = useMemo<TenantPermissionsContextValue>(
		() => ({
			...state,
			hasPermission,
			hasAllPermissions,
			hasAnyPermission,
			refreshPermissions,
			setTenant,
		}),
		[state, hasPermission, hasAllPermissions, hasAnyPermission, refreshPermissions, setTenant]
	);

	return (
		<TenantPermissionsContext.Provider value={value}>{children}</TenantPermissionsContext.Provider>
	);
}

export function useTenantPermissions(): TenantPermissionsContextValue {
	const context = useContext(TenantPermissionsContext);
	if (!context) {
		throw new Error("useTenantPermissions must be used within a TenantPermissionsProvider");
	}
	return context;
}

export function useCheckTenantPermission(permission: TenantPermission | string) {
	const { hasPermission, isLoading } = useTenantPermissions();
	const can = hasPermission(permission);
	return { can, cannot: !can, isLoading };
}

export function useCheckTenantPermissions(...permissions: (TenantPermission | string)[]) {
	const { hasAllPermissions, hasAnyPermission, isLoading } = useTenantPermissions();
	return {
		canAll: hasAllPermissions(...permissions),
		canAny: hasAnyPermission(...permissions),
		isLoading,
	};
}
