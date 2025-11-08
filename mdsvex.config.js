import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { createHighlighter } from 'shiki';

// Create highlighter instance
const highlighter = await createHighlighter({
	themes: ['github-dark', 'github-light'],
	langs: ['javascript', 'typescript', 'svelte', 'bash', 'json', 'markdown', 'css', 'html']
});

const config = defineConfig({
	extensions: ['.svx', '.md'],
	
	highlight: {
		highlighter: async (code, lang = 'text') => {
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

