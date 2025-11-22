import { w as t, v as u } from './iframe-DYn7RqBV.js';
class o {
	#e = () => {};
	#r = t(() => this.#e());
	constructor(s, r) {
		let e;
		(r !== void 0 && (e = r),
			(this.#e = () => {
				try {
					return e;
				} finally {
					e = s();
				}
			}));
	}
	get current() {
		return u(this.#r);
	}
}
export { o as P };
