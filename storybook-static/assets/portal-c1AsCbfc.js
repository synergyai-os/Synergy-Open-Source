import {
	aE as P,
	L as _,
	av as w,
	F as c,
	a as l,
	b as f,
	k as m,
	n as v,
	p as y,
	aF as k,
	m as x,
	c as B,
	aG as T,
	v as O,
	w as L,
	aH as F
} from './iframe-DYn7RqBV.js';
import { w as R } from './watch.svelte-CYSsdG2H.js';
import { a as S } from './is-DtD5rb4o.js';
import { C as j } from './context-DWcBTeuX.js';
import { b as p } from './create-id-CD7dpc57.js';
function q(n, t, e) {
	var a = new w(n),
		r = !P();
	_(() => {
		var o = t();
		(r && o !== null && typeof o == 'object' && (o = {}), a.ensure(o, e));
	});
}
function A(n, t) {
	var e = c(),
		a = l(e);
	(q(
		a,
		() => t.children,
		(r) => {
			var o = c(),
				s = l(o);
			(m(s, () => t.children ?? v), f(r, o));
		}
	),
		f(n, e));
}
const E = new j('BitsConfig');
function G() {
	const n = new H(null, {});
	return E.getOr(n).opts;
}
class H {
	opts;
	constructor(t, e) {
		const a = I(t, e);
		this.opts = {
			defaultPortalTo: a((r) => r.defaultPortalTo),
			defaultLocale: a((r) => r.defaultLocale)
		};
	}
}
function I(n, t) {
	return (e) =>
		p(() => {
			const r = e(t)?.current;
			if (r !== void 0) return r;
			if (n !== null) return e(n.opts)?.current;
		});
}
function M(n, t) {
	return (e) => {
		const a = G();
		return p(() => {
			const r = e();
			if (r !== void 0) return r;
			const o = n(a).current;
			return o !== void 0 ? o : t;
		});
	};
}
const V = M((n) => n.defaultPortalTo, 'body');
function N(n, t) {
	y(t, !0);
	const e = V(() => t.to),
		a = k();
	let r = L(o);
	function o() {
		if (!S || t.disabled) return null;
		let i = null;
		return (
			typeof e.current == 'string' ? (i = document.querySelector(e.current)) : (i = e.current),
			i
		);
	}
	let s;
	function d() {
		s && (F(s), (s = null));
	}
	R([() => O(r), () => t.disabled], ([i, u]) => {
		if (!i || u) {
			d();
			return;
		}
		return (
			(s = T(A, { target: i, props: { children: t.children }, context: a })),
			() => {
				d();
			}
		);
	});
	var g = c(),
		b = l(g);
	{
		var h = (i) => {
			var u = c(),
				C = l(u);
			(m(C, () => t.children ?? v), f(i, u));
		};
		x(b, (i) => {
			t.disabled && i(h);
		});
	}
	(f(n, g), B());
}
export { N as P };
