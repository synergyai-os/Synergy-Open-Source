import {
	p as u,
	f as C,
	a as v,
	n as a,
	s as i,
	b as y,
	c as K,
	d as o
} from './iframe-DYn7RqBV.js';
import { c as $, i as b } from './create-runtime-stories-2rm03jka.js';
import { d as z } from './index-QxUtaCdU.js';
import { K as s } from './KeyboardShortcut-CeSHTUfy.js';
import './preload-helper-PPVm8Dsz.js';
import './each-DHv61wEY.js';
import './class-BLXIZATI.js';
const E = {
		component: s,
		title: 'Design System/Atoms/KeyboardShortcut',
		tags: ['autodocs'],
		argTypes: { size: { control: { type: 'select' }, options: ['sm', 'md'] } }
	},
	{ Story: r } = z();
var M = C('<!> <!> <!> <!> <!>', 1);
function f(S, g) {
	(u(g, !1), b());
	var d = M(),
		l = v(d);
	r(l, {
		name: 'SingleKey',
		args: { keys: 'C', size: 'sm' },
		template: (e, t = a) => {
			s(e, o(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<KeyboardShortcut {...args} />' } }
	});
	var p = i(l, 2);
	r(p, {
		name: 'CommandK',
		args: { keys: ['Cmd', 'K'], size: 'sm' },
		template: (e, t = a) => {
			s(e, o(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<KeyboardShortcut {...args} />' } }
	});
	var c = i(p, 2);
	r(c, {
		name: 'ShiftEnter',
		args: { keys: ['Shift', 'Enter'], size: 'sm' },
		template: (e, t = a) => {
			s(e, o(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<KeyboardShortcut {...args} />' } }
	});
	var _ = i(c, 2);
	r(_, {
		name: 'CommandShiftN',
		args: { keys: ['Cmd', 'Shift', 'N'], size: 'sm' },
		template: (e, t = a) => {
			s(e, o(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<KeyboardShortcut {...args} />' } }
	});
	var h = i(_, 2);
	(r(h, {
		name: 'MediumSize',
		args: { keys: ['Cmd', 'K'], size: 'md' },
		template: (e, t = a) => {
			s(e, o(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<KeyboardShortcut {...args} />' } }
	}),
		y(S, d),
		K());
}
f.__docgen = { data: [], name: 'KeyboardShortcut.stories.svelte' };
const m = $(f, E),
	R = ['SingleKey', 'CommandK', 'ShiftEnter', 'CommandShiftN', 'MediumSize'],
	T = { ...m.SingleKey, tags: ['svelte-csf-v5'] },
	j = { ...m.CommandK, tags: ['svelte-csf-v5'] },
	q = { ...m.ShiftEnter, tags: ['svelte-csf-v5'] },
	B = { ...m.CommandShiftN, tags: ['svelte-csf-v5'] },
	F = { ...m.MediumSize, tags: ['svelte-csf-v5'] };
export {
	j as CommandK,
	B as CommandShiftN,
	F as MediumSize,
	q as ShiftEnter,
	T as SingleKey,
	R as __namedExportsOrder,
	E as default
};
