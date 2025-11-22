import { h as i, f as d, i as o, b as m, j as y, e as c } from './iframe-DYn7RqBV.js';
import { s as p } from './class-BLXIZATI.js';
import { s as f } from './style-MviLiK55.js';
var v = d('<div> </div>');
function g(s, t) {
	let a = i(t, 'size', 3, 'md'),
		l = i(t, 'class', 3, '');
	const n = {
		sm: 'size-avatar-sm text-label',
		md: 'size-avatar-md text-button',
		lg: 'size-avatar-lg text-body'
	};
	var e = v(),
		r = c(e);
	(o(() => {
		(p(
			e,
			1,
			`flex flex-shrink-0 items-center justify-center rounded-avatar bg-accent-primary font-semibold text-primary ${n[a()] ?? ''} ${l() ?? ''}`
		),
			f(e, t.color ? `background-color: ${t.color}` : ''),
			y(r, t.initials));
	}),
		m(s, e));
}
g.__docgen = {
	data: [
		{
			name: 'initials',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'color',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
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
			name: 'class',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		}
	],
	name: 'Avatar.svelte'
};
export { g as A };
