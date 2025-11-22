import {
	p as S,
	f as L,
	a as A,
	n as l,
	s as _,
	b as r,
	c as z,
	d as n,
	t as p
} from './iframe-DYn7RqBV.js';
import { c as w, i as P } from './create-runtime-stories-2rm03jka.js';
import { d as D } from './index-QxUtaCdU.js';
import { T as o } from './Text-D3pLiP_j.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './this-Hz0nHxQJ.js';
const B = {
		component: o,
		title: 'Design System/Atoms/Text',
		tags: ['autodocs'],
		argTypes: {
			variant: { control: { type: 'select' }, options: ['body', 'label', 'caption'] },
			size: { control: { type: 'select' }, options: ['sm', 'base', 'lg'] },
			as: {
				control: { type: 'select' },
				options: ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
			}
		}
	},
	{ Story: m } = D();
var R = L('<!> <!> <!> <!> <!> <!> <!>', 1);
function b(C, y) {
	(S(y, !1), P());
	var $ = R(),
		c = A($);
	m(c, {
		name: 'Body',
		args: { variant: 'body', size: 'base' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (s, v) => {
						var a = p('Regular body text');
						r(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Text {...args}>Regular body text</Text>' } }
	});
	var x = _(c, 2);
	m(x, {
		name: 'Label',
		args: { variant: 'label', size: 'sm' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (s, v) => {
						var a = p('Label text');
						r(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Text {...args}>Label text</Text>' } }
	});
	var g = _(x, 2);
	m(g, {
		name: 'Caption',
		args: { variant: 'caption', size: 'sm' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (s, v) => {
						var a = p('Caption text');
						r(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Text {...args}>Caption text</Text>' } }
	});
	var f = _(g, 2);
	m(f, {
		name: 'Small',
		args: { variant: 'body', size: 'sm' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (s, v) => {
						var a = p('Small text');
						r(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Text {...args}>Small text</Text>' } }
	});
	var u = _(f, 2);
	m(u, {
		name: 'Large',
		args: { variant: 'body', size: 'lg' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (s, v) => {
						var a = p('Large text');
						r(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Text {...args}>Large text</Text>' } }
	});
	var T = _(u, 2);
	m(T, {
		name: 'As Span',
		args: { variant: 'body', size: 'base', as: 'span' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (s, v) => {
						var a = p('Text as span element');
						r(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Text {...args}>Text as span element</Text>' } }
	});
	var h = _(T, 2);
	(m(h, {
		name: 'As Div',
		args: { variant: 'body', size: 'base', as: 'div' },
		template: (t, e = l) => {
			o(
				t,
				n(e, {
					children: (s, v) => {
						var a = p('Text as div element');
						r(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Text {...args}>Text as div element</Text>' } }
	}),
		r(C, $),
		z());
}
b.__docgen = { data: [], name: 'Text.stories.svelte' };
const i = w(b, B),
	I = ['Body', 'Label', 'Caption', 'Small', 'Large', 'AsSpan', 'AsDiv'],
	J = { ...i.Body, tags: ['svelte-csf-v5'] },
	K = { ...i.Label, tags: ['svelte-csf-v5'] },
	N = { ...i.Caption, tags: ['svelte-csf-v5'] },
	Q = { ...i.Small, tags: ['svelte-csf-v5'] },
	U = { ...i.Large, tags: ['svelte-csf-v5'] },
	V = { ...i.AsSpan, tags: ['svelte-csf-v5'] },
	W = { ...i.AsDiv, tags: ['svelte-csf-v5'] };
export {
	W as AsDiv,
	V as AsSpan,
	J as Body,
	N as Caption,
	K as Label,
	U as Large,
	Q as Small,
	I as __namedExportsOrder,
	B as default
};
