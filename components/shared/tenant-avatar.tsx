"use client";

import Image from "next/image";
import { IconBuilding } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface TenantAvatarProps {
	tenant?: {
		name?: string;
		logoUrl?: string;
	} | null;
	size?: "sm" | "default" | "lg";
	className?: string;
	showStatus?: boolean;
	isActive?: boolean;
}

function getInitials(name?: string): string {
	if (!name) return "?";

	const words = name.trim().split(/\s+/);
	if (words.length === 1) {
		return words[0].slice(0, 2).toUpperCase();
	}

	return (words[0][0] + words[1][0]).toUpperCase();
}

const sizeClasses = {
	sm: "h-6 w-6",
	default: "h-8 w-8",
	lg: "h-10 w-10",
};

const iconSizeClasses = {
	sm: "h-3 w-3",
	default: "h-4 w-4",
	lg: "h-5 w-5",
};

const textSizeClasses = {
	sm: "text-xs",
	default: "text-sm",
	lg: "text-base",
};

const imageSizes = {
	sm: 24,
	default: 32,
	lg: 40,
};

export function TenantAvatar({
	tenant,
	size = "default",
	className,
	showStatus = false,
	isActive = true,
}: TenantAvatarProps) {
	const initials = getInitials(tenant?.name);
	const imageSize = imageSizes[size];

	if (tenant?.logoUrl) {
		return (
			<div className={cn("relative", className)}>
				<Image
					src={tenant.logoUrl}
					alt={tenant.name || "Tenant"}
					width={imageSize}
					height={imageSize}
					className={cn("rounded-lg object-cover", sizeClasses[size])}
				/>
				{showStatus && (
					<span
						className={cn(
							"absolute -top-0.5 -right-0.5 block rounded-full ring-2 ring-background",
							size === "sm" && "h-2 w-2",
							size === "default" && "h-2.5 w-2.5",
							size === "lg" && "h-3 w-3",
						isActive ? "bg-success" : "bg-muted-foreground"
						)}
					/>
				)}
			</div>
		);
	}

	return (
		<div className={cn("relative", className)}>
			<div
				className={cn(
					"flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium",
					sizeClasses[size],
					textSizeClasses[size]
				)}
			>
				{tenant?.name ? initials : <IconBuilding className={iconSizeClasses[size]} />}
			</div>
			{showStatus && (
				<span
					className={cn(
						"absolute -top-0.5 -right-0.5 block rounded-full ring-2 ring-background",
						size === "sm" && "h-2 w-2",
						size === "default" && "h-2.5 w-2.5",
						size === "lg" && "h-3 w-3",
						isActive ? "bg-success" : "bg-muted-foreground"
					)}
				/>
			)}
		</div>
	);
}
