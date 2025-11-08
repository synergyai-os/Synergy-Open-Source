import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { createHighlighter } from 'shiki';

// Lazy highlighter creation to avoid top-level await
let highlighterPromise;
function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ['github-dark', 'github-light'],
			langs: ['javascript', 'typescript', 'svelte', 'bash', 'json', 'markdown', 'css', 'html']
		});
	}
	return highlighterPromise;
}

const config = defineConfig({
	extensions: ['.svx', '.md'],
	
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await getHighlighter();
			const html = highlighter.codeToHtml(code, {
				lang,
				themes: {
					light: 'github-light',
					dark: 'github-dark'
				}
			});
			return `{@html \`${html}\` }`;
		}
	},
	
	rehypePlugins: [
		rehypeSlug,
		[
			rehypeAutolinkHeadings,
			{
				behavior: 'wrap'
			}
		]
	],
	
	smartypants: {
		dashes: 'oldschool'
	}
});

export default config;

