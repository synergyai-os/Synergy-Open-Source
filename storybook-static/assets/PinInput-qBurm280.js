import {
	G as F,
	a8 as h,
	ab as D,
	v as n,
	w,
	aC as mt,
	aD as ft,
	aA as gt,
	ae as it,
	p as J,
	h as v,
	f as k,
	k as X,
	n as ot,
	e as I,
	s as L,
	b as P,
	c as Q,
	o as at,
	F as N,
	a as W,
	m as R,
	a9 as nt,
	i as j,
	j as K,
	t as vt
} from './iframe-DYn7RqBV.js';
import { e as bt, i as yt } from './each-DHv61wEY.js';
import { a as G, s as wt } from './attributes-D2XuSyo_.js';
import { w as xt } from './watch.svelte-CYSsdG2H.js';
import { P as Pt } from './previous.svelte-BRBO0xyC.js';
import { g as _t, D as St } from './dom-context.svelte-Cee2qr-t.js';
import { q as st, a as Y, c as Et, f as Ct, d as q, b, m as O } from './create-id-CD7dpc57.js';
import { n as rt } from './noop-DX6rZLP_.js';
const Dt = 18,
	lt = 40,
	kt = `${lt}px`,
	At = [
		'[data-lastpass-icon-root]',
		'com-1password-button',
		'[data-dashlanecreated]',
		'[style$="2147483647 !important;"]'
	].join(',');
function Tt({
	containerRef: y,
	inputRef: t,
	pushPasswordManagerStrategy: e,
	isFocused: s,
	domContext: o
}) {
	let u = D(!1),
		m = D(!1),
		p = D(!1);
	function f() {
		const r = e.current;
		return r === 'none' ? !1 : r === 'increase-width' && n(u) && n(m);
	}
	function d() {
		const r = y.current,
			c = t.current;
		if (!r || !c || n(p) || e.current === 'none') return;
		const i = r,
			a = i.getBoundingClientRect().left + i.offsetWidth,
			l = i.getBoundingClientRect().top + i.offsetHeight / 2,
			x = a - Dt,
			_ = l;
		(o.querySelectorAll(At).length === 0 && o.getDocument().elementFromPoint(x, _) === r) ||
			(h(u, !0), h(p, !0));
	}
	return (
		F(() => {
			const r = y.current;
			if (!r || e.current === 'none') return;
			function c() {
				const l = _t(r).innerWidth - r.getBoundingClientRect().right;
				h(m, l >= lt);
			}
			c();
			const i = setInterval(c, 1e3);
			return () => {
				clearInterval(i);
			};
		}),
		F(() => {
			const r = s.current || o.getActiveElement() === t.current;
			if (e.current === 'none' || !r) return;
			const c = setTimeout(d, 0),
				i = setTimeout(d, 2e3),
				a = setTimeout(d, 5e3),
				l = setTimeout(() => {
					h(p, !0);
				}, 6e3);
			return () => {
				(clearTimeout(c), clearTimeout(i), clearTimeout(a), clearTimeout(l));
			};
		}),
		{
			get hasPwmBadge() {
				return n(u);
			},
			get willPushPwmBadge() {
				return f();
			},
			PWM_BADGE_SPACE_WIDTH: kt
		}
	);
}
const It = '^\\d+$',
	ct = Et({ component: 'pin-input', parts: ['root', 'cell'] }),
	Bt = [
		'Backspace',
		'Delete',
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Home',
		'End',
		'Escape',
		'Enter',
		'Tab',
		'Shift',
		'Control',
		'Meta'
	];
class Z {
	static create(t) {
		return new Z(t);
	}
	opts;
	attachment;
	#t = st(null);
	#a = D(!1);
	inputAttachment = Y(this.#t);
	#r = st(!1);
	#e = D(null);
	#n = D(null);
	#l = new Pt(() => this.opts.value.current ?? '');
	#s = w(() =>
		typeof this.opts.pattern.current == 'string'
			? new RegExp(this.opts.pattern.current)
			: this.opts.pattern.current
	);
	#i = D(mt({ prev: [null, null, 'none'], willSyntheticBlur: !1 }));
	#o;
	#c;
	domContext;
	constructor(t) {
		((this.opts = t),
			(this.attachment = Y(this.opts.ref)),
			(this.domContext = new St(t.ref)),
			(this.#c = {
				value: this.opts.value,
				isIOS: typeof window < 'u' && window?.CSS?.supports('-webkit-touch-callout', 'none')
			}),
			(this.#o = Tt({
				containerRef: this.opts.ref,
				inputRef: this.#t,
				isFocused: this.#r,
				pushPasswordManagerStrategy: this.opts.pushPasswordManagerStrategy,
				domContext: this.domContext
			})),
			ft(() => {
				const e = this.#t.current,
					s = this.opts.ref.current;
				if (!e || !s) return;
				(this.#c.value.current !== e.value && (this.opts.value.current = e.value),
					(n(this.#i).prev = [e.selectionStart, e.selectionEnd, e.selectionDirection ?? 'none']));
				const o = gt(this.domContext.getDocument(), 'selectionchange', this.#d, { capture: !0 });
				(this.#d(),
					this.domContext.getActiveElement() === e && (this.#r.current = !0),
					this.domContext.getElementById('pin-input-style') || this.#v());
				const u = () => {
					s && s.style.setProperty('--bits-pin-input-root-height', `${e.clientHeight}px`);
				};
				u();
				const m = new ResizeObserver(u);
				return (
					m.observe(e),
					() => {
						(o(), m.disconnect());
					}
				);
			}),
			xt([() => this.opts.value.current, () => this.#t.current], () => {
				Rt(() => {
					const e = this.#t.current;
					if (!e) return;
					e.dispatchEvent(new Event('input'));
					const s = e.selectionStart,
						o = e.selectionEnd,
						u = e.selectionDirection ?? 'none';
					s !== null &&
						o !== null &&
						(h(this.#e, s, !0), h(this.#n, o, !0), (n(this.#i).prev = [s, o, u]));
				}, this.domContext);
			}),
			F(() => {
				const e = this.opts.value.current,
					s = this.#l.current,
					o = this.opts.maxLength.current,
					u = this.opts.onComplete.current;
				s !== void 0 && e !== s && s.length < o && e.length === o && u(e);
			}));
	}
	onkeydown = (t) => {
		const e = t.key;
		Bt.includes(e) ||
			t.ctrlKey ||
			t.metaKey ||
			(e && n(this.#s) && !n(this.#s).test(e) && t.preventDefault());
	};
	#f = w(() => ({
		position: 'relative',
		cursor: this.opts.disabled.current ? 'default' : 'text',
		userSelect: 'none',
		WebkitUserSelect: 'none',
		pointerEvents: 'none'
	}));
	#u = w(() => ({
		id: this.opts.id.current,
		[ct.root]: '',
		style: n(this.#f),
		...this.attachment
	}));
	get rootProps() {
		return n(this.#u);
	}
	set rootProps(t) {
		h(this.#u, t);
	}
	#p = w(() => ({ style: { position: 'absolute', inset: 0, pointerEvents: 'none' } }));
	get inputWrapperProps() {
		return n(this.#p);
	}
	set inputWrapperProps(t) {
		h(this.#p, t);
	}
	#g = w(() => ({
		position: 'absolute',
		inset: 0,
		width: this.#o.willPushPwmBadge ? `calc(100% + ${this.#o.PWM_BADGE_SPACE_WIDTH})` : '100%',
		clipPath: this.#o.willPushPwmBadge ? `inset(0 ${this.#o.PWM_BADGE_SPACE_WIDTH} 0 0)` : void 0,
		height: '100%',
		display: 'flex',
		textAlign: this.opts.textAlign.current,
		opacity: '1',
		color: 'transparent',
		pointerEvents: 'all',
		background: 'transparent',
		caretColor: 'transparent',
		border: '0 solid transparent',
		outline: '0 solid transparent',
		boxShadow: 'none',
		lineHeight: '1',
		letterSpacing: '-.5em',
		fontSize: 'var(--bits-pin-input-root-height)',
		fontFamily: 'monospace',
		fontVariantNumeric: 'tabular-nums'
	}));
	#v() {
		const t = this.domContext.getDocument(),
			e = t.createElement('style');
		if (((e.id = 'pin-input-style'), t.head.appendChild(e), e.sheet)) {
			const s =
				'background: transparent !important; color: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;';
			(B(
				e.sheet,
				'[data-pin-input-input]::selection { background: transparent !important; color: transparent !important; }'
			),
				B(e.sheet, `[data-pin-input-input]:autofill { ${s} }`),
				B(e.sheet, `[data-pin-input-input]:-webkit-autofill { ${s} }`),
				B(
					e.sheet,
					'@supports (-webkit-touch-callout: none) { [data-pin-input-input] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }'
				),
				B(e.sheet, '[data-pin-input-input] + * { pointer-events: all !important; }'));
		}
	}
	#d = () => {
		const t = this.#t.current,
			e = this.opts.ref.current;
		if (!t || !e) return;
		if (this.domContext.getActiveElement() !== t) {
			(h(this.#e, null), h(this.#n, null));
			return;
		}
		const s = t.selectionStart,
			o = t.selectionEnd,
			u = t.selectionDirection ?? 'none',
			m = t.maxLength,
			p = t.value,
			f = n(this.#i).prev;
		let d = -1,
			r = -1,
			c;
		if (p.length !== 0 && s !== null && o !== null) {
			const x = s === o,
				_ = s === p.length && p.length < m;
			if (x && !_) {
				const g = s;
				if (g === 0) ((d = 0), (r = 1), (c = 'forward'));
				else if (g === m) ((d = g - 1), (r = g), (c = 'backward'));
				else if (m > 1 && p.length > 1) {
					let S = 0;
					if (f[0] !== null && f[1] !== null) {
						c = g < f[0] ? 'backward' : 'forward';
						const E = f[0] === f[1] && f[0] < m;
						c === 'backward' && !E && (S = -1);
					}
					((d = S - g), (r = S + g + 1));
				}
			}
			d !== -1 && r !== -1 && d !== r && this.#t.current?.setSelectionRange(d, r, c);
		}
		const i = d !== -1 ? d : s,
			a = r !== -1 ? r : o,
			l = c ?? u;
		(h(this.#e, i, !0), h(this.#n, a, !0), (n(this.#i).prev = [i, a, l]));
	};
	oninput = (t) => {
		const e = t.currentTarget.value.slice(0, this.opts.maxLength.current);
		if (e.length > 0 && n(this.#s) && !n(this.#s).test(e)) {
			t.preventDefault();
			return;
		}
		(typeof this.#l.current == 'string' &&
			e.length < this.#l.current.length &&
			this.domContext.getDocument().dispatchEvent(new Event('selectionchange')),
			(this.opts.value.current = e));
	};
	onfocus = (t) => {
		const e = this.#t.current;
		if (e) {
			const s = Math.min(e.value.length, this.opts.maxLength.current - 1),
				o = e.value.length;
			(e.setSelectionRange(s, o), h(this.#e, s, !0), h(this.#n, o, !0));
		}
		this.#r.current = !0;
	};
	onpaste = (t) => {
		const e = this.#t.current;
		if (!e) return;
		const s = (r) => {
				const c = e.selectionStart === null ? void 0 : e.selectionStart,
					i = e.selectionEnd === null ? void 0 : e.selectionEnd,
					a = c !== i,
					l = this.opts.value.current;
				return (a ? l.slice(0, c) + r + l.slice(i) : l.slice(0, c) + r + l.slice(c)).slice(
					0,
					this.opts.maxLength.current
				);
			},
			o = (r) => r.length > 0 && n(this.#s) && !n(this.#s).test(r);
		if (!this.opts.pasteTransformer?.current && (!this.#c.isIOS || !t.clipboardData || !e)) {
			const r = s(t.clipboardData?.getData('text/plain'));
			o(r) && t.preventDefault();
			return;
		}
		const u = t.clipboardData?.getData('text/plain') ?? '',
			m = this.opts.pasteTransformer?.current ? this.opts.pasteTransformer.current(u) : u;
		t.preventDefault();
		const p = s(m);
		if (o(p)) return;
		((e.value = p), (this.opts.value.current = p));
		const f = Math.min(p.length, this.opts.maxLength.current - 1),
			d = p.length;
		(e.setSelectionRange(f, d), h(this.#e, f, !0), h(this.#n, d, !0));
	};
	onmouseover = (t) => {
		h(this.#a, !0);
	};
	onmouseleave = (t) => {
		h(this.#a, !1);
	};
	onblur = (t) => {
		if (n(this.#i).willSyntheticBlur) {
			n(this.#i).willSyntheticBlur = !1;
			return;
		}
		this.#r.current = !1;
	};
	#h = w(() => ({
		id: this.opts.inputId.current,
		style: n(this.#g),
		autocomplete: this.opts.autocomplete.current || 'one-time-code',
		'data-pin-input-input': '',
		'data-pin-input-input-mss': n(this.#e),
		'data-pin-input-input-mse': n(this.#n),
		inputmode: this.opts.inputmode.current,
		pattern: n(this.#s)?.source,
		maxlength: this.opts.maxLength.current,
		value: this.opts.value.current,
		disabled: Ct(this.opts.disabled.current),
		onpaste: this.onpaste,
		oninput: this.oninput,
		onkeydown: this.onkeydown,
		onmouseover: this.onmouseover,
		onmouseleave: this.onmouseleave,
		onfocus: this.onfocus,
		onblur: this.onblur,
		...this.inputAttachment
	}));
	get inputProps() {
		return n(this.#h);
	}
	set inputProps(t) {
		h(this.#h, t);
	}
	#b = w(() =>
		Array.from({ length: this.opts.maxLength.current }).map((t, e) => {
			const s =
					this.#r.current &&
					n(this.#e) !== null &&
					n(this.#n) !== null &&
					((n(this.#e) === n(this.#n) && e === n(this.#e)) || (e >= n(this.#e) && e < n(this.#n))),
				o = this.opts.value.current[e] !== void 0 ? this.opts.value.current[e] : null;
			return { char: o, isActive: s, hasFakeCaret: s && o === null };
		})
	);
	#m = w(() => ({ cells: n(this.#b), isFocused: this.#r.current, isHovering: n(this.#a) }));
	get snippetProps() {
		return n(this.#m);
	}
	set snippetProps(t) {
		h(this.#m, t);
	}
}
class $ {
	static create(t) {
		return new $(t);
	}
	opts;
	attachment;
	constructor(t) {
		((this.opts = t), (this.attachment = Y(this.opts.ref)));
	}
	#t = w(() => ({
		id: this.opts.id.current,
		[ct.cell]: '',
		'data-active': this.opts.cell.current.isActive ? '' : void 0,
		'data-inactive': this.opts.cell.current.isActive ? void 0 : '',
		...this.attachment
	}));
	get props() {
		return n(this.#t);
	}
	set props(t) {
		h(this.#t, t);
	}
}
function Rt(y, t) {
	const e = t.setTimeout(y, 0),
		s = t.setTimeout(y, 10),
		o = t.setTimeout(y, 50);
	return [e, s, o];
}
function B(y, t) {
	try {
		y.insertRule(t);
	} catch {
		console.error('pin input could not insert CSS rule:', t);
	}
}
var Wt = k('<div><!> <div><input/></div></div>');
function Mt(y, t) {
	const e = it();
	J(t, !0);
	let s = v(t, 'id', 19, () => q(e)),
		o = v(t, 'inputId', 19, () => `${q(e)}-input`),
		u = v(t, 'ref', 15, null),
		m = v(t, 'maxlength', 3, 6),
		p = v(t, 'textalign', 3, 'left'),
		f = v(t, 'inputmode', 3, 'numeric'),
		d = v(t, 'onComplete', 3, rt),
		r = v(t, 'pushPasswordManagerStrategy', 3, 'increase-width'),
		c = v(t, 'class', 3, ''),
		i = v(t, 'autocomplete', 3, 'one-time-code'),
		a = v(t, 'disabled', 3, !1),
		l = v(t, 'value', 15, ''),
		x = v(t, 'onValueChange', 3, rt),
		_ = at(t, [
			'$$slots',
			'$$events',
			'$$legacy',
			'id',
			'inputId',
			'ref',
			'maxlength',
			'textalign',
			'pattern',
			'inputmode',
			'onComplete',
			'pushPasswordManagerStrategy',
			'class',
			'children',
			'autocomplete',
			'disabled',
			'value',
			'onValueChange',
			'pasteTransformer'
		]);
	const g = Z.create({
			id: b(() => s()),
			ref: b(
				() => u(),
				(T) => u(T)
			),
			inputId: b(() => o()),
			autocomplete: b(() => i()),
			maxLength: b(() => m()),
			textAlign: b(() => p()),
			disabled: b(() => a()),
			inputmode: b(() => f()),
			pattern: b(() => t.pattern),
			onComplete: b(() => d()),
			value: b(
				() => l(),
				(T) => {
					(l(T), x()(T));
				}
			),
			pushPasswordManagerStrategy: b(() => r()),
			pasteTransformer: b(() => t.pasteTransformer)
		}),
		S = w(() => O(_, g.inputProps)),
		E = w(() => O(g.rootProps, { class: c() })),
		z = w(() => O(g.inputWrapperProps, {}));
	var A = Wt();
	G(A, () => ({ ...n(E) }));
	var M = I(A);
	X(
		M,
		() => t.children ?? ot,
		() => g.snippetProps
	);
	var V = L(M, 2);
	G(V, () => ({ ...n(z) }));
	var U = I(V);
	(G(U, () => ({ ...n(S) }), void 0, void 0, void 0, void 0, !0), P(y, A), Q());
}
var Vt = k('<div><!></div>');
function Ht(y, t) {
	const e = it();
	J(t, !0);
	let s = v(t, 'id', 19, () => q(e)),
		o = v(t, 'ref', 15, null),
		u = at(t, ['$$slots', '$$events', '$$legacy', 'id', 'ref', 'cell', 'child', 'children']);
	const m = $.create({
			id: b(() => s()),
			ref: b(
				() => o(),
				(i) => o(i)
			),
			cell: b(() => t.cell)
		}),
		p = w(() => O(u, m.props));
	var f = N(),
		d = W(f);
	{
		var r = (i) => {
				var a = N(),
					l = W(a);
				(X(
					l,
					() => t.child,
					() => ({ props: n(p) })
				),
					P(i, a));
			},
			c = (i) => {
				var a = Vt();
				G(a, () => ({ ...n(p) }));
				var l = I(a);
				(X(l, () => t.children ?? ot), P(i, a));
			};
		R(d, (i) => {
			t.child ? i(r) : i(c, !1);
		});
	}
	(P(y, f), Q());
}
var Lt = k('<label class="text-small font-medium text-label-primary"> </label>'),
	Gt = k('<div class="animate-pulse">|</div>'),
	Ot = k('<!> <!>', 1),
	Ft = k('<p class="text-small text-error"> </p>'),
	Nt = k('<div class="flex flex-col gap-form-field"><!> <!> <!></div>');
function zt(y, t) {
	J(t, !0);
	let e = v(t, 'value', 15, ''),
		s = v(t, 'error', 3, null),
		o = v(t, 'disabled', 3, !1);
	F(() => {
		e().length === 6 && t.onComplete && t.onComplete(e());
	});
	const u = `pin-input-${Math.random().toString(36).substring(7)}`;
	var m = Nt(),
		p = I(m);
	{
		var f = (i) => {
			var a = Lt(),
				l = I(a);
			(j(() => {
				(wt(a, 'for', u), K(l, t.label));
			}),
				P(i, a));
		};
		R(p, (i) => {
			t.label && i(f);
		});
	}
	var d = L(p, 2);
	{
		const i = (a, l) => {
			let x = () => l?.().cells;
			var _ = N(),
				g = W(_);
			(bt(g, 17, x, yt, (S, E, z) => {
				var A = N(),
					M = W(A);
				{
					let V = w(() => (s() ? 'border-error' : ''));
					nt(
						M,
						() => Ht,
						(U, T) => {
							T(U, {
								get cell() {
									return n(E);
								},
								'data-testid': `pin-input-cell-${z}`,
								get class() {
									return `size-pin-cell rounded-input border-2 border-base bg-input text-center text-pin-cell leading-pin-cell font-bold text-primary caret-accent-primary transition-all duration-200 placeholder:text-tertiary focus:border-accent-primary focus:shadow-pin-glow focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${n(V) ?? ''}`;
								},
								children: (ut, Ut) => {
									var tt = Ot(),
										et = W(tt);
									{
										var pt = (C) => {
											var H = vt();
											(j(() => K(H, n(E).char)), P(C, H));
										};
										R(et, (C) => {
											n(E).char !== null && C(pt);
										});
									}
									var dt = L(et, 2);
									{
										var ht = (C) => {
											var H = Gt();
											P(C, H);
										};
										R(dt, (C) => {
											n(E).hasFakeCaret && C(ht);
										});
									}
									P(ut, tt);
								},
								$$slots: { default: !0 }
							});
						}
					);
				}
				P(S, A);
			}),
				P(a, _));
		};
		nt(
			d,
			() => Mt,
			(a, l) => {
				l(a, {
					get pattern() {
						return It;
					},
					get disabled() {
						return o();
					},
					maxlength: 6,
					get id() {
						return u;
					},
					class: 'gap-input-group flex justify-center',
					onpaste: (x) => {
						const _ = x.clipboardData?.getData('text');
						if (_) {
							const g = _.match(/\b\d{6}\b/);
							g &&
								(x.preventDefault(), e(g[0]), console.log('📋 Pasted 6-digit code from clipboard'));
						}
					},
					get value() {
						return e();
					},
					set value(x) {
						e(x);
					},
					children: i,
					$$slots: { default: !0 }
				});
			}
		);
	}
	var r = L(d, 2);
	{
		var c = (i) => {
			var a = Ft(),
				l = I(a);
			(j(() => K(l, s())), P(i, a));
		};
		R(r, (i) => {
			s() && i(c);
		});
	}
	(P(y, m), Q());
}
zt.__docgen = {
	data: [
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
			name: 'label',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'error',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1,
			defaultValue: 'null'
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
			name: 'onComplete',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: '(value: string) => void' },
			static: !1,
			readonly: !1
		}
	],
	name: 'PinInput.svelte'
};
export { zt as P };
