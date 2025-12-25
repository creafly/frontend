import { cn } from "@/lib/utils";

export const CONTAINER_MAX_WIDTH = "max-w-7xl";
export const CONTAINER_PADDING_X = "px-6";

export default function Container({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("w-full mx-auto py-4", CONTAINER_MAX_WIDTH, CONTAINER_PADDING_X, className)}>
			{children}
		</div>
	);
}
