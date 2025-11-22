import {
	X as ie,
	aq as ae,
	aI as ce,
	w as x,
	v as w,
	a8 as q,
	p as V,
	F as ee,
	a as H,
	m as L,
	b as s,
	c as X,
	d as P,
	ae as de,
	h as $,
	f as C,
	s as S,
	k as Q,
	n as A,
	e as j,
	o as le,
	t as J,
	i as E,
	g as M
} from './iframe-DYn7RqBV.js';
import { i as te, c as ue } from './create-runtime-stories-2rm03jka.js';
import { d as pe } from './index-QxUtaCdU.js';
import { a as he } from './attributes-D2XuSyo_.js';
import { w as U } from './watch.svelte-CYSsdG2H.js';
import { C as re } from './context-DWcBTeuX.js';
import {
	a as fe,
	c as me,
	h as Y,
	g as Z,
	p as ve,
	b as D,
	d as be,
	m as ke
} from './create-id-CD7dpc57.js';
import { i as ge } from './is-DtD5rb4o.js';
import { d as we, S as ye } from './kbd-constants-Duhtze-4.js';
import { H as _e } from './hidden-input-1T3DLxGL.js';
import { R as F } from './Label-BXv2dhHR.js';
import { s as T } from './class-BLXIZATI.js';
import './preload-helper-PPVm8Dsz.js';
import './style-MviLiK55.js';
import './input-XwGP8Xvd.js';
const xe = [];
function Ce(t, e = !1, l = !1) {
	return I(t, new Map(), '', xe, null, l);
}
function I(t, e, l, n, p = null, R = !1) {
	if (typeof t == 'object' && t !== null) {
		var y = e.get(t);
		if (y !== void 0) return y;
		if (t instanceof Map) return new Map(t);
		if (t instanceof Set) return new Set(t);
		if (ie(t)) {
			var v = Array(t.length);
			(e.set(t, v), p !== null && e.set(p, v));
			for (var u = 0; u < t.length; u += 1) {
				var b = t[u];
				u in t && (v[u] = I(b, e, l, n, null, R));
			}
			return v;
		}
		if (ae(t) === ce) {
			((v = {}), e.set(t, v), p !== null && e.set(p, v));
			for (var i in t) v[i] = I(t[i], e, l, n, null, R);
			return v;
		}
		if (t instanceof Date) return structuredClone(t);
		if (typeof t.toJSON == 'function' && !R) return I(t.toJSON(), e, l, n, t);
	}
	if (t instanceof EventTarget) return t;
	try {
		return structuredClone(t);
	} catch {
		return t;
	}
}
const Re = me({ component: 'checkbox', parts: ['root', 'group', 'group-label', 'input'] }),
	De = new re('Checkbox.Group'),
	ne = new re('Checkbox.Root');
class z {
	static create(e, l = null) {
		return ne.set(new z(e, l));
	}
	opts;
	group;
	#e = x(() =>
		this.group && this.group.opts.name.current
			? this.group.opts.name.current
			: this.opts.name.current
	);
	get trueName() {
		return w(this.#e);
	}
	set trueName(e) {
		q(this.#e, e);
	}
	#t = x(() => (this.group && this.group.opts.required.current ? !0 : this.opts.required.current));
	get trueRequired() {
		return w(this.#t);
	}
	set trueRequired(e) {
		q(this.#t, e);
	}
	#r = x(() => (this.group && this.group.opts.disabled.current ? !0 : this.opts.disabled.current));
	get trueDisabled() {
		return w(this.#r);
	}
	set trueDisabled(e) {
		q(this.#r, e);
	}
	#o = x(() => (this.group && this.group.opts.readonly.current ? !0 : this.opts.readonly.current));
	get trueReadonly() {
		return w(this.#o);
	}
	set trueReadonly(e) {
		q(this.#o, e);
	}
	attachment;
	constructor(e, l) {
		((this.opts = e),
			(this.group = l),
			(this.attachment = fe(this.opts.ref)),
			(this.onkeydown = this.onkeydown.bind(this)),
			(this.onclick = this.onclick.bind(this)),
			U.pre([() => Ce(this.group?.opts.value.current), () => this.opts.value.current], ([n, p]) => {
				!n || !p || (this.opts.checked.current = n.includes(p));
			}),
			U.pre(
				() => this.opts.checked.current,
				(n) => {
					this.group &&
						(n
							? this.group?.addValue(this.opts.value.current)
							: this.group?.removeValue(this.opts.value.current));
				}
			));
	}
	onkeydown(e) {
		this.trueDisabled ||
			this.trueReadonly ||
			(e.key === we && e.preventDefault(), e.key === ye && (e.preventDefault(), this.#n()));
	}
	#n() {
		this.opts.indeterminate.current
			? ((this.opts.indeterminate.current = !1), (this.opts.checked.current = !0))
			: (this.opts.checked.current = !this.opts.checked.current);
	}
	onclick(e) {
		if (!(this.trueDisabled || this.trueReadonly)) {
			if (this.opts.type.current === 'submit') {
				this.#n();
				return;
			}
			(e.preventDefault(), this.#n());
		}
	}
	#s = x(() => ({
		checked: this.opts.checked.current,
		indeterminate: this.opts.indeterminate.current
	}));
	get snippetProps() {
		return w(this.#s);
	}
	set snippetProps(e) {
		q(this.#s, e);
	}
	#i = x(() => ({
		id: this.opts.id.current,
		role: 'checkbox',
		type: this.opts.type.current,
		disabled: this.trueDisabled,
		'aria-checked': ve(this.opts.checked.current, this.opts.indeterminate.current),
		'aria-required': Z(this.trueRequired),
		'aria-readonly': Z(this.trueReadonly),
		'data-disabled': Y(this.trueDisabled),
		'data-readonly': Y(this.trueReadonly),
		'data-state': $e(this.opts.checked.current, this.opts.indeterminate.current),
		[Re.root]: '',
		onclick: this.onclick,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return w(this.#i);
	}
	set props(e) {
		q(this.#i, e);
	}
}
class K {
	static create() {
		return new K(ne.get());
	}
	root;
	#e = x(() =>
		this.root.group
			? !!(
					this.root.opts.value.current !== void 0 &&
					this.root.group.opts.value.current.includes(this.root.opts.value.current)
				)
			: this.root.opts.checked.current
	);
	get trueChecked() {
		return w(this.#e);
	}
	set trueChecked(e) {
		q(this.#e, e);
	}
	#t = x(() => !!this.root.trueName);
	get shouldRender() {
		return w(this.#t);
	}
	set shouldRender(e) {
		q(this.#t, e);
	}
	constructor(e) {
		((this.root = e), (this.onfocus = this.onfocus.bind(this)));
	}
	onfocus(e) {
		ge(this.root.opts.ref.current) && this.root.opts.ref.current.focus();
	}
	#r = x(() => ({
		type: 'checkbox',
		checked: this.root.opts.checked.current === !0,
		disabled: this.root.trueDisabled,
		required: this.root.trueRequired,
		name: this.root.trueName,
		value: this.root.opts.value.current,
		readonly: this.root.trueReadonly,
		onfocus: this.onfocus
	}));
	get props() {
		return w(this.#r);
	}
	set props(e) {
		q(this.#r, e);
	}
}
function $e(t, e) {
	return e ? 'indeterminate' : t ? 'checked' : 'unchecked';
}
function je(t, e) {
	V(e, !1);
	const l = K.create();
	te();
	var n = ee(),
		p = H(n);
	{
		var R = (y) => {
			_e(
				y,
				P(() => l.props)
			);
		};
		L(p, (y) => {
			l.shouldRender && y(R);
		});
	}
	(s(t, n), X());
}
var qe = C('<button><!></button>'),
	Se = C('<!> <!>', 1);
function Be(t, e) {
	const l = de();
	V(e, !0);
	let n = $(e, 'checked', 15, !1),
		p = $(e, 'ref', 15, null),
		R = $(e, 'disabled', 3, !1),
		y = $(e, 'required', 3, !1),
		v = $(e, 'name', 3, void 0),
		u = $(e, 'value', 3, 'on'),
		b = $(e, 'id', 19, () => be(l)),
		i = $(e, 'indeterminate', 15, !1),
		k = $(e, 'type', 3, 'button'),
		m = le(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'checked',
			'ref',
			'onCheckedChange',
			'children',
			'disabled',
			'required',
			'name',
			'value',
			'id',
			'indeterminate',
			'onIndeterminateChange',
			'child',
			'type',
			'readonly'
		]);
	const h = De.getOr(null);
	(h && u() && (h.opts.value.current.includes(u()) ? n(!0) : n(!1)),
		U.pre(
			() => u(),
			() => {
				h && u() && (h.opts.value.current.includes(u()) ? n(!0) : n(!1));
			}
		));
	const c = z.create(
			{
				checked: D(
					() => n(),
					(r) => {
						(n(r), e.onCheckedChange?.(r));
					}
				),
				disabled: D(() => R() ?? !1),
				required: D(() => y()),
				name: D(() => v()),
				value: D(() => u()),
				id: D(() => b()),
				ref: D(
					() => p(),
					(r) => p(r)
				),
				indeterminate: D(
					() => i(),
					(r) => {
						(i(r), e.onIndeterminateChange?.(r));
					}
				),
				type: D(() => k()),
				readonly: D(() => !!e.readonly)
			},
			h
		),
		a = x(() => ke({ ...m }, c.props));
	var d = Se(),
		f = H(d);
	{
		var o = (r) => {
				var g = ee(),
					G = H(g);
				{
					let se = x(() => ({ props: w(a), ...c.snippetProps }));
					Q(
						G,
						() => e.child,
						() => w(se)
					);
				}
				s(r, g);
			},
			_ = (r) => {
				var g = qe();
				he(g, () => ({ ...w(a) }));
				var G = j(g);
				(Q(
					G,
					() => e.children ?? A,
					() => c.snippetProps
				),
					s(r, g));
			};
		L(f, (r) => {
			e.child ? r(o) : r(_, !1);
		});
	}
	var B = S(f, 2);
	(je(B, {}), s(t, d), X());
}
const N = Be,
	Le = {
		component: N,
		title: 'Design System/Atoms/Checkbox',
		tags: ['autodocs'],
		argTypes: {
			checked: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	},
	{ Story: W } = pe();
var Pe = M(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>'
	),
	Ae = C('<div><!></div>'),
	Ne = M(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>'
	),
	Ee = C('<div><!></div>'),
	Te = M(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>'
	),
	We = C('<div><!></div>'),
	Me = C('<div class="flex items-center gap-2"><!> <!></div>'),
	Oe = M(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>'
	),
	Ie = C('<div><!></div>'),
	He = C('<div class="flex items-center gap-2"><!> <!></div>'),
	Ge = M(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>'
	),
	Je = C('<div><!></div>'),
	Fe = C('<div class="flex items-center gap-2"><!> <!></div>'),
	Ue = C('<!> <!> <!> <!> <!>', 1);
function oe(t, e) {
	(V(e, !1), te());
	var l = Ue(),
		n = H(l);
	W(n, {
		name: 'Default',
		args: { checked: !1 },
		template: (b, i = A) => {
			N(
				b,
				P(i, {
					children: (m, h) => {
						let c = () => h?.().checked;
						var a = Ae(),
							d = j(a);
						{
							var f = (o) => {
								var _ = Pe();
								s(o, _);
							};
							L(d, (o) => {
								c() && o(f);
							});
						}
						(E(() =>
							T(
								a,
								1,
								`flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors ${c() ? 'border-accent-primary bg-accent-primary' : ''} ${i().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
							)
						),
							s(m, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Checkbox.Root {...args}>
	{#snippet children({ checked, indeterminate })}
		<div
			class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
				? 'border-accent-primary bg-accent-primary'
				: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
		>
			{#if checked}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-3 w-3 text-primary"
				>
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			{/if}
		</div>
	{/snippet}
</Checkbox.Root>`
			}
		}
	});
	var p = S(n, 2);
	W(p, {
		name: 'Checked',
		args: { checked: !0 },
		template: (b, i = A) => {
			N(
				b,
				P(i, {
					children: (m, h) => {
						let c = () => h?.().checked;
						var a = Ee(),
							d = j(a);
						{
							var f = (o) => {
								var _ = Ne();
								s(o, _);
							};
							L(d, (o) => {
								c() && o(f);
							});
						}
						(E(() =>
							T(
								a,
								1,
								`flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors ${c() ? 'border-accent-primary bg-accent-primary' : ''} ${i().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
							)
						),
							s(m, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Checkbox.Root {...args}>
	{#snippet children({ checked, indeterminate })}
		<div
			class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
				? 'border-accent-primary bg-accent-primary'
				: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
		>
			{#if checked}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-3 w-3 text-primary"
				>
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			{/if}
		</div>
	{/snippet}
</Checkbox.Root>`
			}
		}
	});
	var R = S(p, 2);
	W(R, {
		name: 'With Label',
		args: { checked: !1 },
		template: (b, i = A) => {
			var k = Me(),
				m = j(k);
			N(
				m,
				P(i, {
					children: (a, d) => {
						let f = () => d?.().checked;
						var o = We(),
							_ = j(o);
						{
							var B = (r) => {
								var g = Te();
								s(r, g);
							};
							L(_, (r) => {
								f() && r(B);
							});
						}
						(E(() =>
							T(
								o,
								1,
								`flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors ${f() ? 'border-accent-primary bg-accent-primary' : ''} ${i().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
							)
						),
							s(a, o));
					},
					$$slots: { default: !0 }
				})
			);
			var h = S(m, 2);
			(F(h, {
				children: (c, a) => {
					var d = J('Accept terms and conditions');
					s(c, d);
				},
				$$slots: { default: !0 }
			}),
				s(b, k));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex items-center gap-2">
	<Checkbox.Root {...args}>
		{#snippet children({ checked, indeterminate })}
			<div
				class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
					? 'border-accent-primary bg-accent-primary'
					: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
			>
				{#if checked}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3 w-3 text-primary"
					>
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				{/if}
			</div>
		{/snippet}
	</Checkbox.Root>
	<Label.Root>Accept terms and conditions</Label.Root>
</div>`
			}
		}
	});
	var y = S(R, 2);
	W(y, {
		name: 'Disabled',
		args: { checked: !1, disabled: !0 },
		template: (b, i = A) => {
			var k = He(),
				m = j(k);
			N(
				m,
				P(i, {
					children: (a, d) => {
						let f = () => d?.().checked;
						var o = Ie(),
							_ = j(o);
						{
							var B = (r) => {
								var g = Oe();
								s(r, g);
							};
							L(_, (r) => {
								f() && r(B);
							});
						}
						(E(() =>
							T(
								o,
								1,
								`flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors ${f() ? 'border-accent-primary bg-accent-primary' : ''} ${i().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
							)
						),
							s(a, o));
					},
					$$slots: { default: !0 }
				})
			);
			var h = S(m, 2);
			(F(h, {
				children: (c, a) => {
					var d = J('Disabled checkbox');
					s(c, d);
				},
				$$slots: { default: !0 }
			}),
				s(b, k));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex items-center gap-2">
	<Checkbox.Root {...args}>
		{#snippet children({ checked, indeterminate })}
			<div
				class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
					? 'border-accent-primary bg-accent-primary'
					: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
			>
				{#if checked}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3 w-3 text-primary"
					>
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				{/if}
			</div>
		{/snippet}
	</Checkbox.Root>
	<Label.Root>Disabled checkbox</Label.Root>
</div>`
			}
		}
	});
	var v = S(y, 2);
	(W(v, {
		name: 'Disabled Checked',
		args: { checked: !0, disabled: !0 },
		template: (b, i = A) => {
			var k = Fe(),
				m = j(k);
			N(
				m,
				P(i, {
					children: (a, d) => {
						let f = () => d?.().checked;
						var o = Je(),
							_ = j(o);
						{
							var B = (r) => {
								var g = Ge();
								s(r, g);
							};
							L(_, (r) => {
								f() && r(B);
							});
						}
						(E(() =>
							T(
								o,
								1,
								`flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors ${f() ? 'border-accent-primary bg-accent-primary' : ''} ${i().disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
							)
						),
							s(a, o));
					},
					$$slots: { default: !0 }
				})
			);
			var h = S(m, 2);
			(F(h, {
				children: (c, a) => {
					var d = J('Disabled checked');
					s(c, d);
				},
				$$slots: { default: !0 }
			}),
				s(b, k));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex items-center gap-2">
	<Checkbox.Root {...args}>
		{#snippet children({ checked, indeterminate })}
			<div
				class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
					? 'border-accent-primary bg-accent-primary'
					: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
			>
				{#if checked}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3 w-3 text-primary"
					>
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				{/if}
			</div>
		{/snippet}
	</Checkbox.Root>
	<Label.Root>Disabled checked</Label.Root>
</div>`
			}
		}
	}),
		s(t, l),
		X());
}
oe.__docgen = { data: [], name: 'Checkbox.stories.svelte' };
const O = ue(oe, Le),
	ct = ['Default', 'Checked', 'WithLabel', 'Disabled', 'DisabledChecked'],
	dt = { ...O.Default, tags: ['svelte-csf-v5'] },
	lt = { ...O.Checked, tags: ['svelte-csf-v5'] },
	ut = { ...O.WithLabel, tags: ['svelte-csf-v5'] },
	pt = { ...O.Disabled, tags: ['svelte-csf-v5'] },
	ht = { ...O.DisabledChecked, tags: ['svelte-csf-v5'] };
export {
	lt as Checked,
	dt as Default,
	pt as Disabled,
	ht as DisabledChecked,
	ut as WithLabel,
	ct as __namedExportsOrder,
	Le as default
};
