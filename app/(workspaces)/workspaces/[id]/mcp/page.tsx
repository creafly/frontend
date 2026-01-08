"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
	IconLoader2,
	IconServer,
	IconPlayerPlay,
	IconPlayerStop,
	IconClock,
	IconCopy,
	IconExternalLink,
	IconBook,
	IconSearch,
	IconPlus,
} from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { useResolveTenantSlug } from "@/hooks/use-api";
import { useSecrets } from "@/hooks/use-secrets";
import {
	useMCPServers,
	useMCPInstances,
	useCreateMCPInstance,
	useStopMCPInstance,
	useExtendMCPInstance,
} from "@/hooks/use-mcp";
import Container from "@/components/container";
import { Icon, TypographyH1, TypographyMuted, TypographyP } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import { CardPagination } from "@/components/ui/card-pagination";
import type { MCPServer } from "@/types/mcp";

const ITEMS_PER_PAGE = 10;

interface CreateFormData {
	serverName: string;
	ttlHours: number;
	secrets: Record<string, string>;
	envVars: Record<string, string>;
}

const initialFormData: CreateFormData = {
	serverName: "",
	ttlHours: 1,
	secrets: {},
	envVars: {},
};

export default function MCPPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const t = useTranslations();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [showStopped, setShowStopped] = useState(false);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [stopInstanceId, setStopInstanceId] = useState<string | null>(null);
	const [extendInstanceId, setExtendInstanceId] = useState<string | null>(null);
	const [extendHours, setExtendHours] = useState(1);
	const [formData, setFormData] = useState<CreateFormData>(initialFormData);
	const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);

	const activeTab = searchParams.get("tab") || "documentation";
	const setActiveTab = (tab: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("tab", tab);
		router.replace(`?${params.toString()}`, { scroll: false });
	};

	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
	const { data: resolvedTenant, isLoading: isResolving } = useResolveTenantSlug(
		isUUID ? undefined : id
	);
	const resolvedTenantId = isUUID ? id : resolvedTenant?.id;

	const { data: servers, isLoading: isServersLoading } = useMCPServers(resolvedTenantId || "");
	const { data: instancesData, isLoading: isInstancesLoading } = useMCPInstances(
		resolvedTenantId || "",
		{
			limit: ITEMS_PER_PAGE,
			offset: (currentPage - 1) * ITEMS_PER_PAGE,
		}
	);

	const { data: secretsData } = useSecrets(resolvedTenantId || "", { limit: 100 });

	const createInstance = useCreateMCPInstance();
	const stopInstance = useStopMCPInstance();
	const extendInstance = useExtendMCPInstance();

	const allInstances = instancesData?.items || [];
	const secrets = secretsData?.secrets || [];
	const isLoading = isResolving;

	const instances = showStopped
		? allInstances
		: allInstances.filter((instance) => instance.status !== "stopped");

	const filteredCount = instances.length;
	const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);

	const filteredServers = (servers || []).filter(
		(server) =>
			server.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			server.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleOpenCreate = (server: MCPServer) => {
		setSelectedServer(server);
		setFormData({
			serverName: server.name,
			ttlHours: Math.min(1, server.maxTtlHours),
			secrets: {},
			envVars: {},
		});
		setIsCreateOpen(true);
	};

	const handleCloseCreate = () => {
		setIsCreateOpen(false);
		setSelectedServer(null);
		setFormData(initialFormData);
	};

	const handleCreate = async () => {
		if (!resolvedTenantId || !selectedServer) return;

		try {
			await createInstance.mutateAsync({
				tenantId: resolvedTenantId,
				request: {
					serverName: formData.serverName,
					ttlHours: formData.ttlHours,
					secrets: formData.secrets,
					envVars: Object.keys(formData.envVars).length > 0 ? formData.envVars : undefined,
				},
			});
			toast.success(t.mcp.createDialog.created);
			handleCloseCreate();
			setActiveTab("instances");
		} catch {
			toast.error(t.mcp.createDialog.createFailed);
		}
	};

	const handleStop = async () => {
		if (!stopInstanceId || !resolvedTenantId) return;

		try {
			await stopInstance.mutateAsync({
				tenantId: resolvedTenantId,
				instanceId: stopInstanceId,
			});
			toast.success(t.mcp.stopDialog.stopped);
			setStopInstanceId(null);
		} catch {
			toast.error(t.mcp.stopDialog.stopFailed);
		}
	};

	const handleExtend = async () => {
		if (!extendInstanceId || !resolvedTenantId) return;

		try {
			await extendInstance.mutateAsync({
				tenantId: resolvedTenantId,
				instanceId: extendInstanceId,
				request: { additionalHours: extendHours },
			});
			toast.success(t.mcp.extendDialog.extended);
			setExtendInstanceId(null);
			setExtendHours(1);
		} catch {
			toast.error(t.mcp.extendDialog.extendFailed);
		}
	};

	const handleCopyUrl = async (url: string) => {
		await navigator.clipboard.writeText(url);
		toast.success(t.mcp.instances.urlCopied);
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

	return (
		<Container className="max-w-full">
			<div className="flex flex-wrap items-center justify-between mb-6 gap-2">
				<div>
					<TypographyH1 size="sm">{t.mcp.title}</TypographyH1>
					<TypographyMuted>{t.mcp.subtitle}</TypographyMuted>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="mb-6">
					<TabsTrigger value="documentation">
						<Icon icon={IconBook} size="sm" className="mr-2" />
						{t.mcp.tabs.documentation}
					</TabsTrigger>
					<TabsTrigger value="servers">
						<Icon icon={IconServer} size="sm" className="mr-2" />
						{t.mcp.tabs.servers}
					</TabsTrigger>
					<TabsTrigger value="instances">
						<Icon icon={IconPlayerPlay} size="sm" className="mr-2" />
						{t.mcp.tabs.instances}
						{allInstances.filter((i) => i.status !== "stopped").length > 0 && (
							<Badge variant="secondary" className="ml-2">
								{allInstances.filter((i) => i.status !== "stopped").length}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="documentation" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>{t.mcp.documentation.whatIsMcp}</CardTitle>
						</CardHeader>
						<CardContent>
							<TypographyP className="text-muted-foreground">
								{t.mcp.documentation.whatIsMcpDescription}
							</TypographyP>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t.mcp.documentation.howItWorks}</CardTitle>
						</CardHeader>
						<CardContent>
							<TypographyP className="text-muted-foreground">
								{t.mcp.documentation.howItWorksDescription}
							</TypographyP>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t.mcp.documentation.gettingStarted}</CardTitle>
						</CardHeader>
						<CardContent>
							<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
								<li>{t.mcp.documentation.gettingStartedSteps.step1}</li>
								<li>{t.mcp.documentation.gettingStartedSteps.step2}</li>
								<li>{t.mcp.documentation.gettingStartedSteps.step3}</li>
								<li>{t.mcp.documentation.gettingStartedSteps.step4}</li>
							</ol>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t.mcp.documentation.useCases}</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="list-disc list-inside space-y-2 text-muted-foreground">
								<li>{t.mcp.documentation.useCasesItems.automation}</li>
								<li>{t.mcp.documentation.useCasesItems.integration}</li>
								<li>{t.mcp.documentation.useCasesItems.development}</li>
							</ul>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="servers" className="space-y-6">
					<div className="relative max-w-md">
						<Icon
							icon={IconSearch}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							placeholder={t.mcp.servers.searchPlaceholder}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					{isServersLoading ? (
						<div className="flex items-center justify-center min-h-48">
							<Icon icon={IconLoader2} size="xl" className="animate-spin text-muted-foreground" />
						</div>
					) : filteredServers.length === 0 ? (
						<Empty className="min-h-80 border-2 border-dashed">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Icon icon={IconServer} size="lg" className="text-muted-foreground" />
								</EmptyMedia>
								<EmptyTitle>{t.mcp.servers.noServers}</EmptyTitle>
								<EmptyDescription>{t.mcp.servers.noServersDescription}</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{filteredServers.map((server) => (
								<Card key={server.name} className="flex flex-col">
									<CardHeader>
										<div className="flex items-center gap-3">
											<Icon icon={IconServer} size="lg" className="text-primary" />
											<div>
												<CardTitle className="text-lg">{server.displayName}</CardTitle>
												<CardDescription>{server.description}</CardDescription>
											</div>
										</div>
									</CardHeader>
									<CardContent className="flex-1 space-y-3">
										<div className="flex items-center gap-2 text-sm">
											<span className="text-muted-foreground">{t.mcp.servers.protocol}:</span>
											<Badge variant="outline">{server.protocol.toUpperCase()}</Badge>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<span className="text-muted-foreground">{t.mcp.servers.maxTtl}:</span>
											<span>{server.maxTtlHours}h</span>
										</div>
										{server.requiredSecrets.length > 0 && (
											<div className="text-sm">
												<span className="text-muted-foreground">
													{t.mcp.servers.requiredSecrets}:
												</span>
												<div className="flex flex-wrap gap-1 mt-1">
													{server.requiredSecrets.map((s) => (
														<Badge key={s.envName} variant="secondary" className="text-xs">
															{s.displayName}
														</Badge>
													))}
												</div>
											</div>
										)}
									</CardContent>
									<div className="p-4 pt-0">
										<Button onClick={() => handleOpenCreate(server)} className="w-full">
											<Icon icon={IconPlayerPlay} className="mr-2" />
											{t.mcp.servers.launchServer}
										</Button>
									</div>
								</Card>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="instances" className="space-y-6">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="show-stopped"
							checked={showStopped}
							onCheckedChange={(checked) => setShowStopped(checked === true)}
						/>
						<Label htmlFor="show-stopped" className="text-sm cursor-pointer">
							{t.mcp.instances.showStopped}
						</Label>
					</div>

					{isInstancesLoading ? (
						<div className="flex items-center justify-center min-h-48">
							<Icon icon={IconLoader2} size="xl" className="animate-spin text-muted-foreground" />
						</div>
					) : instances.length === 0 ? (
						<Empty className="min-h-80 border-2 border-dashed">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Icon icon={IconPlayerPlay} size="lg" className="text-muted-foreground" />
								</EmptyMedia>
								<EmptyTitle>{t.mcp.instances.noInstances}</EmptyTitle>
								<EmptyDescription>{t.mcp.instances.noInstancesDescription}</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<Button onClick={() => setActiveTab("servers")}>
									<Icon icon={IconPlus} className="mr-2" />
									{t.mcp.instances.createInstance}
								</Button>
							</EmptyContent>
						</Empty>
					) : (
						<>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t.mcp.instances.columns.server}</TableHead>
											<TableHead>{t.mcp.instances.columns.status}</TableHead>
											<TableHead>{t.mcp.instances.columns.connectionUrl}</TableHead>
											<TableHead>{t.mcp.instances.columns.expiresAt}</TableHead>
											<TableHead className="text-right">
												{t.mcp.instances.columns.actions}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{instances.map((instance) => (
											<TableRow key={instance.id}>
												<TableCell className="font-medium">{instance.serverName}</TableCell>
												<TableCell>{getStatusBadge(instance.status)}</TableCell>
												<TableCell>
													{instance.connectionUrl ? (
														<div className="flex items-center gap-2">
															<code className="text-xs bg-muted px-2 py-1 rounded max-w-48 truncate">
																{instance.connectionUrl}
															</code>
															<Button
																variant="ghost"
																size="icon"
																className="h-7 w-7"
																onClick={() => handleCopyUrl(instance.connectionUrl!)}
															>
																<Icon icon={IconCopy} size="sm" />
															</Button>
														</div>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell>{new Date(instance.expiresAt).toLocaleString()}</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end gap-1">
														<Link href={`/workspaces/${id}/mcp/${instance.id}`}>
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<Icon icon={IconExternalLink} size="sm" />
															</Button>
														</Link>
														{instance.status === "running" && (
															<>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8"
																	onClick={() => setExtendInstanceId(instance.id)}
																>
																	<Icon icon={IconClock} size="sm" />
																</Button>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8 text-destructive hover:text-destructive"
																	onClick={() => setStopInstanceId(instance.id)}
																>
																	<Icon icon={IconPlayerStop} size="sm" />
																</Button>
															</>
														)}
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{totalPages > 1 && (
								<CardPagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={setCurrentPage}
									totalItems={filteredCount}
									itemsPerPage={ITEMS_PER_PAGE}
									labels={{
										previous: t.common.previous,
										next: t.common.next,
										of: t.common.of,
										showing: t.common.showing,
										items: t.common.items,
									}}
								/>
							)}
						</>
					)}
				</TabsContent>
			</Tabs>

			<Dialog open={isCreateOpen} onOpenChange={(open) => !open && handleCloseCreate()}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>{t.mcp.createDialog.title}</DialogTitle>
						<DialogDescription>
							{selectedServer?.displayName} - {t.mcp.createDialog.description}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						{selectedServer?.requiredSecrets && selectedServer.requiredSecrets.length > 0 && (
							<div className="space-y-3">
								<Label>{t.mcp.createDialog.mapSecrets}</Label>
								<TypographyMuted className="text-xs">
									{t.mcp.createDialog.mapSecretsDescription}
								</TypographyMuted>
								{selectedServer.requiredSecrets.map((spec) => (
									<div key={spec.envName} className="grid gap-2">
										<Label className="text-sm">{spec.displayName}</Label>
										<Select
											value={formData.secrets[spec.envName] || ""}
											onValueChange={(value) =>
												setFormData((prev) => ({
													...prev,
													secrets: { ...prev.secrets, [spec.envName]: value },
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder={t.mcp.createDialog.selectSecret} />
											</SelectTrigger>
											<SelectContent>
												{secrets.map((secret) => (
													<SelectItem key={secret.id} value={secret.name}>
														{secret.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<TypographyMuted className="text-xs">{spec.description}</TypographyMuted>
									</div>
								))}
							</div>
						)}

						{selectedServer?.optionalEnvVars && selectedServer.optionalEnvVars.length > 0 && (
							<div className="space-y-3">
								<Label>{t.mcp.createDialog.configureEnvVars}</Label>
								<TypographyMuted className="text-xs">
									{t.mcp.createDialog.configureEnvVarsDescription}
								</TypographyMuted>
								{selectedServer.optionalEnvVars.map((spec) => (
									<div key={spec.envName} className="grid gap-2">
										<Label className="text-sm">{spec.displayName}</Label>
										<Input
											placeholder={spec.defaultValue}
											value={formData.envVars[spec.envName] || ""}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													envVars: { ...prev.envVars, [spec.envName]: e.target.value },
												}))
											}
										/>
										<TypographyMuted className="text-xs">{spec.description}</TypographyMuted>
									</div>
								))}
							</div>
						)}

						<div className="grid gap-2">
							<Label>{t.mcp.createDialog.setTtl}</Label>
							<div className="flex items-center gap-2">
								<Input
									type="number"
									min={1}
									max={selectedServer?.maxTtlHours || 24}
									value={formData.ttlHours}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											ttlHours: parseInt(e.target.value) || 1,
										}))
									}
									className="w-24"
								/>
								<span className="text-sm text-muted-foreground">{t.mcp.createDialog.ttlHours}</span>
							</div>
							<TypographyMuted className="text-xs">
								{t.mcp.createDialog.maxTtlNote.replace(
									"{hours}",
									String(selectedServer?.maxTtlHours || 24)
								)}
							</TypographyMuted>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleCloseCreate}>
							{t.common.cancel}
						</Button>
						<Button
							onClick={handleCreate}
							disabled={
								createInstance.isPending ||
								(selectedServer?.requiredSecrets?.some((s) => !formData.secrets[s.envName]) ??
									false)
							}
						>
							{createInstance.isPending && (
								<Icon icon={IconLoader2} className="mr-2 animate-spin" />
							)}
							{t.mcp.servers.launchServer}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!stopInstanceId}
				onOpenChange={(open) => !open && setStopInstanceId(null)}
			>
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

			<Dialog open={!!extendInstanceId} onOpenChange={(open) => !open && setExtendInstanceId(null)}>
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
						<Button variant="outline" onClick={() => setExtendInstanceId(null)}>
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
