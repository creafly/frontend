"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { storageApi } from "@/lib/api/storage";
import type {
	ListFilesParams,
	FileType,
	ListFoldersParams,
	CreateFolderRequest,
	UpdateFolderRequest,
} from "@/types/storage";

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
			folderId,
		}: {
			tenantId: string;
			file: File;
			fileType?: FileType;
			folderId?: string;
		}) => storageApi.upload(tokens!.accessToken, tenantId, file, fileType, folderId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["files", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["storage-usage", variables.tenantId],
			});
			if (variables.folderId) {
				queryClient.invalidateQueries({
					queryKey: ["folder", variables.tenantId, variables.folderId],
				});
			}
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

export function useBatchDeleteFiles() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, fileIds }: { tenantId: string; fileIds: string[] }) =>
			storageApi.batchDelete(tokens!.accessToken, tenantId, fileIds),
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

export function useUploadFromUrl() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			url,
			fileName,
			fileType,
			folderId,
		}: {
			tenantId: string;
			url: string;
			fileName: string;
			fileType?: FileType;
			folderId?: string;
		}) => storageApi.uploadFromUrl(tokens!.accessToken, tenantId, url, fileName, fileType, folderId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["files", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["storage-usage", variables.tenantId],
			});
			if (variables.folderId) {
				queryClient.invalidateQueries({
					queryKey: ["folder", variables.tenantId, variables.folderId],
				});
			}
		},
	});
}

export function useMoveFile() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			fileId,
			folderId,
		}: {
			tenantId: string;
			fileId: string;
			folderId?: string;
		}) => storageApi.moveFile(tokens!.accessToken, tenantId, fileId, folderId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["files", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["folders", variables.tenantId],
			});
		},
	});
}

export function useFolders(tenantId: string, params?: ListFoldersParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["folders", tenantId, params],
		queryFn: () => storageApi.listFolders(tokens!.accessToken, tenantId, params),
		enabled: !!tenantId && !!tokens?.accessToken,
	});
}

export function useFolder(tenantId: string, folderId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["folder", tenantId, folderId],
		queryFn: () => storageApi.getFolder(tokens!.accessToken, tenantId, folderId),
		enabled: !!tenantId && !!folderId && !!tokens?.accessToken,
	});
}

export function useFolderBreadcrumb(tenantId: string, folderId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["folder-breadcrumb", tenantId, folderId],
		queryFn: () => storageApi.getFolderBreadcrumb(tokens!.accessToken, tenantId, folderId),
		enabled: !!tenantId && !!folderId && !!tokens?.accessToken,
	});
}

export function useCreateFolder() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			data,
		}: {
			tenantId: string;
			data: CreateFolderRequest;
		}) => storageApi.createFolder(tokens!.accessToken, tenantId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["folders", variables.tenantId],
			});
			if (variables.data.parentId) {
				queryClient.invalidateQueries({
					queryKey: ["folder", variables.tenantId, variables.data.parentId],
				});
			}
		},
	});
}

export function useUpdateFolder() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			folderId,
			data,
		}: {
			tenantId: string;
			folderId: string;
			data: UpdateFolderRequest;
		}) => storageApi.updateFolder(tokens!.accessToken, tenantId, folderId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["folders", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["folder", variables.tenantId, variables.folderId],
			});
		},
	});
}

export function useMoveFolder() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			folderId,
			parentId,
		}: {
			tenantId: string;
			folderId: string;
			parentId?: string;
		}) => storageApi.moveFolder(tokens!.accessToken, tenantId, folderId, parentId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["folders", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["folder", variables.tenantId, variables.folderId],
			});
			queryClient.invalidateQueries({
				queryKey: ["folder-breadcrumb", variables.tenantId, variables.folderId],
			});
		},
	});
}

export function useDeleteFolder() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			folderId,
		}: {
			tenantId: string;
			folderId: string;
		}) => storageApi.deleteFolder(tokens!.accessToken, tenantId, folderId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["folders", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["files", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["storage-usage", variables.tenantId],
			});
		},
	});
}
