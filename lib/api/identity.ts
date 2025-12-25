import type {
	LoginRequest,
	RegisterRequest,
	ChangePasswordRequest,
	AuthResponse,
	MeResponse,
	CreateTenantRequest,
	UpdateTenantRequest,
	TenantResponse,
	TenantsListResponse,
	User,
	Role,
	CreateRoleRequest,
	UpdateRoleRequest,
	CreateClaimRequest,
	RoleResponse,
	RolesListResponse,
	ClaimResponse,
	ClaimsListResponse,
	RoleClaimsResponse,
	UserRolesResponse,
	UserClaimsResponse,
	UsersListResponse,
	AllTenantsListResponse,
} from "@/types";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const IDENTITY_API_URL = process.env.NEXT_PUBLIC_IDENTITY_URL || "http://localhost:8080";

const serviceFetch = createServiceFetch(IDENTITY_API_URL);

class IdentityApiError extends ApiError {
	constructor(status: number, message: string, code?: string) {
		super(status, message, code);
		this.name = "IdentityApiError";
	}
}

async function fetchIdentityApi<T>(
	endpoint: string,
	options?: FetchOptions
): Promise<T> {
	return serviceFetch<T>(endpoint, options);
}

async function fetchWithAuth<T>(
	endpoint: string,
	accessToken: string,
	options?: FetchOptions
): Promise<T> {
	return serviceFetch<T>(endpoint, {
		...options,
		accessToken,
	});
}

export const identityApi = {
	register: async (request: RegisterRequest) => {
		return fetchIdentityApi<AuthResponse>("/api/v1/auth/register", {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	login: async (request: LoginRequest) => {
		return fetchIdentityApi<AuthResponse>("/api/v1/auth/login", {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	loginVerifyTOTP: async (tempToken: string, code: string) => {
		return fetchIdentityApi<AuthResponse>("/api/v1/auth/login/verify-totp", {
			method: "POST",
			body: JSON.stringify({ tempToken, code }),
		});
	},

	refresh: async (refreshToken: string) => {
		return fetchIdentityApi<AuthResponse>("/api/v1/auth/refresh", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		});
	},

	me: async (accessToken: string) => {
		return fetchWithAuth<MeResponse>("/api/v1/me", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	updateProfile: async (
		accessToken: string,
		data: {
			firstName?: string;
			lastName?: string;
			username?: string;
			avatarUrl?: string;
			locale?: string;
		}
	) => {
		return fetchWithAuth<MeResponse>("/api/v1/me", accessToken, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	},

	changePassword: async (accessToken: string, request: ChangePasswordRequest) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			"/api/v1/change-password",
			accessToken,
			{
				method: "POST",
				body: JSON.stringify(request),
			}
		);
	},

	getMyTenants: async (accessToken: string) => {
		return fetchWithAuth<TenantsListResponse>("/api/v1/my-tenants", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	createTenant: async (accessToken: string, request: CreateTenantRequest) => {
		return fetchWithAuth<TenantResponse>("/api/v1/tenants", accessToken, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	getTenant: async (accessToken: string, id: string) => {
		return fetchWithAuth<TenantResponse>(`/api/v1/tenants/${id}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	resolveTenantSlug: async (slug: string) => {
		return fetchIdentityApi<{
			id: string;
			slug: string;
			name: string;
			displayName: string;
			isActive: boolean;
		}>(`/api/v1/internal/tenants/resolve/${slug}`, {
			method: "GET",
			skipContentType: true,
		});
	},

	updateTenant: async (accessToken: string, id: string, request: UpdateTenantRequest) => {
		return fetchWithAuth<TenantResponse>(`/api/v1/tenants/${id}`, accessToken, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteTenant: async (accessToken: string, id: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${id}`,
			accessToken,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	getTenantMembers: async (accessToken: string, tenantId: string) => {
		return fetchWithAuth<User[]>(`/api/v1/tenants/${tenantId}/members`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	addTenantMember: async (
		accessToken: string,
		tenantId: string,
		identifier: { email?: string; username?: string; userId?: string }
	) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/invite`,
			accessToken,
			{
				method: "POST",
				body: JSON.stringify(identifier),
			}
		);
	},

	removeTenantMember: async (accessToken: string, tenantId: string, userId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/members/${userId}`,
			accessToken,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	getTotpStatus: async (accessToken: string) => {
		return fetchWithAuth<{ enabled: boolean }>("/api/v1/2fa/status", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	setupTotp: async (accessToken: string) => {
		return fetchWithAuth<{
			message: string;
			data: {
				secret: string;
				qrCodeUrl: string;
				qrCodePng: string;
			};
		}>("/api/v1/2fa/setup", accessToken, {
			method: "POST",
			skipContentType: true,
		});
	},

	enableTotp: async (accessToken: string, code: string) => {
		return fetchWithAuth<{ message: string; error?: string }>("/api/v1/2fa/enable", accessToken, {
			method: "POST",
			body: JSON.stringify({ code }),
		});
	},

	disableTotp: async (accessToken: string, password: string) => {
		return fetchWithAuth<{ message: string; error?: string }>("/api/v1/2fa/disable", accessToken, {
			method: "POST",
			body: JSON.stringify({ password }),
		});
	},

	validateTotp: async (accessToken: string, code: string) => {
		return fetchWithAuth<{ valid: boolean; error?: string }>("/api/v1/2fa/validate", accessToken, {
			method: "POST",
			body: JSON.stringify({ code }),
		});
	},

	getMyClaims: async (accessToken: string, tenantId?: string) => {
		const params = tenantId ? `?tenantId=${tenantId}` : "";
		return fetchWithAuth<{
			claims: Array<{
				id: string;
				type: string;
				value: string;
				createdAt: string;
			}>;
			permissions: string[];
		}>(`/api/v1/my-claims${params}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	getRoles: async (accessToken: string, offset?: number, limit?: number) => {
		const params = new URLSearchParams();
		if (offset !== undefined) params.append("offset", offset.toString());
		if (limit !== undefined) params.append("limit", limit.toString());
		const queryString = params.toString() ? `?${params.toString()}` : "";

		return fetchWithAuth<RolesListResponse>(`/api/v1/roles${queryString}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	getRole: async (accessToken: string, id: string) => {
		return fetchWithAuth<RoleResponse>(`/api/v1/roles/${id}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	createRole: async (accessToken: string, request: CreateRoleRequest) => {
		return fetchWithAuth<RoleResponse>("/api/v1/roles", accessToken, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateRole: async (accessToken: string, id: string, request: UpdateRoleRequest) => {
		return fetchWithAuth<RoleResponse>(`/api/v1/roles/${id}`, accessToken, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteRole: async (accessToken: string, id: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(`/api/v1/roles/${id}`, accessToken, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	getRoleClaims: async (accessToken: string, roleId: string) => {
		return fetchWithAuth<RoleClaimsResponse>(`/api/v1/roles/${roleId}/claims`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	assignClaimToRole: async (accessToken: string, roleId: string, claimId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/roles/${roleId}/claims`,
			accessToken,
			{
				method: "POST",
				body: JSON.stringify({ claimId }),
			}
		);
	},

	removeClaimFromRole: async (accessToken: string, roleId: string, claimId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/roles/${roleId}/claims/${claimId}`,
			accessToken,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	getClaims: async (accessToken: string, offset?: number, limit?: number) => {
		const params = new URLSearchParams();
		if (offset !== undefined) params.append("offset", offset.toString());
		if (limit !== undefined) params.append("limit", limit.toString());
		const queryString = params.toString() ? `?${params.toString()}` : "";

		return fetchWithAuth<ClaimsListResponse>(`/api/v1/claims${queryString}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	getClaim: async (accessToken: string, id: string) => {
		return fetchWithAuth<ClaimResponse>(`/api/v1/claims/${id}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	createClaim: async (accessToken: string, request: CreateClaimRequest) => {
		return fetchWithAuth<ClaimResponse>("/api/v1/claims", accessToken, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	deleteClaim: async (accessToken: string, id: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/claims/${id}`,
			accessToken,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	getUserRoles: async (accessToken: string, userId: string) => {
		return fetchWithAuth<UserRolesResponse>(`/api/v1/users/${userId}/roles`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	assignRoleToUser: async (accessToken: string, userId: string, roleId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/users/${userId}/roles`,
			accessToken,
			{
				method: "POST",
				body: JSON.stringify({ roleId }),
			}
		);
	},

	removeRoleFromUser: async (accessToken: string, userId: string, roleId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/users/${userId}/roles/${roleId}`,
			accessToken,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	getUserClaims: async (accessToken: string, userId: string) => {
		return fetchWithAuth<UserClaimsResponse>(`/api/v1/users/${userId}/claims`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	assignClaimToUser: async (accessToken: string, userId: string, claimId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/users/${userId}/claims`,
			accessToken,
			{
				method: "POST",
				body: JSON.stringify({ claimId }),
			}
		);
	},

	removeClaimFromUser: async (accessToken: string, userId: string, claimId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/users/${userId}/claims/${claimId}`,
			accessToken,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	getTenantRoles: async (accessToken: string, tenantId: string) => {
		return fetchWithAuth<Role[]>(`/api/v1/tenants/${tenantId}/roles`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	getTenantRole: async (accessToken: string, tenantId: string, roleId: string) => {
		return fetchWithAuth<RoleResponse>(`/api/v1/tenants/${tenantId}/roles/${roleId}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	createTenantRole: async (accessToken: string, tenantId: string, request: CreateRoleRequest) => {
		return fetchWithAuth<RoleResponse>(`/api/v1/tenants/${tenantId}/roles`, accessToken, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateTenantRole: async (
		accessToken: string,
		tenantId: string,
		roleId: string,
		request: UpdateRoleRequest
	) => {
		return fetchWithAuth<RoleResponse>(`/api/v1/tenants/${tenantId}/roles/${roleId}`, accessToken, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteTenantRole: async (accessToken: string, tenantId: string, roleId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/roles/${roleId}`,
			accessToken,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	getTenantUserRoles: async (accessToken: string, tenantId: string, userId: string) => {
		return fetchWithAuth<UserRolesResponse>(
			`/api/v1/tenants/${tenantId}/users/${userId}/roles`,
			accessToken,
			{
				method: "GET",
				skipContentType: true,
			}
		);
	},

	assignRoleToTenantUser: async (
		accessToken: string,
		tenantId: string,
		userId: string,
		roleId: string
	) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/users/${userId}/roles`,
			accessToken,
			{
				method: "POST",
				body: JSON.stringify({ roleId }),
			}
		);
	},

	removeRoleFromTenantUser: async (
		accessToken: string,
		tenantId: string,
		userId: string,
		roleId: string
	) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/users/${userId}/roles/${roleId}`,
			accessToken,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	batchUpdateTenantUserRoles: async (
		accessToken: string,
		tenantId: string,
		userId: string,
		assignRoleIds: string[],
		removeRoleIds: string[]
	) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/users/${userId}/roles`,
			accessToken,
			{
				method: "PUT",
				body: JSON.stringify({
					assignRoleIds,
					removeRoleIds,
				}),
			}
		);
	},

	assignClaimToTenantRole: async (
		accessToken: string,
		tenantId: string,
		roleId: string,
		claimId: string
	) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/roles/${roleId}/claims`,
			accessToken,
			{
				method: "POST",
				body: JSON.stringify({ claimId }),
			}
		);
	},

	getTenantRoleClaims: async (accessToken: string, tenantId: string, roleId: string) => {
		return fetchWithAuth<Array<{ id: string; value: string; createdAt: string }>>(
			`/api/v1/tenants/${tenantId}/roles/${roleId}/claims`,
			accessToken,
			{
				method: "GET",
				skipContentType: true,
			}
		);
	},

	removeClaimFromTenantRole: async (
		accessToken: string,
		tenantId: string,
		roleId: string,
		claimId: string
	) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/roles/${roleId}/claims/${claimId}`,
			accessToken,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	getTenantAvailableClaims: async (accessToken: string, tenantId: string) => {
		return fetchWithAuth<Array<{ id: string; value: string; createdAt: string }>>(
			`/api/v1/tenants/${tenantId}/claims`,
			accessToken,
			{
				method: "GET",
				skipContentType: true,
			}
		);
	},

	batchUpdateTenantRoleClaims: async (
		accessToken: string,
		tenantId: string,
		roleId: string,
		assignClaimIds: string[],
		removeClaimIds: string[]
	) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/roles/${roleId}/claims`,
			accessToken,
			{
				method: "PUT",
				body: JSON.stringify({ assignClaimIds, removeClaimIds }),
			}
		);
	},

	getUsers: async (accessToken: string, offset?: number, limit?: number) => {
		const params = new URLSearchParams();
		if (offset !== undefined) params.append("offset", offset.toString());
		if (limit !== undefined) params.append("limit", limit.toString());
		const queryString = params.toString() ? `?${params.toString()}` : "";

		return fetchWithAuth<UsersListResponse>(`/api/v1/users${queryString}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	getUser: async (accessToken: string, id: string) => {
		return fetchWithAuth<{ user?: User; error?: string }>(`/api/v1/users/${id}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	getAllTenants: async (accessToken: string) => {
		return fetchWithAuth<AllTenantsListResponse>("/api/v1/tenants", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	inviteTenantMember: async (accessToken: string, tenantId: string, email: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/tenants/${tenantId}/invite`,
			accessToken,
			{
				method: "POST",
				body: JSON.stringify({ email }),
			}
		);
	},

	blockUser: async (accessToken: string, userId: string, reason: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/users/${userId}/block`,
			accessToken,
			{
				method: "POST",
				body: JSON.stringify({ reason }),
			}
		);
	},

	unblockUser: async (accessToken: string, userId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/users/${userId}/unblock`,
			accessToken,
			{
				method: "POST",
				skipContentType: true,
			}
		);
	},

	forgotPassword: async (email: string) => {
		return fetchIdentityApi<{ message?: string; error?: string }>("/api/v1/auth/forgot-password", {
			method: "POST",
			body: JSON.stringify({ email }),
		});
	},

	resetPassword: async (token: string, newPassword: string) => {
		return fetchIdentityApi<{ message?: string; error?: string }>("/api/v1/auth/reset-password", {
			method: "POST",
			body: JSON.stringify({ token, newPassword }),
		});
	},

	getAnalytics: async (accessToken: string) => {
		return fetchWithAuth<{
			users: {
				totalUsers: number;
				activeUsers: number;
				blockedUsers: number;
				newUsersThisMonth: number;
				mau: number;
				dau: number;
				totalTenants: number;
			};
		}>("/api/v1/admin/analytics", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	blockTenant: async (accessToken: string, tenantId: string, reason: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/admin/tenants/${tenantId}/block`,
			accessToken,
			{
				method: "POST",
				body: JSON.stringify({ reason }),
			}
		);
	},

	unblockTenant: async (accessToken: string, tenantId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/admin/tenants/${tenantId}/unblock`,
			accessToken,
			{
				method: "POST",
				skipContentType: true,
			}
		);
	},

	verifyEmail: async (accessToken: string, code: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			"/api/v1/verify-email",
			accessToken,
			{
				method: "POST",
				body: JSON.stringify({ code }),
			}
		);
	},

	resendVerificationEmail: async (accessToken: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			"/api/v1/resend-verification",
			accessToken,
			{
				method: "POST",
				skipContentType: true,
			}
		);
	},
};

export { IdentityApiError };
