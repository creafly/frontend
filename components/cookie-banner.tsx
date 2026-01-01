"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "@/providers/i18n-provider";
import { useCookieConsent, CookiePreferences } from "@/providers/cookie-consent-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { IconCookie, IconSettings } from "@tabler/icons-react";

export function CookieBanner() {
	const t = useTranslations();
	const {
		showBanner,
		isSettingsOpen,
		acceptAll,
		acceptNecessary,
		savePreferences,
		openSettings,
		closeSettings,
		preferences,
	} = useCookieConsent();

	const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);

	const handleSavePreferences = () => {
		savePreferences(localPreferences);
	};

	if (!showBanner && !isSettingsOpen) {
		return null;
	}

	return (
		<>
			<AnimatePresence>
				{showBanner && !isSettingsOpen && (
					<motion.div
						initial={{ y: 100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 100, opacity: 0 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
					>
						<div className="mx-auto max-w-4xl rounded-lg border bg-background p-6 shadow-lg">
							<div className="flex items-start gap-4">
								<div className="hidden sm:block">
									<IconCookie className="h-8 w-8 text-primary" />
								</div>
								<div className="flex-1">
									<h3 className="mb-2 font-semibold">{t.cookies.title}</h3>
									<p className="mb-4 text-sm text-muted-foreground">
										{t.cookies.description}{" "}
										<Link href="/privacy" className="text-primary hover:underline">
											{t.auth.privacyLink}
										</Link>
									</p>
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
										<Button onClick={acceptAll} size="sm">
											{t.cookies.acceptAll}
										</Button>
										<Button onClick={acceptNecessary} variant="outline" size="sm">
											{t.cookies.acceptNecessary}
										</Button>
										<Button onClick={openSettings} variant="ghost" size="sm" className="gap-2">
											<IconSettings className="h-4 w-4" />
											{t.cookies.customize}
										</Button>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<Dialog open={isSettingsOpen} onOpenChange={closeSettings}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t.cookies.title}</DialogTitle>
					</DialogHeader>
					<div className="space-y-6 py-4">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>{t.cookies.necessary}</Label>
								<p className="text-xs text-muted-foreground">{t.cookies.necessaryDescription}</p>
							</div>
							<Switch checked disabled />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>{t.cookies.analytics}</Label>
								<p className="text-xs text-muted-foreground">{t.cookies.analyticsDescription}</p>
							</div>
							<Switch
								checked={localPreferences.analytics}
								onCheckedChange={(checked) =>
									setLocalPreferences((prev) => ({ ...prev, analytics: checked }))
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>{t.cookies.marketing}</Label>
								<p className="text-xs text-muted-foreground">{t.cookies.marketingDescription}</p>
							</div>
							<Switch
								checked={localPreferences.marketing}
								onCheckedChange={(checked) =>
									setLocalPreferences((prev) => ({ ...prev, marketing: checked }))
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={handleSavePreferences}>{t.cookies.savePreferences}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
