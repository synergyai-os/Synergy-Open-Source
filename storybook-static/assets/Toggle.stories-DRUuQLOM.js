import {
	w as T,
	v as m,
	a8 as j,
	ae as U,
	p as W,
	h as d,
	F as S,
	a as D,
	m as F,
	b as a,
	c as L,
	k as I,
	f as A,
	n as u,
	e as q,
	o as G,
	s as k,
	d as y,
	t as C,
	g as H
} from './iframe-DYn7RqBV.js';
import { c as J, i as K } from './create-runtime-stories-2rm03jka.js';
import { d as N } from './index-QxUtaCdU.js';
import { a as Q } from './attributes-D2XuSyo_.js';
import {
	a as V,
	c as X,
	f as Y,
	g as Z,
	h as ee,
	b as x,
	d as te,
	m as se
} from './create-id-CD7dpc57.js';
import { n as oe } from './noop-DX6rZLP_.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
const re = X({ component: 'toggle', parts: ['root'] });
class R {
	static create(e) {
		return new R(e);
	}
	opts;
	attachment;
	constructor(e) {
		((this.opts = e),
			(this.attachment = V(this.opts.ref)),
			(this.onclick = this.onclick.bind(this)));
	}
	onclick(e) {
		this.opts.disabled.current || (this.opts.pressed.current = !this.opts.pressed.current);
	}
	#e = T(() => ({ pressed: this.opts.pressed.current }));
	get snippetProps() {
		return m(this.#e);
	}
	set snippetProps(e) {
		j(this.#e, e);
	}
	#t = T(() => ({
		[re.root]: '',
		id: this.opts.id.current,
		'data-disabled': ee(this.opts.disabled.current),
		'aria-pressed': Z(this.opts.pressed.current),
		'data-state': ne(this.opts.pressed.current),
		disabled: Y(this.opts.disabled.current),
		onclick: this.onclick,
		...this.attachment
	}));
	get props() {
		return m(this.#t);
	}
	set props(e) {
		j(this.#t, e);
	}
}
function ne(c) {
	return c ? 'on' : 'off';
}
var ae = A('<button><!></button>');
function ie(c, e) {
	const v = U();
	W(e, !0);
	let p = d(e, 'ref', 15, null),
		h = d(e, 'id', 19, () => te(v)),
		b = d(e, 'pressed', 15, !1),
		P = d(e, 'onPressedChange', 3, oe),
		g = d(e, 'disabled', 3, !1),
		r = d(e, 'type', 3, 'button'),
		n = G(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'ref',
			'id',
			'pressed',
			'onPressedChange',
			'disabled',
			'type',
			'children',
			'child'
		]);
	const t = R.create({
			pressed: x(
				() => b(),
				(s) => {
					(b(s), P()(s));
				}
			),
			disabled: x(() => g() ?? !1),
			id: x(() => h()),
			ref: x(
				() => p(),
				(s) => p(s)
			)
		}),
		i = T(() => se(n, t.props, { type: r() }));
	var o = S(),
		M = D(o);
	{
		var O = (s) => {
				var l = S(),
					$ = D(l);
				{
					let E = T(() => ({ props: m(i), ...t.snippetProps }));
					I(
						$,
						() => e.child,
						() => m(E)
					);
				}
				a(s, l);
			},
			z = (s) => {
				var l = ae();
				Q(l, () => ({ ...m(i) }));
				var $ = q(l);
				(I(
					$,
					() => e.children ?? u,
					() => t.snippetProps
				),
					a(s, l));
			};
		F(M, (s) => {
			e.child ? s(O) : s(z, !1);
		});
	}
	(a(c, o), L());
}
const f = ie,
	le = {
		component: f,
		title: 'Design System/Atoms/Toggle',
		tags: ['autodocs'],
		argTypes: {
			pressed: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	},
	{ Story: _ } = N();
var de = H(
		'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>'
	),
	ce = A('<!> <!> <!> <!>', 1);
function B(c, e) {
	(W(e, !1), K());
	var v = ce(),
		p = D(v);
	_(p, {
		name: 'Default',
		args: { pressed: !1 },
		template: (r, n = u) => {
			f(
				r,
				y(n, {
					class:
						'focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-button border border-base bg-elevated px-section text-button font-medium text-primary transition-colors hover:bg-hover-solid focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-primary data-[state=on]:text-primary',
					children: (t, i) => {
						var o = C('Toggle');
						a(t, o);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Toggle.Root
	{...args}
	class="focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-button border border-base bg-elevated px-section text-button font-medium text-primary transition-colors hover:bg-hover-solid focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-primary data-[state=on]:text-primary"
>
	Toggle
</Toggle.Root>`
			}
		}
	});
	var h = k(p, 2);
	_(h, {
		name: 'Pressed',
		args: { pressed: !0 },
		template: (r, n = u) => {
			f(
				r,
				y(n, {
					class:
						'focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-button border border-base bg-elevated px-section text-button font-medium text-primary transition-colors hover:bg-hover-solid focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-primary data-[state=on]:text-primary',
					children: (t, i) => {
						var o = C('Toggle');
						a(t, o);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Toggle.Root
	{...args}
	class="focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-button border border-base bg-elevated px-section text-button font-medium text-primary transition-colors hover:bg-hover-solid focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-primary data-[state=on]:text-primary"
>
	Toggle
</Toggle.Root>`
			}
		}
	});
	var b = k(h, 2);
	_(b, {
		name: 'With Icon',
		args: { pressed: !1 },
		template: (r, n = u) => {
			f(
				r,
				y(n, {
					class:
						'focus-visible:ring-ring inline-flex h-10 w-10 items-center justify-center rounded-button border border-base bg-elevated text-primary transition-colors hover:bg-hover-solid focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-primary data-[state=on]:text-primary',
					children: (t, i) => {
						var o = de();
						a(t, o);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Toggle.Root
	{...args}
	class="focus-visible:ring-ring inline-flex h-10 w-10 items-center justify-center rounded-button border border-base bg-elevated text-primary transition-colors hover:bg-hover-solid focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-primary data-[state=on]:text-primary"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		class="h-5 w-5"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
		/>
	</svg>
</Toggle.Root>`
			}
		}
	});
	var P = k(b, 2);
	(_(P, {
		name: 'Disabled',
		args: { pressed: !1, disabled: !0 },
		template: (r, n = u) => {
			f(
				r,
				y(n, {
					class:
						'focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-button border border-base bg-elevated px-section text-button font-medium text-primary transition-colors hover:bg-hover-solid focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-primary data-[state=on]:text-primary',
					children: (t, i) => {
						var o = C('Toggle');
						a(t, o);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Toggle.Root
	{...args}
	class="focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-button border border-base bg-elevated px-section text-button font-medium text-primary transition-colors hover:bg-hover-solid focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-primary data-[state=on]:text-primary"
>
	Toggle
</Toggle.Root>`
			}
		}
	}),
		a(c, v),
		L());
}
B.__docgen = { data: [], name: 'Toggle.stories.svelte' };
const w = J(B, le),
	xe = ['Default', 'Pressed', 'WithIcon', 'Disabled'],
	_e = { ...w.Default, tags: ['svelte-csf-v5'] },
	Te = { ...w.Pressed, tags: ['svelte-csf-v5'] },
	we = { ...w.WithIcon, tags: ['svelte-csf-v5'] },
	Pe = { ...w.Disabled, tags: ['svelte-csf-v5'] };
export {
	_e as Default,
	Pe as Disabled,
	Te as Pressed,
	we as WithIcon,
	xe as __namedExportsOrder,
	le as default
};
