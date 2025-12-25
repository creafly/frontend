"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
	useUsers,
	useBlockUser,
	useUnblockUser,
	useRoles,
	useUserRoles,
	useAssignRoleToUser,
	useRemoveRoleFromUser,
} from "@/hooks/use-api";
import { useTranslations } from "@/providers/i18n-provider";
import { usePermissions, PERMISSIONS } from "@/providers/permissions-provider";
import {
	IconBan,
	IconShieldCheck,
	IconMail,
	IconUser,
	IconShield,
	IconLoader2,
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
import { UserAvatar } from "@/components/shared";
import type { User, Role } from "@/types";

export default function UsersPage() {
	const [blockDialogOpen, setBlockDialogOpen] = useState(false);
	const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [blockReason, setBlockReason] = useState("");
	const [userRolesDialogOpen, setUserRolesDialogOpen] = useState(false);
	const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
	const [isSaving, setIsSaving] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(10);

	const { data, isLoading, error } = useUsers(currentPage * pageSize, pageSize);
	const blockUser = useBlockUser();
	const unblockUser = useUnblockUser();
	const { data: rolesData, isLoading: rolesLoading } = useRoles();
	const { data: userRolesData, isLoading: userRolesLoading } = useUserRoles(selectedUser?.id || "");
	const assignRoleToUser = useAssignRoleToUser();
	const removeRoleFromUser = useRemoveRoleFromUser();
	const { hasPermission } = usePermissions();

	const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);

	useEffect(() => {
		if (userRolesData && selectedUser && userRolesDialogOpen) {
			setSelectedRoleIds(new Set(userRolesData.map((r) => r.id)));
		}
	}, [userRolesData, selectedUser, userRolesDialogOpen]);

	const t = useTranslations();

	const openBlockDialog = (user: User) => {
		setSelectedUser(user);
		setBlockReason("");
		setBlockDialogOpen(true);
	};

	const openUnblockDialog = (user: User) => {
		setSelectedUser(user);
		setUnblockDialogOpen(true);
	};

	const handleBlock = async () => {
		if (!selectedUser || !blockReason.trim()) return;

		try {
			await blockUser.mutateAsync({
				userId: selectedUser.id,
				reason: blockReason,
			});
			toast.success(t.admin.userBlocked);
			setBlockDialogOpen(false);
			setSelectedUser(null);
			setBlockReason("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	const handleUnblock = async () => {
		if (!selectedUser) return;

		try {
			await unblockUser.mutateAsync(selectedUser.id);
			toast.success(t.admin.userUnblocked);
			setUnblockDialogOpen(false);
			setSelectedUser(null);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	const openUserRolesDialog = (user: User) => {
		setSelectedUser(user);
		setUserRolesDialogOpen(true);
	};

	const handleRoleToggle = (roleId: string) => {
		const newSet = new Set(selectedRoleIds);
		if (newSet.has(roleId)) {
			newSet.delete(roleId);
		} else {
			newSet.add(roleId);
		}
		setSelectedRoleIds(newSet);
	};

	const handleUpdateUserRoles = async () => {
		if (!selectedUser) return;
		setIsSaving(true);

		try {
			const currentIds = new Set(userRolesData?.map((r) => r.id) || []);
			const toAssign = Array.from(selectedRoleIds).filter((id) => !currentIds.has(id));
			const toRemove = Array.from(currentIds).filter((id) => !selectedRoleIds.has(id));

			await Promise.all([
				...toAssign.map((roleId) =>
					assignRoleToUser.mutateAsync({ userId: selectedUser.id, roleId })
				),
				...toRemove.map((roleId) =>
					removeRoleFromUser.mutateAsync({ userId: selectedUser.id, roleId })
				),
			]);

			toast.success(t.admin.roleUpdated);
			setUserRolesDialogOpen(false);
			setSelectedUser(null);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.updateFailed);
		} finally {
			setIsSaving(false);
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
					<div>
						<TypographyH3>{t.admin.users}</TypographyH3>
						<TypographyP className="mt-1 text-muted-foreground">
							{t.admin.usersDescription}
						</TypographyP>
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
										<TableHead>{t.admin.name}</TableHead>
										<TableHead>{t.auth.email}</TableHead>
										<TableHead>{t.common.status}</TableHead>
										<TableHead className="w-25">{t.common.actions}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{[...Array(5)].map((_, i) => (
										<TableRow key={i}>
											<TableCell>
												<div className="flex items-center gap-3">
													<Skeleton className="size-8 rounded-full" />
													<div className="space-y-2">
														<Skeleton className="h-4 w-24" />
														<Skeleton className="h-3 w-16" />
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-32" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-16" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-8 w-8" />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : data?.users && data.users.length > 0 ? (
						<div className="space-y-4">
							<div className="border rounded-md">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t.admin.name}</TableHead>
											<TableHead>{t.auth.email}</TableHead>
											<TableHead>{t.common.status}</TableHead>
											<TableHead className="w-25">{t.common.actions}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{data.users.map((user) => (
											<TableRow key={user.id}>
												<TableCell>
													<div className="flex items-center gap-3">
														<UserAvatar user={user} size="sm" />
														<div>
															<div className="font-medium">
																{user.firstName} {user.lastName}
															</div>
															<div className="text-sm text-muted-foreground">{user.username}</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Icon icon={IconMail} size="sm" className="text-muted-foreground" />
														{user.email}
													</div>
												</TableCell>
												<TableCell>
													{user.isBlocked ? (
														<Badge variant="destructive" className="gap-1">
															<Icon icon={IconBan} size="xs" />
															{t.admin.blocked}
														</Badge>
													) : (
														<Badge variant="outline" className="gap-1">
															<Icon icon={IconUser} size="xs" />
															{t.common.active}
														</Badge>
													)}
													{user.isBlocked && user.blockedAt && (
														<div className="text-xs text-muted-foreground mt-1">
															{t.admin.blockedAt}: {new Date(user.blockedAt).toLocaleDateString()}
														</div>
													)}
													{user.isBlocked && user.blockReason && (
														<div className="text-xs text-muted-foreground">{user.blockReason}</div>
													)}
												</TableCell>
												<TableCell>
													{canManage && (
														<div className="flex items-center gap-2">
															<Button
																variant="ghost"
																size="icon-sm"
																onClick={() => openUserRolesDialog(user)}
																title={t.admin.assignRole}
															>
																<Icon icon={IconShield} size="sm" />
															</Button>
															{user.isBlocked ? (
																<Button
																	variant="ghost"
																	size="icon-sm"
																	className="text-success hover:text-success/80"
																	onClick={() => openUnblockDialog(user)}
																	title={t.admin.unblockUser}
																>
																	<Icon icon={IconShieldCheck} size="sm" />
																</Button>
															) : (
																<Button
																	variant="ghost"
																	size="icon-sm"
																	className="text-destructive hover:text-destructive"
																	onClick={() => openBlockDialog(user)}
																	title={t.admin.blockUser}
																>
																	<Icon icon={IconBan} size="sm" />
																</Button>
															)}
														</div>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							<div className="flex flex-wrap items-center justify-between gap-2">
								<TypographyMuted>
									{t.common.showing} {data.offset + 1}-{data.offset + (data.users?.length || 0)} of
									page {currentPage + 1}
								</TypographyMuted>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
										disabled={currentPage === 0}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(currentPage + 1)}
										disabled={!data.users || data.users.length < pageSize}
									>
										Next
									</Button>
								</div>
							</div>
						</div>
					) : (
						<BlurFade delay={0.2}>
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Icon icon={IconUser} size="xl" className="text-muted-foreground" />
									</EmptyMedia>
									<EmptyTitle>{t.admin.noUsers}</EmptyTitle>
								</EmptyHeader>
							</Empty>
						</BlurFade>
					)}
				</BlurFade>
			</Container>

			<Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.admin.blockUser}</DialogTitle>
						<DialogDescription>
							{selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email})
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>{t.admin.blockReason}</Label>
							<textarea
								value={blockReason}
								onChange={(e) => setBlockReason(e.target.value)}
								placeholder={t.admin.blockReasonPlaceholder}
								className="w-full px-3 py-2 border rounded-md text-sm"
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button
							variant="destructive"
							onClick={handleBlock}
							disabled={blockUser.isPending || !blockReason.trim()}
						>
							{blockUser.isPending ? t.common.deleting : t.admin.blockUser}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={unblockDialogOpen} onOpenChange={setUnblockDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.admin.unblockUser}</AlertDialogTitle>
						<AlertDialogDescription>{t.admin.confirmUnblock}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction onClick={handleUnblock} disabled={unblockUser.isPending}>
							{unblockUser.isPending ? t.common.deleting : t.admin.unblockUser}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog
				open={userRolesDialogOpen}
				onOpenChange={(open) => {
					setUserRolesDialogOpen(open);
					if (!open) setSelectedUser(null);
				}}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{t.admin.assignRole}</DialogTitle>
						<DialogDescription>
							{selectedUser && (
								<>
									{t.admin.assignRole} {selectedUser.firstName} {selectedUser.lastName}
								</>
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						{userRolesLoading ? (
							<div className="flex items-center justify-center py-8">
								<Icon icon={IconLoader2} size="md" className="animate-spin text-muted-foreground" />
								<span className="ml-2 text-sm text-muted-foreground">Loading roles...</span>
							</div>
						) : rolesLoading ? (
							<div className="flex items-center justify-center py-8">
								<Icon icon={IconLoader2} size="md" className="animate-spin text-muted-foreground" />
								<span className="ml-2 text-sm text-muted-foreground">Loading roles...</span>
							</div>
						) : rolesData && rolesData.roles && rolesData.roles.length > 0 ? (
							<ScrollArea className="h-62.5 border rounded-md p-4">
								<div className="space-y-3">
									{rolesData.roles.map((role: Role) => {
										const isAssigned = selectedRoleIds.has(role.id);
										return (
											<div key={role.id} className="flex items-center space-x-3">
												<input
													type="checkbox"
													id={`user-role-${role.id}`}
													checked={isAssigned}
													disabled={isSaving}
													onChange={() => handleRoleToggle(role.id)}
												/>
												<label
													htmlFor={`user-role-${role.id}`}
													className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
												>
													<div className="flex items-center gap-2">
														<Icon icon={IconShield} size="xs" className="text-primary" />
														<span>{role.name}</span>
													</div>
													{role.description && (
														<TypographyMuted className="text-xs mt-1">
															{role.description}
														</TypographyMuted>
													)}
												</label>
											</div>
										);
									})}
								</div>
							</ScrollArea>
						) : (
							<div className="text-center py-8 text-sm text-muted-foreground border rounded-md">
								{t.admin.noRoles}
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setUserRolesDialogOpen(false)}
							disabled={isSaving}
						>
							{t.common.cancel}
						</Button>
						<Button onClick={handleUpdateUserRoles} disabled={isSaving}>
							{isSaving ? t.common.saving : t.common.save}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
