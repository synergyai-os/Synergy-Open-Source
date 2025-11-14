/**
 * ProseMirror Code Block with Syntax Highlighting
 *
 * Uses prosemirror-highlight with lowlight (highlight.js wrapper)
 */

import { Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { createHighlightPlugin } from 'prosemirror-highlight';
import { createParser } from 'prosemirror-highlight/lowlight';
import { common, createLowlight } from 'lowlight';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

export const SUPPORTED_LANGUAGES = [
	{ value: 'typescript', label: 'TypeScript' },
	{ value: 'javascript', label: 'JavaScript' },
	{ value: 'python', label: 'Python' },
	{ value: 'bash', label: 'Bash' },
	{ value: 'json', label: 'JSON' },
	{ value: 'markdown', label: 'Markdown' },
	{ value: 'css', label: 'CSS' },
	{ value: 'html', label: 'HTML' },
	{ value: 'sql', label: 'SQL' },
	{ value: 'yaml', label: 'YAML' }
];

export const codeBlockPluginKey = new PluginKey('codeblock');
export const languageBadgePluginKey = new PluginKey('languageBadge');

/**
 * Create the main syntax highlighting plugin using prosemirror-highlight
 */
export function createSyntaxHighlightPlugin() {
	const parser = createParser(lowlight);
	return createHighlightPlugin({ parser });
}

/**
 * Create a plugin for language badge and auto-detection
 */
export function createCodeBlockPlugin() {
	const lastContent = new Map<number, string>();

	return new Plugin({
		key: codeBlockPluginKey,

		appendTransaction(transactions, oldState, newState) {
			let tr: Transaction | null = null;

			// Check if any code blocks need auto-detection
			newState.doc.descendants((node, pos) => {
				if (node.type.name === 'code_block') {
					const content = node.textContent;
					const currentLanguage = node.attrs.language;

					// Only auto-detect if:
					// 1. No language is set (null or "plaintext")
					// 2. Content has changed
					// 3. Content is substantial enough (> 10 chars)
					if (
						(!currentLanguage || currentLanguage === 'plaintext') &&
						content.length > 10 &&
						lastContent.get(pos) !== content
					) {
						const detectedLanguage = detectLanguage(content);

						if (detectedLanguage) {
							if (!tr) {
								tr = newState.tr;
							}

							tr!.setNodeMarkup(pos, undefined, {
								...node.attrs,
								language: detectedLanguage
							});

							lastContent.set(pos, content);
						}
					} else {
						lastContent.set(pos, content);
					}
				}
			});

			return tr;
		},

		props: {
			handlePaste(view, event) {
				const { state } = view;
				const { $from } = state.selection;

				// Check if we're inside a code block
				const codeBlock = $from.node($from.depth - 1);
				if (codeBlock && codeBlock.type.name === 'code_block') {
					const pastedText = event.clipboardData?.getData('text/plain');

					if (pastedText && pastedText.length > 10) {
						const currentLanguage = codeBlock.attrs.language;

						// Only auto-detect if no language is set
						if (!currentLanguage || currentLanguage === 'plaintext') {
							const detectedLanguage = detectLanguage(pastedText);

							if (detectedLanguage) {
								// Find the position of the code block
								const codeBlockPos = $from.before($from.depth - 1);

								// Update language after paste completes
								setTimeout(() => {
									const tr = view.state.tr.setNodeMarkup(codeBlockPos, undefined, {
										...codeBlock.attrs,
										language: detectedLanguage
									});
									view.dispatch(tr);
								}, 10);
							}
						}
					}
				}

				return false; // Let default paste handler continue
			},

			decorations(state) {
				const decorations: Decoration[] = [];

				state.doc.descendants((node, pos) => {
					if (node.type.name === 'code_block') {
						// Add decoration for language badge
						const decoration = Decoration.widget(
							pos,
							(view) => {
								const badge = document.createElement('div');
								badge.className = 'code-block-language-badge';
								badge.contentEditable = 'false';

								const language = node.attrs.language || 'plaintext';
								badge.textContent = language;

								// Add click handler to change language
								badge.onclick = (e) => {
									e.preventDefault();
									e.stopPropagation();
									// Trigger language selector
									const event = new CustomEvent('codeblock-language-change', {
										detail: { pos, currentLanguage: language }
									});
									view.dom.dispatchEvent(event);
								};

								return badge;
							},
							{ side: -1 }
						);
						decorations.push(decoration);
					}
				});

				return DecorationSet.create(state.doc, decorations);
			}
		}
	});
}

/**
 * Auto-detect language from code content
 */
export function detectLanguage(code: string): string | null {
	if (!code || code.trim().length < 3) {
		return null;
	}

	const firstLine = code.split('\n')[0].trim();
	// TODO: Re-enable when needed for multi-line detection
	// const _firstFewLines = code.split('\n').slice(0, 5).join('\n');

	// TypeScript detection (check first - more specific than JS)
	if (
		firstLine.includes('<script lang="ts">') ||
		firstLine.includes("<script lang='ts'>") ||
		firstLine.includes('lang="typescript"') ||
		code.includes('interface ') ||
		(code.includes('type ') && code.includes(' = ')) ||
		code.includes(': string') ||
		code.includes(': number') ||
		code.includes(': boolean') ||
		code.includes(': any') ||
		code.includes('<T>') ||
		code.includes('implements ') ||
		/: [\w<>[\]]+(\[\])?[,;)]/.test(code) // Type annotations like `: Type,` or `: Type;`
	) {
		return 'typescript';
	}

	// JavaScript detection
	if (
		firstLine.includes('<script') ||
		/^(const|let|var|function|class|export|import)\s/.test(firstLine) ||
		/^import .* from ['"]/.test(firstLine) ||
		code.includes('function ') ||
		code.includes('=> {') ||
		code.includes('console.log') ||
		code.includes('require(')
	) {
		return 'javascript';
	}

	// Python detection
	if (
		/^(def|class|import|from|if __name__|print\(|async def)\s/.test(firstLine) ||
		code.includes('def ') ||
		(code.includes('import ') && !code.includes('from "'))
	) {
		return 'python';
	}

	// HTML detection
	if (
		firstLine.startsWith('<!DOCTYPE') ||
		firstLine.startsWith('<html') ||
		firstLine.startsWith('<div') ||
		/^<[a-z]+/.test(firstLine)
	) {
		return 'html';
	}

	// CSS detection
	if (
		/^[.#][\w-]+\s*\{/.test(firstLine) ||
		/^@(import|media|keyframes)/.test(firstLine) ||
		(code.includes('{') && code.includes(':') && code.includes(';') && !code.includes('function'))
	) {
		return 'css';
	}

	// JSON detection
	if (
		(firstLine.startsWith('{') || firstLine.startsWith('[')) &&
		(code.includes('":') || code.includes('" :')) &&
		!code.includes('function') &&
		!code.includes('=>')
	) {
		return 'json';
	}

	// Bash/Shell detection
	if (
		firstLine.startsWith('#!/bin/') ||
		firstLine.startsWith('$ ') ||
		/^(echo|cd|ls|npm|git|mkdir|rm|cp|mv)\s/.test(firstLine)
	) {
		return 'bash';
	}

	// SQL detection
	if (
		/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s/i.test(firstLine) ||
		code.toUpperCase().includes('SELECT ') ||
		code.toUpperCase().includes('FROM ')
	) {
		return 'sql';
	}

	// YAML detection
	if (/^[\w-]+:\s/.test(firstLine) && !code.includes(';') && !code.includes('{')) {
		return 'yaml';
	}

	// Markdown detection
	if (
		firstLine.startsWith('#') ||
		firstLine.startsWith('- ') ||
		firstLine.startsWith('* ') ||
		code.includes('```')
	) {
		return 'markdown';
	}

	return null;
}

/**
 * Update code block language
 */
export function setCodeBlockLanguage(view: EditorView, pos: number, language: string | null) {
	const { state } = view;
	const node = state.doc.nodeAt(pos);

	if (!node || node.type.name !== 'code_block') {
		return;
	}

	const tr = state.tr.setNodeMarkup(pos, undefined, {
		...node.attrs,
		language
	});

	view.dispatch(tr);
}
