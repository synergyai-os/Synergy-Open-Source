import {
	w as u,
	v as r,
	a8 as x,
	ae as A,
	p as y,
	h as l,
	F as f,
	a as h,
	m as B,
	b as o,
	c as D,
	k as m,
	f as F,
	n as I,
	e as L,
	o as S
} from './iframe-DYn7RqBV.js';
import './create-runtime-stories-2rm03jka.js';
import { a as W } from './attributes-D2XuSyo_.js';
import { a as j, c as q, b as p, d as z, m as C } from './create-id-CD7dpc57.js';
const E = q({ component: 'label', parts: ['root'] });
class i {
	static create(t) {
		return new i(t);
	}
	opts;
	attachment;
	constructor(t) {
		((this.opts = t),
			(this.attachment = j(this.opts.ref)),
			(this.onmousedown = this.onmousedown.bind(this)));
	}
	onmousedown(t) {
		t.detail > 1 && t.preventDefault();
	}
	#t = u(() => ({
		id: this.opts.id.current,
		[E.root]: '',
		onmousedown: this.onmousedown,
		...this.attachment
	}));
	get props() {
		return r(this.#t);
	}
	set props(t) {
		x(this.#t, t);
	}
}
var G = F('<label><!></label>');
function H(v, t) {
	const b = A();
	y(t, !0);
	let _ = l(t, 'id', 19, () => z(b)),
		n = l(t, 'ref', 15, null),
		g = S(t, ['$$slots', '$$events', '$$legacy', 'children', 'child', 'id', 'ref', 'for']);
	const w = i.create({
			id: p(() => _()),
			ref: p(
				() => n(),
				(e) => n(e)
			)
		}),
		c = u(() => C(g, w.props, { for: t.for }));
	var d = f(),
		P = h(d);
	{
		var R = (e) => {
				var s = f(),
					a = h(s);
				(m(
					a,
					() => t.child,
					() => ({ props: r(c) })
				),
					o(e, s));
			},
			k = (e) => {
				var s = G();
				W(s, () => ({ ...r(c), for: t.for }));
				var a = L(s);
				(m(a, () => t.children ?? I), o(e, s));
			};
		B(P, (e) => {
			t.child ? e(R) : e(k, !1);
		});
	}
	(o(v, d), D());
}
const O = H;
export { O as R };
