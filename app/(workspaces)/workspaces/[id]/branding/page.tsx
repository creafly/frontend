"use client";

import { use } from "react";
import Link from "next/link";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { Icon, TypographyH1, TypographyMuted } from "@/components/typography";
import { useResolveTenantSlug, useTenant } from "@/hooks/use-api";
import { useTabsWithUrl } from "@/hooks/use-tabs-with-url";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ColorsSection } from "./_components/colors-section";
import { FontsSection } from "./_components/fonts-section";
import { SpacingsSection } from "./_components/spacings-section";
import { RadiiSection } from "./_components/radii-section";
import { LogosSection } from "./_components/logos-section";
import { AutoFillSection } from "./_components/auto-fill-section";
import Container from "@/components/container";

export default function BrandingPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const t = useTranslations();
	const { tabsProps } = useTabsWithUrl({ defaultTab: "logos" });

	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

	const { data: resolvedTenant, isLoading: isResolving } = useResolveTenantSlug(
		isUUID ? undefined : id
	);

	const resolvedTenantId = isUUID ? id : resolvedTenant?.id;

	const { data: tenantData, isLoading: isTenantLoading } = useTenant(resolvedTenantId);

	const tenant = tenantData?.tenant;
	const isLoading = isResolving || isTenantLoading;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full min-h-96">
				<Icon icon={IconLoader2} size="xl" className="animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!tenant) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-96">
				<TypographyMuted className="mb-4">{t.workspaces.workspaceNotFound}</TypographyMuted>
				<Link href="/workspaces">
					<Button variant="outline">
						<Icon icon={IconArrowLeft} className="mr-2" />
						{t.workspaces.backToWorkspaces}
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<Container className="max-w-full">
			<div className="flex items-center gap-4 mb-8">
				<div>
					<TypographyH1 size="sm">{t.branding.title}</TypographyH1>
					<TypographyMuted>
						{tenant.name} - {t.branding.subtitle}
					</TypographyMuted>
				</div>
			</div>

			<div className="mb-6">
				<AutoFillSection tenantId={resolvedTenantId!} />
			</div>

			<Tabs {...tabsProps} className="space-y-2">
				<TabsList>
					<TabsTrigger value="logos">{t.branding.logos}</TabsTrigger>
					<TabsTrigger value="colors">{t.branding.colors}</TabsTrigger>
					<TabsTrigger value="fonts">{t.branding.fonts}</TabsTrigger>
					<TabsTrigger value="spacings">{t.branding.spacings}</TabsTrigger>
					<TabsTrigger value="radii">{t.branding.radii}</TabsTrigger>
				</TabsList>

				<TabsContent value="logos">
					<LogosSection tenantId={resolvedTenantId!} />
				</TabsContent>

				<TabsContent value="colors">
					<ColorsSection tenantId={resolvedTenantId!} />
				</TabsContent>

				<TabsContent value="fonts">
					<FontsSection tenantId={resolvedTenantId!} />
				</TabsContent>

				<TabsContent value="spacings">
					<SpacingsSection tenantId={resolvedTenantId!} />
				</TabsContent>

				<TabsContent value="radii">
					<RadiiSection tenantId={resolvedTenantId!} />
				</TabsContent>
			</Tabs>
		</Container>
	);
}
