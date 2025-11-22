import {
	L as I,
	au as J,
	av as Q,
	aw as U,
	ax as W,
	K as X,
	a7 as Y,
	ah as Z,
	ay as x,
	p as T,
	h as n,
	F as u,
	a as y,
	b as f,
	c as F,
	o as M,
	k as B,
	n as $,
	m as ee,
	a9 as N,
	d as P,
	v as S,
	w as A
} from './iframe-DYn7RqBV.js';
import { a as te } from './attributes-D2XuSyo_.js';
import { b as ae } from './this-Hz0nHxQJ.js';
function ne(p, e, i, s, r, d) {
	var t = null,
		b = p,
		v = new Q(b, !1);
	(I(() => {
		const a = e() || null;
		var o = a === 'svg' ? U : null;
		if (a === null) {
			(v.ensure(null, null), x(!0));
			return;
		}
		return (
			v.ensure(a, (l) => {
				if (a) {
					if (((t = o ? document.createElementNS(o, a) : document.createElement(a)), W(t, t), s)) {
						var h = t.appendChild(X());
						s(t, h);
					}
					((Y.nodes_end = t), l.before(t));
				}
			}),
			x(!0),
			() => {
				a && x(!1);
			}
		);
	}, J),
		Z(() => {
			x(!0);
		}));
}
function O(p, e) {
	T(e, !0);
	let i = n(e, 'disabled', 3, !1),
		s = n(e, 'ref', 15, null),
		r = M(e, ['$$slots', '$$events', '$$legacy', 'href', 'type', 'children', 'disabled', 'ref']);
	var d = u(),
		t = y(d);
	(ne(
		t,
		() => (e.href ? 'a' : 'button'),
		!1,
		(b, v) => {
			(ae(
				b,
				(l) => s(l),
				() => s()
			),
				te(b, () => ({
					'data-button-root': !0,
					type: e.href ? void 0 : e.type,
					href: e.href && !i() ? e.href : void 0,
					disabled: e.href ? void 0 : i(),
					'aria-disabled': e.href ? i() : void 0,
					role: e.href && i() ? 'link' : void 0,
					tabindex: e.href && i() ? -1 : 0,
					...r
				})));
			var a = u(),
				o = y(a);
			(B(o, () => e.children ?? $), f(v, a));
		}
	),
		f(p, d),
		F());
}
function ie(p, e) {
	T(e, !0);
	let i = n(e, 'variant', 3, 'primary'),
		s = n(e, 'size', 3, 'md'),
		r = n(e, 'iconOnly', 3, !1),
		d = n(e, 'ariaLabel', 3, void 0),
		t = n(e, 'href', 3, void 0),
		b = n(e, 'onclick', 3, void 0),
		v = n(e, 'class', 3, ''),
		a = n(e, 'type', 3, 'button'),
		o = n(e, 'disabled', 3, !1),
		l = n(e, 'ref', 15, null),
		h = M(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'variant',
			'size',
			'iconOnly',
			'ariaLabel',
			'href',
			'onclick',
			'children',
			'class',
			'type',
			'disabled',
			'ref'
		]);
	r() && d();
	const j = 'inline-flex items-center justify-center rounded-button transition-colors-token',
		R = {
			primary: 'bg-accent-primary text-primary hover:bg-accent-hover disabled:opacity-50',
			secondary:
				'bg-elevated border border-base text-primary hover:border-accent-primary disabled:opacity-50',
			outline:
				'border border-base text-primary hover:bg-hover-solid disabled:opacity-50 disabled:hover:bg-elevated'
		},
		q = r()
			? { sm: 'p-nav-item', md: 'p-button-icon', lg: 'p-button-icon' }
			: {
					sm: 'px-nav-item py-nav-item gap-icon text-small',
					md: 'px-button-x py-button-y gap-icon text-button',
					lg: 'px-button-x py-button-y gap-icon text-body'
				},
		L = `${j} ${R[i()]} ${q[s()]} ${v()}`;
	var z = u(),
		G = y(z);
	{
		var H = (m) => {
				var g = u(),
					_ = y(g);
				{
					let w = A(() => (r() ? d() : void 0));
					N(
						_,
						() => O,
						(E, C) => {
							C(
								E,
								P(
									{
										get href() {
											return t();
										},
										get class() {
											return L;
										},
										get disabled() {
											return o();
										},
										get 'aria-label'() {
											return S(w);
										}
									},
									() => h,
									{
										get ref() {
											return l();
										},
										set ref(c) {
											l(c);
										},
										children: (c, D) => {
											var k = u(),
												V = y(k);
											(B(V, () => e.children), f(c, k));
										},
										$$slots: { default: !0 }
									}
								)
							);
						}
					);
				}
				f(m, g);
			},
			K = (m) => {
				var g = u(),
					_ = y(g);
				{
					let w = A(() => (r() ? d() : void 0));
					N(
						_,
						() => O,
						(E, C) => {
							C(
								E,
								P(
									{
										get onclick() {
											return b();
										},
										get class() {
											return L;
										},
										get type() {
											return a();
										},
										get disabled() {
											return o();
										},
										get 'aria-label'() {
											return S(w);
										}
									},
									() => h,
									{
										get ref() {
											return l();
										},
										set ref(c) {
											l(c);
										},
										children: (c, D) => {
											var k = u(),
												V = y(k);
											(B(V, () => e.children), f(c, k));
										},
										$$slots: { default: !0 }
									}
								)
							);
						}
					);
				}
				f(m, g);
			};
		ee(G, (m) => {
			t() ? m(H) : m(K, !1);
		});
	}
	(f(p, z), F());
}
ie.__docgen = {
	data: [
		{
			name: 'variant',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'primary', text: '"primary"' },
					{ kind: 'const', type: 'string', value: 'secondary', text: '"secondary"' },
					{ kind: 'const', type: 'string', value: 'outline', text: '"outline"' }
				],
				text: '"primary" | "secondary" | "outline"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"primary"'
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
			name: 'iconOnly',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'boolean', text: 'boolean' },
			static: !1,
			readonly: !1,
			defaultValue: 'false'
		},
		{
			name: 'ariaLabel',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'href',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'onclick',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
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
			name: 'type',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'button', text: '"button"' },
					{ kind: 'const', type: 'string', value: 'submit', text: '"submit"' },
					{ kind: 'const', type: 'string', value: 'reset', text: '"reset"' }
				],
				text: '"button" | "submit" | "reset"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"button"'
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
			name: 'title',
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
			type: { kind: 'type', type: 'object', text: 'HTMLButtonElement' },
			static: !1,
			readonly: !1,
			defaultValue: '...'
		}
	],
	name: 'Button.svelte'
};
export { ie as B };
