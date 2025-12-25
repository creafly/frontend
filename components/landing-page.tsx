"use client";

import { StripeGuides } from "@/components/ui/stripe-guides";
import {
	LandingHeader,
	LandingHero,
	LandingFeatures,
	LandingHowItWorks,
	LandingTestimonials,
	LandingCTA,
	LandingFooter,
} from "@/components/landing";

export function LandingPage() {
	return (
		<div className="relative flex min-h-screen flex-col">
			<StripeGuides className="fixed inset-0 z-0" fade={false} opacity={0.06} />
			<StripeGuides className="fixed inset-0 z-20" fade={false} opacity={0.06} edgeOnly />

			<LandingHeader />
			<LandingHero />
			<LandingFeatures />
			<LandingHowItWorks />
			<LandingTestimonials />
			<LandingCTA />
			<LandingFooter />
		</div>
	);
}
