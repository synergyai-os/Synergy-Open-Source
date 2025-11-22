import {
	p as v,
	f as h,
	a as $,
	n as s,
	s as i,
	b as x,
	c as D,
	d as r
} from './iframe-DYn7RqBV.js';
import { c as T, i as w } from './create-runtime-stories-2rm03jka.js';
import { d as y } from './index-QxUtaCdU.js';
import { F as a } from './FormTextarea-DT7j-4wT.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './input-XwGP8Xvd.js';
const C = {
		component: a,
		title: 'Design System/Atoms/FormTextarea',
		tags: ['autodocs'],
		argTypes: {
			label: { control: { type: 'text' } },
			placeholder: { control: { type: 'text' } },
			required: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } },
			rows: { control: { type: 'number' } }
		}
	},
	{ Story: o } = y();
var F = h('<!> <!> <!> <!> <!>', 1);
function u(b, f) {
	(v(f, !1), w());
	var p = F(),
		n = $(p);
	o(n, {
		name: 'Default',
		args: { label: 'Description', placeholder: 'Enter description...', rows: 4 },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormTextarea {...args} />' } }
	});
	var d = i(n, 2);
	o(d, {
		name: 'With Label',
		args: { label: 'Comments', placeholder: 'Add your comments...', rows: 6 },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormTextarea {...args} />' } }
	});
	var c = i(d, 2);
	o(c, {
		name: 'Required',
		args: { label: 'Message', placeholder: 'Enter your message...', required: !0, rows: 4 },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormTextarea {...args} />' } }
	});
	var _ = i(c, 2);
	o(_, {
		name: 'Disabled',
		args: { label: 'Notes', placeholder: 'This field is disabled', disabled: !0, rows: 4 },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormTextarea {...args} />' } }
	});
	var g = i(_, 2);
	(o(g, {
		name: 'Without Label',
		args: { placeholder: 'Type here...', rows: 4 },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormTextarea {...args} />' } }
	}),
		x(b, p),
		D());
}
u.__docgen = { data: [], name: 'FormTextarea.stories.svelte' };
const l = T(u, C),
	O = ['Default', 'WithLabel', 'Required', 'Disabled', 'WithoutLabel'],
	j = { ...l.Default, tags: ['svelte-csf-v5'] },
	k = { ...l.WithLabel, tags: ['svelte-csf-v5'] },
	z = { ...l.Required, tags: ['svelte-csf-v5'] },
	B = { ...l.Disabled, tags: ['svelte-csf-v5'] },
	G = { ...l.WithoutLabel, tags: ['svelte-csf-v5'] };
export {
	j as Default,
	B as Disabled,
	z as Required,
	k as WithLabel,
	G as WithoutLabel,
	O as __namedExportsOrder,
	C as default
};
