/**
 * Client-side multi-session storage
 * Manages multiple user sessions (Slack/Notion pattern)
 * Sessions are stored in localStorage with AES-256-GCM encryption
 */

import { browser } from '$app/environment';
import { encryptSession, decryptSession, isWebCryptoSupported } from './crypto';

const STORAGE_KEY = 'syos_sessions';
const ACTIVE_ACCOUNT_KEY = 'syos_active_account';
const MIGRATION_FLAG_KEY = 'syos_crypto_migrated'; // Track migration status

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
 * DEPRECATED: Old XOR encryption (kept for migration only)
 * DO NOT USE for new code!
 */
function legacyDecrypt(encrypted: string, key: string): string {
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

function getLegacyStorageKey(): string {
	if (!browser) return 'default-key';
	return `${navigator.userAgent}-${screen.width}x${screen.height}`.slice(0, 32);
}

/**
 * Migrate from XOR encryption to Web Crypto API
 * This is called automatically on first load
 */
async function migrateToWebCrypto(): Promise<void> {
	if (!browser || !isWebCryptoSupported()) {
		console.warn('Web Crypto API not available, skipping migration');
		return;
	}
	
	const migrated = localStorage.getItem(MIGRATION_FLAG_KEY);
	if (migrated === 'true') {
		return; // Already migrated
	}
	
	console.log('🔐 Migrating session encryption from XOR to Web Crypto API...');
	
	try {
		// Try to load old encrypted data
		const oldEncrypted = localStorage.getItem(STORAGE_KEY);
		if (!oldEncrypted) {
			// No old data to migrate
			localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
			return;
		}
		
		// Decrypt with old XOR method
		const oldDecrypted = legacyDecrypt(oldEncrypted, getLegacyStorageKey());
		if (!oldDecrypted) {
			console.warn('Failed to decrypt old session data, clearing');
			localStorage.removeItem(STORAGE_KEY);
			localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
			return;
		}
		
		// Parse old data
		const oldData = JSON.parse(oldDecrypted) as MultiSessionStore;
		
		// Re-encrypt with new Web Crypto method
		const newEncrypted = await encryptSession(JSON.stringify(oldData));
		localStorage.setItem(STORAGE_KEY, newEncrypted);
		
		// Mark migration complete
		localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
		
		console.log('✅ Session encryption migration complete');
	} catch (error) {
		console.error('Migration failed:', error);
		// Clear corrupted data
		localStorage.removeItem(STORAGE_KEY);
		localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
	}
}

/**
 * Load all sessions from localStorage
 */
export async function loadSessions(): Promise<MultiSessionStore> {
	if (!browser) {
		return { activeAccount: null, sessions: {} };
	}
	
	// Run migration if needed (idempotent)
	await migrateToWebCrypto();
	
	if (!isWebCryptoSupported()) {
		console.error('Web Crypto API not supported in this browser');
		return { activeAccount: null, sessions: {} };
	}
	
	try {
		const encrypted = localStorage.getItem(STORAGE_KEY);
		if (!encrypted) {
			return { activeAccount: null, sessions: {} };
		}
		
		const decrypted = await decryptSession(encrypted);
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
		// Clear corrupted data
		localStorage.removeItem(STORAGE_KEY);
		return { activeAccount: null, sessions: {} };
	}
}

/**
 * Save all sessions to localStorage
 */
export async function saveSessions(store: MultiSessionStore): Promise<void> {
	if (!browser || !isWebCryptoSupported()) {
		console.warn('Cannot save sessions: Web Crypto API not available');
		return;
	}
	
	try {
		const json = JSON.stringify(store);
		const encrypted = await encryptSession(json);
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
export async function addSession(userId: string, session: SessionData): Promise<void> {
	const store = await loadSessions();
	store.sessions[userId] = session;
	
	// If this is the first session, make it active
	if (!store.activeAccount || Object.keys(store.sessions).length === 1) {
		store.activeAccount = userId;
	}
	
	await saveSessions(store);
}

/**
 * Remove a session
 */
export async function removeSession(userId: string): Promise<void> {
	const store = await loadSessions();
	delete store.sessions[userId];
	
	// If we removed the active account, switch to another
	if (store.activeAccount === userId) {
		const remainingSessions = Object.keys(store.sessions);
		store.activeAccount = remainingSessions[0] || null;
	}
	
	await saveSessions(store);
}

/**
 * Set the active account
 */
export async function setActiveAccount(userId: string | null): Promise<void> {
	const store = await loadSessions();
	if (userId && store.sessions[userId]) {
		store.activeAccount = userId;
		await saveSessions(store);
	} else if (userId === null) {
		store.activeAccount = null;
		await saveSessions(store);
	}
}

/**
 * Get the active session
 */
export async function getActiveSession(): Promise<SessionData | null> {
	const store = await loadSessions();
	if (!store.activeAccount) return null;
	return store.sessions[store.activeAccount] || null;
}

/**
 * Get all sessions
 */
export async function getAllSessions(): Promise<Record<string, SessionData>> {
	const store = await loadSessions();
	return store.sessions;
}

/**
 * Get active account ID
 */
export async function getActiveAccountId(): Promise<string | null> {
	if (!browser) return null;
	const store = await loadSessions();
	return store.activeAccount;
}

/**
 * Clear all sessions
 */
export function clearAllSessions(): void {
	if (!browser) return;
	localStorage.removeItem(STORAGE_KEY);
	localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
	localStorage.removeItem(MIGRATION_FLAG_KEY);
}

