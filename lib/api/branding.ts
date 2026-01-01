import type {
	TenantBranding,
	BrandLogo,
	BrandColor,
	BrandFont,
	BrandSpacing,
	BrandRadius,
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
	BatchDeleteRequest,
} from "@/types/branding";

const BRANDING_API_URL = process.env.NEXT_PUBLIC_BRANDING_URL || "http://localhost:8084";

class BrandingApiError extends Error {
	constructor(public status: number, message: string) {
		super(message);
		this.name = "BrandingApiError";
	}
}

async function fetchBrandingApi<T>(
	endpoint: string,
	accessToken: string,
	tenantId: string,
	options?: RequestInit & { skipContentType?: boolean }
): Promise<T> {
	const url = `${BRANDING_API_URL}${endpoint}`;
	const { skipContentType, ...fetchOptions } = options || {};

	const headers: HeadersInit = {
		...(fetchOptions?.headers || {}),
		Authorization: `Bearer ${accessToken}`,
		"X-Tenant-ID": tenantId,
	};

	if (!skipContentType && fetchOptions?.body) {
		(headers as Record<string, string>)["Content-Type"] = "application/json";
	}

	const response = await fetch(url, {
		...fetchOptions,
		headers,
	});

	if (response.status === 204) {
		return {} as T;
	}

	const data = await response.json();

	if (!response.ok) {
		throw new BrandingApiError(response.status, data.error || "An error occurred");
	}

	return data;
}

export const brandingApi = {
	getBranding: async (accessToken: string, tenantId: string) => {
		return fetchBrandingApi<TenantBranding>("/api/v1/branding", accessToken, tenantId);
	},

	getLogos: async (accessToken: string, tenantId: string) => {
		return fetchBrandingApi<BrandLogo[]>("/api/v1/logos", accessToken, tenantId);
	},

	createLogo: async (
		accessToken: string,
		tenantId: string,
		request: CreateBrandLogoRequest
	) => {
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
		return fetchBrandingApi<BrandLogo[]>(
			"/api/v1/logos/batch",
			accessToken,
			tenantId,
			{
				method: "POST",
				body: JSON.stringify(request),
			}
		);
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

	deleteLogosBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchDeleteRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/logos/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},

	reorderLogos: async (
		accessToken: string,
		tenantId: string,
		request: ReorderRequest
	) => {
		return fetchBrandingApi<void>(
			"/api/v1/logos/reorder",
			accessToken,
			tenantId,
			{
				method: "PUT",
				body: JSON.stringify(request),
			}
		);
	},

	getColors: async (accessToken: string, tenantId: string) => {
		return fetchBrandingApi<BrandColor[]>(
			"/api/v1/colors",
			accessToken,
			tenantId
		);
	},

	createColor: async (
		accessToken: string,
		tenantId: string,
		request: CreateBrandColorRequest
	) => {
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

	reorderColors: async (
		accessToken: string,
		tenantId: string,
		request: ReorderRequest
	) => {
		return fetchBrandingApi<void>(
			"/api/v1/colors/reorder",
			accessToken,
			tenantId,
			{
				method: "PUT",
				body: JSON.stringify(request),
			}
		);
	},

	createColorsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateColorRequest
	) => {
		return fetchBrandingApi<BrandColor[]>(
			"/api/v1/colors/batch",
			accessToken,
			tenantId,
			{
				method: "POST",
				body: JSON.stringify(request),
			}
		);
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

	deleteColorsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchDeleteRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/colors/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},

	getFonts: async (accessToken: string, tenantId: string) => {
		return fetchBrandingApi<BrandFont[]>("/api/v1/fonts", accessToken, tenantId);
	},

	createFont: async (
		accessToken: string,
		tenantId: string,
		request: CreateBrandFontRequest
	) => {
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

	reorderFonts: async (
		accessToken: string,
		tenantId: string,
		request: ReorderRequest
	) => {
		return fetchBrandingApi<void>(
			"/api/v1/fonts/reorder",
			accessToken,
			tenantId,
			{
				method: "PUT",
				body: JSON.stringify(request),
			}
		);
	},

	createFontsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateFontRequest
	) => {
		return fetchBrandingApi<BrandFont[]>(
			"/api/v1/fonts/batch",
			accessToken,
			tenantId,
			{
				method: "POST",
				body: JSON.stringify(request),
			}
		);
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

	deleteFontsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchDeleteRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/fonts/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},

	getSpacings: async (accessToken: string, tenantId: string) => {
		return fetchBrandingApi<BrandSpacing[]>(
			"/api/v1/spacings",
			accessToken,
			tenantId
		);
	},

	createSpacing: async (
		accessToken: string,
		tenantId: string,
		request: CreateBrandSpacingRequest
	) => {
		return fetchBrandingApi<BrandSpacing>(
			"/api/v1/spacings",
			accessToken,
			tenantId,
			{
				method: "POST",
				body: JSON.stringify(request),
			}
		);
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

	reorderSpacings: async (
		accessToken: string,
		tenantId: string,
		request: ReorderRequest
	) => {
		return fetchBrandingApi<void>(
			"/api/v1/spacings/reorder",
			accessToken,
			tenantId,
			{
				method: "PUT",
				body: JSON.stringify(request),
			}
		);
	},

	createSpacingsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateSpacingRequest
	) => {
		return fetchBrandingApi<BrandSpacing[]>(
			"/api/v1/spacings/batch",
			accessToken,
			tenantId,
			{
				method: "POST",
				body: JSON.stringify(request),
			}
		);
	},

	updateSpacingsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchUpdateSpacingRequest
	) => {
		return fetchBrandingApi<void>(
			"/api/v1/spacings/batch",
			accessToken,
			tenantId,
			{
				method: "PUT",
				body: JSON.stringify(request),
			}
		);
	},

	deleteSpacingsBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchDeleteRequest
	) => {
		return fetchBrandingApi<void>(
			"/api/v1/spacings/batch",
			accessToken,
			tenantId,
			{
				method: "DELETE",
				body: JSON.stringify(request),
			}
		);
	},

	getRadii: async (accessToken: string, tenantId: string) => {
		return fetchBrandingApi<BrandRadius[]>(
			"/api/v1/radii",
			accessToken,
			tenantId
		);
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

	reorderRadii: async (
		accessToken: string,
		tenantId: string,
		request: ReorderRequest
	) => {
		return fetchBrandingApi<void>(
			"/api/v1/radii/reorder",
			accessToken,
			tenantId,
			{
				method: "PUT",
				body: JSON.stringify(request),
			}
		);
	},

	createRadiiBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchCreateRadiusRequest
	) => {
		return fetchBrandingApi<BrandRadius[]>(
			"/api/v1/radii/batch",
			accessToken,
			tenantId,
			{
				method: "POST",
				body: JSON.stringify(request),
			}
		);
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

	deleteRadiiBatch: async (
		accessToken: string,
		tenantId: string,
		request: BatchDeleteRequest
	) => {
		return fetchBrandingApi<void>("/api/v1/radii/batch", accessToken, tenantId, {
			method: "DELETE",
			body: JSON.stringify(request),
		});
	},
};

export { BrandingApiError };
