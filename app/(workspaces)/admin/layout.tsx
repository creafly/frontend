"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { usePermissions, PERMISSIONS } from "@/providers/permissions-provider";
import { useTranslations } from "@/providers/i18n-provider";
import {
	IconLoader,
	IconShield,
	IconKey,
	IconUsers,
	IconArrowLeft,
	IconTicket,
	IconChartBar,
	IconBuilding,
	IconBell,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { TypographyH2, TypographyMuted, Icon } from "@/components/typography";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const { hasAnyPermission, isLoading } = usePermissions();

	const hasAdminAccess = hasAnyPermission(
		PERMISSIONS.ROLES_VIEW,
		PERMISSIONS.ROLES_MANAGE,
		PERMISSIONS.CLAIMS_VIEW,
		PERMISSIONS.CLAIMS_MANAGE,
		PERMISSIONS.USERS_VIEW,
		PERMISSIONS.USERS_MANAGE,
		PERMISSIONS.TENANTS_VIEW,
		PERMISSIONS.TENANTS_MANAGE,
		PERMISSIONS.SUPPORT_VIEW,
		PERMISSIONS.SUPPORT_MANAGE,
		PERMISSIONS.PUSH_VIEW,
		PERMISSIONS.PUSH_MANAGE
	);

	useEffect(() => {
		if (!isLoading && !hasAdminAccess) {
			router.replace("/workspaces");
		}
	}, [isLoading, hasAdminAccess, router]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Icon icon={IconLoader} size="xl" className="animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!hasAdminAccess) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<div className="text-center">
					<TypographyH2 size="xs">{t.common.accessDenied}</TypographyH2>
					<TypographyMuted>{t.common.noPermission}</TypographyMuted>
				</div>
			</div>
		);
	}

	const adminNavigation = [
		{
			title: t.admin.dashboard,
			href: "/admin/dashboard",
			icon: IconChartBar,
		},
		{
			title: t.admin.roles,
			href: "/admin/roles",
			icon: IconShield,
		},
		{
			title: t.admin.claims,
			href: "/admin/claims",
			icon: IconKey,
		},
		{
			title: t.admin.users,
			href: "/admin/users",
			icon: IconUsers,
		},
		{
			title: t.admin.tenants,
			href: "/admin/tenants",
			icon: IconBuilding,
		},
		{
			title: t.admin.supportTickets,
			href: "/admin/support",
			icon: IconTicket,
		},
		{
			title: t.admin.push.title,
			href: "/admin/push",
			icon: IconBell,
		},
	];

	return (
		<div className="min-h-screen bg-background overflow-x-hidden">
			<Container className="pb-12 h-full max-w-full">
				<div className="flex flex-wrap items-center gap-4 mb-6">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/workspaces">
							<Icon icon={IconArrowLeft} size="sm" />
						</Link>
					</Button>
					<TypographyH2 className="mt-0 mb-0">{t.admin.title}</TypographyH2>
				</div>

				<div className="flex flex-wrap gap-2 sm:gap-4 mb-2 border-b pb-4">
					{adminNavigation.map((item) => {
						const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
						return (
							<Link key={item.href} href={item.href}>
								<Button variant={isActive ? "secondary" : "ghost"} className="gap-2">
									<Icon icon={item.icon} size="sm" />
									<span className="hidden sm:inline">{item.title}</span>
								</Button>
							</Link>
						);
					})}
				</div>

				<div className="mt-6 overflow-x-auto">{children}</div>
			</Container>
		</div>
	);
}
