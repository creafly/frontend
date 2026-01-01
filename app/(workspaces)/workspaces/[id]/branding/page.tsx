"use client";

import { use } from "react";
import Link from "next/link";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useResolveTenantSlug, useTenant } from "@/hooks/use-api";
import { useBranding } from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ColorsSection } from "./_components/colors-section";
import { FontsSection } from "./_components/fonts-section";
import { SpacingsSection } from "./_components/spacings-section";
import { RadiiSection } from "./_components/radii-section";
import { LogosSection } from "./_components/logos-section";

export default function BrandingPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const t = useTranslations();

	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

	const { data: resolvedTenant, isLoading: isResolving } = useResolveTenantSlug(
		isUUID ? undefined : id
	);

	const resolvedTenantId = isUUID ? id : resolvedTenant?.id;

	const { data: tenantData, isLoading: isTenantLoading } = useTenant(resolvedTenantId);
	const { data: branding, isLoading: isBrandingLoading } = useBranding(resolvedTenantId || "");

	const tenant = tenantData?.tenant;
	const isLoading = isResolving || isTenantLoading || isBrandingLoading;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full min-h-96">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!tenant) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-96">
				<p className="text-muted-foreground mb-4">
					{t.workspaces?.workspaceNotFound || "Workspace not found"}
				</p>
				<Link href="/workspaces">
					<Button variant="outline">
						<IconArrowLeft className="mr-2 h-4 w-4" />
						{t.workspaces?.backToWorkspaces || "Back to Workspaces"}
					</Button>
				</Link>
			</div>
		);
	}

	if (!branding) {
		return (
			<div className="flex items-center justify-center h-full min-h-96">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="w-full py-8 px-4">
			<div className="flex items-center gap-4 mb-8">
				<div>
					<h1 className="text-2xl font-bold">{t.branding?.title || "Branding"}</h1>
					<p className="text-muted-foreground">
						{tenant.name} — {t.branding?.subtitle || "Manage your brand identity"}
					</p>
				</div>
			</div>

			<Tabs defaultValue="logos" className="space-y-6">
				<TabsList>
					<TabsTrigger value="logos">{t.branding?.logos || "Logos"}</TabsTrigger>
					<TabsTrigger value="colors">{t.branding?.colors || "Colors"}</TabsTrigger>
					<TabsTrigger value="fonts">{t.branding?.fonts || "Fonts"}</TabsTrigger>
					<TabsTrigger value="spacings">{t.branding?.spacings || "Spacings"}</TabsTrigger>
					<TabsTrigger value="radii">{t.branding?.radii || "Border Radii"}</TabsTrigger>
				</TabsList>

				<TabsContent value="logos">
					<LogosSection tenantId={resolvedTenantId!} logos={branding.logos || []} />
				</TabsContent>

				<TabsContent value="colors">
					<ColorsSection
						tenantId={resolvedTenantId!}
						colors={branding.colors || []}
					/>
				</TabsContent>

				<TabsContent value="fonts">
					<FontsSection tenantId={resolvedTenantId!} fonts={branding.fonts || []} />
				</TabsContent>

				<TabsContent value="spacings">
					<SpacingsSection
						tenantId={resolvedTenantId!}
						spacings={branding.spacings || []}
					/>
				</TabsContent>

				<TabsContent value="radii">
					<RadiiSection tenantId={resolvedTenantId!} radii={branding.radii || []} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
