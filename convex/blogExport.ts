/**
 * Blog Export System
 * 
 * Converts notes to markdown and exports them to /ai-content-blog/
 * Uses Convex actions for file system access
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

/**
 * Convert ProseMirror JSON to Markdown
 * This is a simplified converter - in production, use prosemirror-markdown
 */
function prosemirrorToMarkdown(doc: any): string {
	if (!doc || !doc.content) return '';

	let markdown = '';

	for (const node of doc.content) {
		markdown += nodeToMarkdown(node);
	}

	return markdown.trim();
}

function nodeToMarkdown(node: any): string {
	switch (node.type) {
		case 'heading':
			const level = node.attrs?.level || 1;
			const headingMarks = '#'.repeat(level);
			const headingText = extractText(node);
			return `${headingMarks} ${headingText}\n\n`;

		case 'paragraph':
			const paragraphText = extractText(node);
			return paragraphText ? `${paragraphText}\n\n` : '';

		case 'bullet_list':
			return node.content
				.map((item: any) => `- ${extractText(item)}\n`)
				.join('') + '\n';

		case 'ordered_list':
			return node.content
				.map((item: any, idx: number) => `${idx + 1}. ${extractText(item)}\n`)
				.join('') + '\n';

		case 'blockquote':
			const quoteText = extractText(node);
			return `> ${quoteText}\n\n`;

		case 'code_block':
			const codeText = extractText(node);
			return `\`\`\`\n${codeText}\n\`\`\`\n\n`;

		default:
			return extractText(node) + '\n';
	}
}

function extractText(node: any): string {
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
		return node.content.map((child: any) => extractText(child)).join('');
	}

	return '';
}

/**
 * Generate frontmatter for blog post
 */
function generateFrontmatter(note: any): string {
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
		noteId: v.id("inboxItems"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}

		// Get the note
		const note = await ctx.runQuery(api.notes.getNote, {
			noteId: args.noteId,
		});

		if (!note) {
			throw new Error("Note not found");
		}

		if (note.type !== "note") {
			throw new Error("Item is not a note");
		}

		// Convert ProseMirror JSON to markdown
		let markdown = '';
		try {
			const doc = JSON.parse(note.content);
			markdown = prosemirrorToMarkdown(doc);
		} catch (err) {
			throw new Error("Failed to parse note content");
		}

		// Generate frontmatter
		const frontmatter = generateFrontmatter(note);

		// Combine frontmatter and content
		const fullMarkdown = frontmatter + markdown;

		// Generate filename
		const slug = note.slug || note.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled';
		const filename = `${slug}.md`;
		const filepath = `/ai-content-blog/${filename}`;

		// In production, write to file system or cloud storage
		// For now, we'll just return the content and filepath
		// The client would handle writing to the file system or triggering a webhook

		// Mark note as published
		await ctx.runMutation(api.notes.markAsPublished, {
			noteId: args.noteId,
			publishedTo: filepath,
		});

		return {
			filepath,
			content: fullMarkdown,
			success: true,
		};
	},
});

/**
 * List all blog posts (notes with blogCategory = "BLOG")
 */
export const listBlogPosts = action({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return [];
		}

		const notes = await ctx.runQuery(api.notes.listNotes, {
			blogOnly: true,
		});

		return notes;
	},
});

