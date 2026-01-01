import type { StorageFile, ListFilesParams } from "@/types/storage";

const STORAGE_API_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8083";

class StorageApiError extends Error {
	constructor(public status: number, message: string, public code?: string) {
		super(message);
		this.name = "StorageApiError";
	}
}

async function fetchStorageApi<T>(
	endpoint: string,
	accessToken: string,
	tenantId: string,
	options?: RequestInit
): Promise<T> {
	const url = `${STORAGE_API_URL}${endpoint}`;

	const headers: HeadersInit = {
		...(options?.headers || {}),
		Authorization: `Bearer ${accessToken}`,
		"X-Tenant-ID": tenantId,
	};

	const response = await fetch(url, {
		...options,
		headers,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: "Unknown error" }));
		throw new StorageApiError(response.status, error.error || "Request failed", error.code);
	}

	return response.json();
}

export const storageApi = {
	async list(
		accessToken: string,
		tenantId: string,
		params?: ListFilesParams
	): Promise<{ files: StorageFile[] }> {
		const searchParams = new URLSearchParams();
		if (params?.type) searchParams.set("type", params.type);
		if (params?.limit) searchParams.set("limit", params.limit.toString());
		if (params?.offset) searchParams.set("offset", params.offset.toString());

		const queryString = searchParams.toString();
		const endpoint = `/api/v1/files${queryString ? `?${queryString}` : ""}`;

		return fetchStorageApi(endpoint, accessToken, tenantId, {
			method: "GET",
		});
	},

	async getById(
		accessToken: string,
		tenantId: string,
		fileId: string
	): Promise<{ file: StorageFile }> {
		return fetchStorageApi(`/api/v1/files/${fileId}`, accessToken, tenantId, {
			method: "GET",
		});
	},

	async upload(
		accessToken: string,
		tenantId: string,
		file: File,
		fileType?: string
	): Promise<{ file: StorageFile }> {
		const formData = new FormData();
		formData.append("file", file);
		if (fileType) {
			formData.append("type", fileType);
		}

		return fetchStorageApi(`/api/v1/files`, accessToken, tenantId, {
			method: "POST",
			body: formData,
		});
	},

	async delete(
		accessToken: string,
		tenantId: string,
		fileId: string
	): Promise<{ message: string }> {
		return fetchStorageApi(`/api/v1/files/${fileId}`, accessToken, tenantId, {
			method: "DELETE",
		});
	},

	async getPresignedUrl(
		accessToken: string,
		tenantId: string,
		fileId: string,
		expiryMinutes?: number
	): Promise<{ url: string; expiresIn: number }> {
		const params = expiryMinutes ? `?expiry=${expiryMinutes}` : "";
		return fetchStorageApi(`/api/v1/files/${fileId}/url${params}`, accessToken, tenantId, {
			method: "GET",
		});
	},

	async getUsage(
		accessToken: string,
		tenantId: string
	): Promise<{ used: number; count: number }> {
		return fetchStorageApi(`/api/v1/files/usage`, accessToken, tenantId, {
			method: "GET",
		});
	},
};
