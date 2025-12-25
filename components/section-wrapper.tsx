"use client";

import { cn } from "@/lib/utils";
import Container from "./container";
import { TypographyH2, TypographyMuted } from "./typography";

interface SectionWrapperProps {
	children: React.ReactNode;
	className?: string;
	containerClassName?: string;
	id?: string;
	as?: "section" | "div";
}

export function SectionWrapper({
	children,
	className,
	containerClassName,
	id,
	as: Component = "section",
}: SectionWrapperProps) {
	return (
		<Component id={id} className={cn("py-16 md:py-24", className)}>
			<Container className={containerClassName}>{children}</Container>
		</Component>
	);
}

interface SectionHeaderProps {
	title: string;
	subtitle?: string;
	className?: string;
	align?: "left" | "center" | "right";
}

export function SectionHeader({
	title,
	subtitle,
	className,
	align = "center",
}: SectionHeaderProps) {
	const alignClass = {
		left: "text-left",
		center: "text-center",
		right: "text-right",
	}[align];

	return (
		<div className={cn("mb-12", alignClass, className)}>
			<TypographyH2 className={cn("mb-4 sm:text-4xl", alignClass)}>{title}</TypographyH2>
			{subtitle && (
				<TypographyMuted
					className={cn("text-lg max-w-2xl", alignClass, align === "center" && "mx-auto")}
				>
					{subtitle}
				</TypographyMuted>
			)}
		</div>
	);
}
