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

export default function PrivacyPage() {
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
					<TypographyH1>{t.legal.privacyTitle}</TypographyH1>
					<TypographyMuted className="mt-2">{t.legal.privacyLastUpdated}</TypographyMuted>

					<TypographyH2>{t.legal.privacyCollectTitle}</TypographyH2>
					<TypographyP>{t.legal.privacyCollectIntro}</TypographyP>
					<TypographyList>
						<TypographyListItem>{t.legal.privacyCollect1}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyCollect2}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyCollect3}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyCollect4}</TypographyListItem>
					</TypographyList>

					<TypographyH2>{t.legal.privacyAutoCollectTitle}</TypographyH2>
					<TypographyP>{t.legal.privacyAutoCollectIntro}</TypographyP>
					<TypographyList>
						<TypographyListItem>{t.legal.privacyAutoCollect1}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyAutoCollect2}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyAutoCollect3}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyAutoCollect4}</TypographyListItem>
					</TypographyList>

					<TypographyH2>{t.legal.privacyUseTitle}</TypographyH2>
					<TypographyP>{t.legal.privacyUseIntro}</TypographyP>
					<TypographyList>
						<TypographyListItem>{t.legal.privacyUse1}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyUse2}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyUse3}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyUse4}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyUse5}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyUse6}</TypographyListItem>
					</TypographyList>

					<TypographyH2>{t.legal.privacySharingTitle}</TypographyH2>
					<TypographyP>{t.legal.privacySharingIntro}</TypographyP>
					<TypographyList>
						<TypographyListItem>{t.legal.privacySharing1}</TypographyListItem>
						<TypographyListItem>{t.legal.privacySharing2}</TypographyListItem>
						<TypographyListItem>{t.legal.privacySharing3}</TypographyListItem>
						<TypographyListItem>{t.legal.privacySharing4}</TypographyListItem>
					</TypographyList>

					<TypographyH2>{t.legal.privacySecurityTitle}</TypographyH2>
					<TypographyP>{t.legal.privacySecurityText}</TypographyP>

					<TypographyH2>{t.legal.privacyRetentionTitle}</TypographyH2>
					<TypographyP>{t.legal.privacyRetentionText}</TypographyP>

					<TypographyH2>{t.legal.privacyRightsTitle}</TypographyH2>
					<TypographyP>{t.legal.privacyRightsIntro}</TypographyP>
					<TypographyList>
						<TypographyListItem>{t.legal.privacyRights1}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyRights2}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyRights3}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyRights4}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyRights5}</TypographyListItem>
						<TypographyListItem>{t.legal.privacyRights6}</TypographyListItem>
					</TypographyList>

					<TypographyH2>{t.legal.privacyCookiesTitle}</TypographyH2>
					<TypographyP>{t.legal.privacyCookiesText}</TypographyP>

					<TypographyH2>{t.legal.privacyTransfersTitle}</TypographyH2>
					<TypographyP>{t.legal.privacyTransfersText}</TypographyP>

					<TypographyH2>{t.legal.privacyChildrenTitle}</TypographyH2>
					<TypographyP>{t.legal.privacyChildrenText}</TypographyP>

					<TypographyH2>{t.legal.privacyChangesTitle}</TypographyH2>
					<TypographyP>{t.legal.privacyChangesText}</TypographyP>

					<TypographyH2>{t.legal.privacyContactTitle}</TypographyH2>
					<TypographyP>
						{t.legal.privacyContactText}{" "}
						<TypographyLink href="mailto:privacy@creafly.ai" external>
							privacy@creafly.ai
						</TypographyLink>
					</TypographyP>

					<TypographyH2>{t.legal.privacyRelatedTitle}</TypographyH2>
					<TypographyP>
						{t.legal.privacyRelatedText}{" "}
						<TypographyLink href="/terms">{t.legal.termsTitle}</TypographyLink>
					</TypographyP>
				</TypographyArticle>
			</Container>
		</div>
	);
}
