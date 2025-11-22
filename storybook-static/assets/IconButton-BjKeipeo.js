import { h as i, f as c, k as y, i as p, b as u, E as b, e as f } from './iframe-DYn7RqBV.js';
import { s } from './attributes-D2XuSyo_.js';
import { s as k } from './class-BLXIZATI.js';
var m = c('<button type="button"><!></button>');
function v(n, t) {
	let l = i(t, 'variant', 3, 'ghost'),
		a = i(t, 'disabled', 3, !1),
		o = i(t, 'class', 3, '');
	var e = m();
	e.__click = function (...d) {
		t.onclick?.apply(this, d);
	};
	var r = f(e);
	(y(r, () => t.icon),
		p(() => {
			(s(e, 'title', t.title),
				(e.disabled = a()),
				s(e, 'aria-label', t.ariaLabel),
				k(
					e,
					1,
					`flex icon-xl items-center justify-center rounded-button transition-colors
		${l() === 'ghost' ? 'text-secondary hover:bg-hover-solid hover:text-primary' : 'bg-surface text-primary hover:bg-hover-solid'}
		${a() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
		${o() ?? ''}`
				));
		}),
		u(n, e));
}
b(['click']);
v.__docgen = {
	data: [
		{
			name: 'icon',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'function', text: 'Snippet<[]>' },
			static: !1,
			readonly: !1
		},
		{
			name: 'onclick',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: '(e?: MouseEvent | undefined) => void' },
			static: !1,
			readonly: !1
		},
		{
			name: 'title',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'ariaLabel',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'variant',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'ghost', text: '"ghost"' },
					{ kind: 'const', type: 'string', value: 'solid', text: '"solid"' }
				],
				text: '"ghost" | "solid"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"ghost"'
		},
		{
			name: 'disabled',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'boolean', text: 'boolean' },
			static: !1,
			readonly: !1,
			defaultValue: 'false'
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
	name: 'IconButton.svelte'
};
export { v as I };
