/**
 * Seed Org Chart Test Data
 *
 * Creates a nested hierarchy of circles with roles for testing the org chart visualization.
 * Structure:
 * - Root Circle (1 circle)
 *   - Sub Circle Level 1 (2-3 circles)
 *     - Sub Circle Level 2 (2-3 circles per parent)
 *
 * Each circle gets 3-10 roles.
 *
 * Usage: Call from Convex dashboard or CLI:
 *   npx convex run seedOrgChart:seedTestDataInternal --arg organizationId="your-org-id"
 */

import { internalMutation, mutation } from './_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';

/**
 * Ensure user is a member of the organization
 */
async function ensureOrganizationMembership(
	ctx: MutationCtx,
	organizationId: Id<'organizations'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('organizationMembers')
		.withIndex('by_organization_user', (q) =>
			q.eq('organizationId', organizationId).eq('userId', userId)
		)
		.first();

	if (!membership) {
		throw new Error(`User ${userId} is not a member of organization ${organizationId}`);
	}
}

function slugifyName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.slice(0, 48) || 'circle'
	);
}

async function ensureUniqueCircleSlug(
	ctx: MutationCtx,
	organizationId: Id<'organizations'>,
	baseSlug: string
): Promise<string> {
	const existingCircles = await ctx.db
		.query('circles')
		.withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
		.collect();

	const existingSlugs = new Set(existingCircles.map((circle) => circle.slug));
	let slug = baseSlug;
	let suffix = 1;

	while (existingSlugs.has(slug)) {
		slug = `${baseSlug}-${suffix++}`;
	}

	return slug;
}

export const seedTestData = mutation({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await ensureOrganizationMembership(ctx, args.organizationId, userId);

		const now = Date.now();
		console.log('🌱 Seeding org chart test data...');

		// Role names pool for variety
		const roleNames = [
			'Circle Lead',
			'Facilitator',
			'Secretary',
			'Rep Link',
			'Cross Link',
			'Dev Lead',
			'Design Lead',
			'Product Lead',
			'Tech Lead',
			'QA Lead',
			'Scrum Master',
			'Product Owner',
			'Architect',
			'Engineer',
			'Designer',
			'Analyst',
			'Coordinator',
			'Specialist',
			'Manager',
			'Director'
		];

		// Helper to create a circle
		async function createCircle(
			name: string,
			purpose: string,
			parentCircleId?: Id<'circles'>
		): Promise<Id<'circles'>> {
			const slug = await ensureUniqueCircleSlug(ctx, args.organizationId, slugifyName(name));
			const circleId = await ctx.db.insert('circles', {
				organizationId: args.organizationId,
				name,
				slug,
				purpose,
				parentCircleId: parentCircleId ?? undefined,
				createdAt: now,
				updatedAt: now
			});
			return circleId;
		}

		// Helper to create roles for a circle (3-10 roles)
		async function createRolesForCircle(
			circleId: Id<'circles'>,
			circleName: string
		): Promise<void> {
			const roleCount = Math.floor(Math.random() * 8) + 3; // 3-10 roles
			const usedRoleNames = new Set<string>();

			for (let i = 0; i < roleCount; i++) {
				// Pick a unique role name
				let roleName: string;
				let attempts = 0;
				do {
					roleName = roleNames[Math.floor(Math.random() * roleNames.length)];
					attempts++;
					if (attempts > 50) {
						roleName = `${roleNames[Math.floor(Math.random() * roleNames.length)]} ${i + 1}`;
						break;
					}
				} while (usedRoleNames.has(roleName));
				usedRoleNames.add(roleName);

				const purpose = `Responsible for ${roleName.toLowerCase()} activities in ${circleName}`;

				await ctx.db.insert('circleRoles', {
					circleId,
					name: roleName,
					purpose,
					createdAt: now
				});
			}
		}

		// ========================================================================
		// Step 1: Create Root Circle
		// ========================================================================
		console.log('Creating root circle...');
		const rootCircleId = await createCircle(
			'Active Platforms',
			'Run Clients tech platforms and coordinate cross-platform initiatives'
		);
		await createRolesForCircle(rootCircleId, 'Active Platforms');

		// ========================================================================
		// Step 2: Create Level 1 Sub Circles (2-3 circles)
		// ========================================================================
		console.log('Creating level 1 sub circles...');
		const level1Circles = [
			{
				name: 'Guidelines API',
				purpose: 'Empower products with Guidelines Data and rules engine'
			},
			{
				name: 'Platform Infrastructure',
				purpose: 'Maintain and scale core platform services'
			},
			{
				name: 'Developer Experience',
				purpose: 'Improve developer tools and workflows'
			}
		];

		const level1CircleIds: Id<'circles'>[] = [];
		for (const circle of level1Circles) {
			const circleId = await createCircle(circle.name, circle.purpose, rootCircleId);
			level1CircleIds.push(circleId);
			await createRolesForCircle(circleId, circle.name);
		}

		// ========================================================================
		// Step 3: Create Level 2 Sub Circles (2-3 per Level 1 circle)
		// ========================================================================
		console.log('Creating level 2 sub circles...');
		const level2Circles = [
			// Under Guidelines API
			{
				name: 'API Gateway',
				purpose: 'Manage API routing and authentication',
				parentIndex: 0
			},
			{
				name: 'Data Pipeline',
				purpose: 'Process and transform guidelines data',
				parentIndex: 0
			},
			// Under Platform Infrastructure
			{
				name: 'Database Team',
				purpose: 'Manage database infrastructure and performance',
				parentIndex: 1
			},
			{
				name: 'DevOps Team',
				purpose: 'Handle deployment and monitoring',
				parentIndex: 1
			},
			// Under Developer Experience
			{
				name: 'SDK Team',
				purpose: 'Build and maintain client SDKs',
				parentIndex: 2
			},
			{
				name: 'Documentation Team',
				purpose: 'Create and maintain developer docs',
				parentIndex: 2
			}
		];

		for (const circle of level2Circles) {
			const parentId = level1CircleIds[circle.parentIndex];
			const circleId = await createCircle(circle.name, circle.purpose, parentId);
			await createRolesForCircle(circleId, circle.name);
		}

		console.log('✅ Org chart test data seeded successfully!');
		console.log(`   - Root circle: Active Platforms`);
		console.log(`   - Level 1 circles: ${level1Circles.length}`);
		console.log(`   - Level 2 circles: ${level2Circles.length}`);
		console.log(`   - Total circles: ${1 + level1Circles.length + level2Circles.length}`);

		return {
			rootCircleId,
			level1CircleIds,
			totalCircles: 1 + level1Circles.length + level2Circles.length
		};
	}
});

/**
 * Internal version - no sessionId required, uses deploy key
 * Easier to run from scripts
 */
export const seedTestDataInternal = internalMutation({
	args: {
		organizationId: v.id('organizations')
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		console.log('🌱 Seeding org chart test data (internal)...');

		// Role names pool for variety
		const roleNames = [
			'Circle Lead',
			'Facilitator',
			'Secretary',
			'Rep Link',
			'Cross Link',
			'Dev Lead',
			'Design Lead',
			'Product Lead',
			'Tech Lead',
			'QA Lead',
			'Scrum Master',
			'Product Owner',
			'Architect',
			'Engineer',
			'Designer',
			'Analyst',
			'Coordinator',
			'Specialist',
			'Manager',
			'Director'
		];

		// Helper to create a circle
		async function createCircle(
			name: string,
			purpose: string,
			parentCircleId?: Id<'circles'>
		): Promise<Id<'circles'>> {
			const slug = await ensureUniqueCircleSlug(ctx, args.organizationId, slugifyName(name));
			const circleId = await ctx.db.insert('circles', {
				organizationId: args.organizationId,
				name,
				slug,
				purpose,
				parentCircleId: parentCircleId ?? undefined,
				createdAt: now,
				updatedAt: now
			});
			return circleId;
		}

		// Helper to create roles for a circle (3-10 roles)
		async function createRolesForCircle(
			circleId: Id<'circles'>,
			circleName: string
		): Promise<void> {
			const roleCount = Math.floor(Math.random() * 8) + 3; // 3-10 roles
			const usedRoleNames = new Set<string>();

			for (let i = 0; i < roleCount; i++) {
				// Pick a unique role name
				let roleName: string;
				let attempts = 0;
				do {
					roleName = roleNames[Math.floor(Math.random() * roleNames.length)];
					attempts++;
					if (attempts > 50) {
						roleName = `${roleNames[Math.floor(Math.random() * roleNames.length)]} ${i + 1}`;
						break;
					}
				} while (usedRoleNames.has(roleName));
				usedRoleNames.add(roleName);

				const purpose = `Responsible for ${roleName.toLowerCase()} activities in ${circleName}`;

				await ctx.db.insert('circleRoles', {
					circleId,
					name: roleName,
					purpose,
					createdAt: now
				});
			}
		}

		// ========================================================================
		// Step 1: Create Root Circle
		// ========================================================================
		console.log('Creating root circle...');
		const rootCircleId = await createCircle(
			'Active Platforms',
			'Run Clients tech platforms and coordinate cross-platform initiatives'
		);
		await createRolesForCircle(rootCircleId, 'Active Platforms');

		// ========================================================================
		// Step 2: Create Level 1 Sub Circles (2-3 circles)
		// ========================================================================
		console.log('Creating level 1 sub circles...');
		const level1Circles = [
			{
				name: 'Guidelines API',
				purpose: 'Empower products with Guidelines Data and rules engine'
			},
			{
				name: 'Platform Infrastructure',
				purpose: 'Maintain and scale core platform services'
			},
			{
				name: 'Developer Experience',
				purpose: 'Improve developer tools and workflows'
			}
		];

		const level1CircleIds: Id<'circles'>[] = [];
		for (const circle of level1Circles) {
			const circleId = await createCircle(circle.name, circle.purpose, rootCircleId);
			level1CircleIds.push(circleId);
			await createRolesForCircle(circleId, circle.name);
		}

		// ========================================================================
		// Step 3: Create Level 2 Sub Circles (2-3 per Level 1 circle)
		// ========================================================================
		console.log('Creating level 2 sub circles...');
		const level2Circles = [
			// Under Guidelines API
			{
				name: 'API Gateway',
				purpose: 'Manage API routing and authentication',
				parentIndex: 0
			},
			{
				name: 'Data Pipeline',
				purpose: 'Process and transform guidelines data',
				parentIndex: 0
			},
			// Under Platform Infrastructure
			{
				name: 'Database Team',
				purpose: 'Manage database infrastructure and performance',
				parentIndex: 1
			},
			{
				name: 'DevOps Team',
				purpose: 'Handle deployment and monitoring',
				parentIndex: 1
			},
			// Under Developer Experience
			{
				name: 'SDK Team',
				purpose: 'Build and maintain client SDKs',
				parentIndex: 2
			},
			{
				name: 'Documentation Team',
				purpose: 'Create and maintain developer docs',
				parentIndex: 2
			}
		];

		for (const circle of level2Circles) {
			const parentId = level1CircleIds[circle.parentIndex];
			const circleId = await createCircle(circle.name, circle.purpose, parentId);
			await createRolesForCircle(circleId, circle.name);
		}

		console.log('✅ Org chart test data seeded successfully!');
		console.log(`   - Root circle: Active Platforms`);
		console.log(`   - Level 1 circles: ${level1Circles.length}`);
		console.log(`   - Level 2 circles: ${level2Circles.length}`);
		console.log(`   - Total circles: ${1 + level1Circles.length + level2Circles.length}`);

		return {
			rootCircleId,
			level1CircleIds,
			totalCircles: 1 + level1Circles.length + level2Circles.length
		};
	}
});
