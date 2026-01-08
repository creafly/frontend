export type BlockType =
	| "text"
	| "heading"
	| "image"
	| "button"
	| "spacer"
	| "divider"
	| "list"
	| "footer"
	| "header"
	| "section"
	| "conditional"
	| "grid_wrapper"
	| "flex_wrapper"
	| "link"
	| "icon"
	| "card_container"
	| "card_header"
	| "card_content"
	| "card_footer"
	| "quote"
	| "callout"
	| "badge";

export interface BlockStyle {
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
	fontSize?: number;
	fontWeight?: "normal" | "medium" | "semibold" | "bold";
	fontFamily?: string;
	textAlign?: "left" | "center" | "right";
	borderRadius?: number;
	borderWidth?: number;
	borderColor?: string;
	buttonColor?: string;
	buttonTextColor?: string;
	width?: number;
	height?: number;
}

export interface BlockDefinition {
	type: BlockType;
	label: string;
	description: string;
	editableFields: string[];
}

export interface Template {
	id: string;
	tenantId: string;
	name: string;
	subject: string;
	template: string;
	props: Record<string, unknown>;
	blocks?: Block[] | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTemplateInput {
	tenantId: string;
	name: string;
	subject: string;
	template: string;
	props: Record<string, unknown>;
	blocks?: Block[] | null;
}

export interface UpdateTemplateInput {
	name?: string;
	subject?: string;
	template?: string;
	props?: Record<string, unknown>;
	blocks?: Block[] | null;
	isActive?: boolean;
}

export interface TextBlock {
	type: "text";
	value: string;
	style?: BlockStyle;
}

export interface HeadingBlock {
	type: "heading";
	level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	text: string;
	style?: BlockStyle;
}

export interface ImageBlock {
	type: "image";
	url: string;
	alt: string;
	linkUrl?: string;
	style?: BlockStyle;
}

export interface ButtonBlock {
	type: "button";
	text: string;
	url: string;
	style?: BlockStyle;
}

export interface SpacerBlock {
	type: "spacer";
	height?: number;
}

export interface DividerBlock {
	type: "divider";
	style?: BlockStyle;
}

export interface ListBlock {
	type: "list";
	items: string[];
	ordered?: boolean;
	style?: BlockStyle;
}

export interface FooterLink {
	text: string;
	url: string;
}

export interface FooterBlock {
	type: "footer";
	companyName: string;
	address?: string;
	unsubscribeUrl?: string;
	unsubscribeText?: string;
	links?: FooterLink[];
	style?: BlockStyle;
}

export interface NavLink {
	text: string;
	url: string;
}

export interface HeaderBlock {
	type: "header";
	logoUrl?: string;
	logoAlt?: string;
	logoWidth?: number;
	title?: string;
	navLinks?: NavLink[];
	style?: BlockStyle;
}

export interface SectionBlock {
	type: "section";
	blocks: Block[];
	style?: BlockStyle;
}

export interface ConditionalBlock {
	type: "conditional";
	condition: string;
	showIf: Block[];
	showElse?: Block[];
}

export interface GridWrapperBlock {
	type: "grid_wrapper";
	columns: number;
	rows?: number;
	gap?: number;
	alignItems?: "start" | "center" | "end" | "stretch";
	justifyItems?: "start" | "center" | "end" | "stretch";
	blocks: Block[];
	style?: BlockStyle;
}

export interface FlexWrapperBlock {
	type: "flex_wrapper";
	direction: "row" | "column";
	gap?: number;
	alignItems?: "start" | "center" | "end" | "stretch" | "baseline";
	justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
	wrap?: "wrap" | "nowrap";
	blocks: Block[];
	style?: BlockStyle;
}

export interface LinkBlock {
	type: "link";
	url: string;
	text?: string;
	children?: Block[];
	style?: BlockStyle;
}

export interface IconBlock {
	type: "icon";
	name?: string;
	url?: string;
	size?: number;
	color?: string;
	style?: BlockStyle;
}

export interface CardContainerBlock {
	type: "card_container";
	children: Block[];
	style?: BlockStyle;
}

export interface CardHeaderBlock {
	type: "card_header";
	children: Block[];
	style?: BlockStyle;
}

export interface CardContentBlock {
	type: "card_content";
	children: Block[];
	style?: BlockStyle;
}

export interface CardFooterBlock {
	type: "card_footer";
	children: Block[];
	style?: BlockStyle;
}

export interface QuoteBlock {
	type: "quote";
	text: string;
	author?: string;
	authorTitle?: string;
	style?: BlockStyle;
}

export type CalloutVariant = "info" | "warning" | "success" | "error";

export interface CalloutBlock {
	type: "callout";
	variant: CalloutVariant;
	title?: string;
	children: Block[];
	style?: BlockStyle;
}

export type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "error";

export interface BadgeBlock {
	type: "badge";
	text: string;
	variant?: BadgeVariant;
	style?: BlockStyle;
}

export type Block =
	| TextBlock
	| HeadingBlock
	| ImageBlock
	| ButtonBlock
	| SpacerBlock
	| DividerBlock
	| ListBlock
	| FooterBlock
	| HeaderBlock
	| SectionBlock
	| ConditionalBlock
	| GridWrapperBlock
	| FlexWrapperBlock
	| LinkBlock
	| IconBlock
	| CardContainerBlock
	| CardHeaderBlock
	| CardContentBlock
	| CardFooterBlock
	| QuoteBlock
	| CalloutBlock
	| BadgeBlock;

export interface ApiResponse<T> {
	error?: string;
	data?: T;
}

export interface TemplateListResponse {
	templates: Template[];
	offset: number;
	limit: number;
	error?: string;
}

export interface TemplateSingleResponse {
	template: Template;
	error?: string;
}

export interface BlockListResponse {
	blocks: BlockDefinition[];
	error?: string;
}

export interface TemplateTypeDefinition {
	type: string;
	label: string;
	description: string;
	supportsBlocks: boolean;
}

export interface TemplateTypeListResponse {
	types: TemplateTypeDefinition[];
	error?: string;
}

export interface SampleBlocksResponse {
	blocks: Block[];
	error?: string;
}

export interface FontDefinition {
	name: string;
	value: string;
	category: string;
}

export interface FontsListResponse {
	fonts: FontDefinition[];
	error?: string;
}

export interface CurrentTemplate {
	template: string;
	subject: string;
	props?: Record<string, unknown>;
	blocks?: Block[];
}

export interface EmailGenerateRequest {
	task: string;
	tenantId: string;
	userId?: string;
	locale?: "en-US" | "ru-RU";
	branding?: {
		brandName?: string;
		primaryColor?: string;
		secondaryColor?: string;
		font?: string;
		logoUrl?: string;
	};
	useCache?: boolean;
	currentTemplate?: CurrentTemplate;
}

export interface EmailGenerateResponse {
	template?: string;
	subject?: string;
	html?: string;
	plainText?: string;
	metadata?: {
		renderedAt: string;
		size: number;
		blockCount?: number;
	};
	error?: string;
}

export interface EmailPreviewResponse {
	template?: string;
	subject?: string;
	html?: string;
	error?: string;
}

export interface TokenUsage {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
	modelName?: string;
}

export interface EmailJsonResponse {
	type?: "email" | "conversation";
	output?: {
		template: string;
		subject: string;
		summary?: string;
		props: Record<string, unknown>;
	};
	message?: string;
	html?: string;
	tokenUsage?: TokenUsage;
	error?: string;
}

export interface EmailRefineRequest {
	task: string;
	tenantId: string;
	userId?: string;
	locale?: "en-US" | "ru-RU";
	currentTemplate: CurrentTemplate;
	branding?: {
		brandName?: string;
		primaryColor?: string;
		secondaryColor?: string;
		font?: string;
		logoUrl?: string;
	};
}

export interface EmailRefineResponse {
	output?: {
		template: string;
		subject: string;
		summary?: string;
		props: Record<string, unknown>;
	};
	html?: string;
	tokenUsage?: TokenUsage;
	error?: string;
}

export interface User {
	id: string;
	email: string;
	username?: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string;
	locale: string;
	isActive: boolean;
	isBlocked: boolean;
	blockReason?: string;
	blockedAt?: string;
	totpEnabled: boolean;
	emailVerified: boolean;
	emailVerifiedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	username?: string;
	password: string;
	firstName: string;
	lastName: string;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

export interface AuthResponse {
	user?: User;
	tokens?: AuthTokens;
	totpRequired?: boolean;
	tempToken?: string;
	error?: string;
}

export interface LoginVerifyTOTPRequest {
	tempToken: string;
	code: string;
}

export interface MeResponse {
	user?: User;
	error?: string;
}

export interface Tenant {
	id: string;
	name: string;
	displayName: string;
	slug: string;
	isActive: boolean;
	isBlocked: boolean;
	blockReason?: string;
	blockedAt?: string;
	blockedBy?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTenantRequest {
	name: string;
	displayName?: string;
	slug?: string;
}

export interface UpdateTenantRequest {
	name?: string;
	displayName?: string;
	slug?: string;
	isActive?: boolean;
}

export interface TenantResponse {
	tenant?: Tenant;
	message?: string;
	error?: string;
}

export interface TenantsListResponse {
	tenants: Tenant[];
	error?: string;
}

export interface Role {
	id: string;
	name: string;
	description?: string;
	isDefault: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Claim {
	id: string;
	type: string;
	value: string;
	createdAt: string;
}

export interface CreateRoleRequest {
	name: string;
	description?: string;
}

export interface UpdateRoleRequest {
	name?: string;
	description?: string;
}

export interface CreateClaimRequest {
	type: string;
	value: string;
}

export interface RoleResponse {
	role?: Role;
	message?: string;
	error?: string;
}

export interface RolesListResponse {
	roles: Role[];
	offset: number;
	limit: number;
	error?: string;
}

export interface ClaimResponse {
	claim?: Claim;
	message?: string;
	error?: string;
}

export interface ClaimsListResponse {
	claims: Claim[];
	offset: number;
	limit: number;
	error?: string;
}

export type RoleClaimsResponse = Claim[];

export interface UserRolesResponse {
	roles: Role[];
}

export type UserClaimsResponse = Claim[];

export interface UsersListResponse {
	users: User[];
	offset: number;
	limit: number;
	error?: string;
}

export type AllTenantsListResponse = Tenant[];

export type PlanStatus = "active" | "inactive";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";
export type BillingCycle = "monthly" | "yearly";

export interface Plan {
	id: string;
	name: string;
	description: string;
	priceMonthly: number;
	priceYearly: number;
	tokenLimit: number;
	membersLimit: number;
	storageLimit: number;
	trialDays: number;
	status: PlanStatus;
	isFeatured: boolean;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
}

export interface Subscription {
	id: string;
	tenantId: string;
	planId: string;
	status: SubscriptionStatus;
	billingCycle: BillingCycle;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	trialStart?: string;
	trialEnd?: string;
	cancelAtPeriodEnd: boolean;
	canceledAt?: string;
	externalId?: string;
	createdAt: string;
	updatedAt: string;
}

export interface TokenUsageSummary {
	tenantId: string;
	year: number;
	month: number;
	totalTokens: number;
	inputTokens: number;
	outputTokens: number;
	requestCount: number;
	tokenLimit: number;
	remainingTokens: number;
}

export interface TokenUsageLog {
	id: string;
	tenantId: string;
	userId?: string;
	action: string;
	description?: string;
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	modelName?: string;
	metadata?: string;
	createdAt: string;
}

export interface TokenUsageLogList {
	items: TokenUsageLog[];
	totalCount: number;
	limit: number;
	offset: number;
}

export interface SubscribeRequest {
	planId: string;
	billingCycle: BillingCycle;
}

export interface ChangePlanRequest {
	planId: string;
}

export interface CheckCanGenerateResponse {
	canGenerate: boolean;
	remainingTokens: number;
}

export interface SubscriptionWithPlan extends Subscription {
	plan?: Plan;
}

export interface ConversationMessage {
	id: string;
	conversationId: string;
	role: "user" | "assistant";
	content: string;
	type?: "email" | "conversation" | "subscription_error" | "image" | "video";
	html?: string;
	template?: string;
	subject?: string;
	summary?: string;
	props?: Record<string, unknown>;
	blocks?: Block[];
	tokenUsage?: TokenUsage;
	imageContent?: ImageContent;
	videoContent?: VideoContent;
	attachments?: import("./jobs").Attachment[];
	createdAt: string;
}

export interface ImageContent {
	type: "image";
	prompt: string;
	negativePrompt?: string;
	aspectRatio?: string;
	style?: string;
	summary: string;
	imageUrl?: string;
	imageBase64?: string;
	revisedPrompt?: string;
}

export interface VideoContent {
	type: "video";
	prompt: string;
	style?: string;
	summary: string;
	videoUrl?: string;
	thumbnailUrl?: string;
	durationSeconds?: number;
	aspectRatio?: string;
}

export interface Conversation {
	id: string;
	tenantId: string;
	userId: string;
	title: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ConversationWithMessages extends Conversation {
	messages: ConversationMessage[];
}

export interface ConversationListItem {
	id: string;
	title: string | null;
	createdAt: string;
	updatedAt: string;
	lastMessage?: {
		content: string;
		createdAt: string;
	} | null;
}

export interface ConversationListResponse {
	conversations: ConversationListItem[];
	total: number;
	offset: number;
	limit: number;
}

export interface ConversationSingleResponse {
	conversation: ConversationWithMessages;
}

export interface CreateConversationRequest {
	tenantId: string;
	title?: string;
}

export interface AddMessageRequest {
	role: "user" | "assistant";
	content: string;
	type?: "email" | "conversation" | "subscription_error" | "image" | "video";
	html?: string;
	template?: string;
	subject?: string;
	summary?: string;
	props?: Record<string, unknown>;
	blocks?: Block[];
	tokenUsage?: TokenUsage;
	imageContent?: ImageContent;
	videoContent?: VideoContent;
	attachments?: import("./jobs").Attachment[];
}

export interface MessageSingleResponse {
	message: ConversationMessage;
}

export * from "./jobs";
export * from "./secrets";
