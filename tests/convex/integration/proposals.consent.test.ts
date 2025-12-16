/**
 * Consent Process Behavior Tests
 *
 * Tests the proposal state machine, authorization rules, and side effects
 * for the consent-based governance workflow.
 *
 * @see SYOS-694
 */

import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '$convex/_generated/api';
import schema from '$convex/schema';
import { modules } from './test.setup';
import type { Id } from '$convex/_generated/dataModel';
import {
	createTestSession,
	createTestOrganization,
	createTestOrganizationMember,
	createTestCircle,
	cleanupTestData,
	cleanupTestOrganization,
	getPersonIdForUser
} from './setup';

async function assignCircleLead(
	t: ReturnType<typeof convexTest>,
	circleId: Id<'circles'>,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
) {
	await t.run(async (ctx) => {
		const circle = await ctx.db.get(circleId);
		const person =
			(await ctx.db
				.query('people')
				.withIndex('by_workspace_user', (q) =>
					q.eq('workspaceId', workspaceId).eq('userId', userId)
				)
				.first()) ?? null;
		const personId = (person?._id ?? userId) as Id<'people'>;
		const leadName =
			circle?.circleType === 'empowered_team'
				? 'Coordinator'
				: circle?.circleType === 'guild'
					? 'Steward'
					: 'Circle Lead';

		const existingMembership = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_person', (q) => q.eq('circleId', circleId).eq('personId', personId))
			.first();
		if (!existingMembership) {
			await ctx.db.insert('circleMembers', {
				circleId,
				personId,
				joinedAt: Date.now(),
				archivedAt: undefined
			});
		}

		const roleId = await ctx.db.insert('circleRoles', {
			circleId,
			workspaceId,
			name: leadName,
			status: 'active',
			isHiring: false,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			archivedAt: undefined,
			templateId: undefined
		});

		await ctx.db.insert('userCircleRoles', {
			personId,
			circleRoleId: roleId,
			assignedAt: Date.now(),
			assignedByPersonId: personId,
			updatedAt: Date.now(),
			updatedByPersonId: personId,
			archivedAt: undefined
		});
	});
}

describe('Consent Process', () => {
	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = [];

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

	// ========================================================================
	// State Transitions
	// ========================================================================

	describe('State Transitions', () => {
		it('should transition draft → submitted when evolutions exist', async () => {
			const t = convexTest(schema, modules);
			const { sessionId, userId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, userId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId, orgId });

			// Create proposal
			const { proposalId } = await t.mutation(api.core.proposals.index.create, {
				sessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Update Circle Name',
				description: 'Change circle name to "Updated Circle"'
			});

			// Add evolution
			await t.mutation(api.core.proposals.index.addEvolution, {
				sessionId,
				proposalId,
				fieldPath: 'name',
				fieldLabel: 'Name',
				beforeValue: JSON.stringify('Test Circle'),
				afterValue: JSON.stringify('Updated Circle'),
				changeType: 'update'
			});

			// Create meeting template and meeting
			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Submit proposal
			await t.mutation(api.core.proposals.index.submit, {
				sessionId,
				proposalId,
				meetingId: meetingResult.meetingId
			});

			// Verify status is 'submitted'
			const proposal = await t.query(api.core.proposals.index.get, {
				sessionId,
				proposalId
			});

			expect(proposal).toBeDefined();
			expect(proposal?.status).toBe('submitted');
		});

		it('should reject submission without evolutions', async () => {
			const t = convexTest(schema, modules);
			const { sessionId, userId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, userId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId, orgId });

			// Create proposal (no evolutions)
			const { proposalId } = await t.mutation(api.core.proposals.index.create, {
				sessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Empty Proposal',
				description: 'Proposal with no changes'
			});

			// Create meeting template and meeting
			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Attempt submit (should fail)
			await expect(
				t.mutation(api.core.proposals.index.submit, {
					sessionId,
					proposalId,
					meetingId: meetingResult.meetingId
				})
			).rejects.toThrow('Proposal must have at least one proposed change');
		});

		it('should transition submitted → in_meeting when imported to meeting', async () => {
			const t = convexTest(schema, modules);
			const { sessionId, userId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, userId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId, orgId });

			// Create proposal using createFromDiff (creates in 'submitted' status without meeting link)
			const { proposalId } = await t.mutation(api.core.proposals.index.createFromDiff, {
				sessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Update Circle Name',
				description: 'Change circle name',
				editedValues: {
					name: 'Updated Circle'
				}
			});

			// Create meeting template and meeting
			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Import Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Import to meeting (transitions submitted → in_meeting)
			await t.mutation(api.core.proposals.index.importToMeeting, {
				sessionId,
				meetingId: meetingResult.meetingId,
				proposalIds: [proposalId]
			});

			// Verify status is 'in_meeting'
			const proposal = await t.query(api.core.proposals.index.get, {
				sessionId,
				proposalId
			});

			expect(proposal).toBeDefined();
			expect(proposal?.status).toBe('in_meeting');
			expect(proposal?.meetingId).toBe(meetingResult.meetingId);
		});

		it('should transition in_meeting → approved and apply changes', async () => {
			const t = convexTest(schema, modules);
			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t);
			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, creatorId, 'member');
			await createTestOrganizationMember(t, orgId, recorderId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId });

			// Create proposal using createFromDiff (creates in 'submitted' status)
			const { proposalId } = await t.mutation(api.core.proposals.index.createFromDiff, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Update Circle Name',
				description: 'Change circle name to "Updated Circle"',
				editedValues: {
					name: 'Updated Circle'
				}
			});

			// Create meeting template and meeting
			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Import to meeting (transitions submitted → in_meeting)
			await t.mutation(api.core.proposals.index.importToMeeting, {
				sessionId: creatorSessionId,
				meetingId: meetingResult.meetingId,
				proposalIds: [proposalId]
			});

			// Ensure recorder has circle authority
			await assignCircleLead(t, circleId, orgId, recorderId);

			// Add recorder as attendee (required before starting meeting)
			await t.run(async (ctx) => {
				await ctx.db.insert('meetingAttendees', {
					meetingId: meetingResult.meetingId,
					userId: recorderId,
					attendanceType: 'required',
					status: 'accepted',
					createdAt: Date.now()
				});
			});

			// Start meeting (sets recorderId automatically)
			await t.mutation(api.features.meetings.meetings.startMeeting, {
				sessionId: recorderSessionId,
				meetingId: meetingResult.meetingId
			});

			// Approve as recorder
			const approveResult = await t.mutation(api.core.proposals.index.approve, {
				sessionId: recorderSessionId,
				proposalId
			});

			// Verify proposal status is 'approved'
			const proposal = await t.query(api.core.proposals.index.get, {
				sessionId: creatorSessionId,
				proposalId
			});

			expect(proposal).toBeDefined();
			expect(proposal?.status).toBe('approved');
			expect(approveResult.versionHistoryId).toBeDefined();

			// Verify circle name was updated
			const circle = await t.run(async (ctx) => {
				return await ctx.db.get(circleId);
			});

			expect(circle).toBeDefined();
			expect(circle?.name).toBe('Updated Circle');
		});

		it('should transition in_meeting → rejected and not apply changes', async () => {
			const t = convexTest(schema, modules);
			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t);
			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, creatorId, 'member');
			await createTestOrganizationMember(t, orgId, recorderId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			// Use consent-based model to allow objections
			await t.run(async (ctx) => {
				await ctx.db.patch(circleId, { circleType: 'empowered_team' });
			});

			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId });

			// Create proposal using createFromDiff (creates in 'submitted' status)
			const { proposalId } = await t.mutation(api.core.proposals.index.createFromDiff, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Update Circle Name',
				description: 'Change circle name',
				editedValues: {
					name: 'Rejected Circle'
				}
			});

			// Create meeting template and meeting
			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Import to meeting (transitions submitted → in_meeting)
			await t.mutation(api.core.proposals.index.importToMeeting, {
				sessionId: creatorSessionId,
				meetingId: meetingResult.meetingId,
				proposalIds: [proposalId]
			});

			// Ensure recorder has circle authority
			await assignCircleLead(t, circleId, orgId, recorderId);

			// Add recorder as attendee (required before starting meeting)
			await t.run(async (ctx) => {
				await ctx.db.insert('meetingAttendees', {
					meetingId: meetingResult.meetingId,
					userId: recorderId,
					attendanceType: 'required',
					status: 'accepted',
					createdAt: Date.now()
				});
			});

			// Start meeting (sets recorderId automatically)
			await t.mutation(api.features.meetings.meetings.startMeeting, {
				sessionId: recorderSessionId,
				meetingId: meetingResult.meetingId
			});

			// Reject as recorder
			await t.mutation(api.core.proposals.index.reject, {
				sessionId: recorderSessionId,
				proposalId
			});

			// Verify proposal status is 'rejected'
			const proposal = await t.query(api.core.proposals.index.get, {
				sessionId: creatorSessionId,
				proposalId
			});

			expect(proposal).toBeDefined();
			expect(proposal?.status).toBe('rejected');

			// Verify circle name was NOT updated
			const circle = await t.run(async (ctx) => {
				return await ctx.db.get(circleId);
			});

			expect(circle).toBeDefined();
			expect(circle?.name).toBe('Test Circle'); // Original name unchanged
		});

		it('should allow withdrawal from non-terminal states', async () => {
			const t = convexTest(schema, modules);
			const { sessionId, userId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, userId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId, orgId });

			// Create proposal
			const { proposalId } = await t.mutation(api.core.proposals.index.create, {
				sessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Update Circle Name',
				description: 'Change circle name'
			});

			await t.mutation(api.core.proposals.index.addEvolution, {
				sessionId,
				proposalId,
				fieldPath: 'name',
				fieldLabel: 'Name',
				beforeValue: JSON.stringify('Test Circle'),
				afterValue: JSON.stringify('Updated Circle'),
				changeType: 'update'
			});

			// Create meeting template and meeting
			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Submit proposal
			await t.mutation(api.core.proposals.index.submit, {
				sessionId,
				proposalId,
				meetingId: meetingResult.meetingId
			});

			// Withdraw from 'submitted' state
			await t.mutation(api.core.proposals.index.withdraw, {
				sessionId,
				proposalId
			});

			// Verify status is 'withdrawn'
			const proposal = await t.query(api.core.proposals.index.get, {
				sessionId,
				proposalId
			});

			expect(proposal).toBeDefined();
			expect(proposal?.status).toBe('withdrawn');
		});

		it('should reject withdrawal from terminal states', async () => {
			const t = convexTest(schema, modules);
			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t);
			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, creatorId, 'member');
			await createTestOrganizationMember(t, orgId, recorderId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			// Use lead_decides model to allow approval
			await t.run(async (ctx) => {
				await ctx.db.patch(circleId, { circleType: 'hierarchy' });
			});

			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId });

			// Create proposal using createFromDiff (creates in 'submitted' status)
			const { proposalId } = await t.mutation(api.core.proposals.index.createFromDiff, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Update Circle Name',
				description: 'Change circle name',
				editedValues: {
					name: 'Updated Circle'
				}
			});

			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Import to meeting (transitions submitted → in_meeting)
			await t.mutation(api.core.proposals.index.importToMeeting, {
				sessionId: creatorSessionId,
				meetingId: meetingResult.meetingId,
				proposalIds: [proposalId]
			});

			// Ensure recorder has circle authority
			await assignCircleLead(t, circleId, orgId, recorderId);

			// Add recorder as attendee (required before starting meeting)
			await t.run(async (ctx) => {
				await ctx.db.insert('meetingAttendees', {
					meetingId: meetingResult.meetingId,
					userId: recorderId,
					attendanceType: 'required',
					status: 'accepted',
					createdAt: Date.now()
				});
			});

			// Start meeting (sets recorderId automatically)
			await t.mutation(api.features.meetings.meetings.startMeeting, {
				sessionId: recorderSessionId,
				meetingId: meetingResult.meetingId
			});

			await t.mutation(api.core.proposals.index.approve, {
				sessionId: recorderSessionId,
				proposalId
			});

			// Attempt withdraw from 'approved' state (should fail)
			await expect(
				t.mutation(api.core.proposals.index.withdraw, {
					sessionId: creatorSessionId,
					proposalId
				})
			).rejects.toThrow('Cannot withdraw a proposal that has already been finalized');
		});
	});

	// ========================================================================
	// Authorization
	// ========================================================================

	describe('Authorization', () => {
		it('should allow any workspace member to create proposals', async () => {
			const t = convexTest(schema, modules);
			const { sessionId, userId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, userId, 'member'); // Regular member, not admin
			const personId = await getPersonIdForUser(t, orgId, userId);
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId, orgId });

			// Create proposal as regular member
			const result = await t.mutation(api.core.proposals.index.create, {
				sessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Test Proposal',
				description: 'Test description'
			});

			expect(result.proposalId).toBeDefined();

			// Verify proposal was created
			const proposal = await t.query(api.core.proposals.index.get, {
				sessionId,
				proposalId: result.proposalId
			});

			expect(proposal).toBeDefined();
			expect(proposal?.createdByPersonId).toBe(personId);
		});

		it('should only allow proposal creator to add evolutions (in draft)', async () => {
			const t = convexTest(schema, modules);
			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t);
			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, creatorId, 'member');
			await createTestOrganizationMember(t, orgId, otherId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId: creatorId }, { userId: otherId }, { orgId });

			// Creator creates proposal
			const { proposalId } = await t.mutation(api.core.proposals.index.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Test Proposal',
				description: 'Test description'
			});

			// Other user attempts to add evolution (should fail)
			await expect(
				t.mutation(api.core.proposals.index.addEvolution, {
					sessionId: otherSessionId,
					proposalId,
					fieldPath: 'name',
					fieldLabel: 'Name',
					beforeValue: JSON.stringify('Test Circle'),
					afterValue: JSON.stringify('Updated Circle'),
					changeType: 'update'
				})
			).rejects.toThrow('Only the proposal creator can add evolutions');
		});

		it('should only allow proposal creator to submit', async () => {
			const t = convexTest(schema, modules);
			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t);
			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, creatorId, 'member');
			await createTestOrganizationMember(t, orgId, otherId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId: creatorId }, { userId: otherId }, { orgId });

			// Creator creates proposal with evolution
			const { proposalId } = await t.mutation(api.core.proposals.index.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Test Proposal',
				description: 'Test description'
			});

			await t.mutation(api.core.proposals.index.addEvolution, {
				sessionId: creatorSessionId,
				proposalId,
				fieldPath: 'name',
				fieldLabel: 'Name',
				beforeValue: JSON.stringify('Test Circle'),
				afterValue: JSON.stringify('Updated Circle'),
				changeType: 'update'
			});

			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Other user attempts to submit (should fail)
			await expect(
				t.mutation(api.core.proposals.index.submit, {
					sessionId: otherSessionId,
					proposalId,
					meetingId: meetingResult.meetingId
				})
			).rejects.toThrow('Only the proposal creator can submit');
		});

		it('should only allow meeting recorder to approve', async () => {
			const t = convexTest(schema, modules);
			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t);
			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t);
			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, creatorId, 'member');
			await createTestOrganizationMember(t, orgId, recorderId, 'member');
			await createTestOrganizationMember(t, orgId, otherId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push(
				{ userId: creatorId },
				{ userId: recorderId },
				{ userId: otherId },
				{ orgId }
			);

			// Create proposal using createFromDiff (creates in 'submitted' status)
			const { proposalId } = await t.mutation(api.core.proposals.index.createFromDiff, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Test Proposal',
				description: 'Test description',
				editedValues: {
					name: 'Updated Circle'
				}
			});

			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Import to meeting (transitions submitted → in_meeting)
			await t.mutation(api.core.proposals.index.importToMeeting, {
				sessionId: creatorSessionId,
				meetingId: meetingResult.meetingId,
				proposalIds: [proposalId]
			});

			// Set recorder
			// Add recorder as attendee (required before starting meeting)
			await t.run(async (ctx) => {
				await ctx.db.insert('meetingAttendees', {
					meetingId: meetingResult.meetingId,
					userId: recorderId,
					attendanceType: 'required',
					status: 'accepted',
					createdAt: Date.now()
				});
			});

			// Start meeting (sets recorderId automatically)
			await t.mutation(api.features.meetings.meetings.startMeeting, {
				sessionId: recorderSessionId,
				meetingId: meetingResult.meetingId
			});

			// Other user (not recorder) attempts to approve (should fail)
			await expect(
				t.mutation(api.core.proposals.index.approve, {
					sessionId: otherSessionId,
					proposalId
				})
			).rejects.toThrow('Only the meeting recorder can approve proposals');
		});

		it('should only allow proposal creator to withdraw', async () => {
			const t = convexTest(schema, modules);
			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t);
			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, creatorId, 'member');
			await createTestOrganizationMember(t, orgId, otherId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId: creatorId }, { userId: otherId }, { orgId });

			// Creator creates proposal
			const { proposalId } = await t.mutation(api.core.proposals.index.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Test Proposal',
				description: 'Test description'
			});

			await t.mutation(api.core.proposals.index.addEvolution, {
				sessionId: creatorSessionId,
				proposalId,
				fieldPath: 'name',
				fieldLabel: 'Name',
				beforeValue: JSON.stringify('Test Circle'),
				afterValue: JSON.stringify('Updated Circle'),
				changeType: 'update'
			});

			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			await t.mutation(api.core.proposals.index.submit, {
				sessionId: creatorSessionId,
				proposalId,
				meetingId: meetingResult.meetingId
			});

			// Other user attempts to withdraw (should fail)
			await expect(
				t.mutation(api.core.proposals.index.withdraw, {
					sessionId: otherSessionId,
					proposalId
				})
			).rejects.toThrow('Only the proposal creator can withdraw');
		});
	});

	// ========================================================================
	// Version History
	// ========================================================================

	describe('Version History', () => {
		it('should create version history entry on approval', async () => {
			const t = convexTest(schema, modules);
			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t);
			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, creatorId, 'member');
			await createTestOrganizationMember(t, orgId, recorderId, 'member');
			const recorderPersonId = await getPersonIdForUser(t, orgId, recorderId);
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId });

			// Create proposal using createFromDiff (creates in 'submitted' status)
			const { proposalId } = await t.mutation(api.core.proposals.index.createFromDiff, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Update Circle Name',
				description: 'Change circle name',
				editedValues: {
					name: 'Updated Circle'
				}
			});

			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Import to meeting (transitions submitted → in_meeting)
			await t.mutation(api.core.proposals.index.importToMeeting, {
				sessionId: creatorSessionId,
				meetingId: meetingResult.meetingId,
				proposalIds: [proposalId]
			});

			// Ensure recorder has circle authority
			await assignCircleLead(t, circleId, orgId, recorderId);

			// Add recorder as attendee (required before starting meeting)
			await t.run(async (ctx) => {
				await ctx.db.insert('meetingAttendees', {
					meetingId: meetingResult.meetingId,
					userId: recorderId,
					attendanceType: 'required',
					status: 'accepted',
					createdAt: Date.now()
				});
			});

			// Start meeting (sets recorderId automatically)
			await t.mutation(api.features.meetings.meetings.startMeeting, {
				sessionId: recorderSessionId,
				meetingId: meetingResult.meetingId
			});

			// Approve proposal
			const approveResult = await t.mutation(api.core.proposals.index.approve, {
				sessionId: recorderSessionId,
				proposalId
			});

			expect(approveResult.versionHistoryId).toBeDefined();

			// Verify version history entry exists
			const versionHistory = await t.run(async (ctx) => {
				return await ctx.db.get(approveResult.versionHistoryId);
			});

			expect(versionHistory).toBeDefined();
			expect(versionHistory?.entityType).toBe('circle');
			expect(versionHistory?.entityId).toBe(circleId);
			expect(versionHistory?.changeType).toBe('update');
			expect(versionHistory?.changedByPersonId).toBe(recorderPersonId);
			expect(versionHistory?.changeDescription).toContain('Approved via proposal');

			// Verify proposal references version history
			const proposal = await t.query(api.core.proposals.index.get, {
				sessionId: creatorSessionId,
				proposalId
			});

			expect(proposal?.versionHistoryEntryId).toBe(approveResult.versionHistoryId);
		});

		it('should regenerate slug when circle name changes', async () => {
			const t = convexTest(schema, modules);
			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t);
			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t);
			const orgId = await createTestOrganization(t, 'Test Org');
			await createTestOrganizationMember(t, orgId, creatorId, 'member');
			await createTestOrganizationMember(t, orgId, recorderId, 'member');
			const circleId = await createTestCircle(t, orgId, 'Test Circle');

			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId });

			// Get original slug
			const originalCircle = await t.run(async (ctx) => {
				return await ctx.db.get(circleId);
			});
			const originalSlug = originalCircle?.slug;

			// Create proposal using createFromDiff (creates in 'submitted' status)
			const { proposalId } = await t.mutation(api.core.proposals.index.createFromDiff, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				entityType: 'circle',
				entityId: circleId,
				title: 'Update Circle Name',
				description: 'Change circle name to "New Circle Name"',
				editedValues: {
					name: 'New Circle Name'
				}
			});

			const templateResult = await t.mutation(api.features.meetings.templates.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				name: 'Test Template',
				description: 'Test template'
			});

			const meetingResult = await t.mutation(api.features.meetings.meetings.create, {
				sessionId: creatorSessionId,
				workspaceId: orgId,
				circleId,
				templateId: templateResult.templateId,
				title: 'Test Meeting',
				startTime: Date.now() + 86400000,
				duration: 60,
				visibility: 'public'
			});

			// Import to meeting (transitions submitted → in_meeting)
			await t.mutation(api.core.proposals.index.importToMeeting, {
				sessionId: creatorSessionId,
				meetingId: meetingResult.meetingId,
				proposalIds: [proposalId]
			});

			// Ensure recorder has circle authority
			await assignCircleLead(t, circleId, orgId, recorderId);

			// Add recorder as attendee (required before starting meeting)
			await t.run(async (ctx) => {
				await ctx.db.insert('meetingAttendees', {
					meetingId: meetingResult.meetingId,
					userId: recorderId,
					attendanceType: 'required',
					status: 'accepted',
					createdAt: Date.now()
				});
			});

			// Start meeting (sets recorderId automatically)
			await t.mutation(api.features.meetings.meetings.startMeeting, {
				sessionId: recorderSessionId,
				meetingId: meetingResult.meetingId
			});

			// Approve proposal
			await t.mutation(api.core.proposals.index.approve, {
				sessionId: recorderSessionId,
				proposalId
			});

			// Verify slug was regenerated
			const updatedCircle = await t.run(async (ctx) => {
				return await ctx.db.get(circleId);
			});

			expect(updatedCircle).toBeDefined();
			expect(updatedCircle?.name).toBe('New Circle Name');
			expect(updatedCircle?.slug).toBeDefined();
			expect(updatedCircle?.slug).not.toBe(originalSlug);
			expect(updatedCircle?.slug).toContain('new-circle-name'); // Slugified version
		});
	});
});
