import {
	p as c,
	h,
	F as _,
	a as g,
	m as b,
	v as o,
	w as y,
	b as s,
	c as x,
	o as w,
	f as d
} from './iframe-DYn7RqBV.js';
import { a as p } from './attributes-D2XuSyo_.js';
import { b as S } from './input-XwGP8Xvd.js';
import { s as P, m as k } from './create-id-CD7dpc57.js';
const H = {
		position: 'absolute',
		width: '1px',
		height: '1px',
		padding: '0',
		margin: '-1px',
		overflow: 'hidden',
		clip: 'rect(0, 0, 0, 0)',
		whiteSpace: 'nowrap',
		borderWidth: '0',
		transform: 'translateX(-100%)'
	},
	O = P(H);
var F = d('<input/>'),
	T = d('<input/>');
function z(v, r) {
	c(r, !0);
	let i = h(r, 'value', 15),
		l = w(r, ['$$slots', '$$events', '$$legacy', 'value']);
	const a = y(() => k(l, { 'aria-hidden': 'true', tabindex: -1, style: O }));
	var n = _(),
		m = g(n);
	{
		var u = (t) => {
				var e = F();
				(p(e, () => ({ ...o(a), value: i() }), void 0, void 0, void 0, void 0, !0), s(t, e));
			},
			f = (t) => {
				var e = T();
				(p(e, () => ({ ...o(a) }), void 0, void 0, void 0, void 0, !0), S(e, i), s(t, e));
			};
		b(m, (t) => {
			o(a).type === 'checkbox' ? t(u) : t(f, !1);
		});
	}
	(s(v, n), x());
}
export { z as H };
