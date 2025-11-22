import {
	ae as ne,
	p as ee,
	h as t,
	F as v,
	a as u,
	m as G,
	b as n,
	c as te,
	k as C,
	v as l,
	w as K,
	f as V,
	n as Z,
	e as A,
	o as ae,
	d as ie,
	a9 as X,
	i as oe,
	t as ue,
	s as le,
	j as de,
	g as fe,
	a8 as ce,
	ab as ve
} from './iframe-DYn7RqBV.js';
import { e as me } from './each-DHv61wEY.js';
import { s as ge } from './class-BLXIZATI.js';
import { B as ye } from './Button-2sxpTgAx.js';
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
import './create-runtime-stories-2rm03jka.js';
/* empty css                                                  */ import './IconButton-BjKeipeo.js';
import './LoadingOverlay-Bob-KG3J.js';
import { a as H } from './attributes-D2XuSyo_.js';
import {
	M as _e,
	a as be,
	b as he,
	c as Pe,
	D as we
} from './is-using-keyboard.svelte-qppEaaQk.js';
import { d as se, b as c, m as Y } from './create-id-CD7dpc57.js';
import {
	F as ke,
	P as xe,
	a as Se,
	g as pe,
	b as Me
} from './popper-layer-force-mount-B5n7-529.js';
import { P as Ce } from './portal-c1AsCbfc.js';
import { n as J } from './noop-DX6rZLP_.js';
var Oe = V('<div><!></div>');
function Fe(w, e) {
	const y = ne();
	ee(e, !0);
	let m = t(e, 'ref', 15, null),
		f = t(e, 'id', 19, () => se(y)),
		g = t(e, 'disabled', 3, !1),
		h = t(e, 'onSelect', 3, J),
		k = t(e, 'closeOnSelect', 3, !0),
		p = ae(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'child',
			'children',
			'ref',
			'id',
			'disabled',
			'onSelect',
			'closeOnSelect'
		]);
	const _ = _e.create({
			id: c(() => f()),
			disabled: c(() => g()),
			onSelect: c(() => h()),
			ref: c(
				() => m(),
				(i) => m(i)
			),
			closeOnSelect: c(() => k())
		}),
		s = K(() => Y(p, _.props));
	var O = v(),
		r = u(O);
	{
		var x = (i) => {
				var a = v(),
					d = u(a);
				(C(
					d,
					() => e.child,
					() => ({ props: l(s) })
				),
					n(i, a));
			},
			F = (i) => {
				var a = Oe();
				H(a, () => ({ ...l(s) }));
				var d = A(a);
				(C(d, () => e.children ?? Z), n(i, a));
			};
		G(r, (i) => {
			e.child ? i(x) : i(F, !1);
		});
	}
	(n(w, O), te());
}
function Ie(w, e) {
	ee(e, !0);
	let y = t(e, 'open', 15, !1),
		m = t(e, 'dir', 3, 'ltr'),
		f = t(e, 'onOpenChange', 3, J),
		g = t(e, 'onOpenChangeComplete', 3, J),
		h = t(e, '_internal_variant', 3, 'dropdown-menu');
	const k = be.create({
		variant: c(() => h()),
		dir: c(() => m()),
		onClose: () => {
			(y(!1), f()(!1));
		}
	});
	(he.create(
		{
			open: c(
				() => y(),
				(p) => {
					(y(p), f()(p));
				}
			),
			onOpenChangeComplete: c(() => g())
		},
		k
	),
		ke(w, {
			children: (p, _) => {
				var s = v(),
					O = u(s);
				(C(O, () => e.children ?? Z), n(p, s));
			},
			$$slots: { default: !0 }
		}),
		te());
}
var Ee = V('<div><div><!></div></div>'),
	Be = V('<div><div><!></div></div>');
function Ke(w, e) {
	const y = ne();
	ee(e, !0);
	let m = t(e, 'id', 19, () => se(y)),
		f = t(e, 'ref', 15, null),
		g = t(e, 'loop', 3, !0),
		h = t(e, 'onInteractOutside', 3, J),
		k = t(e, 'onEscapeKeydown', 3, J),
		p = t(e, 'onCloseAutoFocus', 3, J),
		_ = t(e, 'forceMount', 3, !1),
		s = t(e, 'trapFocus', 3, !1),
		O = ae(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'id',
			'child',
			'children',
			'ref',
			'loop',
			'onInteractOutside',
			'onEscapeKeydown',
			'onCloseAutoFocus',
			'forceMount',
			'trapFocus'
		]);
	const r = Pe.create({
			id: c(() => m()),
			loop: c(() => g()),
			ref: c(
				() => f(),
				(o) => f(o)
			),
			onCloseAutoFocus: c(() => p())
		}),
		x = K(() => Y(O, r.props));
	function F(o) {
		if ((r.handleInteractOutside(o), !o.defaultPrevented && (h()(o), !o.defaultPrevented))) {
			if (o.target && o.target instanceof Element) {
				const D = `[${r.parentMenu.root.getBitsAttr('sub-content')}]`;
				if (o.target.closest(D)) return;
			}
			r.parentMenu.onClose();
		}
	}
	function i(o) {
		(k()(o), !o.defaultPrevented && r.parentMenu.onClose());
	}
	var a = v(),
		d = u(a);
	{
		var I = (o) => {
				xe(
					o,
					ie(
						() => l(x),
						() => r.popperProps,
						{
							get ref() {
								return r.opts.ref;
							},
							get enabled() {
								return r.parentMenu.opts.open.current;
							},
							onInteractOutside: F,
							onEscapeKeydown: i,
							get trapFocus() {
								return s();
							},
							get loop() {
								return g();
							},
							forceMount: !0,
							get id() {
								return m();
							},
							get shouldRender() {
								return r.shouldRender;
							},
							popper: (U, j) => {
								let L = () => j?.().props,
									z = () => j?.().wrapperProps;
								const N = K(() => Y(L(), { style: pe('dropdown-menu') }));
								var S = v(),
									R = u(S);
								{
									var q = (b) => {
											var P = v(),
												E = u(P);
											{
												let W = K(() => ({ props: l(N), wrapperProps: z(), ...r.snippetProps }));
												C(
													E,
													() => e.child,
													() => l(W)
												);
											}
											n(b, P);
										},
										T = (b) => {
											var P = Ee();
											H(P, () => ({ ...z() }));
											var E = A(P);
											H(E, () => ({ ...l(N) }));
											var W = A(E);
											(C(W, () => e.children ?? Z), n(b, P));
										};
									G(R, (b) => {
										e.child ? b(q) : b(T, !1);
									});
								}
								n(U, S);
							},
							$$slots: { popper: !0 }
						}
					)
				);
			},
			Q = (o) => {
				var D = v(),
					U = u(D);
				{
					var j = (L) => {
						Se(
							L,
							ie(
								() => l(x),
								() => r.popperProps,
								{
									get ref() {
										return r.opts.ref;
									},
									get open() {
										return r.parentMenu.opts.open.current;
									},
									onInteractOutside: F,
									onEscapeKeydown: i,
									get trapFocus() {
										return s();
									},
									get loop() {
										return g();
									},
									forceMount: !1,
									get id() {
										return m();
									},
									get shouldRender() {
										return r.shouldRender;
									},
									popper: (N, S) => {
										let R = () => S?.().props,
											q = () => S?.().wrapperProps;
										const T = K(() => Y(R(), { style: pe('dropdown-menu') }));
										var b = v(),
											P = u(b);
										{
											var E = (M) => {
													var B = v(),
														$ = u(B);
													{
														let re = K(() => ({
															props: l(T),
															wrapperProps: q(),
															...r.snippetProps
														}));
														C(
															$,
															() => e.child,
															() => l(re)
														);
													}
													n(M, B);
												},
												W = (M) => {
													var B = Be();
													H(B, () => ({ ...q() }));
													var $ = A(B);
													H($, () => ({ ...l(T) }));
													var re = A($);
													(C(re, () => e.children ?? Z), n(M, B));
												};
											G(P, (M) => {
												e.child ? M(E) : M(W, !1);
											});
										}
										n(N, b);
									},
									$$slots: { popper: !0 }
								}
							)
						);
					};
					G(
						U,
						(L) => {
							_() || L(j);
						},
						!0
					);
				}
				n(o, D);
			};
		G(d, (o) => {
			_() ? o(I) : o(Q, !1);
		});
	}
	(n(w, a), te());
}
var Ae = V('<button><!></button>');
function De(w, e) {
	const y = ne();
	ee(e, !0);
	let m = t(e, 'id', 19, () => se(y)),
		f = t(e, 'ref', 15, null),
		g = t(e, 'disabled', 3, !1),
		h = t(e, 'type', 3, 'button'),
		k = ae(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'id',
			'ref',
			'child',
			'children',
			'disabled',
			'type'
		]);
	const p = we.create({
			id: c(() => m()),
			disabled: c(() => g() ?? !1),
			ref: c(
				() => f(),
				(s) => f(s)
			)
		}),
		_ = K(() => Y(k, p.props, { type: h() }));
	(Me(w, {
		get id() {
			return m();
		},
		get ref() {
			return p.opts.ref;
		},
		children: (s, O) => {
			var r = v(),
				x = u(r);
			{
				var F = (a) => {
						var d = v(),
							I = u(d);
						(C(
							I,
							() => e.child,
							() => ({ props: l(_) })
						),
							n(a, d));
					},
					i = (a) => {
						var d = Ae();
						H(d, () => ({ ...l(_) }));
						var I = A(d);
						(C(I, () => e.children ?? Z), n(a, d));
					};
				G(x, (a) => {
					e.child ? a(F) : a(i, !1);
				});
			}
			n(s, r);
		},
		$$slots: { default: !0 }
	}),
		te());
}
var Re = fe(
		'<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>'
	),
	qe = V('<span> </span>'),
	Ve = V('<!> <!>', 1),
	je = V('<div><!> <!></div>');
function Le(w, e) {
	let y = t(e, 'variant', 3, 'primary'),
		m = t(e, 'class', 3, ''),
		f = ve(!1);
	var g = je(),
		h = A(g);
	ye(h, {
		get variant() {
			return y();
		},
		get onclick() {
			return e.primaryOnclick;
		},
		class: 'rounded-r-none',
		children: (p, _) => {
			var s = ue();
			(oe(() => de(s, e.primaryLabel)), n(p, s));
		},
		$$slots: { default: !0 }
	});
	var k = le(h, 2);
	(X(
		k,
		() => Ie,
		(p, _) => {
			_(p, {
				get open() {
					return l(f);
				},
				set open(s) {
					ce(f, s, !0);
				},
				children: (s, O) => {
					var r = Ve(),
						x = u(r);
					{
						let i = K(() =>
							y() === 'primary'
								? 'bg-accent-primary text-primary hover:bg-accent-hover'
								: 'bg-elevated text-primary hover:bg-hover-solid'
						);
						X(
							x,
							() => De,
							(a, d) => {
								d(a, {
									type: 'button',
									get class() {
										return `rounded-r-button flex items-center border-l border-base px-section transition-colors
				${l(i) ?? ''}`;
									},
									children: (I, Q) => {
										var o = Re();
										n(I, o);
									},
									$$slots: { default: !0 }
								});
							}
						);
					}
					var F = le(x, 2);
					(X(
						F,
						() => Ce,
						(i, a) => {
							a(i, {
								children: (d, I) => {
									var Q = v(),
										o = u(Q);
									(X(
										o,
										() => Ke,
										(D, U) => {
											U(D, {
												class:
													'z-50 min-w-[180px] rounded-button border border-base bg-elevated py-section shadow-card',
												side: 'bottom',
												align: 'end',
												sideOffset: 4,
												children: (j, L) => {
													var z = v(),
														N = u(z);
													(me(
														N,
														17,
														() => e.dropdownItems,
														(S) => S.label,
														(S, R) => {
															var q = v(),
																T = u(q);
															(X(
																T,
																() => Fe,
																(b, P) => {
																	P(b, {
																		class:
																			'flex cursor-pointer items-center px-menu-item py-menu-item text-button text-primary transition-colors outline-none hover:bg-hover-solid focus:bg-hover-solid',
																		get textValue() {
																			return l(R).label;
																		},
																		onSelect: () => {
																			(l(R).onclick(), ce(f, !1));
																		},
																		children: (E, W) => {
																			var M = qe(),
																				B = A(M);
																			(oe(() => de(B, l(R).label)), n(E, M));
																		},
																		$$slots: { default: !0 }
																	});
																}
															),
																n(S, q));
														}
													),
														n(j, z));
												},
												$$slots: { default: !0 }
											});
										}
									),
										n(d, Q));
								},
								$$slots: { default: !0 }
							});
						}
					),
						n(s, r));
				},
				$$slots: { default: !0 }
			});
		}
	),
		oe(() => ge(g, 1, `inline-flex ${m() ?? ''}`)),
		n(w, g));
}
Le.__docgen = {
	data: [
		{
			name: 'primaryLabel',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'primaryOnclick',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
			static: !1,
			readonly: !1
		},
		{
			name: 'dropdownItems',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'array', text: 'DropdownItem[]' },
			static: !1,
			readonly: !1
		},
		{
			name: 'variant',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'primary', text: '"primary"' },
					{ kind: 'const', type: 'string', value: 'secondary', text: '"secondary"' }
				],
				text: '"primary" | "secondary"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"primary"'
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
	name: 'SplitButton.svelte'
};
export { Ke as D, De as M, Le as S, Fe as a, Ie as b };
