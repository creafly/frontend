export interface Translations {
	common: {
		save: string;
		cancel: string;
		delete: string;
		edit: string;
		view: string;
		create: string;
		duplicate: string;
		loading: string;
		saving: string;
		deleting: string;
		creating: string;
		active: string;
		inactive: string;
		actions: string;
		status: string;
		accessDenied: string;
		noPermission: string;
		showing: string;
		of: string;
		close: string;
		previous: string;
		next: string;
		page: string;
		items: string;
		copyLink: string;
		linkCopied: string;
		sending: string;
		all: string;
		filters: string;
	};
	nav: {
		chat: string;
		templates: string;
		workspaces: string;
		settings: string;
		subscription: string;
		branding: string;
		storage: string;
		workspace: string;
		navigation: string;
		support: string;
	};
	chat: {
		title: string;
		startConversation: string;
		startDescription: string;
		tryAsking: string;
		examples: {
			welcome: string;
			passwordReset: string;
			newsletter: string;
			orderConfirmation: string;
		};
		inputPlaceholder: string;
		generating: string;
		saveAndEdit: string;
		blocksGenerated: string;
		tokensUsed: string;
		preview: string;
		emailGenerated: string;
		emailResponse: string;
		conversationResponse: string;
	};
	templates: {
		title: string;
		subtitle: string;
		createTemplate: string;
		allTemplates: string;
		noTemplates: string;
		noTemplatesDescription: string;
		deleteConfirmTitle: string;
		deleteConfirmDescription: string;
		templateSaved: string;
		templateCreated: string;
		templateDeleted: string;
		templateDuplicated: string;
		columns: {
			name: string;
			subject: string;
			type: string;
			status: string;
			created: string;
			updated: string;
		};
		types: {
			media_digest: string;
			welcome: string;
			newsletter: string;
			order_confirmation: string;
			password_reset: string;
		};
		typeDescriptions: {
			media_digest: string;
			welcome: string;
			newsletter: string;
			order_confirmation: string;
			password_reset: string;
		};
	};
	templateForm: {
		createTitle: string;
		createSubtitle: string;
		editTitle: string;
		details: string;
		name: string;
		namePlaceholder: string;
		nameHelp: string;
		subject: string;
		subjectPlaceholder: string;
		subjectHelp: string;
		type: string;
		description: string;
		descriptionPlaceholder: string;
		descriptionHelp: string;
		preview: string;
		previewHelp: string;
		blocks: string;
		templateProps: string;
		noBlockEditing: string;
		nameSubjectRequired: string;
		overviewTab: string;
		visualEditorTab: string;
	};
	errors: {
		loadingTemplates: string;
		saveFailed: string;
		createFailed: string;
		deleteFailed: string;
		duplicateFailed: string;
		refineFailed: string;
		updateFailed: string;
		noActiveSubscription: string;
		noActiveSubscriptionLink: string;
	};
	blocks: {
		addBlock: string;
		palette: string;
		dropHint: string;
		categories: {
			content: string;
			layout: string;
			structure: string;
			primitives: string;
			composable: string;
		};
		types: {
			text: string;
			heading: string;
			image: string;
			button: string;
			spacer: string;
			divider: string;
			list: string;
			social: string;
			footer: string;
			header: string;
			card: string;
			section: string;
			conditional: string;
			grid_wrapper: string;
			flex_wrapper: string;
			link: string;
			icon: string;
			card_container: string;
			card_header: string;
			card_content: string;
			card_footer: string;
			quote: string;
			callout: string;
			badge: string;
		};
	};
	styles: {
		title: string;
		reset: string;
		spacing: string;
		colors: string;
		typography: string;
		border: string;
		padding: string;
		margin: string;
		top: string;
		bottom: string;
		left: string;
		right: string;
		backgroundColor: string;
		textColor: string;
		buttonColor: string;
		buttonTextColor: string;
		fontSize: string;
		fontWeight: string;
		fontFamily: string;
		textAlign: string;
		borderRadius: string;
		borderWidth: string;
		borderColor: string;
	};
	refinement: {
		title: string;
		startDescription: string;
		placeholder: string;
		refining: string;
		changesApplied: string;
		applyChanges: string;
		examples: {
			title: string;
			formal: string;
			cta: string;
			colors: string;
		};
	};
	auth: {
		login: string;
		register: string;
		logout: string;
		email: string;
		username: string;
		password: string;
		confirmPassword: string;
		firstName: string;
		lastName: string;
		loginTitle: string;
		loginSubtitle: string;
		registerTitle: string;
		registerSubtitle: string;
		noAccount: string;
		haveAccount: string;
		loginButton: string;
		registerButton: string;
		loggingIn: string;
		registering: string;
		loginSuccess: string;
		registerSuccess: string;
		loginError: string;
		registerError: string;
		emailPlaceholder: string;
		usernamePlaceholder: string;
		passwordPlaceholder: string;
		firstNamePlaceholder: string;
		lastNamePlaceholder: string;
		passwordMismatch: string;
		welcomeTo: string;
		orContinueWith: string;
		termsText: string;
		termsLink: string;
		privacyLink: string;
		continueWithGoogle: string;
		continueWithApple: string;
		cookieConsentRequired: string;
		totpCodeRequired: string;
		totpVerificationError: string;
		twoFactorAuth: string;
		enterTotpCode: string;
		verifying: string;
		verify: string;
		backToLogin: string;
		forgotPassword: string;
		forgotPasswordTitle: string;
		forgotPasswordSubtitle: string;
		sendResetLink: string;
		sendingResetLink: string;
		resetLinkSent: string;
		resetPasswordTitle: string;
		resetPasswordSubtitle: string;
		newPassword: string;
		newPasswordPlaceholder: string;
		confirmNewPassword: string;
		confirmNewPasswordPlaceholder: string;
		resetPassword: string;
		resettingPassword: string;
		passwordResetSuccess: string;
		invalidResetToken: string;
		returnToLogin: string;
		tooltips: {
			email: string;
			username: string;
			password: string;
			confirmPassword: string;
			firstName: string;
			lastName: string;
		};
	};
	landing: {
		badge: string;
		heroTitle: string;
		heroTitleHighlight: string;
		heroSubtitle: string;
		getStarted: string;
		signIn: string;
		features: string;
		featuresSubtitle: string;
		feature1Title: string;
		feature1Description: string;
		feature2Title: string;
		feature2Description: string;
		feature3Title: string;
		feature3Description: string;
		feature4Title: string;
		feature4Description: string;
		feature5Title: string;
		feature5Description: string;
		feature6Title: string;
		feature6Description: string;
		ctaTitle: string;
		ctaSubtitle: string;
		ctaButton: string;
		footer: string;
		footerTagline: string;
	};
	legal: {
		termsTitle: string;
		termsLastUpdated: string;
		privacyTitle: string;
		privacyLastUpdated: string;
		backToHome: string;
		termsAcceptanceTitle: string;
		termsAcceptanceText: string;
		termsDescriptionTitle: string;
		termsDescriptionText: string;
		termsAccountsTitle: string;
		termsAccountsText: string;
		termsAcceptableUseTitle: string;
		termsAcceptableUseIntro: string;
		termsAcceptableUse1: string;
		termsAcceptableUse2: string;
		termsAcceptableUse3: string;
		termsAcceptableUse4: string;
		termsAcceptableUse5: string;
		termsIPTitle: string;
		termsIPText: string;
		termsAIContentTitle: string;
		termsAIContentText: string;
		termsPrivacyTitle: string;
		termsPrivacyText: string;
		termsLiabilityTitle: string;
		termsLiabilityText: string;
		termsChangesTitle: string;
		termsChangesText: string;
		termsContactTitle: string;
		termsContactText: string;
		privacyCollectTitle: string;
		privacyCollectIntro: string;
		privacyCollect1: string;
		privacyCollect2: string;
		privacyCollect3: string;
		privacyCollect4: string;
		privacyAutoCollectTitle: string;
		privacyAutoCollectIntro: string;
		privacyAutoCollect1: string;
		privacyAutoCollect2: string;
		privacyAutoCollect3: string;
		privacyAutoCollect4: string;
		privacyUseTitle: string;
		privacyUseIntro: string;
		privacyUse1: string;
		privacyUse2: string;
		privacyUse3: string;
		privacyUse4: string;
		privacyUse5: string;
		privacyUse6: string;
		privacySharingTitle: string;
		privacySharingIntro: string;
		privacySharing1: string;
		privacySharing2: string;
		privacySharing3: string;
		privacySharing4: string;
		privacySecurityTitle: string;
		privacySecurityText: string;
		privacyRetentionTitle: string;
		privacyRetentionText: string;
		privacyRightsTitle: string;
		privacyRightsIntro: string;
		privacyRights1: string;
		privacyRights2: string;
		privacyRights3: string;
		privacyRights4: string;
		privacyRights5: string;
		privacyRights6: string;
		privacyCookiesTitle: string;
		privacyCookiesText: string;
		privacyTransfersTitle: string;
		privacyTransfersText: string;
		privacyChildrenTitle: string;
		privacyChildrenText: string;
		privacyChangesTitle: string;
		privacyChangesText: string;
		privacyContactTitle: string;
		privacyContactText: string;
		privacyRelatedTitle: string;
		privacyRelatedText: string;
	};
	cookies: {
		title: string;
		description: string;
		acceptAll: string;
		acceptNecessary: string;
		customize: string;
		necessary: string;
		necessaryDescription: string;
		analytics: string;
		analyticsDescription: string;
		marketing: string;
		marketingDescription: string;
		savePreferences: string;
	};
	workspaces: {
		title: string;
		subtitle: string;
		createWorkspace: string;
		noWorkspaces: string;
		noWorkspacesDescription: string;
		selectWorkspace: string;
		workspaceName: string;
		workspaceNamePlaceholder: string;
		displayName: string;
		displayNamePlaceholder: string;
		displayNameHelpText: string;
		workspaceSlug: string;
		workspaceSlugPlaceholder: string;
		createButton: string;
		creating: string;
		created: string;
		updated: string;
		deleted: string;
		members: string;
		settings: string;
		enter: string;
		addMember: string;
		removeMember: string;
		memberEmail: string;
		memberEmailPlaceholder: string;
		memberIdentifier: string;
		memberIdentifierPlaceholder: string;
		memberAdded: string;
		memberRemoved: string;
		noMembers: string;
		owner: string;
		member: string;
		dangerZone: string;
		deleteWorkspace: string;
		deleteWorkspaceDescription: string;
		deleteConfirm: string;
		removeMemberConfirm: string;
		generalSettings: string;
		membersSettings: string;
		switchWorkspace: string;
		currentWorkspace: string;
		generalSettingsDescription: string;
		membersSettingsDescription: string;
		slugHelpText: string;
		slugAutoGenerateHelpText: string;
		addMemberDescription: string;
		globalRolesDescription: string;
		globalClaimsDescription: string;
		globalUsersDescription: string;
		workspaceNotFound: string;
		backToWorkspaces: string;
		updateWorkspaceFailed: string;
		deleteWorkspaceFailed: string;
		addMemberFailed: string;
		removeMemberFailed: string;
		tooltips: {
			workspaceName: string;
			workspaceSlug: string;
			displayName: string;
			memberIdentifier: string;
			roleName: string;
			roleDescription: string;
		};
	};
	twoFactor: {
		title: string;
		description: string;
		enabled: string;
		disabled: string;
		setup: string;
		enable: string;
		disable: string;
		scanQrCode: string;
		scanQrCodeDescription: string;
		manualEntry: string;
		manualEntryDescription: string;
		secretKey: string;
		verificationCode: string;
		verificationCodePlaceholder: string;
		verify: string;
		verifying: string;
		disableConfirm: string;
		disableDescription: string;
		enterPassword: string;
		passwordPlaceholder: string;
		setupSuccess: string;
		enabledSuccess: string;
		disabledSuccess: string;
		invalidCode: string;
		status: string;
	};
	profile: {
		title: string;
		subtitle: string;
		personalInfo: string;
		personalInfoDescription: string;
		firstName: string;
		lastName: string;
		username: string;
		email: string;
		avatarUrl: string;
		save: string;
		saving: string;
		saved: string;
		security: string;
		securityDescription: string;
		changePassword: string;
		currentPassword: string;
		newPassword: string;
		confirmNewPassword: string;
		passwordChanged: string;
		passwordMismatch: string;
		twoFactorAuth: string;
	};
	notifications: {
		title: string;
		empty: string;
		markAllRead: string;
		clearAll: string;
		viewAll: string;
		accept: string;
		reject: string;
		types: {
			invitation: {
				title: string;
				message: string;
			};
			invitation_accepted: {
				title: string;
				message: string;
			};
			invitation_rejected: {
				title: string;
				message: string;
			};
			member_added: {
				title: string;
				message: string;
			};
			member_removed: {
				title: string;
				message: string;
			};
			subscription_created: {
				title: string;
				message: string;
			};
			subscription_canceled: {
				title: string;
				message: string;
			};
			trial_ending: {
				title: string;
				message: string;
			};
			payment_failed: {
				title: string;
				message: string;
			};
		};
	};
	admin: {
		title: string;
		roles: string;
		claims: string;
		users: string;
		rolesDescription: string;
		claimsDescription: string;
		usersDescription: string;
		createRole: string;
		createClaim: string;
		roleName: string;
		roleDescription: string;
		claimType: string;
		claimValue: string;
		name: string;
		email: string;
		assignedUsers: string;
		assignedRoles: string;
		assignRole: string;
		assignClaim: string;
		removeRole: string;
		removeClaim: string;
		noRoles: string;
		noClaims: string;
		noUsers: string;
		roleCreated: string;
		roleUpdated: string;
		roleDeleted: string;
		claimCreated: string;
		claimDeleted: string;
		search: string;
		searchPlaceholder: string;
		roleClaims: string;
		roleClaimsDescription: string;
		claimAssigned: string;
		claimRemoved: string;
		noClaimsAvailable: string;
		loadingClaims: string;
		blockUser: string;
		unblockUser: string;
		blockReason: string;
		blockReasonPlaceholder: string;
		userBlocked: string;
		userUnblocked: string;
		blocked: string;
		blockedAt: string;
		confirmBlock: string;
		confirmUnblock: string;
		systemRole: string;
		noClaimsAssigned: string;
		manageClaimsFor: string;
		supportTickets: string;
		supportTicketsDescription: string;
		allTickets: string;
		openTickets: string;
		inProgressTickets: string;
		resolvedTickets: string;
		closedTickets: string;
		noTickets: string;
		ticketDetails: string;
		assignee: string;
		assignTo: string;
		unassigned: string;
		changeStatus: string;
		changePriority: string;
		addReply: string;
		replyPlaceholder: string;
		sendReply: string;
		staffReply: string;
		userReply: string;
		ticketCreated: string;
		ticketUpdated: string;
		ticketDeleted: string;
		replyAdded: string;
		filterByStatus: string;
		filterByPriority: string;
		filterByCategory: string;
		avgResolutionTime: string;
		ticketStats: string;
		errorReports: string;
		errorReportsDescription: string;
		noErrorReports: string;
		noErrorReportsDescription: string;
		errorCode: string;
		errorMessage: string;
		url: string;
		linkedTicket: string;
		deleteSelected: string;
		selectedCount: string;
		errorReportsDeleted: string;
	};
	tenantAdmin: {
		roles: string;
		claims: string;
		rolesDescription: string;
		claimsDescription: string;
		membersDescription: string;
		assignRoleToMember: string;
		assignClaimToMember: string;
		memberRoles: string;
		memberClaims: string;
		createRole: string;
		createRoleDescription: string;
		editRole: string;
		editRoleDescription: string;
		deleteRole: string;
		deleteRoleConfirm: string;
		roleName: string;
		roleNamePlaceholder: string;
		roleDescription: string;
		roleDescriptionPlaceholder: string;
		roleCreated: string;
		roleUpdated: string;
		roleDeleted: string;
		manageClaimsFor: string;
		rolesOverview: string;
		manageClaims: string;
		availableRoles: string;
		manageClaimsDescription: string;
		editClaims: string;
		noClaimsAssigned: string;
	};
	subscription: {
		title: string;
		subtitle: string;
		choosePlan: string;
		currentSubscription: string;
		status: string;
		cancelsAtPeriodEnd: string;
		monthly: string;
		yearly: string;
		savePercent: string;
		tokensPerMonth: string;
		teamMembers: string;
		storageSpace: string;
		dayFreeTrial: string;
		currentPlan: string;
		startFreeTrial: string;
		subscribe: string;
		mostPopular: string;
		completePayment: string;
		subscribeTo: string;
		nameOnCard: string;
		cardNumber: string;
		expiryDate: string;
		cvc: string;
		paymentSecure: string;
		cancel: string;
		processing: string;
		pay: string;
		trialStarted: string;
		paymentSuccess: string;
		fillCardDetails: string;
		failedStartTrial: string;
		failedCreateSubscription: string;
		noActiveSubscription: string;
		changePlan: string;
		billing: string;
		currentPeriod: string;
		trialEnds: string;
		statuses: {
			active: string;
			trialing: string;
			canceled: string;
			past_due: string;
			incomplete: string;
			incomplete_expired: string;
			unpaid: string;
		};
		billingCycles: {
			monthly: string;
			yearly: string;
		};
	};
	branding: {
		title: string;
		subtitle: string;
		noBrand: string;
		noBrandDescription: string;
		createBrand: string;
		brandCreated: string;
		brandCreateFailed: string;
		colors: string;
		colorsDescription: string;
		addColor: string;
		addColorDescription: string;
		editColor: string;
		deleteColor: string;
		deleteColorConfirm: string;
		colorName: string;
		colorValue: string;
		colorCreated: string;
		colorUpdated: string;
		colorDeleted: string;
		colorCreateFailed: string;
		colorUpdateFailed: string;
		colorDeleteFailed: string;
		noColors: string;
		fonts: string;
		fontsDescription: string;
		addFont: string;
		addFontDescription: string;
		editFont: string;
		deleteFont: string;
		deleteFontConfirm: string;
		fontName: string;
		fontFamily: string;
		fontWeight: string;
		fontCreated: string;
		fontUpdated: string;
		fontDeleted: string;
		fontCreateFailed: string;
		fontUpdateFailed: string;
		fontDeleteFailed: string;
		noFonts: string;
		spacings: string;
		spacingsDescription: string;
		addSpacing: string;
		addSpacingDescription: string;
		editSpacing: string;
		deleteSpacing: string;
		deleteSpacingConfirm: string;
		spacingName: string;
		spacingValue: string;
		spacingCreated: string;
		spacingUpdated: string;
		spacingDeleted: string;
		spacingCreateFailed: string;
		spacingUpdateFailed: string;
		spacingDeleteFailed: string;
		noSpacings: string;
		radii: string;
		radiiDescription: string;
		addRadius: string;
		addRadiusDescription: string;
		editRadius: string;
		deleteRadius: string;
		deleteRadiusConfirm: string;
		radiusName: string;
		radiusValue: string;
		radiusCreated: string;
		radiusUpdated: string;
		radiusDeleted: string;
		radiusCreateFailed: string;
		radiusUpdateFailed: string;
		radiusDeleteFailed: string;
		noRadii: string;
		logos: string;
		logosDescription: string;
		addLogo: string;
		addLogoDescription: string;
		editLogo: string;
		deleteLogo: string;
		deleteLogoConfirm: string;
		logoName: string;
		logoType: string;
		logoFile: string;
		logoTypes: {
			primary: string;
			secondary: string;
			favicon: string;
			icon: string;
		};
		logoCreated: string;
		logoUpdated: string;
		logoDeleted: string;
		logoCreateFailed: string;
		logoUpdateFailed: string;
		logoDeleteFailed: string;
		noLogos: string;
		uploadLogo: string;
		dropLogoHere: string;
		selectLogoType: string;
		tooltips: {
			colorName: string;
			colorValue: string;
			fontName: string;
			fontFamily: string;
			fontWeight: string;
			spacingName: string;
			spacingValue: string;
			radiusName: string;
			radiusValue: string;
			logoName: string;
			logoType: string;
			logoFile: string;
		};
		addMultiple: string;
		addRow: string;
		removeRow: string;
		batchCreateColors: string;
		batchCreateColorsDescription: string;
		batchCreateFonts: string;
		batchCreateFontsDescription: string;
		batchCreateSpacings: string;
		batchCreateSpacingsDescription: string;
		batchCreateRadii: string;
		batchCreateRadiiDescription: string;
		creatingItems: string;
		batchCreateSuccess: string;
		batchCreatePartial: string;
		selectOrTypeFont: string;
		selectFont: string;
		typeCustomFont: string;
		sansSerif: string;
		serif: string;
		monospace: string;
		display: string;
	};
	support: {
		reportIssue: string;
		reportIssueDescription: string;
		errorOccurred: string;
		errorDescription: string;
		additionalDetails: string;
		additionalDetailsPlaceholder: string;
		submitReport: string;
		reportSubmitted: string;
		reportFailed: string;
		tryAgain: string;
		goBack: string;
		goHome: string;
		somethingWentWrong: string;
		errorCode: string;
		title: string;
		subtitle: string;
		createTicket: string;
		myTickets: string;
		noTickets: string;
		noTicketsDescription: string;
		ticketSubject: string;
		ticketSubjectPlaceholder: string;
		ticketDescription: string;
		ticketDescriptionPlaceholder: string;
		ticketCategory: string;
		ticketPriority: string;
		ticketCreated: string;
		ticketUpdated: string;
		viewTicket: string;
		backToTickets: string;
		sendMessage: string;
		messagePlaceholder: string;
		messageSent: string;
		categories: {
			general: string;
			bug: string;
			feature: string;
			billing: string;
			account: string;
			technical: string;
		};
		priorities: {
			low: string;
			medium: string;
			high: string;
			urgent: string;
		};
		statuses: {
			open: string;
			in_progress: string;
			resolved: string;
			closed: string;
		};
		serverError: string;
		serverErrorDescription: string;
		createTicketFromError: string;
	};
	storage: {
		title: string;
		subtitle: string;
		uploadFile: string;
		uploadSuccess: string;
		uploadFailed: string;
		deleteFile: string;
		deleteConfirm: string;
		deleteSuccess: string;
		deleteFailed: string;
		noFiles: string;
		usage: string;
		files: string;
		usedOf: string;
		copyLinkFailed: string;
	};
}

export const en: Translations = {
	common: {
		save: "Save",
		cancel: "Cancel",
		delete: "Delete",
		edit: "Edit",
		view: "View",
		create: "Create",
		duplicate: "Duplicate",
		loading: "Loading...",
		saving: "Saving...",
		deleting: "Deleting...",
		creating: "Creating...",
		active: "Active",
		inactive: "Inactive",
		actions: "Actions",
		status: "Status",
		accessDenied: "Access Denied",
		noPermission: "You don't have permission to access this page",
		showing: "Showing",
		of: "of",
		close: "Close",
		previous: "Previous",
		next: "Next",
		page: "Page",
		items: "items",
		copyLink: "Copy link",
		linkCopied: "Link copied to clipboard",
		sending: "Sending...",
		all: "All",
		filters: "Filters",
	},
	nav: {
		chat: "Chat",
		templates: "Templates",
		workspaces: "Workspaces",
		settings: "Settings",
		subscription: "Subscription",
		branding: "Branding",
		storage: "Storage",
		workspace: "Workspace",
		navigation: "Navigation",
		support: "Support",
	},
	chat: {
		title: "Chat",
		startConversation: "Start a conversation",
		startDescription: "Describe the email you want to create, and the AI will generate it for you.",
		tryAsking: "Try asking:",
		examples: {
			welcome: "Create a welcome email for new users",
			passwordReset: "Generate a password reset email",
			newsletter: "Make a newsletter about our latest features",
			orderConfirmation: "Design an order confirmation email",
		},
		inputPlaceholder: "Describe the email you want to create...",
		generating: "Generating response...",
		saveAndEdit: "Save & Edit",
		blocksGenerated: "{count} block(s) generated",
		tokensUsed: "{total} tokens ({prompt} prompt, {completion} completion)",
		preview: "Preview",
		emailGenerated: 'Email "{subject}" generated successfully!',
		emailResponse: "Email",
		conversationResponse: "Message",
	},
	templates: {
		title: "Templates",
		subtitle: "Manage your email templates",
		createTemplate: "Create Template",
		allTemplates: "All Templates",
		noTemplates: "No templates yet",
		noTemplatesDescription: "Create your first template by chatting with the AI agent.",
		deleteConfirmTitle: "Delete Template",
		deleteConfirmDescription:
			'Are you sure you want to delete "{name}"? This action cannot be undone.',
		templateSaved: "Template saved successfully",
		templateCreated: "Template created successfully",
		templateDeleted: "Template deleted successfully",
		templateDuplicated: "Template duplicated successfully",
		columns: {
			name: "Name",
			subject: "Subject",
			type: "Type",
			status: "Status",
			created: "Created",
			updated: "Last Updated",
		},
		types: {
			media_digest: "Media Digest",
			welcome: "Welcome",
			newsletter: "Newsletter",
			order_confirmation: "Order Confirmation",
			password_reset: "Password Reset",
		},
		typeDescriptions: {
			media_digest: "Block-based email template",
			welcome: "Welcome email for new users",
			newsletter: "Newsletter email template",
			order_confirmation: "Order confirmation email",
			password_reset: "Password reset email",
		},
	},
	templateForm: {
		createTitle: "Create Template",
		createSubtitle: "Create a new email template",
		editTitle: "Edit Template",
		details: "Template Details",
		name: "Name",
		namePlaceholder: "My Email Template",
		nameHelp: "A unique name to identify this template",
		subject: "Subject Line",
		subjectPlaceholder: "Welcome to our platform!",
		subjectHelp: "The email subject that recipients will see",
		type: "Template Type",
		description: "Description (Optional)",
		descriptionPlaceholder: "Describe what this template is for...",
		descriptionHelp: "Internal notes about this template",
		preview: "Preview",
		previewHelp: "Sample layout for the selected template type",
		blocks: "Blocks",
		templateProps: "Template Props",
		noBlockEditing: "This template type does not support block editing.",
		nameSubjectRequired: "Name and subject are required",
		overviewTab: "Overview",
		visualEditorTab: "Visual Editor",
	},
	errors: {
		loadingTemplates: "Error loading templates",
		saveFailed: "Failed to save",
		createFailed: "Failed to create template",
		deleteFailed: "Failed to delete template",
		duplicateFailed: "Failed to duplicate template",
		refineFailed: "Failed to refine template",
		updateFailed: "Failed to update",
		noActiveSubscription: "You need an active subscription to generate content.",
		noActiveSubscriptionLink: "Go to Subscription",
	},
	blocks: {
		addBlock: "Add Block",
		palette: "Blocks",
		dropHint: "Drag blocks here",
		categories: {
			content: "Content",
			layout: "Layout",
			structure: "Structure",
			primitives: "Primitives",
			composable: "Composable",
		},
		types: {
			text: "Text",
			heading: "Heading",
			image: "Image",
			button: "Button",
			spacer: "Spacer",
			divider: "Divider",
			list: "List",
			social: "Social Links",
			footer: "Footer",
			header: "Header",
			card: "Card",
			section: "Section",
			conditional: "Conditional",
			grid_wrapper: "Grid",
			flex_wrapper: "Flex",
			link: "Link",
			icon: "Icon",
			card_container: "Card Container",
			card_header: "Card Header",
			card_content: "Card Content",
			card_footer: "Card Footer",
			quote: "Quote",
			callout: "Callout",
			badge: "Badge",
		},
	},
	styles: {
		title: "Block Style",
		reset: "Reset",
		spacing: "Spacing",
		colors: "Colors",
		typography: "Text",
		border: "Border",
		padding: "Padding",
		margin: "Margin",
		top: "Top",
		bottom: "Bottom",
		left: "Left",
		right: "Right",
		backgroundColor: "Background",
		textColor: "Text Color",
		buttonColor: "Button Color",
		buttonTextColor: "Button Text",
		fontSize: "Font Size",
		fontWeight: "Font Weight",
		fontFamily: "Font Family",
		textAlign: "Alignment",
		borderRadius: "Border Radius",
		borderWidth: "Border Width",
		borderColor: "Border Color",
	},
	refinement: {
		title: "AI Refinement",
		startDescription:
			"Describe how you want to modify the template, and AI will update it for you.",
		placeholder: "e.g., Make the header more prominent...",
		refining: "Refining template...",
		changesApplied: "Changes have been generated. Click 'Apply' to update your template.",
		applyChanges: "Apply Changes",
		examples: {
			title: "Try saying",
			formal: "Make the tone more formal",
			cta: "Add a call-to-action button",
			colors: "Change the color scheme to blue",
		},
	},
	auth: {
		login: "Login",
		register: "Register",
		logout: "Logout",
		email: "Email",
		username: "Username",
		password: "Password",
		confirmPassword: "Confirm Password",
		firstName: "First Name",
		lastName: "Last Name",
		loginTitle: "Welcome back",
		loginSubtitle: "Sign in to your account to continue",
		registerTitle: "Create an account",
		registerSubtitle: "Get started with your free account",
		noAccount: "Don't have an account?",
		haveAccount: "Already have an account?",
		loginButton: "Sign in",
		registerButton: "Create account",
		loggingIn: "Signing in...",
		registering: "Creating account...",
		loginSuccess: "Welcome back!",
		registerSuccess: "Account created successfully!",
		loginError: "Invalid email or password",
		registerError: "Registration failed",
		emailPlaceholder: "you@example.com",
		usernamePlaceholder: "@username",
		passwordPlaceholder: "Enter your password",
		firstNamePlaceholder: "John",
		lastNamePlaceholder: "Doe",
		passwordMismatch: "Passwords do not match",
		welcomeTo: "Welcome to Hexaend",
		orContinueWith: "Or",
		termsText: "By clicking continue, you agree to our",
		termsLink: "Terms of Service",
		privacyLink: "Privacy Policy",
		continueWithGoogle: "Continue with Google",
		continueWithApple: "Continue with Apple",
		cookieConsentRequired: "Please accept cookie preferences to continue",
		totpCodeRequired: "Please enter the 6-digit code",
		totpVerificationError: "Invalid verification code",
		twoFactorAuth: "Two-Factor Authentication",
		enterTotpCode: "Enter the 6-digit code from your authenticator app",
		verifying: "Verifying...",
		verify: "Verify",
		backToLogin: "Back to login",
		forgotPassword: "Forgot password?",
		forgotPasswordTitle: "Reset your password",
		forgotPasswordSubtitle:
			"Enter your email address and we'll send you a link to reset your password",
		sendResetLink: "Send reset link",
		sendingResetLink: "Sending...",
		resetLinkSent: "If an account with this email exists, a password reset link has been sent",
		resetPasswordTitle: "Create new password",
		resetPasswordSubtitle: "Enter your new password below",
		newPassword: "New Password",
		newPasswordPlaceholder: "Enter new password",
		confirmNewPassword: "Confirm New Password",
		confirmNewPasswordPlaceholder: "Confirm new password",
		resetPassword: "Reset password",
		resettingPassword: "Resetting...",
		passwordResetSuccess: "Password has been reset successfully",
		invalidResetToken: "Invalid or expired reset link",
		returnToLogin: "Return to login",
		tooltips: {
			email: "Your email address will be used for login and notifications",
			username: "Optional. A unique username for your profile",
			password: "Minimum 8 characters. Use a mix of letters, numbers, and symbols",
			confirmPassword: "Re-enter your password to confirm",
			firstName: "Your first name as it will appear in your profile",
			lastName: "Your last name as it will appear in your profile",
		},
	},
	landing: {
		badge: "AI-Powered Email Templates",
		heroTitle: "Create Beautiful Emails",
		heroTitleHighlight: "in Seconds",
		heroSubtitle:
			"Describe your email in plain language and let AI generate professional, responsive templates instantly. No coding required.",
		getStarted: "Get Started Free",
		signIn: "Sign In",
		features: "Features",
		featuresSubtitle: "Everything you need to create stunning email templates",
		feature1Title: "AI Generation",
		feature1Description:
			"Describe your email and watch AI create a complete template with proper structure and styling.",
		feature2Title: "Visual Editor",
		feature2Description: "Fine-tune your templates with our intuitive drag-and-drop block editor.",
		feature3Title: "AI Refinement",
		feature3Description:
			"Use natural language to modify and improve your templates after generation.",
		feature4Title: "Multi-language",
		feature4Description:
			"Generate emails in multiple languages with automatic localization support.",
		feature5Title: "Responsive Design",
		feature5Description: "All templates are mobile-friendly and look great on any device.",
		feature6Title: "Export Ready",
		feature6Description: "Export your templates as HTML ready for any email service provider.",
		ctaTitle: "Ready to Transform Your Email Workflow?",
		ctaSubtitle: "Join thousands of marketers and developers creating beautiful emails with AI.",
		ctaButton: "Start Creating for Free",
		footer: "Hexaend AI",
		footerTagline: "AI-powered email template generation",
	},
	legal: {
		termsTitle: "Terms of Service",
		termsLastUpdated: "Last updated: December 27, 2025",
		privacyTitle: "Privacy Policy",
		privacyLastUpdated: "Last updated: December 27, 2025",
		backToHome: "Back to Home",
		termsAcceptanceTitle: "1. Acceptance of Terms",
		termsAcceptanceText:
			'By accessing or using Hexaend AI ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.',
		termsDescriptionTitle: "2. Description of Service",
		termsDescriptionText:
			"Hexaend AI provides an AI-powered email template generation platform that allows users to create, edit, and export professional email templates using natural language descriptions.",
		termsAccountsTitle: "3. User Accounts",
		termsAccountsText:
			"To access certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
		termsAcceptableUseTitle: "4. Acceptable Use",
		termsAcceptableUseIntro: "You agree not to:",
		termsAcceptableUse1: "Use the Service for any unlawful purpose",
		termsAcceptableUse2:
			"Generate content that is harmful, offensive, or violates third-party rights",
		termsAcceptableUse3: "Attempt to gain unauthorized access to the Service",
		termsAcceptableUse4: "Interfere with the proper functioning of the Service",
		termsAcceptableUse5: "Use the Service to send spam or unsolicited communications",
		termsIPTitle: "5. Intellectual Property",
		termsIPText:
			"Templates you create using our Service belong to you. However, the Service itself, including its design, features, and underlying technology, remains the property of Hexaend AI.",
		termsAIContentTitle: "6. AI-Generated Content",
		termsAIContentText:
			'Content generated by our AI is provided "as is". While we strive for accuracy and quality, you are responsible for reviewing and approving all generated content before use.',
		termsPrivacyTitle: "7. Privacy",
		termsPrivacyText:
			"Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.",
		termsLiabilityTitle: "8. Limitation of Liability",
		termsLiabilityText:
			"To the maximum extent permitted by law, Hexaend AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.",
		termsChangesTitle: "9. Changes to Terms",
		termsChangesText:
			"We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service.",
		termsContactTitle: "10. Contact",
		termsContactText: "If you have any questions about these Terms, please contact us at",
		privacyCollectTitle: "1. Information We Collect",
		privacyCollectIntro: "We collect information you provide directly to us, including:",
		privacyCollect1: "Account information (name, email address, password)",
		privacyCollect2: "Profile information",
		privacyCollect3: "Content you create using our Service",
		privacyCollect4: "Communications with us",
		privacyAutoCollectTitle: "2. Information Collected Automatically",
		privacyAutoCollectIntro: "When you use our Service, we automatically collect:",
		privacyAutoCollect1: "Log data (IP address, browser type, pages visited)",
		privacyAutoCollect2: "Device information",
		privacyAutoCollect3: "Usage data and analytics",
		privacyAutoCollect4: "Cookies and similar technologies",
		privacyUseTitle: "3. How We Use Your Information",
		privacyUseIntro: "We use the information we collect to:",
		privacyUse1: "Provide, maintain, and improve our Service",
		privacyUse2: "Process your requests and transactions",
		privacyUse3: "Send you technical notices and support messages",
		privacyUse4: "Respond to your comments and questions",
		privacyUse5: "Analyze usage patterns to improve user experience",
		privacyUse6: "Detect and prevent fraud and abuse",
		privacySharingTitle: "4. Sharing of Information",
		privacySharingIntro: "We do not sell your personal information. We may share your information:",
		privacySharing1: "With service providers who assist in our operations",
		privacySharing2: "To comply with legal obligations",
		privacySharing3: "To protect our rights and safety",
		privacySharing4: "With your consent",
		privacySecurityTitle: "5. Data Security",
		privacySecurityText:
			"We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
		privacyRetentionTitle: "6. Data Retention",
		privacyRetentionText:
			"We retain your personal information for as long as necessary to provide our Service and fulfill the purposes described in this Privacy Policy, unless a longer retention period is required by law.",
		privacyRightsTitle: "7. Your Rights",
		privacyRightsIntro: "You have the right to:",
		privacyRights1: "Access your personal information",
		privacyRights2: "Correct inaccurate data",
		privacyRights3: "Request deletion of your data",
		privacyRights4: "Object to processing of your data",
		privacyRights5: "Data portability",
		privacyRights6: "Withdraw consent",
		privacyCookiesTitle: "8. Cookies",
		privacyCookiesText:
			"We use cookies and similar tracking technologies to collect and track information about your use of our Service. You can control cookies through your browser settings. For more information, see our cookie preferences in the footer.",
		privacyTransfersTitle: "9. International Transfers",
		privacyTransfersText:
			"Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.",
		privacyChildrenTitle: "10. Children's Privacy",
		privacyChildrenText:
			"Our Service is not intended for children under 16. We do not knowingly collect personal information from children under 16.",
		privacyChangesTitle: "11. Changes to This Policy",
		privacyChangesText:
			'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
		privacyContactTitle: "12. Contact Us",
		privacyContactText: "If you have any questions about this Privacy Policy, please contact us at",
		privacyRelatedTitle: "Related Documents",
		privacyRelatedText: "Please also review our",
	},
	cookies: {
		title: "Cookie Preferences",
		description:
			"We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. Please select your cookie preferences.",
		acceptAll: "Accept All",
		acceptNecessary: "Accept Necessary Only",
		customize: "Customize",
		necessary: "Necessary Cookies",
		necessaryDescription: "These cookies are essential for the website to function properly.",
		analytics: "Analytics Cookies",
		analyticsDescription: "Help us understand how visitors interact with our website.",
		marketing: "Marketing Cookies",
		marketingDescription: "Used to track visitors across websites for advertising purposes.",
		savePreferences: "Save Preferences",
	},
	workspaces: {
		title: "Workspaces",
		subtitle: "Select a workspace to continue or create a new one",
		createWorkspace: "Create Workspace",
		noWorkspaces: "No workspaces yet",
		noWorkspacesDescription: "Create your first workspace to get started with email templates.",
		selectWorkspace: "Select Workspace",
		workspaceName: "Workspace Name",
		workspaceNamePlaceholder: "My Workspace",
		displayName: "Display Name",
		displayNamePlaceholder: "My Brand Name",
		displayNameHelpText: "Human-readable brand name used by AI agent for email generation",
		workspaceSlug: "Workspace URL",
		workspaceSlugPlaceholder: "my-workspace",
		createButton: "Create Workspace",
		creating: "Creating...",
		created: "Workspace created successfully",
		updated: "Workspace updated successfully",
		deleted: "Workspace deleted successfully",
		members: "Members",
		settings: "Settings",
		enter: "Enter",
		addMember: "Add Member",
		removeMember: "Remove",
		memberEmail: "User ID",
		memberEmailPlaceholder: "Enter user ID",
		memberIdentifier: "Email or Username",
		memberIdentifierPlaceholder: "Enter email or @username",
		memberAdded: "Member added successfully",
		memberRemoved: "Member removed successfully",
		noMembers: "No members yet",
		owner: "Owner",
		member: "Member",
		dangerZone: "Danger Zone",
		deleteWorkspace: "Delete Workspace",
		deleteWorkspaceDescription:
			"Once you delete a workspace, there is no going back. Please be certain.",
		deleteConfirm: "Are you sure you want to delete this workspace?",
		removeMemberConfirm: "Are you sure you want to remove this member?",
		generalSettings: "General",
		membersSettings: "Members",
		generalSettingsDescription: "Update your workspace name and URL",
		membersSettingsDescription: "Manage who has access to this workspace",
		slugHelpText: "Slug cannot be changed after workspace creation",
		slugAutoGenerateHelpText: "Leave empty to auto-generate from name",
		addMemberDescription: "Add a user to this workspace by their email or username",
		globalRolesDescription:
			"Global roles management is available in the main administration panel.",
		globalClaimsDescription:
			"Global claims management is available in the main administration panel.",
		globalUsersDescription:
			"Global users management is available in the main administration panel.",
		workspaceNotFound: "Workspace not found",
		backToWorkspaces: "Back to Workspaces",
		updateWorkspaceFailed: "Failed to update workspace",
		deleteWorkspaceFailed: "Failed to delete workspace",
		addMemberFailed: "Failed to add member",
		removeMemberFailed: "Failed to remove member",
		switchWorkspace: "Switch Workspace",
		currentWorkspace: "Current Workspace",
		tooltips: {
			workspaceName: "A descriptive name for your workspace",
			workspaceSlug: "A URL-friendly identifier (lowercase letters, numbers, and hyphens only)",
			displayName: "This name will be used by the AI agent when generating email content",
			memberIdentifier: "Enter email address or @username to add a member",
			roleName: "A unique name for this role (e.g., Admin, Editor, Viewer)",
			roleDescription: "Describe what permissions this role grants",
		},
	},
	twoFactor: {
		title: "Two-Factor Authentication",
		description:
			"Add an extra layer of security to your account by enabling two-factor authentication.",
		enabled: "Enabled",
		disabled: "Disabled",
		setup: "Set up 2FA",
		enable: "Enable 2FA",
		disable: "Disable 2FA",
		scanQrCode: "Scan QR Code",
		scanQrCodeDescription: "Use your authenticator app to scan this QR code",
		manualEntry: "Manual Entry",
		manualEntryDescription:
			"If you can't scan the QR code, enter this key manually in your authenticator app",
		secretKey: "Secret Key",
		verificationCode: "Verification Code",
		verificationCodePlaceholder: "Enter 6-digit code",
		verify: "Verify",
		verifying: "Verifying...",
		disableConfirm: "Disable Two-Factor Authentication",
		disableDescription:
			"Enter your password to disable two-factor authentication. This will make your account less secure.",
		enterPassword: "Password",
		passwordPlaceholder: "Enter your password",
		setupSuccess: "Two-factor authentication setup initiated",
		enabledSuccess: "Two-factor authentication enabled successfully",
		disabledSuccess: "Two-factor authentication disabled successfully",
		invalidCode: "Invalid verification code",
		status: "2FA Status",
	},
	profile: {
		title: "Profile",
		subtitle: "Manage your personal information and account settings",
		personalInfo: "Personal Information",
		personalInfoDescription: "Update your profile information",
		firstName: "First Name",
		lastName: "Last Name",
		username: "Username",
		email: "Email",
		avatarUrl: "Avatar URL",
		save: "Save Changes",
		saving: "Saving...",
		saved: "Profile updated successfully",
		security: "Security",
		securityDescription: "Manage your password and two-factor authentication",
		changePassword: "Change Password",
		currentPassword: "Current Password",
		newPassword: "New Password",
		confirmNewPassword: "Confirm New Password",
		passwordChanged: "Password changed successfully",
		passwordMismatch: "Passwords do not match",
		twoFactorAuth: "Two-Factor Authentication",
	},
	notifications: {
		title: "Notifications",
		empty: "No notifications",
		markAllRead: "Mark all read",
		clearAll: "Clear all",
		viewAll: "View all",
		accept: "Accept",
		reject: "Reject",
		types: {
			invitation: {
				title: "Workspace Invitation",
				message: "{inviterName} invited you to join {tenantName}",
			},
			invitation_accepted: {
				title: "Invitation Accepted",
				message: "{userName} accepted your invitation to {tenantName}",
			},
			invitation_rejected: {
				title: "Invitation Rejected",
				message: "{userName} rejected your invitation to {tenantName}",
			},
			member_added: {
				title: "New Member",
				message: "{userName} has joined {tenantName}",
			},
			member_removed: {
				title: "Member Removed",
				message: "{userName} has been removed from {tenantName}",
			},
			subscription_created: {
				title: "Subscription Created",
				message: "Your subscription to {planName} has been activated",
			},
			subscription_canceled: {
				title: "Subscription Canceled",
				message: "Your subscription has been canceled",
			},
			trial_ending: {
				title: "Trial Ending Soon",
				message: "Your trial period ends in {days} days",
			},
			payment_failed: {
				title: "Payment Failed",
				message: "We were unable to process your payment",
			},
		},
	},
	admin: {
		title: "Administration",
		roles: "Roles",
		claims: "Claims",
		users: "Users",
		rolesDescription: "Manage global roles and their permissions",
		claimsDescription: "Manage global claims and permissions",
		usersDescription: "Manage all users in the system",
		createRole: "Create Role",
		createClaim: "Create Claim",
		roleName: "Role Name",
		roleDescription: "Description",
		claimType: "Claim Type",
		claimValue: "Claim Value",
		name: "Name",
		email: "Email",
		assignedUsers: "Assigned Users",
		assignedRoles: "Assigned Roles",
		assignRole: "Assign Role",
		assignClaim: "Assign Claim",
		removeRole: "Remove Role",
		removeClaim: "Remove Claim",
		noRoles: "No roles found",
		noClaims: "No claims found",
		noUsers: "No users found",
		roleCreated: "Role created successfully",
		roleUpdated: "Role updated successfully",
		roleDeleted: "Role deleted successfully",
		claimCreated: "Claim created successfully",
		claimDeleted: "Claim deleted successfully",
		search: "Search",
		searchPlaceholder: "Search...",
		roleClaims: "Role Claims",
		roleClaimsDescription: "Manage claims assigned to this role",
		claimAssigned: "Claim assigned successfully",
		claimRemoved: "Claim removed successfully",
		noClaimsAvailable: "No claims available",
		loadingClaims: "Loading claims...",
		blockUser: "Block User",
		unblockUser: "Unblock User",
		blockReason: "Block Reason",
		blockReasonPlaceholder: "Enter reason for blocking this user...",
		userBlocked: "User blocked successfully",
		userUnblocked: "User unblocked successfully",
		blocked: "Blocked",
		blockedAt: "Blocked at",
		confirmBlock: "Are you sure you want to block this user? They will not be able to log in.",
		confirmUnblock:
			"Are you sure you want to unblock this user? They will be able to log in again.",
		systemRole: "System Role",
		noClaimsAssigned: "No claims assigned",
		manageClaimsFor: "Manage claims for",
		supportTickets: "Support Tickets",
		supportTicketsDescription: "Manage all support tickets from users",
		allTickets: "All Tickets",
		openTickets: "Open",
		inProgressTickets: "In Progress",
		resolvedTickets: "Resolved",
		closedTickets: "Closed",
		noTickets: "No tickets found",
		ticketDetails: "Ticket Details",
		assignee: "Assignee",
		assignTo: "Assign to",
		unassigned: "Unassigned",
		changeStatus: "Change Status",
		changePriority: "Change Priority",
		addReply: "Add Reply",
		replyPlaceholder: "Write your reply...",
		sendReply: "Send Reply",
		staffReply: "Staff",
		userReply: "User",
		ticketCreated: "Ticket created successfully",
		ticketUpdated: "Ticket updated successfully",
		ticketDeleted: "Ticket deleted successfully",
		replyAdded: "Reply added successfully",
		filterByStatus: "Filter by Status",
		filterByPriority: "Filter by Priority",
		filterByCategory: "Filter by Category",
		avgResolutionTime: "Avg. Resolution Time",
		ticketStats: "Ticket Statistics",
		errorReports: "Error Reports",
		errorReportsDescription: "View automatically reported errors from the application",
		noErrorReports: "No error reports",
		noErrorReportsDescription: "No error reports have been submitted yet",
		errorCode: "Error Code",
		errorMessage: "Error Message",
		url: "URL",
		linkedTicket: "Linked Ticket",
		deleteSelected: "Delete Selected",
		selectedCount: "{count} selected",
		errorReportsDeleted: "Error reports deleted successfully",
	},
	tenantAdmin: {
		roles: "Workspace Roles",
		claims: "Workspace Claims",
		rolesDescription: "Manage roles specific to this workspace",
		claimsDescription: "Manage claims specific to this workspace",
		membersDescription: "Manage workspace members and their permissions",
		assignRoleToMember: "Assign role to member",
		assignClaimToMember: "Assign claim to member",
		memberRoles: "Member Roles",
		memberClaims: "Member Claims",
		createRole: "Create Role",
		createRoleDescription: "Create a new role for this workspace",
		editRole: "Edit Role",
		editRoleDescription: "Update role information",
		deleteRole: "Delete Role",
		deleteRoleConfirm: "Are you sure you want to delete this role? This action cannot be undone.",
		roleName: "Role Name",
		roleNamePlaceholder: "Enter role name",
		roleDescription: "Description",
		roleDescriptionPlaceholder: "Enter role description (optional)",
		roleCreated: "Role created successfully",
		roleUpdated: "Role updated successfully",
		roleDeleted: "Role deleted successfully",
		manageClaimsFor: "Manage claims for",
		rolesOverview: "Overview",
		manageClaims: "Claims",
		availableRoles: "Available Roles",
		manageClaimsDescription: "Assign and remove claims from workspace roles",
		editClaims: "Edit Claims",
		noClaimsAssigned: "No claims assigned",
	},
	subscription: {
		title: "Subscription",
		subtitle: "Select the plan that works best for your team",
		choosePlan: "Choose Your Plan",
		currentSubscription: "Current Subscription",
		status: "Status",
		cancelsAtPeriodEnd: "Cancels at period end",
		monthly: "Monthly",
		yearly: "Yearly",
		savePercent: "Save 20%",
		tokensPerMonth: "{count} tokens/month",
		teamMembers: "{count} team members",
		storageSpace: "{size} storage",
		dayFreeTrial: "{count} day free trial",
		currentPlan: "Current Plan",
		startFreeTrial: "Start Free Trial",
		subscribe: "Subscribe",
		mostPopular: "Most Popular",
		completePayment: "Complete Payment",
		subscribeTo: "Subscribe to",
		nameOnCard: "Name on Card",
		cardNumber: "Card Number",
		expiryDate: "Expiry Date",
		cvc: "CVC",
		paymentSecure: "Your payment information is secure and encrypted",
		cancel: "Cancel",
		processing: "Processing...",
		pay: "Pay",
		trialStarted: "Trial started successfully!",
		paymentSuccess: "Payment successful! Subscription created.",
		fillCardDetails: "Please fill in all card details",
		failedStartTrial: "Failed to start trial",
		failedCreateSubscription: "Failed to create subscription",
		noActiveSubscription: "No active subscription",
		changePlan: "Change Plan",
		billing: "Billing",
		currentPeriod: "Current period",
		trialEnds: "Trial ends",
		statuses: {
			active: "Active",
			trialing: "Trial",
			canceled: "Canceled",
			past_due: "Past Due",
			incomplete: "Incomplete",
			incomplete_expired: "Expired",
			unpaid: "Unpaid",
		},
		billingCycles: {
			monthly: "Monthly",
			yearly: "Yearly",
		},
	},
	branding: {
		title: "Branding",
		subtitle: "Manage your brand identity",
		noBrand: "No brand configured",
		noBrandDescription:
			"Create a brand to define your colors, fonts, spacings, and border radii for consistent email styling.",
		createBrand: "Create Brand",
		brandCreated: "Brand created successfully",
		brandCreateFailed: "Failed to create brand",
		colors: "Colors",
		colorsDescription: "Define your brand color palette",
		addColor: "Add Color",
		addColorDescription: "Add a new color to your brand palette",
		editColor: "Edit Color",
		deleteColor: "Delete Color",
		deleteColorConfirm: "Are you sure you want to delete this color?",
		colorName: "Name",
		colorValue: "Color",
		colorCreated: "Color created",
		colorUpdated: "Color updated",
		colorDeleted: "Color deleted",
		colorCreateFailed: "Failed to create color",
		colorUpdateFailed: "Failed to update color",
		colorDeleteFailed: "Failed to delete color",
		noColors: "No colors defined yet",
		fonts: "Fonts",
		fontsDescription: "Define your brand typography",
		addFont: "Add Font",
		addFontDescription: "Add a new font to your brand",
		editFont: "Edit Font",
		deleteFont: "Delete Font",
		deleteFontConfirm: "Are you sure you want to delete this font?",
		fontName: "Name",
		fontFamily: "Font Family",
		fontWeight: "Font Weight",
		fontCreated: "Font created",
		fontUpdated: "Font updated",
		fontDeleted: "Font deleted",
		fontCreateFailed: "Failed to create font",
		fontUpdateFailed: "Failed to update font",
		fontDeleteFailed: "Failed to delete font",
		noFonts: "No fonts defined yet",
		spacings: "Spacings",
		spacingsDescription: "Define spacing values in pixels",
		addSpacing: "Add Spacing",
		addSpacingDescription: "Add a new spacing value",
		editSpacing: "Edit Spacing",
		deleteSpacing: "Delete Spacing",
		deleteSpacingConfirm: "Are you sure you want to delete this spacing?",
		spacingName: "Name",
		spacingValue: "Value (px)",
		spacingCreated: "Spacing created",
		spacingUpdated: "Spacing updated",
		spacingDeleted: "Spacing deleted",
		spacingCreateFailed: "Failed to create spacing",
		spacingUpdateFailed: "Failed to update spacing",
		spacingDeleteFailed: "Failed to delete spacing",
		noSpacings: "No spacings defined yet",
		radii: "Border Radii",
		radiiDescription: "Define border radius values in pixels",
		addRadius: "Add Radius",
		addRadiusDescription: "Add a new border radius value",
		editRadius: "Edit Radius",
		deleteRadius: "Delete Radius",
		deleteRadiusConfirm: "Are you sure you want to delete this radius?",
		radiusName: "Name",
		radiusValue: "Value (px)",
		radiusCreated: "Radius created",
		radiusUpdated: "Radius updated",
		radiusDeleted: "Radius deleted",
		radiusCreateFailed: "Failed to create radius",
		radiusUpdateFailed: "Failed to update radius",
		radiusDeleteFailed: "Failed to delete radius",
		noRadii: "No radii defined yet",
		logos: "Logos",
		logosDescription: "Upload and manage your brand logos",
		addLogo: "Add Logo",
		addLogoDescription: "Upload a new logo for your brand",
		editLogo: "Edit Logo",
		deleteLogo: "Delete Logo",
		deleteLogoConfirm: "Are you sure you want to delete this logo?",
		logoName: "Name",
		logoType: "Logo Type",
		logoFile: "Logo File",
		logoTypes: {
			primary: "Primary Logo",
			secondary: "Secondary Logo",
			favicon: "Favicon",
			icon: "Icon",
		},
		logoCreated: "Logo created",
		logoUpdated: "Logo updated",
		logoDeleted: "Logo deleted",
		logoCreateFailed: "Failed to create logo",
		logoUpdateFailed: "Failed to update logo",
		logoDeleteFailed: "Failed to delete logo",
		noLogos: "No logos uploaded yet",
		uploadLogo: "Upload Logo",
		dropLogoHere: "Drop your logo here or click to browse",
		selectLogoType: "Select logo type",
		tooltips: {
			colorName: "A unique identifier for this color (e.g., primary, secondary, accent)",
			colorValue: "The hex color value (e.g., #FF5733)",
			fontName: "A unique identifier for this font (e.g., heading, body, caption)",
			fontFamily: "The CSS font family name (e.g., Inter, Roboto, Arial)",
			fontWeight: "The font weight value (e.g., 400 for normal, 700 for bold)",
			spacingName: "A unique identifier for this spacing (e.g., sm, md, lg)",
			spacingValue: "The spacing value in pixels",
			radiusName: "A unique identifier for this radius (e.g., sm, md, lg, full)",
			radiusValue: "The border radius value in pixels",
			logoName: "A descriptive name for this logo",
			logoType: "The intended use for this logo (primary, secondary, favicon, or icon)",
			logoFile: "The URL to your logo image file",
		},
		addMultiple: "Add Multiple",
		addRow: "Add Row",
		removeRow: "Remove Row",
		batchCreateColors: "Add Multiple Colors",
		batchCreateColorsDescription: "Add multiple colors at once to your brand palette",
		batchCreateFonts: "Add Multiple Fonts",
		batchCreateFontsDescription: "Add multiple fonts at once to your brand",
		batchCreateSpacings: "Add Multiple Spacings",
		batchCreateSpacingsDescription: "Add multiple spacing values at once",
		batchCreateRadii: "Add Multiple Radii",
		batchCreateRadiiDescription: "Add multiple border radius values at once",
		creatingItems: "Creating items...",
		batchCreateSuccess: "{count} items created successfully",
		batchCreatePartial: "{success} of {total} items created",
		selectOrTypeFont: "Select or type a font...",
		selectFont: "Select font...",
		typeCustomFont: "Type a custom font name",
		sansSerif: "Sans Serif",
		serif: "Serif",
		monospace: "Monospace",
		display: "Display",
	},
	support: {
		reportIssue: "Report Issue",
		reportIssueDescription: "Help us improve by reporting this error",
		errorOccurred: "An error occurred",
		errorDescription: "We encountered an unexpected error while processing your request.",
		additionalDetails: "Additional Details",
		additionalDetailsPlaceholder: "Describe what you were trying to do when this error occurred...",
		submitReport: "Submit Report",
		reportSubmitted: "Thank you! Your report has been submitted.",
		reportFailed: "Failed to submit report. Please try again.",
		tryAgain: "Try Again",
		goBack: "Go Back",
		goHome: "Go to Home",
		somethingWentWrong: "Something went wrong",
		errorCode: "Error Code",
		title: "Support",
		subtitle: "Get help with any issues or questions",
		createTicket: "Create Ticket",
		myTickets: "My Tickets",
		noTickets: "No tickets yet",
		noTicketsDescription: "Create a ticket to get help from our support team",
		ticketSubject: "Subject",
		ticketSubjectPlaceholder: "Brief description of your issue",
		ticketDescription: "Description",
		ticketDescriptionPlaceholder: "Describe your issue in detail...",
		ticketCategory: "Category",
		ticketPriority: "Priority",
		ticketCreated: "Ticket created successfully",
		ticketUpdated: "Ticket updated successfully",
		viewTicket: "View Ticket",
		backToTickets: "Back to Tickets",
		sendMessage: "Send Message",
		messagePlaceholder: "Type your message...",
		messageSent: "Message sent successfully",
		categories: {
			general: "General",
			bug: "Bug Report",
			feature: "Feature Request",
			billing: "Billing",
			account: "Account",
			technical: "Technical Issue",
		},
		priorities: {
			low: "Low",
			medium: "Medium",
			high: "High",
			urgent: "Urgent",
		},
		statuses: {
			open: "Open",
			in_progress: "In Progress",
			resolved: "Resolved",
			closed: "Closed",
		},
		serverError: "Server Error",
		serverErrorDescription: "We encountered an internal server error. Would you like to create a support ticket?",
		createTicketFromError: "Create Support Ticket",
	},
	storage: {
		title: "Storage",
		subtitle: "Manage your uploaded files",
		uploadFile: "Upload File",
		uploadSuccess: "File uploaded successfully",
		uploadFailed: "Failed to upload file",
		deleteFile: "Delete File",
		deleteConfirm: "Are you sure you want to delete this file?",
		deleteSuccess: "File deleted",
		deleteFailed: "Failed to delete file",
		noFiles: "No files uploaded yet",
		usage: "Storage Usage",
		files: "files",
		usedOf: "{used} of {total}",
		copyLinkFailed: "Failed to copy link",
	},
};
