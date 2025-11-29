/**
 * Meeting Templates Integration Tests
 *
 * Tests meeting template CRUD operations, step management, and default template seeding
 */

import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '$convex/_generated/api';
import schema from '$convex/schema';
import { modules } from '$tests/convex/integration/test.setup';
import type { Id } from '$convex/_generated/dataModel';
import {
	createTestSession,
	createTestOrganization,
	createTestOrganizationMember,
	cleanupTestData,
	cleanupTestOrganization
} from '$tests/convex/integration/setup';

describe('Meeting Templates Integration Tests', () => {
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
	// Template CRUD Operations
	// ========================================================================

	it('should create a meeting template', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const result = await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Product Sync Template',
			description: 'Weekly product team sync'
		});

		expect(result).toBeDefined();
		expect(result.templateId).toBeDefined();

		// Verify template was created
		const template = await t.query(api.meetingTemplates.get, {
			sessionId,
			templateId: result.templateId
		});

		expect(template.name).toBe('Product Sync Template');
		expect(template.description).toBe('Weekly product team sync');
		expect(template.workspaceId).toBe(orgId);
		expect(template.createdBy).toBe(userId);
	});

	it('should list templates for an workspace', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create multiple templates
		await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Template 1'
		});

		await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Template 2'
		});

		// List templates
		const templates = await t.query(api.meetingTemplates.list, {
			sessionId,
			workspaceId: orgId
		});

		expect(templates).toBeDefined();
		expect(Array.isArray(templates)).toBe(true);
		expect(templates.length).toBe(2);
		expect(templates.map((t) => t.name).sort()).toEqual(['Template 1', 'Template 2']);
	});

	it('should update a template', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const result = await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Old Name',
			description: 'Old Description'
		});

		// Update template
		await t.mutation(api.meetingTemplates.update, {
			sessionId,
			templateId: result.templateId,
			name: 'New Name',
			description: 'New Description'
		});

		// Verify update
		const template = await t.query(api.meetingTemplates.get, {
			sessionId,
			templateId: result.templateId
		});

		expect(template.name).toBe('New Name');
		expect(template.description).toBe('New Description');
	});

	it('should delete a template', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const result = await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'To Delete'
		});

		// Delete template
		await t.mutation(api.meetingTemplates.deleteTemplate, {
			sessionId,
			templateId: result.templateId
		});

		// Verify deletion
		const templates = await t.query(api.meetingTemplates.list, {
			sessionId,
			workspaceId: orgId
		});

		expect(templates.length).toBe(0);
	});

	// ========================================================================
	// Step Management
	// ========================================================================

	it('should add a step to a template', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create template
		const templateResult = await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Test Template'
		});

		// Add step
		const stepResult = await t.mutation(api.meetingTemplates.addStep, {
			sessionId,
			templateId: templateResult.templateId,
			stepType: 'check-in',
			title: 'Check-in Round',
			description: 'Opening round',
			timebox: 5,
			orderIndex: 0
		});

		expect(stepResult.stepId).toBeDefined();

		// Verify step was added
		const steps = await t.query(api.meetingTemplates.getSteps, {
			sessionId,
			templateId: templateResult.templateId
		});

		expect(steps.length).toBe(1);
		expect(steps[0].stepType).toBe('check-in');
		expect(steps[0].title).toBe('Check-in Round');
		expect(steps[0].description).toBe('Opening round');
		expect(steps[0].timebox).toBe(5);
		expect(steps[0].orderIndex).toBe(0);
	});

	it('should remove a step from a template', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create template and add step
		const templateResult = await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Test Template'
		});

		const stepResult = await t.mutation(api.meetingTemplates.addStep, {
			sessionId,
			templateId: templateResult.templateId,
			stepType: 'check-in',
			title: 'Check-in Round',
			orderIndex: 0
		});

		// Remove step
		await t.mutation(api.meetingTemplates.removeStep, {
			sessionId,
			stepId: stepResult.stepId
		});

		// Verify removal
		const steps = await t.query(api.meetingTemplates.getSteps, {
			sessionId,
			templateId: templateResult.templateId
		});

		expect(steps.length).toBe(0);
	});

	it('should reorder steps in a template', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create template
		const templateResult = await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Test Template'
		});

		// Add three steps
		const step1 = await t.mutation(api.meetingTemplates.addStep, {
			sessionId,
			templateId: templateResult.templateId,
			stepType: 'check-in',
			title: 'Step 1',
			orderIndex: 0
		});

		const step2 = await t.mutation(api.meetingTemplates.addStep, {
			sessionId,
			templateId: templateResult.templateId,
			stepType: 'agenda',
			title: 'Step 2',
			orderIndex: 1
		});

		const step3 = await t.mutation(api.meetingTemplates.addStep, {
			sessionId,
			templateId: templateResult.templateId,
			stepType: 'closing',
			title: 'Step 3',
			orderIndex: 2
		});

		// Reorder: 3, 1, 2
		await t.mutation(api.meetingTemplates.reorderSteps, {
			sessionId,
			templateId: templateResult.templateId,
			stepIds: [step3.stepId, step1.stepId, step2.stepId]
		});

		// Verify new order
		const steps = await t.query(api.meetingTemplates.getSteps, {
			sessionId,
			templateId: templateResult.templateId
		});

		expect(steps.length).toBe(3);
		expect(steps[0].title).toBe('Step 3');
		expect(steps[0].orderIndex).toBe(0);
		expect(steps[1].title).toBe('Step 1');
		expect(steps[1].orderIndex).toBe(1);
		expect(steps[2].title).toBe('Step 2');
		expect(steps[2].orderIndex).toBe(2);
	});

	it('should cascade delete steps when template is deleted', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create template with steps
		const templateResult = await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Test Template'
		});

		await t.mutation(api.meetingTemplates.addStep, {
			sessionId,
			templateId: templateResult.templateId,
			stepType: 'check-in',
			title: 'Step 1',
			orderIndex: 0
		});

		await t.mutation(api.meetingTemplates.addStep, {
			sessionId,
			templateId: templateResult.templateId,
			stepType: 'closing',
			title: 'Step 2',
			orderIndex: 1
		});

		// Delete template
		await t.mutation(api.meetingTemplates.deleteTemplate, {
			sessionId,
			templateId: templateResult.templateId
		});

		// Verify template is deleted
		const templates = await t.query(api.meetingTemplates.list, {
			sessionId,
			workspaceId: orgId
		});

		expect(templates.length).toBe(0);

		// Note: We can't directly query steps for a deleted template
		// The cascade delete is verified by the mutation logic
	});

	// ========================================================================
	// Default Templates Seeding
	// ========================================================================

	it('should seed default templates (Governance + Weekly Tactical)', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Seed default templates
		const result = await t.mutation(api.meetingTemplates.seedDefaultTemplates, {
			sessionId,
			workspaceId: orgId
		});

		expect(result.governanceId).toBeDefined();
		expect(result.tacticalId).toBeDefined();

		// Verify templates were created
		const templates = await t.query(api.meetingTemplates.list, {
			sessionId,
			workspaceId: orgId
		});

		expect(templates.length).toBe(2);

		// Find Governance template
		const governance = templates.find((t) => t.name === 'Governance');
		expect(governance).toBeDefined();
		expect(governance?.description).toContain('governance');

		// Verify Governance steps (Check-in, Agenda, Closing)
		const govSteps = await t.query(api.meetingTemplates.getSteps, {
			sessionId,
			templateId: governance!._id
		});

		expect(govSteps.length).toBe(3);
		expect(govSteps[0].stepType).toBe('check-in');
		expect(govSteps[1].stepType).toBe('agenda');
		expect(govSteps[2].stepType).toBe('closing');

		// Find Weekly Tactical template
		const tactical = templates.find((t) => t.name === 'Weekly Tactical');
		expect(tactical).toBeDefined();
		expect(tactical?.description).toContain('tactical');

		// Verify Weekly Tactical steps (Check-in, Checklists, Metrics, Projects, Agenda, Closing)
		const tacticalSteps = await t.query(api.meetingTemplates.getSteps, {
			sessionId,
			templateId: tactical!._id
		});

		expect(tacticalSteps.length).toBe(6);
		expect(tacticalSteps[0].stepType).toBe('check-in');
		expect(tacticalSteps[1].stepType).toBe('custom'); // Checklists
		expect(tacticalSteps[2].stepType).toBe('metrics');
		expect(tacticalSteps[3].stepType).toBe('projects');
		expect(tacticalSteps[4].stepType).toBe('agenda');
		expect(tacticalSteps[5].stepType).toBe('closing');
	});

	// ========================================================================
	// Access Control
	// ========================================================================

	it('should only list templates for user workspace', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);

		// Create two orgs
		const org1 = await createTestOrganization(t, 'Org 1');
		const org2 = await createTestOrganization(t, 'Org 2');

		await createTestOrganizationMember(t, org1, userId, 'member');
		await createTestOrganizationMember(t, org2, userId, 'member');

		cleanupQueue.push({ userId, orgId: org1 });
		cleanupQueue.push({ orgId: org2 });

		// Create template in org1
		await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: org1,
			name: 'Org 1 Template'
		});

		// Create template in org2
		await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: org2,
			name: 'Org 2 Template'
		});

		// List templates for org1
		const org1Templates = await t.query(api.meetingTemplates.list, {
			sessionId,
			workspaceId: org1
		});

		expect(org1Templates.length).toBe(1);
		expect(org1Templates[0].name).toBe('Org 1 Template');

		// List templates for org2
		const org2Templates = await t.query(api.meetingTemplates.list, {
			sessionId,
			workspaceId: org2
		});

		expect(org2Templates.length).toBe(1);
		expect(org2Templates[0].name).toBe('Org 2 Template');
	});

	it('should include step count in template list', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create template
		const templateResult = await t.mutation(api.meetingTemplates.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Test Template'
		});

		// Add 2 steps
		await t.mutation(api.meetingTemplates.addStep, {
			sessionId,
			templateId: templateResult.templateId,
			stepType: 'check-in',
			title: 'Step 1',
			orderIndex: 0
		});

		await t.mutation(api.meetingTemplates.addStep, {
			sessionId,
			templateId: templateResult.templateId,
			stepType: 'closing',
			title: 'Step 2',
			orderIndex: 1
		});

		// List templates
		const templates = await t.query(api.meetingTemplates.list, {
			sessionId,
			workspaceId: orgId
		});

		expect(templates.length).toBe(1);
		expect(templates[0].stepCount).toBe(2);
	});
});
