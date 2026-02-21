"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StripeGuides } from "@/components/ui/stripe-guides";
import Container from "@/components/container";
import {
	IconRefresh,
	IconCircleCheckFilled,
	IconAlertTriangleFilled,
	IconCircleXFilled,
} from "@tabler/icons-react";
import { Icon, TypographyH1, TypographyMuted } from "@/components/typography";
import { checkAllServicesHealth, type SystemStatus, type ServiceStatus } from "@/lib/api/status";
import { cn } from "@/lib/utils";

const AUTO_REFRESH_INTERVAL = 30000;

function StatusIcon({ status }: { status: ServiceStatus["status"] }) {
	switch (status) {
		case "operational":
			return <Icon icon={IconCircleCheckFilled} size="md" className="text-success" />;
		case "degraded":
			return <Icon icon={IconAlertTriangleFilled} size="md" className="text-warning" />;
		case "down":
			return <Icon icon={IconCircleXFilled} size="md" className="text-destructive" />;
	}
}

function StatusBadge({
	status,
	t,
}: {
	status: ServiceStatus["status"];
	t: ReturnType<typeof useTranslations>;
}) {
	const variants = {
		operational: "bg-success/10 text-success",
		degraded: "bg-warning/10 text-warning",
		down: "bg-destructive/10 text-destructive",
	};

	const labels = {
		operational: t.status.operational,
		degraded: t.status.degraded,
		down: t.status.down,
	};

	return <Badge className={cn("border-0", variants[status])}>{labels[status]}</Badge>;
}

function OverallStatusBanner({
	status,
	t,
}: {
	status: SystemStatus["overall"];
	t: ReturnType<typeof useTranslations>;
}) {
	const configs = {
		operational: {
			bg: "bg-success/10 border-success/20",
			icon: <Icon icon={IconCircleCheckFilled} size="lg" className="text-success" />,
			text: t.status.allOperational,
		},
		degraded: {
			bg: "bg-warning/10 border-warning/20",
			icon: <Icon icon={IconAlertTriangleFilled} size="lg" className="text-warning" />,
			text: t.status.someIssues,
		},
		down: {
			bg: "bg-destructive/10 border-destructive/20",
			icon: <Icon icon={IconCircleXFilled} size="lg" className="text-destructive" />,
			text: t.status.majorOutage,
		},
	};

	const config = configs[status];

	return (
		<div className={cn("rounded-lg border p-4 flex items-center gap-3", config.bg)}>
			{config.icon}
			<span className="font-medium">{config.text}</span>
		</div>
	);
}

function ServiceCard({
	service,
	t,
}: {
	service: ServiceStatus;
	t: ReturnType<typeof useTranslations>;
}) {
	const serviceNames: Record<string, string> = {
		identity: t.status.services.identity,
		storage: t.status.services.storage,
		notifications: t.status.services.notifications,
		subscriptions: t.status.services.subscriptions,
		branding: t.status.services.branding,
		support: t.status.services.support,
		agent: t.status.services.agent,
	};

	return (
		<div className="flex items-center justify-between py-3 border-b last:border-b-0">
			<div className="flex items-center gap-3">
				<StatusIcon status={service.status} />
				<div>
					<div className="font-medium">{serviceNames[service.name] || service.name}</div>
					{service.responseTime !== null && (
						<div className="text-xs text-muted-foreground">
							{t.status.responseTime}: {service.responseTime}ms
						</div>
					)}
				</div>
			</div>
			<StatusBadge status={service.status} t={t} />
		</div>
	);
}

export default function StatusPage() {
	const t = useTranslations();
	const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchStatus = useCallback(async (isManualRefresh = false) => {
		if (isManualRefresh) {
			setIsRefreshing(true);
		}

		try {
			const status = await checkAllServicesHealth();
			setSystemStatus(status);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch status");
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		fetchStatus();

		const intervalId = setInterval(() => {
			fetchStatus();
		}, AUTO_REFRESH_INTERVAL);

		return () => clearInterval(intervalId);
	}, [fetchStatus]);

	const formatLastChecked = (date: Date) => {
		return date.toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	return (
		<div className="relative min-h-svh">
			<StripeGuides className="fixed inset-0 z-0" fade={false} opacity={0.06} />

			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-150 h-150 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-100 h-100 rounded-full bg-chart-1/10 blur-3xl" />
			</div>

			<div className="relative z-10">
				<Container className="py-12 max-w-3xl">
					<div className="mb-8 flex items-center justify-between">
						<Link
							href="/"
							className="flex items-center gap-2 hover:opacity-70 transition-opacity"
						>
							<Image src="/logo.svg" alt="Creafly" width={28} height={28} />
							<span className="font-semibold text-sm">Creafly AI</span>
						</Link>
						<Button
							variant="outline"
							size="sm"
							onClick={() => fetchStatus(true)}
							disabled={isRefreshing}
						>
							<Icon icon={IconRefresh} className={cn("mr-2", isRefreshing && "animate-spin")} />
							{t.status.refresh}
						</Button>
					</div>

					<div className="space-y-6">
						<div>
							<TypographyH1 size="md">{t.status.title}</TypographyH1>
							<TypographyMuted className="mt-1">{t.status.subtitle}</TypographyMuted>
						</div>

						{isLoading ? (
							<div className="space-y-4">
								<div className="h-16 bg-muted animate-pulse rounded-lg" />
								<Card>
									<CardContent className="py-6">
										<div className="space-y-4">
											{[1, 2, 3, 4, 5, 6, 7].map((i) => (
												<div key={i} className="h-12 bg-muted animate-pulse rounded" />
											))}
										</div>
									</CardContent>
								</Card>
							</div>
						) : error ? (
							<Card>
								<CardContent className="py-6 text-center">
									<Icon icon={IconAlertTriangleFilled} size="2xl" className="text-warning mx-auto mb-4" />
									<TypographyMuted>{error}</TypographyMuted>
								<Button
									variant="outline"
									className="mt-4"
									onClick={() => fetchStatus(true)}
									disabled={isRefreshing}
								>
									{isRefreshing ? (
										<Icon icon={IconRefresh} className="mr-2 animate-spin" />
									) : null}
									{t.support.tryAgain}
								</Button>
								</CardContent>
							</Card>
						) : systemStatus ? (
							<>
								<OverallStatusBanner status={systemStatus.overall} t={t} />

								<Card>
									<CardHeader>
										<CardTitle>{t.status.servicesTitle}</CardTitle>
										<CardDescription>
											{t.status.lastChecked}: {formatLastChecked(systemStatus.lastChecked)}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="divide-y">
											{systemStatus.services.map((service) => (
												<ServiceCard key={service.name} service={service} t={t} />
											))}
										</div>
									</CardContent>
								</Card>

								<TypographyMuted className="text-center">{t.status.autoRefresh}</TypographyMuted>
							</>
						) : null}
					</div>
				</Container>
			</div>
		</div>
	);
}
