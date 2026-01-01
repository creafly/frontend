"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBlocks } from "@/hooks/use-api";
import { useTranslations } from "@/providers/i18n-provider";
import { BLOCK_ICONS, BLOCK_CATEGORIES } from "@/lib/constants/blocks";
import type { BlockType, BlockDefinition } from "@/types";
import { cn } from "@/lib/utils";

interface DraggableBlockItemProps {
	type: BlockType;
	label: string;
}

function DraggableBlockItem({ type, label }: DraggableBlockItemProps) {
	const Icon = BLOCK_ICONS[type];

	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `palette-${type}`,
		data: {
			type: "palette-block",
			blockType: type,
		},
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={cn(
				"flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card",
				"cursor-grab active:cursor-grabbing",
				"hover:bg-accent hover:border-accent-foreground/20 transition-colors",
				isDragging && "ring-2 ring-primary shadow-lg"
			)}
		>
			<Icon className="size-4 text-muted-foreground shrink-0" />
			<span className="text-sm truncate">{label}</span>
		</div>
	);
}

export function BlocksPalette() {
	const t = useTranslations();
	const { data: blocksResponse } = useBlocks();

	const { setNodeRef: setPaletteRef } = useDroppable({
		id: "palette-droppable",
	});

	const blockDefinitionsMap = useMemo(() => {
		const map = new Map<BlockType, BlockDefinition>();
		if (blocksResponse?.blocks) {
			for (const block of blocksResponse.blocks) {
				map.set(block.type, block);
			}
		}
		return map;
	}, [blocksResponse]);

	const getBlockLabel = (type: BlockType): string => {
		const apiDefinition = blockDefinitionsMap.get(type);
		if (apiDefinition) {
			return apiDefinition.label;
		}
		return t.blocks.types[type] || type;
	};

	return (
		<Card className="rounded-none h-full" ref={setPaletteRef}>
			<CardHeader className="pb-3">
				<CardTitle className="text-sm font-medium">{t.blocks.palette || "Blocks"}</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="h-full px-4 pb-4">
					<div className="space-y-4">
						{BLOCK_CATEGORIES.map((group) => (
							<div key={group.category} className="space-y-2">
								<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
									{t.blocks.categories[group.category as keyof typeof t.blocks.categories]}
								</h4>
								<div className="space-y-1.5">
									{group.types.map((type) => (
										<DraggableBlockItem key={type} type={type} label={getBlockLabel(type)} />
									))}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
