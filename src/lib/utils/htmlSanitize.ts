import { browser } from '$app/environment';
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * SSR-safe: Returns unsanitized HTML on server, sanitized on client.
 *
 * Configuration allows markdown-safe HTML tags while preserving:
 * - Heading IDs (for anchor links)
 * - Link hrefs (for navigation)
 * - Code blocks and syntax highlighting
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string (or original on server)
 */
export function sanitizeHtml(html: string): string {
	// SSR: Return unsanitized HTML on server (DOMPurify requires DOM)
	if (!browser) {
		return html;
	}

	// Configure DOMPurify to allow markdown-safe HTML tags
	const config = {
		// Allow markdown-safe tags
		ALLOWED_TAGS: [
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'p',
			'br',
			'strong',
			'em',
			'u',
			's',
			'code',
			'pre',
			'a',
			'ul',
			'ol',
			'li',
			'blockquote',
			'hr',
			'table',
			'thead',
			'tbody',
			'tr',
			'th',
			'td',
			'img',
			'del',
			'ins'
		],
		// Allow attributes needed for markdown functionality
		ALLOWED_ATTR: [
			'href', // Links
			'title', // Link titles
			'id', // Heading IDs (for anchor links)
			'src', // Images
			'alt', // Image alt text
			'class', // Styling classes
			'lang', // Language attributes
			'data-*' // Data attributes
		],
		// Preserve IDs on headings (critical for anchor links)
		KEEP_CONTENT: true,
		// Allow safe URLs only
		ALLOW_DATA_ATTR: true
	};

	// Type assertion needed due to DOMPurify type definition mismatch between Config types
	// Using 'unknown' first to safely cast between incompatible Config type definitions
	return DOMPurify.sanitize(html, config as unknown as Parameters<typeof DOMPurify.sanitize>[1]);
}
