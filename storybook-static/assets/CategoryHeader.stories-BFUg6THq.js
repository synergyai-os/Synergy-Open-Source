import {
	p as M,
	h as B,
	f as x,
	m as k,
	i as w,
	b as _,
	c as I,
	s as r,
	e as C,
	j as E,
	g as D,
	a as L,
	n as l,
	d
} from './iframe-DYn7RqBV.js';
import { c as R, i as O } from './create-runtime-stories-2rm03jka.js';
import { d as T } from './index-QxUtaCdU.js';
import './Button-2sxpTgAx.js';
import './Card-BkEjQl_7.js';
import './Badge-Bhcc4KqB.js';
import './Chip-D9RR8mAy.js';
import './Icon-nf143nWr.js';
import './Text-D3pLiP_j.js';
import './Heading-C09xnpWF.js';
import './Avatar-v8gaQbw7.js';
import './Loading-D_6SL4r8.js';
import './KeyboardShortcut-CeSHTUfy.js';
import './StatusPill-DGMja1Ui.js';
import './PinInput-qBurm280.js';
import './FormInput-CwvyCBJx.js';
import './FormTextarea-DT7j-4wT.js';
/* empty css                                                  */ import { I as H } from './IconButton-BjKeipeo.js';
import './LoadingOverlay-Bob-KG3J.js';
import './SplitButton-DPEFMT_j.js';
import { A as q } from './PanelBreadcrumbs-BJkhzZET.js';
import './preload-helper-PPVm8Dsz.js';
import './attributes-D2XuSyo_.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './this-Hz0nHxQJ.js';
import './each-DHv61wEY.js';
import './watch.svelte-CYSsdG2H.js';
import './previous.svelte-BRBO0xyC.js';
import './dom-context.svelte-Cee2qr-t.js';
import './create-id-CD7dpc57.js';
import './noop-DX6rZLP_.js';
import './input-XwGP8Xvd.js';
import './is-using-keyboard.svelte-qppEaaQk.js';
import './is-DtD5rb4o.js';
import './context-DWcBTeuX.js';
import './kbd-constants-Duhtze-4.js';
import './arrays-C786ZheV.js';
import './roving-focus-group-B-fCEnqo.js';
import './use-id-C09Eugg1.js';
import './popper-layer-force-mount-B5n7-529.js';
import './is-BGFdVicR.js';
import './portal-c1AsCbfc.js';
var V = x('<span class="ml-form-field-gap text-label font-normal text-tertiary"> </span>'),
	F = D(
		'<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>'
	),
	G = D(
		'<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>'
	),
	J = x(
		'<div class="flex items-center justify-between rounded-card bg-surface px-card py-nav-item"><h4 class="text-button font-semibold text-primary"> <!></h4> <div class="gap-control-item flex items-center"><!> <!> <!></div></div>'
	);
function s(b, o) {
	M(o, !0);
	let p = B(o, 'menuItems', 19, () => []);
	var v = J(),
		u = C(v),
		g = C(u),
		h = r(g);
	{
		var y = (t) => {
			var n = V(),
				f = C(n);
			(w(() => E(f, `(${o.count ?? ''})`)), _(t, n));
		};
		k(h, (t) => {
			o.count !== void 0 && t(y);
		});
	}
	var A = r(u, 2),
		i = C(A);
	{
		var a = (t) => {
			const n = (f) => {
				var W = F();
				_(f, W);
			};
			H(t, {
				get icon() {
					return n;
				},
				get onclick() {
					return o.onEdit;
				},
				get ariaLabel() {
					return `Edit ${o.title ?? ''}`;
				}
			});
		};
		k(i, (t) => {
			o.onEdit && t(a);
		});
	}
	var e = r(i, 2);
	{
		var $ = (t) => {
			const n = (f) => {
				var W = G();
				_(f, W);
			};
			H(t, {
				get icon() {
					return n;
				},
				get onclick() {
					return o.onAdd;
				},
				get ariaLabel() {
					return `Add to ${o.title ?? ''}`;
				}
			});
		};
		k(e, (t) => {
			o.onAdd && t($);
		});
	}
	var j = r(e, 2);
	{
		var S = (t) => {
			q(t, {
				get items() {
					return p();
				}
			});
		};
		k(j, (t) => {
			p().length > 0 && t(S);
		});
	}
	(w(() => E(g, `${o.title ?? ''} `)), _(b, v), I());
}
s.__docgen = {
	data: [
		{
			name: 'title',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'count',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'number', text: 'number' },
			static: !1,
			readonly: !1
		},
		{
			name: 'onEdit',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
			static: !1,
			readonly: !1
		},
		{
			name: 'onAdd',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
			static: !1,
			readonly: !1
		},
		{
			name: 'menuItems',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'array', text: '{ label: string; onclick: () => void; }[]' },
			static: !1,
			readonly: !1,
			defaultValue: '[]'
		}
	],
	name: 'CategoryHeader.svelte'
};
const K = {
		component: s,
		title: 'Modules/OrgChart/CategoryHeader',
		tags: ['autodocs'],
		argTypes: { title: { control: { type: 'text' } }, count: { control: { type: 'number' } } }
	},
	{ Story: m } = T();
var N = x('<!> <!> <!> <!> <!> <!>', 1);
function z(b, o) {
	(M(o, !1), O());
	var p = N(),
		v = L(p);
	m(v, {
		name: 'Default',
		args: { title: 'Roles' },
		template: (a, e = l) => {
			s(a, d(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CategoryHeader {...args} />' } }
	});
	var u = r(v, 2);
	m(u, {
		name: 'WithCount',
		args: { title: 'Roles', count: 5 },
		template: (a, e = l) => {
			s(a, d(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CategoryHeader {...args} />' } }
	});
	var g = r(u, 2);
	m(g, {
		name: 'WithEdit',
		args: { title: 'Circles', count: 3, onEdit: () => console.log('Edit clicked') },
		template: (a, e = l) => {
			s(a, d(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CategoryHeader {...args} />' } }
	});
	var h = r(g, 2);
	m(h, {
		name: 'WithAdd',
		args: { title: 'Members', count: 12, onAdd: () => console.log('Add clicked') },
		template: (a, e = l) => {
			s(a, d(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CategoryHeader {...args} />' } }
	});
	var y = r(h, 2);
	m(y, {
		name: 'WithMenu',
		args: {
			title: 'Teams',
			count: 8,
			menuItems: [
				{ label: 'Export', onclick: () => console.log('Export') },
				{ label: 'Settings', onclick: () => console.log('Settings') }
			]
		},
		template: (a, e = l) => {
			s(a, d(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CategoryHeader {...args} />' } }
	});
	var A = r(y, 2);
	(m(A, {
		name: 'WithAllActions',
		args: {
			title: 'Departments',
			count: 6,
			onEdit: () => console.log('Edit'),
			onAdd: () => console.log('Add'),
			menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
		},
		template: (a, e = l) => {
			s(a, d(e));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CategoryHeader {...args} />' } }
	}),
		_(b, p),
		I());
}
z.__docgen = { data: [], name: 'CategoryHeader.stories.svelte' };
const c = R(z, K),
	Rt = ['Default', 'WithCount', 'WithEdit', 'WithAdd', 'WithMenu', 'WithAllActions'],
	Ot = { ...c.Default, tags: ['svelte-csf-v5'] },
	Tt = { ...c.WithCount, tags: ['svelte-csf-v5'] },
	qt = { ...c.WithEdit, tags: ['svelte-csf-v5'] },
	Vt = { ...c.WithAdd, tags: ['svelte-csf-v5'] },
	Ft = { ...c.WithMenu, tags: ['svelte-csf-v5'] },
	Gt = { ...c.WithAllActions, tags: ['svelte-csf-v5'] };
export {
	Ot as Default,
	Vt as WithAdd,
	Gt as WithAllActions,
	Tt as WithCount,
	qt as WithEdit,
	Ft as WithMenu,
	Rt as __namedExportsOrder,
	K as default
};
