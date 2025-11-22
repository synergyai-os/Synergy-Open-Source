import {
	w as A,
	v as D,
	a8 as T,
	ae as W,
	p as k,
	h as m,
	F as L,
	a as F,
	m as j,
	b as o,
	c as B,
	k as S,
	f as u,
	n as v,
	e as q,
	o as z,
	s as P,
	d as w,
	i as b
} from './iframe-DYn7RqBV.js';
import { c as G, i as J } from './create-runtime-stories-2rm03jka.js';
import { d as K } from './index-QxUtaCdU.js';
import { a as N } from './attributes-D2XuSyo_.js';
import { a as Q, c as U, b as c, d as V, m as X } from './create-id-CD7dpc57.js';
import { s as x } from './style-MviLiK55.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
const Y = U({ component: 'meter', parts: ['root'] });
class H {
	static create(t) {
		return new H(t);
	}
	opts;
	attachment;
	constructor(t) {
		((this.opts = t), (this.attachment = Q(this.opts.ref)));
	}
	#e = A(() => ({
		role: 'meter',
		value: this.opts.value.current,
		'aria-valuemin': this.opts.min.current,
		'aria-valuemax': this.opts.max.current,
		'aria-valuenow': this.opts.value.current,
		'data-value': this.opts.value.current,
		'data-max': this.opts.max.current,
		'data-min': this.opts.min.current,
		[Y.root]: '',
		...this.attachment
	}));
	get props() {
		return D(this.#e);
	}
	set props(t) {
		T(this.#e, t);
	}
}
var Z = u('<div><!></div>');
function ee(M, t) {
	const p = W();
	k(t, !0);
	let h = m(t, 'value', 3, 0),
		_ = m(t, 'max', 3, 100),
		g = m(t, 'min', 3, 0),
		R = m(t, 'id', 19, () => V(p)),
		n = m(t, 'ref', 15, null),
		r = z(t, [
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
	const e = H.create({
			value: c(() => h()),
			max: c(() => _()),
			min: c(() => g()),
			id: c(() => R()),
			ref: c(
				() => n(),
				(l) => n(l)
			)
		}),
		s = A(() => X(r, e.props));
	var i = L(),
		a = F(i);
	{
		var I = (l) => {
				var d = L(),
					C = F(d);
				(S(
					C,
					() => t.child,
					() => ({ props: D(s) })
				),
					o(l, d));
			},
			O = (l) => {
				var d = Z();
				N(d, () => ({ ...D(s) }));
				var C = q(d);
				(S(C, () => t.children ?? v), o(l, d));
			};
		j(a, (l) => {
			t.child ? l(I) : l(O, !1);
		});
	}
	(o(M, i), B());
}
const f = ee,
	te = {
		component: f,
		title: 'Design System/Atoms/Meter',
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: { type: 'range', min: 0, max: 100, step: 1 },
				description: 'Current value (0-100)'
			},
			min: { control: { type: 'number' }, description: 'Minimum value' },
			max: { control: { type: 'number' }, description: 'Maximum value' }
		}
	},
	{ Story: $ } = K();
var ae = u('<div class="h-full rounded-full bg-accent-primary transition-all duration-300"></div>'),
	se = u('<div class="h-full rounded-full bg-accent-primary transition-all duration-300"></div>'),
	re = u('<div class="h-full rounded-full bg-accent-primary transition-all duration-300"></div>'),
	le = u('<div class="h-full rounded-full bg-accent-primary transition-all duration-300"></div>'),
	oe = u('<!> <!> <!> <!>', 1);
function E(M, t) {
	(k(t, !1), J());
	var p = oe(),
		h = F(p);
	$(h, {
		name: 'Default',
		args: { value: 50, min: 0, max: 100 },
		template: (r, e = v) => {
			f(
				r,
				w(e, {
					class: 'h-4 w-full overflow-hidden rounded-full bg-base',
					children: (s, i) => {
						var a = ae();
						(b(() => x(a, `width: ${((e().value - e().min) / (e().max - e().min)) * 100}%`)),
							o(s, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Meter.Root {...args} class="h-4 w-full overflow-hidden rounded-full bg-base">
	<div
		class="h-full rounded-full bg-accent-primary transition-all duration-300"
		style="width: {((args.value - args.min) / (args.max - args.min)) * 100}%"
	></div>
</Meter.Root>`
			}
		}
	});
	var _ = P(h, 2);
	$(_, {
		name: 'Low',
		args: { value: 25, min: 0, max: 100 },
		template: (r, e = v) => {
			f(
				r,
				w(e, {
					class: 'h-4 w-full overflow-hidden rounded-full bg-base',
					children: (s, i) => {
						var a = se();
						(b(() => x(a, `width: ${((e().value - e().min) / (e().max - e().min)) * 100}%`)),
							o(s, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Meter.Root {...args} class="h-4 w-full overflow-hidden rounded-full bg-base">
	<div
		class="h-full rounded-full bg-accent-primary transition-all duration-300"
		style="width: {((args.value - args.min) / (args.max - args.min)) * 100}%"
	></div>
</Meter.Root>`
			}
		}
	});
	var g = P(_, 2);
	$(g, {
		name: 'High',
		args: { value: 75, min: 0, max: 100 },
		template: (r, e = v) => {
			f(
				r,
				w(e, {
					class: 'h-4 w-full overflow-hidden rounded-full bg-base',
					children: (s, i) => {
						var a = re();
						(b(() => x(a, `width: ${((e().value - e().min) / (e().max - e().min)) * 100}%`)),
							o(s, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Meter.Root {...args} class="h-4 w-full overflow-hidden rounded-full bg-base">
	<div
		class="h-full rounded-full bg-accent-primary transition-all duration-300"
		style="width: {((args.value - args.min) / (args.max - args.min)) * 100}%"
	></div>
</Meter.Root>`
			}
		}
	});
	var R = P(g, 2);
	($(R, {
		name: 'Full',
		args: { value: 100, min: 0, max: 100 },
		template: (r, e = v) => {
			f(
				r,
				w(e, {
					class: 'h-4 w-full overflow-hidden rounded-full bg-base',
					children: (s, i) => {
						var a = le();
						(b(() => x(a, `width: ${((e().value - e().min) / (e().max - e().min)) * 100}%`)),
							o(s, a));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Meter.Root {...args} class="h-4 w-full overflow-hidden rounded-full bg-base">
	<div
		class="h-full rounded-full bg-accent-primary transition-all duration-300"
		style="width: {((args.value - args.min) / (args.max - args.min)) * 100}%"
	></div>
</Meter.Root>`
			}
		}
	}),
		o(M, p),
		B());
}
E.__docgen = { data: [], name: 'Meter.stories.svelte' };
const y = G(E, te),
	pe = ['Default', 'Low', 'High', 'Full'],
	he = { ...y.Default, tags: ['svelte-csf-v5'] },
	_e = { ...y.Low, tags: ['svelte-csf-v5'] },
	ge = { ...y.High, tags: ['svelte-csf-v5'] },
	we = { ...y.Full, tags: ['svelte-csf-v5'] };
export {
	he as Default,
	we as Full,
	ge as High,
	_e as Low,
	pe as __namedExportsOrder,
	te as default
};
