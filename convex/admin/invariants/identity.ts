import { internalQuery } from '../../_generated/server';
import { makeResult, type InvariantResult } from './types';

const ACTIVE_STATUS = 'active';
const INVITED_STATUS = 'invited';
const ARCHIVED_STATUS = 'archived';

export const checkIDENT01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (
			await ctx.db
				.query('people')
				.filter((q) => q.eq(q.field('status'), ACTIVE_STATUS))
				.collect()
		)
			.filter((person) => !person.userId)
			.map((person) => person._id);

		return makeResult({
			id: 'IDENT-01',
			name: 'Active people must have userId set',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All active people are linked to users'
					: `${violations.length} active people missing userId`
		});
	}
});

export const checkIDENT02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (
			await ctx.db
				.query('people')
				.filter((q) => q.eq(q.field('status'), INVITED_STATUS))
				.collect()
		)
			.filter((person) => !person.email)
			.map((person) => person._id);

		return makeResult({
			id: 'IDENT-02',
			name: 'Invited people must have email set',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All invited people have identifying email'
					: `${violations.length} invited people missing email`
		});
	}
});

export const checkIDENT03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (
			await ctx.db
				.query('people')
				.filter((q) => q.eq(q.field('status'), ACTIVE_STATUS))
				.collect()
		)
			.filter((person) => person.email !== undefined)
			.map((person) => person._id);

		return makeResult({
			id: 'IDENT-03',
			name: 'Active people should NOT have email set',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All active people rely on users.email'
					: `${violations.length} active people still store email (denormalized)`
		});
	}
});

export const checkIDENT04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const people = await ctx.db.query('people').collect();
		const violations: string[] = [];

		for (const person of people) {
			const workspace = await ctx.db.get(person.workspaceId);
			if (!workspace) {
				violations.push(person._id.toString());
			}
		}

		return makeResult({
			id: 'IDENT-04',
			name: 'Every person.workspaceId points to existing workspace',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All people reference valid workspaces'
					: `${violations.length} people have orphaned workspaceId`
		});
	}
});

export const checkIDENT05 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const people = await ctx.db.query('people').collect();
		const violations: string[] = [];

		for (const person of people) {
			if (!person.userId) continue;
			const user = await ctx.db.get(person.userId);
			if (!user) {
				violations.push(person._id.toString());
			}
		}

		return makeResult({
			id: 'IDENT-05',
			name: 'Every person.userId points to existing user',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All people reference valid users'
					: `${violations.length} people reference missing users`
		});
	}
});

export const checkIDENT06 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const activePeople = await ctx.db
			.query('people')
			.filter((q) => q.eq(q.field('status'), ACTIVE_STATUS))
			.collect();

		const duplicateKeys = new Map<string, number>();
		for (const person of activePeople) {
			if (!person.userId) continue;
			const key = `${person.workspaceId}|${person.userId}`;
			duplicateKeys.set(key, (duplicateKeys.get(key) ?? 0) + 1);
		}

		const violations = Array.from(duplicateKeys.entries())
			.filter(([, count]) => count > 1)
			.map(([key]) => key);

		return makeResult({
			id: 'IDENT-06',
			name: 'No duplicate (workspaceId, userId) pairs in active people',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All active people unique per workspace/user'
					: `${violations.length} duplicate workspace/user pairs detected`
		});
	}
});

export const checkIDENT07 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const invitedPeople = await ctx.db
			.query('people')
			.filter((q) => q.eq(q.field('status'), INVITED_STATUS))
			.collect();

		const duplicateKeys = new Map<string, number>();
		for (const person of invitedPeople) {
			if (!person.email) continue;
			const key = `${person.workspaceId}|${person.email.toLowerCase()}`;
			duplicateKeys.set(key, (duplicateKeys.get(key) ?? 0) + 1);
		}

		const violations = Array.from(duplicateKeys.entries())
			.filter(([, count]) => count > 1)
			.map(([key]) => key);

		return makeResult({
			id: 'IDENT-07',
			name: 'No duplicate (workspaceId, email) pairs in invited people',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All invited people unique per workspace/email'
					: `${violations.length} duplicate workspace/email pairs detected`
		});
	}
});

export const checkIDENT08 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		// Get all archived people without userId
		const archivedWithoutUserId = (
			await ctx.db
				.query('people')
				.filter((q) => q.eq(q.field('status'), ARCHIVED_STATUS))
				.collect()
		).filter((person) => !person.userId);

		// Get all assignments to identify people who were previously active
		// (having assignments indicates they were active at some point)
		const assignments = await ctx.db.query('assignments').collect();

		const peopleWithActivity = new Set<string>();
		for (const assignment of assignments) {
			peopleWithActivity.add(assignment.personId.toString());
		}

		// Only flag archived people who had activity (were previously active)
		// Invited→archived people legitimately have no userId
		const violations = archivedWithoutUserId
			.filter((person) => peopleWithActivity.has(person._id.toString()))
			.map((person) => person._id);

		return makeResult({
			id: 'IDENT-08',
			name: 'Previously-active archived people preserve userId',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All previously-active archived people retain userId'
					: `${violations.length} archived people with activity history missing userId`
		});
	}
});

export const checkIDENT09 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const users = await ctx.db.query('users').collect();
		const emailCounts = new Map<string, number>();
		for (const user of users) {
			if (user.deletedAt) continue;
			const email = user.email.toLowerCase();
			emailCounts.set(email, (emailCounts.get(email) ?? 0) + 1);
		}

		const violations = Array.from(emailCounts.entries())
			.filter(([, count]) => count > 1)
			.map(([email]) => email);

		return makeResult({
			id: 'IDENT-09',
			name: 'Every user.email is unique',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All users have unique emails'
					: `${violations.length} duplicate email(s) detected among active users`
		});
	}
});
