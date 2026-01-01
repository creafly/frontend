"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
	user?: {
		firstName?: string;
		lastName?: string;
		email?: string;
		avatarUrl?: string;
	} | null;
	size?: "sm" | "default" | "lg";
	className?: string;
	showStatus?: boolean;
	isOnline?: boolean;
}

function getInitials(user: UserAvatarProps["user"]): string {
	if (!user) return "?";

	const first = user.firstName?.[0] || "";
	const last = user.lastName?.[0] || "";

	if (first || last) {
		return (first + last).toUpperCase();
	}

	return user.email?.[0]?.toUpperCase() || "?";
}

export function UserAvatar({
	user,
	size = "default",
	className,
	showStatus = false,
	isOnline = false,
}: UserAvatarProps) {
	const initials = getInitials(user);

	return (
		<Avatar size={size} className={cn("relative", className)}>
			{user?.avatarUrl && (
				<AvatarImage src={user.avatarUrl} alt={`${user.firstName || ""} ${user.lastName || ""}`} />
			)}
			<AvatarFallback>{initials}</AvatarFallback>
			{showStatus && (
				<span
					className={cn(
						"absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
						size === "sm" && "h-2 w-2",
						size === "default" && "h-2.5 w-2.5",
						size === "lg" && "h-3 w-3",
						isOnline ? "bg-green-500" : "bg-gray-400"
					)}
				/>
			)}
		</Avatar>
	);
}
