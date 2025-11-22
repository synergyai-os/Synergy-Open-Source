import {
	p as G,
	f as C,
	a as H,
	n as g,
	s as u,
	b as e,
	c as S,
	d as k,
	e as y,
	g as d
} from './iframe-DYn7RqBV.js';
import { c as P, i as A } from './create-runtime-stories-2rm03jka.js';
import { d as E } from './index-QxUtaCdU.js';
import { I as a } from './IconButton-BjKeipeo.js';
import { I as i } from './Icon-nf143nWr.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './this-Hz0nHxQJ.js';
const V = {
		component: a,
		title: 'Design System/Atoms/IconButton',
		tags: ['autodocs'],
		argTypes: {
			variant: { control: { type: 'select' }, options: ['ghost', 'solid'] },
			disabled: { control: { type: 'boolean' } },
			ariaLabel: { control: { type: 'text' } }
		}
	},
	{ Story: h } = E();
var O = d(
		'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>'
	),
	R = d(
		'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
	),
	T = d(
		'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>'
	),
	q = d(
		'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>'
	),
	F = d(
		'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>'
	),
	J = d(
		'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>'
	),
	K = C('<div class="flex gap-2"><!> <!> <!></div>'),
	N = C('<!> <!> <!> <!>', 1);
function z(L, M) {
	(G(M, !1), A());
	var _ = N(),
		I = H(_);
	h(I, {
		name: 'Ghost',
		args: { variant: 'ghost', ariaLabel: 'Add item' },
		template: (s, l = g) => {
			const o = (n) => {
				i(n, {
					size: 'md',
					children: (r, m) => {
						var t = O();
						e(r, t);
					},
					$$slots: { default: !0 }
				});
			};
			a(
				s,
				k(l, {
					get icon() {
						return o;
					}
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `{#snippet addIcon()}
	<Icon size="md">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
	</Icon>
{/snippet}
<IconButton {...args} icon={addIcon} />`
			}
		}
	});
	var $ = u(I, 2);
	h($, {
		name: 'Solid',
		args: { variant: 'solid', ariaLabel: 'Delete item' },
		template: (s, l = g) => {
			const o = (n) => {
				i(n, {
					size: 'md',
					children: (r, m) => {
						var t = R();
						e(r, t);
					},
					$$slots: { default: !0 }
				});
			};
			a(
				s,
				k(l, {
					get icon() {
						return o;
					}
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `{#snippet deleteIcon()}
	<Icon size="md">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</Icon>
{/snippet}
<IconButton {...args} icon={deleteIcon} />`
			}
		}
	});
	var x = u($, 2);
	h(x, {
		name: 'Disabled',
		args: { variant: 'ghost', disabled: !0, ariaLabel: 'Disabled button' },
		template: (s, l = g) => {
			const o = (n) => {
				i(n, {
					size: 'md',
					children: (r, m) => {
						var t = T();
						e(r, t);
					},
					$$slots: { default: !0 }
				});
			};
			a(
				s,
				k(l, {
					get icon() {
						return o;
					}
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `{#snippet disabledIcon()}
	<Icon size="md">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
	</Icon>
{/snippet}
<IconButton {...args} icon={disabledIcon} />`
			}
		}
	});
	var j = u(x, 2);
	(h(j, {
		name: 'Group',
		args: { variant: 'ghost', ariaLabel: 'Actions' },
		template: (s, l = g) => {
			var o = K();
			const n = (c) => {
					i(c, {
						size: 'md',
						children: (p, B) => {
							var v = q();
							e(p, v);
						},
						$$slots: { default: !0 }
					});
				},
				r = (c) => {
					i(c, {
						size: 'md',
						children: (p, B) => {
							var v = F();
							e(p, v);
						},
						$$slots: { default: !0 }
					});
				},
				m = (c) => {
					i(c, {
						size: 'md',
						children: (p, B) => {
							var v = J();
							e(p, v);
						},
						$$slots: { default: !0 }
					});
				};
			var t = y(o);
			a(t, {
				variant: 'ghost',
				ariaLabel: 'Edit',
				get icon() {
					return n;
				}
			});
			var b = u(t, 2);
			a(b, {
				variant: 'ghost',
				ariaLabel: 'Delete',
				get icon() {
					return r;
				}
			});
			var D = u(b, 2);
			(a(D, {
				variant: 'ghost',
				ariaLabel: 'Share',
				get icon() {
					return m;
				}
			}),
				e(s, o));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `{#snippet editIcon()}
	<Icon size="md">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
		</svg>
	</Icon>
{/snippet}
{#snippet deleteIcon()}
	<Icon size="md">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
	</Icon>
{/snippet}
{#snippet shareIcon()}
	<Icon size="md">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-full w-full">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
		</svg>
	</Icon>
{/snippet}
<div class="flex gap-2">
	<IconButton variant="ghost" ariaLabel="Edit" icon={editIcon} />
	<IconButton variant="ghost" ariaLabel="Delete" icon={deleteIcon} />
	<IconButton variant="ghost" ariaLabel="Share" icon={shareIcon} />
</div>`
			}
		}
	}),
		e(L, _),
		S());
}
z.__docgen = { data: [], name: 'IconButton.stories.svelte' };
const w = P(z, V),
	no = ['Ghost', 'Solid', 'Disabled', 'Group'],
	ro = { ...w.Ghost, tags: ['svelte-csf-v5'] },
	ao = { ...w.Solid, tags: ['svelte-csf-v5'] },
	lo = { ...w.Disabled, tags: ['svelte-csf-v5'] },
	io = { ...w.Group, tags: ['svelte-csf-v5'] };
export {
	lo as Disabled,
	ro as Ghost,
	io as Group,
	ao as Solid,
	no as __namedExportsOrder,
	V as default
};
