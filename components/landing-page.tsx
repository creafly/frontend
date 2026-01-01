"use client";

import Link from "next/link";
import { useTranslations } from "@/providers/i18n-provider";
import { BlurFade } from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Button } from "@/components/ui/button";
import { WobbleCard } from "@/components/ui/wobble-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
	IconSparkles,
	IconPencil,
	IconWand,
	IconLanguage,
	IconDeviceMobile,
	IconDownload,
	IconChevronRight,
} from "@tabler/icons-react";
import Container from "./container";
import { SectionWrapper, SectionHeader } from "./section-wrapper";
import { RetroGrid } from "./ui/retro-grid";

export function LandingPage() {
	const t = useTranslations();

	const features = [
		{
			icon: IconSparkles,
			title: t.landing.feature1Title,
			description: t.landing.feature1Description,
		},
		{
			icon: IconPencil,
			title: t.landing.feature2Title,
			description: t.landing.feature2Description,
		},
		{
			icon: IconWand,
			title: t.landing.feature3Title,
			description: t.landing.feature3Description,
		},
		{
			icon: IconLanguage,
			title: t.landing.feature4Title,
			description: t.landing.feature4Description,
		},
		{
			icon: IconDeviceMobile,
			title: t.landing.feature5Title,
			description: t.landing.feature5Description,
		},
		{
			icon: IconDownload,
			title: t.landing.feature6Title,
			description: t.landing.feature6Description,
		},
	];

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<Container className="py-0">
					<div className="flex h-14 items-center justify-between">
						<Link href="/" className="flex items-center space-x-2">
							<span className="font-bold text-xl">{t.landing.footer}</span>
						</Link>
						<div className="flex items-center gap-2">
							<ThemeToggle />
							<LanguageSwitcher />
							<Button variant="ghost" size="sm" asChild>
								<Link href="/login">{t.landing.signIn}</Link>
							</Button>
							<Button size="sm" asChild>
								<Link href="/register">{t.landing.getStarted}</Link>
							</Button>
						</div>
					</div>
				</Container>
			</header>

			<section className="relative min-h-screen py-12 md:py-24 overflow-hidden">
				<RetroGrid />
				<Container className="relative z-10 flex items-center justify-center flex-col gap-6">
					<BlurFade delay={0.1}>
						<AnimatedGradientText>
							<IconSparkles className="mr-2 h-4 w-4" />
							<span>{t.landing.badge}</span>
							<IconChevronRight className="ml-1 h-4 w-4" />
						</AnimatedGradientText>
					</BlurFade>
					<BlurFade delay={0.2}>
						<h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
							<TextAnimate animation="blurInUp" by="word" once>
								{t.landing.heroTitle}
							</TextAnimate>
							<span className="block bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								<TextAnimate animation="slideUp" by="word" delay={0.3} once>
									{t.landing.heroTitleHighlight}
								</TextAnimate>
							</span>
						</h1>
					</BlurFade>

					<BlurFade delay={0.4}>
						<p className="max-w-2xl text-center text-lg text-muted-foreground md:text-xl">
							{t.landing.heroSubtitle}
						</p>
					</BlurFade>

					<BlurFade delay={0.5}>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
							<Link href="/register">
								<ShimmerButton className="shadow-2xl">
									<span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-background dark:text-foreground from-background to-foreground/90 lg:text-lg">
										{t.landing.getStarted}
									</span>
								</ShimmerButton>
							</Link>
							<Button variant="outline" size="lg" className="h-11 px-8 text-base" asChild>
								<Link href="/login">{t.landing.signIn}</Link>
							</Button>
						</div>
					</BlurFade>
				</Container>
			</section>

			<SectionWrapper>
				<BlurFade delay={0.1} inView>
					<SectionHeader title={t.landing.features} subtitle={t.landing.featuresSubtitle} />
				</BlurFade>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					<BlurFade delay={0.1} inView className="lg:col-span-2 lg:row-span-2">
						<WobbleCard
							containerClassName="h-full min-h-[300px] lg:min-h-[400px] bg-gradient-to-br from-primary to-primary/80"
							className="flex flex-col justify-end"
						>
							<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-foreground/20 mb-4">
								<IconSparkles className="h-7 w-7 text-background" />
							</div>
							<h3 className="text-2xl lg:text-3xl font-bold text-background mb-3">
								{features[0].title}
							</h3>
							<p className="text-background/80 text-lg max-w-md">{features[0].description}</p>
						</WobbleCard>
					</BlurFade>

					<BlurFade delay={0.2} inView>
						<WobbleCard
							containerClassName="h-full min-h-[180px] bg-gradient-to-br from-pink-500 to-pink-600"
							className="flex flex-col justify-end"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/20 mb-3">
								<IconPencil className="h-5 w-5 text-background" />
							</div>
							<h3 className="text-lg font-bold text-background mb-1">{features[1].title}</h3>
							<p className="text-background/80 text-sm">{features[1].description}</p>
						</WobbleCard>
					</BlurFade>

					<BlurFade delay={0.3} inView>
						<WobbleCard
							containerClassName="h-full min-h-[180px] bg-gradient-to-br from-violet-500 to-violet-600"
							className="flex flex-col justify-end"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/20 mb-3">
								<IconWand className="h-5 w-5 text-background" />
							</div>
							<h3 className="text-lg font-bold text-background mb-1">{features[2].title}</h3>
							<p className="text-background/80 text-sm">{features[2].description}</p>
						</WobbleCard>
					</BlurFade>

					<BlurFade delay={0.4} inView>
						<WobbleCard
							containerClassName="h-full min-h-[200px] bg-gradient-to-br from-amber-500 to-orange-500"
							className="flex flex-col justify-end"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/20 mb-3">
								<IconLanguage className="h-5 w-5 text-background" />
							</div>
							<h3 className="text-lg font-bold text-background mb-1">{features[3].title}</h3>
							<p className="text-background/80 text-sm">{features[3].description}</p>
						</WobbleCard>
					</BlurFade>

					<BlurFade delay={0.5} inView>
						<WobbleCard
							containerClassName="h-full min-h-[200px] bg-gradient-to-br from-emerald-500 to-teal-500"
							className="flex flex-col justify-end"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/20 mb-3">
								<IconDeviceMobile className="h-5 w-5 text-background" />
							</div>
							<h3 className="text-lg font-bold text-background mb-1">{features[4].title}</h3>
							<p className="text-background/80 text-sm">{features[4].description}</p>
						</WobbleCard>
					</BlurFade>

					<BlurFade delay={0.6} inView>
						<WobbleCard
							containerClassName="h-full min-h-[200px] bg-gradient-to-br from-sky-500 to-blue-600"
							className="flex flex-col justify-end"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/20 mb-3">
								<IconDownload className="h-5 w-5 text-background" />
							</div>
							<h3 className="text-lg font-bold text-background mb-1">{features[5].title}</h3>
							<p className="text-background/80 text-sm">{features[5].description}</p>
						</WobbleCard>
					</BlurFade>
				</div>
			</SectionWrapper>

			<SectionWrapper className="border-t bg-muted/40">
				<div className="flex flex-col items-center gap-6 text-center">
					<BlurFade delay={0.1} inView>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.landing.ctaTitle}</h2>
					</BlurFade>
					<BlurFade delay={0.2} inView>
						<p className="max-w-xl text-lg text-muted-foreground">{t.landing.ctaSubtitle}</p>
					</BlurFade>
					<BlurFade delay={0.3} inView>
						<Link href="/register">
							<ShimmerButton className="shadow-2xl">
								<span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-background from-foreground to-background/10 lg:text-lg">
									{t.landing.ctaButton}
								</span>
							</ShimmerButton>
						</Link>
					</BlurFade>
				</div>
			</SectionWrapper>

			<footer className="border-t py-6">
				<Container className="py-0">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<p className="text-sm text-muted-foreground">
							{t.landing.footer} - {t.landing.footerTagline}
						</p>
						<p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()}</p>
					</div>
				</Container>
			</footer>
		</div>
	);
}
