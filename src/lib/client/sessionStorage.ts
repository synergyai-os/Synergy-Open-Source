/**
 * Client-side multi-session storage
 * Manages multiple user sessions (Slack/Notion pattern)
 * Sessions are stored in localStorage with basic encryption
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'syos_sessions';
const ACTIVE_ACCOUNT_KEY = 'syos_active_account';

export interface SessionData {
	sessionId: string;
	csrfToken: string;
	expiresAt: number;
	userEmail: string;
	userName?: string;
}

export interface MultiSessionStore {
	activeAccount: string | null;
	sessions: Record<string, SessionData>;
}

/**
 * Simple XOR encryption for localStorage
 * Not cryptographically secure, but prevents casual inspection
 */
function simpleEncrypt(text: string, key: string): string {
	let result = '';
	for (let i = 0; i < text.length; i++) {
		result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
	}
	return btoa(result);
}

function simpleDecrypt(encrypted: string, key: string): string {
	try {
		const decoded = atob(encrypted);
		let result = '';
		for (let i = 0; i < decoded.length; i++) {
			result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
		}
		return result;
	} catch {
		return '';
	}
}

// Simple key derived from user agent + screen properties
function getStorageKey(): string {
	if (!browser) return 'default-key';
	return `${navigator.userAgent}-${screen.width}x${screen.height}`.slice(0, 32);
}

/**
 * Load all sessions from localStorage
 */
export function loadSessions(): MultiSessionStore {
	if (!browser) {
		return { activeAccount: null, sessions: {} };
	}

	try {
		const encrypted = localStorage.getItem(STORAGE_KEY);
		if (!encrypted) {
			return { activeAccount: null, sessions: {} };
		}

		const decrypted = simpleDecrypt(encrypted, getStorageKey());
		const parsed = JSON.parse(decrypted) as MultiSessionStore;

		// Clean up expired sessions
		const now = Date.now();
		const validSessions: Record<string, SessionData> = {};
		for (const [userId, session] of Object.entries(parsed.sessions)) {
			if (session.expiresAt > now) {
				validSessions[userId] = session;
			}
		}

		// If active account session expired, switch to first valid one
		let activeAccount = parsed.activeAccount;
		if (activeAccount && !validSessions[activeAccount]) {
			activeAccount = Object.keys(validSessions)[0] || null;
		}

		return {
			activeAccount,
			sessions: validSessions
		};
	} catch (error) {
		console.error('Failed to load sessions from localStorage:', error);
		return { activeAccount: null, sessions: {} };
	}
}

/**
 * Save all sessions to localStorage
 */
export function saveSessions(store: MultiSessionStore): void {
	if (!browser) return;

	try {
		const json = JSON.stringify(store);
		const encrypted = simpleEncrypt(json, getStorageKey());
		localStorage.setItem(STORAGE_KEY, encrypted);

		// Also store active account separately for quick access
		if (store.activeAccount) {
			localStorage.setItem(ACTIVE_ACCOUNT_KEY, store.activeAccount);
		} else {
			localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
		}
	} catch (error) {
		console.error('Failed to save sessions to localStorage:', error);
	}
}

/**
 * Add or update a session
 */
export function addSession(userId: string, session: SessionData): void {
	const store = loadSessions();
	store.sessions[userId] = session;

	// If this is the first session, make it active
	if (!store.activeAccount || Object.keys(store.sessions).length === 1) {
		store.activeAccount = userId;
	}

	saveSessions(store);
}

/**
 * Remove a session
 */
export function removeSession(userId: string): void {
	const store = loadSessions();
	delete store.sessions[userId];

	// If we removed the active account, switch to another
	if (store.activeAccount === userId) {
		const remainingSessions = Object.keys(store.sessions);
		store.activeAccount = remainingSessions[0] || null;
	}

	saveSessions(store);
}

/**
 * Set the active account
 */
export function setActiveAccount(userId: string | null): void {
	const store = loadSessions();
	if (userId && store.sessions[userId]) {
		store.activeAccount = userId;
		saveSessions(store);
	} else if (userId === null) {
		store.activeAccount = null;
		saveSessions(store);
	}
}

/**
 * Get the active session
 */
export function getActiveSession(): SessionData | null {
	const store = loadSessions();
	if (!store.activeAccount) return null;
	return store.sessions[store.activeAccount] || null;
}

/**
 * Get all sessions
 */
export function getAllSessions(): Record<string, SessionData> {
	const store = loadSessions();
	return store.sessions;
}

/**
 * Get active account ID
 */
export function getActiveAccountId(): string | null {
	if (!browser) return null;
	const store = loadSessions();
	return store.activeAccount;
}

/**
 * Clear all sessions
 */
export function clearAllSessions(): void {
	if (!browser) return;
	localStorage.removeItem(STORAGE_KEY);
	localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
}

