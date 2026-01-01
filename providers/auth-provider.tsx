"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useRef,
	type ReactNode,
} from "react";
import { identityApi, IdentityApiError } from "@/lib/api/identity";
import type { User, AuthTokens, LoginRequest, RegisterRequest } from "@/types";

const AUTH_STORAGE_KEY = "creafly_auth";
const TOKEN_REFRESH_MARGIN = 60 * 1000;

interface AuthState {
	user: User | null;
	tokens: AuthTokens | null;
	isLoading: boolean;
	isAuthenticated: boolean;
}

interface LoginResult {
	success: boolean;
	totpRequired?: boolean;
	tempToken?: string;
}

interface AuthContextValue extends AuthState {
	login: (request: LoginRequest) => Promise<LoginResult>;
	loginVerifyTOTP: (tempToken: string, code: string) => Promise<void>;
	register: (request: RegisterRequest) => Promise<void>;
	logout: () => void;
	refreshTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredAuth(): { user: User; tokens: AuthTokens } | null {
	if (typeof window === "undefined") return null;

	try {
		const stored = localStorage.getItem(AUTH_STORAGE_KEY);
		if (!stored) return null;
		return JSON.parse(stored);
	} catch {
		return null;
	}
}

function setStoredAuth(user: User, tokens: AuthTokens): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, tokens }));
}

function clearStoredAuth(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>({
		user: null,
		tokens: null,
		isLoading: true,
		isAuthenticated: false,
	});

	const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
	const isRefreshingRef = useRef(false);

	const logout = useCallback(() => {
		if (refreshTimerRef.current) {
			clearTimeout(refreshTimerRef.current);
			refreshTimerRef.current = null;
		}
		clearStoredAuth();
		setState({
			user: null,
			tokens: null,
			isLoading: false,
			isAuthenticated: false,
		});
	}, []);

	const refreshTokens = useCallback(async (): Promise<boolean> => {
		if (isRefreshingRef.current) {
			return false;
		}

		const stored = getStoredAuth();
		if (!stored?.tokens?.refreshToken) {
			return false;
		}

		isRefreshingRef.current = true;

		try {
			const response = await identityApi.refresh(stored.tokens.refreshToken);
			if (response.user && response.tokens) {
				setStoredAuth(response.user, response.tokens);
				setState({
					user: response.user,
					tokens: response.tokens,
					isLoading: false,
					isAuthenticated: true,
				});
				return true;
			}
			return false;
		} catch {
			logout();
			return false;
		} finally {
			isRefreshingRef.current = false;
		}
	}, [logout]);

	const scheduleTokenRefresh = useCallback(
		(expiresIn: number) => {
			if (refreshTimerRef.current) {
				clearTimeout(refreshTimerRef.current);
			}

			const refreshIn = Math.max(expiresIn * 1000 - TOKEN_REFRESH_MARGIN, 0);

			if (refreshIn > 0) {
				refreshTimerRef.current = setTimeout(async () => {
					const success = await refreshTokens();
					if (success) {
						const stored = getStoredAuth();
						if (stored?.tokens?.expiresIn) {
							scheduleTokenRefresh(stored.tokens.expiresIn);
						}
					}
				}, refreshIn);
			}
		},
		[refreshTokens]
	);

	const login = useCallback(
		async (request: LoginRequest): Promise<LoginResult> => {
			const response = await identityApi.login(request);

			if (response.totpRequired && response.tempToken) {
				return {
					success: false,
					totpRequired: true,
					tempToken: response.tempToken,
				};
			}

			if (!response.user || !response.tokens) {
				throw new IdentityApiError(400, "Login failed - missing user or tokens");
			}

			setStoredAuth(response.user, response.tokens);
			setState({
				user: response.user,
				tokens: response.tokens,
				isLoading: false,
				isAuthenticated: true,
			});

			scheduleTokenRefresh(response.tokens.expiresIn);

			return { success: true };
		},
		[scheduleTokenRefresh]
	);

	const loginVerifyTOTP = useCallback(
		async (tempToken: string, code: string): Promise<void> => {
			const response = await identityApi.loginVerifyTOTP(tempToken, code);

			if (!response.user || !response.tokens) {
				throw new IdentityApiError(400, "2FA verification failed - missing user or tokens");
			}

			setStoredAuth(response.user, response.tokens);
			setState({
				user: response.user,
				tokens: response.tokens,
				isLoading: false,
				isAuthenticated: true,
			});

			scheduleTokenRefresh(response.tokens.expiresIn);
		},
		[scheduleTokenRefresh]
	);

	const register = useCallback(
		async (request: RegisterRequest): Promise<void> => {
			const response = await identityApi.register(request);

			if (!response.user || !response.tokens) {
				throw new IdentityApiError(400, "Registration failed - missing user or tokens");
			}

			setStoredAuth(response.user, response.tokens);
			setState({
				user: response.user,
				tokens: response.tokens,
				isLoading: false,
				isAuthenticated: true,
			});

			scheduleTokenRefresh(response.tokens.expiresIn);
		},
		[scheduleTokenRefresh]
	);

	useEffect(() => {
		const initAuth = async () => {
			const stored = getStoredAuth();

			if (!stored) {
				setState((prev) => ({ ...prev, isLoading: false }));
				return;
			}

			try {
				const response = await identityApi.me(stored.tokens.accessToken);
				if (response.user) {
					setState({
						user: response.user,
						tokens: stored.tokens,
						isLoading: false,
						isAuthenticated: true,
					});
					scheduleTokenRefresh(stored.tokens.expiresIn);
				} else {
					const refreshed = await refreshTokens();
					if (!refreshed) {
						logout();
					}
				}
			} catch (error) {
				if (error instanceof IdentityApiError && error.status === 401) {
					const refreshed = await refreshTokens();
					if (!refreshed) {
						logout();
					}
				} else {
					logout();
				}
			}
		};

		initAuth();

		return () => {
			if (refreshTimerRef.current) {
				clearTimeout(refreshTimerRef.current);
			}
		};
	}, [logout, refreshTokens, scheduleTokenRefresh]);

	return (
		<AuthContext.Provider
			value={{
				...state,
				login,
				loginVerifyTOTP,
				register,
				logout,
				refreshTokens,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
