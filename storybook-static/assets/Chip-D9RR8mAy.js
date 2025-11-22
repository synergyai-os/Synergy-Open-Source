import {
	h as i,
	f as r,
	m as p,
	b as n,
	s as w,
	e as f,
	E as D,
	o as j,
	F as M,
	a as V,
	k as B,
	i as u,
	j as E
} from './iframe-DYn7RqBV.js';
import { a as F, s as L } from './attributes-D2XuSyo_.js';
import { s as N, c as R } from './class-BLXIZATI.js';
var S = r('<span> </span>'),
	q = r(
		'<button type="button"><svg class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>'
	),
	z = r('<span><!> <!></span>');
function A(y, a) {
	let o = i(a, 'label', 3, ''),
		v = i(a, 'variant', 3, 'default'),
		c = i(a, 'onDelete', 3, void 0),
		b = i(a, 'class', 3, ''),
		m = j(a, [
			'$$slots',
			'$$events',
			'$$legacy',
			'label',
			'variant',
			'onDelete',
			'children',
			'class'
		]);
	const k = `inline-flex items-center gap-chip rounded-chip text-chip transition-colors-token ${{ default: 'bg-tag/50 text-tag border border-base/50', primary: 'bg-accent-primary/80 text-primary' }[v()]} px-chip py-chip ${b()}`,
		h =
			'p-chip-close rounded-chip transition-colors-token hover:bg-hover-solid focus:outline-none focus:ring-1 focus:ring-accent-primary flex items-center justify-center -mr-chip-close';
	var l = z();
	F(l, () => ({ class: k, ...m }));
	var d = f(l);
	{
		var g = (e) => {
				var t = M(),
					s = V(t);
				(B(s, () => a.children), n(e, t));
			},
			x = (e) => {
				var t = S(),
					s = f(t);
				(u(() => E(s, o())), n(e, t));
			};
		p(d, (e) => {
			a.children ? e(g) : e(x, !1);
		});
	}
	var _ = w(d, 2);
	{
		var C = (e) => {
			var t = q();
			(N(t, 1, R(h)),
				(t.__click = function (...s) {
					c()?.apply(this, s);
				}),
				u(() => L(t, 'aria-label', `Remove ${o() || 'chip'}`)),
				n(e, t));
		};
		p(_, (e) => {
			c() && e(C);
		});
	}
	n(y, l);
}
D(['click']);
A.__docgen = {
	data: [
		{
			name: 'label',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1,
			defaultValue: '""'
		},
		{
			name: 'variant',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'default', text: '"default"' },
					{ kind: 'const', type: 'string', value: 'primary', text: '"primary"' }
				],
				text: '"default" | "primary"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"default"'
		},
		{
			name: 'onDelete',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
			static: !1,
			readonly: !1
		},
		{
			name: 'children',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: 'Snippet<[]>' },
			static: !1,
			readonly: !1
		},
		{
			name: 'class',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		}
	],
	name: 'Chip.svelte'
};
export { A as C };
