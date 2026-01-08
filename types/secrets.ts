export interface Secret {
	id: string;
	tenantId: string;
	name: string;
	description?: string;
	value?: string;
	hasValue: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
}

export interface SecretList {
	secrets: Secret[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateSecretRequest {
	name: string;
	description?: string;
	value: string;
}

export interface UpdateSecretRequest {
	name?: string;
	description?: string;
	value?: string;
}
