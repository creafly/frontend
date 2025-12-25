"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
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
import { useTemplates, useDeleteTemplate, useDuplicateTemplate } from "@/hooks/use-api";
import { useTranslations, useI18n } from "@/providers/i18n-provider";
import { useTenantPermissions, TENANT_PERMISSIONS } from "@/providers/tenant-permissions-provider";
import { TENANT_ID } from "@/lib/constants";
import { getTenantId } from "@/lib/tenant";
import { formatDate } from "@/lib/utils/format";
import {
	IconDotsVertical,
	IconEye,
	IconEdit,
	IconCopy,
	IconTrash,
	IconTemplate,
	IconPlus,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { BlurFade } from "@/components/ui/blur-fade";
import type { Template } from "@/types";
import Container from "@/components/container";
import {
	TypographyH3,
	TypographyP,
	TypographyError,
	TypographyMuted,
	Icon,
} from "@/components/typography";
import { CardPagination } from "@/components/ui/card-pagination";

export default function TemplatesPage() {
	const params = useParams();
	const workspaceId = params.id as string;
	const tenantId = getTenantId();
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(10);
	const { data, isLoading, error } = useTemplates(tenantId || TENANT_ID, {
		offset: currentPage * pageSize,
		limit: pageSize,
	});
	const deleteTemplate = useDeleteTemplate();
	const duplicateTemplate = useDuplicateTemplate();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
	const t = useTranslations();
	const { locale } = useI18n();
	const { hasAnyPermission } = useTenantPermissions();

	const canCreate = hasAnyPermission(
		TENANT_PERMISSIONS.TEMPLATES_CREATE,
		TENANT_PERMISSIONS.TEMPLATES_MANAGE
	);
	const canEdit = hasAnyPermission(
		TENANT_PERMISSIONS.TEMPLATES_UPDATE,
		TENANT_PERMISSIONS.TEMPLATES_MANAGE
	);
	const canDelete = hasAnyPermission(
		TENANT_PERMISSIONS.TEMPLATES_DELETE,
		TENANT_PERMISSIONS.TEMPLATES_MANAGE
	);

	const handleDelete = async () => {
		if (!templateToDelete) return;

		try {
			await deleteTemplate.mutateAsync({
				tenantId: tenantId || TENANT_ID,
				id: templateToDelete.id,
			});
			toast.success(t.templates.templateDeleted);
			setDeleteDialogOpen(false);
			setTemplateToDelete(null);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.deleteFailed);
		}
	};

	const handleDuplicate = async (template: Template) => {
		try {
			await duplicateTemplate.mutateAsync({
				tenantId: tenantId || TENANT_ID,
				id: template.id,
			});
			toast.success(t.templates.templateDuplicated);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.duplicateFailed);
		}
	};

	const openDeleteDialog = (template: Template) => {
		setTemplateToDelete(template);
		setDeleteDialogOpen(true);
	};

	const getTemplateTypeLabel = (type: string) => {
		return t.templates.types[type as keyof typeof t.templates.types] ?? type;
	};

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<TypographyError>
					{t.errors.loadingTemplates}: {error.message}
				</TypographyError>
			</div>
		);
	}

	return (
		<div className="h-full space-y-6">
			<Container className="pb-0 max-w-full">
				<BlurFade delay={0.1}>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<TypographyH3>{t.templates.title}</TypographyH3>
							<TypographyP className="mt-1 text-muted-foreground">
								{t.templates.subtitle}
							</TypographyP>
						</div>
						{canCreate && (
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<Button asChild className="shadow-lg shadow-primary/20">
									<Link href={`/workspaces/${workspaceId}/templates/new`}>
										<Icon icon={IconPlus} size="sm" className="mr-2" />
										{t.templates.createTemplate}
									</Link>
								</Button>
							</motion.div>
						)}
					</div>
				</BlurFade>
			</Container>

			<Container className="pt-0 max-w-full">
				{isLoading ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[...Array(6)].map((_, i) => (
							<Card key={i} className="overflow-hidden">
								<CardContent className="p-4 space-y-3">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
									<div className="flex gap-2">
										<Skeleton className="h-5 w-16" />
										<Skeleton className="h-5 w-16" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : data?.templates && data.templates.length > 0 ? (
					<>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{data.templates.map((template, index) => (
								<BlurFade key={template.id} delay={0.1 + index * 0.05}>
									<motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}>
										<Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
											<CardContent className="p-4">
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0 flex-1">
														<TypographyH3
															size="2xs"
															className="truncate group-hover:text-primary transition-colors"
														>
															{template.name}
														</TypographyH3>
														<TypographyMuted className="truncate mt-0.5">
															{template.subject}
														</TypographyMuted>
													</div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon-sm"
																className="opacity-0 group-hover:opacity-100 transition-opacity"
															>
																<Icon icon={IconDotsVertical} size="sm" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent className="w-max" align="end">
															<DropdownMenuItem asChild>
																<Link href={`/workspaces/${workspaceId}/templates/${template.id}`}>
																	<Icon icon={IconEye} size="sm" className="mr-2" />
																	{t.common.view}
																</Link>
															</DropdownMenuItem>
															{canEdit && (
																<DropdownMenuItem asChild>
																	<Link
																		href={`/workspaces/${workspaceId}/templates/${template.id}/edit`}
																	>
																		<Icon icon={IconEdit} size="sm" className="mr-2" />
																		{t.common.edit}
																	</Link>
																</DropdownMenuItem>
															)}
															{canEdit && (
																<DropdownMenuItem onClick={() => handleDuplicate(template)}>
																	<Icon icon={IconCopy} size="sm" className="mr-2" />
																	{t.common.duplicate}
																</DropdownMenuItem>
															)}
															{canDelete && (
																<DropdownMenuItem
																	className="text-destructive focus:text-destructive"
																	onClick={() => openDeleteDialog(template)}
																>
																	<Icon icon={IconTrash} size="sm" className="mr-2" />
																	{t.common.delete}
																</DropdownMenuItem>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												</div>

												<div className="flex flex-wrap items-center gap-2 mt-4">
													<Badge
														variant={template.isActive ? "default" : "secondary"}
														className={
															template.isActive ? "bg-success text-success-foreground" : ""
														}
													>
														{template.isActive ? t.common.active : t.common.inactive}
													</Badge>
													<Badge variant="outline">{getTemplateTypeLabel(template.template)}</Badge>
												</div>

												<TypographyMuted className="text-xs mt-3">
													{formatDate(template.createdAt, locale)}
												</TypographyMuted>
											</CardContent>
										</Card>
									</motion.div>
								</BlurFade>
							))}
						</div>

						<CardPagination
							currentPage={currentPage + 1}
							onPageChange={(page) => setCurrentPage(page - 1)}
							hasNextPage={data.templates && data.templates.length >= pageSize}
							currentPageItems={data.templates?.length || 0}
							itemsPerPage={pageSize}
							labels={{
								previous: t.common.previous,
								next: t.common.next,
								page: t.common.page,
								showing: t.common.showing,
							}}
						/>
					</>
				) : (
					<BlurFade delay={0.2}>
						<div className="flex-1 flex items-center justify-center min-h-80">
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Icon icon={IconTemplate} size="lg" className="text-muted-foreground" />
									</EmptyMedia>
									<EmptyTitle>{t.templates.noTemplates}</EmptyTitle>
									<EmptyDescription>{t.templates.noTemplatesDescription}</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									{canCreate && (
										<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
											<Button asChild className="shadow-lg shadow-primary/20">
												<Link href={`/workspaces/${workspaceId}/templates/new`}>
													<Icon icon={IconPlus} size="sm" className="mr-2" />
													{t.templates.createTemplate}
												</Link>
											</Button>
										</motion.div>
									)}
								</EmptyContent>
							</Empty>
						</div>
					</BlurFade>
				)}
			</Container>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.templates.deleteConfirmTitle}</DialogTitle>
						<DialogDescription>
							{t.templates.deleteConfirmDescription.replace("{name}", templateToDelete?.name ?? "")}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteTemplate.isPending}
						>
							{deleteTemplate.isPending ? t.common.deleting : t.common.delete}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
