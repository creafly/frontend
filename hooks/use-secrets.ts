"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { secretsApi } from "@/lib/api/secrets";
import type { CreateSecretRequest, UpdateSecretRequest } from "@/types/secrets";

interface PaginationParams {
	limit?: number;
	offset?: number;
	search?: string;
}

export function useSecrets(tenantId: string, params?: PaginationParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["secrets", tenantId, params],
		queryFn: () => secretsApi.getSecrets(tokens!.accessToken, tenantId, params),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
	});
}

export function useSecret(tenantId: string, secretId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["secrets", tenantId, secretId],
		queryFn: () => secretsApi.getSecret(tokens!.accessToken, tenantId, secretId),
		enabled: !!tokens?.accessToken && !!tenantId && !!secretId,
		retry: false,
	});
}

export function useSecretByName(tenantId: string, name: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["secrets", tenantId, "name", name],
		queryFn: () => secretsApi.getSecretByName(tokens!.accessToken, tenantId, name),
		enabled: !!tokens?.accessToken && !!tenantId && !!name,
		retry: false,
	});
}

export function useCreateSecret() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateSecretRequest }) =>
			secretsApi.createSecret(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["secrets", variables.tenantId],
			});
		},
	});
}

export function useUpdateSecret() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			secretId,
			request,
		}: {
			tenantId: string;
			secretId: string;
			request: UpdateSecretRequest;
		}) => secretsApi.updateSecret(tokens!.accessToken, tenantId, secretId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["secrets", variables.tenantId],
			});
		},
	});
}

export function useDeleteSecret() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, secretId }: { tenantId: string; secretId: string }) =>
			secretsApi.deleteSecret(tokens!.accessToken, tenantId, secretId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["secrets", variables.tenantId],
			});
		},
	});
}
