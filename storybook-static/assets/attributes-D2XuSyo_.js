import {
	L as $,
	a1 as I,
	R as P,
	l as O,
	X as B,
	af as G,
	ag as z,
	ah as F,
	A as K,
	C as N,
	D as W,
	ai as X,
	v as Z,
	aj as J,
	ak as Q,
	al as m,
	E as x,
	am as ee,
	an as ae,
	ao as te,
	ap as se,
	aq as re,
	ar as ie,
	as as ue,
	at as fe
} from './iframe-DYn7RqBV.js';
import { c as le, s as oe } from './class-BLXIZATI.js';
import { s as ne } from './style-MviLiK55.js';
function ce(e, t) {
	var a = void 0,
		i;
	$(() => {
		a !== (a = t()) &&
			(i && (I(i), (i = null)),
			a &&
				(i = P(() => {
					O(() => a(e));
				})));
	});
}
function L(e, t, a = !1) {
	if (e.multiple) {
		if (t == null) return;
		if (!B(t)) return G();
		for (var i of e.options) i.selected = t.includes(k(i));
		return;
	}
	for (i of e.options) {
		var l = k(i);
		if (z(l, t)) {
			i.selected = !0;
			return;
		}
	}
	(!a || t !== void 0) && (e.selectedIndex = -1);
}
function U(e) {
	var t = new MutationObserver(() => {
		L(e, e.__value);
	});
	(t.observe(e, { childList: !0, subtree: !0, attributes: !0, attributeFilter: ['value'] }),
		F(() => {
			t.disconnect();
		}));
}
function he(e, t, a = t) {
	var i = new WeakSet(),
		l = !0;
	(K(e, 'change', (v) => {
		var o = v ? '[selected]' : ':checked',
			_;
		if (e.multiple) _ = [].map.call(e.querySelectorAll(o), k);
		else {
			var h = e.querySelector(o) ?? e.querySelector('option:not([disabled])');
			_ = h && k(h);
		}
		(a(_), N !== null && i.add(N));
	}),
		O(() => {
			var v = t();
			if (e === document.activeElement) {
				var o = W ?? N;
				if (i.has(o)) return;
			}
			if ((L(e, v, l), l && v === void 0)) {
				var _ = e.querySelector(':checked');
				_ !== null && ((v = k(_)), a(v));
			}
			((e.__value = v), (l = !1));
		}),
		U(e));
}
function k(e) {
	return '__value' in e ? e.__value : e.value;
}
const g = Symbol('class'),
	E = Symbol('style'),
	j = Symbol('is custom element'),
	D = Symbol('is html');
function ye(e, t) {
	var a = C(e);
	a.value === (a.value = t ?? void 0) ||
		(e.value === t && (t !== 0 || e.nodeName !== 'PROGRESS')) ||
		(e.value = t ?? '');
}
function ve(e, t) {
	t ? e.hasAttribute('selected') || e.setAttribute('selected', '') : e.removeAttribute('selected');
}
function q(e, t, a, i) {
	var l = C(e);
	l[t] !== (l[t] = a) &&
		(t === 'loading' && (e[ie] = a),
		a == null
			? e.removeAttribute(t)
			: typeof a != 'string' && H(e).includes(t)
				? (e[t] = a)
				: e.setAttribute(t, a));
}
function _e(e, t, a, i, l = !1, v = !1) {
	var o = C(e),
		_ = o[j],
		h = !o[D],
		f = t || {},
		b = e.tagName === 'OPTION';
	for (var S in t) S in a || (a[S] = null);
	(a.class ? (a.class = le(a.class)) : a[g] && (a.class = null), a[E] && (a.style ??= null));
	var w = H(e);
	for (const r in a) {
		let u = a[r];
		if (b && r === 'value' && u == null) {
			((e.value = e.__value = ''), (f[r] = u));
			continue;
		}
		if (r === 'class') {
			var T = e.namespaceURI === 'http://www.w3.org/1999/xhtml';
			(oe(e, T, u, i, t?.[g], a[g]), (f[r] = u), (f[g] = a[g]));
			continue;
		}
		if (r === 'style') {
			(ne(e, u, t?.[E], a[E]), (f[r] = u), (f[E] = a[E]));
			continue;
		}
		var d = f[r];
		if (!(u === d && !(u === void 0 && e.hasAttribute(r)))) {
			f[r] = u;
			var A = r[0] + r[1];
			if (A !== '$$')
				if (A === 'on') {
					const c = {},
						y = '$$' + r;
					let n = r.slice(2);
					var p = ue(n);
					if ((Q(n) && ((n = n.slice(0, -7)), (c.capture = !0)), !p && d)) {
						if (u != null) continue;
						(e.removeEventListener(n, f[y], c), (f[y] = null));
					}
					if (u != null)
						if (p) ((e[`__${n}`] = u), x([n]));
						else {
							let V = function (Y) {
								f[r].call(this, Y);
							};
							f[y] = m(n, e, V, c);
						}
					else p && (e[`__${n}`] = void 0);
				} else if (r === 'style') q(e, r, u);
				else if (r === 'autofocus') ee(e, !!u);
				else if (!_ && (r === '__value' || (r === 'value' && u != null))) e.value = e.__value = u;
				else if (r === 'selected' && b) ve(e, u);
				else {
					var s = r;
					h || (s = ae(s));
					var M = s === 'defaultValue' || s === 'defaultChecked';
					if (u == null && !_ && !M)
						if (((o[r] = null), s === 'value' || s === 'checked')) {
							let c = e;
							const y = t === void 0;
							if (s === 'value') {
								let n = c.defaultValue;
								(c.removeAttribute(s), (c.defaultValue = n), (c.value = c.__value = y ? n : null));
							} else {
								let n = c.defaultChecked;
								(c.removeAttribute(s), (c.defaultChecked = n), (c.checked = y ? n : !1));
							}
						} else e.removeAttribute(r);
					else
						M || (w.includes(s) && (_ || typeof u != 'string'))
							? ((e[s] = u), s in o && (o[s] = te))
							: typeof u != 'function' && q(e, s, u);
				}
		}
	}
	return f;
}
function Se(e, t, a = [], i = [], l = [], v, o = !1, _ = !1) {
	X(l, a, i, (h) => {
		var f = void 0,
			b = {},
			S = e.nodeName === 'SELECT',
			w = !1;
		if (
			($(() => {
				var d = t(...h.map(Z)),
					A = _e(e, f, d, v, o, _);
				w && S && 'value' in d && L(e, d.value);
				for (let s of Object.getOwnPropertySymbols(b)) d[s] || I(b[s]);
				for (let s of Object.getOwnPropertySymbols(d)) {
					var p = d[s];
					(s.description === J &&
						(!f || p !== f[s]) &&
						(b[s] && I(b[s]), (b[s] = P(() => ce(e, () => p)))),
						(A[s] = p));
				}
				f = A;
			}),
			S)
		) {
			var T = e;
			O(() => {
				(L(T, f.value, !0), U(T));
			});
		}
		w = !0;
	});
}
function C(e) {
	return (e.__attributes ??= { [j]: e.nodeName.includes('-'), [D]: e.namespaceURI === se });
}
var R = new Map();
function H(e) {
	var t = e.getAttribute('is') || e.nodeName,
		a = R.get(t);
	if (a) return a;
	R.set(t, (a = []));
	for (var i, l = e, v = Element.prototype; v !== l; ) {
		i = fe(l);
		for (var o in i) i[o].set && a.push(o);
		l = re(l);
	}
	return a;
}
export { Se as a, ye as b, he as c, q as s };
