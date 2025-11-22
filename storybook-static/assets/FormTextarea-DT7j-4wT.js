import {
	p as j,
	h as a,
	f as d,
	m as b,
	i as c,
	b as n,
	c as z,
	s as m,
	e as v,
	j as C
} from './iframe-DYn7RqBV.js';
import { s as i, b as I } from './attributes-D2XuSyo_.js';
import { s as M } from './class-BLXIZATI.js';
import { b as S } from './input-XwGP8Xvd.js';
var A = d('<span class="text-accent-primary">*</span>'),
	B = d('<label class="text-small font-medium text-label-primary"> <!></label>'),
	D = d('<div class="flex flex-col gap-form-field"><!> <textarea></textarea></div>');
function E(x, e) {
	j(e, !0);
	let k = a(e, 'placeholder', 3, ''),
		o = a(e, 'value', 15, ''),
		g = a(e, 'rows', 3, 4),
		y = a(e, 'required', 3, !1),
		_ = a(e, 'disabled', 3, !1),
		w = a(e, 'class', 3, '');
	const h = e.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
	var f = D(),
		p = v(f);
	{
		var V = (l) => {
			var s = B(),
				u = v(s),
				q = m(u);
			{
				var F = (r) => {
					var T = A();
					n(r, T);
				};
				b(q, (r) => {
					y() && r(F);
				});
			}
			(c(() => {
				(i(s, 'for', h), C(u, `${e.label ?? ''} `));
			}),
				n(l, s));
		};
		b(p, (l) => {
			e.label && l(V);
		});
	}
	var t = m(p, 2);
	(c(() => {
		(i(t, 'id', e.id),
			i(t, 'placeholder', k()),
			i(t, 'rows', g()),
			(t.required = y()),
			(t.disabled = _()),
			M(
				t,
				1,
				`resize-y rounded-input border border-base bg-input px-input-x py-input-y text-primary transition-all placeholder:text-tertiary focus:ring-2 focus:ring-accent-primary focus:outline-none ${w() ?? ''}`
			),
			I(t, o()));
	}),
		S(t, o),
		n(x, f),
		z());
}
E.__docgen = {
	data: [
		{
			name: 'id',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'label',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'placeholder',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1,
			defaultValue: '""'
		},
		{
			name: 'value',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1,
			defaultValue: '...'
		},
		{
			name: 'rows',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'number', text: 'number' },
			static: !1,
			readonly: !1,
			defaultValue: '4'
		},
		{
			name: 'required',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'boolean', text: 'boolean' },
			static: !1,
			readonly: !1,
			defaultValue: 'false'
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
	name: 'FormTextarea.svelte'
};
export { E as F };
