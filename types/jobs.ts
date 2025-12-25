export type JobStatus =
	| "pending"
	| "processing"
	| "streaming"
	| "completed"
	| "failed"
	| "cancelled";

export type JobType = "generate" | "refine" | "preview";

export type SSEEventType =
	| "job:started"
	| "job:progress"
	| "job:chunk"
	| "job:completed"
	| "job:failed"
	| "job:cancelled"
	| "job:heartbeat";

export interface JobTokenUsage {
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	model?: string;
}

export interface GenerationResult {
	type: "email" | "conversation";
	content?: string;
	template?: string;
	subject?: string;
	props?: Record<string, unknown>;
	blocks?: Record<string, unknown>[];
	html?: string;
	summary?: string;
}

export interface JobResponse {
	id: string;
	status: JobStatus;
	type: JobType;
	conversationId: string | null;
	progress: number;
	progressMessage: string | null;
	result: GenerationResult | null;
	html: string | null;
	error: string | null;
	errorCode: string | null;
	createdAt: string;
	startedAt: string | null;
	completedAt: string | null;
}

export interface JobStartedEvent {
	type: "job:started";
	jobId: string;
	conversationId: string | null;
	status: JobStatus;
	timestamp: string;
}

export interface JobProgressEvent {
	type: "job:progress";
	jobId: string;
	progress: number;
	message: string | null;
	timestamp: string;
}

export interface JobChunkEvent {
	type: "job:chunk";
	jobId: string;
	position: number;
	chunk: string;
	timestamp: string;
}

export interface JobCompletedEvent {
	type: "job:completed";
	jobId: string;
	result: GenerationResult;
	html: string | null;
	tokenUsage: JobTokenUsage | null;
	timestamp: string;
}

export interface JobFailedEvent {
	type: "job:failed";
	jobId: string;
	error: string;
	errorCode: string | null;
	canRetry: boolean;
	timestamp: string;
}

export interface JobCancelledEvent {
	type: "job:cancelled";
	jobId: string;
	timestamp: string;
}

export interface JobHeartbeatEvent {
	type: "job:heartbeat";
	jobId: string;
	status: JobStatus;
	progress: number;
	timestamp: string;
}

export type SSEEvent =
	| JobStartedEvent
	| JobProgressEvent
	| JobChunkEvent
	| JobCompletedEvent
	| JobFailedEvent
	| JobCancelledEvent
	| JobHeartbeatEvent;

export interface CreateGenerateJobRequest {
	tenantId: string;
	task: string;
	language?: string;
	conversationId?: string;
	templateType?: string;
}

export interface CreateRefineJobRequest {
	tenantId: string;
	task: string;
	existingTemplate: string;
	existingProps: Record<string, unknown>;
	existingBlocks?: Record<string, unknown>[];
	conversationId?: string;
	language?: string;
}

export const JobErrorCodes = {
	RATE_LIMITED: "RATE_LIMITED",
	INSUFFICIENT_TOKENS: "INSUFFICIENT_TOKENS",
	CONTENT_FILTERED: "CONTENT_FILTERED",
	MODEL_ERROR: "MODEL_ERROR",
	TIMEOUT: "TIMEOUT",
	CANCELLED: "CANCELLED",
	INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type JobErrorCode = (typeof JobErrorCodes)[keyof typeof JobErrorCodes];
