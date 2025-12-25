"use client";

import { useState, useCallback, createContext, useContext, useEffect, type ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { IconBan } from "@tabler/icons-react";
import { Icon, TypographyP } from "@/components/typography";

interface BlockedUserInfo {
	isBlocked: boolean;
	blockReason?: string;
}

interface BlockedUserContextType {
	setBlocked: (info: BlockedUserInfo) => void;
}

const BlockedUserContext = createContext<BlockedUserContextType | null>(null);

export function useBlockedUser() {
	const context = useContext(BlockedUserContext);
	if (!context) {
		throw new Error("useBlockedUser must be used within BlockedUserProvider");
	}
	return context;
}

export function BlockedUserProvider({ children }: { children: ReactNode }) {
	const t = useTranslations();
	const { logout } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [blockedInfo, setBlockedInfo] = useState<BlockedUserInfo | null>(null);

	const setBlocked = useCallback((info: BlockedUserInfo) => {
		if (info.isBlocked) {
			setBlockedInfo(info);
			setIsOpen(true);
		}
	}, []);

	const handleSignOut = () => {
		setIsOpen(false);
		setBlockedInfo(null);
		logout();
	};

	useEffect(() => {
		const handleApiError = (
			event: CustomEvent<{ code?: string; isBlocked?: boolean; blockReason?: string }>
		) => {
			const { code, isBlocked, blockReason } = event.detail;
			if (code === "USER_BLOCKED" && isBlocked) {
				setBlocked({ isBlocked: true, blockReason });
			}
		};

		window.addEventListener("api-error" as string, handleApiError as EventListener);
		return () => {
			window.removeEventListener("api-error" as string, handleApiError as EventListener);
		};
	}, [setBlocked]);

	return (
		<BlockedUserContext.Provider value={{ setBlocked }}>
			{children}
			<Dialog open={isOpen} onOpenChange={() => {}}>
				<DialogContent
					className="max-w-md"
					onPointerDownOutside={(e) => e.preventDefault()}
					onEscapeKeyDown={(e) => e.preventDefault()}
				>
					<DialogHeader>
						<div className="flex flex-col items-center gap-3">
							<div className="w-full flex items-center gap-2">
								<div className="flex size-6 items-center justify-center rounded-full bg-destructive/10">
									<Icon icon={IconBan} size="sm" className="text-destructive" />
								</div>
								<DialogTitle className="text-xl">{t.auth.accountBlocked.title}</DialogTitle>
							</div>
							<DialogDescription className="mt-1">
								{t.auth.accountBlocked.description}
							</DialogDescription>
						</div>
					</DialogHeader>

					{blockedInfo?.blockReason && (
						<div className="rounded-lg bg-muted p-4">
							<div className="text-sm font-medium text-muted-foreground mb-1">
								{t.auth.accountBlocked.reason}
							</div>
							<div className="text-sm">{blockedInfo.blockReason}</div>
						</div>
					)}

					<TypographyP>{t.auth.accountBlocked.contactSupport}</TypographyP>

					<DialogFooter>
						<Button onClick={handleSignOut} variant="destructive" className="w-full">
							{t.auth.accountBlocked.signOut}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</BlockedUserContext.Provider>
	);
}
