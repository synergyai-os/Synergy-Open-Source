import { b as w } from './DjvPQNYr.js';
import { c as W } from './LC4C1fji.js';
import { o as C } from './ClEwQIZJ.js';
import {
	aY as N,
	j as k,
	Y as $,
	T as M,
	U,
	V as B,
	bd as G,
	am as R,
	an as H,
	ag as V,
	a1 as D,
	$ as v
} from './kOT-I_MI.js';
function X() {
	return Symbol(N);
}
function Y(t) {
	return typeof t == 'function';
}
function K(t) {
	return t !== null && typeof t == 'object';
}
const z = ['string', 'number', 'bigint', 'boolean'];
function S(t) {
	return t == null || z.includes(typeof t)
		? !0
		: Array.isArray(t)
			? t.every((n) => S(n))
			: typeof t == 'object'
				? Object.getPrototypeOf(t) === Object.prototype
				: !1;
}
const b = Symbol('box'),
	T = Symbol('is-writable');
function Z(t, n) {
	const e = $(t);
	return n
		? {
				[b]: !0,
				[T]: !0,
				get current() {
					return k(e);
				},
				set current(o) {
					n(o);
				}
			}
		: {
				[b]: !0,
				get current() {
					return t();
				}
			};
}
function A(t) {
	return K(t) && b in t;
}
function P(t) {
	return A(t) && T in t;
}
function Nt(t) {
	return A(t) ? t : Y(t) ? Z(t) : q(t);
}
function $t(t) {
	return Object.entries(t).reduce(
		(n, [e, o]) =>
			A(o)
				? (P(o)
						? Object.defineProperty(n, e, {
								get() {
									return o.current;
								},
								set(r) {
									o.current = r;
								}
							})
						: Object.defineProperty(n, e, {
								get() {
									return o.current;
								}
							}),
					n)
				: Object.assign(n, { [e]: o }),
		{}
	);
}
function Mt(t) {
	return P(t)
		? {
				[b]: !0,
				get current() {
					return t.current;
				}
			}
		: t;
}
function q(t) {
	let n = M(U(t));
	return {
		[b]: !0,
		[T]: !0,
		get current() {
			return k(n);
		},
		set current(e) {
			B(n, e, !0);
		}
	};
}
function J(...t) {
	return function (n) {
		for (const e of t)
			if (e) {
				if (n.defaultPrevented) return;
				typeof e == 'function' ? e.call(this, n) : e.current?.call(this, n);
			}
	};
}
var O = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g,
	Q = /\n/g,
	tt = /^\s*/,
	nt = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/,
	et = /^:\s*/,
	ot = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/,
	rt = /^[;\s]*/,
	st = /^\s+|\s+$/g,
	it = `
`,
	F = '/',
	_ = '*',
	m = '',
	ct = 'comment',
	at = 'declaration';
function ut(t, n) {
	if (typeof t != 'string') throw new TypeError('First argument must be a string');
	if (!t) return [];
	n = n || {};
	var e = 1,
		o = 1;
	function r(a) {
		var s = a.match(Q);
		s && (e += s.length);
		var d = a.lastIndexOf(it);
		o = ~d ? a.length - d : o + a.length;
	}
	function i() {
		var a = { line: e, column: o };
		return function (s) {
			return ((s.position = new c(a)), f(), s);
		};
	}
	function c(a) {
		((this.start = a), (this.end = { line: e, column: o }), (this.source = n.source));
	}
	c.prototype.content = t;
	function u(a) {
		var s = new Error(n.source + ':' + e + ':' + o + ': ' + a);
		if (
			((s.reason = a),
			(s.filename = n.source),
			(s.line = e),
			(s.column = o),
			(s.source = t),
			!n.silent)
		)
			throw s;
	}
	function l(a) {
		var s = a.exec(t);
		if (s) {
			var d = s[0];
			return (r(d), (t = t.slice(d.length)), s);
		}
	}
	function f() {
		l(tt);
	}
	function p(a) {
		var s;
		for (a = a || []; (s = g()); ) s !== !1 && a.push(s);
		return a;
	}
	function g() {
		var a = i();
		if (!(F != t.charAt(0) || _ != t.charAt(1))) {
			for (var s = 2; m != t.charAt(s) && (_ != t.charAt(s) || F != t.charAt(s + 1)); ) ++s;
			if (((s += 2), m === t.charAt(s - 1))) return u('End of comment missing');
			var d = t.slice(2, s - 2);
			return ((o += 2), r(d), (t = t.slice(s)), (o += 2), a({ type: ct, comment: d }));
		}
	}
	function E() {
		var a = i(),
			s = l(nt);
		if (s) {
			if ((g(), !l(et))) return u("property missing ':'");
			var d = l(ot),
				L = a({ type: at, property: x(s[0].replace(O, m)), value: d ? x(d[0].replace(O, m)) : m });
			return (l(rt), L);
		}
	}
	function h() {
		var a = [];
		p(a);
		for (var s; (s = E()); ) s !== !1 && (a.push(s), p(a));
		return a;
	}
	return (f(), h());
}
function x(t) {
	return t ? t.replace(st, m) : m;
}
function ft(t, n) {
	let e = null;
	if (!t || typeof t != 'string') return e;
	const o = ut(t),
		r = typeof n == 'function';
	return (
		o.forEach((i) => {
			if (i.type !== 'declaration') return;
			const { property: c, value: u } = i;
			r ? n(c, u, i) : u && ((e = e || {}), (e[c] = u));
		}),
		e
	);
}
const lt = /\d/,
	pt = ['-', '_', '/', '.'];
function dt(t = '') {
	if (!lt.test(t)) return t !== t.toLowerCase();
}
function ht(t) {
	const n = [];
	let e = '',
		o,
		r;
	for (const i of t) {
		const c = pt.includes(i);
		if (c === !0) {
			(n.push(e), (e = ''), (o = void 0));
			continue;
		}
		const u = dt(i);
		if (r === !1) {
			if (o === !1 && u === !0) {
				(n.push(e), (e = i), (o = u));
				continue;
			}
			if (o === !0 && u === !1 && e.length > 1) {
				const l = e.at(-1);
				(n.push(e.slice(0, Math.max(0, e.length - 1))), (e = l + i), (o = u));
				continue;
			}
		}
		((e += i), (o = u), (r = c));
	}
	return (n.push(e), n);
}
function I(t) {
	return t
		? ht(t)
				.map((n) => gt(n))
				.join('')
		: '';
}
function mt(t) {
	return Et(I(t || ''));
}
function gt(t) {
	return t ? t[0].toUpperCase() + t.slice(1) : '';
}
function Et(t) {
	return t ? t[0].toLowerCase() + t.slice(1) : '';
}
function y(t) {
	if (!t) return {};
	const n = {};
	function e(o, r) {
		if (
			o.startsWith('-moz-') ||
			o.startsWith('-webkit-') ||
			o.startsWith('-ms-') ||
			o.startsWith('-o-')
		) {
			n[I(o)] = r;
			return;
		}
		if (o.startsWith('--')) {
			n[o] = r;
			return;
		}
		n[mt(o)] = r;
	}
	return (ft(t, e), n);
}
function bt(...t) {
	return (...n) => {
		for (const e of t) typeof e == 'function' && e(...n);
	};
}
function yt(t, n) {
	const e = RegExp(t, 'g');
	return (o) => {
		if (typeof o != 'string')
			throw new TypeError(`expected an argument of type string, but got ${typeof o}`);
		return o.match(e) ? o.replace(e, n) : o;
	};
}
const At = yt(/[A-Z]/, (t) => `-${t.toLowerCase()}`);
function wt(t) {
	if (!t || typeof t != 'object' || Array.isArray(t))
		throw new TypeError(`expected an argument of type object, but got ${typeof t}`);
	return Object.keys(t).map((n) => `${At(n)}: ${t[n]};`).join(`
`);
}
function vt(t = {}) {
	return wt(t).replace(
		`
`,
		' '
	);
}
const St = [
		'onabort',
		'onanimationcancel',
		'onanimationend',
		'onanimationiteration',
		'onanimationstart',
		'onauxclick',
		'onbeforeinput',
		'onbeforetoggle',
		'onblur',
		'oncancel',
		'oncanplay',
		'oncanplaythrough',
		'onchange',
		'onclick',
		'onclose',
		'oncompositionend',
		'oncompositionstart',
		'oncompositionupdate',
		'oncontextlost',
		'oncontextmenu',
		'oncontextrestored',
		'oncopy',
		'oncuechange',
		'oncut',
		'ondblclick',
		'ondrag',
		'ondragend',
		'ondragenter',
		'ondragleave',
		'ondragover',
		'ondragstart',
		'ondrop',
		'ondurationchange',
		'onemptied',
		'onended',
		'onerror',
		'onfocus',
		'onfocusin',
		'onfocusout',
		'onformdata',
		'ongotpointercapture',
		'oninput',
		'oninvalid',
		'onkeydown',
		'onkeypress',
		'onkeyup',
		'onload',
		'onloadeddata',
		'onloadedmetadata',
		'onloadstart',
		'onlostpointercapture',
		'onmousedown',
		'onmouseenter',
		'onmouseleave',
		'onmousemove',
		'onmouseout',
		'onmouseover',
		'onmouseup',
		'onpaste',
		'onpause',
		'onplay',
		'onplaying',
		'onpointercancel',
		'onpointerdown',
		'onpointerenter',
		'onpointerleave',
		'onpointermove',
		'onpointerout',
		'onpointerover',
		'onpointerup',
		'onprogress',
		'onratechange',
		'onreset',
		'onresize',
		'onscroll',
		'onscrollend',
		'onsecuritypolicyviolation',
		'onseeked',
		'onseeking',
		'onselect',
		'onselectionchange',
		'onselectstart',
		'onslotchange',
		'onstalled',
		'onsubmit',
		'onsuspend',
		'ontimeupdate',
		'ontoggle',
		'ontouchcancel',
		'ontouchend',
		'ontouchmove',
		'ontouchstart',
		'ontransitioncancel',
		'ontransitionend',
		'ontransitionrun',
		'ontransitionstart',
		'onvolumechange',
		'onwaiting',
		'onwebkitanimationend',
		'onwebkitanimationiteration',
		'onwebkitanimationstart',
		'onwebkittransitionend',
		'onwheel'
	],
	Tt = new Set(St);
function Ct(t) {
	return Tt.has(t);
}
function Ut(...t) {
	const n = { ...t[0] };
	for (let e = 1; e < t.length; e++) {
		const o = t[e];
		if (o) {
			for (const r of Object.keys(o)) {
				const i = n[r],
					c = o[r],
					u = typeof i == 'function',
					l = typeof c == 'function';
				if (u && Ct(r)) {
					const f = i,
						p = c;
					n[r] = J(f, p);
				} else if (u && l) n[r] = bt(i, c);
				else if (r === 'class') {
					const f = S(i),
						p = S(c);
					f && p ? (n[r] = w(i, c)) : f ? (n[r] = w(i)) : p && (n[r] = w(c));
				} else if (r === 'style') {
					const f = typeof i == 'object',
						p = typeof c == 'object',
						g = typeof i == 'string',
						E = typeof c == 'string';
					if (f && p) n[r] = { ...i, ...c };
					else if (f && E) {
						const h = y(c);
						n[r] = { ...i, ...h };
					} else if (g && p) {
						const h = y(i);
						n[r] = { ...h, ...c };
					} else if (g && E) {
						const h = y(i),
							a = y(c);
						n[r] = { ...h, ...a };
					} else f ? (n[r] = i) : p ? (n[r] = c) : g ? (n[r] = i) : E && (n[r] = c);
				} else n[r] = c !== void 0 ? c : i;
			}
			for (const r of Object.getOwnPropertySymbols(o)) {
				const i = n[r],
					c = o[r];
				n[r] = c !== void 0 ? c : i;
			}
		}
	}
	return (
		typeof n.style == 'object' &&
			(n.style = vt(n.style).replaceAll(
				`
`,
				' '
			)),
		n.hidden === !1 && ((n.hidden = void 0), delete n.hidden),
		n.disabled === !1 && ((n.disabled = void 0), delete n.disabled),
		n
	);
}
const Rt = typeof window < 'u' ? window : void 0;
function Ot(t) {
	let n = t.activeElement;
	for (; n?.shadowRoot; ) {
		const e = n.shadowRoot.activeElement;
		if (e === n) break;
		n = e;
	}
	return n;
}
class Ft {
	#n;
	#t;
	constructor(n = {}) {
		const { window: e = Rt, document: o = e?.document } = n;
		e !== void 0 &&
			((this.#n = o),
			(this.#t = W((r) => {
				const i = C(e, 'focusin', r),
					c = C(e, 'focusout', r);
				return () => {
					(i(), c());
				};
			})));
	}
	get current() {
		return (this.#t?.(), this.#n ? Ot(this.#n) : null);
	}
}
new Ft();
class Bt {
	#n;
	#t;
	constructor(n) {
		((this.#n = n), (this.#t = Symbol(n)));
	}
	get key() {
		return this.#t;
	}
	exists() {
		return G(this.#t);
	}
	get() {
		const n = R(this.#t);
		if (n === void 0) throw new Error(`Context "${this.#n}" not found`);
		return n;
	}
	getOr(n) {
		const e = R(this.#t);
		return e === void 0 ? n : e;
	}
	set(n) {
		return H(this.#t, n);
	}
}
function _t(t, n) {
	switch (t) {
		case 'post':
			D(n);
			break;
		case 'pre':
			V(n);
			break;
	}
}
function j(t, n, e, o = {}) {
	const { lazy: r = !1 } = o;
	let i = !r,
		c = Array.isArray(t) ? [] : void 0;
	_t(n, () => {
		const u = Array.isArray(t) ? t.map((f) => f()) : t();
		if (!i) {
			((i = !0), (c = u));
			return;
		}
		const l = v(() => e(u, c));
		return ((c = u), l);
	});
}
function xt(t, n, e) {
	j(t, 'post', n, e);
}
function kt(t, n, e) {
	j(t, 'pre', n, e);
}
xt.pre = kt;
function Gt(t, n) {
	return {
		[X()]: (e) =>
			A(t)
				? ((t.current = e),
					v(() => n?.(e)),
					() => {
						('isConnected' in e && e.isConnected) || ((t.current = null), n?.(null));
					})
				: (t(e),
					v(() => n?.(e)),
					() => {
						('isConnected' in e && e.isConnected) || (t(null), n?.(null));
					})
	};
}
function Ht(t) {
	return t ? 'true' : 'false';
}
function Vt(t) {
	return t ? '' : void 0;
}
function Dt(t) {
	return t ? !0 : void 0;
}
function Xt(t) {
	return t ? 'open' : 'closed';
}
function Yt(t) {
	return t ? 'checked' : 'unchecked';
}
function Kt(t, n) {
	return t ? 'true' : 'false';
}
class Pt {
	#n;
	#t;
	attrs;
	constructor(n) {
		((this.#n = n.getVariant ? n.getVariant() : null),
			(this.#t = this.#n ? `data-${this.#n}-` : `data-${n.component}-`),
			(this.getAttr = this.getAttr.bind(this)),
			(this.selector = this.selector.bind(this)),
			(this.attrs = Object.fromEntries(n.parts.map((e) => [e, this.getAttr(e)]))));
	}
	getAttr(n, e) {
		return e ? `data-${e}-${n}` : `${this.#t}${n}`;
	}
	selector(n, e) {
		return `[${this.getAttr(n, e)}]`;
	}
}
function zt(t) {
	const n = new Pt(t);
	return { ...n.attrs, selector: n.selector, getAttr: n.getAttr };
}
const Zt = 'Alt',
	qt = 'ArrowDown',
	Jt = 'ArrowLeft',
	Qt = 'ArrowRight',
	tn = 'ArrowUp',
	nn = 'Backspace',
	en = 'CapsLock',
	on = 'Control',
	rn = 'End',
	sn = 'Enter',
	cn = 'Escape',
	an = 'F1',
	un = 'F10',
	fn = 'F11',
	ln = 'F12',
	pn = 'F2',
	dn = 'F3',
	hn = 'F4',
	mn = 'F5',
	gn = 'F6',
	En = 'F7',
	bn = 'F8',
	yn = 'F9',
	An = 'Home',
	wn = 'Meta',
	vn = 'PageDown',
	Sn = 'PageUp',
	Tn = 'Shift',
	Cn = ' ',
	Rn = 'Tab';
function On() {}
function Fn(t, n) {
	return `bits-${t}`;
}
export {
	Rt as $,
	tn as A,
	b as B,
	Bt as C,
	en as D,
	sn as E,
	on as F,
	Zt as G,
	An as H,
	an as I,
	pn as J,
	dn as K,
	hn as L,
	wn as M,
	mn as N,
	gn as O,
	En as P,
	bn as Q,
	yn as R,
	Cn as S,
	un as T,
	fn as U,
	ln as V,
	Rn as W,
	nn as X,
	Sn as Y,
	vn as Z,
	q as _,
	Gt as a,
	K as a0,
	bt as a1,
	J as a2,
	y as a3,
	Vt as b,
	zt as c,
	Ht as d,
	Kt as e,
	Dt as f,
	Yt as g,
	Fn as h,
	Z as i,
	Xt as j,
	T as k,
	Nt as l,
	Ut as m,
	On as n,
	$t as o,
	A as p,
	P as q,
	Qt as r,
	vt as s,
	Mt as t,
	Jt as u,
	qt as v,
	xt as w,
	rn as x,
	cn as y,
	Tn as z
};
