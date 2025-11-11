import { browser } from '$app/environment';

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
	refresh: () => Promise<void>;
	logout: () => Promise<void>;
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
		error: null as string | null
	});

	async function loadSession() {
		if (!browser) {
			state.isLoading = false;
			return;
		}

		state.isLoading = true;
		state.error = null;

		try {
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
			state.csrfToken = data.csrfToken ?? readCookie('axon_csrf');
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

		const csrfToken = state.csrfToken ?? readCookie('axon_csrf');
		if (!csrfToken) {
			state.error = 'Unable to verify session (missing CSRF token).';
			return;
		}

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
				window.location.href = '/login';
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
		refresh: loadSession,
		logout
	};
}
