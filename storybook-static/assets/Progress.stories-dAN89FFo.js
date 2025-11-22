import {
	w as B,
	v as H,
	a8 as T,
	ae as W,
	p as E,
	h as m,
	F as A,
	a as L,
	m as j,
	b as l,
	c as F,
	k,
	f as n,
	n as v,
	e as q,
	o as z,
	s as x,
	d as p,
	i as R
} from './iframe-DYn7RqBV.js';
import { c as G, i as J } from './create-runtime-stories-2rm03jka.js';
import { d as K } from './index-QxUtaCdU.js';
import { a as N } from './attributes-D2XuSyo_.js';
import { a as Q, c as U, b as h, d as V, m as X } from './create-id-CD7dpc57.js';
import { s as D } from './style-MviLiK55.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
const Y = U({ component: 'progress', parts: ['root'] });
class S {
	static create(e) {
		return new S(e);
	}
	opts;
	attachment;
	constructor(e) {
		((this.opts = e), (this.attachment = Q(this.opts.ref)));
	}
	#e = B(() => ({
		role: 'progressbar',
		value: this.opts.value.current,
		'aria-valuemin': this.opts.min.current,
		'aria-valuemax': this.opts.max.current,
		'aria-valuenow': this.opts.value.current === null ? void 0 : this.opts.value.current,
		'data-value': this.opts.value.current === null ? void 0 : this.opts.value.current,
		'data-state': Z(this.opts.value.current, this.opts.max.current),
		'data-max': this.opts.max.current,
		'data-min': this.opts.min.current,
		'data-indeterminate': this.opts.value.current === null ? '' : void 0,
		[Y.root]: '',
		...this.attachment
	}));
	get props() {
		return H(this.#e);
	}
	set props(e) {
		T(this.#e, e);
	}
}
function Z(i, e) {
	return i === null ? 'indeterminate' : i === e ? 'loaded' : 'loading';
}
var ee = n('<div><!></div>');
function te(i, e) {
	const w = W();
	E(e, !0);
	let b = m(e, 'value', 3, 0),
		$ = m(e, 'max', 3, 100),
		P = m(e, 'min', 3, 0),
		y = m(e, 'id', 19, () => V(w)),
		C = m(e, 'ref', 15, null),
		d = z(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'child',
			'children',
			'value',
			'max',
			'min',
			'id',
			'ref'
		]);
	const r = S.create({
			value: h(() => b()),
			max: h(() => $()),
			min: h(() => P()),
			id: h(() => y()),
			ref: h(
				() => C(),
				(o) => C(o)
			)
		}),
		t = B(() => X(d, r.props));
	var s = A(),
		u = L(s);
	{
		var a = (o) => {
				var c = A(),
					I = L(c);
				(k(
					I,
					() => e.child,
					() => ({ props: H(t) })
				),
					l(o, c));
			},
			O = (o) => {
				var c = ee();
				N(c, () => ({ ...H(t) }));
				var I = q(c);
				(k(I, () => e.children ?? v), l(o, c));
			};
		j(u, (o) => {
			e.child ? o(a) : o(O, !1);
		});
	}
	(l(i, s), F());
}
const f = te,
	ae = {
		component: f,
		title: 'Design System/Atoms/Progress',
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: { type: 'range', min: 0, max: 100, step: 1 },
				description: 'Progress value (0-100)'
			}
		}
	},
	{ Story: g } = K();
var se = n('<div class="h-full rounded-full bg-accent-primary transition-all duration-300"></div>'),
	re = n('<div class="h-full rounded-full bg-accent-primary transition-all duration-300"></div>'),
	le = n('<div class="h-full rounded-full bg-accent-primary transition-all duration-300"></div>'),
	oe = n('<div class="h-full rounded-full bg-accent-primary transition-all duration-300"></div>'),
	ne = n(
		'<div class="h-full w-full animate-pulse rounded-full bg-accent-primary" style="animation: progress-indeterminate 1.5s ease-in-out infinite;"></div>'
	),
	ie = n('<!> <!> <!> <!> <!>', 1);
function M(i, e) {
	(E(e, !1), J());
	var w = ie(),
		b = L(w);
	g(b, {
		name: 'Default',
		args: { value: 50 },
		template: (r, t = v) => {
			f(
				r,
				p(t, {
					class: 'h-2 w-full overflow-hidden rounded-full bg-base',
					children: (s, u) => {
						var a = se();
						(R(() => D(a, `width: ${t().value ?? ''}%`)), l(s, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
	<div
		class="h-full rounded-full bg-accent-primary transition-all duration-300"
		style="width: {args.value}%"
	></div>
</Progress.Root>`
			}
		}
	});
	var $ = x(b, 2);
	g($, {
		name: 'Low',
		args: { value: 25 },
		template: (r, t = v) => {
			f(
				r,
				p(t, {
					class: 'h-2 w-full overflow-hidden rounded-full bg-base',
					children: (s, u) => {
						var a = re();
						(R(() => D(a, `width: ${t().value ?? ''}%`)), l(s, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
	<div
		class="h-full rounded-full bg-accent-primary transition-all duration-300"
		style="width: {args.value}%"
	></div>
</Progress.Root>`
			}
		}
	});
	var P = x($, 2);
	g(P, {
		name: 'High',
		args: { value: 75 },
		template: (r, t = v) => {
			f(
				r,
				p(t, {
					class: 'h-2 w-full overflow-hidden rounded-full bg-base',
					children: (s, u) => {
						var a = le();
						(R(() => D(a, `width: ${t().value ?? ''}%`)), l(s, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
	<div
		class="h-full rounded-full bg-accent-primary transition-all duration-300"
		style="width: {args.value}%"
	></div>
</Progress.Root>`
			}
		}
	});
	var y = x(P, 2);
	g(y, {
		name: 'Complete',
		args: { value: 100 },
		template: (r, t = v) => {
			f(
				r,
				p(t, {
					class: 'h-2 w-full overflow-hidden rounded-full bg-base',
					children: (s, u) => {
						var a = oe();
						(R(() => D(a, `width: ${t().value ?? ''}%`)), l(s, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
	<div
		class="h-full rounded-full bg-accent-primary transition-all duration-300"
		style="width: {args.value}%"
	></div>
</Progress.Root>`
			}
		}
	});
	var C = x(y, 2);
	(g(C, {
		name: 'Indeterminate',
		args: { value: null },
		template: (r, t = v) => {
			f(
				r,
				p(t, {
					class: 'h-2 w-full overflow-hidden rounded-full bg-base',
					children: (s, u) => {
						var a = ne();
						l(s, a);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
	<div
		class="h-full w-full animate-pulse rounded-full bg-accent-primary"
		style="animation: progress-indeterminate 1.5s ease-in-out infinite;"
	></div>
</Progress.Root>`
			}
		}
	}),
		l(i, w),
		F());
}
M.__docgen = { data: [], name: 'Progress.stories.svelte' };
const _ = G(M, ae),
	ge = ['Default', 'Low', 'High', 'Complete', 'Indeterminate'],
	_e = { ..._.Default, tags: ['svelte-csf-v5'] },
	we = { ..._.Low, tags: ['svelte-csf-v5'] },
	be = { ..._.High, tags: ['svelte-csf-v5'] },
	$e = { ..._.Complete, tags: ['svelte-csf-v5'] },
	Pe = { ..._.Indeterminate, tags: ['svelte-csf-v5'] };
export {
	$e as Complete,
	_e as Default,
	be as High,
	Pe as Indeterminate,
	we as Low,
	ge as __namedExportsOrder,
	ae as default
};
