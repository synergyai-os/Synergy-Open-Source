import {
	u as K,
	w as m,
	v as u,
	a8 as b,
	ab as ot,
	aA as R,
	ae as q,
	p as F,
	h as x,
	F as V,
	a as k,
	m as G,
	b as A,
	c as E,
	k as D,
	f as C,
	n as M,
	e as z,
	o as j,
	s as W,
	d as st
} from './iframe-DYn7RqBV.js';
import { c as Ct, i as Mt } from './create-runtime-stories-2rm03jka.js';
import { d as zt } from './index-QxUtaCdU.js';
import { a as J } from './attributes-D2XuSyo_.js';
import { w as at } from './watch.svelte-CYSsdG2H.js';
import { C as Ot } from './context-DWcBTeuX.js';
import {
	c as Yt,
	a as Q,
	h as U,
	g as ft,
	v as bt,
	b as g,
	d as Z,
	m as $
} from './create-id-CD7dpc57.js';
import { b as gt } from './is-DtD5rb4o.js';
import { i as Nt } from './arrays-C786ZheV.js';
import { o as vt } from './on-mount-effect.svelte-DajC3xwp.js';
import { D as Wt } from './dom-context.svelte-Cee2qr-t.js';
import { b as xt, a as At, A as yt, c as Pt, H as St, E as kt } from './kbd-constants-Duhtze-4.js';
import { n as pt } from './noop-DX6rZLP_.js';
import { e as B } from './each-DHv61wEY.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
function mt(c, t, e) {
	const s = { position: 'absolute' };
	return (
		c === 'lr'
			? ((s.left = `${t}%`), (s.right = `${e}%`))
			: c === 'rl'
				? ((s.right = `${t}%`), (s.left = `${e}%`))
				: c === 'bt'
					? ((s.bottom = `${t}%`), (s.top = `${e}%`))
					: ((s.top = `${t}%`), (s.bottom = `${e}%`)),
		s
	);
}
function _t(c, t) {
	const e = { position: 'absolute' };
	return (
		c === 'lr'
			? ((e.left = `${t}%`), (e.translate = '-50% 0'))
			: c === 'rl'
				? ((e.right = `${t}%`), (e.translate = '50% 0'))
				: c === 'bt'
					? ((e.bottom = `${t}%`), (e.translate = '0 50%'))
					: ((e.top = `${t}%`), (e.translate = '0 -50%')),
		e
	);
}
function wt(c, t, e) {
	const s = { position: 'absolute' };
	return (
		c === 'lr'
			? ((s.left = `${t}%`), (s.translate = `${e}% 0`))
			: c === 'rl'
				? ((s.right = `${t}%`), (s.translate = `${-e}% 0`))
				: c === 'bt'
					? ((s.bottom = `${t}%`), (s.translate = `0 ${-e}%`))
					: ((s.top = `${t}%`), (s.translate = `0 ${e}%`)),
		s
	);
}
function Xt(c) {
	if (Math.floor(c) === c) return 0;
	const t = c.toString();
	if (t.indexOf('.') !== -1 && t.indexOf('e-') === -1) return t.split('.')[1].length;
	if (t.indexOf('e-') !== -1) {
		const e = t.split('e-');
		return parseInt(e[1], 10);
	}
	return 0;
}
function Ft(c, t) {
	const e = Math.pow(10, t);
	return Math.round(c * e) / e;
}
function lt(c, t, e) {
	if (typeof c == 'number') {
		const s = e - t;
		let n = Math.ceil(s / c);
		const r = Xt(c),
			i = Math.pow(10, r),
			o = Math.round(s * i),
			a = Math.round(c * i);
		o % a === 0 && n++;
		const l = [];
		for (let p = 0; p < n; p++) {
			const v = t + p * c,
				d = Ft(v, r);
			l.push(d);
		}
		return l;
	}
	return [...new Set(c)].filter((s) => s >= t && s <= e).sort((s, n) => s - n);
}
function O(c, t) {
	if (t.length === 0) return c;
	let e = t[0],
		s = Math.abs(c - e);
	for (const n of t) {
		const r = Math.abs(c - n);
		r < s && ((s = r), (e = n));
	}
	return e;
}
function H(c, t, e) {
	const s = t.indexOf(c);
	return s === -1
		? O(c, t)
		: e === 'next'
			? s < t.length - 1
				? t[s + 1]
				: c
			: s > 0
				? t[s - 1]
				: c;
}
function Et(c, t, e = !0) {
	const [s, n] = c,
		[r, i] = t,
		o = (i - r) / (n - s);
	return (a) => {
		const l = r + o * (a - s);
		return e ? (l > Math.max(r, i) ? Math.max(r, i) : l < Math.min(r, i) ? Math.min(r, i) : l) : l;
	};
}
const I = Yt({
		component: 'slider',
		parts: ['root', 'thumb', 'range', 'tick', 'tick-label', 'thumb-label']
	}),
	tt = new Ot('Slider.Root');
class Tt {
	opts;
	attachment;
	#e = ot(!1);
	get isActive() {
		return u(this.#e);
	}
	set isActive(t) {
		b(this.#e, t, !0);
	}
	#t = m(() =>
		this.opts.orientation.current === 'horizontal'
			? this.opts.dir.current === 'rtl'
				? 'rl'
				: 'lr'
			: this.opts.dir.current === 'rtl'
				? 'tb'
				: 'bt'
	);
	get direction() {
		return u(this.#t);
	}
	set direction(t) {
		b(this.#t, t);
	}
	#s = m(() => lt(this.opts.step.current, this.opts.min.current, this.opts.max.current));
	get normalizedSteps() {
		return u(this.#s);
	}
	set normalizedSteps(t) {
		b(this.#s, t);
	}
	domContext;
	constructor(t) {
		((this.opts = t), (this.attachment = Q(t.ref)), (this.domContext = new Wt(this.opts.ref)));
	}
	isThumbActive(t) {
		return this.isActive;
	}
	#n = m(() => {
		if (!this.opts.disabled.current)
			return this.opts.orientation.current === 'horizontal' ? 'pan-y' : 'pan-x';
	});
	getAllThumbs = () => {
		const t = this.opts.ref.current;
		return t ? Array.from(t.querySelectorAll(I.selector('thumb'))) : [];
	};
	getThumbScale = () => {
		const t = this.opts.trackPadding?.current;
		if (t !== void 0 && t > 0) return [t, 100 - t];
		if (this.opts.thumbPositioning.current === 'exact') return [0, 100];
		const e = this.opts.orientation.current === 'vertical',
			s = this.getAllThumbs()[0],
			n = e ? s?.offsetHeight : s?.offsetWidth;
		if (n === void 0 || Number.isNaN(n) || n === 0) return [0, 100];
		const r = e ? this.opts.ref.current?.offsetHeight : this.opts.ref.current?.offsetWidth;
		if (r === void 0 || Number.isNaN(r) || r === 0) return [0, 100];
		const i = (n / 2 / r) * 100,
			o = i,
			a = 100 - i;
		return [o, a];
	};
	getPositionFromValue = (t) => {
		const e = this.getThumbScale();
		return Et([this.opts.min.current, this.opts.max.current], e)(t);
	};
	#r = m(() => ({
		id: this.opts.id.current,
		'data-orientation': this.opts.orientation.current,
		'data-disabled': U(this.opts.disabled.current),
		style: { touchAction: u(this.#n) },
		[I.root]: '',
		...this.attachment
	}));
	get props() {
		return u(this.#r);
	}
	set props(t) {
		b(this.#r, t);
	}
}
class Ut extends Tt {
	opts;
	isMulti = !1;
	constructor(t) {
		(super(t),
			(this.opts = t),
			vt(() =>
				bt(
					R(this.domContext.getDocument(), 'pointerdown', this.handlePointerDown),
					R(this.domContext.getDocument(), 'pointerup', this.handlePointerUp),
					R(this.domContext.getDocument(), 'pointermove', this.handlePointerMove),
					R(this.domContext.getDocument(), 'pointerleave', this.handlePointerUp)
				)
			),
			at(
				[
					() => this.opts.step.current,
					() => this.opts.min.current,
					() => this.opts.max.current,
					() => this.opts.value.current
				],
				([e, s, n, r]) => {
					const i = lt(e, s, n),
						o = (l) => i.includes(l),
						a = (l) => O(l, i);
					o(r) || (this.opts.value.current = a(r));
				}
			));
	}
	isTickValueSelected = (t) => this.opts.value.current === t;
	applyPosition({ clientXY: t, start: e, end: s }) {
		const n = this.opts.min.current,
			r = this.opts.max.current,
			o = ((t - e) / (s - e)) * (r - n) + n;
		if (o < n) this.updateValue(n);
		else if (o > r) this.updateValue(r);
		else {
			const a = this.normalizedSteps,
				l = O(o, a);
			this.updateValue(l);
		}
	}
	updateValue = (t) => {
		this.opts.value.current = O(t, this.normalizedSteps);
	};
	handlePointerMove = (t) => {
		if (!this.isActive || this.opts.disabled.current) return;
		(t.preventDefault(), t.stopPropagation());
		const e = this.opts.ref.current,
			s = this.getAllThumbs()[0];
		if (!e || !s) return;
		s.focus();
		const { left: n, right: r, top: i, bottom: o } = e.getBoundingClientRect();
		this.direction === 'lr'
			? this.applyPosition({ clientXY: t.clientX, start: n, end: r })
			: this.direction === 'rl'
				? this.applyPosition({ clientXY: t.clientX, start: r, end: n })
				: this.direction === 'bt'
					? this.applyPosition({ clientXY: t.clientY, start: o, end: i })
					: this.direction === 'tb' &&
						this.applyPosition({ clientXY: t.clientY, start: i, end: o });
	};
	handlePointerDown = (t) => {
		if (t.button !== 0 || this.opts.disabled.current) return;
		const e = this.opts.ref.current,
			s = this.getAllThumbs()[0];
		if (!s || !e) return;
		const n = t.composedPath()[0] ?? t.target;
		!gt(n) ||
			!e.contains(n) ||
			(t.preventDefault(), s.focus(), (this.isActive = !0), this.handlePointerMove(t));
	};
	handlePointerUp = () => {
		this.opts.disabled.current ||
			(this.isActive && this.opts.onValueCommit.current(K(() => this.opts.value.current)),
			(this.isActive = !1));
	};
	#e = m(() => {
		const t = this.opts.value.current;
		return Array.from({ length: 1 }, () => {
			const e = t,
				s = this.getPositionFromValue(e),
				n = _t(this.direction, s);
			return {
				role: 'slider',
				'aria-valuemin': this.opts.min.current,
				'aria-valuemax': this.opts.max.current,
				'aria-valuenow': e,
				'aria-disabled': ft(this.opts.disabled.current),
				'aria-orientation': this.opts.orientation.current,
				'data-value': e,
				'data-orientation': this.opts.orientation.current,
				style: n,
				[I.thumb]: ''
			};
		});
	});
	get thumbsPropsArr() {
		return u(this.#e);
	}
	set thumbsPropsArr(t) {
		b(this.#e, t);
	}
	#t = m(() => this.thumbsPropsArr.map((t, e) => e));
	get thumbsRenderArr() {
		return u(this.#t);
	}
	set thumbsRenderArr(t) {
		b(this.#t, t);
	}
	#s = m(() => {
		const t = this.normalizedSteps,
			e = this.opts.value.current;
		return t.map((s, n) => {
			const r = this.getPositionFromValue(s),
				i = n === 0,
				o = n === t.length - 1,
				a = i ? 0 : o ? -100 : -50,
				l = wt(this.direction, r, a),
				p = s <= e;
			return {
				'data-disabled': U(this.opts.disabled.current),
				'data-orientation': this.opts.orientation.current,
				'data-bounded': p ? '' : void 0,
				'data-value': s,
				'data-selected': this.isTickValueSelected(s) ? '' : void 0,
				style: l,
				[I.tick]: ''
			};
		});
	});
	get ticksPropsArr() {
		return u(this.#s);
	}
	set ticksPropsArr(t) {
		b(this.#s, t);
	}
	#n = m(() => this.ticksPropsArr.map((t, e) => e));
	get ticksRenderArr() {
		return u(this.#n);
	}
	set ticksRenderArr(t) {
		b(this.#n, t);
	}
	#r = m(() => this.ticksPropsArr.map((t, e) => ({ value: t['data-value'], index: e })));
	get tickItemsArr() {
		return u(this.#r);
	}
	set tickItemsArr(t) {
		b(this.#r, t);
	}
	#i = m(() => [{ value: this.opts.value.current, index: 0 }]);
	get thumbItemsArr() {
		return u(this.#i);
	}
	set thumbItemsArr(t) {
		b(this.#i, t);
	}
	#o = m(() => ({
		ticks: this.ticksRenderArr,
		thumbs: this.thumbsRenderArr,
		tickItems: this.tickItemsArr,
		thumbItems: this.thumbItemsArr
	}));
	get snippetProps() {
		return u(this.#o);
	}
	set snippetProps(t) {
		b(this.#o, t);
	}
}
class Bt extends Tt {
	opts;
	isMulti = !0;
	#e = ot(null);
	get activeThumb() {
		return u(this.#e);
	}
	set activeThumb(t) {
		b(this.#e, t, !0);
	}
	#t = ot(0);
	get currentThumbIdx() {
		return u(this.#t);
	}
	set currentThumbIdx(t) {
		b(this.#t, t, !0);
	}
	constructor(t) {
		(super(t),
			(this.opts = t),
			vt(() =>
				bt(
					R(this.domContext.getDocument(), 'pointerdown', this.handlePointerDown),
					R(this.domContext.getDocument(), 'pointerup', this.handlePointerUp),
					R(this.domContext.getDocument(), 'pointermove', this.handlePointerMove),
					R(this.domContext.getDocument(), 'pointerleave', this.handlePointerUp)
				)
			),
			at(
				[
					() => this.opts.step.current,
					() => this.opts.min.current,
					() => this.opts.max.current,
					() => this.opts.value.current
				],
				([e, s, n, r]) => {
					const i = lt(e, s, n),
						o = (l) => i.includes(l),
						a = (l) => O(l, i);
					r.some((l) => !o(l)) && (this.opts.value.current = r.map(a));
				}
			));
	}
	isTickValueSelected = (t) => this.opts.value.current.includes(t);
	isThumbActive(t) {
		return this.isActive && this.activeThumb?.idx === t;
	}
	applyPosition({ clientXY: t, activeThumbIdx: e, start: s, end: n }) {
		const r = this.opts.min.current,
			i = this.opts.max.current,
			a = ((t - s) / (n - s)) * (i - r) + r;
		if (a < r) this.updateValue(r, e);
		else if (a > i) this.updateValue(i, e);
		else {
			const l = this.normalizedSteps,
				p = O(a, l);
			this.updateValue(p, e);
		}
	}
	#s = (t) => {
		const e = this.getAllThumbs();
		if (!e.length) return;
		for (const i of e) i.blur();
		const s = e.map((i) => {
				if (this.opts.orientation.current === 'horizontal') {
					const { left: o, right: a } = i.getBoundingClientRect();
					return Math.abs(t.clientX - (o + a) / 2);
				} else {
					const { top: o, bottom: a } = i.getBoundingClientRect();
					return Math.abs(t.clientY - (o + a) / 2);
				}
			}),
			n = e[s.indexOf(Math.min(...s))],
			r = e.indexOf(n);
		return { node: n, idx: r };
	};
	handlePointerMove = (t) => {
		if (!this.isActive || this.opts.disabled.current) return;
		(t.preventDefault(), t.stopPropagation());
		const e = this.opts.ref.current,
			s = this.activeThumb;
		if (!e || !s) return;
		s.node.focus();
		const { left: n, right: r, top: i, bottom: o } = e.getBoundingClientRect(),
			a = this.direction;
		a === 'lr'
			? this.applyPosition({ clientXY: t.clientX, activeThumbIdx: s.idx, start: n, end: r })
			: a === 'rl'
				? this.applyPosition({ clientXY: t.clientX, activeThumbIdx: s.idx, start: r, end: n })
				: a === 'bt'
					? this.applyPosition({ clientXY: t.clientY, activeThumbIdx: s.idx, start: o, end: i })
					: a === 'tb' &&
						this.applyPosition({ clientXY: t.clientY, activeThumbIdx: s.idx, start: i, end: o });
	};
	handlePointerDown = (t) => {
		if (t.button !== 0 || this.opts.disabled.current) return;
		const e = this.opts.ref.current,
			s = this.#s(t);
		if (!s || !e) return;
		const n = t.composedPath()[0] ?? t.target;
		!gt(n) ||
			!e.contains(n) ||
			(t.preventDefault(),
			(this.activeThumb = s),
			s.node.focus(),
			(this.isActive = !0),
			this.handlePointerMove(t));
	};
	handlePointerUp = () => {
		this.opts.disabled.current ||
			(this.isActive && this.opts.onValueCommit.current(K(() => this.opts.value.current)),
			(this.isActive = !1));
	};
	getAllThumbs = () => {
		const t = this.opts.ref.current;
		return t ? Array.from(t.querySelectorAll(I.selector('thumb'))) : [];
	};
	updateValue = (t, e) => {
		const s = this.opts.value.current;
		if (!s.length) {
			this.opts.value.current.push(t);
			return;
		}
		if (s[e] === t) return;
		const r = [...s];
		if (!Nt(e, r)) return;
		const i = r[e] > t ? -1 : 1,
			o = () => {
				const l = e + i;
				((r[e] = r[l]), (r[l] = t));
				const p = this.getAllThumbs();
				p.length && (p[l]?.focus(), (this.activeThumb = { node: p[l], idx: l }));
			};
		if (this.opts.autoSort.current && ((i === -1 && t < r[e - 1]) || (i === 1 && t > r[e + 1]))) {
			(o(), (this.opts.value.current = r));
			return;
		}
		const a = this.normalizedSteps;
		((r[e] = O(t, a)), (this.opts.value.current = r));
	};
	#n = m(() => {
		const t = this.opts.value.current;
		return Array.from({ length: t.length || 1 }, (e, s) => {
			const n = K(() => this.currentThumbIdx);
			n < t.length &&
				K(() => {
					this.currentThumbIdx = n + 1;
				});
			const r = t[s],
				i = this.getPositionFromValue(r ?? 0),
				o = _t(this.direction, i);
			return {
				role: 'slider',
				'aria-valuemin': this.opts.min.current,
				'aria-valuemax': this.opts.max.current,
				'aria-valuenow': r,
				'aria-disabled': ft(this.opts.disabled.current),
				'aria-orientation': this.opts.orientation.current,
				'data-value': r,
				'data-orientation': this.opts.orientation.current,
				style: o,
				[I.thumb]: ''
			};
		});
	});
	get thumbsPropsArr() {
		return u(this.#n);
	}
	set thumbsPropsArr(t) {
		b(this.#n, t);
	}
	#r = m(() => this.thumbsPropsArr.map((t, e) => e));
	get thumbsRenderArr() {
		return u(this.#r);
	}
	set thumbsRenderArr(t) {
		b(this.#r, t);
	}
	#i = m(() => {
		const t = this.normalizedSteps,
			e = this.opts.value.current;
		return t.map((s, n) => {
			const r = this.getPositionFromValue(s),
				i = n === 0,
				o = n === t.length - 1,
				a = i ? 0 : o ? -100 : -50,
				l = wt(this.direction, r, a),
				p = e.length === 1 ? s <= e[0] : e[0] <= s && s <= e[e.length - 1];
			return {
				'data-disabled': U(this.opts.disabled.current),
				'data-orientation': this.opts.orientation.current,
				'data-bounded': p ? '' : void 0,
				'data-value': s,
				style: l,
				[I.tick]: ''
			};
		});
	});
	get ticksPropsArr() {
		return u(this.#i);
	}
	set ticksPropsArr(t) {
		b(this.#i, t);
	}
	#o = m(() => this.ticksPropsArr.map((t, e) => e));
	get ticksRenderArr() {
		return u(this.#o);
	}
	set ticksRenderArr(t) {
		b(this.#o, t);
	}
	#a = m(() => this.ticksPropsArr.map((t, e) => ({ value: t['data-value'], index: e })));
	get tickItemsArr() {
		return u(this.#a);
	}
	set tickItemsArr(t) {
		b(this.#a, t);
	}
	#l = m(() => this.opts.value.current.map((e, s) => ({ value: e, index: s })));
	get thumbItemsArr() {
		return u(this.#l);
	}
	set thumbItemsArr(t) {
		b(this.#l, t);
	}
	#c = m(() => ({
		ticks: this.ticksRenderArr,
		thumbs: this.thumbsRenderArr,
		tickItems: this.tickItemsArr,
		thumbItems: this.thumbItemsArr
	}));
	get snippetProps() {
		return u(this.#c);
	}
	set snippetProps(t) {
		b(this.#c, t);
	}
}
class Ht {
	static create(t) {
		const { type: e, ...s } = t,
			n = e === 'single' ? new Ut(s) : new Bt(s);
		return tt.set(n);
	}
}
const Kt = [xt, At, yt, Pt, St, kt];
class ct {
	static create(t) {
		return new ct(t, tt.get());
	}
	opts;
	root;
	attachment;
	constructor(t, e) {
		((this.opts = t), (this.root = e), (this.attachment = Q(t.ref)));
	}
	#e = m(() => {
		if (Array.isArray(this.root.opts.value.current)) {
			const t =
					this.root.opts.value.current.length > 1
						? this.root.getPositionFromValue(Math.min(...this.root.opts.value.current) ?? 0)
						: 0,
				e = 100 - this.root.getPositionFromValue(Math.max(...this.root.opts.value.current) ?? 0);
			return { position: 'absolute', ...mt(this.root.direction, t, e) };
		} else {
			const t = this.root.opts.trackPadding?.current,
				e = this.root.opts.value.current,
				s = this.root.opts.max.current,
				n = 0,
				r = t !== void 0 && t > 0 && e === s ? 0 : 100 - this.root.getPositionFromValue(e);
			return { position: 'absolute', ...mt(this.root.direction, n, r) };
		}
	});
	get rangeStyles() {
		return u(this.#e);
	}
	set rangeStyles(t) {
		b(this.#e, t);
	}
	#t = m(() => ({
		id: this.opts.id.current,
		'data-orientation': this.root.opts.orientation.current,
		'data-disabled': U(this.root.opts.disabled.current),
		style: this.rangeStyles,
		[I.range]: '',
		...this.attachment
	}));
	get props() {
		return u(this.#t);
	}
	set props(t) {
		b(this.#t, t);
	}
}
class ut {
	static create(t) {
		return new ut(t, tt.get());
	}
	opts;
	root;
	attachment;
	#e = m(() => this.root.opts.disabled.current || this.opts.disabled.current);
	constructor(t, e) {
		((this.opts = t),
			(this.root = e),
			(this.attachment = Q(t.ref)),
			(this.onkeydown = this.onkeydown.bind(this)));
	}
	#t(t) {
		this.root.isMulti
			? this.root.updateValue(t, this.opts.index.current)
			: this.root.updateValue(t);
	}
	onkeydown(t) {
		if (u(this.#e)) return;
		const e = this.opts.ref.current;
		if (!e) return;
		const s = this.root.getAllThumbs();
		if (!s.length) return;
		const n = s.indexOf(e);
		if ((this.root.isMulti && (this.root.currentThumbIdx = n), !Kt.includes(t.key))) return;
		t.preventDefault();
		const r = this.root.opts.min.current,
			i = this.root.opts.max.current,
			o = this.root.opts.value.current,
			a = Array.isArray(o) ? o[n] : o,
			l = this.root.opts.orientation.current,
			p = this.root.direction,
			v = this.root.normalizedSteps;
		switch (t.key) {
			case St:
				this.#t(r);
				break;
			case kt:
				this.#t(i);
				break;
			case xt:
				if (l !== 'horizontal') break;
				if (t.metaKey) {
					const d = p === 'rl' ? i : r;
					this.#t(d);
				} else {
					const h = H(a, v, p === 'rl' ? 'next' : 'prev');
					this.#t(h);
				}
				break;
			case At:
				if (l !== 'horizontal') break;
				if (t.metaKey) {
					const d = p === 'rl' ? r : i;
					this.#t(d);
				} else {
					const h = H(a, v, p === 'rl' ? 'prev' : 'next');
					this.#t(h);
				}
				break;
			case yt:
				if (t.metaKey) {
					const d = p === 'tb' ? r : i;
					this.#t(d);
				} else {
					const h = H(a, v, p === 'tb' ? 'prev' : 'next');
					this.#t(h);
				}
				break;
			case Pt:
				if (t.metaKey) {
					const d = p === 'tb' ? i : r;
					this.#t(d);
				} else {
					const h = H(a, v, p === 'tb' ? 'next' : 'prev');
					this.#t(h);
				}
				break;
		}
		this.root.opts.onValueCommit.current(this.root.opts.value.current);
	}
	#s = m(() => ({
		...this.root.thumbsPropsArr[this.opts.index.current],
		id: this.opts.id.current,
		onkeydown: this.onkeydown,
		'data-active': this.root.isThumbActive(this.opts.index.current) ? '' : void 0,
		'data-disabled': U(this.opts.disabled.current || this.root.opts.disabled.current),
		tabindex: this.opts.disabled.current || this.root.opts.disabled.current ? -1 : 0,
		...this.attachment
	}));
	get props() {
		return u(this.#s);
	}
	set props(t) {
		b(this.#s, t);
	}
}
class dt {
	static create(t) {
		return new dt(t, tt.get());
	}
	opts;
	root;
	attachment;
	constructor(t, e) {
		((this.opts = t), (this.root = e), (this.attachment = Q(t.ref)));
	}
	#e = m(() => ({
		...this.root.ticksPropsArr[this.opts.index.current],
		id: this.opts.id.current,
		...this.attachment
	}));
	get props() {
		return u(this.#e);
	}
	set props(t) {
		b(this.#e, t);
	}
}
var Lt = C('<span><!></span>');
function qt(c, t) {
	const e = q();
	F(t, !0);
	let s = x(t, 'id', 19, () => Z(e)),
		n = x(t, 'ref', 15, null),
		r = x(t, 'value', 15),
		i = x(t, 'onValueChange', 3, pt),
		o = x(t, 'onValueCommit', 3, pt),
		a = x(t, 'disabled', 3, !1),
		l = x(t, 'step', 3, 1),
		p = x(t, 'dir', 3, 'ltr'),
		v = x(t, 'autoSort', 3, !0),
		d = x(t, 'orientation', 3, 'horizontal'),
		h = x(t, 'thumbPositioning', 3, 'contain'),
		f = j(t, [
			'$$slots',
			'$$events',
			'$$legacy',
			'children',
			'child',
			'id',
			'ref',
			'value',
			'type',
			'onValueChange',
			'onValueCommit',
			'disabled',
			'min',
			'max',
			'step',
			'dir',
			'autoSort',
			'orientation',
			'thumbPositioning',
			'trackPadding'
		]);
	const P = m(() => (t.min !== void 0 ? t.min : Array.isArray(l()) ? Math.min(...l()) : 0)),
		_ = m(() => (t.max !== void 0 ? t.max : Array.isArray(l()) ? Math.max(...l()) : 100));
	function S() {
		if (r() === void 0) return t.type === 'single' ? u(P) : [];
	}
	(S(),
		at.pre(
			() => r(),
			() => {
				S();
			}
		));
	const T = Ht.create({
			id: g(() => s()),
			ref: g(
				() => n(),
				(w) => n(w)
			),
			value: g(
				() => r(),
				(w) => {
					(r(w), i()(w));
				}
			),
			onValueCommit: g(() => o()),
			disabled: g(() => a()),
			min: g(() => u(P)),
			max: g(() => u(_)),
			step: g(() => l()),
			dir: g(() => p()),
			autoSort: g(() => v()),
			orientation: g(() => d()),
			thumbPositioning: g(() => h()),
			type: t.type,
			trackPadding: g(() => t.trackPadding)
		}),
		y = m(() => $(f, T.props));
	var Y = V(),
		X = k(Y);
	{
		var It = (w) => {
				var N = V(),
					et = k(N);
				{
					let Dt = m(() => ({ props: u(y), ...T.snippetProps }));
					D(
						et,
						() => t.child,
						() => u(Dt)
					);
				}
				A(w, N);
			},
			Vt = (w) => {
				var N = Lt();
				J(N, () => ({ ...u(y) }));
				var et = z(N);
				(D(
					et,
					() => t.children ?? M,
					() => T.snippetProps
				),
					A(w, N));
			};
		G(X, (w) => {
			t.child ? w(It) : w(Vt, !1);
		});
	}
	(A(c, Y), E());
}
var Gt = C('<span><!></span>');
function jt(c, t) {
	const e = q();
	F(t, !0);
	let s = x(t, 'ref', 15, null),
		n = x(t, 'id', 19, () => Z(e)),
		r = j(t, ['$$slots', '$$events', '$$legacy', 'children', 'child', 'ref', 'id']);
	const i = ct.create({
			id: g(() => n()),
			ref: g(
				() => s(),
				(d) => s(d)
			)
		}),
		o = m(() => $(r, i.props));
	var a = V(),
		l = k(a);
	{
		var p = (d) => {
				var h = V(),
					f = k(h);
				(D(
					f,
					() => t.child,
					() => ({ props: u(o) })
				),
					A(d, h));
			},
			v = (d) => {
				var h = Gt();
				J(h, () => ({ ...u(o) }));
				var f = z(h);
				(D(f, () => t.children ?? M), A(d, h));
			};
		G(l, (d) => {
			t.child ? d(p) : d(v, !1);
		});
	}
	(A(c, a), E());
}
var Jt = C('<span><!></span>');
function Qt(c, t) {
	const e = q();
	F(t, !0);
	let s = x(t, 'ref', 15, null),
		n = x(t, 'id', 19, () => Z(e)),
		r = x(t, 'disabled', 3, !1),
		i = j(t, [
			'$$slots',
			'$$events',
			'$$legacy',
			'children',
			'child',
			'ref',
			'id',
			'index',
			'disabled'
		]);
	const o = ut.create({
			id: g(() => n()),
			ref: g(
				() => s(),
				(h) => s(h)
			),
			index: g(() => t.index),
			disabled: g(() => r())
		}),
		a = m(() => $(i, o.props));
	var l = V(),
		p = k(l);
	{
		var v = (h) => {
				var f = V(),
					P = k(f);
				{
					let _ = m(() => ({ active: o.root.isThumbActive(o.opts.index.current), props: u(a) }));
					D(
						P,
						() => t.child,
						() => u(_)
					);
				}
				A(h, f);
			},
			d = (h) => {
				var f = Jt();
				J(f, () => ({ ...u(a) }));
				var P = z(f);
				{
					let _ = m(() => ({ active: o.root.isThumbActive(o.opts.index.current) }));
					D(
						P,
						() => t.children ?? M,
						() => u(_)
					);
				}
				A(h, f);
			};
		G(p, (h) => {
			t.child ? h(v) : h(d, !1);
		});
	}
	(A(c, l), E());
}
var Zt = C('<span><!></span>');
function $t(c, t) {
	const e = q();
	F(t, !0);
	let s = x(t, 'ref', 15, null),
		n = x(t, 'id', 19, () => Z(e)),
		r = j(t, ['$$slots', '$$events', '$$legacy', 'children', 'child', 'ref', 'id', 'index']);
	const i = dt.create({
			id: g(() => n()),
			ref: g(
				() => s(),
				(d) => s(d)
			),
			index: g(() => t.index)
		}),
		o = m(() => $(r, i.props));
	var a = V(),
		l = k(a);
	{
		var p = (d) => {
				var h = V(),
					f = k(h);
				(D(
					f,
					() => t.child,
					() => ({ props: u(o) })
				),
					A(d, h));
			},
			v = (d) => {
				var h = Zt();
				J(h, () => ({ ...u(o) }));
				var f = z(h);
				(D(f, () => t.children ?? M), A(d, h));
			};
		G(l, (d) => {
			t.child ? d(p) : d(v, !1);
		});
	}
	(A(c, a), E());
}
const L = qt,
	rt = jt,
	nt = Qt,
	te = $t,
	ee = {
		component: L,
		title: 'Design System/Atoms/Slider',
		tags: ['autodocs'],
		argTypes: {
			value: { control: { type: 'array' }, description: 'Slider value(s)' },
			min: { control: { type: 'number' }, description: 'Minimum value' },
			max: { control: { type: 'number' }, description: 'Maximum value' },
			step: { control: { type: 'number' }, description: 'Step value' }
		}
	},
	{ Story: it } = zt();
var se = C(
		'<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-base"><!></span> <!>',
		1
	),
	re = C(
		'<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-base"><!></span> <!>',
		1
	),
	ne = C(
		'<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-base"><!></span> <!> <!>',
		1
	),
	ie = C('<!> <!> <!>', 1);
function Rt(c, t) {
	(F(t, !1), Mt());
	var e = ie(),
		s = k(e);
	it(s, {
		name: 'Default',
		args: { value: [50], min: 0, max: 100, step: 1 },
		template: (o, a = M) => {
			L(
				o,
				st(a, {
					type: 'single',
					class: 'relative flex w-full touch-none items-center select-none',
					children: (p, v) => {
						let d = () => v?.().thumbItems;
						var h = se(),
							f = k(h),
							P = z(f);
						rt(P, { class: 'absolute h-full bg-accent-primary' });
						var _ = W(f, 2);
						(B(
							_,
							1,
							d,
							({ index: S }) => S,
							(S, T) => {
								let y = () => u(T).index;
								nt(S, {
									get index() {
										return y();
									},
									class:
										'ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
								});
							}
						),
							A(p, h));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Slider.Root
	{...args}
	type="single"
	class="relative flex w-full touch-none items-center select-none"
>
	{#snippet children({ thumbItems })}
		<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-base">
			<Slider.Range class="absolute h-full bg-accent-primary" />
		</span>
		{#each thumbItems as { index } (index)}
			<Slider.Thumb
				{index}
				class="ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</Slider.Root>`
			}
		}
	});
	var n = W(s, 2);
	it(n, {
		name: 'Range',
		args: { value: [25, 75], min: 0, max: 100, step: 1 },
		template: (o, a = M) => {
			L(
				o,
				st(a, {
					type: 'multiple',
					class: 'relative flex w-full touch-none items-center select-none',
					children: (p, v) => {
						let d = () => v?.().thumbItems;
						var h = re(),
							f = k(h),
							P = z(f);
						rt(P, { class: 'absolute h-full bg-accent-primary' });
						var _ = W(f, 2);
						(B(
							_,
							1,
							d,
							({ index: S }) => S,
							(S, T) => {
								let y = () => u(T).index;
								nt(S, {
									get index() {
										return y();
									},
									class:
										'ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
								});
							}
						),
							A(p, h));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Slider.Root
	{...args}
	type="multiple"
	class="relative flex w-full touch-none items-center select-none"
>
	{#snippet children({ thumbItems })}
		<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-base">
			<Slider.Range class="absolute h-full bg-accent-primary" />
		</span>
		{#each thumbItems as { index } (index)}
			<Slider.Thumb
				{index}
				class="ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</Slider.Root>`
			}
		}
	});
	var r = W(n, 2);
	(it(r, {
		name: 'With Ticks',
		args: { value: [50], min: 0, max: 100, step: 10 },
		template: (o, a = M) => {
			L(
				o,
				st(a, {
					type: 'single',
					class: 'relative flex w-full touch-none items-center select-none',
					children: (p, v) => {
						let d = () => v?.().thumbItems,
							h = () => v?.().tickItems;
						var f = ne(),
							P = k(f),
							_ = z(P);
						rt(_, { class: 'absolute h-full bg-accent-primary' });
						var S = W(P, 2);
						B(
							S,
							1,
							d,
							({ index: y }) => y,
							(y, Y) => {
								let X = () => u(Y).index;
								nt(y, {
									get index() {
										return X();
									},
									class:
										'ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
								});
							}
						);
						var T = W(S, 2);
						(B(
							T,
							1,
							h,
							({ index: y }) => y,
							(y, Y) => {
								let X = () => u(Y).index;
								te(y, {
									get index() {
										return X();
									},
									class:
										'absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-base'
								});
							}
						),
							A(p, f));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Slider.Root
	{...args}
	type="single"
	class="relative flex w-full touch-none items-center select-none"
>
	{#snippet children({ thumbItems, tickItems })}
		<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-base">
			<Slider.Range class="absolute h-full bg-accent-primary" />
		</span>
		{#each thumbItems as { index } (index)}
			<Slider.Thumb
				{index}
				class="ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
		{#each tickItems as { index } (index)}
			<Slider.Tick
				{index}
				class="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-base"
			/>
		{/each}
	{/snippet}
</Slider.Root>`
			}
		}
	}),
		A(c, e),
		E());
}
Rt.__docgen = { data: [], name: 'Slider.stories.svelte' };
const ht = Ct(Rt, ee),
	Se = ['Default', 'Range', 'WithTicks'],
	ke = { ...ht.Default, tags: ['svelte-csf-v5'] },
	_e = { ...ht.Range, tags: ['svelte-csf-v5'] },
	we = { ...ht.WithTicks, tags: ['svelte-csf-v5'] };
export { ke as Default, _e as Range, we as WithTicks, Se as __namedExportsOrder, ee as default };
