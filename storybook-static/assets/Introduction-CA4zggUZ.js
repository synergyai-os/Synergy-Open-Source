import { j as n, M as t } from './WithTooltip-SK46ZJ2J-CmyzQ6a2.js';
import { useMDXComponents as r } from './index-CpSrf8b4.js';
import './preload-helper-PPVm8Dsz.js';
import './iframe-DYn7RqBV.js';
function i(s) {
	const e = {
		br: 'br',
		code: 'code',
		h1: 'h1',
		h2: 'h2',
		h3: 'h3',
		hr: 'hr',
		li: 'li',
		ol: 'ol',
		p: 'p',
		strong: 'strong',
		ul: 'ul',
		...r(),
		...s.components
	};
	return n.jsxs(n.Fragment, {
		children: [
			n.jsx(t, { title: 'Docs/Introduction' }),
			`
`,
			n.jsx(e.h1, {
				id: 'welcome-to-synergyos-design-system',
				children: 'Welcome to SynergyOS Design System'
			}),
			`
`,
			n.jsx(e.h2, { id: 'what-is-this', children: 'What is this?' }),
			`
`,
			n.jsxs(e.p, {
				children: [
					'SynergyOS Design System is a ',
					n.jsx(e.strong, { children: '4-layer architecture' }),
					' that cascades automatically:'
				]
			}),
			`
`,
			n.jsxs(e.p, {
				children: [
					n.jsx(e.strong, { children: 'Tokens' }),
					' → ',
					n.jsx(e.strong, { children: 'Utilities' }),
					' → ',
					n.jsx(e.strong, { children: 'Patterns' }),
					' → ',
					n.jsx(e.strong, { children: 'Components' })
				]
			}),
			`
`,
			n.jsx(e.p, {
				children: n.jsx(e.strong, {
					children: 'Change a token once → Updates entire app automatically'
				})
			}),
			`
`,
			n.jsx(e.hr, {}),
			`
`,
			n.jsx(e.h2, { id: '-key-concepts', children: '🎨 Key Concepts' }),
			`
`,
			n.jsx(e.h3, { id: 'design-tokens', children: 'Design Tokens' }),
			`
`,
			n.jsx(e.p, { children: 'Semantic variables that adapt to light/dark mode automatically.' }),
			`
`,
			n.jsx(e.p, { children: n.jsx(e.strong, { children: 'Example:' }) }),
			`
`,
			n.jsxs(e.ul, {
				children: [
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.code, { children: '--spacing-button-x' }),
							' (not hardcoded ',
							n.jsx(e.code, { children: '24px' }),
							')'
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.code, { children: '--color-accent-primary' }),
							' (not hardcoded ',
							n.jsx(e.code, { children: '#3b82f6' }),
							')'
						]
					}),
					`
`
				]
			}),
			`
`,
			n.jsxs(e.p, {
				children: [
					n.jsx(e.strong, { children: 'Why?' }),
					' Change once in ',
					n.jsx(e.code, { children: 'app.css' }),
					', updates everywhere. Dark mode automatic.'
				]
			}),
			`
`,
			n.jsxs(e.p, {
				children: [
					n.jsx(e.strong, { children: '⚠️ CRITICAL' }),
					': Hardcoded Tailwind values are blocked by ESLint. Always use semantic tokens.'
				]
			}),
			`
`,
			n.jsx(e.h3, { id: '️-atomic-design', children: '⚛️ Atomic Design' }),
			`
`,
			n.jsx(e.p, { children: 'We organize components using atomic design methodology:' }),
			`
`,
			n.jsxs(e.ul, {
				children: [
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.strong, { children: 'Atoms' }),
							': Single elements (Button, Input, Card, Badge)'
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.strong, { children: 'Molecules' }),
							': 2-3 atoms composed (FormField = Label + Input + Error)'
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.strong, { children: 'Organisms' }),
							': Complex sections (Header, Sidebar, Dialog)'
						]
					}),
					`
`
				]
			}),
			`
`,
			n.jsxs(e.p, {
				children: [
					n.jsx(e.strong, { children: 'Why?' }),
					' Clear hierarchy, reusability, composition over complexity.'
				]
			}),
			`
`,
			n.jsx(e.h3, { id: '-the-cascade', children: '🔄 The Cascade' }),
			`
`,
			n.jsxs(e.p, {
				children: [
					'When you change ',
					n.jsx(e.code, { children: '--spacing-button-x' }),
					' in tokens:'
				]
			}),
			`
`,
			n.jsxs(e.ol, {
				children: [
					`
`,
					n.jsxs(e.li, {
						children: ['Updates ', n.jsx(e.code, { children: 'px-button-x' }), ' utility']
					}),
					`
`,
					n.jsx(e.li, { children: 'Updates Button component' }),
					`
`,
					n.jsx(e.li, { children: 'Updates all pages using Button' }),
					`
`
				]
			}),
			`
`,
			n.jsx(e.p, { children: n.jsx(e.strong, { children: 'No manual updates needed!' }) }),
			`
`,
			n.jsx(e.hr, {}),
			`
`,
			n.jsx(e.h2, { id: '-getting-started', children: '🚀 Getting Started' }),
			`
`,
			n.jsxs(e.ol, {
				children: [
					`
`,
					n.jsxs(e.li, {
						children: [
							`
`,
							n.jsxs(e.p, { children: [n.jsx(e.strong, { children: 'Browse Components' }), ':'] }),
							`
`,
							n.jsxs(e.ul, {
								children: [
									`
`,
									n.jsx(e.li, { children: 'Explore Atoms → Molecules → Organisms' }),
									`
`,
									n.jsx(e.li, { children: 'See all variants, sizes, states' }),
									`
`
								]
							}),
							`
`
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							`
`,
							n.jsxs(e.p, {
								children: [n.jsx(e.strong, { children: 'Try Interactive Examples' }), ':']
							}),
							`
`,
							n.jsxs(e.ul, {
								children: [
									`
`,
									n.jsx(e.li, { children: 'Change controls in the Controls panel' }),
									`
`,
									n.jsx(e.li, { children: 'See live updates' }),
									`
`
								]
							}),
							`
`
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							`
`,
							n.jsxs(e.p, { children: [n.jsx(e.strong, { children: 'Copy Code' }), ':'] }),
							`
`,
							n.jsxs(e.ul, {
								children: [
									`
`,
									n.jsx(e.li, { children: 'Use code snippets in your components' }),
									`
`,
									n.jsx(e.li, { children: 'Follow token usage patterns' }),
									`
`
								]
							}),
							`
`
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							`
`,
							n.jsxs(e.p, { children: [n.jsx(e.strong, { children: 'Read Documentation' }), ':'] }),
							`
`,
							n.jsxs(e.ul, {
								children: [
									`
`,
									n.jsx(e.li, { children: 'Token Reference: See all design tokens' }),
									`
`,
									n.jsx(e.li, {
										children: 'Composition Patterns: Learn how to combine components'
									}),
									`
`,
									n.jsx(e.li, { children: 'Migration Guide: Convert hardcoded values to tokens' }),
									`
`
								]
							}),
							`
`
						]
					}),
					`
`
				]
			}),
			`
`,
			n.jsx(e.hr, {}),
			`
`,
			n.jsx(e.h2, { id: '-questions', children: '❓ Questions?' }),
			`
`,
			n.jsxs(e.ul, {
				children: [
					`
`,
					n.jsxs(e.li, {
						children: [
							'📖 ',
							n.jsx(e.strong, { children: 'Documentation' }),
							': See Token Reference and Composition Patterns pages'
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							'🐛 ',
							n.jsx(e.strong, { children: 'Found a bug?' }),
							': Create Linear ticket in Design System project'
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							'💡 ',
							n.jsx(e.strong, { children: 'Need help?' }),
							': Check component composition examples or ask in #design-system'
						]
					}),
					`
`
				]
			}),
			`
`,
			n.jsx(e.hr, {}),
			`
`,
			n.jsx(e.h2, { id: '-key-resources', children: '📚 Key Resources' }),
			`
`,
			n.jsxs(e.ul, {
				children: [
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.strong, { children: 'Design Tokens' }),
							': ',
							n.jsx(e.code, { children: 'dev-docs/2-areas/design/design-tokens.md' })
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.strong, { children: 'Component Architecture' }),
							': ',
							n.jsx(e.code, { children: 'dev-docs/2-areas/design/component-architecture.md' })
						]
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.strong, { children: 'Design Principles' }),
							': ',
							n.jsx(e.code, { children: 'dev-docs/2-areas/design/design-principles.md' })
						]
					}),
					`
`
				]
			}),
			`
`,
			n.jsx(e.hr, {}),
			`
`,
			n.jsxs(e.p, {
				children: [
					n.jsx(e.strong, { children: 'Last Updated' }),
					': November 2025',
					n.jsx(e.br, {}),
					`
`,
					n.jsx(e.strong, { children: 'Design System Version' }),
					': 1.0 (Phase 3 - 95% Complete)'
				]
			})
		]
	});
}
function h(s = {}) {
	const { wrapper: e } = { ...r(), ...s.components };
	return e ? n.jsx(e, { ...s, children: n.jsx(i, { ...s }) }) : i(s);
}
export { h as default };
