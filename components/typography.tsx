import Link from "next/link";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ComponentType, type SVGProps } from "react";

interface ITypography extends React.HTMLAttributes<HTMLElement> {
	children: React.ReactNode;
	className?: string;
}

type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface IIcon {
	icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
	size?: IconSize;
	className?: string;
}

const iconSizes: Record<IconSize, { class: string; px: number }> = {
	xs: { class: "size-3", px: 12 },
	sm: { class: "size-4", px: 16 },
	md: { class: "size-5", px: 20 },
	lg: { class: "size-6", px: 24 },
	xl: { class: "size-8", px: 32 },
	"2xl": { class: "size-10", px: 40 },
};

export const Icon = forwardRef<SVGSVGElement, IIcon>(
	({ icon: IconComponent, size = "sm", className }, ref) => {
		const sizeConfig = iconSizes[size];
		return (
			<IconComponent
				ref={ref}
				size={sizeConfig.px}
				className={cn(sizeConfig.class, "shrink-0", className)}
			/>
		);
	}
);

Icon.displayName = "Icon";

interface ITypographyLink extends ITypography {
	href: string;
	external?: boolean;
}

const h1Variants = cva("scroll-m-20 font-extrabold tracking-tight text-foreground", {
	variants: {
		size: {
			default: "text-4xl",
			lg: "text-5xl md:text-6xl lg:text-7xl",
			md: "text-3xl",
			sm: "text-2xl",
			xs: "text-xl",
		},
		margin: {
			default: "",
			none: "",
			top: "mt-4",
		},
	},
	defaultVariants: {
		size: "default",
		margin: "none",
	},
});

interface ITypographyH1 extends ITypography, VariantProps<typeof h1Variants> {}

export function TypographyH1({ children, className, size, margin }: ITypographyH1) {
	return (
		<h1 className={cn(h1Variants({ size, margin }), className)}>
			{children}
		</h1>
	);
}

const h2Variants = cva("scroll-m-20 font-semibold tracking-tight text-foreground", {
	variants: {
		size: {
			default: "text-3xl",
			lg: "text-4xl",
			sm: "text-2xl",
			xs: "text-xl",
		},
		margin: {
			default: "mt-10 mb-4",
			none: "",
			top: "mt-10",
		},
	},
	defaultVariants: {
		size: "default",
		margin: "none",
	},
});

interface ITypographyH2 extends ITypography, VariantProps<typeof h2Variants> {}

export function TypographyH2({ children, className, size, margin }: ITypographyH2) {
	return (
		<h2 className={cn(h2Variants({ size, margin }), className)}>
			{children}
		</h2>
	);
}

const h3Variants = cva("scroll-m-20 font-semibold tracking-tight text-foreground", {
	variants: {
		size: {
			default: "text-2xl",
			lg: "text-3xl",
			sm: "text-xl",
			xs: "text-lg",
			"2xs": "text-sm",
		},
		margin: {
			default: "mt-2",
			none: "",
		},
	},
	defaultVariants: {
		size: "default",
		margin: "none",
	},
});

interface ITypographyH3 extends ITypography, VariantProps<typeof h3Variants> {}

export function TypographyH3({ children, className, size, margin }: ITypographyH3) {
	return (
		<h3 className={cn(h3Variants({ size, margin }), className)}>
			{children}
		</h3>
	);
}

const h4Variants = cva("scroll-m-20 font-semibold tracking-tight text-foreground", {
	variants: {
		size: {
			default: "text-xl",
			lg: "text-2xl",
			md: "text-lg",
			sm: "text-base",
			xs: "text-sm",
			"2xs": "text-xs",
		},
		margin: {
			default: "mt-2",
			none: "",
		},
	},
	defaultVariants: {
		size: "default",
		margin: "none",
	},
});

interface ITypographyH4 extends ITypography, VariantProps<typeof h4Variants> {}

export function TypographyH4({ children, className, size, margin }: ITypographyH4) {
	return (
		<h4 className={cn(h4Variants({ size, margin }), className)}>
			{children}
		</h4>
	);
}

export function TypographyP({ children, className, ...props }: ITypography) {
	return <p className={cn("leading-7 mt-1 text-muted-foreground", className)} {...props}>{children}</p>;
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

export function TypographyMuted({ children, className, ...props }: ITypography) {
	return <p className={cn("text-sm text-muted-foreground", className)} {...props}>{children}</p>;
}

export function TypographyError({ children, className }: ITypography) {
	return <p className={cn("text-sm text-destructive", className)}>{children}</p>;
}

export function TypographyLabel({ children, className }: ITypography) {
	return <span className={cn("text-sm font-medium", className)}>{children}</span>;
}

export function TypographyStats({ children, className }: ITypography) {
	return <p className={cn("text-2xl font-bold", className)}>{children}</p>;
}

export function TypographySuccess({ children, className }: ITypography) {
	return (
		<p className={cn("text-sm text-success", className)}>{children}</p>
	);
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
