export type FileType = "image" | "logo" | "document";

export interface StorageFile {
	id: string;
	tenantId: string;
	uploadedBy: string;
	fileName: string;
	originalName: string;
	contentType: string;
	fileType: FileType;
	size: number;
	path: string;
	url: string;
	createdAt: string;
	updatedAt: string;
}

export interface UploadFileRequest {
	file: File;
	type?: FileType;
}

export interface ListFilesParams {
	type?: FileType;
	limit?: number;
	offset?: number;
}

export interface StorageUsage {
	used: number;
	limit: number;
	percentage: number;
}
