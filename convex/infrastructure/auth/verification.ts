import { v } from 'convex/values';
import { mutation, query, action, internalMutation } from '../../_generated/server';
import { internal } from '../../_generated/api';
import { validateSessionAndGetUserId } from '../sessionValidation';

// Generate a random 6-digit code
function generateCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Verify a code
 * Returns success status and error message if failed
 */
// AUTH EXEMPT: Public email verification before login; token provides auth context.
export const verifyCode = mutation({
	args: {
		sessionId: v.optional(v.string()),
		email: v.string(),
		code: v.string(),
		type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change'))
	},
	handler: async (ctx, args) => {
		if (args.sessionId) {
			await validateSessionAndGetUserId(ctx, args.sessionId);
		}
		const now = Date.now();

		// Normalize email (lowercase + trim) for consistent lookup
		const normalizedEmail = args.email.trim().toLowerCase();

		// Find the code record by email and type (don't filter by code yet - need to track attempts)
		const verificationCode = await ctx.db
			.query('verificationCodes')
			.withIndex('by_email_type', (q) => q.eq('email', normalizedEmail).eq('type', args.type))
			.filter((q) => q.eq(q.field('verified'), false))
			.first();

		if (!verificationCode) {
			return {
				success: false,
				error: 'Invalid verification code'
			};
		}

		// Check if already verified
		if (verificationCode.verified) {
			return {
				success: false,
				error: 'Code already used'
			};
		}

		// Check if expired
		if (now > verificationCode.expiresAt) {
			return {
				success: false,
				error: 'Code has expired'
			};
		}

		// Normalize code (trim whitespace) for comparison
		const normalizedCode = args.code.trim();

		// Check if code matches
		if (verificationCode.code !== normalizedCode) {
			// Increment attempts FIRST
			const newAttempts = verificationCode.attempts + 1;
			await ctx.db.patch(verificationCode._id, {
				attempts: newAttempts
			});

			// Check attempt limit AFTER incrementing (allow 5 attempts, show error on 5th)
			if (newAttempts >= 5) {
				return {
					success: false,
					error: 'Too many attempts'
				};
			}

			return {
				success: false,
				error: 'Invalid verification code'
			};
		}

		// Mark as verified
		await ctx.db.patch(verificationCode._id, {
			verified: true,
			verifiedAt: now
		});

		return {
			success: true,
			codeId: verificationCode._id
		};
	}
});

/**
 * Cleanup expired verification codes
 * Should be called periodically (e.g., via cron)
 */
// AUTH EXEMPT: Internal maintenance; not user initiated.
export const cleanupExpiredCodes = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		// Find expired codes
		const expiredCodes = await ctx.db
			.query('verificationCodes')
			.withIndex('by_expires')
			.filter((q) => q.lt(q.field('expiresAt'), now))
			.collect();

		// Delete expired codes
		let deletedCount = 0;
		for (const code of expiredCodes) {
			await ctx.db.delete(code._id);
			deletedCount++;
		}

		return { deletedCount };
	}
});

/**
 * Get verification code status (for testing/debugging)
 */
// AUTH EXEMPT: Debug helper; gated by E2E/test usage.
export const getCodeStatus = query({
	args: {
		sessionId: v.optional(v.string()),
		email: v.string(),
		type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change'))
	},
	handler: async (ctx, args) => {
		if (args.sessionId) {
			await validateSessionAndGetUserId(ctx, args.sessionId);
		}
		// Normalize email (lowercase + trim) for consistent lookup
		const normalizedEmail = args.email.trim().toLowerCase();

		const code = await ctx.db
			.query('verificationCodes')
			.withIndex('by_email_type', (q) => q.eq('email', normalizedEmail).eq('type', args.type))
			.filter((q) => q.eq(q.field('verified'), false))
			.first();

		if (!code) {
			return null;
		}

		const now = Date.now();
		const isExpired = now > code.expiresAt;

		return {
			exists: true,
			attempts: code.attempts,
			isExpired,
			expiresAt: code.expiresAt,
			createdAt: code.createdAt
		};
	}
});

/**
 * Get the actual verification code (ONLY FOR E2E TESTS)
 * This should only be called from test helper endpoints when E2E_TEST_MODE=true
 */
// AUTH EXEMPT: E2E-only endpoint gated by env + IP checks upstream.
export const getCodeForTesting = query({
	args: {
		sessionId: v.optional(v.string()),
		email: v.string(),
		type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change'))
	},
	handler: async (ctx, args) => {
		if (args.sessionId) {
			await validateSessionAndGetUserId(ctx, args.sessionId);
		}
		// Normalize email (lowercase + trim) for consistent lookup
		const normalizedEmail = args.email.trim().toLowerCase();

		const codeRecord = await ctx.db
			.query('verificationCodes')
			.withIndex('by_email_type', (q) => q.eq('email', normalizedEmail).eq('type', args.type))
			.filter((q) => q.eq(q.field('verified'), false))
			.first();

		if (!codeRecord) {
			return null;
		}

		const now = Date.now();
		const isExpired = now > codeRecord.expiresAt;

		return {
			code: codeRecord.code,
			isExpired,
			attempts: codeRecord.attempts,
			expiresAt: codeRecord.expiresAt
		};
	}
});

/**
 * PUBLIC ACTION: Create verification code and send email
 * This wraps the internal mutation + action for external HTTP clients
 */
// AUTH EXEMPT: Registration/login verification flow before session exists.
export const createAndSendVerificationCode = action({
	args: {
		sessionId: v.optional(v.string()),
		email: v.string(),
		type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change')),
		firstName: v.optional(v.string()),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string()),
		skipEmail: v.optional(v.boolean()) // Passed from SvelteKit server when E2E_TEST_MODE=true
	},
	handler: async (ctx, args) => {
		if (args.sessionId) {
			await validateSessionAndGetUserId(ctx, args.sessionId);
		}
		// 1. Create verification code
		const { code } = await ctx.runMutation(
			internal.infrastructure.auth.verification.createVerificationCodeInternal,
			{
				email: args.email,
				type: args.type,
				ipAddress: args.ipAddress,
				userAgent: args.userAgent
			}
		);

		// 2. Send verification email (skip in E2E test mode for performance)
		// E2E tests use the test helper endpoint to retrieve codes
		// Check both skipEmail parameter (from SvelteKit server) and process.env (for backwards compatibility)
		const shouldSkipEmail = args.skipEmail === true || process.env.E2E_TEST_MODE === 'true';

		if (!shouldSkipEmail) {
			await ctx.runAction(internal.infrastructure.email.sendVerificationEmail, {
				email: args.email,
				code,
				firstName: args.firstName
			});
		} else {
			console.log('🧪 E2E_TEST_MODE: Skipping email send, code:', code);
		}

		return { success: true };
	}
});

/**
 * INTERNAL MUTATION: Create verification code
 * Called by the public action above
 */
export const createVerificationCodeInternal = internalMutation({
	args: {
		email: v.string(),
		type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change')),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const expiresAt = now + 10 * 60 * 1000; // 10 minutes

		// Normalize email (lowercase + trim) for consistent storage and lookup
		const normalizedEmail = args.email.trim().toLowerCase();

		// Invalidate any existing unverified codes for this email+type
		const existingCodes = await ctx.db
			.query('verificationCodes')
			.withIndex('by_email_type', (q) => q.eq('email', normalizedEmail).eq('type', args.type))
			.filter((q) => q.eq(q.field('verified'), false))
			.collect();

		// Delete old unverified codes
		for (const code of existingCodes) {
			await ctx.db.delete(code._id);
		}

		// Generate new code
		const code = generateCode();

		// Store code in database
		await ctx.db.insert('verificationCodes', {
			email: normalizedEmail,
			code,
			type: args.type,
			attempts: 0,
			verified: false,
			createdAt: now,
			expiresAt,
			ipAddress: args.ipAddress,
			userAgent: args.userAgent
		});

		return { code };
	}
});
