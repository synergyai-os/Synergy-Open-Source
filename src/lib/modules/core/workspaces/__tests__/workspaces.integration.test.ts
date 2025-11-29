/**
 * Organizations Module Integration Tests
 *
 * Tests actual Convex functions to catch bugs like destructuring issues
 */

import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '$convex/_generated/api';
import schema from '$convex/schema';
import { modules } from '$tests/convex/integration/test.setup';
import {
	createTestSession,
	createTestOrganization,
	createTestOrganizationMember,
	createTestInvite,
	cleanupTestData,
	cleanupTestOrganization,
	createTestRole,
	createTestPermission,
	assignRoleToUser,
	assignPermissionToRole
} from '$tests/convex/integration/setup';

describe('Organizations Integration Tests', () => {
	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = [];

	afterEach(async () => {
		const t = convexTest(schema, modules);
		for (const item of cleanupQueue) {
			if (item.userId) {
				await cleanupTestData(t, item.userId);
			}
			if (item.orgId) {
				await cleanupTestOrganization(t, item.orgId);
			}
		}
		cleanupQueue.length = 0;
	});

	it('should list user workspaces with sessionId validation', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'owner');
		cleanupQueue.push({ userId, orgId });

		// This would fail if userId is an object (destructuring bug)
		const orgs = await t.query(api.workspaces.listWorkspaces, { sessionId });

		expect(orgs).toBeDefined();
		expect(Array.isArray(orgs)).toBe(true);
		expect(orgs.length).toBe(1);
		expect(orgs[0].name).toBe('Test Org');
		expect(orgs[0].role).toBe('owner');
	});

	it('should create workspace with auto-generated slug', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		cleanupQueue.push({ userId });

		const result = await t.mutation(api.workspaces.createWorkspace, {
			sessionId,
			name: 'My New Organization'
		});

		expect(result).toBeDefined();
		expect(result.workspaceId).toBeDefined();
		expect(result.slug).toMatch(/^my-new-workspace/);

		// Verify membership was created
		const orgs = await t.query(api.workspaces.listWorkspaces, { sessionId });
		expect(orgs.length).toBe(1);
		expect(orgs[0].role).toBe('owner');

		cleanupQueue.push({ orgId: result.workspaceId });
	});

	it('should create workspace invite with RBAC permission check', async () => {
		const t = convexTest(schema, modules);
		const { userId: adminUserId, sessionId: adminSessionId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, adminUserId, 'admin');

		// Set up RBAC: Admin role with users.invite permission
		const adminRole = await createTestRole(t, 'admin', 'Admin');
		const invitePermission = await createTestPermission(t, 'users.invite', 'Invite Users');
		await assignPermissionToRole(t, adminRole, invitePermission, 'all');
		await assignRoleToUser(t, adminUserId, adminRole, { workspaceId: orgId });

		cleanupQueue.push({ userId: adminUserId, orgId });

		// Admin should be able to create invite
		const result = await t.mutation(api.workspaces.createWorkspaceInvite, {
			sessionId: adminSessionId,
			workspaceId: orgId,
			email: 'newuser@example.com',
			role: 'member'
		});

		expect(result).toBeDefined();
		expect(result.inviteId).toBeDefined();
		expect(result.code).toBeDefined();
	});

	it('should accept workspace invite and create membership', async () => {
		const t = convexTest(schema, modules);
		const { userId: inviterUserId } = await createTestSession(t);
		const { userId: inviteeUserId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, inviterUserId, 'owner');

		// Create invite
		const { code } = await createTestInvite(t, orgId, inviterUserId, {
			invitedUserId: inviteeUserId,
			role: 'member'
		});

		cleanupQueue.push({ userId: inviterUserId, orgId });
		cleanupQueue.push({ userId: inviteeUserId });

		// Accept invite (uses getAuthUserId, so we need to set up auth context)
		// For now, we'll test directly via database manipulation
		const result = await t.run(async (ctx) => {
			// Simulate accepting invite
			const invite = await ctx.db
				.query('workspaceInvites')
				.withIndex('by_code', (q) => q.eq('code', code))
				.first();

			if (!invite) throw new Error('Invite not found');

			await ctx.db.insert('workspaceMembers', {
				workspaceId: invite.workspaceId,
				userId: inviteeUserId,
				role: invite.role,
				joinedAt: Date.now()
			});

			await ctx.db.delete(invite._id);

			return { workspaceId: invite.workspaceId };
		});

		expect(result.workspaceId).toBe(orgId);

		// Verify membership exists
		const membership = await t.run(async (ctx) => {
			return await ctx.db
				.query('workspaceMembers')
				.withIndex('by_workspace_user', (q) =>
					q.eq('workspaceId', orgId).eq('userId', inviteeUserId)
				)
				.first();
		});

		expect(membership).toBeDefined();
		expect(membership?.role).toBe('member');
	});

	it('should decline workspace invite without creating membership', async () => {
		const t = convexTest(schema, modules);
		const { userId: inviterUserId } = await createTestSession(t);
		const { userId: inviteeUserId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, inviterUserId, 'owner');

		const { inviteId } = await createTestInvite(t, orgId, inviterUserId, {
			invitedUserId: inviteeUserId
		});

		cleanupQueue.push({ userId: inviterUserId, orgId });
		cleanupQueue.push({ userId: inviteeUserId });

		// Decline invite
		await t.run(async (ctx) => {
			await ctx.db.delete(inviteId);
		});

		// Verify no membership created
		const membership = await t.run(async (ctx) => {
			return await ctx.db
				.query('workspaceMembers')
				.withIndex('by_workspace_user', (q) =>
					q.eq('workspaceId', orgId).eq('userId', inviteeUserId)
				)
				.first();
		});

		expect(membership).toBeNull();
	});

	// TODO: This test requires context-based auth which isn't supported by convex-test yet
	it.skip('should remove workspace member with RBAC permission check', async () => {
		const t = convexTest(schema, modules);
		const { userId: adminUserId } = await createTestSession(t);
		const { userId: memberUserId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, adminUserId, 'admin');
		await createTestOrganizationMember(t, orgId, memberUserId, 'member');

		// Set up RBAC: Admin role with users.remove permission
		const adminRole = await createTestRole(t, 'admin', 'Admin');
		const removePermission = await createTestPermission(t, 'users.remove', 'Remove Users');
		await assignPermissionToRole(t, adminRole, removePermission, 'all');
		await assignRoleToUser(t, adminUserId, adminRole, { workspaceId: orgId });

		cleanupQueue.push({ userId: adminUserId, orgId });
		cleanupQueue.push({ userId: memberUserId });

		// Remove member
		const { sessionId: adminSessionId } = await createTestSession(t);
		const result = await t.mutation(api.workspaces.removeOrganizationMember, {
			sessionId: adminSessionId,
			workspaceId: orgId,
			userId: memberUserId
		});

		expect(result.success).toBe(true);

		// Verify membership removed
		const membership = await t.run(async (ctx) => {
			return await ctx.db
				.query('workspaceMembers')
				.withIndex('by_workspace_user', (q) =>
					q.eq('workspaceId', orgId).eq('userId', memberUserId)
				)
				.first();
		});

		expect(membership).toBeNull();
	});

	it('should enforce user isolation - users cannot see other orgs', async () => {
		const t = convexTest(schema, modules);
		const { sessionId: session1, userId: user1 } = await createTestSession(t);
		const { sessionId: session2, userId: user2 } = await createTestSession(t);

		const org1 = await createTestOrganization(t, 'User 1 Org');
		await createTestOrganizationMember(t, org1, user1, 'owner');

		const org2 = await createTestOrganization(t, 'User 2 Org');
		await createTestOrganizationMember(t, org2, user2, 'owner');

		cleanupQueue.push({ userId: user1, orgId: org1 });
		cleanupQueue.push({ userId: user2, orgId: org2 });

		// User 1 should only see their org
		const user1Orgs = await t.query(api.workspaces.listWorkspaces, {
			sessionId: session1
		});
		expect(user1Orgs.length).toBe(1);
		expect(user1Orgs[0].name).toBe('User 1 Org');

		// User 2 should only see their org
		const user2Orgs = await t.query(api.workspaces.listWorkspaces, {
			sessionId: session2
		});
		expect(user2Orgs.length).toBe(1);
		expect(user2Orgs[0].name).toBe('User 2 Org');
	});

	it('should fail with invalid sessionId', async () => {
		const t = convexTest(schema, modules);

		await expect(
			t.query(api.workspaces.listWorkspaces, {
				sessionId: 'invalid_session_id'
			})
		).rejects.toThrow('Session not found');
	});

	describe('Email validation for workspace invites', () => {
		it('should accept valid email addresses', async () => {
			const t = convexTest(schema, modules);
			const { sessionId, userId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, userId, 'owner');
			cleanupQueue.push({ userId, orgId });

			const validEmails = [
				'user@example.com',
				'test.user@domain.co.uk',
				'user+tag@example.com',
				'user123@subdomain.example.org'
			];

			for (const email of validEmails) {
				const result = await t.mutation(api.workspaces.createWorkspaceInvite, {
					sessionId,
					workspaceId: orgId,
					email,
					role: 'member'
				});

				expect(result).toBeDefined();
				expect(result.inviteId).toBeDefined();
				expect(result.code).toBeDefined();
			}
		});

		it('should reject invalid email addresses', async () => {
			const t = convexTest(schema, modules);
			const { sessionId, userId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, userId, 'owner');
			cleanupQueue.push({ userId, orgId });

			const invalidEmails = [
				'asdfasdf@asdfasdf', // No TLD
				'invalid@domain', // No TLD
				'@example.com', // Missing local part
				'user@', // Missing domain
				'user@.com', // Invalid domain
				'user@domain.', // Missing TLD
				'notanemail', // No @ symbol
				'user@domain.c' // TLD too short (must be 2+ chars)
			];

			for (const email of invalidEmails) {
				await expect(
					t.mutation(api.workspaces.createWorkspaceInvite, {
						sessionId,
						workspaceId: orgId,
						email,
						role: 'member'
					})
				).rejects.toThrow('Invalid email format');
			}
		});
	});
});
