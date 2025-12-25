"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TypographyH4 } from "@/components/typography";
import Container from "@/components/container";

interface NavItem {
	label: string;
	href: string;
}

export function LandingHeader() {
	const t = useTranslations();

	const navItems: NavItem[] = [
		{ label: t.landing.navFeatures, href: "#features" },
		{ label: t.landing.navHowItWorks, href: "#how-it-works" },
		{ label: t.landing.testimonials, href: "#testimonials" },
	];

	const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		if (href.startsWith("#")) {
			e.preventDefault();
			const element = document.querySelector(href);
			if (element) {
				const headerOffset = 80;
				const elementPosition = element.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.scrollY - headerOffset;

				window.scrollTo({
					top: offsetPosition,
					behavior: "smooth",
				});
			}
		}
	};

	return (
		<header className="fixed top-0 z-50 w-full backdrop-blur-xs border-b border-foreground/5">
			<Container className="py-0">
				<div className="flex h-14 items-center justify-between">
					<div className="flex items-center gap-8">
						<Link
							href="/"
							className="flex items-center gap-2 transition-opacity hover:opacity-70"
						>
							<Image src="/logo.svg" alt="Creafly" width={28} height={28} />
							<TypographyH4 size="sm" className="font-semibold">
								{t.landing.footer}
							</TypographyH4>
						</Link>
						<nav className="hidden md:flex items-center gap-1">
							{navItems.map((item) => (
								<Button
									key={item.href}
									variant="ghost"
									size="sm"
									className="text-muted-foreground"
									asChild
								>
									<a href={item.href} onClick={(e) => handleNavClick(e, item.href)}>
										{item.label}
									</a>
								</Button>
							))}
						</nav>
					</div>
					<div className="flex items-center gap-1">
						<ThemeToggle />
						<LanguageSwitcher />
						<div className="hidden sm:flex items-center gap-2 ml-2">
							<Button variant="ghost" size="sm" asChild>
								<Link href="/login">{t.landing.signIn}</Link>
							</Button>
							<Button size="sm" className="rounded-full px-4" asChild>
								<Link href="/register">{t.landing.getStarted}</Link>
							</Button>
						</div>
					</div>
				</div>
			</Container>
		</header>
	);
}
