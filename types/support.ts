export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "general" | "bug" | "feature" | "billing" | "account" | "technical";

export interface Ticket {
	id: string;
	tenant_id: string;
	user_id: string;
	assignee_id?: string;
	subject: string;
	description: string;
	status: TicketStatus;
	priority: TicketPriority;
	category: TicketCategory;
	resolved_at?: string;
	closed_at?: string;
	created_at: string;
	updated_at: string;
	messages?: TicketMessage[];
	user_name?: string;
	user_email?: string;
}

export interface TicketMessage {
	id: string;
	ticket_id: string;
	user_id: string;
	content: string;
	is_staff: boolean;
	created_at: string;
	updated_at: string;
	user_name?: string;
}

export interface ErrorReport {
	id: string;
	ticket_id?: string;
	tenant_id?: string;
	user_id?: string;
	error_code: number;
	error_message: string;
	stack_trace?: string;
	url: string;
	user_agent: string;
	metadata?: string;
	created_at: string;
}

export interface CreateTicketRequest {
	subject: string;
	description: string;
	priority: TicketPriority;
	category: TicketCategory;
}

export interface UpdateTicketRequest {
	subject?: string;
	description?: string;
	priority?: TicketPriority;
	category?: TicketCategory;
	status?: TicketStatus;
	assignee_id?: string;
}

export interface CreateMessageRequest {
	content: string;
}

export interface CreateErrorReportRequest {
	error_code: number;
	error_message: string;
	stack_trace?: string;
	url: string;
	user_agent: string;
	metadata?: string;
}

export interface TicketListResponse {
	tickets: Ticket[];
	total: number;
	page: number;
	page_size: number;
	total_pages: number;
}

export interface TicketStats {
	total_tickets: number;
	open_tickets: number;
	in_progress_tickets: number;
	resolved_tickets: number;
	closed_tickets: number;
	avg_resolution_ms: number;
	tickets_by_priority: Record<string, number>;
	tickets_by_category: Record<string, number>;
}

export interface ErrorReportListResponse {
	error_reports: ErrorReport[];
	total: number;
	page: number;
	page_size: number;
	total_pages: number;
}
