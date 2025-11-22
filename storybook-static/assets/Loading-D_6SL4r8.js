import {
	h as g,
	F as j,
	a as V,
	m as u,
	b as s,
	f as c,
	s as x,
	e as l,
	i as v,
	j as k
} from './iframe-DYn7RqBV.js';
import { s as _ } from './class-BLXIZATI.js';
var A = c('<p class="text-button font-medium text-secondary"> </p>'),
	B = c(
		'<div class="flex h-full w-full items-center justify-center"><div class="flex flex-col items-center gap-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> <!></div></div>'
	),
	C = c('<p class="text-button font-medium text-secondary"> </p>'),
	M = c(
		'<div class="flex flex-col items-center gap-icon py-readable-quote"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> <!></div>'
	);
function q(h, f) {
	let n = g(f, 'message', 3, 'Loading...'),
		o = g(f, 'size', 3, 'md'),
		b = g(f, 'fullHeight', 3, !1);
	var y = j(),
		w = V(y);
	{
		var H = (e) => {
				var a = B(),
					r = l(a),
					d = l(r),
					p = x(d, 2);
				{
					var i = (t) => {
						var m = A(),
							L = l(m);
						(v(() => k(L, n())), s(t, m));
					};
					u(p, (t) => {
						n() && t(i);
					});
				}
				(v(() =>
					_(
						d,
						0,
						`animate-spin text-accent-primary ${o() === 'sm' ? 'icon-sm' : o() === 'lg' ? 'size-avatar-lg' : 'icon-xl'}`
					)
				),
					s(e, a));
			},
			z = (e) => {
				var a = M(),
					r = l(a),
					d = x(r, 2);
				{
					var p = (i) => {
						var t = C(),
							m = l(t);
						(v(() => k(m, n())), s(i, t));
					};
					u(d, (i) => {
						n() && i(p);
					});
				}
				(v(() =>
					_(
						r,
						0,
						`animate-spin text-accent-primary ${o() === 'sm' ? 'icon-sm' : o() === 'lg' ? 'size-avatar-lg' : 'icon-xl'}`
					)
				),
					s(e, a));
			};
		u(w, (e) => {
			b() ? e(H) : e(z, !1);
		});
	}
	s(h, y);
}
q.__docgen = {
	data: [
		{
			name: 'message',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1,
			defaultValue: '"Loading..."'
		},
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
					{ kind: 'const', type: 'string', value: 'lg', text: '"lg"' }
				],
				text: '"sm" | "md" | "lg"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"md"'
		},
		{
			name: 'fullHeight',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'boolean', text: 'boolean' },
			static: !1,
			readonly: !1,
			defaultValue: 'false'
		}
	],
	name: 'Loading.svelte'
};
export { q as L };
