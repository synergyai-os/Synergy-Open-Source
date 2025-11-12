import { browser } from '$app/environment';
import {
	loadSessions,
	addSession,
	removeSession,
	setActiveAccount,
	getActiveSession,
	getAllSessions,
	getActiveAccountId,
	type SessionData
} from '$lib/client/sessionStorage';

export interface LinkedAccountInfo {
	userId: string;
	email: string;
	name?: string;
	firstName?: string;
	lastName?: string;
}

export interface UseAuthSessionReturn {
	get isLoading(): boolean;
	get isAuthenticated(): boolean;
	get user():
		| {
				userId: string;
				workosId: string;
				email: string;
				firstName?: string;
				lastName?: string;
				name?: string;
				activeWorkspace?: {
					type: 'personal' | 'organization';
					id: string | null;
					name?: string;
				};
		  }
		| null;
	get error(): string | null;
	get availableAccounts(): LinkedAccountInfo[];
	get activeAccountId(): string | null;
	refresh: () => Promise<void>;
	logout: () => Promise<void>;
	switchAccount: (targetUserId: string, redirectTo?: string) => Promise<void>;
}

interface SessionResponse {
	authenticated: boolean;
	user?: UseAuthSessionReturn['user'];
	expiresAt?: number;
	csrfToken?: string;
}

function readCookie(name: string): string | null {
	if (!browser) return null;
	return document.cookie
		.split('; ')
		.map((cookie) => cookie.split('='))
		.find(([key]) => key === name)?.[1] ?? null;
}

export function useAuthSession(): UseAuthSessionReturn {
	const state = $state({
		isLoading: !browser,
		isAuthenticated: false,
		user: null as UseAuthSessionReturn['user'],
		csrfToken: null as string | null,
		error: null as string | null,
		availableAccounts: [] as LinkedAccountInfo[]
	});

	async function loadSession() {
		if (!browser) {
			state.isLoading = false;
			return;
		}

		state.isLoading = true;
		state.error = null;

		try {
			// Check localStorage for active session first
			const localSession = getActiveSession();
			
			const response = await fetch('/auth/session', {
				headers: {
					Accept: 'application/json'
				},
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error(`Failed to load session (${response.status})`);
			}

			const data = (await response.json()) as SessionResponse;

			state.isAuthenticated = data.authenticated;
			state.user = data.authenticated && data.user ? data.user : null;
			const cookieToken = readCookie('syos_csrf') ?? readCookie('axon_csrf');
			state.csrfToken = data.csrfToken ?? cookieToken;

			// If authenticated, store/update session in localStorage
			if (data.authenticated && data.user && data.csrfToken && data.expiresAt) {
				addSession(data.user.userId, {
					sessionId: 'current', // Will be updated by server response
					csrfToken: data.csrfToken,
					expiresAt: data.expiresAt,
					userEmail: data.user.email,
					userName: data.user.name
				});
			}

			// Load all available accounts
			const allSessions = getAllSessions();
			state.availableAccounts = Object.entries(allSessions).map(([userId, session]) => ({
				userId,
				email: session.userEmail,
				name: session.userName
			}));
		} catch (error) {
			console.error('Failed to load auth session', error);
			state.isAuthenticated = false;
			state.user = null;
			state.error = 'Unable to load authentication state.';
		} finally {
			state.isLoading = false;
		}
	}

	async function logout() {
		if (!browser) return;

		const csrfToken = state.csrfToken ?? readCookie('syos_csrf') ?? readCookie('axon_csrf');
		if (!csrfToken) {
			state.error = 'Unable to verify session (missing CSRF token).';
			return;
		}

		const currentUserId = state.user?.userId;
		state.isLoading = true;
		state.error = null;

		try {
			const response = await fetch('/logout', {
				method: 'POST',
				headers: {
					'X-CSRF-Token': csrfToken
				},
				credentials: 'include'
			});

			if (response.ok || response.status === 303 || response.redirected) {
				// Remove current session from localStorage
				if (currentUserId) {
					removeSession(currentUserId);
				}

				// Check if other sessions exist
				const remainingSessions = getAllSessions();
				const remainingAccounts = Object.keys(remainingSessions);

				if (remainingAccounts.length > 0) {
					// Switch to first available account
					const nextUserId = remainingAccounts[0];
					setActiveAccount(nextUserId);
					
					// Reload to switch to the other account
					window.location.href = '/inbox?switched=1';
				} else {
					// No other sessions, go to login
					window.location.href = '/login';
				}
				return;
			}

			const result = await response.json().catch(() => null);
			state.error =
				(result as { error?: string } | null)?.error ?? 'Failed to log out.';
		} catch (error) {
			console.error('Logout failed', error);
			state.error = 'Logout request failed. Please try again.';
		} finally {
			state.isLoading = false;
		}
	}

	async function switchAccount(targetUserId: string, redirectTo?: string) {
		if (!browser) return;

		// Check if session exists in localStorage
		const allSessions = getAllSessions();
		if (!allSessions[targetUserId]) {
			state.error = 'Session not found. Please log in to this account first.';
			return;
		}

		const targetSession = allSessions[targetUserId];
		const csrfToken = state.csrfToken ?? targetSession.csrfToken ?? readCookie('syos_csrf') ?? readCookie('axon_csrf');
		
		if (!csrfToken) {
			state.error = 'Unable to verify session (missing CSRF token).';
			return;
		}

		state.isLoading = true;
		state.error = null;

		try {
			// Update active account in localStorage
			setActiveAccount(targetUserId);

			const response = await fetch('/auth/switch', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrfToken
				},
				credentials: 'include',
				body: JSON.stringify({
					targetUserId,
					redirect: redirectTo
				})
			});

			if (!response.ok) {
				const result = await response.json().catch(() => null);
				state.error =
					(result as { error?: string } | null)?.error ?? 'Failed to switch accounts.';
				return;
			}

			const result = (await response.json()) as { redirect?: string; csrfToken?: string };
			
			// Update CSRF token for new session
			if (result.csrfToken) {
				addSession(targetUserId, {
					...targetSession,
					csrfToken: result.csrfToken
				});
			}

			state.csrfToken = null;
			window.location.href = result.redirect ?? redirectTo ?? '/inbox';
		} catch (error) {
			console.error('Account switch failed', error);
			state.error = 'Unable to switch accounts right now.';
		} finally {
			state.isLoading = false;
		}
	}

	if (browser) {
		loadSession();
	}

	return {
		get isLoading() {
			return state.isLoading;
		},
		get isAuthenticated() {
			return state.isAuthenticated;
		},
		get user() {
			return state.user;
		},
		get error() {
			return state.error;
		},
		get availableAccounts() {
			return state.availableAccounts;
		},
		get activeAccountId() {
			return getActiveAccountId();
		},
		refresh: loadSession,
		logout,
		switchAccount
	};
}
