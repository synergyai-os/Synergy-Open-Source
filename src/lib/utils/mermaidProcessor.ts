/**
 * Mermaid Diagram Processor
 *
 * Processes Mermaid code blocks in HTML and renders them as SVG diagrams.
 * Used in documentation pages to render Mermaid diagrams from markdown.
 */

import mermaid from 'mermaid';
import { browser } from '$app/environment';

let initialized = false;

/**
 * Initialize Mermaid library (only once)
 */
async function initializeMermaid() {
	if (!browser || initialized) return;

	mermaid.initialize({
		startOnLoad: false,
		theme: 'default',
		securityLevel: 'strict',
		logLevel: 'error',
		fontFamily: 'inherit' // Use document font
	});

	initialized = true;
}

/**
 * Process Mermaid code blocks in HTML and render them as SVG diagrams
 *
 * @param html - HTML string containing Mermaid code blocks
 * @returns Processed HTML with Mermaid diagrams rendered
 */
export async function processMermaidInHtml(html: string): Promise<string> {
	if (!browser) {
		// On server, return HTML as-is (Mermaid will render client-side)
		return html;
	}

	await initializeMermaid();

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const codeBlocks = doc.querySelectorAll('pre code.language-mermaid');

	for (const block of codeBlocks) {
		const code = block.textContent || '';
		const parent = block.closest('pre');
		if (!parent) continue;

		try {
			const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
			const { svg } = await mermaid.render(id, code);
			parent.outerHTML = `<div class="mermaid-container">${svg}</div>`;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			parent.outerHTML = `<div class="mermaid-error"><pre>Error rendering Mermaid diagram:\n${errorMessage}\n\nCode:\n${code}</pre></div>`;
		}
	}

	return doc.body.innerHTML;
}
