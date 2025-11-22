import {
	p as g,
	f as h,
	a as $,
	n as s,
	s as n,
	b as W,
	c as C,
	d as r
} from './iframe-DYn7RqBV.js';
import { c as D, i as P } from './create-runtime-stories-2rm03jka.js';
import { d as I } from './index-QxUtaCdU.js';
import { P as a } from './PinInput-qBurm280.js';
import './preload-helper-PPVm8Dsz.js';
import './each-DHv61wEY.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './watch.svelte-CYSsdG2H.js';
import './previous.svelte-BRBO0xyC.js';
import './dom-context.svelte-Cee2qr-t.js';
import './create-id-CD7dpc57.js';
import './noop-DX6rZLP_.js';
const L = {
		component: a,
		title: 'Design System/Atoms/PinInput',
		tags: ['autodocs'],
		argTypes: {
			label: { control: { type: 'text' } },
			error: { control: { type: 'text' } },
			disabled: { control: { type: 'boolean' } }
		}
	},
	{ Story: o } = I();
var y = h('<!> <!> <!> <!> <!>', 1);
function f(u, b) {
	(g(b, !1), P());
	var p = y(),
		m = $(p);
	o(m, {
		name: 'Default',
		args: { label: 'Verification Code' },
		template: (t, e = s) => {
			a(t, r(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<PinInput {...args} />' } }
	});
	var d = n(m, 2);
	o(d, {
		name: 'With Label',
		args: { label: 'Enter 6-digit code' },
		template: (t, e = s) => {
			a(t, r(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<PinInput {...args} />' } }
	});
	var _ = n(d, 2);
	o(_, {
		name: 'With Error',
		args: { label: 'Verification Code', error: 'Invalid code. Please try again.' },
		template: (t, e = s) => {
			a(t, r(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<PinInput {...args} />' } }
	});
	var c = n(_, 2);
	o(c, {
		name: 'Disabled',
		args: { label: 'Verification Code', disabled: !0 },
		template: (t, e = s) => {
			a(t, r(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<PinInput {...args} />' } }
	});
	var v = n(c, 2);
	(o(v, {
		name: 'Without Label',
		args: {},
		template: (t, e = s) => {
			a(t, r(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<PinInput {...args} />' } }
	}),
		W(u, p),
		C());
}
f.__docgen = { data: [], name: 'PinInput.stories.svelte' };
const l = D(f, L),
	B = ['Default', 'WithLabel', 'WithError', 'Disabled', 'WithoutLabel'],
	F = { ...l.Default, tags: ['svelte-csf-v5'] },
	G = { ...l.WithLabel, tags: ['svelte-csf-v5'] },
	H = { ...l.WithError, tags: ['svelte-csf-v5'] },
	J = { ...l.Disabled, tags: ['svelte-csf-v5'] },
	K = { ...l.WithoutLabel, tags: ['svelte-csf-v5'] };
export {
	F as Default,
	J as Disabled,
	H as WithError,
	G as WithLabel,
	K as WithoutLabel,
	B as __namedExportsOrder,
	L as default
};
