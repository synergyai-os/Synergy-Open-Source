import path from 'node:path';
import { RuleTester } from 'eslint';
import rule from '../no-legacy-auth-patterns.js';

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2022,
		sourceType: 'module'
	}
});

const convexFilePath = path.join(process.cwd(), 'convex/features/example.ts');

ruleTester.run('no-legacy-auth-patterns', rule, {
	valid: [
		{
			name: 'public endpoint with only sessionId arg',
			filename: convexFilePath,
			code: `
				import { query } from '../_generated/server';
				import { v } from 'convex/values';

				export const myQuery = query({
					args: { sessionId: v.string() },
					handler: async (ctx, args) => args.sessionId
				});
			`
		},
		{
			name: 'allowed whitelisted target',
			filename: convexFilePath,
			code: `
				import { mutation } from '../_generated/server';
				import { v } from 'convex/values';

				export const assignTask = mutation({
					args: { sessionId: v.string(), assigneeUserId: v.id('users') },
					handler: async (ctx, args) => args.assigneeUserId
				});
			`
		},
		{
			name: 'internal endpoint exempt from auth arg rules',
			filename: convexFilePath,
			code: `
				import { internalMutation } from '../_generated/server';
				import { v } from 'convex/values';

				export const internalAssign = internalMutation({
					args: { userId: v.id('users') },
					handler: async (ctx, args) => args.userId
				});
			`
		}
	],
	invalid: [
		{
			name: 'missing sessionId arg',
			filename: convexFilePath,
			code: `
				import { query } from '../_generated/server';
				import { v } from 'convex/values';

				export const listItems = query({
					args: { workspaceId: v.id('workspaces') },
					handler: async (ctx, args) => args.workspaceId
				});
			`,
			errors: [{ messageId: 'missingSessionId' }]
		},
		{
			name: 'userId arg blocked in public endpoint',
			filename: convexFilePath,
			code: `
				import { mutation } from '../_generated/server';
				import { v } from 'convex/values';

				export const doThing = mutation({
					args: { sessionId: v.string(), userId: v.id('users') },
					handler: async (ctx, args) => args.userId
				});
			`,
			errors: [{ messageId: 'userIdArg' }]
		},
		{
			name: 'non-whitelisted target identifier rejected',
			filename: convexFilePath,
			code: `
				import { action } from '../_generated/server';
				import { v } from 'convex/values';

				export const updateTarget = action({
					args: { sessionId: v.string(), targetUserId: v.id('users') },
					handler: async (ctx, args) => args.targetUserId
				});
			`,
			errors: [{ messageId: 'targetArgNotAllowed' }]
		},
		{
			name: 'legacy helper blocked',
			filename: convexFilePath,
			code: `
				import { query } from '../_generated/server';
				import { v } from 'convex/values';

				export const legacyQuery = query({
					args: { sessionId: v.string() },
					handler: async (ctx, args) => getAuthUserId(ctx)
				});
			`,
			errors: [{ messageId: 'legacyHelper' }]
		}
	]
});
