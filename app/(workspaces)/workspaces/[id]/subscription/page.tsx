"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	IconLoader2,
	IconCheck,
	IconStar,
	IconSparkles,
	IconCreditCard,
	IconLock,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { identityApi } from "@/lib/api/identity";
import {
	usePlans,
	useCurrentSubscription,
	useTrialEligibility,
	useSubscribe,
} from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Plan, BillingCycle } from "@/types";

export default function SubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const t = useTranslations();
	const router = useRouter();
	const { tokens } = useAuth();

	const [resolvedTenantId, setResolvedTenantId] = useState<string | null>(null);
	const [isResolvingTenant, setIsResolvingTenant] = useState(true);
	const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

	const [paymentModalOpen, setPaymentModalOpen] = useState(false);
	const [paymentPlan, setPaymentPlan] = useState<Plan | null>(null);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [cardNumber, setCardNumber] = useState("");
	const [cardExpiry, setCardExpiry] = useState("");
	const [cardCvc, setCardCvc] = useState("");
	const [cardName, setCardName] = useState("");

	useEffect(() => {
		const resolveTenantId = async () => {
			if (!tokens?.accessToken || !id) {
				setIsResolvingTenant(false);
				return;
			}

			try {
				const isValidUUID =
					/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

				if (isValidUUID) {
					setResolvedTenantId(id);
					setIsResolvingTenant(false);
					return;
				}

				const tenants = await identityApi.getAllTenants(tokens.accessToken);
				const tenant = tenants.find((t) => t.slug === id);
				if (tenant) {
					setResolvedTenantId(tenant.id);
				} else {
					setResolvedTenantId(id);
				}
			} catch (error) {
				console.error("Failed to resolve tenant:", error);
				setResolvedTenantId(id);
			} finally {
				setIsResolvingTenant(false);
			}
		};

		resolveTenantId();
	}, [id, tokens?.accessToken]);

	const { data: plans, isLoading: plansLoading } = usePlans();
	const { data: subscription, isLoading: subscriptionLoading } = useCurrentSubscription(
		resolvedTenantId || ""
	);
	const { data: trialEligibility, isLoading: trialLoading } = useTrialEligibility(
		resolvedTenantId || ""
	);
	const subscribeMutation = useSubscribe();

	const getStatusTranslation = (status: string) => {
		const statusMap: Record<string, string> = {
			active: t.subscription.statuses.active,
			trialing: t.subscription.statuses.trialing,
			canceled: t.subscription.statuses.canceled,
			past_due: t.subscription.statuses.past_due,
			incomplete: t.subscription.statuses.incomplete,
			incomplete_expired: t.subscription.statuses.incomplete_expired,
			unpaid: t.subscription.statuses.unpaid,
		};
		return statusMap[status] || status;
	};

	const handleSubscribe = async (plan: Plan, isTrial: boolean = false) => {
		if (!resolvedTenantId) return;

		if (isTrial) {
			setSelectedPlanId(plan.id);
			try {
				await subscribeMutation.mutateAsync({
					tenantId: resolvedTenantId,
					request: {
						planId: plan.id,
						billingCycle,
					},
				});
				toast.success(t.subscription.trialStarted);
				router.push(`/workspaces/${id}/settings`);
			} catch (error) {
				toast.error(error instanceof Error ? error.message : t.subscription.failedStartTrial);
			} finally {
				setSelectedPlanId(null);
			}
			return;
		}

		setPaymentPlan(plan);
		setPaymentModalOpen(true);
	};

	const handlePaymentSubmit = async () => {
		if (!resolvedTenantId || !paymentPlan) return;

		if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
			toast.error(t.subscription.fillCardDetails);
			return;
		}

		setIsProcessingPayment(true);

		await new Promise((resolve) => setTimeout(resolve, 2000));

		try {
			await subscribeMutation.mutateAsync({
				tenantId: resolvedTenantId,
				request: {
					planId: paymentPlan.id,
					billingCycle,
				},
			});

			toast.success(t.subscription.paymentSuccess);
			setPaymentModalOpen(false);
			resetPaymentForm();
			router.push(`/workspaces/${id}/settings`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t.subscription.failedCreateSubscription);
		} finally {
			setIsProcessingPayment(false);
		}
	};

	const resetPaymentForm = () => {
		setCardNumber("");
		setCardExpiry("");
		setCardCvc("");
		setCardName("");
		setPaymentPlan(null);
	};

	const formatCardNumber = (value: string) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
		const matches = v.match(/\d{4,16}/g);
		const match = (matches && matches[0]) || "";
		const parts = [];
		for (let i = 0, len = match.length; i < len; i += 4) {
			parts.push(match.substring(i, i + 4));
		}
		return parts.length ? parts.join(" ") : v;
	};

	const formatExpiry = (value: string) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
		if (v.length >= 2) {
			return v.substring(0, 2) + "/" + v.substring(2, 4);
		}
		return v;
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
		}).format(price / 100);
	};

	const formatStorageSize = (bytes: number) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB", "TB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + " " + sizes[i];
	};

	if (isResolvingTenant || plansLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const sortedPlans = plans?.sort((a, b) => a.sortOrder - b.sortOrder) || [];

	return (
		<div className="w-full py-8 px-4">
			<div className="flex items-center gap-4 mb-8">
				<div>
					<h1 className="text-2xl font-bold">{t.subscription.choosePlan}</h1>
					<p className="text-muted-foreground">{t.subscription.subtitle}</p>
				</div>
			</div>

			{subscription && !subscriptionLoading && (
				<div className="mb-8 p-4 rounded-lg border bg-primary/5 border-primary/20">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">{t.subscription.currentSubscription}</p>
							<p className="text-sm text-muted-foreground">
								{t.subscription.status}:{" "}
								<Badge variant={subscription.status === "active" ? "default" : "secondary"}>
									{getStatusTranslation(subscription.status)}
								</Badge>
							</p>
						</div>
						{subscription.cancelAtPeriodEnd && (
							<Badge variant="destructive">{t.subscription.cancelsAtPeriodEnd}</Badge>
						)}
					</div>
				</div>
			)}

			<div className="flex items-center justify-center gap-4 mb-8">
				<span className={billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>
					{t.subscription.monthly}
				</span>
				<Switch
					checked={billingCycle === "yearly"}
					onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
				/>
				<span className={billingCycle === "yearly" ? "font-medium" : "text-muted-foreground"}>
					{t.subscription.yearly}
					<Badge variant="secondary" className="ml-2">
						{t.subscription.savePercent}
					</Badge>
				</span>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				{sortedPlans.map((plan) => {
					const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
					const isCurrentPlan = subscription?.planId === plan.id;
					const canTrial = trialEligibility?.eligible && plan.trialDays > 0;
					const isProcessing = selectedPlanId === plan.id && subscribeMutation.isPending;

					return (
						<Card
							key={plan.id}
							className={`relative ${plan.isFeatured ? "border-primary shadow-lg" : ""}`}
						>
							<CardHeader className="text-center pt-4">
								{plan.isFeatured && (
									<Badge className="mx-auto bg-primary">
										<IconStar className="h-3 w-3 mr-1" />
										{t.subscription.mostPopular}
									</Badge>
								)}
								<CardTitle className="text-xl">{plan.name}</CardTitle>
								<CardDescription>{plan.description}</CardDescription>
								<div className="mt-4">
									<span className="text-4xl font-bold">{formatPrice(price)}</span>
									<span className="text-muted-foreground">
										/{billingCycle === "yearly" ? "year" : "month"}
									</span>
								</div>
							</CardHeader>

							<CardContent className="space-y-3">
								<div className="flex items-center gap-2">
									<IconCheck className="h-4 w-4 text-primary" />
									<span className="text-sm">
										{t.subscription.tokensPerMonth.replace(
											"{count}",
											plan.tokenLimit.toLocaleString()
										)}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<IconCheck className="h-4 w-4 text-primary" />
									<span className="text-sm">
										{t.subscription.teamMembers.replace("{count}", String(plan.membersLimit))}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<IconCheck className="h-4 w-4 text-primary" />
									<span className="text-sm">
										{t.subscription.storageSpace.replace(
											"{size}",
											formatStorageSize(plan.storageLimit)
										)}
									</span>
								</div>
								{plan.trialDays > 0 && (
									<div className="flex items-center gap-2">
										<IconSparkles className="h-4 w-4 text-primary" />
										<span className="text-sm">
											{t.subscription.dayFreeTrial.replace("{count}", String(plan.trialDays))}
										</span>
									</div>
								)}
							</CardContent>

							<CardFooter className="flex flex-col gap-2 mt-auto">
								{isCurrentPlan ? (
									<Button className="w-full" disabled>
										{t.subscription.currentPlan}
									</Button>
								) : canTrial ? (
									<Button
										className="w-full"
										variant={plan.isFeatured ? "default" : "outline"}
										onClick={() => handleSubscribe(plan, true)}
										disabled={isProcessing}
									>
										{isProcessing ? (
											<IconLoader2 className="h-4 w-4 animate-spin mr-2" />
										) : (
											<IconSparkles className="h-4 w-4 mr-2" />
										)}
										{t.subscription.startFreeTrial}
									</Button>
								) : (
									<Button
										className="w-full"
										variant={plan.isFeatured ? "default" : "outline"}
										onClick={() => handleSubscribe(plan, false)}
										disabled={isProcessing}
									>
										{isProcessing && <IconLoader2 className="h-4 w-4 animate-spin mr-2" />}
										{t.subscription.subscribe}
									</Button>
								)}
							</CardFooter>
						</Card>
					);
				})}
			</div>

			{!trialLoading &&
				trialEligibility &&
				!trialEligibility.eligible &&
				trialEligibility.reason && (
					<p className="text-center text-sm text-muted-foreground mt-8">
						{trialEligibility.reason}
					</p>
				)}

			<Dialog
				open={paymentModalOpen}
				onOpenChange={(open) => {
					if (!isProcessingPayment) {
						setPaymentModalOpen(open);
						if (!open) resetPaymentForm();
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<IconCreditCard className="h-5 w-5" />
							{t.subscription.completePayment}
						</DialogTitle>
						<DialogDescription>
							{paymentPlan && (
								<>
									{t.subscription.subscribeTo} <strong>{paymentPlan.name}</strong>
									{" - "}
									<strong>
										{formatPrice(
											billingCycle === "yearly" ? paymentPlan.priceYearly : paymentPlan.priceMonthly
										)}
									</strong>
									/
									{billingCycle === "yearly"
										? t.subscription.yearly.toLowerCase()
										: t.subscription.monthly.toLowerCase()}
								</>
							)}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="cardName">{t.subscription.nameOnCard}</Label>
							<Input
								id="cardName"
								placeholder="John Doe"
								value={cardName}
								onChange={(e) => setCardName(e.target.value)}
								disabled={isProcessingPayment}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="cardNumber">{t.subscription.cardNumber}</Label>
							<Input
								id="cardNumber"
								placeholder="4242 4242 4242 4242"
								value={cardNumber}
								onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
								maxLength={19}
								disabled={isProcessingPayment}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="cardExpiry">{t.subscription.expiryDate}</Label>
								<Input
									id="cardExpiry"
									placeholder="MM/YY"
									value={cardExpiry}
									onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
									maxLength={5}
									disabled={isProcessingPayment}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="cardCvc">{t.subscription.cvc}</Label>
								<Input
									id="cardCvc"
									placeholder="123"
									value={cardCvc}
									onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
									maxLength={4}
									disabled={isProcessingPayment}
								/>
							</div>
						</div>

						<div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
							<IconLock className="h-3 w-3" />
							<span>{t.subscription.paymentSecure}</span>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setPaymentModalOpen(false);
								resetPaymentForm();
							}}
							disabled={isProcessingPayment}
						>
							{t.subscription.cancel}
						</Button>
						<Button onClick={handlePaymentSubmit} disabled={isProcessingPayment}>
							{isProcessingPayment ? (
								<>
									<IconLoader2 className="h-4 w-4 animate-spin mr-2" />
									{t.subscription.processing}
								</>
							) : (
								<>
									{t.subscription.pay}{" "}
									{paymentPlan &&
										formatPrice(
											billingCycle === "yearly" ? paymentPlan.priceYearly : paymentPlan.priceMonthly
										)}
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
