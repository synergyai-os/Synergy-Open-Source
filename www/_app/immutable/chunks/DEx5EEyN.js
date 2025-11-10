import { c as _, a as u, p as j, f as x } from './ClEwQIZJ.js';
import {
	Y as i,
	j as r,
	V as m,
	p as E,
	f as w,
	a as D,
	s as te,
	c as B,
	af as M,
	r as N
} from './kOT-I_MI.js';
import { a as S } from './DjvPQNYr.js';
import { i as A } from './SF-wfan-.js';
import { b as V } from './CxucRfwL.js';
import { b as re, p as a, r as W } from './DgY3EWrn.js';
import { i as se } from './2OqfTREQ.js';
import { H as oe } from './4ZCJRGyS.js';
import {
	C as ae,
	a as Y,
	c as ie,
	E as ne,
	S as ce,
	b as U,
	g as de,
	d as he,
	e as pe,
	f as le,
	h as z,
	n as ue,
	i as d,
	m as G
} from './hVhnLUET.js';
import { w as me, d as fe } from './C3G0mfPY.js';
const J = ie({ component: 'switch', parts: ['root', 'thumb'] }),
	I = new ae('Switch.Root');
class L {
	static create(e) {
		return I.set(new L(e));
	}
	opts;
	attachment;
	constructor(e) {
		((this.opts = e),
			(this.attachment = Y(e.ref)),
			(this.onkeydown = this.onkeydown.bind(this)),
			(this.onclick = this.onclick.bind(this)));
	}
	#e() {
		this.opts.checked.current = !this.opts.checked.current;
	}
	onkeydown(e) {
		!(e.key === ne || e.key === ce) ||
			this.opts.disabled.current ||
			(e.preventDefault(), this.#e());
	}
	onclick(e) {
		this.opts.disabled.current || this.#e();
	}
	#t = i(() => ({
		'data-disabled': U(this.opts.disabled.current),
		'data-state': de(this.opts.checked.current),
		'data-required': U(this.opts.required.current)
	}));
	get sharedProps() {
		return r(this.#t);
	}
	set sharedProps(e) {
		m(this.#t, e);
	}
	#r = i(() => ({ checked: this.opts.checked.current }));
	get snippetProps() {
		return r(this.#r);
	}
	set snippetProps(e) {
		m(this.#r, e);
	}
	#s = i(() => ({
		...this.sharedProps,
		id: this.opts.id.current,
		role: 'switch',
		disabled: le(this.opts.disabled.current),
		'aria-checked': pe(this.opts.checked.current),
		'aria-required': he(this.opts.required.current),
		[J.root]: '',
		onclick: this.onclick,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return r(this.#s);
	}
	set props(e) {
		m(this.#s, e);
	}
}
class F {
	static create() {
		return new F(I.get());
	}
	root;
	#e = i(() => this.root.opts.name.current !== void 0);
	get shouldRender() {
		return r(this.#e);
	}
	set shouldRender(e) {
		m(this.#e, e);
	}
	constructor(e) {
		this.root = e;
	}
	#t = i(() => ({
		type: 'checkbox',
		name: this.root.opts.name.current,
		value: this.root.opts.value.current,
		checked: this.root.opts.checked.current,
		disabled: this.root.opts.disabled.current,
		required: this.root.opts.required.current
	}));
	get props() {
		return r(this.#t);
	}
	set props(e) {
		m(this.#t, e);
	}
}
class H {
	static create(e) {
		return new H(e, I.get());
	}
	opts;
	root;
	attachment;
	constructor(e, h) {
		((this.opts = e), (this.root = h), (this.attachment = Y(e.ref)));
	}
	#e = i(() => ({ checked: this.root.opts.checked.current }));
	get snippetProps() {
		return r(this.#e);
	}
	set snippetProps(e) {
		m(this.#e, e);
	}
	#t = i(() => ({
		...this.root.sharedProps,
		id: this.opts.id.current,
		[J.thumb]: '',
		...this.attachment
	}));
	get props() {
		return r(this.#t);
	}
	set props(e) {
		m(this.#t, e);
	}
}
function ke(t, e) {
	E(e, !1);
	const h = F.create();
	se();
	var p = _(),
		k = w(p);
	{
		var g = (c) => {
			oe(
				c,
				re(() => h.props)
			);
		};
		A(k, (c) => {
			h.shouldRender && c(g);
		});
	}
	(u(t, p), D());
}
var ge = x('<button><!></button>'),
	be = x('<!> <!>', 1);
function De(t, e) {
	const h = j();
	E(e, !0);
	let p = a(e, 'ref', 15, null),
		k = a(e, 'id', 19, () => z(h)),
		g = a(e, 'disabled', 3, !1),
		c = a(e, 'required', 3, !1),
		b = a(e, 'checked', 15, !1),
		y = a(e, 'value', 3, 'on'),
		C = a(e, 'name', 3, void 0),
		q = a(e, 'type', 3, 'button'),
		T = a(e, 'onCheckedChange', 3, ue),
		n = W(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'child',
			'children',
			'ref',
			'id',
			'disabled',
			'required',
			'checked',
			'value',
			'name',
			'type',
			'onCheckedChange'
		]);
	const s = L.create({
			checked: d(
				() => b(),
				(o) => {
					(b(o), T()?.(o));
				}
			),
			disabled: d(() => g() ?? !1),
			required: d(() => c()),
			value: d(() => y()),
			name: d(() => C()),
			id: d(() => k()),
			ref: d(
				() => p(),
				(o) => p(o)
			)
		}),
		f = i(() => G(n, s.props, { type: q() }));
	var P = be(),
		O = w(P);
	{
		var X = (o) => {
				var l = _(),
					R = w(l);
				{
					let ee = i(() => ({ props: r(f), ...s.snippetProps }));
					S(
						R,
						() => e.child,
						() => r(ee)
					);
				}
				u(o, l);
			},
			Z = (o) => {
				var l = ge();
				V(l, () => ({ ...r(f) }));
				var R = B(l);
				(S(
					R,
					() => e.children ?? M,
					() => s.snippetProps
				),
					N(l),
					u(o, l));
			};
		A(O, (o) => {
			e.child ? o(X) : o(Z, !1);
		});
	}
	var $ = te(O, 2);
	(ke($, {}), u(t, P), D());
}
var ve = x('<span><!></span>');
function Ae(t, e) {
	const h = j();
	E(e, !0);
	let p = a(e, 'ref', 15, null),
		k = a(e, 'id', 19, () => z(h)),
		g = W(e, ['$$slots', '$$events', '$$legacy', 'child', 'children', 'ref', 'id']);
	const c = H.create({
			id: d(() => k()),
			ref: d(
				() => p(),
				(n) => p(n)
			)
		}),
		b = i(() => G(g, c.props));
	var y = _(),
		C = w(y);
	{
		var q = (n) => {
				var s = _(),
					f = w(s);
				{
					let P = i(() => ({ props: r(b), ...c.snippetProps }));
					S(
						f,
						() => e.child,
						() => r(P)
					);
				}
				u(n, s);
			},
			T = (n) => {
				var s = ve();
				V(s, () => ({ ...r(b) }));
				var f = B(s);
				(S(
					f,
					() => e.children ?? M,
					() => c.snippetProps
				),
					N(s),
					u(n, s));
			};
		A(C, (n) => {
			e.child ? n(q) : n(T, !1);
		});
	}
	(u(t, y), D());
}
function we() {
	if (typeof window > 'u') return 'dark';
	try {
		const e = localStorage.getItem('axon-theme');
		if (e === 'light' || e === 'dark') return e;
	} catch (e) {
		console.warn('Failed to load theme from localStorage:', e);
	}
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function K(t) {
	if (typeof document > 'u') return;
	const e = document.documentElement;
	t === 'dark'
		? (e.classList.add('dark'), e.classList.remove('light'))
		: (e.classList.add('light'), e.classList.remove('dark'));
}
const Q = we();
typeof document < 'u' && K(Q);
const v = me(Q);
v.subscribe((t) => {
	K(t);
	try {
		typeof window < 'u' && localStorage.setItem('axon-theme', t);
	} catch (e) {
		console.warn('Failed to save theme to localStorage:', e);
	}
});
const Ie = fe(v, (t) => t === 'dark'),
	Le = {
		subscribe: v.subscribe,
		setTheme: (t) => v.set(t),
		toggleTheme: () => {
			v.update((t) => (t === 'dark' ? 'light' : 'dark'));
		}
	};
export { Ae as S, De as a, Ie as i, Le as t };
