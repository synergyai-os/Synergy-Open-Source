import {
	E as o,
	h as X,
	F as s,
	a as t,
	a9 as c,
	f as q,
	m as A,
	b as e,
	s as D,
	v as a,
	i as Y,
	j as Z,
	e as ee,
	a8 as O,
	ab as te,
	w as re,
	k as S,
	g as ae
} from './iframe-DYn7RqBV.js';
import { e as se } from './each-DHv61wEY.js';
import { M as oe, D as ne, a as ie, b as le } from './SplitButton-DPEFMT_j.js';
import { P as ce } from './portal-c1AsCbfc.js';
o(['click']);
o(['click']);
o(['click']);
o(['click']);
o(['click']);
o(['click']);
var de = ae(
		'<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>'
	),
	ve = q('<!> <span> </span>', 1),
	ue = q('<!> <!>', 1);
function fe(B, d) {
	let C = X(d, 'class', 3, ''),
		u = te(!1);
	var x = s(),
		E = t(x);
	(c(
		E,
		() => le,
		(F, I) => {
			I(F, {
				get open() {
					return a(u);
				},
				set open(f) {
					O(u, f, !0);
				},
				children: (f, me) => {
					var $ = ue(),
						M = t($);
					c(
						M,
						() => oe,
						(m, p) => {
							p(m, {
								type: 'button',
								get class() {
									return `flex icon-xl items-center justify-center rounded-button text-secondary transition-colors hover:bg-hover-solid hover:text-primary ${C() ?? ''}`;
								},
								'aria-label': 'More options',
								children: (g, V) => {
									var i = s(),
										_ = t(i);
									{
										var b = (r) => {
												var l = s(),
													v = t(l);
												(S(v, () => d.trigger), e(r, l));
											},
											y = (r) => {
												var l = de();
												e(r, l);
											};
										A(_, (r) => {
											d.trigger ? r(b) : r(y, !1);
										});
									}
									e(g, i);
								},
								$$slots: { default: !0 }
							});
						}
					);
					var N = D(M, 2);
					(c(
						N,
						() => ce,
						(m, p) => {
							p(m, {
								children: (g, V) => {
									var i = s(),
										_ = t(i);
									(c(
										_,
										() => ne,
										(b, y) => {
											y(b, {
												class:
													'z-50 min-w-[180px] rounded-button border border-base bg-elevated py-section shadow-card',
												side: 'bottom',
												align: 'end',
												sideOffset: 4,
												children: (r, l) => {
													var v = s(),
														G = t(v);
													(se(
														G,
														17,
														() => d.items,
														(k) => k.label,
														(k, n) => {
															var w = s(),
																H = t(w);
															{
																let J = re(() => (a(n).danger ? 'text-error' : 'text-primary'));
																c(
																	H,
																	() => ie,
																	(K, L) => {
																		L(K, {
																			get class() {
																				return `flex cursor-pointer items-center gap-icon px-menu-item py-menu-item text-button transition-colors outline-none hover:bg-hover-solid focus:bg-hover-solid ${a(J) ?? ''}`;
																			},
																			get textValue() {
																				return a(n).label;
																			},
																			onSelect: () => {
																				(a(n).onclick(), O(u, !1));
																			},
																			children: (Q, pe) => {
																				var P = ve(),
																					z = t(P);
																				{
																					var R = (h) => {
																						var j = s(),
																							W = t(j);
																						(S(W, () => a(n).icon), e(h, j));
																					};
																					A(z, (h) => {
																						a(n).icon && h(R);
																					});
																				}
																				var T = D(z, 2),
																					U = ee(T);
																				(Y(() => Z(U, a(n).label)), e(Q, P));
																			},
																			$$slots: { default: !0 }
																		});
																	}
																);
															}
															e(k, w);
														}
													),
														e(r, v));
												},
												$$slots: { default: !0 }
											});
										}
									),
										e(g, i));
								},
								$$slots: { default: !0 }
							});
						}
					),
						e(f, $));
				},
				$$slots: { default: !0 }
			});
		}
	),
		e(B, x));
}
fe.__docgen = {
	data: [
		{
			name: 'items',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'array', text: 'MenuItem[]' },
			static: !1,
			readonly: !1
		},
		{
			name: 'trigger',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: 'Snippet<[]>' },
			static: !1,
			readonly: !1
		},
		{
			name: 'class',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		}
	],
	name: 'ActionMenu.svelte'
};
o(['click']);
export { fe as A };
