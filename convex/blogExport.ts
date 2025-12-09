/**
 * Blog Export System
 *
 * Converts notes to markdown and exports them to /ai-content-blog/
 * Uses Convex actions for file system access
 */

import { action } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import type { FunctionReference } from 'convex/server';
import type { ProseMirrorDoc, ProseMirrorNode } from '../src/lib/types/prosemirror';
import type { Doc } from './_generated/dataModel';
import { createError, ErrorCodes } from './infrastructure/errors/codes';

/**
 * Convert ProseMirror JSON to Markdown
 * This is a simplified converter - in production, use prosemirror-markdown
 */
function prosemirrorToMarkdown(doc: ProseMirrorDoc): string {
	if (!doc || !doc.content) return '';

	let markdown = '';

	for (const node of doc.content) {
		markdown += nodeToMarkdown(node);
	}

	return markdown.trim();
}

function nodeToMarkdown(node: ProseMirrorNode): string {
	switch (node.type) {
		case 'heading': {
			const level = (node.attrs?.level as number | undefined) || 1;
			const headingMarks = '#'.repeat(level);
			const headingText = extractText(node);
			return `${headingMarks} ${headingText}\n\n`;
		}

		case 'paragraph': {
			const paragraphText = extractText(node);
			return paragraphText ? `${paragraphText}\n\n` : '';
		}

		case 'bullet_list': {
			return node.content?.map((item) => `- ${extractText(item)}\n`).join('') + '\n' || '';
		}

		case 'ordered_list': {
			return (
				node.content?.map((item, idx) => `${idx + 1}. ${extractText(item)}\n`).join('') + '\n' || ''
			);
		}

		case 'blockquote': {
			const quoteText = extractText(node);
			return `> ${quoteText}\n\n`;
		}

		case 'code_block': {
			const codeText = extractText(node);
			return `\`\`\`\n${codeText}\n\`\`\`\n\n`;
		}

		default:
			return extractText(node) + '\n';
	}
}

function extractText(node: ProseMirrorNode): string {
	if (node.text) {
		let text = node.text;

		// Apply marks (bold, italic, code)
		if (node.marks) {
			for (const mark of node.marks) {
				switch (mark.type) {
					case 'strong':
						text = `**${text}**`;
						break;
					case 'em':
						text = `*${text}*`;
						break;
					case 'code':
						text = `\`${text}\``;
						break;
				}
			}
		}

		return text;
	}

	if (node.content) {
		return node.content.map((child) => extractText(child)).join('');
	}

	return '';
}

/**
 * Generate frontmatter for blog post
 */
function generateFrontmatter(note: Doc<'inboxItems'> & { type: 'note' }): string {
	const date = new Date().toISOString().split('T')[0];
	const aiGenerated = note.isAIGenerated ? 'true' : 'false';

	return `---
title: "${note.title || 'Untitled'}"
date: ${date}
tags: ["BLOG", "SynergyOS"]
aiGenerated: ${aiGenerated}
slug: "${note.slug || 'untitled'}"
---

`;
}

/**
 * Export note to markdown file
 * Note: This is a simulated export since Convex actions can't write to local filesystem
 * In production, this would write to a cloud storage or trigger a webhook to write locally
 */
export const exportNoteToBlog = action({
	args: {
		sessionId: v.string(),
		noteId: v.id('inboxItems')
	},
	handler: async (ctx, args): Promise<{ filepath: string; content: string; success: boolean }> => {
		const userId = await ctx.runQuery(internal.settings.getUserIdFromSessionId, {
			sessionId: args.sessionId
		});
		if (!userId) {
			throw createError(ErrorCodes.AUTH_REQUIRED, 'Not authenticated');
		}

		// Get the note
		const note = await ctx.runQuery(api.notes.findNote, {
			sessionId: args.sessionId,
			noteId: args.noteId
		});

		if (!note) {
			throw createError(ErrorCodes.NOTE_NOT_FOUND, 'Note not found');
		}

		if (note.type !== 'note') {
			throw createError(ErrorCodes.NOTE_INVALID_TYPE, 'Item is not a note');
		}

		// Convert ProseMirror JSON to markdown
		let markdown = '';
		try {
			const doc = JSON.parse(note.content);
			markdown = prosemirrorToMarkdown(doc);
		} catch {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Failed to parse note content');
		}

		// Generate frontmatter
		const frontmatter = generateFrontmatter(note);

		// Combine frontmatter and content
		const fullMarkdown = frontmatter + markdown;

		// Generate filename
		const slug: string =
			note.slug || note.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled';
		const filename: string = `${slug}.md`;
		const filepath: string = `/ai-content-blog/${filename}`;

		// In production, write to file system or cloud storage
		// For now, we'll just return the content and filepath
		// The client would handle writing to the file system or triggering a webhook

		// Mark note as published
		await ctx.runMutation(api.notes.updateNotePublished, {
			sessionId: args.sessionId,
			noteId: args.noteId,
			publishedTo: filepath
		});

		return {
			filepath,
			content: fullMarkdown,
			success: true
		};
	}
});

/**
 * List all blog posts (notes with blogCategory = "BLOG")
 */
export const listBlogPosts = action({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await ctx.runQuery(internal.settings.getUserIdFromSessionId, {
			sessionId: args.sessionId
		});
		if (!userId) {
			return [];
		}

		// Use type assertion to avoid circular reference in Convex API types
		// blogExport -> api.notes -> api (includes blogExport) = circular
		// Type assertion is safe: listNotes returns inboxItems[] which we know at compile time
		type InboxItem = { _id: string; type: string; [key: string]: unknown };
		const listNotesQuery = api.notes.listNotes as FunctionReference<
			'query',
			'public',
			{ sessionId: string; blogOnly?: boolean },
			InboxItem[]
		>;
		const notes = await ctx.runQuery(listNotesQuery, {
			sessionId: args.sessionId,
			blogOnly: true
		});

		return notes;
	}
});
