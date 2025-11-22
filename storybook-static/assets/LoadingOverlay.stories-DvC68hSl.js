import {
	p as C,
	f as $,
	a as h,
	n as a,
	s as l,
	b as k,
	c as y,
	d as o
} from './iframe-DYn7RqBV.js';
import { c as L, i as S } from './create-runtime-stories-2rm03jka.js';
import { d as b } from './index-QxUtaCdU.js';
import { L as s } from './LoadingOverlay-Bob-KG3J.js';
import './preload-helper-PPVm8Dsz.js';
const O = {
		component: s,
		title: 'Design System/Atoms/LoadingOverlay',
		tags: ['autodocs'],
		argTypes: {
			show: { control: { type: 'boolean' } },
			flow: {
				control: { type: 'select' },
				options: [
					'account-registration',
					'account-linking',
					'workspace-creation',
					'workspace-switching',
					'workspace-joining',
					'onboarding',
					'custom'
				]
			},
			title: { control: { type: 'text' } },
			subtitle: { control: { type: 'text' } }
		}
	},
	{ Story: r } = b();
var W = $('<!> <!> <!> <!> <!> <!>', 1);
function _(w, f) {
	(C(f, !1), S());
	var c = W(),
		p = h(c);
	r(p, {
		name: 'Default',
		args: { show: !0, flow: 'custom', title: 'Loading...', subtitle: '' },
		template: (t, e = a) => {
			s(t, o(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<LoadingOverlay {...args} />' } }
	});
	var m = l(p, 2);
	r(m, {
		name: 'Account Registration',
		args: { show: !0, flow: 'account-registration', subtitle: 'John Doe' },
		template: (t, e = a) => {
			s(t, o(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<LoadingOverlay {...args} />' } }
	});
	var g = l(m, 2);
	r(g, {
		name: 'Workspace Creation',
		args: { show: !0, flow: 'workspace-creation', subtitle: 'My Workspace' },
		template: (t, e = a) => {
			s(t, o(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<LoadingOverlay {...args} />' } }
	});
	var d = l(g, 2);
	r(d, {
		name: 'Workspace Switching',
		args: { show: !0, flow: 'workspace-switching', subtitle: 'workspace' },
		template: (t, e = a) => {
			s(t, o(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<LoadingOverlay {...args} />' } }
	});
	var u = l(d, 2);
	r(u, {
		name: 'Custom Flow',
		args: {
			show: !0,
			flow: 'custom',
			title: 'Processing...',
			subtitle: '',
			customStages: ['Step 1', 'Step 2', 'Step 3']
		},
		template: (t, e = a) => {
			s(t, o(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<LoadingOverlay {...args} />' } }
	});
	var v = l(u, 2);
	(r(v, {
		name: 'Hidden',
		args: { show: !1, flow: 'custom', title: 'Loading...', subtitle: '' },
		template: (t, e = a) => {
			s(t, o(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<LoadingOverlay {...args} />' } }
	}),
		k(w, c),
		y());
}
_.__docgen = { data: [], name: 'LoadingOverlay.stories.svelte' };
const n = L(_, O),
	x = [
		'Default',
		'AccountRegistration',
		'WorkspaceCreation',
		'WorkspaceSwitching',
		'CustomFlow',
		'Hidden'
	],
	M = { ...n.Default, tags: ['svelte-csf-v5'] },
	j = { ...n.AccountRegistration, tags: ['svelte-csf-v5'] },
	E = { ...n.WorkspaceCreation, tags: ['svelte-csf-v5'] },
	J = { ...n.WorkspaceSwitching, tags: ['svelte-csf-v5'] },
	P = { ...n.CustomFlow, tags: ['svelte-csf-v5'] },
	T = { ...n.Hidden, tags: ['svelte-csf-v5'] };
export {
	j as AccountRegistration,
	P as CustomFlow,
	M as Default,
	T as Hidden,
	E as WorkspaceCreation,
	J as WorkspaceSwitching,
	x as __namedExportsOrder,
	O as default
};
