"use client";

import Link from "next/link";
import { useTranslations } from "@/providers/i18n-provider";
import { BlurFade } from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Button } from "@/components/ui/button";
import { BrowserMockup } from "@/components/ui/browser-mockup";
import { ChatDemoMockup } from "@/components/ui/chat-demo-mockup";
import { IconSparkles, IconChevronRight } from "@tabler/icons-react";
import { Icon, TypographyMuted, TypographyH1, TypographyH4 } from "@/components/typography";
import Container from "@/components/container";
import { NumberTicker } from "@/components/ui/number-ticker";

export function LandingHero() {
	const t = useTranslations();

	const stats = [
		{ value: 10000, suffix: "+", label: t.landing.statsTemplates },
		{ value: 5000, suffix: "+", label: t.landing.statsUsers },
		{ value: 99.9, suffix: "%", label: t.landing.statsUptime, decimalPlaces: 1 },
	];

	return (
		<section className="min-h-screen relative overflow-hidden py-16 md:py-24 lg:py-32">
			<div className="absolute inset-0 -z-10">
				<div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-150 h-150 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-100 h-100 rounded-full bg-chart-1/10 blur-3xl" />
			</div>

			<Container className="relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					<div className="flex flex-col gap-6">
						<BlurFade delay={0.1}>
							<AnimatedGradientText className="w-fit mx-0">
								<Icon icon={IconSparkles} className="mr-2" />
								<span>{t.landing.badge}</span>
								<Icon icon={IconChevronRight} className="ml-1" />
							</AnimatedGradientText>
						</BlurFade>

						<BlurFade delay={0.2}>
							<TypographyH1 size="lg">
								<TextAnimate animation="blurInUp" by="word" once>
									{t.landing.heroTitle}
								</TextAnimate>
								<span className="block bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
									<TextAnimate animation="slideUp" by="word" delay={0.3} once>
										{t.landing.heroTitleHighlight}
									</TextAnimate>
								</span>
							</TypographyH1>
						</BlurFade>

						<BlurFade delay={0.4}>
							<TypographyMuted className="text-lg md:text-xl max-w-xl">
								{t.landing.heroSubtitle}
							</TypographyMuted>
						</BlurFade>

						<BlurFade delay={0.5}>
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
								<Button size="lg" className="h-11 px-8 text-base shadow-lg shadow-primary/25" asChild>
									<Link href="/register">{t.landing.getStarted}</Link>
								</Button>
								<Button variant="outline" size="lg" className="h-11 px-8 text-base" asChild>
									<Link href="/login">{t.landing.signIn}</Link>
								</Button>
							</div>
						</BlurFade>

						<BlurFade delay={0.6}>
							<div className="flex items-center gap-8 pt-4">
								{stats.map((stat, index) => (
									<div key={index} className="flex flex-col">
										<TypographyH4 size="sm" className="font-bold">
											<NumberTicker value={stat.value} decimalPlaces={stat.decimalPlaces} />
											{stat.suffix}
										</TypographyH4>
										<TypographyMuted className="text-xs">{stat.label}</TypographyMuted>
									</div>
								))}
							</div>
						</BlurFade>
					</div>

					<BlurFade delay={0.3}>
						<div className="relative">
							<BrowserMockup url="app.creafly.ai" showBorderBeam noPadding className="z-10">
								<ChatDemoMockup
									userMessage={t.landing.demo.userMessage}
									aiSummary={t.landing.demo.aiSummary}
									emailSubject={t.landing.demo.emailSubject}
									generatingText={t.landing.demo.generating}
									inputPlaceholder={t.landing.demo.inputPlaceholder}
									saveButtonText={t.landing.demo.saveButton}
									emptyStateTitle={t.landing.demo.emptyStateTitle}
									emptyStateDescription={t.landing.demo.emptyStateDescription}
									autoStartDelay={2000}
									typingSpeed={40}
									loop
									loopDelay={6000}
								/>
							</BrowserMockup>

							<div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-xl bg-linear-to-br from-chart-1 to-chart-2 opacity-20 blur-xl" />
							<div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-linear-to-br from-primary to-primary/60 opacity-30 blur-xl" />
						</div>
					</BlurFade>
				</div>
			</Container>
		</section>
	);
}
