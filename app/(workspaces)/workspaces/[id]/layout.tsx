"use client";

import { useSyncExternalStore, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarInset,
	SidebarFooter,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { useTenantPermissions } from "@/providers/tenant-permissions-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
	IconMessage,
	IconTemplate,
	IconChevronDown,
	IconSettings,
	IconCreditCard,
	IconPalette,
	IconCloud,
	IconHeadset,
} from "@tabler/icons-react";
import { Icon } from "@/components/typography";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar, TenantAvatar, UserMenu, NotificationsDropdown } from "@/components/shared";
import { useResolveTenantSlug, useTenant } from "@/hooks/use-api";

const emptySubscribe = () => () => {};

interface WorkspaceData {
	id: string;
	name: string;
	slug: string;
}

export default function WorkspaceDashboardLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const slugOrId = params.id as string;
	const pathname = usePathname();
	const router = useRouter();
	const t = useTranslations();
	const { user } = useAuth();
	const { setTenant } = useTenantPermissions();
	const mounted = useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false
	);

	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

	const prevTenantIdRef = useRef<string | null>(null);

	const {
		data: resolvedTenant,
		isLoading: isResolving,
		error: resolveError,
	} = useResolveTenantSlug(isUUID ? undefined : slugOrId);

	const {
		data: tenantData,
		isLoading: isTenantLoading,
		error: tenantError,
	} = useTenant(isUUID ? slugOrId : resolvedTenant?.id);

	const workspace: WorkspaceData | null = useMemo(() => {
		const tenant = tenantData?.tenant;
		if (!tenant) return null;
		return {
			id: tenant.id,
			name: tenant.name,
			slug: tenant.slug,
		};
	}, [tenantData?.tenant]);

	const isLoading = isResolving || isTenantLoading || !workspace;

	useEffect(() => {
		if (mounted && (resolveError || tenantError)) {
			router.replace("/workspaces");
		}
	}, [mounted, resolveError, tenantError, router]);

	useEffect(() => {
		if (!mounted || !workspace) return;
		if (prevTenantIdRef.current === workspace.id) return;

		prevTenantIdRef.current = workspace.id;
		setTenant(workspace.id);
	}, [mounted, workspace, setTenant]);

	const handleSwitchWorkspace = () => {
		router.push("/workspaces");
	};

	const basePath = `/workspaces/${slugOrId}`;

	const navigation = [
		{
			title: t.nav.chat,
			href: `${basePath}/chat`,
			icon: IconMessage,
		},
		{
			title: t.nav.templates,
			href: `${basePath}/templates`,
			icon: IconTemplate,
		},
	];

	const workspaceNavigation = [
		{
			title: t.nav.branding,
			href: `${basePath}/branding`,
			icon: IconPalette,
		},
		{
			title: t.nav.storage,
			href: `${basePath}/storage`,
			icon: IconCloud,
		},
		{
			title: t.nav.support,
			href: `${basePath}/support`,
			icon: IconHeadset,
		},
		{
			title: t.nav.settings,
			href: `${basePath}/settings`,
			icon: IconSettings,
		},
		{
			title: t.nav.subscription,
			href: `${basePath}/subscription`,
			icon: IconCreditCard,
		},
	];

	if (!mounted || isLoading || isResolving || isTenantLoading) {
		return (
			<div className="flex min-h-screen">
				<div className="w-64 border-r bg-sidebar" />
				<div className="flex-1">
					<header className="flex h-14 items-center gap-4 border-b bg-background px-4" />
					<main className="flex-1 overflow-auto p-6">{children}</main>
				</div>
			</div>
		);
	}

	return (
		<ProtectedRoute>
			<SidebarProvider defaultOpen={false}>
				<Sidebar variant="sidebar" collapsible="icon">
					<SidebarHeader>
						<SidebarMenu>
							<SidebarMenuItem>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
											<TenantAvatar
												tenant={workspace ? { name: workspace.name } : null}
												size="default"
											/>
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold">
													{workspace?.name || t.workspaces.selectWorkspace}
												</span>
												<span className="truncate text-xs text-muted-foreground">
													/{workspace?.slug}
												</span>
											</div>
											<Icon icon={IconChevronDown} size="sm" className="ml-auto" />
										</SidebarMenuButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
										align="start"
										sideOffset={4}
									>
										<DropdownMenuLabel>{t.workspaces.currentWorkspace}</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={handleSwitchWorkspace}>
											<TenantAvatar tenant={null} size="sm" className="mr-2" />
											{t.workspaces.switchWorkspace}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup className="pb-0">
							<SidebarGroupContent>
								<SidebarMenu className="gap-2">
									{navigation.map((item) => (
										<SidebarMenuItem key={item.href}>
											<Link href={item.href}>
												<SidebarMenuButton
													isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
													tooltip={item.title}
												>
													<Icon icon={item.icon} size="sm" />
													<span>{item.title}</span>
												</SidebarMenuButton>
											</Link>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
						<SidebarGroup>
							<SidebarGroupContent>
								<SidebarMenu className="gap-2">
									{workspaceNavigation.map((item) => (
										<SidebarMenuItem key={item.href}>
											<Link href={item.href}>
												<SidebarMenuButton
													isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
													tooltip={item.title}
												>
													<Icon icon={item.icon} size="sm" />
													<span>{item.title}</span>
												</SidebarMenuButton>
											</Link>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter>
						<SidebarMenu className="gap-2">
							<div className="hidden md:block">
								<SidebarMenuItem>
									<ThemeToggle />
								</SidebarMenuItem>
								<SidebarMenuItem>
									<LanguageSwitcher />
								</SidebarMenuItem>
								<SidebarMenuItem className="flex justify-center">
									<NotificationsDropdown />
								</SidebarMenuItem>
							</div>
							<SidebarMenuItem>
								<UserMenu
									trigger={
										<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
											<UserAvatar user={user} size="default" />
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold">
													{user?.firstName} {user?.lastName}
												</span>
												<span className="truncate text-xs text-muted-foreground">
													{user?.email}
												</span>
											</div>
										</SidebarMenuButton>
									}
								/>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
				</Sidebar>
				<SidebarInset>
					<header className="flex md:hidden h-14 items-center gap-2 border-b bg-background px-4">
						<SidebarTrigger />
						<div className="flex-1 flex items-center gap-2">
							<TenantAvatar tenant={workspace ? { name: workspace.name } : null} size="sm" />
							<span className="font-semibold text-sm truncate">{workspace?.name}</span>
						</div>
						<ThemeToggle />
						<LanguageSwitcher />
						<NotificationsDropdown />
					</header>
					<main className="flex-1 w-full h-full overflow-hidden">{children}</main>
				</SidebarInset>
			</SidebarProvider>
		</ProtectedRoute>
	);
}
