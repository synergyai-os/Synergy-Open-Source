import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { env as publicEnv } from '$env/dynamic/public';
import { api } from '$convex/_generated/api';
import { getActiveSessionRecordForUser } from '$lib/infrastructure/auth/server/sessionStore';
import { generateRandomToken } from '$lib/infrastructure/auth/server/crypto';
import { logger } from '$lib/utils/logger';
import { invariant } from '$lib/utils/invariant';

export const GET: RequestHandler = async ({ locals }) => {
	const { auth } = locals;

	logger.debug('linkedSessions', 'Request received', {
		hasAuth: !!auth,
		hasSessionId: !!auth?.sessionId,
		hasUser: !!auth?.user,
		currentUserId: auth?.user?.userId,
		currentUserEmail: auth?.user?.email
	});

	if (!auth?.sessionId || !auth.user) {
		logger.error('linkedSessions', 'Not authenticated');
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	invariant(publicEnv.PUBLIC_CONVEX_URL, 'PUBLIC_CONVEX_URL must be configured.');

	const convex = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);

	try {
		// Get all linked accounts for the current user
		logger.debug('linkedSessions', 'Fetching linked accounts');
		const linkedAccounts = await convex.query(api.core.users.index.listLinkedAccounts, {
			sessionId: auth.sessionId
		});
		logger.debug('linkedSessions', 'Linked accounts fetched', {
			count: linkedAccounts.length,
			accounts: linkedAccounts.map((a) => ({
				userId: a.userId,
				email: a.email,
				name: a.name
			}))
		});

		// Get active sessions and workspaces for each linked account
		const linkedSessions: Array<{
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
		}> = [];

		for (const account of linkedAccounts) {
			try {
				logger.debug('linkedSessions', 'Fetching session for account', {
					userId: account.userId,
					email: account.email
				});
				const sessionRecord = await getActiveSessionRecordForUser({
					sessionId: auth.sessionId,
					targetUserId: account.userId
				});
				logger.debug('linkedSessions', 'Session record result', {
					userId: account.userId,
					hasSession: !!sessionRecord,
					expiresAt: sessionRecord?.expiresAt,
					isExpired: sessionRecord ? sessionRecord.expiresAt <= Date.now() : null,
					now: Date.now()
				});

				if (sessionRecord && sessionRecord.expiresAt > Date.now()) {
					// Generate a new CSRF token for localStorage (will be validated/updated on switch)
					// Note: The actual CSRF token is hashed in Convex, so we generate a placeholder
					// that will be properly set when the account is switched to
					const csrfToken = generateRandomToken(32);

					// Fetch workspaces for this account using their sessionId
					logger.debug('linkedSessions', 'Fetching workspaces for account', {
						userId: account.userId,
						email: account.email,
						sessionId: sessionRecord.sessionId
					});
					const accountOrganizations = await convex.query(
						api.core.workspaces.index.listWorkspaces,
						{
							sessionId: sessionRecord.sessionId
						}
					);
					logger.debug('linkedSessions', 'Organizations fetched', {
						userId: account.userId,
						email: account.email,
						orgCount: accountOrganizations.length,
						orgs: accountOrganizations.map((o) => ({
							id: o.workspaceId,
							name: o.name,
							role: o.role
						}))
					});

					const sessionData = {
						userId: account.userId,
						sessionId: sessionRecord.sessionId,
						csrfToken,
						expiresAt: sessionRecord.expiresAt,
						userEmail: account.email ?? '',
						userName: account.name ?? undefined,
						workspaces: accountOrganizations.map((org) => ({
							workspaceId: org.workspaceId,
							name: org.name,
							initials: org.initials,
							slug: org.slug,
							role: org.role
						}))
					};

					linkedSessions.push(sessionData);
					logger.debug('linkedSessions', 'Added session for account', {
						userId: account.userId,
						email: account.email,
						sessionId: sessionRecord.sessionId,
						orgCount: sessionData.workspaces.length
					});
				} else {
					logger.warn('linkedSessions', 'Skipping account (no valid session)', {
						userId: account.userId,
						email: account.email,
						reason: !sessionRecord ? 'no session record' : 'session expired'
					});
				}
			} catch (error) {
				logger.error('linkedSessions', 'Failed to get session for linked account', {
					userId: account.userId,
					error
				});
				// Continue with other accounts
			}
		}

		logger.debug('linkedSessions', 'Returning sessions', {
			count: linkedSessions.length,
			sessions: linkedSessions.map((s) => ({
				userId: s.userId,
				email: s.userEmail,
				sessionId: s.sessionId,
				orgCount: s.workspaces.length
			}))
		});

		return json({ sessions: linkedSessions });
	} catch (error) {
		logger.error('linkedSessions', 'Failed to fetch linked account sessions', { error });
		return json({ error: 'Failed to fetch linked account sessions' }, { status: 500 });
	}
};
