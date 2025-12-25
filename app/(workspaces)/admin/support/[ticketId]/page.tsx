"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/providers/i18n-provider";
import {
	useAdminTicket,
	useAdminTicketMessages,
	useAdminCreateMessage,
	useAdminUpdateTicket,
} from "@/hooks/use-support";
import { BlurFade } from "@/components/ui/blur-fade";
import {
	TypographyH3,
	TypographyError,
	Icon,
	TypographyP,
	TypographyMuted,
} from "@/components/typography";
import {
	IconArrowLeft,
	IconClock,
	IconAlertCircle,
	IconCircleCheck,
	IconCircleX,
	IconSend,
	IconUser,
	IconHeadset,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type { TicketStatus, TicketPriority } from "@/types/support";

const statusIcons: Record<TicketStatus, React.ComponentType<{ className?: string }>> = {
	open: IconAlertCircle,
	in_progress: IconClock,
	resolved: IconCircleCheck,
	closed: IconCircleX,
};

const statusColors: Record<TicketStatus, string> = {
	open: "bg-info/10 text-info",
	in_progress: "bg-warning/10 text-warning",
	resolved: "bg-success/10 text-success",
	closed: "bg-muted text-muted-foreground",
};

const priorityColors: Record<TicketPriority, string> = {
	low: "bg-muted text-muted-foreground",
	medium: "bg-info/10 text-info",
	high: "bg-warning/10 text-warning-foreground",
	urgent: "bg-destructive/10 text-destructive",
};

export default function AdminTicketDetailPage() {
	const params = useParams();
	const ticketId = params.ticketId as string;
	const t = useTranslations();

	const [message, setMessage] = useState("");

	const { data: ticket, isLoading: ticketLoading, error: ticketError } = useAdminTicket(ticketId);
	const { data: messages, isLoading: messagesLoading } = useAdminTicketMessages(ticketId);
	const createMessage = useAdminCreateMessage();
	const updateTicket = useAdminUpdateTicket();

	const statuses: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
	const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

	const handleSendMessage = async () => {
		if (!message.trim()) return;

		try {
			await createMessage.mutateAsync({
				ticketId,
				request: { content: message.trim() },
			});
			toast.success(t.admin.replyAdded);
			setMessage("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	const handleStatusChange = async (status: TicketStatus) => {
		try {
			await updateTicket.mutateAsync({
				id: ticketId,
				request: { status },
			});
			toast.success(t.admin.ticketUpdated);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.updateFailed);
		}
	};

	const handlePriorityChange = async (priority: TicketPriority) => {
		try {
			await updateTicket.mutateAsync({
				id: ticketId,
				request: { priority },
			});
			toast.success(t.admin.ticketUpdated);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.updateFailed);
		}
	};

	if (ticketError) {
		return (
			<div className="flex items-center justify-center h-64">
				<TypographyError>{ticketError.message}</TypographyError>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<BlurFade delay={0.1}>
				<div>
					<Link
						href="/admin/support"
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
					>
						<Icon icon={IconArrowLeft} size="sm" className="mr-1" />
						{t.support.backToTickets}
					</Link>

					{ticketLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-8 w-96" />
							<Skeleton className="h-4 w-48" />
						</div>
					) : ticket ? (
						<div className="flex items-start justify-between">
							<div>
								<TypographyH3>{ticket.subject}</TypographyH3>
								<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
									<span>ID: {ticket.id}</span>
									<span>User: {ticket.user_id}</span>
									<span>
										{t.templates.columns.created}: {new Date(ticket.created_at).toLocaleString()}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Badge className={priorityColors[ticket.priority]}>
									{t.support.priorities[ticket.priority]}
								</Badge>
								{(() => {
									const StatusIcon = statusIcons[ticket.status];
									return (
										<Badge className={`gap-1 ${statusColors[ticket.status]}`}>
											<Icon icon={StatusIcon} size="xs" />
											{t.support.statuses[ticket.status]}
										</Badge>
									);
								})()}
							</div>
						</div>
					) : null}
				</div>
			</BlurFade>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<BlurFade delay={0.15}>
						{ticketLoading ? (
							<Card>
								<CardHeader>
									<Skeleton className="h-5 w-24" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-20 w-full" />
								</CardContent>
							</Card>
						) : ticket ? (
							<Card>
								<CardHeader>
									<CardTitle className="text-base">{t.support.ticketDescription}</CardTitle>
								</CardHeader>
								<CardContent>
									<TypographyP className="text-sm whitespace-pre-wrap mt-0">
										{ticket.description}
									</TypographyP>
								</CardContent>
							</Card>
						) : null}
					</BlurFade>

					<BlurFade delay={0.2}>
						<Card>
							<CardHeader>
								<CardTitle className="text-base">{t.admin.ticketDetails}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{messagesLoading ? (
									<div className="space-y-4">
										{[...Array(3)].map((_, i) => (
											<div key={i} className="flex gap-3">
												<Skeleton className="size-8 rounded-full" />
												<div className="flex-1 space-y-2">
													<Skeleton className="h-4 w-32" />
													<Skeleton className="h-16 w-full" />
												</div>
											</div>
										))}
									</div>
								) : messages && messages.length > 0 ? (
									<div className="space-y-4">
										{messages.map((msg) => {
											const isStaff = msg.is_staff;

											return (
												<div key={msg.id} className="flex gap-3">
													<div
														className={`flex size-8 items-center justify-center rounded-full ${
															isStaff ? "bg-primary text-primary-foreground" : "bg-muted"
														}`}
													>
														{isStaff ? (
															<Icon icon={IconHeadset} size="sm" />
														) : (
															<Icon icon={IconUser} size="sm" />
														)}
													</div>
													<div className="flex-1">
														<div className="inline-flex items-center gap-2 text-sm">
															<span className="font-medium">
																{isStaff ? t.admin.staffReply : t.admin.userReply}
															</span>
															<span className="text-xs text-muted-foreground">
																{new Date(msg.created_at).toLocaleString()}
															</span>
														</div>
														<div
															className={`mt-1 p-3 rounded-lg text-sm whitespace-pre-wrap ${
																isStaff ? "bg-primary/10 border border-primary/20" : "bg-muted"
															}`}
														>
															{msg.content}
														</div>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<TypographyMuted className="text-center py-8">
										{t.support.noTicketsDescription}
									</TypographyMuted>
								)}

								<Separator />
								<div className="space-y-3">
									<Label>{t.admin.addReply}</Label>
									<Textarea
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder={t.admin.replyPlaceholder}
										rows={3}
									/>
									<div className="flex justify-end">
										<Button
											onClick={handleSendMessage}
											disabled={createMessage.isPending || !message.trim()}
										>
											<Icon icon={IconSend} size="sm" className="mr-2" />
											{t.admin.sendReply}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</BlurFade>
				</div>

				<div className="space-y-6">
					<BlurFade delay={0.25}>
						<Card>
							<CardHeader>
								<CardTitle className="text-base">{t.admin.ticketDetails}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{ticketLoading ? (
									<>
										<Skeleton className="h-10 w-full" />
										<Skeleton className="h-10 w-full" />
									</>
								) : ticket ? (
									<>
										<div className="space-y-2">
											<Label>{t.admin.changeStatus}</Label>
											<Select
												value={ticket.status}
												onValueChange={(v) => handleStatusChange(v as TicketStatus)}
												disabled={updateTicket.isPending}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{statuses.map((status) => (
														<SelectItem key={status} value={status}>
															{t.support.statuses[status]}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>{t.admin.changePriority}</Label>
											<Select
												value={ticket.priority}
												onValueChange={(v) => handlePriorityChange(v as TicketPriority)}
												disabled={updateTicket.isPending}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{priorities.map((priority) => (
														<SelectItem key={priority} value={priority}>
															{t.support.priorities[priority]}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<Separator />

										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t.support.ticketCategory}:</span>
												<span>{t.support.categories[ticket.category]}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													{t.templates.columns.created}:
												</span>
												<span>{new Date(ticket.created_at).toLocaleDateString()}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													{t.templates.columns.updated}:
												</span>
												<span>{new Date(ticket.updated_at).toLocaleDateString()}</span>
											</div>
										</div>
									</>
								) : null}
							</CardContent>
						</Card>
					</BlurFade>
				</div>
			</div>
		</div>
	);
}
