"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/fetch-with-retry";
import { useTranslations } from "@/providers/i18n-provider";

interface UseFieldErrorsReturn<T extends string> {
	fieldErrors: Partial<Record<T, string>>;
	setFieldError: (field: T, message: string) => void;
	clearFieldError: (field: T) => void;
	clearAllErrors: () => void;
	handleError: (error: unknown, fallbackMessage?: string) => void;
	getFieldError: (field: T) => string | undefined;
	hasError: (field: T) => boolean;
}

const codeToTranslationKey: Record<
	string,
	keyof typeof import("@/lib/i18n/locales/en").en.validation
> = {
	required: "required",
	email: "email",
	min: "min",
	max: "max",
	uuid: "uuid",
	password: "password",
	username: "username",
	tenant_role: "tenantRole",
	oneof: "oneof",
	gte: "gte",
	lte: "lte",
	alphanum: "alphanum",
	url: "url",
};

/**
 * Hook for managing field-level validation errors from API responses.
 * Automatically translates validation error codes to localized messages.
 *
 * @example
 * ```tsx
 * const { fieldErrors, handleError, clearFieldError, clearAllErrors } = useFieldErrors<
 *   "email" | "password" | "firstName"
 * >();
 *
 * try {
 *   clearAllErrors();
 *   await submitForm(data);
 * } catch (error) {
 *   handleError(error, "Failed to submit form");
 * }
 *
 * <Field data-invalid={!!fieldErrors.email}>
 *   <Input
 *     value={email}
 *     onChange={(e) => {
 *       setEmail(e.target.value);
 *       clearFieldError("email");
 *     }}
 *   />
 *   <FieldError>{fieldErrors.email}</FieldError>
 * </Field>
 * ```
 */
export function useFieldErrors<T extends string = string>(): UseFieldErrorsReturn<T> {
	const t = useTranslations();
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<T, string>>>({});

	const translateErrorCode = useCallback(
		(code: string, fallbackMessage: string): string => {
			const translationKey = codeToTranslationKey[code];
			if (translationKey && t.validation?.[translationKey]) {
				return t.validation[translationKey];
			}
			return fallbackMessage;
		},
		[t]
	);

	const setFieldError = useCallback((field: T, message: string) => {
		setFieldErrors((prev) => ({ ...prev, [field]: message }));
	}, []);

	const clearFieldError = useCallback((field: T) => {
		setFieldErrors((prev) => {
			const next = { ...prev };
			delete next[field];
			return next;
		});
	}, []);

	const clearAllErrors = useCallback(() => {
		setFieldErrors({});
	}, []);

	const handleError = useCallback(
		(error: unknown, fallbackMessage?: string) => {
			if (error instanceof ApiError && error.isValidationError()) {
				const errorsWithCodes = error.getFieldErrorsWithCodes();
				const translatedErrors: Partial<Record<T, string>> = {};

				errorsWithCodes.forEach(({ field, code, message }) => {
					translatedErrors[field as T] = translateErrorCode(code, message);
				});

				setFieldErrors(translatedErrors);
			} else if (error instanceof ApiError) {
				toast.error(error.message || fallbackMessage || "An error occurred");
			} else if (error instanceof Error) {
				toast.error(error.message || fallbackMessage || "An error occurred");
			} else {
				toast.error(fallbackMessage || "An error occurred");
			}
		},
		[translateErrorCode]
	);

	const getFieldError = useCallback((field: T) => fieldErrors[field], [fieldErrors]);

	const hasError = useCallback((field: T) => !!fieldErrors[field], [fieldErrors]);

	return {
		fieldErrors,
		setFieldError,
		clearFieldError,
		clearAllErrors,
		handleError,
		getFieldError,
		hasError,
	};
}
