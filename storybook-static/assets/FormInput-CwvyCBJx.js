import {
	p as I,
	h as n,
	f as p,
	m as b,
	s as h,
	i as d,
	b as o,
	c as E,
	e as w,
	E as j,
	j as C
} from './iframe-DYn7RqBV.js';
import { s as i } from './attributes-D2XuSyo_.js';
import { s as K } from './class-BLXIZATI.js';
import { b as M } from './input-XwGP8Xvd.js';
var S = p('<span class="text-accent-primary">*</span>'),
	A = p('<label class="text-small font-medium text-label-primary"> <!></label>'),
	B = p('<div class="flex flex-col gap-form-field"><!> <input/></div>');
function D(y, e) {
	I(e, !0);
	let x = n(e, 'placeholder', 3, ''),
		m = n(e, 'value', 15, ''),
		k = n(e, 'type', 3, 'text'),
		c = n(e, 'required', 3, !1),
		v = n(e, 'disabled', 3, !1),
		f = n(e, 'class', 3, '');
	const z = e.id || `input-${Math.random().toString(36).substr(2, 9)}`;
	var u = B(),
		r = w(u);
	{
		var _ = (l) => {
			var a = A(),
				g = w(a),
				V = h(g);
			{
				var q = (s) => {
					var F = S();
					o(s, F);
				};
				b(V, (s) => {
					c() && s(q);
				});
			}
			(d(() => {
				(i(a, 'for', z), C(g, `${e.label ?? ''} `));
			}),
				o(l, a));
		};
		b(r, (l) => {
			e.label && l(_);
		});
	}
	var t = h(r, 2);
	((t.__keydown = function (...l) {
		e.onkeydown?.apply(this, l);
	}),
		d(() => {
			(i(t, 'id', e.id),
				i(t, 'name', e.name),
				i(t, 'type', k()),
				i(t, 'placeholder', x()),
				(t.required = c()),
				(t.disabled = v()),
				i(t, 'autocomplete', e.autocomplete ?? void 0),
				K(
					t,
					1,
					`rounded-input border border-base bg-input px-input-x py-input-y text-primary transition-all placeholder:text-tertiary focus:ring-2 focus:ring-accent-primary focus:outline-none ${f() ?? ''}`
				));
		}),
		M(t, m),
		o(y, u),
		E());
}
j(['keydown']);
D.__docgen = {
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
			name: 'name',
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
			name: 'type',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'text', text: '"text"' },
					{ kind: 'const', type: 'string', value: 'email', text: '"email"' },
					{ kind: 'const', type: 'string', value: 'password', text: '"password"' },
					{ kind: 'const', type: 'string', value: 'url', text: '"url"' }
				],
				text: '"text" | "email" | "password" | "url"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"text"'
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
			name: 'autocomplete',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: '', text: '""' },
					{ kind: 'const', type: 'string', value: 'email', text: '"email"' },
					{ kind: 'const', type: 'string', value: 'url', text: '"url"' },
					{ kind: 'const', type: 'string', value: 'off', text: '"off"' },
					{ kind: 'const', type: 'string', value: 'on', text: '"on"' },
					{ kind: 'const', type: 'string', value: 'additional-name', text: '"additional-name"' },
					{ kind: 'const', type: 'string', value: 'address-level1', text: '"address-level1"' },
					{ kind: 'const', type: 'string', value: 'address-level2', text: '"address-level2"' },
					{ kind: 'const', type: 'string', value: 'address-level3', text: '"address-level3"' },
					{ kind: 'const', type: 'string', value: 'address-level4', text: '"address-level4"' },
					{ kind: 'const', type: 'string', value: 'address-line1', text: '"address-line1"' },
					{ kind: 'const', type: 'string', value: 'address-line2', text: '"address-line2"' },
					{ kind: 'const', type: 'string', value: 'address-line3', text: '"address-line3"' },
					{ kind: 'const', type: 'string', value: 'bday-day', text: '"bday-day"' },
					{ kind: 'const', type: 'string', value: 'bday-month', text: '"bday-month"' },
					{ kind: 'const', type: 'string', value: 'bday-year', text: '"bday-year"' },
					{ kind: 'const', type: 'string', value: 'cc-csc', text: '"cc-csc"' },
					{ kind: 'const', type: 'string', value: 'cc-exp', text: '"cc-exp"' },
					{ kind: 'const', type: 'string', value: 'cc-exp-month', text: '"cc-exp-month"' },
					{ kind: 'const', type: 'string', value: 'cc-exp-year', text: '"cc-exp-year"' },
					{ kind: 'const', type: 'string', value: 'cc-family-name', text: '"cc-family-name"' },
					{ kind: 'const', type: 'string', value: 'cc-given-name', text: '"cc-given-name"' },
					{ kind: 'const', type: 'string', value: 'cc-name', text: '"cc-name"' },
					{ kind: 'const', type: 'string', value: 'cc-number', text: '"cc-number"' },
					{ kind: 'const', type: 'string', value: 'cc-type', text: '"cc-type"' },
					{ kind: 'const', type: 'string', value: 'country', text: '"country"' },
					{ kind: 'const', type: 'string', value: 'country-name', text: '"country-name"' },
					{ kind: 'const', type: 'string', value: 'current-password', text: '"current-password"' },
					{ kind: 'const', type: 'string', value: 'family-name', text: '"family-name"' },
					{ kind: 'const', type: 'string', value: 'given-name', text: '"given-name"' },
					{ kind: 'const', type: 'string', value: 'honorific-prefix', text: '"honorific-prefix"' },
					{ kind: 'const', type: 'string', value: 'honorific-suffix', text: '"honorific-suffix"' },
					{ kind: 'const', type: 'string', value: 'name', text: '"name"' },
					{ kind: 'const', type: 'string', value: 'new-password', text: '"new-password"' },
					{ kind: 'const', type: 'string', value: 'one-time-code', text: '"one-time-code"' },
					{ kind: 'const', type: 'string', value: 'organization', text: '"organization"' },
					{ kind: 'const', type: 'string', value: 'postal-code', text: '"postal-code"' },
					{ kind: 'const', type: 'string', value: 'street-address', text: '"street-address"' },
					{
						kind: 'const',
						type: 'string',
						value: 'transaction-amount',
						text: '"transaction-amount"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'transaction-currency',
						text: '"transaction-currency"'
					},
					{ kind: 'const', type: 'string', value: 'username', text: '"username"' },
					{ kind: 'const', type: 'string', value: 'tel', text: '"tel"' },
					{ kind: 'const', type: 'string', value: 'tel-area-code', text: '"tel-area-code"' },
					{ kind: 'const', type: 'string', value: 'tel-country-code', text: '"tel-country-code"' },
					{ kind: 'const', type: 'string', value: 'tel-extension', text: '"tel-extension"' },
					{ kind: 'const', type: 'string', value: 'tel-local', text: '"tel-local"' },
					{ kind: 'const', type: 'string', value: 'tel-local-prefix', text: '"tel-local-prefix"' },
					{ kind: 'const', type: 'string', value: 'tel-local-suffix', text: '"tel-local-suffix"' },
					{ kind: 'const', type: 'string', value: 'tel-national', text: '"tel-national"' },
					{ kind: 'const', type: 'string', value: 'home email', text: '"home email"' },
					{ kind: 'const', type: 'string', value: 'home tel', text: '"home tel"' },
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-area-code',
						text: '"home tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-country-code',
						text: '"home tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-extension',
						text: '"home tel-extension"'
					},
					{ kind: 'const', type: 'string', value: 'home tel-local', text: '"home tel-local"' },
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-local-prefix',
						text: '"home tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-local-suffix',
						text: '"home tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-national',
						text: '"home tel-national"'
					},
					{ kind: 'const', type: 'string', value: 'mobile email', text: '"mobile email"' },
					{ kind: 'const', type: 'string', value: 'mobile tel', text: '"mobile tel"' },
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-area-code',
						text: '"mobile tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-country-code',
						text: '"mobile tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-extension',
						text: '"mobile tel-extension"'
					},
					{ kind: 'const', type: 'string', value: 'mobile tel-local', text: '"mobile tel-local"' },
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-local-prefix',
						text: '"mobile tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-local-suffix',
						text: '"mobile tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-national',
						text: '"mobile tel-national"'
					},
					{ kind: 'const', type: 'string', value: 'work email', text: '"work email"' },
					{ kind: 'const', type: 'string', value: 'work tel', text: '"work tel"' },
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-area-code',
						text: '"work tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-country-code',
						text: '"work tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-extension',
						text: '"work tel-extension"'
					},
					{ kind: 'const', type: 'string', value: 'work tel-local', text: '"work tel-local"' },
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-local-prefix',
						text: '"work tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-local-suffix',
						text: '"work tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-national',
						text: '"work tel-national"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'additional-name webauthn',
						text: '"additional-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'address-level1 webauthn',
						text: '"address-level1 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'address-level2 webauthn',
						text: '"address-level2 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'address-level3 webauthn',
						text: '"address-level3 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'address-level4 webauthn',
						text: '"address-level4 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'address-line1 webauthn',
						text: '"address-line1 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'address-line2 webauthn',
						text: '"address-line2 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'address-line3 webauthn',
						text: '"address-line3 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'bday-day webauthn',
						text: '"bday-day webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'bday-month webauthn',
						text: '"bday-month webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'bday-year webauthn',
						text: '"bday-year webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'cc-csc webauthn', text: '"cc-csc webauthn"' },
					{ kind: 'const', type: 'string', value: 'cc-exp webauthn', text: '"cc-exp webauthn"' },
					{
						kind: 'const',
						type: 'string',
						value: 'cc-exp-month webauthn',
						text: '"cc-exp-month webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'cc-exp-year webauthn',
						text: '"cc-exp-year webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'cc-family-name webauthn',
						text: '"cc-family-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'cc-given-name webauthn',
						text: '"cc-given-name webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'cc-name webauthn', text: '"cc-name webauthn"' },
					{
						kind: 'const',
						type: 'string',
						value: 'cc-number webauthn',
						text: '"cc-number webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'cc-type webauthn', text: '"cc-type webauthn"' },
					{ kind: 'const', type: 'string', value: 'country webauthn', text: '"country webauthn"' },
					{
						kind: 'const',
						type: 'string',
						value: 'country-name webauthn',
						text: '"country-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'current-password webauthn',
						text: '"current-password webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'family-name webauthn',
						text: '"family-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'given-name webauthn',
						text: '"given-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'honorific-prefix webauthn',
						text: '"honorific-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'honorific-suffix webauthn',
						text: '"honorific-suffix webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'name webauthn', text: '"name webauthn"' },
					{
						kind: 'const',
						type: 'string',
						value: 'new-password webauthn',
						text: '"new-password webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'one-time-code webauthn',
						text: '"one-time-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'organization webauthn',
						text: '"organization webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'postal-code webauthn',
						text: '"postal-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'street-address webauthn',
						text: '"street-address webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'transaction-amount webauthn',
						text: '"transaction-amount webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'transaction-currency webauthn',
						text: '"transaction-currency webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'username webauthn',
						text: '"username webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'email webauthn', text: '"email webauthn"' },
					{ kind: 'const', type: 'string', value: 'tel webauthn', text: '"tel webauthn"' },
					{
						kind: 'const',
						type: 'string',
						value: 'tel-area-code webauthn',
						text: '"tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'tel-country-code webauthn',
						text: '"tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'tel-extension webauthn',
						text: '"tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'tel-local webauthn',
						text: '"tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'tel-local-prefix webauthn',
						text: '"tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'tel-local-suffix webauthn',
						text: '"tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'tel-national webauthn',
						text: '"tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home email webauthn',
						text: '"home email webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel webauthn',
						text: '"home tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-area-code webauthn',
						text: '"home tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-country-code webauthn',
						text: '"home tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-extension webauthn',
						text: '"home tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-local webauthn',
						text: '"home tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-local-prefix webauthn',
						text: '"home tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-local-suffix webauthn',
						text: '"home tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'home tel-national webauthn',
						text: '"home tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile email webauthn',
						text: '"mobile email webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel webauthn',
						text: '"mobile tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-area-code webauthn',
						text: '"mobile tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-country-code webauthn',
						text: '"mobile tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-extension webauthn',
						text: '"mobile tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-local webauthn',
						text: '"mobile tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-local-prefix webauthn',
						text: '"mobile tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-local-suffix webauthn',
						text: '"mobile tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'mobile tel-national webauthn',
						text: '"mobile tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work email webauthn',
						text: '"work email webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel webauthn',
						text: '"work tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-area-code webauthn',
						text: '"work tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-country-code webauthn',
						text: '"work tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-extension webauthn',
						text: '"work tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-local webauthn',
						text: '"work tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-local-prefix webauthn',
						text: '"work tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-local-suffix webauthn',
						text: '"work tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'work tel-national webauthn',
						text: '"work tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing additional-name',
						text: '"billing additional-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing additional-name webauthn',
						text: '"billing additional-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-level1',
						text: '"billing address-level1"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-level1 webauthn',
						text: '"billing address-level1 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-level2',
						text: '"billing address-level2"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-level2 webauthn',
						text: '"billing address-level2 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-level3',
						text: '"billing address-level3"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-level3 webauthn',
						text: '"billing address-level3 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-level4',
						text: '"billing address-level4"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-level4 webauthn',
						text: '"billing address-level4 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-line1',
						text: '"billing address-line1"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-line1 webauthn',
						text: '"billing address-line1 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-line2',
						text: '"billing address-line2"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-line2 webauthn',
						text: '"billing address-line2 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-line3',
						text: '"billing address-line3"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing address-line3 webauthn',
						text: '"billing address-line3 webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing bday-day', text: '"billing bday-day"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing bday-day webauthn',
						text: '"billing bday-day webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing bday-month',
						text: '"billing bday-month"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing bday-month webauthn',
						text: '"billing bday-month webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing bday-year',
						text: '"billing bday-year"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing bday-year webauthn',
						text: '"billing bday-year webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing cc-csc', text: '"billing cc-csc"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-csc webauthn',
						text: '"billing cc-csc webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing cc-exp', text: '"billing cc-exp"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-exp webauthn',
						text: '"billing cc-exp webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-exp-month',
						text: '"billing cc-exp-month"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-exp-month webauthn',
						text: '"billing cc-exp-month webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-exp-year',
						text: '"billing cc-exp-year"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-exp-year webauthn',
						text: '"billing cc-exp-year webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-family-name',
						text: '"billing cc-family-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-family-name webauthn',
						text: '"billing cc-family-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-given-name',
						text: '"billing cc-given-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-given-name webauthn',
						text: '"billing cc-given-name webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing cc-name', text: '"billing cc-name"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-name webauthn',
						text: '"billing cc-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-number',
						text: '"billing cc-number"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-number webauthn',
						text: '"billing cc-number webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing cc-type', text: '"billing cc-type"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-type webauthn',
						text: '"billing cc-type webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing country', text: '"billing country"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing country webauthn',
						text: '"billing country webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing country-name',
						text: '"billing country-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing country-name webauthn',
						text: '"billing country-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing current-password',
						text: '"billing current-password"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing current-password webauthn',
						text: '"billing current-password webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing family-name',
						text: '"billing family-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing family-name webauthn',
						text: '"billing family-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing given-name',
						text: '"billing given-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing given-name webauthn',
						text: '"billing given-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing honorific-prefix',
						text: '"billing honorific-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing honorific-prefix webauthn',
						text: '"billing honorific-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing honorific-suffix',
						text: '"billing honorific-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing honorific-suffix webauthn',
						text: '"billing honorific-suffix webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing name', text: '"billing name"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing name webauthn',
						text: '"billing name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing new-password',
						text: '"billing new-password"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing new-password webauthn',
						text: '"billing new-password webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing one-time-code',
						text: '"billing one-time-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing one-time-code webauthn',
						text: '"billing one-time-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing organization',
						text: '"billing organization"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing organization webauthn',
						text: '"billing organization webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing postal-code',
						text: '"billing postal-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing postal-code webauthn',
						text: '"billing postal-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing street-address',
						text: '"billing street-address"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing street-address webauthn',
						text: '"billing street-address webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing transaction-amount',
						text: '"billing transaction-amount"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing transaction-amount webauthn',
						text: '"billing transaction-amount webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing transaction-currency',
						text: '"billing transaction-currency"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing transaction-currency webauthn',
						text: '"billing transaction-currency webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing username', text: '"billing username"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing username webauthn',
						text: '"billing username webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing email', text: '"billing email"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing email webauthn',
						text: '"billing email webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing tel', text: '"billing tel"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel webauthn',
						text: '"billing tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-area-code',
						text: '"billing tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-area-code webauthn',
						text: '"billing tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-country-code',
						text: '"billing tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-country-code webauthn',
						text: '"billing tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-extension',
						text: '"billing tel-extension"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-extension webauthn',
						text: '"billing tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-local',
						text: '"billing tel-local"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-local webauthn',
						text: '"billing tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-local-prefix',
						text: '"billing tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-local-prefix webauthn',
						text: '"billing tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-local-suffix',
						text: '"billing tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-local-suffix webauthn',
						text: '"billing tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-national',
						text: '"billing tel-national"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing tel-national webauthn',
						text: '"billing tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home email',
						text: '"billing home email"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home email webauthn',
						text: '"billing home email webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing home tel', text: '"billing home tel"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel webauthn',
						text: '"billing home tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-area-code',
						text: '"billing home tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-area-code webauthn',
						text: '"billing home tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-country-code',
						text: '"billing home tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-country-code webauthn',
						text: '"billing home tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-extension',
						text: '"billing home tel-extension"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-extension webauthn',
						text: '"billing home tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-local',
						text: '"billing home tel-local"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-local webauthn',
						text: '"billing home tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-local-prefix',
						text: '"billing home tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-local-prefix webauthn',
						text: '"billing home tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-local-suffix',
						text: '"billing home tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-local-suffix webauthn',
						text: '"billing home tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-national',
						text: '"billing home tel-national"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing home tel-national webauthn',
						text: '"billing home tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile email',
						text: '"billing mobile email"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile email webauthn',
						text: '"billing mobile email webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel',
						text: '"billing mobile tel"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel webauthn',
						text: '"billing mobile tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-area-code',
						text: '"billing mobile tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-area-code webauthn',
						text: '"billing mobile tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-country-code',
						text: '"billing mobile tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-country-code webauthn',
						text: '"billing mobile tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-extension',
						text: '"billing mobile tel-extension"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-extension webauthn',
						text: '"billing mobile tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-local',
						text: '"billing mobile tel-local"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-local webauthn',
						text: '"billing mobile tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-local-prefix',
						text: '"billing mobile tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-local-prefix webauthn',
						text: '"billing mobile tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-local-suffix',
						text: '"billing mobile tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-local-suffix webauthn',
						text: '"billing mobile tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-national',
						text: '"billing mobile tel-national"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing mobile tel-national webauthn',
						text: '"billing mobile tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work email',
						text: '"billing work email"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work email webauthn',
						text: '"billing work email webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'billing work tel', text: '"billing work tel"' },
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel webauthn',
						text: '"billing work tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-area-code',
						text: '"billing work tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-area-code webauthn',
						text: '"billing work tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-country-code',
						text: '"billing work tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-country-code webauthn',
						text: '"billing work tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-extension',
						text: '"billing work tel-extension"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-extension webauthn',
						text: '"billing work tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-local',
						text: '"billing work tel-local"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-local webauthn',
						text: '"billing work tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-local-prefix',
						text: '"billing work tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-local-prefix webauthn',
						text: '"billing work tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-local-suffix',
						text: '"billing work tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-local-suffix webauthn',
						text: '"billing work tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-national',
						text: '"billing work tel-national"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing work tel-national webauthn',
						text: '"billing work tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping additional-name',
						text: '"shipping additional-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping additional-name webauthn',
						text: '"shipping additional-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-level1',
						text: '"shipping address-level1"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-level1 webauthn',
						text: '"shipping address-level1 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-level2',
						text: '"shipping address-level2"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-level2 webauthn',
						text: '"shipping address-level2 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-level3',
						text: '"shipping address-level3"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-level3 webauthn',
						text: '"shipping address-level3 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-level4',
						text: '"shipping address-level4"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-level4 webauthn',
						text: '"shipping address-level4 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-line1',
						text: '"shipping address-line1"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-line1 webauthn',
						text: '"shipping address-line1 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-line2',
						text: '"shipping address-line2"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-line2 webauthn',
						text: '"shipping address-line2 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-line3',
						text: '"shipping address-line3"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping address-line3 webauthn',
						text: '"shipping address-line3 webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping bday-day',
						text: '"shipping bday-day"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping bday-day webauthn',
						text: '"shipping bday-day webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping bday-month',
						text: '"shipping bday-month"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping bday-month webauthn',
						text: '"shipping bday-month webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping bday-year',
						text: '"shipping bday-year"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping bday-year webauthn',
						text: '"shipping bday-year webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'shipping cc-csc', text: '"shipping cc-csc"' },
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-csc webauthn',
						text: '"shipping cc-csc webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'shipping cc-exp', text: '"shipping cc-exp"' },
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-exp webauthn',
						text: '"shipping cc-exp webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-exp-month',
						text: '"shipping cc-exp-month"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-exp-month webauthn',
						text: '"shipping cc-exp-month webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-exp-year',
						text: '"shipping cc-exp-year"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-exp-year webauthn',
						text: '"shipping cc-exp-year webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-family-name',
						text: '"shipping cc-family-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-family-name webauthn',
						text: '"shipping cc-family-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-given-name',
						text: '"shipping cc-given-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-given-name webauthn',
						text: '"shipping cc-given-name webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'shipping cc-name', text: '"shipping cc-name"' },
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-name webauthn',
						text: '"shipping cc-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-number',
						text: '"shipping cc-number"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-number webauthn',
						text: '"shipping cc-number webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'shipping cc-type', text: '"shipping cc-type"' },
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-type webauthn',
						text: '"shipping cc-type webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'shipping country', text: '"shipping country"' },
					{
						kind: 'const',
						type: 'string',
						value: 'shipping country webauthn',
						text: '"shipping country webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping country-name',
						text: '"shipping country-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping country-name webauthn',
						text: '"shipping country-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping current-password',
						text: '"shipping current-password"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping current-password webauthn',
						text: '"shipping current-password webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping family-name',
						text: '"shipping family-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping family-name webauthn',
						text: '"shipping family-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping given-name',
						text: '"shipping given-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping given-name webauthn',
						text: '"shipping given-name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping honorific-prefix',
						text: '"shipping honorific-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping honorific-prefix webauthn',
						text: '"shipping honorific-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping honorific-suffix',
						text: '"shipping honorific-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping honorific-suffix webauthn',
						text: '"shipping honorific-suffix webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'shipping name', text: '"shipping name"' },
					{
						kind: 'const',
						type: 'string',
						value: 'shipping name webauthn',
						text: '"shipping name webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping new-password',
						text: '"shipping new-password"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping new-password webauthn',
						text: '"shipping new-password webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping one-time-code',
						text: '"shipping one-time-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping one-time-code webauthn',
						text: '"shipping one-time-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping organization',
						text: '"shipping organization"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping organization webauthn',
						text: '"shipping organization webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping postal-code',
						text: '"shipping postal-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping postal-code webauthn',
						text: '"shipping postal-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping street-address',
						text: '"shipping street-address"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping street-address webauthn',
						text: '"shipping street-address webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping transaction-amount',
						text: '"shipping transaction-amount"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping transaction-amount webauthn',
						text: '"shipping transaction-amount webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping transaction-currency',
						text: '"shipping transaction-currency"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping transaction-currency webauthn',
						text: '"shipping transaction-currency webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping username',
						text: '"shipping username"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping username webauthn',
						text: '"shipping username webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'shipping email', text: '"shipping email"' },
					{
						kind: 'const',
						type: 'string',
						value: 'shipping email webauthn',
						text: '"shipping email webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'shipping tel', text: '"shipping tel"' },
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel webauthn',
						text: '"shipping tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-area-code',
						text: '"shipping tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-area-code webauthn',
						text: '"shipping tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-country-code',
						text: '"shipping tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-country-code webauthn',
						text: '"shipping tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-extension',
						text: '"shipping tel-extension"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-extension webauthn',
						text: '"shipping tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-local',
						text: '"shipping tel-local"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-local webauthn',
						text: '"shipping tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-local-prefix',
						text: '"shipping tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-local-prefix webauthn',
						text: '"shipping tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-local-suffix',
						text: '"shipping tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-local-suffix webauthn',
						text: '"shipping tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-national',
						text: '"shipping tel-national"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping tel-national webauthn',
						text: '"shipping tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home email',
						text: '"shipping home email"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home email webauthn',
						text: '"shipping home email webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel',
						text: '"shipping home tel"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel webauthn',
						text: '"shipping home tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-area-code',
						text: '"shipping home tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-area-code webauthn',
						text: '"shipping home tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-country-code',
						text: '"shipping home tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-country-code webauthn',
						text: '"shipping home tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-extension',
						text: '"shipping home tel-extension"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-extension webauthn',
						text: '"shipping home tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-local',
						text: '"shipping home tel-local"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-local webauthn',
						text: '"shipping home tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-local-prefix',
						text: '"shipping home tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-local-prefix webauthn',
						text: '"shipping home tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-local-suffix',
						text: '"shipping home tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-local-suffix webauthn',
						text: '"shipping home tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-national',
						text: '"shipping home tel-national"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping home tel-national webauthn',
						text: '"shipping home tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile email',
						text: '"shipping mobile email"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile email webauthn',
						text: '"shipping mobile email webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel',
						text: '"shipping mobile tel"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel webauthn',
						text: '"shipping mobile tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-area-code',
						text: '"shipping mobile tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-area-code webauthn',
						text: '"shipping mobile tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-country-code',
						text: '"shipping mobile tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-country-code webauthn',
						text: '"shipping mobile tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-extension',
						text: '"shipping mobile tel-extension"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-extension webauthn',
						text: '"shipping mobile tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-local',
						text: '"shipping mobile tel-local"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-local webauthn',
						text: '"shipping mobile tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-local-prefix',
						text: '"shipping mobile tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-local-prefix webauthn',
						text: '"shipping mobile tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-local-suffix',
						text: '"shipping mobile tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-local-suffix webauthn',
						text: '"shipping mobile tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-national',
						text: '"shipping mobile tel-national"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping mobile tel-national webauthn',
						text: '"shipping mobile tel-national webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work email',
						text: '"shipping work email"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work email webauthn',
						text: '"shipping work email webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel',
						text: '"shipping work tel"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel webauthn',
						text: '"shipping work tel webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-area-code',
						text: '"shipping work tel-area-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-area-code webauthn',
						text: '"shipping work tel-area-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-country-code',
						text: '"shipping work tel-country-code"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-country-code webauthn',
						text: '"shipping work tel-country-code webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-extension',
						text: '"shipping work tel-extension"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-extension webauthn',
						text: '"shipping work tel-extension webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-local',
						text: '"shipping work tel-local"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-local webauthn',
						text: '"shipping work tel-local webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-local-prefix',
						text: '"shipping work tel-local-prefix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-local-prefix webauthn',
						text: '"shipping work tel-local-prefix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-local-suffix',
						text: '"shipping work tel-local-suffix"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-local-suffix webauthn',
						text: '"shipping work tel-local-suffix webauthn"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-national',
						text: '"shipping work tel-national"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping work tel-national webauthn',
						text: '"shipping work tel-national webauthn"'
					},
					{ kind: 'const', type: 'string', value: 'bday', text: '"bday"' },
					{
						kind: 'const',
						type: 'string',
						value: 'cc-additional-name',
						text: '"cc-additional-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'billing cc-additional-name',
						text: '"billing cc-additional-name"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'shipping cc-additional-name',
						text: '"shipping cc-additional-name"'
					},
					{ kind: 'const', type: 'string', value: 'nickname', text: '"nickname"' },
					{ kind: 'const', type: 'string', value: 'language', text: '"language"' },
					{
						kind: 'const',
						type: 'string',
						value: 'organization-title',
						text: '"organization-title"'
					},
					{ kind: 'const', type: 'string', value: 'photo', text: '"photo"' },
					{ kind: 'const', type: 'string', value: 'sex', text: '"sex"' }
				],
				text: '"" | "email" | "url" | "off" | "on" | "additional-name" | "address-level1" | "address-level2" | "address-level3" | "address-level4" | "address-line1" | "address-line2" | "address-line3" | "bday-day" | "bday-month" | "bday-year" | "cc-csc" | "cc-exp" | "cc-exp-month" | "cc-exp-year" | "cc-family-name" | "cc-given-name" | "cc-name" | "cc-number" | "cc-type" | "country" | "country-name" | "current-password" | "family-name" | "given-name" | "honorific-prefix" | "honorific-suffix" | "name" | "new-password" | "one-time-code" | "organization" | "postal-code" | "street-address" | "transaction-amount" | "transaction-currency" | "username" | "tel" | "tel-area-code" | "tel-country-code" | "tel-extension" | "tel-local" | "tel-local-prefix" | "tel-local-suffix" | "tel-national" | "home email" | "home tel" | "home tel-area-code" | "home tel-country-code" | "home tel-extension" | "home tel-local" | "home tel-local-prefix" | "home tel-local-suffix" | "home tel-national" | "mobile email" | "mobile tel" | "mobile tel-area-code" | "mobile tel-country-code" | "mobile tel-extension" | "mobile tel-local" | "mobile tel-local-prefix" | "mobile tel-local-suffix" | "mobile tel-national" | "work email" | "work tel" | "work tel-area-code" | "work tel-country-code" | "work tel-extension" | "work tel-local" | "work tel-local-prefix" | "work tel-local-suffix" | "work tel-national" | "additional-name webauthn" | "address-level1 webauthn" | "address-level2 webauthn" | "address-level3 webauthn" | "address-level4 webauthn" | "address-line1 webauthn" | "address-line2 webauthn" | "address-line3 webauthn" | "bday-day webauthn" | "bday-month webauthn" | "bday-year webauthn" | "cc-csc webauthn" | "cc-exp webauthn" | "cc-exp-month webauthn" | "cc-exp-year webauthn" | "cc-family-name webauthn" | "cc-given-name webauthn" | "cc-name webauthn" | "cc-number webauthn" | "cc-type webauthn" | "country webauthn" | "country-name webauthn" | "current-password webauthn" | "family-name webauthn" | "given-name webauthn" | "honorific-prefix webauthn" | "honorific-suffix webauthn" | "name webauthn" | "new-password webauthn" | "one-time-code webauthn" | "organization webauthn" | "postal-code webauthn" | "street-address webauthn" | "transaction-amount webauthn" | "transaction-currency webauthn" | "username webauthn" | "email webauthn" | "tel webauthn" | "tel-area-code webauthn" | "tel-country-code webauthn" | "tel-extension webauthn" | "tel-local webauthn" | "tel-local-prefix webauthn" | "tel-local-suffix webauthn" | "tel-national webauthn" | "home email webauthn" | "home tel webauthn" | "home tel-area-code webauthn" | "home tel-country-code webauthn" | "home tel-extension webauthn" | "home tel-local webauthn" | "home tel-local-prefix webauthn" | "home tel-local-suffix webauthn" | "home tel-national webauthn" | "mobile email webauthn" | "mobile tel webauthn" | "mobile tel-area-code webauthn" | "mobile tel-country-code webauthn" | "mobile tel-extension webauthn" | "mobile tel-local webauthn" | "mobile tel-local-prefix webauthn" | "mobile tel-local-suffix webauthn" | "mobile tel-national webauthn" | "work email webauthn" | "work tel webauthn" | "work tel-area-code webauthn" | "work tel-country-code webauthn" | "work tel-extension webauthn" | "work tel-local webauthn" | "work tel-local-prefix webauthn" | "work tel-local-suffix webauthn" | "work tel-national webauthn" | "billing additional-name" | "billing additional-name webauthn" | "billing address-level1" | "billing address-level1 webauthn" | "billing address-level2" | "billing address-level2 webauthn" | "billing address-level3" | "billing address-level3 webauthn" | "billing address-level4" | "billing address-level4 webauthn" | "billing address-line1" | "billing address-line1 webauthn" | "billing address-line2" | "billing address-line2 webauthn" | "billing address-line3" | "billing address-line3 webauthn" | "billing bday-day" | "billing bday-day webauthn" | "billing bday-month" | "billing bday-month webauthn" | "billing bday-year" | "billing bday-year webauthn" | "billing cc-csc" | "billing cc-csc webauthn" | "billing cc-exp" | "billing cc-exp webauthn" | "billing cc-exp-month" | "billing cc-exp-month webauthn" | "billing cc-exp-year" | "billing cc-exp-year webauthn" | "billing cc-family-name" | "billing cc-family-name webauthn" | "billing cc-given-name" | "billing cc-given-name webauthn" | "billing cc-name" | "billing cc-name webauthn" | "billing cc-number" | "billing cc-number webauthn" | "billing cc-type" | "billing cc-type webauthn" | "billing country" | "billing country webauthn" | "billing country-name" | "billing country-name webauthn" | "billing current-password" | "billing current-password webauthn" | "billing family-name" | "billing family-name webauthn" | "billing given-name" | "billing given-name webauthn" | "billing honorific-prefix" | "billing honorific-prefix webauthn" | "billing honorific-suffix" | "billing honorific-suffix webauthn" | "billing name" | "billing name webauthn" | "billing new-password" | "billing new-password webauthn" | "billing one-time-code" | "billing one-time-code webauthn" | "billing organization" | "billing organization webauthn" | "billing postal-code" | "billing postal-code webauthn" | "billing street-address" | "billing street-address webauthn" | "billing transaction-amount" | "billing transaction-amount webauthn" | "billing transaction-currency" | "billing transaction-currency webauthn" | "billing username" | "billing username webauthn" | "billing email" | "billing email webauthn" | "billing tel" | "billing tel webauthn" | "billing tel-area-code" | "billing tel-area-code webauthn" | "billing tel-country-code" | "billing tel-country-code webauthn" | "billing tel-extension" | "billing tel-extension webauthn" | "billing tel-local" | "billing tel-local webauthn" | "billing tel-local-prefix" | "billing tel-local-prefix webauthn" | "billing tel-local-suffix" | "billing tel-local-suffix webauthn" | "billing tel-national" | "billing tel-national webauthn" | "billing home email" | "billing home email webauthn" | "billing home tel" | "billing home tel webauthn" | "billing home tel-area-code" | "billing home tel-area-code webauthn" | "billing home tel-country-code" | "billing home tel-country-code webauthn" | "billing home tel-extension" | "billing home tel-extension webauthn" | "billing home tel-local" | "billing home tel-local webauthn" | "billing home tel-local-prefix" | "billing home tel-local-prefix webauthn" | "billing home tel-local-suffix" | "billing home tel-local-suffix webauthn" | "billing home tel-national" | "billing home tel-national webauthn" | "billing mobile email" | "billing mobile email webauthn" | "billing mobile tel" | "billing mobile tel webauthn" | "billing mobile tel-area-code" | "billing mobile tel-area-code webauthn" | "billing mobile tel-country-code" | "billing mobile tel-country-code webauthn" | "billing mobile tel-extension" | "billing mobile tel-extension webauthn" | "billing mobile tel-local" | "billing mobile tel-local webauthn" | "billing mobile tel-local-prefix" | "billing mobile tel-local-prefix webauthn" | "billing mobile tel-local-suffix" | "billing mobile tel-local-suffix webauthn" | "billing mobile tel-national" | "billing mobile tel-national webauthn" | "billing work email" | "billing work email webauthn" | "billing work tel" | "billing work tel webauthn" | "billing work tel-area-code" | "billing work tel-area-code webauthn" | "billing work tel-country-code" | "billing work tel-country-code webauthn" | "billing work tel-extension" | "billing work tel-extension webauthn" | "billing work tel-local" | "billing work tel-local webauthn" | "billing work tel-local-prefix" | "billing work tel-local-prefix webauthn" | "billing work tel-local-suffix" | "billing work tel-local-suffix webauthn" | "billing work tel-national" | "billing work tel-national webauthn" | "shipping additional-name" | "shipping additional-name webauthn" | "shipping address-level1" | "shipping address-level1 webauthn" | "shipping address-level2" | "shipping address-level2 webauthn" | "shipping address-level3" | "shipping address-level3 webauthn" | "shipping address-level4" | "shipping address-level4 webauthn" | "shipping address-line1" | "shipping address-line1 webauthn" | "shipping address-line2" | "shipping address-line2 webauthn" | "shipping address-line3" | "shipping address-line3 webauthn" | "shipping bday-day" | "shipping bday-day webauthn" | "shipping bday-month" | "shipping bday-month webauthn" | "shipping bday-year" | "shipping bday-year webauthn" | "shipping cc-csc" | "shipping cc-csc webauthn" | "shipping cc-exp" | "shipping cc-exp webauthn" | "shipping cc-exp-month" | "shipping cc-exp-month webauthn" | "shipping cc-exp-year" | "shipping cc-exp-year webauthn" | "shipping cc-family-name" | "shipping cc-family-name webauthn" | "shipping cc-given-name" | "shipping cc-given-name webauthn" | "shipping cc-name" | "shipping cc-name webauthn" | "shipping cc-number" | "shipping cc-number webauthn" | "shipping cc-type" | "shipping cc-type webauthn" | "shipping country" | "shipping country webauthn" | "shipping country-name" | "shipping country-name webauthn" | "shipping current-password" | "shipping current-password webauthn" | "shipping family-name" | "shipping family-name webauthn" | "shipping given-name" | "shipping given-name webauthn" | "shipping honorific-prefix" | "shipping honorific-prefix webauthn" | "shipping honorific-suffix" | "shipping honorific-suffix webauthn" | "shipping name" | "shipping name webauthn" | "shipping new-password" | "shipping new-password webauthn" | "shipping one-time-code" | "shipping one-time-code webauthn" | "shipping organization" | "shipping organization webauthn" | "shipping postal-code" | "shipping postal-code webauthn" | "shipping street-address" | "shipping street-address webauthn" | "shipping transaction-amount" | "shipping transaction-amount webauthn" | "shipping transaction-currency" | "shipping transaction-currency webauthn" | "shipping username" | "shipping username webauthn" | "shipping email" | "shipping email webauthn" | "shipping tel" | "shipping tel webauthn" | "shipping tel-area-code" | "shipping tel-area-code webauthn" | "shipping tel-country-code" | "shipping tel-country-code webauthn" | "shipping tel-extension" | "shipping tel-extension webauthn" | "shipping tel-local" | "shipping tel-local webauthn" | "shipping tel-local-prefix" | "shipping tel-local-prefix webauthn" | "shipping tel-local-suffix" | "shipping tel-local-suffix webauthn" | "shipping tel-national" | "shipping tel-national webauthn" | "shipping home email" | "shipping home email webauthn" | "shipping home tel" | "shipping home tel webauthn" | "shipping home tel-area-code" | "shipping home tel-area-code webauthn" | "shipping home tel-country-code" | "shipping home tel-country-code webauthn" | "shipping home tel-extension" | "shipping home tel-extension webauthn" | "shipping home tel-local" | "shipping home tel-local webauthn" | "shipping home tel-local-prefix" | "shipping home tel-local-prefix webauthn" | "shipping home tel-local-suffix" | "shipping home tel-local-suffix webauthn" | "shipping home tel-national" | "shipping home tel-national webauthn" | "shipping mobile email" | "shipping mobile email webauthn" | "shipping mobile tel" | "shipping mobile tel webauthn" | "shipping mobile tel-area-code" | "shipping mobile tel-area-code webauthn" | "shipping mobile tel-country-code" | "shipping mobile tel-country-code webauthn" | "shipping mobile tel-extension" | "shipping mobile tel-extension webauthn" | "shipping mobile tel-local" | "shipping mobile tel-local webauthn" | "shipping mobile tel-local-prefix" | "shipping mobile tel-local-prefix webauthn" | "shipping mobile tel-local-suffix" | "shipping mobile tel-local-suffix webauthn" | "shipping mobile tel-national" | "shipping mobile tel-national webauthn" | "shipping work email" | "shipping work email webauthn" | "shipping work tel" | "shipping work tel webauthn" | "shipping work tel-area-code" | "shipping work tel-area-code webauthn" | "shipping work tel-country-code" | "shipping work tel-country-code webauthn" | "shipping work tel-extension" | "shipping work tel-extension webauthn" | "shipping work tel-local" | "shipping work tel-local webauthn" | "shipping work tel-local-prefix" | "shipping work tel-local-prefix webauthn" | "shipping work tel-local-suffix" | "shipping work tel-local-suffix webauthn" | "shipping work tel-national" | "shipping work tel-national webauthn" | "bday" | "cc-additional-name" | "billing cc-additional-name" | "shipping cc-additional-name" | "nickname" | "language" | "organization-title" | "photo" | "sex"'
			},
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
			name: 'onkeydown',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: '(e: KeyboardEvent) => void' },
			static: !1,
			readonly: !1
		}
	],
	name: 'FormInput.svelte'
};
export { D as F };
