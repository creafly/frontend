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
import { Icon, TypographyMuted, TypographyLabel } from "@/components/typography";

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
							<TypographyLabel>
								{user?.firstName} {user?.lastName}
							</TypographyLabel>
							<TypographyMuted className="text-xs">{user?.email}</TypographyMuted>
						</div>
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
						<Icon icon={IconUser} size="sm" className="mr-2" />
						{t.profile.title}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={logout} className="text-destructive">
						<Icon icon={IconLogout} size="sm" className="mr-2" />
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
								<Icon icon={IconUser} size="sm" />
							</TabsTrigger>
							<TabsTrigger value="security" title={t.profile.changePassword}>
								<Icon icon={IconLock} size="sm" />
							</TabsTrigger>
							<TabsTrigger value="2fa" title={t.twoFactor.title}>
								<Icon icon={IconShieldLock} size="sm" />
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
