export interface TenantBranding {
	tenantId: string;
	logos: BrandLogo[];
	colors: BrandColor[];
	fonts: BrandFont[];
	spacings: BrandSpacing[];
	radii: BrandRadius[];
}

export interface BrandLogo {
	id: string;
	tenantId: string;
	name: string;
	type: "primary" | "secondary" | "favicon" | "icon";
	fileId: string;
	fileUrl: string;
	width?: number;
	height?: number;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface BrandColor {
	id: string;
	tenantId: string;
	name: string;
	value: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface BrandFont {
	id: string;
	tenantId: string;
	name: string;
	fontFamily: string;
	fontWeight: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface BrandSpacing {
	id: string;
	tenantId: string;
	name: string;
	value: number;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface BrandRadius {
	id: string;
	tenantId: string;
	name: string;
	value: number;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateBrandLogoRequest {
	name: string;
	type: "primary" | "secondary" | "favicon" | "icon";
	fileId?: string;
	fileUrl?: string;
	width?: number;
	height?: number;
	order?: number;
}

export interface UpdateBrandLogoRequest {
	name?: string;
	type?: "primary" | "secondary" | "favicon" | "icon";
	fileId?: string;
	fileUrl?: string;
	width?: number;
	height?: number;
	order?: number;
}

export interface CreateBrandColorRequest {
	name: string;
	value: string;
	order?: number;
}

export interface UpdateBrandColorRequest {
	name?: string;
	value?: string;
	order?: number;
}

export interface CreateBrandFontRequest {
	name: string;
	fontFamily: string;
	fontWeight: string;
	order?: number;
}

export interface UpdateBrandFontRequest {
	name?: string;
	fontFamily?: string;
	fontWeight?: string;
	order?: number;
}

export interface CreateBrandSpacingRequest {
	name: string;
	value: number;
	order?: number;
}

export interface UpdateBrandSpacingRequest {
	name?: string;
	value?: number;
	order?: number;
}

export interface CreateBrandRadiusRequest {
	name: string;
	value: number;
	order?: number;
}

export interface UpdateBrandRadiusRequest {
	name?: string;
	value?: number;
	order?: number;
}

export interface ReorderRequest {
	items: Array<{ id: string; order: number }>;
}

export interface BatchCreateLogoRequest {
	items: CreateBrandLogoRequest[];
}

export interface BatchUpdateLogoRequest {
	items: Array<{ id: string } & UpdateBrandLogoRequest>;
}

export interface BatchCreateColorRequest {
	items: CreateBrandColorRequest[];
}

export interface BatchUpdateColorRequest {
	items: Array<{ id: string } & UpdateBrandColorRequest>;
}

export interface BatchCreateFontRequest {
	items: CreateBrandFontRequest[];
}

export interface BatchUpdateFontRequest {
	items: Array<{ id: string } & UpdateBrandFontRequest>;
}

export interface BatchCreateSpacingRequest {
	items: CreateBrandSpacingRequest[];
}

export interface BatchUpdateSpacingRequest {
	items: Array<{ id: string } & UpdateBrandSpacingRequest>;
}

export interface BatchCreateRadiusRequest {
	items: CreateBrandRadiusRequest[];
}

export interface BatchUpdateRadiusRequest {
	items: Array<{ id: string } & UpdateBrandRadiusRequest>;
}

export interface BatchDeleteRequest {
	ids: string[];
}
