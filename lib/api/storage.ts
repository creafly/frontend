import type {
	StorageFile,
	ListFilesParams,
	FileList,
	Folder,
	FolderWithCounts,
	FolderList,
	ListFoldersParams,
	CreateFolderRequest,
	UpdateFolderRequest,
	MoveFolderRequest,
	MoveFileRequest,
} from "@/types/storage";
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
		if (params?.folderId) searchParams.set("folderId", params.folderId);
		if (params?.type) searchParams.set("type", params.type);
		if (params?.limit) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());
		if (params?.all) searchParams.set("all", "true");

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
		fileType?: string,
		folderId?: string
	): Promise<{ file: StorageFile }> {
		const formData = new FormData();
		formData.append("file", file);
		if (fileType) {
			formData.append("type", fileType);
		}
		if (folderId) {
			formData.append("folderId", folderId);
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

	async uploadFromUrl(
		accessToken: string,
		tenantId: string,
		url: string,
		fileName: string,
		fileType?: string,
		folderId?: string
	): Promise<{ file: StorageFile }> {
		const response = await fetch(url);
		if (!response.ok) {
			throw new StorageApiError(response.status, "Failed to fetch file from URL");
		}

		const blob = await response.blob();
		const file = new File([blob], fileName, { type: blob.type });

		return this.upload(accessToken, tenantId, file, fileType, folderId);
	},

	async moveFile(
		accessToken: string,
		tenantId: string,
		fileId: string,
		folderId?: string
	): Promise<{ file: StorageFile }> {
		return fetchStorageApi(`/api/v1/files/${fileId}/move`, accessToken, tenantId, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ folderId } as MoveFileRequest),
		});
	},

	async listFolders(
		accessToken: string,
		tenantId: string,
		params?: ListFoldersParams
	): Promise<FolderList> {
		const searchParams = new URLSearchParams();
		if (params?.parentId) searchParams.set("parentId", params.parentId);
		if (params?.limit) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());

		const queryString = searchParams.toString();
		const endpoint = `/api/v1/folders${queryString ? `?${queryString}` : ""}`;

		return fetchStorageApi(endpoint, accessToken, tenantId, {
			method: "GET",
		});
	},

	async getFolder(
		accessToken: string,
		tenantId: string,
		folderId: string
	): Promise<{ folder: FolderWithCounts }> {
		return fetchStorageApi(`/api/v1/folders/${folderId}`, accessToken, tenantId, {
			method: "GET",
		});
	},

	async createFolder(
		accessToken: string,
		tenantId: string,
		data: CreateFolderRequest
	): Promise<{ folder: Folder }> {
		return fetchStorageApi(`/api/v1/folders`, accessToken, tenantId, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
	},

	async updateFolder(
		accessToken: string,
		tenantId: string,
		folderId: string,
		data: UpdateFolderRequest
	): Promise<{ folder: Folder }> {
		return fetchStorageApi(`/api/v1/folders/${folderId}`, accessToken, tenantId, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
	},

	async moveFolder(
		accessToken: string,
		tenantId: string,
		folderId: string,
		parentId?: string
	): Promise<{ folder: Folder }> {
		return fetchStorageApi(`/api/v1/folders/${folderId}/move`, accessToken, tenantId, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ parentId } as MoveFolderRequest),
		});
	},

	async deleteFolder(
		accessToken: string,
		tenantId: string,
		folderId: string
	): Promise<{ message: string }> {
		return fetchStorageApi(`/api/v1/folders/${folderId}`, accessToken, tenantId, {
			method: "DELETE",
		});
	},

	async getFolderBreadcrumb(
		accessToken: string,
		tenantId: string,
		folderId: string
	): Promise<{ breadcrumb: Folder[] }> {
		return fetchStorageApi(`/api/v1/folders/${folderId}/breadcrumb`, accessToken, tenantId, {
			method: "GET",
		});
	},
};

export { StorageApiError };
