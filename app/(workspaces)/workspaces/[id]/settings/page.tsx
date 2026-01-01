"use client";

import { useState, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	IconArrowLeft,
	IconLoader2,
	IconTrash,
	IconUserPlus,
	IconSettings,
	IconUsers,
	IconLock,
	IconShield,
	IconEdit,
	IconCreditCard,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { useTenantPermissions, TENANT_PERMISSIONS } from "@/providers/tenant-permissions-provider";
import { identityApi, IdentityApiError } from "@/lib/api/identity";
import {
	useTenantRoles,
	useCreateTenantRole,
	useUpdateTenantRole,
	useDeleteTenantRole,
	useTenantRoleClaims,
	useBatchUpdateTenantRoleClaims,
	useTenantAvailableClaims,
	useTenantUserRoles,
	useBatchUpdateTenantUserRoles,
	useCurrentSubscription,
	usePlans,
	useResolveTenantSlug,
	useTenant,
} from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldGroup, FieldLabelWithTooltip } from "@/components/ui/field";
import { UserAvatar } from "@/components/shared";
import type { Role, User } from "@/types";

function SubscriptionTabContent({
	tenantId,
	workspaceSlug,
}: {
	tenantId: string;
	workspaceSlug: string;
}) {
	const t = useTranslations();
	const { data: subscription, isLoading: subscriptionLoading } = useCurrentSubscription(tenantId);
	const { data: plans } = usePlans();

	const currentPlan = plans?.find((p) => p.id === subscription?.planId);

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getStatusTranslation = (status: string) => {
		const statusMap: Record<string, string> = {
			active: t.subscription.statuses.active,
			trialing: t.subscription.statuses.trialing,
			canceled: t.subscription.statuses.canceled,
			past_due: t.subscription.statuses.past_due,
			incomplete: t.subscription.statuses.incomplete,
			incomplete_expired: t.subscription.statuses.incomplete_expired,
			unpaid: t.subscription.statuses.unpaid,
		};
		return statusMap[status] || status;
	};

	const getBillingCycleTranslation = (cycle: string) => {
		const cycleMap: Record<string, string> = {
			monthly: t.subscription.billingCycles.monthly,
			yearly: t.subscription.billingCycles.yearly,
		};
		return cycleMap[cycle] || cycle;
	};

	if (subscriptionLoading) {
		return (
			<TabsContent value="subscription" className="space-y-6">
				<div className="flex justify-center py-8">
					<IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			</TabsContent>
		);
	}

	return (
		<TabsContent value="subscription" className="space-y-6">
			<div className="space-y-4">
				<div>
					<h3 className="text-lg font-medium">{t.subscription.title}</h3>
					<p className="text-sm text-muted-foreground">{t.subscription.subtitle}</p>
				</div>

				{subscription ? (
					<div className="space-y-4">
						<div className="p-4 rounded-lg border bg-card">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">{currentPlan?.name || t.subscription.currentPlan}</p>
									<p className="text-sm text-muted-foreground">
										{t.subscription.status}:{" "}
										<Badge
											variant={
												subscription.status === "active"
													? "default"
													: subscription.status === "trialing"
													? "secondary"
													: "destructive"
											}
										>
											{getStatusTranslation(subscription.status)}
										</Badge>
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										{t.subscription.billing}:{" "}
										{getBillingCycleTranslation(subscription.billingCycle)}
									</p>
									<p className="text-sm text-muted-foreground">
										{t.subscription.currentPeriod}: {formatDate(subscription.currentPeriodStart)} -{" "}
										{formatDate(subscription.currentPeriodEnd)}
									</p>
									{subscription.status === "trialing" && subscription.trialEnd && (
										<p className="text-sm text-muted-foreground">
											{t.subscription.trialEnds}: {formatDate(subscription.trialEnd)}
										</p>
									)}
								</div>
								{subscription.cancelAtPeriodEnd && (
									<Badge variant="destructive">{t.subscription.cancelsAtPeriodEnd}</Badge>
								)}
							</div>
						</div>

						<Link href={`/workspaces/${workspaceSlug}/subscription`}>
							<Button variant="outline">
								<IconCreditCard className="mr-2 h-4 w-4" />
								{t.subscription.changePlan}
							</Button>
						</Link>
					</div>
				) : (
					<div className="text-center py-8 border rounded-lg">
						<IconCreditCard className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
						<p className="text-muted-foreground mb-4">{t.subscription.noActiveSubscription}</p>
						<Link href={`/workspaces/${workspaceSlug}/subscription`}>
							<Button>{t.subscription.choosePlan}</Button>
						</Link>
					</div>
				)}
			</div>
		</TabsContent>
	);
}

export default function WorkspaceSettingsPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const t = useTranslations();
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { user, tokens } = useAuth();

	const defaultTab = searchParams.get("tab") || "general";

	const {
		setTenant,
		hasPermission,
		isLoading: isPermissionsLoading,
		tenantId: permissionsTenantId,
	} = useTenantPermissions();

	const canViewTenant = hasPermission(TENANT_PERMISSIONS.TENANT_VIEW);
	const canUpdateTenant = hasPermission(TENANT_PERMISSIONS.TENANT_UPDATE);
	const canDeleteTenant = hasPermission(TENANT_PERMISSIONS.TENANT_DELETE);
	const canViewMembers = hasPermission(TENANT_PERMISSIONS.MEMBERS_VIEW);
	const canAddMembers = hasPermission(TENANT_PERMISSIONS.MEMBERS_CREATE);
	const canRemoveMembers = hasPermission(TENANT_PERMISSIONS.MEMBERS_DELETE);

	const canViewRoles = canViewMembers;

	const canCreateRoles = hasPermission(TENANT_PERMISSIONS.ROLES_CREATE);
	const canUpdateRoles = hasPermission(TENANT_PERMISSIONS.ROLES_UPDATE);
	const canDeleteRoles = hasPermission(TENANT_PERMISSIONS.ROLES_DELETE);

	const [name, setName] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [slug, setSlug] = useState("");
	const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
	const [memberIdentifier, setMemberIdentifier] = useState("");
	const [selectedMember, setSelectedMember] = useState<User | null>(null);
	const [memberRolesDialogOpen, setMemberRolesDialogOpen] = useState(false);
	const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
	const [isSaving, setIsSaving] = useState(false);

	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

	const { data: resolvedTenant, isLoading: isResolving } = useResolveTenantSlug(
		isUUID ? undefined : id
	);

	const resolvedTenantId = isUUID ? id : resolvedTenant?.id;
	const { data: tenantData, isLoading: isTenantLoading } = useTenant(resolvedTenantId);

	const tenant = tenantData?.tenant;

	const isPermissionsReady = !!permissionsTenantId && !isPermissionsLoading;

	useEffect(() => {
		if (tenant) {
			setName(tenant.name);
			setDisplayName(tenant.displayName || "");
			setSlug(tenant.slug);
		}
	}, [tenant]);

	useEffect(() => {
		if (tenant?.id) {
			setTenant(tenant.id);
		}
	}, [tenant?.id, setTenant]);

	const {
		data: rolesData,
		error: rolesError,
		isLoading: rolesLoading,
	} = useTenantRoles(resolvedTenantId || "");
	const { data: memberRolesData, isLoading: memberRolesLoading } = useTenantUserRoles(
		resolvedTenantId || "",
		selectedMember?.id || ""
	);

	const batchUpdateTenantUserRoles = useBatchUpdateTenantUserRoles();

	useEffect(() => {
		if (memberRolesData && selectedMember) {
			setSelectedRoleIds(new Set(memberRolesData.map((r) => r.id)));
		}
	}, [memberRolesData, selectedMember]);

	useEffect(() => {
		if (selectedMember?.id && resolvedTenantId) {
			queryClient.invalidateQueries({
				queryKey: ["tenant-user-roles", resolvedTenantId, selectedMember.id],
			});
		}
	}, [selectedMember?.id, resolvedTenantId, queryClient]);

	const createTenantRole = useCreateTenantRole();
	const updateTenantRole = useUpdateTenantRole();
	const deleteTenantRole = useDeleteTenantRole();

	const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
	const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [roleName, setRoleName] = useState("");
	const [roleDescription, setRoleDescription] = useState("");
	const [claimsDialogOpen, setClaimsDialogOpen] = useState(false);
	const [selectedClaimIds, setSelectedClaimIds] = useState<Set<string>>(new Set());
	const [initialClaimIds, setInitialClaimIds] = useState<Set<string>>(new Set());

	const { data: claimsData } = useTenantAvailableClaims(resolvedTenantId || "", claimsDialogOpen);

	const { data: roleClaimsData, isLoading: roleClaimsLoading } = useTenantRoleClaims(
		resolvedTenantId || "",
		selectedRole?.id || ""
	);
	const batchUpdateTenantRoleClaims = useBatchUpdateTenantRoleClaims();

	useEffect(() => {
		if (roleClaimsData && selectedRole && claimsDialogOpen) {
			const claimIds = new Set<string>(roleClaimsData.map((c) => c.id));
			setSelectedClaimIds(claimIds);
			setInitialClaimIds(claimIds);
		}
	}, [roleClaimsData, selectedRole, claimsDialogOpen]);

	const { data: members = [], isLoading: isMembersLoading } = useQuery({
		queryKey: ["tenant-members", resolvedTenantId],
		queryFn: async () => {
			if (!tokens?.accessToken || !resolvedTenantId)
				throw new Error("No access token or tenant ID");
			return identityApi.getTenantMembers(tokens.accessToken, resolvedTenantId);
		},
		enabled: !!tokens?.accessToken && !!resolvedTenantId && !isResolving,
	});

	const updateMutation = useMutation({
		mutationFn: async (data: { name: string; displayName?: string }) => {
			if (!tokens?.accessToken || !resolvedTenantId)
				throw new Error("No access token or tenant ID");
			return identityApi.updateTenant(tokens.accessToken, resolvedTenantId, data);
		},
		onSuccess: () => {
			toast.success(t.workspaces.updated);
			queryClient.invalidateQueries({ queryKey: ["tenant", resolvedTenantId] });
			queryClient.invalidateQueries({ queryKey: ["my-tenants"] });
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error(t.workspaces.updateWorkspaceFailed);
			}
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async () => {
			if (!tokens?.accessToken || !resolvedTenantId)
				throw new Error("No access token or tenant ID");
			return identityApi.deleteTenant(tokens.accessToken, resolvedTenantId);
		},
		onSuccess: () => {
			toast.success(t.workspaces.deleted);
			queryClient.invalidateQueries({ queryKey: ["my-tenants"] });
			router.push("/workspaces");
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error(t.workspaces.deleteWorkspaceFailed);
			}
		},
	});

	const addMemberMutation = useMutation({
		mutationFn: async (identifier: string) => {
			if (!tokens?.accessToken || !resolvedTenantId)
				throw new Error("No access token or tenant ID");
			const isEmail = identifier.includes("@");
			return identityApi.addTenantMember(
				tokens.accessToken,
				resolvedTenantId,
				isEmail ? { email: identifier } : { username: identifier }
			);
		},
		onSuccess: () => {
			toast.success(t.workspaces.memberAdded);
			queryClient.invalidateQueries({
				queryKey: ["tenant-members", resolvedTenantId],
			});
			setIsAddMemberOpen(false);
			setMemberIdentifier("");
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error(t.workspaces.addMemberFailed);
			}
		},
	});

	const removeMemberMutation = useMutation({
		mutationFn: async (userId: string) => {
			if (!tokens?.accessToken || !resolvedTenantId)
				throw new Error("No access token or tenant ID");
			return identityApi.removeTenantMember(tokens.accessToken, resolvedTenantId, userId);
		},
		onSuccess: () => {
			toast.success(t.workspaces.memberRemoved);
			queryClient.invalidateQueries({
				queryKey: ["tenant-members", resolvedTenantId],
			});
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error(t.workspaces.removeMemberFailed);
			}
		},
	});

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		updateMutation.mutate({
			name: name.trim(),
			displayName: displayName.trim() || undefined,
		});
	};

	const handleAddMember = (e: React.FormEvent) => {
		e.preventDefault();
		if (!memberIdentifier.trim()) return;
		addMemberMutation.mutate(memberIdentifier.trim());
	};

	const handleMemberRoleToggle = (roleId: string) => {
		const newSet = new Set(selectedRoleIds);
		if (newSet.has(roleId)) {
			newSet.delete(roleId);
		} else {
			newSet.add(roleId);
		}
		setSelectedRoleIds(newSet);
	};

	const handleUpdateRoles = async () => {
		if (!selectedMember) return;
		setIsSaving(true);

		try {
			const currentIds = new Set(memberRolesData?.map((r) => r.id) || []);
			const toAssign = Array.from(selectedRoleIds).filter((id) => !currentIds.has(id));
			const toRemove = Array.from(currentIds).filter((id) => !selectedRoleIds.has(id));

			await batchUpdateTenantUserRoles.mutateAsync({
				tenantId: resolvedTenantId!,
				userId: selectedMember.id,
				assignRoleIds: toAssign,
				removeRoleIds: toRemove,
			});

			toast.success(t.tenantAdmin.assignRoleToMember);
			setMemberRolesDialogOpen(false);
			queryClient.invalidateQueries({
				queryKey: ["tenant-user-roles", resolvedTenantId, selectedMember.id],
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.updateFailed);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCreateRole = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!roleName.trim() || !resolvedTenantId) return;

		try {
			await createTenantRole.mutateAsync({
				tenantId: resolvedTenantId,
				request: {
					name: roleName.trim(),
					description: roleDescription.trim() || undefined,
				},
			});

			toast.success(t.tenantAdmin.roleCreated);
			setCreateRoleDialogOpen(false);
			setRoleName("");
			setRoleDescription("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	const handleEditRole = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!roleName.trim() || !selectedRole || !resolvedTenantId) return;

		try {
			await updateTenantRole.mutateAsync({
				tenantId: resolvedTenantId,
				roleId: selectedRole.id,
				request: {
					name: roleName.trim(),
					description: roleDescription.trim() || undefined,
				},
			});

			toast.success(t.tenantAdmin.roleUpdated);
			setEditRoleDialogOpen(false);
			setSelectedRole(null);
			setRoleName("");
			setRoleDescription("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.updateFailed);
		}
	};

	const handleDeleteRole = async (roleId: string) => {
		if (!resolvedTenantId) return;

		try {
			await deleteTenantRole.mutateAsync({
				tenantId: resolvedTenantId,
				roleId,
			});

			toast.success(t.tenantAdmin.roleDeleted);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.deleteFailed);
		}
	};

	const handleSaveClaims = async () => {
		if (!selectedRole || !resolvedTenantId) return;

		try {
			const toAssign = Array.from(selectedClaimIds).filter((id) => !initialClaimIds.has(id));
			const toRemove = Array.from(initialClaimIds).filter((id) => !selectedClaimIds.has(id));

			await batchUpdateTenantRoleClaims.mutateAsync({
				tenantId: resolvedTenantId,
				roleId: selectedRole.id,
				assignClaimIds: toAssign,
				removeClaimIds: toRemove,
			});

			toast.success(t.admin.claimAssigned);
			setClaimsDialogOpen(false);
			queryClient.invalidateQueries({
				queryKey: ["tenant-role-claims", resolvedTenantId, selectedRole.id],
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.updateFailed);
		}
	};

	const openEditRoleDialog = (role: Role) => {
		setSelectedRole(role);
		setRoleName(role.name);
		setRoleDescription(role.description || "");
		setEditRoleDialogOpen(true);
	};

	const openClaimsDialog = (role: Role) => {
		setSelectedClaimIds(new Set());
		setInitialClaimIds(new Set());
		setSelectedRole(role);
		setClaimsDialogOpen(true);
	};

	const openMemberRolesDialog = (member: User) => {
		setSelectedMember(member);
		setMemberRolesDialogOpen(true);
	};

	if (isTenantLoading || isResolving || !isPermissionsReady) {
		return (
			<div className="flex items-center justify-center h-full min-h-96">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!tenant) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-96">
				<p className="text-muted-foreground mb-4">Workspace not found</p>
				<Link href="/workspaces">
					<Button variant="outline">
						<IconArrowLeft className="mr-2 h-4 w-4" />
						{t.workspaces.backToWorkspaces}
					</Button>
				</Link>
			</div>
		);
	}

	const hasAnySettingsPermission = canViewTenant || canViewMembers;

	if (!hasAnySettingsPermission) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-96">
				<div className="rounded-full bg-muted p-6 mb-6">
					<IconLock className="h-12 w-12 text-muted-foreground" />
				</div>
				<h2 className="text-xl font-semibold mb-2">{t.common.accessDenied || "Access Denied"}</h2>
				<p className="text-muted-foreground mb-6">{t.common.noPermission}</p>
			</div>
		);
	}

	return (
		<div className="w-full py-8 px-4">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">{tenant.name}</h1>
						<p className="text-muted-foreground">/{tenant.slug}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{canDeleteTenant && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="text-destructive hover:text-destructive hover:bg-destructive/10"
								>
									<IconTrash className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>{t.workspaces.deleteWorkspace}</AlertDialogTitle>
									<AlertDialogDescription>{t.workspaces.deleteConfirm}</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => deleteMutation.mutate()}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										{deleteMutation.isPending ? (
											<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
										) : null}
										{t.common.delete}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</div>
			</div>

			<Tabs
				defaultValue={defaultTab}
				className="space-y-6"
				onValueChange={(value) => {
					router.push(`/workspaces/${id}/settings?tab=${value}`, { scroll: false });
				}}
			>
				<TabsList>
					{canViewTenant && (
						<TabsTrigger value="general" className="gap-2">
							<IconSettings className="h-4 w-4" />
							{t.workspaces.generalSettings}
						</TabsTrigger>
					)}
					{canViewMembers && (
						<TabsTrigger value="members" className="gap-2">
							<IconUsers className="h-4 w-4" />
							{t.workspaces.membersSettings}
						</TabsTrigger>
					)}
					{canViewRoles && (
						<TabsTrigger value="roles" className="gap-2">
							<IconShield className="h-4 w-4" />
							{t.tenantAdmin.roles}
						</TabsTrigger>
					)}
					{canViewTenant && (
						<TabsTrigger value="subscription" className="gap-2">
							<IconCreditCard className="h-4 w-4" />
							{t.subscription.title}
						</TabsTrigger>
					)}
				</TabsList>

				{canViewTenant && (
					<TabsContent value="general" className="space-y-6">
						<form onSubmit={handleUpdate} className="space-y-6">
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-medium">{t.workspaces.generalSettings}</h3>
									<p className="text-sm text-muted-foreground">
										{t.workspaces.generalSettingsDescription}
									</p>
								</div>
								<FieldGroup>
									<Field>
										<FieldLabelWithTooltip
											htmlFor="name"
											tooltip={t.workspaces.tooltips?.workspaceName}
										>
											{t.workspaces.workspaceName}
										</FieldLabelWithTooltip>
										<Input
											id="name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder={t.workspaces.workspaceNamePlaceholder}
											required
											disabled={!canUpdateTenant}
										/>
									</Field>
									<Field>
										<FieldLabelWithTooltip
											htmlFor="displayName"
											tooltip={t.workspaces.tooltips?.displayName}
										>
											{t.workspaces.displayName}
										</FieldLabelWithTooltip>
										<Input
											id="displayName"
											value={displayName}
											onChange={(e) => setDisplayName(e.target.value)}
											placeholder={t.workspaces.displayNamePlaceholder}
											disabled={!canUpdateTenant}
										/>
										<p className="text-xs text-muted-foreground mt-1">
											{t.workspaces.displayNameHelpText}
										</p>
									</Field>
									<Field>
										<FieldLabelWithTooltip
											htmlFor="slug"
											tooltip={t.workspaces.tooltips?.workspaceSlug}
										>
											{t.workspaces.workspaceSlug}
										</FieldLabelWithTooltip>
										<Input
											id="slug"
											value={slug}
											disabled={true}
											className="bg-muted cursor-not-allowed"
											placeholder={t.workspaces.workspaceSlugPlaceholder}
										/>
										<p className="text-xs text-muted-foreground mt-1">
											{t.workspaces.slugHelpText}
										</p>
									</Field>
								</FieldGroup>
								{canUpdateTenant && (
									<Button type="submit" disabled={updateMutation.isPending}>
										{updateMutation.isPending ? (
											<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
										) : null}
										{t.common.save}
									</Button>
								)}
							</div>
						</form>
					</TabsContent>
				)}

				{canViewMembers && (
					<TabsContent value="members" className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-medium">{t.workspaces.members}</h3>
								<p className="text-sm text-muted-foreground">
									{t.workspaces.membersSettingsDescription}
								</p>
							</div>
							{canAddMembers && (
								<Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
									<DialogTrigger asChild>
										<Button>
											<IconUserPlus className="mr-2 h-4 w-4" />
											{t.workspaces.addMember}
										</Button>
									</DialogTrigger>
									<DialogContent>
										<form onSubmit={handleAddMember}>
											<DialogHeader>
												<DialogTitle>{t.workspaces.addMember}</DialogTitle>
												<DialogDescription>{t.workspaces.addMemberDescription}</DialogDescription>
											</DialogHeader>
											<div className="py-4">
												<Field>
													<FieldLabelWithTooltip
														htmlFor="memberIdentifier"
														tooltip={t.workspaces.tooltips?.memberIdentifier}
													>
														{t.workspaces.memberIdentifier}
													</FieldLabelWithTooltip>
													<Input
														id="memberIdentifier"
														value={memberIdentifier}
														onChange={(e) => setMemberIdentifier(e.target.value)}
														placeholder={t.workspaces.memberIdentifierPlaceholder}
														required
													/>
												</Field>
											</div>
											<DialogFooter>
												<Button
													type="button"
													variant="outline"
													onClick={() => setIsAddMemberOpen(false)}
												>
													{t.common.cancel}
												</Button>
												<Button type="submit" disabled={addMemberMutation.isPending}>
													{addMemberMutation.isPending ? (
														<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
													) : null}
													{t.workspaces.addMember}
												</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>
							)}
						</div>

						{isMembersLoading ? (
							<div className="flex justify-center py-8">
								<IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : members.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<IconUsers className="h-8 w-8 mx-auto mb-4" />
								<p>{t.workspaces.noMembers}</p>
							</div>
						) : (
							<div className="space-y-2">
								{members.map((member) => (
									<div
										key={member.id}
										className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
									>
										<div className="flex items-center gap-3">
											<UserAvatar user={member} size="default" />
											<div>
												<p className="font-medium text-sm">
													{member.firstName} {member.lastName}
												</p>
												<p className="text-xs text-muted-foreground">{member.email}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{canViewRoles && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => openMemberRolesDialog(member)}
												>
													<IconEdit className="h-3 w-3 mr-1" />
													{t.admin.assignRole}
												</Button>
											)}
											{canRemoveMembers && member.id !== user?.id && (
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															className="text-destructive hover:text-destructive"
														>
															<IconTrash className="h-3 w-3" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>{t.workspaces.removeMember}</AlertDialogTitle>
															<AlertDialogDescription>
																{t.workspaces.removeMemberConfirm}
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => removeMemberMutation.mutate(member.id)}
																className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																disabled={removeMemberMutation.isPending}
															>
																{t.workspaces.removeMember}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</TabsContent>
				)}

				{canViewRoles && (
					<TabsContent value="roles" className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-medium">{t.tenantAdmin.roles}</h3>
								<p className="text-sm text-muted-foreground">{t.tenantAdmin.membersDescription}</p>
							</div>
							{canCreateRoles && (
								<Dialog
									open={createRoleDialogOpen}
									onOpenChange={(open) => {
										setCreateRoleDialogOpen(open);
										if (!open) {
											setRoleName("");
											setRoleDescription("");
										}
									}}
								>
									<DialogTrigger asChild>
										<Button>
											<IconUserPlus className="mr-2 h-4 w-4" />
											{t.tenantAdmin.createRole}
										</Button>
									</DialogTrigger>
									<DialogContent>
										<form onSubmit={handleCreateRole}>
											<DialogHeader>
												<DialogTitle>{t.tenantAdmin.createRole}</DialogTitle>
												<DialogDescription>{t.tenantAdmin.createRoleDescription}</DialogDescription>
											</DialogHeader>
											<div className="py-4 space-y-4">
												<Field>
													<FieldLabelWithTooltip
														htmlFor="roleName"
														tooltip={t.workspaces.tooltips?.roleName}
													>
														{t.tenantAdmin.roleName}
													</FieldLabelWithTooltip>
													<Input
														id="roleName"
														value={roleName}
														onChange={(e) => setRoleName(e.target.value)}
														placeholder={t.tenantAdmin.roleNamePlaceholder}
														required
													/>
												</Field>
												<Field>
													<FieldLabelWithTooltip
														htmlFor="roleDescription"
														tooltip={t.workspaces.tooltips?.roleDescription}
													>
														{t.tenantAdmin.roleDescription}
													</FieldLabelWithTooltip>
													<Input
														id="roleDescription"
														value={roleDescription}
														onChange={(e) => setRoleDescription(e.target.value)}
														placeholder={t.tenantAdmin.roleDescriptionPlaceholder}
													/>
												</Field>
											</div>
											<DialogFooter>
												<Button
													type="button"
													variant="outline"
													onClick={() => setCreateRoleDialogOpen(false)}
												>
													{t.common.cancel}
												</Button>
												<Button
													type="submit"
													disabled={createTenantRole.isPending || !roleName.trim()}
												>
													{createTenantRole.isPending ? (
														<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
													) : null}
													{t.tenantAdmin.createRole}
												</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>
							)}
						</div>

						{canUpdateRoles && (
							<Dialog
								open={editRoleDialogOpen}
								onOpenChange={(open) => {
									setEditRoleDialogOpen(open);
									if (!open) {
										setSelectedRole(null);
										setRoleName("");
										setRoleDescription("");
									}
								}}
							>
								<DialogContent>
									<form onSubmit={handleEditRole}>
										<DialogHeader>
											<DialogTitle>{t.tenantAdmin.editRole}</DialogTitle>
											<DialogDescription>{t.tenantAdmin.editRoleDescription}</DialogDescription>
										</DialogHeader>
										<div className="py-4 space-y-4">
											<Field>
												<FieldLabelWithTooltip
													htmlFor="editRoleName"
													tooltip={t.workspaces.tooltips?.roleName}
												>
													{t.tenantAdmin.roleName}
												</FieldLabelWithTooltip>
												<Input
													id="editRoleName"
													value={roleName}
													onChange={(e) => setRoleName(e.target.value)}
													placeholder={t.tenantAdmin.roleNamePlaceholder}
													required
												/>
											</Field>
											<Field>
												<FieldLabelWithTooltip
													htmlFor="editRoleDescription"
													tooltip={t.workspaces.tooltips?.roleDescription}
												>
													{t.tenantAdmin.roleDescription}
												</FieldLabelWithTooltip>
												<Input
													id="editRoleDescription"
													value={roleDescription}
													onChange={(e) => setRoleDescription(e.target.value)}
													placeholder={t.tenantAdmin.roleDescriptionPlaceholder}
												/>
											</Field>
										</div>
										<DialogFooter>
											<Button
												type="button"
												variant="outline"
												onClick={() => setEditRoleDialogOpen(false)}
											>
												{t.common.cancel}
											</Button>
											<Button
												type="submit"
												disabled={updateTenantRole.isPending || !roleName.trim()}
											>
												{updateTenantRole.isPending ? (
													<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
												) : null}
												{t.common.save}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						)}

						<div className="space-y-2">
							<h4 className="text-sm font-medium text-muted-foreground">
								{t.tenantAdmin.availableRoles}
							</h4>
							{rolesLoading ? (
								<div className="flex justify-center py-8">
									<IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : rolesError ? (
								<div className="text-center py-8 text-destructive border border-destructive/20 rounded-md bg-destructive/5">
									<IconShield className="h-8 w-8 mx-auto mb-4 text-destructive/60" />
									<p className="text-sm font-medium mb-2">Failed to load roles</p>
									<p className="text-xs text-muted-foreground">
										The backend service may not be running
									</p>
								</div>
							) : rolesData && rolesData.length > 0 ? (
								<div className="space-y-2">
									{rolesData.map((role) => (
										<div
											key={role.id}
											className="flex items-center justify-between p-3 rounded-lg border bg-card"
										>
											<div className="flex items-center gap-3">
												<IconShield className="h-4 w-4 text-primary" />
												<div>
													<p className="font-medium">{role.name}</p>
													{role.description && (
														<p className="text-sm text-muted-foreground">{role.description}</p>
													)}
													{role.isDefault && (
														<Badge variant="secondary" className="text-xs mt-1">
															{t.admin.systemRole}
														</Badge>
													)}
												</div>
											</div>
											<div className="flex items-center gap-2">
												{canUpdateRoles && !role.isDefault && (
													<Button variant="ghost" size="sm" onClick={() => openClaimsDialog(role)}>
														<IconLock className="h-3 w-3" />
													</Button>
												)}
												{canUpdateRoles && !role.isDefault && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => openEditRoleDialog(role)}
													>
														<IconEdit className="h-3 w-3" />
													</Button>
												)}
												{canDeleteRoles && !role.isDefault && (
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																className="text-destructive hover:text-destructive"
															>
																<IconTrash className="h-3 w-3" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>{t.tenantAdmin.deleteRole}</AlertDialogTitle>
																<AlertDialogDescription>
																	{t.tenantAdmin.deleteRoleConfirm}
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => handleDeleteRole(role.id)}
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																>
																	{deleteTenantRole.isPending ? (
																		<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
																	) : null}
																	{t.common.delete}
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted-foreground text-sm">{t.admin.noRoles}</p>
							)}
						</div>
					</TabsContent>
				)}

				{canViewTenant && (
					<SubscriptionTabContent tenantId={resolvedTenantId || ""} workspaceSlug={id} />
				)}
			</Tabs>

			<Dialog
				open={memberRolesDialogOpen}
				onOpenChange={(open) => {
					setMemberRolesDialogOpen(open);
					if (!open) setSelectedMember(null);
				}}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{t.tenantAdmin.memberRoles}</DialogTitle>
						<DialogDescription>
							{selectedMember && (
								<>
									{t.tenantAdmin.assignRoleToMember}:{" "}
									<strong>
										{selectedMember.firstName} {selectedMember.lastName}
									</strong>
								</>
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						{memberRolesLoading ? (
							<div className="flex items-center justify-center py-8">
								<IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
								<span className="ml-2 text-sm text-muted-foreground">{t.admin.loadingClaims}</span>
							</div>
						) : rolesLoading ? (
							<div className="flex items-center justify-center py-8">
								<IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
								<span className="ml-2 text-sm text-muted-foreground">Loading roles...</span>
							</div>
						) : rolesError ? (
							<div className="text-center py-8 text-destructive border border-destructive/20 rounded-md bg-destructive/5">
								<IconShield className="h-6 w-6 mx-auto mb-2 text-destructive/60" />
								<p className="text-sm font-medium">Failed to load roles</p>
							</div>
						) : rolesData && rolesData.length > 0 ? (
							<ScrollArea className="h-62.5 border rounded-md p-4">
								<div className="space-y-3">
									{rolesData.map((role) => {
										const isAssigned = selectedRoleIds.has(role.id);
										return (
											<div key={role.id} className="flex items-center space-x-3">
												<Checkbox
													id={`member-role-${role.id}`}
													checked={isAssigned}
													disabled={isSaving}
													onCheckedChange={() => handleMemberRoleToggle(role.id)}
												/>
												<label
													htmlFor={`member-role-${role.id}`}
													className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
												>
													<div className="flex items-center gap-2">
														<IconShield className="h-3 w-3 text-primary" />
														<span>{role.name}</span>
													</div>
													{role.description && (
														<p className="text-xs text-muted-foreground mt-1">{role.description}</p>
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
							onClick={() => setMemberRolesDialogOpen(false)}
							disabled={isSaving}
						>
							{t.common.cancel}
						</Button>
						<Button
							onClick={handleUpdateRoles}
							disabled={isSaving || batchUpdateTenantUserRoles.isPending}
						>
							{isSaving || batchUpdateTenantUserRoles.isPending ? t.common.saving : t.common.save}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={claimsDialogOpen}
				onOpenChange={(open) => {
					setClaimsDialogOpen(open);
					if (!open) {
						setSelectedRole(null);
						setSelectedClaimIds(new Set());
						setInitialClaimIds(new Set());
					}
				}}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{t.admin.roleClaims}</DialogTitle>
						<DialogDescription>
							{selectedRole && (
								<>
									{t.admin.manageClaimsFor} {selectedRole.name}
								</>
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						{roleClaimsLoading ? (
							<div className="flex items-center justify-center py-8">
								<IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
								<span className="ml-2 text-sm text-muted-foreground">{t.admin.loadingClaims}</span>
							</div>
					) : claimsData && claimsData.length > 0 ? (
						<ScrollArea className="h-62.5 border rounded-md p-4">
							<div className="space-y-3">
								{claimsData.map((claim) => {
										const isAssigned = selectedClaimIds.has(claim.id);
										return (
											<div key={claim.id} className="flex items-center space-x-3">
												<Checkbox
													id={`role-claim-${claim.id}`}
													checked={isAssigned}
													disabled={
														selectedRole?.isDefault || batchUpdateTenantRoleClaims.isPending
													}
													onCheckedChange={(checked) => {
														setSelectedClaimIds((prev) => {
															const newSet = new Set(prev);
															if (checked) {
																newSet.add(claim.id);
															} else {
																newSet.delete(claim.id);
															}
															return newSet;
														});
													}}
												/>
												<label
													htmlFor={`role-claim-${claim.id}`}
													className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
												>
													<div className="flex items-center gap-2">
														<IconLock className="h-3 w-3 text-primary" />
														<span>{claim.value}</span>
													</div>
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
					<DialogFooter>
						<Button variant="outline" onClick={() => setClaimsDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button onClick={handleSaveClaims}>{t.common.save}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
