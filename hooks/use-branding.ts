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
	ReorderRequest,
} from "@/types/branding";

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
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: CreateBrandLogoRequest;
		}) => brandingApi.createLogo(tokens!.accessToken, tenantId, request),
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

export function useReorderLogos() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: ReorderRequest;
		}) => brandingApi.reorderLogos(tokens!.accessToken, tenantId, request),
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
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: CreateBrandColorRequest;
		}) => brandingApi.createColor(tokens!.accessToken, tenantId, request),
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

export function useReorderColors() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: ReorderRequest;
		}) => brandingApi.reorderColors(tokens!.accessToken, tenantId, request),
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
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: CreateBrandFontRequest;
		}) => brandingApi.createFont(tokens!.accessToken, tenantId, request),
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

export function useReorderFonts() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: ReorderRequest;
		}) => brandingApi.reorderFonts(tokens!.accessToken, tenantId, request),
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
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: CreateBrandSpacingRequest;
		}) => brandingApi.createSpacing(tokens!.accessToken, tenantId, request),
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

export function useReorderSpacings() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: ReorderRequest;
		}) => brandingApi.reorderSpacings(tokens!.accessToken, tenantId, request),
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
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: CreateBrandRadiusRequest;
		}) => brandingApi.createRadius(tokens!.accessToken, tenantId, request),
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

export function useReorderRadii() {
	const queryClient = useQueryClient();
	const { tokens } = useAuth();

	return useMutation({
		mutationFn: ({
			tenantId,
			request,
		}: {
			tenantId: string;
			request: ReorderRequest;
		}) => brandingApi.reorderRadii(tokens!.accessToken, tenantId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["branding", variables.tenantId],
			});
		},
	});
}
