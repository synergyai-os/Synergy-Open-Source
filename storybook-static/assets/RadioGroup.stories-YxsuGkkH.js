import {
	w as k,
	v as l,
	a8 as C,
	ab as ve,
	G as he,
	p as J,
	F as U,
	a as E,
	m as G,
	b as r,
	c as Q,
	d as M,
	ae as se,
	h as w,
	f as d,
	s as b,
	k as W,
	n as K,
	e as h,
	o as ne,
	t as V,
	i as F
} from './iframe-DYn7RqBV.js';
import { i as ae, c as fe } from './create-runtime-stories-2rm03jka.js';
import { d as me } from './index-QxUtaCdU.js';
import { a as de } from './attributes-D2XuSyo_.js';
import { w as be } from './watch.svelte-CYSsdG2H.js';
import { C as _e } from './context-DWcBTeuX.js';
import {
	a as ce,
	c as ye,
	h as z,
	g as ie,
	p as ge,
	b as R,
	d as le,
	m as ue
} from './create-id-CD7dpc57.js';
import { R as we } from './roving-focus-group-B-fCEnqo.js';
import { S as Re } from './kbd-constants-Duhtze-4.js';
import { H as ke } from './hidden-input-1T3DLxGL.js';
import { n as $e } from './noop-DX6rZLP_.js';
import { R as q } from './Label-BXv2dhHR.js';
import { s as T } from './class-BLXIZATI.js';
import './preload-helper-PPVm8Dsz.js';
import './style-MviLiK55.js';
import './is-DtD5rb4o.js';
import './input-XwGP8Xvd.js';
const Y = ye({ component: 'radio-group', parts: ['root', 'item'] }),
	Z = new _e('RadioGroup.Root');
class ee {
	static create(e) {
		return Z.set(new ee(e));
	}
	opts;
	#t = k(() => this.opts.value.current !== '');
	get hasValue() {
		return l(this.#t);
	}
	set hasValue(e) {
		C(this.#t, e);
	}
	rovingFocusGroup;
	attachment;
	constructor(e) {
		((this.opts = e),
			(this.attachment = ce(this.opts.ref)),
			(this.rovingFocusGroup = new we({
				rootNode: this.opts.ref,
				candidateAttr: Y.item,
				loop: this.opts.loop,
				orientation: this.opts.orientation
			})));
	}
	isChecked(e) {
		return this.opts.value.current === e;
	}
	setValue(e) {
		this.opts.value.current = e;
	}
	#e = k(() => ({
		id: this.opts.id.current,
		role: 'radiogroup',
		'aria-required': ie(this.opts.required.current),
		'aria-disabled': ie(this.opts.disabled.current),
		'aria-readonly': this.opts.readonly.current ? 'true' : void 0,
		'data-disabled': z(this.opts.disabled.current),
		'data-readonly': z(this.opts.readonly.current),
		'data-orientation': this.opts.orientation.current,
		[Y.root]: '',
		...this.attachment
	}));
	get props() {
		return l(this.#e);
	}
	set props(e) {
		C(this.#e, e);
	}
}
class te {
	static create(e) {
		return new te(e, Z.get());
	}
	opts;
	root;
	attachment;
	#t = k(() => this.root.opts.value.current === this.opts.value.current);
	get checked() {
		return l(this.#t);
	}
	set checked(e) {
		C(this.#t, e);
	}
	#e = k(() => this.opts.disabled.current || this.root.opts.disabled.current);
	#o = k(() => this.root.opts.readonly.current);
	#i = k(() => this.root.isChecked(this.opts.value.current));
	#r = ve(-1);
	constructor(e, I) {
		((this.opts = e),
			(this.root = I),
			(this.attachment = ce(this.opts.ref)),
			this.opts.value.current === this.root.opts.value.current
				? (this.root.rovingFocusGroup.setCurrentTabStopId(this.opts.id.current), C(this.#r, 0))
				: this.root.opts.value.current || C(this.#r, 0),
			he(() => {
				C(this.#r, this.root.rovingFocusGroup.getTabIndex(this.opts.ref.current), !0);
			}),
			be([() => this.opts.value.current, () => this.root.opts.value.current], () => {
				this.opts.value.current === this.root.opts.value.current &&
					(this.root.rovingFocusGroup.setCurrentTabStopId(this.opts.id.current), C(this.#r, 0));
			}),
			(this.onclick = this.onclick.bind(this)),
			(this.onkeydown = this.onkeydown.bind(this)),
			(this.onfocus = this.onfocus.bind(this)));
	}
	onclick(e) {
		this.opts.disabled.current || l(this.#o) || this.root.setValue(this.opts.value.current);
	}
	onfocus(e) {
		!this.root.hasValue || l(this.#o) || this.root.setValue(this.opts.value.current);
	}
	onkeydown(e) {
		if (!l(this.#e)) {
			if (e.key === Re) {
				(e.preventDefault(), l(this.#o) || this.root.setValue(this.opts.value.current));
				return;
			}
			this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e, !0);
		}
	}
	#s = k(() => ({ checked: l(this.#i) }));
	get snippetProps() {
		return l(this.#s);
	}
	set snippetProps(e) {
		C(this.#s, e);
	}
	#n = k(() => ({
		id: this.opts.id.current,
		disabled: l(this.#e) ? !0 : void 0,
		'data-value': this.opts.value.current,
		'data-orientation': this.root.opts.orientation.current,
		'data-disabled': z(l(this.#e)),
		'data-readonly': z(l(this.#o)),
		'data-state': l(this.#i) ? 'checked' : 'unchecked',
		'aria-checked': ge(l(this.#i), !1),
		[Y.item]: '',
		type: 'button',
		role: 'radio',
		tabindex: l(this.#r),
		onkeydown: this.onkeydown,
		onfocus: this.onfocus,
		onclick: this.onclick,
		...this.attachment
	}));
	get props() {
		return l(this.#n);
	}
	set props(e) {
		C(this.#n, e);
	}
}
class re {
	static create() {
		return new re(Z.get());
	}
	root;
	#t = k(() => this.root.opts.name.current !== void 0);
	get shouldRender() {
		return l(this.#t);
	}
	set shouldRender(e) {
		C(this.#t, e);
	}
	constructor(e) {
		((this.root = e), (this.onfocus = this.onfocus.bind(this)));
	}
	onfocus(e) {
		this.root.rovingFocusGroup.focusCurrentTabStop();
	}
	#e = k(() => ({
		name: this.root.opts.name.current,
		value: this.root.opts.value.current,
		required: this.root.opts.required.current,
		disabled: this.root.opts.disabled.current,
		onfocus: this.onfocus
	}));
	get props() {
		return l(this.#e);
	}
	set props(e) {
		C(this.#e, e);
	}
}
function xe(H, e) {
	J(e, !1);
	const I = re.create();
	ae();
	var S = U(),
		O = E(S);
	{
		var D = (j) => {
			ke(
				j,
				M(() => I.props)
			);
		};
		G(O, (j) => {
			I.shouldRender && j(D);
		});
	}
	(r(H, S), Q());
}
var Ge = d('<div><!></div>'),
	Ie = d('<!> <!>', 1);
function Pe(H, e) {
	const I = se();
	J(e, !0);
	let S = w(e, 'disabled', 3, !1),
		O = w(e, 'value', 15, ''),
		D = w(e, 'ref', 15, null),
		j = w(e, 'orientation', 3, 'vertical'),
		P = w(e, 'loop', 3, !0),
		f = w(e, 'name', 3, void 0),
		L = w(e, 'required', 3, !1),
		B = w(e, 'readonly', 3, !1),
		$ = w(e, 'id', 19, () => le(I)),
		x = w(e, 'onValueChange', 3, $e),
		m = ne(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'disabled',
			'children',
			'child',
			'value',
			'ref',
			'orientation',
			'loop',
			'name',
			'required',
			'readonly',
			'id',
			'onValueChange'
		]);
	const g = ee.create({
			orientation: R(() => j()),
			disabled: R(() => S()),
			loop: R(() => P()),
			name: R(() => f()),
			required: R(() => L()),
			readonly: R(() => B()),
			id: R(() => $()),
			value: R(
				() => O(),
				(i) => {
					i !== O() && (O(i), x()?.(i));
				}
			),
			ref: R(
				() => D(),
				(i) => D(i)
			)
		}),
		y = k(() => ue(m, g.props));
	var u = Ie(),
		v = E(u);
	{
		var s = (i) => {
				var c = U(),
					p = E(c);
				(W(
					p,
					() => e.child,
					() => ({ props: l(y) })
				),
					r(i, c));
			},
			n = (i) => {
				var c = Ge();
				de(c, () => ({ ...l(y) }));
				var p = h(c);
				(W(p, () => e.children ?? K), r(i, c));
			};
		G(v, (i) => {
			e.child ? i(s) : i(n, !1);
		});
	}
	var o = b(v, 2);
	(xe(o, {}), r(H, u), Q());
}
var Ce = d('<button><!></button>');
function Oe(H, e) {
	const I = se();
	J(e, !0);
	let S = w(e, 'id', 19, () => le(I)),
		O = w(e, 'disabled', 3, !1),
		D = w(e, 'ref', 15, null),
		j = ne(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'id',
			'children',
			'child',
			'value',
			'disabled',
			'ref'
		]);
	const P = te.create({
			value: R(() => e.value),
			disabled: R(() => O() ?? !1),
			id: R(() => S()),
			ref: R(
				() => D(),
				(m) => D(m)
			)
		}),
		f = k(() => ue(j, P.props));
	var L = U(),
		B = E(L);
	{
		var $ = (m) => {
				var g = U(),
					y = E(g);
				{
					let u = k(() => ({ props: l(f), ...P.snippetProps }));
					W(
						y,
						() => e.child,
						() => l(u)
					);
				}
				r(m, g);
			},
			x = (m) => {
				var g = Ce();
				de(g, () => ({ ...l(f) }));
				var y = h(g);
				(W(
					y,
					() => e.children ?? K,
					() => P.snippetProps
				),
					r(m, g));
			};
		G(B, (m) => {
			e.child ? m($) : m(x, !1);
		});
	}
	(r(H, L), Q());
}
const N = Pe,
	A = Oe,
	je = {
		component: N,
		title: 'Design System/Atoms/RadioGroup',
		tags: ['autodocs'],
		argTypes: { value: { control: { type: 'text' } }, disabled: { control: { type: 'boolean' } } }
	},
	{ Story: X } = me();
var Le = d('<div class="h-2 w-2 rounded-full bg-accent-primary"></div>'),
	Se = d('<div class="flex items-center gap-2"><div><!></div> <!></div>'),
	De = d('<div class="h-2 w-2 rounded-full bg-accent-primary"></div>'),
	Ve = d('<div class="flex items-center gap-2"><div><!></div> <!></div>'),
	Fe = d('<div class="h-2 w-2 rounded-full bg-accent-primary"></div>'),
	qe = d('<div class="flex items-center gap-2"><div><!></div> <!></div>'),
	Te = d('<!> <!> <!>', 1),
	Ae = d('<div class="h-2 w-2 rounded-full bg-accent-primary"></div>'),
	Ee = d('<div class="flex items-center gap-2"><div><!></div> <!></div>'),
	He = d('<div class="h-2 w-2 rounded-full bg-accent-primary"></div>'),
	Be = d('<div class="flex items-center gap-2"><div><!></div> <!></div>'),
	Ke = d('<div class="h-2 w-2 rounded-full bg-accent-primary"></div>'),
	Me = d('<div class="flex items-center gap-2"><div><!></div> <!></div>'),
	Ne = d('<!> <!> <!>', 1),
	Ue = d('<div class="h-2 w-2 rounded-full bg-accent-primary"></div>'),
	We = d('<div class="flex items-center gap-2"><div><!></div> <!></div>'),
	ze = d('<div class="h-2 w-2 rounded-full bg-accent-primary"></div>'),
	Je = d('<div class="flex items-center gap-2"><div><!></div> <!></div>'),
	Qe = d('<div class="h-2 w-2 rounded-full bg-accent-primary"></div>'),
	Xe = d('<div class="flex items-center gap-2"><div><!></div> <!></div>'),
	Ye = d('<!> <!> <!>', 1),
	Ze = d('<!> <!> <!>', 1);
function pe(H, e) {
	(J(e, !1), ae());
	var I = Ze(),
		S = E(I);
	X(S, {
		name: 'Default',
		args: { value: 'option1' },
		template: (P, f = K) => {
			N(
				P,
				M(f, {
					children: (L, B) => {
						var $ = Te(),
							x = E($);
						A(x, {
							value: 'option1',
							children: (u, v) => {
								let s = () => v?.().checked;
								var n = Se(),
									o = h(n),
									i = h(o);
								{
									var c = (t) => {
										var a = Le();
										r(t, a);
									};
									G(i, (t) => {
										s() && t(c);
									});
								}
								var p = b(o, 2);
								(q(p, {
									children: (t, a) => {
										var _ = V('Option 1');
										r(t, _);
									},
									$$slots: { default: !0 }
								}),
									F(() =>
										T(
											o,
											1,
											`flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors ${s() ? 'border-accent-primary' : ''} ${f().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
										)
									),
									r(u, n));
							},
							$$slots: { default: !0 }
						});
						var m = b(x, 2);
						A(m, {
							value: 'option2',
							children: (u, v) => {
								let s = () => v?.().checked;
								var n = Ve(),
									o = h(n),
									i = h(o);
								{
									var c = (t) => {
										var a = De();
										r(t, a);
									};
									G(i, (t) => {
										s() && t(c);
									});
								}
								var p = b(o, 2);
								(q(p, {
									children: (t, a) => {
										var _ = V('Option 2');
										r(t, _);
									},
									$$slots: { default: !0 }
								}),
									F(() =>
										T(
											o,
											1,
											`flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors ${s() ? 'border-accent-primary' : ''} ${f().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
										)
									),
									r(u, n));
							},
							$$slots: { default: !0 }
						});
						var g = b(m, 2);
						(A(g, {
							value: 'option3',
							children: (u, v) => {
								let s = () => v?.().checked;
								var n = qe(),
									o = h(n),
									i = h(o);
								{
									var c = (t) => {
										var a = Fe();
										r(t, a);
									};
									G(i, (t) => {
										s() && t(c);
									});
								}
								var p = b(o, 2);
								(q(p, {
									children: (t, a) => {
										var _ = V('Option 3');
										r(t, _);
									},
									$$slots: { default: !0 }
								}),
									F(() =>
										T(
											o,
											1,
											`flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors ${s() ? 'border-accent-primary' : ''} ${f().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
										)
									),
									r(u, n));
							},
							$$slots: { default: !0 }
						}),
							r(L, $));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<RadioGroup.Root {...args}>
	<RadioGroup.Item value="option1">
		{#snippet children({ checked })}
			<div class="flex items-center gap-2">
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
						? 'border-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
					{/if}
				</div>
				<Label.Root>Option 1</Label.Root>
			</div>
		{/snippet}
	</RadioGroup.Item>
	<RadioGroup.Item value="option2">
		{#snippet children({ checked })}
			<div class="flex items-center gap-2">
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
						? 'border-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
					{/if}
				</div>
				<Label.Root>Option 2</Label.Root>
			</div>
		{/snippet}
	</RadioGroup.Item>
	<RadioGroup.Item value="option3">
		{#snippet children({ checked })}
			<div class="flex items-center gap-2">
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
						? 'border-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
					{/if}
				</div>
				<Label.Root>Option 3</Label.Root>
			</div>
		{/snippet}
	</RadioGroup.Item>
</RadioGroup.Root>`
			}
		}
	});
	var O = b(S, 2);
	X(O, {
		name: 'Selected',
		args: { value: 'option2' },
		template: (P, f = K) => {
			N(
				P,
				M(f, {
					children: (L, B) => {
						var $ = Ne(),
							x = E($);
						A(x, {
							value: 'option1',
							children: (u, v) => {
								let s = () => v?.().checked;
								var n = Ee(),
									o = h(n),
									i = h(o);
								{
									var c = (t) => {
										var a = Ae();
										r(t, a);
									};
									G(i, (t) => {
										s() && t(c);
									});
								}
								var p = b(o, 2);
								(q(p, {
									children: (t, a) => {
										var _ = V('Option 1');
										r(t, _);
									},
									$$slots: { default: !0 }
								}),
									F(() =>
										T(
											o,
											1,
											`flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors ${s() ? 'border-accent-primary' : ''} ${f().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
										)
									),
									r(u, n));
							},
							$$slots: { default: !0 }
						});
						var m = b(x, 2);
						A(m, {
							value: 'option2',
							children: (u, v) => {
								let s = () => v?.().checked;
								var n = Be(),
									o = h(n),
									i = h(o);
								{
									var c = (t) => {
										var a = He();
										r(t, a);
									};
									G(i, (t) => {
										s() && t(c);
									});
								}
								var p = b(o, 2);
								(q(p, {
									children: (t, a) => {
										var _ = V('Option 2');
										r(t, _);
									},
									$$slots: { default: !0 }
								}),
									F(() =>
										T(
											o,
											1,
											`flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors ${s() ? 'border-accent-primary' : ''} ${f().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
										)
									),
									r(u, n));
							},
							$$slots: { default: !0 }
						});
						var g = b(m, 2);
						(A(g, {
							value: 'option3',
							children: (u, v) => {
								let s = () => v?.().checked;
								var n = Me(),
									o = h(n),
									i = h(o);
								{
									var c = (t) => {
										var a = Ke();
										r(t, a);
									};
									G(i, (t) => {
										s() && t(c);
									});
								}
								var p = b(o, 2);
								(q(p, {
									children: (t, a) => {
										var _ = V('Option 3');
										r(t, _);
									},
									$$slots: { default: !0 }
								}),
									F(() =>
										T(
											o,
											1,
											`flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors ${s() ? 'border-accent-primary' : ''} ${f().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
										)
									),
									r(u, n));
							},
							$$slots: { default: !0 }
						}),
							r(L, $));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<RadioGroup.Root {...args}>
	<RadioGroup.Item value="option1">
		{#snippet children({ checked })}
			<div class="flex items-center gap-2">
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
						? 'border-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
					{/if}
				</div>
				<Label.Root>Option 1</Label.Root>
			</div>
		{/snippet}
	</RadioGroup.Item>
	<RadioGroup.Item value="option2">
		{#snippet children({ checked })}
			<div class="flex items-center gap-2">
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
						? 'border-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
					{/if}
				</div>
				<Label.Root>Option 2</Label.Root>
			</div>
		{/snippet}
	</RadioGroup.Item>
	<RadioGroup.Item value="option3">
		{#snippet children({ checked })}
			<div class="flex items-center gap-2">
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
						? 'border-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
					{/if}
				</div>
				<Label.Root>Option 3</Label.Root>
			</div>
		{/snippet}
	</RadioGroup.Item>
</RadioGroup.Root>`
			}
		}
	});
	var D = b(O, 2);
	(X(D, {
		name: 'Disabled',
		args: { value: 'option1', disabled: !0 },
		template: (P, f = K) => {
			N(
				P,
				M(f, {
					children: (L, B) => {
						var $ = Ye(),
							x = E($);
						A(x, {
							value: 'option1',
							children: (u, v) => {
								let s = () => v?.().checked;
								var n = We(),
									o = h(n),
									i = h(o);
								{
									var c = (t) => {
										var a = Ue();
										r(t, a);
									};
									G(i, (t) => {
										s() && t(c);
									});
								}
								var p = b(o, 2);
								(q(p, {
									children: (t, a) => {
										var _ = V('Option 1');
										r(t, _);
									},
									$$slots: { default: !0 }
								}),
									F(() =>
										T(
											o,
											1,
											`flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors ${s() ? 'border-accent-primary' : ''} ${f().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
										)
									),
									r(u, n));
							},
							$$slots: { default: !0 }
						});
						var m = b(x, 2);
						A(m, {
							value: 'option2',
							children: (u, v) => {
								let s = () => v?.().checked;
								var n = Je(),
									o = h(n),
									i = h(o);
								{
									var c = (t) => {
										var a = ze();
										r(t, a);
									};
									G(i, (t) => {
										s() && t(c);
									});
								}
								var p = b(o, 2);
								(q(p, {
									children: (t, a) => {
										var _ = V('Option 2');
										r(t, _);
									},
									$$slots: { default: !0 }
								}),
									F(() =>
										T(
											o,
											1,
											`flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors ${s() ? 'border-accent-primary' : ''} ${f().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
										)
									),
									r(u, n));
							},
							$$slots: { default: !0 }
						});
						var g = b(m, 2);
						(A(g, {
							value: 'option3',
							children: (u, v) => {
								let s = () => v?.().checked;
								var n = Xe(),
									o = h(n),
									i = h(o);
								{
									var c = (t) => {
										var a = Qe();
										r(t, a);
									};
									G(i, (t) => {
										s() && t(c);
									});
								}
								var p = b(o, 2);
								(q(p, {
									children: (t, a) => {
										var _ = V('Option 3');
										r(t, _);
									},
									$$slots: { default: !0 }
								}),
									F(() =>
										T(
											o,
											1,
											`flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors ${s() ? 'border-accent-primary' : ''} ${f().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
										)
									),
									r(u, n));
							},
							$$slots: { default: !0 }
						}),
							r(L, $));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<RadioGroup.Root {...args}>
	<RadioGroup.Item value="option1">
		{#snippet children({ checked })}
			<div class="flex items-center gap-2">
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
						? 'border-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
					{/if}
				</div>
				<Label.Root>Option 1</Label.Root>
			</div>
		{/snippet}
	</RadioGroup.Item>
	<RadioGroup.Item value="option2">
		{#snippet children({ checked })}
			<div class="flex items-center gap-2">
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
						? 'border-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
					{/if}
				</div>
				<Label.Root>Option 2</Label.Root>
			</div>
		{/snippet}
	</RadioGroup.Item>
	<RadioGroup.Item value="option3">
		{#snippet children({ checked })}
			<div class="flex items-center gap-2">
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
						? 'border-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
					{/if}
				</div>
				<Label.Root>Option 3</Label.Root>
			</div>
		{/snippet}
	</RadioGroup.Item>
</RadioGroup.Root>`
			}
		}
	}),
		r(H, I),
		Q());
}
pe.__docgen = { data: [], name: 'RadioGroup.stories.svelte' };
const oe = fe(pe, je),
	bt = ['Default', 'Selected', 'Disabled'],
	_t = { ...oe.Default, tags: ['svelte-csf-v5'] },
	yt = { ...oe.Selected, tags: ['svelte-csf-v5'] },
	gt = { ...oe.Disabled, tags: ['svelte-csf-v5'] };
export { _t as Default, gt as Disabled, yt as Selected, bt as __namedExportsOrder, je as default };
