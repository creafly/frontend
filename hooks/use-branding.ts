"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { brandingApi } from "@/lib/api/branding";
import type {
	CreateBrandLogoRequest,
	UpdateBrandLogoRequest,
	CreateBrandColorRequest,
	UpdateBrandColorRequest,
	CreateBrandFontRequest,
	UpdateBrandFontRequest,
	CreateBrandSpacingRequest,
	UpdateBrandSpacingRequest,
	CreateBrandRadiusRequest,
	UpdateBrandRadiusRequest,
	CreateBrandDocumentRequest,
	UpdateBrandDocumentRequest,
	ReorderRequest,
	CreateParsingRequest,
	ApproveParsingRequest,
	BatchDeleteRequest,
} from "@/types/branding";

interface PaginationParams {
	limit?: number;
	offset?: number;
}

export function useLogos(tenantId: string, params?: PaginationParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["branding", tenantId, "logos", params],
		queryFn: () => brandingApi.getLogos(tokens!.accessToken, tenantId, params),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
	});
}

export function useColors(tenantId: string, params?: PaginationParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["branding", tenantId, "colors", params],
		queryFn: () => brandingApi.getColors(tokens!.accessToken, tenantId, params),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
	});
}

export function useFonts(tenantId: string, params?: PaginationParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["branding", tenantId, "fonts", params],
		queryFn: () => brandingApi.getFonts(tokens!.accessToken, tenantId, params),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
	});
}

export function useSpacings(tenantId: string, params?: PaginationParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["branding", tenantId, "spacings", params],
		queryFn: () => brandingApi.getSpacings(tokens!.accessToken, tenantId, params),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
	});
}

export function useRadii(tenantId: string, params?: PaginationParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["branding", tenantId, "radii", params],
		queryFn: () => brandingApi.getRadii(tokens!.accessToken, tenantId, params),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
	});
}

export function useBranding(tenantId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["branding", tenantId],
		queryFn: () => brandingApi.getBranding(tokens!.accessToken, tenantId),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
	});
}

export function useCreateLogo() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateBrandLogoRequest }) =>
			brandingApi.createLogo(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useUpdateLogo() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			logoId,
			request,
		}: {
			tenantId: string;
			logoId: string;
			request: UpdateBrandLogoRequest;
		}) => brandingApi.updateLogo(tokens!.accessToken, tenantId, logoId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteLogo() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, logoId }: { tenantId: string; logoId: string }) =>
			brandingApi.deleteLogo(tokens!.accessToken, tenantId, logoId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteLogosBatch() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: BatchDeleteRequest }) =>
			brandingApi.deleteLogosBatch(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useReorderLogos() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: ReorderRequest }) =>
			brandingApi.reorderLogos(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useCreateColor() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateBrandColorRequest }) =>
			brandingApi.createColor(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useUpdateColor() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			colorId,
			request,
		}: {
			tenantId: string;
			colorId: string;
			request: UpdateBrandColorRequest;
		}) => brandingApi.updateColor(tokens!.accessToken, tenantId, colorId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteColor() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, colorId }: { tenantId: string; colorId: string }) =>
			brandingApi.deleteColor(tokens!.accessToken, tenantId, colorId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteColorsBatch() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: BatchDeleteRequest }) =>
			brandingApi.deleteColorsBatch(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useReorderColors() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: ReorderRequest }) =>
			brandingApi.reorderColors(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useCreateFont() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateBrandFontRequest }) =>
			brandingApi.createFont(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useUpdateFont() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			fontId,
			request,
		}: {
			tenantId: string;
			fontId: string;
			request: UpdateBrandFontRequest;
		}) => brandingApi.updateFont(tokens!.accessToken, tenantId, fontId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteFont() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, fontId }: { tenantId: string; fontId: string }) =>
			brandingApi.deleteFont(tokens!.accessToken, tenantId, fontId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteFontsBatch() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: BatchDeleteRequest }) =>
			brandingApi.deleteFontsBatch(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useReorderFonts() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: ReorderRequest }) =>
			brandingApi.reorderFonts(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useCreateSpacing() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateBrandSpacingRequest }) =>
			brandingApi.createSpacing(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useUpdateSpacing() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			spacingId,
			request,
		}: {
			tenantId: string;
			spacingId: string;
			request: UpdateBrandSpacingRequest;
		}) => brandingApi.updateSpacing(tokens!.accessToken, tenantId, spacingId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteSpacing() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, spacingId }: { tenantId: string; spacingId: string }) =>
			brandingApi.deleteSpacing(tokens!.accessToken, tenantId, spacingId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteSpacingsBatch() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: BatchDeleteRequest }) =>
			brandingApi.deleteSpacingsBatch(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useReorderSpacings() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: ReorderRequest }) =>
			brandingApi.reorderSpacings(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useCreateRadius() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateBrandRadiusRequest }) =>
			brandingApi.createRadius(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useUpdateRadius() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			radiusId,
			request,
		}: {
			tenantId: string;
			radiusId: string;
			request: UpdateBrandRadiusRequest;
		}) => brandingApi.updateRadius(tokens!.accessToken, tenantId, radiusId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteRadius() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, radiusId }: { tenantId: string; radiusId: string }) =>
			brandingApi.deleteRadius(tokens!.accessToken, tenantId, radiusId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteRadiiBatch() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: BatchDeleteRequest }) =>
			brandingApi.deleteRadiiBatch(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useReorderRadii() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: ReorderRequest }) =>
			brandingApi.reorderRadii(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useLatestParsingRequest(tenantId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["parsing", "latest", tenantId],
		queryFn: () => brandingApi.getLatestParsingRequest(tokens!.accessToken, tenantId),
		enabled: !!tokens?.accessToken && !!tenantId,
		refetchInterval: (query) => {
			const data = query.state.data;
			if (data && "status" in data) {
				const status = data.status;
				if (status === "pending" || status === "processing") {
					return 3000;
				}
			}
			return false;
		},
	});
}

export function useParsingRequest(tenantId: string, requestId: string) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["parsing", requestId],
		queryFn: () => brandingApi.getParsingRequest(tokens!.accessToken, tenantId, requestId),
		enabled: !!tokens?.accessToken && !!tenantId && !!requestId,
		refetchInterval: (query) => {
			const data = query.state.data;
			if (data) {
				const status = data.status;
				if (status === "pending" || status === "processing") {
					return 3000;
				}
			}
			return false;
		},
	});
}

export function useCreateParsingRequest() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateParsingRequest }) =>
			brandingApi.createParsingRequest(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["parsing", "latest", variables.tenantId],
			});
		},
	});
}

export function useApproveParsingRequest() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			requestId,
			request,
		}: {
			tenantId: string;
			requestId: string;
			request?: ApproveParsingRequest;
		}) => brandingApi.approveParsingRequest(tokens!.accessToken, tenantId, requestId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["parsing", "latest", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["parsing", variables.requestId],
			});
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useRejectParsingRequest() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, requestId }: { tenantId: string; requestId: string }) =>
			brandingApi.rejectParsingRequest(tokens!.accessToken, tenantId, requestId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["parsing", "latest", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["parsing", variables.requestId],
			});
		},
	});
}

export function useDeleteParsingRequest() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, requestId }: { tenantId: string; requestId: string }) =>
			brandingApi.deleteParsingRequest(tokens!.accessToken, tenantId, requestId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["parsing", "latest", variables.tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["parsing", variables.requestId],
			});
		},
	});
}

export function useDocuments(tenantId: string, params?: PaginationParams) {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: ["branding", tenantId, "documents", params],
		queryFn: () => brandingApi.getDocuments(tokens!.accessToken, tenantId, params),
		enabled: !!tokens?.accessToken && !!tenantId,
		retry: false,
	});
}

export function useCreateDocument() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: CreateBrandDocumentRequest }) =>
			brandingApi.createDocument(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useUpdateDocument() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			documentId,
			request,
		}: {
			tenantId: string;
			documentId: string;
			request: UpdateBrandDocumentRequest;
		}) => brandingApi.updateDocument(tokens!.accessToken, tenantId, documentId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteDocument() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, documentId }: { tenantId: string; documentId: string }) =>
			brandingApi.deleteDocument(tokens!.accessToken, tenantId, documentId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useDeleteDocumentsBatch() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: BatchDeleteRequest }) =>
			brandingApi.deleteDocumentsBatch(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}

export function useReorderDocuments() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({ tenantId, request }: { tenantId: string; request: ReorderRequest }) =>
			brandingApi.reorderDocuments(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}
