"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { createJobsApiClient, JobsApiError } from "@/lib/api/jobs";
import type {
	JobResponse,
	JobStatus,
	SSEEvent,
	GenerationResult,
	JobTokenUsage,
	CreateGenerateJobRequest,
	CreateRefineJobRequest,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface UseGenerationJobOptions {
	onStart?: (jobId: string) => void;
	onProgress?: (progress: number, message: string | null) => void;
	onChunk?: (chunk: string, position: number) => void;
	onComplete?: (
		result: GenerationResult,
		html: string | null,
		tokenUsage: JobTokenUsage | null
	) => void;
	onError?: (error: string, errorCode: string | null, canRetry: boolean) => void;
	onCancelled?: () => void;
	autoReconnect?: boolean;
	maxReconnectAttempts?: number;
}

export interface UseGenerationJobReturn {
	startGenerate: (request: CreateGenerateJobRequest) => Promise<JobResponse>;
	startRefine: (request: CreateRefineJobRequest) => Promise<JobResponse>;
	reconnectToJob: (existingJob: JobResponse) => void;
	cancel: () => Promise<void>;
	job: JobResponse | null;
	status: JobStatus | "idle";
	progress: number;
	progressMessage: string | null;
	isRunning: boolean;
	isConnected: boolean;
	error: string | null;
	activeConversationId: string | null;
	reset: () => void;
}

export function useGenerationJob(options: UseGenerationJobOptions = {}): UseGenerationJobReturn {
	const {
		onStart,
		onProgress,
		onChunk,
		onComplete,
		onError,
		onCancelled,
		autoReconnect = true,
		maxReconnectAttempts = 3,
	} = options;

	const { tokens } = useAuth();

	const [job, setJob] = useState<JobResponse | null>(null);
	const [status, setStatus] = useState<JobStatus | "idle">("idle");
	const [progress, setProgress] = useState(0);
	const [progressMessage, setProgressMessage] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

	const eventSourceRef = useRef<EventSource | null>(null);
	const reconnectAttemptsRef = useRef(0);
	const jobIdRef = useRef<string | null>(null);
	const connectToStreamRef = useRef<((jobId: string) => void) | null>(null);
	const intentionalCloseRef = useRef(false);

	const api = tokens?.accessToken ? createJobsApiClient(tokens.accessToken) : null;

	const connectToStream = useCallback(
		(jobId: string) => {
			if (!tokens?.accessToken) {
				setError("Not authenticated");
				return;
			}

			if (eventSourceRef.current) {
				eventSourceRef.current.close();
			}

			jobIdRef.current = jobId;
			intentionalCloseRef.current = false;

			const url = `${API_BASE_URL}/api/v1/jobs/${jobId}/stream?token=${encodeURIComponent(
				tokens.accessToken
			)}`;

			const eventSource = new EventSource(url);
			eventSourceRef.current = eventSource;

			eventSource.onopen = () => {
				setIsConnected(true);
				reconnectAttemptsRef.current = 0;
			};

			const handleEvent = (event: MessageEvent) => {
				try {
					const data = JSON.parse(event.data) as SSEEvent;

					switch (data.type) {
						case "job:started":
							setStatus(data.status);
							setActiveConversationId(data.conversationId);
							onStart?.(data.jobId);
							break;

						case "job:progress":
							setProgress(data.progress);
							setProgressMessage(data.message);
							onProgress?.(data.progress, data.message);
							break;

						case "job:chunk":
							onChunk?.(data.chunk, data.position);
							break;

						case "job:completed":
							setStatus("completed");
							setProgress(100);
							setActiveConversationId(null);
							setJob((prev) =>
								prev
									? {
											...prev,
											status: "completed",
											result: data.result,
											html: data.html,
									  }
									: null
							);
							onComplete?.(data.result, data.html, data.tokenUsage);
							intentionalCloseRef.current = true;
							jobIdRef.current = null;
							eventSource.close();
							setIsConnected(false);
							break;

						case "job:failed":
							setStatus("failed");
							setError(data.error);
							setActiveConversationId(null);
							onError?.(data.error, data.errorCode, data.canRetry);
							intentionalCloseRef.current = true;
							jobIdRef.current = null;
							eventSource.close();
							setIsConnected(false);
							break;

						case "job:cancelled":
							setStatus("cancelled");
							setActiveConversationId(null);
							onCancelled?.();
							intentionalCloseRef.current = true;
							jobIdRef.current = null;
							eventSource.close();
							setIsConnected(false);
							break;

						case "job:heartbeat":
							setStatus(data.status);
							setProgress(data.progress);
							break;
					}
				} catch (e) {
					console.error("Failed to parse SSE event:", e);
				}
			};

			eventSource.addEventListener("job:started", handleEvent);
			eventSource.addEventListener("job:progress", handleEvent);
			eventSource.addEventListener("job:chunk", handleEvent);
			eventSource.addEventListener("job:completed", handleEvent);
			eventSource.addEventListener("job:failed", handleEvent);
			eventSource.addEventListener("job:cancelled", handleEvent);
			eventSource.addEventListener("job:heartbeat", handleEvent);

			eventSource.onmessage = handleEvent;

			eventSource.onerror = () => {
				setIsConnected(false);

				if (intentionalCloseRef.current) {
					return;
				}

				if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
					reconnectAttemptsRef.current++;
					setTimeout(() => {
						if (jobIdRef.current && connectToStreamRef.current) {
							connectToStreamRef.current(jobIdRef.current);
						}
					}, 1000 * reconnectAttemptsRef.current);
				} else {
					eventSource.close();
					setError("Connection lost");
				}
			};
		},
		[
			tokens,
			autoReconnect,
			maxReconnectAttempts,
			onStart,
			onProgress,
			onChunk,
			onComplete,
			onError,
			onCancelled,
		]
	);

	useEffect(() => {
		connectToStreamRef.current = connectToStream;
	}, [connectToStream]);

	useEffect(() => {
		return () => {
			if (eventSourceRef.current) {
				intentionalCloseRef.current = true;
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
		};
	}, []);

	const startGenerate = useCallback(
		async (request: CreateGenerateJobRequest): Promise<JobResponse> => {
			if (!api) {
				throw new JobsApiError(401, "Not authenticated");
			}

			setError(null);
			setProgress(0);
			setProgressMessage(null);
			setStatus("pending");
			setActiveConversationId(request.conversationId || null);

			const jobResponse = await api.createGenerateJob(request);
			setJob(jobResponse);
			setStatus(jobResponse.status);

			connectToStream(jobResponse.id);

			return jobResponse;
		},
		[api, connectToStream]
	);

	const startRefine = useCallback(
		async (request: CreateRefineJobRequest): Promise<JobResponse> => {
			if (!api) {
				throw new JobsApiError(401, "Not authenticated");
			}

			setError(null);
			setProgress(0);
			setProgressMessage(null);
			setStatus("pending");
			setActiveConversationId(request.conversationId || null);

			const jobResponse = await api.createRefineJob(request);
			setJob(jobResponse);
			setStatus(jobResponse.status);

			connectToStream(jobResponse.id);

			return jobResponse;
		},
		[api, connectToStream]
	);

	const reconnectToJob = useCallback(
		(existingJob: JobResponse) => {
			if (!tokens?.accessToken) {
				setError("Not authenticated");
				return;
			}

			const activeStatuses: JobStatus[] = ["pending", "processing", "streaming"];
			if (!activeStatuses.includes(existingJob.status)) {
				return;
			}

			setJob(existingJob);
			setStatus(existingJob.status);
			setProgress(existingJob.progress);
			setProgressMessage(existingJob.progressMessage);
			setActiveConversationId(existingJob.conversationId);
			setError(null);

			connectToStream(existingJob.id);
		},
		[tokens, connectToStream]
	);

	const cancel = useCallback(async () => {
		if (!api || !job?.id) {
			return;
		}

		try {
			await api.cancelJob(job.id);
			setStatus("cancelled");

			if (eventSourceRef.current) {
				intentionalCloseRef.current = true;
				jobIdRef.current = null;
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}

			setIsConnected(false);
		} catch (e) {
			console.error("Failed to cancel job:", e);
		}
	}, [api, job]);

	const reset = useCallback(() => {
		if (eventSourceRef.current) {
			intentionalCloseRef.current = true;
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}

		setJob(null);
		setStatus("idle");
		setProgress(0);
		setProgressMessage(null);
		setIsConnected(false);
		setError(null);
		setActiveConversationId(null);
		jobIdRef.current = null;
		reconnectAttemptsRef.current = 0;
	}, []);

	const isRunning = status === "pending" || status === "processing" || status === "streaming";

	return {
		startGenerate,
		startRefine,
		reconnectToJob,
		cancel,
		job,
		status,
		progress,
		progressMessage,
		isRunning,
		isConnected,
		error,
		activeConversationId,
		reset,
	};
}

export function useCreateGenerateJob() {
	const { tokens } = useAuth();
	const api = tokens?.accessToken ? createJobsApiClient(tokens.accessToken) : null;

	return useMutation({
		mutationFn: (request: CreateGenerateJobRequest) => {
			if (!api) {
				throw new JobsApiError(401, "Not authenticated");
			}
			return api.createGenerateJob(request);
		},
	});
}

export function useCreateRefineJob() {
	const { tokens } = useAuth();
	const api = tokens?.accessToken ? createJobsApiClient(tokens.accessToken) : null;

	return useMutation({
		mutationFn: (request: CreateRefineJobRequest) => {
			if (!api) {
				throw new JobsApiError(401, "Not authenticated");
			}
			return api.createRefineJob(request);
		},
	});
}

export function useCancelJob() {
	const { tokens } = useAuth();
	const api = tokens?.accessToken ? createJobsApiClient(tokens.accessToken) : null;

	return useMutation({
		mutationFn: (jobId: string) => {
			if (!api) {
				throw new JobsApiError(401, "Not authenticated");
			}
			return api.cancelJob(jobId);
		},
	});
}

export function useActiveJobs(
	tenantId: string | null | undefined,
	options?: { enabled?: boolean }
) {
	const { tokens, isLoading: isAuthLoading } = useAuth();
	const api = tokens?.accessToken ? createJobsApiClient(tokens.accessToken) : null;

	return useQuery({
		queryKey: ["jobs", "active", tenantId],
		queryFn: async () => {
			if (!api) {
				throw new JobsApiError(401, "Not authenticated");
			}
			const response = await api.getActiveJobs(tenantId || undefined);
			return response.jobs;
		},
		enabled: !!tokens?.accessToken && !isAuthLoading && !!tenantId && (options?.enabled ?? true),
		staleTime: 5000,
		refetchOnWindowFocus: true,
	});
}

export { JobsApiError };
