"use client";

import { useTranslations } from "@/providers/i18n-provider";
import { BlurFade } from "@/components/ui/blur-fade";
import {
	IconSparkles,
	IconPencil,
	IconWand,
	IconLanguage,
	IconDeviceMobile,
	IconDownload,
} from "@tabler/icons-react";
import { Icon, TypographyMuted, TypographyH3 } from "@/components/typography";
import { SectionWrapper, SectionHeader } from "@/components/section-wrapper";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

interface Feature {
	icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
	title: string;
	description: string;
}

export function LandingFeatures() {
	const t = useTranslations();

	const features: Feature[] = [
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

	const baseCardClassName =
		"group relative h-full border border-foreground/6 p-8 transition-colors hover:bg-muted/30";

	return (
		<SectionWrapper
			id="features"
			className="border-t bg-muted/20 backdrop-blur-sm z-10"
			containerClassName="px-0"
		>
			<BlurFade delay={0.1} inView>
				<SectionHeader
					className="px-6"
					align="left"
					title={t.landing.features}
					subtitle={t.landing.featuresSubtitle}
				/>
			</BlurFade>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{features.map((feature, index) => (
					<BlurFade key={index} delay={0.1 + index * 0.05} inView>
						<div
							className={cn(
								baseCardClassName,
								index % 3 === 0 && "border-l-0 border-r-0",
								(index === 2 || index === 5) && "border-l-0 border-r-0"
							)}
						>
							<div className="flex flex-col gap-4">
								<Icon icon={feature.icon} size="lg" className="text-primary" />
								<TypographyH3 size="sm" className="font-medium">
									{feature.title}
								</TypographyH3>
								<TypographyMuted className="text-sm leading-relaxed">
									{feature.description}
								</TypographyMuted>
							</div>
						</div>
					</BlurFade>
				))}
			</div>
		</SectionWrapper>
	);
}
