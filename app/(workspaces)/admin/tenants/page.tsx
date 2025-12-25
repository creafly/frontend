"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
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
import { useAllTenants, useBlockTenant, useUnblockTenant } from "@/hooks/use-api";
import { useTranslations } from "@/providers/i18n-provider";
import { usePermissions, PERMISSIONS } from "@/providers/permissions-provider";
import { IconBan, IconShieldCheck, IconBuilding } from "@tabler/icons-react";
import { toast } from "sonner";
import { BlurFade } from "@/components/ui/blur-fade";
import Container from "@/components/container";
import { TypographyH3, TypographyP, TypographyError, Icon } from "@/components/typography";
import type { Tenant } from "@/types";

export default function TenantsPage() {
	const [blockDialogOpen, setBlockDialogOpen] = useState(false);
	const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
	const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
	const [blockReason, setBlockReason] = useState("");

	const { data, isLoading, error } = useAllTenants();
	const blockTenant = useBlockTenant();
	const unblockTenant = useUnblockTenant();
	const { hasPermission } = usePermissions();

	const canManage = hasPermission(PERMISSIONS.TENANTS_MANAGE);
	const t = useTranslations();

	const openBlockDialog = (tenant: Tenant) => {
		setSelectedTenant(tenant);
		setBlockReason("");
		setBlockDialogOpen(true);
	};

	const openUnblockDialog = (tenant: Tenant) => {
		setSelectedTenant(tenant);
		setUnblockDialogOpen(true);
	};

	const handleBlock = async () => {
		if (!selectedTenant || !blockReason.trim()) return;

		try {
			await blockTenant.mutateAsync({
				tenantId: selectedTenant.id,
				reason: blockReason,
			});
			toast.success(t.admin.tenantBlocked);
			setBlockDialogOpen(false);
			setSelectedTenant(null);
			setBlockReason("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	const handleUnblock = async () => {
		if (!selectedTenant) return;

		try {
			await unblockTenant.mutateAsync(selectedTenant.id);
			toast.success(t.admin.tenantUnblocked);
			setUnblockDialogOpen(false);
			setSelectedTenant(null);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
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
						<TypographyH3>{t.admin.tenants}</TypographyH3>
						<TypographyP className="mt-1 text-muted-foreground">
							{t.admin.tenantsDescription}
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
										<TableHead>Slug</TableHead>
										<TableHead>{t.common.status}</TableHead>
										<TableHead className="w-25">{t.common.actions}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{[...Array(5)].map((_, i) => (
										<TableRow key={i}>
											<TableCell>
												<div className="flex items-center gap-3">
													<Skeleton className="size-8 rounded-md" />
													<div className="space-y-2">
														<Skeleton className="h-4 w-24" />
														<Skeleton className="h-3 w-16" />
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-24" />
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
					) : data && data.length > 0 ? (
						<div className="border rounded-md">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t.admin.name}</TableHead>
										<TableHead>Slug</TableHead>
										<TableHead>{t.common.status}</TableHead>
										<TableHead className="w-25">{t.common.actions}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.map((tenant) => (
										<TableRow key={tenant.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="size-8 rounded-md bg-muted flex items-center justify-center">
														<Icon icon={IconBuilding} size="sm" className="text-muted-foreground" />
													</div>
													<div>
														<div className="font-medium">{tenant.displayName || tenant.name}</div>
														<div className="text-sm text-muted-foreground">{tenant.name}</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<code className="text-sm bg-muted px-2 py-1 rounded">{tenant.slug}</code>
											</TableCell>
											<TableCell>
												{tenant.isBlocked ? (
													<Badge variant="destructive" className="gap-1">
														<Icon icon={IconBan} size="xs" />
														{t.admin.blocked}
													</Badge>
												) : !tenant.isActive ? (
													<Badge variant="secondary" className="gap-1">
														{t.common.inactive}
													</Badge>
												) : (
													<Badge variant="outline" className="gap-1">
														<Icon icon={IconBuilding} size="xs" />
														{t.common.active}
													</Badge>
												)}
												{tenant.isBlocked && tenant.blockedAt && (
													<div className="text-xs text-muted-foreground mt-1">
														{t.admin.blockedAt}: {new Date(tenant.blockedAt).toLocaleDateString()}
													</div>
												)}
												{tenant.isBlocked && tenant.blockReason && (
													<div className="text-xs text-muted-foreground">{tenant.blockReason}</div>
												)}
											</TableCell>
											<TableCell>
												{canManage && (
													<div className="flex items-center gap-2">
														{tenant.isBlocked ? (
															<Button
																variant="ghost"
																size="icon-sm"
																className="text-success hover:text-success/80"
																onClick={() => openUnblockDialog(tenant)}
																title={t.admin.unblockTenant}
															>
																<Icon icon={IconShieldCheck} size="sm" />
															</Button>
														) : (
															<Button
																variant="ghost"
																size="icon-sm"
																className="text-destructive hover:text-destructive"
																onClick={() => openBlockDialog(tenant)}
																title={t.admin.blockTenant}
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
					) : (
						<BlurFade delay={0.2}>
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Icon icon={IconBuilding} size="xl" className="text-muted-foreground" />
									</EmptyMedia>
									<EmptyTitle>{t.admin.noTenants}</EmptyTitle>
								</EmptyHeader>
							</Empty>
						</BlurFade>
					)}
				</BlurFade>
			</Container>

			<Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.admin.blockTenant}</DialogTitle>
						<DialogDescription>
							{selectedTenant?.displayName || selectedTenant?.name} ({selectedTenant?.slug})
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
							disabled={blockTenant.isPending || !blockReason.trim()}
						>
							{blockTenant.isPending ? t.common.deleting : t.admin.blockTenant}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={unblockDialogOpen} onOpenChange={setUnblockDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.admin.unblockTenant}</AlertDialogTitle>
						<AlertDialogDescription>{t.admin.confirmUnblock}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction onClick={handleUnblock} disabled={unblockTenant.isPending}>
							{unblockTenant.isPending ? t.common.deleting : t.admin.unblockTenant}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
