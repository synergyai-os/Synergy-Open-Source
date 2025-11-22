import {
	p as V,
	h as l,
	f as o,
	a as g,
	m as b,
	b as r,
	c as j,
	o as N,
	k as T,
	e as D,
	F as E
} from './iframe-DYn7RqBV.js';
import { a as y } from './attributes-D2XuSyo_.js';
import { b as v } from './this-Hz0nHxQJ.js';
var F = o('<span><!></span>'),
	G = o('<span></span>'),
	H = o('<span></span>'),
	L = o(
		`<!> Design Tokens: - sm: icon-sm (16px) - md: icon-md (20px) - lg: icon-lg (24px) - xl: icon-xl (32px)
Note: Currently supports inline SVG via children. Icon library integration (via name prop) planned
for future. -->`,
		1
	);
function M(_, e) {
	V(e, !0);
	let h = l(e, 'size', 3, 'md'),
		u = l(e, 'name', 3, void 0),
		k = l(e, 'children', 3, void 0),
		z = l(e, 'class', 3, ''),
		a = l(e, 'ref', 15, null),
		c = N(e, ['$$slots', '$$events', '$$legacy', 'size', 'name', 'children', 'class', 'ref']);
	const d = `inline-flex items-center justify-center ${{ sm: 'icon-sm', md: 'icon-md', lg: 'icon-lg', xl: 'icon-xl' }[h()]} ${z()}`;
	var x = L(),
		w = g(x);
	{
		var C = (n) => {
				var t = F();
				y(t, () => ({ class: d, ...c }));
				var p = D(t);
				(T(p, k),
					v(
						t,
						(m) => a(m),
						() => a()
					),
					r(n, t));
			},
			I = (n) => {
				var t = E(),
					p = g(t);
				{
					var m = (i) => {
							var s = G();
							(y(s, () => ({ class: d, ...c, 'data-icon': u() })),
								v(
									s,
									(f) => a(f),
									() => a()
								),
								r(i, s));
						},
						S = (i) => {
							var s = H();
							(y(s, () => ({ class: d, ...c })),
								v(
									s,
									(f) => a(f),
									() => a()
								),
								r(i, s));
						};
					b(
						p,
						(i) => {
							u() ? i(m) : i(S, !1);
						},
						!0
					);
				}
				r(n, t);
			};
		b(w, (n) => {
			k() ? n(C) : n(I, !1);
		});
	}
	(r(_, x), j());
}
M.__docgen = {
	data: [
		{
			name: 'size',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'sm', text: '"sm"' },
					{ kind: 'const', type: 'string', value: 'md', text: '"md"' },
					{ kind: 'const', type: 'string', value: 'lg', text: '"lg"' },
					{ kind: 'const', type: 'string', value: 'xl', text: '"xl"' }
				],
				text: '"sm" | "md" | "lg" | "xl"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"md"'
		},
		{
			name: 'name',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
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
		},
		{
			name: 'ref',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'object', text: 'HTMLSpanElement' },
			static: !1,
			readonly: !1,
			defaultValue: '...'
		}
	],
	name: 'Icon.svelte'
};
export { M as I };
