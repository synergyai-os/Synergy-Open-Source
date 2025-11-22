import {
	w as S,
	v as j,
	a8 as M,
	ae as O,
	p as k,
	h as $,
	f as c,
	m as T,
	i as W,
	b as l,
	c as B,
	e as C,
	F as q,
	a as D,
	k as P,
	n as f,
	o as z,
	s as A,
	d as g
} from './iframe-DYn7RqBV.js';
import { c as G, i as H } from './create-runtime-stories-2rm03jka.js';
import { d as J } from './index-QxUtaCdU.js';
import { a as K } from './attributes-D2XuSyo_.js';
import { s as L } from './style-MviLiK55.js';
import { a as N, c as Q, b as E, d as U, m as V } from './create-id-CD7dpc57.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
const X = Q({ component: 'aspect-ratio', parts: ['root'] });
class y {
	static create(t) {
		return new y(t);
	}
	opts;
	attachment;
	constructor(t) {
		((this.opts = t), (this.attachment = N(this.opts.ref)));
	}
	#t = S(() => ({
		id: this.opts.id.current,
		style: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
		[X.root]: '',
		...this.attachment
	}));
	get props() {
		return j(this.#t);
	}
	set props(t) {
		M(this.#t, t);
	}
}
var Y = c('<div><!></div>'),
	Z = c('<div><!></div>');
function tt(R, t) {
	const v = O();
	k(t, !0);
	let n = $(t, 'ref', 15, null),
		u = $(t, 'id', 19, () => U(v)),
		p = $(t, 'ratio', 3, 1),
		w = z(t, ['$$slots', '$$events', '$$legacy', 'ref', 'id', 'ratio', 'children', 'child']);
	const r = y.create({
			id: E(() => u()),
			ref: E(
				() => n(),
				(i) => n(i)
			),
			ratio: E(() => p())
		}),
		e = S(() => V(w, r.props));
	var a = Z();
	let o;
	var m = C(a);
	{
		var s = (i) => {
				var d = q(),
					b = D(d);
				(P(
					b,
					() => t.child,
					() => ({ props: j(e) })
				),
					l(i, d));
			},
			I = (i) => {
				var d = Y();
				K(d, () => ({ ...j(e) }));
				var b = C(d);
				(P(b, () => t.children ?? f), l(i, d));
			};
		T(m, (i) => {
			t.child ? i(s) : i(I, !1);
		});
	}
	(W(
		() =>
			(o = L(a, '', o, {
				position: 'relative',
				width: '100%',
				'padding-bottom': `${p() ? 100 / p() : 0}%`
			}))
	),
		l(R, a),
		B());
}
const h = tt,
	at = {
		component: h,
		title: 'Design System/Atoms/AspectRatio',
		tags: ['autodocs'],
		argTypes: { ratio: { control: { type: 'number' }, description: 'Aspect ratio (width/height)' } }
	},
	{ Story: _ } = J();
var et = c(
		'<img src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&amp;h=450&amp;fit=crop" alt="Example" class="h-full w-full object-cover"/>'
	),
	ot = c(
		'<img src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&amp;h=600&amp;fit=crop" alt="Example" class="h-full w-full object-cover"/>'
	),
	st = c(
		'<img src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&amp;h=600&amp;fit=crop" alt="Example" class="h-full w-full object-cover"/>'
	),
	rt = c(
		'<img src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=840&amp;h=360&amp;fit=crop" alt="Example" class="h-full w-full object-cover"/>'
	),
	it = c('<!> <!> <!> <!>', 1);
function F(R, t) {
	(k(t, !1), H());
	var v = it(),
		n = D(v);
	{
		const r = (e, a = f) => {
			h(
				e,
				g(a, {
					class: 'max-w-[800px] overflow-hidden rounded-card bg-elevated',
					children: (o, m) => {
						var s = et();
						l(o, s);
					},
					$$slots: { default: !0 }
				})
			);
		};
		_(n, {
			name: 'Ratio16x9',
			args: { ratio: 16 / 9 },
			template: r,
			$$slots: { template: !0 },
			parameters: {
				__svelteCsf: {
					rawCode: `<AspectRatio.Root {...args} class="max-w-[800px] overflow-hidden rounded-card bg-elevated">
	<img
		src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=450&fit=crop"
		alt="Example"
		class="h-full w-full object-cover"
	/>
</AspectRatio.Root>`
				}
			}
		});
	}
	var u = A(n, 2);
	{
		const r = (e, a = f) => {
			h(
				e,
				g(a, {
					class: 'max-w-[800px] overflow-hidden rounded-card bg-elevated',
					children: (o, m) => {
						var s = ot();
						l(o, s);
					},
					$$slots: { default: !0 }
				})
			);
		};
		_(u, {
			name: 'Ratio4x3',
			args: { ratio: 4 / 3 },
			template: r,
			$$slots: { template: !0 },
			parameters: {
				__svelteCsf: {
					rawCode: `<AspectRatio.Root {...args} class="max-w-[800px] overflow-hidden rounded-card bg-elevated">
	<img
		src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=600&fit=crop"
		alt="Example"
		class="h-full w-full object-cover"
	/>
</AspectRatio.Root>`
				}
			}
		});
	}
	var p = A(u, 2);
	_(p, {
		name: 'Ratio1x1',
		args: { ratio: 1 },
		template: (e, a = f) => {
			h(
				e,
				g(a, {
					class: 'max-w-[600px] overflow-hidden rounded-card bg-elevated',
					children: (o, m) => {
						var s = st();
						l(o, s);
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<AspectRatio.Root {...args} class="max-w-[600px] overflow-hidden rounded-card bg-elevated">
	<img
		src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=600&fit=crop"
		alt="Example"
		class="h-full w-full object-cover"
	/>
</AspectRatio.Root>`
			}
		}
	});
	var w = A(p, 2);
	{
		const r = (e, a = f) => {
			h(
				e,
				g(a, {
					class: 'max-w-[800px] overflow-hidden rounded-card bg-elevated',
					children: (o, m) => {
						var s = rt();
						l(o, s);
					},
					$$slots: { default: !0 }
				})
			);
		};
		_(w, {
			name: 'Ratio21x9',
			args: { ratio: 21 / 9 },
			template: r,
			$$slots: { template: !0 },
			parameters: {
				__svelteCsf: {
					rawCode: `<AspectRatio.Root {...args} class="max-w-[800px] overflow-hidden rounded-card bg-elevated">
	<img
		src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=840&h=360&fit=crop"
		alt="Example"
		class="h-full w-full object-cover"
	/>
</AspectRatio.Root>`
				}
			}
		});
	}
	(l(R, v), B());
}
F.__docgen = { data: [], name: 'AspectRatio.stories.svelte' };
const x = G(F, at),
	vt = ['Ratio16x9', 'Ratio4x3', 'Ratio1x1', 'Ratio21x9'],
	ut = { ...x.Ratio16x9, tags: ['svelte-csf-v5'] },
	gt = { ...x.Ratio4x3, tags: ['svelte-csf-v5'] },
	_t = { ...x.Ratio1x1, tags: ['svelte-csf-v5'] },
	xt = { ...x.Ratio21x9, tags: ['svelte-csf-v5'] };
export {
	ut as Ratio16x9,
	_t as Ratio1x1,
	xt as Ratio21x9,
	gt as Ratio4x3,
	vt as __namedExportsOrder,
	at as default
};
