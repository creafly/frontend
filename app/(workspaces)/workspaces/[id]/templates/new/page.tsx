"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EmailPreview } from "@/components/email-preview";
import { useCreateTemplate, useTemplateTypes, useSampleBlocks } from "@/hooks/use-api";
import { useTranslations } from "@/providers/i18n-provider";
import { useTenantPermissions, TENANT_PERMISSIONS } from "@/providers/tenant-permissions-provider";
import { renderBlocksToHtml } from "@/lib/render-blocks";
import { getTenantId } from "@/lib/tenant";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { BlurFade } from "@/components/ui/blur-fade";
import Container from "@/components/container";
import { TypographyH3, TypographyP } from "@/components/typography";

export default function NewTemplatePage() {
	const router = useRouter();
	const params = useParams();
	const workspaceId = params.id as string;
	const createTemplate = useCreateTemplate();
	const t = useTranslations();
	const { hasAnyPermission, isLoading: permissionsLoading } = useTenantPermissions();
	const canCreate = hasAnyPermission(
		TENANT_PERMISSIONS.TEMPLATES_CREATE,
		TENANT_PERMISSIONS.TEMPLATES_MANAGE
	);

	const [name, setName] = useState("");
	const [subject, setSubject] = useState("");
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const [description, setDescription] = useState("");

	const { data: templateTypesResponse, isLoading: isLoadingTypes } = useTemplateTypes();

	const templateTypes = useMemo(() => {
		if (templateTypesResponse?.types) {
			return templateTypesResponse.types;
		}
		return [];
	}, [templateTypesResponse]);

	const templateType = useMemo(() => {
		if (selectedType && templateTypes.find((t) => t.type === selectedType)) {
			return selectedType;
		}
		if (templateTypes.length > 0) {
			return templateTypes[0].type;
		}
		return "media_digest";
	}, [selectedType, templateTypes]);

	const { data: sampleBlocksResponse } = useSampleBlocks(templateType, subject);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim() || !subject.trim()) {
			toast.error(t.templateForm.nameSubjectRequired);
			return;
		}

		try {
			const tenantId = getTenantId();
			if (!tenantId) {
				toast.error("No tenant selected");
				return;
			}

			const result = await createTemplate.mutateAsync({
				tenantId,
				name: name.trim(),
				subject: subject.trim(),
				template: templateType,
				props: description ? { description } : {},
				blocks: templateType === "media_digest" ? [] : undefined,
			});

			toast.success(t.templates.templateCreated);

			if (result.template?.id) {
				router.push(`/workspaces/${workspaceId}/templates/${result.template.id}/edit`);
			} else {
				router.push(`/workspaces/${workspaceId}/templates`);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t.errors.createFailed);
		}
	};

	const sampleBlocks = sampleBlocksResponse?.blocks ?? [];
	const previewHtml = renderBlocksToHtml(sampleBlocks);

	const currentTypeInfo = templateTypes.find((t) => t.type === templateType);

	if (!permissionsLoading && !canCreate) {
		return (
			<Container className="h-full">
				<div className="flex items-center justify-center h-full">
					<div className="text-center">
						<TypographyH3>{t.common.accessDenied}</TypographyH3>
						<TypographyP className="text-muted-foreground mt-2">
							{t.common.noPermission}
						</TypographyP>
						<Button asChild className="mt-4">
							<Link href={`/workspaces/${workspaceId}/templates`}>
								<IconArrowLeft className="size-4 mr-2" />
								{t.nav.templates}
							</Link>
						</Button>
					</div>
				</div>
			</Container>
		);
	}

	return (
		<Container className="h-full">
			<div className="h-full space-y-6 flex flex-col gap-2">
				<BlurFade delay={0.1}>
					<div className="flex items-center gap-4">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button variant="ghost" size="icon" asChild>
								<Link href={`/workspaces/${workspaceId}/templates`}>
									<IconArrowLeft className="size-4" />
								</Link>
							</Button>
						</motion.div>
						<div>
							<TypographyH3>{t.templateForm.createTitle}</TypographyH3>
							<TypographyP className="text-muted-foreground">
								{t.templateForm.createSubtitle}
							</TypographyP>
						</div>
					</div>
				</BlurFade>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
					<BlurFade delay={0.2}>
						<form onSubmit={handleSubmit}>
							<Card clear>
								<CardHeader className="pb-4">
									<CardTitle>{t.templateForm.details}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-5">
									<div className="space-y-2">
										<Label htmlFor="name" className="text-sm font-medium">
											{t.templateForm.name}
										</Label>
										<Input
											id="name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder={t.templateForm.namePlaceholder}
											required
											className="transition-all focus:shadow-lg focus:shadow-primary/10"
										/>
										<p className="text-xs text-muted-foreground">{t.templateForm.nameHelp}</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="subject" className="text-sm font-medium">
											{t.templateForm.subject}
										</Label>
										<Input
											id="subject"
											value={subject}
											onChange={(e) => setSubject(e.target.value)}
											placeholder={t.templateForm.subjectPlaceholder}
											required
											className="transition-all focus:shadow-lg focus:shadow-primary/10"
										/>
										<p className="text-xs text-muted-foreground">{t.templateForm.subjectHelp}</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="type" className="text-sm font-medium">
											{t.templateForm.type}
										</Label>
										{isLoadingTypes ? (
											<Skeleton className="h-10 w-full" />
										) : (
											<Select
												value={templateType}
												onValueChange={(value) => value && setSelectedType(value)}
											>
												<SelectTrigger className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{templateTypes.map((type) => (
														<SelectItem key={type.type} value={type.type}>
															{t.templates.types[type.type as keyof typeof t.templates.types] ??
																type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
										<p className="text-xs text-muted-foreground">
											{currentTypeInfo?.description ??
												t.templates.typeDescriptions[
													templateType as keyof typeof t.templates.typeDescriptions
												]}
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description" className="text-sm font-medium">
											{t.templateForm.description}
										</Label>
										<Textarea
											id="description"
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder={t.templateForm.descriptionPlaceholder}
											rows={3}
											className="resize-none transition-all focus:shadow-lg focus:shadow-primary/10"
										/>
										<p className="text-xs text-muted-foreground">
											{t.templateForm.descriptionHelp}
										</p>
									</div>

									<div className="flex justify-end gap-3 pt-4">
										<Button variant="outline" asChild>
											<Link href={`/workspaces/${workspaceId}/templates`}>{t.common.cancel}</Link>
										</Button>
										<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
											<Button
												type="submit"
												disabled={createTemplate.isPending}
												className="shadow-lg shadow-primary/20"
											>
												<IconPlus className="size-4 mr-2" />
												{createTemplate.isPending ? t.common.creating : t.templates.createTemplate}
											</Button>
										</motion.div>
									</div>
								</CardContent>
							</Card>
						</form>
					</BlurFade>

					<BlurFade delay={0.3}>
						<div className="h-full lg:sticky lg:top-6">
							<EmailPreview html={previewHtml} height="100%" />
						</div>
					</BlurFade>
				</div>
			</div>
		</Container>
	);
}
