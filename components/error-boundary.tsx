"use client";

import React, { Component, ErrorInfo, ReactNode, useState } from "react";
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
import { useAuth } from "@/providers/auth-provider";
import { TypographyError, TypographySuccess, TypographyMuted, Icon } from "@/components/typography";

interface ErrorBoundaryContentProps {
	error: Error | null;
	errorInfo: ErrorInfo | null;
	onReset: () => void;
	onGoBack: () => void;
	onGoHome: () => void;
}

function ErrorBoundaryContent({
	error,
	errorInfo,
	onReset,
	onGoBack,
	onGoHome,
}: ErrorBoundaryContentProps) {
	const t = useTranslations();
	const { tokens } = useAuth();
	const [isReporting, setIsReporting] = useState(false);
	const [reportSubmitted, setReportSubmitted] = useState(false);
	const [reportError, setReportError] = useState<string | null>(null);
	const [additionalDetails, setAdditionalDetails] = useState("");

	const handleReportError = async () => {
		setIsReporting(true);
		setReportError(null);

		try {
			if (!error) {
				setIsReporting(false);
				return;
			}

			const metadata: Record<string, unknown> = {};
			if (additionalDetails) {
				metadata.userDescription = additionalDetails;
			}
			if (errorInfo?.componentStack) {
				metadata.componentStack = errorInfo.componentStack;
			}

			const request: CreateErrorReportRequest = {
				error_code: 500,
				error_message: error.message,
				stack_trace: error.stack,
				url: typeof window !== "undefined" ? window.location.href : "",
				user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
				metadata: JSON.stringify(metadata),
			};

			await submitErrorReport(request, tokens?.accessToken);
			setReportSubmitted(true);
			setIsReporting(false);
		} catch (err) {
			console.error("Failed to submit error report:", err);
			setIsReporting(false);
			setReportError(t.support.reportFailed);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-background/20">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Icon icon={IconAlertCircle} size="lg" className="text-destructive" />
						<CardTitle>{t.support.somethingWentWrong}</CardTitle>
					</div>
					<CardDescription>{t.support.errorDescription}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<div className="p-3 bg-muted rounded-md">
							<TypographyMuted className="font-mono break-all">{error.message}</TypographyMuted>
						</div>
					)}

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
										{t.common.sending}
									</>
								) : (
									t.support.submitReport
								)}
							</Button>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex gap-2">
					<Button variant="outline" onClick={onGoBack} className="flex-1">
						<Icon icon={IconArrowLeft} size="sm" className="mr-2" />
						{t.support.goBack}
					</Button>
					<Button variant="outline" onClick={onReset} className="flex-1">
						<Icon icon={IconRefresh} size="sm" className="mr-2" />
						{t.support.tryAgain}
					</Button>
					<Button onClick={onGoHome} className="flex-1">
						<Icon icon={IconHome} size="sm" className="mr-2" />
						{t.support.goHome}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ errorInfo });
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	handleGoBack = () => {
		if (typeof window !== "undefined") {
			window.history.back();
		}
	};

	handleGoHome = () => {
		if (typeof window !== "undefined") {
			window.location.href = "/";
		}
	};

	render() {
		const { children, fallback } = this.props;
		const { hasError, error, errorInfo } = this.state;

		if (hasError) {
			if (fallback) {
				return fallback;
			}

			return (
				<ErrorBoundaryContent
					error={error}
					errorInfo={errorInfo}
					onReset={this.handleReset}
					onGoBack={this.handleGoBack}
					onGoHome={this.handleGoHome}
				/>
			);
		}

		return children;
	}
}

export default ErrorBoundary;
