"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import {
	DndContext,
	DragOverlay,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragEndEvent,
	DragOverEvent,
	UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import { createBlockFromType, BLOCK_ICONS } from "@/lib/constants/blocks";
import { parseDndId, insertBlockAtPath, moveBlock } from "@/lib/utils/block-path";
import type { Block, BlockType } from "@/types";
import { cn } from "@/lib/utils";

interface EditorDndContextValue {
	activeId: UniqueIdentifier | null;
	activeBlockType: BlockType | null;
	overId: UniqueIdentifier | null;
}

const EditorDndContext = createContext<EditorDndContextValue>({
	activeId: null,
	activeBlockType: null,
	overId: null,
});

export function useEditorDnd() {
	return useContext(EditorDndContext);
}

interface EditorDndProviderProps {
	children: ReactNode;
	blocks: Block[];
	onBlocksChange: (blocks: Block[]) => void;
}

export function EditorDndProvider({ children, blocks, onBlocksChange }: EditorDndProviderProps) {
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [activeBlockType, setActiveBlockType] = useState<BlockType | null>(null);
	const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const { active } = event;
			setActiveId(active.id);

			const info = parseDndId(String(active.id));

			if (info.type === "palette" && info.blockType) {
				setActiveBlockType(info.blockType as BlockType);
			} else if (info.type === "preview-block" && info.path) {
				const rootIndex = parseInt(info.path.split(".")[0], 10);
				if (!isNaN(rootIndex) && blocks[rootIndex]) {
					setActiveBlockType(blocks[rootIndex].type);
				}
			} else if (info.type === "block" && info.index !== undefined) {
				if (blocks[info.index]) {
					setActiveBlockType(blocks[info.index].type);
				}
			}
		},
		[blocks]
	);

	const handleDragOver = useCallback((event: DragOverEvent) => {
		const { over } = event;
		setOverId(over?.id ?? null);
	}, []);

	const isValidBlockDropTarget = useCallback((id: UniqueIdentifier): boolean => {
		const strId = String(id);
		if (strId === "palette-droppable" || strId.startsWith("palette-")) {
			return false;
		}
		return (
			strId === "blocks-droppable" ||
			strId === "preview-empty" ||
			strId.startsWith("block-") ||
			strId.startsWith("preview-drop-") ||
			strId.startsWith("container-drop-")
		);
	}, []);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;

			setActiveId(null);
			setActiveBlockType(null);
			setOverId(null);

			if (!over) return;
			if (!isValidBlockDropTarget(over.id)) return;

			const activeInfo = parseDndId(String(active.id));
			const overInfo = parseDndId(String(over.id));

			if (activeInfo.type === "palette" && activeInfo.blockType) {
				const newBlock = createBlockFromType(activeInfo.blockType as BlockType);

				if (
					overInfo.type === "container-drop" &&
					overInfo.containerPath &&
					overInfo.containerField
				) {
					const targetPath = `${overInfo.containerPath}.${overInfo.containerField}.${overInfo.dropIndex}`;
					const newBlocks = insertBlockAtPath(blocks, targetPath, newBlock);
					onBlocksChange(newBlocks);
					return;
				}

				if (overInfo.type === "preview-drop" && overInfo.index !== undefined) {
					const newBlocks = insertBlockAtPath(blocks, `root.${overInfo.index}`, newBlock);
					onBlocksChange(newBlocks);
					return;
				}

				const overIdStr = String(over.id);
				if (overIdStr === "blocks-droppable" || overIdStr === "preview-empty") {
					onBlocksChange([...blocks, newBlock]);
					return;
				}

				if (overInfo.type === "block" && overInfo.index !== undefined) {
					const newBlocks = insertBlockAtPath(blocks, `root.${overInfo.index + 1}`, newBlock);
					onBlocksChange(newBlocks);
					return;
				}

				onBlocksChange([...blocks, newBlock]);
				return;
			}

			if (activeInfo.type === "preview-block" && activeInfo.path) {
				const sourcePath = activeInfo.path;

				if (
					overInfo.type === "container-drop" &&
					overInfo.containerPath &&
					overInfo.containerField
				) {
					const targetPath = `${overInfo.containerPath}.${overInfo.containerField}.${overInfo.dropIndex}`;
					const newBlocks = moveBlock(blocks, sourcePath, targetPath);
					onBlocksChange(newBlocks);
					return;
				}

				if (overInfo.type === "preview-drop" && overInfo.index !== undefined) {
					const newBlocks = moveBlock(blocks, sourcePath, `root.${overInfo.index}`);
					onBlocksChange(newBlocks);
					return;
				}
			}

			if (activeInfo.type === "block" && overInfo.type === "block") {
				const oldIndex = activeInfo.index;
				const newIndex = overInfo.index;

				if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
					const newBlocks = [...blocks];
					const [removed] = newBlocks.splice(oldIndex, 1);
					newBlocks.splice(newIndex, 0, removed);
					onBlocksChange(newBlocks);
				}
			}
		},
		[blocks, onBlocksChange, isValidBlockDropTarget]
	);

	const contextValue: EditorDndContextValue = {
		activeId,
		activeBlockType,
		overId,
	};

	return (
		<EditorDndContext.Provider value={contextValue}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				{children}
				<DragOverlay>
					{activeBlockType && <DragOverlayItem blockType={activeBlockType} />}
				</DragOverlay>
			</DndContext>
		</EditorDndContext.Provider>
	);
}

function DragOverlayItem({ blockType }: { blockType: BlockType }) {
	const Icon = BLOCK_ICONS[blockType];

	return (
		<div
			className={cn(
				"flex items-center gap-2 px-3 py-2 rounded-md border-2 border-primary bg-card shadow-lg",
				"cursor-grabbing"
			)}
		>
			<Icon className="size-4 text-primary shrink-0" />
			<span className="text-sm font-medium capitalize">{blockType.replace("_", " ")}</span>
		</div>
	);
}
