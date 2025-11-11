/**
 * Import blog post as a note into the inbox
 * Run with: npx tsx scripts/import-blog-note.ts
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach((line) => {
	const match = line.match(/^([^=]+)=(.*)$/);
	if (match) {
		envVars[match[1].trim()] = match[2].trim();
	}
});

const CONVEX_URL = envVars.PUBLIC_CONVEX_URL || envVars.VITE_CONVEX_URL || envVars.CONVEX_URL;

if (!CONVEX_URL) {
	console.error('❌ CONVEX_URL not found in environment');
	console.log('Available env vars:', Object.keys(envVars));
	process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Simple markdown to ProseMirror converter
function markdownToProseMirror(markdown: string) {
	const lines = markdown.split('\n');
	const content: any[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Skip frontmatter
		if (line === '---') {
			while (i < lines.length && lines[++i] !== '---') {}
			continue;
		}

		if (!line.trim()) {
			continue;
		}

		// Heading 1
		if (line.startsWith('# ')) {
			content.push({
				type: 'heading',
				attrs: { level: 1 },
				content: [{ type: 'text', text: line.slice(2) }]
			});
		}
		// Heading 2
		else if (line.startsWith('## ')) {
			content.push({
				type: 'heading',
				attrs: { level: 2 },
				content: [{ type: 'text', text: line.slice(3) }]
			});
		}
		// Heading 3
		else if (line.startsWith('### ')) {
			content.push({
				type: 'heading',
				attrs: { level: 3 },
				content: [{ type: 'text', text: line.slice(4) }]
			});
		}
		// Code block
		else if (line.startsWith('```')) {
			const codeLines: string[] = [];
			while (i < lines.length && !lines[++i].startsWith('```')) {
				codeLines.push(lines[i]);
			}
			content.push({
				type: 'code_block',
				content: [{ type: 'text', text: codeLines.join('\n') }]
			});
		}
		// List item
		else if (line.match(/^[-*]\s/)) {
			content.push({
				type: 'bullet_list',
				content: [
					{
						type: 'list_item',
						content: [
							{
								type: 'paragraph',
								content: [{ type: 'text', text: line.slice(2) }]
							}
						]
					}
				]
			});
		}
		// Paragraph
		else {
			// Parse inline formatting
			const textContent = [];
			const currentText = line;

			// Bold
			const boldRegex = /\*\*(.+?)\*\*/g;
			const parts = currentText.split(boldRegex);

			for (let j = 0; j < parts.length; j++) {
				if (j % 2 === 0) {
					// Regular text
					if (parts[j]) {
						textContent.push({ type: 'text', text: parts[j] });
					}
				} else {
					// Bold text
					textContent.push({
						type: 'text',
						text: parts[j],
						marks: [{ type: 'strong' }]
					});
				}
			}

			if (textContent.length === 0) {
				textContent.push({ type: 'text', text: line });
			}

			content.push({
				type: 'paragraph',
				content: textContent
			});
		}
	}

	return {
		type: 'doc',
		content
	};
}

async function importBlogNote() {
	const blogPath = path.join(
		__dirname,
		'../ai-content-blog/building-products-with-ai-collaboration.md'
	);

	if (!fs.existsSync(blogPath)) {
		console.error('❌ Blog post not found:', blogPath);
		process.exit(1);
	}

	const markdown = fs.readFileSync(blogPath, 'utf-8');
	const prosemirrorContent = markdownToProseMirror(markdown);

	console.log('📝 Creating note in inbox...');

	try {
		const noteId = await client.mutation(api.notes.createNote, {
			title: 'Building Products with AI: How Randy Ships Features in Hours, Not Weeks',
			content: JSON.stringify(prosemirrorContent),
			contentMarkdown: markdown,
			isAIGenerated: false // Human + AI collaboration, but Randy wrote/reviewed it
		});

		console.log('✅ Note created successfully!');
		console.log('📍 Note ID:', noteId);
		console.log('🎯 Check your inbox at http://localhost:5176/inbox');
	} catch (error) {
		console.error('❌ Error creating note:', error);
		process.exit(1);
	}
}

importBlogNote();
