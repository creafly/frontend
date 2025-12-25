"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	IconWand,
	IconLoader2,
	IconCheck,
	IconX,
	IconAlertCircle,
	IconExternalLink,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import {
	Icon,
	TypographyH4,
	TypographyMuted,
	TypographyError,
	TypographyP,
	TypographyLabel,
} from "@/components/typography";
import {
	useLatestParsingRequest,
	useCreateParsingRequest,
	useApproveParsingRequest,
	useRejectParsingRequest,
} from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParsingStatus } from "@/types/branding";

interface AutoFillSectionProps {
	tenantId: string;
}

const statusConfig: Record<ParsingStatus, { color: string; label: string }> = {
	pending: { color: "bg-warning", label: "Pending" },
	processing: { color: "bg-info", label: "Processing" },
	completed: { color: "bg-success", label: "Completed" },
	failed: { color: "bg-destructive", label: "Failed" },
	approved: { color: "bg-success", label: "Approved" },
	rejected: { color: "bg-muted", label: "Rejected" },
};

export function AutoFillSection({ tenantId }: AutoFillSectionProps) {
	const t = useTranslations();
	const [websiteUrl, setWebsiteUrl] = useState("");

	const { data: latestRequest } = useLatestParsingRequest(tenantId);
	const createParsing = useCreateParsingRequest();
	const approveParsing = useApproveParsingRequest();
	const rejectParsing = useRejectParsingRequest();

	const parsingRequest = latestRequest && "status" in latestRequest ? latestRequest : null;
	const isProcessing =
		parsingRequest?.status === "pending" || parsingRequest?.status === "processing";
	const isCompleted = parsingRequest?.status === "completed";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!websiteUrl.trim()) return;

		try {
			await createParsing.mutateAsync({
				tenantId,
				request: { websiteUrl: websiteUrl.trim() },
			});
			toast.success(t.branding.parsingStarted);
		} catch {
			toast.error(t.branding.parsingFailed);
		}
	};

	const handleApprove = async () => {
		if (!parsingRequest) return;
		try {
			await approveParsing.mutateAsync({
				tenantId,
				requestId: parsingRequest.id,
			});
			toast.success(t.branding.brandingApplied);
		} catch {
			toast.error(t.branding.approveFailed);
		}
	};

	const handleReject = async () => {
		if (!parsingRequest) return;
		try {
			await rejectParsing.mutateAsync({
				tenantId,
				requestId: parsingRequest.id,
			});
			toast.info(t.branding.parsingRejected);
		} catch {
			toast.error(t.branding.rejectFailed);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Icon icon={IconWand} size="md" />
					{t.branding.autoFill}
				</CardTitle>
				<CardDescription>{t.branding.autoFillDescription}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
					<Input
						type="url"
						placeholder="https://example.com"
						value={websiteUrl}
						onChange={(e) => setWebsiteUrl(e.target.value)}
						disabled={isProcessing || createParsing.isPending}
						className="flex-1"
					/>
					<Button
						type="submit"
						disabled={!websiteUrl.trim() || isProcessing || createParsing.isPending}
					>
						{createParsing.isPending ? (
							<Icon icon={IconLoader2} size="sm" className="animate-spin" />
						) : (
							<Icon icon={IconWand} size="sm" />
						)}
						<span className="ml-2">{t.branding.parse}</span>
					</Button>
				</form>

				{isProcessing && parsingRequest && (
					<div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
						<Icon icon={IconLoader2} size="md" className="animate-spin text-info" />
						<div className="flex-1">
							<TypographyP className="font-medium mt-0">{t.branding.parsingInProgress}</TypographyP>
							<TypographyMuted>{parsingRequest.websiteUrl}</TypographyMuted>
						</div>
						<Badge className={statusConfig[parsingRequest.status].color}>
							{statusConfig[parsingRequest.status].label}
						</Badge>
					</div>
				)}

				{parsingRequest?.status === "failed" && (
					<div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
						<Icon icon={IconAlertCircle} size="md" className="text-destructive" />
						<div className="flex-1">
							<TypographyError className="font-medium">{t.branding.parsingFailed}</TypographyError>
							<TypographyMuted>
								{parsingRequest.errorMessage || t.branding.tryAgain}
							</TypographyMuted>
						</div>
					</div>
				)}

				{isCompleted && parsingRequest && (
					<div className="space-y-4 border rounded-lg p-4">
						<div className="flex items-center justify-between">
							<TypographyH4>{t.branding.parsedResults}</TypographyH4>
							<a
								href={parsingRequest.websiteUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
							>
								{parsingRequest.websiteUrl}
								<Icon icon={IconExternalLink} size="xs" />
							</a>
						</div>

						{(parsingRequest.parsedCompanyName || parsingRequest.parsedTagline) && (
							<div className="space-y-1">
								{parsingRequest.parsedCompanyName && (
									<TypographyP className="font-semibold text-lg mt-0">
										{parsingRequest.parsedCompanyName}
									</TypographyP>
								)}
								{parsingRequest.parsedTagline && (
									<TypographyMuted>{parsingRequest.parsedTagline}</TypographyMuted>
								)}
							</div>
						)}

						{parsingRequest.parsedLogos && parsingRequest.parsedLogos.length > 0 && (
							<div className="space-y-2">
								<TypographyLabel className="text-muted-foreground">
									{t.branding.logos} ({parsingRequest.parsedLogos.length})
								</TypographyLabel>
								<div className="flex flex-wrap gap-3">
									{parsingRequest.parsedLogos.map((logo, idx) => (
										<div key={idx} className="border rounded-lg p-2 bg-background">
											<img
												src={logo.url}
												alt={logo.type || `Logo ${idx + 1}`}
												className="max-h-12 max-w-32 object-contain"
											/>
											{logo.type && (
												<TypographyMuted className="text-xs mt-1 text-center">
													{logo.type}
												</TypographyMuted>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						{parsingRequest.parsedColors && parsingRequest.parsedColors.length > 0 && (
							<div className="space-y-2">
								<TypographyLabel className="text-muted-foreground">
									{t.branding.colors} ({parsingRequest.parsedColors.length})
								</TypographyLabel>
								<div className="flex flex-wrap gap-2">
									{parsingRequest.parsedColors.map((color, idx) => (
										<div key={idx} className="flex items-center gap-2 border rounded-lg px-2 py-1">
											<div
												className="w-6 h-6 rounded border"
												style={{ backgroundColor: color.value }}
											/>
											<div className="text-sm">
												<span className="font-mono">{color.value}</span>
												{color.name && (
													<span className="text-muted-foreground ml-1">({color.name})</span>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{parsingRequest.parsedFonts && parsingRequest.parsedFonts.length > 0 && (
							<div className="space-y-2">
								<TypographyLabel className="text-muted-foreground">
									{t.branding.fonts} ({parsingRequest.parsedFonts.length})
								</TypographyLabel>
								<div className="flex flex-wrap gap-2">
									{parsingRequest.parsedFonts.map((font, idx) => (
										<Badge key={idx} variant="secondary">
											{font.fontFamily}
											{font.fontWeight && (
												<span className="text-muted-foreground ml-1">· {font.fontWeight}</span>
											)}
										</Badge>
									))}
								</div>
							</div>
						)}

						{parsingRequest.parsedSpacings && parsingRequest.parsedSpacings.length > 0 && (
							<div className="space-y-2">
								<TypographyLabel className="text-muted-foreground">
									{t.branding.spacings} ({parsingRequest.parsedSpacings.length})
								</TypographyLabel>
								<div className="flex flex-wrap gap-2">
									{parsingRequest.parsedSpacings.map((spacing, idx) => (
										<Badge key={idx} variant="outline">
											{spacing.name}: {spacing.value}px
										</Badge>
									))}
								</div>
							</div>
						)}

						{parsingRequest.parsedRadii && parsingRequest.parsedRadii.length > 0 && (
							<div className="space-y-2">
								<TypographyLabel className="text-muted-foreground">
									{t.branding.radii} ({parsingRequest.parsedRadii.length})
								</TypographyLabel>
								<div className="flex flex-wrap gap-2">
									{parsingRequest.parsedRadii.map((radius, idx) => (
										<div key={idx} className="flex items-center gap-2 border rounded-lg px-2 py-1">
											<div
												className="w-6 h-6 bg-muted border"
												style={{ borderRadius: `${radius.value}px` }}
											/>
											<span className="text-sm">
												{radius.name}: {radius.value}px
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="flex gap-2 pt-4 border-t">
							<Button
								onClick={handleApprove}
								disabled={approveParsing.isPending || rejectParsing.isPending}
								className="flex-1"
							>
								{approveParsing.isPending ? (
									<Icon icon={IconLoader2} size="sm" className="animate-spin mr-2" />
								) : (
									<Icon icon={IconCheck} size="sm" className="mr-2" />
								)}
								{t.branding.applyBranding}
							</Button>
							<Button
								variant="outline"
								onClick={handleReject}
								disabled={approveParsing.isPending || rejectParsing.isPending}
							>
								{rejectParsing.isPending ? (
									<Icon icon={IconLoader2} size="sm" className="animate-spin mr-2" />
								) : (
									<Icon icon={IconX} size="sm" className="mr-2" />
								)}
								{t.branding.reject}
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
