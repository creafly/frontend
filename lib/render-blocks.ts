import type { Block, BlockStyle, CalloutVariant, BadgeVariant } from "@/types";

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

const FONT_WEIGHT_MAP: Record<NonNullable<BlockStyle["fontWeight"]>, string> = {
	normal: "400",
	medium: "500",
	semibold: "600",
	bold: "700",
};

const FONT_WEIGHT_NUMBER_TO_NAME: Record<number, NonNullable<BlockStyle["fontWeight"]>> = {
	400: "normal",
	500: "medium",
	600: "semibold",
	700: "bold",
};

interface RawBlockStyle {
	paddingTop?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	paddingRight?: number;
	marginTop?: number;
	marginBottom?: number;
	marginLeft?: number;
	marginRight?: number;
	backgroundColor?: string;
	textColor?: string;
	color?: string;
	fontSize?: number;
	fontWeight?: BlockStyle["fontWeight"] | number;
	fontFamily?: string;
	textAlign?: "left" | "center" | "right";
	borderRadius?: number;
	borderWidth?: number;
	borderColor?: string;
	buttonColor?: string;
	buttonTextColor?: string;
	lineHeight?: number;
}

function normalizeStyle(style?: RawBlockStyle): BlockStyle | undefined {
	if (!style) return undefined;

	const normalized: BlockStyle = {
		paddingTop: style.paddingTop,
		paddingBottom: style.paddingBottom,
		paddingLeft: style.paddingLeft,
		paddingRight: style.paddingRight,
		marginTop: style.marginTop,
		marginBottom: style.marginBottom,
		marginLeft: style.marginLeft,
		marginRight: style.marginRight,
		backgroundColor: style.backgroundColor,
		textColor: style.textColor || style.color,
		fontSize: style.fontSize,
		fontFamily: style.fontFamily,
		textAlign: style.textAlign,
		borderRadius: style.borderRadius,
		borderWidth: style.borderWidth,
		borderColor: style.borderColor,
		buttonColor: style.buttonColor,
		buttonTextColor: style.buttonTextColor,
	};

	if (typeof style.fontWeight === "number") {
		normalized.fontWeight = FONT_WEIGHT_NUMBER_TO_NAME[style.fontWeight] || "normal";
	} else {
		normalized.fontWeight = style.fontWeight;
	}

	return normalized;
}

function buildStyleString(rawStyle?: RawBlockStyle): string {
	const style = normalizeStyle(rawStyle);
	if (!style) return "";

	const parts: string[] = [];

	if (style.paddingTop !== undefined) parts.push(`padding-top: ${style.paddingTop}px`);
	if (style.paddingBottom !== undefined) parts.push(`padding-bottom: ${style.paddingBottom}px`);
	if (style.paddingLeft !== undefined) parts.push(`padding-left: ${style.paddingLeft}px`);
	if (style.paddingRight !== undefined) parts.push(`padding-right: ${style.paddingRight}px`);
	if (style.marginTop !== undefined) parts.push(`margin-top: ${style.marginTop}px`);
	if (style.marginBottom !== undefined) parts.push(`margin-bottom: ${style.marginBottom}px`);
	if (style.marginLeft !== undefined) parts.push(`margin-left: ${style.marginLeft}px`);
	if (style.marginRight !== undefined) parts.push(`margin-right: ${style.marginRight}px`);

	if (style.backgroundColor) parts.push(`background-color: ${style.backgroundColor}`);
	if (style.textColor) parts.push(`color: ${style.textColor}`);

	if (style.fontFamily) parts.push(`font-family: ${style.fontFamily}`);
	if (style.fontSize !== undefined) parts.push(`font-size: ${style.fontSize}px`);
	if (style.fontWeight) parts.push(`font-weight: ${FONT_WEIGHT_MAP[style.fontWeight]}`);
	if (style.textAlign) parts.push(`text-align: ${style.textAlign}`);

	if (style.borderRadius !== undefined) parts.push(`border-radius: ${style.borderRadius}px`);
	if (style.borderWidth !== undefined && style.borderWidth > 0) {
		parts.push(`border-width: ${style.borderWidth}px`);
		parts.push("border-style: solid");
		if (style.borderColor) parts.push(`border-color: ${style.borderColor}`);
	}

	return parts.join("; ");
}

function mergeStyles(baseStyle: string, customStyle?: BlockStyle): string {
	const customStyleStr = buildStyleString(customStyle);
	if (!customStyleStr) return baseStyle;
	return `${baseStyle}; ${customStyleStr}`;
}

function renderBlock(block: Block): string {
	switch (block.type) {
		case "text": {
			const baseStyle = "margin: 0 0 16px 0; line-height: 1.6";
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<p style="${finalStyle}">${escapeHtml(block.value)}</p>`;
		}

		case "heading": {
			const level = block.level || "h2";
			const sizes: Record<string, string> = {
				h1: "32px",
				h2: "24px",
				h3: "20px",
				h4: "18px",
				h5: "16px",
				h6: "14px",
			};
			const baseStyle = `margin: 0 0 16px 0; font-size: ${sizes[level]}; font-weight: bold`;
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<${level} style="${finalStyle}">${escapeHtml(block.text)}</${level}>`;
		}

		case "image": {
			const baseStyle = "max-width: 100%; height: auto; display: block; margin: 0 auto 16px auto";
			const finalStyle = mergeStyles(baseStyle, block.style);
			const imgHtml = `<img src="${escapeHtml(block.url)}" alt="${escapeHtml(
				block.alt
			)}" style="${finalStyle}" />`;
			if (block.linkUrl) {
				return `<a href="${escapeHtml(block.linkUrl)}" target="_blank">${imgHtml}</a>`;
			}
			return imgHtml;
		}

		case "button": {
			const buttonColor = block.style?.buttonColor || "#0066cc";
			const buttonTextColor = block.style?.buttonTextColor || "#ffffff";
			const borderRadius =
				block.style?.borderRadius !== undefined ? `${block.style.borderRadius}px` : "6px";

			const wrapperBaseStyle = "text-align: center; margin: 24px 0";
			const wrapperStyle = mergeStyles(wrapperBaseStyle, {
				marginTop: block.style?.marginTop,
				marginBottom: block.style?.marginBottom,
				backgroundColor: block.style?.backgroundColor,
				paddingTop: block.style?.paddingTop,
				paddingBottom: block.style?.paddingBottom,
				paddingLeft: block.style?.paddingLeft,
				paddingRight: block.style?.paddingRight,
			});

			const buttonStyle = `display: inline-block; padding: 12px 24px; background-color: ${buttonColor}; color: ${buttonTextColor}; text-decoration: none; border-radius: ${borderRadius}; font-weight: 500`;

			return `
        <div style="${wrapperStyle}">
          <a href="${escapeHtml(block.url)}" target="_blank" style="${buttonStyle}">
            ${escapeHtml(block.text)}
          </a>
        </div>
      `;
		}

		case "spacer":
			return `<div style="height: ${block.height || 24}px;"></div>`;

		case "divider": {
			const borderColor = block.style?.borderColor || "#e5e5e5";
			const baseStyle = `border: none; border-top: 1px solid ${borderColor}; margin: 24px 0`;
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<hr style="${finalStyle}" />`;
		}

		case "list": {
			const tag = block.ordered ? "ol" : "ul";
			const items = block.items
				.map((item) => `<li style="margin-bottom: 8px;">${escapeHtml(item)}</li>`)
				.join("");
			const baseStyle = "margin: 0 0 16px 0; padding-left: 24px";
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<${tag} style="${finalStyle}">${items}</${tag}>`;
		}

		case "header": {
			const baseStyle =
				"text-align: center; padding: 24px 0; border-bottom: 1px solid #e5e5e5; margin-bottom: 24px";
			const finalStyle = mergeStyles(baseStyle, block.style);
			let html = `<div style="${finalStyle}">`;
			if (block.logoUrl) {
				html += `<img src="${escapeHtml(block.logoUrl)}" alt="${escapeHtml(
					block.logoAlt || "Logo"
				)}" style="max-width: ${block.logoWidth || 150}px; height: auto; margin-bottom: 16px;" />`;
			}
			if (block.title) {
				const titleColor = block.style?.textColor ? `color: ${block.style.textColor};` : "";
				html += `<h1 style="margin: 0; font-size: 24px; font-weight: bold; ${titleColor}">${escapeHtml(
					block.title
				)}</h1>`;
			}
			if (block.navLinks && block.navLinks.length > 0) {
				html += '<div style="margin-top: 16px;">';
				html += block.navLinks
					.map(
						(link) =>
							`<a href="${escapeHtml(
								link.url
							)}" style="margin: 0 12px; color: #0066cc; text-decoration: none;">${escapeHtml(
								link.text
							)}</a>`
					)
					.join("");
				html += "</div>";
			}
			html += "</div>";
			return html;
		}

		case "footer": {
			const baseStyle =
				"text-align: center; padding: 24px 0; border-top: 1px solid #e5e5e5; margin-top: 24px; color: #666; font-size: 12px";
			const finalStyle = mergeStyles(baseStyle, block.style);
			let html = `<div style="${finalStyle}">`;
			if (block.companyName) {
				html += `<p style="margin: 0 0 8px 0; font-weight: 500;">${escapeHtml(
					block.companyName
				)}</p>`;
			}
			if (block.address) {
				html += `<p style="margin: 0 0 8px 0;">${escapeHtml(block.address)}</p>`;
			}
			if (block.links && block.links.length > 0) {
				html += '<div style="margin: 16px 0;">';
				html += block.links
					.map(
						(link) =>
							`<a href="${escapeHtml(link.url)}" style="margin: 0 8px; color: #666;">${escapeHtml(
								link.text
							)}</a>`
					)
					.join("");
				html += "</div>";
			}
			if (block.unsubscribeUrl) {
				html += `<p style="margin: 16px 0 0 0;"><a href="${escapeHtml(
					block.unsubscribeUrl
				)}" style="color: #999;">${escapeHtml(block.unsubscribeText || "Unsubscribe")}</a></p>`;
			}
			html += "</div>";
			return html;
		}

		case "section": {
			const baseStyle = "margin: 16px 0";
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<div style="${finalStyle}">${block.blocks.map(renderBlock).join("")}</div>`;
		}

		case "grid_wrapper": {
			const columns = block.columns || 2;
			const rows = block.rows;
			const gap = block.gap ?? 16;
			const alignItems = block.alignItems || "stretch";
			const justifyItems = block.justifyItems || "stretch";

			let baseStyle = `display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: ${gap}px; align-items: ${alignItems}; justify-items: ${justifyItems}; margin: 16px 0`;
			if (rows) {
				baseStyle += `; grid-template-rows: repeat(${rows}, auto)`;
			}
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<div style="${finalStyle}">${block.blocks.map(renderBlock).join("")}</div>`;
		}

		case "flex_wrapper": {
			const direction = block.direction || "row";
			const gap = block.gap ?? 16;
			const alignItems = block.alignItems || "center";
			const justifyContent = block.justifyContent || "flex-start";
			const wrap = block.wrap || "wrap";

			const justifyValue =
				justifyContent === "start"
					? "flex-start"
					: justifyContent === "end"
					? "flex-end"
					: justifyContent;

			const baseStyle = `display: flex; flex-direction: ${direction}; gap: ${gap}px; align-items: ${alignItems}; justify-content: ${justifyValue}; flex-wrap: ${wrap}; margin: 16px 0`;
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<div style="${finalStyle}">${block.blocks.map(renderBlock).join("")}</div>`;
		}

		case "conditional":
			return block.showIf.map(renderBlock).join("");

		case "link": {
			const linkColor = block.style?.textColor || "#0066cc";
			const baseStyle = `color: ${linkColor}; text-decoration: none`;
			const finalStyle = mergeStyles(baseStyle, block.style);

			if (block.children && block.children.length > 0) {
				return `<a href="${escapeHtml(
					block.url
				)}" target="_blank" style="${finalStyle}">${block.children.map(renderBlock).join("")}</a>`;
			}

			return `<a href="${escapeHtml(block.url)}" target="_blank" style="${finalStyle}">${escapeHtml(
				block.text || block.url
			)}</a>`;
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
				return `<img src="${escapeHtml(block.url)}" alt="${escapeHtml(
					block.name || "icon"
				)}" style="width: ${size}px; height: ${size}px; display: inline-block;" />`;
			}

			const iconChar = block.name ? builtInIcons[block.name] || "•" : "•";
			return `<span style="font-size: ${size}px; color: ${color}; display: inline-flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px;">${iconChar}</span>`;
		}

		case "card_container": {
			const borderRadius =
				block.style?.borderRadius !== undefined ? `${block.style.borderRadius}px` : "8px";
			const borderColor = block.style?.borderColor || "#e5e5e5";
			const bgColor = block.style?.backgroundColor || "#ffffff";
			const baseStyle = `border: 1px solid ${borderColor}; border-radius: ${borderRadius}; overflow: hidden; margin: 16px 0; background-color: ${bgColor}`;
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<div style="${finalStyle}">${block.children.map(renderBlock).join("")}</div>`;
		}

		case "card_header": {
			const baseStyle = "padding: 16px 16px 8px 16px; border-bottom: 1px solid #f0f0f0";
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<div style="${finalStyle}">${block.children.map(renderBlock).join("")}</div>`;
		}

		case "card_content": {
			const baseStyle = "padding: 16px";
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<div style="${finalStyle}">${block.children.map(renderBlock).join("")}</div>`;
		}

		case "card_footer": {
			const baseStyle = "padding: 8px 16px 16px 16px; border-top: 1px solid #f0f0f0";
			const finalStyle = mergeStyles(baseStyle, block.style);
			return `<div style="${finalStyle}">${block.children.map(renderBlock).join("")}</div>`;
		}

		case "quote": {
			const borderColor = block.style?.borderColor || "#0066cc";
			const textColor = block.style?.textColor || "#333";
			const baseStyle = `margin: 16px 0; padding: 16px 24px; border-left: 4px solid ${borderColor}; background-color: #f9f9f9; font-style: italic`;
			const finalStyle = mergeStyles(baseStyle, block.style);

			let html = `<blockquote style="${finalStyle}">`;
			html += `<p style="margin: 0; color: ${textColor}; font-size: 16px; line-height: 1.6;">"${escapeHtml(
				block.text
			)}"</p>`;

			if (block.author || block.authorTitle) {
				html +=
					'<footer style="margin-top: 12px; font-size: 14px; color: #666; font-style: normal;">';
				if (block.author) {
					html += `<strong>${escapeHtml(block.author)}</strong>`;
				}
				if (block.author && block.authorTitle) {
					html += " — ";
				}
				if (block.authorTitle) {
					html += `<span>${escapeHtml(block.authorTitle)}</span>`;
				}
				html += "</footer>";
			}

			html += "</blockquote>";
			return html;
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
			const baseStyle = `margin: 16px 0; padding: 16px; background-color: ${styles.bg}; border-left: 4px solid ${styles.border}; border-radius: 4px`;
			const finalStyle = mergeStyles(baseStyle, block.style);

			let html = `<div style="${finalStyle}">`;
			html += '<div style="display: flex; align-items: flex-start; gap: 12px;">';
			html += `<span style="font-size: 20px;">${styles.icon}</span>`;
			html += '<div style="flex: 1;">';

			if (block.title) {
				html += `<strong style="display: block; margin-bottom: 8px; color: ${
					styles.border
				};">${escapeHtml(block.title)}</strong>`;
			}

			html += `<div>${block.children.map(renderBlock).join("")}</div>`;
			html += "</div></div></div>";

			return html;
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
			const baseStyle = `display: inline-block; padding: 4px 8px; font-size: 12px; font-weight: 500; border-radius: 4px; background-color: ${styles.bg}; color: ${styles.color}`;
			const finalStyle = mergeStyles(baseStyle, block.style);

			return `<span style="${finalStyle}">${escapeHtml(block.text)}</span>`;
		}

		default:
			return `<div style="padding: 16px; background: #f5f5f5; border-radius: 4px; margin: 16px 0;">Unknown block type</div>`;
	}
}

export function renderBlocksToHtml(
	blocks: Block[] | Record<string, unknown> | null | undefined
): string {
	let blockArray: Block[] = [];

	if (Array.isArray(blocks)) {
		blockArray = blocks;
	} else if (blocks && typeof blocks === "object") {
		const values = Object.values(blocks);
		if (
			values.length > 0 &&
			typeof values[0] === "object" &&
			values[0] !== null &&
			"type" in values[0]
		) {
			blockArray = values as Block[];
		}
	}

	const usedFonts = new Set<string>();
	const googleFonts = [
		"Open Sans",
		"Roboto",
		"Lato",
		"Montserrat",
		"Poppins",
		"Inter",
		"Playfair Display",
		"Merriweather",
	];

	function collectFonts(block: Block) {
		if ("style" in block && block.style?.fontFamily) {
			for (const gFont of googleFonts) {
				if (block.style.fontFamily.includes(gFont)) {
					usedFonts.add(gFont);
					break;
				}
			}
		}
		if ("blocks" in block && Array.isArray(block.blocks)) {
			block.blocks.forEach(collectFonts);
		}
		if ("children" in block && Array.isArray(block.children)) {
			block.children.forEach(collectFonts);
		}
		if ("showIf" in block && Array.isArray(block.showIf)) {
			block.showIf.forEach(collectFonts);
		}
		if ("showElse" in block && Array.isArray(block.showElse)) {
			block.showElse?.forEach(collectFonts);
		}
	}

	blockArray.forEach(collectFonts);

	const googleFontsLink =
		usedFonts.size > 0
			? `<link href="https://fonts.googleapis.com/css2?${Array.from(usedFonts)
					.map((font) => `family=${font.replace(/ /g, "+")}:wght@400;500;600;700`)
					.join("&")}&display=swap" rel="stylesheet">`
			: "";

	const blocksHtml = blockArray.map(renderBlock).join("");

	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${googleFontsLink}
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      background: #ffffff;
    }
    * {
      box-sizing: border-box;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: #0066cc;
    }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto;">
    ${
			blocksHtml ||
			'<p style="text-align: center; color: #999;">No blocks to display. Add blocks to build your email.</p>'
		}
  </div>
</body>
</html>`;
}
