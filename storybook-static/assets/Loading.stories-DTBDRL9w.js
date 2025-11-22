import {
	p as M,
	f as u,
	a as S,
	n as t,
	s as m,
	b as v,
	c as z,
	d as o,
	e as w
} from './iframe-DYn7RqBV.js';
import { c as y, i as D } from './create-runtime-stories-2rm03jka.js';
import { d as F } from './index-QxUtaCdU.js';
import { L as a } from './Loading-D_6SL4r8.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
const N = {
		component: a,
		title: 'Design System/Atoms/Loading',
		tags: ['autodocs'],
		argTypes: {
			message: { control: { type: 'text' } },
			size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
			fullHeight: { control: { type: 'boolean' } }
		}
	},
	{ Story: l } = F();
var b = u('<div class="h-64"><!></div>'),
	x = u('<!> <!> <!> <!> <!> <!>', 1);
function L($, h) {
	(M(h, !1), D());
	var n = x(),
		i = S(n);
	l(i, {
		name: 'Default',
		args: { message: 'Loading...', size: 'md', fullHeight: !1 },
		template: (e, s = t) => {
			a(e, o(s));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Loading {...args} />' } }
	});
	var d = m(i, 2);
	l(d, {
		name: 'Small',
		args: { message: 'Loading...', size: 'sm', fullHeight: !1 },
		template: (e, s = t) => {
			a(e, o(s));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Loading {...args} />' } }
	});
	var p = m(d, 2);
	l(p, {
		name: 'Large',
		args: { message: 'Loading...', size: 'lg', fullHeight: !1 },
		template: (e, s = t) => {
			a(e, o(s));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Loading {...args} />' } }
	});
	var _ = m(p, 2);
	l(_, {
		name: 'Custom Message',
		args: { message: 'Fetching data...', size: 'md', fullHeight: !1 },
		template: (e, s = t) => {
			a(e, o(s));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Loading {...args} />' } }
	});
	var f = m(_, 2);
	l(f, {
		name: 'Full Height',
		args: { message: 'Loading...', size: 'md', fullHeight: !0 },
		template: (e, s = t) => {
			var c = b(),
				H = w(c);
			(a(H, o(s)), v(e, c));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="h-64">
	<Loading {...args} />
</div>`
			}
		}
	});
	var C = m(f, 2);
	(l(C, {
		name: 'No Message',
		args: { message: '', size: 'md', fullHeight: !1 },
		template: (e, s = t) => {
			a(e, o(s));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Loading {...args} />' } }
	}),
		v($, n),
		z());
}
L.__docgen = { data: [], name: 'Loading.stories.svelte' };
const r = y(L, N),
	k = ['Default', 'Small', 'Large', 'CustomMessage', 'FullHeight', 'NoMessage'],
	q = { ...r.Default, tags: ['svelte-csf-v5'] },
	B = { ...r.Small, tags: ['svelte-csf-v5'] },
	G = { ...r.Large, tags: ['svelte-csf-v5'] },
	I = { ...r.CustomMessage, tags: ['svelte-csf-v5'] },
	J = { ...r.FullHeight, tags: ['svelte-csf-v5'] },
	K = { ...r.NoMessage, tags: ['svelte-csf-v5'] };
export {
	I as CustomMessage,
	q as Default,
	J as FullHeight,
	G as Large,
	K as NoMessage,
	B as Small,
	k as __namedExportsOrder,
	N as default
};
