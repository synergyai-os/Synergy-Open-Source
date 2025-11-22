import {
	p as P,
	f as h,
	a as x,
	n as l,
	s as c,
	b as r,
	c as D,
	d as n,
	t as m
} from './iframe-DYn7RqBV.js';
import { c as z, i as L } from './create-runtime-stories-2rm03jka.js';
import { d as w } from './index-QxUtaCdU.js';
import { B as o } from './Button-2sxpTgAx.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './this-Hz0nHxQJ.js';
const O = {
		component: o,
		title: 'Design System/Atoms/Button',
		tags: ['autodocs'],
		argTypes: {
			variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'outline'] },
			size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
			disabled: { control: { type: 'boolean' } }
		}
	},
	{ Story: i } = w();
var A = h('<!> <!> <!> <!> <!> <!>', 1);
function y(S, b) {
	(P(b, !1), L());
	var _ = A(),
		$ = x(_);
	i($, {
		name: 'Primary',
		args: { variant: 'primary', size: 'md' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (a, u) => {
						var s = m('Button');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Button {...args}>Button</Button>' } }
	});
	var v = c($, 2);
	i(v, {
		name: 'Secondary',
		args: { variant: 'secondary', size: 'md' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (a, u) => {
						var s = m('Button');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Button {...args}>Button</Button>' } }
	});
	var g = c(v, 2);
	i(g, {
		name: 'Outline',
		args: { variant: 'outline', size: 'md' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (a, u) => {
						var s = m('Button');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Button {...args}>Button</Button>' } }
	});
	var f = c(g, 2);
	i(f, {
		name: 'Small',
		args: { variant: 'primary', size: 'sm' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (a, u) => {
						var s = m('Small Button');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Button {...args}>Small Button</Button>' } }
	});
	var B = c(f, 2);
	i(B, {
		name: 'Large',
		args: { variant: 'primary', size: 'lg' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (a, u) => {
						var s = m('Large Button');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Button {...args}>Large Button</Button>' } }
	});
	var C = c(B, 2);
	(i(C, {
		name: 'Disabled',
		args: { variant: 'primary', size: 'md', disabled: !0 },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (a, u) => {
						var s = m('Disabled Button');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Button {...args}>Disabled Button</Button>' } }
	}),
		r(S, _),
		D());
}
y.__docgen = { data: [], name: 'Button.stories.svelte' };
const p = z(y, O),
	H = ['Primary', 'Secondary', 'Outline', 'Small', 'Large', 'Disabled'],
	I = { ...p.Primary, tags: ['svelte-csf-v5'] },
	J = { ...p.Secondary, tags: ['svelte-csf-v5'] },
	K = { ...p.Outline, tags: ['svelte-csf-v5'] },
	N = { ...p.Small, tags: ['svelte-csf-v5'] },
	Q = { ...p.Large, tags: ['svelte-csf-v5'] },
	U = { ...p.Disabled, tags: ['svelte-csf-v5'] };
export {
	U as Disabled,
	Q as Large,
	K as Outline,
	I as Primary,
	J as Secondary,
	N as Small,
	H as __namedExportsOrder,
	O as default
};
