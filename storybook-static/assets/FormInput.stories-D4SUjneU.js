import {
	p as $,
	f as w,
	a as h,
	n as s,
	s as m,
	b as y,
	c as C,
	d as r
} from './iframe-DYn7RqBV.js';
import { c as I, i as D } from './create-runtime-stories-2rm03jka.js';
import { d as F } from './index-QxUtaCdU.js';
import { F as a } from './FormInput-CwvyCBJx.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './input-XwGP8Xvd.js';
const q = {
		component: a,
		title: 'Design System/Atoms/FormInput',
		tags: ['autodocs'],
		argTypes: {
			type: { control: { type: 'select' }, options: ['text', 'email', 'password', 'url'] },
			required: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	},
	{ Story: o } = F();
var x = w('<!> <!> <!> <!> <!> <!>', 1);
function f(v, b) {
	($(b, !1), D());
	var n = x(),
		d = h(n);
	o(d, {
		name: 'Default',
		args: { label: 'Input Label', placeholder: 'Enter text...', type: 'text' },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormInput {...args} />' } }
	});
	var i = m(d, 2);
	o(i, {
		name: 'Required',
		args: { label: 'Required Input', placeholder: 'Required field', type: 'text', required: !0 },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormInput {...args} />' } }
	});
	var u = m(i, 2);
	o(u, {
		name: 'Disabled',
		args: { label: 'Disabled Input', placeholder: 'Cannot edit', type: 'text', disabled: !0 },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormInput {...args} />' } }
	});
	var c = m(u, 2);
	o(c, {
		name: 'Email',
		args: { label: 'Email Address', placeholder: 'email@example.com', type: 'email' },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormInput {...args} />' } }
	});
	var _ = m(c, 2);
	o(_, {
		name: 'Password',
		args: { label: 'Password', placeholder: 'Enter password', type: 'password' },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormInput {...args} />' } }
	});
	var g = m(_, 2);
	(o(g, {
		name: 'WithoutLabel',
		args: { placeholder: 'No label', type: 'text' },
		template: (e, t = s) => {
			a(e, r(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<FormInput {...args} />' } }
	}),
		y(v, n),
		C());
}
f.__docgen = { data: [], name: 'FormInput.stories.svelte' };
const l = I(f, q),
	O = ['Default', 'Required', 'Disabled', 'Email', 'Password', 'WithoutLabel'],
	T = { ...l.Default, tags: ['svelte-csf-v5'] },
	j = { ...l.Required, tags: ['svelte-csf-v5'] },
	k = { ...l.Disabled, tags: ['svelte-csf-v5'] },
	z = { ...l.Email, tags: ['svelte-csf-v5'] },
	B = { ...l.Password, tags: ['svelte-csf-v5'] },
	G = { ...l.WithoutLabel, tags: ['svelte-csf-v5'] };
export {
	T as Default,
	k as Disabled,
	z as Email,
	B as Password,
	j as Required,
	G as WithoutLabel,
	O as __namedExportsOrder,
	q as default
};
