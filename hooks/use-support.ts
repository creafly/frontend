"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupportApiClient, submitErrorReport } from "@/lib/api/support";
import { useAuth } from "@/providers/auth-provider";
import type {
	CreateTicketRequest,
	UpdateTicketRequest,
	CreateMessageRequest,
	CreateErrorReportRequest,
	TicketStatus,
	TicketPriority,
	TicketCategory,
} from "@/types/support";

function useSupportApi() {
	const { tokens } = useAuth();
	return createSupportApiClient(tokens?.accessToken || null);
}

export function useMyTickets(params?: { status?: TicketStatus; page?: number; pageSize?: number }) {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["my-tickets", params],
		queryFn: () => api.tickets.getMyTickets(params),
		enabled: isAuthenticated,
	});
}

export function useAllTickets(params?: {
	status?: TicketStatus;
	priority?: TicketPriority;
	category?: TicketCategory;
	page?: number;
	pageSize?: number;
}) {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["all-tickets", params],
		queryFn: () => api.tickets.list(params),
		enabled: isAuthenticated,
	});
}

export function useTicket(id: string) {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["ticket", id],
		queryFn: () => api.tickets.get(id),
		enabled: isAuthenticated && !!id,
	});
}

export function useTicketMessages(ticketId: string) {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["ticket-messages", ticketId],
		queryFn: () => api.messages.list(ticketId),
		enabled: isAuthenticated && !!ticketId,
	});
}

export function useTicketStats() {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["ticket-stats"],
		queryFn: () => api.tickets.getStats(),
		enabled: isAuthenticated,
	});
}

export function useCreateTicket() {
	const queryClient = useQueryClient();
	const api = useSupportApi();

	return useMutation({
		mutationFn: (request: CreateTicketRequest) => api.tickets.create(request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
			queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
			queryClient.invalidateQueries({ queryKey: ["ticket-stats"] });
		},
	});
}

export function useUpdateTicket() {
	const queryClient = useQueryClient();
	const api = useSupportApi();

	return useMutation({
		mutationFn: ({ id, request }: { id: string; request: UpdateTicketRequest }) =>
			api.tickets.update(id, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["ticket", variables.id] });
			queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
			queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
			queryClient.invalidateQueries({ queryKey: ["ticket-stats"] });
		},
	});
}

export function useDeleteTicket() {
	const queryClient = useQueryClient();
	const api = useSupportApi();

	return useMutation({
		mutationFn: (id: string) => api.tickets.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
			queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
			queryClient.invalidateQueries({ queryKey: ["ticket-stats"] });
		},
	});
}

export function useCreateMessage() {
	const queryClient = useQueryClient();
	const api = useSupportApi();

	return useMutation({
		mutationFn: ({ ticketId, request }: { ticketId: string; request: CreateMessageRequest }) =>
			api.messages.create(ticketId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["ticket-messages", variables.ticketId] });
			queryClient.invalidateQueries({ queryKey: ["ticket", variables.ticketId] });
		},
	});
}

export function useSubmitErrorReport() {
	return useMutation({
		mutationFn: (request: CreateErrorReportRequest) => submitErrorReport(request),
	});
}

export function useAdminTickets(params?: {
	status?: TicketStatus;
	priority?: TicketPriority;
	category?: TicketCategory;
	page?: number;
	pageSize?: number;
}) {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["admin-tickets", params],
		queryFn: () => api.admin.tickets.list(params),
		enabled: isAuthenticated,
	});
}

export function useAdminTicket(id: string) {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["admin-ticket", id],
		queryFn: () => api.admin.tickets.get(id),
		enabled: isAuthenticated && !!id,
	});
}

export function useAdminTicketMessages(ticketId: string) {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["admin-ticket-messages", ticketId],
		queryFn: () => api.admin.messages.list(ticketId),
		enabled: isAuthenticated && !!ticketId,
	});
}

export function useAdminTicketStats() {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["admin-ticket-stats"],
		queryFn: () => api.admin.tickets.getStats(),
		enabled: isAuthenticated,
	});
}

export function useAdminUpdateTicket() {
	const queryClient = useQueryClient();
	const api = useSupportApi();

	return useMutation({
		mutationFn: ({ id, request }: { id: string; request: UpdateTicketRequest }) =>
			api.admin.tickets.update(id, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["admin-ticket", variables.id] });
			queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
			queryClient.invalidateQueries({ queryKey: ["admin-ticket-stats"] });
		},
	});
}

export function useAdminCreateMessage() {
	const queryClient = useQueryClient();
	const api = useSupportApi();

	return useMutation({
		mutationFn: ({ ticketId, request }: { ticketId: string; request: CreateMessageRequest }) =>
			api.admin.messages.create(ticketId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["admin-ticket-messages", variables.ticketId] });
			queryClient.invalidateQueries({ queryKey: ["admin-ticket", variables.ticketId] });
		},
	});
}

export function useAdminErrorReports(params?: { page?: number; pageSize?: number }) {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["admin-error-reports", params],
		queryFn: () => api.admin.errorReports.list(params),
		enabled: isAuthenticated,
	});
}

export function useAdminErrorReport(id: string) {
	const api = useSupportApi();
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["admin-error-report", id],
		queryFn: () => api.admin.errorReports.get(id),
		enabled: isAuthenticated && !!id,
	});
}

export function useAdminDeleteErrorReports() {
	const queryClient = useQueryClient();
	const api = useSupportApi();

	return useMutation({
		mutationFn: (ids: string[]) => api.admin.errorReports.bulkDelete(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-error-reports"] });
		},
	});
}
