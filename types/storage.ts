export type FileType = "image" | "logo" | "document" | "video";

export interface Folder {
	id: string;
	tenantId: string;
	parentId?: string;
	name: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface FolderWithCounts extends Folder {
	fileCount: number;
	folderCount: number;
}

export interface CreateFolderRequest {
	name: string;
	parentId?: string;
}

export interface UpdateFolderRequest {
	name?: string;
	parentId?: string;
}

export interface MoveFolderRequest {
	parentId?: string;
}

export interface MoveFileRequest {
	folderId?: string;
}

export interface FolderList {
	folders: FolderWithCounts[];
	total: number;
	limit: number;
	offset: number;
}

export interface ListFoldersParams {
	parentId?: string;
	limit?: number;
	offset?: number;
}

export interface StorageFile {
	id: string;
	tenantId: string;
	uploadedBy: string;
	folderId?: string;
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
	folderId?: string;
}

export interface ListFilesParams {
	folderId?: string;
	type?: FileType;
	limit?: number;
	offset?: number;
	all?: boolean;
}

export interface StorageUsage {
	used: number;
	limit: number;
	percentage: number;
}

export interface FileList {
	files: StorageFile[];
	total: number;
	limit: number;
	offset: number;
}
