"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { IconPlus } from "@tabler/icons-react";
import { useBlocks } from "@/hooks/use-api";
import { useTranslations } from "@/providers/i18n-provider";
import { BLOCK_TEMPLATES, BLOCK_ICONS, BLOCK_CATEGORIES } from "@/lib/constants/blocks";
import type { Block, BlockType, BlockDefinition } from "@/types";

interface AddBlockButtonProps {
	onAddBlock: (block: Block) => void;
}

export function AddBlockButton({ onAddBlock }: AddBlockButtonProps) {
	const t = useTranslations();
	const { data: blocksResponse } = useBlocks();

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

	const handleAddBlock = (type: BlockType) => {
		const template = BLOCK_TEMPLATES[type];
		if (template) {
			onAddBlock(template());
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="w-full border-dashed">
					<IconPlus className="size-4 mr-2" />
					{t.blocks.addBlock}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="center">
				{BLOCK_CATEGORIES.map((group, groupIndex) => (
					<DropdownMenuGroup key={group.category}>
						{groupIndex > 0 && <DropdownMenuSeparator />}
						<DropdownMenuLabel>
							{t.blocks.categories[group.category as keyof typeof t.blocks.categories]}
						</DropdownMenuLabel>
						{group.types.map((type) => {
							const Icon = BLOCK_ICONS[type];
							return (
								<DropdownMenuItem key={type} onClick={() => handleAddBlock(type)}>
									<Icon className="size-4 mr-2" />
									{getBlockLabel(type)}
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuGroup>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
