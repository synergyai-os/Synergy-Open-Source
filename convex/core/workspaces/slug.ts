import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { MutationCtx } from '../../_generated/server';

const RESERVED_SLUGS = [
	'mail',
	'api',
	'app',
	'www',
	'admin',
	'blog',
	'docs',
	'help',
	'support',
	'status',
	'auth',
	'login',
	'signup',
	'pricing',
	'about',
	'legal',
	'w',
	'account',
	'settings',
	'profile',
	'invite',
	'join',
	'dashboard',
	'inbox',
	'dev',
	'staging',
	'test',
	'cdn',
	'assets',
	'static'
];

export function slugifyName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.slice(0, 48) || 'org'
	);
}

export function calculateInitialsFromName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('') || name.slice(0, 2).toUpperCase()
	);
}

export function isReservedSlug(slug: string): boolean {
	return RESERVED_SLUGS.includes(slug.toLowerCase());
}

export function ensureSlugFormat(slug: string) {
	if (!/^[a-z0-9-]+$/.test(slug)) {
		throw createError(
			ErrorCodes.WORKSPACE_SLUG_INVALID,
			'Slug can only contain lowercase letters, numbers, and hyphens'
		);
	}

	if (slug.length < 2 || slug.length > 48) {
		throw createError(
			ErrorCodes.WORKSPACE_SLUG_INVALID,
			'Slug must be between 2 and 48 characters'
		);
	}
}

export function ensureSlugNotReserved(slug: string, label: 'workspace name' | 'slug') {
	if (isReservedSlug(slug)) {
		throw createError(
			ErrorCodes.WORKSPACE_SLUG_RESERVED,
			`"${slug}" is a reserved name and cannot be used. Please choose a different ${label}.`
		);
	}
}

export async function ensureUniqueWorkspaceSlug(
	ctx: MutationCtx,
	baseSlug: string
): Promise<string> {
	let slug = baseSlug;
	let suffix = 1;

	while (true) {
		const existing = await ctx.db
			.query('workspaces')
			.withIndex('by_slug', (q) => q.eq('slug', slug))
			.first();
		if (!existing) {
			return slug;
		}
		slug = `${baseSlug}-${suffix++}`;
	}
}
