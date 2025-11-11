import {
	ae as T,
	ao as L,
	af as m,
	z as U,
	V as y,
	j as v,
	ap as g,
	aq as N,
	ar as j,
	ak as B,
	k as M,
	U as Y,
	as as $,
	P as z,
	at as K,
	au as q,
	$ as C,
	a8 as G,
	av as V,
	aw as Z,
	ax as F,
	ay as d,
	a0 as I,
	az as x
} from './kOT-I_MI.js';
import { s as H, g as J } from './C3G0mfPY.js';
let _ = !1,
	S = Symbol();
function re(e, r, s) {
	const n = (s[r] ??= { store: null, source: U(void 0), unsubscribe: m });
	if (n.store !== e && !(S in s))
		if ((n.unsubscribe(), (n.store = e ?? null), e == null))
			((n.source.v = void 0), (n.unsubscribe = m));
		else {
			var t = !0;
			((n.unsubscribe = H(e, (u) => {
				t ? (n.source.v = u) : y(n.source, u);
			})),
				(t = !1));
		}
	return e && S in s ? J(e) : v(n.source);
}
function ne() {
	const e = {};
	function r() {
		T(() => {
			for (var s in e) e[s].unsubscribe();
			L(e, S, { enumerable: !1, value: !0 });
		});
	}
	return [e, r];
}
function Q(e) {
	var r = _;
	try {
		return ((_ = !1), [e(), _]);
	} finally {
		_ = r;
	}
}
const W = {
	get(e, r) {
		if (!e.exclude.includes(r)) return e.props[r];
	},
	set(e, r) {
		return !1;
	},
	getOwnPropertyDescriptor(e, r) {
		if (!e.exclude.includes(r) && r in e.props)
			return { enumerable: !0, configurable: !0, value: e.props[r] };
	},
	has(e, r) {
		return e.exclude.includes(r) ? !1 : r in e.props;
	},
	ownKeys(e) {
		return Reflect.ownKeys(e.props).filter((r) => !e.exclude.includes(r));
	}
};
function se(e, r, s) {
	return new Proxy({ props: e, exclude: r }, W);
}
const X = {
	get(e, r) {
		let s = e.props.length;
		for (; s--; ) {
			let n = e.props[s];
			if ((d(n) && (n = n()), typeof n == 'object' && n !== null && r in n)) return n[r];
		}
	},
	set(e, r, s) {
		let n = e.props.length;
		for (; n--; ) {
			let t = e.props[n];
			d(t) && (t = t());
			const u = g(t, r);
			if (u && u.set) return (u.set(s), !0);
		}
		return !1;
	},
	getOwnPropertyDescriptor(e, r) {
		let s = e.props.length;
		for (; s--; ) {
			let n = e.props[s];
			if ((d(n) && (n = n()), typeof n == 'object' && n !== null && r in n)) {
				const t = g(n, r);
				return (t && !t.configurable && (t.configurable = !0), t);
			}
		}
	},
	has(e, r) {
		if (r === I || r === x) return !1;
		for (let s of e.props) if ((d(s) && (s = s()), s != null && r in s)) return !0;
		return !1;
	},
	ownKeys(e) {
		const r = [];
		for (let s of e.props)
			if ((d(s) && (s = s()), !!s)) {
				for (const n in s) r.includes(n) || r.push(n);
				for (const n of Object.getOwnPropertySymbols(s)) r.includes(n) || r.push(n);
			}
		return r;
	}
};
function te(...e) {
	return new Proxy({ props: e }, X);
}
function ie(e, r, s, n) {
	var t = !G || (s & V) !== 0,
		u = (s & q) !== 0,
		E = (s & F) !== 0,
		a = n,
		b = !0,
		w = () => (b && ((b = !1), (a = E ? C(n) : n)), a),
		o;
	if (u) {
		var R = I in e || x in e;
		o = g(e, r)?.set ?? (R && r in e ? (i) => (e[r] = i) : void 0);
	}
	var l,
		h = !1;
	(u ? ([l, h] = Q(() => e[r])) : (l = e[r]),
		l === void 0 && n !== void 0 && ((l = w()), o && (t && N(), o(l))));
	var f;
	if (
		(t
			? (f = () => {
					var i = e[r];
					return i === void 0 ? w() : ((b = !0), i);
				})
			: (f = () => {
					var i = e[r];
					return (i !== void 0 && (a = void 0), i === void 0 ? a : i);
				}),
		t && (s & j) === 0)
	)
		return f;
	if (o) {
		var D = e.$$legacy;
		return function (i, p) {
			return arguments.length > 0 ? ((!t || !p || D || h) && o(p ? f() : i), i) : f();
		};
	}
	var P = !1,
		c = ((s & Z) !== 0 ? B : M)(() => ((P = !1), f()));
	u && v(c);
	var A = z;
	return function (i, p) {
		if (arguments.length > 0) {
			const O = p ? v(c) : t && u ? Y(i) : i;
			return (y(c, O), (P = !0), a !== void 0 && (a = O), i);
		}
		return ($ && P) || (A.f & K) !== 0 ? c.v : v(c);
	};
}
export { re as a, te as b, ie as p, se as r, ne as s };
