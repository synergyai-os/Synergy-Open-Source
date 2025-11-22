import {
	p as C,
	f as S,
	a as h,
	n as m,
	s as _,
	b as o,
	c as x,
	d as l,
	t as d
} from './iframe-DYn7RqBV.js';
import { c as D, i as w } from './create-runtime-stories-2rm03jka.js';
import { d as P } from './index-QxUtaCdU.js';
import { B as r } from './Badge-Bhcc4KqB.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
const b = {
		component: r,
		title: 'Design System/Atoms/Badge',
		tags: ['autodocs'],
		argTypes: { variant: { control: { type: 'select' }, options: ['system', 'custom', 'default'] } }
	},
	{ Story: n } = P();
var A = S('<!> <!> <!>', 1);
function $(v, B) {
	(C(B, !1), w());
	var g = A(),
		i = h(g);
	n(i, {
		name: 'Default',
		args: { variant: 'default' },
		template: (t, e = m) => {
			r(
				t,
				l(e, {
					children: (s, f) => {
						var a = d('Badge');
						o(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Badge {...args}>Badge</Badge>' } }
	});
	var u = _(i, 2);
	n(u, {
		name: 'System',
		args: { variant: 'system' },
		template: (t, e = m) => {
			r(
				t,
				l(e, {
					children: (s, f) => {
						var a = d('System Badge');
						o(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Badge {...args}>System Badge</Badge>' } }
	});
	var y = _(u, 2);
	(n(y, {
		name: 'Custom',
		args: { variant: 'custom' },
		template: (t, e = m) => {
			r(
				t,
				l(e, {
					children: (s, f) => {
						var a = d('Custom Badge');
						o(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Badge {...args}>Custom Badge</Badge>' } }
	}),
		o(v, g),
		x());
}
$.__docgen = { data: [], name: 'Badge.stories.svelte' };
const p = D($, b),
	k = ['Default', 'System', 'Custom'],
	q = { ...p.Default, tags: ['svelte-csf-v5'] },
	z = { ...p.System, tags: ['svelte-csf-v5'] },
	F = { ...p.Custom, tags: ['svelte-csf-v5'] };
export { F as Custom, q as Default, z as System, k as __namedExportsOrder, b as default };
