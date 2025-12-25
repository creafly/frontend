import type { Block } from "@/types";

export function parseBlocks(rawBlocks: unknown): Block[] {
	if (Array.isArray(rawBlocks)) {
		return rawBlocks;
	}

	if (rawBlocks && typeof rawBlocks === "object" && Object.keys(rawBlocks).length > 0) {
		const values = Object.values(rawBlocks);
		if (
			values.length > 0 &&
			typeof values[0] === "object" &&
			values[0] !== null &&
			"type" in (values[0] as object)
		) {
			return values as Block[];
		}
	}

	return [];
}

interface WelcomeProps {
	userName?: string;
	companyName?: string;
	ctaUrl?: string;
	ctaText?: string;
	unsubscribeUrl?: string;
}

interface OrderConfirmationProps {
	orderNumber?: string;
	orderDate?: string;
	items?: Array<{
		name: string;
		quantity: number;
		price: number;
	}>;
	total?: number;
	trackingUrl?: string;
	companyName?: string;
}

interface PasswordResetProps {
	userName?: string;
	resetUrl?: string;
	expiresIn?: string;
	companyName?: string;
}

export function propsToBlocks(templateType: string, props: Record<string, unknown>): Block[] {
	if ("blocks" in props && Array.isArray(props.blocks)) {
		return props.blocks as Block[];
	}

	switch (templateType) {
		case "newsletter":
		case "media_digest":
			return [];
		case "welcome":
			return welcomePropsToBlocks(props as WelcomeProps);
		case "order_confirmation":
			return orderConfirmationPropsToBlocks(props as OrderConfirmationProps);
		case "password_reset":
			return passwordResetPropsToBlocks(props as PasswordResetProps);
		default:
			return [];
	}
}

function welcomePropsToBlocks(props: WelcomeProps): Block[] {
	const blocks: Block[] = [];

	blocks.push({
		type: "header",
		title: props.companyName,
	});

	blocks.push({
		type: "heading",
		level: "h1",
		text: props.userName ? `Добро пожаловать, ${props.userName}!` : "Добро пожаловать!",
		style: { textAlign: "center" },
	});

	blocks.push({
		type: "text",
		value:
			"Мы рады приветствовать вас на нашей платформе. Здесь вы найдёте всё необходимое для продуктивной работы.",
		style: { textAlign: "center" },
	});

	blocks.push({ type: "spacer", height: 24 });

	if (props.ctaUrl) {
		blocks.push({
			type: "button",
			text: props.ctaText || "Начать",
			url: props.ctaUrl,
		});
	}

	blocks.push({
		type: "footer",
		companyName: props.companyName || "Company",
		unsubscribeUrl: props.unsubscribeUrl,
	});

	return blocks;
}

function orderConfirmationPropsToBlocks(props: OrderConfirmationProps): Block[] {
	const blocks: Block[] = [];

	blocks.push({
		type: "header",
		title: props.companyName || "Order Confirmation",
	});

	blocks.push({
		type: "heading",
		level: "h1",
		text: "Спасибо за заказ!",
		style: { textAlign: "center" },
	});

	if (props.orderNumber) {
		blocks.push({
			type: "text",
			value: `Номер заказа: ${props.orderNumber}`,
			style: { textAlign: "center", fontWeight: "bold" },
		});
	}

	if (props.orderDate) {
		blocks.push({
			type: "text",
			value: `Дата: ${props.orderDate}`,
			style: { textAlign: "center", textColor: "#666" },
		});
	}

	blocks.push({ type: "divider" });

	if (props.items && props.items.length > 0) {
		blocks.push({
			type: "heading",
			level: "h3",
			text: "Состав заказа:",
		});

		const itemsList = props.items.map((item) => `${item.name} x${item.quantity} — ${item.price} ₽`);
		blocks.push({
			type: "list",
			items: itemsList,
			ordered: false,
		});
	}

	if (props.total !== undefined) {
		blocks.push({
			type: "text",
			value: `Итого: ${props.total} ₽`,
			style: { fontWeight: "bold", fontSize: 18 },
		});
	}

	blocks.push({ type: "spacer", height: 24 });

	if (props.trackingUrl) {
		blocks.push({
			type: "button",
			text: "Отследить заказ",
			url: props.trackingUrl,
		});
	}

	blocks.push({
		type: "footer",
		companyName: props.companyName || "Company",
	});

	return blocks;
}

function passwordResetPropsToBlocks(props: PasswordResetProps): Block[] {
	const blocks: Block[] = [];

	blocks.push({
		type: "header",
		title: props.companyName || "Password Reset",
	});

	blocks.push({
		type: "heading",
		level: "h2",
		text: "Сброс пароля",
		style: { textAlign: "center" },
	});

	blocks.push({
		type: "text",
		value: props.userName ? `Здравствуйте, ${props.userName}!` : "Здравствуйте!",
	});

	blocks.push({
		type: "text",
		value:
			"Мы получили запрос на сброс пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы создать новый пароль.",
	});

	blocks.push({ type: "spacer", height: 16 });

	if (props.resetUrl) {
		blocks.push({
			type: "button",
			text: "Сбросить пароль",
			url: props.resetUrl,
		});
	}

	if (props.expiresIn) {
		blocks.push({
			type: "callout",
			variant: "warning",
			title: "Важно",
			children: [
				{
					type: "text",
					value: `Ссылка действительна ${props.expiresIn}.`,
				},
			],
		});
	}

	blocks.push({
		type: "text",
		value: "Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.",
		style: { textColor: "#666", fontSize: 14 },
	});

	blocks.push({
		type: "footer",
		companyName: props.companyName || "Company",
	});

	return blocks;
}
