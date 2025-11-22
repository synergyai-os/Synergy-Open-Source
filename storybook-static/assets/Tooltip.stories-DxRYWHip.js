import {
	p as W,
	h as s,
	F as I,
	a as p,
	m as V,
	b as o,
	c as U,
	k as L,
	v as e,
	w as C,
	f as T,
	e as S,
	o as ut,
	n as z,
	g as Lt,
	i as St,
	d as R,
	a8 as v,
	ab as it,
	aA as Mt,
	ae as Ft,
	s as x,
	t as X
} from './iframe-DYn7RqBV.js';
import { c as jt, i as Wt } from './create-runtime-stories-2rm03jka.js';
import { d as Ut } from './index-QxUtaCdU.js';
import { w as Dt } from './watch.svelte-CYSsdG2H.js';
import { C as Rt } from './context-DWcBTeuX.js';
import { c as Gt, d as Vt } from './is-DtD5rb4o.js';
import {
	m as at,
	b as h,
	q as Nt,
	c as qt,
	a as At,
	h as Bt,
	d as Et
} from './create-id-CD7dpc57.js';
import { o as Jt, P as Qt, G as Xt } from './is-using-keyboard.svelte-qppEaaQk.js';
import { D as Yt } from './dom-context.svelte-Cee2qr-t.js';
import { o as Zt } from './on-mount-effect.svelte-DajC3xwp.js';
import {
	c as te,
	F as ee,
	P as oe,
	a as re,
	g as Ot,
	b as se
} from './popper-layer-force-mount-B5n7-529.js';
import { n as mt } from './noop-DX6rZLP_.js';
import { a as nt, s as kt } from './attributes-D2XuSyo_.js';
import { P as ne } from './portal-c1AsCbfc.js';
import { u as Kt } from './use-id-C09Eugg1.js';
import { B as Y } from './Button-2sxpTgAx.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './kbd-constants-Duhtze-4.js';
import './arrays-C786ZheV.js';
import './roving-focus-group-B-fCEnqo.js';
import './is-BGFdVicR.js';
import './style-MviLiK55.js';
import './this-Hz0nHxQJ.js';
var ie = Lt(
		'<svg viewBox="0 0 30 10" preserveAspectRatio="none" data-arrow=""><polygon points="0,0 30,0 15,10" fill="currentColor"></polygon></svg>'
	),
	ae = T('<span><!></span>');
function le(D, t) {
	W(t, !0);
	let i = s(t, 'id', 19, Kt),
		n = s(t, 'width', 3, 10),
		_ = s(t, 'height', 3, 5),
		w = ut(t, ['$$slots', '$$events', '$$legacy', 'id', 'children', 'child', 'width', 'height']);
	const N = C(() => at(w, { id: i() }));
	var O = I(),
		E = p(O);
	{
		var B = (g) => {
				var c = I(),
					K = p(c);
				(L(
					K,
					() => t.child,
					() => ({ props: e(N) })
				),
					o(g, c));
			},
			P = (g) => {
				var c = ae();
				nt(c, () => ({ ...e(N) }));
				var K = S(c);
				{
					var m = (a) => {
							var r = I(),
								u = p(r);
							(L(u, () => t.children ?? z), o(a, r));
						},
						k = (a) => {
							var r = ie();
							(St(() => {
								(kt(r, 'width', n()), kt(r, 'height', _()));
							}),
								o(a, r));
						};
					V(K, (a) => {
						t.children ? a(m) : a(k, !1);
					});
				}
				o(g, c);
			};
		V(E, (g) => {
			t.child ? g(B) : g(P, !1);
		});
	}
	(o(D, O), U());
}
function de(D, t) {
	W(t, !0);
	let i = s(t, 'id', 19, Kt),
		n = s(t, 'ref', 15, null),
		_ = ut(t, ['$$slots', '$$events', '$$legacy', 'id', 'ref']);
	const w = te.create({
			id: h(() => i()),
			ref: h(
				() => n(),
				(O) => n(O)
			)
		}),
		N = C(() => at(_, w.props));
	(le(
		D,
		R(() => e(N))
	),
		U());
}
class yt {
	#o;
	#e;
	#t = null;
	constructor(t, i) {
		((this.#e = t),
			(this.#o = i),
			(this.stop = this.stop.bind(this)),
			(this.start = this.start.bind(this)),
			Jt(this.stop));
	}
	#r() {
		this.#t !== null && (window.clearTimeout(this.#t), (this.#t = null));
	}
	stop() {
		this.#r();
	}
	start(...t) {
		(this.#r(),
			(this.#t = window.setTimeout(() => {
				((this.#t = null), this.#e(...t));
			}, this.#o)));
	}
}
const It = qt({ component: 'tooltip', parts: ['content', 'trigger'] }),
	Ht = new Rt('Tooltip.Provider'),
	Pt = new Rt('Tooltip.Root');
class Ct {
	static create(t) {
		return Ht.set(new Ct(t));
	}
	opts;
	#o = it(!0);
	get isOpenDelayed() {
		return e(this.#o);
	}
	set isOpenDelayed(t) {
		v(this.#o, t, !0);
	}
	isPointerInTransit = Nt(!1);
	#e;
	#t = it(null);
	constructor(t) {
		((this.opts = t),
			(this.#e = new yt(() => {
				this.isOpenDelayed = !0;
			}, this.opts.skipDelayDuration.current)));
	}
	#r = () => {
		this.opts.skipDelayDuration.current !== 0 && this.#e.start();
	};
	#n = () => {
		this.#e.stop();
	};
	onOpen = (t) => {
		(e(this.#t) && e(this.#t) !== t && e(this.#t).handleClose(),
			this.#n(),
			(this.isOpenDelayed = !1),
			v(this.#t, t, !0));
	};
	onClose = (t) => {
		(e(this.#t) === t && v(this.#t, null), this.#r());
	};
	isTooltipOpen = (t) => e(this.#t) === t;
}
class wt {
	static create(t) {
		return Pt.set(new wt(t, Ht.get()));
	}
	opts;
	provider;
	#o = C(() => this.opts.delayDuration.current ?? this.provider.opts.delayDuration.current);
	get delayDuration() {
		return e(this.#o);
	}
	set delayDuration(t) {
		v(this.#o, t);
	}
	#e = C(
		() =>
			this.opts.disableHoverableContent.current ??
			this.provider.opts.disableHoverableContent.current
	);
	get disableHoverableContent() {
		return e(this.#e);
	}
	set disableHoverableContent(t) {
		v(this.#e, t);
	}
	#t = C(
		() =>
			this.opts.disableCloseOnTriggerClick.current ??
			this.provider.opts.disableCloseOnTriggerClick.current
	);
	get disableCloseOnTriggerClick() {
		return e(this.#t);
	}
	set disableCloseOnTriggerClick(t) {
		v(this.#t, t);
	}
	#r = C(() => this.opts.disabled.current ?? this.provider.opts.disabled.current);
	get disabled() {
		return e(this.#r);
	}
	set disabled(t) {
		v(this.#r, t);
	}
	#n = C(
		() =>
			this.opts.ignoreNonKeyboardFocus.current ?? this.provider.opts.ignoreNonKeyboardFocus.current
	);
	get ignoreNonKeyboardFocus() {
		return e(this.#n);
	}
	set ignoreNonKeyboardFocus(t) {
		v(this.#n, t);
	}
	#a = it(null);
	get contentNode() {
		return e(this.#a);
	}
	set contentNode(t) {
		v(this.#a, t, !0);
	}
	contentPresence;
	#l = it(null);
	get triggerNode() {
		return e(this.#l);
	}
	set triggerNode(t) {
		v(this.#l, t, !0);
	}
	#i = it(!1);
	#s;
	#d = C(() =>
		this.opts.open.current ? (e(this.#i) ? 'delayed-open' : 'instant-open') : 'closed'
	);
	get stateAttr() {
		return e(this.#d);
	}
	set stateAttr(t) {
		v(this.#d, t);
	}
	constructor(t, i) {
		((this.opts = t),
			(this.provider = i),
			(this.#s = new yt(() => {
				(v(this.#i, !0), (this.opts.open.current = !0));
			}, this.delayDuration ?? 0)),
			(this.contentPresence = new Qt({
				open: this.opts.open,
				ref: h(() => this.contentNode),
				onComplete: () => {
					this.opts.onOpenChangeComplete.current(this.opts.open.current);
				}
			})),
			Dt(
				() => this.delayDuration,
				() => {
					this.delayDuration !== void 0 &&
						(this.#s = new yt(() => {
							(v(this.#i, !0), (this.opts.open.current = !0));
						}, this.delayDuration));
				}
			),
			Dt(
				() => this.opts.open.current,
				(n) => {
					n ? this.provider.onOpen(this) : this.provider.onClose(this);
				},
				{ lazy: !0 }
			));
	}
	handleOpen = () => {
		(this.#s.stop(), v(this.#i, !1), (this.opts.open.current = !0));
	};
	handleClose = () => {
		(this.#s.stop(), (this.opts.open.current = !1));
	};
	#p = () => {
		this.#s.stop();
		const t = !this.provider.isOpenDelayed,
			i = this.delayDuration ?? 0;
		t || i === 0 ? (v(this.#i, i > 0 && t, !0), (this.opts.open.current = !0)) : this.#s.start();
	};
	onTriggerEnter = () => {
		this.#p();
	};
	onTriggerLeave = () => {
		this.disableHoverableContent ? this.handleClose() : this.#s.stop();
	};
}
class $t {
	static create(t) {
		return new $t(t, Pt.get());
	}
	opts;
	root;
	attachment;
	#o = Nt(!1);
	#e = it(!1);
	#t = C(() => this.opts.disabled.current || this.root.disabled);
	domContext;
	#r = null;
	constructor(t, i) {
		((this.opts = t),
			(this.root = i),
			(this.domContext = new Yt(t.ref)),
			(this.attachment = At(this.opts.ref, (n) => (this.root.triggerNode = n))));
	}
	#n = () => {
		this.#r !== null && (clearTimeout(this.#r), (this.#r = null));
	};
	handlePointerUp = () => {
		this.#o.current = !1;
	};
	#a = () => {
		e(this.#t) || (this.#o.current = !1);
	};
	#l = () => {
		e(this.#t) ||
			((this.#o.current = !0),
			this.domContext.getDocument().addEventListener(
				'pointerup',
				() => {
					this.handlePointerUp();
				},
				{ once: !0 }
			));
	};
	#i = (t) => {
		if (!e(this.#t) && t.pointerType !== 'touch') {
			if (this.root.provider.isPointerInTransit.current) {
				(this.#n(),
					(this.#r = window.setTimeout(() => {
						this.root.provider.isPointerInTransit.current &&
							((this.root.provider.isPointerInTransit.current = !1),
							this.root.onTriggerEnter(),
							v(this.#e, !0));
					}, 250)));
				return;
			}
			(this.root.onTriggerEnter(), v(this.#e, !0));
		}
	};
	#s = (t) => {
		e(this.#t) ||
			(t.pointerType !== 'touch' &&
				(e(this.#e) ||
					(this.#n(),
					(this.root.provider.isPointerInTransit.current = !1),
					this.root.onTriggerEnter(),
					v(this.#e, !0))));
	};
	#d = () => {
		e(this.#t) || (this.#n(), this.root.onTriggerLeave(), v(this.#e, !1));
	};
	#p = (t) => {
		this.#o.current ||
			e(this.#t) ||
			(this.root.ignoreNonKeyboardFocus && !Gt(t.currentTarget)) ||
			this.root.handleOpen();
	};
	#u = () => {
		e(this.#t) || this.root.handleClose();
	};
	#h = () => {
		this.root.disableCloseOnTriggerClick || e(this.#t) || this.root.handleClose();
	};
	#c = C(() => ({
		id: this.opts.id.current,
		'aria-describedby': this.root.opts.open.current ? this.root.contentNode?.id : void 0,
		'data-state': this.root.stateAttr,
		'data-disabled': Bt(e(this.#t)),
		'data-delay-duration': `${this.root.delayDuration}`,
		[It.trigger]: '',
		tabindex: e(this.#t) ? void 0 : 0,
		disabled: this.opts.disabled.current,
		onpointerup: this.#a,
		onpointerdown: this.#l,
		onpointerenter: this.#i,
		onpointermove: this.#s,
		onpointerleave: this.#d,
		onfocus: this.#p,
		onblur: this.#u,
		onclick: this.#h,
		...this.attachment
	}));
	get props() {
		return e(this.#c);
	}
	set props(t) {
		v(this.#c, t);
	}
}
class xt {
	static create(t) {
		return new xt(t, Pt.get());
	}
	opts;
	root;
	attachment;
	constructor(t, i) {
		((this.opts = t),
			(this.root = i),
			(this.attachment = At(this.opts.ref, (n) => (this.root.contentNode = n))),
			new Xt({
				triggerNode: () => this.root.triggerNode,
				contentNode: () => this.root.contentNode,
				enabled: () => this.root.opts.open.current && !this.root.disableHoverableContent,
				onPointerExit: () => {
					this.root.provider.isTooltipOpen(this.root) && this.root.handleClose();
				},
				setIsPointerInTransit: (n) => {
					this.root.provider.isPointerInTransit.current = n;
				},
				transitTimeout: this.root.provider.opts.skipDelayDuration.current
			}),
			Zt(() =>
				Mt(window, 'scroll', (n) => {
					const _ = n.target;
					_ && _.contains(this.root.triggerNode) && this.root.handleClose();
				})
			));
	}
	onInteractOutside = (t) => {
		if (
			Vt(t.target) &&
			this.root.triggerNode?.contains(t.target) &&
			this.root.disableCloseOnTriggerClick
		) {
			t.preventDefault();
			return;
		}
		(this.opts.onInteractOutside.current(t), !t.defaultPrevented && this.root.handleClose());
	};
	onEscapeKeydown = (t) => {
		(this.opts.onEscapeKeydown.current?.(t), !t.defaultPrevented && this.root.handleClose());
	};
	onOpenAutoFocus = (t) => {
		t.preventDefault();
	};
	onCloseAutoFocus = (t) => {
		t.preventDefault();
	};
	get shouldRender() {
		return this.root.contentPresence.shouldRender;
	}
	#o = C(() => ({ open: this.root.opts.open.current }));
	get snippetProps() {
		return e(this.#o);
	}
	set snippetProps(t) {
		v(this.#o, t);
	}
	#e = C(() => ({
		id: this.opts.id.current,
		'data-state': this.root.stateAttr,
		'data-disabled': Bt(this.root.disabled),
		style: { pointerEvents: 'auto', outline: 'none' },
		[It.content]: '',
		...this.attachment
	}));
	get props() {
		return e(this.#e);
	}
	set props(t) {
		v(this.#e, t);
	}
	popperProps = {
		onInteractOutside: this.onInteractOutside,
		onEscapeKeydown: this.onEscapeKeydown,
		onOpenAutoFocus: this.onOpenAutoFocus,
		onCloseAutoFocus: this.onCloseAutoFocus
	};
}
function pe(D, t) {
	W(t, !0);
	let i = s(t, 'open', 15, !1),
		n = s(t, 'onOpenChange', 3, mt),
		_ = s(t, 'onOpenChangeComplete', 3, mt);
	(wt.create({
		open: h(
			() => i(),
			(w) => {
				(i(w), n()(w));
			}
		),
		delayDuration: h(() => t.delayDuration),
		disableCloseOnTriggerClick: h(() => t.disableCloseOnTriggerClick),
		disableHoverableContent: h(() => t.disableHoverableContent),
		ignoreNonKeyboardFocus: h(() => t.ignoreNonKeyboardFocus),
		disabled: h(() => t.disabled),
		onOpenChangeComplete: h(() => _())
	}),
		ee(D, {
			tooltip: !0,
			children: (w, N) => {
				var O = I(),
					E = p(O);
				(L(E, () => t.children ?? z), o(w, O));
			},
			$$slots: { default: !0 }
		}),
		U());
}
var ce = T('<div><div><!></div></div>'),
	ue = T('<div><div><!></div></div>');
function he(D, t) {
	const i = Ft();
	W(t, !0);
	let n = s(t, 'id', 19, () => Et(i)),
		_ = s(t, 'ref', 15, null),
		w = s(t, 'side', 3, 'top'),
		N = s(t, 'sideOffset', 3, 0),
		O = s(t, 'align', 3, 'center'),
		E = s(t, 'avoidCollisions', 3, !0),
		B = s(t, 'arrowPadding', 3, 0),
		P = s(t, 'sticky', 3, 'partial'),
		g = s(t, 'hideWhenDetached', 3, !1),
		c = s(t, 'collisionPadding', 3, 0),
		K = s(t, 'onInteractOutside', 3, mt),
		m = s(t, 'onEscapeKeydown', 3, mt),
		k = s(t, 'forceMount', 3, !1),
		a = ut(t, [
			'$$slots',
			'$$events',
			'$$legacy',
			'children',
			'child',
			'id',
			'ref',
			'side',
			'sideOffset',
			'align',
			'avoidCollisions',
			'arrowPadding',
			'sticky',
			'strategy',
			'hideWhenDetached',
			'collisionPadding',
			'onInteractOutside',
			'onEscapeKeydown',
			'forceMount'
		]);
	const r = xt.create({
			id: h(() => n()),
			ref: h(
				() => _(),
				(f) => _(f)
			),
			onInteractOutside: h(() => K()),
			onEscapeKeydown: h(() => m())
		}),
		u = C(() => ({
			side: w(),
			sideOffset: N(),
			align: O(),
			avoidCollisions: E(),
			arrowPadding: B(),
			sticky: P(),
			hideWhenDetached: g(),
			collisionPadding: c(),
			strategy: t.strategy
		})),
		y = C(() => at(a, e(u), r.props));
	var F = I(),
		b = p(F);
	{
		var $ = (f) => {
				oe(
					f,
					R(
						() => e(y),
						() => r.popperProps,
						{
							get enabled() {
								return r.root.opts.open.current;
							},
							get id() {
								return n();
							},
							trapFocus: !1,
							loop: !1,
							preventScroll: !1,
							forceMount: !0,
							get ref() {
								return r.opts.ref;
							},
							tooltip: !0,
							get shouldRender() {
								return r.shouldRender;
							},
							popper: (A, H) => {
								let dt = () => H?.().props,
									bt = () => H?.().wrapperProps;
								const ht = C(() => at(dt(), { style: Ot('tooltip') }));
								var pt = I(),
									Tt = p(pt);
								{
									var ft = (M) => {
											var j = I(),
												q = p(j);
											{
												let ct = C(() => ({ props: e(ht), wrapperProps: bt(), ...r.snippetProps }));
												L(
													q,
													() => t.child,
													() => e(ct)
												);
											}
											o(M, j);
										},
										vt = (M) => {
											var j = ce();
											nt(j, () => ({ ...bt() }));
											var q = S(j);
											nt(q, () => ({ ...e(ht) }));
											var ct = S(q);
											(L(ct, () => t.children ?? z), o(M, j));
										};
									V(Tt, (M) => {
										t.child ? M(ft) : M(vt, !1);
									});
								}
								o(A, pt);
							},
							$$slots: { popper: !0 }
						}
					)
				);
			},
			l = (f) => {
				var d = I(),
					A = p(d);
				{
					var H = (dt) => {
						re(
							dt,
							R(
								() => e(y),
								() => r.popperProps,
								{
									get open() {
										return r.root.opts.open.current;
									},
									get id() {
										return n();
									},
									trapFocus: !1,
									loop: !1,
									preventScroll: !1,
									forceMount: !1,
									get ref() {
										return r.opts.ref;
									},
									tooltip: !0,
									get shouldRender() {
										return r.shouldRender;
									},
									popper: (ht, pt) => {
										let Tt = () => pt?.().props,
											ft = () => pt?.().wrapperProps;
										const vt = C(() => at(Tt(), { style: Ot('tooltip') }));
										var M = I(),
											j = p(M);
										{
											var q = (J) => {
													var Q = I(),
														gt = p(Q);
													{
														let _t = C(() => ({
															props: e(vt),
															wrapperProps: ft(),
															...r.snippetProps
														}));
														L(
															gt,
															() => t.child,
															() => e(_t)
														);
													}
													o(J, Q);
												},
												ct = (J) => {
													var Q = ue();
													nt(Q, () => ({ ...ft() }));
													var gt = S(Q);
													nt(gt, () => ({ ...e(vt) }));
													var _t = S(gt);
													(L(_t, () => t.children ?? z), o(J, Q));
												};
											V(j, (J) => {
												t.child ? J(q) : J(ct, !1);
											});
										}
										o(ht, M);
									},
									$$slots: { popper: !0 }
								}
							)
						);
					};
					V(
						A,
						(dt) => {
							k() || dt(H);
						},
						!0
					);
				}
				o(f, d);
			};
		V(b, (f) => {
			k() ? f($) : f(l, !1);
		});
	}
	(o(D, F), U());
}
var fe = T('<button><!></button>');
function ve(D, t) {
	const i = Ft();
	W(t, !0);
	let n = s(t, 'id', 19, () => Et(i)),
		_ = s(t, 'disabled', 3, !1),
		w = s(t, 'type', 3, 'button'),
		N = s(t, 'ref', 15, null),
		O = ut(t, [
			'$$slots',
			'$$events',
			'$$legacy',
			'children',
			'child',
			'id',
			'disabled',
			'type',
			'ref'
		]);
	const E = $t.create({
			id: h(() => n()),
			disabled: h(() => _() ?? !1),
			ref: h(
				() => N(),
				(P) => N(P)
			)
		}),
		B = C(() => at(O, E.props, { type: w() }));
	(se(D, {
		get id() {
			return n();
		},
		get ref() {
			return E.opts.ref;
		},
		tooltip: !0,
		children: (P, g) => {
			var c = I(),
				K = p(c);
			{
				var m = (a) => {
						var r = I(),
							u = p(r);
						(L(
							u,
							() => t.child,
							() => ({ props: e(B) })
						),
							o(a, r));
					},
					k = (a) => {
						var r = fe();
						nt(r, () => ({ ...e(B) }));
						var u = S(r);
						(L(u, () => t.children ?? z), o(a, r));
					};
				V(K, (a) => {
					t.child ? a(m) : a(k, !1);
				});
			}
			o(P, c);
		},
		$$slots: { default: !0 }
	}),
		U());
}
function ge(D, t) {
	W(t, !0);
	let i = s(t, 'ref', 15, null),
		n = ut(t, ['$$slots', '$$events', '$$legacy', 'ref']);
	(de(
		D,
		R(() => n, {
			get ref() {
				return i();
			},
			set ref(_) {
				i(_);
			}
		})
	),
		U());
}
function me(D, t) {
	W(t, !0);
	let i = s(t, 'delayDuration', 3, 700),
		n = s(t, 'disableCloseOnTriggerClick', 3, !1),
		_ = s(t, 'disableHoverableContent', 3, !1),
		w = s(t, 'disabled', 3, !1),
		N = s(t, 'ignoreNonKeyboardFocus', 3, !1),
		O = s(t, 'skipDelayDuration', 3, 300);
	Ct.create({
		delayDuration: h(() => i()),
		disableCloseOnTriggerClick: h(() => n()),
		disableHoverableContent: h(() => _()),
		disabled: h(() => w()),
		ignoreNonKeyboardFocus: h(() => N()),
		skipDelayDuration: h(() => O())
	});
	var E = I(),
		B = p(E);
	(L(B, () => t.children ?? z), o(D, E), U());
}
const Z = me,
	G = pe,
	tt = ve,
	et = ne,
	ot = he,
	rt = ge,
	be = {
		component: G,
		title: 'Design System/Atoms/Tooltip',
		tags: ['autodocs'],
		argTypes: { open: { control: { type: 'boolean' } } }
	},
	{ Story: st } = Ut();
var Te = T('This is a tooltip <!>', 1),
	_e = T('<!> <!>', 1),
	ye = T('Tooltip appears above <!>', 1),
	Pe = T('<!> <!>', 1),
	Ce = T('<div class="flex h-64 items-end justify-center"><!></div>'),
	we = T('Tooltip appears to the right <!>', 1),
	$e = T('<!> <!>', 1),
	xe = T('<div class="flex h-64 items-center justify-start"><!></div>'),
	De = T('Tooltip appears below <!>', 1),
	Oe = T('<!> <!>', 1),
	ke = T('<div class="flex h-64 items-start justify-center"><!></div>'),
	Fe = T('Tooltip appears to the left <!>', 1),
	Re = T('<!> <!>', 1),
	Ne = T('<div class="flex h-64 items-center justify-end"><!></div>'),
	Ae = T(
		'This is a longer tooltip message that demonstrates how the tooltip handles multiple lines of content gracefully. <!>',
		1
	),
	Be = T('<!> <!>', 1),
	Ee = T('<!> <!> <!> <!> <!> <!>', 1);
function zt(D, t) {
	(W(t, !1), Wt());
	var i = Ee(),
		n = p(i);
	st(n, {
		name: 'Default',
		args: { open: !0 },
		template: (P, g = z) => {
			Z(P, {
				children: (c, K) => {
					G(
						c,
						R(g, {
							children: (m, k) => {
								var a = _e(),
									r = p(a);
								tt(r, {
									child: (F, b) => {
										Y(
											F,
											R(() => b?.().props, {
												children: (l, f) => {
													var d = X('Hover me');
													o(l, d);
												},
												$$slots: { default: !0 }
											})
										);
									},
									$$slots: { child: !0 }
								});
								var u = x(r, 2);
								(et(u, {
									children: (y, F) => {
										ot(y, {
											class:
												'z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card',
											children: (b, $) => {
												var l = Te(),
													f = x(p(l));
												(rt(f, { class: 'fill-elevated' }), o(b, l));
											},
											$$slots: { default: !0 }
										});
									},
									$$slots: { default: !0 }
								}),
									o(m, a));
							},
							$$slots: { default: !0 }
						})
					);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Tooltip.Provider>
	<Tooltip.Root {...args}>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button {...props}>Hover me</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Content class="z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card">
				This is a tooltip
				<Tooltip.Arrow class="fill-elevated" />
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>`
			}
		}
	});
	var _ = x(n, 2);
	st(_, {
		name: 'Top',
		args: { open: !0 },
		template: (P, g = z) => {
			Z(P, {
				children: (c, K) => {
					var m = Ce(),
						k = S(m);
					(G(
						k,
						R(g, {
							children: (a, r) => {
								var u = Pe(),
									y = p(u);
								tt(y, {
									child: ($, l) => {
										Y(
											$,
											R(() => l?.().props, {
												children: (d, A) => {
													var H = X('Tooltip on top');
													o(d, H);
												},
												$$slots: { default: !0 }
											})
										);
									},
									$$slots: { child: !0 }
								});
								var F = x(y, 2);
								(et(F, {
									children: (b, $) => {
										ot(b, {
											side: 'top',
											class:
												'z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card',
											children: (l, f) => {
												var d = ye(),
													A = x(p(d));
												(rt(A, { class: 'fill-elevated' }), o(l, d));
											},
											$$slots: { default: !0 }
										});
									},
									$$slots: { default: !0 }
								}),
									o(a, u));
							},
							$$slots: { default: !0 }
						})
					),
						o(c, m));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Tooltip.Provider>
	<div class="flex h-64 items-end justify-center">
		<Tooltip.Root {...args}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props}>Tooltip on top</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content
					side="top"
					class="z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card"
				>
					Tooltip appears above
					<Tooltip.Arrow class="fill-elevated" />
				</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
	</div>
</Tooltip.Provider>`
			}
		}
	});
	var w = x(_, 2);
	st(w, {
		name: 'Right',
		args: { open: !0 },
		template: (P, g = z) => {
			Z(P, {
				children: (c, K) => {
					var m = xe(),
						k = S(m);
					(G(
						k,
						R(g, {
							children: (a, r) => {
								var u = $e(),
									y = p(u);
								tt(y, {
									child: ($, l) => {
										Y(
											$,
											R(() => l?.().props, {
												children: (d, A) => {
													var H = X('Tooltip on right');
													o(d, H);
												},
												$$slots: { default: !0 }
											})
										);
									},
									$$slots: { child: !0 }
								});
								var F = x(y, 2);
								(et(F, {
									children: (b, $) => {
										ot(b, {
											side: 'right',
											class:
												'z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card',
											children: (l, f) => {
												var d = we(),
													A = x(p(d));
												(rt(A, { class: 'fill-elevated' }), o(l, d));
											},
											$$slots: { default: !0 }
										});
									},
									$$slots: { default: !0 }
								}),
									o(a, u));
							},
							$$slots: { default: !0 }
						})
					),
						o(c, m));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Tooltip.Provider>
	<div class="flex h-64 items-center justify-start">
		<Tooltip.Root {...args}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props}>Tooltip on right</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content
					side="right"
					class="z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card"
				>
					Tooltip appears to the right
					<Tooltip.Arrow class="fill-elevated" />
				</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
	</div>
</Tooltip.Provider>`
			}
		}
	});
	var N = x(w, 2);
	st(N, {
		name: 'Bottom',
		args: { open: !0 },
		template: (P, g = z) => {
			Z(P, {
				children: (c, K) => {
					var m = ke(),
						k = S(m);
					(G(
						k,
						R(g, {
							children: (a, r) => {
								var u = Oe(),
									y = p(u);
								tt(y, {
									child: ($, l) => {
										Y(
											$,
											R(() => l?.().props, {
												children: (d, A) => {
													var H = X('Tooltip on bottom');
													o(d, H);
												},
												$$slots: { default: !0 }
											})
										);
									},
									$$slots: { child: !0 }
								});
								var F = x(y, 2);
								(et(F, {
									children: (b, $) => {
										ot(b, {
											side: 'bottom',
											class:
												'z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card',
											children: (l, f) => {
												var d = De(),
													A = x(p(d));
												(rt(A, { class: 'fill-elevated' }), o(l, d));
											},
											$$slots: { default: !0 }
										});
									},
									$$slots: { default: !0 }
								}),
									o(a, u));
							},
							$$slots: { default: !0 }
						})
					),
						o(c, m));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Tooltip.Provider>
	<div class="flex h-64 items-start justify-center">
		<Tooltip.Root {...args}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props}>Tooltip on bottom</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content
					side="bottom"
					class="z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card"
				>
					Tooltip appears below
					<Tooltip.Arrow class="fill-elevated" />
				</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
	</div>
</Tooltip.Provider>`
			}
		}
	});
	var O = x(N, 2);
	st(O, {
		name: 'Left',
		args: { open: !0 },
		template: (P, g = z) => {
			Z(P, {
				children: (c, K) => {
					var m = Ne(),
						k = S(m);
					(G(
						k,
						R(g, {
							children: (a, r) => {
								var u = Re(),
									y = p(u);
								tt(y, {
									child: ($, l) => {
										Y(
											$,
											R(() => l?.().props, {
												children: (d, A) => {
													var H = X('Tooltip on left');
													o(d, H);
												},
												$$slots: { default: !0 }
											})
										);
									},
									$$slots: { child: !0 }
								});
								var F = x(y, 2);
								(et(F, {
									children: (b, $) => {
										ot(b, {
											side: 'left',
											class:
												'z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card',
											children: (l, f) => {
												var d = Fe(),
													A = x(p(d));
												(rt(A, { class: 'fill-elevated' }), o(l, d));
											},
											$$slots: { default: !0 }
										});
									},
									$$slots: { default: !0 }
								}),
									o(a, u));
							},
							$$slots: { default: !0 }
						})
					),
						o(c, m));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Tooltip.Provider>
	<div class="flex h-64 items-center justify-end">
		<Tooltip.Root {...args}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props}>Tooltip on left</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content
					side="left"
					class="z-50 rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card"
				>
					Tooltip appears to the left
					<Tooltip.Arrow class="fill-elevated" />
				</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
	</div>
</Tooltip.Provider>`
			}
		}
	});
	var E = x(O, 2);
	(st(E, {
		name: 'LongContent',
		args: { open: !0 },
		template: (P, g = z) => {
			Z(P, {
				children: (c, K) => {
					G(
						c,
						R(g, {
							children: (m, k) => {
								var a = Be(),
									r = p(a);
								tt(r, {
									child: (F, b) => {
										Y(
											F,
											R(() => b?.().props, {
												children: (l, f) => {
													var d = X('Hover for long tooltip');
													o(l, d);
												},
												$$slots: { default: !0 }
											})
										);
									},
									$$slots: { child: !0 }
								});
								var u = x(r, 2);
								(et(u, {
									children: (y, F) => {
										ot(y, {
											class:
												'z-50 max-w-xs rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card',
											children: (b, $) => {
												var l = Ae(),
													f = x(p(l));
												(rt(f, { class: 'fill-elevated' }), o(b, l));
											},
											$$slots: { default: !0 }
										});
									},
									$$slots: { default: !0 }
								}),
									o(m, a));
							},
							$$slots: { default: !0 }
						})
					);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Tooltip.Provider>
	<Tooltip.Root {...args}>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button {...props}>Hover for long tooltip</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Content class="z-50 max-w-xs rounded-button border border-base bg-elevated px-section py-section text-button text-primary shadow-card">
				This is a longer tooltip message that demonstrates how the tooltip handles multiple lines of content gracefully.
				<Tooltip.Arrow class="fill-elevated" />
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>`
			}
		}
	}),
		o(D, i),
		U());
}
zt.__docgen = { data: [], name: 'Tooltip.stories.svelte' };
const lt = jt(zt, be),
	io = ['Default', 'Top', 'Right', 'Bottom', 'Left', 'LongContent'],
	ao = { ...lt.Default, tags: ['svelte-csf-v5'] },
	lo = { ...lt.Top, tags: ['svelte-csf-v5'] },
	po = { ...lt.Right, tags: ['svelte-csf-v5'] },
	co = { ...lt.Bottom, tags: ['svelte-csf-v5'] },
	uo = { ...lt.Left, tags: ['svelte-csf-v5'] },
	ho = { ...lt.LongContent, tags: ['svelte-csf-v5'] };
export {
	co as Bottom,
	ao as Default,
	uo as Left,
	ho as LongContent,
	po as Right,
	lo as Top,
	io as __namedExportsOrder,
	be as default
};
