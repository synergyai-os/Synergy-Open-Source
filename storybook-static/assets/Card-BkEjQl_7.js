import {
	p as q,
	h as n,
	f as o,
	a as H,
	m as k,
	b as d,
	c as J,
	s as L,
	o as N,
	v as p,
	w as S,
	k as g,
	e as h
} from './iframe-DYn7RqBV.js';
import { a as m } from './attributes-D2XuSyo_.js';
import { b as x } from './this-Hz0nHxQJ.js';
var T = o('<div><!></div>'),
	z = o('<div><!></div>'),
	A = o(`<style>:global(.clickable-card:focus-visible) {
			outline: 2px solid var(--color-accent-primary);
			outline-offset: 2px;
		}

		:global(.clickable-card:focus:not(:focus-visible)) {
			outline: none;
		}</style>`),
	B = o('<!> <!>', 1);
function F(_, a) {
	q(a, !0);
	let v = n(a, 'variant', 3, 'default'),
		i = n(a, 'clickable', 3, !1),
		l = n(a, 'onclick', 3, void 0),
		w = n(a, 'class', 3, ''),
		s = n(a, 'ref', 15, null),
		u = N(a, [
			'$$slots',
			'$$events',
			'$$legacy',
			'variant',
			'clickable',
			'onclick',
			'children',
			'class',
			'ref'
		]);
	const C = {
			default: 'bg-elevated border border-base',
			elevated: 'bg-elevated shadow-card hover:shadow-card-hover transition-shadow',
			outlined: 'bg-elevated border-2 border-elevated',
			noPadding: 'bg-elevated'
		},
		E = i() ? 'cursor-pointer transition-all hover:shadow-card-hover' : '',
		P = v() === 'noPadding' ? '' : 'px-card py-card',
		f = S(() => `rounded-card ${P} ${C[v()]} ${E} ${i() ? 'clickable-card' : ''} ${w()}`);
	function M(e) {
		if (
			!(e.key === 'j' || e.key === 'J' || e.key === 'k' || e.key === 'K') &&
			i() &&
			l() &&
			(e.key === 'Enter' || e.key === ' ')
		)
			if ((e.preventDefault(), l().length > 0)) {
				const t = new MouseEvent('click', { bubbles: !0, cancelable: !0 });
				l()(t);
			} else l()();
	}
	var y = B(),
		b = H(y);
	{
		var D = (e) => {
				var t = T();
				m(t, () => ({
					class: p(f),
					role: 'button',
					tabindex: '0',
					onclick: l(),
					onkeydown: M,
					...u
				}));
				var r = h(t);
				(g(r, () => a.children),
					x(
						t,
						(c) => s(c),
						() => s()
					),
					d(e, t));
			},
			V = (e) => {
				var t = z();
				m(t, () => ({ class: p(f), ...u }));
				var r = h(t);
				(g(r, () => a.children),
					x(
						t,
						(c) => s(c),
						() => s()
					),
					d(e, t));
			};
		k(b, (e) => {
			i() ? e(D) : e(V, !1);
		});
	}
	var j = L(b, 2);
	{
		var K = (e) => {
			var t = A();
			d(e, t);
		};
		k(j, (e) => {
			i() && e(K);
		});
	}
	(d(_, y), J());
}
F.__docgen = {
	data: [
		{
			name: 'variant',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'default', text: '"default"' },
					{ kind: 'const', type: 'string', value: 'elevated', text: '"elevated"' },
					{ kind: 'const', type: 'string', value: 'outlined', text: '"outlined"' },
					{ kind: 'const', type: 'string', value: 'noPadding', text: '"noPadding"' }
				],
				text: '"default" | "elevated" | "outlined" | "noPadding"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"default"'
		},
		{
			name: 'clickable',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'boolean', text: 'boolean' },
			static: !1,
			readonly: !1,
			defaultValue: 'false'
		},
		{
			name: 'onclick',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'function', text: '(e: MouseEvent) => void' },
					{ kind: 'function', text: '() => void' }
				],
				text: '(e: MouseEvent) => void | () => void'
			},
			static: !1,
			readonly: !1
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
			type: { kind: 'type', type: 'object', text: 'HTMLDivElement' },
			static: !1,
			readonly: !1,
			defaultValue: '...'
		}
	],
	name: 'Card.svelte'
};
export { F as C };
