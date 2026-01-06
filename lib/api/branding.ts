import type {
	TenantBranding,
	BrandLogo,
	BrandLogoList,
	BrandColor,
	BrandColorList,
	BrandFont,
	BrandFontList,
	BrandSpacing,
	BrandSpacingList,
	BrandRadius,
	BrandRadiusList,
	BrandDocument,
	BrandDocumentList,
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
	BatchCreateLogoRequest,
	BatchUpdateLogoRequest,
	BatchCreateColorRequest,
	BatchUpdateColorRequest,
	BatchCreateFontRequest,
	BatchUpdateFontRequest,
	BatchCreateSpacingRequest,
	BatchUpdateSpacingRequest,
	BatchCreateRadiusRequest,
	BatchUpdateRadiusRequest,
	BatchCreateDocumentRequest,
	BatchUpdateDocumentRequest,
	BatchDeleteRequest,
	BrandParsingRequest,
	CreateParsingRequest,
	ApproveParsingRequest,
} from "@/types/branding";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const BRANDING_API_URL = process.env.NEXT_PUBLIC_BRANDING_URL || "http://localhost:8084";

const serviceFetch = createServiceFetch(BRANDING_API_URL);

class BrandingApiError extends ApiError {
	constructor(status: number, message: string) {
		super(status, message);
		this.name = "BrandingApiError";
	}
}

async function fetchBrandingApi<T>(
	endpoint: string,
	accessToken: string,
	tenantId: string,
	options?: FetchOptions
): Promise<T> {
	return serviceFetch<T>(endpoint, {
		...options,
		accessToken,
		tenantId,
	});
}

export const brandingApi = {
	getBranding: async (accessToken: string, tenantId: string) => {
		return fetchBrandingApi<TenantBranding>("/api/v1/branding", accessToken, tenantId);
	},

	getLogos: async (accessToken: string, tenantId: string, params?: { limit?: number; offset?: number }) => {
		const searchParams = new URLSearchParams();
		if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());
		const queryString = searchParams.toString();
		return fetchBrandingApi<BrandLogoList>(`/api/v1/logos${queryString ? `?${queryString}` : ""}`, accessToken, tenantId);
	},

	createLogo: async (accessToken: string, tenantId: string, request: CreateBrandLogoRequest) => {
		return fetchBrandingApi<BrandLogo>("/api/v1/logos", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	createLogosBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateLogoRequest
	) => {
		return fetchBrandingApi<BrandLogo[]>("/api/v1/logos/batch", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateLogo: async (
		accessToken: string,
		tenantId: string,
		logoId: string,
		request: UpdateBrandLogoRequest
	) => {
		return fetchBrandingApi<BrandLogo>(`/api/v1/logos/${logoId}`, accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	updateLogosBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchUpdateLogoRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/logos/batch", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteLogo: async (accessToken: string, tenantId: string, logoId: string) => {
		return fetchBrandingApi<void>(`/api/v1/logos/${logoId}`, accessToken, tenantId, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	deleteLogosBatch: async (accessToken: string, tenantId: string, request: BatchDeleteRequest) => {
		return fetchBrandingApi<void>("/api/v1/logos/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},

	reorderLogos: async (accessToken: string, tenantId: string, request: ReorderRequest) => {
		return fetchBrandingApi<void>("/api/v1/logos/reorder", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	getColors: async (accessToken: string, tenantId: string, params?: { limit?: number; offset?: number }) => {
		const searchParams = new URLSearchParams();
		if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());
		const queryString = searchParams.toString();
		return fetchBrandingApi<BrandColorList>(`/api/v1/colors${queryString ? `?${queryString}` : ""}`, accessToken, tenantId);
	},

	createColor: async (accessToken: string, tenantId: string, request: CreateBrandColorRequest) => {
		return fetchBrandingApi<BrandColor>("/api/v1/colors", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateColor: async (
		accessToken: string,
		tenantId: string,
		colorId: string,
		request: UpdateBrandColorRequest
	) => {
		return fetchBrandingApi<BrandColor>(`/api/v1/colors/${colorId}`, accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteColor: async (accessToken: string, tenantId: string, colorId: string) => {
		return fetchBrandingApi<void>(`/api/v1/colors/${colorId}`, accessToken, tenantId, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	reorderColors: async (accessToken: string, tenantId: string, request: ReorderRequest) => {
		return fetchBrandingApi<void>("/api/v1/colors/reorder", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	createColorsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateColorRequest
	) => {
		return fetchBrandingApi<BrandColor[]>("/api/v1/colors/batch", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateColorsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchUpdateColorRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/colors/batch", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteColorsBatch: async (accessToken: string, tenantId: string, request: BatchDeleteRequest) => {
		return fetchBrandingApi<void>("/api/v1/colors/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},

	getFonts: async (accessToken: string, tenantId: string, params?: { limit?: number; offset?: number }) => {
		const searchParams = new URLSearchParams();
		if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());
		const queryString = searchParams.toString();
		return fetchBrandingApi<BrandFontList>(`/api/v1/fonts${queryString ? `?${queryString}` : ""}`, accessToken, tenantId);
	},

	createFont: async (accessToken: string, tenantId: string, request: CreateBrandFontRequest) => {
		return fetchBrandingApi<BrandFont>("/api/v1/fonts", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateFont: async (
		accessToken: string,
		tenantId: string,
		fontId: string,
		request: UpdateBrandFontRequest
	) => {
		return fetchBrandingApi<BrandFont>(`/api/v1/fonts/${fontId}`, accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteFont: async (accessToken: string, tenantId: string, fontId: string) => {
		return fetchBrandingApi<void>(`/api/v1/fonts/${fontId}`, accessToken, tenantId, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	reorderFonts: async (accessToken: string, tenantId: string, request: ReorderRequest) => {
		return fetchBrandingApi<void>("/api/v1/fonts/reorder", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	createFontsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateFontRequest
	) => {
		return fetchBrandingApi<BrandFont[]>("/api/v1/fonts/batch", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateFontsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchUpdateFontRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/fonts/batch", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteFontsBatch: async (accessToken: string, tenantId: string, request: BatchDeleteRequest) => {
		return fetchBrandingApi<void>("/api/v1/fonts/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},

	getSpacings: async (accessToken: string, tenantId: string, params?: { limit?: number; offset?: number }) => {
		const searchParams = new URLSearchParams();
		if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());
		const queryString = searchParams.toString();
		return fetchBrandingApi<BrandSpacingList>(`/api/v1/spacings${queryString ? `?${queryString}` : ""}`, accessToken, tenantId);
	},

	createSpacing: async (
		accessToken: string,
		tenantId: string,
		request: CreateBrandSpacingRequest
	) => {
		return fetchBrandingApi<BrandSpacing>("/api/v1/spacings", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateSpacing: async (
		accessToken: string,
		tenantId: string,
		spacingId: string,
		request: UpdateBrandSpacingRequest
	) => {
		return fetchBrandingApi<BrandSpacing>(`/api/v1/spacings/${spacingId}`, accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteSpacing: async (accessToken: string, tenantId: string, spacingId: string) => {
		return fetchBrandingApi<void>(`/api/v1/spacings/${spacingId}`, accessToken, tenantId, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	reorderSpacings: async (accessToken: string, tenantId: string, request: ReorderRequest) => {
		return fetchBrandingApi<void>("/api/v1/spacings/reorder", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	createSpacingsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateSpacingRequest
	) => {
		return fetchBrandingApi<BrandSpacing[]>("/api/v1/spacings/batch", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateSpacingsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchUpdateSpacingRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/spacings/batch", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteSpacingsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchDeleteRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/spacings/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},

	getRadii: async (accessToken: string, tenantId: string, params?: { limit?: number; offset?: number }) => {
		const searchParams = new URLSearchParams();
		if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());
		const queryString = searchParams.toString();
		return fetchBrandingApi<BrandRadiusList>(`/api/v1/radii${queryString ? `?${queryString}` : ""}`, accessToken, tenantId);
	},

	createRadius: async (
		accessToken: string,
		tenantId: string,
		request: CreateBrandRadiusRequest
	) => {
		return fetchBrandingApi<BrandRadius>("/api/v1/radii", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateRadius: async (
		accessToken: string,
		tenantId: string,
		radiusId: string,
		request: UpdateBrandRadiusRequest
	) => {
		return fetchBrandingApi<BrandRadius>(`/api/v1/radii/${radiusId}`, accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteRadius: async (accessToken: string, tenantId: string, radiusId: string) => {
		return fetchBrandingApi<void>(`/api/v1/radii/${radiusId}`, accessToken, tenantId, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	reorderRadii: async (accessToken: string, tenantId: string, request: ReorderRequest) => {
		return fetchBrandingApi<void>("/api/v1/radii/reorder", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	createRadiiBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateRadiusRequest
	) => {
		return fetchBrandingApi<BrandRadius[]>("/api/v1/radii/batch", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateRadiiBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchUpdateRadiusRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/radii/batch", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteRadiiBatch: async (accessToken: string, tenantId: string, request: BatchDeleteRequest) => {
		return fetchBrandingApi<void>("/api/v1/radii/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},

	createParsingRequest: async (
		accessToken: string,
		tenantId: string,
		request: CreateParsingRequest
	) => {
		return fetchBrandingApi<BrandParsingRequest>("/api/v1/parsing", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	getParsingRequests: async (accessToken: string, tenantId: string, limit = 10, offset = 0) => {
		return fetchBrandingApi<{ data: BrandParsingRequest[] }>(
			`/api/v1/parsing?limit=${limit}&offset=${offset}`,
			accessToken,
			tenantId
		);
	},

	getParsingRequest: async (accessToken: string, tenantId: string, requestId: string) => {
		return fetchBrandingApi<BrandParsingRequest>(
			`/api/v1/parsing/${requestId}`,
			accessToken,
			tenantId
		);
	},

	getLatestParsingRequest: async (accessToken: string, tenantId: string) => {
		return fetchBrandingApi<BrandParsingRequest | { data: null }>(
			"/api/v1/parsing/latest",
			accessToken,
			tenantId
		);
	},

	approveParsingRequest: async (
		accessToken: string,
		tenantId: string,
		requestId: string,
		request?: ApproveParsingRequest
	) => {
		return fetchBrandingApi<{ message: string }>(
			`/api/v1/parsing/${requestId}/approve`,
			accessToken,
			tenantId,
			{
				method: "POST",
				body: JSON.stringify(request || {}),
			}
		);
	},

	rejectParsingRequest: async (accessToken: string, tenantId: string, requestId: string) => {
		return fetchBrandingApi<{ message: string }>(
			`/api/v1/parsing/${requestId}/reject`,
			accessToken,
			tenantId,
			{
				method: "POST",
				body: JSON.stringify({}),
			}
		);
	},

	deleteParsingRequest: async (accessToken: string, tenantId: string, requestId: string) => {
		return fetchBrandingApi<{ message: string }>(
			`/api/v1/parsing/${requestId}`,
			accessToken,
			tenantId,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	getDocuments: async (accessToken: string, tenantId: string, params?: { limit?: number; offset?: number }) => {
		const searchParams = new URLSearchParams();
		if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());
		const queryString = searchParams.toString();
		return fetchBrandingApi<BrandDocumentList>(`/api/v1/documents${queryString ? `?${queryString}` : ""}`, accessToken, tenantId);
	},

	createDocument: async (accessToken: string, tenantId: string, request: CreateBrandDocumentRequest) => {
		return fetchBrandingApi<BrandDocument>("/api/v1/documents", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	createDocumentsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateDocumentRequest
	) => {
		return fetchBrandingApi<BrandDocument[]>("/api/v1/documents/batch", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateDocument: async (
		accessToken: string,
		tenantId: string,
		documentId: string,
		request: UpdateBrandDocumentRequest
	) => {
		return fetchBrandingApi<BrandDocument>(`/api/v1/documents/${documentId}`, accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	updateDocumentsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchUpdateDocumentRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/documents/batch", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteDocument: async (accessToken: string, tenantId: string, documentId: string) => {
		return fetchBrandingApi<void>(`/api/v1/documents/${documentId}`, accessToken, tenantId, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	deleteDocumentsBatch: async (accessToken: string, tenantId: string, request: BatchDeleteRequest) => {
		return fetchBrandingApi<void>("/api/v1/documents/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},

	reorderDocuments: async (accessToken: string, tenantId: string, request: ReorderRequest) => {
		return fetchBrandingApi<void>("/api/v1/documents/reorder", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},
};

export { BrandingApiError };
