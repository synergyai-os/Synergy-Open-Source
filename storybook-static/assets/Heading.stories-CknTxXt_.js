import {
	p as P,
	f as S,
	a as T,
	n as o,
	s as g,
	b as l,
	c as w,
	d as n,
	t as v
} from './iframe-DYn7RqBV.js';
import { c as b, i as y } from './create-runtime-stories-2rm03jka.js';
import { d as A } from './index-QxUtaCdU.js';
import { H as r } from './Heading-C09xnpWF.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './this-Hz0nHxQJ.js';
const D = {
		component: r,
		title: 'Design System/Atoms/Heading',
		tags: ['autodocs'],
		argTypes: { level: { control: { type: 'select' }, options: [1, 2, 3, 4, 5, 6] } }
	},
	{ Story: i } = A();
var E = S('<!> <!> <!> <!> <!> <!>', 1);
function H(C, h) {
	(P(h, !1), y());
	var _ = E(),
		$ = T(_);
	i($, {
		name: 'Level 1',
		args: { level: 1 },
		template: (e, t = o) => {
			r(
				e,
				n(t, {
					children: (s, m) => {
						var a = v('Page Title');
						l(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Heading {...args}>Page Title</Heading>' } }
	});
	var c = g($, 2);
	i(c, {
		name: 'Level 2',
		args: { level: 2 },
		template: (e, t = o) => {
			r(
				e,
				n(t, {
					children: (s, m) => {
						var a = v('Section Title');
						l(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Heading {...args}>Section Title</Heading>' } }
	});
	var L = g(c, 2);
	i(L, {
		name: 'Level 3',
		args: { level: 3 },
		template: (e, t = o) => {
			r(
				e,
				n(t, {
					children: (s, m) => {
						var a = v('Subsection Title');
						l(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Heading {...args}>Subsection Title</Heading>' } }
	});
	var f = g(L, 2);
	i(f, {
		name: 'Level 4',
		args: { level: 4 },
		template: (e, t = o) => {
			r(
				e,
				n(t, {
					children: (s, m) => {
						var a = v('Level 4 Heading');
						l(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Heading {...args}>Level 4 Heading</Heading>' } }
	});
	var u = g(f, 2);
	i(u, {
		name: 'Level 5',
		args: { level: 5 },
		template: (e, t = o) => {
			r(
				e,
				n(t, {
					children: (s, m) => {
						var a = v('Level 5 Heading');
						l(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Heading {...args}>Level 5 Heading</Heading>' } }
	});
	var x = g(u, 2);
	(i(x, {
		name: 'Level 6',
		args: { level: 6 },
		template: (e, t = o) => {
			r(
				e,
				n(t, {
					children: (s, m) => {
						var a = v('Level 6 Heading');
						l(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Heading {...args}>Level 6 Heading</Heading>' } }
	}),
		l(C, _),
		w());
}
H.__docgen = { data: [], name: 'Heading.stories.svelte' };
const d = b(H, D),
	G = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5', 'Level6'],
	I = { ...d.Level1, tags: ['svelte-csf-v5'] },
	J = { ...d.Level2, tags: ['svelte-csf-v5'] },
	K = { ...d.Level3, tags: ['svelte-csf-v5'] },
	N = { ...d.Level4, tags: ['svelte-csf-v5'] },
	Q = { ...d.Level5, tags: ['svelte-csf-v5'] },
	U = { ...d.Level6, tags: ['svelte-csf-v5'] };
export {
	I as Level1,
	J as Level2,
	K as Level3,
	N as Level4,
	Q as Level5,
	U as Level6,
	G as __namedExportsOrder,
	D as default
};
