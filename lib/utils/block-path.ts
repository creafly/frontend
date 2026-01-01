import type { Block } from "@/types";

export type BlockPath = string;

export interface ParsedPath {
	segments: Array<{ index: number; field?: "blocks" | "children" }>;
}

export function parsePath(path: BlockPath): ParsedPath {
	const parts = path.split(".");
	const segments: ParsedPath["segments"] = [];

	for (let i = 0; i < parts.length; i++) {
		if (parts[i] === "blocks" || parts[i] === "children") {
			continue;
		}
		const index = parseInt(parts[i], 10);
		if (!isNaN(index)) {
			const field = parts[i + 1] as "blocks" | "children" | undefined;
			segments.push({ index, field });
		}
	}

	return { segments };
}

export function getBlockAtPath(blocks: Block[], path: BlockPath): Block | null {
	const { segments } = parsePath(path);
	if (segments.length === 0) return null;

	let current: Block | null = blocks[segments[0].index] || null;

	for (let i = 1; i < segments.length && current; i++) {
		const prevField = segments[i - 1].field;
		if (!prevField) return null;

		const children = getBlockChildren(current, prevField);
		if (!children) return null;

		current = children[segments[i].index] || null;
	}

	return current;
}

export function getBlockChildren(block: Block, field: "blocks" | "children"): Block[] | null {
	if (field === "blocks" && "blocks" in block) {
		return (block as { blocks: Block[] }).blocks;
	}
	if (field === "children" && "children" in block) {
		return (block as { children: Block[] }).children;
	}
	return null;
}

export function isContainerBlock(block: Block): boolean {
	return (
		block.type === "grid_wrapper" ||
		block.type === "flex_wrapper" ||
		block.type === "section" ||
		block.type === "card_container" ||
		block.type === "card_header" ||
		block.type === "card_content" ||
		block.type === "card_footer" ||
		block.type === "callout" ||
		block.type === "link" ||
		block.type === "conditional"
	);
}

export function getContainerField(block: Block): "blocks" | "children" | null {
	if (block.type === "grid_wrapper" || block.type === "flex_wrapper" || block.type === "section") {
		return "blocks";
	}
	if (
		block.type === "card_container" ||
		block.type === "card_header" ||
		block.type === "card_content" ||
		block.type === "card_footer" ||
		block.type === "callout"
	) {
		return "children";
	}
	if (block.type === "link" && "children" in block) {
		return "children";
	}
	return null;
}

export function cloneBlocks(blocks: Block[]): Block[] {
	return JSON.parse(JSON.stringify(blocks));
}

export function insertBlockAtPath(blocks: Block[], targetPath: string, newBlock: Block): Block[] {
	const result = cloneBlocks(blocks);

	if (targetPath.startsWith("root.")) {
		const index = parseInt(targetPath.replace("root.", ""), 10);
		result.splice(index, 0, newBlock);
		return result;
	}

	const parts = targetPath.split(".");
	if (parts.length < 3) return result;

	let current: Block[] = result;
	let parentBlock: Block | null = null;

	for (let i = 0; i < parts.length - 2; i += 2) {
		const index = parseInt(parts[i], 10);
		const field = parts[i + 1] as "blocks" | "children";

		parentBlock = current[index];
		if (!parentBlock) return result;

		const children = getBlockChildren(parentBlock, field);
		if (!children) return result;

		current = children;
	}

	const insertIndex = parseInt(parts[parts.length - 1], 10);

	if (parts.length === 3) {
		const parentIndex = parseInt(parts[0], 10);
		const field = parts[1] as "blocks" | "children";

		parentBlock = result[parentIndex];
		if (!parentBlock) return result;

		const children = getBlockChildren(parentBlock, field);
		if (!children) return result;

		children.splice(insertIndex, 0, newBlock);
	} else {
		current.splice(insertIndex, 0, newBlock);
	}

	return result;
}

export function removeBlockAtPath(
	blocks: Block[],
	path: string
): { blocks: Block[]; removed: Block | null } {
	const result = cloneBlocks(blocks);

	const parts = path.split(".");

	if (parts.length === 1) {
		const index = parseInt(parts[0], 10);
		if (index >= 0 && index < result.length) {
			const [removed] = result.splice(index, 1);
			return { blocks: result, removed };
		}
		return { blocks: result, removed: null };
	}

	if (parts.length >= 3) {
		let current: Block[] = result;

		for (let i = 0; i < parts.length - 2; i += 2) {
			const index = parseInt(parts[i], 10);
			const field = parts[i + 1] as "blocks" | "children";

			const parent = current[index];
			if (!parent) return { blocks: result, removed: null };

			const children = getBlockChildren(parent, field);
			if (!children) return { blocks: result, removed: null };

			current = children;
		}

		const childIndex = parseInt(parts[parts.length - 1], 10);
		if (childIndex < 0 || childIndex >= current.length) {
			return { blocks: result, removed: null };
		}

		const [removed] = current.splice(childIndex, 1);
		return { blocks: result, removed };
	}

	return { blocks: result, removed: null };
}

export function updateBlockAtPath(blocks: Block[], path: string, updatedBlock: Block): Block[] {
	const result = cloneBlocks(blocks);
	const parts = path.split(".");

	if (parts.length === 1) {
		const index = parseInt(parts[0], 10);
		if (index >= 0 && index < result.length) {
			result[index] = updatedBlock;
		}
		return result;
	}

	let current: Block[] = result;
	for (let i = 0; i < parts.length - 1; i += 2) {
		const index = parseInt(parts[i], 10);
		const field = parts[i + 1] as "blocks" | "children";

		if (i === parts.length - 2) {
			const childIndex = parseInt(parts[parts.length - 1], 10);
			const parent = current[index];
			if (parent && field) {
				const children = getBlockChildren(parent, field);
				if (children && childIndex >= 0 && childIndex < children.length) {
					children[childIndex] = updatedBlock;
				}
			}
		} else {
			const parent = current[index];
			if (parent) {
				const children = getBlockChildren(parent, field);
				if (children) {
					current = children;
				}
			}
		}
	}

	return result;
}

export function moveBlock(blocks: Block[], sourcePath: string, targetPath: string): Block[] {
	const { blocks: afterRemove, removed } = removeBlockAtPath(blocks, sourcePath);
	if (!removed) return blocks;

	let adjustedTargetPath = targetPath;

	if (targetPath.startsWith("root.")) {
		const targetIndex = parseInt(targetPath.replace("root.", ""), 10);
		const sourceIndex = parseInt(sourcePath.split(".")[0], 10);

		if (sourcePath.split(".").length === 1 && sourceIndex < targetIndex) {
			adjustedTargetPath = `root.${targetIndex - 1}`;
		}
	}

	return insertBlockAtPath(afterRemove, adjustedTargetPath, removed);
}

export interface DndIdInfo {
	type: "palette" | "preview-block" | "preview-drop" | "container-drop" | "block" | "unknown";
	blockType?: string;
	path?: string;
	index?: number;
	containerPath?: string;
	containerField?: "blocks" | "children";
	dropIndex?: number;
}

export function parseDndId(id: string): DndIdInfo {
	if (id.startsWith("palette-")) {
		return { type: "palette", blockType: id.replace("palette-", "") };
	}

	if (id.startsWith("preview-block-")) {
		const path = id.replace("preview-block-", "");
		return { type: "preview-block", path };
	}

	if (id.startsWith("preview-drop-")) {
		const index = parseInt(id.replace("preview-drop-", ""), 10);
		return { type: "preview-drop", index };
	}

	if (id.startsWith("container-drop-")) {
		const rest = id.replace("container-drop-", "");
		const lastDashIndex = rest.lastIndexOf("-");
		if (lastDashIndex === -1) {
			return { type: "unknown" };
		}

		const pathWithField = rest.substring(0, lastDashIndex);
		const dropIndex = parseInt(rest.substring(lastDashIndex + 1), 10);

		const lastDotIndex = pathWithField.lastIndexOf(".");
		if (lastDotIndex === -1) {
			return { type: "unknown" };
		}

		const containerPath = pathWithField.substring(0, lastDotIndex);
		const containerField = pathWithField.substring(lastDotIndex + 1) as "blocks" | "children";

		return {
			type: "container-drop",
			containerPath,
			containerField,
			dropIndex,
		};
	}

	if (id.startsWith("block-")) {
		const index = parseInt(id.replace("block-", ""), 10);
		return { type: "block", index };
	}

	return { type: "unknown" };
}
