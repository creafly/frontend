import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { PermissionsProvider } from "@/providers/permissions-provider";
import { TenantPermissionsProvider } from "@/providers/tenant-permissions-provider";
import { CookieConsentProvider } from "@/providers/cookie-consent-provider";
import { ServerErrorProvider } from "@/providers/server-error-provider";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/cookie-banner";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "Content Agent",
	description: "AI-powered email template generation",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={outfit.variable} suppressHydrationWarning>
			<body className="antialiased font-sans">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<QueryProvider>
						<AuthProvider>
							<PermissionsProvider>
								<TenantPermissionsProvider>
									<I18nProvider>
										<CookieConsentProvider>
											<ServerErrorProvider>
												{children}
												<CookieBanner />
												<Toaster />
											</ServerErrorProvider>
										</CookieConsentProvider>
									</I18nProvider>
								</TenantPermissionsProvider>
							</PermissionsProvider>
						</AuthProvider>
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
