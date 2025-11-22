import { h as a, f as l, k as o, i as c, b as p, e as m } from './iframe-DYn7RqBV.js';
import { s as y } from './class-BLXIZATI.js';
var u = l('<span><!></span>');
function f(s, e) {
	let i = a(e, 'variant', 3, 'default'),
		n = a(e, 'class', 3, '');
	const r = {
		system: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
		custom: 'bg-tag text-tag border-base',
		default: 'bg-tag text-tag border-base'
	};
	var t = u(),
		d = m(t);
	(o(d, () => e.children),
		c(() =>
			y(
				t,
				1,
				`inline-flex items-center rounded-badge border px-badge py-badge text-badge font-medium ${r[i()] ?? ''} ${n() ?? ''}`
			)
		),
		p(s, t));
}
f.__docgen = {
	data: [
		{
			name: 'variant',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'system', text: '"system"' },
					{ kind: 'const', type: 'string', value: 'custom', text: '"custom"' },
					{ kind: 'const', type: 'string', value: 'default', text: '"default"' }
				],
				text: '"system" | "custom" | "default"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"default"'
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
		}
	],
	name: 'Badge.svelte'
};
export { f as B };
