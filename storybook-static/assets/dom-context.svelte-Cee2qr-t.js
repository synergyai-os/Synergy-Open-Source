import { w as c, v as f, a8 as l } from './iframe-DYn7RqBV.js';
import { i as n, b as m } from './create-id-CD7dpc57.js';
const a = 1,
	w = 9,
	h = 11;
function i(t) {
	return n(t) && t.nodeType === a && typeof t.nodeName == 'string';
}
function u(t) {
	return n(t) && t.nodeType === w;
}
function E(t) {
	return n(t) && t.constructor?.name === 'VisualViewport';
}
function g(t) {
	return n(t) && t.nodeType !== void 0;
}
function s(t) {
	return g(t) && t.nodeType === h && 'host' in t;
}
function v(t, e) {
	if (!t || !e || !i(t) || !i(e)) return !1;
	const r = e.getRootNode?.();
	if (t === e || t.contains(e)) return !0;
	if (r && s(r)) {
		let o = e;
		for (; o; ) {
			if (t === o) return !0;
			o = o.parentNode || o.host;
		}
	}
	return !1;
}
function d(t) {
	return u(t) ? t : E(t) ? t.document : (t?.ownerDocument ?? document);
}
function N(t) {
	return s(t)
		? N(t.host)
		: u(t)
			? (t.defaultView ?? window)
			: i(t)
				? (t.ownerDocument?.defaultView ?? window)
				: window;
}
function D(t) {
	let e = t.activeElement;
	for (; e?.shadowRoot; ) {
		const r = e.shadowRoot.activeElement;
		if (r === e) break;
		e = r;
	}
	return e;
}
class p {
	element;
	#t = c(() =>
		this.element.current ? (this.element.current.getRootNode() ?? document) : document
	);
	get root() {
		return f(this.#t);
	}
	set root(e) {
		l(this.#t, e);
	}
	constructor(e) {
		typeof e == 'function' ? (this.element = m(e)) : (this.element = e);
	}
	getDocument = () => d(this.root);
	getWindow = () => this.getDocument().defaultView ?? window;
	getActiveElement = () => D(this.root);
	isActiveElement = (e) => e === this.getActiveElement();
	getElementById(e) {
		return this.root.getElementById(e);
	}
	querySelector = (e) => (this.root ? this.root.querySelector(e) : null);
	querySelectorAll = (e) => (this.root ? this.root.querySelectorAll(e) : []);
	setTimeout = (e, r) => this.getWindow().setTimeout(e, r);
	clearTimeout = (e) => this.getWindow().clearTimeout(e);
}
export { p as D, d as a, v as c, N as g };
