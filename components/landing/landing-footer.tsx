"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/providers/i18n-provider";
import { TypographyMuted } from "@/components/typography";
import Container from "@/components/container";

interface FooterLink {
	label: string;
	href: string;
}

interface FooterSection {
	title: string;
	links: FooterLink[];
}

export function LandingFooter() {
	const t = useTranslations();

	const footerSections: FooterSection[] = [
		// {
		// 	title: t.landing.footerProduct,
		// 	links: [
		// 		{ label: t.landing.getStarted, href: "/register" },
		// 		{ label: t.landing.signIn, href: "/login" },
		// 	],
		// },
		// {
		// 	title: t.landing.footerResources,
		// 	links: [{ label: t.landing.footerStatus, href: "/status" }],
		// },
		// {
		// 	title: t.landing.footerLegal,
		// 	links: [
		// 		{ label: t.auth.termsLink, href: "/terms" },
		// 		{ label: t.auth.privacyLink, href: "/privacy" },
		// 	],
		// },
	];

	return (
		<footer className="border-t py-12">
			<Container className="py-0">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					<div className="flex flex-col gap-3">
						<Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
							<Image src="/logo.svg" alt="Creafly" width={24} height={24} />
							<span className="font-semibold">{t.landing.footer}</span>
						</Link>
						<TypographyMuted>{t.landing.footerTagline}</TypographyMuted>
					</div>

					{footerSections.map((section) => (
						<div key={section.title} className="flex flex-col gap-3">
							<span className="text-sm font-medium">{section.title}</span>
							{section.links.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									{link.label}
								</Link>
							))}
						</div>
					))}
				</div>
			</Container>
		</footer>
	);
}
