"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { IconAlignLeft, IconAlignCenter, IconAlignRight } from "@tabler/icons-react";

type Side = "top" | "right" | "bottom" | "left";
type SpacingType = "padding" | "margin";

interface DragState {
	type: SpacingType;
	side: Side;
	startY: number;
	startX: number;
	startValue: number;
}

interface SpacingControlsProps {
	paddingTop?: number;
	paddingRight?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	marginTop?: number;
	marginRight?: number;
	marginBottom?: number;
	marginLeft?: number;
	borderRadius?: number;
	width?: number;
	height?: number;
	textAlign?: "left" | "center" | "right";
	onPaddingChange: (side: "top" | "right" | "bottom" | "left", value: number) => void;
	onMarginChange: (side: "top" | "right" | "bottom" | "left", value: number) => void;
	onBorderRadiusChange: (value: number) => void;
	onWidthChange: (value: number) => void;
	onHeightChange: (value: number) => void;
	onTextAlignChange: (value: "left" | "center" | "right") => void;
}

interface SpacingHandleProps {
	type: SpacingType;
	side: Side;
	value: number;
	isHovered: boolean;
	isDragging: boolean;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	onMouseDown: (e: React.MouseEvent) => void;
}

const HANDLE_THICKNESS = 6;
const PADDING_COLOR = "rgba(34, 197, 94, 0.4)";
const PADDING_COLOR_HOVER = "rgba(34, 197, 94, 0.8)";
const MARGIN_COLOR = "rgba(249, 115, 22, 0.4)";
const MARGIN_COLOR_HOVER = "rgba(249, 115, 22, 0.8)";

function SpacingHandle({
	type,
	side,
	value,
	isHovered,
	isDragging,
	onMouseEnter,
	onMouseLeave,
	onMouseDown,
}: SpacingHandleProps) {
	const isVertical = side === "top" || side === "bottom";
	const color = type === "padding" ? PADDING_COLOR : MARGIN_COLOR;
	const hoverColor = type === "padding" ? PADDING_COLOR_HOVER : MARGIN_COLOR_HOVER;
	const solidColor = type === "padding" ? "rgb(34, 197, 94)" : "rgb(249, 115, 22)";

	const marginOffset = type === "margin" ? -HANDLE_THICKNESS - 2 : 0;

	const positionStyles: React.CSSProperties = {
		position: "absolute",
		pointerEvents: "auto",
		cursor: isVertical ? "ns-resize" : "ew-resize",
		zIndex: type === "margin" ? 10 : 20,
	};

	if (side === "top") {
		Object.assign(positionStyles, {
			top: marginOffset,
			left: 0,
			right: 0,
			height: HANDLE_THICKNESS,
		});
	} else if (side === "bottom") {
		Object.assign(positionStyles, {
			bottom: marginOffset,
			left: 0,
			right: 0,
			height: HANDLE_THICKNESS,
		});
	} else if (side === "left") {
		Object.assign(positionStyles, {
			left: marginOffset,
			top: 0,
			bottom: 0,
			width: HANDLE_THICKNESS,
		});
	} else if (side === "right") {
		Object.assign(positionStyles, {
			right: marginOffset,
			top: 0,
			bottom: 0,
			width: HANDLE_THICKNESS,
		});
	}

	return (
		<div
			style={{
				...positionStyles,
				backgroundColor: isHovered || isDragging ? hoverColor : color,
				borderRadius: 1,
				transition: isDragging ? "none" : "background-color 0.15s, opacity 0.15s",
				opacity: isHovered || isDragging ? 1 : 0.6,
			}}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onMouseDown={onMouseDown}
		>
			{(isHovered || isDragging) && (
				<div
					style={{
						position: "absolute",
						top: isVertical ? (side === "top" ? -22 : "auto") : "50%",
						bottom: isVertical ? (side === "bottom" ? -22 : "auto") : "auto",
						left: isVertical ? "50%" : side === "left" ? -30 : "auto",
						right: isVertical ? "auto" : side === "right" ? -30 : "auto",
						transform: isVertical ? "translateX(-50%)" : "translateY(-50%)",
						backgroundColor: solidColor,
						color: "white",
						fontSize: 10,
						fontWeight: 500,
						padding: "2px 6px",
						borderRadius: 3,
						whiteSpace: "nowrap",
						boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
					}}
				>
					{value}
				</div>
			)}
		</div>
	);
}

export function SpacingControls({
	paddingTop = 0,
	paddingRight = 0,
	paddingBottom = 0,
	paddingLeft = 0,
	marginTop = 0,
	marginRight = 0,
	marginBottom = 0,
	marginLeft = 0,
	borderRadius = 0,
	width,
	height,
	textAlign = "left",
	onPaddingChange,
	onMarginChange,
	onBorderRadiusChange,
	onWidthChange,
	onHeightChange,
	onTextAlignChange,
}: SpacingControlsProps) {
	const [hoveredHandle, setHoveredHandle] = useState<{ type: SpacingType; side: Side } | null>(
		null
	);
	const [hoveredCorner, setHoveredCorner] = useState(false);
	const [hoveredResize, setHoveredResize] = useState<"left" | "right" | "top" | "bottom" | null>(
		null
	);
	const [dragState, setDragState] = useState<DragState | null>(null);
	const [cornerDrag, setCornerDrag] = useState<{
		startX: number;
		startY: number;
		startValue: number;
	} | null>(null);
	const [resizeDrag, setResizeDrag] = useState<{
		side: "left" | "right" | "top" | "bottom";
		startX: number;
		startY: number;
		startWidth: number;
		startHeight: number;
	} | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const getSpacingValue = useCallback(
		(type: SpacingType, side: Side): number => {
			if (type === "padding") {
				switch (side) {
					case "top":
						return paddingTop;
					case "right":
						return paddingRight;
					case "bottom":
						return paddingBottom;
					case "left":
						return paddingLeft;
				}
			} else {
				switch (side) {
					case "top":
						return marginTop;
					case "right":
						return marginRight;
					case "bottom":
						return marginBottom;
					case "left":
						return marginLeft;
				}
			}
		},
		[
			marginBottom,
			marginLeft,
			marginRight,
			marginTop,
			paddingBottom,
			paddingLeft,
			paddingRight,
			paddingTop,
		]
	);

	const handleMouseDown = useCallback(
		(type: SpacingType, side: Side, e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragState({
				type,
				side,
				startX: e.clientX,
				startY: e.clientY,
				startValue: getSpacingValue(type, side),
			});
		},
		[getSpacingValue]
	);

	useEffect(() => {
		if (!dragState) return;

		const handleMouseMove = (e: MouseEvent) => {
			const isVertical = dragState.side === "top" || dragState.side === "bottom";
			const delta = isVertical
				? dragState.side === "top"
					? dragState.startY - e.clientY
					: e.clientY - dragState.startY
				: dragState.side === "left"
				? dragState.startX - e.clientX
				: e.clientX - dragState.startX;

			const newValue = Math.max(0, dragState.startValue + delta);

			if (dragState.type === "padding") {
				onPaddingChange(dragState.side, newValue);
			} else {
				onMarginChange(dragState.side, newValue);
			}
		};

		const handleMouseUp = () => {
			setDragState(null);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [dragState, onPaddingChange, onMarginChange]);

	useEffect(() => {
		if (!cornerDrag) return;

		const handleMouseMove = (e: MouseEvent) => {
			const dx = e.clientX - cornerDrag.startX;
			const dy = e.clientY - cornerDrag.startY;
			const delta = Math.round((dx - dy) / 2);
			const newValue = Math.max(0, Math.min(100, cornerDrag.startValue + delta));
			onBorderRadiusChange(newValue);
		};

		const handleMouseUp = () => setCornerDrag(null);

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [cornerDrag, onBorderRadiusChange]);

	useEffect(() => {
		if (!resizeDrag) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (resizeDrag.side === "left" || resizeDrag.side === "right") {
				const delta =
					resizeDrag.side === "right"
						? e.clientX - resizeDrag.startX
						: resizeDrag.startX - e.clientX;
				const newWidth = Math.max(50, resizeDrag.startWidth + delta * 2);
				onWidthChange(newWidth);
			} else {
				const delta =
					resizeDrag.side === "bottom"
						? e.clientY - resizeDrag.startY
						: resizeDrag.startY - e.clientY;
				const newHeight = Math.max(20, resizeDrag.startHeight + delta * 2);
				onHeightChange(newHeight);
			}
		};

		const handleMouseUp = () => setResizeDrag(null);

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [resizeDrag, onWidthChange, onHeightChange]);

	const handleCornerMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setCornerDrag({ startX: e.clientX, startY: e.clientY, startValue: borderRadius });
	};

	const handleResizeMouseDown = (
		side: "left" | "right" | "top" | "bottom",
		e: React.MouseEvent
	) => {
		e.preventDefault();
		e.stopPropagation();
		const currentWidth = width || containerRef.current?.offsetWidth || 200;
		const currentHeight = height || containerRef.current?.offsetHeight || 50;
		setResizeDrag({
			side,
			startX: e.clientX,
			startY: e.clientY,
			startWidth: currentWidth,
			startHeight: currentHeight,
		});
	};

	const sides: Side[] = ["top", "right", "bottom", "left"];
	const types: SpacingType[] = ["margin", "padding"];

	return (
		<div ref={containerRef} className="absolute inset-0 pointer-events-none">
			{types.map((type) =>
				sides.map((side) => {
					const value = getSpacingValue(type, side);
					const isHovered = hoveredHandle?.type === type && hoveredHandle?.side === side;
					const isDragging = dragState?.type === type && dragState?.side === side;

					return (
						<SpacingHandle
							key={`${type}-${side}`}
							type={type}
							side={side}
							value={value}
							isHovered={isHovered}
							isDragging={isDragging}
							onMouseEnter={() => setHoveredHandle({ type, side })}
							onMouseLeave={() => setHoveredHandle(null)}
							onMouseDown={(e) => handleMouseDown(type, side, e)}
						/>
					);
				})
			)}

			<div
				style={{
					position: "absolute",
					top: -4,
					right: -4,
					width: 12,
					height: 12,
					borderRadius: "50%",
					backgroundColor:
						hoveredCorner || cornerDrag ? "rgb(139, 92, 246)" : "rgba(139, 92, 246, 0.6)",
					cursor: "nwse-resize",
					pointerEvents: "auto",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
					transition: cornerDrag ? "none" : "background-color 0.15s",
					zIndex: 30,
				}}
				onMouseEnter={() => setHoveredCorner(true)}
				onMouseLeave={() => setHoveredCorner(false)}
				onMouseDown={handleCornerMouseDown}
			>
				{(hoveredCorner || cornerDrag) && (
					<div
						style={{
							position: "absolute",
							top: -22,
							right: 0,
							backgroundColor: "rgb(139, 92, 246)",
							color: "white",
							fontSize: 10,
							fontWeight: 500,
							padding: "2px 6px",
							borderRadius: 3,
							whiteSpace: "nowrap",
							boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
						}}
					>
						{borderRadius}px
					</div>
				)}
			</div>

			<div
				style={{
					position: "absolute",
					left: -8,
					top: "50%",
					transform: "translateY(-50%)",
					width: 6,
					height: 24,
					borderRadius: 3,
					backgroundColor:
						hoveredResize === "left" || resizeDrag?.side === "left"
							? "rgb(59, 130, 246)"
							: "rgba(59, 130, 246, 0.5)",
					cursor: "ew-resize",
					pointerEvents: "auto",
					boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
					transition: resizeDrag ? "none" : "background-color 0.15s",
					zIndex: 30,
				}}
				onMouseEnter={() => setHoveredResize("left")}
				onMouseLeave={() => setHoveredResize(null)}
				onMouseDown={(e) => handleResizeMouseDown("left", e)}
			/>
			<div
				style={{
					position: "absolute",
					right: -8,
					top: "50%",
					transform: "translateY(-50%)",
					width: 6,
					height: 24,
					borderRadius: 3,
					backgroundColor:
						hoveredResize === "right" || resizeDrag?.side === "right"
							? "rgb(59, 130, 246)"
							: "rgba(59, 130, 246, 0.5)",
					cursor: "ew-resize",
					pointerEvents: "auto",
					boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
					transition: resizeDrag ? "none" : "background-color 0.15s",
					zIndex: 30,
				}}
				onMouseEnter={() => setHoveredResize("right")}
				onMouseLeave={() => setHoveredResize(null)}
				onMouseDown={(e) => handleResizeMouseDown("right", e)}
			>
				{(hoveredResize === "right" || resizeDrag?.side === "right") && width && (
					<div
						style={{
							position: "absolute",
							right: -35,
							top: "50%",
							transform: "translateY(-50%)",
							backgroundColor: "rgb(59, 130, 246)",
							color: "white",
							fontSize: 10,
							fontWeight: 500,
							padding: "2px 6px",
							borderRadius: 3,
							whiteSpace: "nowrap",
							boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
						}}
					>
						{width}px
					</div>
				)}
			</div>

			<div
				style={{
					position: "absolute",
					top: -8,
					left: "50%",
					transform: "translateX(-50%)",
					width: 24,
					height: 6,
					borderRadius: 3,
					backgroundColor:
						hoveredResize === "top" || resizeDrag?.side === "top"
							? "rgb(59, 130, 246)"
							: "rgba(59, 130, 246, 0.5)",
					cursor: "ns-resize",
					pointerEvents: "auto",
					boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
					transition: resizeDrag ? "none" : "background-color 0.15s",
					zIndex: 30,
				}}
				onMouseEnter={() => setHoveredResize("top")}
				onMouseLeave={() => setHoveredResize(null)}
				onMouseDown={(e) => handleResizeMouseDown("top", e)}
			/>
			<div
				style={{
					position: "absolute",
					bottom: -8,
					left: "50%",
					transform: "translateX(-50%)",
					width: 24,
					height: 6,
					borderRadius: 3,
					backgroundColor:
						hoveredResize === "bottom" || resizeDrag?.side === "bottom"
							? "rgb(59, 130, 246)"
							: "rgba(59, 130, 246, 0.5)",
					cursor: "ns-resize",
					pointerEvents: "auto",
					boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
					transition: resizeDrag ? "none" : "background-color 0.15s",
					zIndex: 30,
				}}
				onMouseEnter={() => setHoveredResize("bottom")}
				onMouseLeave={() => setHoveredResize(null)}
				onMouseDown={(e) => handleResizeMouseDown("bottom", e)}
			>
				{(hoveredResize === "bottom" || resizeDrag?.side === "bottom") && height && (
					<div
						style={{
							position: "absolute",
							bottom: -22,
							left: "50%",
							transform: "translateX(-50%)",
							backgroundColor: "rgb(59, 130, 246)",
							color: "white",
							fontSize: 10,
							fontWeight: 500,
							padding: "2px 6px",
							borderRadius: 3,
							whiteSpace: "nowrap",
							boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
						}}
					>
						{height}px
					</div>
				)}
			</div>

			<div
				style={{
					position: "absolute",
					top: -32,
					left: "50%",
					transform: "translateX(-50%)",
					display: "flex",
					gap: 2,
					backgroundColor: "white",
					borderRadius: 4,
					padding: 2,
					boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
					pointerEvents: "auto",
					zIndex: 30,
				}}
			>
				{(["left", "center", "right"] as const).map((align) => {
					const Icon =
						align === "left"
							? IconAlignLeft
							: align === "center"
							? IconAlignCenter
							: IconAlignRight;
					return (
						<button
							key={align}
							onClick={(e) => {
								e.stopPropagation();
								onTextAlignChange(align);
							}}
							style={{
								width: 24,
								height: 24,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: "none",
								borderRadius: 3,
								backgroundColor: textAlign === align ? "rgb(59, 130, 246)" : "transparent",
								color: textAlign === align ? "white" : "#666",
								cursor: "pointer",
							}}
						>
							<Icon size={14} />
						</button>
					);
				})}
			</div>
		</div>
	);
}
