import { cn } from "@/lib/utils";

interface RetroGridProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
	angle?: number;
	cellSize?: number;
	opacity?: number;
	lightLineColor?: string;
	darkLineColor?: string;
}

export function RetroGrid({
	className,
	angle = 65,
	cellSize = 60,
	opacity = 0.5,
	lightLineColor = "gray",
	darkLineColor = "gray",
	...props
}: RetroGridProps) {
	const gridStyles = {
		"--grid-angle": `${angle}deg`,
		"--cell-size": `${cellSize}px`,
		"--opacity": opacity,
		"--light-line": lightLineColor,
		"--dark-line": darkLineColor,
	} as React.CSSProperties;

	return (
		<div
			className={cn(
				"pointer-events-none absolute size-full overflow-hidden perspective-[200px]",
				`opacity-(--opacity)`,
				className
			)}
			style={gridStyles}
			{...props}
		>
			<div className="absolute inset-0 transform-[rotateX(var(--grid-angle))]">
				<div
					className={cn(
						"animate-grid",
						"bg-repeat bg-size-[var(--cell-size)_var(--cell-size)] h-[300vh] inset-[0%_0px] ml-[-200%] origin-[100%_0_0] w-[600vw]",
						"bg-[linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)]",
						"dark:bg-[linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]"
					)}
				/>
			</div>
			<div className="absolute inset-0 bg-linear-to-b from-background to-transparent to-70% from-40%" />
		</div>
	);
}
