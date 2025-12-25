"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { IconPalette, IconBoxMargin, IconLetterCase, IconBorderCorners } from "@tabler/icons-react";
import { useTranslations } from "@/providers/i18n-provider";
import { useFonts } from "@/hooks/use-api";
import { TypographyH4 } from "@/components/typography";
import type { BlockStyle, BlockType } from "@/types";
import { cn } from "@/lib/utils";

interface BlockStyleEditorProps {
	style?: BlockStyle;
	onChange: (style: BlockStyle) => void;
	blockType: BlockType;
}

const COLOR_PRESETS = [
	"#ffffff",
	"#f3f4f6",
	"#e5e7eb",
	"#d1d5db",
	"#9ca3af",
	"#6b7280",
	"#374151",
	"#1f2937",
	"#111827",
	"#000000",
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#14b8a6",
	"#3b82f6",
	"#8b5cf6",
	"#ec4899",
];

function ColorPicker({
	value,
	onChange,
	label,
}: {
	value?: string;
	onChange: (value: string | undefined) => void;
	label: string;
}) {
	const [customColor, setCustomColor] = useState(value || "");

	return (
		<div className="space-y-2">
			<Label className="text-xs">{label}</Label>
			<div className="grid grid-cols-6 gap-1">
				{COLOR_PRESETS.map((color) => (
					<button
						key={color}
						type="button"
						onClick={() => onChange(color)}
						className={cn(
							"size-6 rounded border border-border transition-transform hover:scale-110",
							value === color && "ring-2 ring-primary ring-offset-1"
						)}
						style={{ backgroundColor: color }}
					/>
				))}
			</div>
			<div className="flex items-center gap-2 mt-2">
				<Input
					type="text"
					placeholder="#000000"
					value={customColor}
					onChange={(e) => {
						setCustomColor(e.target.value);
						if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
							onChange(e.target.value);
						}
					}}
					className="h-7 text-xs"
				/>
				{value && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-7 text-xs"
						onClick={() => {
							onChange(undefined);
							setCustomColor("");
						}}
					>
						Clear
					</Button>
				)}
			</div>
		</div>
	);
}

function NumberInput({
	value,
	onChange,
	label,
	min = 0,
	max = 100,
	unit = "px",
}: {
	value?: number;
	onChange: (value: number | undefined) => void;
	label: string;
	min?: number;
	max?: number;
	unit?: string;
}) {
	return (
		<div className="space-y-1">
			<Label className="text-xs">{label}</Label>
			<div className="flex items-center gap-1">
				<Input
					type="number"
					value={value ?? ""}
					onChange={(e) => {
						const val = e.target.value;
						if (val === "") {
							onChange(undefined);
						} else {
							const num = parseInt(val, 10);
							if (!isNaN(num) && num >= min && num <= max) {
								onChange(num);
							}
						}
					}}
					min={min}
					max={max}
					className="h-7 text-xs"
				/>
				<span className="text-xs text-muted-foreground">{unit}</span>
			</div>
		</div>
	);
}

function getApplicableTabs(blockType: BlockType): string[] {
	switch (blockType) {
		case "text":
		case "heading":
		case "list":
			return ["spacing", "colors", "typography"];
		case "button":
			return ["spacing", "colors", "border"];
		case "image":
			return ["spacing", "border"];
		case "divider":
			return ["spacing", "colors"];
		case "header":
		case "footer":
			return ["spacing", "colors"];
		case "section":
		case "grid_wrapper":
		case "flex_wrapper":
			return ["spacing", "colors", "border"];
		default:
			return ["spacing"];
	}
}

export function BlockStyleEditor({ style = {}, onChange, blockType }: BlockStyleEditorProps) {
	const t = useTranslations();
	const { data: fontsResponse } = useFonts();
	const applicableTabs = getApplicableTabs(blockType);

	const fonts = fontsResponse?.fonts || [];

	const updateStyle = (updates: Partial<BlockStyle>) => {
		const newStyle = { ...style, ...updates };
		Object.keys(newStyle).forEach((key) => {
			if (newStyle[key as keyof BlockStyle] === undefined) {
				delete newStyle[key as keyof BlockStyle];
			}
		});
		onChange(newStyle);
	};

	const hasAnyStyle = Object.keys(style).length > 0;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					className={cn(hasAnyStyle && "text-primary")}
				>
					<IconPalette className="size-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="end">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<TypographyH4 size="xs">{t.styles.title}</TypographyH4>
						{hasAnyStyle && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-7 text-xs"
								onClick={() => onChange({})}
							>
								{t.styles.reset}
							</Button>
						)}
					</div>

					<Tabs defaultValue={applicableTabs[0]} className="w-full">
						<TabsList className="w-full h-8">
							{applicableTabs.includes("spacing") && (
								<TabsTrigger value="spacing" className="text-xs flex-1">
									<IconBoxMargin className="size-3 mr-1" />
									{t.styles.spacing}
								</TabsTrigger>
							)}
							{applicableTabs.includes("colors") && (
								<TabsTrigger value="colors" className="text-xs flex-1">
									<IconPalette className="size-3 mr-1" />
									{t.styles.colors}
								</TabsTrigger>
							)}
							{applicableTabs.includes("typography") && (
								<TabsTrigger value="typography" className="text-xs flex-1">
									<IconLetterCase className="size-3 mr-1" />
									{t.styles.typography}
								</TabsTrigger>
							)}
							{applicableTabs.includes("border") && (
								<TabsTrigger value="border" className="text-xs flex-1">
									<IconBorderCorners className="size-3 mr-1" />
									{t.styles.border}
								</TabsTrigger>
							)}
						</TabsList>

						{applicableTabs.includes("spacing") && (
							<TabsContent value="spacing" className="mt-4 space-y-4">
								<div>
									<Label className="text-xs font-medium mb-2 block">{t.styles.padding}</Label>
									<div className="grid grid-cols-2 gap-2">
										<NumberInput
											label={t.styles.top}
											value={style.paddingTop}
											onChange={(v) => updateStyle({ paddingTop: v })}
										/>
										<NumberInput
											label={t.styles.bottom}
											value={style.paddingBottom}
											onChange={(v) => updateStyle({ paddingBottom: v })}
										/>
										<NumberInput
											label={t.styles.left}
											value={style.paddingLeft}
											onChange={(v) => updateStyle({ paddingLeft: v })}
										/>
										<NumberInput
											label={t.styles.right}
											value={style.paddingRight}
											onChange={(v) => updateStyle({ paddingRight: v })}
										/>
									</div>
								</div>
								<Separator />
								<div>
									<Label className="text-xs font-medium mb-2 block">{t.styles.margin}</Label>
									<div className="grid grid-cols-2 gap-2">
										<NumberInput
											label={t.styles.top}
											value={style.marginTop}
											onChange={(v) => updateStyle({ marginTop: v })}
										/>
										<NumberInput
											label={t.styles.bottom}
											value={style.marginBottom}
											onChange={(v) => updateStyle({ marginBottom: v })}
										/>
										<NumberInput
											label={t.styles.left}
											value={style.marginLeft}
											onChange={(v) => updateStyle({ marginLeft: v })}
										/>
										<NumberInput
											label={t.styles.right}
											value={style.marginRight}
											onChange={(v) => updateStyle({ marginRight: v })}
										/>
									</div>
								</div>
							</TabsContent>
						)}

						{applicableTabs.includes("colors") && (
							<TabsContent value="colors" className="mt-4 space-y-4">
								<ColorPicker
									label={t.styles.backgroundColor}
									value={style.backgroundColor}
									onChange={(v) => updateStyle({ backgroundColor: v })}
								/>
								<Separator />
								<ColorPicker
									label={t.styles.textColor}
									value={style.textColor}
									onChange={(v) => updateStyle({ textColor: v })}
								/>
								{blockType === "button" && (
									<>
										<Separator />
										<ColorPicker
											label={t.styles.buttonColor}
											value={style.buttonColor}
											onChange={(v) => updateStyle({ buttonColor: v })}
										/>
										<ColorPicker
											label={t.styles.buttonTextColor}
											value={style.buttonTextColor}
											onChange={(v) => updateStyle({ buttonTextColor: v })}
										/>
									</>
								)}
							</TabsContent>
						)}

						{applicableTabs.includes("typography") && (
							<TabsContent value="typography" className="mt-4 space-y-4">
								<div className="space-y-1">
									<Label className="text-xs">{t.styles.fontFamily}</Label>
									<Select
										value={style.fontFamily || "__default__"}
										onValueChange={(v) =>
											updateStyle({
												fontFamily: !v || v === "__default__" ? undefined : v,
											})
										}
									>
										<SelectTrigger className="h-8">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="__default__">Default</SelectItem>
											{fonts.map((font) => (
												<SelectItem key={font.value} value={font.value}>
													<span style={{ fontFamily: font.value }}>{font.name}</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<NumberInput
									label={t.styles.fontSize}
									value={style.fontSize}
									onChange={(v) => updateStyle({ fontSize: v })}
									min={10}
									max={72}
								/>
								<div className="space-y-1">
									<Label className="text-xs">{t.styles.fontWeight}</Label>
									<Select
										value={style.fontWeight || "normal"}
										onValueChange={(v) =>
											updateStyle({
												fontWeight: v as BlockStyle["fontWeight"],
											})
										}
									>
										<SelectTrigger className="h-8">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="normal">Normal</SelectItem>
											<SelectItem value="medium">Medium</SelectItem>
											<SelectItem value="semibold">Semibold</SelectItem>
											<SelectItem value="bold">Bold</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1">
									<Label className="text-xs">{t.styles.textAlign}</Label>
									<Select
										value={style.textAlign || "left"}
										onValueChange={(v) =>
											updateStyle({
												textAlign: v as BlockStyle["textAlign"],
											})
										}
									>
										<SelectTrigger className="h-8">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="left">Left</SelectItem>
											<SelectItem value="center">Center</SelectItem>
											<SelectItem value="right">Right</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</TabsContent>
						)}

						{applicableTabs.includes("border") && (
							<TabsContent value="border" className="mt-4 space-y-4">
								<NumberInput
									label={t.styles.borderRadius}
									value={style.borderRadius}
									onChange={(v) => updateStyle({ borderRadius: v })}
									max={50}
								/>
								<NumberInput
									label={t.styles.borderWidth}
									value={style.borderWidth}
									onChange={(v) => updateStyle({ borderWidth: v })}
									max={10}
								/>
								{(style.borderWidth ?? 0) > 0 && (
									<ColorPicker
										label={t.styles.borderColor}
										value={style.borderColor}
										onChange={(v) => updateStyle({ borderColor: v })}
									/>
								)}
							</TabsContent>
						)}
					</Tabs>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export function BlockStyleEditorInline({ style = {}, onChange, blockType }: BlockStyleEditorProps) {
	const t = useTranslations();
	const { data: fontsResponse } = useFonts();
	const applicableTabs = getApplicableTabs(blockType);

	const fonts = fontsResponse?.fonts || [];

	const updateStyle = (updates: Partial<BlockStyle>) => {
		const newStyle = { ...style, ...updates };
		Object.keys(newStyle).forEach((key) => {
			if (newStyle[key as keyof BlockStyle] === undefined) {
				delete newStyle[key as keyof BlockStyle];
			}
		});
		onChange(newStyle);
	};

	const hasAnyStyle = Object.keys(style).length > 0;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<TypographyH4 size="2xs" className="text-muted-foreground">
					{t.styles.title}
				</TypographyH4>
				{hasAnyStyle && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-6 text-xs px-2"
						onClick={() => onChange({})}
					>
						{t.styles.reset}
					</Button>
				)}
			</div>

			<Tabs defaultValue={applicableTabs[0]} className="w-full">
				<TabsList className="w-full h-7">
					{applicableTabs.includes("spacing") && (
						<TabsTrigger value="spacing" className="text-xs flex-1 h-6">
							<IconBoxMargin className="size-3" />
						</TabsTrigger>
					)}
					{applicableTabs.includes("colors") && (
						<TabsTrigger value="colors" className="text-xs flex-1 h-6">
							<IconPalette className="size-3" />
						</TabsTrigger>
					)}
					{applicableTabs.includes("typography") && (
						<TabsTrigger value="typography" className="text-xs flex-1 h-6">
							<IconLetterCase className="size-3" />
						</TabsTrigger>
					)}
					{applicableTabs.includes("border") && (
						<TabsTrigger value="border" className="text-xs flex-1 h-6">
							<IconBorderCorners className="size-3" />
						</TabsTrigger>
					)}
				</TabsList>

				{applicableTabs.includes("spacing") && (
					<TabsContent value="spacing" className="mt-3 space-y-3">
						<div>
							<Label className="text-xs font-medium mb-2 block">{t.styles.padding}</Label>
							<div className="grid grid-cols-2 gap-2">
								<NumberInput
									label={t.styles.top}
									value={style.paddingTop}
									onChange={(v) => updateStyle({ paddingTop: v })}
								/>
								<NumberInput
									label={t.styles.bottom}
									value={style.paddingBottom}
									onChange={(v) => updateStyle({ paddingBottom: v })}
								/>
								<NumberInput
									label={t.styles.left}
									value={style.paddingLeft}
									onChange={(v) => updateStyle({ paddingLeft: v })}
								/>
								<NumberInput
									label={t.styles.right}
									value={style.paddingRight}
									onChange={(v) => updateStyle({ paddingRight: v })}
								/>
							</div>
						</div>
						<Separator />
						<div>
							<Label className="text-xs font-medium mb-2 block">{t.styles.margin}</Label>
							<div className="grid grid-cols-2 gap-2">
								<NumberInput
									label={t.styles.top}
									value={style.marginTop}
									onChange={(v) => updateStyle({ marginTop: v })}
								/>
								<NumberInput
									label={t.styles.bottom}
									value={style.marginBottom}
									onChange={(v) => updateStyle({ marginBottom: v })}
								/>
								<NumberInput
									label={t.styles.left}
									value={style.marginLeft}
									onChange={(v) => updateStyle({ marginLeft: v })}
								/>
								<NumberInput
									label={t.styles.right}
									value={style.marginRight}
									onChange={(v) => updateStyle({ marginRight: v })}
								/>
							</div>
						</div>
					</TabsContent>
				)}

				{applicableTabs.includes("colors") && (
					<TabsContent value="colors" className="mt-3 space-y-3">
						<ColorPicker
							label={t.styles.backgroundColor}
							value={style.backgroundColor}
							onChange={(v) => updateStyle({ backgroundColor: v })}
						/>
						<Separator />
						<ColorPicker
							label={t.styles.textColor}
							value={style.textColor}
							onChange={(v) => updateStyle({ textColor: v })}
						/>
						{blockType === "button" && (
							<>
								<Separator />
								<ColorPicker
									label={t.styles.buttonColor}
									value={style.buttonColor}
									onChange={(v) => updateStyle({ buttonColor: v })}
								/>
								<ColorPicker
									label={t.styles.buttonTextColor}
									value={style.buttonTextColor}
									onChange={(v) => updateStyle({ buttonTextColor: v })}
								/>
							</>
						)}
					</TabsContent>
				)}

				{applicableTabs.includes("typography") && (
					<TabsContent value="typography" className="mt-3 space-y-3">
						<div className="space-y-1">
							<Label className="text-xs">{t.styles.fontFamily}</Label>
							<Select
								value={style.fontFamily || "__default__"}
								onValueChange={(v) =>
									updateStyle({
										fontFamily: !v || v === "__default__" ? undefined : v,
									})
								}
							>
								<SelectTrigger className="h-7">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__default__">Default</SelectItem>
									{fonts.map((font) => (
										<SelectItem key={font.value} value={font.value}>
											<span style={{ fontFamily: font.value }}>{font.name}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<NumberInput
								label={t.styles.fontSize}
								value={style.fontSize}
								onChange={(v) => updateStyle({ fontSize: v })}
								min={10}
								max={72}
							/>
							<div className="space-y-1">
								<Label className="text-xs">{t.styles.fontWeight}</Label>
								<Select
									value={style.fontWeight || "normal"}
									onValueChange={(v) =>
										updateStyle({
											fontWeight: v as BlockStyle["fontWeight"],
										})
									}
								>
									<SelectTrigger className="h-7">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="normal">Normal</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="semibold">Semibold</SelectItem>
										<SelectItem value="bold">Bold</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-1">
							<Label className="text-xs">{t.styles.textAlign}</Label>
							<Select
								value={style.textAlign || "left"}
								onValueChange={(v) =>
									updateStyle({
										textAlign: v as BlockStyle["textAlign"],
									})
								}
							>
								<SelectTrigger className="h-7">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="left">Left</SelectItem>
									<SelectItem value="center">Center</SelectItem>
									<SelectItem value="right">Right</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</TabsContent>
				)}

				{applicableTabs.includes("border") && (
					<TabsContent value="border" className="mt-3 space-y-3">
						<div className="grid grid-cols-2 gap-2">
							<NumberInput
								label={t.styles.borderRadius}
								value={style.borderRadius}
								onChange={(v) => updateStyle({ borderRadius: v })}
								max={50}
							/>
							<NumberInput
								label={t.styles.borderWidth}
								value={style.borderWidth}
								onChange={(v) => updateStyle({ borderWidth: v })}
								max={10}
							/>
						</div>
						{(style.borderWidth ?? 0) > 0 && (
							<ColorPicker
								label={t.styles.borderColor}
								value={style.borderColor}
								onChange={(v) => updateStyle({ borderColor: v })}
							/>
						)}
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
