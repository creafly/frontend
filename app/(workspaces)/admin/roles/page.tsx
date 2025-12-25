"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyContent } from "@/components/ui/empty";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	useRoles,
	useCreateRole,
	useUpdateRole,
	useDeleteRole,
	useClaims,
	useRoleClaims,
	useAssignClaimToRole,
	useRemoveClaimFromRole,
} from "@/hooks/use-api";
import { useTranslations } from "@/providers/i18n-provider";
import { usePermissions, PERMISSIONS } from "@/providers/permissions-provider";
import {
	IconPlus,
	IconDotsVertical,
	IconEdit,
	IconTrash,
	IconShield,
	IconSearch,
	IconKey,
	IconLoader,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { BlurFade } from "@/components/ui/blur-fade";
import Container from "@/components/container";
import {
	TypographyH3,
	TypographyH4,
	TypographyP,
	TypographyError,
	TypographyMuted,
	Icon,
} from "@/components/typography";
import type { Role, Claim } from "@/types";

export default function RolesPage() {
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(10);

	const { data, isLoading, error } = useRoles(currentPage * pageSize, pageSize);
	const { data: allClaims, isLoading: claimsLoading } = useClaims();
	const createRole = useCreateRole();
	const updateRole = useUpdateRole();
	const deleteRole = useDeleteRole();
	const assignClaimToRole = useAssignClaimToRole();
	const removeClaimFromRole = useRemoveClaimFromRole();
	const { hasPermission } = usePermissions();

	const canCreate = hasPermission(PERMISSIONS.ROLES_MANAGE);
	const canEdit = hasPermission(PERMISSIONS.ROLES_MANAGE);
	const canDelete = hasPermission(PERMISSIONS.ROLES_MANAGE);

	const [searchQuery, setSearchQuery] = useState("");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [formData, setFormData] = useState({ name: "", description: "" });
	const [selectedClaimIds, setSelectedClaimIds] = useState<Set<string>>(new Set());
	const [isSaving, setIsSaving] = useState(false);

	const { data: roleClaims, isLoading: roleClaimsLoading } = useRoleClaims(selectedRole?.id || "");

	const t = useTranslations();

	useEffect(() => {
		if (roleClaims) {
			setSelectedClaimIds(new Set(roleClaims.map((c) => c.id)));
		}
	}, [roleClaims]);

	const filteredRoles = useMemo(() => {
		return (
			data?.roles?.filter(
				(role: Role) =>
					role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					role.description?.toLowerCase().includes(searchQuery.toLowerCase())
			) || []
		);
	}, [data?.roles, searchQuery]);

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(0);
	};

	const handleCreate = async () => {
		if (!formData.name.trim()) return;

		try {
			await createRole.mutateAsync({
				name: formData.name,
				description: formData.description || undefined,
			});
			toast.success(t.admin.roleCreated);
			setCreateDialogOpen(false);
			setFormData({ name: "", description: "" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	const handleUpdate = async () => {
		if (!selectedRole || !formData.name.trim()) return;

		setIsSaving(true);
		try {
			await updateRole.mutateAsync({
				id: selectedRole.id,
				request: {
					name: formData.name,
					description: formData.description || undefined,
				},
			});

			const currentClaimIds = new Set(roleClaims?.map((c) => c.id) || []);

			const claimsToAdd = [...selectedClaimIds].filter((id) => !currentClaimIds.has(id));
			const claimsToRemove = [...currentClaimIds].filter((id) => !selectedClaimIds.has(id));

			await Promise.all([
				...claimsToAdd.map((claimId) =>
					assignClaimToRole.mutateAsync({ roleId: selectedRole.id, claimId })
				),
				...claimsToRemove.map((claimId) =>
					removeClaimFromRole.mutateAsync({ roleId: selectedRole.id, claimId })
				),
			]);

			toast.success(t.admin.roleUpdated);
			setEditDialogOpen(false);
			setSelectedRole(null);
			setFormData({ name: "", description: "" });
			setSelectedClaimIds(new Set());
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.updateFailed);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!selectedRole) return;

		try {
			await deleteRole.mutateAsync(selectedRole.id);
			toast.success(t.admin.roleDeleted);
			setDeleteDialogOpen(false);
			setSelectedRole(null);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.deleteFailed);
		}
	};

	const openEditDialog = (role: Role) => {
		setSelectedRole(role);
		setFormData({ name: role.name, description: role.description || "" });
		setSelectedClaimIds(new Set());
		setEditDialogOpen(true);
	};

	const openDeleteDialog = (role: Role) => {
		setSelectedRole(role);
		setDeleteDialogOpen(true);
	};

	const isClaimSelected = (claimId: string): boolean => {
		return selectedClaimIds.has(claimId);
	};

	const handleClaimToggle = (claimId: string) => {
		setSelectedClaimIds((prev) => {
			const next = new Set(prev);
			if (next.has(claimId)) {
				next.delete(claimId);
			} else {
				next.add(claimId);
			}
			return next;
		});
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
							<TypographyH3>{t.admin.roles}</TypographyH3>
							<TypographyP className="mt-1 text-muted-foreground">
								{t.admin.rolesDescription}
							</TypographyP>
						</div>
						{canCreate && (
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<Button
									onClick={() => setCreateDialogOpen(true)}
									className="shadow-lg shadow-primary/20"
								>
									<Icon icon={IconPlus} size="sm" className="mr-2" />
									{t.admin.createRole}
								</Button>
							</motion.div>
						)}
					</div>
				</BlurFade>
			</Container>

			<Container className="p-0 max-w-full">
				<BlurFade delay={0.15}>
					<div className="relative mb-4">
						<Icon
							icon={IconSearch}
							size="sm"
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							placeholder={t.admin.searchPlaceholder}
							value={searchQuery}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="pl-10"
						/>
					</div>
				</BlurFade>

				{isLoading ? (
					<div className="border rounded-md">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t.admin.roleName}</TableHead>
									<TableHead>{t.admin.roleDescription}</TableHead>
									<TableHead className="w-25">{t.common.actions}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{[...Array(5)].map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<Skeleton className="h-5 w-32" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-48" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-8 w-8" />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : data?.roles && filteredRoles.length > 0 ? (
					<div className="space-y-4">
						<div className="border rounded-md">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t.admin.roleName}</TableHead>
										<TableHead>{t.admin.roleDescription}</TableHead>
										<TableHead className="w-25">{t.common.actions}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredRoles.map((role: Role) => (
										<TableRow key={role.id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													<Icon icon={IconShield} size="sm" className="text-primary" />
													{role.name}
												</div>
											</TableCell>
											<TableCell>
												{role.description || (
													<span className="text-muted-foreground italic">No description</span>
												)}
											</TableCell>
											<TableCell>
												{(canEdit || canDelete) && (
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon-sm">
																<Icon icon={IconDotsVertical} size="sm" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															{canEdit && (
																<DropdownMenuItem onClick={() => openEditDialog(role)}>
																	<Icon icon={IconEdit} size="sm" className="mr-2" />
																	{t.common.edit}
																</DropdownMenuItem>
															)}
															{canDelete && (
																<DropdownMenuItem
																	className="text-destructive"
																	onClick={() => openDeleteDialog(role)}
																>
																	<Icon icon={IconTrash} size="sm" className="mr-2" />
																	{t.common.delete}
																</DropdownMenuItem>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						<div className="flex flex-wrap items-center justify-between gap-2">
							<TypographyMuted>
								{t.common.showing} {data.offset + 1}-{data.offset + (filteredRoles?.length || 0)} of
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
									disabled={!filteredRoles || filteredRoles.length < pageSize}
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
									<Icon icon={IconShield} size="xl" className="text-muted-foreground" />
								</EmptyMedia>
								<EmptyTitle>{t.admin.noRoles}</EmptyTitle>
							</EmptyHeader>
							{canCreate && (
								<EmptyContent>
									<Button onClick={() => setCreateDialogOpen(true)}>
										<Icon icon={IconPlus} size="sm" className="mr-2" />
										{t.admin.createRole}
									</Button>
								</EmptyContent>
							)}
						</Empty>
					</BlurFade>
				)}
			</Container>

			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.admin.createRole}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>{t.admin.roleName}</Label>
							<Input
								value={formData.name}
								onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
								placeholder="admin"
							/>
						</div>
						<div className="space-y-2">
							<Label>{t.admin.roleDescription}</Label>
							<Textarea
								value={formData.description}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder="Administrator role with full access"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button onClick={handleCreate} disabled={createRole.isPending}>
							{createRole.isPending ? t.common.creating : t.common.create}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle>{t.common.edit}</DialogTitle>
					</DialogHeader>
					<div className="flex-1 overflow-y-auto space-y-6 pr-2">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>{t.admin.roleName}</Label>
								<Input
									value={formData.name}
									onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t.admin.roleDescription}</Label>
								<Textarea
									value={formData.description}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
								/>
							</div>
						</div>

						<Separator />

						<div className="space-y-4">
							<div>
								<TypographyH4 size="xs" className="flex items-center gap-2">
									<Icon icon={IconKey} size="sm" />
									{t.admin.roleClaims}
								</TypographyH4>
								<TypographyMuted className="mt-1">{t.admin.roleClaimsDescription}</TypographyMuted>
							</div>

							{claimsLoading || roleClaimsLoading ? (
								<div className="flex items-center justify-center py-8">
									<Icon
										icon={IconLoader}
										size="md"
										className="animate-spin text-muted-foreground"
									/>
									<span className="ml-2 text-sm text-muted-foreground">
										{t.admin.loadingClaims}
									</span>
								</div>
							) : allClaims?.claims && allClaims.claims.length > 0 ? (
								<ScrollArea className="h-50 border rounded-md p-4">
									<div className="space-y-3">
										{allClaims.claims.map((claim: Claim) => {
											const isSelected = isClaimSelected(claim.id);
											return (
												<div key={claim.id} className="flex items-center space-x-3">
													<Checkbox
														id={`claim-${claim.id}`}
														checked={isSelected}
														onCheckedChange={() => handleClaimToggle(claim.id)}
													/>
													<label
														htmlFor={`claim-${claim.id}`}
														className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
													>
														<span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded mr-2">
															{claim.type}
														</span>
														{claim.value}
													</label>
												</div>
											);
										})}
									</div>
								</ScrollArea>
							) : (
								<div className="text-center py-8 text-sm text-muted-foreground border rounded-md">
									{t.admin.noClaimsAvailable}
								</div>
							)}
						</div>
					</div>
					<DialogFooter className="pt-4">
						<Button variant="outline" onClick={() => setEditDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button onClick={handleUpdate} disabled={isSaving}>
							{isSaving ? t.common.saving : t.common.save}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.common.delete}</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete role &quot;{selectedRole?.name}
							&quot;?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={deleteRole.isPending}>
							{deleteRole.isPending ? t.common.deleting : t.common.delete}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
