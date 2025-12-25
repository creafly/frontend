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
import { Field, FieldError } from "@/components/ui/field";
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
import { useFieldErrors } from "@/hooks/use-field-errors";
import { renderBlocksToHtml } from "@/lib/render-blocks";
import { getTenantId } from "@/lib/tenant";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { BlurFade } from "@/components/ui/blur-fade";
import Container from "@/components/container";
import { TypographyH3, TypographyP, TypographyMuted, Icon } from "@/components/typography";

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

	const { fieldErrors, handleError, clearFieldError, clearAllErrors } = useFieldErrors<
		"name" | "subject" | "type" | "description"
	>();

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
		clearAllErrors();

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
			handleError(error, t.errors.createFailed);
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
								<Icon icon={IconArrowLeft} size="sm" className="mr-2" />
								{t.nav.templates}
							</Link>
						</Button>
					</div>
				</div>
			</Container>
		);
	}

	return (
		<Container className="h-full max-w-full">
			<div className="h-full space-y-6 flex flex-col gap-2">
				<BlurFade delay={0.1}>
					<div className="flex items-center gap-4">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button variant="ghost" size="icon" asChild>
								<Link href={`/workspaces/${workspaceId}/templates`}>
									<Icon icon={IconArrowLeft} size="sm" />
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
									<Field data-invalid={!!fieldErrors.name}>
										<Label htmlFor="name" className="text-sm font-medium">
											{t.templateForm.name}
										</Label>
										<Input
											id="name"
											value={name}
											onChange={(e) => {
												setName(e.target.value);
												clearFieldError("name");
											}}
											placeholder={t.templateForm.namePlaceholder}
											required
											className="transition-all focus:shadow-lg focus:shadow-primary/10"
										/>
										<FieldError>{fieldErrors.name}</FieldError>
										<TypographyMuted className="text-xs">{t.templateForm.nameHelp}</TypographyMuted>
									</Field>

									<Field data-invalid={!!fieldErrors.subject}>
										<Label htmlFor="subject" className="text-sm font-medium">
											{t.templateForm.subject}
										</Label>
										<Input
											id="subject"
											value={subject}
											onChange={(e) => {
												setSubject(e.target.value);
												clearFieldError("subject");
											}}
											placeholder={t.templateForm.subjectPlaceholder}
											required
											className="transition-all focus:shadow-lg focus:shadow-primary/10"
										/>
										<FieldError>{fieldErrors.subject}</FieldError>
										<TypographyMuted className="text-xs">
											{t.templateForm.subjectHelp}
										</TypographyMuted>
									</Field>

									<Field data-invalid={!!fieldErrors.type}>
										<Label htmlFor="type" className="text-sm font-medium">
											{t.templateForm.type}
										</Label>
										{isLoadingTypes ? (
											<Skeleton className="h-10 w-full" />
										) : (
											<Select
												value={templateType}
												onValueChange={(value) => {
													if (value) {
														setSelectedType(value);
														clearFieldError("type");
													}
												}}
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
										<FieldError>{fieldErrors.type}</FieldError>
										<TypographyMuted className="text-xs">
											{currentTypeInfo?.description ??
												t.templates.typeDescriptions[
													templateType as keyof typeof t.templates.typeDescriptions
												]}
										</TypographyMuted>
									</Field>

									<Field data-invalid={!!fieldErrors.description}>
										<Label htmlFor="description" className="text-sm font-medium">
											{t.templateForm.description}
										</Label>
										<Textarea
											id="description"
											value={description}
											onChange={(e) => {
												setDescription(e.target.value);
												clearFieldError("description");
											}}
											placeholder={t.templateForm.descriptionPlaceholder}
											rows={3}
											className="resize-none transition-all focus:shadow-lg focus:shadow-primary/10"
										/>
										<FieldError>{fieldErrors.description}</FieldError>
										<TypographyMuted className="text-xs">
											{t.templateForm.descriptionHelp}
										</TypographyMuted>
									</Field>

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
												<Icon icon={IconPlus} size="sm" className="mr-2" />
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
