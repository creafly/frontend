"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { SortableBlockItem } from "./sortable-block-item";
import { AddBlockButton } from "./add-block-button";
import { useEditorDnd } from "./editor-dnd-provider";
import { useTranslations } from "@/providers/i18n-provider";
import type { Block } from "@/types";
import { cn } from "@/lib/utils";

interface SortableBlockListProps {
	blocks: Block[];
	onBlocksChange: (blocks: Block[]) => void;
}

export function SortableBlockList({ blocks, onBlocksChange }: SortableBlockListProps) {
	const { activeId, overId } = useEditorDnd();
	const t = useTranslations();

	const { setNodeRef, isOver } = useDroppable({
		id: "blocks-droppable",
	});

	const handleBlockUpdate = (index: number, block: Block) => {
		const newBlocks = [...blocks];
		newBlocks[index] = block;
		onBlocksChange(newBlocks);
	};

	const handleBlockDelete = (index: number) => {
		onBlocksChange(blocks.filter((_, i) => i !== index));
	};

	const handleAddBlock = (block: Block) => {
		onBlocksChange([...blocks, block]);
	};

	const blockIds = blocks.map((_, index) => `block-${index}`);

	const isDraggingFromPalette = activeId && String(activeId).startsWith("palette-");

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"min-h-48 rounded-lg transition-colors",
				isDraggingFromPalette && "ring-2 ring-dashed ring-primary/50 bg-primary/5",
				isOver && isDraggingFromPalette && "ring-primary bg-primary/10"
			)}
		>
			<SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
				<div className="space-y-3">
					{blocks.length === 0 && isDraggingFromPalette ? (
						<div className="flex items-center justify-center h-32 text-muted-foreground">
							{t.blocks.dropHint}
						</div>
					) : (
						blocks.map((block, index) => (
							<SortableBlockItem
								key={`block-${index}`}
								id={`block-${index}`}
								block={block}
								index={index}
								onUpdate={handleBlockUpdate}
								onDelete={handleBlockDelete}
								isDropTarget={!!(overId === `block-${index}` && isDraggingFromPalette)}
							/>
						))
					)}
					<AddBlockButton onAddBlock={handleAddBlock} />
				</div>
			</SortableContext>
		</div>
	);
}
