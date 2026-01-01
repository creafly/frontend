"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { TypographyH2 } from "@/components/typography";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const t = useTranslations();
	const { hasAnyPermission, isLoading } = usePermissions();

	const hasAdminAccess = hasAnyPermission(
		PERMISSIONS.ROLES_VIEW,
		PERMISSIONS.ROLES_MANAGE,
		PERMISSIONS.CLAIMS_VIEW,
		PERMISSIONS.CLAIMS_MANAGE,
		PERMISSIONS.USERS_VIEW,
		PERMISSIONS.USERS_MANAGE,
		PERMISSIONS.SUPPORT_VIEW,
		PERMISSIONS.SUPPORT_MANAGE
	);

	useEffect(() => {
		if (!isLoading && !hasAdminAccess) {
			router.replace("/workspaces");
		}
	}, [isLoading, hasAdminAccess, router]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!hasAdminAccess) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<div className="text-center">
					<h2 className="text-lg font-semibold">{t.common.accessDenied}</h2>
					<p className="text-muted-foreground">{t.common.noPermission}</p>
				</div>
			</div>
		);
	}

	const adminNavigation = [
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
			title: t.admin.supportTickets,
			href: "/admin/support",
			icon: IconTicket,
		},
	];

	return (
		<div className="min-h-screen bg-background overflow-x-hidden">
			<Container className="pb-12">
				<div className="flex items-center gap-4 mb-6">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/workspaces">
							<IconArrowLeft className="size-4" />
						</Link>
					</Button>
					<TypographyH2 className="mt-0 mb-0">{t.admin.title}</TypographyH2>
				</div>

				<div className="flex flex-wrap gap-2 sm:gap-4 mb-2 border-b pb-4">
					{adminNavigation.map((item) => (
						<Link key={item.href} href={item.href}>
							<Button variant="ghost" className="gap-2">
								<item.icon className="size-4" />
								<span className="hidden sm:inline">{item.title}</span>
							</Button>
						</Link>
					))}
				</div>

				<div className="overflow-x-auto">{children}</div>
			</Container>
		</div>
	);
}
