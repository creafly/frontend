import {
	IconTextSize,
	IconHeading,
	IconPhoto,
	IconClick,
	IconSpacingVertical,
	IconLineDashed,
	IconList,
	IconLayoutNavbar,
	IconLayoutBottombar,
	IconId,
	IconLayoutGrid,
	IconLayoutColumns,
	IconLink,
	IconMoodSmile,
	IconBoxModel,
	IconBoxAlignTop,
	IconBoxAlignBottom,
	IconQuote,
	IconAlertCircle,
	IconTag,
} from "@tabler/icons-react";
import type { Block, BlockType } from "@/types";

export const BLOCK_TEMPLATES: Record<BlockType, () => Block> = {
	text: () => ({
		type: "text",
		value: "Enter your text here...",
	}),
	heading: () => ({
		type: "heading",
		level: "h2",
		text: "Heading Text",
	}),
	image: () => ({
		type: "image",
		url: "https://via.placeholder.com/600x400",
		alt: "Image description",
	}),
	button: () => ({
		type: "button",
		text: "Click Here",
		url: "https://example.com",
	}),
	spacer: () => ({
		type: "spacer",
		height: 24,
	}),
	divider: () => ({
		type: "divider",
	}),
	list: () => ({
		type: "list",
		items: ["Item 1", "Item 2", "Item 3"],
		ordered: false,
	}),
	footer: () => ({
		type: "footer",
		companyName: "Your Company",
		address: "123 Main St, City, Country",
		unsubscribeUrl: "https://example.com/unsubscribe",
	}),
	header: () => ({
		type: "header",
		title: "Your Company",
	}),
	section: () => ({
		type: "section",
		blocks: [],
	}),
	conditional: () => ({
		type: "conditional",
		condition: "true",
		showIf: [],
	}),
	grid_wrapper: () => ({
		type: "grid_wrapper",
		columns: 2,
		blocks: [],
	}),
	flex_wrapper: () => ({
		type: "flex_wrapper",
		direction: "row",
		blocks: [],
	}),
	link: () => ({
		type: "link",
		url: "https://example.com",
		text: "Click here",
	}),
	icon: () => ({
		type: "icon",
		name: "email",
		size: 24,
	}),
	card_container: () => ({
		type: "card_container",
		children: [],
	}),
	card_header: () => ({
		type: "card_header",
		children: [{ type: "heading", level: "h3", text: "Card Title" }],
	}),
	card_content: () => ({
		type: "card_content",
		children: [{ type: "text", value: "Card content goes here..." }],
	}),
	card_footer: () => ({
		type: "card_footer",
		children: [],
	}),
	quote: () => ({
		type: "quote",
		text: "Enter your quote here...",
		author: "Author Name",
		authorTitle: "Author Title",
	}),
	callout: () => ({
		type: "callout",
		variant: "info",
		title: "Note",
		children: [{ type: "text", value: "Important information here..." }],
	}),
	badge: () => ({
		type: "badge",
		text: "New",
		variant: "primary",
	}),
};

export const BLOCK_ICONS: Record<BlockType, typeof IconTextSize> = {
	text: IconTextSize,
	heading: IconHeading,
	image: IconPhoto,
	button: IconClick,
	spacer: IconSpacingVertical,
	divider: IconLineDashed,
	list: IconList,
	footer: IconLayoutBottombar,
	header: IconLayoutNavbar,
	section: IconId,
	conditional: IconId,
	grid_wrapper: IconLayoutGrid,
	flex_wrapper: IconLayoutColumns,
	link: IconLink,
	icon: IconMoodSmile,
	card_container: IconBoxModel,
	card_header: IconBoxAlignTop,
	card_content: IconId,
	card_footer: IconBoxAlignBottom,
	quote: IconQuote,
	callout: IconAlertCircle,
	badge: IconTag,
};

export interface BlockCategory {
	category: string;
	types: BlockType[];
}

export const BLOCK_CATEGORIES: BlockCategory[] = [
	{
		category: "content",
		types: ["text", "heading", "image", "button", "list", "quote", "badge"],
	},
	{
		category: "layout",
		types: ["spacer", "divider", "grid_wrapper", "flex_wrapper"],
	},
	{
		category: "structure",
		types: ["header", "footer"],
	},
	{
		category: "primitives",
		types: ["link", "icon"],
	},
	{
		category: "composable",
		types: ["card_container", "card_header", "card_content", "card_footer", "callout"],
	},
];

export const VISIBLE_BLOCK_TYPES: BlockType[] = BLOCK_CATEGORIES.flatMap((cat) => cat.types);

export function createBlockFromType(type: BlockType): Block {
	const template = BLOCK_TEMPLATES[type];
	if (!template) {
		throw new Error(`Unknown block type: ${type}`);
	}
	return template();
}
