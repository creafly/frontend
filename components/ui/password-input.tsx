"use client";

import * as React from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/typography";

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);

		return (
			<div className="relative">
				<input
					type={showPassword ? "text" : "password"}
					data-slot="input"
					className={cn(
						"dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 rounded-lg border bg-transparent px-2.5 py-1 pr-9 text-base transition-colors file:h-6 file:text-sm file:font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
						className
					)}
					ref={ref}
					{...props}
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="absolute right-0 top-0 h-8 w-8 px-2 hover:bg-transparent"
					onClick={() => setShowPassword(!showPassword)}
					tabIndex={-1}
				>
					{showPassword ? (
						<Icon icon={IconEyeOff} size="sm" className="text-muted-foreground" />
					) : (
						<Icon icon={IconEye} size="sm" className="text-muted-foreground" />
					)}
					<span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
				</Button>
			</div>
		);
	}
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
