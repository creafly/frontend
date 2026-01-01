"use client";

import { useEffect, useCallback } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import type { Block, BlockStyle, CalloutVariant, BadgeVariant } from "@/types";
import { cn } from "@/lib/utils";
import { BlockEditPopover } from "./block-edit-popover";
import { useEditorDnd } from "./editor-dnd-provider";

interface InteractivePreviewProps {
	blocks: Block[];
	selectedBlockPath: string | null;
	onSelectBlock: (path: string | null) => void;
	onBlockUpdate: (path: string, block: Block) => void;
	onBlockDelete: (path: string) => void;
}

const FONT_WEIGHT_MAP: Record<NonNullable<BlockStyle["fontWeight"]>, number> = {
	normal: 400,
	medium: 500,
	semibold: 600,
	bold: 700,
};

function buildStyles(style?: BlockStyle): React.CSSProperties {
	if (!style) return {};

	return {
		paddingTop: style.paddingTop,
		paddingBottom: style.paddingBottom,
		paddingLeft: style.paddingLeft,
		paddingRight: style.paddingRight,
		marginTop: style.marginTop,
		marginBottom: style.marginBottom,
		marginLeft: style.marginLeft,
		marginRight: style.marginRight,
		backgroundColor: style.backgroundColor,
		color: style.textColor,
		fontFamily: style.fontFamily,
		fontSize: style.fontSize,
		fontWeight: style.fontWeight ? FONT_WEIGHT_MAP[style.fontWeight] : undefined,
		textAlign: style.textAlign,
		borderRadius: style.borderRadius,
		borderWidth: style.borderWidth,
		borderStyle: style.borderWidth ? "solid" : undefined,
		borderColor: style.borderColor,
	};
}

export function InteractivePreview({
	blocks,
	selectedBlockPath,
	onSelectBlock,
	onBlockUpdate,
	onBlockDelete,
}: InteractivePreviewProps) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if ((e.key === "Delete" || e.key === "Backspace") && selectedBlockPath !== null) {
				if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
					return;
				}
				e.preventDefault();
				onBlockDelete(selectedBlockPath);
				onSelectBlock(null);
			}
			if (e.key === "Escape" && selectedBlockPath !== null) {
				onSelectBlock(null);
			}
		},
		[selectedBlockPath, onBlockDelete, onSelectBlock]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div className="overflow-hidden">
			<div className="p-5 min-h-125" onClick={() => onSelectBlock(null)}>
				<div
					style={{
						maxWidth: 600,
						margin: "0 auto",
						fontFamily:
							"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
						lineHeight: 1.5,
						color: "#333",
					}}
				>
					{blocks.length === 0 ? (
						<EmptyDropZone />
					) : (
						<>
							<DropZone index={0} />

							{blocks.map((block, index) => (
								<div key={index}>
									<PreviewBlock
										block={block}
										path={String(index)}
										isSelected={selectedBlockPath === String(index)}
										onSelect={() => onSelectBlock(String(index))}
										onUpdate={(updatedBlock) => onBlockUpdate(String(index), updatedBlock)}
										onDelete={() => {
											onBlockDelete(String(index));
											onSelectBlock(null);
										}}
										selectedBlockPath={selectedBlockPath}
										onSelectBlock={onSelectBlock}
										onBlockUpdate={onBlockUpdate}
										onBlockDelete={onBlockDelete}
									/>
									<DropZone index={index + 1} />
								</div>
							))}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

function DropZone({ index }: { index: number }) {
	const { setNodeRef, isOver } = useDroppable({
		id: `preview-drop-${index}`,
	});

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"h-1 my-1 rounded transition-all",
				isOver ? "h-4 bg-primary/20 border-2 border-dashed border-primary" : "bg-transparent"
			)}
		/>
	);
}

function EmptyDropZone() {
	const { setNodeRef, isOver } = useDroppable({
		id: "preview-empty",
	});

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"border-2 border-dashed rounded-lg p-8 text-center transition-colors",
				isOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
			)}
		>
			<p className="text-muted-foreground">Drag blocks here to start building</p>
		</div>
	);
}

interface ContainerDropZoneProps {
	containerPath: string;
	containerField: "blocks" | "children";
	index: number;
}

function ContainerDropZone({ containerPath, containerField, index }: ContainerDropZoneProps) {
	const { activeId } = useEditorDnd();
	const isDragging = activeId !== null;

	const { setNodeRef, isOver } = useDroppable({
		id: `container-drop-${containerPath}.${containerField}-${index}`,
	});

	if (!isDragging) {
		return <div className="h-1" />;
	}

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"h-1 my-1 rounded transition-all",
				isOver ? "h-3 bg-primary/30 border border-dashed border-primary" : "bg-muted/30"
			)}
		/>
	);
}

interface NestedBlockWrapperProps {
	block: Block;
	path: string;
	selectedBlockPath: string | null;
	onSelectBlock: (path: string | null) => void;
	onBlockUpdate: (path: string, block: Block) => void;
	onBlockDelete: (path: string) => void;
}

function NestedBlockWrapper({
	block,
	path,
	selectedBlockPath,
	onSelectBlock,
	onBlockUpdate,
	onBlockDelete,
}: NestedBlockWrapperProps) {
	const isSelected = selectedBlockPath === path;

	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `preview-block-${path}`,
		data: { type: "preview-block", path },
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1000 : 1,
	};

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onSelectBlock(path);
	};

	return (
		<BlockEditPopover
			block={block}
			path={path}
			isOpen={isSelected && !isDragging}
			onUpdate={(updatedBlock) => onBlockUpdate(path, updatedBlock)}
			onDelete={() => {
				onBlockDelete(path);
				onSelectBlock(null);
			}}
		>
			<div
				ref={setNodeRef}
				style={style}
				onClick={handleClick}
				className={cn(
					"relative cursor-pointer transition-all group",
					isSelected && "ring-2 ring-primary ring-offset-1 rounded",
					isDragging && "cursor-grabbing"
				)}
			>
				<button
					{...attributes}
					{...listeners}
					className={cn(
						"absolute -left-6 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
						"hover:bg-muted cursor-grab active:cursor-grabbing z-10",
						isDragging && "opacity-100"
					)}
					onClick={(e) => e.stopPropagation()}
				>
					<IconGripVertical className="size-3 text-muted-foreground" />
				</button>
				<BlockRenderer
					block={block}
					path={path}
					selectedBlockPath={selectedBlockPath}
					onSelectBlock={onSelectBlock}
					onBlockUpdate={onBlockUpdate}
					onBlockDelete={onBlockDelete}
				/>
			</div>
		</BlockEditPopover>
	);
}

interface PreviewBlockProps {
	block: Block;
	path: string;
	isSelected: boolean;
	onSelect: () => void;
	onUpdate: (block: Block) => void;
	onDelete: () => void;
	selectedBlockPath: string | null;
	onSelectBlock: (path: string | null) => void;
	onBlockUpdate: (path: string, block: Block) => void;
	onBlockDelete: (path: string) => void;
}

function PreviewBlock({
	block,
	path,
	isSelected,
	onSelect,
	onUpdate,
	onDelete,
	selectedBlockPath,
	onSelectBlock,
	onBlockUpdate,
	onBlockDelete,
}: PreviewBlockProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `preview-block-${path}`,
		data: { type: "preview-block", path },
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1000 : 1,
	};

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onSelect();
	};

	return (
		<BlockEditPopover
			block={block}
			path={path}
			isOpen={isSelected && !isDragging}
			onUpdate={onUpdate}
			onDelete={onDelete}
		>
			<div
				ref={setNodeRef}
				style={style}
				onClick={handleClick}
				className={cn(
					"relative cursor-pointer transition-all group",
					isSelected && "ring-2 ring-primary ring-offset-2 rounded",
					isDragging && "cursor-grabbing"
				)}
			>
				<button
					{...attributes}
					{...listeners}
					className={cn(
						"absolute -left-6 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
						"hover:bg-muted cursor-grab active:cursor-grabbing touch-none"
					)}
					onClick={(e) => e.stopPropagation()}
				>
					<IconGripVertical className="size-4 text-muted-foreground" />
				</button>
				<BlockRenderer
					block={block}
					path={path}
					selectedBlockPath={selectedBlockPath}
					onSelectBlock={onSelectBlock}
					onBlockUpdate={onBlockUpdate}
					onBlockDelete={onBlockDelete}
				/>
			</div>
		</BlockEditPopover>
	);
}

interface BlockRendererProps {
	block: Block;
	path?: string;
	selectedBlockPath?: string | null;
	onSelectBlock?: (path: string | null) => void;
	onBlockUpdate?: (path: string, block: Block) => void;
	onBlockDelete?: (path: string) => void;
}

function BlockRenderer({
	block,
	path,
	selectedBlockPath,
	onSelectBlock,
	onBlockUpdate,
	onBlockDelete,
}: BlockRendererProps) {
	const customStyles = buildStyles("style" in block ? block.style : undefined);

	switch (block.type) {
		case "text":
			return (
				<p
					style={{
						marginTop: 0,
						marginRight: 0,
						marginBottom: 16,
						marginLeft: 0,
						lineHeight: 1.6,
						...customStyles,
					}}
				>
					{block.value}
				</p>
			);

		case "heading": {
			const Tag = block.level || "h2";
			const sizes: Record<string, number> = {
				h1: 32,
				h2: 24,
				h3: 20,
				h4: 18,
				h5: 16,
				h6: 14,
			};
			return (
				<Tag
					style={{
						marginTop: 0,
						marginRight: 0,
						marginBottom: 16,
						marginLeft: 0,
						fontSize: sizes[Tag],
						fontWeight: "bold",
						...customStyles,
					}}
				>
					{block.text}
				</Tag>
			);
		}

		case "image": {
			const img = (
				<img
					src={block.url}
					alt={block.alt}
					style={{
						maxWidth: "100%",
						height: "auto",
						display: "block",
						marginTop: 0,
						marginRight: "auto",
						marginBottom: 16,
						marginLeft: "auto",
						...customStyles,
					}}
				/>
			);
			if (block.linkUrl) {
				return (
					<a
						href={block.linkUrl}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.preventDefault()}
					>
						{img}
					</a>
				);
			}
			return img;
		}

		case "button": {
			const buttonColor = block.style?.buttonColor || "#0066cc";
			const buttonTextColor = block.style?.buttonTextColor || "#ffffff";
			const borderRadius = block.style?.borderRadius ?? 6;

			return (
				<div
					style={{
						textAlign: "center",
						marginTop: 24,
						marginBottom: 24,
						...customStyles,
					}}
				>
					<a
						href={block.url}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.preventDefault()}
						style={{
							display: "inline-block",
							padding: "12px 24px",
							backgroundColor: buttonColor,
							color: buttonTextColor,
							textDecoration: "none",
							borderRadius,
							fontWeight: 500,
						}}
					>
						{block.text}
					</a>
				</div>
			);
		}

		case "spacer":
			return <div style={{ height: block.height || 24 }} />;

		case "divider": {
			const borderColor = block.style?.borderColor || "#e5e5e5";
			return (
				<hr
					style={{
						borderWidth: 0,
						borderTopWidth: 1,
						borderTopStyle: "solid",
						borderTopColor: borderColor,
						marginTop: 24,
						marginBottom: 24,
						...customStyles,
					}}
				/>
			);
		}

		case "list": {
			const Tag = block.ordered ? "ol" : "ul";
			return (
				<Tag
					style={{
						marginTop: 0,
						marginRight: 0,
						marginBottom: 16,
						marginLeft: 0,
						paddingLeft: 24,
						...customStyles,
					}}
				>
					{block.items.map((item, i) => (
						<li key={i} style={{ marginBottom: 8 }}>
							{item}
						</li>
					))}
				</Tag>
			);
		}

		case "social": {
			const linkColor = block.style?.textColor || "#666";
			return (
				<div
					style={{
						textAlign: "center",
						marginTop: 24,
						marginBottom: 24,
						...customStyles,
					}}
				>
					{block.links.map((link, i) => (
						<a
							key={i}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.preventDefault()}
							style={{
								display: "inline-block",
								marginLeft: 8,
								marginRight: 8,
								color: linkColor,
							}}
						>
							{link.platform}
						</a>
					))}
				</div>
			);
		}

		case "header": {
			const titleColor = block.style?.textColor;
			return (
				<div
					style={{
						textAlign: "center",
						paddingTop: 24,
						paddingBottom: 24,
						paddingLeft: 0,
						paddingRight: 0,
						borderBottomWidth: 1,
						borderBottomStyle: "solid",
						borderBottomColor: "#e5e5e5",
						marginBottom: 24,
						...customStyles,
					}}
				>
					{block.logoUrl && (
						<img
							src={block.logoUrl}
							alt={block.logoAlt || "Logo"}
							style={{
								maxWidth: block.logoWidth || 150,
								height: "auto",
								marginBottom: 16,
							}}
						/>
					)}
					{block.title && (
						<h1
							style={{
								marginTop: 0,
								marginBottom: 0,
								marginLeft: 0,
								marginRight: 0,
								fontSize: 24,
								fontWeight: "bold",
								color: titleColor,
							}}
						>
							{block.title}
						</h1>
					)}
					{block.navLinks && block.navLinks.length > 0 && (
						<div style={{ marginTop: 16 }}>
							{block.navLinks.map((link, i) => (
								<a
									key={i}
									href={link.url}
									onClick={(e) => e.preventDefault()}
									style={{
										marginTop: 0,
										marginBottom: 0,
										marginLeft: 12,
										marginRight: 12,
										color: "#0066cc",
										textDecoration: "none",
									}}
								>
									{link.text}
								</a>
							))}
						</div>
					)}
				</div>
			);
		}

		case "footer":
			return (
				<div
					style={{
						textAlign: "center",
						paddingTop: 24,
						paddingBottom: 24,
						paddingLeft: 0,
						paddingRight: 0,
						borderTopWidth: 1,
						borderTopStyle: "solid",
						borderTopColor: "#e5e5e5",
						marginTop: 24,
						color: "#666",
						fontSize: 12,
						...customStyles,
					}}
				>
					{block.companyName && (
						<p
							style={{
								marginTop: 0,
								marginBottom: 8,
								marginLeft: 0,
								marginRight: 0,
								fontWeight: 500,
							}}
						>
							{block.companyName}
						</p>
					)}
					{block.address && (
						<p style={{ marginTop: 0, marginBottom: 8, marginLeft: 0, marginRight: 0 }}>
							{block.address}
						</p>
					)}
					{block.links && block.links.length > 0 && (
						<div style={{ marginTop: 16, marginBottom: 16, marginLeft: 0, marginRight: 0 }}>
							{block.links.map((link, i) => (
								<a
									key={i}
									href={link.url}
									onClick={(e) => e.preventDefault()}
									style={{
										marginTop: 0,
										marginBottom: 0,
										marginLeft: 8,
										marginRight: 8,
										color: "#666",
									}}
								>
									{link.text}
								</a>
							))}
						</div>
					)}
					{block.unsubscribeUrl && (
						<p style={{ marginTop: 16, marginBottom: 0, marginLeft: 0, marginRight: 0 }}>
							<a
								href={block.unsubscribeUrl}
								onClick={(e) => e.preventDefault()}
								style={{ color: "#999" }}
							>
								{block.unsubscribeText || "Unsubscribe"}
							</a>
						</p>
					)}
				</div>
			);

		case "card": {
			const borderRadius = block.style?.borderRadius ?? 8;
			const borderColor = block.style?.borderColor || "#e5e5e5";
			const bgColor = block.style?.backgroundColor || "transparent";

			return (
				<div
					style={{
						borderWidth: 1,
						borderStyle: "solid",
						borderColor,
						borderRadius,
						overflow: "hidden",
						marginTop: 16,
						marginBottom: 16,
						backgroundColor: bgColor,
					}}
				>
					{block.imageUrl && (
						<img
							src={block.imageUrl}
							alt={block.imageAlt || ""}
							style={{ width: "100%", height: "auto", display: "block" }}
						/>
					)}
					<div style={{ padding: 16 }}>
						<h3
							style={{
								marginTop: 0,
								marginBottom: 8,
								marginLeft: 0,
								marginRight: 0,
								fontSize: 18,
								fontWeight: "bold",
								color: block.style?.textColor,
							}}
						>
							{block.title}
						</h3>
						{block.description && (
							<p
								style={{
									marginTop: 0,
									marginBottom: 16,
									marginLeft: 0,
									marginRight: 0,
									color: "#666",
								}}
							>
								{block.description}
							</p>
						)}
						{block.ctaText && block.ctaUrl && (
							<a
								href={block.ctaUrl}
								target="_blank"
								rel="noopener noreferrer"
								onClick={(e) => e.preventDefault()}
								style={{
									display: "inline-block",
									padding: "8px 16px",
									backgroundColor: "#0066cc",
									color: "#ffffff",
									textDecoration: "none",
									borderRadius: 4,
									fontSize: 14,
								}}
							>
								{block.ctaText}
							</a>
						)}
					</div>
				</div>
			);
		}

		case "grid_wrapper": {
			const columns = block.columns || 2;
			const rows = block.rows;
			const gap = block.gap ?? 16;
			const alignItems = block.alignItems || "stretch";
			const justifyItems = block.justifyItems || "stretch";
			const containerPath = path ?? "0";

			return (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: `repeat(${columns}, 1fr)`,
						...(rows ? { gridTemplateRows: `repeat(${rows}, auto)` } : {}),
						gap,
						alignItems,
						justifyItems,
						marginTop: 16,
						marginBottom: 16,
						...customStyles,
					}}
				>
					<ContainerDropZone containerPath={containerPath} containerField="blocks" index={0} />
					{block.blocks.map((child, i) => (
						<div key={i}>
							{onSelectBlock && onBlockUpdate && onBlockDelete ? (
								<NestedBlockWrapper
									block={child}
									path={`${containerPath}.blocks.${i}`}
									selectedBlockPath={selectedBlockPath ?? null}
									onSelectBlock={onSelectBlock}
									onBlockUpdate={onBlockUpdate}
									onBlockDelete={onBlockDelete}
								/>
							) : (
								<BlockRenderer block={child} path={`${containerPath}.blocks.${i}`} />
							)}
							<ContainerDropZone
								containerPath={containerPath}
								containerField="blocks"
								index={i + 1}
							/>
						</div>
					))}
				</div>
			);
		}

		case "flex_wrapper": {
			const direction = block.direction || "row";
			const gap = block.gap ?? 16;
			const alignItems = block.alignItems || "center";
			const justifyContent = block.justifyContent || "start";
			const wrap = block.wrap || "wrap";
			const containerPath = path ?? "0";

			return (
				<div
					style={{
						display: "flex",
						flexDirection: direction,
						gap,
						alignItems,
						justifyContent:
							justifyContent === "start"
								? "flex-start"
								: justifyContent === "end"
								? "flex-end"
								: justifyContent,
						flexWrap: wrap,
						marginTop: 16,
						marginBottom: 16,
						...customStyles,
					}}
				>
					<ContainerDropZone containerPath={containerPath} containerField="blocks" index={0} />
					{block.blocks.map((child, i) => (
						<div key={i} style={{ display: "contents" }}>
							{onSelectBlock && onBlockUpdate && onBlockDelete ? (
								<NestedBlockWrapper
									block={child}
									path={`${containerPath}.blocks.${i}`}
									selectedBlockPath={selectedBlockPath ?? null}
									onSelectBlock={onSelectBlock}
									onBlockUpdate={onBlockUpdate}
									onBlockDelete={onBlockDelete}
								/>
							) : (
								<BlockRenderer block={child} path={`${containerPath}.blocks.${i}`} />
							)}
							<ContainerDropZone
								containerPath={containerPath}
								containerField="blocks"
								index={i + 1}
							/>
						</div>
					))}
				</div>
			);
		}

		case "section": {
			const containerPath = path ?? "0";

			return (
				<div
					style={{
						marginTop: 16,
						marginBottom: 16,
						...customStyles,
					}}
				>
					<ContainerDropZone containerPath={containerPath} containerField="blocks" index={0} />
					{block.blocks.map((child, i) => (
						<div key={i}>
							{onSelectBlock && onBlockUpdate && onBlockDelete ? (
								<NestedBlockWrapper
									block={child}
									path={`${containerPath}.blocks.${i}`}
									selectedBlockPath={selectedBlockPath ?? null}
									onSelectBlock={onSelectBlock}
									onBlockUpdate={onBlockUpdate}
									onBlockDelete={onBlockDelete}
								/>
							) : (
								<BlockRenderer block={child} path={`${containerPath}.blocks.${i}`} />
							)}
							<ContainerDropZone
								containerPath={containerPath}
								containerField="blocks"
								index={i + 1}
							/>
						</div>
					))}
				</div>
			);
		}

		case "link": {
			const linkColor = block.style?.textColor || "#0066cc";
			const containerPath = path ?? "0";

			if (block.children && block.children.length > 0) {
				return (
					<a
						href={block.url}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.preventDefault()}
						style={{
							color: linkColor,
							textDecoration: "none",
							...customStyles,
						}}
					>
						{block.children.map((child, i) => (
							<BlockRenderer key={i} block={child} path={`${containerPath}.children.${i}`} />
						))}
					</a>
				);
			}

			return (
				<a
					href={block.url}
					target="_blank"
					rel="noopener noreferrer"
					onClick={(e) => e.preventDefault()}
					style={{
						color: linkColor,
						textDecoration: "none",
						...customStyles,
					}}
				>
					{block.text || block.url}
				</a>
			);
		}

		case "icon": {
			const size = block.size || 24;
			const color = block.color || "currentColor";

			const builtInIcons: Record<string, string> = {
				twitter: "𝕏",
				x: "𝕏",
				facebook: "f",
				instagram: "📷",
				linkedin: "in",
				youtube: "▶",
				github: "⌘",
				telegram: "✈",
				discord: "💬",
				email: "✉",
				phone: "📞",
				location: "📍",
			};

			if (block.url) {
				return (
					<img
						src={block.url}
						alt={block.name || "icon"}
						style={{
							width: size,
							height: size,
							display: "inline-block",
							...customStyles,
						}}
					/>
				);
			}

			const iconChar = block.name ? builtInIcons[block.name] || "•" : "•";

			return (
				<span
					style={{
						fontSize: size,
						color,
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						width: size,
						height: size,
						...customStyles,
					}}
				>
					{iconChar}
				</span>
			);
		}

		case "card_container": {
			const borderRadius = block.style?.borderRadius ?? 8;
			const borderColor = block.style?.borderColor || "#e5e5e5";
			const bgColor = block.style?.backgroundColor || "#ffffff";
			const containerPath = path ?? "0";

			return (
				<div
					style={{
						borderWidth: 1,
						borderStyle: "solid",
						borderColor,
						borderRadius,
						overflow: "hidden",
						marginTop: 16,
						marginBottom: 16,
						backgroundColor: bgColor,
						...customStyles,
					}}
				>
					<ContainerDropZone containerPath={containerPath} containerField="children" index={0} />
					{block.children.map((child, i) => (
						<div key={i}>
							{onSelectBlock && onBlockUpdate && onBlockDelete ? (
								<NestedBlockWrapper
									block={child}
									path={`${containerPath}.children.${i}`}
									selectedBlockPath={selectedBlockPath ?? null}
									onSelectBlock={onSelectBlock}
									onBlockUpdate={onBlockUpdate}
									onBlockDelete={onBlockDelete}
								/>
							) : (
								<BlockRenderer block={child} path={`${containerPath}.children.${i}`} />
							)}
							<ContainerDropZone
								containerPath={containerPath}
								containerField="children"
								index={i + 1}
							/>
						</div>
					))}
				</div>
			);
		}

		case "card_header": {
			const containerPath = path ?? "0";

			return (
				<div
					style={{
						padding: "16px 16px 8px 16px",
						borderBottomWidth: 1,
						borderBottomStyle: "solid",
						borderBottomColor: "#f0f0f0",
						...customStyles,
					}}
				>
					<ContainerDropZone containerPath={containerPath} containerField="children" index={0} />
					{block.children.map((child, i) => (
						<div key={i}>
							{onSelectBlock && onBlockUpdate && onBlockDelete ? (
								<NestedBlockWrapper
									block={child}
									path={`${containerPath}.children.${i}`}
									selectedBlockPath={selectedBlockPath ?? null}
									onSelectBlock={onSelectBlock}
									onBlockUpdate={onBlockUpdate}
									onBlockDelete={onBlockDelete}
								/>
							) : (
								<BlockRenderer block={child} path={`${containerPath}.children.${i}`} />
							)}
							<ContainerDropZone
								containerPath={containerPath}
								containerField="children"
								index={i + 1}
							/>
						</div>
					))}
				</div>
			);
		}

		case "card_content": {
			const containerPath = path ?? "0";

			return (
				<div
					style={{
						padding: 16,
						...customStyles,
					}}
				>
					<ContainerDropZone containerPath={containerPath} containerField="children" index={0} />
					{block.children.map((child, i) => (
						<div key={i}>
							{onSelectBlock && onBlockUpdate && onBlockDelete ? (
								<NestedBlockWrapper
									block={child}
									path={`${containerPath}.children.${i}`}
									selectedBlockPath={selectedBlockPath ?? null}
									onSelectBlock={onSelectBlock}
									onBlockUpdate={onBlockUpdate}
									onBlockDelete={onBlockDelete}
								/>
							) : (
								<BlockRenderer block={child} path={`${containerPath}.children.${i}`} />
							)}
							<ContainerDropZone
								containerPath={containerPath}
								containerField="children"
								index={i + 1}
							/>
						</div>
					))}
				</div>
			);
		}

		case "card_footer": {
			const containerPath = path ?? "0";

			return (
				<div
					style={{
						padding: "8px 16px 16px 16px",
						borderTopWidth: 1,
						borderTopStyle: "solid",
						borderTopColor: "#f0f0f0",
						...customStyles,
					}}
				>
					<ContainerDropZone containerPath={containerPath} containerField="children" index={0} />
					{block.children.map((child, i) => (
						<div key={i}>
							{onSelectBlock && onBlockUpdate && onBlockDelete ? (
								<NestedBlockWrapper
									block={child}
									path={`${containerPath}.children.${i}`}
									selectedBlockPath={selectedBlockPath ?? null}
									onSelectBlock={onSelectBlock}
									onBlockUpdate={onBlockUpdate}
									onBlockDelete={onBlockDelete}
								/>
							) : (
								<BlockRenderer block={child} path={`${containerPath}.children.${i}`} />
							)}
							<ContainerDropZone
								containerPath={containerPath}
								containerField="children"
								index={i + 1}
							/>
						</div>
					))}
				</div>
			);
		}

		case "quote": {
			const borderColor = block.style?.borderColor || "#0066cc";
			const textColor = block.style?.textColor || "#333";

			return (
				<blockquote
					style={{
						marginTop: 16,
						marginBottom: 16,
						marginLeft: 0,
						marginRight: 0,
						padding: "16px 24px",
						borderLeftWidth: 4,
						borderLeftStyle: "solid",
						borderLeftColor: borderColor,
						backgroundColor: "#f9f9f9",
						fontStyle: "italic",
						...customStyles,
					}}
				>
					<p
						style={{
							marginTop: 0,
							marginBottom: 0,
							marginLeft: 0,
							marginRight: 0,
							color: textColor,
							fontSize: 16,
							lineHeight: 1.6,
						}}
					>
						&quot;{block.text}&quot;
					</p>
					{(block.author || block.authorTitle) && (
						<footer style={{ marginTop: 12, fontSize: 14, color: "#666" }}>
							{block.author && <strong>{block.author}</strong>}
							{block.author && block.authorTitle && " — "}
							{block.authorTitle && <span>{block.authorTitle}</span>}
						</footer>
					)}
				</blockquote>
			);
		}

		case "callout": {
			const variantStyles: Record<CalloutVariant, { bg: string; border: string; icon: string }> = {
				info: { bg: "#e7f3ff", border: "#0066cc", icon: "ℹ️" },
				warning: { bg: "#fff8e6", border: "#f5a623", icon: "⚠️" },
				success: { bg: "#e6f7e6", border: "#28a745", icon: "✅" },
				error: { bg: "#ffe6e6", border: "#dc3545", icon: "❌" },
			};

			const variant = block.variant || "info";
			const styles = variantStyles[variant];
			const containerPath = path ?? "0";

			return (
				<div
					style={{
						marginTop: 16,
						marginBottom: 16,
						padding: 16,
						backgroundColor: styles.bg,
						borderLeftWidth: 4,
						borderLeftStyle: "solid",
						borderLeftColor: styles.border,
						borderRadius: 4,
						...customStyles,
					}}
				>
					<div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
						<span style={{ fontSize: 20 }}>{styles.icon}</span>
						<div style={{ flex: 1 }}>
							{block.title && (
								<strong style={{ display: "block", marginBottom: 8, color: styles.border }}>
									{block.title}
								</strong>
							)}
							<div>
								<ContainerDropZone
									containerPath={containerPath}
									containerField="children"
									index={0}
								/>
								{block.children.map((child, i) => (
									<div key={i}>
										{onSelectBlock && onBlockUpdate && onBlockDelete ? (
											<NestedBlockWrapper
												block={child}
												path={`${containerPath}.children.${i}`}
												selectedBlockPath={selectedBlockPath ?? null}
												onSelectBlock={onSelectBlock}
												onBlockUpdate={onBlockUpdate}
												onBlockDelete={onBlockDelete}
											/>
										) : (
											<BlockRenderer block={child} path={`${containerPath}.children.${i}`} />
										)}
										<ContainerDropZone
											containerPath={containerPath}
											containerField="children"
											index={i + 1}
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			);
		}

		case "badge": {
			const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
				default: { bg: "#e5e5e5", color: "#333" },
				primary: { bg: "#0066cc", color: "#fff" },
				secondary: { bg: "#6c757d", color: "#fff" },
				success: { bg: "#28a745", color: "#fff" },
				warning: { bg: "#f5a623", color: "#fff" },
				error: { bg: "#dc3545", color: "#fff" },
			};

			const variant = block.variant || "default";
			const styles = variantStyles[variant];

			return (
				<span
					style={{
						display: "inline-block",
						padding: "4px 8px",
						fontSize: 12,
						fontWeight: 500,
						borderRadius: 4,
						backgroundColor: styles.bg,
						color: styles.color,
						...customStyles,
					}}
				>
					{block.text}
				</span>
			);
		}

		default:
			return (
				<div
					style={{
						padding: 16,
						background: "#f5f5f5",
						borderRadius: 4,
						marginTop: 16,
						marginBottom: 16,
						marginLeft: 0,
						marginRight: 0,
					}}
				>
					Block: {block.type}
				</div>
			);
	}
}
