"use client";

import Link from "next/link";
import { useTranslations } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { IconArrowLeft } from "@tabler/icons-react";
import {
	TypographyArticle,
	TypographyH1,
	TypographyH2,
	TypographyP,
	TypographyMuted,
	TypographyList,
	TypographyListItem,
	TypographyLink,
} from "@/components/typography";

export default function TermsPage() {
	const t = useTranslations();

	return (
		<div className="min-h-screen bg-background">
			<Container className="py-12">
				<div className="mb-8">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/">
							<IconArrowLeft className="mr-2 h-4 w-4" />
							{t.legal.backToHome}
						</Link>
					</Button>
				</div>

				<TypographyArticle>
					<TypographyH1>{t.legal.termsTitle}</TypographyH1>
					<TypographyMuted className="mt-2">{t.legal.termsLastUpdated}</TypographyMuted>

					<TypographyH2>{t.legal.termsAcceptanceTitle}</TypographyH2>
					<TypographyP>{t.legal.termsAcceptanceText}</TypographyP>

					<TypographyH2>{t.legal.termsDescriptionTitle}</TypographyH2>
					<TypographyP>{t.legal.termsDescriptionText}</TypographyP>

					<TypographyH2>{t.legal.termsAccountsTitle}</TypographyH2>
					<TypographyP>{t.legal.termsAccountsText}</TypographyP>

					<TypographyH2>{t.legal.termsAcceptableUseTitle}</TypographyH2>
					<TypographyP>{t.legal.termsAcceptableUseIntro}</TypographyP>
					<TypographyList>
						<TypographyListItem>{t.legal.termsAcceptableUse1}</TypographyListItem>
						<TypographyListItem>{t.legal.termsAcceptableUse2}</TypographyListItem>
						<TypographyListItem>{t.legal.termsAcceptableUse3}</TypographyListItem>
						<TypographyListItem>{t.legal.termsAcceptableUse4}</TypographyListItem>
						<TypographyListItem>{t.legal.termsAcceptableUse5}</TypographyListItem>
					</TypographyList>

					<TypographyH2>{t.legal.termsIPTitle}</TypographyH2>
					<TypographyP>{t.legal.termsIPText}</TypographyP>

					<TypographyH2>{t.legal.termsAIContentTitle}</TypographyH2>
					<TypographyP>{t.legal.termsAIContentText}</TypographyP>

					<TypographyH2>{t.legal.termsPrivacyTitle}</TypographyH2>
					<TypographyP>
						{t.legal.termsPrivacyText}{" "}
						<TypographyLink href="/privacy">{t.legal.privacyTitle}</TypographyLink>
					</TypographyP>

					<TypographyH2>{t.legal.termsLiabilityTitle}</TypographyH2>
					<TypographyP>{t.legal.termsLiabilityText}</TypographyP>

					<TypographyH2>{t.legal.termsChangesTitle}</TypographyH2>
					<TypographyP>{t.legal.termsChangesText}</TypographyP>

					<TypographyH2>{t.legal.termsContactTitle}</TypographyH2>
					<TypographyP>
						{t.legal.termsContactText}{" "}
						<TypographyLink href="mailto:legal@hexaend.ai" external>
							legal@hexaend.ai
						</TypographyLink>
					</TypographyP>
				</TypographyArticle>
			</Container>
		</div>
	);
}
