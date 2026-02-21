export interface RetryConfig {
	maxRetries?: number;
	retryDelay?: number;
	retryStatusCodes?: number[];
	onRetry?: (attempt: number, error: Error) => void;
}

export interface FetchOptions extends RequestInit {
	skipContentType?: boolean;
	retry?: RetryConfig | false;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
	maxRetries: 3,
	retryDelay: 1000,
	retryStatusCodes: [408, 429, 500, 502, 503, 504],
	onRetry: () => {},
};

export interface FieldError {
	field: string;
	code: string;
	message: string;
}

class ApiError extends Error {
	public fieldErrors?: FieldError[];

	constructor(
		public status: number,
		message: string,
		public code?: string,
		public data?: Record<string, unknown>
	) {
		super(message);
		this.name = "ApiError";

		if (data?.fieldErrors && Array.isArray(data.fieldErrors)) {
			this.fieldErrors = data.fieldErrors as FieldError[];
		}
	}

	isValidationError(): boolean {
		return this.code === "VALIDATION_ERROR" && !!this.fieldErrors?.length;
	}

	getFieldError(field: string): string | undefined {
		return this.fieldErrors?.find((e) => {
			const normalizedField = e.field.charAt(0).toLowerCase() + e.field.slice(1);
			return normalizedField === field;
		})?.message;
	}

	getFieldErrorsMap(): Record<string, string> {
		const map: Record<string, string> = {};
		this.fieldErrors?.forEach((e) => {
			const normalizedField = e.field.charAt(0).toLowerCase() + e.field.slice(1);
			map[normalizedField] = e.message;
		});
		return map;
	}

	getFieldErrorsWithCodes(): Array<{ field: string; code: string; message: string }> {
		return (
			this.fieldErrors?.map((e) => ({
				field: e.field.charAt(0).toLowerCase() + e.field.slice(1),
				code: e.code,
				message: e.message,
			})) ?? []
		);
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status: number, retryStatusCodes: number[]): boolean {
	return retryStatusCodes.includes(status);
}

export async function fetchWithRetry<T>(url: string, options?: FetchOptions): Promise<T> {
	const { skipContentType, retry, ...fetchOptions } = options || {};

	const retryConfig = retry === false ? null : { ...DEFAULT_RETRY_CONFIG, ...retry };

	const headers: HeadersInit = {
		...(fetchOptions.headers || {}),
	};

	const isFormData = fetchOptions.body instanceof FormData;
	if (!skipContentType && fetchOptions.body && !isFormData) {
		(headers as Record<string, string>)["Content-Type"] = "application/json";
	}

	const finalOptions: RequestInit = {
		...fetchOptions,
		headers,
	};

	let lastError: Error | null = null;
	const maxAttempts = retryConfig ? retryConfig.maxRetries + 1 : 1;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			const response = await fetch(url, finalOptions);

			if (response.status === 204) {
				return {} as T;
			}

			const data = await response.json();

			if (!response.ok) {
				if (
					retryConfig &&
					attempt < maxAttempts &&
					shouldRetry(response.status, retryConfig.retryStatusCodes)
				) {
					const delay = retryConfig.retryDelay * attempt;
					retryConfig.onRetry(attempt, new Error(data.error || `HTTP ${response.status}`));
					await sleep(delay);
					continue;
				}

			if (data.code === "USER_BLOCKED" && data.isBlocked) {
				if (typeof window !== "undefined") {
					window.dispatchEvent(
						new CustomEvent("api-error", {
							detail: {
								code: data.code,
								isBlocked: data.isBlocked,
								blockReason: data.blockReason,
							},
						})
					);
				}
			}

			if (data.code === "ANOMALY_DETECTED") {
				if (typeof window !== "undefined") {
					window.dispatchEvent(
						new CustomEvent("api-error", {
							detail: {
								code: data.code,
								message: data.error || data.message,
							},
						})
					);
				}
			}

				throw new ApiError(response.status, data.error, data.code, data);
			}

			return data;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (error instanceof ApiError) {
				throw error;
			}

			if (retryConfig && attempt < maxAttempts) {
				const delay = retryConfig.retryDelay * attempt;
				retryConfig.onRetry(attempt, lastError);
				await sleep(delay);
				continue;
			}

			throw lastError;
		}
	}

	throw lastError;
}

export function createServiceFetch(baseUrl: string) {
	return async function serviceFetch<T>(
		endpoint: string,
		options?: FetchOptions & { accessToken?: string; tenantId?: string }
	): Promise<T> {
		const { accessToken, tenantId, ...fetchOptions } = options || {};

		const headers: HeadersInit = {
			...(fetchOptions.headers || {}),
		};

		if (accessToken) {
			(headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
		}

		if (tenantId) {
			(headers as Record<string, string>)["X-Tenant-ID"] = tenantId;
		}

		return fetchWithRetry<T>(`${baseUrl}${endpoint}`, {
			...fetchOptions,
			headers,
		});
	};
}

export { ApiError };
