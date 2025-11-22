import {
	p as q,
	h as B,
	c as z,
	f as E,
	s as c,
	e as $,
	t as T,
	i as k,
	b as w,
	m as F,
	j as N,
	v as l,
	w as j,
	a as G,
	n as v,
	M as _,
	d as g
} from './iframe-DYn7RqBV.js';
import { c as J, i as K } from './create-runtime-stories-2rm03jka.js';
import { d as L } from './index-QxUtaCdU.js';
import './Button-2sxpTgAx.js';
import { C as W } from './Card-BkEjQl_7.js';
import './Badge-Bhcc4KqB.js';
import './Chip-D9RR8mAy.js';
import './Icon-nf143nWr.js';
import { T as D } from './Text-D3pLiP_j.js';
import './Heading-C09xnpWF.js';
import './Avatar-v8gaQbw7.js';
import './Loading-D_6SL4r8.js';
import './KeyboardShortcut-CeSHTUfy.js';
import './StatusPill-DGMja1Ui.js';
import './PinInput-qBurm280.js';
import './FormInput-CwvyCBJx.js';
import './FormTextarea-DT7j-4wT.js';
/* empty css                                                  */ import './IconButton-BjKeipeo.js';
import './LoadingOverlay-Bob-KG3J.js';
import './SplitButton-DPEFMT_j.js';
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
function X(m) {
	if (!m) return '';
	const o = new Date(m),
		p = new Date().getTime() - o.getTime(),
		e = Math.floor(p / (1e3 * 60 * 60 * 24));
	return e === 0
		? 'Today'
		: e === 1
			? '1d'
			: e < 7
				? `${e}d`
				: e < 30
					? `${Math.floor(e / 7)}w`
					: e < 365
						? `${Math.floor(e / 30)}mo`
						: `${Math.floor(e / 365)}y`;
}
var Y = E(
	'<div class="px-inbox-card py-inbox-card-compact"><div class="flex items-start gap-inbox-icon"><div class="flex-shrink-0 text-body leading-none"> </div> <div class="min-w-0 flex-1"><div class="flex items-center justify-between gap-inbox-icon"><!> <!></div> <!></div></div></div>'
);
function d(m, o) {
	q(o, !0);
	let C = B(o, 'selected', 3, !1);
	function p(n) {
		switch (n) {
			case 'readwise_highlight':
				return '📚';
			case 'photo_note':
				return '📷';
			case 'manual_text':
				return '✍️';
			case 'note':
				return '📝';
			default:
				return '📋';
		}
	}
	const e = 'w-full text-left transition-all duration-150',
		y = j(() =>
			C()
				? 'border-2 border-selected bg-selected/10'
				: 'border border-base hover:bg-hover-solid hover:border-elevated'
		),
		f = j(() => `${e} ${l(y)}`);
	(W(m, {
		variant: 'noPadding',
		clickable: !0,
		get 'data-inbox-item-id'() {
			return o.item._id;
		},
		get class() {
			return l(f);
		},
		onclick: (n) => {
			(n.currentTarget?.blur(), o.onClick());
		},
		children: (n, M) => {
			var t = Y(),
				r = $(t),
				a = $(r),
				s = $(a),
				H = c(a, 2),
				P = $(H),
				S = $(P);
			D(S, {
				variant: 'body',
				size: 'sm',
				as: 'h3',
				class: 'truncate leading-tight font-semibold',
				children: (i, I) => {
					var u = T();
					(k(() => N(u, o.item.title || 'Untitled')), w(i, u));
				},
				$$slots: { default: !0 }
			});
			var O = c(S, 2);
			{
				var Q = (i) => {
					D(i, {
						variant: 'caption',
						size: 'sm',
						as: 'span',
						class: 'flex-shrink-0 text-tertiary',
						children: (I, u) => {
							var A = T();
							(k((V) => N(A, V), [() => X(o.item.createdAt)]), w(I, A));
						},
						$$slots: { default: !0 }
					});
				};
				F(O, (i) => {
					o.item.createdAt && i(Q);
				});
			}
			var U = c(P, 2);
			(D(U, {
				variant: 'body',
				size: 'sm',
				class: 'truncate leading-tight text-secondary',
				children: (i, I) => {
					var u = T();
					(k(() => N(u, o.item.snippet || 'No preview available')), w(i, u));
				},
				$$slots: { default: !0 }
			}),
				k((i) => N(s, i), [() => p(o.item.type)]),
				w(n, t));
		},
		$$slots: { default: !0 }
	}),
		z());
}
d.__docgen = {
	data: [
		{
			name: 'item',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'object', text: 'InboxItem' },
			static: !1,
			readonly: !1
		},
		{
			name: 'selected',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'boolean', text: 'boolean' },
			static: !1,
			readonly: !1,
			defaultValue: 'false'
		},
		{
			name: 'onClick',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
			static: !1,
			readonly: !1
		}
	],
	name: 'InboxCard.svelte'
};
const Z = { component: d, title: 'Modules/Inbox/InboxCard', tags: ['autodocs'] },
	{ Story: x } = L(),
	b = {
		_id: 'test-123',
		type: 'readwise_highlight',
		title: 'Example Highlight Title',
		snippet: 'This is a preview snippet of the highlight content that would appear in the inbox.',
		createdAt: Date.now() - 36e5
	};
var ee = E('<!> <!> <!> <!> <!> <!>', 1);
function R(m, o) {
	(q(o, !1), K());
	var C = ee(),
		p = G(C);
	{
		const t = (a, s = v) => {
			d(a, g(s));
		};
		let r = _(() => ({ item: b, selected: !1, onClick: () => {} }));
		x(p, {
			name: 'Default',
			get args() {
				return l(r);
			},
			template: t,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<InboxCard {...args} />' } }
		});
	}
	var e = c(p, 2);
	{
		const t = (a, s = v) => {
			d(a, g(s));
		};
		let r = _(() => ({ item: b, selected: !0, onClick: () => {} }));
		x(e, {
			name: 'Selected',
			get args() {
				return l(r);
			},
			template: t,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<InboxCard {...args} />' } }
		});
	}
	var y = c(e, 2);
	{
		const t = (a, s = v) => {
			d(a, g(s));
		};
		let r = _(() => ({
			item: { ...b, type: 'photo_note', title: 'Photo Note Title' },
			selected: !1,
			onClick: () => {}
		}));
		x(y, {
			name: 'Photo Note',
			get args() {
				return l(r);
			},
			template: t,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<InboxCard {...args} />' } }
		});
	}
	var f = c(y, 2);
	{
		const t = (a, s = v) => {
			d(a, g(s));
		};
		let r = _(() => ({
			item: { ...b, type: 'manual_text', title: 'Manual Text Entry' },
			selected: !1,
			onClick: () => {}
		}));
		x(f, {
			name: 'Manual Text',
			get args() {
				return l(r);
			},
			template: t,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<InboxCard {...args} />' } }
		});
	}
	var n = c(f, 2);
	{
		const t = (a, s = v) => {
			d(a, g(s));
		};
		let r = _(() => ({
			item: { ...b, type: 'note', title: 'Quick Note' },
			selected: !1,
			onClick: () => {}
		}));
		x(n, {
			name: 'Note',
			get args() {
				return l(r);
			},
			template: t,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<InboxCard {...args} />' } }
		});
	}
	var M = c(n, 2);
	{
		const t = (a, s = v) => {
			d(a, g(s));
		};
		let r = _(() => ({ item: { ...b, createdAt: void 0 }, selected: !1, onClick: () => {} }));
		x(M, {
			name: 'No Date',
			get args() {
				return l(r);
			},
			template: t,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<InboxCard {...args} />' } }
		});
	}
	(w(m, C), z());
}
R.__docgen = { data: [], name: 'InboxCard.stories.svelte' };
const h = J(R, Z),
	Be = ['Default', 'Selected', 'PhotoNote', 'ManualText', 'Note', 'NoDate'],
	Fe = { ...h.Default, tags: ['svelte-csf-v5'] },
	Ge = { ...h.Selected, tags: ['svelte-csf-v5'] },
	Je = { ...h.PhotoNote, tags: ['svelte-csf-v5'] },
	Ke = { ...h.ManualText, tags: ['svelte-csf-v5'] },
	Le = { ...h.Note, tags: ['svelte-csf-v5'] },
	We = { ...h.NoDate, tags: ['svelte-csf-v5'] };
export {
	Fe as Default,
	Ke as ManualText,
	We as NoDate,
	Le as Note,
	Je as PhotoNote,
	Ge as Selected,
	Be as __namedExportsOrder,
	Z as default
};
