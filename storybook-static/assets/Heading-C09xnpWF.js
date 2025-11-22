import {
	p as P,
	h as S,
	F as x,
	a as g,
	m as H,
	b as t,
	c as Q,
	f as p,
	o as R,
	k as y,
	e as _
} from './iframe-DYn7RqBV.js';
import { a as b } from './attributes-D2XuSyo_.js';
import { b as k } from './this-Hz0nHxQJ.js';
var U = p('<h1><!></h1>'),
	W = p('<h2><!></h2>'),
	X = p('<h3><!></h3>'),
	Y = p('<h4><!></h4>'),
	Z = p('<h5><!></h5>'),
	$ = p('<h6><!></h6>');
function ee(z, a) {
	P(a, !0);
	let o = S(a, 'level', 3, 1),
		A = S(a, 'class', 3, ''),
		e = S(a, 'ref', 15, null),
		v = R(a, ['$$slots', '$$events', '$$legacy', 'level', 'children', 'class', 'ref']);
	const d = `${{ 1: 'text-h1', 2: 'text-h2', 3: 'text-h3', 4: 'text-body font-semibold', 5: 'text-small font-semibold', 6: 'text-small font-medium' }[o()]} text-primary ${A()}`;
	var T = x(),
		B = g(T);
	{
		var D = (c) => {
				var s = U();
				b(s, () => ({ class: d, ...v }));
				var w = _(s);
				(y(w, () => a.children),
					k(
						s,
						(C) => e(C),
						() => e()
					),
					t(c, s));
			},
			G = (c) => {
				var s = x(),
					w = g(s);
				{
					var C = (f) => {
							var n = W();
							b(n, () => ({ class: d, ...v }));
							var V = _(n);
							(y(V, () => a.children),
								k(
									n,
									(j) => e(j),
									() => e()
								),
								t(f, n));
						},
						I = (f) => {
							var n = x(),
								V = g(n);
							{
								var j = (m) => {
										var r = X();
										b(r, () => ({ class: d, ...v }));
										var q = _(r);
										(y(q, () => a.children),
											k(
												r,
												(E) => e(E),
												() => e()
											),
											t(m, r));
									},
									J = (m) => {
										var r = x(),
											q = g(r);
										{
											var E = (h) => {
													var i = Y();
													b(i, () => ({ class: d, ...v }));
													var F = _(i);
													(y(F, () => a.children),
														k(
															i,
															(L) => e(L),
															() => e()
														),
														t(h, i));
												},
												K = (h) => {
													var i = x(),
														F = g(i);
													{
														var L = (u) => {
																var l = Z();
																b(l, () => ({ class: d, ...v }));
																var M = _(l);
																(y(M, () => a.children),
																	k(
																		l,
																		(N) => e(N),
																		() => e()
																	),
																	t(u, l));
															},
															O = (u) => {
																var l = $();
																b(l, () => ({ class: d, ...v }));
																var M = _(l);
																(y(M, () => a.children),
																	k(
																		l,
																		(N) => e(N),
																		() => e()
																	),
																	t(u, l));
															};
														H(
															F,
															(u) => {
																o() === 5 ? u(L) : u(O, !1);
															},
															!0
														);
													}
													t(h, i);
												};
											H(
												q,
												(h) => {
													o() === 4 ? h(E) : h(K, !1);
												},
												!0
											);
										}
										t(m, r);
									};
								H(
									V,
									(m) => {
										o() === 3 ? m(j) : m(J, !1);
									},
									!0
								);
							}
							t(f, n);
						};
					H(
						w,
						(f) => {
							o() === 2 ? f(C) : f(I, !1);
						},
						!0
					);
				}
				t(c, s);
			};
		H(B, (c) => {
			o() === 1 ? c(D) : c(G, !1);
		});
	}
	(t(z, T), Q());
}
ee.__docgen = {
	data: [
		{
			name: 'level',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'number', value: 1, text: '1' },
					{ kind: 'const', type: 'number', value: 2, text: '2' },
					{ kind: 'const', type: 'number', value: 3, text: '3' },
					{ kind: 'const', type: 'number', value: 4, text: '4' },
					{ kind: 'const', type: 'number', value: 5, text: '5' },
					{ kind: 'const', type: 'number', value: 6, text: '6' }
				],
				text: '1 | 2 | 3 | 4 | 5 | 6'
			},
			static: !1,
			readonly: !1,
			defaultValue: '1'
		},
		{
			name: 'children',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
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
			type: { kind: 'type', type: 'object', text: 'HTMLHeadingElement' },
			static: !1,
			readonly: !1,
			defaultValue: '...'
		}
	],
	name: 'Heading.svelte'
};
export { ee as H };
