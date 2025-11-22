import { j as e, M as i } from './WithTooltip-SK46ZJ2J-CmyzQ6a2.js';
import { useMDXComponents as r } from './index-CpSrf8b4.js';
import './preload-helper-PPVm8Dsz.js';
import './iframe-DYn7RqBV.js';
function s(n) {
	const d = {
		br: 'br',
		code: 'code',
		h1: 'h1',
		h2: 'h2',
		h3: 'h3',
		h4: 'h4',
		hr: 'hr',
		li: 'li',
		p: 'p',
		pre: 'pre',
		strong: 'strong',
		table: 'table',
		tbody: 'tbody',
		td: 'td',
		th: 'th',
		thead: 'thead',
		tr: 'tr',
		ul: 'ul',
		...r(),
		...n.components
	};
	return e.jsxs(e.Fragment, {
		children: [
			e.jsx(i, { title: 'Docs/Token Reference' }),
			`
`,
			e.jsx(d.h1, { id: 'token-reference', children: 'Token Reference' }),
			`
`,
			e.jsx(d.p, {
				children: 'Complete reference for all design tokens in the SynergyOS design system.'
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsx(d.h2, { id: '-token-usage-rules', children: '🎯 Token Usage Rules' }),
			`
`,
			e.jsx(d.p, {
				children: e.jsx(d.strong, { children: 'ALWAYS use tokens, NEVER hardcode values:' })
			}),
			`
`,
			e.jsxs(d.p, {
				children: [
					'❌ ',
					e.jsx(d.strong, { children: 'WRONG' }),
					': ',
					e.jsx(d.code, { children: 'class="px-4 py-2 bg-blue-600"' }),
					e.jsx(d.br, {}),
					`
`,
					'✅ ',
					e.jsx(d.strong, { children: 'CORRECT' }),
					': ',
					e.jsx(d.code, { children: 'class="px-button-x py-button-y bg-accent-primary"' })
				]
			}),
			`
`,
			e.jsxs(d.p, {
				children: [
					e.jsx(d.strong, { children: 'Why?' }),
					' Tokens cascade automatically. Change once, updates everywhere.'
				]
			}),
			`
`,
			e.jsx(d.p, { children: e.jsx(d.strong, { children: 'Automated Enforcement:' }) }),
			`
`,
			e.jsxs(d.ul, {
				children: [
					`
`,
					e.jsxs(d.li, {
						children: [
							'✅ ',
							e.jsx(d.strong, { children: 'ESLint Plugin' }),
							': Blocks arbitrary values like ',
							e.jsx(d.code, { children: 'min-h-[2.75rem]' }),
							', ',
							e.jsx(d.code, { children: 'p-[12px]' })
						]
					}),
					`
`,
					e.jsxs(d.li, {
						children: [
							'✅ ',
							e.jsx(d.strong, { children: 'Pre-commit Hook' }),
							': Prevents committing hardcoded Tailwind values'
						]
					}),
					`
`,
					e.jsxs(d.li, {
						children: [
							'✅ ',
							e.jsx(d.strong, { children: 'CI Validation' }),
							': GitHub Actions runs ',
							e.jsx(d.code, { children: 'npm run lint' }),
							' - PRs blocked if violations detected'
						]
					}),
					`
`
				]
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsx(d.h2, { id: '-spacing-tokens', children: '📏 Spacing Tokens' }),
			`
`,
			e.jsx(d.h3, { id: 'base-scale-4px-unit', children: 'Base Scale (4px unit)' }),
			`
`,
			e.jsx(d.p, { children: 'All spacing tokens reference this base scale:' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Value' }),
								e.jsx(d.th, { children: 'Pixels' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-0' }) }),
									e.jsx(d.td, { children: '0' }),
									e.jsx(d.td, { children: '0px' }),
									e.jsx(d.td, { children: 'No spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-1' }) }),
									e.jsx(d.td, { children: '0.25rem' }),
									e.jsx(d.td, { children: '4px' }),
									e.jsx(d.td, { children: 'Extra small spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-2' }) }),
									e.jsx(d.td, { children: '0.5rem' }),
									e.jsx(d.td, { children: '8px' }),
									e.jsx(d.td, { children: 'Small spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-3' }) }),
									e.jsx(d.td, { children: '0.75rem' }),
									e.jsx(d.td, { children: '12px' }),
									e.jsx(d.td, { children: 'Medium-small spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-4' }) }),
									e.jsx(d.td, { children: '1rem' }),
									e.jsx(d.td, { children: '16px' }),
									e.jsx(d.td, { children: 'Medium spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-5' }) }),
									e.jsx(d.td, { children: '1.25rem' }),
									e.jsx(d.td, { children: '20px' }),
									e.jsx(d.td, { children: 'Medium-large spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-6' }) }),
									e.jsx(d.td, { children: '1.5rem' }),
									e.jsx(d.td, { children: '24px' }),
									e.jsx(d.td, { children: 'Large spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-8' }) }),
									e.jsx(d.td, { children: '2rem' }),
									e.jsx(d.td, { children: '32px' }),
									e.jsx(d.td, { children: 'Extra large spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-12' }) }),
									e.jsx(d.td, { children: '3rem' }),
									e.jsx(d.td, { children: '48px' }),
									e.jsx(d.td, { children: '2XL spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-16' }) }),
									e.jsx(d.td, { children: '4rem' }),
									e.jsx(d.td, { children: '64px' }),
									e.jsx(d.td, { children: '3XL spacing' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.h3, { id: 'semantic-spacing-tokens', children: 'Semantic Spacing Tokens' }),
			`
`,
			e.jsx(d.p, { children: 'Component-specific spacing tokens (reference base scale):' }),
			`
`,
			e.jsx(d.h4, { id: 'application-ui-tokens', children: 'Application UI Tokens' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Value' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--spacing-nav-container-x' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'px-nav-container' }) }),
									e.jsx(d.td, { children: '0.5rem (8px)' }),
									e.jsx(d.td, { children: 'Nav container horizontal padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--spacing-nav-container-y' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'py-nav-container' }) }),
									e.jsx(d.td, { children: '0.5rem (8px)' }),
									e.jsx(d.td, { children: 'Nav container vertical padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-nav-item-x' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'px-nav-item' }) }),
									e.jsx(d.td, { children: '0.5rem (8px)' }),
									e.jsx(d.td, { children: 'Nav item horizontal padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-nav-item-y' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'py-nav-item' }) }),
									e.jsx(d.td, { children: '0.375rem (6px)' }),
									e.jsx(d.td, { children: 'Nav item vertical padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-menu-item-x' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'px-menu-item' }) }),
									e.jsx(d.td, { children: '0.625rem (10px)' }),
									e.jsx(d.td, { children: 'Menu/dropdown item horizontal padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-menu-item-y' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'py-menu-item' }) }),
									e.jsx(d.td, { children: '0.375rem (6px)' }),
									e.jsx(d.td, { children: 'Menu/dropdown item vertical padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-badge-x' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'px-badge' }) }),
									e.jsx(d.td, { children: '0.375rem (6px)' }),
									e.jsx(d.td, { children: 'Badge horizontal padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-badge-y' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'py-badge' }) }),
									e.jsx(d.td, { children: '0.125rem (2px)' }),
									e.jsx(d.td, { children: 'Badge vertical padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-icon-gap' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'gap-icon' }) }),
									e.jsx(d.td, { children: '0.5rem (8px)' }),
									e.jsx(d.td, { children: 'Standard icon-text gap' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-icon-gap-wide' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'gap-icon-wide' }) }),
									e.jsx(d.td, { children: '0.625rem (10px)' }),
									e.jsx(d.td, { children: 'Wider icon-text gap' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.h4, { id: 'button-component-tokens', children: 'Button Component Tokens' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Value' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-button-x' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'px-button-x' }) }),
									e.jsx(d.td, { children: '1.5rem (24px)' }),
									e.jsx(d.td, { children: 'Button horizontal padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-button-y' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'py-button-y' }) }),
									e.jsx(d.td, { children: '0.75rem (12px)' }),
									e.jsx(d.td, { children: 'Button vertical padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-button-icon' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'p-button-icon' }) }),
									e.jsx(d.td, { children: '0.75rem (12px)' }),
									e.jsx(d.td, { children: 'Icon-only button padding (square)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--size-button-height' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'min-h-button' }) }),
									e.jsx(d.td, { children: '2.75rem (44px)' }),
									e.jsx(d.td, { children: 'Minimum button height (all types)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--spacing-button-group' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'gap-button-group' }) }),
									e.jsx(d.td, { children: '0.5rem (8px)' }),
									e.jsx(d.td, { children: 'Gap between buttons in action group' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.h4, { id: 'card-component-tokens', children: 'Card Component Tokens' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Value' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--spacing-card-padding-x' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'px-card' }) }),
									e.jsx(d.td, { children: '1.25rem (20px)' }),
									e.jsx(d.td, { children: 'Card horizontal padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--spacing-card-padding-y' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'py-card' }) }),
									e.jsx(d.td, { children: '1.25rem (20px)' }),
									e.jsx(d.td, { children: 'Card vertical padding' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.h4, { id: 'marketing-page-tokens', children: 'Marketing Page Tokens' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Value' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--spacing-marketing-section-y' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'py-marketing-section' }) }),
									e.jsx(d.td, { children: '7rem (112px)' }),
									e.jsx(d.td, { children: 'Section vertical padding (top and bottom)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--spacing-marketing-container-x' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'px-marketing-container' }) }),
									e.jsx(d.td, { children: '1.5rem (24px)' }),
									e.jsx(d.td, { children: 'Page horizontal padding (mobile/desktop)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--spacing-marketing-card-padding' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'p-marketing-card' }) }),
									e.jsx(d.td, { children: '2.5rem (40px)' }),
									e.jsx(d.td, { children: 'Card internal padding' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--spacing-marketing-card-gap' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'gap-marketing-card' }) }),
									e.jsx(d.td, { children: '2rem (32px)' }),
									e.jsx(d.td, { children: 'Gap between cards in grid' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.h3, { id: 'utility-classes', children: 'Utility Classes' }),
			`
`,
			e.jsx(d.p, { children: e.jsx(d.strong, { children: 'Use utility classes in components:' }) }),
			`
`,
			e.jsx(d.pre, {
				children: e.jsx(d.code, {
					className: 'language-svelte',
					children: `<!-- Button -->
<button class="min-h-button rounded-button px-button-x py-button-y"> Click me </button>

<!-- Card -->
<div class="rounded-card bg-elevated px-card py-card">Card content</div>

<!-- Nav Item -->
<a class="flex items-center gap-icon px-nav-item py-nav-item">
	<Icon class="icon-md" />
	<span>Nav Item</span>
</a>
`
				})
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsx(d.h2, { id: '-color-tokens', children: '🎨 Color Tokens' }),
			`
`,
			e.jsx(d.h3, {
				id: 'semantic-colors-auto-dark-mode',
				children: 'Semantic Colors (Auto Dark Mode)'
			}),
			`
`,
			e.jsx(d.p, { children: 'All color tokens adapt automatically to light/dark mode:' }),
			`
`,
			e.jsx(d.h4, { id: 'surface-colors', children: 'Surface Colors' }),
			`
`,
			e.jsxs('div', {
				style: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' },
				children: [
					e.jsx('div', {
						style: {
							background: 'var(--color-bg-base)',
							padding: 'var(--spacing-4)',
							borderRadius: '8px',
							border: '1px solid var(--color-border-base)'
						},
						children: e.jsxs(d.p, {
							children: [
								e.jsx('code', { children: 'bg-base' }),
								' - Base background (page background)'
							]
						})
					}),
					e.jsx('div', {
						style: {
							background: 'var(--color-bg-surface)',
							padding: 'var(--spacing-4)',
							borderRadius: '8px',
							border: '1px solid var(--color-border-base)'
						},
						children: e.jsxs(d.p, {
							children: [
								e.jsx('code', { children: 'bg-surface' }),
								' - Surface background (panels, lists)'
							]
						})
					}),
					e.jsx('div', {
						style: {
							background: 'var(--color-bg-elevated)',
							padding: 'var(--spacing-4)',
							borderRadius: '8px',
							border: '1px solid var(--color-border-elevated)'
						},
						children: e.jsxs(d.p, {
							children: [
								e.jsx('code', { children: 'bg-elevated' }),
								' - Elevated surfaces (cards, modals)'
							]
						})
					})
				]
			}),
			`
`,
			e.jsx(d.h4, { id: 'text-colors', children: 'Text Colors' }),
			`
`,
			e.jsxs('div', {
				style: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' },
				children: [
					e.jsx('div', {
						style: { color: 'var(--color-text-primary)' },
						children: e.jsxs(d.p, {
							children: [
								e.jsx('code', { children: 'text-primary' }),
								' - Primary text (headings, important content)'
							]
						})
					}),
					e.jsx('div', {
						style: { color: 'var(--color-text-secondary)' },
						children: e.jsxs(d.p, {
							children: [
								e.jsx('code', { children: 'text-secondary' }),
								' - Secondary text (descriptions, subtitles)'
							]
						})
					}),
					e.jsx('div', {
						style: { color: 'var(--color-text-tertiary)' },
						children: e.jsxs(d.p, {
							children: [
								e.jsx('code', { children: 'text-tertiary' }),
								' - Tertiary text (labels, hints)'
							]
						})
					})
				]
			}),
			`
`,
			e.jsx(d.h4, { id: 'accent-colors', children: 'Accent Colors' }),
			`
`,
			e.jsxs('div', {
				style: { display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' },
				children: [
					e.jsx('div', {
						style: {
							background: 'var(--color-accent-primary)',
							padding: 'var(--spacing-4)',
							borderRadius: '8px',
							color: 'white'
						},
						children: e.jsx('code', { children: 'bg-accent-primary' })
					}),
					e.jsx('div', {
						style: {
							background: 'var(--color-bg-selected)',
							padding: 'var(--spacing-4)',
							borderRadius: '8px',
							color: 'white'
						},
						children: e.jsx('code', { children: 'bg-selected' })
					})
				]
			}),
			`
`,
			e.jsx(d.h4, { id: 'interactive-states', children: 'Interactive States' }),
			`
`,
			e.jsxs('div', {
				style: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' },
				children: [
					e.jsx('div', {
						style: {
							background: 'var(--color-bg-hover)',
							padding: 'var(--spacing-4)',
							borderRadius: '8px'
						},
						children: e.jsxs(d.p, {
							children: [
								e.jsx('code', { children: 'bg-hover' }),
								' - Hover background (subtle, 50% opacity)'
							]
						})
					}),
					e.jsx('div', {
						style: {
							background: 'var(--color-bg-hover-solid)',
							padding: 'var(--spacing-4)',
							borderRadius: '8px'
						},
						children: e.jsxs(d.p, {
							children: [
								e.jsx('code', { children: 'bg-hover-solid' }),
								' - Hover background (solid)'
							]
						})
					})
				]
			}),
			`
`,
			e.jsx(d.h4, { id: 'complete-color-reference', children: 'Complete Color Reference' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Dark Mode' }),
								e.jsx(d.th, { children: 'Light Mode' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-text-primary' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-primary' }) }),
									e.jsx(d.td, { children: 'white' }),
									e.jsx(d.td, { children: 'gray-900' }),
									e.jsx(d.td, { children: 'Primary text (headings, important content)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-text-secondary' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-secondary' }) }),
									e.jsx(d.td, { children: 'gray-300' }),
									e.jsx(d.td, { children: 'gray-600' }),
									e.jsx(d.td, { children: 'Secondary text (descriptions, subtitles)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-text-tertiary' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-tertiary' }) }),
									e.jsx(d.td, { children: 'gray-500' }),
									e.jsx(d.td, { children: 'gray-500' }),
									e.jsx(d.td, { children: 'Tertiary text (labels, hints)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-bg-base' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'bg-base' }) }),
									e.jsx(d.td, { children: 'gray-900' }),
									e.jsx(d.td, { children: 'white' }),
									e.jsx(d.td, { children: 'Base background (page background)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-bg-surface' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'bg-surface' }) }),
									e.jsx(d.td, { children: 'gray-800' }),
									e.jsx(d.td, { children: 'gray-50' }),
									e.jsx(d.td, { children: 'Surface background (panels, lists)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-bg-elevated' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'bg-elevated' }) }),
									e.jsx(d.td, { children: 'gray-750' }),
									e.jsx(d.td, { children: 'white' }),
									e.jsx(d.td, { children: 'Elevated surfaces (cards, modals)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-border-base' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'border-base' }) }),
									e.jsx(d.td, { children: 'gray-800' }),
									e.jsx(d.td, { children: 'gray-200' }),
									e.jsx(d.td, { children: 'Base borders' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-border-elevated' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'border-elevated' }) }),
									e.jsx(d.td, { children: 'gray-700' }),
									e.jsx(d.td, { children: 'gray-300' }),
									e.jsx(d.td, { children: 'Elevated borders (cards)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-accent-primary' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'bg-accent-primary' }) }),
									e.jsx(d.td, { children: 'blue-600' }),
									e.jsx(d.td, { children: 'blue-600' }),
									e.jsx(d.td, { children: 'Primary accent (selected states, links)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-bg-hover' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'hover:bg-hover' }) }),
									e.jsx(d.td, { children: 'gray-800/50' }),
									e.jsx(d.td, { children: 'gray-100/50' }),
									e.jsx(d.td, { children: 'Hover background (subtle)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-bg-hover-solid' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'hover:bg-hover-solid' }) }),
									e.jsx(d.td, { children: 'gray-800' }),
									e.jsx(d.td, { children: 'gray-100' }),
									e.jsx(d.td, { children: 'Hover background (solid)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-bg-selected' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'bg-selected' }) }),
									e.jsx(d.td, { children: 'blue-600' }),
									e.jsx(d.td, { children: 'blue-600' }),
									e.jsx(d.td, { children: 'Selected state background' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-tag-bg' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'bg-tag' }) }),
									e.jsx(d.td, { children: 'gray-700' }),
									e.jsx(d.td, { children: 'gray-100' }),
									e.jsx(d.td, { children: 'Tag/chip background' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--color-tag-text' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-tag' }) }),
									e.jsx(d.td, { children: 'gray-300' }),
									e.jsx(d.td, { children: 'gray-600' }),
									e.jsx(d.td, { children: 'Tag/chip text' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsx(d.h2, { id: '️-typography-tokens', children: '✍️ Typography Tokens' }),
			`
`,
			e.jsx(d.h3, { id: 'font-families', children: 'Font Families' }),
			`
`,
			e.jsx(d.pre, {
				children: e.jsx(d.code, {
					className: 'language-css',
					children: `font-sans /* Inter, system-ui */
font-mono /* JetBrains Mono, monospace */
`
				})
			}),
			`
`,
			e.jsx(d.h3, { id: 'text-sizes', children: 'Text Sizes' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Size' }),
								e.jsx(d.th, { children: 'Line Height' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--font-size-h1' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-h1' }) }),
									e.jsx(d.td, { children: '2.25rem (36px)' }),
									e.jsx(d.td, { children: '700' }),
									e.jsx(d.td, { children: 'Page titles' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--font-size-h2' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-h2' }) }),
									e.jsx(d.td, { children: '1.75rem (28px)' }),
									e.jsx(d.td, { children: '600' }),
									e.jsx(d.td, { children: 'Section headings' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--font-size-h3' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-h3' }) }),
									e.jsx(d.td, { children: '1.25rem (20px)' }),
									e.jsx(d.td, { children: '600' }),
									e.jsx(d.td, { children: 'Subsection headings' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--font-size-body' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-body' }) }),
									e.jsx(d.td, { children: '1rem (16px)' }),
									e.jsx(d.td, { children: '1.5rem' }),
									e.jsx(d.td, { children: 'Body text' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--font-size-small' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-small' }) }),
									e.jsx(d.td, { children: '0.875rem (14px)' }),
									e.jsx(d.td, { children: '1.25rem' }),
									e.jsx(d.td, { children: 'Captions, labels' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--text-label' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'text-label' }) }),
									e.jsx(d.td, { children: '0.625rem (10px)' }),
									e.jsx(d.td, { children: '1rem' }),
									e.jsx(d.td, { children: 'Form labels, badges' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.p, { children: e.jsx(d.strong, { children: 'Example:' }) }),
			`
`,
			e.jsx(d.pre, {
				children: e.jsx(d.code, {
					className: 'language-svelte',
					children: `<h1 class="font-sans text-h1 text-primary">Page Title</h1>
<h2 class="font-sans text-h2 text-primary">Section Title</h2>
<p class="text-body text-secondary">Body text content</p>
<span class="text-small text-tertiary">Caption text</span>
<span class="bg-tag px-badge py-badge text-label text-tag">Badge</span>
`
				})
			}),
			`
`,
			e.jsx(d.h3, {
				id: 'readability-tokens-optimized-for-adhdfocus-challenged-users',
				children: 'Readability Tokens (Optimized for ADHD/Focus-Challenged Users)'
			}),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Value' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--line-height-readable' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'leading-readable' }) }),
									e.jsx(d.td, { children: '1.75' }),
									e.jsx(d.td, { children: 'Optimal line-height for comfortable reading' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--letter-spacing-readable' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'tracking-readable' }) }),
									e.jsx(d.td, { children: '0 (normal)' }),
									e.jsx(d.td, { children: 'Normal letter spacing' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--max-width-readable' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'max-w-readable' }) }),
									e.jsx(d.td, { children: '42rem (672px)' }),
									e.jsx(d.td, { children: 'Optimal reading width (65-75 characters per line)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, {
										children: e.jsx(d.code, { children: '--spacing-readable-quote-y' })
									}),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'py-readable-quote' }) }),
									e.jsx(d.td, { children: '2rem (32px)' }),
									e.jsx(d.td, { children: 'Vertical padding for quote/highlight containers' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsx(d.h2, { id: '-border-radius-tokens', children: '📐 Border Radius Tokens' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Value' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--border-radius-button' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'rounded-button' }) }),
									e.jsx(d.td, { children: '0.5rem (8px)' }),
									e.jsx(d.td, { children: 'Buttons' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--border-radius-card' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'rounded-card' }) }),
									e.jsx(d.td, { children: '0.875rem (14px)' }),
									e.jsx(d.td, { children: 'Cards' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--border-radius-dialog' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'rounded-dialog' }) }),
									e.jsx(d.td, { children: '0.875rem (14px)' }),
									e.jsx(d.td, { children: 'Dialogs, modals' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--border-radius-input' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'rounded-input' }) }),
									e.jsx(d.td, { children: '0.125rem (2px)' }),
									e.jsx(d.td, { children: 'Form inputs' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--border-radius-badge' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'rounded-badge' }) }),
									e.jsx(d.td, { children: '0.25rem (4px)' }),
									e.jsx(d.td, { children: 'Badges' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--border-radius-chip' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'rounded-chip' }) }),
									e.jsx(d.td, { children: '9999px (full)' }),
									e.jsx(d.td, { children: 'Chips (pill shape)' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.p, { children: e.jsx(d.strong, { children: 'Example:' }) }),
			`
`,
			e.jsx(d.pre, {
				children: e.jsx(d.code, {
					className: 'language-svelte',
					children: `<button class="rounded-button bg-accent-primary px-button-x py-button-y">Button</button>
<div class="rounded-card bg-elevated px-card py-card">Card</div>
<input class="rounded-input border border-base px-input-x py-input-y" />
<span class="rounded-badge bg-tag px-badge py-badge text-tag">Badge</span>
`
				})
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsx(d.h2, { id: '-icon-size-tokens', children: '🔤 Icon Size Tokens' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Value' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--size-icon-xs' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'icon-xs' }) }),
									e.jsx(d.td, { children: '0.75rem (12px)' }),
									e.jsx(d.td, { children: 'Extra small icons' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--size-icon-sm' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'icon-sm' }) }),
									e.jsx(d.td, { children: '1rem (16px)' }),
									e.jsx(d.td, { children: 'Small icons' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--size-icon-md' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'icon-md' }) }),
									e.jsx(d.td, { children: '1.25rem (20px)' }),
									e.jsx(d.td, { children: 'Medium icons (standard)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--size-icon-lg' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'icon-lg' }) }),
									e.jsx(d.td, { children: '1.5rem (24px)' }),
									e.jsx(d.td, { children: 'Large icons' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--size-icon-xl' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'icon-xl' }) }),
									e.jsx(d.td, { children: '2rem (32px)' }),
									e.jsx(d.td, { children: 'Extra large icons' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.p, { children: e.jsx(d.strong, { children: 'Example:' }) }),
			`
`,
			e.jsx(d.pre, {
				children: e.jsx(d.code, {
					className: 'language-svelte',
					children: `<button class="flex items-center gap-icon">
	<svg class="icon-md">...</svg>
	<span>Click me</span>
</button>
`
				})
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsx(d.h2, { id: '-transition-tokens', children: '🎭 Transition Tokens' }),
			`
`,
			e.jsxs(d.table, {
				children: [
					e.jsx(d.thead, {
						children: e.jsxs(d.tr, {
							children: [
								e.jsx(d.th, { children: 'Token' }),
								e.jsx(d.th, { children: 'Utility Class' }),
								e.jsx(d.th, { children: 'Value' }),
								e.jsx(d.th, { children: 'Usage' })
							]
						})
					}),
					e.jsxs(d.tbody, {
						children: [
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--transition-default' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'transition-default' }) }),
									e.jsx(d.td, { children: 'all 0.2s ease' }),
									e.jsx(d.td, { children: 'Default transition (all props)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--transition-slow' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'transition-slow' }) }),
									e.jsx(d.td, { children: 'all 0.3s ease-in-out' }),
									e.jsx(d.td, { children: 'Slow transition (animations)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--transition-fast' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'transition-fast' }) }),
									e.jsx(d.td, { children: 'all 0.15s ease' }),
									e.jsx(d.td, { children: 'Fast transition (micro-interactions)' })
								]
							}),
							e.jsxs(d.tr, {
								children: [
									e.jsx(d.td, { children: e.jsx(d.code, { children: '--transition-colors' }) }),
									e.jsx(d.td, { children: e.jsx(d.code, { children: 'transition-colors-token' }) }),
									e.jsx(d.td, { children: 'color, background-color, border-color 0.2s ease' }),
									e.jsx(d.td, { children: 'Color transitions only (optimized)' })
								]
							})
						]
					})
				]
			}),
			`
`,
			e.jsx(d.p, { children: e.jsx(d.strong, { children: 'Example:' }) }),
			`
`,
			e.jsx(d.pre, {
				children: e.jsx(d.code, {
					className: 'language-svelte',
					children: `<button class="bg-accent-primary transition-colors-token hover:bg-accent-hover"> Hover me </button>
`
				})
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsx(d.h2, { id: '-reference-documentation', children: '📚 Reference Documentation' }),
			`
`,
			e.jsxs(d.p, {
				children: [
					e.jsx(d.strong, { children: 'Complete token list' }),
					': ',
					e.jsx(d.code, { children: 'dev-docs/2-areas/design/design-tokens.md' }),
					' - Full documentation with usage patterns and examples',
					e.jsx(d.br, {}),
					`
`,
					e.jsx(d.strong, { children: 'Source of truth' }),
					': ',
					e.jsx(d.code, { children: 'design-system.json' }),
					' - Token specifications and values',
					e.jsx(d.br, {}),
					`
`,
					e.jsx(d.strong, { children: 'Implementation' }),
					': ',
					e.jsx(d.code, { children: 'src/app.css' }),
					' - CSS variable definitions and utility classes'
				]
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsx(d.h2, { id: '-common-violations', children: '🚫 Common Violations' }),
			`
`,
			e.jsx(d.p, { children: e.jsx(d.strong, { children: '❌ BLOCKED - Will fail lint:' }) }),
			`
`,
			e.jsx(d.pre, {
				children: e.jsx(d.code, {
					className: 'language-svelte',
					children: `<!-- Hardcoded sizes -->
<button class="min-h-[2.75rem]">Click</button>
<div class="p-[12px]">Content</div>

<!-- Hardcoded spacing -->
<div class="mt-[24px] mb-[16px]">Content</div>

<!-- Hardcoded colors -->
<div class="bg-gray-900 text-white">Content</div>
`
				})
			}),
			`
`,
			e.jsx(d.p, { children: e.jsx(d.strong, { children: '✅ CORRECT - Uses tokens:' }) }),
			`
`,
			e.jsx(d.pre, {
				children: e.jsx(d.code, {
					className: 'language-svelte',
					children: `<!-- Token-based sizes -->
<button class="min-h-button">Click</button>
<div class="p-button-icon">Content</div>

<!-- Token-based spacing -->
<div class="mt-content-section mb-marketing-text">Content</div>

<!-- Token-based colors -->
<div class="bg-base text-primary">Content</div>
`
				})
			}),
			`
`,
			e.jsx(d.hr, {}),
			`
`,
			e.jsxs(d.p, {
				children: [
					e.jsx(d.strong, { children: 'Last Updated' }),
					': November 2025',
					e.jsx(d.br, {}),
					`
`,
					e.jsx(d.strong, { children: 'Total Tokens' }),
					': 100+ (spacing, colors, typography, borders, transitions, icons)'
				]
			})
		]
	});
}
function x(n = {}) {
	const { wrapper: d } = { ...r(), ...n.components };
	return d ? e.jsx(d, { ...n, children: e.jsx(s, { ...n }) }) : s(n);
}
export { x as default };
