"use client";

import Link from "next/link";
import { useTranslations } from "@/providers/i18n-provider";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { TypographyMuted, TypographyH2 } from "@/components/typography";
import { SectionWrapper } from "../section-wrapper";

export function LandingCTA() {
	const t = useTranslations();

	return (
		<SectionWrapper
			className="border-t"
			containerClassName="flex flex-col items-center justify-center"
		>
			<BlurFade delay={0.1} inView>
				<TypographyH2 className="sm:text-4xl text-center">{t.landing.ctaTitle}</TypographyH2>
			</BlurFade>
			<BlurFade delay={0.2} inView>
				<TypographyMuted className="max-w-xl text-lg text-center mt-4">
					{t.landing.ctaSubtitle}
				</TypographyMuted>
			</BlurFade>
			<BlurFade delay={0.3} inView>
				<Button size="lg" className="h-11 px-8 text-base shadow-lg shadow-primary/25 mt-6" asChild>
					<Link href="/register">{t.landing.ctaButton}</Link>
				</Button>
			</BlurFade>
		</SectionWrapper>
	);
}
