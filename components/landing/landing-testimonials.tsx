"use client";

import { useTranslations } from "@/providers/i18n-provider";
import { BlurFade } from "@/components/ui/blur-fade";
import { IconQuote } from "@tabler/icons-react";
import { Icon, TypographyMuted, TypographyP } from "@/components/typography";
import { SectionWrapper, SectionHeader } from "@/components/section-wrapper";
import { Marquee } from "@/components/ui/marquee";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
	text: string;
	author: string;
	role: string;
}

export function LandingTestimonials() {
	const t = useTranslations();

	const testimonials: Testimonial[] = [
		{
			text: t.landing.testimonial1Text,
			author: t.landing.testimonial1Author,
			role: t.landing.testimonial1Role,
		},
		{
			text: t.landing.testimonial2Text,
			author: t.landing.testimonial2Author,
			role: t.landing.testimonial2Role,
		},
		{
			text: t.landing.testimonial3Text,
			author: t.landing.testimonial3Author,
			role: t.landing.testimonial3Role,
		},
	];

	return (
		<SectionWrapper
			id="testimonials"
			className="border-t bg-muted/20 backdrop-blur-sm z-10"
			containerClassName="px-1"
		>
			<BlurFade delay={0.1} inView>
				<SectionHeader
					className="px-6"
					align="left"
					title={t.landing.testimonials}
					subtitle={t.landing.testimonialsSubtitle}
				/>
			</BlurFade>
			<BlurFade delay={0.2} inView>
				<div className="relative">
					<Marquee pauseOnHover className="[--duration:40s]">
						{testimonials.map((testimonial, index) => (
							<Card key={index} className="w-80 shrink-0">
								<CardContent className="p-6 flex flex-col gap-4">
									<Icon icon={IconQuote} size="xl" className="text-primary/40" />
									<TypographyMuted className="leading-relaxed line-clamp-4">
										{testimonial.text}
									</TypographyMuted>
									<div className="flex items-center gap-3 mt-auto">
										<div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
											<span className="text-sm font-semibold text-white">
												{testimonial.author.charAt(0)}
											</span>
										</div>
										<div>
											<TypographyP className="font-medium text-sm mt-0">
												{testimonial.author}
											</TypographyP>
											<TypographyMuted className="text-xs">{testimonial.role}</TypographyMuted>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</Marquee>
					<div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-linear-to-r from-background to-transparent" />
					<div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-linear-to-l from-background to-transparent" />
				</div>
			</BlurFade>
		</SectionWrapper>
	);
}
