import {
	p as x,
	h as A,
	f as k,
	m as b,
	i as S,
	b as h,
	c as W,
	s as r,
	g as $,
	e as C,
	E as R,
	j as O,
	a as j,
	n as m,
	d as p
} from './iframe-DYn7RqBV.js';
import { c as B, i as L } from './create-runtime-stories-2rm03jka.js';
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
var T = $(
		'<svg class="size-icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
	),
	F = k(
		'<button type="button" class="rounded-button border border-accent-primary bg-white px-card py-input-y text-button font-medium text-accent-primary transition-colors hover:bg-hover-solid">Edit circle</button>'
	),
	G = k(
		'<header class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base px-inbox-container py-system-header"><h2 class="text-h3 font-semibold text-primary"> </h2> <div class="flex items-center gap-icon"><!> <!> <!> <!></div></header>'
	);
function s(y, i) {
	x(i, !0);
	let a = A(i, 'addMenuItems', 19, () => []),
		n = A(i, 'headerMenuItems', 19, () => []);
	var c = G(),
		d = C(c),
		f = C(d),
		_ = r(d, 2);
	{
		const I = (e) => {
			var v = T();
			h(e, v);
		};
		var l = C(_);
		{
			var o = (e) => {
				z(e, {
					primaryLabel: 'Add',
					primaryOnclick: () => {
						a().length > 0 && a()[0].onclick();
					},
					get dropdownItems() {
						return a();
					}
				});
			};
			b(l, (e) => {
				a().length > 0 && e(o);
			});
		}
		var t = r(l, 2);
		{
			var w = (e) => {
				var v = F();
				((v.__click = function (...N) {
					i.onEdit?.apply(this, N);
				}),
					h(e, v));
			};
			b(t, (e) => {
				i.onEdit && e(w);
			});
		}
		var M = r(t, 2);
		{
			var D = (e) => {
				P(e, {
					get items() {
						return n();
					}
				});
			};
			b(M, (e) => {
				n().length > 0 && e(D);
			});
		}
		var H = r(M, 2);
		V(H, {
			get icon() {
				return I;
			},
			get onclick() {
				return i.onClose;
			},
			ariaLabel: 'Close panel'
		});
	}
	(S(() => O(f, i.circleName)), h(y, c), W());
}
R(['click']);
s.__docgen = {
	data: [
		{
			name: 'circleName',
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
	name: 'CircleDetailHeader.svelte'
};
const J = {
		component: s,
		title: 'Modules/OrgChart/CircleDetailHeader',
		tags: ['autodocs'],
		argTypes: { circleName: { control: { type: 'text' } } }
	},
	{ Story: u } = q();
var K = k('<!> <!> <!> <!> <!>', 1);
function E(y, i) {
	(x(i, !1), L());
	var a = K(),
		n = j(a);
	u(n, {
		name: 'Default',
		args: { circleName: 'Engineering Circle', onClose: () => console.log('Close clicked') },
		template: (o, t = m) => {
			s(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CircleDetailHeader {...args} />' } }
	});
	var c = r(n, 2);
	u(c, {
		name: 'WithAddMenu',
		args: {
			circleName: 'Product Circle',
			onClose: () => console.log('Close'),
			addMenuItems: [
				{ label: 'Add Role', onclick: () => console.log('Add Role') },
				{ label: 'Add Member', onclick: () => console.log('Add Member') }
			]
		},
		template: (o, t = m) => {
			s(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CircleDetailHeader {...args} />' } }
	});
	var d = r(c, 2);
	u(d, {
		name: 'WithEdit',
		args: {
			circleName: 'Marketing Circle',
			onClose: () => console.log('Close'),
			onEdit: () => console.log('Edit clicked')
		},
		template: (o, t = m) => {
			s(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CircleDetailHeader {...args} />' } }
	});
	var f = r(d, 2);
	u(f, {
		name: 'WithHeaderMenu',
		args: {
			circleName: 'Sales Circle',
			onClose: () => console.log('Close'),
			headerMenuItems: [
				{ label: 'Export', onclick: () => console.log('Export') },
				{ label: 'Archive', onclick: () => console.log('Archive'), danger: !0 }
			]
		},
		template: (o, t = m) => {
			s(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CircleDetailHeader {...args} />' } }
	});
	var _ = r(f, 2);
	(u(_, {
		name: 'WithAllActions',
		args: {
			circleName: 'Operations Circle',
			onClose: () => console.log('Close'),
			onEdit: () => console.log('Edit'),
			addMenuItems: [{ label: 'Add Role', onclick: () => console.log('Add Role') }],
			headerMenuItems: [{ label: 'Settings', onclick: () => console.log('Settings') }]
		},
		template: (o, t = m) => {
			s(o, p(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<CircleDetailHeader {...args} />' } }
	}),
		h(y, a),
		W());
}
E.__docgen = { data: [], name: 'CircleDetailHeader.stories.svelte' };
const g = B(E, J),
	Le = ['Default', 'WithAddMenu', 'WithEdit', 'WithHeaderMenu', 'WithAllActions'],
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
	Le as __namedExportsOrder,
	J as default
};
