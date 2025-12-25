"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	IconAlertCircle,
	IconCircleCheck,
	IconLoader2,
	IconRefresh,
	IconHome,
	IconArrowLeft,
} from "@tabler/icons-react";
import { submitErrorReport } from "@/lib/api/support";
import type { CreateErrorReportRequest } from "@/types/support";
import { useTranslations } from "@/providers/i18n-provider";
import { useRouter } from "next/navigation";
import { TypographyError, TypographySuccess, TypographyMuted, Icon } from "@/components/typography";

export default function WorkspaceError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations();
	const router = useRouter();
	const [isReporting, setIsReporting] = useState(false);
	const [reportSubmitted, setReportSubmitted] = useState(false);
	const [reportError, setReportError] = useState<string | null>(null);
	const [additionalDetails, setAdditionalDetails] = useState("");

	useEffect(() => {
		console.error("Workspace error:", error);
	}, [error]);

	const handleReportError = async () => {
		setIsReporting(true);
		setReportError(null);

		try {
			const metadata: Record<string, unknown> = {};
			if (additionalDetails) {
				metadata.userDescription = additionalDetails;
			}
			if (error.digest) {
				metadata.digest = error.digest;
			}

			const request: CreateErrorReportRequest = {
				error_code: 500,
				error_message: error.message,
				stack_trace: error.stack,
				url: typeof window !== "undefined" ? window.location.href : "",
				user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
				metadata: JSON.stringify(metadata),
			};

			await submitErrorReport(request);
			setReportSubmitted(true);
		} catch (err) {
			console.error("Failed to submit error report:", err);
			setReportError(t.support.reportFailed);
		} finally {
			setIsReporting(false);
		}
	};

	const handleGoBack = () => {
		router.back();
	};

	const handleGoToWorkspaces = () => {
		router.push("/workspaces");
	};

	return (
		<div className="h-full flex-1 flex items-center justify-center p-4">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Icon icon={IconAlertCircle} size="lg" className="text-destructive" />
						<CardTitle>{t.support.somethingWentWrong}</CardTitle>
					</div>
					<CardDescription>{t.support.errorDescription}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-3 bg-muted rounded-md">
						<TypographyMuted className="font-mono break-all">{error.message}</TypographyMuted>
						{error.digest && (
							<TypographyMuted className="text-xs mt-1">
								{t.support.errorCode}: {error.digest}
							</TypographyMuted>
						)}
					</div>

					{reportSubmitted ? (
						<div className="flex items-center gap-2 p-3 bg-success/10 rounded-md">
							<Icon icon={IconCircleCheck} size="md" className="text-success" />
							<TypographySuccess>
								{t.support.reportSubmitted}
							</TypographySuccess>
						</div>
					) : (
						<div className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="additional-details">{t.support.additionalDetails}</Label>
								<Textarea
									id="additional-details"
									placeholder={t.support.additionalDetailsPlaceholder}
									value={additionalDetails}
									onChange={(e) => setAdditionalDetails(e.target.value)}
									rows={3}
								/>
							</div>

							{reportError && <TypographyError>{reportError}</TypographyError>}

							<Button
								onClick={handleReportError}
								disabled={isReporting}
								variant="outline"
								className="w-full"
							>
								{isReporting ? (
									<>
										<Icon icon={IconLoader2} size="sm" className="mr-2 animate-spin" />
										{t.common.loading}
									</>
								) : (
									t.support.reportIssue
								)}
							</Button>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex gap-2">
					<Button variant="outline" onClick={handleGoBack} className="flex-1">
						<Icon icon={IconArrowLeft} size="sm" className="mr-2" />
						{t.support.goBack}
					</Button>
					<Button variant="outline" onClick={reset} className="flex-1">
						<Icon icon={IconRefresh} size="sm" className="mr-2" />
						{t.support.tryAgain}
					</Button>
					<Button onClick={handleGoToWorkspaces} className="flex-1">
						<Icon icon={IconHome} size="sm" className="mr-2" />
						{t.workspaces.title}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
