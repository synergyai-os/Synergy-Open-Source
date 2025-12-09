import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

export function findUserEmailField(user: Doc<'users'> | null): string | null {
	if (!user) return null;
	const emailField = (user as Record<string, unknown>).email;
	return typeof emailField === 'string' ? emailField : null;
}

export function findUserNameField(user: Doc<'users'> | null): string | null {
	if (!user) return null;
	const nameField = (user as Record<string, unknown>).name;
	return typeof nameField === 'string' ? nameField : null;
}

export function describeUserDisplayName(user: Doc<'users'> | null): string {
	return findUserNameField(user) ?? findUserEmailField(user) ?? 'Member';
}

export async function getUserEmail(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
	const user = await ctx.db.get(userId);
	return findUserEmailField(user);
}
