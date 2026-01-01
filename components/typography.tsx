import Link from "next/link";
import { cn } from "@/lib/utils";

interface ITypography {
	children: React.ReactNode;
	className?: string;
}

interface ITypographyLink extends ITypography {
	href: string;
	external?: boolean;
}

export function TypographyH1({ children, className }: ITypography) {
	return (
		<h1
			className={cn(
				"scroll-m-20 text-4xl font-extrabold tracking-tight text-foreground",
				className
			)}
		>
			{children}
		</h1>
	);
}

export function TypographyH2({ children, className }: ITypography) {
	return (
		<h2
			className={cn(
				"scroll-m-20 text-3xl font-semibold tracking-tight mt-8 mb-4 text-foreground",
				className
			)}
		>
			{children}
		</h2>
	);
}

export function TypographyH3({ children, className }: ITypography) {
	return (
		<h3
			className={cn(
				"scroll-m-20 text-2xl font-semibold tracking-tight mt-6 mb-3 text-foreground",
				className
			)}
		>
			{children}
		</h3>
	);
}

export function TypographyH4({ children, className }: ITypography) {
	return (
		<h4
			className={cn(
				"scroll-m-20 text-xl font-semibold tracking-tight mt-4 mb-2 text-foreground",
				className
			)}
		>
			{children}
		</h4>
	);
}

export function TypographyP({ children, className }: ITypography) {
	return <p className={cn("leading-7 mt-4 text-muted-foreground", className)}>{children}</p>;
}

export function TypographyLead({ children, className }: ITypography) {
	return <p className={cn("text-xl text-muted-foreground", className)}>{children}</p>;
}

export function TypographyLarge({ children, className }: ITypography) {
	return <div className={cn("text-lg font-semibold text-foreground", className)}>{children}</div>;
}

export function TypographySmall({ children, className }: ITypography) {
	return (
		<small className={cn("text-sm font-medium leading-none text-muted-foreground", className)}>
			{children}
		</small>
	);
}

export function TypographyMuted({ children, className }: ITypography) {
	return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function TypographyLink({ children, href, external, className }: ITypographyLink) {
	if (external) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={cn(
					"font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
					className
				)}
			>
				{children}
			</a>
		);
	}

	return (
		<Link
			href={href}
			className={cn(
				"font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
				className
			)}
		>
			{children}
		</Link>
	);
}

export function TypographyList({ children, className }: ITypography) {
	return (
		<ul className={cn("my-4 ml-6 list-disc [&>li]:mt-2 text-muted-foreground", className)}>
			{children}
		</ul>
	);
}

export function TypographyListItem({ children, className }: ITypography) {
	return <li className={cn("", className)}>{children}</li>;
}

export function TypographyBlockquote({ children, className }: ITypography) {
	return (
		<blockquote
			className={cn("mt-6 border-l-4 border-border pl-6 italic text-muted-foreground", className)}
		>
			{children}
		</blockquote>
	);
}

export function TypographyCode({ children, className }: ITypography) {
	return (
		<code
			className={cn(
				"relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
				className
			)}
		>
			{children}
		</code>
	);
}

export function TypographyInlineCode({ children, className }: ITypography) {
	return (
		<code
			className={cn(
				"relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
				className
			)}
		>
			{children}
		</code>
	);
}

export function TypographyArticle({ children, className }: ITypography) {
	return <article className={cn("max-w-3xl mx-auto", className)}>{children}</article>;
}
