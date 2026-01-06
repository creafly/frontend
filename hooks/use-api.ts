"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api/client";
import { notificationsApi } from "@/lib/api/notifications";
import { identityApi } from "@/lib/api/identity";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { useAuth } from "@/providers/auth-provider";
import type {
	CreateTemplateInput,
	UpdateTemplateInput,
	EmailGenerateRequest,
	CreateRoleRequest,
	UpdateRoleRequest,
	CreateClaimRequest,
	SubscribeRequest,
	ChangePlanRequest,
	AddMessageRequest,
} from "@/types";

export function useTemplates(
	tenantId: string,
	options?: {
		isActive?: boolean;
		templateType?: string;
		offset?: number;
		limit?: number;
	}
) {
	const api = useApiClient();
	return useQuery({
		queryKey: ["templates", tenantId, options],
		queryFn: () => api.templatesApi.list(options),
		enabled: !!tenantId,
	});
}

export function useTemplate(tenantId: string, id: string) {
	const api = useApiClient();
	return useQuery({
		queryKey: ["template", tenantId, id],
		queryFn: () => api.templatesApi.get(id),
		enabled: !!tenantId && !!id,
	});
}

export function useCreateTemplate() {
	const queryClient = useQueryClient();
	const api = useApiClient();

	return useMutation({
		mutationFn: (input: CreateTemplateInput) => api.templatesApi.create(input),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["templates", variables.tenantId],
			});
		},
	});
}

export function useUpdateTemplate() {
	const queryClient = useQueryClient();
	const api = useApiClient();

	return useMutation({
		mutationFn: ({ id, input }: { tenantId: string; id: string; input: UpdateTemplateInput }) =>
			api.templatesApi.update(id, input),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["templates", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["template", variables.tenantId, variables.id],
			});
		},
	});
}

export function useDeleteTemplate() {
	const queryClient = useQueryClient();
	const api = useApiClient();

	return useMutation({
		mutationFn: ({ id }: { tenantId: string; id: string }) => api.templatesApi.delete(id),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["templates", variables.tenantId],
			});
		},
	});
}

export function useDuplicateTemplate() {
	const queryClient = useQueryClient();
	const api = useApiClient();

	return useMutation({
		mutationFn: ({ id, newName }: { tenantId: string; id: string; newName?: string }) =>
			api.templatesApi.duplicate(id, newName),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["templates", variables.tenantId],
			});
		},
	});
}

export function useBlocks() {
	const api = useApiClient();
	return useQuery({
		queryKey: ["blocks"],
		queryFn: () => api.blocksApi.list(),
	});
}

export function useFonts() {
	const api = useApiClient();
	return useQuery({
		queryKey: ["fonts"],
		queryFn: () => api.fontsApi.list(),
		staleTime: 1000 * 60 * 60,
	});
}

export function useTemplateTypes() {
	const api = useApiClient();
	return useQuery({
		queryKey: ["template-types"],
		queryFn: () => api.templateTypesApi.list(),
		staleTime: 1000 * 60 * 60,
	});
}

export function useSampleBlocks(type: string, subject?: string) {
	const api = useApiClient();
	return useQuery({
		queryKey: ["sample-blocks", type, subject],
		queryFn: () => api.templateTypesApi.getSampleBlocks(type, subject),
		enabled: !!type,
	});
}

export function useGenerateEmail() {
	const api = useApiClient();
	return useMutation({
		mutationFn: (request: EmailGenerateRequest) => api.contentAgentApi.generate(request),
	});
}

export function usePreviewEmail() {
	const api = useApiClient();
	return useMutation({
		mutationFn: (request: EmailGenerateRequest) => api.contentAgentApi.preview(request),
	});
}

export function useEmailJson() {
	const api = useApiClient();
	return useMutation({
		mutationFn: (request: EmailGenerateRequest) => api.contentAgentApi.invoke(request),
	});
}

export function useNotifications() {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["notifications"],
		queryFn: () => notificationsApi.getNotifications(tokens!.accessToken),
		enabled: !!tokens?.accessToken && !isLoading,
	});
}

export function useUnreadNotifications() {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["notifications", "unread"],
		queryFn: () => notificationsApi.getUnreadNotifications(tokens!.accessToken),
		enabled: !!tokens?.accessToken,
	});
}

export function useUnreadNotificationsCount() {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["notifications", "unread", "count"],
		queryFn: () => notificationsApi.getUnreadCount(tokens!.accessToken),
		enabled: !!tokens?.accessToken,
		refetchInterval: 30000,
	});
}

export function useMarkNotificationAsRead() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (id: string) => notificationsApi.markAsRead(tokens!.accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
}

export function useMarkAllNotificationsAsRead() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: () => notificationsApi.markAllAsRead(tokens!.accessToken),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
}

export function useDeleteNotification() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (id: string) => notificationsApi.deleteNotification(tokens!.accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
}

export function useInvitations() {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["invitations"],
		queryFn: () => notificationsApi.getInvitations(tokens!.accessToken),
		enabled: !!tokens?.accessToken,
	});
}

export function useAcceptInvitation() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (id: string) => notificationsApi.acceptInvitation(tokens!.accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invitations"] });
			queryClient.invalidateQueries({ queryKey: ["my-tenants"] });
		},
	});
}

export function useRejectInvitation() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (id: string) => notificationsApi.rejectInvitation(tokens!.accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invitations"] });
		},
	});
}

export function useTenantInvitations(tenantId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["tenant-invitations", tenantId],
		queryFn: () => notificationsApi.getTenantInvitations(tokens!.accessToken, tenantId),
		enabled: !!tokens?.accessToken && !!tenantId,
	});
}

export function useResolveTenantSlug(slug: string | undefined) {
	return useQuery({
		queryKey: ["tenant-resolve", slug],
		queryFn: () => identityApi.resolveTenantSlug(slug!),
		enabled: !!slug,
		staleTime: 1000 * 60 * 5,
	});
}

export function useTenant(tenantId: string | undefined) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["tenant", tenantId],
		queryFn: () => identityApi.getTenant(tokens!.accessToken, tenantId!),
		enabled: !!tokens?.accessToken && !!tenantId,
		staleTime: 1000 * 60 * 5,
	});
}

export function useRoles(offset?: number, limit?: number) {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["roles", offset, limit],
		queryFn: () => identityApi.getRoles(tokens!.accessToken, offset, limit),
		enabled: !!tokens?.accessToken && !isLoading,
	});
}

export function useRole(id: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["role", id],
		queryFn: () => identityApi.getRole(tokens!.accessToken, id),
		enabled: !!tokens?.accessToken && !!id,
	});
}

export function useCreateRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (request: CreateRoleRequest) =>
			identityApi.createRole(tokens!.accessToken, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
		},
	});
}

export function useUpdateRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ id, request }: { id: string; request: UpdateRoleRequest }) =>
			identityApi.updateRole(tokens!.accessToken, id, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			queryClient.invalidateQueries({ queryKey: ["role", variables.id] });
		},
	});
}

export function useDeleteRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (id: string) => identityApi.deleteRole(tokens!.accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
		},
	});
}

export function useRoleClaims(roleId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["role-claims", roleId],
		queryFn: () => identityApi.getRoleClaims(tokens!.accessToken, roleId),
		enabled: !!tokens?.accessToken && !!roleId,
	});
}

export function useAssignClaimToRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ roleId, claimId }: { roleId: string; claimId: string }) =>
			identityApi.assignClaimToRole(tokens!.accessToken, roleId, claimId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["role-claims", variables.roleId],
			});
		},
	});
}

export function useRemoveClaimFromRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ roleId, claimId }: { roleId: string; claimId: string }) =>
			identityApi.removeClaimFromRole(tokens!.accessToken, roleId, claimId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["role-claims", variables.roleId],
			});
		},
	});
}

export function useClaims(offset?: number, limit?: number, enabled: boolean = true) {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["claims", offset, limit],
		queryFn: () => identityApi.getClaims(tokens!.accessToken, offset, limit),
		enabled: !!tokens?.accessToken && !isLoading && enabled,
	});
}

export function useClaim(id: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["claim", id],
		queryFn: () => identityApi.getClaim(tokens!.accessToken, id),
		enabled: !!tokens?.accessToken && !!id,
	});
}

export function useCreateClaim() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (request: CreateClaimRequest) =>
			identityApi.createClaim(tokens!.accessToken, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["claims"] });
		},
	});
}

export function useDeleteClaim() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (id: string) => identityApi.deleteClaim(tokens!.accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["claims"] });
		},
	});
}

export function useUsers(offset?: number, limit?: number) {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["users", offset, limit],
		queryFn: () => identityApi.getUsers(tokens!.accessToken, offset, limit),
		enabled: !!tokens?.accessToken && !isLoading,
	});
}

export function useUser(id: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["user", id],
		queryFn: () => identityApi.getUser(tokens!.accessToken, id),
		enabled: !!tokens?.accessToken && !!id,
	});
}

export function useUserRoles(userId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["user-roles", userId],
		queryFn: () => identityApi.getUserRoles(tokens!.accessToken, userId),
		enabled: !!tokens?.accessToken && !!userId,
	});
}

export function useAssignRoleToUser() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
			identityApi.assignRoleToUser(tokens!.accessToken, userId, roleId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["user-roles", variables.userId],
			});
		},
	});
}

export function useRemoveRoleFromUser() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
			identityApi.removeRoleFromUser(tokens!.accessToken, userId, roleId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["user-roles", variables.userId],
			});
		},
	});
}

export function useUserClaims(userId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["user-claims", userId],
		queryFn: () => identityApi.getUserClaims(tokens!.accessToken, userId),
		enabled: !!tokens?.accessToken && !!userId,
	});
}

export function useAssignClaimToUser() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ userId, claimId }: { userId: string; claimId: string }) =>
			identityApi.assignClaimToUser(tokens!.accessToken, userId, claimId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["user-claims", variables.userId],
			});
		},
	});
}

export function useRemoveClaimFromUser() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ userId, claimId }: { userId: string; claimId: string }) =>
			identityApi.removeClaimFromUser(tokens!.accessToken, userId, claimId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["user-claims", variables.userId],
			});
		},
	});
}

export function useTenantRoles(tenantId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["tenant-roles", tenantId],
		queryFn: () => identityApi.getTenantRoles(tokens!.accessToken, tenantId),
		enabled: !!tokens?.accessToken && !!tenantId,
	});
}

export function useTenantRole(tenantId: string, roleId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["tenant-role", tenantId, roleId],
		queryFn: () => identityApi.getTenantRole(tokens!.accessToken, tenantId, roleId),
		enabled: !!tokens?.accessToken && !!tenantId && !!roleId,
	});
}

export function useCreateTenantRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateRoleRequest }) =>
			identityApi.createTenantRole(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tenant-roles", variables.tenantId],
			});
		},
	});
}

export function useUpdateTenantRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			roleId,
			request,
		}: {
			tenantId: string;
			roleId: string;
			request: UpdateRoleRequest;
		}) => identityApi.updateTenantRole(tokens!.accessToken, tenantId, roleId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tenant-roles", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["tenant-role", variables.tenantId, variables.roleId],
			});
		},
	});
}

export function useDeleteTenantRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, roleId }: { tenantId: string; roleId: string }) =>
			identityApi.deleteTenantRole(tokens!.accessToken, tenantId, roleId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tenant-roles", variables.tenantId],
			});
		},
	});
}

export function useTenantRoleClaims(tenantId: string, roleId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["tenant-role-claims", tenantId, roleId],
		queryFn: () => identityApi.getTenantRoleClaims(tokens!.accessToken, tenantId, roleId),
		enabled: !!tokens?.accessToken && !!tenantId && !!roleId,
	});
}

export function useTenantAvailableClaims(tenantId: string, enabled: boolean = true) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["tenant-available-claims", tenantId],
		queryFn: () => identityApi.getTenantAvailableClaims(tokens!.accessToken, tenantId),
		enabled: !!tokens?.accessToken && !!tenantId && enabled,
	});
}

export function useAssignClaimToTenantRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			roleId,
			claimId,
		}: {
			tenantId: string;
			roleId: string;
			claimId: string;
		}) => identityApi.assignClaimToTenantRole(tokens!.accessToken, tenantId, roleId, claimId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tenant-role-claims", variables.tenantId, variables.roleId],
			});
		},
	});
}

export function useRemoveClaimFromTenantRole() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			roleId,
			claimId,
		}: {
			tenantId: string;
			roleId: string;
			claimId: string;
		}) => identityApi.removeClaimFromTenantRole(tokens!.accessToken, tenantId, roleId, claimId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tenant-role-claims", variables.tenantId, variables.roleId],
			});
		},
	});
}

export function useBatchUpdateTenantRoleClaims() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			roleId,
			assignClaimIds,
			removeClaimIds,
		}: {
			tenantId: string;
			roleId: string;
			assignClaimIds: string[];
			removeClaimIds: string[];
		}) =>
			identityApi.batchUpdateTenantRoleClaims(
				tokens!.accessToken,
				tenantId,
				roleId,
				assignClaimIds,
				removeClaimIds
			),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tenant-role-claims", variables.tenantId, variables.roleId],
			});
		},
	});
}

export function useAllTenants() {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["all-tenants"],
		queryFn: () => identityApi.getAllTenants(tokens!.accessToken),
		enabled: !!tokens?.accessToken,
	});
}

export function useBlockUser() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
			identityApi.blockUser(tokens!.accessToken, userId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useUnblockUser() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (userId: string) => identityApi.unblockUser(tokens!.accessToken, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useBlockTenant() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, reason }: { tenantId: string; reason: string }) =>
			identityApi.blockTenant(tokens!.accessToken, tenantId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
		},
	});
}

export function useUnblockTenant() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (tenantId: string) => identityApi.unblockTenant(tokens!.accessToken, tenantId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
		},
	});
}

export function useTenantUserRoles(tenantId: string, userId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["tenant-user-roles", tenantId, userId],
		queryFn: () => identityApi.getTenantUserRoles(tokens!.accessToken, tenantId, userId),
		enabled: !!tokens?.accessToken && !!tenantId && !!userId,
	});
}

export function useAssignRoleToTenantUser() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			userId,
			roleId,
		}: {
			tenantId: string;
			userId: string;
			roleId: string;
		}) => identityApi.assignRoleToTenantUser(tokens!.accessToken, tenantId, userId, roleId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tenant-user-roles", variables.tenantId, variables.userId],
			});
		},
	});
}

export function useRemoveRoleFromTenantUser() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			userId,
			roleId,
		}: {
			tenantId: string;
			userId: string;
			roleId: string;
		}) => identityApi.removeRoleFromTenantUser(tokens!.accessToken, tenantId, userId, roleId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tenant-user-roles", variables.tenantId, variables.userId],
			});
		},
	});
}

export function useBatchUpdateTenantUserRoles() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			userId,
			assignRoleIds,
			removeRoleIds,
		}: {
			tenantId: string;
			userId: string;
			assignRoleIds: string[];
			removeRoleIds: string[];
		}) =>
			identityApi.batchUpdateTenantUserRoles(
				tokens!.accessToken,
				tenantId,
				userId,
				assignRoleIds,
				removeRoleIds
			),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tenant-user-roles", variables.tenantId, variables.userId],
			});
		},
	});
}

export function usePlans() {
	return useQuery({
		queryKey: ["plans"],
		queryFn: () => subscriptionsApi.getActivePlans(),
		staleTime: 1000 * 60 * 5,
	});
}

export function usePlan(planId: string) {
	return useQuery({
		queryKey: ["plan", planId],
		queryFn: () => subscriptionsApi.getPlanById(planId),
		enabled: !!planId,
	});
}

export function useCurrentSubscription(tenantId: string) {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["subscription", tenantId],
		queryFn: () => subscriptionsApi.getCurrentSubscription(tokens!.accessToken, tenantId),
		enabled: !!tokens?.accessToken && !!tenantId && !isLoading,
		retry: false,
		throwOnError: false,
	});
}

export function useSubscribe() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: SubscribeRequest }) =>
			subscriptionsApi.subscribe(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["subscription", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["trial-eligibility", variables.tenantId],
			});
		},
	});
}

export function useChangePlan() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: ChangePlanRequest }) =>
			subscriptionsApi.changePlan(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["subscription", variables.tenantId],
			});
		},
	});
}

export function useCancelSubscription() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: (tenantId: string) =>
			subscriptionsApi.cancelSubscription(tokens!.accessToken, tenantId),
		onSuccess: (_, tenantId) => {
			queryClient.invalidateQueries({
				queryKey: ["subscription", tenantId],
			});
		},
	});
}

export function useCheckCanGenerate(tenantId: string) {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["can-generate", tenantId],
		queryFn: () => subscriptionsApi.checkCanGenerate(tokens!.accessToken, tenantId),
		enabled: !!tokens?.accessToken && !!tenantId && !isLoading,
		staleTime: 1000 * 60,
	});
}

export function useTrialEligibility(tenantId: string) {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["trial-eligibility", tenantId],
		queryFn: () => subscriptionsApi.checkTrialEligibility(tokens!.accessToken, tenantId),
		enabled: !!tokens?.accessToken && !!tenantId && !isLoading,
	});
}

export function useStartTrial() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, planId }: { tenantId: string; planId: string }) =>
			subscriptionsApi.startTrial(tokens!.accessToken, tenantId, planId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["subscription", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["trial-eligibility", variables.tenantId],
			});
		},
	});
}

export function useUsageSummary(tenantId: string, year?: number, month?: number) {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["usage-summary", tenantId, year, month],
		queryFn: () => subscriptionsApi.getUsageSummary(tokens!.accessToken, tenantId, year, month),
		enabled: !!tokens?.accessToken && !!tenantId && !isLoading,
	});
}

export function useUsageLogs(tenantId: string, limit: number = 10, offset: number = 0) {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["usage-logs", tenantId, limit, offset],
		queryFn: () => subscriptionsApi.getUsageLogs(tokens!.accessToken, tenantId, limit, offset),
		enabled: !!tokens?.accessToken && !!tenantId && !isLoading,
	});
}

export function useIdentityAnalytics() {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["identity-analytics"],
		queryFn: () => identityApi.getAnalytics(tokens!.accessToken),
		enabled: !!tokens?.accessToken && !isLoading,
	});
}

export function useSubscriptionAnalytics() {
	const { tokens, isLoading } = useAuth();

	return useQuery({
		queryKey: ["subscription-analytics"],
		queryFn: () => subscriptionsApi.getAnalytics(tokens!.accessToken),
		enabled: !!tokens?.accessToken && !isLoading,
	});
}

export function useConversations(tenantId: string, options?: { offset?: number; limit?: number }) {
	const api = useApiClient();
	return useQuery({
		queryKey: ["conversations", tenantId, options],
		queryFn: () => api.conversationsApi.list(tenantId, options),
		enabled: !!tenantId,
	});
}

export function useConversation(tenantId: string, conversationId: string | null) {
	const api = useApiClient();
	return useQuery({
		queryKey: ["conversation", tenantId, conversationId],
		queryFn: () => api.conversationsApi.get(tenantId, conversationId!),
		enabled: !!tenantId && !!conversationId,
	});
}

export function useCreateConversation() {
	const queryClient = useQueryClient();
	const api = useApiClient();

	return useMutation({
		mutationFn: ({ tenantId, title }: { tenantId: string; title?: string }) =>
			api.conversationsApi.create({ tenantId, title }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["conversations", variables.tenantId],
			});
		},
	});
}

export function useUpdateConversation() {
	const queryClient = useQueryClient();
	const api = useApiClient();

	return useMutation({
		mutationFn: ({ tenantId, id, title }: { tenantId: string; id: string; title: string }) =>
			api.conversationsApi.update(tenantId, id, title),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["conversations", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["conversation", variables.tenantId, variables.id],
			});
		},
	});
}

export function useDeleteConversation() {
	const queryClient = useQueryClient();
	const api = useApiClient();

	return useMutation({
		mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
			api.conversationsApi.delete(tenantId, id),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["conversations", variables.tenantId],
			});
		},
	});
}

export function useAddMessageToConversation() {
	const queryClient = useQueryClient();
	const api = useApiClient();

	return useMutation({
		mutationFn: ({
			tenantId,
			conversationId,
			message,
		}: {
			tenantId: string;
			conversationId: string;
			message: AddMessageRequest;
		}) => api.conversationsApi.addMessage(tenantId, conversationId, message),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({
				queryKey: ["conversation", variables.tenantId, variables.conversationId],
			});

			const previousData = queryClient.getQueryData<{ conversation: import("@/types").ConversationWithMessages }>([
				"conversation",
				variables.tenantId,
				variables.conversationId,
			]);

			if (previousData) {
				const optimisticMessage: import("@/types").ConversationMessage = {
					id: `temp-${Date.now()}`,
					conversationId: variables.conversationId,
					role: variables.message.role,
					content: variables.message.content,
					type: variables.message.type,
					html: variables.message.html,
					template: variables.message.template,
					subject: variables.message.subject,
					summary: variables.message.summary,
					props: variables.message.props,
					blocks: variables.message.blocks,
					tokenUsage: variables.message.tokenUsage,
					imageContent: variables.message.imageContent,
					videoContent: variables.message.videoContent,
					attachments: variables.message.attachments,
					createdAt: new Date().toISOString(),
				};

				queryClient.setQueryData<{ conversation: import("@/types").ConversationWithMessages }>(
					["conversation", variables.tenantId, variables.conversationId],
					{
						conversation: {
							...previousData.conversation,
							messages: [...previousData.conversation.messages, optimisticMessage],
						},
					}
				);
			}

			return { previousData };
		},
		onError: (_, variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(
					["conversation", variables.tenantId, variables.conversationId],
					context.previousData
				);
			}
		},
		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["conversations", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["conversation", variables.tenantId, variables.conversationId],
			});
		},
	});
}
