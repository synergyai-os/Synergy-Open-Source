import {
	p as w,
	f as l,
	a as q,
	n,
	s as x,
	b as t,
	c as E,
	d,
	e as b,
	t as $
} from './iframe-DYn7RqBV.js';
import { c as C, i as D } from './create-runtime-stories-2rm03jka.js';
import { d as I } from './index-QxUtaCdU.js';
import { R as p } from './Label-BXv2dhHR.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './create-id-CD7dpc57.js';
const P = {
		component: p,
		title: 'Design System/Atoms/Label',
		tags: ['autodocs'],
		argTypes: { for: { control: { type: 'text' } } }
	},
	{ Story: u } = I();
var W = l(
		'<div class="flex flex-col gap-2"><!> <input id="email-input" type="email" placeholder="Enter your email" class="rounded-input border border-base px-input-x py-input-y"/></div>'
	),
	A = l('Password <span class="text-accent-primary">*</span>', 1),
	S = l(
		'<div class="flex flex-col gap-2"><!> <input id="required-input" type="password" placeholder="Enter password" class="rounded-input border border-base px-input-x py-input-y"/></div>'
	),
	M = l('<!> <!> <!>', 1);
function g(y, h) {
	(w(h, !1), D());
	var c = M(),
		f = q(c);
	u(f, {
		name: 'Default',
		args: { for: 'input-1' },
		template: (a, s = n) => {
			p(
				a,
				d(s, {
					children: (e, o) => {
						var r = $('Label text');
						t(e, r);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<Label.Root {...args}>Label text</Label.Root>' } }
	});
	var v = x(f, 2);
	u(v, {
		name: 'With Input',
		args: { for: 'email-input' },
		template: (a, s = n) => {
			var e = W(),
				o = b(e);
			(p(
				o,
				d(s, {
					children: (r, L) => {
						var i = $('Email Address');
						t(r, i);
					},
					$$slots: { default: !0 }
				})
			),
				t(a, e));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex flex-col gap-2">
	<Label.Root {...args}>Email Address</Label.Root>
	<input id="email-input" type="email" placeholder="Enter your email" class="rounded-input border border-base px-input-x py-input-y" />
</div>`
			}
		}
	});
	var R = x(v, 2);
	(u(R, {
		name: 'Required',
		args: { for: 'required-input' },
		template: (a, s = n) => {
			var e = S(),
				o = b(e);
			(p(
				o,
				d(s, {
					children: (r, L) => {
						var i = A();
						t(r, i);
					},
					$$slots: { default: !0 }
				})
			),
				t(a, e));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex flex-col gap-2">
	<Label.Root {...args}>
		Password <span class="text-accent-primary">*</span>
	</Label.Root>
	<input id="required-input" type="password" placeholder="Enter password" class="rounded-input border border-base px-input-x py-input-y" />
</div>`
			}
		}
	}),
		t(y, c),
		E());
}
g.__docgen = { data: [], name: 'Label.stories.svelte' };
const m = C(g, P),
	J = ['Default', 'WithInput', 'Required'],
	K = { ...m.Default, tags: ['svelte-csf-v5'] },
	N = { ...m.WithInput, tags: ['svelte-csf-v5'] },
	Q = { ...m.Required, tags: ['svelte-csf-v5'] };
export { K as Default, Q as Required, N as WithInput, J as __namedExportsOrder, P as default };
