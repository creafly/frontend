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
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { toast } from "sonner";
import { useTranslations } from "@/providers/i18n-provider";
import { useAdminTickets, useAdminTicketStats, useAdminErrorReports, useAdminDeleteErrorReports } from "@/hooks/use-support";
import { BlurFade } from "@/components/ui/blur-fade";
import { TypographyH3, TypographyP } from "@/components/typography";
import {
	IconTicket,
	IconClock,
	IconAlertCircle,
	IconCircleCheck,
	IconCircleX,
	IconFilter,
	IconBug,
	IconTrash,
} from "@tabler/icons-react";
import type { TicketStatus, TicketPriority, TicketCategory } from "@/types/support";

const statusIcons: Record<TicketStatus, React.ComponentType<{ className?: string }>> = {
	open: IconAlertCircle,
	in_progress: IconClock,
	resolved: IconCircleCheck,
	closed: IconCircleX,
};

const statusColors: Record<TicketStatus, string> = {
	open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
	resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
	closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

const priorityColors: Record<TicketPriority, string> = {
	low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
	medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
	urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function AdminSupportPage() {
	const t = useTranslations();

	const [activeTab, setActiveTab] = useState("tickets");
	const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
	const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
	const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all");
	const [currentPage, setCurrentPage] = useState(0);
	const [errorReportsPage, setErrorReportsPage] = useState(0);
	const [pageSize] = useState(10);
	const [selectedErrorReports, setSelectedErrorReports] = useState<Set<string>>(new Set());

	const { data, isLoading, error } = useAdminTickets({
		status: statusFilter === "all" ? undefined : statusFilter,
		priority: priorityFilter === "all" ? undefined : priorityFilter,
		category: categoryFilter === "all" ? undefined : categoryFilter,
		page: currentPage,
		pageSize,
	});

	const { data: stats, isLoading: statsLoading } = useAdminTicketStats();

	const { data: errorReportsData, isLoading: errorReportsLoading } = useAdminErrorReports({
		page: errorReportsPage,
		pageSize,
	});

	const deleteErrorReportsMutation = useAdminDeleteErrorReports();

	const handleSelectAll = (checked: boolean) => {
		if (checked && errorReportsData?.error_reports) {
			setSelectedErrorReports(new Set(errorReportsData.error_reports.map(r => r.id)));
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

	const isAllSelected = errorReportsData?.error_reports && 
		errorReportsData.error_reports.length > 0 && 
		errorReportsData.error_reports.every(r => selectedErrorReports.has(r.id));

	const categories: TicketCategory[] = ["general", "bug", "feature", "billing", "account", "technical"];
	const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];
	const statuses: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-destructive">{error.message}</p>
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

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList>
					<TabsTrigger value="tickets" className="gap-2">
						<IconTicket className="size-4" />
						{t.admin.supportTickets}
					</TabsTrigger>
					<TabsTrigger value="error-reports" className="gap-2">
						<IconBug className="size-4" />
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
									<p className="text-2xl font-bold">{stats.total_tickets}</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium text-blue-600">
										{t.admin.openTickets}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-bold">{stats.open_tickets}</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium text-yellow-600">
										{t.admin.inProgressTickets}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-bold">{stats.in_progress_tickets}</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium text-green-600">
										{t.admin.resolvedTickets}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-bold">{stats.resolved_tickets}</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										{t.admin.closedTickets}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-bold">{stats.closed_tickets}</p>
								</CardContent>
							</Card>
						</>
					) : null}
				</div>
			</BlurFade>

			<BlurFade delay={0.2}>
				<div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
					<div className="flex items-center gap-2">
						<IconFilter className="size-4 text-muted-foreground" />
						<span className="text-sm font-medium">{t.common.filters}:</span>
					</div>
					<Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as TicketStatus | "all"); setCurrentPage(0); }}>
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
					<Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v as TicketPriority | "all"); setCurrentPage(0); }}>
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
					<Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v as TicketCategory | "all"); setCurrentPage(0); }}>
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
										<TableCell><Skeleton className="h-5 w-48" /></TableCell>
										<TableCell><Skeleton className="h-5 w-32" /></TableCell>
										<TableCell><Skeleton className="h-5 w-20" /></TableCell>
										<TableCell><Skeleton className="h-5 w-16" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-28" /></TableCell>
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
														<StatusIcon className="size-3" />
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
							<p className="text-sm text-muted-foreground">
								{t.common.showing} {(data.page * data.page_size) + 1}-{(data.page * data.page_size) + (data.tickets?.length || 0)} {t.common.of} {data.total}
							</p>
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
									disabled={!data.tickets || currentPage >= data.total_pages - 1}
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
								<IconTicket className="size-8 text-muted-foreground" />
							</EmptyMedia>
							<EmptyTitle>{t.admin.noTickets}</EmptyTitle>
							<EmptyDescription>{t.support.noTicketsDescription}</EmptyDescription>
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
								<IconTrash className="size-4 mr-2" />
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
											<TableCell><Skeleton className="h-5 w-5" /></TableCell>
											<TableCell><Skeleton className="h-5 w-16" /></TableCell>
											<TableCell><Skeleton className="h-5 w-48" /></TableCell>
											<TableCell><Skeleton className="h-5 w-32" /></TableCell>
											<TableCell><Skeleton className="h-5 w-24" /></TableCell>
											<TableCell><Skeleton className="h-5 w-28" /></TableCell>
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
												<Checkbox
													checked={isAllSelected}
													onCheckedChange={handleSelectAll}
												/>
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
														onCheckedChange={(checked) => handleSelectOne(report.id, checked as boolean)}
													/>
												</TableCell>
												<TableCell>
													<Badge variant="outline">{report.error_code}</Badge>
												</TableCell>
												<TableCell className="max-w-xs truncate">
													{report.error_message}
												</TableCell>
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
								<p className="text-sm text-muted-foreground">
									{t.common.showing} {(errorReportsData.page * errorReportsData.page_size) + 1}-{(errorReportsData.page * errorReportsData.page_size) + (errorReportsData.error_reports?.length || 0)} {t.common.of} {errorReportsData.total}
								</p>
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
										disabled={!errorReportsData.error_reports || errorReportsPage >= errorReportsData.total_pages - 1}
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
									<IconBug className="size-8 text-muted-foreground" />
								</EmptyMedia>
								<EmptyTitle>{t.admin.noErrorReports}</EmptyTitle>
								<EmptyDescription>{t.admin.noErrorReportsDescription}</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
