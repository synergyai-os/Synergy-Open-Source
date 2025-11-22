import {
	w as m,
	v as o,
	a8 as S,
	p as M,
	F as O,
	a as T,
	m as N,
	b as i,
	c as U,
	d as R,
	ae as Q,
	h as g,
	f as C,
	s as _,
	k as H,
	n as $,
	e as W,
	o as V,
	t as F,
	M as q
} from './iframe-DYn7RqBV.js';
import { i as X, c as ce } from './create-runtime-stories-2rm03jka.js';
import { d as le } from './index-QxUtaCdU.js';
import { a as Y } from './attributes-D2XuSyo_.js';
import './watch.svelte-CYSsdG2H.js';
import { C as de } from './context-DWcBTeuX.js';
import {
	a as Z,
	c as ue,
	h as K,
	u as he,
	g as fe,
	p as pe,
	f as ge,
	b as v,
	d as ee,
	m as te
} from './create-id-CD7dpc57.js';
import { d as me, S as be } from './kbd-constants-Duhtze-4.js';
import { H as ve } from './hidden-input-1T3DLxGL.js';
import { n as ke } from './noop-DX6rZLP_.js';
import { R as I } from './Label-BXv2dhHR.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './input-XwGP8Xvd.js';
const re = ue({ component: 'switch', parts: ['root', 'thumb'] }),
	j = new de('Switch.Root');
class z {
	static create(e) {
		return j.set(new z(e));
	}
	opts;
	attachment;
	constructor(e) {
		((this.opts = e),
			(this.attachment = Z(e.ref)),
			(this.onkeydown = this.onkeydown.bind(this)),
			(this.onclick = this.onclick.bind(this)));
	}
	#e() {
		this.opts.checked.current = !this.opts.checked.current;
	}
	onkeydown(e) {
		!(e.key === me || e.key === be) ||
			this.opts.disabled.current ||
			(e.preventDefault(), this.#e());
	}
	onclick(e) {
		this.opts.disabled.current || this.#e();
	}
	#t = m(() => ({
		'data-disabled': K(this.opts.disabled.current),
		'data-state': he(this.opts.checked.current),
		'data-required': K(this.opts.required.current)
	}));
	get sharedProps() {
		return o(this.#t);
	}
	set sharedProps(e) {
		S(this.#t, e);
	}
	#r = m(() => ({ checked: this.opts.checked.current }));
	get snippetProps() {
		return o(this.#r);
	}
	set snippetProps(e) {
		S(this.#r, e);
	}
	#s = m(() => ({
		...this.sharedProps,
		id: this.opts.id.current,
		role: 'switch',
		disabled: ge(this.opts.disabled.current),
		'aria-checked': pe(this.opts.checked.current, !1),
		'aria-required': fe(this.opts.required.current),
		[re.root]: '',
		onclick: this.onclick,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return o(this.#s);
	}
	set props(e) {
		S(this.#s, e);
	}
}
class G {
	static create() {
		return new G(j.get());
	}
	root;
	#e = m(() => this.root.opts.name.current !== void 0);
	get shouldRender() {
		return o(this.#e);
	}
	set shouldRender(e) {
		S(this.#e, e);
	}
	constructor(e) {
		this.root = e;
	}
	#t = m(() => ({
		type: 'checkbox',
		name: this.root.opts.name.current,
		value: this.root.opts.value.current,
		checked: this.root.opts.checked.current,
		disabled: this.root.opts.disabled.current,
		required: this.root.opts.required.current
	}));
	get props() {
		return o(this.#t);
	}
	set props(e) {
		S(this.#t, e);
	}
}
class J {
	static create(e) {
		return new J(e, j.get());
	}
	opts;
	root;
	attachment;
	constructor(e, u) {
		((this.opts = e), (this.root = u), (this.attachment = Z(e.ref)));
	}
	#e = m(() => ({ checked: this.root.opts.checked.current }));
	get snippetProps() {
		return o(this.#e);
	}
	set snippetProps(e) {
		S(this.#e, e);
	}
	#t = m(() => ({
		...this.root.sharedProps,
		id: this.opts.id.current,
		[re.thumb]: '',
		...this.attachment
	}));
	get props() {
		return o(this.#t);
	}
	set props(e) {
		S(this.#t, e);
	}
}
function we(x, e) {
	M(e, !1);
	const u = G.create();
	X();
	var h = O(),
		k = T(h);
	{
		var w = (d) => {
			ve(
				d,
				R(() => u.props)
			);
		};
		N(k, (d) => {
			u.shouldRender && d(w);
		});
	}
	(i(x, h), U());
}
var _e = C('<button><!></button>'),
	xe = C('<!> <!>', 1);
function ye(x, e) {
	const u = Q();
	M(e, !0);
	let h = g(e, 'ref', 15, null),
		k = g(e, 'id', 19, () => ee(u)),
		w = g(e, 'disabled', 3, !1),
		d = g(e, 'required', 3, !1),
		y = g(e, 'checked', 15, !1),
		b = g(e, 'value', 3, 'on'),
		c = g(e, 'name', 3, void 0),
		r = g(e, 'type', 3, 'button'),
		a = g(e, 'onCheckedChange', 3, ke),
		t = V(e, [
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
	const s = z.create({
			checked: v(
				() => y(),
				(p) => {
					(y(p), a()?.(p));
				}
			),
			disabled: v(() => w() ?? !1),
			required: v(() => d()),
			value: v(() => b()),
			name: v(() => c()),
			id: v(() => k()),
			ref: v(
				() => h(),
				(p) => h(p)
			)
		}),
		n = m(() => te(t, s.props, { type: r() }));
	var l = xe(),
		f = T(l);
	{
		var ne = (p) => {
				var P = O(),
					B = T(P);
				{
					let ie = m(() => ({ props: o(n), ...s.snippetProps }));
					H(
						B,
						() => e.child,
						() => o(ie)
					);
				}
				i(p, P);
			},
			oe = (p) => {
				var P = _e();
				Y(P, () => ({ ...o(n) }));
				var B = W(P);
				(H(
					B,
					() => e.children ?? $,
					() => s.snippetProps
				),
					i(p, P));
			};
		N(f, (p) => {
			e.child ? p(ne) : p(oe, !1);
		});
	}
	var ae = _(f, 2);
	(we(ae, {}), i(x, l), U());
}
var $e = C('<span><!></span>');
function Se(x, e) {
	const u = Q();
	M(e, !0);
	let h = g(e, 'ref', 15, null),
		k = g(e, 'id', 19, () => ee(u)),
		w = V(e, ['$$slots', '$$events', '$$legacy', 'child', 'children', 'ref', 'id']);
	const d = J.create({
			id: v(() => k()),
			ref: v(
				() => h(),
				(t) => h(t)
			)
		}),
		y = m(() => te(w, d.props));
	var b = O(),
		c = T(b);
	{
		var r = (t) => {
				var s = O(),
					n = T(s);
				{
					let l = m(() => ({ props: o(y), ...d.snippetProps }));
					H(
						n,
						() => e.child,
						() => o(l)
					);
				}
				i(t, s);
			},
			a = (t) => {
				var s = $e();
				Y(s, () => ({ ...o(y) }));
				var n = W(s);
				(H(
					n,
					() => e.children ?? $,
					() => d.snippetProps
				),
					i(t, s));
			};
		N(c, (t) => {
			e.child ? t(r) : t(a, !1);
		});
	}
	(i(x, b), U());
}
const D = ye,
	L = Se,
	Ce = {
		component: D,
		title: 'Design System/Atoms/Switch',
		tags: ['autodocs'],
		argTypes: {
			checked: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	},
	{ Story: E } = le();
var Pe = C('<div class="flex items-center gap-2"><!> <!></div>'),
	Re = C('<div class="flex items-center gap-2"><!> <!></div>'),
	De = C('<div class="flex items-center gap-2"><!> <!></div>'),
	Te = C('<!> <!> <!> <!> <!>', 1);
function se(x, e) {
	(M(e, !1), X());
	var u = Te(),
		h = T(u);
	E(h, {
		name: 'Default',
		args: { checked: !1 },
		template: (c, r = $) => {
			{
				let a = q(() => (r().checked ? 'bg-accent-primary' : 'bg-toggle-off'));
				D(
					c,
					R(r, {
						get class() {
							return `relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none ${o(a) ?? ''}`;
						},
						children: (t, s) => {
							L(t, {
								class:
									'pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4'
							});
						},
						$$slots: { default: !0 }
					})
				);
			}
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Switch.Root
	{...args}
	class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
		? 'bg-accent-primary'
		: 'bg-toggle-off'}"
>
	<Switch.Thumb
		class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
	/>
</Switch.Root>`
			}
		}
	});
	var k = _(h, 2);
	E(k, {
		name: 'Checked',
		args: { checked: !0 },
		template: (c, r = $) => {
			{
				let a = q(() => (r().checked ? 'bg-accent-primary' : 'bg-toggle-off'));
				D(
					c,
					R(r, {
						get class() {
							return `relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none ${o(a) ?? ''}`;
						},
						children: (t, s) => {
							L(t, {
								class:
									'pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4'
							});
						},
						$$slots: { default: !0 }
					})
				);
			}
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Switch.Root
	{...args}
	class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
		? 'bg-accent-primary'
		: 'bg-toggle-off'}"
>
	<Switch.Thumb
		class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
	/>
</Switch.Root>`
			}
		}
	});
	var w = _(k, 2);
	E(w, {
		name: 'With Label',
		args: { checked: !1 },
		template: (c, r = $) => {
			var a = Pe(),
				t = W(a);
			{
				let n = q(() => (r().checked ? 'bg-accent-primary' : 'bg-toggle-off'));
				D(
					t,
					R(r, {
						get class() {
							return `relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none ${o(n) ?? ''}`;
						},
						children: (l, f) => {
							L(l, {
								class:
									'pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4'
							});
						},
						$$slots: { default: !0 }
					})
				);
			}
			var s = _(t, 2);
			(I(s, {
				children: (n, l) => {
					var f = F('Enable notifications');
					i(n, f);
				},
				$$slots: { default: !0 }
			}),
				i(c, a));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex items-center gap-2">
	<Switch.Root
		{...args}
		class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
			? 'bg-accent-primary'
			: 'bg-toggle-off'}"
	>
		<Switch.Thumb
			class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
		/>
	</Switch.Root>
	<Label.Root>Enable notifications</Label.Root>
</div>`
			}
		}
	});
	var d = _(w, 2);
	E(d, {
		name: 'Disabled',
		args: { checked: !1, disabled: !0 },
		template: (c, r = $) => {
			var a = Re(),
				t = W(a);
			{
				let n = q(() => (r().checked ? 'bg-accent-primary' : 'bg-toggle-off'));
				D(
					t,
					R(r, {
						get class() {
							return `relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent opacity-50 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none ${o(n) ?? ''}`;
						},
						children: (l, f) => {
							L(l, {
								class:
									'pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4'
							});
						},
						$$slots: { default: !0 }
					})
				);
			}
			var s = _(t, 2);
			(I(s, {
				children: (n, l) => {
					var f = F('Disabled switch');
					i(n, f);
				},
				$$slots: { default: !0 }
			}),
				i(c, a));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex items-center gap-2">
	<Switch.Root
		{...args}
		class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent opacity-50 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
			? 'bg-accent-primary'
			: 'bg-toggle-off'}"
	>
		<Switch.Thumb
			class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
		/>
	</Switch.Root>
	<Label.Root>Disabled switch</Label.Root>
</div>`
			}
		}
	});
	var y = _(d, 2);
	(E(y, {
		name: 'Disabled Checked',
		args: { checked: !0, disabled: !0 },
		template: (c, r = $) => {
			var a = De(),
				t = W(a);
			{
				let n = q(() => (r().checked ? 'bg-accent-primary' : 'bg-toggle-off'));
				D(
					t,
					R(r, {
						get class() {
							return `relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent opacity-50 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none ${o(n) ?? ''}`;
						},
						children: (l, f) => {
							L(l, {
								class:
									'pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4'
							});
						},
						$$slots: { default: !0 }
					})
				);
			}
			var s = _(t, 2);
			(I(s, {
				children: (n, l) => {
					var f = F('Disabled checked');
					i(n, f);
				},
				$$slots: { default: !0 }
			}),
				i(c, a));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex items-center gap-2">
	<Switch.Root
		{...args}
		class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent opacity-50 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
			? 'bg-accent-primary'
			: 'bg-toggle-off'}"
	>
		<Switch.Thumb
			class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
		/>
	</Switch.Root>
	<Label.Root>Disabled checked</Label.Root>
</div>`
			}
		}
	}),
		i(x, u),
		U());
}
se.__docgen = { data: [], name: 'Switch.stories.svelte' };
const A = ce(se, Ce),
	Ge = ['Default', 'Checked', 'WithLabel', 'Disabled', 'DisabledChecked'],
	Je = { ...A.Default, tags: ['svelte-csf-v5'] },
	Ke = { ...A.Checked, tags: ['svelte-csf-v5'] },
	Qe = { ...A.WithLabel, tags: ['svelte-csf-v5'] },
	Ve = { ...A.Disabled, tags: ['svelte-csf-v5'] },
	Xe = { ...A.DisabledChecked, tags: ['svelte-csf-v5'] };
export {
	Ke as Checked,
	Je as Default,
	Ve as Disabled,
	Xe as DisabledChecked,
	Qe as WithLabel,
	Ge as __namedExportsOrder,
	Ce as default
};
