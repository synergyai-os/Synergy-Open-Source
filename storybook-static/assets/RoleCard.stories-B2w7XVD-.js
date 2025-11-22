import {
	p as D,
	h as R,
	f as h,
	m as W,
	i as A,
	b as g,
	c as I,
	v as H,
	w as V,
	e as d,
	s as r,
	E as T,
	j as M,
	g as U,
	a as $,
	n as u,
	d as v
} from './iframe-DYn7RqBV.js';
import { c as G, i as J } from './create-runtime-stories-2rm03jka.js';
import { d as K } from './index-QxUtaCdU.js';
import './Button-2sxpTgAx.js';
import './Card-BkEjQl_7.js';
import './Badge-Bhcc4KqB.js';
import './Chip-D9RR8mAy.js';
import './Icon-nf143nWr.js';
import './Text-D3pLiP_j.js';
import './Heading-C09xnpWF.js';
import { A as N } from './Avatar-v8gaQbw7.js';
import './Loading-D_6SL4r8.js';
import './KeyboardShortcut-CeSHTUfy.js';
import './StatusPill-DGMja1Ui.js';
import './PinInput-qBurm280.js';
import './FormInput-CwvyCBJx.js';
import './FormTextarea-DT7j-4wT.js';
/* empty css                                                  */ import { I as Q } from './IconButton-BjKeipeo.js';
import './LoadingOverlay-Bob-KG3J.js';
import './SplitButton-DPEFMT_j.js';
import { A as X } from './PanelBreadcrumbs-BJkhzZET.js';
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
var Y = h('<p class="truncate text-label text-secondary"> </p>'),
	Z = h('<p class="text-label text-tertiary"> </p>'),
	ee = U(
		'<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>'
	),
	te = h('<div class="gap-control-item flex items-center" role="group"><!> <!></div>'),
	ae = h(
		'<button type="button" class="p-card flex w-full items-center gap-icon rounded-card bg-surface text-left transition-colors hover:bg-hover-solid"><!> <div class="min-w-0 flex-1"><p class="truncate text-button font-medium text-primary"> </p> <!></div> <!></button>'
	);
function s(E, t) {
	D(t, !0);
	let k = R(t, 'fillerCount', 3, 0),
		m = R(t, 'menuItems', 19, () => []);
	function b(e) {
		return e
			.split(' ')
			.map((i) => i[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
	var p = ae();
	p.__click = function (...e) {
		t.onClick?.apply(this, e);
	};
	var y = d(p);
	{
		let e = V(() => b(t.name));
		N(y, {
			get initials() {
				return H(e);
			},
			size: 'md'
		});
	}
	var C = r(y, 2),
		x = d(C),
		l = d(x),
		a = r(x, 2);
	{
		var o = (e) => {
				var i = Y(),
					c = d(i);
				(A(() => M(c, t.purpose)), g(e, i));
			},
			L = (e) => {
				var i = Z(),
					c = d(i);
				(A(() => M(c, `${k() ?? ''} filler${k() !== 1 ? 's' : ''}`)), g(e, i));
			};
		W(a, (e) => {
			t.purpose ? e(o) : e(L, !1);
		});
	}
	var F = r(C, 2);
	{
		var j = (e) => {
			var i = te(),
				c = d(i);
			{
				var z = (n) => {
					const q = (w) => {
						var B = ee();
						g(w, B);
					};
					Q(n, {
						get icon() {
							return q;
						},
						onclick: (w) => {
							(w?.stopPropagation(), t.onEdit());
						},
						get ariaLabel() {
							return `Edit ${t.name ?? ''}`;
						}
					});
				};
				W(c, (n) => {
					t.onEdit && n(z);
				});
			}
			var O = r(c, 2);
			{
				var S = (n) => {
					X(n, {
						get items() {
							return m();
						}
					});
				};
				W(O, (n) => {
					m().length > 0 && n(S);
				});
			}
			g(e, i);
		};
		W(F, (e) => {
			(t.onEdit || m().length > 0) && e(j);
		});
	}
	(A(() => M(l, t.name)), g(E, p), I());
}
T(['click']);
s.__docgen = {
	data: [
		{
			name: 'name',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'purpose',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'fillerCount',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'number', text: 'number' },
			static: !1,
			readonly: !1,
			defaultValue: '0'
		},
		{
			name: 'onClick',
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
			name: 'menuItems',
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
	name: 'RoleCard.svelte'
};
const oe = {
		component: s,
		title: 'Modules/OrgChart/RoleCard',
		tags: ['autodocs'],
		argTypes: {
			name: { control: { type: 'text' } },
			purpose: { control: { type: 'text' } },
			fillerCount: { control: { type: 'number' } }
		}
	},
	{ Story: f } = K();
var ie = h('<!> <!> <!> <!> <!> <!>', 1);
function P(E, t) {
	(D(t, !1), J());
	var k = ie(),
		m = $(k);
	f(m, {
		name: 'Default',
		args: { name: 'Product Manager', onClick: () => console.log('Clicked') },
		template: (a, o = u) => {
			s(a, v(o));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleCard {...args} />' } }
	});
	var b = r(m, 2);
	f(b, {
		name: 'WithPurpose',
		args: {
			name: 'Engineering Lead',
			purpose: 'Lead the engineering team',
			onClick: () => console.log('Clicked')
		},
		template: (a, o = u) => {
			s(a, v(o));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleCard {...args} />' } }
	});
	var p = r(b, 2);
	f(p, {
		name: 'WithFillers',
		args: { name: 'Designer', fillerCount: 3, onClick: () => console.log('Clicked') },
		template: (a, o = u) => {
			s(a, v(o));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleCard {...args} />' } }
	});
	var y = r(p, 2);
	f(y, {
		name: 'WithEdit',
		args: {
			name: 'Marketing Lead',
			purpose: 'Drive marketing strategy',
			onClick: () => console.log('Clicked'),
			onEdit: () => console.log('Edit clicked')
		},
		template: (a, o = u) => {
			s(a, v(o));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleCard {...args} />' } }
	});
	var C = r(y, 2);
	f(C, {
		name: 'WithMenu',
		args: {
			name: 'Operations Manager',
			purpose: 'Manage daily operations',
			onClick: () => console.log('Clicked'),
			menuItems: [
				{ label: 'Edit', onclick: () => console.log('Edit') },
				{ label: 'Delete', onclick: () => console.log('Delete'), danger: !0 }
			]
		},
		template: (a, o = u) => {
			s(a, v(o));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleCard {...args} />' } }
	});
	var x = r(C, 2);
	(f(x, {
		name: 'WithAllActions',
		args: {
			name: 'Sales Director',
			purpose: 'Lead sales team',
			onClick: () => console.log('Clicked'),
			onEdit: () => console.log('Edit'),
			menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
		},
		template: (a, o = u) => {
			s(a, v(o));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<RoleCard {...args} />' } }
	}),
		g(E, k),
		I());
}
P.__docgen = { data: [], name: 'RoleCard.stories.svelte' };
const _ = G(P, oe),
	Ne = ['Default', 'WithPurpose', 'WithFillers', 'WithEdit', 'WithMenu', 'WithAllActions'],
	Qe = { ..._.Default, tags: ['svelte-csf-v5'] },
	Xe = { ..._.WithPurpose, tags: ['svelte-csf-v5'] },
	Ye = { ..._.WithFillers, tags: ['svelte-csf-v5'] },
	Ze = { ..._.WithEdit, tags: ['svelte-csf-v5'] },
	et = { ..._.WithMenu, tags: ['svelte-csf-v5'] },
	tt = { ..._.WithAllActions, tags: ['svelte-csf-v5'] };
export {
	Qe as Default,
	tt as WithAllActions,
	Ze as WithEdit,
	Ye as WithFillers,
	et as WithMenu,
	Xe as WithPurpose,
	Ne as __namedExportsOrder,
	oe as default
};
