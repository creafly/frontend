"use client";

import { useState } from "react";
import { useTranslations } from "@/providers/i18n-provider";
import { BlurFade } from "@/components/ui/blur-fade";
import {
	IconBrandChrome,
	IconUpload,
	IconMessageCircle,
	IconDeviceDesktop,
} from "@tabler/icons-react";
import { Icon, TypographyMuted, TypographyH3 } from "@/components/typography";
import { SectionWrapper, SectionHeader } from "@/components/section-wrapper";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import type { ComponentType, SVGProps } from "react";

import { BrandingParsingMockup } from "./mockups/branding-parsing-mockup";
import { FileUploadMockup } from "./mockups/file-upload-mockup";
import { ChatMockup } from "./mockups/chat-mockup";
import { InteractivePreviewMockup } from "./mockups/interactive-preview-mockup";

interface Step {
	icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
	title: string;
	description: string;
	mockup: ComponentType<{ isActive: boolean }>;
}

export function LandingHowItWorks() {
	const t = useTranslations();
	const [activeStep, setActiveStep] = useState(0);

	const steps: Step[] = [
		{
			icon: IconBrandChrome,
			title: t.landing.howItWorksStep1Title,
			description: t.landing.howItWorksStep1Description,
			mockup: BrandingParsingMockup,
		},
		{
			icon: IconUpload,
			title: t.landing.howItWorksStep2Title,
			description: t.landing.howItWorksStep2Description,
			mockup: FileUploadMockup,
		},
		{
			icon: IconMessageCircle,
			title: t.landing.howItWorksStep3Title,
			description: t.landing.howItWorksStep3Description,
			mockup: ChatMockup,
		},
		{
			icon: IconDeviceDesktop,
			title: t.landing.howItWorksStep4Title,
			description: t.landing.howItWorksStep4Description,
			mockup: InteractivePreviewMockup,
		},
	];

	const ActiveMockup = steps[activeStep].mockup;

	return (
		<SectionWrapper id="how-it-works" className="border-t" containerClassName="px-0">
			<BlurFade delay={0.1} inView>
				<SectionHeader
					align="center"
					title={t.landing.howItWorks}
					subtitle={t.landing.howItWorksSubtitle}
				/>
			</BlurFade>

			<div className="mt-12 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-1">
				<div className="divide-y divide-border/50 flex flex-col">
					{steps.map((step, index) => (
						<BlurFade key={index} delay={0.1 + index * 0.05} inView className="flex-1">
							<button
								onClick={() => setActiveStep(index)}
								className={cn(
									"w-full h-full text-left p-5 transition-all duration-300 relative group border-foreground/5",
									activeStep === index ? "bg-muted/50" : "hover:bg-muted/30",
									index === 0 && "border-t",
									index === steps.length - 1 && "border-b"
								)}
							>
								<div className="flex items-start gap-4">
									<div
										className={cn(
											"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
											activeStep === index
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground group-hover:bg-muted/80"
										)}
									>
										<Icon icon={step.icon} size="md" />
									</div>
									<div className="flex-1 min-w-0">
										<TypographyH3
											size="xs"
											className={cn(
												"transition-colors",
												activeStep === index
													? "text-foreground"
													: "text-muted-foreground group-hover:text-foreground"
											)}
										>
											{step.title}
										</TypographyH3>
										<TypographyMuted className="mt-1 text-sm leading-relaxed">
											{step.description}
										</TypographyMuted>
									</div>
								</div>

								{activeStep === index && (
									<motion.div
										layoutId="activeStepIndicator"
										className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary via-chart-1 to-chart-2"
										initial={false}
										transition={{
											type: "spring",
											stiffness: 500,
											damping: 35,
										}}
									/>
								)}
							</button>
						</BlurFade>
					))}
				</div>

				<BlurFade delay={0.3} inView className="h-full">
					<div className="relative h-full min-h-105 lg:min-h-120 overflow-hidden bg-muted/30 border border-foreground/5">
						<div
							className="absolute inset-0 opacity-50"
							style={{
								backgroundImage: `
									linear-gradient(to right, hsl(var(--foreground) / 0.03) 1px, transparent 1px),
									linear-gradient(to bottom, hsl(var(--foreground) / 0.03) 1px, transparent 1px)
								`,
								backgroundSize: "24px 24px",
							}}
						/>

						<AnimatePresence mode="wait">
							<motion.div
								key={activeStep}
								initial={{ opacity: 0, y: 20, scale: 0.98 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -20, scale: 0.98 }}
								transition={{
									duration: 0.3,
									ease: [0.21, 0.47, 0.32, 0.98],
								}}
								className="absolute inset-4 lg:inset-6"
							>
								<ActiveMockup
									isActive={activeStep === steps.findIndex((s) => s.mockup === ActiveMockup)}
								/>
							</motion.div>
						</AnimatePresence>
					</div>
				</BlurFade>
			</div>
		</SectionWrapper>
	);
}
