import {
	ae as se,
	p as H,
	h as b,
	F as W,
	a as d,
	m as X,
	b as t,
	c as J,
	k as E,
	v as k,
	w as I,
	f as h,
	n as q,
	e as G,
	o as Y,
	G as ve,
	a8 as ue,
	ab as ge,
	a9 as fe,
	d as pe,
	s as p,
	t as D
} from './iframe-DYn7RqBV.js';
import { c as me, i as _e } from './create-runtime-stories-2rm03jka.js';
import { d as $e } from './index-QxUtaCdU.js';
import {
	d as De,
	e as he,
	f as be,
	c as xe,
	a as ye,
	b as Pe,
	D as Ce
} from './dialog-content-orwc9n3O.js';
import { a as ne } from './attributes-D2XuSyo_.js';
import { d as ie, b as O, m as A } from './create-id-CD7dpc57.js';
import { P as we } from './portal-c1AsCbfc.js';
import { B as M } from './Button-2sxpTgAx.js';
import './preload-helper-PPVm8Dsz.js';
import './noop-DX6rZLP_.js';
import './watch.svelte-CYSsdG2H.js';
import './context-DWcBTeuX.js';
import './is-using-keyboard.svelte-qppEaaQk.js';
import './is-DtD5rb4o.js';
import './kbd-constants-Duhtze-4.js';
import './dom-context.svelte-Cee2qr-t.js';
import './arrays-C786ZheV.js';
import './roving-focus-group-B-fCEnqo.js';
import './use-id-C09Eugg1.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
import './this-Hz0nHxQJ.js';
var ke = h('<div><!></div>');
function Te(T, e) {
	const x = se();
	H(e, !0);
	let P = b(e, 'id', 19, () => ie(x)),
		m = b(e, 'forceMount', 3, !1),
		C = b(e, 'ref', 15, null),
		y = Y(e, ['$$slots', '$$events', '$$legacy', 'id', 'forceMount', 'child', 'children', 'ref']);
	const u = De.create({
			id: O(() => P()),
			ref: O(
				() => C(),
				(l) => C(l)
			)
		}),
		n = I(() => A(y, u.props));
	var v = W(),
		w = d(v);
	{
		var r = (l) => {
			var o = W(),
				a = d(o);
			{
				var g = (s) => {
						var c = W(),
							B = d(c);
						{
							let L = I(() => ({ props: A(k(n)), ...u.snippetProps }));
							E(
								B,
								() => e.child,
								() => k(L)
							);
						}
						t(s, c);
					},
					i = (s) => {
						var c = ke();
						ne(c, (L) => ({ ...L }), [() => A(k(n))]);
						var B = G(c);
						(E(
							B,
							() => e.children ?? q,
							() => u.snippetProps
						),
							t(s, c));
					};
				X(a, (s) => {
					e.child ? s(g) : s(i, !1);
				});
			}
			t(l, o);
		};
		X(w, (l) => {
			(u.shouldRender || m()) && l(r);
		});
	}
	(t(T, v), J());
}
var Be = h('<button><!></button>');
function Fe(T, e) {
	const x = se();
	H(e, !0);
	let P = b(e, 'id', 19, () => ie(x)),
		m = b(e, 'ref', 15, null),
		C = b(e, 'disabled', 3, !1),
		y = Y(e, ['$$slots', '$$events', '$$legacy', 'id', 'ref', 'children', 'child', 'disabled']);
	const u = he.create({
			id: O(() => P()),
			ref: O(
				() => m(),
				(o) => m(o)
			),
			disabled: O(() => !!C())
		}),
		n = I(() => A(y, u.props));
	var v = W(),
		w = d(v);
	{
		var r = (o) => {
				var a = W(),
					g = d(a);
				(E(
					g,
					() => e.child,
					() => ({ props: k(n) })
				),
					t(o, a));
			},
			l = (o) => {
				var a = Be();
				ne(a, () => ({ ...k(n) }));
				var g = G(a);
				(E(g, () => e.children ?? q), t(o, a));
			};
		X(w, (o) => {
			e.child ? o(r) : o(l, !1);
		});
	}
	(t(T, v), J());
}
var Oe = h('<button><!></button>');
function We(T, e) {
	const x = se();
	H(e, !0);
	let P = b(e, 'id', 19, () => ie(x)),
		m = b(e, 'ref', 15, null),
		C = b(e, 'disabled', 3, !1),
		y = Y(e, ['$$slots', '$$events', '$$legacy', 'children', 'child', 'id', 'ref', 'disabled']);
	const u = be.create({
			variant: O(() => 'close'),
			id: O(() => P()),
			ref: O(
				() => m(),
				(o) => m(o)
			),
			disabled: O(() => !!C())
		}),
		n = I(() => A(y, u.props));
	var v = W(),
		w = d(v);
	{
		var r = (o) => {
				var a = W(),
					g = d(a);
				(E(
					g,
					() => e.child,
					() => ({ props: k(n) })
				),
					t(o, a));
			},
			l = (o) => {
				var a = Oe();
				ne(a, () => ({ ...k(n) }));
				var g = G(a);
				(E(g, () => e.children ?? q), t(o, a));
			};
		X(w, (o) => {
			e.child ? o(r) : o(l, !1);
		});
	}
	(t(T, v), J());
}
const Q = xe,
	ee = Fe,
	K = We,
	te = ye,
	ae = Pe,
	oe = we,
	re = Te;
function U(T, e) {
	H(e, !0);
	let x = b(e, 'variant', 3, 'default'),
		P = b(e, 'responsive', 3, !0),
		m = b(e, 'class', 3, ''),
		C = Y(e, ['$$slots', '$$events', '$$legacy', 'variant', 'responsive', 'children', 'class']),
		y = ge(!1);
	ve(() => {
		const r = () => {
			ue(y, window.innerWidth < 640);
		};
		return (
			r(),
			window.addEventListener('resize', r),
			() => {
				window.removeEventListener('resize', r);
			}
		);
	});
	const u = I(() => x() === 'fullscreen' || (P() && k(y))),
		n = () =>
			k(u)
				? `fixed inset-0 z-50 w-full h-full rounded-dialog-fullscreen overflow-y-auto bg-elevated border border-base shadow-card-hover p-modal ${m()}`
				: `fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(100%,90vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-dialog ${x() === 'wide' ? 'max-w-dialog-wide' : 'max-w-dialog-default'} bg-elevated border border-base shadow-card-hover p-modal ${m()}`;
	var v = W(),
		w = d(v);
	{
		let r = I(n);
		fe(
			w,
			() => Ce,
			(l, o) => {
				o(
					l,
					pe(
						{
							get class() {
								return k(r);
							}
						},
						() => C,
						{
							children: (a, g) => {
								var i = W(),
									s = d(i);
								(E(s, () => e.children), t(a, i));
							},
							$$slots: { default: !0 }
						}
					)
				);
			}
		);
	}
	(t(T, v), J());
}
U.__docgen = {
	data: [
		{
			name: 'variant',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'default', text: '"default"' },
					{ kind: 'const', type: 'string', value: 'wide', text: '"wide"' },
					{ kind: 'const', type: 'string', value: 'fullscreen', text: '"fullscreen"' }
				],
				text: '"default" | "wide" | "fullscreen"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"default"'
		},
		{
			name: 'responsive',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'boolean', text: 'boolean' },
			static: !1,
			readonly: !1,
			defaultValue: 'true'
		},
		{
			name: 'children',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'function', text: 'Snippet<[]>' },
			static: !1,
			readonly: !1
		},
		{
			name: 'class',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		}
	],
	name: 'Dialog.svelte'
};
const ze = {
		component: Q,
		title: 'Design System/Organisms/Dialog',
		tags: ['autodocs'],
		argTypes: {
			variant: { control: { type: 'select' }, options: ['default', 'wide', 'fullscreen'] }
		}
	},
	{ Story: le } = $e();
var Se = h(
		'<!> <!> <p class="text-primary">Dialog content</p> <div class="flex gap-2 mt-4"><!> <!></div>',
		1
	),
	Re = h('<!> <!>', 1),
	Me = h('<!> <!>', 1),
	Ee = h(
		'<!> <!> <p class="text-primary">More content here...</p> <div class="flex gap-2 mt-4"><!></div>',
		1
	),
	Le = h('<!> <!>', 1),
	Ve = h('<!> <!>', 1),
	qe = h(
		'<!> <!> <p class="text-primary">Fullscreen content...</p> <div class="flex gap-2 mt-4"><!></div>',
		1
	),
	Ge = h('<!> <!>', 1),
	Ie = h('<!> <!>', 1),
	Ne = h('<!> <!> <!>', 1);
function ce(T, e) {
	(H(e, !1), _e());
	var x = Ne(),
		P = d(x);
	le(P, {
		name: 'Default',
		args: { open: !1, variant: 'default' },
		template: (u, n = q) => {
			Q(u, {
				get open() {
					return n().open;
				},
				children: (v, w) => {
					var r = Me(),
						l = d(r);
					ee(l, {
						children: (a, g) => {
							M(a, {
								children: (i, s) => {
									var c = D('Open Dialog');
									t(i, c);
								},
								$$slots: { default: !0 }
							});
						},
						$$slots: { default: !0 }
					});
					var o = p(l, 2);
					(oe(o, {
						children: (a, g) => {
							var i = Re(),
								s = d(i);
							re(s, { class: 'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm' });
							var c = p(s, 2);
							(U(c, {
								get variant() {
									return n().variant;
								},
								children: (B, L) => {
									var z = Se(),
										S = d(z);
									te(S, {
										children: ($, f) => {
											var F = D('Dialog Title');
											t($, F);
										},
										$$slots: { default: !0 }
									});
									var R = p(S, 2);
									ae(R, {
										children: ($, f) => {
											var F = D('Dialog description goes here.');
											t($, F);
										},
										$$slots: { default: !0 }
									});
									var N = p(R, 4),
										V = G(N);
									K(V, {
										children: ($, f) => {
											M($, {
												variant: 'outline',
												children: (F, j) => {
													var Z = D('Cancel');
													t(F, Z);
												},
												$$slots: { default: !0 }
											});
										},
										$$slots: { default: !0 }
									});
									var _ = p(V, 2);
									(K(_, {
										children: ($, f) => {
											M($, {
												children: (F, j) => {
													var Z = D('Confirm');
													t(F, Z);
												},
												$$slots: { default: !0 }
											});
										},
										$$slots: { default: !0 }
									}),
										t(B, z));
								},
								$$slots: { default: !0 }
							}),
								t(a, i));
						},
						$$slots: { default: !0 }
					}),
						t(v, r));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Dialog.Root open={args.open}>
	<Dialog.Trigger>
		<Button>Open Dialog</Button>
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
		<DialogContent variant={args.variant}>
			<Dialog.Title>Dialog Title</Dialog.Title>
			<Dialog.Description>Dialog description goes here.</Dialog.Description>
			<p class="text-primary">Dialog content</p>
			<div class="flex gap-2 mt-4">
				<Dialog.Close>
					<Button variant="outline">Cancel</Button>
				</Dialog.Close>
				<Dialog.Close>
					<Button>Confirm</Button>
				</Dialog.Close>
			</div>
		</DialogContent>
	</Dialog.Portal>
</Dialog.Root>`
			}
		}
	});
	var m = p(P, 2);
	le(m, {
		name: 'Wide',
		args: { open: !1, variant: 'wide' },
		template: (u, n = q) => {
			Q(u, {
				get open() {
					return n().open;
				},
				children: (v, w) => {
					var r = Ve(),
						l = d(r);
					ee(l, {
						children: (a, g) => {
							M(a, {
								children: (i, s) => {
									var c = D('Open Wide Dialog');
									t(i, c);
								},
								$$slots: { default: !0 }
							});
						},
						$$slots: { default: !0 }
					});
					var o = p(l, 2);
					(oe(o, {
						children: (a, g) => {
							var i = Le(),
								s = d(i);
							re(s, { class: 'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm' });
							var c = p(s, 2);
							(U(c, {
								get variant() {
									return n().variant;
								},
								children: (B, L) => {
									var z = Ee(),
										S = d(z);
									te(S, {
										children: (_, $) => {
											var f = D('Wide Dialog');
											t(_, f);
										},
										$$slots: { default: !0 }
									});
									var R = p(S, 2);
									ae(R, {
										children: (_, $) => {
											var f = D('This is a wide dialog variant.');
											t(_, f);
										},
										$$slots: { default: !0 }
									});
									var N = p(R, 4),
										V = G(N);
									(K(V, {
										children: (_, $) => {
											M(_, {
												children: (f, F) => {
													var j = D('Close');
													t(f, j);
												},
												$$slots: { default: !0 }
											});
										},
										$$slots: { default: !0 }
									}),
										t(B, z));
								},
								$$slots: { default: !0 }
							}),
								t(a, i));
						},
						$$slots: { default: !0 }
					}),
						t(v, r));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Dialog.Root open={args.open}>
	<Dialog.Trigger>
		<Button>Open Wide Dialog</Button>
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
		<DialogContent variant={args.variant}>
			<Dialog.Title>Wide Dialog</Dialog.Title>
			<Dialog.Description>This is a wide dialog variant.</Dialog.Description>
			<p class="text-primary">More content here...</p>
			<div class="flex gap-2 mt-4">
				<Dialog.Close>
					<Button>Close</Button>
				</Dialog.Close>
			</div>
		</DialogContent>
	</Dialog.Portal>
</Dialog.Root>`
			}
		}
	});
	var C = p(m, 2);
	(le(C, {
		name: 'Fullscreen',
		args: { open: !1, variant: 'fullscreen' },
		template: (u, n = q) => {
			Q(u, {
				get open() {
					return n().open;
				},
				children: (v, w) => {
					var r = Ie(),
						l = d(r);
					ee(l, {
						children: (a, g) => {
							M(a, {
								children: (i, s) => {
									var c = D('Open Fullscreen Dialog');
									t(i, c);
								},
								$$slots: { default: !0 }
							});
						},
						$$slots: { default: !0 }
					});
					var o = p(l, 2);
					(oe(o, {
						children: (a, g) => {
							var i = Ge(),
								s = d(i);
							re(s, { class: 'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm' });
							var c = p(s, 2);
							(U(c, {
								get variant() {
									return n().variant;
								},
								children: (B, L) => {
									var z = qe(),
										S = d(z);
									te(S, {
										children: (_, $) => {
											var f = D('Fullscreen Dialog');
											t(_, f);
										},
										$$slots: { default: !0 }
									});
									var R = p(S, 2);
									ae(R, {
										children: (_, $) => {
											var f = D('This is a fullscreen dialog variant.');
											t(_, f);
										},
										$$slots: { default: !0 }
									});
									var N = p(R, 4),
										V = G(N);
									(K(V, {
										children: (_, $) => {
											M(_, {
												children: (f, F) => {
													var j = D('Close');
													t(f, j);
												},
												$$slots: { default: !0 }
											});
										},
										$$slots: { default: !0 }
									}),
										t(B, z));
								},
								$$slots: { default: !0 }
							}),
								t(a, i));
						},
						$$slots: { default: !0 }
					}),
						t(v, r));
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<Dialog.Root open={args.open}>
	<Dialog.Trigger>
		<Button>Open Fullscreen Dialog</Button>
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
		<DialogContent variant={args.variant}>
			<Dialog.Title>Fullscreen Dialog</Dialog.Title>
			<Dialog.Description>This is a fullscreen dialog variant.</Dialog.Description>
			<p class="text-primary">Fullscreen content...</p>
			<div class="flex gap-2 mt-4">
				<Dialog.Close>
					<Button>Close</Button>
				</Dialog.Close>
			</div>
		</DialogContent>
	</Dialog.Portal>
</Dialog.Root>`
			}
		}
	}),
		t(T, x),
		J());
}
ce.__docgen = { data: [], name: 'Dialog.stories.svelte' };
const de = me(ce, ze),
	ut = ['Default', 'Wide', 'Fullscreen'],
	gt = { ...de.Default, tags: ['svelte-csf-v5'] },
	ft = { ...de.Wide, tags: ['svelte-csf-v5'] },
	pt = { ...de.Fullscreen, tags: ['svelte-csf-v5'] };
export { gt as Default, pt as Fullscreen, ft as Wide, ut as __namedExportsOrder, ze as default };
