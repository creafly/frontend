"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/providers/i18n-provider";
import { useSubmitErrorReport } from "@/hooks/use-support";
import { IconAlertTriangle, IconSend, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

interface ServerErrorInfo {
	statusCode: number;
	message: string;
	url?: string;
	timestamp: string;
	userAgent?: string;
}

interface ServerErrorContextType {
	reportServerError: (error: ServerErrorInfo) => void;
}

const ServerErrorContext = createContext<ServerErrorContextType | null>(null);

export function useServerError() {
	const context = useContext(ServerErrorContext);
	if (!context) {
		throw new Error("useServerError must be used within ServerErrorProvider");
	}
	return context;
}

export function ServerErrorProvider({ children }: { children: ReactNode }) {
	const t = useTranslations();
	const [isOpen, setIsOpen] = useState(false);
	const [errorInfo, setErrorInfo] = useState<ServerErrorInfo | null>(null);
	const [additionalInfo, setAdditionalInfo] = useState("");

	const submitErrorReport = useSubmitErrorReport();

	const reportServerError = useCallback((error: ServerErrorInfo) => {
		if (error.statusCode >= 500) {
			setErrorInfo(error);
			setIsOpen(true);
		}
	}, []);

	const handleClose = () => {
		setIsOpen(false);
		setErrorInfo(null);
		setAdditionalInfo("");
	};

	const handleSubmitReport = async () => {
		if (!errorInfo) return;

		try {
			await submitErrorReport.mutateAsync({
				error_code: errorInfo.statusCode,
				error_message: errorInfo.message,
				url: errorInfo.url || window.location.href,
				user_agent: errorInfo.userAgent || navigator.userAgent,
				metadata: additionalInfo.trim() || undefined,
			});
			toast.success(t.support.ticketCreated);
			handleClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	return (
		<ServerErrorContext.Provider value={{ reportServerError }}>
			{children}
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
								<IconAlertTriangle className="size-5 text-destructive" />
							</div>
							<div>
								<DialogTitle>{t.support.serverError}</DialogTitle>
								<DialogDescription>
									{t.support.serverErrorDescription}
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					{errorInfo && (
						<div className="space-y-4">
							<div className="rounded-lg bg-muted p-3 text-sm space-y-1">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Error Code:</span>
									<span className="font-mono">{errorInfo.statusCode}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Time:</span>
									<span className="font-mono text-xs">
										{new Date(errorInfo.timestamp).toLocaleString()}
									</span>
								</div>
								{errorInfo.message && (
									<div className="pt-2 border-t">
										<span className="text-muted-foreground block mb-1">Message:</span>
										<span className="text-xs break-all">{errorInfo.message}</span>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<Label>{t.support.ticketDescription}</Label>
								<Textarea
									value={additionalInfo}
									onChange={(e) => setAdditionalInfo(e.target.value)}
									placeholder={t.support.ticketDescriptionPlaceholder}
									rows={3}
								/>
								<p className="text-xs text-muted-foreground">
									{t.support.createTicketFromError}
								</p>
							</div>
						</div>
					)}

					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="outline" onClick={handleClose}>
							<IconX className="size-4 mr-2" />
							{t.common.close}
						</Button>
						<Button
							onClick={handleSubmitReport}
							disabled={submitErrorReport.isPending}
						>
							<IconSend className="size-4 mr-2" />
							{submitErrorReport.isPending ? t.common.sending : t.support.createTicket}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</ServerErrorContext.Provider>
	);
}
