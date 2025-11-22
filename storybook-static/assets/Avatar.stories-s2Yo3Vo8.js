import {
	p as y,
	f as A,
	a as G,
	n as r,
	s,
	b as $,
	c as I,
	d as n,
	e as J
} from './iframe-DYn7RqBV.js';
import { c as L, i as h } from './create-runtime-stories-2rm03jka.js';
import { d as b } from './index-QxUtaCdU.js';
import { A as e } from './Avatar-v8gaQbw7.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
const B = {
		component: e,
		title: 'Design System/Atoms/Avatar',
		tags: ['autodocs'],
		argTypes: {
			initials: { control: { type: 'text' } },
			size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
			color: { control: { type: 'color' } }
		}
	},
	{ Story: o } = b();
var E = A('<div class="flex -space-x-2"><!> <!> <!> <!></div>'),
	F = A('<!> <!> <!> <!> <!> <!>', 1);
function z(D, S) {
	(y(S, !1), h());
	var m = F(),
		p = G(m);
	o(p, {
		name: 'Default',
		args: { initials: 'JD', size: 'md' },
		template: (t, a = r) => {
			e(t, n(a));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Avatar {...args} />' } }
	});
	var v = s(p, 2);
	o(v, {
		name: 'Small',
		args: { initials: 'AB', size: 'sm' },
		template: (t, a = r) => {
			e(t, n(a));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Avatar {...args} />' } }
	});
	var d = s(v, 2);
	o(d, {
		name: 'Large',
		args: { initials: 'CD', size: 'lg' },
		template: (t, a = r) => {
			e(t, n(a));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Avatar {...args} />' } }
	});
	var _ = s(d, 2);
	o(_, {
		name: 'Single Initial',
		args: { initials: 'R', size: 'md' },
		template: (t, a = r) => {
			e(t, n(a));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Avatar {...args} />' } }
	});
	var c = s(_, 2);
	o(c, {
		name: 'Custom Color',
		args: { initials: 'JD', size: 'md', color: '#3b82f6' },
		template: (t, a = r) => {
			e(t, n(a));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Avatar {...args} />' } }
	});
	var x = s(c, 2);
	(o(x, {
		name: 'Group',
		args: { initials: 'JD', size: 'md' },
		template: (t, a = r) => {
			var g = E(),
				f = J(g);
			e(f, { initials: 'JD', size: 'md' });
			var u = s(f, 2);
			e(u, { initials: 'AB', size: 'md' });
			var C = s(u, 2);
			e(C, { initials: 'CD', size: 'md' });
			var w = s(C, 2);
			(e(w, { initials: 'EF', size: 'md' }), $(t, g));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex -space-x-2">
	<Avatar initials="JD" size="md" />
	<Avatar initials="AB" size="md" />
	<Avatar initials="CD" size="md" />
	<Avatar initials="EF" size="md" />
</div>`
			}
		}
	}),
		$(D, m),
		I());
}
z.__docgen = { data: [], name: 'Avatar.stories.svelte' };
const i = L(z, B),
	H = ['Default', 'Small', 'Large', 'SingleInitial', 'CustomColor', 'Group'],
	K = { ...i.Default, tags: ['svelte-csf-v5'] },
	N = { ...i.Small, tags: ['svelte-csf-v5'] },
	P = { ...i.Large, tags: ['svelte-csf-v5'] },
	Q = { ...i.SingleInitial, tags: ['svelte-csf-v5'] },
	U = { ...i.CustomColor, tags: ['svelte-csf-v5'] },
	V = { ...i.Group, tags: ['svelte-csf-v5'] };
export {
	U as CustomColor,
	K as Default,
	V as Group,
	P as Large,
	Q as SingleInitial,
	N as Small,
	H as __namedExportsOrder,
	B as default
};
