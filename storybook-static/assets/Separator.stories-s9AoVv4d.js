import {
	w as P,
	v as z,
	a8 as L,
	ae as O,
	p as V,
	h as u,
	F as I,
	a as R,
	m as D,
	b as n,
	c as A,
	k as M,
	f as c,
	n as v,
	e as m,
	o as E,
	s as i,
	d as H
} from './iframe-DYn7RqBV.js';
import { c as F, i as U } from './create-runtime-stories-2rm03jka.js';
import { d as W } from './index-QxUtaCdU.js';
import { a as j } from './attributes-D2XuSyo_.js';
import { a as q, c as G, e as J, b as x, d as K, m as N } from './create-id-CD7dpc57.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
const Q = G({ component: 'separator', parts: ['root'] });
class B {
	static create(t) {
		return new B(t);
	}
	opts;
	attachment;
	constructor(t) {
		((this.opts = t), (this.attachment = q(t.ref)));
	}
	#t = P(() => ({
		id: this.opts.id.current,
		role: this.opts.decorative.current ? 'none' : 'separator',
		'aria-orientation': this.opts.orientation.current,
		'aria-hidden': J(this.opts.decorative.current),
		'data-orientation': this.opts.orientation.current,
		[Q.root]: '',
		...this.attachment
	}));
	get props() {
		return z(this.#t);
	}
	set props(t) {
		L(this.#t, t);
	}
}
var X = c('<div><!></div>');
function Y(S, t) {
	const h = O();
	V(t, !0);
	let _ = u(t, 'id', 19, () => K(h)),
		p = u(t, 'ref', 15, null),
		g = u(t, 'decorative', 3, !1),
		C = u(t, 'orientation', 3, 'horizontal'),
		d = E(t, [
			'$$slots',
			'$$events',
			'$$legacy',
			'id',
			'ref',
			'child',
			'children',
			'decorative',
			'orientation'
		]);
	const o = B.create({
			ref: x(
				() => p(),
				(s) => p(s)
			),
			id: x(() => _()),
			decorative: x(() => g()),
			orientation: x(() => C())
		}),
		r = P(() => N(d, o.props));
	var e = I(),
		a = R(e);
	{
		var $ = (s) => {
				var l = I(),
					w = R(l);
				(M(
					w,
					() => t.child,
					() => ({ props: z(r) })
				),
					n(s, l));
			},
			k = (s) => {
				var l = X();
				j(l, () => ({ ...z(r) }));
				var w = m(l);
				(M(w, () => t.children ?? v), n(s, l));
			};
		D(a, (s) => {
			t.child ? s($) : s(k, !1);
		});
	}
	(n(S, e), A());
}
const f = Y,
	Z = {
		component: f,
		title: 'Design System/Atoms/Separator',
		tags: ['autodocs'],
		argTypes: { orientation: { control: { type: 'select' }, options: ['horizontal', 'vertical'] } }
	},
	{ Story: b } = W();
var tt = c('<div class="flex flex-col gap-4"><p>Content above</p> <!> <p>Content below</p></div>'),
	et = c(
		'<div class="flex h-32 items-center gap-4"><p>Content left</p> <!> <p>Content right</p></div>'
	),
	ot = c(
		'<div class="flex w-64 flex-col gap-2 rounded-md border border-base bg-surface p-2"><button class="px-2 py-1 text-left text-primary hover:bg-hover-solid">Profile</button> <button class="px-2 py-1 text-left text-primary hover:bg-hover-solid">Settings</button> <!> <button class="px-2 py-1 text-left text-primary hover:bg-hover-solid">Logout</button></div>'
	),
	at = c(
		'<div class="flex flex-col gap-4"><div><h3 class="mb-2 text-lg font-semibold text-primary">Section 1</h3> <p class="text-secondary">Content for section 1</p></div> <!> <div><h3 class="mb-2 text-lg font-semibold text-primary">Section 2</h3> <p class="text-secondary">Content for section 2</p></div></div>'
	),
	rt = c('<!> <!> <!> <!>', 1);
function T(S, t) {
	(V(t, !1), U());
	var h = rt(),
		_ = R(h);
	b(_, {
		name: 'Horizontal',
		args: { orientation: 'horizontal' },
		template: (o, r = v) => {
			var e = tt(),
				a = i(m(e), 2);
			(f(a, H(r)), n(o, e));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex flex-col gap-4">
	<p>Content above</p>
	<Separator.Root {...args} />
	<p>Content below</p>
</div>`
			}
		}
	});
	var p = i(_, 2);
	b(p, {
		name: 'Vertical',
		args: { orientation: 'vertical' },
		template: (o, r = v) => {
			var e = et(),
				a = i(m(e), 2);
			(f(a, H(r)), n(o, e));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex h-32 items-center gap-4">
	<p>Content left</p>
	<Separator.Root {...args} />
	<p>Content right</p>
</div>`
			}
		}
	});
	var g = i(p, 2);
	b(g, {
		name: 'In Menu',
		template: (o, r = v) => {
			var e = ot(),
				a = i(m(e), 4);
			(f(a, { orientation: 'horizontal' }), n(o, e));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex w-64 flex-col gap-2 rounded-md border border-base bg-surface p-2">
	<button class="px-2 py-1 text-left text-primary hover:bg-hover-solid">Profile</button>
	<button class="px-2 py-1 text-left text-primary hover:bg-hover-solid">Settings</button>
	<Separator.Root orientation="horizontal" />
	<button class="px-2 py-1 text-left text-primary hover:bg-hover-solid">Logout</button>
</div>`
			}
		}
	});
	var C = i(g, 2);
	(b(C, {
		name: 'Between Sections',
		template: (o, r = v) => {
			var e = at(),
				a = i(m(e), 2);
			(f(a, { orientation: 'horizontal' }), n(o, e));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex flex-col gap-4">
	<div>
		<h3 class="mb-2 text-lg font-semibold text-primary">Section 1</h3>
		<p class="text-secondary">Content for section 1</p>
	</div>
	<Separator.Root orientation="horizontal" />
	<div>
		<h3 class="mb-2 text-lg font-semibold text-primary">Section 2</h3>
		<p class="text-secondary">Content for section 2</p>
	</div>
</div>`
			}
		}
	}),
		n(S, h),
		A());
}
T.__docgen = { data: [], name: 'Separator.stories.svelte' };
const y = F(T, Z),
	mt = ['Horizontal', 'Vertical', 'InMenu', 'BetweenSections'],
	ft = { ...y.Horizontal, tags: ['svelte-csf-v5'] },
	ht = { ...y.Vertical, tags: ['svelte-csf-v5'] },
	_t = { ...y.InMenu, tags: ['svelte-csf-v5'] },
	gt = { ...y.BetweenSections, tags: ['svelte-csf-v5'] };
export {
	gt as BetweenSections,
	ft as Horizontal,
	_t as InMenu,
	ht as Vertical,
	mt as __namedExportsOrder,
	Z as default
};
