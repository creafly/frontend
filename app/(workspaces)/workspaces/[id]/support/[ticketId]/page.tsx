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
import { useTranslations } from "@/providers/i18n-provider";
import { useTicket, useTicketMessages, useCreateMessage } from "@/hooks/use-support";
import { useAuth } from "@/providers/auth-provider";
import { BlurFade } from "@/components/ui/blur-fade";
import Container from "@/components/container";
import { TypographyH3, TypographyP } from "@/components/typography";
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

export default function TicketDetailPage() {
	const params = useParams();
	const workspaceId = params.id as string;
	const ticketId = params.ticketId as string;
	const t = useTranslations();
	const { user } = useAuth();

	const [message, setMessage] = useState("");

	const { data: ticket, isLoading: ticketLoading, error: ticketError } = useTicket(ticketId);
	const { data: messages, isLoading: messagesLoading } = useTicketMessages(ticketId);
	const createMessage = useCreateMessage();

	const handleSendMessage = async () => {
		if (!message.trim()) return;

		try {
			await createMessage.mutateAsync({
				ticketId,
				request: { content: message.trim() },
			});
			toast.success(t.support.messageSent);
			setMessage("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	if (ticketError) {
		return (
			<Container className="py-6">
				<div className="flex items-center justify-center h-64">
					<p className="text-destructive">{ticketError.message}</p>
				</div>
			</Container>
		);
	}

	const isTicketClosed = ticket?.status === "closed" || ticket?.status === "resolved";

	return (
		<div className="min-h-screen bg-background">
			<Container className="py-6 max-w-4xl">
				<BlurFade delay={0.1}>
					<div className="mb-6">
						<Link
							href={`/workspaces/${workspaceId}/support`}
							className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
						>
							<IconArrowLeft className="size-4 mr-1" />
							{t.support.backToTickets}
						</Link>

						{ticketLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-8 w-96" />
								<Skeleton className="h-4 w-48" />
							</div>
						) : ticket ? (
							<div>
								<div className="flex items-start justify-between">
									<TypographyH3>{ticket.subject}</TypographyH3>
									<div className="flex items-center gap-2">
										<Badge className={priorityColors[ticket.priority]}>
											{t.support.priorities[ticket.priority]}
										</Badge>
										{(() => {
											const StatusIcon = statusIcons[ticket.status];
											return (
												<Badge className={`gap-1 ${statusColors[ticket.status]}`}>
													<StatusIcon className="size-3" />
													{t.support.statuses[ticket.status]}
												</Badge>
											);
										})()}
									</div>
								</div>
								<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
									<span>
										{t.support.ticketCategory}: {t.support.categories[ticket.category]}
									</span>
									<span>
										{t.templates.columns.created}: {new Date(ticket.created_at).toLocaleString()}
									</span>
								</div>
							</div>
						) : null}
					</div>
				</BlurFade>

				<BlurFade delay={0.15}>
					{ticketLoading ? (
						<Card className="mb-6">
							<CardHeader>
								<Skeleton className="h-5 w-24" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-20 w-full" />
							</CardContent>
						</Card>
					) : ticket ? (
						<Card className="mb-6">
							<CardHeader>
								<CardTitle className="text-base">{t.support.ticketDescription}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
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
										const isCurrentUser = msg.user_id === user?.id;
										const isStaff = msg.is_staff;
										
										return (
											<div
												key={msg.id}
												className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
											>
												<div
													className={`flex size-8 items-center justify-center rounded-full ${
														isStaff
															? "bg-primary text-primary-foreground"
															: "bg-muted"
													}`}
												>
													{isStaff ? (
														<IconHeadset className="size-4" />
													) : (
														<IconUser className="size-4" />
													)}
												</div>
												<div
													className={`flex-1 max-w-[80%] ${
														isCurrentUser ? "text-right" : ""
													}`}
												>
													<div
														className={`inline-flex items-center gap-2 text-sm ${
															isCurrentUser ? "flex-row-reverse" : ""
														}`}
													>
														<span className="font-medium">
															{isStaff ? t.admin.staffReply : t.admin.userReply}
														</span>
														<span className="text-xs text-muted-foreground">
															{new Date(msg.created_at).toLocaleString()}
														</span>
													</div>
													<div
														className={`mt-1 p-3 rounded-lg text-sm whitespace-pre-wrap ${
															isStaff
																? "bg-primary/10 border border-primary/20"
																: isCurrentUser
																? "bg-muted ml-auto"
																: "bg-muted"
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
								<p className="text-center text-muted-foreground py-8">
									{t.support.noTicketsDescription}
								</p>
							)}

							{!isTicketClosed && (
								<>
									<Separator />
									<div className="space-y-3">
										<Textarea
											value={message}
											onChange={(e) => setMessage(e.target.value)}
											placeholder={t.support.messagePlaceholder}
											rows={3}
										/>
										<div className="flex justify-end">
											<Button
												onClick={handleSendMessage}
												disabled={createMessage.isPending || !message.trim()}
											>
												<IconSend className="size-4 mr-2" />
												{t.support.sendMessage}
											</Button>
										</div>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</BlurFade>
			</Container>
		</div>
	);
}
