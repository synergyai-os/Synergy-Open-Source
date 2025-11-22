import {
	p as h,
	f as C,
	a as u,
	n as s,
	s as f,
	b as g,
	c as y,
	d as r
} from './iframe-DYn7RqBV.js';
import { c as D, i as $ } from './create-runtime-stories-2rm03jka.js';
import { d as b } from './index-QxUtaCdU.js';
import { C as a } from './Chip-D9RR8mAy.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
const P = {
		component: a,
		title: 'Design System/Atoms/Chip',
		tags: ['autodocs'],
		argTypes: { variant: { control: { type: 'select' }, options: ['default', 'primary'] } }
	},
	{ Story: o } = b();
var W = C('<!> <!> <!>', 1);
function _(c, d) {
	(h(d, !1), $());
	var l = W(),
		p = u(l);
	o(p, {
		name: 'Default',
		args: { variant: 'default', label: 'Filter Chip' },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Chip {...args} />' } }
	});
	var m = f(p, 2);
	o(m, {
		name: 'Primary',
		args: { variant: 'primary', label: 'Primary Chip' },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Chip {...args} />' } }
	});
	var v = f(m, 2);
	(o(v, {
		name: 'WithDelete',
		args: { variant: 'default', label: 'Removable Chip', onDelete: () => {} },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Chip {...args} />' } }
	}),
		g(c, l),
		y());
}
_.__docgen = { data: [], name: 'Chip.stories.svelte' };
const i = D(_, P),
	O = ['Default', 'Primary', 'WithDelete'],
	T = { ...i.Default, tags: ['svelte-csf-v5'] },
	j = { ...i.Primary, tags: ['svelte-csf-v5'] },
	k = { ...i.WithDelete, tags: ['svelte-csf-v5'] };
export { T as Default, j as Primary, k as WithDelete, O as __namedExportsOrder, P as default };
