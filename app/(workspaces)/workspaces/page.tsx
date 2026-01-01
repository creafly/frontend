"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
	IconPlus,
	IconUsers,
	IconSettings,
	IconArrowRight,
	IconLoader2,
	IconBuilding,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { useTenantPermissions } from "@/providers/tenant-permissions-provider";
import { identityApi, IdentityApiError } from "@/lib/api/identity";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardPagination } from "@/components/ui/card-pagination";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabelWithTooltip, FieldDescription } from "@/components/ui/field";
import { TenantAvatar } from "@/components/shared";
import type { Tenant } from "@/types";

export default function WorkspacesPage() {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { tokens } = useAuth();
	const { setTenant } = useTenantPermissions();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [name, setName] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [slug, setSlug] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	const ITEMS_PER_PAGE = 12;
	const { data: tenantsData, isLoading } = useQuery({
		queryKey: ["my-tenants"],
		queryFn: async () => {
			if (!tokens?.accessToken) throw new Error("No access token");
			return identityApi.getMyTenants(tokens.accessToken);
		},
		enabled: !!tokens?.accessToken,
		refetchOnMount: "always",
		staleTime: 0,
	});

	const createMutation = useMutation({
		mutationFn: async (data: { name: string; displayName?: string; slug?: string }) => {
			if (!tokens?.accessToken) throw new Error("No access token");
			return identityApi.createTenant(tokens.accessToken, data);
		},
		onSuccess: (response) => {
			if (response.tenant) {
				toast.success(t.workspaces.created);
				queryClient.invalidateQueries({ queryKey: ["my-tenants"] });
				setIsCreateOpen(false);
				setName("");
				setDisplayName("");
				setSlug("");
				handleEnterWorkspace(response.tenant);
			}
		},
		onError: (error) => {
			if (error instanceof IdentityApiError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to create workspace");
			}
		},
	});

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		createMutation.mutate({
			name: name.trim(),
			displayName: displayName.trim() || undefined,
			slug: slug.trim() || undefined,
		});
	};

	const handleEnterWorkspace = (tenant: Tenant) => {
		localStorage.setItem("selectedTenantId", tenant.id);
		localStorage.setItem("selectedTenantSlug", tenant.slug);
		localStorage.setItem("selectedTenantName", tenant.name);
		setTenant(tenant.id);
		router.push(`/workspaces/${tenant.slug}/chat`);
	};

	const tenants = tenantsData?.tenants || [];
	const totalPages = Math.ceil(tenants.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedTenants = tenants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
			<div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="flex h-16 items-center justify-between px-6">
					<div>
						<h1 className="text-xl font-semibold">{t.workspaces.title}</h1>
						<p className="text-sm text-muted-foreground">{t.workspaces.subtitle}</p>
					</div>
					<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
						<DialogTrigger asChild>
							<Button>
								<IconPlus className="mr-2 h-4 w-4" />
								{t.workspaces.createWorkspace}
							</Button>
						</DialogTrigger>
						<DialogContent>
							<form onSubmit={handleCreate}>
								<DialogHeader>
									<DialogTitle>{t.workspaces.createWorkspace}</DialogTitle>
									<DialogDescription>{t.workspaces.noWorkspacesDescription}</DialogDescription>
								</DialogHeader>
								<FieldGroup className="py-4">
									<Field>
										<FieldLabelWithTooltip htmlFor="name" tooltip={t.workspaces.tooltips?.workspaceName}>
											{t.workspaces.workspaceName}
										</FieldLabelWithTooltip>
										<Input
											id="name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder={t.workspaces.workspaceNamePlaceholder}
											required
										/>
									</Field>
									<Field>
										<FieldLabelWithTooltip htmlFor="displayName" tooltip={t.workspaces.tooltips?.displayName}>
											{t.workspaces.displayName}
										</FieldLabelWithTooltip>
										<Input
											id="displayName"
											value={displayName}
											onChange={(e) => setDisplayName(e.target.value)}
											placeholder={t.workspaces.displayNamePlaceholder}
										/>
										<FieldDescription>{t.workspaces.displayNameHelpText}</FieldDescription>
									</Field>
									<Field>
										<FieldLabelWithTooltip htmlFor="slug" tooltip={t.workspaces.tooltips?.workspaceSlug}>
											{t.workspaces.workspaceSlug}
										</FieldLabelWithTooltip>
										<Input
											id="slug"
											value={slug}
											onChange={(e) =>
												setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
											}
											placeholder={t.workspaces.workspaceSlugPlaceholder}
										/>
										<FieldDescription>{t.workspaces.slugAutoGenerateHelpText}</FieldDescription>
									</Field>
								</FieldGroup>
								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
										{t.common.cancel}
									</Button>
									<Button type="submit" disabled={createMutation.isPending || !name.trim()}>
										{createMutation.isPending ? (
											<>
												<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
												{t.workspaces.creating}
											</>
										) : (
											t.workspaces.createButton
										)}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="flex-1 px-6 py-8">
				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : tenants.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center py-20 text-center"
					>
						<div className="rounded-full bg-muted p-6 mb-6">
							<IconBuilding className="h-12 w-12 text-muted-foreground" />
						</div>
						<h2 className="text-2xl font-semibold mb-2">{t.workspaces.noWorkspaces}</h2>
						<p className="text-muted-foreground mb-6 max-w-md">
							{t.workspaces.noWorkspacesDescription}
						</p>
						<Button onClick={() => setIsCreateOpen(true)}>
							<IconPlus className="mr-2 h-4 w-4" />
							{t.workspaces.createWorkspace}
						</Button>
					</motion.div>
				) : (
					<>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{paginatedTenants.map((tenant, index) => (
								<motion.div
									key={tenant.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<WorkspaceCard
										tenant={tenant}
										onEnter={() => handleEnterWorkspace(tenant)}
										onMembers={() => router.push(`/workspaces/${tenant.slug}/settings?tab=members`)}
										onSettings={() => router.push(`/workspaces/${tenant.slug}/settings?tab=general`)}
										t={t}
									/>
								</motion.div>
							))}
						</div>

						<CardPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							totalItems={tenants.length}
							itemsPerPage={ITEMS_PER_PAGE}
							labels={{
								previous: t.common.previous,
								next: t.common.next,
								of: t.common.of,
								showing: t.common.showing,
								items: t.common.items,
							}}
						/>
					</>
				)}
			</div>
		</div>
	);
}

function WorkspaceCard({
	tenant,
	onEnter,
	onMembers,
	onSettings,
	t,
}: {
	tenant: Tenant;
	onEnter: () => void;
	onMembers: () => void;
	onSettings: () => void;
	t: ReturnType<typeof useTranslations>;
}) {
	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50",
				"cursor-pointer"
			)}
			onClick={onEnter}
		>
			<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

			<div className="relative">
				<div className="mb-4">
					<TenantAvatar
						tenant={{ name: tenant.name }}
						size="lg"
						showStatus
						isActive={tenant.isActive}
					/>
				</div>

				<h3 className="text-lg font-semibold mb-1">{tenant.name}</h3>
				<p className="text-sm text-muted-foreground mb-4">/{tenant.slug}</p>

				<div className="flex items-center justify-between">
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							className="h-8 px-2"
							onClick={(e) => {
								e.stopPropagation();
								onMembers();
							}}
						>
							<IconUsers className="h-4 w-4 mr-1" />
							{t.workspaces.members}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 px-2"
							onClick={(e) => {
								e.stopPropagation();
								onSettings();
							}}
						>
							<IconSettings className="h-4 w-4 mr-1" />
							{t.workspaces.settings}
						</Button>
					</div>
					<Button size="sm" className="h-8">
						{t.workspaces.enter}
						<IconArrowRight className="ml-1 h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
