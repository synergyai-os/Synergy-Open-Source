import {
	p as k,
	h as C,
	f as n,
	b as i,
	c as h,
	a as _,
	s as w,
	m as L,
	v as c,
	i as z,
	j as A,
	e as K
} from './iframe-DYn7RqBV.js';
import { e as M } from './each-DHv61wEY.js';
import { s as S } from './class-BLXIZATI.js';
var j = n('<span class="text-label text-tertiary">+</span>'),
	q = n('<kbd> </kbd> <!>', 1),
	D = n('<div class="inline-flex items-center gap-icon"></div>');
function O(m, e) {
	k(e, !0);
	let p = C(e, 'size', 3, 'sm');
	const y = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl',
		o = (Array.isArray(e.keys) ? e.keys : [e.keys]).map((t) =>
			t.toLowerCase() === 'cmd' || t.toLowerCase() === 'meta'
				? y
				: t.toLowerCase() === 'ctrl'
					? 'Ctrl'
					: t.toLowerCase() === 'shift'
						? '⇧'
						: t.toLowerCase() === 'alt' || t.toLowerCase() === 'option'
							? '⌥'
							: t
		),
		f = p() === 'sm' ? 'text-label px-badge py-badge' : 'text-button px-section py-section';
	var l = D();
	(M(
		l,
		23,
		() => o,
		(t, a) => `${a}-${t}`,
		(t, a, u) => {
			var d = q(),
				s = _(d),
				b = K(s),
				v = w(s, 2);
			{
				var g = (r) => {
					var x = j();
					i(r, x);
				};
				L(v, (r) => {
					c(u) < o.length - 1 && r(g);
				});
			}
			(z(() => {
				(S(s, 1, `bg-base/50 rounded-badge font-mono text-tertiary ${f}`), A(b, c(a)));
			}),
				i(t, d));
		}
	),
		i(m, l),
		h());
}
O.__docgen = {
	data: [
		{
			name: 'keys',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'type', type: 'string', text: 'string' },
					{ kind: 'type', type: 'array', text: 'string[]' }
				],
				text: 'string | string[]'
			},
			static: !1,
			readonly: !1
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
					{ kind: 'const', type: 'string', value: 'md', text: '"md"' }
				],
				text: '"sm" | "md"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"sm"'
		}
	],
	name: 'KeyboardShortcut.svelte'
};
export { O as K };
