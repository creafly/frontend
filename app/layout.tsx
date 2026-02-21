import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { BlockedUserProvider } from "@/providers/blocked-user-provider";
import { PermissionsProvider } from "@/providers/permissions-provider";
import { TenantPermissionsProvider } from "@/providers/tenant-permissions-provider";
// import { CookieConsentProvider } from "@/providers/cookie-consent-provider";
import { ServerErrorProvider } from "@/providers/server-error-provider";
import { FeatureFlagsProvider } from "@/providers/feature-flags-provider";
import { Toaster } from "@/components/ui/sonner";
// import { CookieBanner } from "@/components/cookie-banner";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://creafly.ai";

export const metadata: Metadata = {
	title: {
		default: "Creafly - AI-Powered Email Template Generation",
		template: "%s | Creafly",
	},
	description:
		"Create beautiful, responsive email templates in minutes with AI. Creafly helps marketers and developers build professional emails faster.",
	keywords: [
		"email templates",
		"AI email generator",
		"email marketing",
		"responsive emails",
		"email design",
		"marketing automation",
		"email builder",
	],
	authors: [{ name: "Creafly" }],
	creator: "Creafly",
	publisher: "Creafly",
	metadataBase: new URL(siteUrl),
	alternates: {
		canonical: "/",
		languages: {
			"en-US": "/en",
			"ru-RU": "/ru",
		},
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		alternateLocale: "ru_RU",
		url: siteUrl,
		siteName: "Creafly",
		title: "Creafly - AI-Powered Email Template Generation",
		description:
			"Create beautiful, responsive email templates in minutes with AI. Creafly helps marketers and developers build professional emails faster.",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Creafly - AI Email Template Generator",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Creafly - AI-Powered Email Template Generation",
		description: "Create beautiful, responsive email templates in minutes with AI.",
		images: ["/og-image.png"],
		creator: "@creafly",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
	],
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={figtree.variable} suppressHydrationWarning>
			<body className="antialiased font-sans">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<FeatureFlagsProvider>
						<QueryProvider>
							<AuthProvider>
								<PermissionsProvider>
									<TenantPermissionsProvider>
										<I18nProvider>
											<BlockedUserProvider>
												{/* <CookieConsentProvider> */}
												<ServerErrorProvider>
													{children}
													{/* <CookieBanner /> */}
													<Toaster />
												</ServerErrorProvider>
												{/* </CookieConsentProvider> */}
											</BlockedUserProvider>
										</I18nProvider>
									</TenantPermissionsProvider>
								</PermissionsProvider>
							</AuthProvider>
						</QueryProvider>
					</FeatureFlagsProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
