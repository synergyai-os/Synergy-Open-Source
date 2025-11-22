import { az as d, aA as o, aB as w, G as p, u as h } from './iframe-DYn7RqBV.js';
const m = typeof window < 'u' ? window : void 0;
function v(t) {
	let e = t.activeElement;
	for (; e?.shadowRoot; ) {
		const n = e.shadowRoot.activeElement;
		if (n === e) break;
		e = n;
	}
	return e;
}
class b {
	#e;
	#t;
	constructor(e = {}) {
		const { window: n = m, document: u = n?.document } = e;
		n !== void 0 &&
			((this.#e = u),
			(this.#t = d((c) => {
				const s = o(n, 'focusin', c),
					r = o(n, 'focusout', c);
				return () => {
					(s(), r());
				};
			})));
	}
	get current() {
		return (this.#t?.(), this.#e ? v(this.#e) : null);
	}
}
new b();
function A(t, e) {
	switch (t) {
		case 'post':
			p(e);
			break;
		case 'pre':
			w(e);
			break;
	}
}
function i(t, e, n, u = {}) {
	const { lazy: c = !1 } = u;
	let s = !c,
		r = Array.isArray(t) ? [] : void 0;
	A(e, () => {
		const a = Array.isArray(t) ? t.map((l) => l()) : t();
		if (!s) {
			((s = !0), (r = a));
			return;
		}
		const f = h(() => n(a, r));
		return ((r = a), f);
	});
}
function y(t, e, n) {
	i(t, 'post', e, n);
}
function E(t, e, n) {
	i(t, 'pre', e, n);
}
y.pre = E;
export { m as d, y as w };
