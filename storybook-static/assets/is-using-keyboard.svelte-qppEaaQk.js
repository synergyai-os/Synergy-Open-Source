import {
	ab as b,
	aZ as ht,
	U as jt,
	v as c,
	a8 as h,
	a_ as A,
	G as x,
	B as Xt,
	aA as f,
	aC as Zt,
	w as T,
	p as D,
	h as p,
	F as V,
	a as z,
	k as q,
	n as H,
	b as Y,
	c as P,
	a$ as yt
} from './iframe-DYn7RqBV.js';
import { w as y } from './watch.svelte-CYSsdG2H.js';
import { n as v } from './noop-DX6rZLP_.js';
import { f as Jt, d as J, i as M, b as wt, g as dt } from './is-DtD5rb4o.js';
import { C as $ } from './context-DWcBTeuX.js';
import {
	c as Tt,
	P as Qt,
	H as $t,
	A as te,
	e as ee,
	E as ne,
	d as St,
	S as tt,
	T as re,
	f as se
} from './kbd-constants-Duhtze-4.js';
import { a as j, g as ie, D as et, c as oe } from './dom-context.svelte-Cee2qr-t.js';
import {
	b as d,
	v as C,
	a as nt,
	r as Mt,
	h as Et,
	g as Ct,
	c as ae,
	m as ue,
	q as ce,
	x as le
} from './create-id-CD7dpc57.js';
import { g as he } from './arrays-C786ZheV.js';
import { R as de } from './roving-focus-group-B-fCEnqo.js';
import { u as fe } from './use-id-C09Eugg1.js';
class pe extends Map {
	#t = new Map();
	#e = b(0);
	#n = b(0);
	#r = ht || -1;
	constructor(t) {
		if ((super(), t)) {
			for (var [e, n] of t) super.set(e, n);
			this.#n.v = super.size;
		}
	}
	#s(t) {
		return ht === this.#r ? b(t) : jt(t);
	}
	has(t) {
		var e = this.#t,
			n = e.get(t);
		if (n === void 0) {
			var s = super.get(t);
			if (s !== void 0) ((n = this.#s(0)), e.set(t, n));
			else return (c(this.#e), !1);
		}
		return (c(n), !0);
	}
	forEach(t, e) {
		(this.#i(), super.forEach(t, e));
	}
	get(t) {
		var e = this.#t,
			n = e.get(t);
		if (n === void 0) {
			var s = super.get(t);
			if (s !== void 0) ((n = this.#s(0)), e.set(t, n));
			else {
				c(this.#e);
				return;
			}
		}
		return (c(n), super.get(t));
	}
	set(t, e) {
		var n = this.#t,
			s = n.get(t),
			o = super.get(t),
			i = super.set(t, e),
			a = this.#e;
		if (s === void 0) ((s = this.#s(0)), n.set(t, s), h(this.#n, super.size), A(a));
		else if (o !== e) {
			A(s);
			var u = a.reactions === null ? null : new Set(a.reactions),
				l = u === null || !s.reactions?.every((g) => u.has(g));
			l && A(a);
		}
		return i;
	}
	delete(t) {
		var e = this.#t,
			n = e.get(t),
			s = super.delete(t);
		return (n !== void 0 && (e.delete(t), h(this.#n, super.size), h(n, -1), A(this.#e)), s);
	}
	clear() {
		if (super.size !== 0) {
			super.clear();
			var t = this.#t;
			h(this.#n, 0);
			for (var e of t.values()) h(e, -1);
			(A(this.#e), t.clear());
		}
	}
	#i() {
		c(this.#e);
		var t = this.#t;
		if (this.#n.v !== t.size) {
			for (var e of super.keys())
				if (!t.has(e)) {
					var n = this.#s(0);
					t.set(e, n);
				}
		}
		for ([, n] of this.#t) c(n);
	}
	keys() {
		return (c(this.#e), super.keys());
	}
	values() {
		return (this.#i(), super.values());
	}
	entries() {
		return (this.#i(), super.entries());
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	get size() {
		return (c(this.#n), super.size);
	}
}
function R(r) {
	x(() => () => {
		r();
	});
}
function be(r, t) {
	return setTimeout(t, r);
}
function w(r) {
	Xt().then(r);
}
class ge {
	#t;
	#e = null;
	constructor(t) {
		((this.#t = t), R(() => this.#n()));
	}
	#n() {
		this.#e && (window.cancelAnimationFrame(this.#e), (this.#e = null));
	}
	run(t) {
		this.#n();
		const e = this.#t.ref.current;
		if (e) {
			if (typeof e.getAnimations != 'function') {
				this.#r(t);
				return;
			}
			this.#e = window.requestAnimationFrame(() => {
				const n = e.getAnimations();
				if (n.length === 0) {
					this.#r(t);
					return;
				}
				Promise.allSettled(n.map((s) => s.finished)).then(() => {
					this.#r(t);
				});
			});
		}
	}
	#r(t) {
		const e = () => {
			t();
		};
		this.#t.afterTick ? w(e) : e();
	}
}
class ve {
	#t;
	#e;
	#n;
	#r = b(!1);
	constructor(t) {
		((this.#t = t),
			h(this.#r, t.open.current, !0),
			(this.#e = t.enabled ?? !0),
			(this.#n = new ge({ ref: this.#t.ref, afterTick: this.#t.open })),
			y(
				() => this.#t.open.current,
				(e) => {
					(e && h(this.#r, !0),
						this.#e &&
							this.#n.run(() => {
								e === this.#t.open.current &&
									(this.#t.open.current || h(this.#r, !1), this.#t.onComplete?.());
							}));
				}
			));
	}
	get shouldRender() {
		return c(this.#r);
	}
}
class me {
	eventName;
	options;
	constructor(t, e = { bubbles: !0, cancelable: !0 }) {
		((this.eventName = t), (this.options = e));
	}
	createEvent(t) {
		return new CustomEvent(this.eventName, { ...this.options, detail: t });
	}
	dispatch(t, e) {
		const n = this.createEvent(e);
		return (t.dispatchEvent(n), n);
	}
	listen(t, e, n) {
		const s = (o) => {
			e(o);
		};
		return f(t, this.eventName, s, n);
	}
}
function ft(r, t = 500) {
	let e = null;
	const n = (...s) => {
		(e !== null && clearTimeout(e),
			(e = setTimeout(() => {
				r(...s);
			}, t)));
	};
	return (
		(n.destroy = () => {
			e !== null && (clearTimeout(e), (e = null));
		}),
		n
	);
}
function xt(r, t) {
	return r === t || r.contains(t);
}
function At(r) {
	return r?.ownerDocument ?? document;
}
function ye(r, t) {
	const { clientX: e, clientY: n } = r,
		s = t.getBoundingClientRect();
	return e < s.left || e > s.right || n < s.top || n > s.bottom;
}
const we = [St, tt],
	Te = [Tt, Qt, $t],
	Ft = [te, ee, ne],
	Se = [...Te, ...Ft];
function pt(r) {
	return r.pointerType === 'mouse';
}
function Me(r, { select: t = !1 } = {}) {
	if (!r || !r.focus) return;
	const e = j(r);
	if (e.activeElement === r) return;
	const n = e.activeElement;
	(r.focus({ preventScroll: !0 }), r !== n && Jt(r) && t && r.select());
}
function Ee(r, { select: t = !1 } = {}, e) {
	const n = e();
	for (const s of r) if ((Me(s, { select: t }), e() !== n)) return !0;
}
var It = [
		'input:not([inert])',
		'select:not([inert])',
		'textarea:not([inert])',
		'a[href]:not([inert])',
		'button:not([inert])',
		'[tabindex]:not(slot):not([inert])',
		'audio[controls]:not([inert])',
		'video[controls]:not([inert])',
		'[contenteditable]:not([contenteditable="false"]):not([inert])',
		'details>summary:first-of-type:not([inert])',
		'details:not([inert])'
	],
	W = It.join(','),
	kt = typeof Element > 'u',
	E = kt
		? function () {}
		: Element.prototype.matches ||
			Element.prototype.msMatchesSelector ||
			Element.prototype.webkitMatchesSelector,
	_ =
		!kt && Element.prototype.getRootNode
			? function (r) {
					var t;
					return r == null || (t = r.getRootNode) === null || t === void 0 ? void 0 : t.call(r);
				}
			: function (r) {
					return r?.ownerDocument;
				},
	N = function (t, e) {
		var n;
		e === void 0 && (e = !0);
		var s =
				t == null || (n = t.getAttribute) === null || n === void 0 ? void 0 : n.call(t, 'inert'),
			o = s === '' || s === 'true',
			i = o || (e && t && N(t.parentNode));
		return i;
	},
	Ce = function (t) {
		var e,
			n =
				t == null || (e = t.getAttribute) === null || e === void 0
					? void 0
					: e.call(t, 'contenteditable');
		return n === '' || n === 'true';
	},
	Ot = function (t, e, n) {
		if (N(t)) return [];
		var s = Array.prototype.slice.apply(t.querySelectorAll(W));
		return (e && E.call(t, W) && s.unshift(t), (s = s.filter(n)), s);
	},
	G = function (t, e, n) {
		for (var s = [], o = Array.from(t); o.length; ) {
			var i = o.shift();
			if (!N(i, !1))
				if (i.tagName === 'SLOT') {
					var a = i.assignedElements(),
						u = a.length ? a : i.children,
						l = G(u, !0, n);
					n.flatten ? s.push.apply(s, l) : s.push({ scopeParent: i, candidates: l });
				} else {
					var g = E.call(i, W);
					g && n.filter(i) && (e || !t.includes(i)) && s.push(i);
					var m = i.shadowRoot || (typeof n.getShadowRoot == 'function' && n.getShadowRoot(i)),
						Yt = !N(m, !1) && (!n.shadowRootFilter || n.shadowRootFilter(i));
					if (m && Yt) {
						var lt = G(m === !0 ? i.children : m.children, !0, n);
						n.flatten ? s.push.apply(s, lt) : s.push({ scopeParent: i, candidates: lt });
					} else o.unshift.apply(o, i.children);
				}
		}
		return s;
	},
	Nt = function (t) {
		return !isNaN(parseInt(t.getAttribute('tabindex'), 10));
	},
	Dt = function (t) {
		if (!t) throw new Error('No node provided');
		return t.tabIndex < 0 && (/^(AUDIO|VIDEO|DETAILS)$/.test(t.tagName) || Ce(t)) && !Nt(t)
			? 0
			: t.tabIndex;
	},
	xe = function (t, e) {
		var n = Dt(t);
		return n < 0 && e && !Nt(t) ? 0 : n;
	},
	Ae = function (t, e) {
		return t.tabIndex === e.tabIndex ? t.documentOrder - e.documentOrder : t.tabIndex - e.tabIndex;
	},
	Pt = function (t) {
		return t.tagName === 'INPUT';
	},
	Fe = function (t) {
		return Pt(t) && t.type === 'hidden';
	},
	Ie = function (t) {
		var e =
			t.tagName === 'DETAILS' &&
			Array.prototype.slice.apply(t.children).some(function (n) {
				return n.tagName === 'SUMMARY';
			});
		return e;
	},
	ke = function (t, e) {
		for (var n = 0; n < t.length; n++) if (t[n].checked && t[n].form === e) return t[n];
	},
	Oe = function (t) {
		if (!t.name) return !0;
		var e = t.form || _(t),
			n = function (a) {
				return e.querySelectorAll('input[type="radio"][name="' + a + '"]');
			},
			s;
		if (typeof window < 'u' && typeof window.CSS < 'u' && typeof window.CSS.escape == 'function')
			s = n(window.CSS.escape(t.name));
		else
			try {
				s = n(t.name);
			} catch (i) {
				return (
					console.error(
						'Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s',
						i.message
					),
					!1
				);
			}
		var o = ke(s, t.form);
		return !o || o === t;
	},
	Ne = function (t) {
		return Pt(t) && t.type === 'radio';
	},
	De = function (t) {
		return Ne(t) && !Oe(t);
	},
	Pe = function (t) {
		var e,
			n = t && _(t),
			s = (e = n) === null || e === void 0 ? void 0 : e.host,
			o = !1;
		if (n && n !== t) {
			var i, a, u;
			for (
				o = !!(
					((i = s) !== null &&
						i !== void 0 &&
						(a = i.ownerDocument) !== null &&
						a !== void 0 &&
						a.contains(s)) ||
					(t != null && (u = t.ownerDocument) !== null && u !== void 0 && u.contains(t))
				);
				!o && s;

			) {
				var l, g, m;
				((n = _(s)),
					(s = (l = n) === null || l === void 0 ? void 0 : l.host),
					(o = !!(
						(g = s) !== null &&
						g !== void 0 &&
						(m = g.ownerDocument) !== null &&
						m !== void 0 &&
						m.contains(s)
					)));
			}
		}
		return o;
	},
	bt = function (t) {
		var e = t.getBoundingClientRect(),
			n = e.width,
			s = e.height;
		return n === 0 && s === 0;
	},
	Re = function (t, e) {
		var n = e.displayCheck,
			s = e.getShadowRoot;
		if (n === 'full-native' && 'checkVisibility' in t) {
			var o = t.checkVisibility({
				checkOpacity: !1,
				opacityProperty: !1,
				contentVisibilityAuto: !0,
				visibilityProperty: !0,
				checkVisibilityCSS: !0
			});
			return !o;
		}
		if (getComputedStyle(t).visibility === 'hidden') return !0;
		var i = E.call(t, 'details>summary:first-of-type'),
			a = i ? t.parentElement : t;
		if (E.call(a, 'details:not([open]) *')) return !0;
		if (!n || n === 'full' || n === 'full-native' || n === 'legacy-full') {
			if (typeof s == 'function') {
				for (var u = t; t; ) {
					var l = t.parentElement,
						g = _(t);
					if (l && !l.shadowRoot && s(l) === !0) return bt(t);
					t.assignedSlot
						? (t = t.assignedSlot)
						: !l && g !== t.ownerDocument
							? (t = g.host)
							: (t = l);
				}
				t = u;
			}
			if (Pe(t)) return !t.getClientRects().length;
			if (n !== 'legacy-full') return !0;
		} else if (n === 'non-zero-area') return bt(t);
		return !1;
	},
	Le = function (t) {
		if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(t.tagName))
			for (var e = t.parentElement; e; ) {
				if (e.tagName === 'FIELDSET' && e.disabled) {
					for (var n = 0; n < e.children.length; n++) {
						var s = e.children.item(n);
						if (s.tagName === 'LEGEND')
							return E.call(e, 'fieldset[disabled] *') ? !0 : !s.contains(t);
					}
					return !0;
				}
				e = e.parentElement;
			}
		return !1;
	},
	U = function (t, e) {
		return !(e.disabled || N(e) || Fe(e) || Re(e, t) || Ie(e) || Le(e));
	},
	Q = function (t, e) {
		return !(De(e) || Dt(e) < 0 || !U(t, e));
	},
	Be = function (t) {
		var e = parseInt(t.getAttribute('tabindex'), 10);
		return !!(isNaN(e) || e >= 0);
	},
	Rt = function (t) {
		var e = [],
			n = [];
		return (
			t.forEach(function (s, o) {
				var i = !!s.scopeParent,
					a = i ? s.scopeParent : s,
					u = xe(a, i),
					l = i ? Rt(s.candidates) : a;
				u === 0
					? i
						? e.push.apply(e, l)
						: e.push(a)
					: n.push({ documentOrder: o, tabIndex: u, item: s, isScope: i, content: l });
			}),
			n
				.sort(Ae)
				.reduce(function (s, o) {
					return (o.isScope ? s.push.apply(s, o.content) : s.push(o.content), s);
				}, [])
				.concat(e)
		);
	},
	Lt = function (t, e) {
		e = e || {};
		var n;
		return (
			e.getShadowRoot
				? (n = G([t], e.includeContainer, {
						filter: Q.bind(null, e),
						flatten: !1,
						getShadowRoot: e.getShadowRoot,
						shadowRootFilter: Be
					}))
				: (n = Ot(t, e.includeContainer, Q.bind(null, e))),
			Rt(n)
		);
	},
	Bt = function (t, e) {
		e = e || {};
		var n;
		return (
			e.getShadowRoot
				? (n = G([t], e.includeContainer, {
						filter: U.bind(null, e),
						flatten: !0,
						getShadowRoot: e.getShadowRoot
					}))
				: (n = Ot(t, e.includeContainer, U.bind(null, e))),
			n
		);
	},
	rt = function (t, e) {
		if (((e = e || {}), !t)) throw new Error('No node provided');
		return E.call(t, W) === !1 ? !1 : Q(e, t);
	},
	Ke = It.concat('iframe').join(','),
	Kt = function (t, e) {
		if (((e = e || {}), !t)) throw new Error('No node provided');
		return E.call(t, Ke) === !1 ? !1 : U(e, t);
	};
function O() {
	return {
		getShadowRoot: !0,
		displayCheck:
			typeof ResizeObserver == 'function' && ResizeObserver.toString().includes('[native code]')
				? 'full'
				: 'none'
	};
}
function We(r, t) {
	if (!rt(r, O())) return _e(r, t);
	const e = j(r),
		n = Lt(e.body, O());
	t === 'prev' && n.reverse();
	const s = n.indexOf(r);
	return s === -1 ? e.body : n.slice(s + 1)[0];
}
function _e(r, t) {
	const e = j(r);
	if (!Kt(r, O())) return e.body;
	const n = Bt(e.body, O());
	t === 'prev' && n.reverse();
	const s = n.indexOf(r);
	return s === -1 ? e.body : (n.slice(s + 1).find((i) => rt(i, O())) ?? e.body);
}
const Ge = { afterMs: 1e4, onChange: v };
function Wt(r, t) {
	const { afterMs: e, onChange: n, getWindow: s } = { ...Ge, ...t };
	let o = null,
		i = b(Zt(r));
	function a() {
		return s().setTimeout(() => {
			(h(i, r, !0), n?.(r));
		}, e);
	}
	return (
		x(() => () => {
			o && s().clearTimeout(o);
		}),
		d(
			() => c(i),
			(u) => {
				(h(i, u, !0), n?.(u), o && s().clearTimeout(o), (o = a()));
			}
		)
	);
}
class Ue {
	#t;
	#e;
	#n = T(() => (this.#t.onMatch ? this.#t.onMatch : (t) => t.focus()));
	#r = T(() => (this.#t.getCurrentItem ? this.#t.getCurrentItem : this.#t.getActiveElement));
	constructor(t) {
		((this.#t = t),
			(this.#e = Wt('', { afterMs: 1e3, getWindow: t.getWindow })),
			(this.handleTypeaheadSearch = this.handleTypeaheadSearch.bind(this)),
			(this.resetTypeahead = this.resetTypeahead.bind(this)));
	}
	handleTypeaheadSearch(t, e) {
		if (!e.length) return;
		this.#e.current = this.#e.current + t;
		const n = c(this.#r)(),
			s = e.find((u) => u === n)?.textContent?.trim() ?? '',
			o = e.map((u) => u.textContent?.trim() ?? ''),
			i = he(o, this.#e.current, s),
			a = e.find((u) => u.textContent?.trim() === i);
		return (a && c(this.#n)(a), a);
	}
	resetTypeahead() {
		this.#e.current = '';
	}
	get search() {
		return this.#e.current;
	}
}
class Ve {
	#t;
	#e;
	#n;
	#r = b(null);
	constructor(t) {
		((this.#t = t),
			(this.#e = T(() => this.#t.enabled())),
			(this.#n = Wt(!1, {
				afterMs: t.transitTimeout ?? 300,
				onChange: (e) => {
					c(this.#e) && this.#t.setIsPointerInTransit?.(e);
				},
				getWindow: () => ie(this.#t.triggerNode())
			})),
			y([t.triggerNode, t.contentNode, t.enabled], ([e, n, s]) => {
				if (!e || !n || !s) return;
				const o = (a) => {
						this.#i(a, n);
					},
					i = (a) => {
						this.#i(a, e);
					};
				return C(f(e, 'pointerleave', o), f(n, 'pointerleave', i));
			}),
			y(
				() => c(this.#r),
				() => {
					const e = (s) => {
							if (!c(this.#r)) return;
							const o = s.target;
							if (!J(o)) return;
							const i = { x: s.clientX, y: s.clientY },
								a = t.triggerNode()?.contains(o) || t.contentNode()?.contains(o),
								u = !Ye(i, c(this.#r));
							a ? this.#s() : u && (this.#s(), t.onPointerExit());
						},
						n = j(t.triggerNode() ?? t.contentNode());
					if (n) return f(n, 'pointermove', e);
				}
			));
	}
	#s() {
		(h(this.#r, null), (this.#n.current = !1));
	}
	#i(t, e) {
		const n = t.currentTarget;
		if (!M(n)) return;
		const s = { x: t.clientX, y: t.clientY },
			o = ze(s, n.getBoundingClientRect()),
			i = qe(s, o),
			a = He(e.getBoundingClientRect()),
			u = je([...i, ...a]);
		(h(this.#r, u, !0), (this.#n.current = !0));
	}
}
function ze(r, t) {
	const e = Math.abs(t.top - r.y),
		n = Math.abs(t.bottom - r.y),
		s = Math.abs(t.right - r.x),
		o = Math.abs(t.left - r.x);
	switch (Math.min(e, n, s, o)) {
		case o:
			return 'left';
		case s:
			return 'right';
		case e:
			return 'top';
		case n:
			return 'bottom';
		default:
			throw new Error('unreachable');
	}
}
function qe(r, t, e = 5) {
	const n = e * 1.5;
	switch (t) {
		case 'top':
			return [
				{ x: r.x - e, y: r.y + e },
				{ x: r.x, y: r.y - n },
				{ x: r.x + e, y: r.y + e }
			];
		case 'bottom':
			return [
				{ x: r.x - e, y: r.y - e },
				{ x: r.x, y: r.y + n },
				{ x: r.x + e, y: r.y - e }
			];
		case 'left':
			return [
				{ x: r.x + e, y: r.y - e },
				{ x: r.x - n, y: r.y },
				{ x: r.x + e, y: r.y + e }
			];
		case 'right':
			return [
				{ x: r.x - e, y: r.y - e },
				{ x: r.x + n, y: r.y },
				{ x: r.x - e, y: r.y + e }
			];
	}
}
function He(r) {
	const { top: t, right: e, bottom: n, left: s } = r;
	return [
		{ x: s, y: t },
		{ x: e, y: t },
		{ x: e, y: n },
		{ x: s, y: n }
	];
}
function Ye(r, t) {
	const { x: e, y: n } = r;
	let s = !1;
	for (let o = 0, i = t.length - 1; o < t.length; i = o++) {
		const a = t[o].x,
			u = t[o].y,
			l = t[i].x,
			g = t[i].y;
		u > n != g > n && e < ((l - a) * (n - u)) / (g - u) + a && (s = !s);
	}
	return s;
}
function je(r) {
	const t = r.slice();
	return (
		t.sort((e, n) => (e.x < n.x ? -1 : e.x > n.x ? 1 : e.y < n.y ? -1 : e.y > n.y ? 1 : 0)),
		Xe(t)
	);
}
function Xe(r) {
	if (r.length <= 1) return r.slice();
	const t = [];
	for (let n = 0; n < r.length; n++) {
		const s = r[n];
		for (; t.length >= 2; ) {
			const o = t[t.length - 1],
				i = t[t.length - 2];
			if ((o.x - i.x) * (s.y - i.y) >= (o.y - i.y) * (s.x - i.x)) t.pop();
			else break;
		}
		t.push(s);
	}
	t.pop();
	const e = [];
	for (let n = r.length - 1; n >= 0; n--) {
		const s = r[n];
		for (; e.length >= 2; ) {
			const o = e[e.length - 1],
				i = e[e.length - 2];
			if ((o.x - i.x) * (s.y - i.y) >= (o.y - i.y) * (s.x - i.x)) e.pop();
			else break;
		}
		e.push(s);
	}
	return (
		e.pop(),
		t.length === 1 && e.length === 1 && t[0].x === e[0].x && t[0].y === e[0].y ? t : t.concat(e)
	);
}
const Ze = 'data-context-menu-trigger',
	Je = 'data-context-menu-content',
	Qe = new $('Menu.Root'),
	st = new $('Menu.Root | Menu.Sub'),
	_t = new $('Menu.Content'),
	$e = new me('bitsmenuopen', { bubbles: !1, cancelable: !0 }),
	tn = ae({
		component: 'menu',
		parts: [
			'trigger',
			'content',
			'sub-trigger',
			'item',
			'group',
			'group-heading',
			'checkbox-group',
			'checkbox-item',
			'radio-group',
			'radio-item',
			'separator',
			'sub-content',
			'arrow'
		]
	});
class Gt {
	static create(t) {
		const e = new Gt(t);
		return Qe.set(e);
	}
	opts;
	isUsingKeyboard = new S();
	#t = b(!1);
	get ignoreCloseAutoFocus() {
		return c(this.#t);
	}
	set ignoreCloseAutoFocus(t) {
		h(this.#t, t, !0);
	}
	#e = b(!1);
	get isPointerInTransit() {
		return c(this.#e);
	}
	set isPointerInTransit(t) {
		h(this.#e, t, !0);
	}
	constructor(t) {
		this.opts = t;
	}
	getBitsAttr = (t) => tn.getAttr(t, this.opts.variant.current);
}
class Ut {
	static create(t, e) {
		return st.set(new Ut(t, e, null));
	}
	opts;
	root;
	parentMenu;
	contentId = d(() => '');
	#t = b(null);
	get contentNode() {
		return c(this.#t);
	}
	set contentNode(t) {
		h(this.#t, t, !0);
	}
	contentPresence;
	#e = b(null);
	get triggerNode() {
		return c(this.#e);
	}
	set triggerNode(t) {
		h(this.#e, t, !0);
	}
	constructor(t, e, n) {
		((this.opts = t),
			(this.root = e),
			(this.parentMenu = n),
			(this.contentPresence = new ve({
				ref: d(() => this.contentNode),
				open: this.opts.open,
				onComplete: () => {
					this.opts.onOpenChangeComplete.current(this.opts.open.current);
				}
			})),
			n &&
				y(
					() => n.opts.open.current,
					() => {
						n.opts.open.current || (this.opts.open.current = !1);
					}
				));
	}
	toggleOpen() {
		this.opts.open.current = !this.opts.open.current;
	}
	onOpen() {
		this.opts.open.current = !0;
	}
	onClose() {
		this.opts.open.current = !1;
	}
}
class Vt {
	static create(t) {
		return _t.set(new Vt(t, st.get()));
	}
	opts;
	parentMenu;
	rovingFocusGroup;
	domContext;
	attachment;
	#t = b('');
	get search() {
		return c(this.#t);
	}
	set search(t) {
		h(this.#t, t, !0);
	}
	#e = 0;
	#n;
	#r = b(!1);
	get mounted() {
		return c(this.#r);
	}
	set mounted(t) {
		h(this.#r, t, !0);
	}
	#s;
	constructor(t, e) {
		((this.opts = t),
			(this.parentMenu = e),
			(this.domContext = new et(t.ref)),
			(this.attachment = nt(this.opts.ref, (n) => {
				this.parentMenu.contentNode !== n && (this.parentMenu.contentNode = n);
			})),
			(e.contentId = t.id),
			(this.#s = t.isSub ?? !1),
			(this.onkeydown = this.onkeydown.bind(this)),
			(this.onblur = this.onblur.bind(this)),
			(this.onfocus = this.onfocus.bind(this)),
			(this.handleInteractOutside = this.handleInteractOutside.bind(this)),
			new Ve({
				contentNode: () => this.parentMenu.contentNode,
				triggerNode: () => this.parentMenu.triggerNode,
				enabled: () =>
					this.parentMenu.opts.open.current &&
					!!this.parentMenu.triggerNode?.hasAttribute(
						this.parentMenu.root.getBitsAttr('sub-trigger')
					),
				onPointerExit: () => {
					this.parentMenu.opts.open.current = !1;
				},
				setIsPointerInTransit: (n) => {
					this.parentMenu.root.isPointerInTransit = n;
				}
			}),
			(this.#n = new Ue({
				getActiveElement: () => this.domContext.getActiveElement(),
				getWindow: () => this.domContext.getWindow()
			}).handleTypeaheadSearch),
			(this.rovingFocusGroup = new de({
				rootNode: d(() => this.parentMenu.contentNode),
				candidateAttr: this.parentMenu.root.getBitsAttr('item'),
				loop: this.opts.loop,
				orientation: d(() => 'vertical')
			})),
			y(
				() => this.parentMenu.contentNode,
				(n) => {
					if (!n) return;
					const s = () => {
						w(() => {
							this.parentMenu.root.isUsingKeyboard.current &&
								this.rovingFocusGroup.focusFirstCandidate();
						});
					};
					return $e.listen(n, s);
				}
			),
			x(() => {
				this.parentMenu.opts.open.current || this.domContext.getWindow().clearTimeout(this.#e);
			}));
	}
	#i() {
		const t = this.parentMenu.contentNode;
		return t
			? Array.from(
					t.querySelectorAll(`[${this.parentMenu.root.getBitsAttr('item')}]:not([data-disabled])`)
				)
			: [];
	}
	#a() {
		return this.parentMenu.root.isPointerInTransit;
	}
	onCloseAutoFocus = (t) => {
		(this.opts.onCloseAutoFocus.current?.(t),
			!(t.defaultPrevented || this.#s) &&
				this.parentMenu.triggerNode &&
				rt(this.parentMenu.triggerNode) &&
				(t.preventDefault(), this.parentMenu.triggerNode.focus()));
	};
	handleTabKeyDown(t) {
		let e = this.parentMenu;
		for (; e.parentMenu !== null; ) e = e.parentMenu;
		if (!e.triggerNode) return;
		t.preventDefault();
		const n = We(e.triggerNode, t.shiftKey ? 'prev' : 'next');
		n
			? ((this.parentMenu.root.ignoreCloseAutoFocus = !0),
				e.onClose(),
				w(() => {
					(n.focus(),
						w(() => {
							this.parentMenu.root.ignoreCloseAutoFocus = !1;
						}));
				}))
			: this.domContext.getDocument().body.focus();
	}
	onkeydown(t) {
		if (t.defaultPrevented) return;
		if (t.key === re) {
			this.handleTabKeyDown(t);
			return;
		}
		const e = t.target,
			n = t.currentTarget;
		if (!M(e) || !M(n)) return;
		const s =
				e.closest(`[${this.parentMenu.root.getBitsAttr('content')}]`)?.id ===
				this.parentMenu.contentId.current,
			o = t.ctrlKey || t.altKey || t.metaKey,
			i = t.key.length === 1;
		if (this.rovingFocusGroup.handleKeydown(e, t) || t.code === 'Space') return;
		const u = this.#i();
		(s && !o && i && this.#n(t.key, u),
			t.target?.id === this.parentMenu.contentId.current &&
				Se.includes(t.key) &&
				(t.preventDefault(),
				Ft.includes(t.key) && u.reverse(),
				Ee(u, { select: !1 }, () => this.domContext.getActiveElement())));
	}
	onblur(t) {
		J(t.currentTarget) &&
			J(t.target) &&
			(t.currentTarget.contains?.(t.target) ||
				(this.domContext.getWindow().clearTimeout(this.#e), (this.search = '')));
	}
	onfocus(t) {
		this.parentMenu.root.isUsingKeyboard.current &&
			w(() => this.rovingFocusGroup.focusFirstCandidate());
	}
	onItemEnter() {
		return this.#a();
	}
	onItemLeave(t) {
		if (
			t.currentTarget.hasAttribute(this.parentMenu.root.getBitsAttr('sub-trigger')) ||
			this.#a() ||
			this.parentMenu.root.isUsingKeyboard.current
		)
			return;
		(this.parentMenu.contentNode?.focus(), this.rovingFocusGroup.setCurrentTabStopId(''));
	}
	onTriggerLeave() {
		return !!this.#a();
	}
	handleInteractOutside(t) {
		if (!wt(t.target)) return;
		const e = this.parentMenu.triggerNode?.id;
		if (t.target.id === e) {
			t.preventDefault();
			return;
		}
		t.target.closest(`#${e}`) && t.preventDefault();
	}
	get shouldRender() {
		return this.parentMenu.contentPresence.shouldRender;
	}
	#o = T(() => ({ open: this.parentMenu.opts.open.current }));
	get snippetProps() {
		return c(this.#o);
	}
	set snippetProps(t) {
		h(this.#o, t);
	}
	#u = T(() => ({
		id: this.opts.id.current,
		role: 'menu',
		'aria-orientation': 'vertical',
		[this.parentMenu.root.getBitsAttr('content')]: '',
		'data-state': Mt(this.parentMenu.opts.open.current),
		onkeydown: this.onkeydown,
		onblur: this.onblur,
		onfocus: this.onfocus,
		dir: this.parentMenu.root.opts.dir.current,
		style: { pointerEvents: 'auto' },
		...this.attachment
	}));
	get props() {
		return c(this.#u);
	}
	set props(t) {
		h(this.#u, t);
	}
	popperProps = { onCloseAutoFocus: (t) => this.onCloseAutoFocus(t) };
}
class en {
	opts;
	content;
	attachment;
	#t = b(!1);
	constructor(t, e) {
		((this.opts = t),
			(this.content = e),
			(this.attachment = nt(this.opts.ref)),
			(this.onpointermove = this.onpointermove.bind(this)),
			(this.onpointerleave = this.onpointerleave.bind(this)),
			(this.onfocus = this.onfocus.bind(this)),
			(this.onblur = this.onblur.bind(this)));
	}
	onpointermove(t) {
		if (!t.defaultPrevented && pt(t))
			if (this.opts.disabled.current) this.content.onItemLeave(t);
			else {
				if (this.content.onItemEnter()) return;
				const n = t.currentTarget;
				if (!M(n)) return;
				n.focus();
			}
	}
	onpointerleave(t) {
		t.defaultPrevented || (pt(t) && this.content.onItemLeave(t));
	}
	onfocus(t) {
		w(() => {
			t.defaultPrevented || this.opts.disabled.current || h(this.#t, !0);
		});
	}
	onblur(t) {
		w(() => {
			t.defaultPrevented || h(this.#t, !1);
		});
	}
	#e = T(() => ({
		id: this.opts.id.current,
		tabindex: -1,
		role: 'menuitem',
		'aria-disabled': Ct(this.opts.disabled.current),
		'data-disabled': Et(this.opts.disabled.current),
		'data-highlighted': c(this.#t) ? '' : void 0,
		[this.content.parentMenu.root.getBitsAttr('item')]: '',
		onpointermove: this.onpointermove,
		onpointerleave: this.onpointerleave,
		onfocus: this.onfocus,
		onblur: this.onblur,
		...this.attachment
	}));
	get props() {
		return c(this.#e);
	}
	set props(t) {
		h(this.#e, t);
	}
}
class zt {
	static create(t) {
		const e = new en(t, _t.get());
		return new zt(t, e);
	}
	opts;
	item;
	root;
	#t = !1;
	constructor(t, e) {
		((this.opts = t),
			(this.item = e),
			(this.root = e.content.parentMenu.root),
			(this.onkeydown = this.onkeydown.bind(this)),
			(this.onclick = this.onclick.bind(this)),
			(this.onpointerdown = this.onpointerdown.bind(this)),
			(this.onpointerup = this.onpointerup.bind(this)));
	}
	#e() {
		if (this.item.opts.disabled.current) return;
		const t = new CustomEvent('menuitemselect', { bubbles: !0, cancelable: !0 });
		if ((this.opts.onSelect.current(t), t.defaultPrevented)) {
			this.item.content.parentMenu.root.isUsingKeyboard.current = !1;
			return;
		}
		this.opts.closeOnSelect.current && this.item.content.parentMenu.root.opts.onClose();
	}
	onkeydown(t) {
		const e = this.item.content.search !== '';
		if (!(this.item.opts.disabled.current || (e && t.key === tt)) && we.includes(t.key)) {
			if (!M(t.currentTarget)) return;
			(t.currentTarget.click(), t.preventDefault());
		}
	}
	onclick(t) {
		this.item.opts.disabled.current || this.#e();
	}
	onpointerup(t) {
		if (!t.defaultPrevented && !this.#t) {
			if (!M(t.currentTarget)) return;
			t.currentTarget?.click();
		}
	}
	onpointerdown(t) {
		this.#t = !0;
	}
	#n = T(() =>
		ue(this.item.props, {
			onclick: this.onclick,
			onpointerdown: this.onpointerdown,
			onpointerup: this.onpointerup,
			onkeydown: this.onkeydown
		})
	);
	get props() {
		return c(this.#n);
	}
	set props(t) {
		h(this.#n, t);
	}
}
class qt {
	static create(t) {
		return new qt(t, st.get());
	}
	opts;
	parentMenu;
	attachment;
	constructor(t, e) {
		((this.opts = t),
			(this.parentMenu = e),
			(this.attachment = nt(this.opts.ref, (n) => (this.parentMenu.triggerNode = n))));
	}
	onclick = (t) => {
		this.opts.disabled.current ||
			t.detail !== 0 ||
			(this.parentMenu.toggleOpen(), t.preventDefault());
	};
	onpointerdown = (t) => {
		if (!this.opts.disabled.current) {
			if (t.pointerType === 'touch') return t.preventDefault();
			t.button === 0 &&
				t.ctrlKey === !1 &&
				(this.parentMenu.toggleOpen(), this.parentMenu.opts.open.current || t.preventDefault());
		}
	};
	onpointerup = (t) => {
		this.opts.disabled.current ||
			(t.pointerType === 'touch' && (t.preventDefault(), this.parentMenu.toggleOpen()));
	};
	onkeydown = (t) => {
		if (!this.opts.disabled.current) {
			if (t.key === tt || t.key === St) {
				(this.parentMenu.toggleOpen(), t.preventDefault());
				return;
			}
			t.key === Tt && (this.parentMenu.onOpen(), t.preventDefault());
		}
	};
	#t = T(() => {
		if (this.parentMenu.opts.open.current && this.parentMenu.contentId.current)
			return this.parentMenu.contentId.current;
	});
	#e = T(() => ({
		id: this.opts.id.current,
		disabled: this.opts.disabled.current,
		'aria-haspopup': 'menu',
		'aria-expanded': Ct(this.parentMenu.opts.open.current),
		'aria-controls': c(this.#t),
		'data-disabled': Et(this.opts.disabled.current),
		'data-state': Mt(this.parentMenu.opts.open.current),
		[this.parentMenu.root.getBitsAttr('trigger')]: '',
		onclick: this.onclick,
		onpointerdown: this.onpointerdown,
		onpointerup: this.onpointerup,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return c(this.#e);
	}
	set props(t) {
		h(this.#e, t);
	}
}
globalThis.bitsDismissableLayers ??= new Map();
class it {
	static create(t) {
		return new it(t);
	}
	opts;
	#t;
	#e;
	#n = { pointerdown: !1 };
	#r = !1;
	#s = !1;
	#i = void 0;
	#a;
	#o = v;
	constructor(t) {
		((this.opts = t),
			(this.#e = t.interactOutsideBehavior),
			(this.#t = t.onInteractOutside),
			(this.#a = t.onFocusOutside),
			x(() => {
				this.#i = At(this.opts.ref.current);
			}));
		let e = v;
		const n = () => {
			(this.#d(), globalThis.bitsDismissableLayers.delete(this), this.#c.destroy(), e());
		};
		(y([() => this.opts.enabled.current, () => this.opts.ref.current], () => {
			if (!(!this.opts.enabled.current || !this.opts.ref.current))
				return (
					be(1, () => {
						this.opts.ref.current &&
							(globalThis.bitsDismissableLayers.set(this, this.#e), e(), (e = this.#h()));
					}),
					n
				);
		}),
			R(() => {
				(this.#d.destroy(),
					globalThis.bitsDismissableLayers.delete(this),
					this.#c.destroy(),
					this.#o(),
					e());
			}));
	}
	#u = (t) => {
		t.defaultPrevented ||
			(this.opts.ref.current &&
				w(() => {
					!this.opts.ref.current ||
						this.#g(t.target) ||
						(t.target && !this.#s && this.#a.current?.(t));
				}));
	};
	#h() {
		return C(
			f(this.#i, 'pointerdown', C(this.#f, this.#b), { capture: !0 }),
			f(this.#i, 'pointerdown', C(this.#p, this.#c)),
			f(this.#i, 'focusin', this.#u)
		);
	}
	#l = (t) => {
		let e = t;
		(e.defaultPrevented && (e = gt(t)), this.#t.current(t));
	};
	#c = ft((t) => {
		if (!this.opts.ref.current) {
			this.#o();
			return;
		}
		const e =
			this.opts.isValidEvent.current(t, this.opts.ref.current) || sn(t, this.opts.ref.current);
		if (!this.#r || this.#v() || !e) {
			this.#o();
			return;
		}
		let n = t;
		if (
			(n.defaultPrevented && (n = gt(n)),
			this.#e.current !== 'close' && this.#e.current !== 'defer-otherwise-close')
		) {
			this.#o();
			return;
		}
		t.pointerType === 'touch'
			? (this.#o(), (this.#o = f(this.#i, 'click', this.#l, { once: !0 })))
			: this.#t.current(n);
	}, 10);
	#f = (t) => {
		this.#n[t.type] = !0;
	};
	#p = (t) => {
		this.#n[t.type] = !1;
	};
	#b = () => {
		this.opts.ref.current && (this.#r = rn(this.opts.ref.current));
	};
	#g = (t) => (this.opts.ref.current ? xt(this.opts.ref.current, t) : !1);
	#d = ft(() => {
		for (const t in this.#n) this.#n[t] = !1;
		this.#r = !1;
	}, 20);
	#v() {
		return Object.values(this.#n).some(Boolean);
	}
	#m = () => {
		this.#s = !0;
	};
	#y = () => {
		this.#s = !1;
	};
	props = { onfocuscapture: this.#m, onblurcapture: this.#y };
}
function nn(r = [...globalThis.bitsDismissableLayers]) {
	return r.findLast(([t, { current: e }]) => e === 'close' || e === 'ignore');
}
function rn(r) {
	const t = [...globalThis.bitsDismissableLayers],
		e = nn(t);
	if (e) return e[0].opts.ref.current === r;
	const [n] = t[0];
	return n.opts.ref.current === r;
}
function sn(r, t) {
	const e = r.target;
	if (!wt(e)) return !1;
	const n = !!e.closest(`[${Ze}]`);
	if ('button' in r && r.button > 0 && !n) return !1;
	if ('button' in r && r.button === 0 && n) return !0;
	const s = !!t.closest(`[${Je}]`);
	return n && s ? !1 : At(e).documentElement.contains(e) && !xt(t, e) && ye(r, t);
}
function gt(r) {
	const t = r.currentTarget,
		e = r.target;
	let n;
	r instanceof PointerEvent
		? (n = new PointerEvent(r.type, r))
		: (n = new PointerEvent('pointerdown', r));
	let s = !1;
	return new Proxy(n, {
		get: (i, a) =>
			a === 'currentTarget'
				? t
				: a === 'target'
					? e
					: a === 'preventDefault'
						? () => {
								((s = !0), typeof i.preventDefault == 'function' && i.preventDefault());
							}
						: a === 'defaultPrevented'
							? s
							: a in i
								? i[a]
								: r[a]
	});
}
function Mn(r, t) {
	D(t, !0);
	let e = p(t, 'interactOutsideBehavior', 3, 'close'),
		n = p(t, 'onInteractOutside', 3, v),
		s = p(t, 'onFocusOutside', 3, v),
		o = p(t, 'isValidEvent', 3, () => !1);
	const i = it.create({
		id: d(() => t.id),
		interactOutsideBehavior: d(() => e()),
		onInteractOutside: d(() => n()),
		enabled: d(() => t.enabled),
		onFocusOutside: d(() => s()),
		isValidEvent: d(() => o()),
		ref: t.ref
	});
	var a = V(),
		u = z(a);
	(q(
		u,
		() => t.children ?? H,
		() => ({ props: i.props })
	),
		Y(r, a),
		P());
}
globalThis.bitsEscapeLayers ??= new Map();
class ot {
	static create(t) {
		return new ot(t);
	}
	opts;
	domContext;
	constructor(t) {
		((this.opts = t), (this.domContext = new et(this.opts.ref)));
		let e = v;
		y(
			() => t.enabled.current,
			(n) => (
				n && (globalThis.bitsEscapeLayers.set(this, t.escapeKeydownBehavior), (e = this.#t())),
				() => {
					(e(), globalThis.bitsEscapeLayers.delete(this));
				}
			)
		);
	}
	#t = () => f(this.domContext.getDocument(), 'keydown', this.#e, { passive: !1 });
	#e = (t) => {
		if (t.key !== se || !on(this)) return;
		const e = new KeyboardEvent(t.type, t);
		t.preventDefault();
		const n = this.opts.escapeKeydownBehavior.current;
		(n !== 'close' && n !== 'defer-otherwise-close') || this.opts.onEscapeKeydown.current(e);
	};
}
function on(r) {
	const t = [...globalThis.bitsEscapeLayers],
		e = t.findLast(([s, { current: o }]) => o === 'close' || o === 'ignore');
	if (e) return e[0] === r;
	const [n] = t[0];
	return n === r;
}
function En(r, t) {
	D(t, !0);
	let e = p(t, 'escapeKeydownBehavior', 3, 'close'),
		n = p(t, 'onEscapeKeydown', 3, v);
	ot.create({
		escapeKeydownBehavior: d(() => e()),
		onEscapeKeydown: d(() => n()),
		enabled: d(() => t.enabled),
		ref: t.ref
	});
	var s = V(),
		o = z(s);
	(q(o, () => t.children ?? H), Y(r, s), P());
}
class at {
	static instance;
	#t = ce([]);
	#e = new WeakMap();
	#n = new WeakMap();
	static getInstance() {
		return (this.instance || (this.instance = new at()), this.instance);
	}
	register(t) {
		const e = this.getActive();
		e && e !== t && e.pause();
		const n = document.activeElement;
		(n && n !== document.body && this.#n.set(t, n),
			(this.#t.current = this.#t.current.filter((s) => s !== t)),
			this.#t.current.unshift(t));
	}
	unregister(t) {
		this.#t.current = this.#t.current.filter((n) => n !== t);
		const e = this.getActive();
		e && e.resume();
	}
	getActive() {
		return this.#t.current[0];
	}
	setFocusMemory(t, e) {
		this.#e.set(t, e);
	}
	getFocusMemory(t) {
		return this.#e.get(t);
	}
	isActiveScope(t) {
		return this.getActive() === t;
	}
	setPreFocusMemory(t, e) {
		this.#n.set(t, e);
	}
	getPreFocusMemory(t) {
		return this.#n.get(t);
	}
	clearPreFocusMemory(t) {
		this.#n.delete(t);
	}
}
class ut {
	#t = !1;
	#e = null;
	#n = at.getInstance();
	#r = [];
	#s;
	constructor(t) {
		this.#s = t;
	}
	get paused() {
		return this.#t;
	}
	pause() {
		this.#t = !0;
	}
	resume() {
		this.#t = !1;
	}
	#i() {
		for (const t of this.#r) t();
		this.#r = [];
	}
	mount(t) {
		(this.#e && this.unmount(), (this.#e = t), this.#n.register(this), this.#u(), this.#a());
	}
	unmount() {
		this.#e &&
			(this.#i(),
			this.#o(),
			this.#n.unregister(this),
			this.#n.clearPreFocusMemory(this),
			(this.#e = null));
	}
	#a() {
		if (!this.#e) return;
		const t = new CustomEvent('focusScope.onOpenAutoFocus', { bubbles: !1, cancelable: !0 });
		(this.#s.onOpenAutoFocus.current(t),
			t.defaultPrevented ||
				requestAnimationFrame(() => {
					if (!this.#e) return;
					const e = this.#l();
					e ? (e.focus(), this.#n.setFocusMemory(this, e)) : this.#e.focus();
				}));
	}
	#o() {
		const t = new CustomEvent('focusScope.onCloseAutoFocus', { bubbles: !1, cancelable: !0 });
		if ((this.#s.onCloseAutoFocus.current?.(t), !t.defaultPrevented)) {
			const e = this.#n.getPreFocusMemory(this);
			if (e && document.contains(e))
				try {
					e.focus();
				} catch {
					document.body.focus();
				}
		}
	}
	#u() {
		if (!this.#e || !this.#s.trap.current) return;
		const t = this.#e,
			e = t.ownerDocument,
			n = (i) => {
				if (this.#t || !this.#n.isActiveScope(this)) return;
				const a = i.target;
				if (!a) return;
				if (t.contains(a)) this.#n.setFocusMemory(this, a);
				else {
					const l = this.#n.getFocusMemory(this);
					if (l && t.contains(l) && Kt(l)) (i.preventDefault(), l.focus());
					else {
						const g = this.#l(),
							m = this.#c()[0];
						(g || m || t).focus();
					}
				}
			},
			s = (i) => {
				if (!this.#s.loop || this.#t || i.key !== 'Tab' || !this.#n.isActiveScope(this)) return;
				const a = this.#h();
				if (a.length < 2) return;
				const u = a[0],
					l = a[a.length - 1];
				!i.shiftKey && e.activeElement === l
					? (i.preventDefault(), u.focus())
					: i.shiftKey && e.activeElement === u && (i.preventDefault(), l.focus());
			};
		this.#r.push(f(e, 'focusin', n, { capture: !0 }), f(t, 'keydown', s));
		const o = new MutationObserver(() => {
			const i = this.#n.getFocusMemory(this);
			if (i && !t.contains(i)) {
				const a = this.#l(),
					u = this.#c()[0],
					l = a || u;
				l ? (l.focus(), this.#n.setFocusMemory(this, l)) : t.focus();
			}
		});
		(o.observe(t, { childList: !0, subtree: !0 }), this.#r.push(() => o.disconnect()));
	}
	#h() {
		return this.#e ? Lt(this.#e, { includeContainer: !1, getShadowRoot: !0 }) : [];
	}
	#l() {
		return this.#h()[0] || null;
	}
	#c() {
		return this.#e ? Bt(this.#e, { includeContainer: !1, getShadowRoot: !0 }) : [];
	}
	static use(t) {
		let e = null;
		return (
			y([() => t.ref.current, () => t.enabled.current], ([n, s]) => {
				n && s ? (e || (e = new ut(t)), e.mount(n)) : e && (e.unmount(), (e = null));
			}),
			R(() => {
				e?.unmount();
			}),
			{
				get props() {
					return { tabindex: -1 };
				}
			}
		);
	}
}
function Cn(r, t) {
	D(t, !0);
	let e = p(t, 'enabled', 3, !1),
		n = p(t, 'trapFocus', 3, !1),
		s = p(t, 'loop', 3, !1),
		o = p(t, 'onCloseAutoFocus', 3, v),
		i = p(t, 'onOpenAutoFocus', 3, v);
	const a = ut.use({
		enabled: d(() => e()),
		trap: d(() => n()),
		loop: s(),
		onCloseAutoFocus: d(() => o()),
		onOpenAutoFocus: d(() => i()),
		ref: t.ref
	});
	var u = V(),
		l = z(u);
	(q(
		l,
		() => t.focusScope ?? H,
		() => ({ props: a.props })
	),
		Y(r, u),
		P());
}
globalThis.bitsTextSelectionLayers ??= new Map();
class ct {
	static create(t) {
		return new ct(t);
	}
	opts;
	domContext;
	#t = v;
	constructor(t) {
		((this.opts = t), (this.domContext = new et(t.ref)));
		let e = v;
		y(
			() => this.opts.enabled.current,
			(n) => (
				n &&
					(globalThis.bitsTextSelectionLayers.set(this, this.opts.enabled), e(), (e = this.#e())),
				() => {
					(e(), this.#r(), globalThis.bitsTextSelectionLayers.delete(this));
				}
			)
		);
	}
	#e() {
		return C(
			f(this.domContext.getDocument(), 'pointerdown', this.#n),
			f(this.domContext.getDocument(), 'pointerup', le(this.#r, this.opts.onPointerUp.current))
		);
	}
	#n = (t) => {
		const e = this.opts.ref.current,
			n = t.target;
		!M(e) ||
			!M(n) ||
			!this.opts.enabled.current ||
			!un(this) ||
			!oe(e, n) ||
			(this.opts.onPointerDown.current(t),
			!t.defaultPrevented && (this.#t = an(e, this.domContext.getDocument().body)));
	};
	#r = () => {
		(this.#t(), (this.#t = v));
	};
}
const vt = (r) => r.style.userSelect || r.style.webkitUserSelect;
function an(r, t) {
	const e = vt(t),
		n = vt(r);
	return (
		L(t, 'none'),
		L(r, 'text'),
		() => {
			(L(t, e), L(r, n));
		}
	);
}
function L(r, t) {
	((r.style.userSelect = t), (r.style.webkitUserSelect = t));
}
function un(r) {
	const t = [...globalThis.bitsTextSelectionLayers];
	if (!t.length) return !1;
	const e = t.at(-1);
	return e ? e[0] === r : !1;
}
function xn(r, t) {
	D(t, !0);
	let e = p(t, 'preventOverflowTextSelection', 3, !0),
		n = p(t, 'onPointerDown', 3, v),
		s = p(t, 'onPointerUp', 3, v);
	ct.create({
		id: d(() => t.id),
		onPointerDown: d(() => n()),
		onPointerUp: d(() => s()),
		enabled: d(() => t.enabled && e()),
		ref: t.ref
	});
	var o = V(),
		i = z(o);
	(q(i, () => t.children ?? H), Y(r, o), P());
}
class cn {
	#t;
	#e = 0;
	#n = b();
	#r;
	constructor(t) {
		this.#t = t;
	}
	#s() {
		((this.#e -= 1),
			this.#r && this.#e <= 0 && (this.#r(), h(this.#n, void 0), (this.#r = void 0)));
	}
	get(...t) {
		return (
			(this.#e += 1),
			c(this.#n) === void 0 &&
				(this.#r = yt(() => {
					h(this.#n, this.#t(...t), !0);
				})),
			x(() => () => {
				this.#s();
			}),
			c(this.#n)
		);
	}
}
const K = new pe();
let B = b(null),
	X = null,
	F = null,
	I = !1;
const mt = d(() => {
	for (const r of K.values()) if (r) return !0;
	return !1;
});
let Z = null;
const ln = new cn(() => {
	function r() {
		(document.body.setAttribute('style', c(B) ?? ''),
			document.body.style.removeProperty('--scrollbar-width'),
			dt && X?.(),
			h(B, null));
	}
	function t() {
		F !== null && (window.clearTimeout(F), (F = null));
	}
	function e(s, o) {
		(t(), (I = !0), (Z = Date.now()));
		const i = Z,
			a = () => {
				((F = null), Z === i && (Ht(K) ? (I = !1) : ((I = !1), o())));
			},
			u = s === null ? 24 : s;
		F = window.setTimeout(a, u);
	}
	function n() {
		c(B) === null && K.size === 0 && !I && h(B, document.body.getAttribute('style'), !0);
	}
	return (
		y(
			() => mt.current,
			() => {
				if (!mt.current) return;
				(n(), (I = !1));
				const s = getComputedStyle(document.body),
					o = window.innerWidth - document.documentElement.clientWidth,
					a = {
						padding: Number.parseInt(s.paddingRight ?? '0', 10) + o,
						margin: Number.parseInt(s.marginRight ?? '0', 10)
					};
				(o > 0 &&
					((document.body.style.paddingRight = `${a.padding}px`),
					(document.body.style.marginRight = `${a.margin}px`),
					document.body.style.setProperty('--scrollbar-width', `${o}px`),
					(document.body.style.overflow = 'hidden')),
					dt &&
						(X = f(
							document,
							'touchmove',
							(u) => {
								u.target === document.documentElement &&
									(u.touches.length > 1 || u.preventDefault());
							},
							{ passive: !1 }
						)),
					w(() => {
						((document.body.style.pointerEvents = 'none'),
							(document.body.style.overflow = 'hidden'));
					}));
			}
		),
		R(() => () => {
			X?.();
		}),
		{
			get lockMap() {
				return K;
			},
			resetBodyStyle: r,
			scheduleCleanupIfNoNewLocks: e,
			cancelPendingCleanup: t,
			ensureInitialStyleCaptured: n
		}
	);
});
class hn {
	#t = fe();
	#e;
	#n = () => null;
	#r;
	locked;
	constructor(t, e = () => null) {
		((this.#e = t),
			(this.#n = e),
			(this.#r = ln.get()),
			this.#r &&
				(this.#r.cancelPendingCleanup(),
				this.#r.ensureInitialStyleCaptured(),
				this.#r.lockMap.set(this.#t, this.#e ?? !1),
				(this.locked = d(
					() => this.#r.lockMap.get(this.#t) ?? !1,
					(n) => this.#r.lockMap.set(this.#t, n)
				)),
				R(() => {
					if ((this.#r.lockMap.delete(this.#t), Ht(this.#r.lockMap))) return;
					const n = this.#n();
					this.#r.scheduleCleanupIfNoNewLocks(n, () => {
						this.#r.resetBodyStyle();
					});
				})));
	}
}
function Ht(r) {
	for (const [t, e] of r) if (e) return !0;
	return !1;
}
function An(r, t) {
	D(t, !0);
	let e = p(t, 'preventScroll', 3, !0),
		n = p(t, 'restoreScrollDelay', 3, null);
	(e() && new hn(e(), () => n()), P());
}
let k = b(!1);
class S {
	static _refs = 0;
	static _cleanup;
	constructor() {
		x(
			() => (
				S._refs === 0 &&
					(S._cleanup = yt(() => {
						const t = [],
							e = (s) => {
								h(k, !1);
							},
							n = (s) => {
								h(k, !0);
							};
						return (
							t.push(
								f(document, 'pointerdown', e, { capture: !0 }),
								f(document, 'pointermove', e, { capture: !0 }),
								f(document, 'keydown', n, { capture: !0 })
							),
							C(...t)
						);
					})),
				S._refs++,
				() => {
					(S._refs--, S._refs === 0 && (h(k, !1), S._cleanup?.()));
				}
			)
		);
	}
	get current() {
		return c(k);
	}
	set current(t) {
		h(k, t, !0);
	}
}
export {
	qt as D,
	En as E,
	Cn as F,
	Ve as G,
	zt as M,
	ve as P,
	An as S,
	xn as T,
	Gt as a,
	Ut as b,
	Vt as c,
	Mn as d,
	R as o
};
