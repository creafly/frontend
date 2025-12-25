"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
	value: number;
	direction?: "up" | "down";
	delay?: number;
	className?: string;
	decimalPlaces?: number;
	suffix?: string;
	prefix?: string;
}

export function NumberTicker({
	value,
	direction = "up",
	delay = 0,
	className,
	decimalPlaces = 0,
	suffix = "",
	prefix = "",
}: NumberTickerProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const isInView = useInView(ref, { once: true, margin: "0px" });
	const [displayValue, setDisplayValue] = useState(direction === "down" ? value : 0);

	useEffect(() => {
		if (!isInView) return;

		const startTime = Date.now();
		const duration = 2000;
		const startValue = direction === "down" ? value : 0;
		const endValue = direction === "down" ? 0 : value;

		const timer = setTimeout(() => {
			const animate = () => {
				const now = Date.now();
				const elapsed = now - startTime - delay * 1000;
				
				if (elapsed < 0) {
					requestAnimationFrame(animate);
					return;
				}

				const progress = Math.min(elapsed / duration, 1);
				const easeOutQuart = 1 - Math.pow(1 - progress, 4);
				const currentValue = startValue + (endValue - startValue) * easeOutQuart;

				setDisplayValue(currentValue);

				if (progress < 1) {
					requestAnimationFrame(animate);
				}
			};

			animate();
		}, delay * 1000);

		return () => clearTimeout(timer);
	}, [isInView, value, direction, delay]);

	return (
		<span ref={ref} className={cn("tabular-nums tracking-wider", className)}>
			{prefix}
			{displayValue.toFixed(decimalPlaces)}
			{suffix}
		</span>
	);
}
