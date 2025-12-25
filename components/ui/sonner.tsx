"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
	IconCircleCheck,
	IconInfoCircle,
	IconAlertTriangle,
	IconAlertOctagon,
	IconLoader,
} from "@tabler/icons-react";
import { Icon } from "@/components/typography";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			icons={{
				success: <Icon icon={IconCircleCheck} />,
				info: <Icon icon={IconInfoCircle} />,
				warning: <Icon icon={IconAlertTriangle} />,
				error: <Icon icon={IconAlertOctagon} />,
				loading: <Icon icon={IconLoader} className="animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius)",
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: "cn-toast",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
