"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConversations, useDeleteConversation } from "@/hooks/use-api";
import { useTranslations } from "@/providers/i18n-provider";
import { getTenantId } from "@/lib/tenant";
import { IconPlus, IconTrash, IconMessageCircle } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Icon, TypographyMuted, TypographyLabel } from "@/components/typography";
import type { ConversationListItem } from "@/types";

interface ConversationListProps {
	selectedConversationId: string | null;
	onSelectConversation: (id: string | null) => void;
}

export function ConversationList({
	selectedConversationId,
	onSelectConversation,
}: ConversationListProps) {
	const t = useTranslations();
	const tenantId = getTenantId() || "";
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
	const [offset, setOffset] = useState(0);
	const limit = 20;

	const { data, isLoading, isFetching } = useConversations(tenantId, { offset, limit });
	const deleteConversation = useDeleteConversation();

	const conversations = data?.conversations || [];
	const total = data?.total || 0;
	const hasMore = offset + limit < total;

	const handleNewConversation = () => {
		onSelectConversation(null);
	};

	const handleDeleteClick = (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		setConversationToDelete(id);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!conversationToDelete || !tenantId) return;

		try {
			await deleteConversation.mutateAsync({
				tenantId,
				id: conversationToDelete,
			});
			toast.success(t.chat.conversationDeleted);
			if (selectedConversationId === conversationToDelete) {
				onSelectConversation(null);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete");
		} finally {
			setDeleteDialogOpen(false);
			setConversationToDelete(null);
		}
	};

	const handleLoadMore = () => {
		setOffset((prev) => prev + limit);
	};

	const formatRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "now";
		if (diffMins < 60) return `${diffMins}m`;
		if (diffHours < 24) return `${diffHours}h`;
		if (diffDays < 7) return `${diffDays}d`;
		return date.toLocaleDateString();
	};

	const getConversationTitle = (conversation: ConversationListItem) => {
		if (conversation.title) {
			return conversation.title;
		}
		if (conversation.lastMessage?.content) {
			return conversation.lastMessage.content;
		}
		return t.chat.untitledConversation;
	};

	return (
		<div className="flex flex-col h-screen border-r border-border/50 bg-muted/30">
			<div className="flex items-center justify-between p-3 border-b border-border/50">
				<span className="text-sm font-medium text-muted-foreground">{t.chat.conversations}</span>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={handleNewConversation}
					title={t.chat.newConversation}
				>
					<Icon icon={IconPlus} size="sm" />
				</Button>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{isLoading ? (
						<>
							{[...Array(5)].map((_, i) => (
								<div key={i} className="p-2 rounded-lg">
									<Skeleton className="h-4 w-3/4 mb-1" />
									<Skeleton className="h-3 w-1/2" />
								</div>
							))}
						</>
					) : conversations.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
							<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
								<Icon icon={IconMessageCircle} size="md" className="text-muted-foreground" />
							</div>
							<TypographyMuted>{t.chat.noConversations}</TypographyMuted>
						</div>
					) : (
						<>
							{conversations.map((conversation) => (
								<div
									key={conversation.id}
									role="button"
									tabIndex={0}
									onClick={() => onSelectConversation(conversation.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onSelectConversation(conversation.id);
										}
									}}
									className={cn(
										"w-full text-left p-2 rounded-lg transition-colors group cursor-pointer overflow-hidden",
										"hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										selectedConversationId === conversation.id && "bg-accent text-accent-foreground"
									)}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<TypographyLabel className="line-clamp-2 wrap-break-word">
												{getConversationTitle(conversation)}
											</TypographyLabel>
											<TypographyMuted className="text-xs">
												{formatRelativeTime(conversation.updatedAt)}
											</TypographyMuted>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className={cn(
												"h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
												"hover:bg-destructive/10 hover:text-destructive"
											)}
											onClick={(e) => handleDeleteClick(e, conversation.id)}
										>
											<Icon icon={IconTrash} size="xs" />
										</Button>
									</div>
								</div>
							))}

							{hasMore && (
								<Button
									variant="ghost"
									size="sm"
									className="w-full mt-2"
									onClick={handleLoadMore}
									disabled={isFetching}
								>
									{isFetching ? t.common.loading : t.chat.loadMore}
								</Button>
							)}
						</>
					)}
				</div>
			</ScrollArea>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.chat.deleteConversation}</AlertDialogTitle>
						<AlertDialogDescription>{t.chat.deleteConversationConfirm}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleConfirmDelete}
							disabled={deleteConversation.isPending}
						>
							{deleteConversation.isPending ? t.common.deleting : t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
