"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
	IconArrowLeft,
	IconLoader2,
	IconCopy,
	IconClock,
	IconPlayerStop,
	IconRefresh,
	IconDownload,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useResolveTenantSlug } from "@/hooks/use-api";
import {
	useMCPInstance,
	useMCPInstanceLogs,
	useStopMCPInstance,
	useExtendMCPInstance,
} from "@/hooks/use-mcp";
import Container from "@/components/container";
import { Icon, TypographyH1, TypographyMuted, TypographyP } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MCPInstancePage({
	params,
}: {
	params: Promise<{ id: string; instanceId: string }>;
}) {
	const { id, instanceId } = use(params);
	const t = useTranslations();

	const [isStopOpen, setIsStopOpen] = useState(false);
	const [isExtendOpen, setIsExtendOpen] = useState(false);
	const [extendHours, setExtendHours] = useState(1);
	const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);
	const logsEndRef = useRef<HTMLDivElement>(null);

	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
	const { data: resolvedTenant, isLoading: isResolving } = useResolveTenantSlug(
		isUUID ? undefined : id
	);
	const resolvedTenantId = isUUID ? id : resolvedTenant?.id;

	const { data: instance, isLoading: isInstanceLoading } = useMCPInstance(
		resolvedTenantId || "",
		instanceId
	);
	const { data: logsData, refetch: refetchLogs } = useMCPInstanceLogs(
		resolvedTenantId || "",
		instanceId,
		200
	);

	const stopInstance = useStopMCPInstance();
	const extendInstance = useExtendMCPInstance();

	const isLoading = isResolving || isInstanceLoading;

	useEffect(() => {
		if (autoRefreshLogs && logsEndRef.current) {
			logsEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [logsData, autoRefreshLogs]);

	const handleStop = async () => {
		if (!resolvedTenantId) return;

		try {
			await stopInstance.mutateAsync({
				tenantId: resolvedTenantId,
				instanceId,
			});
			toast.success(t.mcp.stopDialog.stopped);
			setIsStopOpen(false);
		} catch {
			toast.error(t.mcp.stopDialog.stopFailed);
		}
	};

	const handleExtend = async () => {
		if (!resolvedTenantId) return;

		try {
			await extendInstance.mutateAsync({
				tenantId: resolvedTenantId,
				instanceId,
				request: { additionalHours: extendHours },
			});
			toast.success(t.mcp.extendDialog.extended);
			setIsExtendOpen(false);
			setExtendHours(1);
		} catch {
			toast.error(t.mcp.extendDialog.extendFailed);
		}
	};

	const handleCopyUrl = async () => {
		if (instance?.connectionUrl) {
			await navigator.clipboard.writeText(instance.connectionUrl);
			toast.success(t.mcp.instances.urlCopied);
		}
	};

	const handleDownloadLogs = () => {
		if (!logsData?.logs) return;
		const blob = new Blob([logsData.logs], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `mcp-instance-${instanceId}-logs.txt`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const getStatusBadge = (status: string) => {
		const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
			running: "default",
			starting: "secondary",
			pending: "secondary",
			stopping: "secondary",
			stopped: "outline",
			failed: "destructive",
		};
		return (
			<Badge variant={variants[status] || "outline"}>
				{t.mcp.instances.status[status as keyof typeof t.mcp.instances.status] || status}
			</Badge>
		);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full min-h-96">
				<Icon icon={IconLoader2} size="xl" className="animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!instance) {
		return (
			<Container className="max-w-full">
				<div className="flex flex-col items-center justify-center min-h-96">
					<TypographyMuted className="mb-4">Instance not found</TypographyMuted>
					<Link href={`/workspaces/${id}/mcp?tab=instances`}>
						<Button variant="outline">
							<Icon icon={IconArrowLeft} className="mr-2" />
							Back to Instances
						</Button>
					</Link>
				</div>
			</Container>
		);
	}

	return (
		<Container className="max-w-full">
			<div className="flex flex-wrap items-center justify-between mb-6 gap-4">
				<div className="flex items-center gap-4">
					<Link href={`/workspaces/${id}/mcp?tab=instances`}>
						<Button variant="ghost" size="icon">
							<Icon icon={IconArrowLeft} />
						</Button>
					</Link>
					<div>
						<div className="flex items-center gap-3">
							<TypographyH1 size="sm">{instance.serverName}</TypographyH1>
							{getStatusBadge(instance.status)}
						</div>
						<TypographyMuted>ID: {instance.id}</TypographyMuted>
					</div>
				</div>
				{instance.status === "running" && (
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setIsExtendOpen(true)}>
							<Icon icon={IconClock} className="mr-2" />
							{t.mcp.instances.extendInstance}
						</Button>
						<Button variant="destructive" onClick={() => setIsStopOpen(true)}>
							<Icon icon={IconPlayerStop} className="mr-2" />
							{t.mcp.instances.stopInstance}
						</Button>
					</div>
				)}
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_2fr] h-[calc(100vh-12rem)]">
				<div className="space-y-6">
					<div>
						<TypographyMuted className="text-xs uppercase tracking-wide mb-4">
							{t.mcp.instances.viewDetails}
						</TypographyMuted>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<TypographyMuted className="text-xs">{t.common.status}</TypographyMuted>
								<div className="mt-1">{getStatusBadge(instance.status)}</div>
							</div>
							<div>
								<TypographyMuted className="text-xs">{t.mcp.instances.ttl}</TypographyMuted>
								<TypographyP className="mt-1">{instance.ttlHours}h</TypographyP>
							</div>
							<div>
								<TypographyMuted className="text-xs">{t.mcp.instances.expiresAt}</TypographyMuted>
								<TypographyP className="mt-1">
									{new Date(instance.expiresAt).toLocaleString()}
								</TypographyP>
							</div>
							{instance.startedAt && (
								<div>
									<TypographyMuted className="text-xs">{t.mcp.instances.startedAt}</TypographyMuted>
									<TypographyP className="mt-1">
										{new Date(instance.startedAt).toLocaleString()}
									</TypographyP>
								</div>
							)}
							{instance.stoppedAt && (
								<div>
									<TypographyMuted className="text-xs">{t.mcp.instances.stoppedAt}</TypographyMuted>
									<TypographyP className="mt-1">
										{new Date(instance.stoppedAt).toLocaleString()}
									</TypographyP>
								</div>
							)}
						</div>
					</div>

					{instance.connectionUrl && (
						<div>
							<TypographyMuted className="text-xs mb-2">
								{t.mcp.instances.connectionUrl}
							</TypographyMuted>
							<div className="flex items-center gap-2">
								<code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md break-all">
									{instance.connectionUrl}
								</code>
								<Button variant="outline" size="icon" onClick={handleCopyUrl}>
									<Icon icon={IconCopy} />
								</Button>
							</div>
						</div>
					)}

					{instance.errorMessage && (
						<div>
							<TypographyMuted className="text-xs mb-1">
								{t.mcp.instances.errorMessage}
							</TypographyMuted>
							<div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
								{instance.errorMessage}
							</div>
						</div>
					)}
				</div>

				<Card className="flex flex-col h-full">
					<CardHeader className="shrink-0">
						<div className="flex items-center justify-between">
							<CardTitle>{t.mcp.logs.title}</CardTitle>
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<Switch
										checked={autoRefreshLogs}
										onCheckedChange={setAutoRefreshLogs}
										id="auto-refresh"
									/>
									<Label htmlFor="auto-refresh" className="text-xs">
										{t.mcp.logs.autoRefresh}
									</Label>
								</div>
								<Button variant="ghost" size="icon" onClick={() => refetchLogs()}>
									<Icon icon={IconRefresh} />
								</Button>
								<Button variant="ghost" size="icon" onClick={handleDownloadLogs}>
									<Icon icon={IconDownload} />
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent className="flex-1 overflow-hidden">
						<div className="bg-muted rounded-md p-4 h-full overflow-auto font-mono text-xs">
							{logsData?.logs ? (
								<>
									<pre className="whitespace-pre-wrap">{logsData.logs}</pre>
									<div ref={logsEndRef} />
								</>
							) : (
								<TypographyMuted>{t.mcp.logs.noLogs}</TypographyMuted>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<AlertDialog open={isStopOpen} onOpenChange={setIsStopOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.mcp.stopDialog.title}</AlertDialogTitle>
						<AlertDialogDescription>{t.mcp.stopDialog.description}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleStop}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{stopInstance.isPending && <Icon icon={IconLoader2} className="mr-2 animate-spin" />}
							{t.mcp.instances.stopInstance}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog open={isExtendOpen} onOpenChange={setIsExtendOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.mcp.extendDialog.title}</DialogTitle>
						<DialogDescription>{t.mcp.extendDialog.description}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label>{t.mcp.extendDialog.additionalHours}</Label>
							<div className="flex items-center gap-2">
								<Input
									type="number"
									min={1}
									max={24}
									value={extendHours}
									onChange={(e) => setExtendHours(parseInt(e.target.value) || 1)}
									className="w-24"
								/>
								<span className="text-sm text-muted-foreground">{t.mcp.createDialog.ttlHours}</span>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsExtendOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button onClick={handleExtend} disabled={extendInstance.isPending}>
							{extendInstance.isPending && (
								<Icon icon={IconLoader2} className="mr-2 animate-spin" />
							)}
							{t.mcp.instances.extendInstance}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Container>
	);
}
