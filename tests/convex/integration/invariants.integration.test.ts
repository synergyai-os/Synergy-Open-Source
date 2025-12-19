import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '$convex/_generated/api';
import schema from '$convex/schema';
import { modules } from './test.setup';

describe('Admin invariants runner', () => {
	it('passes critical invariants on a clean dataset', async () => {
		const t = convexTest(schema, modules);

		const result = await t.action(api.admin.invariants.runAll, {
			severityFilter: 'critical'
		});

		expect(result.criticalsPassed).toBe(true);
		expect(result.summary.criticalFailed).toBe(0);
	});

	it('detects identity denormalization issues', async () => {
		const t = convexTest(schema, modules);
		const now = Date.now();

		const workspaceId = await t.run(async (ctx) => {
			return await ctx.db.insert('workspaces', {
				name: 'Invariant Test Workspace',
				slug: `invariant-test-${now}`,
				plan: 'starter',
				createdAt: now,
				updatedAt: now
			});
		});

		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert('users', {
				workosId: `workos-${now}`,
				email: 'denorm@example.com',
				emailVerified: true,
				firstName: 'Invariant',
				lastName: 'User',
				name: 'Invariant User',
				createdAt: now,
				updatedAt: now
			});
		});

		await t.run(async (ctx) => {
			await ctx.db.insert('people', {
				workspaceId,
				userId,
				email: 'denorm@example.com', // intentional denormalization
				displayName: 'Invariant Owner',
				workspaceRole: 'owner',
				status: 'active',
				createdAt: now,
				invitedAt: now,
				invitedBy: undefined,
				joinedAt: now,
				archivedAt: undefined,
				archivedBy: undefined
			});
		});

		const result = await t.action(api.admin.invariants.runAll, { category: 'IDENT' });
		const ident03 = result.results.find((r) => r.id === 'IDENT-03');

		expect(result.criticalsPassed).toBe(true);
		expect(ident03?.passed).toBe(false);
		expect(ident03?.violationCount).toBeGreaterThan(0);
	});
});
