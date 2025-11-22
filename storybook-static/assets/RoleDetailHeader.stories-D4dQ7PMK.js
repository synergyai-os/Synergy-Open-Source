import {
	p as x,
	h as C,
	f as M,
	m as _,
	i as N,
	b as h,
	c as W,
	s as i,
	e as k,
	E as S,
	g as L,
	j as $,
	a as j,
	n as c,
	d as p
} from './iframe-DYn7RqBV.js';
import { c as B, i as O } from './create-runtime-stories-2rm03jka.js';
import { d as q } from './index-QxUtaCdU.js';
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
/* empty css                                                  */ import { I as V } from './IconButton-BjKeipeo.js';
import './LoadingOverlay-Bob-KG3J.js';
import { S as z } from './SplitButton-DPEFMT_j.js';
import { A as P } from './PanelBreadcrumbs-BJkhzZET.js';
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
var T = L(
		'<svg class="size-icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
	),
	F = M(
		'<button type="button" class="rounded-button border border-accent-primary bg-elevated px-card py-input-y text-button font-medium text-accent-primary transition-colors hover:bg-hover-solid">Edit role</button>'
	),
	G = M(
		'<header class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base px-inbox-container py-system-header"><h2 class="text-h3 font-semibold text-primary"> </h2> <div class="flex items-center gap-icon"><!> <!> <!> <!></div></header>'
	);
function l(y, a) {
	x(a, !0);
	let r = C(a, 'addMenuItems', 19, () => []),
		n = C(a, 'headerMenuItems', 19, () => []);
	var d = G(),
		m = k(d),
		v = k(m),
		b = i(m, 2);
	{
		const w = (e) => {
			var f = T();
			h(e, f);
		};
		var s = k(b);
		{
			var o = (e) => {
				z(e, {
					primaryLabel: 'Add',
					primaryOnclick: () => {
						r().length > 0 && r()[0].onclick();
					},
					get dropdownItems() {
						return r();
					}
				});
			};
			_(s, (e) => {
				r().length > 0 && e(o);
			});
		}
		var t = i(s, 2);
		{
			var E = (e) => {
				var f = F();
				((f.__click = function (...I) {
					a.onEdit?.apply(this, I);
				}),
					h(e, f));
			};
			_(t, (e) => {
				a.onEdit && e(E);
			});
		}
		var A = i(t, 2);
		{
			var H = (e) => {
				P(e, {
					get items() {
						return n();
					}
				});
			};
			_(A, (e) => {
				n().length > 0 && e(H);
			});
		}
		var R = i(A, 2);
		V(R, {
			get icon() {
				return w;
			},
			get onclick() {
				return a.onClose;
			},
			ariaLabel: 'Close panel'
		});
	}
	(N(() => $(v, a.roleName)), h(y, d), W());
}
S(['click']);
l.__docgen = {
	data: [
		{
			name: 'roleName',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'onClose',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
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
			name: 'addMenuItems',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'array', text: '{ label: string; onclick: () => void; }[]' },
			static: !1,
			readonly: !1,
			defaultValue: '[]'
		},
		{
			name: 'headerMenuItems',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'type',
				type: 'array',
				text: '{ label: string; onclick: () => void; danger?: boolean | undefined; }[]'
			},
			static: !1,
			readonly: !1,
			defaultValue: '[]'
		}
	],
	name: 'RoleDetailHeader.svelte'
};
const J = {
		component: l,
		title: 'Modules/OrgChart/RoleDetailHeader',
		tags: ['autodocs'],
		argTypes: { roleName: { control: { type: 'text' } } }
	},
	{ Story: u } = q();
var K = M('<!> <!> <!> <!> <!>', 1);
function D(y, a) {
	(x(a, !1), O());
	var r = K(),
		n = j(r);
	u(n, {
		name: 'Default',
		args: { roleName: 'Product Manager', onClose: () => console.log('Close clicked') },
		template: (o, t = c) => {
			l(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleDetailHeader {...args} />' } }
	});
	var d = i(n, 2);
	u(d, {
		name: 'WithAddMenu',
		args: {
			roleName: 'Engineering Lead',
			onClose: () => console.log('Close'),
			addMenuItems: [
				{ label: 'Add Responsibility', onclick: () => console.log('Add Responsibility') },
				{ label: 'Add Domain', onclick: () => console.log('Add Domain') }
			]
		},
		template: (o, t = c) => {
			l(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleDetailHeader {...args} />' } }
	});
	var m = i(d, 2);
	u(m, {
		name: 'WithEdit',
		args: {
			roleName: 'Design Lead',
			onClose: () => console.log('Close'),
			onEdit: () => console.log('Edit clicked')
		},
		template: (o, t = c) => {
			l(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleDetailHeader {...args} />' } }
	});
	var v = i(m, 2);
	u(v, {
		name: 'WithHeaderMenu',
		args: {
			roleName: 'Marketing Lead',
			onClose: () => console.log('Close'),
			headerMenuItems: [
				{ label: 'Export', onclick: () => console.log('Export') },
				{ label: 'Archive', onclick: () => console.log('Archive'), danger: !0 }
			]
		},
		template: (o, t = c) => {
			l(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleDetailHeader {...args} />' } }
	});
	var b = i(v, 2);
	(u(b, {
		name: 'WithAllActions',
		args: {
			roleName: 'Sales Director',
			onClose: () => console.log('Close'),
			onEdit: () => console.log('Edit'),
			addMenuItems: [
				{ label: 'Add Responsibility', onclick: () => console.log('Add Responsibility') }
			],
			headerMenuItems: [{ label: 'Settings', onclick: () => console.log('Settings') }]
		},
		template: (o, t = c) => {
			l(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleDetailHeader {...args} />' } }
	}),
		h(y, r),
		W());
}
D.__docgen = { data: [], name: 'RoleDetailHeader.stories.svelte' };
const g = B(D, J),
	Oe = ['Default', 'WithAddMenu', 'WithEdit', 'WithHeaderMenu', 'WithAllActions'],
	qe = { ...g.Default, tags: ['svelte-csf-v5'] },
	Ve = { ...g.WithAddMenu, tags: ['svelte-csf-v5'] },
	ze = { ...g.WithEdit, tags: ['svelte-csf-v5'] },
	Pe = { ...g.WithHeaderMenu, tags: ['svelte-csf-v5'] },
	Te = { ...g.WithAllActions, tags: ['svelte-csf-v5'] };
export {
	qe as Default,
	Ve as WithAddMenu,
	Te as WithAllActions,
	ze as WithEdit,
	Pe as WithHeaderMenu,
	Oe as __namedExportsOrder,
	J as default
};
