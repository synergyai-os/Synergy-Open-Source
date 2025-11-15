import { v } from 'convex/values';
import { mutation, query, action, internalMutation } from './_generated/server';
import { internal } from './_generated/api';

// Generate a random 6-digit code
function generateCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Verify a code
 * Returns success status and error message if failed
 */
export const verifyCode = mutation({
	args: {
		email: v.string(),
		code: v.string(),
		type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change'))
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// Find the code record by email and type (don't filter by code yet - need to track attempts)
		const verificationCode = await ctx.db
			.query('verificationCodes')
			.withIndex('by_email_type', (q) => q.eq('email', args.email).eq('type', args.type))
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

		// Check if code matches
		if (verificationCode.code !== args.code) {
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
export const cleanupExpiredCodes = mutation({
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
export const getCodeStatus = query({
	args: {
		email: v.string(),
		type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change'))
	},
	handler: async (ctx, args) => {
		const code = await ctx.db
			.query('verificationCodes')
			.withIndex('by_email_type', (q) => q.eq('email', args.email).eq('type', args.type))
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
export const getCodeForTesting = query({
	args: {
		email: v.string(),
		type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change'))
	},
	handler: async (ctx, args) => {
		const codeRecord = await ctx.db
			.query('verificationCodes')
			.withIndex('by_email_type', (q) => q.eq('email', args.email).eq('type', args.type))
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
export const createAndSendVerificationCode = action({
	args: {
		email: v.string(),
		type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change')),
		firstName: v.optional(v.string()),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		// 1. Create verification code
		const { code } = await ctx.runMutation(internal.verification.createVerificationCodeInternal, {
			email: args.email,
			type: args.type,
			ipAddress: args.ipAddress,
			userAgent: args.userAgent
		});

		// 2. Send verification email (skip in E2E test mode for performance)
		// E2E tests use the test helper endpoint to retrieve codes
		const isTestMode = process.env.E2E_TEST_MODE === 'true';

		if (!isTestMode) {
			await ctx.runAction(internal.email.sendVerificationEmail, {
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

		// Invalidate any existing unverified codes for this email+type
		const existingCodes = await ctx.db
			.query('verificationCodes')
			.withIndex('by_email_type', (q) => q.eq('email', args.email).eq('type', args.type))
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
			email: args.email,
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
