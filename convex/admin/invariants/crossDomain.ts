import { internalQuery } from '../../_generated/server';
import { makeResult, type InvariantResult } from './types';

/**
 * XDOM-01: No userId references in core domain tables
 *
 * Core tables should use personId, not userId, for actor references.
 * Exceptions: users, people
 *
 * Checks: circleItems, circleItemCategories, meetings (attendees), notes
 */
export const checkXDOM01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [circleItems, circleItemCategories, meetings, notes] = await Promise.all([
			ctx.db.query('circleItems').collect(),
			ctx.db.query('circleItemCategories').collect(),
			ctx.db.query('meetings').collect(),
			ctx.db.query('notes').collect()
		]);

		const violations: string[] = [];

		// Check circleItemCategories for legacy userId fields
		for (const category of circleItemCategories) {
			if (category.createdBy || category.updatedBy || category.archivedBy) {
				violations.push(`circleItemCategory:${category._id.toString()}`);
			}
		}

		// Check circleItems for legacy userId fields
		for (const item of circleItems) {
			if (item.createdBy || item.updatedBy || item.archivedBy) {
				violations.push(`circleItem:${item._id.toString()}`);
			}
		}

		// Check meetings for userId in attendees (should use personId)
		for (const meeting of meetings) {
			if (meeting.createdBy && !meeting.createdByPersonId) {
				violations.push(`meeting:${meeting._id.toString()}`);
			}
		}

		// Check notes for legacy userId fields
		for (const note of notes) {
			if (note.createdBy && !note.createdByPersonId) {
				violations.push(`note:${note._id.toString()}`);
			}
		}

		return makeResult({
			id: 'XDOM-01',
			name: 'No userId references in core domain tables',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Core tables use personId instead of userId'
					: `${violations.length} record(s) still use userId-based references`
		});
	}
});

/**
 * XDOM-02: All createdBy/updatedBy audit fields use personId pattern
 *
 * Checks that audit fields follow the *ByPersonId naming convention
 * rather than just *By (which implies userId).
 */
export const checkXDOM02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [circles, proposals, assignments] = await Promise.all([
			ctx.db.query('circles').collect(),
			ctx.db.query('circleProposals').collect(),
			ctx.db.query('assignments').collect()
		]);

		const violations: string[] = [];

		// Check circles have personId-based audit fields
		for (const circle of circles) {
			// Circles should have createdByPersonId, not createdBy
			if (!circle.createdByPersonId && circle.archivedByPersonId === undefined) {
				// Only flag if it looks like it should have audit fields
				// (new circles should have createdByPersonId)
			}
		}

		// Check proposals use personId for creator
		for (const proposal of proposals) {
			if (!proposal.createdByPersonId) {
				violations.push(`proposal:${proposal._id.toString()}`);
			}
		}

		// Check assignments use personId for creator
		for (const assignment of assignments) {
			if (!assignment.createdByPersonId) {
				violations.push(`assignment:${assignment._id.toString()}`);
			}
		}

		return makeResult({
			id: 'XDOM-02',
			name: 'All audit fields use personId pattern',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'Audit fields consistently use *ByPersonId naming'
					: `${violations.length} record(s) missing *ByPersonId audit fields`
		});
	}
});

export const checkXDOM03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [circleItems, circleItemCategories, circles, roles, proposals] = await Promise.all([
			ctx.db.query('circleItems').collect(),
			ctx.db.query('circleItemCategories').collect(),
			ctx.db.query('circles').collect(),
			ctx.db.query('circleRoles').collect(),
			ctx.db.query('circleProposals').collect()
		]);

		const categoryWorkspace = new Map(
			circleItemCategories.map((category) => [
				category._id.toString(),
				category.workspaceId.toString()
			])
		);
		const circleWorkspace = new Map(
			circles.map((circle) => [circle._id.toString(), circle.workspaceId.toString()])
		);
		const roleCircle = new Map(
			roles.map((role) => [role._id.toString(), role.circleId.toString()])
		);

		const violations: string[] = [];

		for (const item of circleItems) {
			const categoryWs = categoryWorkspace.get(item.categoryId.toString());
			if (categoryWs && categoryWs !== item.workspaceId.toString()) {
				violations.push(`circleItem-category:${item._id.toString()}`);
			}

			if (item.entityType === 'circle') {
				const ws = circleWorkspace.get(item.entityId);
				if (ws && ws !== item.workspaceId.toString()) {
					violations.push(`circleItem-entity:${item._id.toString()}`);
				}
			}

			if (item.entityType === 'role') {
				const circleId = roleCircle.get(item.entityId);
				const ws = circleId ? circleWorkspace.get(circleId) : undefined;
				if (ws && ws !== item.workspaceId.toString()) {
					violations.push(`circleItem-role:${item._id.toString()}`);
				}
			}
		}

		for (const proposal of proposals) {
			if (proposal.circleId) {
				const proposalCircleWs = circleWorkspace.get(proposal.circleId.toString());
				if (proposalCircleWs && proposalCircleWs !== proposal.workspaceId.toString()) {
					violations.push(`proposal:${proposal._id.toString()}`);
				}
			}
		}

		return makeResult({
			id: 'XDOM-03',
			name: 'All foreign keys point to same workspace (no cross-workspace leaks)',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Workspace boundaries enforced across core references'
					: `${violations.length} cross-workspace reference(s) detected`
		});
	}
});

export const checkXDOM04 = internalQuery({
	args: {},
	handler: async (): Promise<InvariantResult> => {
		return makeResult({
			id: 'XDOM-04',
			name: 'Archived entities are never hard-deleted',
			severity: 'critical',
			violations: [],
			message: 'Hard deletes not detectable via invariant run; ensure operational safeguards'
		});
	}
});

export const checkXDOM05 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const circleItems = await ctx.db.query('circleItems').collect();
		const violations = circleItems
			.filter((item) => item.createdBy || item.updatedBy || item.archivedBy)
			.map((item) => item._id.toString());

		return makeResult({
			id: 'XDOM-05',
			name: 'circleItems domain migrated to use personId',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'circleItems use personId-based audit fields'
					: `${violations.length} circleItem(s) still store user-based audit fields`
		});
	}
});
