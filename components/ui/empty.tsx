import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const emptyVariants = cva(
	"gap-4 rounded-lg p-6 flex w-full min-w-0 flex-col items-center justify-center text-center text-balance",
	{
		variants: {
			variant: {
				default: "border border-dashed",
				ghost: "",
				card: "border bg-card",
			},
			fullHeight: {
				true: "flex-1 min-h-80",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			fullHeight: true,
		},
	}
);

interface EmptyProps
	extends React.ComponentProps<"div">,
		VariantProps<typeof emptyVariants> {}

function Empty({ className, variant, fullHeight, ...props }: EmptyProps) {
	return (
		<div
			data-slot="empty"
			className={cn(emptyVariants({ variant, fullHeight }), className)}
			{...props}
		/>
	);
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-header"
			className={cn("gap-2 flex max-w-sm flex-col items-center", className)}
			{...props}
		/>
	);
}

const emptyMediaVariants = cva(
	"mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				icon: "bg-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-xl [&_svg:not([class*='size-'])]:size-5",
			},
			size: {
				default: "",
				sm: "size-10 rounded-lg [&_svg:not([class*='size-'])]:size-4",
				lg: "size-14 rounded-xl [&_svg:not([class*='size-'])]:size-6",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

interface EmptyMediaProps
	extends React.ComponentProps<"div">,
		VariantProps<typeof emptyMediaVariants> {}

function EmptyMedia({ className, variant = "default", size, ...props }: EmptyMediaProps) {
	return (
		<div
			data-slot="empty-icon"
			data-variant={variant}
			className={cn(emptyMediaVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-title"
			className={cn("text-sm font-medium tracking-tight", className)}
			{...props}
		/>
	);
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<div
			data-slot="empty-description"
			className={cn(
				"text-sm/relaxed text-muted-foreground [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
				className
			)}
			{...props}
		/>
	);
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-content"
			className={cn(
				"gap-2.5 text-sm flex w-full max-w-sm min-w-0 flex-col items-center text-balance",
				className
			)}
			{...props}
		/>
	);
}

export {
	Empty,
	EmptyHeader,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
	EmptyMedia,
	emptyVariants,
	emptyMediaVariants,
};
