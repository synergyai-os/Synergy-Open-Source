const In = !1;
var Yt = Array.isArray,
	qt = Array.prototype.indexOf,
	Cn = Array.from,
	Pn = Object.defineProperty,
	ce = Object.getOwnPropertyDescriptor,
	Ht = Object.getOwnPropertyDescriptors,
	Ut = Object.prototype,
	Bt = Array.prototype,
	lt = Object.getPrototypeOf,
	et = Object.isExtensible;
function Mn(e) {
	return typeof e == 'function';
}
const Fn = () => {};
function Ln(e) {
	return e();
}
function Vt(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function ot() {
	var e,
		t,
		n = new Promise((r, s) => {
			((e = r), (t = s));
		});
	return { promise: n, resolve: e, reject: t };
}
function jn(e, t) {
	if (Array.isArray(e)) return e;
	if (!(Symbol.iterator in e)) return Array.from(e);
	const n = [];
	for (const r of e) if ((n.push(r), n.length === t)) break;
	return n;
}
const m = 2,
	He = 4,
	Se = 8,
	L = 16,
	j = 32,
	$ = 64,
	Ue = 128,
	b = 1024,
	A = 2048,
	Y = 4096,
	C = 8192,
	B = 16384,
	Be = 32768,
	we = 65536,
	Pe = 1 << 17,
	Gt = 1 << 18,
	ie = 1 << 19,
	ut = 1 << 20,
	R = 256,
	ye = 512,
	Ee = 32768,
	Me = 1 << 21,
	Ve = 1 << 22,
	J = 1 << 23,
	Q = Symbol('$state'),
	Yn = Symbol('legacy props'),
	qn = Symbol(''),
	ne = new (class extends Error {
		name = 'StaleReactionError';
		message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
	})(),
	Un = 1,
	Ge = 3,
	ct = 8;
function Kt(e) {
	throw new Error('https://svelte.dev/e/lifecycle_outside_component');
}
function zt() {
	throw new Error('https://svelte.dev/e/async_derived_orphan');
}
function $t(e) {
	throw new Error('https://svelte.dev/e/effect_in_teardown');
}
function Wt() {
	throw new Error('https://svelte.dev/e/effect_in_unowned_derived');
}
function Xt(e) {
	throw new Error('https://svelte.dev/e/effect_orphan');
}
function Zt() {
	throw new Error('https://svelte.dev/e/effect_update_depth_exceeded');
}
function Jt() {
	throw new Error('https://svelte.dev/e/experimental_async_fork');
}
function Qt() {
	throw new Error('https://svelte.dev/e/fork_discarded');
}
function en() {
	throw new Error('https://svelte.dev/e/fork_timing');
}
function Bn() {
	throw new Error('https://svelte.dev/e/hydration_failed');
}
function Vn(e) {
	throw new Error('https://svelte.dev/e/props_invalid_value');
}
function tn() {
	throw new Error('https://svelte.dev/e/state_descriptors_fixed');
}
function nn() {
	throw new Error('https://svelte.dev/e/state_prototype_fixed');
}
function rn() {
	throw new Error('https://svelte.dev/e/state_unsafe_mutation');
}
function Gn() {
	throw new Error('https://svelte.dev/e/svelte_boundary_reset_onerror');
}
const Kn = 1,
	zn = 2,
	$n = 4,
	Wn = 8,
	Xn = 16,
	Zn = 1,
	Jn = 2,
	Qn = 4,
	er = 8,
	tr = 16,
	nr = 4,
	rr = 1,
	sr = 2,
	sn = '[',
	fn = '[!',
	an = ']',
	Ke = {},
	g = Symbol(),
	fr = 'http://www.w3.org/1999/xhtml',
	ar = 'http://www.w3.org/2000/svg',
	ir = '@attach';
function ze(e) {
	console.warn('https://svelte.dev/e/hydration_mismatch');
}
function lr() {
	console.warn('https://svelte.dev/e/select_multiple_invalid_value');
}
function or() {
	console.warn('https://svelte.dev/e/svelte_boundary_reset_noop');
}
let G = !1;
function ur(e) {
	G = e;
}
let k;
function fe(e) {
	if (e === null) throw (ze(), Ke);
	return (k = e);
}
function cr() {
	return fe(W(k));
}
function _r(e) {
	if (G) {
		if (W(k) !== null) throw (ze(), Ke);
		k = e;
	}
}
function vr(e = 1) {
	if (G) {
		for (var t = e, n = k; t--; ) n = W(n);
		k = n;
	}
}
function dr(e = !0) {
	for (var t = 0, n = k; ; ) {
		if (n.nodeType === ct) {
			var r = n.data;
			if (r === an) {
				if (t === 0) return n;
				t -= 1;
			} else (r === sn || r === fn) && (t += 1);
		}
		var s = W(n);
		(e && n.remove(), (n = s));
	}
}
function hr(e) {
	if (!e || e.nodeType !== ct) throw (ze(), Ke);
	return e.data;
}
function _t(e) {
	return e === this.v;
}
function ln(e, t) {
	return e != e
		? t == t
		: e !== t || (e !== null && typeof e == 'object') || typeof e == 'function';
}
function vt(e) {
	return !ln(e, this.v);
}
let Re = !1;
function pr() {
	Re = !0;
}
let y = null;
function me(e) {
	y = e;
}
function wr(e) {
	return Oe().get(e);
}
function yr(e, t) {
	return (Oe().set(e, t), t);
}
function Er(e) {
	return Oe().has(e);
}
function mr() {
	return Oe();
}
function gr(e, t = !1, n) {
	y = {
		p: y,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		l: Re && !t ? { s: null, u: null, $: [] } : null
	};
}
function br(e) {
	var t = y,
		n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) St(r);
	}
	return ((t.i = !0), (y = t.p), {});
}
function he() {
	return !Re || (y !== null && y.l === null);
}
function Oe(e) {
	return (y === null && Kt(), (y.c ??= new Map(on(y) || void 0)));
}
function on(e) {
	let t = e.p;
	for (; t !== null; ) {
		const n = t.c;
		if (n !== null) return n;
		t = t.p;
	}
	return null;
}
let X = [];
function dt() {
	var e = X;
	((X = []), Vt(e));
}
function ht(e) {
	if (X.length === 0 && !_e) {
		var t = X;
		queueMicrotask(() => {
			t === X && dt();
		});
	}
	X.push(e);
}
function un() {
	for (; X.length > 0; ) dt();
}
function cn(e) {
	var t = _;
	if (t === null) return ((c.f |= J), e);
	if ((t.f & Be) === 0) {
		if ((t.f & Ue) === 0) throw e;
		t.b.error(e);
	} else ge(e, t);
}
function ge(e, t) {
	for (; t !== null; ) {
		if ((t.f & Ue) !== 0)
			try {
				t.b.error(e);
				return;
			} catch (n) {
				e = n;
			}
		t = t.parent;
	}
	throw e;
}
const Z = new Set();
let w = null,
	Ie = null,
	O = null,
	I = [],
	Ne = null,
	Fe = !1,
	_e = !1;
class F {
	committed = !1;
	current = new Map();
	previous = new Map();
	#r = new Set();
	#s = new Set();
	#t = 0;
	#n = 0;
	#i = null;
	#f = [];
	#a = [];
	skipped_effects = new Set();
	is_fork = !1;
	process(t) {
		((I = []), (Ie = null), this.apply());
		var n = { parent: null, effect: null, effects: [], render_effects: [], block_effects: [] };
		for (const r of t) this.#l(r, n);
		(this.is_fork || this.#o(),
			this.#n > 0 || this.is_fork
				? (this.#e(n.effects), this.#e(n.render_effects), this.#e(n.block_effects))
				: ((Ie = this),
					(w = null),
					tt(n.render_effects),
					tt(n.effects),
					(Ie = null),
					this.#i?.resolve()),
			(O = null));
	}
	#l(t, n) {
		t.f ^= b;
		for (var r = t.first; r !== null; ) {
			var s = r.f,
				a = (s & (j | $)) !== 0,
				i = a && (s & b) !== 0,
				o = i || (s & C) !== 0 || this.skipped_effects.has(r);
			if (
				((r.f & Ue) !== 0 &&
					r.b?.is_pending() &&
					(n = { parent: n, effect: r, effects: [], render_effects: [], block_effects: [] }),
				!o && r.fn !== null)
			) {
				a
					? (r.f ^= b)
					: (s & He) !== 0
						? n.effects.push(r)
						: pe(r) && ((r.f & L) !== 0 && n.block_effects.push(r), de(r));
				var f = r.first;
				if (f !== null) {
					r = f;
					continue;
				}
			}
			var l = r.parent;
			for (r = r.next; r === null && l !== null; )
				(l === n.effect &&
					(this.#e(n.effects), this.#e(n.render_effects), this.#e(n.block_effects), (n = n.parent)),
					(r = l.next),
					(l = l.parent));
		}
	}
	#e(t) {
		for (const n of t) (((n.f & A) !== 0 ? this.#f : this.#a).push(n), E(n, b));
	}
	capture(t, n) {
		(this.previous.has(t) || this.previous.set(t, n), this.current.set(t, t.v), O?.set(t, t.v));
	}
	activate() {
		w = this;
	}
	deactivate() {
		((w = null), (O = null));
	}
	flush() {
		if ((this.activate(), I.length > 0)) {
			if ((je(), w !== null && w !== this)) return;
		} else this.#t === 0 && this.process([]);
		this.deactivate();
	}
	discard() {
		for (const t of this.#s) t(this);
		this.#s.clear();
	}
	#o() {
		if (this.#n === 0) {
			for (const t of this.#r) t();
			this.#r.clear();
		}
		this.#t === 0 && this.#u();
	}
	#u() {
		if (Z.size > 1) {
			this.previous.clear();
			var t = O,
				n = !0,
				r = { parent: null, effect: null, effects: [], render_effects: [], block_effects: [] };
			for (const s of Z) {
				if (s === this) {
					n = !1;
					continue;
				}
				const a = [];
				for (const [o, f] of this.current) {
					if (s.current.has(o))
						if (n && f !== s.current.get(o)) s.current.set(o, f);
						else continue;
					a.push(o);
				}
				if (a.length === 0) continue;
				const i = [...s.current.keys()].filter((o) => !this.current.has(o));
				if (i.length > 0) {
					const o = new Set(),
						f = new Map();
					for (const l of a) pt(l, i, o, f);
					if (I.length > 0) {
						((w = s), s.apply());
						for (const l of I) s.#l(l, r);
						((I = []), s.deactivate());
					}
				}
			}
			((w = null), (O = t));
		}
		((this.committed = !0), Z.delete(this));
	}
	increment(t) {
		((this.#t += 1), t && (this.#n += 1));
	}
	decrement(t) {
		((this.#t -= 1), t && (this.#n -= 1), this.revive());
	}
	revive() {
		for (const t of this.#f) (E(t, A), te(t));
		for (const t of this.#a) (E(t, Y), te(t));
		((this.#f = []), (this.#a = []), this.flush());
	}
	oncommit(t) {
		this.#r.add(t);
	}
	ondiscard(t) {
		this.#s.add(t);
	}
	settled() {
		return (this.#i ??= ot()).promise;
	}
	static ensure() {
		if (w === null) {
			const t = (w = new F());
			(Z.add(w),
				_e ||
					F.enqueue(() => {
						w === t && t.flush();
					}));
		}
		return w;
	}
	static enqueue(t) {
		ht(t);
	}
	apply() {}
}
function Le(e) {
	var t = _e;
	_e = !0;
	try {
		var n;
		for (e && (w !== null && je(), (n = e())); ; ) {
			if ((un(), I.length === 0 && (w?.flush(), I.length === 0))) return ((Ne = null), n);
			je();
		}
	} finally {
		_e = t;
	}
}
function je() {
	var e = se;
	Fe = !0;
	try {
		var t = 0;
		for (ft(!0); I.length > 0; ) {
			var n = F.ensure();
			if (t++ > 1e3) {
				var r, s;
				_n();
			}
			(n.process(I), V.clear());
		}
	} finally {
		((Fe = !1), ft(e), (Ne = null));
	}
}
function _n() {
	try {
		Zt();
	} catch (e) {
		ge(e, Ne);
	}
}
let P = null;
function tt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t; ) {
			var r = e[n++];
			if (
				(r.f & (B | C)) === 0 &&
				pe(r) &&
				((P = new Set()),
				de(r),
				r.deps === null &&
					r.first === null &&
					r.nodes_start === null &&
					(r.teardown === null && r.ac === null ? Nt(r) : (r.fn = null)),
				P?.size > 0)
			) {
				V.clear();
				for (const s of P) {
					if ((s.f & (B | C)) !== 0) continue;
					const a = [s];
					let i = s.parent;
					for (; i !== null; ) (P.has(i) && (P.delete(i), a.push(i)), (i = i.parent));
					for (let o = a.length - 1; o >= 0; o--) {
						const f = a[o];
						(f.f & (B | C)) === 0 && de(f);
					}
				}
				P.clear();
			}
		}
		P = null;
	}
}
function pt(e, t, n, r) {
	if (!n.has(e) && (n.add(e), e.reactions !== null))
		for (const s of e.reactions) {
			const a = s.f;
			(a & m) !== 0
				? pt(s, t, n, r)
				: (a & (Ve | L)) !== 0 && (a & A) === 0 && yt(s, t, r) && (E(s, A), te(s));
		}
}
function wt(e, t) {
	if (e.reactions !== null)
		for (const n of e.reactions) {
			const r = n.f;
			(r & m) !== 0 ? wt(n, t) : (r & Pe) !== 0 && (E(n, A), t.add(n));
		}
}
function yt(e, t, n) {
	const r = n.get(e);
	if (r !== void 0) return r;
	if (e.deps !== null)
		for (const s of e.deps) {
			if (t.includes(s)) return !0;
			if ((s.f & m) !== 0 && yt(s, t, n)) return (n.set(s, !0), !0);
		}
	return (n.set(e, !1), !1);
}
function te(e) {
	for (var t = (Ne = e); t.parent !== null; ) {
		t = t.parent;
		var n = t.f;
		if (Fe && t === _ && (n & L) !== 0) return;
		if ((n & ($ | j)) !== 0) {
			if ((n & b) === 0) return;
			t.f ^= b;
		}
	}
	I.push(t);
}
function Tr(e) {
	(Jt(), w !== null && en());
	var t = F.ensure();
	t.is_fork = !0;
	var n = !1,
		r = t.settled();
	Le(e);
	for (var [s, a] of t.previous) s.v = a;
	return {
		commit: async () => {
			if (n) {
				await r;
				return;
			}
			(Z.has(t) || Qt(), (n = !0), (t.is_fork = !1));
			for (var [i, o] of t.current) i.v = o;
			(Le(() => {
				var f = new Set();
				for (var l of t.current.keys()) wt(l, f);
				(yn(f), bt());
			}),
				t.revive(),
				await r);
		},
		discard: () => {
			!n && Z.has(t) && (Z.delete(t), t.discard());
		}
	};
}
function vn(e, t, n, r) {
	const s = he() ? $e : pn;
	if (n.length === 0 && e.length === 0) {
		r(t.map(s));
		return;
	}
	var a = w,
		i = _,
		o = dn();
	function f() {
		Promise.all(n.map((l) => hn(l)))
			.then((l) => {
				o();
				try {
					r([...t.map(s), ...l]);
				} catch (u) {
					(i.f & B) === 0 && ge(u, i);
				}
				(a?.deactivate(), be());
			})
			.catch((l) => {
				ge(l, i);
			});
	}
	e.length > 0
		? Promise.all(e).then(() => {
				o();
				try {
					return f();
				} finally {
					(a?.deactivate(), be());
				}
			})
		: f();
}
function dn() {
	var e = _,
		t = c,
		n = y,
		r = w;
	return function (a = !0) {
		(ae(e), z(t), me(n), a && r?.activate());
	};
}
function be() {
	(ae(null), z(null), me(null));
}
function $e(e) {
	var t = m | A,
		n = c !== null && (c.f & m) !== 0 ? c : null;
	return (
		_ === null || (n !== null && (n.f & R) !== 0) ? (t |= R) : (_.f |= ie),
		{
			ctx: y,
			deps: null,
			effects: null,
			equals: _t,
			f: t,
			fn: e,
			reactions: null,
			rv: 0,
			v: g,
			wv: 0,
			parent: n ?? _,
			ac: null
		}
	);
}
function hn(e, t) {
	let n = _;
	n === null && zt();
	var r = n.b,
		s = void 0,
		a = Xe(g),
		i = !c,
		o = new Map();
	return (
		An(() => {
			var f = ot();
			s = f.promise;
			try {
				Promise.resolve(e())
					.then(f.resolve, f.reject)
					.then(() => {
						(l === w && l.committed && l.deactivate(), be());
					});
			} catch (p) {
				(f.reject(p), be());
			}
			var l = w;
			if (i) {
				var u = !r.is_pending();
				(r.update_pending_count(1), l.increment(u), o.get(l)?.reject(ne), o.delete(l), o.set(l, f));
			}
			const v = (p, d = void 0) => {
				if ((l.activate(), d)) d !== ne && ((a.f |= J), Ye(a, d));
				else {
					((a.f & J) !== 0 && (a.f ^= J), Ye(a, p));
					for (const [h, oe] of o) {
						if ((o.delete(h), h === l)) break;
						oe.reject(ne);
					}
				}
				i && (r.update_pending_count(-1), l.decrement(u));
			};
			f.promise.then(v, (p) => v(null, p || 'unknown'));
		}),
		Tn(() => {
			for (const f of o.values()) f.reject(ne);
		}),
		new Promise((f) => {
			function l(u) {
				function v() {
					u === s ? f(a) : l(s);
				}
				u.then(v, v);
			}
			l(s);
		})
	);
}
function Ar(e) {
	const t = $e(e);
	return (Ct(t), t);
}
function pn(e) {
	const t = $e(e);
	return ((t.equals = vt), t);
}
function Et(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) K(t[n]);
	}
}
function wn(e) {
	for (var t = e.parent; t !== null; ) {
		if ((t.f & m) === 0) return t;
		t = t.parent;
	}
	return null;
}
function We(e) {
	var t,
		n = _;
	ae(wn(e));
	try {
		((e.f &= ~Ee), Et(e), (t = Lt(e)));
	} finally {
		ae(n);
	}
	return t;
}
function mt(e) {
	var t = We(e);
	if ((e.equals(t) || ((e.v = t), (e.wv = Mt())), !le))
		if (O !== null) O.set(e, e.v);
		else {
			var n = (U || (e.f & R) !== 0) && e.deps !== null ? Y : b;
			E(e, n);
		}
}
let Te = new Set();
const V = new Map();
function yn(e) {
	Te = e;
}
let gt = !1;
function Xe(e, t) {
	var n = { f: 0, v: e, reactions: null, equals: _t, rv: 0, wv: 0 };
	return n;
}
function q(e, t) {
	const n = Xe(e);
	return (Ct(n), n);
}
function xr(e, t = !1, n = !0) {
	const r = Xe(e);
	return (t || (r.equals = vt), Re && n && y !== null && y.l !== null && (y.l.s ??= []).push(r), r);
}
function H(e, t, n = !1) {
	c !== null &&
		(!N || (c.f & Pe) !== 0) &&
		he() &&
		(c.f & (m | L | Ve | Pe)) !== 0 &&
		!M?.includes(e) &&
		rn();
	let r = n ? ue(t) : t;
	return Ye(e, r);
}
function Ye(e, t) {
	if (!e.equals(t)) {
		var n = e.v;
		(le ? V.set(e, t) : V.set(e, n), (e.v = t));
		var r = F.ensure();
		(r.capture(e, n),
			(e.f & m) !== 0 && ((e.f & A) !== 0 && We(e), E(e, (e.f & R) === 0 ? b : Y)),
			(e.wv = Mt()),
			Tt(e, A),
			he() &&
				_ !== null &&
				(_.f & b) !== 0 &&
				(_.f & (j | $)) === 0 &&
				(S === null ? On([e]) : S.push(e)),
			!r.is_fork && Te.size > 0 && !gt && bt());
	}
	return t;
}
function bt() {
	gt = !1;
	const e = Array.from(Te);
	for (const t of e) ((t.f & b) !== 0 && E(t, Y), pe(t) && de(t));
	Te.clear();
}
function kr(e, t = 1) {
	var n = re(e),
		r = t === 1 ? n++ : n--;
	return (H(e, n), r);
}
function Ce(e) {
	H(e, e.v + 1);
}
function Tt(e, t) {
	var n = e.reactions;
	if (n !== null)
		for (var r = he(), s = n.length, a = 0; a < s; a++) {
			var i = n[a],
				o = i.f;
			if (!(!r && i === _)) {
				var f = (o & A) === 0;
				(f && E(i, t),
					(o & m) !== 0
						? (o & Ee) === 0 && ((i.f |= Ee), Tt(i, Y))
						: f && ((o & L) !== 0 && P !== null && P.add(i), te(i)));
			}
		}
}
function ue(e) {
	if (typeof e != 'object' || e === null || Q in e) return e;
	const t = lt(e);
	if (t !== Ut && t !== Bt) return e;
	var n = new Map(),
		r = Yt(e),
		s = q(0),
		a = ee,
		i = (o) => {
			if (ee === a) return o();
			var f = c,
				l = ee;
			(z(null), it(a));
			var u = o();
			return (z(f), it(l), u);
		};
	return (
		r && n.set('length', q(e.length)),
		new Proxy(e, {
			defineProperty(o, f, l) {
				(!('value' in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) &&
					tn();
				var u = n.get(f);
				return (
					u === void 0
						? (u = i(() => {
								var v = q(l.value);
								return (n.set(f, v), v);
							}))
						: H(u, l.value, !0),
					!0
				);
			},
			deleteProperty(o, f) {
				var l = n.get(f);
				if (l === void 0) {
					if (f in o) {
						const u = i(() => q(g));
						(n.set(f, u), Ce(s));
					}
				} else (H(l, g), Ce(s));
				return !0;
			},
			get(o, f, l) {
				if (f === Q) return e;
				var u = n.get(f),
					v = f in o;
				if (
					(u === void 0 &&
						(!v || ce(o, f)?.writable) &&
						((u = i(() => {
							var d = ue(v ? o[f] : g),
								h = q(d);
							return h;
						})),
						n.set(f, u)),
					u !== void 0)
				) {
					var p = re(u);
					return p === g ? void 0 : p;
				}
				return Reflect.get(o, f, l);
			},
			getOwnPropertyDescriptor(o, f) {
				var l = Reflect.getOwnPropertyDescriptor(o, f);
				if (l && 'value' in l) {
					var u = n.get(f);
					u && (l.value = re(u));
				} else if (l === void 0) {
					var v = n.get(f),
						p = v?.v;
					if (v !== void 0 && p !== g)
						return { enumerable: !0, configurable: !0, value: p, writable: !0 };
				}
				return l;
			},
			has(o, f) {
				if (f === Q) return !0;
				var l = n.get(f),
					u = (l !== void 0 && l.v !== g) || Reflect.has(o, f);
				if (l !== void 0 || (_ !== null && (!u || ce(o, f)?.writable))) {
					l === void 0 &&
						((l = i(() => {
							var p = u ? ue(o[f]) : g,
								d = q(p);
							return d;
						})),
						n.set(f, l));
					var v = re(l);
					if (v === g) return !1;
				}
				return u;
			},
			set(o, f, l, u) {
				var v = n.get(f),
					p = f in o;
				if (r && f === 'length')
					for (var d = l; d < v.v; d += 1) {
						var h = n.get(d + '');
						h !== void 0 ? H(h, g) : d in o && ((h = i(() => q(g))), n.set(d + '', h));
					}
				if (v === void 0)
					(!p || ce(o, f)?.writable) && ((v = i(() => q(void 0))), H(v, ue(l)), n.set(f, v));
				else {
					p = v.v !== g;
					var oe = i(() => ue(l));
					H(v, oe);
				}
				var Je = Reflect.getOwnPropertyDescriptor(o, f);
				if ((Je?.set && Je.set.call(u, l), !p)) {
					if (r && typeof f == 'string') {
						var Qe = n.get('length'),
							De = Number(f);
						Number.isInteger(De) && De >= Qe.v && H(Qe, De + 1);
					}
					Ce(s);
				}
				return !0;
			},
			ownKeys(o) {
				re(s);
				var f = Reflect.ownKeys(o).filter((v) => {
					var p = n.get(v);
					return p === void 0 || p.v !== g;
				});
				for (var [l, u] of n) u.v !== g && !(l in o) && f.push(l);
				return f;
			},
			setPrototypeOf() {
				nn();
			}
		})
	);
}
function nt(e) {
	try {
		if (e !== null && typeof e == 'object' && Q in e) return e[Q];
	} catch {}
	return e;
}
function Sr(e, t) {
	return Object.is(nt(e), nt(t));
}
var rt, En, At, xt;
function Rr() {
	if (rt === void 0) {
		((rt = window), (En = /Firefox/.test(navigator.userAgent)));
		var e = Element.prototype,
			t = Node.prototype,
			n = Text.prototype;
		((At = ce(t, 'firstChild').get),
			(xt = ce(t, 'nextSibling').get),
			et(e) &&
				((e.__click = void 0),
				(e.__className = void 0),
				(e.__attributes = null),
				(e.__style = void 0),
				(e.__e = void 0)),
			et(n) && (n.__t = void 0));
	}
}
function Ae(e = '') {
	return document.createTextNode(e);
}
function xe(e) {
	return At.call(e);
}
function W(e) {
	return xt.call(e);
}
function Or(e, t) {
	if (!G) return xe(e);
	var n = xe(k);
	if (n === null) n = k.appendChild(Ae());
	else if (t && n.nodeType !== Ge) {
		var r = Ae();
		return (n?.before(r), fe(r), r);
	}
	return (fe(n), n);
}
function Nr(e, t = !1) {
	if (!G) {
		var n = xe(e);
		return n instanceof Comment && n.data === '' ? W(n) : n;
	}
	if (t && k?.nodeType !== Ge) {
		var r = Ae();
		return (k?.before(r), fe(r), r);
	}
	return k;
}
function Dr(e, t = 1, n = !1) {
	let r = G ? k : e;
	for (var s; t--; ) ((s = r), (r = W(r)));
	if (!G) return r;
	if (n && r?.nodeType !== Ge) {
		var a = Ae();
		return (r === null ? s?.after(a) : r.before(a), fe(a), a);
	}
	return (fe(r), r);
}
function mn(e) {
	e.textContent = '';
}
function Ir() {
	return !1;
}
function Cr(e, t) {
	if (t) {
		const n = document.body;
		((e.autofocus = !0),
			ht(() => {
				document.activeElement === n && e.focus();
			}));
	}
}
function Pr(e) {
	G && xe(e) !== null && mn(e);
}
let st = !1;
function gn() {
	st ||
		((st = !0),
		document.addEventListener(
			'reset',
			(e) => {
				Promise.resolve().then(() => {
					if (!e.defaultPrevented) for (const t of e.target.elements) t.__on_r?.();
				});
			},
			{ capture: !0 }
		));
}
function Ze(e) {
	var t = c,
		n = _;
	(z(null), ae(null));
	try {
		return e();
	} finally {
		(z(t), ae(n));
	}
}
function Mr(e, t, n, r = n) {
	e.addEventListener(t, () => Ze(n));
	const s = e.__on_r;
	(s
		? (e.__on_r = () => {
				(s(), r(!0));
			})
		: (e.__on_r = () => r(!0)),
		gn());
}
function kt(e) {
	(_ === null && c === null && Xt(),
		c !== null && (c.f & R) !== 0 && _ === null && Wt(),
		le && $t());
}
function bn(e, t) {
	var n = t.last;
	n === null ? (t.last = t.first = e) : ((n.next = e), (e.prev = n), (t.last = e));
}
function D(e, t, n, r = !0) {
	var s = _;
	s !== null && (s.f & C) !== 0 && (e |= C);
	var a = {
		ctx: y,
		deps: null,
		nodes_start: null,
		nodes_end: null,
		f: e | A,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: s,
		b: s && s.b,
		prev: null,
		teardown: null,
		transitions: null,
		wv: 0,
		ac: null
	};
	if (n)
		try {
			(de(a), (a.f |= Be));
		} catch (f) {
			throw (K(a), f);
		}
	else t !== null && te(a);
	if (r) {
		var i = a;
		if (
			(n &&
				i.deps === null &&
				i.teardown === null &&
				i.nodes_start === null &&
				i.first === i.last &&
				(i.f & ie) === 0 &&
				((i = i.first), (e & L) !== 0 && (e & we) !== 0 && i !== null && (i.f |= we)),
			i !== null &&
				((i.parent = s), s !== null && bn(i, s), c !== null && (c.f & m) !== 0 && (e & $) === 0))
		) {
			var o = c;
			(o.effects ??= []).push(i);
		}
	}
	return a;
}
function Fr() {
	return c !== null && !N;
}
function Tn(e) {
	const t = D(Se, null, !1);
	return (E(t, b), (t.teardown = e), t);
}
function Lr(e) {
	kt();
	var t = _.f,
		n = !c && (t & j) !== 0 && (t & Be) === 0;
	if (n) {
		var r = y;
		(r.e ??= []).push(e);
	} else return St(e);
}
function St(e) {
	return D(He | ut, e, !1);
}
function jr(e) {
	return (kt(), D(Se | ut, e, !0));
}
function Yr(e) {
	F.ensure();
	const t = D($ | ie, e, !0);
	return () => {
		K(t);
	};
}
function qr(e) {
	F.ensure();
	const t = D($ | ie, e, !0);
	return (n = {}) =>
		new Promise((r) => {
			n.outro
				? Sn(t, () => {
						(K(t), r(void 0));
					})
				: (K(t), r(void 0));
		});
}
function Hr(e) {
	return D(He, e, !1);
}
function An(e) {
	return D(Ve | ie, e, !0);
}
function Ur(e, t = 0) {
	return D(Se | t, e, !0);
}
function Br(e, t = [], n = [], r = []) {
	vn(r, t, n, (s) => {
		D(Se, () => e(...s.map(re)), !0);
	});
}
function Vr(e, t = 0) {
	var n = D(L | t, e, !0);
	return n;
}
function Gr(e, t = !0) {
	return D(j | ie, e, !0, t);
}
function Rt(e) {
	var t = e.teardown;
	if (t !== null) {
		const n = le,
			r = c;
		(at(!0), z(null));
		try {
			t.call(null);
		} finally {
			(at(n), z(r));
		}
	}
}
function Ot(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null; ) {
		const s = n.ac;
		s !== null &&
			Ze(() => {
				s.abort(ne);
			});
		var r = n.next;
		((n.f & $) !== 0 ? (n.parent = null) : K(n, t), (n = r));
	}
}
function xn(e) {
	for (var t = e.first; t !== null; ) {
		var n = t.next;
		((t.f & j) === 0 && K(t), (t = n));
	}
}
function K(e, t = !0) {
	var n = !1;
	((t || (e.f & Gt) !== 0) &&
		e.nodes_start !== null &&
		e.nodes_end !== null &&
		(kn(e.nodes_start, e.nodes_end), (n = !0)),
		Ot(e, t && !n),
		ke(e, 0),
		E(e, B));
	var r = e.transitions;
	if (r !== null) for (const a of r) a.stop();
	Rt(e);
	var s = e.parent;
	(s !== null && s.first !== null && Nt(e),
		(e.next =
			e.prev =
			e.teardown =
			e.ctx =
			e.deps =
			e.fn =
			e.nodes_start =
			e.nodes_end =
			e.ac =
				null));
}
function kn(e, t) {
	for (; e !== null; ) {
		var n = e === t ? null : W(e);
		(e.remove(), (e = n));
	}
}
function Nt(e) {
	var t = e.parent,
		n = e.prev,
		r = e.next;
	(n !== null && (n.next = r),
		r !== null && (r.prev = n),
		t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n)));
}
function Sn(e, t, n = !0) {
	var r = [];
	(Dt(e, r, !0),
		Rn(r, () => {
			(n && K(e), t && t());
		}));
}
function Rn(e, t) {
	var n = e.length;
	if (n > 0) {
		var r = () => --n || t();
		for (var s of e) s.out(r);
	} else t();
}
function Dt(e, t, n) {
	if ((e.f & C) === 0) {
		if (((e.f ^= C), e.transitions !== null))
			for (const i of e.transitions) (i.is_global || n) && t.push(i);
		for (var r = e.first; r !== null; ) {
			var s = r.next,
				a = (r.f & we) !== 0 || ((r.f & j) !== 0 && (e.f & L) !== 0);
			(Dt(r, t, a ? n : !1), (r = s));
		}
	}
}
function Kr(e) {
	It(e, !0);
}
function It(e, t) {
	if ((e.f & C) !== 0) {
		((e.f ^= C), (e.f & b) === 0 && (E(e, A), te(e)));
		for (var n = e.first; n !== null; ) {
			var r = n.next,
				s = (n.f & we) !== 0 || (n.f & j) !== 0;
			(It(n, s ? t : !1), (n = r));
		}
		if (e.transitions !== null) for (const a of e.transitions) (a.is_global || t) && a.in();
	}
}
function zr(e, t) {
	for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
		var s = n === r ? null : W(n);
		(t.append(n), (n = s));
	}
}
let se = !1;
function ft(e) {
	se = e;
}
let le = !1;
function at(e) {
	le = e;
}
let c = null,
	N = !1;
function z(e) {
	c = e;
}
let _ = null;
function ae(e) {
	_ = e;
}
let M = null;
function Ct(e) {
	c !== null && (M === null ? (M = [e]) : M.push(e));
}
let T = null,
	x = 0,
	S = null;
function On(e) {
	S = e;
}
let Pt = 1,
	ve = 0,
	ee = ve;
function it(e) {
	ee = e;
}
let U = !1;
function Mt() {
	return ++Pt;
}
function pe(e) {
	var t = e.f;
	if ((t & A) !== 0) return !0;
	if ((t & Y) !== 0) {
		var n = e.deps,
			r = (t & R) !== 0;
		if ((t & m && (e.f &= ~Ee), n !== null)) {
			var s,
				a,
				i = (t & ye) !== 0,
				o = r && _ !== null && !U,
				f = n.length;
			if ((i || o) && (_ === null || (_.f & B) === 0)) {
				var l = e,
					u = l.parent;
				for (s = 0; s < f; s++)
					((a = n[s]), (i || !a?.reactions?.includes(l)) && (a.reactions ??= []).push(l));
				(i && (l.f ^= ye), o && u !== null && (u.f & R) === 0 && (l.f ^= R));
			}
			for (s = 0; s < f; s++) if (((a = n[s]), pe(a) && mt(a), a.wv > e.wv)) return !0;
		}
		(!r || (_ !== null && !U)) && E(e, b);
	}
	return !1;
}
function Ft(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !M?.includes(e))
		for (var s = 0; s < r.length; s++) {
			var a = r[s];
			(a.f & m) !== 0 ? Ft(a, t, !1) : t === a && (n ? E(a, A) : (a.f & b) !== 0 && E(a, Y), te(a));
		}
}
function Lt(e) {
	var t = T,
		n = x,
		r = S,
		s = c,
		a = U,
		i = M,
		o = y,
		f = N,
		l = ee,
		u = e.f;
	((T = null),
		(x = 0),
		(S = null),
		(U = (u & R) !== 0 && (N || !se || c === null)),
		(c = (u & (j | $)) === 0 ? e : null),
		(M = null),
		me(e.ctx),
		(N = !1),
		(ee = ++ve),
		e.ac !== null &&
			(Ze(() => {
				e.ac.abort(ne);
			}),
			(e.ac = null)));
	try {
		e.f |= Me;
		var v = e.fn,
			p = v(),
			d = e.deps;
		if (T !== null) {
			var h;
			if ((ke(e, x), d !== null && x > 0))
				for (d.length = x + T.length, h = 0; h < T.length; h++) d[x + h] = T[h];
			else e.deps = d = T;
			if (!U || ((u & m) !== 0 && e.reactions !== null))
				for (h = x; h < d.length; h++) (d[h].reactions ??= []).push(e);
		} else d !== null && x < d.length && (ke(e, x), (d.length = x));
		if (he() && S !== null && !N && d !== null && (e.f & (m | Y | A)) === 0)
			for (h = 0; h < S.length; h++) Ft(S[h], e);
		return (
			s !== null && s !== e && (ve++, S !== null && (r === null ? (r = S) : r.push(...S))),
			(e.f & J) !== 0 && (e.f ^= J),
			p
		);
	} catch (oe) {
		return cn(oe);
	} finally {
		((e.f ^= Me), (T = t), (x = n), (S = r), (c = s), (U = a), (M = i), me(o), (N = f), (ee = l));
	}
}
function Nn(e, t) {
	let n = t.reactions;
	if (n !== null) {
		var r = qt.call(n, e);
		if (r !== -1) {
			var s = n.length - 1;
			s === 0 ? (n = t.reactions = null) : ((n[r] = n[s]), n.pop());
		}
	}
	n === null &&
		(t.f & m) !== 0 &&
		(T === null || !T.includes(t)) &&
		(E(t, Y), (t.f & (R | ye)) === 0 && (t.f ^= ye), Et(t), ke(t, 0));
}
function ke(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Nn(e, n[r]);
}
function de(e) {
	var t = e.f;
	if ((t & B) === 0) {
		E(e, b);
		var n = _,
			r = se;
		((_ = e), (se = !0));
		try {
			((t & L) !== 0 ? xn(e) : Ot(e), Rt(e));
			var s = Lt(e);
			((e.teardown = typeof s == 'function' ? s : null), (e.wv = Pt));
			var a;
		} finally {
			((se = r), (_ = n));
		}
	}
}
async function $r() {
	(await Promise.resolve(), Le());
}
function Wr() {
	return F.ensure().settled();
}
function re(e) {
	var t = e.f,
		n = (t & m) !== 0;
	if (c !== null && !N) {
		var r = _ !== null && (_.f & B) !== 0;
		if (!r && !M?.includes(e)) {
			var s = c.deps;
			if ((c.f & Me) !== 0)
				e.rv < ve &&
					((e.rv = ve),
					T === null && s !== null && s[x] === e
						? x++
						: T === null
							? (T = [e])
							: (!U || !T.includes(e)) && T.push(e));
			else {
				(c.deps ??= []).push(e);
				var a = e.reactions;
				a === null ? (e.reactions = [c]) : a.includes(c) || a.push(c);
			}
		}
	} else if (n && e.deps === null && e.effects === null) {
		var i = e,
			o = i.parent;
		o !== null && (o.f & R) === 0 && (i.f ^= R);
	}
	if (le) {
		if (V.has(e)) return V.get(e);
		if (n) {
			i = e;
			var f = i.v;
			return ((((i.f & b) === 0 && i.reactions !== null) || jt(i)) && (f = We(i)), V.set(i, f), f);
		}
	} else if (n) {
		if (((i = e), O?.has(i))) return O.get(i);
		pe(i) && mt(i);
	}
	if (O?.has(e)) return O.get(e);
	if ((e.f & J) !== 0) throw e.v;
	return e.v;
}
function jt(e) {
	if (e.v === g) return !0;
	if (e.deps === null) return !1;
	for (const t of e.deps) if (V.has(t) || ((t.f & m) !== 0 && jt(t))) return !0;
	return !1;
}
function Xr(e) {
	var t = N;
	try {
		return ((N = !0), e());
	} finally {
		N = t;
	}
}
const Dn = -7169;
function E(e, t) {
	e.f = (e.f & Dn) | t;
}
function Zr(e) {
	if (!(typeof e != 'object' || !e || e instanceof EventTarget)) {
		if (Q in e) qe(e);
		else if (!Array.isArray(e))
			for (let t in e) {
				const n = e[t];
				typeof n == 'object' && n && Q in n && qe(n);
			}
	}
}
function qe(e, t = new Set()) {
	if (typeof e == 'object' && e !== null && !(e instanceof EventTarget) && !t.has(e)) {
		(t.add(e), e instanceof Date && e.getTime());
		for (let r in e)
			try {
				qe(e[r], t);
			} catch {}
		const n = lt(e);
		if (
			n !== Object.prototype &&
			n !== Array.prototype &&
			n !== Map.prototype &&
			n !== Set.prototype &&
			n !== Date.prototype
		) {
			const r = Ht(n);
			for (let s in r) {
				const a = r[s].get;
				if (a)
					try {
						a.call(e);
					} catch {}
			}
		}
	}
}
export {
	Xr as $,
	Xe as A,
	Ye as B,
	ct as C,
	Kr as D,
	Sn as E,
	zn as F,
	K as G,
	fn as H,
	C as I,
	Kn as J,
	Xn as K,
	W as L,
	Dt as M,
	mn as N,
	Rn as O,
	_ as P,
	$n as Q,
	ht as R,
	Wn as S,
	q as T,
	ue as U,
	H as V,
	Pr as W,
	vr as X,
	Ar as Y,
	Hr as Z,
	Ur as _,
	br as a,
	gn as a$,
	Q as a0,
	Lr as a1,
	we as a2,
	Mr as a3,
	$r as a4,
	Ie as a5,
	Kt as a6,
	y as a7,
	Re as a8,
	zr as a9,
	ln as aA,
	Fr as aB,
	Ce as aC,
	F as aD,
	ae as aE,
	z as aF,
	me as aG,
	cn as aH,
	c as aI,
	ge as aJ,
	Gn as aK,
	ie as aL,
	Ue as aM,
	or as aN,
	Rr as aO,
	sn as aP,
	Ke as aQ,
	Bn as aR,
	qr as aS,
	ze as aT,
	lr as aU,
	Sr as aV,
	fr as aW,
	vn as aX,
	ir as aY,
	Cr as aZ,
	g as a_,
	In as aa,
	kr as ab,
	Un as ac,
	ar as ad,
	Tn as ae,
	Fn as af,
	jr as ag,
	Vt as ah,
	Ln as ai,
	Zr as aj,
	$e as ak,
	pr as al,
	wr as am,
	yr as an,
	Pn as ao,
	ce as ap,
	Vn as aq,
	Qn as ar,
	le as as,
	B as at,
	er as au,
	Jn as av,
	Zn as aw,
	tr as ax,
	Mn as ay,
	Yn as az,
	fe as b,
	lt as b0,
	qn as b1,
	Ht as b2,
	Ze as b3,
	En as b4,
	rr as b5,
	sr as b6,
	Ge as b7,
	Le as b8,
	Gt as b9,
	L as ba,
	Be as bb,
	nr as bc,
	Er as bd,
	Ut as be,
	jn as bf,
	he as bg,
	ee as bh,
	mr as bi,
	Yr as bj,
	Tr as bk,
	Wr as bl,
	Or as c,
	Ae as d,
	cr as e,
	Nr as f,
	xe as g,
	G as h,
	Vr as i,
	re as j,
	pn as k,
	hr as l,
	dr as m,
	ur as n,
	k as o,
	gr as p,
	an as q,
	_r as r,
	Dr as s,
	Br as t,
	Gr as u,
	Ir as v,
	w,
	Cn as x,
	Yt as y,
	xr as z
};
