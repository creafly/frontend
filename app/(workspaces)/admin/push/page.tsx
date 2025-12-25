"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "@/providers/i18n-provider";
import { usePermissions, PERMISSIONS } from "@/providers/permissions-provider";
import { useAuth } from "@/providers/auth-provider";
import { useUsers, useAllTenants } from "@/hooks/use-api";
import {
	IconBell,
	IconPlus,
	IconTrash,
	IconSend,
	IconX,
	IconChevronLeft,
	IconChevronRight,
	IconSearch,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { BlurFade } from "@/components/ui/blur-fade";
import Container from "@/components/container";
import {
	TypographyH3,
	TypographyP,
	TypographyError,
	TypographyMuted,
	Icon,
} from "@/components/typography";
import {
	notificationsApi,
	type PushNotification,
	type PushTargetType,
	type PushButton,
	type CreatePushNotificationRequest,
} from "@/lib/api/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function PushNotificationsPage() {
	const t = useTranslations();
	const { tokens } = useAuth();
	const { hasAnyPermission } = usePermissions();
	const queryClient = useQueryClient();

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [sendDialogOpen, setSendDialogOpen] = useState(false);
	const [selectedPush, setSelectedPush] = useState<PushNotification | null>(null);

	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [targetType, setTargetType] = useState<PushTargetType>("all");
	const [buttons, setButtons] = useState<PushButton[]>([]);
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	const [selectedTenantId, setSelectedTenantId] = useState<string>("");
	const [usersPage, setUsersPage] = useState(0);
	const [usersSearch, setUsersSearch] = useState("");
	const usersPerPage = 20;

	const { data: usersData, isLoading: usersLoading } = useUsers(
		usersPage * usersPerPage,
		usersPerPage
	);
	const { data: tenantsData } = useAllTenants();

	const canView = hasAnyPermission(PERMISSIONS.PUSH_VIEW, PERMISSIONS.PUSH_MANAGE);
	const canCreate = hasAnyPermission(PERMISSIONS.PUSH_CREATE, PERMISSIONS.PUSH_MANAGE);
	const canUpdate = hasAnyPermission(PERMISSIONS.PUSH_UPDATE, PERMISSIONS.PUSH_MANAGE);
	const canDelete = hasAnyPermission(PERMISSIONS.PUSH_DELETE, PERMISSIONS.PUSH_MANAGE);

	const { data, isLoading, error } = useQuery({
		queryKey: ["push-notifications"],
		queryFn: () => notificationsApi.getPushNotifications(tokens?.accessToken || ""),
		enabled: !!tokens?.accessToken && canView,
	});

	const createMutation = useMutation({
		mutationFn: (data: CreatePushNotificationRequest) =>
			notificationsApi.createPushNotification(tokens?.accessToken || "", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["push-notifications"] });
			toast.success(t.admin.push.created);
			resetForm();
			setCreateDialogOpen(false);
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : t.errors.createFailed),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) =>
			notificationsApi.deletePushNotification(tokens?.accessToken || "", id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["push-notifications"] });
			toast.success(t.admin.push.deleted);
			setDeleteDialogOpen(false);
			setSelectedPush(null);
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : t.errors.deleteFailed),
	});

	const sendMutation = useMutation({
		mutationFn: (id: string) =>
			notificationsApi.sendPushNotification(tokens?.accessToken || "", id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["push-notifications"] });
			toast.success(t.admin.push.sent);
			setSendDialogOpen(false);
			setSelectedPush(null);
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : t.errors.updateFailed),
	});

	const resetForm = () => {
		setTitle("");
		setMessage("");
		setTargetType("all");
		setButtons([]);
		setSelectedUserIds([]);
		setSelectedTenantId("");
		setUsersPage(0);
		setUsersSearch("");
	};

	const handleCreate = () => {
		createMutation.mutate({
			title,
			message,
			targetType,
			buttons: buttons.length > 0 ? buttons : undefined,
			targetUserIds: targetType === "users" ? selectedUserIds : undefined,
			targetTenantId: targetType === "tenant" ? selectedTenantId : undefined,
		});
	};

	const addButton = () => {
		setButtons([...buttons, { label: "", url: "" }]);
	};

	const updateButton = (index: number, field: "label" | "url", value: string) => {
		const newButtons = [...buttons];
		newButtons[index][field] = value;
		setButtons(newButtons);
	};

	const removeButton = (index: number) => {
		setButtons(buttons.filter((_, i) => i !== index));
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "draft":
				return <Badge variant="secondary">{t.admin.push.statuses.draft}</Badge>;
			case "scheduled":
				return <Badge variant="outline">{t.admin.push.statuses.scheduled}</Badge>;
			case "sent":
				return <Badge variant="default">{t.admin.push.statuses.sent}</Badge>;
			case "cancelled":
				return <Badge variant="destructive">{t.admin.push.statuses.cancelled}</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getTargetLabel = (type: PushTargetType) => {
		switch (type) {
			case "all":
				return t.admin.push.targetTypeAll;
			case "tenant":
				return t.admin.push.targetTypeTenant;
			case "users":
				return t.admin.push.targetTypeUsers;
			default:
				return type;
		}
	};

	if (error) {
		return (
			<Container>
				<div className="flex items-center justify-center h-64">
					<TypographyError>{error.message}</TypographyError>
				</div>
			</Container>
		);
	}

	return (
		<div className="space-y-6">
			<Container className="p-0 max-w-full">
				<BlurFade delay={0.1}>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<TypographyH3>{t.admin.push.title}</TypographyH3>
							<TypographyP className="mt-1 text-muted-foreground">
								{t.admin.push.description}
							</TypographyP>
						</div>
						{canCreate && (
							<Button onClick={() => setCreateDialogOpen(true)}>
								<Icon icon={IconPlus} size="sm" className="mr-2" />
								{t.admin.push.create}
							</Button>
						)}
					</div>
				</BlurFade>
			</Container>

			<Container className="p-0 max-w-full">
				<BlurFade delay={0.15}>
					{isLoading ? (
						<div className="border rounded-md">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t.admin.push.columns.title}</TableHead>
										<TableHead>{t.admin.push.columns.targetType}</TableHead>
										<TableHead>{t.admin.push.columns.status}</TableHead>
										<TableHead>{t.admin.push.columns.createdAt}</TableHead>
										<TableHead className="w-25">{t.common.actions}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{[...Array(3)].map((_, i) => (
										<TableRow key={i}>
											<TableCell>
												<Skeleton className="h-5 w-40" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-20" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-28" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-8 w-20" />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : data?.data && data.data.length > 0 ? (
						<div className="border rounded-md">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t.admin.push.columns.title}</TableHead>
										<TableHead>{t.admin.push.columns.targetType}</TableHead>
										<TableHead>{t.admin.push.columns.status}</TableHead>
										<TableHead>{t.admin.push.columns.createdAt}</TableHead>
										<TableHead className="w-25">{t.common.actions}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.data.map((push) => (
										<TableRow key={push.id}>
											<TableCell>
												<div>
													<div className="font-medium">{push.title}</div>
													<div className="text-sm text-muted-foreground truncate max-w-xs">
														{push.message}
													</div>
												</div>
											</TableCell>
											<TableCell>{getTargetLabel(push.targetType)}</TableCell>
											<TableCell>{getStatusBadge(push.status)}</TableCell>
											<TableCell>{new Date(push.createdAt).toLocaleDateString()}</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													{push.status === "draft" && canUpdate && (
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => {
																setSelectedPush(push);
																setSendDialogOpen(true);
															}}
															title={t.admin.push.sendNow}
														>
															<Icon icon={IconSend} size="sm" />
														</Button>
													)}
													{canDelete && push.status === "draft" && (
														<Button
															variant="ghost"
															size="icon-sm"
															className="text-destructive hover:text-destructive"
															onClick={() => {
																setSelectedPush(push);
																setDeleteDialogOpen(true);
															}}
															title={t.common.delete}
														>
															<Icon icon={IconTrash} size="sm" />
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Icon icon={IconBell} size="xl" className="text-muted-foreground" />
								</EmptyMedia>
								<EmptyTitle>{t.admin.push.noPushNotifications}</EmptyTitle>
							</EmptyHeader>
						</Empty>
					)}
				</BlurFade>
			</Container>

			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>{t.admin.push.create}</DialogTitle>
						<DialogDescription>{t.admin.push.createDescription}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>{t.admin.push.titleLabel}</Label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder={t.admin.push.titlePlaceholder}
							/>
						</div>
						<div className="space-y-2">
							<Label>{t.admin.push.messageLabel}</Label>
							<Textarea
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder={t.admin.push.messagePlaceholder}
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label>{t.admin.push.targetType}</Label>
							<Select value={targetType} onValueChange={(v) => setTargetType(v as PushTargetType)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t.admin.push.targetTypeAll}</SelectItem>
									<SelectItem value="tenant">{t.admin.push.targetTypeTenant}</SelectItem>
									<SelectItem value="users">{t.admin.push.targetTypeUsers}</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{targetType === "tenant" && (
							<div className="space-y-2">
								<Label>{t.admin.push.selectTenant}</Label>
								<Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
									<SelectTrigger>
										<SelectValue placeholder={t.admin.push.selectTenantPlaceholder} />
									</SelectTrigger>
									<SelectContent>
										{tenantsData?.map((tenant) => (
											<SelectItem key={tenant.id} value={tenant.id}>
												{tenant.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
						{targetType === "users" && (
							<div className="space-y-2">
								<Label>{t.admin.push.selectUsers}</Label>
								<div className="relative">
									<Icon
										icon={IconSearch}
										size="sm"
										className="absolute left-2.5 top-2.5 text-muted-foreground"
									/>
									<Input
										value={usersSearch}
										onChange={(e) => setUsersSearch(e.target.value)}
										placeholder={t.admin.search}
										className="pl-8"
									/>
								</div>
								<ScrollArea className="h-48 border rounded-md p-2">
									{usersLoading ? (
										<div className="space-y-2">
											{[...Array(5)].map((_, i) => (
												<Skeleton key={i} className="h-6 w-full" />
											))}
										</div>
									) : (
										usersData?.users
											?.filter((user) =>
												usersSearch
													? user.email.toLowerCase().includes(usersSearch.toLowerCase()) ||
													  (user.firstName?.toLowerCase() || "").includes(
															usersSearch.toLowerCase()
													  ) ||
													  (user.lastName?.toLowerCase() || "").includes(usersSearch.toLowerCase())
													: true
											)
											.map((user) => (
												<div key={user.id} className="flex items-center space-x-2 py-1">
													<Checkbox
														id={user.id}
														checked={selectedUserIds.includes(user.id)}
														onCheckedChange={(checked) => {
															if (checked) {
																setSelectedUserIds([...selectedUserIds, user.id]);
															} else {
																setSelectedUserIds(selectedUserIds.filter((id) => id !== user.id));
															}
														}}
													/>
													<label htmlFor={user.id} className="text-sm cursor-pointer">
														{user.email}
														{user.firstName && ` (${user.firstName} ${user.lastName || ""})`}
													</label>
												</div>
											))
									)}
								</ScrollArea>
								<div className="flex items-center justify-between">
									{selectedUserIds.length > 0 && (
										<TypographyMuted>
											{t.admin.push.selectedCount}: {selectedUserIds.length}
										</TypographyMuted>
									)}
									<div className="flex items-center gap-2 ml-auto">
										<Button
											variant="outline"
											size="icon-sm"
											onClick={() => setUsersPage((p) => Math.max(0, p - 1))}
											disabled={usersPage === 0}
										>
											<Icon icon={IconChevronLeft} size="sm" />
										</Button>
										<span className="text-sm text-muted-foreground">{usersPage + 1}</span>
										<Button
											variant="outline"
											size="icon-sm"
											onClick={() => setUsersPage((p) => p + 1)}
											disabled={!usersData?.users || usersData.users.length < usersPerPage}
										>
											<Icon icon={IconChevronRight} size="sm" />
										</Button>
									</div>
								</div>
							</div>
						)}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>{t.admin.push.buttons}</Label>
								<Button variant="ghost" size="sm" onClick={addButton}>
									<Icon icon={IconPlus} size="sm" className="mr-1" />
									{t.admin.push.addButton}
								</Button>
							</div>
							{buttons.map((btn, i) => (
								<div key={i} className="flex gap-2 items-start">
									<Input
										value={btn.label}
										onChange={(e) => updateButton(i, "label", e.target.value)}
										placeholder={t.admin.push.buttonLabelPlaceholder}
										className="flex-1"
									/>
									<Input
										value={btn.url}
										onChange={(e) => updateButton(i, "url", e.target.value)}
										placeholder={t.admin.push.buttonUrlPlaceholder}
										className="flex-1"
									/>
									<Button variant="ghost" size="icon-sm" onClick={() => removeButton(i)}>
										<Icon icon={IconX} size="sm" />
									</Button>
								</div>
							))}
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button
							onClick={handleCreate}
							disabled={createMutation.isPending || !title.trim() || !message.trim()}
						>
							{createMutation.isPending ? t.common.creating : t.common.create}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.common.delete}</AlertDialogTitle>
						<AlertDialogDescription>{t.admin.push.confirmDelete}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => selectedPush && deleteMutation.mutate(selectedPush.id)}
							disabled={deleteMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMutation.isPending ? t.common.deleting : t.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.admin.push.sendNow}</AlertDialogTitle>
						<AlertDialogDescription>{t.admin.push.confirmSend}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => selectedPush && sendMutation.mutate(selectedPush.id)}
							disabled={sendMutation.isPending}
						>
							{sendMutation.isPending ? t.common.sending : t.admin.push.sendNow}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
