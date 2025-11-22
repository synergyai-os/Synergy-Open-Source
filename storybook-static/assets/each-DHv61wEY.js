import {
	K as B,
	L as G,
	v as X,
	M as J,
	N as j,
	O as R,
	P as b,
	C as ee,
	Q as g,
	R as F,
	T as ae,
	U as y,
	V as K,
	W as P,
	X as re,
	Y as Q,
	Z as ne,
	$ as le,
	a0 as O,
	q as ie,
	a1 as W,
	a2 as fe,
	a3 as ue,
	a4 as te,
	a5 as ve,
	a6 as se,
	a7 as de
} from './iframe-DYn7RqBV.js';
let oe = !1;
function me(i, a) {
	return a;
}
function ce(i, a, e) {
	for (var u = i.items, v = [], d = a.length, s = 0; s < d; s++) te(a[s].e, v, !0);
	var h = d > 0 && v.length === 0 && e !== null;
	if (h) {
		var A = e.parentNode;
		(ve(A), A.append(e), u.clear(), I(i, a[0].prev, a[d - 1].next));
	}
	se(v, () => {
		for (var E = 0; E < d; E++) {
			var _ = a[E];
			(h || (u.delete(_.k), I(i, _.prev, _.next)), W(_.e, !h));
		}
	});
}
function pe(i, a, e, u, v, d = null) {
	var s = i,
		h = { flags: a, items: new Map(), first: null },
		A = (a & K) !== 0;
	if (A) {
		var E = i;
		s = E.appendChild(B());
	}
	var _ = null,
		T = !1,
		C = new Map(),
		k = J(() => {
			var m = e();
			return re(m) ? m : m == null ? [] : P(m);
		}),
		r,
		t;
	function l() {
		(_e(t, r, h, C, s, v, a, u, e),
			d !== null &&
				(r.length === 0
					? _
						? Q(_)
						: (_ = F(() => d(s)))
					: _ !== null &&
						ne(_, () => {
							_ = null;
						})));
	}
	G(() => {
		((t ??= de), (r = X(k)));
		var m = r.length;
		if (!(T && m === 0)) {
			T = m === 0;
			var p, c, w, o;
			if (j()) {
				var n = new Set(),
					f = ee;
				for (c = 0; c < m; c += 1) {
					((w = r[c]), (o = u(w, c)));
					var x = h.items.get(o) ?? C.get(o);
					(x
						? (a & (R | b)) !== 0 && Y(x, w, c, a)
						: ((p = Z(null, h, null, null, w, o, c, v, a, e, !0)), C.set(o, p)),
						n.add(o));
				}
				for (const [S, D] of h.items) n.has(S) || f.skipped_effects.add(D.e);
				f.oncommit(l);
			} else l();
			X(k);
		}
	});
}
function _e(i, a, e, u, v, d, s, h, A) {
	var E = (s & fe) !== 0,
		_ = (s & (R | b)) !== 0,
		T = a.length,
		C = e.items,
		k = e.first,
		r = k,
		t,
		l = null,
		m,
		p = [],
		c = [],
		w,
		o,
		n,
		f;
	if (E)
		for (f = 0; f < T; f += 1)
			((w = a[f]),
				(o = h(w, f)),
				(n = C.get(o)),
				n !== void 0 && (n.a?.measure(), (m ??= new Set()).add(n)));
	for (f = 0; f < T; f += 1) {
		if (((w = a[f]), (o = h(w, f)), (n = C.get(o)), n === void 0)) {
			var x = u.get(o);
			if (x !== void 0) {
				(u.delete(o), C.set(o, x));
				var S = l ? l.next : r;
				(I(e, l, x), I(e, x, S), V(x, S, v), (l = x));
			} else {
				var D = r ? r.e.nodes_start : v;
				l = Z(D, e, l, l === null ? e.first : l.next, w, o, f, d, s, A);
			}
			(C.set(o, l), (p = []), (c = []), (r = l.next));
			continue;
		}
		if (
			(_ && Y(n, w, f, s),
			(n.e.f & O) !== 0 && (Q(n.e), E && (n.a?.unfix(), (m ??= new Set()).delete(n))),
			n !== r)
		) {
			if (t !== void 0 && t.has(n)) {
				if (p.length < c.length) {
					var H = c[0],
						M;
					l = H.prev;
					var U = p[0],
						L = p[p.length - 1];
					for (M = 0; M < p.length; M += 1) V(p[M], H, v);
					for (M = 0; M < c.length; M += 1) t.delete(c[M]);
					(I(e, U.prev, L.next),
						I(e, l, U),
						I(e, L, H),
						(r = H),
						(l = L),
						(f -= 1),
						(p = []),
						(c = []));
				} else
					(t.delete(n),
						V(n, r, v),
						I(e, n.prev, n.next),
						I(e, n, l === null ? e.first : l.next),
						I(e, l, n),
						(l = n));
				continue;
			}
			for (p = [], c = []; r !== null && r.k !== o; )
				((r.e.f & O) === 0 && (t ??= new Set()).add(r), c.push(r), (r = r.next));
			if (r === null) continue;
			n = r;
		}
		(p.push(n), (l = n), (r = n.next));
	}
	if (r !== null || t !== void 0) {
		for (var N = t === void 0 ? [] : P(t); r !== null; )
			((r.e.f & O) === 0 && N.push(r), (r = r.next));
		var q = N.length;
		if (q > 0) {
			var $ = (s & K) !== 0 && T === 0 ? v : null;
			if (E) {
				for (f = 0; f < q; f += 1) N[f].a?.measure();
				for (f = 0; f < q; f += 1) N[f].a?.fix();
			}
			ce(e, N, $);
		}
	}
	(E &&
		ie(() => {
			if (m !== void 0) for (n of m) n.a?.apply();
		}),
		(i.first = e.first && e.first.e),
		(i.last = l && l.e));
	for (var z of u.values()) W(z.e);
	u.clear();
}
function Y(i, a, e, u) {
	((u & R) !== 0 && g(i.v, a), (u & b) !== 0 ? g(i.i, e) : (i.i = e));
}
function Z(i, a, e, u, v, d, s, h, A, E, _) {
	var T = (A & R) !== 0,
		C = (A & le) === 0,
		k = T ? (C ? ae(v, !1, !1) : y(v)) : v,
		r = (A & b) === 0 ? s : y(s),
		t = { i: r, v: k, k: d, a: null, e: null, prev: e, next: u };
	try {
		if (i === null) {
			var l = document.createDocumentFragment();
			l.append((i = B()));
		}
		return (
			(t.e = F(() => h(i, k, r, E), oe)),
			(t.e.prev = e && e.e),
			(t.e.next = u && u.e),
			e === null ? _ || (a.first = t) : ((e.next = t), (e.e.next = t.e)),
			u !== null && ((u.prev = t), (u.e.prev = t.e)),
			t
		);
	} finally {
	}
}
function V(i, a, e) {
	for (
		var u = i.next ? i.next.e.nodes_start : e, v = a ? a.e.nodes_start : e, d = i.e.nodes_start;
		d !== null && d !== u;

	) {
		var s = ue(d);
		(v.before(d), (d = s));
	}
}
function I(i, a, e) {
	(a === null ? (i.first = e) : ((a.next = e), (a.e.next = e && e.e)),
		e !== null && ((e.prev = a), (e.e.prev = a && a.e)));
}
export { pe as e, me as i };
