import {
	v as s,
	ab as v,
	a8 as c,
	w as b,
	G as R,
	u as J,
	aC as jt,
	aA as X,
	p as T,
	F as N,
	a as w,
	m as E,
	b as m,
	c as A,
	k as W,
	n as I,
	aB as qt,
	ae as K,
	h as _,
	f as C,
	e as Y,
	o as D,
	d as z,
	s as H
} from './iframe-DYn7RqBV.js';
import { c as Gt, i as Jt } from './create-runtime-stories-2rm03jka.js';
import { d as Kt } from './index-QxUtaCdU.js';
import { a as F } from './attributes-D2XuSyo_.js';
import { w as ht } from './watch.svelte-CYSsdG2H.js';
import { C as Q } from './context-DWcBTeuX.js';
import { i as Qt } from './is-BGFdVicR.js';
import { q as xt, v as It, b as y, a as k, c as Zt, m as O, d as Z } from './create-id-CD7dpc57.js';
import { D as te, g as ee } from './dom-context.svelte-Cee2qr-t.js';
import { u as re } from './use-id-C09Eugg1.js';
import { P as oe } from './previous.svelte-BRBO0xyC.js';
import { e as ot, i as st } from './each-DHv61wEY.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
function se(o, t) {
	if (Qt(o)) {
		const r = o();
		return r === void 0 ? t : r;
	}
	return o === void 0 ? t : o;
}
function dt(o, t) {
	let e = v(null);
	const r = b(() => se(t, 250));
	function n(...i) {
		if (s(e)) s(e).timeout && clearTimeout(s(e).timeout);
		else {
			let l, a;
			const h = new Promise((f, p) => {
				((l = f), (a = p));
			});
			c(e, { timeout: null, runner: null, promise: h, resolve: l, reject: a }, !0);
		}
		return (
			(s(e).runner = async () => {
				if (!s(e)) return;
				const l = s(e);
				c(e, null);
				try {
					l.resolve(await o.apply(this, i));
				} catch (a) {
					l.reject(a);
				}
			}),
			(s(e).timeout = setTimeout(s(e).runner, s(r))),
			s(e).promise
		);
	}
	return (
		(n.cancel = async () => {
			((!s(e) || s(e).timeout === null) &&
				(await new Promise((i) => setTimeout(i, 0)), !s(e) || s(e).timeout === null)) ||
				(clearTimeout(s(e).timeout), s(e).reject('Cancelled'), c(e, null));
		}),
		(n.runScheduledNow = async () => {
			((!s(e) || !s(e).timeout) &&
				(await new Promise((i) => setTimeout(i, 0)), !s(e) || !s(e).timeout)) ||
				(clearTimeout(s(e).timeout), (s(e).timeout = null), await s(e).runner?.());
		}),
		Object.defineProperty(n, 'pending', {
			enumerable: !0,
			get() {
				return !!s(e)?.timeout;
			}
		}),
		n
	);
}
class _t {
	#t = v(!1);
	constructor() {
		R(
			() => (
				J(() => c(this.#t, !0)),
				() => {
					c(this.#t, !1);
				}
			)
		);
	}
	get current() {
		return s(this.#t);
	}
}
class j {
	#t;
	#e;
	constructor(t, e) {
		((this.#t = t), (this.#e = e), (this.handler = this.handler.bind(this)), R(this.handler));
	}
	handler() {
		let t = 0;
		const e = this.#t();
		if (!e) return;
		const r = new ResizeObserver(() => {
			(cancelAnimationFrame(t), (t = window.requestAnimationFrame(this.#e)));
		});
		return (
			r.observe(e),
			() => {
				(window.cancelAnimationFrame(t), r.unobserve(e));
			}
		);
	}
}
class Lt {
	state;
	#t;
	constructor(t, e) {
		((this.state = xt(t)), (this.#t = e), (this.dispatch = this.dispatch.bind(this)));
	}
	#e(t) {
		return this.#t[this.state.current][t] ?? this.state.current;
	}
	dispatch(t) {
		this.state.current = this.#e(t);
	}
}
const ne = {
	mounted: { UNMOUNT: 'unmounted', ANIMATION_OUT: 'unmountSuspended' },
	unmountSuspended: { MOUNT: 'mounted', ANIMATION_END: 'unmounted' },
	unmounted: { MOUNT: 'mounted' }
};
class ie {
	opts;
	#t = v('none');
	get prevAnimationNameState() {
		return s(this.#t);
	}
	set prevAnimationNameState(t) {
		c(this.#t, t, !0);
	}
	#e = v(jt({}));
	get styles() {
		return s(this.#e);
	}
	set styles(t) {
		c(this.#e, t, !0);
	}
	initialStatus;
	previousPresent;
	machine;
	present;
	constructor(t) {
		((this.opts = t),
			(this.present = this.opts.open),
			(this.initialStatus = t.open.current ? 'mounted' : 'unmounted'),
			(this.previousPresent = new oe(() => this.present.current)),
			(this.machine = new Lt(this.initialStatus, ne)),
			(this.handleAnimationEnd = this.handleAnimationEnd.bind(this)),
			(this.handleAnimationStart = this.handleAnimationStart.bind(this)),
			le(this),
			ae(this),
			ce(this));
	}
	handleAnimationEnd(t) {
		if (!this.opts.ref.current) return;
		const e = at(this.opts.ref.current),
			r = e.includes(t.animationName) || e === 'none';
		t.target === this.opts.ref.current && r && this.machine.dispatch('ANIMATION_END');
	}
	handleAnimationStart(t) {
		this.opts.ref.current &&
			t.target === this.opts.ref.current &&
			(this.prevAnimationNameState = at(this.opts.ref.current));
	}
	#r = b(() => ['mounted', 'unmountSuspended'].includes(this.machine.state.current));
	get isPresent() {
		return s(this.#r);
	}
	set isPresent(t) {
		c(this.#r, t);
	}
}
function le(o) {
	ht(
		() => o.present.current,
		() => {
			if (!o.opts.ref.current || !(o.present.current !== o.previousPresent.current)) return;
			const e = o.prevAnimationNameState,
				r = at(o.opts.ref.current);
			if (o.present.current) o.machine.dispatch('MOUNT');
			else if (r === 'none' || o.styles.display === 'none') o.machine.dispatch('UNMOUNT');
			else {
				const n = e !== r;
				o.previousPresent.current && n
					? o.machine.dispatch('ANIMATION_OUT')
					: o.machine.dispatch('UNMOUNT');
			}
		}
	);
}
function ae(o) {
	ht(
		() => o.machine.state.current,
		() => {
			if (!o.opts.ref.current) return;
			const t = at(o.opts.ref.current);
			o.prevAnimationNameState = o.machine.state.current === 'mounted' ? t : 'none';
		}
	);
}
function ce(o) {
	ht(
		() => o.opts.ref.current,
		() => {
			if (o.opts.ref.current)
				return (
					(o.styles = getComputedStyle(o.opts.ref.current)),
					It(
						X(o.opts.ref.current, 'animationstart', o.handleAnimationStart),
						X(o.opts.ref.current, 'animationcancel', o.handleAnimationEnd),
						X(o.opts.ref.current, 'animationend', o.handleAnimationEnd)
					)
				);
		}
	);
}
function at(o) {
	return (o && getComputedStyle(o).animationName) || 'none';
}
function ut(o, t) {
	T(t, !0);
	const e = new ie({ open: y(() => t.open), ref: t.ref });
	var r = N(),
		n = w(r);
	{
		var i = (l) => {
			var a = N(),
				h = w(a);
			(W(
				h,
				() => t.presence ?? I,
				() => ({ present: e.isPresent })
			),
				m(l, a));
		};
		E(n, (l) => {
			(t.forceMount || t.open || e.isPresent) && l(i);
		});
	}
	(m(o, r), A());
}
function he(o, t, e) {
	return Math.min(e, Math.max(t, o));
}
const tt = Zt({
		component: 'scroll-area',
		parts: ['root', 'viewport', 'corner', 'thumb', 'scrollbar']
	}),
	et = new Q('ScrollArea.Root'),
	rt = new Q('ScrollArea.Scrollbar'),
	bt = new Q('ScrollArea.ScrollbarVisible'),
	Pt = new Q('ScrollArea.ScrollbarAxis'),
	Ut = new Q('ScrollArea.ScrollbarShared');
class yt {
	static create(t) {
		return et.set(new yt(t));
	}
	opts;
	attachment;
	#t = v(null);
	get scrollAreaNode() {
		return s(this.#t);
	}
	set scrollAreaNode(t) {
		c(this.#t, t, !0);
	}
	#e = v(null);
	get viewportNode() {
		return s(this.#e);
	}
	set viewportNode(t) {
		c(this.#e, t, !0);
	}
	#r = v(null);
	get contentNode() {
		return s(this.#r);
	}
	set contentNode(t) {
		c(this.#r, t, !0);
	}
	#o = v(null);
	get scrollbarXNode() {
		return s(this.#o);
	}
	set scrollbarXNode(t) {
		c(this.#o, t, !0);
	}
	#s = v(null);
	get scrollbarYNode() {
		return s(this.#s);
	}
	set scrollbarYNode(t) {
		c(this.#s, t, !0);
	}
	#n = v(0);
	get cornerWidth() {
		return s(this.#n);
	}
	set cornerWidth(t) {
		c(this.#n, t, !0);
	}
	#i = v(0);
	get cornerHeight() {
		return s(this.#i);
	}
	set cornerHeight(t) {
		c(this.#i, t, !0);
	}
	#l = v(!1);
	get scrollbarXEnabled() {
		return s(this.#l);
	}
	set scrollbarXEnabled(t) {
		c(this.#l, t, !0);
	}
	#a = v(!1);
	get scrollbarYEnabled() {
		return s(this.#a);
	}
	set scrollbarYEnabled(t) {
		c(this.#a, t, !0);
	}
	domContext;
	constructor(t) {
		((this.opts = t),
			(this.attachment = k(t.ref, (e) => (this.scrollAreaNode = e))),
			(this.domContext = new te(t.ref)));
	}
	#c = b(() => ({
		id: this.opts.id.current,
		dir: this.opts.dir.current,
		style: {
			position: 'relative',
			'--bits-scroll-area-corner-height': `${this.cornerHeight}px`,
			'--bits-scroll-area-corner-width': `${this.cornerWidth}px`
		},
		[tt.root]: '',
		...this.attachment
	}));
	get props() {
		return s(this.#c);
	}
	set props(t) {
		c(this.#c, t);
	}
}
class Nt {
	static create(t) {
		return new Nt(t, et.get());
	}
	opts;
	root;
	attachment;
	#t = xt(re());
	#e = xt(null);
	contentAttachment = k(this.#e, (t) => (this.root.contentNode = t));
	constructor(t, e) {
		((this.opts = t),
			(this.root = e),
			(this.attachment = k(t.ref, (r) => (this.root.viewportNode = r))));
	}
	#r = b(() => ({
		id: this.opts.id.current,
		style: {
			overflowX: this.root.scrollbarXEnabled ? 'scroll' : 'hidden',
			overflowY: this.root.scrollbarYEnabled ? 'scroll' : 'hidden'
		},
		[tt.viewport]: '',
		...this.attachment
	}));
	get props() {
		return s(this.#r);
	}
	set props(t) {
		c(this.#r, t);
	}
	#o = b(() => ({
		id: this.#t.current,
		'data-scroll-area-content': '',
		style: { minWidth: this.root.scrollbarXEnabled ? 'fit-content' : void 0 },
		...this.contentAttachment
	}));
	get contentProps() {
		return s(this.#o);
	}
	set contentProps(t) {
		c(this.#o, t);
	}
}
class Tt {
	static create(t) {
		return rt.set(new Tt(t, et.get()));
	}
	opts;
	root;
	#t = b(() => this.opts.orientation.current === 'horizontal');
	get isHorizontal() {
		return s(this.#t);
	}
	set isHorizontal(t) {
		c(this.#t, t);
	}
	#e = v(!1);
	get hasThumb() {
		return s(this.#e);
	}
	set hasThumb(t) {
		c(this.#e, t, !0);
	}
	constructor(t, e) {
		((this.opts = t),
			(this.root = e),
			ht(
				() => this.isHorizontal,
				(r) =>
					r
						? ((this.root.scrollbarXEnabled = !0),
							() => {
								this.root.scrollbarXEnabled = !1;
							})
						: ((this.root.scrollbarYEnabled = !0),
							() => {
								this.root.scrollbarYEnabled = !1;
							})
			));
	}
}
class At {
	static create() {
		return new At(rt.get());
	}
	scrollbar;
	root;
	#t = v(!1);
	get isVisible() {
		return s(this.#t);
	}
	set isVisible(t) {
		c(this.#t, t, !0);
	}
	constructor(t) {
		((this.scrollbar = t),
			(this.root = t.root),
			R(() => {
				const e = this.root.scrollAreaNode,
					r = this.root.opts.scrollHideDelay.current;
				let n = 0;
				if (!e) return;
				const i = () => {
						(this.root.domContext.clearTimeout(n), J(() => (this.isVisible = !0)));
					},
					l = () => {
						(n && this.root.domContext.clearTimeout(n),
							(n = this.root.domContext.setTimeout(() => {
								J(() => {
									((this.scrollbar.hasThumb = !1), (this.isVisible = !1));
								});
							}, r)));
					},
					a = It(X(e, 'pointerenter', i), X(e, 'pointerleave', l));
				return () => {
					(this.root.domContext.getWindow().clearTimeout(n), a());
				};
			}));
	}
	#e = b(() => ({ 'data-state': this.isVisible ? 'visible' : 'hidden' }));
	get props() {
		return s(this.#e);
	}
	set props(t) {
		c(this.#e, t);
	}
}
class Ct {
	static create() {
		return new Ct(rt.get());
	}
	scrollbar;
	root;
	machine = new Lt('hidden', {
		hidden: { SCROLL: 'scrolling' },
		scrolling: { SCROLL_END: 'idle', POINTER_ENTER: 'interacting' },
		interacting: { SCROLL: 'interacting', POINTER_LEAVE: 'idle' },
		idle: { HIDE: 'hidden', SCROLL: 'scrolling', POINTER_ENTER: 'interacting' }
	});
	#t = b(() => this.machine.state.current === 'hidden');
	get isHidden() {
		return s(this.#t);
	}
	set isHidden(t) {
		c(this.#t, t);
	}
	constructor(t) {
		((this.scrollbar = t), (this.root = t.root));
		const e = dt(() => this.machine.dispatch('SCROLL_END'), 100);
		(R(() => {
			const r = this.machine.state.current,
				n = this.root.opts.scrollHideDelay.current;
			if (r === 'idle') {
				const i = this.root.domContext.setTimeout(() => this.machine.dispatch('HIDE'), n);
				return () => this.root.domContext.clearTimeout(i);
			}
		}),
			R(() => {
				const r = this.root.viewportNode;
				if (!r) return;
				const n = this.scrollbar.isHorizontal ? 'scrollLeft' : 'scrollTop';
				let i = r[n];
				return X(r, 'scroll', () => {
					const h = r[n];
					(i !== h && (this.machine.dispatch('SCROLL'), e()), (i = h));
				});
			}),
			(this.onpointerenter = this.onpointerenter.bind(this)),
			(this.onpointerleave = this.onpointerleave.bind(this)));
	}
	onpointerenter(t) {
		this.machine.dispatch('POINTER_ENTER');
	}
	onpointerleave(t) {
		this.machine.dispatch('POINTER_LEAVE');
	}
	#e = b(() => ({
		'data-state': this.machine.state.current === 'hidden' ? 'hidden' : 'visible',
		onpointerenter: this.onpointerenter,
		onpointerleave: this.onpointerleave
	}));
	get props() {
		return s(this.#e);
	}
	set props(t) {
		c(this.#e, t);
	}
}
class ft {
	static create() {
		return new ft(rt.get());
	}
	scrollbar;
	root;
	#t = v(!1);
	get isVisible() {
		return s(this.#t);
	}
	set isVisible(t) {
		c(this.#t, t, !0);
	}
	constructor(t) {
		((this.scrollbar = t), (this.root = t.root));
		const e = dt(() => {
			const r = this.root.viewportNode;
			if (!r) return;
			const n = r.offsetWidth < r.scrollWidth,
				i = r.offsetHeight < r.scrollHeight;
			this.isVisible = this.scrollbar.isHorizontal ? n : i;
		}, 10);
		(new j(() => this.root.viewportNode, e), new j(() => this.root.contentNode, e));
	}
	#e = b(() => ({ 'data-state': this.isVisible ? 'visible' : 'hidden' }));
	get props() {
		return s(this.#e);
	}
	set props(t) {
		c(this.#e, t);
	}
}
class zt {
	static create() {
		return bt.set(new zt(rt.get()));
	}
	scrollbar;
	root;
	#t = v(null);
	get thumbNode() {
		return s(this.#t);
	}
	set thumbNode(t) {
		c(this.#t, t, !0);
	}
	#e = v(0);
	get pointerOffset() {
		return s(this.#e);
	}
	set pointerOffset(t) {
		c(this.#e, t, !0);
	}
	#r = v({ content: 0, viewport: 0, scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 } });
	get sizes() {
		return s(this.#r);
	}
	set sizes(t) {
		c(this.#r, t);
	}
	#o = b(() => Xt(this.sizes.viewport, this.sizes.content));
	get thumbRatio() {
		return s(this.#o);
	}
	set thumbRatio(t) {
		c(this.#o, t);
	}
	#s = b(() => this.thumbRatio > 0 && this.thumbRatio < 1);
	get hasThumb() {
		return s(this.#s);
	}
	set hasThumb(t) {
		c(this.#s, t);
	}
	#n = v('');
	get prevTransformStyle() {
		return s(this.#n);
	}
	set prevTransformStyle(t) {
		c(this.#n, t, !0);
	}
	constructor(t) {
		((this.scrollbar = t),
			(this.root = t.root),
			R(() => {
				this.scrollbar.hasThumb = this.hasThumb;
			}),
			R(() => {
				!this.scrollbar.hasThumb &&
					this.thumbNode &&
					(this.prevTransformStyle = this.thumbNode.style.transform);
			}));
	}
	setSizes(t) {
		this.sizes = t;
	}
	getScrollPosition(t, e) {
		return de({ pointerPos: t, pointerOffset: this.pointerOffset, sizes: this.sizes, dir: e });
	}
	onThumbPointerUp() {
		this.pointerOffset = 0;
	}
	onThumbPointerDown(t) {
		this.pointerOffset = t;
	}
	xOnThumbPositionChange() {
		if (!(this.root.viewportNode && this.thumbNode)) return;
		const t = this.root.viewportNode.scrollLeft,
			r = `translate3d(${Mt({ scrollPos: t, sizes: this.sizes, dir: this.root.opts.dir.current })}px, 0, 0)`;
		((this.thumbNode.style.transform = r), (this.prevTransformStyle = r));
	}
	xOnWheelScroll(t) {
		this.root.viewportNode && (this.root.viewportNode.scrollLeft = t);
	}
	xOnDragScroll(t) {
		this.root.viewportNode &&
			(this.root.viewportNode.scrollLeft = this.getScrollPosition(t, this.root.opts.dir.current));
	}
	yOnThumbPositionChange() {
		if (!(this.root.viewportNode && this.thumbNode)) return;
		const t = this.root.viewportNode.scrollTop,
			r = `translate3d(0, ${Mt({ scrollPos: t, sizes: this.sizes })}px, 0)`;
		((this.thumbNode.style.transform = r), (this.prevTransformStyle = r));
	}
	yOnWheelScroll(t) {
		this.root.viewportNode && (this.root.viewportNode.scrollTop = t);
	}
	yOnDragScroll(t) {
		this.root.viewportNode &&
			(this.root.viewportNode.scrollTop = this.getScrollPosition(t, this.root.opts.dir.current));
	}
}
class Dt {
	static create(t) {
		return Pt.set(new Dt(t, bt.get()));
	}
	opts;
	scrollbarVis;
	root;
	scrollbar;
	attachment;
	#t = v();
	get computedStyle() {
		return s(this.#t);
	}
	set computedStyle(t) {
		c(this.#t, t, !0);
	}
	constructor(t, e) {
		((this.opts = t),
			(this.scrollbarVis = e),
			(this.root = e.root),
			(this.scrollbar = e.scrollbar),
			(this.attachment = k(this.scrollbar.opts.ref, (r) => (this.root.scrollbarXNode = r))),
			R(() => {
				this.scrollbar.opts.ref.current &&
					this.opts.mounted.current &&
					(this.computedStyle = getComputedStyle(this.scrollbar.opts.ref.current));
			}),
			R(() => {
				this.onResize();
			}));
	}
	onThumbPointerDown = (t) => {
		this.scrollbarVis.onThumbPointerDown(t.x);
	};
	onDragScroll = (t) => {
		this.scrollbarVis.xOnDragScroll(t.x);
	};
	onThumbPointerUp = () => {
		this.scrollbarVis.onThumbPointerUp();
	};
	onThumbPositionChange = () => {
		this.scrollbarVis.xOnThumbPositionChange();
	};
	onWheelScroll = (t, e) => {
		if (!this.root.viewportNode) return;
		const r = this.root.viewportNode.scrollLeft + t.deltaX;
		(this.scrollbarVis.xOnWheelScroll(r), Bt(r, e) && t.preventDefault());
	};
	onResize = () => {
		this.scrollbar.opts.ref.current &&
			this.root.viewportNode &&
			this.computedStyle &&
			this.scrollbarVis.setSizes({
				content: this.root.viewportNode.scrollWidth,
				viewport: this.root.viewportNode.offsetWidth,
				scrollbar: {
					size: this.scrollbar.opts.ref.current.clientWidth,
					paddingStart: ct(this.computedStyle.paddingLeft),
					paddingEnd: ct(this.computedStyle.paddingRight)
				}
			});
	};
	#e = b(() => pt(this.scrollbarVis.sizes));
	get thumbSize() {
		return s(this.#e);
	}
	set thumbSize(t) {
		c(this.#e, t);
	}
	#r = b(() => ({
		id: this.scrollbar.opts.id.current,
		'data-orientation': 'horizontal',
		style: {
			bottom: 0,
			left: this.root.opts.dir.current === 'rtl' ? 'var(--bits-scroll-area-corner-width)' : 0,
			right: this.root.opts.dir.current === 'ltr' ? 'var(--bits-scroll-area-corner-width)' : 0,
			'--bits-scroll-area-thumb-width': `${this.thumbSize}px`
		},
		...this.attachment
	}));
	get props() {
		return s(this.#r);
	}
	set props(t) {
		c(this.#r, t);
	}
}
class Rt {
	static create(t) {
		return Pt.set(new Rt(t, bt.get()));
	}
	opts;
	scrollbarVis;
	root;
	scrollbar;
	attachment;
	#t = v();
	get computedStyle() {
		return s(this.#t);
	}
	set computedStyle(t) {
		c(this.#t, t, !0);
	}
	constructor(t, e) {
		((this.opts = t),
			(this.scrollbarVis = e),
			(this.root = e.root),
			(this.scrollbar = e.scrollbar),
			(this.attachment = k(this.scrollbar.opts.ref, (r) => (this.root.scrollbarYNode = r))),
			R(() => {
				this.scrollbar.opts.ref.current &&
					this.opts.mounted.current &&
					(this.computedStyle = getComputedStyle(this.scrollbar.opts.ref.current));
			}),
			R(() => {
				this.onResize();
			}),
			(this.onThumbPointerDown = this.onThumbPointerDown.bind(this)),
			(this.onDragScroll = this.onDragScroll.bind(this)),
			(this.onThumbPointerUp = this.onThumbPointerUp.bind(this)),
			(this.onThumbPositionChange = this.onThumbPositionChange.bind(this)),
			(this.onWheelScroll = this.onWheelScroll.bind(this)),
			(this.onResize = this.onResize.bind(this)));
	}
	onThumbPointerDown(t) {
		this.scrollbarVis.onThumbPointerDown(t.y);
	}
	onDragScroll(t) {
		this.scrollbarVis.yOnDragScroll(t.y);
	}
	onThumbPointerUp() {
		this.scrollbarVis.onThumbPointerUp();
	}
	onThumbPositionChange() {
		this.scrollbarVis.yOnThumbPositionChange();
	}
	onWheelScroll(t, e) {
		if (!this.root.viewportNode) return;
		const r = this.root.viewportNode.scrollTop + t.deltaY;
		(this.scrollbarVis.yOnWheelScroll(r), Bt(r, e) && t.preventDefault());
	}
	onResize() {
		this.scrollbar.opts.ref.current &&
			this.root.viewportNode &&
			this.computedStyle &&
			this.scrollbarVis.setSizes({
				content: this.root.viewportNode.scrollHeight,
				viewport: this.root.viewportNode.offsetHeight,
				scrollbar: {
					size: this.scrollbar.opts.ref.current.clientHeight,
					paddingStart: ct(this.computedStyle.paddingTop),
					paddingEnd: ct(this.computedStyle.paddingBottom)
				}
			});
	}
	#e = b(() => pt(this.scrollbarVis.sizes));
	get thumbSize() {
		return s(this.#e);
	}
	set thumbSize(t) {
		c(this.#e, t);
	}
	#r = b(() => ({
		id: this.scrollbar.opts.id.current,
		'data-orientation': 'vertical',
		style: {
			top: 0,
			right: this.root.opts.dir.current === 'ltr' ? 0 : void 0,
			left: this.root.opts.dir.current === 'rtl' ? 0 : void 0,
			bottom: 'var(--bits-scroll-area-corner-height)',
			'--bits-scroll-area-thumb-height': `${this.thumbSize}px`
		},
		...this.attachment
	}));
	get props() {
		return s(this.#r);
	}
	set props(t) {
		c(this.#r, t);
	}
}
class Ot {
	static create() {
		return Ut.set(new Ot(Pt.get()));
	}
	scrollbarState;
	root;
	scrollbarVis;
	scrollbar;
	#t = v(null);
	get rect() {
		return s(this.#t);
	}
	set rect(t) {
		c(this.#t, t);
	}
	#e = v('');
	get prevWebkitUserSelect() {
		return s(this.#e);
	}
	set prevWebkitUserSelect(t) {
		c(this.#e, t, !0);
	}
	handleResize;
	handleThumbPositionChange;
	handleWheelScroll;
	handleThumbPointerDown;
	handleThumbPointerUp;
	#r = b(() => this.scrollbarVis.sizes.content - this.scrollbarVis.sizes.viewport);
	get maxScrollPos() {
		return s(this.#r);
	}
	set maxScrollPos(t) {
		c(this.#r, t);
	}
	constructor(t) {
		((this.scrollbarState = t),
			(this.root = t.root),
			(this.scrollbarVis = t.scrollbarVis),
			(this.scrollbar = t.scrollbarVis.scrollbar),
			(this.handleResize = dt(() => this.scrollbarState.onResize(), 10)),
			(this.handleThumbPositionChange = this.scrollbarState.onThumbPositionChange),
			(this.handleWheelScroll = this.scrollbarState.onWheelScroll),
			(this.handleThumbPointerDown = this.scrollbarState.onThumbPointerDown),
			(this.handleThumbPointerUp = this.scrollbarState.onThumbPointerUp),
			R(() => {
				const e = this.maxScrollPos,
					r = this.scrollbar.opts.ref.current;
				this.root.viewportNode;
				const n = (l) => {
					const a = l.target;
					r?.contains(a) && this.handleWheelScroll(l, e);
				};
				return X(this.root.domContext.getDocument(), 'wheel', n, { passive: !1 });
			}),
			qt(() => {
				(this.scrollbarVis.sizes, J(() => this.handleThumbPositionChange()));
			}),
			new j(() => this.scrollbar.opts.ref.current, this.handleResize),
			new j(() => this.root.contentNode, this.handleResize),
			(this.onpointerdown = this.onpointerdown.bind(this)),
			(this.onpointermove = this.onpointermove.bind(this)),
			(this.onpointerup = this.onpointerup.bind(this)));
	}
	handleDragScroll(t) {
		if (!this.rect) return;
		const e = t.clientX - this.rect.left,
			r = t.clientY - this.rect.top;
		this.scrollbarState.onDragScroll({ x: e, y: r });
	}
	onpointerdown(t) {
		if (t.button !== 0) return;
		(t.target.setPointerCapture(t.pointerId),
			(this.rect = this.scrollbar.opts.ref.current?.getBoundingClientRect() ?? null),
			(this.prevWebkitUserSelect = this.root.domContext.getDocument().body.style.webkitUserSelect),
			(this.root.domContext.getDocument().body.style.webkitUserSelect = 'none'),
			this.root.viewportNode && (this.root.viewportNode.style.scrollBehavior = 'auto'),
			this.handleDragScroll(t));
	}
	onpointermove(t) {
		this.handleDragScroll(t);
	}
	onpointerup(t) {
		const e = t.target;
		(e.hasPointerCapture(t.pointerId) && e.releasePointerCapture(t.pointerId),
			(this.root.domContext.getDocument().body.style.webkitUserSelect = this.prevWebkitUserSelect),
			this.root.viewportNode && (this.root.viewportNode.style.scrollBehavior = ''),
			(this.rect = null));
	}
	#o = b(() =>
		O({
			...this.scrollbarState.props,
			style: { position: 'absolute', ...this.scrollbarState.props.style },
			[tt.scrollbar]: '',
			onpointerdown: this.onpointerdown,
			onpointermove: this.onpointermove,
			onpointerup: this.onpointerup
		})
	);
	get props() {
		return s(this.#o);
	}
	set props(t) {
		c(this.#o, t);
	}
}
class Vt {
	static create(t) {
		return new Vt(t, Ut.get());
	}
	opts;
	scrollbarState;
	attachment;
	#t;
	#e = v();
	#r = dt(() => {
		s(this.#e) && (s(this.#e)(), c(this.#e, void 0));
	}, 100);
	constructor(t, e) {
		((this.opts = t),
			(this.scrollbarState = e),
			(this.#t = e.root),
			(this.attachment = k(this.opts.ref, (r) => (this.scrollbarState.scrollbarVis.thumbNode = r))),
			R(() => {
				const r = this.#t.viewportNode;
				if (!r) return;
				const n = () => {
					if ((this.#r(), !s(this.#e))) {
						const l = ue(r, this.scrollbarState.handleThumbPositionChange);
						(c(this.#e, l, !0), this.scrollbarState.handleThumbPositionChange());
					}
				};
				return (J(() => this.scrollbarState.handleThumbPositionChange()), X(r, 'scroll', n));
			}),
			(this.onpointerdowncapture = this.onpointerdowncapture.bind(this)),
			(this.onpointerup = this.onpointerup.bind(this)));
	}
	onpointerdowncapture(t) {
		const e = t.target;
		if (!e) return;
		const r = e.getBoundingClientRect(),
			n = t.clientX - r.left,
			i = t.clientY - r.top;
		this.scrollbarState.handleThumbPointerDown({ x: n, y: i });
	}
	onpointerup(t) {
		this.scrollbarState.handleThumbPointerUp();
	}
	#o = b(() => ({
		id: this.opts.id.current,
		'data-state': this.scrollbarState.scrollbarVis.hasThumb ? 'visible' : 'hidden',
		style: {
			width: 'var(--bits-scroll-area-thumb-width)',
			height: 'var(--bits-scroll-area-thumb-height)',
			transform: this.scrollbarState.scrollbarVis.prevTransformStyle
		},
		onpointerdowncapture: this.onpointerdowncapture,
		onpointerup: this.onpointerup,
		[tt.thumb]: '',
		...this.attachment
	}));
	get props() {
		return s(this.#o);
	}
	set props(t) {
		c(this.#o, t);
	}
}
class Et {
	static create(t) {
		return new Et(t, et.get());
	}
	opts;
	root;
	attachment;
	#t = v(0);
	#e = v(0);
	#r = b(() => !!(s(this.#t) && s(this.#e)));
	get hasSize() {
		return s(this.#r);
	}
	set hasSize(t) {
		c(this.#r, t);
	}
	constructor(t, e) {
		((this.opts = t),
			(this.root = e),
			(this.attachment = k(this.opts.ref)),
			new j(
				() => this.root.scrollbarXNode,
				() => {
					const r = this.root.scrollbarXNode?.offsetHeight || 0;
					((this.root.cornerHeight = r), c(this.#e, r, !0));
				}
			),
			new j(
				() => this.root.scrollbarYNode,
				() => {
					const r = this.root.scrollbarYNode?.offsetWidth || 0;
					((this.root.cornerWidth = r), c(this.#t, r, !0));
				}
			));
	}
	#o = b(() => ({
		id: this.opts.id.current,
		style: {
			width: s(this.#t),
			height: s(this.#e),
			position: 'absolute',
			right: this.root.opts.dir.current === 'ltr' ? 0 : void 0,
			left: this.root.opts.dir.current === 'rtl' ? 0 : void 0,
			bottom: 0
		},
		[tt.corner]: '',
		...this.attachment
	}));
	get props() {
		return s(this.#o);
	}
	set props(t) {
		c(this.#o, t);
	}
}
function ct(o) {
	return o ? Number.parseInt(o, 10) : 0;
}
function Xt(o, t) {
	const e = o / t;
	return Number.isNaN(e) ? 0 : e;
}
function pt(o) {
	const t = Xt(o.viewport, o.content),
		e = o.scrollbar.paddingStart + o.scrollbar.paddingEnd,
		r = (o.scrollbar.size - e) * t;
	return Math.max(r, 18);
}
function de({ pointerPos: o, pointerOffset: t, sizes: e, dir: r = 'ltr' }) {
	const n = pt(e),
		i = n / 2,
		l = t || i,
		a = n - l,
		h = e.scrollbar.paddingStart + l,
		f = e.scrollbar.size - e.scrollbar.paddingEnd - a,
		p = e.content - e.viewport,
		d = r === 'ltr' ? [0, p] : [p * -1, 0];
	return Yt([h, f], d)(o);
}
function Mt({ scrollPos: o, sizes: t, dir: e = 'ltr' }) {
	const r = pt(t),
		n = t.scrollbar.paddingStart + t.scrollbar.paddingEnd,
		i = t.scrollbar.size - n,
		l = t.content - t.viewport,
		a = i - r,
		h = e === 'ltr' ? [0, l] : [l * -1, 0],
		f = he(o, h[0], h[1]);
	return Yt([0, l], [0, a])(f);
}
function Yt(o, t) {
	return (e) => {
		if (o[0] === o[1] || t[0] === t[1]) return t[0];
		const r = (t[1] - t[0]) / (o[1] - o[0]);
		return t[0] + r * (e - o[0]);
	};
}
function Bt(o, t) {
	return o > 0 && o < t;
}
function ue(o, t) {
	let e = { left: o.scrollLeft, top: o.scrollTop },
		r = 0;
	const n = ee(o);
	return (
		(function i() {
			const l = { left: o.scrollLeft, top: o.scrollTop },
				a = e.left !== l.left,
				h = e.top !== l.top;
			((a || h) && t(), (e = l), (r = n.requestAnimationFrame(i)));
		})(),
		() => n.cancelAnimationFrame(r)
	);
}
var be = C('<div><!></div>');
function fe(o, t) {
	const e = K();
	T(t, !0);
	let r = _(t, 'ref', 15, null),
		n = _(t, 'id', 19, () => Z(e)),
		i = _(t, 'type', 3, 'hover'),
		l = _(t, 'dir', 3, 'ltr'),
		a = _(t, 'scrollHideDelay', 3, 600),
		h = D(t, [
			'$$slots',
			'$$events',
			'$$legacy',
			'ref',
			'id',
			'type',
			'dir',
			'scrollHideDelay',
			'children',
			'child'
		]);
	const f = yt.create({
			type: y(() => i()),
			dir: y(() => l()),
			scrollHideDelay: y(() => a()),
			id: y(() => n()),
			ref: y(
				() => r(),
				(S) => r(S)
			)
		}),
		p = b(() => O(h, f.props));
	var d = N(),
		u = w(d);
	{
		var g = (S) => {
				var P = N(),
					x = w(P);
				(W(
					x,
					() => t.child,
					() => ({ props: s(p) })
				),
					m(S, P));
			},
			$ = (S) => {
				var P = be();
				F(P, () => ({ ...s(p) }));
				var x = Y(P);
				(W(x, () => t.children ?? I), m(S, P));
			};
		E(u, (S) => {
			t.child ? S(g) : S($, !1);
		});
	}
	(m(o, d), A());
}
var pe = C('<div><div><!></div></div>');
function me(o, t) {
	const e = K();
	T(t, !0);
	let r = _(t, 'ref', 15, null),
		n = _(t, 'id', 19, () => Z(e)),
		i = D(t, ['$$slots', '$$events', '$$legacy', 'ref', 'id', 'children']);
	const l = Nt.create({
			id: y(() => n()),
			ref: y(
				() => r(),
				(u) => r(u)
			)
		}),
		a = b(() => O(i, l.props)),
		h = b(() => O({}, l.contentProps));
	var f = pe();
	F(f, () => ({ ...s(a) }));
	var p = Y(f);
	F(p, () => ({ ...s(h) }));
	var d = Y(p);
	(W(d, () => t.children ?? I), m(o, f), A());
}
var ve = C('<div><!></div>');
function kt(o, t) {
	T(t, !0);
	let e = D(t, ['$$slots', '$$events', '$$legacy', 'child', 'children']);
	const r = Ot.create(),
		n = b(() => O(e, r.props));
	var i = N(),
		l = w(i);
	{
		var a = (f) => {
				var p = N(),
					d = w(p);
				(W(
					d,
					() => t.child,
					() => ({ props: s(n) })
				),
					m(f, p));
			},
			h = (f) => {
				var p = ve();
				F(p, () => ({ ...s(n) }));
				var d = Y(p);
				(W(d, () => t.children ?? I), m(f, p));
			};
		E(l, (f) => {
			t.child ? f(a) : f(h, !1);
		});
	}
	(m(o, i), A());
}
function ge(o, t) {
	T(t, !0);
	let e = D(t, ['$$slots', '$$events', '$$legacy']);
	const r = new _t(),
		n = Dt.create({ mounted: y(() => r.current) }),
		i = b(() => O(e, n.props));
	(kt(
		o,
		z(() => s(i))
	),
		A());
}
function Se(o, t) {
	T(t, !0);
	let e = D(t, ['$$slots', '$$events', '$$legacy']);
	const r = new _t(),
		n = Rt.create({ mounted: y(() => r.current) }),
		i = b(() => O(e, n.props));
	(kt(
		o,
		z(() => s(i))
	),
		A());
}
function mt(o, t) {
	T(t, !0);
	let e = D(t, ['$$slots', '$$events', '$$legacy']);
	const r = zt.create();
	var n = N(),
		i = w(n);
	{
		var l = (h) => {
				ge(
					h,
					z(() => e)
				);
			},
			a = (h) => {
				Se(
					h,
					z(() => e)
				);
			};
		E(i, (h) => {
			r.scrollbar.opts.orientation.current === 'horizontal' ? h(l) : h(a, !1);
		});
	}
	(m(o, n), A());
}
function we(o, t) {
	T(t, !0);
	let e = _(t, 'forceMount', 3, !1),
		r = D(t, ['$$slots', '$$events', '$$legacy', 'forceMount']);
	const n = ft.create(),
		i = b(() => O(r, n.props));
	{
		const l = (h) => {
			mt(
				h,
				z(() => s(i))
			);
		};
		let a = b(() => e() || n.isVisible);
		ut(o, {
			get open() {
				return s(a);
			},
			get ref() {
				return n.scrollbar.opts.ref;
			},
			presence: l,
			$$slots: { presence: !0 }
		});
	}
	A();
}
function xe(o, t) {
	T(t, !0);
	let e = _(t, 'forceMount', 3, !1),
		r = D(t, ['$$slots', '$$events', '$$legacy', 'forceMount']);
	const n = Ct.create(),
		i = b(() => O(r, n.props));
	{
		const l = (h) => {
			mt(
				h,
				z(() => s(i))
			);
		};
		let a = b(() => e() || !n.isHidden);
		ut(
			o,
			z(() => s(i), {
				get open() {
					return s(a);
				},
				get ref() {
					return n.scrollbar.opts.ref;
				},
				presence: l,
				$$slots: { presence: !0 }
			})
		);
	}
	A();
}
function _e(o, t) {
	T(t, !0);
	let e = _(t, 'forceMount', 3, !1),
		r = D(t, ['$$slots', '$$events', '$$legacy', 'forceMount']);
	const n = At.create(),
		i = ft.create(),
		l = b(() => O(r, n.props, i.props, { 'data-state': n.isVisible ? 'visible' : 'hidden' })),
		a = b(() => e() || (n.isVisible && i.isVisible));
	(ut(o, {
		get open() {
			return s(a);
		},
		get ref() {
			return i.scrollbar.opts.ref;
		},
		presence: (f) => {
			mt(
				f,
				z(() => s(l))
			);
		},
		$$slots: { presence: !0 }
	}),
		A());
}
function Pe(o, t) {
	const e = K();
	T(t, !0);
	let r = _(t, 'ref', 15, null),
		n = _(t, 'id', 19, () => Z(e)),
		i = D(t, ['$$slots', '$$events', '$$legacy', 'ref', 'id', 'orientation']);
	const l = Tt.create({
			orientation: y(() => t.orientation),
			id: y(() => n()),
			ref: y(
				() => r(),
				(u) => r(u)
			)
		}),
		a = b(() => l.root.opts.type.current);
	var h = N(),
		f = w(h);
	{
		var p = (u) => {
				_e(
					u,
					z(() => i, {
						get id() {
							return n();
						}
					})
				);
			},
			d = (u) => {
				var g = N(),
					$ = w(g);
				{
					var S = (x) => {
							xe(
								x,
								z(() => i, {
									get id() {
										return n();
									}
								})
							);
						},
						P = (x) => {
							var M = N(),
								q = w(M);
							{
								var L = (V) => {
										we(
											V,
											z(() => i, {
												get id() {
													return n();
												}
											})
										);
									},
									U = (V) => {
										var B = N(),
											vt = w(B);
										{
											var Ht = (G) => {
												mt(
													G,
													z(() => i, {
														get id() {
															return n();
														}
													})
												);
											};
											E(
												vt,
												(G) => {
													s(a) === 'always' && G(Ht);
												},
												!0
											);
										}
										m(V, B);
									};
								E(
									q,
									(V) => {
										s(a) === 'auto' ? V(L) : V(U, !1);
									},
									!0
								);
							}
							m(x, M);
						};
					E(
						$,
						(x) => {
							s(a) === 'scroll' ? x(S) : x(P, !1);
						},
						!0
					);
				}
				m(u, g);
			};
		E(f, (u) => {
			s(a) === 'hover' ? u(p) : u(d, !1);
		});
	}
	(m(o, h), A());
}
var ye = C('<div><!></div>');
function Ne(o, t) {
	T(t, !0);
	let e = _(t, 'ref', 15, null),
		r = D(t, ['$$slots', '$$events', '$$legacy', 'ref', 'id', 'child', 'children', 'present']);
	const n = new _t(),
		i = Vt.create({
			id: y(() => t.id),
			ref: y(
				() => e(),
				(d) => e(d)
			),
			mounted: y(() => n.current)
		}),
		l = b(() => O(r, i.props, { style: { hidden: !t.present } }));
	var a = N(),
		h = w(a);
	{
		var f = (d) => {
				var u = N(),
					g = w(u);
				(W(
					g,
					() => t.child,
					() => ({ props: s(l) })
				),
					m(d, u));
			},
			p = (d) => {
				var u = ye();
				F(u, () => ({ ...s(l) }));
				var g = Y(u);
				(W(g, () => t.children ?? I), m(d, u));
			};
		E(h, (d) => {
			t.child ? d(f) : d(p, !1);
		});
	}
	(m(o, a), A());
}
function Te(o, t) {
	const e = K();
	T(t, !0);
	let r = _(t, 'id', 19, () => Z(e)),
		n = _(t, 'ref', 15, null),
		i = _(t, 'forceMount', 3, !1),
		l = D(t, ['$$slots', '$$events', '$$legacy', 'id', 'ref', 'forceMount']);
	const a = bt.get();
	{
		const h = (p, d) => {
			let u = () => d?.().present;
			Ne(
				p,
				z(() => l, {
					get id() {
						return r();
					},
					get present() {
						return u();
					},
					get ref() {
						return n();
					},
					set ref(g) {
						n(g);
					}
				})
			);
		};
		let f = b(() => i() || a.hasThumb);
		ut(o, {
			get open() {
				return s(f);
			},
			get ref() {
				return a.scrollbar.opts.ref;
			},
			presence: h,
			$$slots: { presence: !0 }
		});
	}
	A();
}
var Ae = C('<div><!></div>');
function Ce(o, t) {
	T(t, !0);
	let e = _(t, 'ref', 15, null),
		r = D(t, ['$$slots', '$$events', '$$legacy', 'ref', 'id', 'children', 'child']);
	const n = Et.create({
			id: y(() => t.id),
			ref: y(
				() => e(),
				(p) => e(p)
			)
		}),
		i = b(() => O(r, n.props));
	var l = N(),
		a = w(l);
	{
		var h = (p) => {
				var d = N(),
					u = w(d);
				(W(
					u,
					() => t.child,
					() => ({ props: s(i) })
				),
					m(p, d));
			},
			f = (p) => {
				var d = Ae();
				F(d, () => ({ ...s(i) }));
				var u = Y(d);
				(W(u, () => t.children ?? I), m(p, d));
			};
		E(a, (p) => {
			t.child ? p(h) : p(f, !1);
		});
	}
	(m(o, l), A());
}
function ze(o, t) {
	const e = K();
	T(t, !0);
	let r = _(t, 'ref', 15, null),
		n = _(t, 'id', 19, () => Z(e)),
		i = D(t, ['$$slots', '$$events', '$$legacy', 'ref', 'id']);
	const l = et.get(),
		a = b(() => !!(l.scrollbarXNode && l.scrollbarYNode)),
		h = b(() => l.opts.type.current !== 'scroll' && s(a));
	var f = N(),
		p = w(f);
	{
		var d = (u) => {
			Ce(
				u,
				z(() => i, {
					get id() {
						return n();
					},
					get ref() {
						return r();
					},
					set ref(g) {
						r(g);
					}
				})
			);
		};
		E(p, (u) => {
			s(h) && u(d);
		});
	}
	(m(o, f), A());
}
const lt = fe,
	gt = me,
	nt = Pe,
	it = Te,
	St = ze,
	De = { component: lt, title: 'Design System/Atoms/ScrollArea', tags: ['autodocs'] },
	{ Story: wt } = Kt();
var Re = C(
		'<div class="mb-4 text-primary"><h4 class="mb-2 font-semibold"></h4> <p class="text-secondary"></p></div>'
	),
	Oe = C('<div class="p-4"></div>'),
	Ve = C('<!> <!> <!>', 1),
	Ee = C(
		'<div class="flex h-[150px] min-w-[200px] items-center justify-center rounded-card bg-elevated text-primary"></div>'
	),
	$e = C('<div class="flex gap-4 p-4"></div>'),
	He = C('<!> <!> <!>', 1),
	We = C('<div class="rounded-card bg-elevated p-4 text-primary"></div>'),
	Me = C('<div class="flex min-w-[200px] flex-col gap-4"></div>'),
	Ie = C('<div class="p-4"><div class="flex gap-4"></div></div>'),
	Le = C('<!> <!> <!> <!>', 1),
	Ue = C('<!> <!> <!>', 1);
function Ft(o, t) {
	(T(t, !1), Jt());
	var e = Ue(),
		r = w(e);
	wt(r, {
		name: 'Default',
		args: {},
		template: (a, h = I) => {
			lt(a, {
				class: 'h-[200px] w-[350px] rounded-card border border-base',
				children: (f, p) => {
					var d = Ve(),
						u = w(d);
					gt(u, {
						class: 'h-full w-full rounded-card',
						children: (S, P) => {
							var x = Oe();
							(ot(
								x,
								4,
								() => Array(20),
								st,
								(M, q, L) => {
									var U = Re(),
										V = Y(U);
									V.textContent = `Item ${L + 1}`;
									var B = H(V, 2);
									((B.textContent = `This is some content for item ${L + 1}. Scroll to see more items below.`),
										m(M, U));
								}
							),
								m(S, x));
						},
						$$slots: { default: !0 }
					});
					var g = H(u, 2);
					nt(g, {
						orientation: 'vertical',
						class: 'flex touch-none select-none border-l border-base p-0.5 transition-colors',
						children: (S, P) => {
							it(S, {
								class:
									"relative flex-1 rounded-full bg-base before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
							});
						},
						$$slots: { default: !0 }
					});
					var $ = H(g, 2);
					(St($, {}), m(f, d));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<ScrollArea.Root class="h-[200px] w-[350px] rounded-card border border-base">
	<ScrollArea.Viewport class="h-full w-full rounded-card">
		<div class="p-4">
			{#each Array(20) as _, i}
				<div class="mb-4 text-primary">
					<h4 class="mb-2 font-semibold">Item {i + 1}</h4>
					<p class="text-secondary">
						This is some content for item {i + 1}. Scroll to see more items below.
					</p>
				</div>
			{/each}
		</div>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar orientation="vertical" class="flex touch-none select-none border-l border-base p-0.5 transition-colors">
		<ScrollArea.Thumb class="relative flex-1 rounded-full bg-base before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
	</ScrollArea.Scrollbar>
	<ScrollArea.Corner />
</ScrollArea.Root>`
			}
		}
	});
	var n = H(r, 2);
	wt(n, {
		name: 'Horizontal',
		args: {},
		template: (a, h = I) => {
			lt(a, {
				class: 'h-[200px] w-[350px] rounded-card border border-base',
				children: (f, p) => {
					var d = He(),
						u = w(d);
					gt(u, {
						class: 'h-full w-full rounded-card',
						children: (S, P) => {
							var x = $e();
							(ot(
								x,
								4,
								() => Array(10),
								st,
								(M, q, L) => {
									var U = Ee();
									((U.textContent = `Item ${L + 1}`), m(M, U));
								}
							),
								m(S, x));
						},
						$$slots: { default: !0 }
					});
					var g = H(u, 2);
					nt(g, {
						orientation: 'horizontal',
						class: 'flex touch-none select-none border-t border-base p-0.5 transition-colors',
						children: (S, P) => {
							it(S, {
								class:
									"relative flex-1 rounded-full bg-base before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
							});
						},
						$$slots: { default: !0 }
					});
					var $ = H(g, 2);
					(St($, {}), m(f, d));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<ScrollArea.Root class="h-[200px] w-[350px] rounded-card border border-base">
	<ScrollArea.Viewport class="h-full w-full rounded-card">
		<div class="flex gap-4 p-4">
			{#each Array(10) as _, i}
				<div class="flex h-[150px] min-w-[200px] items-center justify-center rounded-card bg-elevated text-primary">
					Item {i + 1}
				</div>
			{/each}
		</div>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar orientation="horizontal" class="flex touch-none select-none border-t border-base p-0.5 transition-colors">
		<ScrollArea.Thumb class="relative flex-1 rounded-full bg-base before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
	</ScrollArea.Scrollbar>
	<ScrollArea.Corner />
</ScrollArea.Root>`
			}
		}
	});
	var i = H(n, 2);
	(wt(i, {
		name: 'Both Directions',
		args: {},
		template: (a, h = I) => {
			lt(a, {
				class: 'h-[200px] w-[350px] rounded-card border border-base',
				children: (f, p) => {
					var d = Le(),
						u = w(d);
					gt(u, {
						class: 'h-full w-full rounded-card',
						children: (P, x) => {
							var M = Ie(),
								q = Y(M);
							(ot(
								q,
								4,
								() => Array(5),
								st,
								(L, U, V) => {
									var B = Me();
									(ot(
										B,
										4,
										() => Array(10),
										st,
										(vt, Ht, G, Xe) => {
											var Wt = We();
											((Wt.textContent = `Item ${V + 1}-${G + 1}`), m(vt, Wt));
										}
									),
										m(L, B));
								}
							),
								m(P, M));
						},
						$$slots: { default: !0 }
					});
					var g = H(u, 2);
					nt(g, {
						orientation: 'vertical',
						class: 'flex touch-none select-none border-l border-base p-0.5 transition-colors',
						children: (P, x) => {
							it(P, {
								class:
									"relative flex-1 rounded-full bg-base before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
							});
						},
						$$slots: { default: !0 }
					});
					var $ = H(g, 2);
					nt($, {
						orientation: 'horizontal',
						class: 'flex touch-none select-none border-t border-base p-0.5 transition-colors',
						children: (P, x) => {
							it(P, {
								class:
									"relative flex-1 rounded-full bg-base before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
							});
						},
						$$slots: { default: !0 }
					});
					var S = H($, 2);
					(St(S, {}), m(f, d));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<ScrollArea.Root class="h-[200px] w-[350px] rounded-card border border-base">
	<ScrollArea.Viewport class="h-full w-full rounded-card">
		<div class="p-4">
			<div class="flex gap-4">
				{#each Array(5) as _, i}
					<div class="flex min-w-[200px] flex-col gap-4">
						{#each Array(10) as _, j}
							<div class="rounded-card bg-elevated p-4 text-primary">
								Item {i + 1}-{j + 1}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar orientation="vertical" class="flex touch-none select-none border-l border-base p-0.5 transition-colors">
		<ScrollArea.Thumb class="relative flex-1 rounded-full bg-base before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
	</ScrollArea.Scrollbar>
	<ScrollArea.Scrollbar orientation="horizontal" class="flex touch-none select-none border-t border-base p-0.5 transition-colors">
		<ScrollArea.Thumb class="relative flex-1 rounded-full bg-base before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
	</ScrollArea.Scrollbar>
	<ScrollArea.Corner />
</ScrollArea.Root>`
			}
		}
	}),
		m(o, e),
		A());
}
Ft.__docgen = { data: [], name: 'ScrollArea.stories.svelte' };
const $t = Gt(Ft, De),
	sr = ['Default', 'Horizontal', 'BothDirections'],
	nr = { ...$t.Default, tags: ['svelte-csf-v5'] },
	ir = { ...$t.Horizontal, tags: ['svelte-csf-v5'] },
	lr = { ...$t.BothDirections, tags: ['svelte-csf-v5'] };
export {
	lr as BothDirections,
	nr as Default,
	ir as Horizontal,
	sr as __namedExportsOrder,
	De as default
};
