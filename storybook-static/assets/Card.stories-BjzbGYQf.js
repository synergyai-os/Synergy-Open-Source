import {
	p as P,
	f as k,
	a as x,
	n as l,
	s as v,
	b as r,
	c as y,
	d,
	t as n
} from './iframe-DYn7RqBV.js';
import { c as D, i as E } from './create-runtime-stories-2rm03jka.js';
import { d as O } from './index-QxUtaCdU.js';
import { C as o } from './Card-BkEjQl_7.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './this-Hz0nHxQJ.js';
const N = {
		component: o,
		title: 'Design System/Atoms/Card',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'elevated', 'outlined', 'noPadding']
			},
			clickable: { control: { type: 'boolean' } }
		}
	},
	{ Story: i } = O();
var S = k('<!> <!> <!> <!> <!>', 1);
function g(h, w) {
	(P(w, !1), E());
	var f = S(),
		u = x(f);
	i(u, {
		name: 'Default',
		args: { variant: 'default' },
		template: (t, e = l) => {
			o(
				t,
				d(e, {
					children: (a, m) => {
						var s = n('Card content with default styling');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: { rawCode: '<Card {...args}>Card content with default styling</Card>' }
		}
	});
	var C = v(u, 2);
	i(C, {
		name: 'Elevated',
		args: { variant: 'elevated' },
		template: (t, e = l) => {
			o(
				t,
				d(e, {
					children: (a, m) => {
						var s = n('Card content with elevated shadow');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: { rawCode: '<Card {...args}>Card content with elevated shadow</Card>' }
		}
	});
	var _ = v(C, 2);
	i(_, {
		name: 'Outlined',
		args: { variant: 'outlined' },
		template: (t, e = l) => {
			o(
				t,
				d(e, {
					children: (a, m) => {
						var s = n('Card content with outlined border');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: { rawCode: '<Card {...args}>Card content with outlined border</Card>' }
		}
	});
	var $ = v(_, 2);
	i($, {
		name: 'Clickable',
		args: { variant: 'elevated', clickable: !0 },
		template: (t, e = l) => {
			o(
				t,
				d(e, {
					children: (a, m) => {
						var s = n('Clickable card with hover effect');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: { rawCode: '<Card {...args}>Clickable card with hover effect</Card>' }
		}
	});
	var b = v($, 2);
	(i(b, {
		name: 'NoPadding',
		args: { variant: 'noPadding' },
		template: (t, e = l) => {
			o(
				t,
				d(e, {
					children: (a, m) => {
						var s = n('Card without padding for composition');
						r(a, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: { rawCode: '<Card {...args}>Card without padding for composition</Card>' }
		}
	}),
		r(h, f),
		y());
}
g.__docgen = { data: [], name: 'Card.stories.svelte' };
const c = D(g, N),
	G = ['Default', 'Elevated', 'Outlined', 'Clickable', 'NoPadding'],
	H = { ...c.Default, tags: ['svelte-csf-v5'] },
	I = { ...c.Elevated, tags: ['svelte-csf-v5'] },
	J = { ...c.Outlined, tags: ['svelte-csf-v5'] },
	K = { ...c.Clickable, tags: ['svelte-csf-v5'] },
	L = { ...c.NoPadding, tags: ['svelte-csf-v5'] };
export {
	K as Clickable,
	H as Default,
	I as Elevated,
	L as NoPadding,
	J as Outlined,
	G as __namedExportsOrder,
	N as default
};
