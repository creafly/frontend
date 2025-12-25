"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
	UserMenu,
	NotificationsDropdown,
	PushNotificationToastProvider,
} from "@/components/shared";
import { usePermissions, PERMISSIONS } from "@/providers/permissions-provider";
import { Button } from "@/components/ui/button";
import { IconShield } from "@tabler/icons-react";
import { Icon } from "@/components/typography";

export function WorkspacesLayoutWrapper({ children }: { children: React.ReactNode }) {
	const { hasAnyPermission } = usePermissions();
	const pathname = usePathname();

	const hasAdminAccess = hasAnyPermission(
		PERMISSIONS.ROLES_VIEW,
		PERMISSIONS.ROLES_MANAGE,
		PERMISSIONS.CLAIMS_VIEW,
		PERMISSIONS.CLAIMS_MANAGE,
		PERMISSIONS.USERS_VIEW,
		PERMISSIONS.USERS_MANAGE
	);

	const isInsideWorkspace = pathname ? /^\/workspaces\/[^/]+\/.+/.test(pathname) : false;

	if (isInsideWorkspace) {
		return <ProtectedRoute>{children}</ProtectedRoute>;
	}

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-background">
				<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
					<div className="flex h-14 items-center justify-between px-6">
						<Link
							href="/workspaces"
							className="flex items-center gap-1 md:gap-2 hover:opacity-70 transition-opacity"
						>
							<Image src="/logo.svg" alt="Creafly" width={28} height={28} />
							<span className="hidden md:block font-semibold text-sm">Creafly AI</span>
						</Link>
						<div className="flex items-center gap-1 md:gap-2">
							{hasAdminAccess && (
								<Button variant="ghost" size="icon" className="size-9" asChild>
									<Link href="/admin/roles">
										<Icon icon={IconShield} size="sm" />
									</Link>
								</Button>
							)}
							<NotificationsDropdown />
							<ThemeToggle />
							<LanguageSwitcher />
							<UserMenu />
						</div>
					</div>
				</header>

				<main>{children}</main>
				<PushNotificationToastProvider />
			</div>
		</ProtectedRoute>
	);
}
