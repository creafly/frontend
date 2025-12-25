"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useIdentityAnalytics, useSubscriptionAnalytics } from "@/hooks/use-api";
import { useTranslations } from "@/providers/i18n-provider";
import {
	IconUsers,
	IconUserCheck,
	IconUserOff,
	IconUserPlus,
	IconCalendarStats,
	IconClock,
	IconBuilding,
	IconCreditCard,
	IconCreditCardPay,
	IconCreditCardOff,
	IconReceipt,
	IconChartBar,
} from "@tabler/icons-react";
import { BlurFade } from "@/components/ui/blur-fade";
import Container from "@/components/container";
import {
	TypographyH3,
	TypographyH4,
	TypographyP,
	TypographyError,
	TypographyMuted,
	Icon,
} from "@/components/typography";

interface MetricCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	isLoading?: boolean;
	delay?: number;
}

function MetricCard({ title, value, icon, isLoading, delay = 0 }: MetricCardProps) {
	return (
		<BlurFade delay={delay}>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
					<div className="text-muted-foreground">{icon}</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-8 w-24" />
					) : (
						<div className="text-2xl font-bold">{value}</div>
					)}
				</CardContent>
			</Card>
		</BlurFade>
	);
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value / 100);
}

export default function DashboardPage() {
	const t = useTranslations();
	const {
		data: identityData,
		isLoading: identityLoading,
		error: identityError,
	} = useIdentityAnalytics();
	const {
		data: subscriptionData,
		isLoading: subscriptionLoading,
		error: subscriptionError,
	} = useSubscriptionAnalytics();

	if (identityError || subscriptionError) {
		return (
			<Container>
				<div className="flex items-center justify-center h-64">
					<TypographyError>{identityError?.message || subscriptionError?.message}</TypographyError>
				</div>
			</Container>
		);
	}

	const users = identityData?.users;
	const subscriptions = subscriptionData?.subscriptions;
	const planDistribution = subscriptionData?.planDistribution;

	return (
		<div className="space-y-6">
			<Container className="p-0 max-w-full">
				<BlurFade delay={0.1}>
					<div>
						<TypographyH3>{t.admin.dashboard}</TypographyH3>
						<TypographyP className="mt-1 text-muted-foreground">
							{t.admin.dashboardDescription}
						</TypographyP>
					</div>
				</BlurFade>
			</Container>

			<Container className="p-0 max-w-full">
				<BlurFade delay={0.15}>
					<TypographyH4 className="mb-4">{t.admin.metrics.usersSection}</TypographyH4>
				</BlurFade>
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						title={t.admin.metrics.totalUsers}
						value={users?.totalUsers ?? 0}
						icon={<Icon icon={IconUsers} size="md" />}
						isLoading={identityLoading}
						delay={0.2}
					/>
					<MetricCard
						title={t.admin.metrics.activeUsers}
						value={users?.activeUsers ?? 0}
						icon={<Icon icon={IconUserCheck} size="md" />}
						isLoading={identityLoading}
						delay={0.25}
					/>
					<MetricCard
						title={t.admin.metrics.blockedUsers}
						value={users?.blockedUsers ?? 0}
						icon={<Icon icon={IconUserOff} size="md" />}
						isLoading={identityLoading}
						delay={0.3}
					/>
					<MetricCard
						title={t.admin.metrics.newUsersThisMonth}
						value={users?.newUsersThisMonth ?? 0}
						icon={<Icon icon={IconUserPlus} size="md" />}
						isLoading={identityLoading}
						delay={0.35}
					/>
					<MetricCard
						title={t.admin.metrics.mau}
						value={users?.mau ?? 0}
						icon={<Icon icon={IconCalendarStats} size="md" />}
						isLoading={identityLoading}
						delay={0.4}
					/>
					<MetricCard
						title={t.admin.metrics.dau}
						value={users?.dau ?? 0}
						icon={<Icon icon={IconClock} size="md" />}
						isLoading={identityLoading}
						delay={0.45}
					/>
					<MetricCard
						title={t.admin.metrics.totalTenants}
						value={users?.totalTenants ?? 0}
						icon={<Icon icon={IconBuilding} size="md" />}
						isLoading={identityLoading}
						delay={0.5}
					/>
				</div>
			</Container>

			<Container className="p-0 max-w-full">
				<BlurFade delay={0.55}>
					<TypographyH4 className="mb-4">{t.admin.metrics.subscriptionsSection}</TypographyH4>
				</BlurFade>
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
					<MetricCard
						title={t.admin.metrics.totalSubscriptions}
						value={subscriptions?.totalSubscriptions ?? 0}
						icon={<Icon icon={IconCreditCard} size="md" />}
						isLoading={subscriptionLoading}
						delay={0.6}
					/>
					<MetricCard
						title={t.admin.metrics.activeSubscriptions}
						value={subscriptions?.activeSubscriptions ?? 0}
						icon={<Icon icon={IconCreditCardPay} size="md" />}
						isLoading={subscriptionLoading}
						delay={0.65}
					/>
					<MetricCard
						title={t.admin.metrics.trialSubscriptions}
						value={subscriptions?.trialSubscriptions ?? 0}
						icon={<Icon icon={IconCreditCard} size="md" />}
						isLoading={subscriptionLoading}
						delay={0.7}
					/>
					<MetricCard
						title={t.admin.metrics.canceledThisMonth}
						value={subscriptions?.canceledThisMonth ?? 0}
						icon={<Icon icon={IconCreditCardOff} size="md" />}
						isLoading={subscriptionLoading}
						delay={0.75}
					/>
					<MetricCard
						title={t.admin.metrics.newThisMonth}
						value={subscriptions?.newThisMonth ?? 0}
						icon={<Icon icon={IconCreditCard} size="md" />}
						isLoading={subscriptionLoading}
						delay={0.8}
					/>
				</div>
			</Container>

			<Container className="p-0 max-w-full">
				<BlurFade delay={0.85}>
					<TypographyH4 className="mb-4">{t.admin.metrics.revenueSection}</TypographyH4>
				</BlurFade>
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
					<MetricCard
						title={t.admin.metrics.mrr}
						value={subscriptions ? formatCurrency(subscriptions.mrr) : "$0"}
						icon={<Icon icon={IconReceipt} size="md" />}
						isLoading={subscriptionLoading}
						delay={0.9}
					/>
					<MetricCard
						title={t.admin.metrics.averageCheck}
						value={subscriptions ? formatCurrency(subscriptions.averageCheck) : "$0"}
						icon={<Icon icon={IconChartBar} size="md" />}
						isLoading={subscriptionLoading}
						delay={0.95}
					/>
				</div>
			</Container>

			<Container className="p-0 max-w-full">
				<BlurFade delay={1.0}>
					<TypographyH4 className="mb-4">{t.admin.metrics.planDistribution}</TypographyH4>
				</BlurFade>
				<BlurFade delay={1.05}>
					<Card>
						<CardContent className="pt-4">
							{subscriptionLoading ? (
								<div className="space-y-3">
									{[...Array(3)].map((_, i) => (
										<div key={i} className="flex justify-between items-center">
											<Skeleton className="h-5 w-32" />
											<Skeleton className="h-5 w-16" />
										</div>
									))}
								</div>
							) : planDistribution && planDistribution.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Plan</TableHead>
											<TableHead className="text-right">Count</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{planDistribution.map((plan) => (
											<TableRow key={plan.planId}>
												<TableCell className="font-medium">{plan.planName}</TableCell>
												<TableCell className="text-right">{plan.count}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<TypographyMuted className="text-center py-4">
									No subscription data available
								</TypographyMuted>
							)}
						</CardContent>
					</Card>
				</BlurFade>
			</Container>
		</div>
	);
}
