import {
	w as G,
	v as g,
	a8 as M,
	G as re,
	ab as ae,
	ae as N,
	p as j,
	h as y,
	F as A,
	a as b,
	m as U,
	b as o,
	c as H,
	k as B,
	f as F,
	n as R,
	e as X,
	o as K,
	s as u,
	d as V,
	t as d,
	g as q
} from './iframe-DYn7RqBV.js';
import { c as le, i as ne } from './create-runtime-stories-2rm03jka.js';
import { d as ie } from './index-QxUtaCdU.js';
/* empty css                                                  */ import { a as J } from './attributes-D2XuSyo_.js';
import { w as ue } from './watch.svelte-CYSsdG2H.js';
import { C as ge } from './context-DWcBTeuX.js';
import {
	a as Q,
	c as de,
	h as Y,
	p as pe,
	g as ce,
	f as ve,
	b as P,
	d as Z,
	m as ee
} from './create-id-CD7dpc57.js';
import { R as he } from './roving-focus-group-B-fCEnqo.js';
import { d as me, S as fe } from './kbd-constants-Duhtze-4.js';
import { n as _e } from './noop-DX6rZLP_.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './is-DtD5rb4o.js';
const W = de({ component: 'toggle-group', parts: ['root', 'item'] }),
	te = new ge('ToggleGroup.Root');
class oe {
	opts;
	rovingFocusGroup;
	attachment;
	constructor(e) {
		((this.opts = e),
			(this.attachment = Q(this.opts.ref)),
			(this.rovingFocusGroup = new he({
				candidateAttr: W.item,
				rootNode: e.ref,
				loop: e.loop,
				orientation: e.orientation
			})));
	}
	#e = G(() => ({
		id: this.opts.id.current,
		[W.root]: '',
		role: 'group',
		'data-orientation': this.opts.orientation.current,
		'data-disabled': Y(this.opts.disabled.current),
		...this.attachment
	}));
	get props() {
		return g(this.#e);
	}
	set props(e) {
		M(this.#e, e);
	}
}
class Te extends oe {
	opts;
	isMulti = !1;
	#e = G(() => this.opts.value.current !== '');
	get anyPressed() {
		return g(this.#e);
	}
	set anyPressed(e) {
		M(this.#e, e);
	}
	constructor(e) {
		(super(e), (this.opts = e));
	}
	includesItem(e) {
		return this.opts.value.current === e;
	}
	toggleItem(e, m) {
		this.includesItem(e)
			? (this.opts.value.current = '')
			: ((this.opts.value.current = e), this.rovingFocusGroup.setCurrentTabStopId(m));
	}
}
class $e extends oe {
	opts;
	isMulti = !0;
	#e = G(() => this.opts.value.current.length > 0);
	get anyPressed() {
		return g(this.#e);
	}
	set anyPressed(e) {
		M(this.#e, e);
	}
	constructor(e) {
		(super(e), (this.opts = e));
	}
	includesItem(e) {
		return this.opts.value.current.includes(e);
	}
	toggleItem(e, m) {
		this.includesItem(e)
			? (this.opts.value.current = this.opts.value.current.filter((_) => _ !== e))
			: ((this.opts.value.current = [...this.opts.value.current, e]),
				this.rovingFocusGroup.setCurrentTabStopId(m));
	}
}
class ye {
	static create(e) {
		const { type: m, ..._ } = e,
			S = m === 'single' ? new Te(_) : new $e(_);
		return te.set(S);
	}
}
class L {
	static create(e) {
		return new L(e, te.get());
	}
	opts;
	root;
	attachment;
	#e = G(() => this.opts.disabled.current || this.root.opts.disabled.current);
	#o = G(() => this.root.includesItem(this.opts.value.current));
	get isPressed() {
		return g(this.#o);
	}
	set isPressed(e) {
		M(this.#o, e);
	}
	#a = G(() => (this.root.isMulti ? void 0 : pe(this.isPressed, !1)));
	#l = G(() => (this.root.isMulti ? ce(this.isPressed) : void 0));
	constructor(e, m) {
		((this.opts = e),
			(this.root = m),
			(this.attachment = Q(this.opts.ref)),
			re(() => {
				this.root.opts.rovingFocus.current
					? M(this.#t, this.root.rovingFocusGroup.getTabIndex(this.opts.ref.current), !0)
					: M(this.#t, 0);
			}),
			(this.onclick = this.onclick.bind(this)),
			(this.onkeydown = this.onkeydown.bind(this)));
	}
	#n() {
		g(this.#e) || this.root.toggleItem(this.opts.value.current, this.opts.id.current);
	}
	onclick(e) {
		g(this.#e) || this.root.toggleItem(this.opts.value.current, this.opts.id.current);
	}
	onkeydown(e) {
		if (!g(this.#e)) {
			if (e.key === me || e.key === fe) {
				(e.preventDefault(), this.#n());
				return;
			}
			this.root.opts.rovingFocus.current &&
				this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
		}
	}
	#t = ae(0);
	#s = G(() => ({ pressed: this.isPressed }));
	get snippetProps() {
		return g(this.#s);
	}
	set snippetProps(e) {
		M(this.#s, e);
	}
	#r = G(() => ({
		id: this.opts.id.current,
		role: this.root.isMulti ? void 0 : 'radio',
		tabindex: g(this.#t),
		'data-orientation': this.root.opts.orientation.current,
		'data-disabled': Y(g(this.#e)),
		'data-state': Ge(this.isPressed),
		'data-value': this.opts.value.current,
		'aria-pressed': g(this.#l),
		'aria-checked': g(this.#a),
		disabled: ve(g(this.#e)),
		[W.item]: '',
		onclick: this.onclick,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return g(this.#r);
	}
	set props(e) {
		M(this.#r, e);
	}
}
function Ge(I) {
	return I ? 'on' : 'off';
}
var Ie = F('<div><!></div>');
function we(I, e) {
	const m = N();
	j(e, !0);
	let _ = y(e, 'id', 19, () => Z(m)),
		S = y(e, 'ref', 15, null),
		x = y(e, 'value', 15),
		z = y(e, 'onValueChange', 3, _e),
		k = y(e, 'disabled', 3, !1),
		f = y(e, 'loop', 3, !0),
		T = y(e, 'orientation', 3, 'horizontal'),
		$ = y(e, 'rovingFocus', 3, !0),
		C = K(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'id',
			'ref',
			'value',
			'onValueChange',
			'type',
			'disabled',
			'loop',
			'orientation',
			'rovingFocus',
			'child',
			'children'
		]);
	function c() {
		x() === void 0 && x(e.type === 'single' ? '' : []);
	}
	(c(),
		ue.pre(
			() => x(),
			() => {
				c();
			}
		));
	const v = ye.create({
			id: P(() => _()),
			value: P(
				() => x(),
				(r) => {
					(x(r), z()(r));
				}
			),
			disabled: P(() => k()),
			loop: P(() => f()),
			orientation: P(() => T()),
			rovingFocus: P(() => $()),
			type: e.type,
			ref: P(
				() => S(),
				(r) => S(r)
			)
		}),
		a = G(() => ee(C, v.props));
	var l = A(),
		h = b(l);
	{
		var n = (r) => {
				var t = A(),
					p = b(t);
				(B(
					p,
					() => e.child,
					() => ({ props: g(a) })
				),
					o(r, t));
			},
			w = (r) => {
				var t = Ie();
				J(t, () => ({ ...g(a) }));
				var p = X(t);
				(B(p, () => e.children ?? R), o(r, t));
			};
		U(h, (r) => {
			e.child ? r(n) : r(w, !1);
		});
	}
	(o(I, l), H());
}
var Pe = F('<button><!></button>');
function xe(I, e) {
	const m = N();
	j(e, !0);
	let _ = y(e, 'ref', 15, null),
		S = y(e, 'disabled', 3, !1),
		x = y(e, 'id', 19, () => Z(m)),
		z = y(e, 'type', 3, 'button'),
		k = K(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'children',
			'child',
			'ref',
			'value',
			'disabled',
			'id',
			'type'
		]);
	const f = L.create({
			id: P(() => x()),
			value: P(() => e.value),
			disabled: P(() => S() ?? !1),
			ref: P(
				() => _(),
				(a) => _(a)
			)
		}),
		T = G(() => ee(k, f.props, { type: z() }));
	var $ = A(),
		C = b($);
	{
		var c = (a) => {
				var l = A(),
					h = b(l);
				{
					let n = G(() => ({ props: g(T), ...f.snippetProps }));
					B(
						h,
						() => e.child,
						() => g(n)
					);
				}
				o(a, l);
			},
			v = (a) => {
				var l = Pe();
				J(l, () => ({ ...g(T) }));
				var h = X(l);
				(B(
					h,
					() => e.children ?? R,
					() => f.snippetProps
				),
					o(a, l));
			};
		U(C, (a) => {
			e.child ? a(c) : a(v, !1);
		});
	}
	(o(I, $), H());
}
const O = we,
	i = xe,
	Se = {
		component: O,
		title: 'Design System/Atoms/ToggleGroup',
		tags: ['autodocs'],
		argTypes: { type: { control: { type: 'select' }, options: ['single', 'multiple'] } }
	},
	{ Story: D } = ie();
var be = F('<!> <!> <!> <!> <!> <!> <!>', 1),
	Me = F('<!> <!> <!> <!> <!> <!> <!>', 1),
	ke = F('<!> <!> <!> <!>', 1),
	Ce = q(
		'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>'
	),
	Fe = q(
		'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>'
	),
	Re = F('<!> <!>', 1),
	ze = F('<!> <!> <!> <!>', 1);
function se(I, e) {
	(j(e, !1), ne());
	var m = ze(),
		_ = b(m);
	D(_, {
		name: 'Single',
		args: { type: 'single', value: 'mon' },
		template: (f, T = R) => {
			O(
				f,
				V(T, {
					class: 'inline-flex gap-icon',
					children: ($, C) => {
						var c = be(),
							v = b(c);
						i(v, {
							value: 'mon',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Mon');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var a = u(v, 2);
						i(a, {
							value: 'tue',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Tue');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var l = u(a, 2);
						i(l, {
							value: 'wed',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Wed');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var h = u(l, 2);
						i(h, {
							value: 'thu',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Thu');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var n = u(h, 2);
						i(n, {
							value: 'fri',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Fri');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var w = u(n, 2);
						i(w, {
							value: 'sat',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Sat');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var r = u(w, 2);
						(i(r, {
							value: 'sun',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Sun');
								o(t, s);
							},
							$$slots: { default: !0 }
						}),
							o($, c));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<ToggleGroup.Root {...args} class="inline-flex gap-icon">
	<ToggleGroup.Item value="mon" class="toggle-group-day">Mon</ToggleGroup.Item>
	<ToggleGroup.Item value="tue" class="toggle-group-day">Tue</ToggleGroup.Item>
	<ToggleGroup.Item value="wed" class="toggle-group-day">Wed</ToggleGroup.Item>
	<ToggleGroup.Item value="thu" class="toggle-group-day">Thu</ToggleGroup.Item>
	<ToggleGroup.Item value="fri" class="toggle-group-day">Fri</ToggleGroup.Item>
	<ToggleGroup.Item value="sat" class="toggle-group-day">Sat</ToggleGroup.Item>
	<ToggleGroup.Item value="sun" class="toggle-group-day">Sun</ToggleGroup.Item>
</ToggleGroup.Root>`
			}
		}
	});
	var S = u(_, 2);
	D(S, {
		name: 'Multiple',
		args: { type: 'multiple', value: ['mon', 'wed', 'fri'] },
		template: (f, T = R) => {
			O(
				f,
				V(T, {
					class: 'inline-flex gap-icon',
					children: ($, C) => {
						var c = Me(),
							v = b(c);
						i(v, {
							value: 'mon',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Mon');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var a = u(v, 2);
						i(a, {
							value: 'tue',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Tue');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var l = u(a, 2);
						i(l, {
							value: 'wed',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Wed');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var h = u(l, 2);
						i(h, {
							value: 'thu',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Thu');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var n = u(h, 2);
						i(n, {
							value: 'fri',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Fri');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var w = u(n, 2);
						i(w, {
							value: 'sat',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Sat');
								o(t, s);
							},
							$$slots: { default: !0 }
						});
						var r = u(w, 2);
						(i(r, {
							value: 'sun',
							class: 'toggle-group-day',
							children: (t, p) => {
								var s = d('Sun');
								o(t, s);
							},
							$$slots: { default: !0 }
						}),
							o($, c));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<ToggleGroup.Root {...args} class="inline-flex gap-icon">
	<ToggleGroup.Item value="mon" class="toggle-group-day">Mon</ToggleGroup.Item>
	<ToggleGroup.Item value="tue" class="toggle-group-day">Tue</ToggleGroup.Item>
	<ToggleGroup.Item value="wed" class="toggle-group-day">Wed</ToggleGroup.Item>
	<ToggleGroup.Item value="thu" class="toggle-group-day">Thu</ToggleGroup.Item>
	<ToggleGroup.Item value="fri" class="toggle-group-day">Fri</ToggleGroup.Item>
	<ToggleGroup.Item value="sat" class="toggle-group-day">Sat</ToggleGroup.Item>
	<ToggleGroup.Item value="sun" class="toggle-group-day">Sun</ToggleGroup.Item>
</ToggleGroup.Root>`
			}
		}
	});
	var x = u(S, 2);
	D(x, {
		name: 'SizeOptions',
		args: { type: 'single', value: 'sm' },
		template: (f, T = R) => {
			O(
				f,
				V(T, {
					class: 'inline-flex gap-icon',
					children: ($, C) => {
						var c = ke(),
							v = b(c);
						i(v, {
							value: 'sm',
							class: 'toggle-group-day',
							children: (n, w) => {
								var r = d('SM');
								o(n, r);
							},
							$$slots: { default: !0 }
						});
						var a = u(v, 2);
						i(a, {
							value: 'md',
							class: 'toggle-group-day',
							children: (n, w) => {
								var r = d('MD');
								o(n, r);
							},
							$$slots: { default: !0 }
						});
						var l = u(a, 2);
						i(l, {
							value: 'lg',
							class: 'toggle-group-day',
							children: (n, w) => {
								var r = d('LG');
								o(n, r);
							},
							$$slots: { default: !0 }
						});
						var h = u(l, 2);
						(i(h, {
							value: 'xl',
							class: 'toggle-group-day',
							children: (n, w) => {
								var r = d('XL');
								o(n, r);
							},
							$$slots: { default: !0 }
						}),
							o($, c));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<ToggleGroup.Root {...args} class="inline-flex gap-icon">
	<ToggleGroup.Item value="sm" class="toggle-group-day">SM</ToggleGroup.Item>
	<ToggleGroup.Item value="md" class="toggle-group-day">MD</ToggleGroup.Item>
	<ToggleGroup.Item value="lg" class="toggle-group-day">LG</ToggleGroup.Item>
	<ToggleGroup.Item value="xl" class="toggle-group-day">XL</ToggleGroup.Item>
</ToggleGroup.Root>`
			}
		}
	});
	var z = u(x, 2);
	(D(z, {
		name: 'ViewOptions',
		args: { type: 'single', value: 'grid' },
		template: (f, T = R) => {
			O(
				f,
				V(T, {
					class: 'inline-flex gap-icon',
					children: ($, C) => {
						var c = Re(),
							v = b(c);
						i(v, {
							value: 'grid',
							class: 'toggle-group-day',
							children: (l, h) => {
								var n = Ce();
								o(l, n);
							},
							$$slots: { default: !0 }
						});
						var a = u(v, 2);
						(i(a, {
							value: 'list',
							class: 'toggle-group-day',
							children: (l, h) => {
								var n = Fe();
								o(l, n);
							},
							$$slots: { default: !0 }
						}),
							o($, c));
					},
					$$slots: { default: !0 }
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<ToggleGroup.Root {...args} class="inline-flex gap-icon">
	<ToggleGroup.Item value="grid" class="toggle-group-day">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			class="h-4 w-4"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
			/>
		</svg>
	</ToggleGroup.Item>
	<ToggleGroup.Item value="list" class="toggle-group-day">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			class="h-4 w-4"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	</ToggleGroup.Item>
</ToggleGroup.Root>`
			}
		}
	}),
		o(I, m),
		H());
}
se.__docgen = { data: [], name: 'ToggleGroup.stories.svelte' };
const E = le(se, Se),
	Je = ['Single', 'Multiple', 'SizeOptions', 'ViewOptions'],
	Qe = { ...E.Single, tags: ['svelte-csf-v5'] },
	Ye = { ...E.Multiple, tags: ['svelte-csf-v5'] },
	Ze = { ...E.SizeOptions, tags: ['svelte-csf-v5'] },
	et = { ...E.ViewOptions, tags: ['svelte-csf-v5'] };
export {
	Ye as Multiple,
	Qe as Single,
	Ze as SizeOptions,
	et as ViewOptions,
	Je as __namedExportsOrder,
	Se as default
};
