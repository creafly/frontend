import type { StorageFile, ListFilesParams, FileList } from "@/types/storage";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const STORAGE_API_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8083";

const serviceFetch = createServiceFetch(STORAGE_API_URL);

class StorageApiError extends ApiError {
	constructor(status: number, message: string, code?: string) {
		super(status, message, code);
		this.name = "StorageApiError";
	}
}

async function fetchStorageApi<T>(
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

export const storageApi = {
	async list(
		accessToken: string,
		tenantId: string,
		params?: ListFilesParams
	): Promise<FileList> {
		const searchParams = new URLSearchParams();
		if (params?.type) searchParams.set("type", params.type);
		if (params?.limit) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());

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

	async batchDelete(
		accessToken: string,
		tenantId: string,
		fileIds: string[]
	): Promise<{ deleted: string[]; failed: string[]; message: string }> {
		return fetchStorageApi(`/api/v1/files/batch`, accessToken, tenantId, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ids: fileIds }),
		});
	},
};

export { StorageApiError };
