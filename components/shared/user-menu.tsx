"use client";

import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconUser, IconLogout, IconLock, IconShieldLock } from "@tabler/icons-react";
import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "@/providers/i18n-provider";
import { UserAvatar } from "@/components/shared";
import { ProfileInfoForm, ChangePasswordForm, TwoFactorSettings } from "@/components/profile";

interface UserMenuProps {
	trigger?: React.ReactNode;
	align?: "start" | "center" | "end";
}

export function UserMenu({ trigger, align = "end" }: UserMenuProps) {
	const { user, logout } = useAuth();
	const t = useTranslations();
	const [isProfileOpen, setIsProfileOpen] = useState(false);

	const defaultTrigger = (
		<button className="flex items-center gap-2 rounded-full p-1 hover:bg-accent">
			<UserAvatar user={user} size="default" />
		</button>
	);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>{trigger || defaultTrigger}</DropdownMenuTrigger>
				<DropdownMenuContent align={align} className="w-56">
					<div className="flex items-center gap-3 px-2 py-1.5">
						<UserAvatar user={user} size="default" />
						<div>
							<p className="text-sm font-medium">
								{user?.firstName} {user?.lastName}
							</p>
							<p className="text-xs text-muted-foreground">{user?.email}</p>
						</div>
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
						<IconUser className="mr-2 h-4 w-4" />
						{t.profile.title}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={logout} className="text-destructive">
						<IconLogout className="mr-2 h-4 w-4" />
						{t.auth.logout}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
				<SheetContent className="sm:max-w-lg overflow-y-auto px-4">
					<SheetHeader>
						<SheetTitle>{t.profile.title}</SheetTitle>
					</SheetHeader>
					<Tabs defaultValue="info" className="mt-6">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="info" title={t.profile.personalInfo}>
								<IconUser className="size-4" />
							</TabsTrigger>
							<TabsTrigger value="security" title={t.profile.changePassword}>
								<IconLock className="size-4" />
							</TabsTrigger>
							<TabsTrigger value="2fa" title={t.twoFactor.title}>
								<IconShieldLock className="size-4" />
							</TabsTrigger>
						</TabsList>
						<TabsContent value="info" className="mt-4">
							<ProfileInfoForm />
						</TabsContent>
						<TabsContent value="security" className="mt-4">
							<ChangePasswordForm />
						</TabsContent>
						<TabsContent value="2fa" className="mt-4">
							<TwoFactorSettings />
						</TabsContent>
					</Tabs>
				</SheetContent>
			</Sheet>
		</>
	);
}
