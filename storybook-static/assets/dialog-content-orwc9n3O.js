import {
	ab as u,
	v as e,
	a8 as n,
	w as d,
	ae as J,
	p as U,
	h as i,
	F as N,
	a as v,
	m as x,
	b as l,
	c as W,
	k as _,
	f as j,
	n as q,
	e as L,
	o as Q,
	d as H,
	s as nt
} from './iframe-DYn7RqBV.js';
import { a as V } from './attributes-D2XuSyo_.js';
import {
	b as h,
	c as Ct,
	a as A,
	g as Ot,
	h as z,
	r as Nt,
	d as X,
	m as B
} from './create-id-CD7dpc57.js';
import { n as S } from './noop-DX6rZLP_.js';
import { w as Y } from './watch.svelte-CYSsdG2H.js';
import { C as _t } from './context-DWcBTeuX.js';
import {
	P as it,
	o as kt,
	F as wt,
	E as It,
	d as St,
	T as At,
	S as at
} from './is-using-keyboard.svelte-qppEaaQk.js';
import { S as dt, d as ct } from './kbd-constants-Duhtze-4.js';
const Dt = Ct({
		component: 'dialog',
		parts: ['content', 'trigger', 'overlay', 'title', 'description', 'close', 'cancel', 'action']
	}),
	y = new _t('Dialog.Root | AlertDialog.Root');
class Z {
	static create(t) {
		const r = y.getOr(null);
		return y.set(new Z(t, r));
	}
	opts;
	#t = u(null);
	get triggerNode() {
		return e(this.#t);
	}
	set triggerNode(t) {
		n(this.#t, t, !0);
	}
	#e = u(null);
	get contentNode() {
		return e(this.#e);
	}
	set contentNode(t) {
		n(this.#e, t, !0);
	}
	#r = u(null);
	get overlayNode() {
		return e(this.#r);
	}
	set overlayNode(t) {
		n(this.#r, t, !0);
	}
	#o = u(null);
	get descriptionNode() {
		return e(this.#o);
	}
	set descriptionNode(t) {
		n(this.#o, t, !0);
	}
	#s = u(void 0);
	get contentId() {
		return e(this.#s);
	}
	set contentId(t) {
		n(this.#s, t, !0);
	}
	#n = u(void 0);
	get titleId() {
		return e(this.#n);
	}
	set titleId(t) {
		n(this.#n, t, !0);
	}
	#i = u(void 0);
	get triggerId() {
		return e(this.#i);
	}
	set triggerId(t) {
		n(this.#i, t, !0);
	}
	#a = u(void 0);
	get descriptionId() {
		return e(this.#a);
	}
	set descriptionId(t) {
		n(this.#a, t, !0);
	}
	#d = u(null);
	get cancelNode() {
		return e(this.#d);
	}
	set cancelNode(t) {
		n(this.#d, t, !0);
	}
	#c = u(0);
	get nestedOpenCount() {
		return e(this.#c);
	}
	set nestedOpenCount(t) {
		n(this.#c, t, !0);
	}
	depth;
	parent;
	contentPresence;
	overlayPresence;
	constructor(t, r) {
		((this.opts = t),
			(this.parent = r),
			(this.depth = r ? r.depth + 1 : 0),
			(this.handleOpen = this.handleOpen.bind(this)),
			(this.handleClose = this.handleClose.bind(this)),
			(this.contentPresence = new it({
				ref: h(() => this.contentNode),
				open: this.opts.open,
				enabled: !0,
				onComplete: () => {
					this.opts.onOpenChangeComplete.current(this.opts.open.current);
				}
			})),
			(this.overlayPresence = new it({
				ref: h(() => this.overlayNode),
				open: this.opts.open,
				enabled: !0
			})),
			Y(
				() => this.opts.open.current,
				(s) => {
					this.parent && (s ? this.parent.incrementNested() : this.parent.decrementNested());
				},
				{ lazy: !0 }
			),
			kt(() => {
				this.opts.open.current && this.parent?.decrementNested();
			}));
	}
	handleOpen() {
		this.opts.open.current || (this.opts.open.current = !0);
	}
	handleClose() {
		this.opts.open.current && (this.opts.open.current = !1);
	}
	getBitsAttr = (t) => Dt.getAttr(t, this.opts.variant.current);
	incrementNested() {
		(this.nestedOpenCount++, this.parent?.incrementNested());
	}
	decrementNested() {
		this.nestedOpenCount !== 0 && (this.nestedOpenCount--, this.parent?.decrementNested());
	}
	#h = d(() => ({ 'data-state': Nt(this.opts.open.current) }));
	get sharedProps() {
		return e(this.#h);
	}
	set sharedProps(t) {
		n(this.#h, t);
	}
}
class ht {
	static create(t) {
		return new ht(t, y.get());
	}
	opts;
	root;
	attachment;
	constructor(t, r) {
		((this.opts = t),
			(this.root = r),
			(this.attachment = A(this.opts.ref, (s) => {
				((this.root.triggerNode = s), (this.root.triggerId = s?.id));
			})),
			(this.onclick = this.onclick.bind(this)),
			(this.onkeydown = this.onkeydown.bind(this)));
	}
	onclick(t) {
		this.opts.disabled.current || t.button > 0 || this.root.handleOpen();
	}
	onkeydown(t) {
		this.opts.disabled.current ||
			((t.key === dt || t.key === ct) && (t.preventDefault(), this.root.handleOpen()));
	}
	#t = d(() => ({
		id: this.opts.id.current,
		'aria-haspopup': 'dialog',
		'aria-expanded': Ot(this.root.opts.open.current),
		'aria-controls': this.root.contentId,
		[this.root.getBitsAttr('trigger')]: '',
		onkeydown: this.onkeydown,
		onclick: this.onclick,
		disabled: this.opts.disabled.current ? !0 : void 0,
		...this.root.sharedProps,
		...this.attachment
	}));
	get props() {
		return e(this.#t);
	}
	set props(t) {
		n(this.#t, t);
	}
}
class lt {
	static create(t) {
		return new lt(t, y.get());
	}
	opts;
	root;
	attachment;
	constructor(t, r) {
		((this.opts = t),
			(this.root = r),
			(this.attachment = A(this.opts.ref)),
			(this.onclick = this.onclick.bind(this)),
			(this.onkeydown = this.onkeydown.bind(this)));
	}
	onclick(t) {
		this.opts.disabled.current || t.button > 0 || this.root.handleClose();
	}
	onkeydown(t) {
		this.opts.disabled.current ||
			((t.key === dt || t.key === ct) && (t.preventDefault(), this.root.handleClose()));
	}
	#t = d(() => ({
		id: this.opts.id.current,
		[this.root.getBitsAttr(this.opts.variant.current)]: '',
		onclick: this.onclick,
		onkeydown: this.onkeydown,
		disabled: this.opts.disabled.current ? !0 : void 0,
		tabindex: 0,
		...this.root.sharedProps,
		...this.attachment
	}));
	get props() {
		return e(this.#t);
	}
	set props(t) {
		n(this.#t, t);
	}
}
class $ {
	static create(t) {
		return new $(t, y.get());
	}
	opts;
	root;
	attachment;
	constructor(t, r) {
		((this.opts = t),
			(this.root = r),
			(this.root.titleId = this.opts.id.current),
			(this.attachment = A(this.opts.ref)),
			Y.pre(
				() => this.opts.id.current,
				(s) => {
					this.root.titleId = s;
				}
			));
	}
	#t = d(() => ({
		id: this.opts.id.current,
		role: 'heading',
		'aria-level': this.opts.level.current,
		[this.root.getBitsAttr('title')]: '',
		...this.root.sharedProps,
		...this.attachment
	}));
	get props() {
		return e(this.#t);
	}
	set props(t) {
		n(this.#t, t);
	}
}
class tt {
	static create(t) {
		return new tt(t, y.get());
	}
	opts;
	root;
	attachment;
	constructor(t, r) {
		((this.opts = t),
			(this.root = r),
			(this.root.descriptionId = this.opts.id.current),
			(this.attachment = A(this.opts.ref, (s) => {
				this.root.descriptionNode = s;
			})),
			Y.pre(
				() => this.opts.id.current,
				(s) => {
					this.root.descriptionId = s;
				}
			));
	}
	#t = d(() => ({
		id: this.opts.id.current,
		[this.root.getBitsAttr('description')]: '',
		...this.root.sharedProps,
		...this.attachment
	}));
	get props() {
		return e(this.#t);
	}
	set props(t) {
		n(this.#t, t);
	}
}
class et {
	static create(t) {
		return new et(t, y.get());
	}
	opts;
	root;
	attachment;
	constructor(t, r) {
		((this.opts = t),
			(this.root = r),
			(this.attachment = A(this.opts.ref, (s) => {
				((this.root.contentNode = s), (this.root.contentId = s?.id));
			})));
	}
	#t = d(() => ({ open: this.root.opts.open.current }));
	get snippetProps() {
		return e(this.#t);
	}
	set snippetProps(t) {
		n(this.#t, t);
	}
	#e = d(() => ({
		id: this.opts.id.current,
		role: this.root.opts.variant.current === 'alert-dialog' ? 'alertdialog' : 'dialog',
		'aria-modal': 'true',
		'aria-describedby': this.root.descriptionId,
		'aria-labelledby': this.root.titleId,
		[this.root.getBitsAttr('content')]: '',
		style: {
			pointerEvents: 'auto',
			outline: this.root.opts.variant.current === 'alert-dialog' ? 'none' : void 0,
			'--bits-dialog-depth': this.root.depth,
			'--bits-dialog-nested-count': this.root.nestedOpenCount
		},
		tabindex: this.root.opts.variant.current === 'alert-dialog' ? -1 : void 0,
		'data-nested-open': z(this.root.nestedOpenCount > 0),
		'data-nested': z(this.root.parent !== null),
		...this.root.sharedProps,
		...this.attachment
	}));
	get props() {
		return e(this.#e);
	}
	set props(t) {
		n(this.#e, t);
	}
	get shouldRender() {
		return this.root.contentPresence.shouldRender;
	}
}
class pt {
	static create(t) {
		return new pt(t, y.get());
	}
	opts;
	root;
	attachment;
	constructor(t, r) {
		((this.opts = t),
			(this.root = r),
			(this.attachment = A(this.opts.ref, (s) => (this.root.overlayNode = s))));
	}
	#t = d(() => ({ open: this.root.opts.open.current }));
	get snippetProps() {
		return e(this.#t);
	}
	set snippetProps(t) {
		n(this.#t, t);
	}
	#e = d(() => ({
		id: this.opts.id.current,
		[this.root.getBitsAttr('overlay')]: '',
		style: {
			pointerEvents: 'auto',
			'--bits-dialog-depth': this.root.depth,
			'--bits-dialog-nested-count': this.root.nestedOpenCount
		},
		'data-nested-open': z(this.root.nestedOpenCount > 0),
		'data-nested': z(this.root.parent !== null),
		...this.root.sharedProps,
		...this.attachment
	}));
	get props() {
		return e(this.#e);
	}
	set props(t) {
		n(this.#e, t);
	}
	get shouldRender() {
		return this.root.overlayPresence.shouldRender;
	}
}
var Ft = j('<div><!></div>');
function Lt(b, t) {
	const r = J();
	U(t, !0);
	let s = i(t, 'id', 19, () => X(r)),
		p = i(t, 'ref', 15, null),
		m = i(t, 'level', 3, 2),
		P = Q(t, ['$$slots', '$$events', '$$legacy', 'id', 'ref', 'child', 'children', 'level']);
	const g = $.create({
			id: h(() => s()),
			level: h(() => m()),
			ref: h(
				() => p(),
				(a) => p(a)
			)
		}),
		C = d(() => B(P, g.props));
	var k = N(),
		D = v(k);
	{
		var w = (a) => {
				var o = N(),
					f = v(o);
				(_(
					f,
					() => t.child,
					() => ({ props: e(C) })
				),
					l(a, o));
			},
			c = (a) => {
				var o = Ft();
				V(o, () => ({ ...e(C) }));
				var f = L(o);
				(_(f, () => t.children ?? q), l(a, o));
			};
		x(D, (a) => {
			t.child ? a(w) : a(c, !1);
		});
	}
	(l(b, k), W());
}
var Et = j('<div><!></div>');
function Qt(b, t) {
	const r = J();
	U(t, !0);
	let s = i(t, 'id', 19, () => X(r)),
		p = i(t, 'ref', 15, null),
		m = Q(t, ['$$slots', '$$events', '$$legacy', 'id', 'children', 'child', 'ref']);
	const P = tt.create({
			id: h(() => s()),
			ref: h(
				() => p(),
				(c) => p(c)
			)
		}),
		g = d(() => B(m, P.props));
	var C = N(),
		k = v(C);
	{
		var D = (c) => {
				var a = N(),
					o = v(a);
				(_(
					o,
					() => t.child,
					() => ({ props: e(g) })
				),
					l(c, a));
			},
			w = (c) => {
				var a = Et();
				V(a, () => ({ ...e(g) }));
				var o = L(a);
				(_(o, () => t.children ?? q), l(c, a));
			};
		x(k, (c) => {
			t.child ? c(D) : c(w, !1);
		});
	}
	(l(b, C), W());
}
function Vt(b, t) {
	U(t, !0);
	let r = i(t, 'open', 15, !1),
		s = i(t, 'onOpenChange', 3, S),
		p = i(t, 'onOpenChangeComplete', 3, S);
	Z.create({
		variant: h(() => 'dialog'),
		open: h(
			() => r(),
			(g) => {
				(r(g), s()(g));
			}
		),
		onOpenChangeComplete: h(() => p())
	});
	var m = N(),
		P = v(m);
	(_(P, () => t.children ?? q), l(b, m), W());
}
var Rt = j('<!> <!>', 1),
	xt = j('<!> <div><!></div>', 1);
function Xt(b, t) {
	const r = J();
	U(t, !0);
	let s = i(t, 'id', 19, () => X(r)),
		p = i(t, 'ref', 15, null),
		m = i(t, 'forceMount', 3, !1),
		P = i(t, 'onCloseAutoFocus', 3, S),
		g = i(t, 'onOpenAutoFocus', 3, S),
		C = i(t, 'onEscapeKeydown', 3, S),
		k = i(t, 'onInteractOutside', 3, S),
		D = i(t, 'trapFocus', 3, !0),
		w = i(t, 'preventScroll', 3, !0),
		c = i(t, 'restoreScrollDelay', 3, null),
		a = Q(t, [
			'$$slots',
			'$$events',
			'$$legacy',
			'id',
			'children',
			'child',
			'ref',
			'forceMount',
			'onCloseAutoFocus',
			'onOpenAutoFocus',
			'onEscapeKeydown',
			'onInteractOutside',
			'trapFocus',
			'preventScroll',
			'restoreScrollDelay'
		]);
	const o = et.create({
			id: h(() => s()),
			ref: h(
				() => p(),
				(F) => p(F)
			)
		}),
		f = d(() => B(a, o.props));
	var rt = N(),
		ut = v(rt);
	{
		var gt = (F) => {
			wt(F, {
				get ref() {
					return o.opts.ref;
				},
				loop: !0,
				get trapFocus() {
					return D();
				},
				get enabled() {
					return o.root.opts.open.current;
				},
				get onOpenAutoFocus() {
					return g();
				},
				get onCloseAutoFocus() {
					return P();
				},
				focusScope: (ft, vt) => {
					let ot = () => vt?.().props;
					It(
						ft,
						H(() => e(f), {
							get enabled() {
								return o.root.opts.open.current;
							},
							get ref() {
								return o.opts.ref;
							},
							onEscapeKeydown: (T) => {
								(C()(T), !T.defaultPrevented && o.root.handleClose());
							},
							children: (T, Tt) => {
								St(
									T,
									H(() => e(f), {
										get ref() {
											return o.opts.ref;
										},
										get enabled() {
											return o.root.opts.open.current;
										},
										onInteractOutside: (K) => {
											(k()(K), !K.defaultPrevented && o.root.handleClose());
										},
										children: (K, Kt) => {
											At(
												K,
												H(() => e(f), {
													get ref() {
														return o.opts.ref;
													},
													get enabled() {
														return o.root.opts.open.current;
													},
													children: (mt, Mt) => {
														var st = N(),
															yt = v(st);
														{
															var bt = (I) => {
																	var E = Rt(),
																		R = v(E);
																	{
																		var M = (O) => {
																			at(O, {
																				get preventScroll() {
																					return w();
																				},
																				get restoreScrollDelay() {
																					return c();
																				}
																			});
																		};
																		x(R, (O) => {
																			o.root.opts.open.current && O(M);
																		});
																	}
																	var G = nt(R, 2);
																	{
																		let O = d(() => ({ props: B(e(f), ot()), ...o.snippetProps }));
																		_(
																			G,
																			() => t.child,
																			() => e(O)
																		);
																	}
																	l(I, E);
																},
																Pt = (I) => {
																	var E = xt(),
																		R = v(E);
																	at(R, {
																		get preventScroll() {
																			return w();
																		}
																	});
																	var M = nt(R, 2);
																	V(M, (O) => ({ ...O }), [() => B(e(f), ot())]);
																	var G = L(M);
																	(_(G, () => t.children ?? q), l(I, E));
																};
															x(yt, (I) => {
																t.child ? I(bt) : I(Pt, !1);
															});
														}
														l(mt, st);
													},
													$$slots: { default: !0 }
												})
											);
										},
										$$slots: { default: !0 }
									})
								);
							},
							$$slots: { default: !0 }
						})
					);
				},
				$$slots: { focusScope: !0 }
			});
		};
		x(ut, (F) => {
			(o.shouldRender || m()) && F(gt);
		});
	}
	(l(b, rt), W());
}
export { Xt as D, Lt as a, Qt as b, Vt as c, pt as d, ht as e, lt as f };
