"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
} from "@/components/ui/empty";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "@/providers/i18n-provider";
import { useTabsWithUrl } from "@/hooks/use-tabs-with-url";
import {
	useAdminTickets,
	useAdminTicketStats,
	useAdminErrorReports,
	useAdminDeleteErrorReports,
	useFlaggedRequests,
	useFlaggedRequestStats,
	useReviewFlaggedRequest,
	useDeleteFlaggedRequest,
} from "@/hooks/use-support";
import { BlurFade } from "@/components/ui/blur-fade";
import {
	TypographyH3,
	TypographyP,
	TypographyError,
	TypographyMuted,
	TypographyStats,
	Icon,
} from "@/components/typography";
import {
	IconTicket,
	IconClock,
	IconAlertCircle,
	IconCircleCheck,
	IconCircleX,
	IconFilter,
	IconBug,
	IconTrash,
	IconFlag,
	IconEye,
} from "@tabler/icons-react";
import type {
	TicketStatus,
	TicketPriority,
	TicketCategory,
	FlaggedRequestStatus,
	FlaggedRequestSeverity,
} from "@/types/support";

const statusIcons: Record<TicketStatus, React.ComponentType<{ className?: string }>> = {
	open: IconAlertCircle,
	in_progress: IconClock,
	resolved: IconCircleCheck,
	closed: IconCircleX,
};

const statusColors: Record<TicketStatus, string> = {
	open: "bg-info/10 text-info",
	in_progress: "bg-warning/10 text-warning-foreground",
	resolved: "bg-success/10 text-success",
	closed: "bg-muted text-muted-foreground",
};

const priorityColors: Record<TicketPriority, string> = {
	low: "bg-muted text-muted-foreground",
	medium: "bg-info/10 text-info",
	high: "bg-warning/10 text-warning-foreground",
	urgent: "bg-destructive/10 text-destructive",
};

const severityColors: Record<FlaggedRequestSeverity, string> = {
	low: "bg-muted text-muted-foreground",
	medium: "bg-warning/10 text-warning-foreground",
	high: "bg-warning/10 text-warning-foreground",
	critical: "bg-destructive/10 text-destructive",
};

const flaggedStatusColors: Record<FlaggedRequestStatus, string> = {
	pending: "bg-warning/10 text-warning-foreground",
	reviewed: "bg-info/10 text-info",
	dismissed: "bg-muted text-muted-foreground",
	action_taken: "bg-success/10 text-success",
};

export default function AdminSupportPage() {
	const t = useTranslations();
	const { tabsProps } = useTabsWithUrl({ defaultTab: "tickets" });

	const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
	const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
	const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all");
	const [currentPage, setCurrentPage] = useState(0);
	const [errorReportsPage, setErrorReportsPage] = useState(0);
	const [pageSize] = useState(10);
	const [selectedErrorReports, setSelectedErrorReports] = useState<Set<string>>(new Set());
	const [flaggedRequestsPage, setFlaggedRequestsPage] = useState(0);
	const [flaggedStatusFilter, setFlaggedStatusFilter] = useState<FlaggedRequestStatus | "all">(
		"all"
	);
	const [flaggedSeverityFilter, setFlaggedSeverityFilter] = useState<
		FlaggedRequestSeverity | "all"
	>("all");
	const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [selectedFlaggedRequest, setSelectedFlaggedRequest] = useState<{
		id: string;
		content: string;
	} | null>(null);
	const [reviewStatus, setReviewStatus] = useState<FlaggedRequestStatus>("reviewed");
	const [reviewNotes, setReviewNotes] = useState("");

	const { data, isLoading, error } = useAdminTickets({
		status: statusFilter === "all" ? undefined : statusFilter,
		priority: priorityFilter === "all" ? undefined : priorityFilter,
		category: categoryFilter === "all" ? undefined : categoryFilter,
		offset: currentPage * pageSize,
		limit: pageSize,
	});

	const { data: stats, isLoading: statsLoading } = useAdminTicketStats();

	const { data: errorReportsData, isLoading: errorReportsLoading } = useAdminErrorReports({
		offset: errorReportsPage * pageSize,
		limit: pageSize,
	});

	const deleteErrorReportsMutation = useAdminDeleteErrorReports();

	const { data: flaggedRequestsData, isLoading: flaggedRequestsLoading } = useFlaggedRequests({
		status: flaggedStatusFilter === "all" ? undefined : flaggedStatusFilter,
		severity: flaggedSeverityFilter === "all" ? undefined : flaggedSeverityFilter,
		offset: flaggedRequestsPage * pageSize,
		limit: pageSize,
	});

	const { data: flaggedStats, isLoading: flaggedStatsLoading } = useFlaggedRequestStats();
	const reviewFlaggedRequestMutation = useReviewFlaggedRequest();
	const deleteFlaggedRequestMutation = useDeleteFlaggedRequest();

	const handleSelectAll = (checked: boolean) => {
		if (checked && errorReportsData?.error_reports) {
			setSelectedErrorReports(new Set(errorReportsData.error_reports.map((r) => r.id)));
		} else {
			setSelectedErrorReports(new Set());
		}
	};

	const handleSelectOne = (id: string, checked: boolean) => {
		const newSelected = new Set(selectedErrorReports);
		if (checked) {
			newSelected.add(id);
		} else {
			newSelected.delete(id);
		}
		setSelectedErrorReports(newSelected);
	};

	const handleDeleteSelected = () => {
		const ids = Array.from(selectedErrorReports);
		deleteErrorReportsMutation.mutate(ids, {
			onSuccess: () => {
				toast.success(t.admin.errorReportsDeleted);
				setSelectedErrorReports(new Set());
			},
		});
	};

	const openReviewDialog = (id: string, content: string) => {
		setSelectedFlaggedRequest({ id, content });
		setReviewStatus("reviewed");
		setReviewNotes("");
		setReviewDialogOpen(true);
	};

	const handleReviewFlaggedRequest = () => {
		if (!selectedFlaggedRequest) return;
		reviewFlaggedRequestMutation.mutate(
			{
				id: selectedFlaggedRequest.id,
				request: { status: reviewStatus, review_notes: reviewNotes || undefined },
			},
			{
				onSuccess: () => {
					toast.success(t.admin.flaggedRequestReviewed);
					setReviewDialogOpen(false);
					setSelectedFlaggedRequest(null);
				},
				onError: (error) => {
					toast.error(error instanceof Error ? error.message : t.errors.updateFailed);
				},
			}
		);
	};

	const handleDeleteFlaggedRequest = (id: string) => {
		deleteFlaggedRequestMutation.mutate(id, {
			onSuccess: () => {
				toast.success(t.admin.flaggedRequestDeleted);
			},
			onError: (error) => {
				toast.error(error instanceof Error ? error.message : t.errors.deleteFailed);
			},
		});
	};

	const isAllSelected =
		errorReportsData?.error_reports &&
		errorReportsData.error_reports.length > 0 &&
		errorReportsData.error_reports.every((r) => selectedErrorReports.has(r.id));

	const categories: TicketCategory[] = [
		"general",
		"bug",
		"feature",
		"billing",
		"account",
		"technical",
	];
	const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];
	const statuses: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
	const flaggedStatuses: FlaggedRequestStatus[] = [
		"pending",
		"reviewed",
		"dismissed",
		"action_taken",
	];
	const severities: FlaggedRequestSeverity[] = ["low", "medium", "high", "critical"];

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<TypographyError>{error.message}</TypographyError>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<BlurFade delay={0.1}>
				<div className="flex items-center justify-between">
					<div>
						<TypographyH3>{t.admin.supportTickets}</TypographyH3>
						<TypographyP className="mt-1 text-muted-foreground">
							{t.admin.supportTicketsDescription}
						</TypographyP>
					</div>
				</div>
			</BlurFade>

			<Tabs {...tabsProps} className="space-y-6">
				<TabsList>
					<TabsTrigger value="tickets" className="gap-2">
						<Icon icon={IconTicket} size="sm" />
						{t.admin.supportTickets}
					</TabsTrigger>
					<TabsTrigger value="flagged-requests" className="gap-2">
						<Icon icon={IconFlag} size="sm" />
						{t.admin.flaggedRequests}
						{flaggedStats && flaggedStats.pending > 0 && (
							<Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
								{flaggedStats.pending}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="error-reports" className="gap-2">
						<Icon icon={IconBug} size="sm" />
						{t.admin.errorReports}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="tickets" className="space-y-6">
					<BlurFade delay={0.15}>
						<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
							{statsLoading ? (
								[...Array(5)].map((_, i) => (
									<Card key={i}>
										<CardHeader className="pb-2">
											<Skeleton className="h-4 w-20" />
										</CardHeader>
										<CardContent>
											<Skeleton className="h-8 w-12" />
										</CardContent>
									</Card>
								))
							) : stats ? (
								<>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-muted-foreground">
												{t.admin.allTickets}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{stats.total_tickets}</TypographyStats>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-info">
												{t.admin.openTickets}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{stats.open_tickets}</TypographyStats>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-warning">
												{t.admin.inProgressTickets}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{stats.in_progress_tickets}</TypographyStats>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-success">
												{t.admin.resolvedTickets}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{stats.resolved_tickets}</TypographyStats>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-muted-foreground">
												{t.admin.closedTickets}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{stats.closed_tickets}</TypographyStats>
										</CardContent>
									</Card>
								</>
							) : null}
						</div>
					</BlurFade>

					<BlurFade delay={0.2}>
						<div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
							<div className="flex items-center gap-2">
								<Icon icon={IconFilter} size="sm" className="text-muted-foreground" />
								<span className="text-sm font-medium">{t.common.filters}:</span>
							</div>
							<Select
								value={statusFilter}
								onValueChange={(v) => {
									setStatusFilter(v as TicketStatus | "all");
									setCurrentPage(0);
								}}
							>
								<SelectTrigger className="w-40">
									<SelectValue placeholder={t.admin.filterByStatus} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t.common.all}</SelectItem>
									{statuses.map((status) => (
										<SelectItem key={status} value={status}>
											{t.support.statuses[status]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={priorityFilter}
								onValueChange={(v) => {
									setPriorityFilter(v as TicketPriority | "all");
									setCurrentPage(0);
								}}
							>
								<SelectTrigger className="w-40">
									<SelectValue placeholder={t.admin.filterByPriority} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t.common.all}</SelectItem>
									{priorities.map((priority) => (
										<SelectItem key={priority} value={priority}>
											{t.support.priorities[priority]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={categoryFilter}
								onValueChange={(v) => {
									setCategoryFilter(v as TicketCategory | "all");
									setCurrentPage(0);
								}}
							>
								<SelectTrigger className="w-40">
									<SelectValue placeholder={t.admin.filterByCategory} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t.common.all}</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{t.support.categories[category]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</BlurFade>

					<BlurFade delay={0.25}>
						{isLoading ? (
							<div className="border rounded-md">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t.support.ticketSubject}</TableHead>
											<TableHead>{t.admin.users}</TableHead>
											<TableHead>{t.support.ticketCategory}</TableHead>
											<TableHead>{t.support.ticketPriority}</TableHead>
											<TableHead>{t.common.status}</TableHead>
											<TableHead>{t.templates.columns.created}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{[...Array(5)].map((_, i) => (
											<TableRow key={i}>
												<TableCell>
													<Skeleton className="h-5 w-48" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-32" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-20" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-16" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-24" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-28" />
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						) : data?.tickets && data.tickets.length > 0 ? (
							<div className="space-y-4">
								<div className="border rounded-md">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{t.support.ticketSubject}</TableHead>
												<TableHead>{t.admin.users}</TableHead>
												<TableHead>{t.support.ticketCategory}</TableHead>
												<TableHead>{t.support.ticketPriority}</TableHead>
												<TableHead>{t.common.status}</TableHead>
												<TableHead>{t.templates.columns.created}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.tickets.map((ticket) => {
												const StatusIcon = statusIcons[ticket.status];
												return (
													<TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
														<TableCell>
															<Link
																href={`/admin/support/${ticket.id}`}
																className="font-medium hover:underline"
															>
																{ticket.subject}
															</Link>
														</TableCell>
														<TableCell className="text-muted-foreground">
															{ticket.user_id}
														</TableCell>
														<TableCell>
															<Badge variant="outline">
																{t.support.categories[ticket.category]}
															</Badge>
														</TableCell>
														<TableCell>
															<Badge className={priorityColors[ticket.priority]}>
																{t.support.priorities[ticket.priority]}
															</Badge>
														</TableCell>
														<TableCell>
															<Badge className={`gap-1 ${statusColors[ticket.status]}`}>
																<Icon icon={StatusIcon} size="xs" />
																{t.support.statuses[ticket.status]}
															</Badge>
														</TableCell>
														<TableCell className="text-muted-foreground">
															{new Date(ticket.created_at).toLocaleDateString()}
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</div>

								<div className="flex items-center justify-between">
									<TypographyMuted>
										{t.common.showing} {data.offset + 1}-{data.offset + (data.tickets?.length || 0)}{" "}
										{t.common.of} {data.total}
									</TypographyMuted>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
											disabled={currentPage === 0}
										>
											{t.common.previous}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setCurrentPage(currentPage + 1)}
											disabled={!data.tickets || data.offset + data.limit >= data.total}
										>
											{t.common.next}
										</Button>
									</div>
								</div>
							</div>
						) : (
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Icon icon={IconTicket} size="xl" className="text-muted-foreground" />
									</EmptyMedia>
									<EmptyTitle>{t.admin.noTickets}</EmptyTitle>
									<EmptyDescription>{t.support.noTicketsDescription}</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
					</BlurFade>
				</TabsContent>

				<TabsContent value="flagged-requests" className="space-y-6">
					<BlurFade delay={0.15}>
						<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
							{flaggedStatsLoading ? (
								[...Array(5)].map((_, i) => (
									<Card key={i}>
										<CardHeader className="pb-2">
											<Skeleton className="h-4 w-20" />
										</CardHeader>
										<CardContent>
											<Skeleton className="h-8 w-12" />
										</CardContent>
									</Card>
								))
							) : flaggedStats ? (
								<>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-muted-foreground">
												{t.admin.allTickets}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{flaggedStats.total}</TypographyStats>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-warning-foreground">
												{t.admin.pending}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{flaggedStats.pending}</TypographyStats>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-info">
												{t.admin.reviewed}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{flaggedStats.reviewed}</TypographyStats>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-muted-foreground">
												{t.admin.dismissed}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{flaggedStats.dismissed}</TypographyStats>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium text-success">
												{t.admin.actionTaken}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<TypographyStats>{flaggedStats.action_taken}</TypographyStats>
										</CardContent>
									</Card>
								</>
							) : null}
						</div>
					</BlurFade>

					<BlurFade delay={0.2}>
						<div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
							<div className="flex items-center gap-2">
								<Icon icon={IconFilter} size="sm" className="text-muted-foreground" />
								<span className="text-sm font-medium">{t.common.filters}:</span>
							</div>
							<Select
								value={flaggedStatusFilter}
								onValueChange={(v) => {
									setFlaggedStatusFilter(v as FlaggedRequestStatus | "all");
									setFlaggedRequestsPage(0);
								}}
							>
								<SelectTrigger className="w-40">
									<SelectValue placeholder={t.admin.filterByStatus} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t.common.all}</SelectItem>
									{flaggedStatuses.map((status) => (
										<SelectItem key={status} value={status}>
											{t.admin.flaggedStatuses[status]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={flaggedSeverityFilter}
								onValueChange={(v) => {
									setFlaggedSeverityFilter(v as FlaggedRequestSeverity | "all");
									setFlaggedRequestsPage(0);
								}}
							>
								<SelectTrigger className="w-40">
									<SelectValue placeholder={t.admin.filterBySeverity} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t.common.all}</SelectItem>
									{severities.map((severity) => (
										<SelectItem key={severity} value={severity}>
											{t.admin.severities[severity]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</BlurFade>

					<BlurFade delay={0.25}>
						{flaggedRequestsLoading ? (
							<div className="border rounded-md">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t.admin.messageContent}</TableHead>
											<TableHead>{t.admin.reason}</TableHead>
											<TableHead>{t.admin.severity}</TableHead>
											<TableHead>{t.common.status}</TableHead>
											<TableHead>{t.templates.columns.created}</TableHead>
											<TableHead className="w-25">{t.common.actions}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{[...Array(5)].map((_, i) => (
											<TableRow key={i}>
												<TableCell>
													<Skeleton className="h-5 w-48" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-32" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-16" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-20" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-24" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-8 w-16" />
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						) : flaggedRequestsData?.flagged_requests &&
						  flaggedRequestsData.flagged_requests.length > 0 ? (
							<div className="space-y-4">
								<div className="border rounded-md">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{t.admin.messageContent}</TableHead>
												<TableHead>{t.admin.reason}</TableHead>
												<TableHead>{t.admin.severity}</TableHead>
												<TableHead>{t.common.status}</TableHead>
												<TableHead>{t.templates.columns.created}</TableHead>
												<TableHead className="w-25">{t.common.actions}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{flaggedRequestsData.flagged_requests.map((request) => (
												<TableRow key={request.id}>
													<TableCell className="max-w-xs">
														<TypographyP className="truncate mt-0" title={request.message_content}>
															{request.message_content}
														</TypographyP>
													</TableCell>
													<TableCell className="max-w-xs">
														<TypographyMuted className="truncate" title={request.reason}>
															{request.reason}
														</TypographyMuted>
													</TableCell>
													<TableCell>
														<Badge className={severityColors[request.severity]}>
															{t.admin.severities[request.severity]}
														</Badge>
													</TableCell>
													<TableCell>
														<Badge className={flaggedStatusColors[request.status]}>
															{t.admin.flaggedStatuses[request.status]}
														</Badge>
													</TableCell>
													<TableCell className="text-muted-foreground">
														{new Date(request.created_at).toLocaleDateString()}
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-1">
															{request.status === "pending" && (
																<Button
																	variant="ghost"
																	size="icon-sm"
																	onClick={() =>
																		openReviewDialog(request.id, request.message_content)
																	}
																	title={t.admin.review}
																>
																	<Icon icon={IconEye} size="sm" />
																</Button>
															)}
															<Button
																variant="ghost"
																size="icon-sm"
																className="text-destructive hover:text-destructive"
																onClick={() => handleDeleteFlaggedRequest(request.id)}
																disabled={deleteFlaggedRequestMutation.isPending}
																title={t.common.delete}
															>
																<Icon icon={IconTrash} size="sm" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								<div className="flex items-center justify-between">
									<TypographyMuted>
										{t.common.showing} {flaggedRequestsData.offset + 1}-
										{flaggedRequestsData.offset +
											(flaggedRequestsData.flagged_requests?.length || 0)}{" "}
										{t.common.of} {flaggedRequestsData.total}
									</TypographyMuted>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setFlaggedRequestsPage(Math.max(0, flaggedRequestsPage - 1))}
											disabled={flaggedRequestsPage === 0}
										>
											{t.common.previous}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setFlaggedRequestsPage(flaggedRequestsPage + 1)}
											disabled={
												!flaggedRequestsData.flagged_requests ||
												flaggedRequestsData.offset + flaggedRequestsData.flagged_requests.length >=
													flaggedRequestsData.total
											}
										>
											{t.common.next}
										</Button>
									</div>
								</div>
							</div>
						) : (
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Icon icon={IconFlag} size="xl" className="text-muted-foreground" />
									</EmptyMedia>
									<EmptyTitle>{t.admin.noFlaggedRequests}</EmptyTitle>
									<EmptyDescription>{t.admin.noFlaggedRequestsDescription}</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
					</BlurFade>
				</TabsContent>

				<TabsContent value="error-reports" className="space-y-6">
					{selectedErrorReports.size > 0 && (
						<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
							<span className="text-sm font-medium">
								{t.admin.selectedCount.replace("{count}", selectedErrorReports.size.toString())}
							</span>
							<Button
								variant="destructive"
								size="sm"
								onClick={handleDeleteSelected}
								disabled={deleteErrorReportsMutation.isPending}
							>
								<Icon icon={IconTrash} size="sm" className="mr-2" />
								{t.admin.deleteSelected}
							</Button>
						</div>
					)}
					{errorReportsLoading ? (
						<div className="border rounded-md">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-12"></TableHead>
										<TableHead>{t.admin.errorCode}</TableHead>
										<TableHead>{t.admin.errorMessage}</TableHead>
										<TableHead>{t.admin.url}</TableHead>
										<TableHead>{t.admin.linkedTicket}</TableHead>
										<TableHead>{t.templates.columns.created}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{[...Array(5)].map((_, i) => (
										<TableRow key={i}>
											<TableCell>
												<Skeleton className="h-5 w-5" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-16" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-48" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-32" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-28" />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : errorReportsData?.error_reports && errorReportsData.error_reports.length > 0 ? (
						<div className="space-y-4">
							<div className="border rounded-md">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-12">
												<Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
											</TableHead>
											<TableHead>{t.admin.errorCode}</TableHead>
											<TableHead>{t.admin.errorMessage}</TableHead>
											<TableHead>{t.admin.url}</TableHead>
											<TableHead>{t.admin.linkedTicket}</TableHead>
											<TableHead>{t.templates.columns.created}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{errorReportsData.error_reports.map((report) => (
											<TableRow key={report.id}>
												<TableCell>
													<Checkbox
														checked={selectedErrorReports.has(report.id)}
														onCheckedChange={(checked) =>
															handleSelectOne(report.id, checked as boolean)
														}
													/>
												</TableCell>
												<TableCell>
													<Badge variant="outline">{report.error_code}</Badge>
												</TableCell>
												<TableCell className="max-w-xs truncate">{report.error_message}</TableCell>
												<TableCell className="max-w-xs truncate text-muted-foreground">
													{report.url}
												</TableCell>
												<TableCell>
													{report.ticket_id ? (
														<Link
															href={`/admin/support/${report.ticket_id}`}
															className="text-primary hover:underline"
														>
															{t.common.view}
														</Link>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell className="text-muted-foreground">
													{new Date(report.created_at).toLocaleDateString()}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							<div className="flex items-center justify-between">
								<TypographyMuted>
									{t.common.showing} {errorReportsData.offset + 1}-
									{errorReportsData.offset + (errorReportsData.error_reports?.length || 0)}{" "}
									{t.common.of} {errorReportsData.total}
								</TypographyMuted>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setErrorReportsPage(Math.max(0, errorReportsPage - 1))}
										disabled={errorReportsPage === 0}
									>
										{t.common.previous}
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setErrorReportsPage(errorReportsPage + 1)}
										disabled={
											!errorReportsData.error_reports ||
											errorReportsData.offset + errorReportsData.limit >= errorReportsData.total
										}
									>
										{t.common.next}
									</Button>
								</div>
							</div>
						</div>
					) : (
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Icon icon={IconBug} size="xl" className="text-muted-foreground" />
								</EmptyMedia>
								<EmptyTitle>{t.admin.noErrorReports}</EmptyTitle>
								<EmptyDescription>{t.admin.noErrorReportsDescription}</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
				</TabsContent>
			</Tabs>

			<Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.admin.reviewFlaggedRequest}</DialogTitle>
						<DialogDescription>{t.admin.reviewFlaggedRequestDescription}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{selectedFlaggedRequest && (
							<div className="p-3 bg-muted rounded-md">
								<Label className="text-xs text-muted-foreground">{t.admin.messageContent}</Label>
								<TypographyP className="mt-1 text-sm">{selectedFlaggedRequest.content}</TypographyP>
							</div>
						)}
						<div className="space-y-2">
							<Label>{t.common.status}</Label>
							<Select
								value={reviewStatus}
								onValueChange={(v) => setReviewStatus(v as FlaggedRequestStatus)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="reviewed">{t.admin.flaggedStatuses.reviewed}</SelectItem>
									<SelectItem value="dismissed">{t.admin.flaggedStatuses.dismissed}</SelectItem>
									<SelectItem value="action_taken">
										{t.admin.flaggedStatuses.action_taken}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>{t.admin.reviewNotes}</Label>
							<textarea
								value={reviewNotes}
								onChange={(e) => setReviewNotes(e.target.value)}
								placeholder={t.admin.reviewNotesPlaceholder}
								className="w-full px-3 py-2 border rounded-md text-sm"
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button
							onClick={handleReviewFlaggedRequest}
							disabled={reviewFlaggedRequestMutation.isPending}
						>
							{reviewFlaggedRequestMutation.isPending ? t.common.saving : t.admin.submitReview}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
