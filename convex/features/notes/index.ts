/**
 * Notes Queries and Mutations
 *
 * Handles CRUD operations for rich text notes with AI detection and blog workflow
 */

import { mutation, query } from '../../_generated/server';
import type { MutationCtx, Query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { getPersonByUserAndWorkspace, listWorkspacesForUser } from '../../core/people/queries';
import { requireActivePerson } from '../../core/people/rules';

type NoteDoc = Doc<'inboxItems'> & { type: 'note' };
type NoteActor = { personId: Id<'people'>; workspaceId: Id<'workspaces'>; userId: Id<'users'> };
type AnyCtx = QueryCtx | MutationCtx;

async function resolveWorkspaceId(
	ctx: AnyCtx,
	userId: Id<'users'>,
	workspaceId?: Id<'workspaces'> | null
): Promise<Id<'workspaces'>> {
	if (workspaceId) return workspaceId;

	const workspaces = await listWorkspacesForUser(ctx, userId);
	if (workspaces.length === 0) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'Workspace membership required for notes'
		);
	}
	return workspaces[0];
}

async function getNoteActor(
	ctx: AnyCtx,
	sessionId: string,
	workspaceId?: Id<'workspaces'> | null
): Promise<NoteActor> {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
	const resolvedWorkspaceId = await resolveWorkspaceId(ctx, userId, workspaceId);
	const person = await getPersonByUserAndWorkspace(ctx, userId, resolvedWorkspaceId);
	const activePerson = await requireActivePerson(ctx, person._id);

	return {
		personId: activePerson._id,
		workspaceId: resolvedWorkspaceId,
		userId
	};
}

function ensureNoteForActor(note: Doc<'inboxItems'> | null, actor: NoteActor): NoteDoc {
	if (!note || note.type !== 'note' || note.personId !== actor.personId) {
		throw createError(ErrorCodes.NOTE_ACCESS_DENIED, 'Note not found or access denied');
	}
	return note as NoteDoc;
}

async function findNoteForActor(
	ctx: QueryCtx,
	noteId: Id<'inboxItems'>,
	actor: NoteActor
): Promise<NoteDoc | null> {
	const note = await ctx.db.get(noteId);
	if (!note || note.type !== 'note' || note.personId !== actor.personId) return null;
	return note as NoteDoc;
}

function filterNotesByScope(
	items: NoteDoc[],
	workspaceId?: Id<'workspaces'> | null,
	circleId?: Id<'circles'>
) {
	if (!workspaceId) return items;
	if (circleId) return items.filter((item) => item.circleId === circleId);
	return items.filter((item) => item.workspaceId === workspaceId && !item.circleId);
}

/**
 * Create a new note
 *
 * SECURITY: Uses sessionId to derive personId server-side (prevents impersonation)
 */
export const createNote = mutation({
	args: {
		sessionId: v.string(), // Required: passed from authenticated SvelteKit session
		title: v.optional(v.string()),
		content: v.string(), // ProseMirror JSON
		contentMarkdown: v.optional(v.string()),
		isAIGenerated: v.optional(v.boolean()),
		workspaceId: v.optional(v.union(v.id('workspaces'), v.null())),
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		const actor = await getNoteActor(ctx, args.sessionId, args.workspaceId ?? null);
		const now = Date.now();
		const workspaceId = args.workspaceId ?? actor.workspaceId;

		const noteId = await ctx.db.insert('inboxItems', {
			type: 'note',
			personId: actor.personId,
			processed: false,
			createdAt: now,
			updatedAt: now,
			title: args.title,
			content: args.content,
			contentMarkdown: args.contentMarkdown,
			isAIGenerated: args.isAIGenerated,
			aiGeneratedAt: args.isAIGenerated ? now : undefined,
			workspaceId,
			circleId: args.circleId ?? undefined,
			ownershipType: args.circleId ? 'circle' : 'workspace'
		});

		return noteId;
	}
});

/**
 * Update an existing note
 *
 * SECURITY: Uses sessionId to derive personId server-side (prevents impersonation)
 */
export const updateNote = mutation({
	args: {
		sessionId: v.string(), // Required: passed from authenticated SvelteKit session
		noteId: v.id('inboxItems'),
		title: v.optional(v.string()),
		content: v.optional(v.string()),
		contentMarkdown: v.optional(v.string()),
		isAIGenerated: v.optional(v.boolean()),
		blogCategory: v.optional(v.string()),
		slug: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.get(args.noteId);
		const actor = await getNoteActor(ctx, args.sessionId, existing?.workspaceId ?? null);
		const note = ensureNoteForActor(existing, actor);

		const updateData: {
			updatedAt: number;
			title?: string;
			content?: string;
			contentMarkdown?: string;
			blogCategory?: string;
			slug?: string;
			isAIGenerated?: boolean;
			aiGeneratedAt?: number;
		} = {
			updatedAt: Date.now()
		};

		if (args.title !== undefined) updateData.title = args.title;
		if (args.content !== undefined) updateData.content = args.content;
		if (args.contentMarkdown !== undefined) updateData.contentMarkdown = args.contentMarkdown;
		if (args.blogCategory !== undefined) updateData.blogCategory = args.blogCategory;
		if (args.slug !== undefined) updateData.slug = args.slug;

		if (args.isAIGenerated !== undefined) {
			updateData.isAIGenerated = args.isAIGenerated;
			if (args.isAIGenerated && !note.aiGeneratedAt) {
				updateData.aiGeneratedAt = Date.now();
			}
		}

		await ctx.db.patch(args.noteId, updateData);

		return args.noteId;
	}
});

/**
 * Mark note as AI-generated
 */
export const updateNoteAIFlag = mutation({
	args: {
		sessionId: v.string(), // Required: passed from authenticated SvelteKit session
		noteId: v.id('inboxItems')
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.get(args.noteId);
		const actor = await getNoteActor(ctx, args.sessionId, existing?.workspaceId ?? null);
		ensureNoteForActor(existing, actor);

		await ctx.db.patch(args.noteId, {
			isAIGenerated: true,
			aiGeneratedAt: Date.now(),
			updatedAt: Date.now()
		});

		return args.noteId;
	}
});

/**
 * Mark note for blog export
 */
export const updateNoteExport = mutation({
	args: {
		sessionId: v.string(), // Required: passed from authenticated SvelteKit session
		noteId: v.id('inboxItems'),
		slug: v.string()
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.get(args.noteId);
		const actor = await getNoteActor(ctx, args.sessionId, existing?.workspaceId ?? null);
		ensureNoteForActor(existing, actor);

		await ctx.db.patch(args.noteId, {
			blogCategory: 'BLOG',
			slug: args.slug,
			updatedAt: Date.now()
		});

		return args.noteId;
	}
});

/**
 * Mark note as published to blog file
 */
export const updateNotePublished = mutation({
	args: {
		sessionId: v.string(), // Required: passed from authenticated SvelteKit session
		noteId: v.id('inboxItems'),
		publishedTo: v.string() // File path
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.get(args.noteId);
		const actor = await getNoteActor(ctx, args.sessionId, existing?.workspaceId ?? null);
		ensureNoteForActor(existing, actor);

		await ctx.db.patch(args.noteId, {
			publishedTo: args.publishedTo,
			processed: true,
			processedAt: Date.now(),
			updatedAt: Date.now()
		});

		return args.noteId;
	}
});

/**
 * Delete a note
 */
export const archiveNote = mutation({
	args: {
		sessionId: v.string(), // Required: passed from authenticated SvelteKit session
		noteId: v.id('inboxItems')
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.get(args.noteId);
		const actor = await getNoteActor(ctx, args.sessionId, existing?.workspaceId ?? null);
		ensureNoteForActor(existing, actor);

		await ctx.db.delete(args.noteId);

		return { success: true };
	}
});

/**
 * Export note to dev docs (set slug for /dev-docs/notes/[slug] route)
 */
export const updateNoteDevDocsExport = mutation({
	args: {
		sessionId: v.string(), // Required: passed from authenticated SvelteKit session
		noteId: v.id('inboxItems')
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.get(args.noteId);
		const actor = await getNoteActor(ctx, args.sessionId, existing?.workspaceId ?? null);
		const note = ensureNoteForActor(existing, actor);

		const title = note.title || 'untitled';
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		await ctx.db.patch(args.noteId, {
			slug: slug || note._id,
			updatedAt: Date.now()
		});

		return { slug: slug || note._id };
	}
});

/**
 * List all notes for current person
 */
export const listNotes: Query<
	{
		sessionId: string;
		processed?: boolean;
		blogOnly?: boolean;
		workspaceId?: Id<'workspaces'> | null;
		circleId?: Id<'circles'>;
	},
	Doc<'inboxItems'>[]
> = query({
	args: {
		sessionId: v.string(), // Required: passed from authenticated SvelteKit session
		processed: v.optional(v.boolean()),
		blogOnly: v.optional(v.boolean()),
		workspaceId: v.optional(v.union(v.id('workspaces'), v.null())),
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args): Promise<Doc<'inboxItems'>[]> => {
		const actor = await getNoteActor(ctx, args.sessionId, args.workspaceId ?? null);

		const items = await ctx.db
			.query('inboxItems')
			.withIndex('by_person_type', (q) => q.eq('personId', actor.personId).eq('type', 'note'))
			.collect();

		let filtered = filterNotesByScope(
			items as NoteDoc[],
			args.workspaceId ?? actor.workspaceId,
			args.circleId
		);

		if (args.processed !== undefined) {
			filtered = filtered.filter((item) => item.processed === args.processed);
		}

		if (args.blogOnly) {
			filtered = filtered.filter((item) => item.blogCategory === 'BLOG');
		}

		return filtered.sort((a, b) => {
			const aTime = a.updatedAt ?? a.createdAt;
			const bTime = b.updatedAt ?? b.createdAt;
			return bTime - aTime;
		});
	}
});

/**
 * Get a single note by ID
 */
export const findNote = query({
	args: {
		sessionId: v.string(), // Required: passed from authenticated SvelteKit session
		noteId: v.id('inboxItems')
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.get(args.noteId);
		const actor = await getNoteActor(ctx, args.sessionId, existing?.workspaceId ?? null);
		const note = await findNoteForActor(ctx, args.noteId, actor);
		return note ?? null;
	}
});
