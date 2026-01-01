"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/providers/i18n-provider";
import { useMyTickets, useCreateTicket } from "@/hooks/use-support";
import { BlurFade } from "@/components/ui/blur-fade";
import Container from "@/components/container";
import { TypographyH3, TypographyP } from "@/components/typography";
import {
	IconTicket,
	IconPlus,
	IconClock,
	IconAlertCircle,
	IconCircleCheck,
	IconCircleX,
} from "@tabler/icons-react";
import { toast } from "sonner";
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

export default function SupportPage() {
	const params = useParams();
	const workspaceId = params.id as string;
	const t = useTranslations();
	
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [subject, setSubject] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState<TicketCategory>("general");
	const [priority, setPriority] = useState<TicketPriority>("medium");
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(10);

	const { data, isLoading, error } = useMyTickets({
		page: currentPage,
		pageSize,
	});

	const createTicket = useCreateTicket();

	const handleCreateTicket = async () => {
		if (!subject.trim() || !description.trim()) return;

		try {
			await createTicket.mutateAsync({
				subject: subject.trim(),
				description: description.trim(),
				category,
				priority,
			});
			toast.success(t.support.ticketCreated);
			setCreateDialogOpen(false);
			setSubject("");
			setDescription("");
			setCategory("general");
			setPriority("medium");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	const categories: TicketCategory[] = ["general", "bug", "feature", "billing", "account", "technical"];
	const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

	if (error) {
		return (
			<Container className="py-6">
				<div className="flex items-center justify-center h-64">
					<p className="text-destructive">{error.message}</p>
				</div>
			</Container>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Container className="py-6 max-w-6xl">
				<BlurFade delay={0.1}>
					<div className="flex items-center justify-between mb-6">
						<div>
							<TypographyH3>{t.support.title}</TypographyH3>
							<TypographyP className="mt-1 text-muted-foreground">
								{t.support.subtitle}
							</TypographyP>
						</div>
						<Button onClick={() => setCreateDialogOpen(true)}>
							<IconPlus className="size-4 mr-2" />
							{t.support.createTicket}
						</Button>
					</div>
				</BlurFade>

				<BlurFade delay={0.15}>
					{isLoading ? (
						<div className="border rounded-md">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t.support.ticketSubject}</TableHead>
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
															href={`/workspaces/${workspaceId}/support/${ticket.id}`}
															className="font-medium hover:underline"
														>
															{ticket.subject}
														</Link>
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
								<EmptyTitle>{t.support.noTickets}</EmptyTitle>
								<EmptyDescription>{t.support.noTicketsDescription}</EmptyDescription>
							</EmptyHeader>
							<Button onClick={() => setCreateDialogOpen(true)}>
								<IconPlus className="size-4 mr-2" />
								{t.support.createTicket}
							</Button>
						</Empty>
					)}
				</BlurFade>

				<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>{t.support.createTicket}</DialogTitle>
							<DialogDescription>
								{t.support.subtitle}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>{t.support.ticketSubject}</Label>
								<Input
									value={subject}
									onChange={(e) => setSubject(e.target.value)}
									placeholder={t.support.ticketSubjectPlaceholder}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t.support.ticketDescription}</Label>
								<Textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder={t.support.ticketDescriptionPlaceholder}
									rows={4}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>{t.support.ticketCategory}</Label>
									<Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{categories.map((cat) => (
												<SelectItem key={cat} value={cat}>
													{t.support.categories[cat]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>{t.support.ticketPriority}</Label>
									<Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{priorities.map((p) => (
												<SelectItem key={p} value={p}>
													{t.support.priorities[p]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
								{t.common.cancel}
							</Button>
							<Button
								onClick={handleCreateTicket}
								disabled={createTicket.isPending || !subject.trim() || !description.trim()}
							>
								{createTicket.isPending ? t.common.creating : t.common.create}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</Container>
		</div>
	);
}
