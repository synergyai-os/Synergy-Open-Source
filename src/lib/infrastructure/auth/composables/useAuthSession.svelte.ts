import { browser } from '$app/environment';
import {
	// loadSessions, // TODO: Re-enable when needed
	addSession,
	removeSession,
	setActiveAccount,
	getActiveSession,
	getAllSessions,
	clearAllSessions
	// getActiveAccountId, // TODO: Re-enable when needed
	// type SessionData // TODO: Re-enable when needed
} from '$lib/client/sessionStorage';
import { toast } from '$lib/utils/toast';
import { resolveRoute } from '$lib/utils/navigation';
import type { LinkedAccountInfo, UseAuthSessionReturn } from '../types';

interface SessionResponse {
	authenticated: boolean;
	user?: UseAuthSessionReturn['user'];
	expiresAt?: number;
	csrfToken?: string;
}

function readCookie(name: string): string | null {
	if (!browser) return null;
	return (
		document.cookie
			.split('; ')
			.map((cookie) => cookie.split('='))
			.find(([key]) => key === name)?.[1] ?? null
	);
}

export function useAuthSession(): UseAuthSessionReturn {
	const state = $state({
		isLoading: !browser,
		isAuthenticated: false,
		user: null as UseAuthSessionReturn['user'],
		csrfToken: null as string | null,
		error: null as string | null,
		availableAccounts: [] as LinkedAccountInfo[],
		activeAccountId: null as string | null
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
			const _localSession = await getActiveSession();

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
			const cookieToken = readCookie('syos_csrf');
			state.csrfToken = data.csrfToken ?? cookieToken;

			// Cache the active account ID synchronously
			state.activeAccountId = data.user?.userId ?? null;

			// If authenticated, store/update session in localStorage
			if (data.authenticated && data.user && data.csrfToken && data.expiresAt) {
				await addSession(data.user.userId, {
					sessionId: 'current', // Will be updated by server response
					csrfToken: data.csrfToken,
					expiresAt: data.expiresAt,
					userEmail: data.user.email,
					userName: data.user.name
				});
			}

			// Fetch and save linked account sessions from server
			if (data.authenticated && data.user) {
				console.log('🔍 [useAuthSession] Fetching linked account sessions...', {
					currentUserId: data.user.userId,
					currentUserEmail: data.user.email
				});
				try {
					const linkedSessionsResponse = await fetch('/auth/linked-sessions', {
						headers: {
							Accept: 'application/json'
						},
						credentials: 'include'
					});

					console.log('📋 [useAuthSession] Linked sessions response:', {
						ok: linkedSessionsResponse.ok,
						status: linkedSessionsResponse.status,
						statusText: linkedSessionsResponse.statusText
					});

					if (linkedSessionsResponse.ok) {
						const linkedSessionsData = (await linkedSessionsResponse.json()) as {
							sessions?: Array<{
								userId: string;
								sessionId: string;
								csrfToken: string;
								expiresAt: number;
								userEmail: string;
								userName?: string;
								workspaces: Array<{
									workspaceId: string;
									name: string;
									initials: string | null;
									slug: string | null;
									role: string;
								}>;
							}>;
						};

						console.log('📦 [useAuthSession] Linked sessions data received:', {
							sessionCount: linkedSessionsData.sessions?.length ?? 0,
							sessions: linkedSessionsData.sessions?.map((s) => ({
								userId: s.userId,
								email: s.userEmail,
								sessionId: s.sessionId,
								orgCount: s.workspaces.length
							}))
						});

						// Save each linked account session to localStorage
						if (linkedSessionsData.sessions) {
							for (const session of linkedSessionsData.sessions) {
								console.log('💾 [useAuthSession] Saving session to localStorage:', {
									userId: session.userId,
									email: session.userEmail,
									orgCount: session.workspaces.length
								});
								await addSession(session.userId, {
									sessionId: session.sessionId,
									csrfToken: session.csrfToken,
									expiresAt: session.expiresAt,
									userEmail: session.userEmail,
									userName: session.userName
								});

								// Cache workspaces for this account
								if (session.workspaces.length > 0) {
									const LINKED_ACCOUNT_ORGS_KEY_PREFIX = 'linkedAccountOrgs_';
									const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${session.userId}`;
									localStorage.setItem(cacheKey, JSON.stringify(session.workspaces));
									console.log('💾 [useAuthSession] Cached workspaces:', {
										userId: session.userId,
										email: session.userEmail,
										orgCount: session.workspaces.length,
										cacheKey
									});
								}

								console.log('✅ [useAuthSession] Session saved:', {
									userId: session.userId,
									email: session.userEmail
								});
							}
						} else {
							console.warn('⚠️ [useAuthSession] No sessions in response data');
						}

						// NOTE: We intentionally DON'T clean up localStorage here
						// Users can manually logout accounts they don't want via the three-dot menu
						// Automatic cleanup was too aggressive - it removed all accounts when creating a new user
					} else {
						const errorText = await linkedSessionsResponse.text();
						console.error('❌ [useAuthSession] Linked sessions response not OK:', {
							status: linkedSessionsResponse.status,
							error: errorText
						});
					}
				} catch (error) {
					console.error('❌ [useAuthSession] Failed to fetch linked account sessions:', error);
					// Continue - linked accounts will be loaded from localStorage if available
				}
			}

			// Load all available accounts (excluding current user)
			const allSessions = await getAllSessions();
			const currentUserId = data.user?.userId;
			console.log('📋 [useAuthSession] All sessions from localStorage:', {
				totalSessions: Object.keys(allSessions).length,
				sessions: Object.entries(allSessions).map(([userId, session]) => ({
					userId,
					email: session.userEmail,
					name: session.userName,
					sessionId: session.sessionId
				})),
				currentUserId
			});
			state.availableAccounts = Object.entries(allSessions)
				.filter(([userId]) => userId !== currentUserId)
				.map(([userId, session]) => ({
					userId,
					email: session.userEmail,
					name: session.userName,
					sessionId: session.sessionId // Include sessionId for querying workspaces
				}));
			console.log('✅ [useAuthSession] Available accounts set:', {
				count: state.availableAccounts.length,
				accounts: state.availableAccounts.map((a) => ({
					userId: a.userId,
					email: a.email,
					name: a.name
				}))
			});
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
		const currentUserId = state.user?.userId;
		if (!currentUserId) {
			state.error = 'No active session to log out.';
			return;
		}
		await logoutAccount(currentUserId);
	}

	async function logoutAccount(targetUserId: string) {
		if (!browser) return;

		const currentUserId = state.user?.userId;
		const isLoggingOutCurrentAccount = targetUserId === currentUserId;

		// For non-current accounts: unlink and remove from localStorage
		if (!isLoggingOutCurrentAccount) {
			// Get account info for toast message
			const allSessions = await getAllSessions();
			const targetSession = allSessions[targetUserId];
			const accountName = targetSession?.userName || targetSession?.userEmail || 'Account';

			// Step 1: Unlink the account in Convex (so it won't reappear on reload)
			const csrfToken = state.csrfToken ?? readCookie('syos_csrf');
			if (csrfToken) {
				try {
					const response = await fetch('/auth/unlink-account', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-CSRF-Token': csrfToken
						},
						credentials: 'include',
						body: JSON.stringify({ targetUserId })
					});

					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						console.error('Failed to unlink account:', errorData);
						// Continue anyway - will at least remove from localStorage
					}
				} catch (error) {
					console.error('Failed to unlink account:', error);
					// Continue anyway - will at least remove from localStorage
				}
			}

			// Step 2: Remove from localStorage
			await removeSession(targetUserId);
			await loadSession(); // Refresh available accounts list

			toast.success(`${accountName} logged out`);
			return;
		}

		// For current account: call server to invalidate active session
		const csrfToken = state.csrfToken ?? readCookie('syos_csrf');
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

			// Handle rate limiting
			if (response.status === 429) {
				const data = await response.json().catch(() => null);
				const retryAfter = response.headers.get('Retry-After') || data?.retryAfter || '60';
				state.error = `Too many logout attempts. Please wait ${retryAfter} seconds before trying again.`;
				state.isLoading = false;
				return;
			}

			if (response.ok || response.status === 303 || response.redirected) {
				// Remove current session from localStorage
				await removeSession(targetUserId);

				// Show success toast before redirect
				toast.success('Logged out successfully');

				// Check if other sessions exist
				const remainingSessions = await getAllSessions();
				const remainingAccounts = Object.keys(remainingSessions);

				if (remainingAccounts.length > 0) {
					// Switch to first available account
					const nextUserId = remainingAccounts[0];
					await setActiveAccount(nextUserId);

					// Restore session for the next account
					try {
						const restoreResponse = await fetch('/auth/restore', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							credentials: 'include',
							body: JSON.stringify({ userId: nextUserId })
						});

						if (restoreResponse.ok) {
							// Session restored, redirect to inbox
							window.location.href = `${resolveRoute('/inbox')}?switched=1`;
						} else {
							// Failed to restore, clear all and go to login
							console.error('Failed to restore session for next account');
							clearAllSessions();
							window.location.href = resolveRoute('/login');
						}
					} catch (error) {
						console.error('Failed to restore session:', error);
						clearAllSessions();
						window.location.href = resolveRoute('/login');
					}
				} else {
					// No other sessions, clear all and go to login
					clearAllSessions();
					window.location.href = resolveRoute('/login');
				}
				return;
			}

			const result = await response.json().catch(() => null);
			state.error = (result as { error?: string } | null)?.error ?? 'Failed to log out.';
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
		const allSessions = await getAllSessions();
		if (!allSessions[targetUserId]) {
			state.error = 'Session not found. Please log in to this account first.';
			return;
		}

		const targetSession = allSessions[targetUserId];
		const targetAccountName = targetSession.userName || targetSession.userEmail || 'account';

		// CRITICAL: Use CURRENT user's CSRF token, not target user's
		// The CSRF token protects the switch action itself, not the target account
		// Target session tokens are placeholders and will be invalid
		const csrfToken = state.csrfToken ?? readCookie('syos_csrf');

		if (!csrfToken) {
			state.error = 'Unable to verify session (missing CSRF token).';
			return;
		}

		// Set switching flag before redirect - overlay will show on page load
		sessionStorage.setItem(
			'switchingAccount',
			JSON.stringify({
				accountName: targetAccountName,
				startTime: Date.now()
			})
		);

		state.isLoading = true;
		state.error = null;

		try {
			// Update active account in localStorage
			await setActiveAccount(targetUserId);

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

			// Handle rate limiting
			if (response.status === 429) {
				// Clear switching flag on error
				sessionStorage.removeItem('switchingAccount');
				const data = await response.json().catch(() => null);
				const retryAfter = response.headers.get('Retry-After') || data?.retryAfter || '60';
				state.error = `Too many account switches. Please wait ${retryAfter} seconds before trying again.`;
				state.isLoading = false;
				return;
			}

			if (!response.ok) {
				// Clear switching flag on error
				sessionStorage.removeItem('switchingAccount');
				const result = await response.json().catch(() => null);
				state.error = (result as { error?: string } | null)?.error ?? 'Failed to switch accounts.';
				return;
			}

			const result = (await response.json()) as { redirect?: string; csrfToken?: string };

			// Update CSRF token for new session
			if (result.csrfToken) {
				await addSession(targetUserId, {
					...targetSession,
					csrfToken: result.csrfToken
				});
			}

			state.csrfToken = null;
			window.location.href = result.redirect ?? redirectTo ?? resolveRoute('/inbox');
		} catch (error) {
			// Clear switching flag on error
			sessionStorage.removeItem('switchingAccount');
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
			return state.activeAccountId;
		},
		refresh: loadSession,
		logout,
		logoutAccount,
		switchAccount
	};
}
