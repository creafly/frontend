"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BlockStyleEditor } from "./block-style-editor";
import { IconTrash, IconGripVertical, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import type { Block, BlockStyle } from "@/types";
import { cn } from "@/lib/utils";
import { TypographyMuted } from "@/components/typography";

interface SortableBlockItemProps {
	id: string;
	block: Block;
	index: number;
	onUpdate: (index: number, block: Block) => void;
	onDelete: (index: number) => void;
	isDropTarget?: boolean;
}

export function SortableBlockItem({
	id,
	block,
	index,
	onUpdate,
	onDelete,
	isDropTarget = false,
}: SortableBlockItemProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1000 : 1,
	};

	const updateField = (field: string, value: unknown) => {
		onUpdate(index, { ...block, [field]: value } as Block);
	};

	const updateStyle = (newStyle: BlockStyle) => {
		onUpdate(index, { ...block, style: newStyle } as Block);
	};

	const supportsStyle = block.type !== "spacer" && block.type !== "conditional";
	const blockStyle = "style" in block ? (block.style as BlockStyle | undefined) : undefined;

	const getBlockTitle = () => {
		switch (block.type) {
			case "text":
				return `Text: ${block.value.slice(0, 30)}${block.value.length > 30 ? "..." : ""}`;
			case "heading":
				return `${block.level.toUpperCase()}: ${block.text.slice(0, 30)}${
					block.text.length > 30 ? "..." : ""
				}`;
			case "image":
				return `Image: ${block.alt}`;
			case "button":
				return `Button: ${block.text}`;
			case "spacer":
				return `Spacer (${block.height || 16}px)`;
			case "divider":
				return "Divider";
			case "list":
				return `List (${block.items.length} items)`;
			case "footer":
				return `Footer: ${block.companyName}`;
			case "header":
				return `Header: ${block.title || "Logo"}`;
			default:
				return block.type;
		}
	};

	const renderFields = () => {
		switch (block.type) {
			case "text":
				return (
					<div className="space-y-3">
						<div>
							<Label htmlFor={`text-${index}`}>Content</Label>
							<Textarea
								id={`text-${index}`}
								value={block.value}
								onChange={(e) => updateField("value", e.target.value)}
								rows={4}
								className="mt-1"
							/>
						</div>
					</div>
				);

			case "heading":
				return (
					<div className="space-y-3">
						<div>
							<Label htmlFor={`heading-level-${index}`}>Level</Label>
							<Select value={block.level} onValueChange={(value) => updateField("level", value)}>
								<SelectTrigger id={`heading-level-${index}`} className="mt-1">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="h1">H1</SelectItem>
									<SelectItem value="h2">H2</SelectItem>
									<SelectItem value="h3">H3</SelectItem>
									<SelectItem value="h4">H4</SelectItem>
									<SelectItem value="h5">H5</SelectItem>
									<SelectItem value="h6">H6</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor={`heading-text-${index}`}>Text</Label>
							<Input
								id={`heading-text-${index}`}
								value={block.text}
								onChange={(e) => updateField("text", e.target.value)}
								className="mt-1"
							/>
						</div>
					</div>
				);

			case "image":
				return (
					<div className="space-y-3">
						<div>
							<Label htmlFor={`image-url-${index}`}>Image URL</Label>
							<Input
								id={`image-url-${index}`}
								value={block.url}
								onChange={(e) => updateField("url", e.target.value)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor={`image-alt-${index}`}>Alt Text</Label>
							<Input
								id={`image-alt-${index}`}
								value={block.alt}
								onChange={(e) => updateField("alt", e.target.value)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor={`image-link-${index}`}>Link URL (optional)</Label>
							<Input
								id={`image-link-${index}`}
								value={block.linkUrl || ""}
								onChange={(e) => updateField("linkUrl", e.target.value || undefined)}
								className="mt-1"
							/>
						</div>
					</div>
				);

			case "button":
				return (
					<div className="space-y-3">
						<div>
							<Label htmlFor={`button-text-${index}`}>Button Text</Label>
							<Input
								id={`button-text-${index}`}
								value={block.text}
								onChange={(e) => updateField("text", e.target.value)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor={`button-url-${index}`}>URL</Label>
							<Input
								id={`button-url-${index}`}
								value={block.url}
								onChange={(e) => updateField("url", e.target.value)}
								className="mt-1"
							/>
						</div>
					</div>
				);

			case "spacer":
				return (
					<div>
						<Label htmlFor={`spacer-height-${index}`}>Height (px)</Label>
						<Input
							id={`spacer-height-${index}`}
							type="number"
							value={block.height || 16}
							onChange={(e) => updateField("height", parseInt(e.target.value) || 16)}
							className="mt-1"
						/>
					</div>
				);

			case "list":
				return (
					<div className="space-y-3">
						<div>
							<Label>List Type</Label>
							<Select
								value={block.ordered ? "ordered" : "unordered"}
								onValueChange={(value) => updateField("ordered", value === "ordered")}
							>
								<SelectTrigger className="mt-1">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="unordered">Bullet List</SelectItem>
									<SelectItem value="ordered">Numbered List</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Items (one per line)</Label>
							<Textarea
								value={block.items.join("\n")}
								onChange={(e) =>
									updateField(
										"items",
										e.target.value.split("\n").filter((s) => s.trim())
									)
								}
								rows={4}
								className="mt-1"
							/>
						</div>
					</div>
				);

			case "footer":
				return (
					<div className="space-y-3">
						<div>
							<Label htmlFor={`footer-company-${index}`}>Company Name</Label>
							<Input
								id={`footer-company-${index}`}
								value={block.companyName}
								onChange={(e) => updateField("companyName", e.target.value)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor={`footer-address-${index}`}>Address (optional)</Label>
							<Input
								id={`footer-address-${index}`}
								value={block.address || ""}
								onChange={(e) => updateField("address", e.target.value || undefined)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor={`footer-unsub-${index}`}>Unsubscribe URL</Label>
							<Input
								id={`footer-unsub-${index}`}
								value={block.unsubscribeUrl || ""}
								onChange={(e) => updateField("unsubscribeUrl", e.target.value || undefined)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor={`footer-unsub-text-${index}`}>Unsubscribe Text</Label>
							<Input
								id={`footer-unsub-text-${index}`}
								value={block.unsubscribeText || "Unsubscribe"}
								onChange={(e) => updateField("unsubscribeText", e.target.value)}
								className="mt-1"
							/>
						</div>
					</div>
				);

			case "header":
				return (
					<div className="space-y-3">
						<div>
							<Label htmlFor={`header-logo-${index}`}>Logo URL (optional)</Label>
							<Input
								id={`header-logo-${index}`}
								value={block.logoUrl || ""}
								onChange={(e) => updateField("logoUrl", e.target.value || undefined)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor={`header-title-${index}`}>Title (optional)</Label>
							<Input
								id={`header-title-${index}`}
								value={block.title || ""}
								onChange={(e) => updateField("title", e.target.value || undefined)}
								className="mt-1"
							/>
						</div>
					</div>
				);

			case "divider":
				return (
					<TypographyMuted>
						A horizontal line divider. No editable properties.
					</TypographyMuted>
				);

			default:
				return (
					<TypographyMuted>
						This block type is not yet editable in the UI.
					</TypographyMuted>
				);
		}
	};

	return (
		<div ref={setNodeRef} style={style}>
			{isDropTarget && <div className="h-1 bg-primary rounded-full mb-2 animate-pulse" />}
			<Card
				className={cn(
					"border-l-4 border-l-primary/20",
					isDragging && "shadow-lg",
					isDropTarget && "ring-2 ring-primary"
				)}
			>
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<button
								{...attributes}
								{...listeners}
								className="cursor-grab active:cursor-grabbing touch-none"
								aria-label="Drag to reorder"
							>
								<IconGripVertical className="size-4 text-muted-foreground" />
							</button>
							<CardTitle className="text-sm font-medium">{getBlockTitle()}</CardTitle>
						</div>
						<div className="flex items-center gap-1">
							{supportsStyle && (
								<BlockStyleEditor
									style={blockStyle}
									onChange={updateStyle}
									blockType={block.type}
								/>
							)}
							<Button variant="ghost" size="icon-sm" onClick={() => setIsExpanded(!isExpanded)}>
								{isExpanded ? (
									<IconChevronUp className="size-3" />
								) : (
									<IconChevronDown className="size-3" />
								)}
							</Button>
							<Separator orientation="vertical" className="h-4 mx-1" />
							<Button
								variant="ghost"
								size="icon-sm"
								className="text-destructive hover:text-destructive"
								onClick={() => onDelete(index)}
							>
								<IconTrash className="size-3" />
							</Button>
						</div>
					</div>
				</CardHeader>
				{isExpanded && <CardContent className="pt-2">{renderFields()}</CardContent>}
			</Card>
		</div>
	);
}
