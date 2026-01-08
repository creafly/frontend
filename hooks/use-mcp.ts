"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { mcpApi } from "@/lib/api/mcp";
import type { CreateInstanceRequest, ExtendInstanceRequest } from "@/types/mcp";

interface PaginationParams {
	limit?: number;
	offset?: number;
}

export function useMCPServers(tenantId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["mcp", "servers", tenantId],
		queryFn: () => mcpApi.getServers(tokens!.accessToken, tenantId),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
	});
}

export function useMCPServer(tenantId: string, serverName: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["mcp", "servers", tenantId, serverName],
		queryFn: () => mcpApi.getServer(tokens!.accessToken, tenantId, serverName),
		enabled: !!tokens?.accessToken && !!tenantId && !!serverName,
		retry: false,
	});
}

export function useMCPInstances(tenantId: string, params?: PaginationParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["mcp", "instances", tenantId, params],
		queryFn: () => mcpApi.getInstances(tokens!.accessToken, tenantId, params),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
		refetchInterval: 10000,
	});
}

export function useMCPInstance(tenantId: string, instanceId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["mcp", "instances", tenantId, instanceId],
		queryFn: () => mcpApi.getInstance(tokens!.accessToken, tenantId, instanceId),
		enabled: !!tokens?.accessToken && !!tenantId && !!instanceId,
		retry: false,
		refetchInterval: 5000,
	});
}

export function useMCPInstanceLogs(tenantId: string, instanceId: string, tail: number = 100) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["mcp", "instances", tenantId, instanceId, "logs", tail],
		queryFn: () => mcpApi.getInstanceLogs(tokens!.accessToken, tenantId, instanceId, tail),
		enabled: !!tokens?.accessToken && !!tenantId && !!instanceId,
		retry: false,
		refetchInterval: 3000,
	});
}

export function useCreateMCPInstance() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateInstanceRequest }) =>
			mcpApi.createInstance(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["mcp", "instances", variables.tenantId],
			});
		},
	});
}

export function useStopMCPInstance() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, instanceId }: { tenantId: string; instanceId: string }) =>
			mcpApi.stopInstance(tokens!.accessToken, tenantId, instanceId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["mcp", "instances", variables.tenantId],
			});
		},
	});
}

export function useExtendMCPInstance() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			instanceId,
			request,
		}: {
			tenantId: string;
			instanceId: string;
			request: ExtendInstanceRequest;
		}) => mcpApi.extendInstance(tokens!.accessToken, tenantId, instanceId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["mcp", "instances", variables.tenantId],
			});
		},
	});
}
