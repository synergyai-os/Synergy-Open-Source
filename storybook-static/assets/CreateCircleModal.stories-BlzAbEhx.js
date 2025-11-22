import {
	p as Y,
	h as pe,
	F as U,
	a as $,
	a9 as h,
	b as s,
	c as Z,
	E as fe,
	f as P,
	e as l,
	t as V,
	s as a,
	m as ve,
	i as B,
	j as G,
	aa as be,
	a8 as p,
	ab as D,
	v as r,
	n as H,
	M as J,
	d as K
} from './iframe-DYn7RqBV.js';
import { c as _e, i as ge } from './create-runtime-stories-2rm03jka.js';
import { d as Ce } from './index-QxUtaCdU.js';
import { e as xe } from './each-DHv61wEY.js';
import { s as L, c as ye } from './attributes-D2XuSyo_.js';
import { b as Q } from './input-XwGP8Xvd.js';
import { D as he, a as we, b as Pe, c as ke } from './dialog-content-orwc9n3O.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './create-id-CD7dpc57.js';
import './noop-DX6rZLP_.js';
import './watch.svelte-CYSsdG2H.js';
import './context-DWcBTeuX.js';
import './is-using-keyboard.svelte-qppEaaQk.js';
import './is-DtD5rb4o.js';
import './kbd-constants-Duhtze-4.js';
import './dom-context.svelte-Cee2qr-t.js';
import './arrays-C786ZheV.js';
import './roving-focus-group-B-fCEnqo.js';
import './use-id-C09Eugg1.js';
var Ie = P('<option> </option>'),
	Me = P(
		'<label class="flex flex-col gap-form-field"><span class="text-button font-medium text-primary">Parent circle (optional)</span> <select class="w-full rounded-button border border-base bg-elevated px-nav-item py-nav-item text-button text-primary focus:border-accent-primary focus:outline-none"><option>None (top-level circle)</option><!></select></label>'
	),
	De = P(
		'<div class="space-y-6 px-inbox-container py-inbox-container"><div><!> <!></div> <form class="space-y-form-section"><label class="flex flex-col gap-form-field"><span class="text-button font-medium text-primary">Circle name *</span> <input class="w-full rounded-button border border-base bg-elevated px-nav-item py-nav-item text-button text-primary focus:border-accent-primary focus:outline-none" placeholder="e.g. Active Platforms" required/></label> <label class="flex flex-col gap-form-field"><span class="text-button font-medium text-primary">Purpose (optional)</span> <textarea class="w-full rounded-button border border-base bg-elevated px-nav-item py-nav-item text-button text-primary focus:border-accent-primary focus:outline-none" placeholder="Why this work exists..."></textarea></label> <!> <div class="flex items-center justify-end gap-button-group pt-2"><button type="button" class="rounded-button border border-base px-card py-input-y text-button font-medium text-secondary hover:text-primary disabled:opacity-50">Cancel</button> <button type="submit" class="text-on-solid rounded-button bg-accent-primary px-card py-input-y text-button font-medium disabled:opacity-50"> </button></div></form></div>'
	);
function w(o, e) {
	Y(e, !0);
	let v = pe(e, 'availableCircles', 19, () => []),
		n = D(''),
		c = D(''),
		i = D('');
	async function b() {
		(await e.circles.createCircle({
			name: r(n),
			purpose: r(c) || void 0,
			parentCircleId: r(i) || void 0
		}),
			e.circles.modals.createCircle || (p(n, ''), p(c, ''), p(i, '')));
	}
	var d = U(),
		_ = $(d);
	(h(
		_,
		() => ke,
		(ae, re) => {
			re(ae, {
				get open() {
					return e.circles.modals.createCircle;
				},
				onOpenChange: (k) => !k && e.circles.closeModal('createCircle'),
				children: (k, je) => {
					var W = U(),
						le = $(W);
					(h(
						le,
						() => he,
						(oe, ie) => {
							ie(oe, {
								class:
									'w-[min(500px,90vw)] max-w-lg rounded-card border border-base bg-surface text-primary shadow-card-hover',
								children: (se, qe) => {
									var j = De(),
										q = l(j),
										z = l(q);
									h(
										z,
										() => we,
										(t, m) => {
											m(t, {
												class: 'text-h3 font-semibold text-primary',
												children: (u, g) => {
													var C = V('Create circle');
													s(u, C);
												},
												$$slots: { default: !0 }
											});
										}
									);
									var ne = a(z, 2);
									h(
										ne,
										() => Pe,
										(t, m) => {
											m(t, {
												class: 'mt-1 text-button text-secondary',
												children: (u, g) => {
													var C = V(
														'Circles represent work organization units like value streams or coordination contexts.'
													);
													s(u, C);
												},
												$$slots: { default: !0 }
											});
										}
									);
									var E = a(q, 2),
										O = l(E),
										A = a(l(O), 2);
									L(A, 'minlength', 2);
									var F = a(O, 2),
										R = a(l(F), 2);
									L(R, 'rows', 3);
									var S = a(F, 2);
									{
										var ce = (t) => {
											var m = Me(),
												u = a(l(m), 2),
												g = l(u);
											g.value = g.__value = '';
											var C = a(g);
											(xe(
												C,
												17,
												v,
												(x) => x.circleId,
												(x, M) => {
													var y = Ie(),
														ue = l(y),
														T = {};
													(B(() => {
														(G(ue, r(M).name),
															T !== (T = r(M).circleId) &&
																(y.value = (y.__value = r(M).circleId) ?? ''));
													}),
														s(x, y));
												}
											),
												ye(
													u,
													() => r(i),
													(x) => p(i, x)
												),
												s(t, m));
										};
										ve(S, (t) => {
											v().length > 0 && t(ce);
										});
									}
									var de = a(S, 2),
										I = l(de);
									I.__click = () => e.circles.closeModal('createCircle');
									var N = a(I, 2),
										me = l(N);
									(B(() => {
										((I.disabled = e.circles.loading.createCircle),
											(N.disabled = e.circles.loading.createCircle),
											G(me, e.circles.loading.createCircle ? 'Creating...' : 'Create'));
									}),
										be('submit', E, (t) => {
											(t.preventDefault(), b());
										}),
										Q(
											A,
											() => r(n),
											(t) => p(n, t)
										),
										Q(
											R,
											() => r(c),
											(t) => p(c, t)
										),
										s(se, j));
								},
								$$slots: { default: !0 }
							});
						}
					),
						s(k, W));
				},
				$$slots: { default: !0 }
			});
		}
	),
		s(o, d),
		Z());
}
fe(['click']);
w.__docgen = {
	data: [
		{
			name: 'circles',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: {
				kind: 'type',
				type: 'object',
				text: 'Pick<{ readonly circles: { circleId: Id<"circles">; organizationId: Id<"organizations">; name: string; slug: string; purpose: string | undefined; parentCircleId: Id<"circles"> | undefined; ... 6 more ...; archivedAt: number | undefined; }[]; ... 15 more ...; removeUserFromRole: (args: { ...; }) => Promise<...>; }, "...'
			},
			static: !1,
			readonly: !1
		},
		{
			name: 'availableCircles',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'array', text: '{ circleId: string; name: string; }[]' },
			static: !1,
			readonly: !1,
			defaultValue: '[]'
		}
	],
	name: 'CreateCircleModal.svelte'
};
const $e = { component: w, title: 'Modules/OrgChart/CreateCircleModal', tags: ['autodocs'] },
	{ Story: X } = Ce(),
	f = {
		modals: { createCircle: !0 },
		loading: { createCircle: !1 },
		closeModal: (o) => {
			(console.log('Close modal:', o), o === 'createCircle' && (f.modals.createCircle = !1));
		},
		createCircle: async (o) => (
			console.log('Create circle:', o),
			(f.loading.createCircle = !0),
			await new Promise((e) => setTimeout(e, 500)),
			(f.loading.createCircle = !1),
			(f.modals.createCircle = !1),
			Promise.resolve()
		)
	};
var We = P('<!> <!>', 1);
function ee(o, e) {
	(Y(e, !1), ge());
	var v = We(),
		n = $(v);
	{
		const i = (d, _ = H) => {
			w(d, K(_));
		};
		let b = J(() => ({ circles: f }));
		X(n, {
			name: 'Default',
			get args() {
				return r(b);
			},
			template: i,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<CreateCircleModal {...args} />' } }
		});
	}
	var c = a(n, 2);
	{
		const i = (d, _ = H) => {
			w(d, K(_));
		};
		let b = J(() => ({
			circles: f,
			availableCircles: [
				{ circleId: '1', name: 'Engineering' },
				{ circleId: '2', name: 'Product' }
			]
		}));
		X(c, {
			name: 'WithParentCircles',
			get args() {
				return r(b);
			},
			template: i,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<CreateCircleModal {...args} />' } }
		});
	}
	(s(o, v), Z());
}
ee.__docgen = { data: [], name: 'CreateCircleModal.stories.svelte' };
const te = _e(ee, $e),
	et = ['Default', 'WithParentCircles'],
	tt = { ...te.Default, tags: ['svelte-csf-v5'] },
	at = { ...te.WithParentCircles, tags: ['svelte-csf-v5'] };
export { tt as Default, at as WithParentCircles, et as __namedExportsOrder, $e as default };
