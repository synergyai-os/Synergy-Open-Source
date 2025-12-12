import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import type { ProseMirrorNode } from '../../infrastructure/types/prosemirror';
import { findInboxActor, getInboxActor } from './access';
import { findSyncProgressForPerson } from '../readwise/queries/progress';

type InboxItem = Doc<'inboxItems'>;

type FilterArgs = {
	filterType?: string;
	processed?: boolean;
	workspaceId?: Id<'workspaces'> | null;
	circleId?: Id<'circles'>;
};

export type ListInboxItemsArgs = FilterArgs & { sessionId: string };
export type FindInboxItemArgs = { sessionId: string; inboxItemId: Id<'inboxItems'> };

export async function listInboxItemsForSession(
	ctx: QueryCtx,
	args: ListInboxItemsArgs
): Promise<Array<InboxItem & { title: string; snippet: string; tags: string[] }>> {
	const actor = await getInboxActor(ctx, args.sessionId, args.workspaceId);
	return listInboxItemsForPerson(ctx, args, actor);
}

export async function findInboxItemForSession(ctx: QueryCtx, args: FindInboxItemArgs) {
	const item = await ctx.db.get(args.inboxItemId);
	const actor = await findInboxActor(ctx, args.sessionId, item?.workspaceId ?? null);
	if (!actor || !item || item.personId !== actor.personId) return null;
	return item;
}

export async function findInboxItemWithDetailsForSession(
	ctx: QueryCtx,
	args: FindInboxItemArgs
): Promise<
	| (Doc<'inboxItems'> & {
			highlight?: Doc<'highlights'> | null;
			source?: Doc<'sources'> | null;
			author?: Doc<'authors'> | null;
			authors?: Doc<'authors'>[];
			tags?: Doc<'tags'>[];
	  })
	| null
> {
	const item = await ctx.db.get(args.inboxItemId);
	const actor = await getInboxActor(ctx, args.sessionId, item?.workspaceId ?? null);
	return findInboxItemWithDetails(ctx, args.inboxItemId, actor.personId);
}

export async function findSyncProgressForSession(
	ctx: QueryCtx,
	sessionId: string
): Promise<{
	step: string;
	current: number;
	total: number;
	message?: string;
} | null> {
	const actor = await findInboxActor(ctx, sessionId);
	if (!actor) return null;
	return findSyncProgressForPerson(ctx, actor.personId);
}

async function listInboxItemsForPerson(
	ctx: QueryCtx,
	args: FilterArgs,
	actor: { personId: Id<'people'>; workspaceId: Id<'workspaces'> }
): Promise<Array<InboxItem & { title: string; snippet: string; tags: string[] }>> {
	const items = await fetchItems(ctx, args, actor);
	const filteredItems = args.filterType
		? items.filter((item) => item.type === args.filterType)
		: items;
	const enrichedItems = await Promise.all(filteredItems.map((item) => enrichInboxItem(ctx, item)));
	return enrichedItems.sort((a, b) => b.createdAt - a.createdAt);
}

async function findInboxItemWithDetails(
	ctx: QueryCtx,
	inboxItemId: Id<'inboxItems'>,
	personId: Id<'people'>
): Promise<
	| (Doc<'inboxItems'> & {
			highlight?: Doc<'highlights'> | null;
			source?: Doc<'sources'> | null;
			author?: Doc<'authors'> | null;
			authors?: Doc<'authors'>[];
			tags?: Doc<'tags'>[];
	  })
	| null
> {
	const item = await ctx.db.get(inboxItemId);
	if (!item || item.personId !== personId) return null;
	if (item.type !== 'readwise_highlight') return item;

	const highlight = await ctx.db.get(item.highlightId);
	if (!highlight) {
		return { ...item, highlight: null, source: null, author: null, tags: [] };
	}

	const source = await ctx.db.get(highlight.sourceId);
	if (!source) {
		return { ...item, highlight, source: null, author: null, tags: [] };
	}

	const author = await ctx.db.get(source.authorId);
	const sourceAuthors = await ctx.db
		.query('sourceAuthors')
		.withIndex('by_source', (q) => q.eq('sourceId', source._id))
		.collect();

	const allAuthorIds = [source.authorId, ...sourceAuthors.map((sa) => sa.authorId)];
	const authors = await fetchDistinctAuthors(ctx, allAuthorIds);

	const tagIds = await listHighlightAndSourceTagIds(ctx, highlight._id, source._id);
	const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));

	return {
		...item,
		highlight,
		source,
		author,
		authors,
		tags: tags.filter((t): t is Doc<'tags'> => Boolean(t))
	};
}

async function fetchItems(
	ctx: QueryCtx,
	args: FilterArgs,
	actor: { personId: Id<'people'>; workspaceId: Id<'workspaces'> }
): Promise<InboxItem[]> {
	const targetWorkspace = args.workspaceId ?? actor.workspaceId;

	if (args.processed !== undefined) {
		const items = await ctx.db
			.query('inboxItems')
			.withIndex('by_person_processed', (q) =>
				q.eq('personId', actor.personId).eq('processed', args.processed)
			)
			.collect();
		return filterByScope(items, targetWorkspace, args.circleId);
	}

	const items = await ctx.db
		.query('inboxItems')
		.withIndex('by_person', (q) => q.eq('personId', actor.personId))
		.collect();
	return filterByScope(items, targetWorkspace, args.circleId);
}

function filterByScope(
	items: InboxItem[],
	workspaceId: Id<'workspaces'> | null | undefined,
	circleId?: Id<'circles'>
) {
	if (workspaceId === undefined || workspaceId === null) return items;
	if (circleId) return items.filter((item) => item.circleId === circleId);
	return items.filter((item) => item.workspaceId === workspaceId && !item.circleId);
}

async function enrichInboxItem(ctx: QueryCtx, item: InboxItem) {
	if (item.type === 'readwise_highlight') {
		return enrichHighlightItem(ctx, item);
	}
	if (item.type === 'note') {
		return enrichNoteItem(item);
	}
	if (item.type === 'manual_text') {
		const snippet =
			item.text.length > 100 ? `${item.text.substring(0, 100)}...` : (item.text as string);
		return { ...item, title: item.bookTitle ?? 'Manual Text', snippet, tags: [] };
	}
	return {
		...item,
		title: 'Unknown Item',
		snippet: '',
		tags: []
	};
}

async function enrichHighlightItem(ctx: QueryCtx, item: InboxItem) {
	const highlight = await ctx.db.get(item.highlightId);
	if (!highlight) {
		return { ...item, title: 'Unknown Highlight', snippet: '', tags: [] };
	}

	const source = await ctx.db.get(highlight.sourceId);
	const title = source ? source.title : 'Unknown Source';

	const highlightTags = await ctx.db
		.query('highlightTags')
		.withIndex('by_highlight', (q) => q.eq('highlightId', highlight._id))
		.collect();

	const sourceTags = source
		? await ctx.db
				.query('sourceTags')
				.withIndex('by_source', (q) => q.eq('sourceId', source._id))
				.collect()
		: [];

	const tagIds = [...highlightTags.map((ht) => ht.tagId), ...sourceTags.map((st) => st.tagId)];
	const uniqueTagIds = Array.from(new Set(tagIds));
	const tags = await Promise.all(uniqueTagIds.map((tagId) => ctx.db.get(tagId)));
	const tagNames = tags.filter((t) => t !== null).map((t) => t!.displayName);

	const snippet =
		highlight.text.length > 100 ? `${highlight.text.substring(0, 100)}...` : highlight.text;

	return {
		...item,
		title,
		snippet,
		tags: tagNames
	};
}

function enrichNoteItem(item: InboxItem) {
	const title = (item as { title?: string }).title || 'Untitled Note';
	const snippet = buildNoteSnippet(
		(item as { contentMarkdown?: string }).contentMarkdown,
		(item as any).content
	);
	return {
		...item,
		title,
		snippet,
		tags: []
	};
}

function buildNoteSnippet(markdown?: string, content?: string): string {
	if (markdown) {
		const text = markdown
			.replace(/^---[\s\S]*?---/, '')
			.replace(/[#*_`[\]]/g, '')
			.trim();
		return text.length > 100 ? `${text.substring(0, 100)}...` : text;
	}

	if (!content) return '';

	try {
		const proseMirrorDoc = JSON.parse(content) as ProseMirrorNode;
		const text = extractText(proseMirrorDoc).trim();
		return text.length > 100 ? `${text.substring(0, 100)}...` : text;
	} catch {
		return 'No preview available';
	}
}

function extractText(node: ProseMirrorNode): string {
	if ((node as { text?: string }).text) return (node as { text: string }).text;
	if ((node as { content?: ProseMirrorNode[] }).content) {
		return ((node as { content: ProseMirrorNode[] }).content ?? []).map(extractText).join(' ');
	}
	return '';
}

async function fetchDistinctAuthors(
	ctx: QueryCtx,
	authorIds: Id<'authors'>[]
): Promise<Doc<'authors'>[]> {
	const uniqueAuthorIds = Array.from(new Set(authorIds));
	const authors = await Promise.all(uniqueAuthorIds.map((authorId) => ctx.db.get(authorId)));
	return authors.filter((a): a is Doc<'authors'> => Boolean(a));
}

async function listHighlightAndSourceTagIds(
	ctx: QueryCtx,
	highlightId: Id<'highlights'>,
	sourceId: Id<'sources'>
): Promise<Id<'tags'>[]> {
	const highlightTags = await ctx.db
		.query('highlightTags')
		.withIndex('by_highlight', (q) => q.eq('highlightId', highlightId))
		.collect();

	const sourceTags = await ctx.db
		.query('sourceTags')
		.withIndex('by_source', (q) => q.eq('sourceId', sourceId))
		.collect();

	return Array.from(
		new Set([...highlightTags.map((ht) => ht.tagId), ...sourceTags.map((st) => st.tagId)])
	);
}
