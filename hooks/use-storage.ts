"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { storageApi } from "@/lib/api/storage";
import type { ListFilesParams, FileType } from "@/types/storage";

export function useFiles(tenantId: string, params?: ListFilesParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["files", tenantId, params],
		queryFn: () => storageApi.list(tokens!.accessToken, tenantId, params),
		enabled: !!tenantId && !!tokens?.accessToken,
	});
}

export function useFile(tenantId: string, fileId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["file", tenantId, fileId],
		queryFn: () => storageApi.getById(tokens!.accessToken, tenantId, fileId),
		enabled: !!tenantId && !!fileId && !!tokens?.accessToken,
	});
}

export function useUploadFile() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			file,
			fileType,
		}: {
			tenantId: string;
			file: File;
			fileType?: FileType;
		}) => storageApi.upload(tokens!.accessToken, tenantId, file, fileType),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["files", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["storage-usage", variables.tenantId],
			});
		},
	});
}

export function useDeleteFile() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, fileId }: { tenantId: string; fileId: string }) =>
			storageApi.delete(tokens!.accessToken, tenantId, fileId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["files", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["storage-usage", variables.tenantId],
			});
		},
	});
}

export function usePresignedUrl(tenantId: string, fileId: string, expiryMinutes?: number) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["presigned-url", tenantId, fileId, expiryMinutes],
		queryFn: () => storageApi.getPresignedUrl(tokens!.accessToken, tenantId, fileId, expiryMinutes),
		enabled: !!tenantId && !!fileId && !!tokens?.accessToken,
		staleTime: (expiryMinutes || 60) * 60 * 1000 * 0.9,
	});
}

export function useGetPresignedUrl() {
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			fileId,
			expiryMinutes,
		}: {
			tenantId: string;
			fileId: string;
			expiryMinutes?: number;
		}) => storageApi.getPresignedUrl(tokens!.accessToken, tenantId, fileId, expiryMinutes),
	});
}

export function useStorageUsage(tenantId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["storage-usage", tenantId],
		queryFn: () => storageApi.getUsage(tokens!.accessToken, tenantId),
		enabled: !!tenantId && !!tokens?.accessToken,
	});
}
