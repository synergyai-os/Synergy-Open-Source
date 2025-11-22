import { x as r, y as n, z as s } from './iframe-DYn7RqBV.js';
class h {
	#e;
	#t;
	constructor(t) {
		((this.#e = t), (this.#t = Symbol(t)));
	}
	get key() {
		return this.#t;
	}
	exists() {
		return r(this.#t);
	}
	get() {
		const t = n(this.#t);
		if (t === void 0) throw new Error(`Context "${this.#e}" not found`);
		return t;
	}
	getOr(t) {
		const e = n(this.#t);
		return e === void 0 ? t : e;
	}
	set(t) {
		return s(this.#t, t);
	}
}
export { h as C };
