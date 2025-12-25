"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailPreview } from "@/components/email-preview";
import { useTemplate } from "@/hooks/use-api";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTranslations, useI18n } from "@/providers/i18n-provider";
import { useTenantPermissions, TENANT_PERMISSIONS } from "@/providers/tenant-permissions-provider";
import { renderBlocksToHtml } from "@/lib/render-blocks";
import { getTenantId } from "@/lib/tenant";
import { parseBlocks } from "@/lib/utils/blocks";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { IconArrowLeft, IconEdit, IconLayoutSidebarRight } from "@tabler/icons-react";
import { Icon, TypographyH1, TypographyError, TypographyMuted, TypographyLabel } from "@/components/typography";

export default function TemplateViewPage({
	params,
}: {
	params: Promise<{ id: string; templateId: string }>;
}) {
	const resolvedParams = use(params);
	const { data, isLoading, error } = useTemplate(getTenantId() ?? "", resolvedParams.templateId);
	const t = useTranslations();
	const { locale } = useI18n();
	const { hasAnyPermission } = useTenantPermissions();
	const canEdit = hasAnyPermission(
		TENANT_PERMISSIONS.TEMPLATES_UPDATE,
		TENANT_PERMISSIONS.TEMPLATES_MANAGE
	);
	const [sidebarOpen, setSidebarOpen] = useLocalStorage("template-view-sidebar", false);

	const previewHtml = useMemo(() => {
		if (!data?.template) return null;

		const template = data.template;
		const blocks = parseBlocks(template.blocks);

		if (blocks.length > 0) {
			return renderBlocksToHtml(blocks);
		}

		return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
    .placeholder { color: #666; }
  </style>
</head>
<body>
  <div class="placeholder">
    <h2>${template.subject}</h2>
    <p>Template type: ${template.template}</p>
    <p style="color: #999;">No blocks defined for this template.</p>
  </div>
</body>
</html>`;
	}, [data]);

	if (error) {
		return (
			<div className="flex items-center justify-center h-full">
				<TypographyError>
					{t.errors.loadingTemplates}: {error.message}
				</TypographyError>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<div className="flex items-center gap-3">
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-6 w-48" />
					</div>
					<Skeleton className="h-9 w-24" />
				</div>
				<div className="flex-1 flex">
					<div className="flex-1 p-6">
						<Skeleton className="h-full w-full" />
					</div>
					<div className="w-80 border-l p-4 space-y-4">
						<Skeleton className="h-40" />
						<Skeleton className="h-32" />
					</div>
				</div>
			</div>
		);
	}

	const template = data?.template;

	if (!template) {
		return (
			<div className="flex items-center justify-center h-full">
				<TypographyMuted>Template not found</TypographyMuted>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between border-b px-4 py-3 bg-background shrink-0">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" asChild>
						<Link href={`/workspaces/${resolvedParams.id}/templates`}>
							<Icon icon={IconArrowLeft} size="sm" />
						</Link>
					</Button>
					<div>
						<TypographyH1 size="xs" className="font-semibold">{template.name}</TypographyH1>
						<TypographyMuted>{template.subject}</TypographyMuted>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSidebarOpen(!sidebarOpen)}
						title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
					>
						<Icon icon={IconLayoutSidebarRight} size="sm" />
					</Button>
					{canEdit && (
						<Button asChild>
							<Link href={`/workspaces/${resolvedParams.id}/templates/${template.id}/edit`}>
								<Icon icon={IconEdit} size="sm" className="mr-2" />
								{t.common.edit}
							</Link>
						</Button>
					)}
				</div>
			</div>

			<div className="flex-1 flex overflow-hidden">
				<div className="py-4 flex-1 overflow-auto">
					<div className="w-full mx-auto h-full">
						{previewHtml && <EmailPreview html={previewHtml} height="100%" fullWidth />}
					</div>
				</div>

				<div
					className={cn(
						"border-l bg-background overflow-auto transition-all duration-300",
						sidebarOpen ? "w-80" : "w-0"
					)}
				>
					<div className={cn("h-full flex flex-col", !sidebarOpen && "hidden")}>
						<Card className="rounded-none">
							<CardHeader className="pb-3">
								<CardTitle className="text-base">{t.templateForm.details}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<TypographyMuted>{t.templates.columns.type}</TypographyMuted>
									<Badge className="mt-1">
										{t.templates.types[template.template as keyof typeof t.templates.types] ??
											template.template}
									</Badge>
								</div>
								<div>
									<TypographyMuted>{t.templates.columns.status}</TypographyMuted>
									<Badge variant={template.isActive ? "default" : "secondary"} className="mt-1">
										{template.isActive ? t.common.active : t.common.inactive}
									</Badge>
								</div>
								<div>
									<TypographyMuted>{t.templates.columns.created}</TypographyMuted>
									<TypographyLabel className="mt-1">
										{formatDateTime(template.createdAt, locale)}
									</TypographyLabel>
								</div>
								<div>
									<TypographyMuted>{t.templates.columns.updated}</TypographyMuted>
									<TypographyLabel className="mt-1">
										{formatDateTime(template.updatedAt, locale)}
									</TypographyLabel>
								</div>
							</CardContent>
						</Card>

						<Card className="rounded-none flex-1">
							<CardHeader className="pb-3">
								<CardTitle className="text-base">{t.templateForm.templateProps}</CardTitle>
							</CardHeader>
							<CardContent>
								<pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-50">
									{JSON.stringify(template.props, null, 2)}
								</pre>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
