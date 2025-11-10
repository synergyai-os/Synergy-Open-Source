import { c, a, f as d } from './ClEwQIZJ.js';
import { p as h, f as _, j as i, Y as g, a as b } from './kOT-I_MI.js';
import { i as y } from './SF-wfan-.js';
import { b as n } from './CxucRfwL.js';
import { b as x } from './BHj6_6we.js';
import { p as S, r as w } from './DgY3EWrn.js';
import { s as P, m as k } from './hVhnLUET.js';
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
var j = d('<input/>'),
	T = d('<input/>');
function C(m, e) {
	h(e, !0);
	let s = S(e, 'value', 15),
		v = w(e, ['$$slots', '$$events', '$$legacy', 'value']);
	const o = g(() => k(v, { 'aria-hidden': 'true', tabindex: -1, style: O }));
	var p = c(),
		l = _(p);
	{
		var f = (r) => {
				var t = j();
				(n(t, () => ({ ...i(o), value: s() }), void 0, void 0, void 0, void 0, !0), a(r, t));
			},
			u = (r) => {
				var t = T();
				(n(t, () => ({ ...i(o) }), void 0, void 0, void 0, void 0, !0), x(t, s), a(r, t));
			};
		y(l, (r) => {
			i(o).type === 'checkbox' ? r(f) : r(u, !1);
		});
	}
	(a(m, p), b());
}
export { C as H };
