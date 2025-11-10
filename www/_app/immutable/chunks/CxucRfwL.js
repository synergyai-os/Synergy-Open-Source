import {
	i as Y,
	G as $,
	u as H,
	Z as q,
	h as g,
	y as F,
	aU as X,
	aV as J,
	ae as Q,
	a3 as m,
	w as M,
	a5 as x,
	aW as ee,
	aX as re,
	j as ae,
	aY as se,
	n as j,
	aZ as te,
	a_ as ie,
	R as ue,
	a$ as fe,
	b0 as le,
	b1 as oe,
	b2 as ce
} from './kOT-I_MI.js';
import { j as ne, d as ve } from './ClEwQIZJ.js';
import { b as _e, n as de, c as be } from './BiFF_jB9.js';
import { t as he, c as ye, s as pe } from './DjvPQNYr.js';
function Ae(e, a) {
	var r = void 0,
		s;
	Y(() => {
		r !== (r = a()) &&
			(s && ($(s), (s = null)),
			r &&
				(s = H(() => {
					q(() => r(e));
				})));
	});
}
function P(e, a = {}, r, s) {
	for (var t in r) {
		var f = r[t];
		a[t] !== f && (r[t] == null ? e.style.removeProperty(t) : e.style.setProperty(t, f, s));
	}
}
function ge(e, a, r, s) {
	var t = e.__style;
	if (g || t !== a) {
		var f = he(a, s);
		((!g || f !== e.getAttribute('style')) &&
			(f == null ? e.removeAttribute('style') : (e.style.cssText = f)),
			(e.__style = a));
	} else
		s && (Array.isArray(s) ? (P(e, r?.[0], s[0]), P(e, r?.[1], s[1], 'important')) : P(e, r, s));
	return s;
}
function L(e, a, r = !1) {
	if (e.multiple) {
		if (a == null) return;
		if (!F(a)) return X();
		for (var s of e.options) s.selected = a.includes(E(s));
		return;
	}
	for (s of e.options) {
		var t = E(s);
		if (J(t, a)) {
			s.selected = !0;
			return;
		}
	}
	(!r || a !== void 0) && (e.selectedIndex = -1);
}
function Z(e) {
	var a = new MutationObserver(() => {
		L(e, e.__value);
	});
	(a.observe(e, { childList: !0, subtree: !0, attributes: !0, attributeFilter: ['value'] }),
		Q(() => {
			a.disconnect();
		}));
}
function Le(e, a, r = a) {
	var s = new WeakSet(),
		t = !0;
	(m(e, 'change', (f) => {
		var _ = f ? '[selected]' : ':checked',
			d;
		if (e.multiple) d = [].map.call(e.querySelectorAll(_), E);
		else {
			var b = e.querySelector(_) ?? e.querySelector('option:not([disabled])');
			d = b && E(b);
		}
		(r(d), M !== null && s.add(M));
	}),
		q(() => {
			var f = a();
			if (e === document.activeElement) {
				var _ = x ?? M;
				if (s.has(_)) return;
			}
			if ((L(e, f, t), t && f === void 0)) {
				var d = e.querySelector(':checked');
				d !== null && ((f = E(d)), r(f));
			}
			((e.__value = f), (t = !1));
		}),
		Z(e));
}
function E(e) {
	return '__value' in e ? e.__value : e.value;
}
const T = Symbol('class'),
	w = Symbol('style'),
	B = Symbol('is custom element'),
	D = Symbol('is html');
function Se(e) {
	if (g) {
		var a = !1,
			r = () => {
				if (!a) {
					if (((a = !0), e.hasAttribute('value'))) {
						var s = e.value;
						(O(e, 'value', null), (e.value = s));
					}
					if (e.hasAttribute('checked')) {
						var t = e.checked;
						(O(e, 'checked', null), (e.checked = t));
					}
				}
			};
		((e.__on_r = r), ue(r), fe());
	}
}
function ke(e, a) {
	a ? e.hasAttribute('selected') || e.setAttribute('selected', '') : e.removeAttribute('selected');
}
function O(e, a, r, s) {
	var t = G(e);
	(g &&
		((t[a] = e.getAttribute(a)),
		a === 'src' || a === 'srcset' || (a === 'href' && e.nodeName === 'LINK'))) ||
		(t[a] !== (t[a] = r) &&
			(a === 'loading' && (e[oe] = r),
			r == null
				? e.removeAttribute(a)
				: typeof r != 'string' && K(e).includes(a)
					? (e[a] = r)
					: e.setAttribute(a, r)));
}
function Ne(e, a, r, s, t = !1, f = !1) {
	if (g && t && e.tagName === 'INPUT') {
		var _ = e,
			d = _.type === 'checkbox' ? 'defaultChecked' : 'defaultValue';
		d in r || Se(_);
	}
	var b = G(e),
		h = b[B],
		p = !b[D];
	let S = g && h;
	S && j(!1);
	var l = a || {},
		k = e.tagName === 'OPTION';
	for (var y in a) y in r || (r[y] = null);
	(r.class ? (r.class = ye(r.class)) : r[T] && (r.class = null), r[w] && (r.style ??= null));
	var I = K(e);
	for (const i in r) {
		let u = r[i];
		if (k && i === 'value' && u == null) {
			((e.value = e.__value = ''), (l[i] = u));
			continue;
		}
		if (i === 'class') {
			var N = e.namespaceURI === 'http://www.w3.org/1999/xhtml';
			(pe(e, N, u, s, a?.[T], r[T]), (l[i] = u), (l[T] = r[T]));
			continue;
		}
		if (i === 'style') {
			(ge(e, u, a?.[w], r[w]), (l[i] = u), (l[w] = r[w]));
			continue;
		}
		var n = l[i];
		if (!(u === n && !(u === void 0 && e.hasAttribute(i)))) {
			l[i] = u;
			var U = i[0] + i[1];
			if (U !== '$$')
				if (U === 'on') {
					const v = {},
						A = '$$' + i;
					let o = i.slice(2);
					var C = be(o);
					if ((_e(o) && ((o = o.slice(0, -7)), (v.capture = !0)), !C && n)) {
						if (u != null) continue;
						(e.removeEventListener(o, l[A], v), (l[A] = null));
					}
					if (u != null)
						if (C) ((e[`__${o}`] = u), ve([o]));
						else {
							let W = function (z) {
								l[i].call(this, z);
							};
							l[A] = ne(o, e, W, v);
						}
					else C && (e[`__${o}`] = void 0);
				} else if (i === 'style') O(e, i, u);
				else if (i === 'autofocus') te(e, !!u);
				else if (!h && (i === '__value' || (i === 'value' && u != null))) e.value = e.__value = u;
				else if (i === 'selected' && k) ke(e, u);
				else {
					var c = i;
					p || (c = de(c));
					var V = c === 'defaultValue' || c === 'defaultChecked';
					if (u == null && !h && !V)
						if (((b[i] = null), c === 'value' || c === 'checked')) {
							let v = e;
							const A = a === void 0;
							if (c === 'value') {
								let o = v.defaultValue;
								(v.removeAttribute(c), (v.defaultValue = o), (v.value = v.__value = A ? o : null));
							} else {
								let o = v.defaultChecked;
								(v.removeAttribute(c), (v.defaultChecked = o), (v.checked = A ? o : !1));
							}
						} else e.removeAttribute(i);
					else
						V || (I.includes(c) && (h || typeof u != 'string'))
							? ((e[c] = u), c in b && (b[c] = ie))
							: typeof u != 'function' && O(e, c, u);
				}
		}
	}
	return (S && j(!0), l);
}
function Oe(e, a, r = [], s = [], t = [], f, _ = !1, d = !1) {
	re(t, r, s, (b) => {
		var h = void 0,
			p = {},
			S = e.nodeName === 'SELECT',
			l = !1;
		if (
			(Y(() => {
				var y = a(...b.map(ae)),
					I = Ne(e, h, y, f, _, d);
				l && S && 'value' in y && L(e, y.value);
				for (let n of Object.getOwnPropertySymbols(p)) y[n] || $(p[n]);
				for (let n of Object.getOwnPropertySymbols(y)) {
					var N = y[n];
					(n.description === se &&
						(!h || N !== h[n]) &&
						(p[n] && $(p[n]), (p[n] = H(() => Ae(e, () => N)))),
						(I[n] = N));
				}
				h = I;
			}),
			S)
		) {
			var k = e;
			q(() => {
				(L(k, h.value, !0), Z(k));
			});
		}
		l = !0;
	});
}
function G(e) {
	return (e.__attributes ??= { [B]: e.nodeName.includes('-'), [D]: e.namespaceURI === ee });
}
var R = new Map();
function K(e) {
	var a = e.getAttribute('is') || e.nodeName,
		r = R.get(a);
	if (r) return r;
	R.set(a, (r = []));
	for (var s, t = e, f = Element.prototype; f !== t; ) {
		s = ce(t);
		for (var _ in s) s[_].set && r.push(_);
		t = le(t);
	}
	return r;
}
export { ge as a, Oe as b, Le as c, Se as r, O as s };
