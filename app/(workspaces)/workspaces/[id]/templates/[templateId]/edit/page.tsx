"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTenantId } from "@/lib/tenant";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortableBlockList } from "@/components/editor/sortable-block-list";
import { BlocksPalette } from "@/components/editor/blocks-palette";
import { EditorDndProvider } from "@/components/editor/editor-dnd-provider";
import { EmailPreview } from "@/components/email-preview";
import { InteractivePreview } from "@/components/editor/interactive-preview";
import { RefinementChat } from "@/components/editor/refinement-chat";
import { useTemplate, useUpdateTemplate } from "@/hooks/use-api";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTranslations } from "@/providers/i18n-provider";
import { useTenantPermissions, TENANT_PERMISSIONS } from "@/providers/tenant-permissions-provider";
import { renderBlocksToHtml } from "@/lib/render-blocks";
import { parseBlocks, propsToBlocks } from "@/lib/utils/blocks";
import { removeBlockAtPath, updateBlockAtPath } from "@/lib/utils/block-path";
import { cn } from "@/lib/utils";
import {
	IconArrowLeft,
	IconDeviceFloppy,
	IconLayoutList,
	IconPencil,
	IconLayoutSidebarRight,
	IconSparkles,
	IconMenu2,
} from "@tabler/icons-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	Icon,
	TypographyH1,
	TypographyH2,
	TypographyError,
	TypographyMuted,
} from "@/components/typography";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import type { Block } from "@/types";

interface EditState {
	loadedTemplateId: string | null;
	name: string | null;
	subject: string | null;
	isActive: boolean | null;
	blocks: Block[] | null;
}

export default function TemplateEditPage({
	params,
}: {
	params: Promise<{ id: string; templateId: string }>;
}) {
	const [resolvedParams, setResolvedParams] = useState<{ id: string; templateId: string } | null>(
		null
	);

	useEffect(() => {
		params.then(setResolvedParams).catch(() => setResolvedParams(null));
	}, [params]);

	const { data, isLoading, error } = useTemplate(
		getTenantId() ?? "",
		resolvedParams?.templateId ?? ""
	);
	const updateTemplate = useUpdateTemplate();
	const t = useTranslations();
	const {
		hasAnyPermission,
		isLoading: permissionsLoading,
		tenantId: permissionsTenantId,
	} = useTenantPermissions();
	const isPermissionsReady = !!permissionsTenantId && !permissionsLoading;
	const canEdit = hasAnyPermission(
		TENANT_PERMISSIONS.TEMPLATES_UPDATE,
		TENANT_PERMISSIONS.TEMPLATES_MANAGE
	);

	const [editState, setEditState] = useState<EditState>({
		loadedTemplateId: null,
		name: null,
		subject: null,
		isActive: null,
		blocks: null,
	});

	const [activeTab, setActiveTab] = useState<string>("overview");
	const [selectedBlockPath, setSelectedBlockPath] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useLocalStorage("template-edit-sidebar", false);
	const [chatOpen, setChatOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const isMobile = useIsMobile();

	const templateId = data?.template?.id ?? null;

	const needsReset = templateId !== null && editState.loadedTemplateId !== templateId;

	const getInitialBlocks = (): Block[] => {
		if (!data?.template) return [];

		const template = data.template;

		if (template.blocks && Array.isArray(template.blocks) && template.blocks.length > 0) {
			return parseBlocks(template.blocks);
		}

		if (template.template === "media_digest") {
			return parseBlocks(template.blocks);
		}

		return propsToBlocks(template.template, template.props || {});
	};

	const initialBlocks = getInitialBlocks();

	const name = needsReset
		? data?.template?.name ?? ""
		: editState.name ?? data?.template?.name ?? "";
	const subject = needsReset
		? data?.template?.subject ?? ""
		: editState.subject ?? data?.template?.subject ?? "";
	const isActive = needsReset
		? data?.template?.isActive ?? true
		: editState.isActive ?? data?.template?.isActive ?? true;
	const blocks = needsReset ? initialBlocks : editState.blocks ?? initialBlocks;

	const hasChanges =
		!needsReset &&
		(editState.name !== null ||
			editState.subject !== null ||
			editState.isActive !== null ||
			editState.blocks !== null);

	const handleFieldChange = useCallback(
		<K extends keyof EditState>(field: K, value: EditState[K]) => {
			setEditState((prev) => ({
				...prev,
				loadedTemplateId: templateId,
				[field]: value,
			}));
		},
		[templateId]
	);

	const handleBlocksChange = useCallback(
		(newBlocks: Block[]) => {
			handleFieldChange("blocks", newBlocks);
		},
		[handleFieldChange]
	);

	const handleBlockUpdate = useCallback(
		(path: string, updatedBlock: Block) => {
			const newBlocks = updateBlockAtPath(blocks, path, updatedBlock);
			handleBlocksChange(newBlocks);
		},
		[blocks, handleBlocksChange]
	);

	const handleBlockDelete = useCallback(
		(path: string) => {
			const { blocks: newBlocks } = removeBlockAtPath(blocks, path);
			handleBlocksChange(newBlocks);
		},
		[blocks, handleBlocksChange]
	);

	const handleApplyRefinement = useCallback(
		(newBlocks: Block[], newSubject: string) => {
			handleBlocksChange(newBlocks);
			if (newSubject !== subject) {
				handleFieldChange("subject", newSubject);
			}
			toast.success(t.refinement.changesApplied);
		},
		[handleBlocksChange, handleFieldChange, subject, t.refinement.changesApplied]
	);

	const handleSave = async () => {
		if (!data?.template) return;

		try {
			const tenantId = getTenantId();
			if (!tenantId) {
				toast.error("No tenant selected");
				return;
			}
			await updateTemplate.mutateAsync({
				tenantId,
				id: data.template.id,
				input: {
					name,
					subject,
					isActive,
					blocks,
				},
			});
			toast.success(t.templates.templateSaved);
			setEditState({
				loadedTemplateId: data.template.id,
				name: null,
				subject: null,
				isActive: null,
				blocks: null,
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.saveFailed);
		}
	};

	const previewHtml = renderBlocksToHtml(blocks);

	if (error) {
		return (
			<div className="flex items-center justify-center h-full">
				<TypographyError>Error: {error.message}</TypographyError>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<div className="flex items-center gap-3">
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-6 w-48" />
					</div>
					<Skeleton className="h-9 w-24" />
				</div>
				<div className="flex-1 flex">
					<div className="flex-1 p-6">
						<Skeleton className="h-full w-full" />
					</div>
					<div className="w-80 border-l p-4 space-y-4">
						<Skeleton className="h-40" />
						<Skeleton className="h-60" />
					</div>
				</div>
			</div>
		);
	}

	const template = data?.template;
	if (!template) {
		return (
			<div className="flex items-center justify-center h-full">
				<TypographyMuted>Template not found</TypographyMuted>
			</div>
		);
	}

	if (!isPermissionsReady || !canEdit) {
		if (!isPermissionsReady) {
			return (
				<div className="flex items-center justify-center h-full">
					<Skeleton className="h-8 w-8 rounded-full" />
				</div>
			);
		}
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<TypographyH2 size="xs">{t.common.accessDenied}</TypographyH2>
					<TypographyMuted className="mt-2">{t.common.noPermission}</TypographyMuted>
					<Button asChild className="mt-4">
						<Link href={`/workspaces/${resolvedParams?.id}/templates/${template.id}`}>
							<Icon icon={IconArrowLeft} size="sm" className="mr-2" />
							{t.nav.templates}
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	const supportsBlockEditing = true;

	const renderSidebarContent = () => {
		if (activeTab === "visual-editor" && supportsBlockEditing) {
			return <BlocksPalette />;
		}

		return (
			<div>
				<Card className="rounded-none">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{t.templateForm.details}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="name">{t.templateForm.name}</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => handleFieldChange("name", e.target.value)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="subject">{t.templateForm.subject}</Label>
							<Input
								id="subject"
								value={subject}
								onChange={(e) => handleFieldChange("subject", e.target.value)}
								className="mt-1"
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="active">{t.common.active}</Label>
							<Switch
								id="active"
								checked={isActive}
								onCheckedChange={(checked) => handleFieldChange("isActive", checked)}
							/>
						</div>
					</CardContent>
				</Card>

				{supportsBlockEditing && (
					<Card className="rounded-none">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">
								{t.templateForm.blocks} ({blocks.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-full pr-4">
								<SortableBlockList blocks={blocks} onBlocksChange={handleBlocksChange} />
							</ScrollArea>
						</CardContent>
					</Card>
				)}

				{!supportsBlockEditing && (
					<Card className="rounded-none">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">{t.templateForm.templateProps}</CardTitle>
						</CardHeader>
						<CardContent>
							<pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-50">
								{JSON.stringify(template.props, null, 2)}
							</pre>
							<TypographyMuted className="mt-2">{t.templateForm.noBlockEditing}</TypographyMuted>
						</CardContent>
					</Card>
				)}
			</div>
		);
	};

	const renderMainContent = () => {
		if (activeTab === "visual-editor" && supportsBlockEditing) {
			return (
				<InteractivePreview
					blocks={blocks}
					selectedBlockPath={selectedBlockPath}
					onSelectBlock={setSelectedBlockPath}
					onBlockUpdate={handleBlockUpdate}
					onBlockDelete={handleBlockDelete}
				/>
			);
		}

		return (
			<div className="w-full h-full">
				<EmailPreview html={previewHtml} height="100%" />
			</div>
		);
	};

	const content = (
		<div className="flex flex-col h-full">
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="flex items-center justify-between border-b px-2 sm:px-4 py-2 sm:py-3 bg-background/80 backdrop-blur-sm shrink-0"
			>
				<div className="flex flex-1 items-center justify-between gap-2">
					<div className="flex items-center gap-2 sm:gap-3 min-w-0">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button variant="ghost" size="icon" className="shrink-0" asChild>
								<Link href={`/workspaces/${resolvedParams?.id}/templates/${template.id}`}>
									<Icon icon={IconArrowLeft} size="sm" />
								</Link>
							</Button>
						</motion.div>
						<div className="min-w-0 hidden sm:block">
							<TypographyH1 size="xs" className="font-semibold truncate">
								{t.templateForm.editTitle}
							</TypographyH1>
							<TypographyMuted className="truncate">{template.name}</TypographyMuted>
						</div>
						<TypographyMuted className="truncate sm:hidden text-sm font-medium">
							{template.name}
						</TypographyMuted>
					</div>

					<div className="hidden md:flex items-center gap-2">
						{supportsBlockEditing && (
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button
									variant={chatOpen ? "secondary" : "ghost"}
									size="icon"
									onClick={() => setChatOpen(!chatOpen)}
									title={t.refinement.title}
									className={cn("transition-colors", chatOpen && "bg-primary/10 text-primary")}
								>
									<Icon icon={IconSparkles} size="sm" />
								</Button>
							</motion.div>
						)}
						{supportsBlockEditing && (
							<Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
								<TabsList>
									<TabsTrigger value="overview">
										<Icon icon={IconLayoutList} size="sm" className="mr-1.5" />
										{t.templateForm.overviewTab}
									</TabsTrigger>
									<TabsTrigger value="visual-editor">
										<Icon icon={IconPencil} size="sm" className="mr-1.5" />
										{t.templateForm.visualEditorTab}
									</TabsTrigger>
								</TabsList>
							</Tabs>
						)}
						<motion.div
							whileHover={{ scale: hasChanges ? 1.02 : 1 }}
							whileTap={{ scale: hasChanges ? 0.98 : 1 }}
						>
							<Button
								onClick={handleSave}
								disabled={updateTemplate.isPending || !hasChanges}
								className={cn("transition-all", hasChanges && "shadow-lg shadow-primary/20")}
							>
								<Icon icon={IconDeviceFloppy} size="sm" className="mr-2" />
								{updateTemplate.isPending ? t.common.saving : t.common.save}
							</Button>
						</motion.div>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setSidebarOpen(!sidebarOpen)}
								title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
							>
								<Icon icon={IconLayoutSidebarRight} size="sm" />
							</Button>
						</motion.div>
					</div>

					<div className="flex md:hidden items-center gap-1">
						{supportsBlockEditing && (
							<Button
								variant={chatOpen ? "secondary" : "ghost"}
								size="icon"
								onClick={() => setChatOpen(!chatOpen)}
								className={cn("h-8 w-8", chatOpen && "bg-primary/10 text-primary")}
							>
								<Icon icon={IconSparkles} size="sm" />
							</Button>
						)}
						<Button
							onClick={handleSave}
							disabled={updateTemplate.isPending || !hasChanges}
							size="sm"
							className={cn("h-8 px-3", hasChanges && "shadow-lg shadow-primary/20")}
						>
							<Icon icon={IconDeviceFloppy} size="sm" className={hasChanges ? "mr-1" : ""} />
							{hasChanges && <span className="hidden xs:inline">{t.common.save}</span>}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setMobileMenuOpen(true)}
						>
							<Icon icon={IconMenu2} size="sm" />
						</Button>
					</div>
				</div>
			</motion.div>

			{supportsBlockEditing && isMobile && (
				<div className="border-b px-2 py-2 bg-background shrink-0">
					<Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)} className="w-full">
						<TabsList className="w-full">
							<TabsTrigger value="overview" className="flex-1">
								<Icon icon={IconLayoutList} size="sm" className="mr-1" />
								<span className="text-xs">{t.templateForm.overviewTab}</span>
							</TabsTrigger>
							<TabsTrigger value="visual-editor" className="flex-1">
								<Icon icon={IconPencil} size="sm" className="mr-1" />
								<span className="text-xs">{t.templateForm.visualEditorTab}</span>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			)}

			<div className="flex-1 flex overflow-hidden">
				<motion.div
					className="py-2 sm:py-4 flex-1 overflow-auto"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.1 }}
				>
					{renderMainContent()}
				</motion.div>

				<AnimatePresence mode="wait">
					{sidebarOpen && !isMobile && (
						<motion.div
							initial={{ width: 0, opacity: 0 }}
							animate={{ width: 320, opacity: 1 }}
							exit={{ width: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
							className="border-l overflow-hidden"
						>
							<div className="h-full w-80 overflow-auto">{renderSidebarContent()}</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
				<SheetContent side="right" className="w-full sm:w-80 p-0">
					<SheetHeader className="px-4 py-3 border-b">
						<SheetTitle>
							{activeTab === "visual-editor" ? t.templateForm.blocks : t.templateForm.details}
						</SheetTitle>
					</SheetHeader>
					<ScrollArea className="h-[calc(100vh-60px)]">{renderSidebarContent()}</ScrollArea>
				</SheetContent>
			</Sheet>
		</div>
	);

	if (supportsBlockEditing) {
		return (
			<EditorDndProvider blocks={blocks} onBlocksChange={handleBlocksChange}>
				{content}
				<RefinementChat
					templateType={template.template}
					subject={subject}
					blocks={blocks}
					props={template.props}
					onApplyChanges={handleApplyRefinement}
					isOpen={chatOpen}
					onClose={() => setChatOpen(false)}
					workspaceSlug={resolvedParams?.id ?? ""}
				/>
			</EditorDndProvider>
		);
	}

	return content;
}
