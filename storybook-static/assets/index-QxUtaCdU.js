import {
	p as Y,
	h as Z,
	o as $,
	G as ee,
	v as R,
	w as j,
	F as i,
	a as o,
	m as _,
	b as t,
	c as ae,
	k as p,
	f as T,
	s as I,
	a9 as M,
	d as X
} from './iframe-DYn7RqBV.js';
import { s as te, u as re, a as ne } from './create-runtime-stories-2rm03jka.js';
const oe = 'svelte-csf',
	se = `${oe}-v4`;
var ie = T(' <!>', 1),
	fe = T(' <!>', 1),
	le = T(
		'<p>No story rendered. See <a href="https://github.com/storybookjs/addon-svelte-csf#defining-stories" target="_blank">the docs</a> on how to define stories.</p>'
	);
function ve(w, e) {
	Y(e, !0);
	let q = Z(e, 'asChild', 3, !1),
		z = $(e, [
			'$$slots',
			'$$events',
			'$$legacy',
			'children',
			'name',
			'exportName',
			'play',
			'template',
			'asChild'
		]);
	const G = e.exportName ?? te(e.name);
	let h = re(),
		a = ne(),
		L = j(() => !h.isExtracting && a.currentStoryExportName === G);
	h.isExtracting &&
		h.register({ children: e.children, name: e.name, exportName: G, play: e.play, ...z });
	function B(f, g) {
		g && f.playFunction && (f.playFunction.__play = g);
	}
	function P(f) {
		return typeof f == 'function';
	}
	ee(() => {
		R(L) && B(a.storyContext, e.play);
	});
	const D = j(() => a.storyContext.tags?.some((f) => f === se) ?? !1);
	var A = i(),
		H = o(A);
	{
		var J = (f) => {
			var g = i(),
				K = o(g);
			{
				var O = (c) => {
						var u = i(),
							x = o(u);
						(p(
							x,
							() => e.template,
							() => a.args,
							() => a.storyContext
						),
							t(c, u));
					},
					Q = (c) => {
						var u = i(),
							x = o(u);
						{
							var U = (d) => {
									var y = i(),
										S = o(y);
									{
										var C = (r) => {
												var s = i(),
													v = o(s);
												(p(v, () => e.children), t(r, s));
											},
											E = (r) => {
												var s = i(),
													v = o(s);
												{
													var F = (n) => {
															var l = ie(),
																m = o(l);
															m.nodeValue = ' ';
															var b = I(m);
															(M(
																b,
																() => a.storyContext.component,
																(V, k) => {
																	k(
																		V,
																		X(() => a.args, {
																			get children() {
																				return e.children;
																			}
																		})
																	);
																}
															),
																t(n, l));
														},
														N = (n) => {
															var l = i(),
																m = o(l);
															(p(m, () => e.children), t(n, l));
														};
													_(
														v,
														(n) => {
															a.storyContext.component ? n(F) : n(N, !1);
														},
														!0
													);
												}
												t(r, s);
											};
										_(S, (r) => {
											q() || R(D) ? r(C) : r(E, !1);
										});
									}
									t(d, y);
								},
								W = (d) => {
									var y = i(),
										S = o(y);
									{
										var C = (r) => {
												var s = i(),
													v = o(s);
												(p(
													v,
													() => a.metaRenderSnippet,
													() => a.args,
													() => a.storyContext
												),
													t(r, s));
											},
											E = (r) => {
												var s = i(),
													v = o(s);
												{
													var F = (n) => {
															var l = fe(),
																m = o(l);
															m.nodeValue = ' ';
															var b = I(m);
															(M(
																b,
																() => a.storyContext.component,
																(V, k) => {
																	k(
																		V,
																		X(() => a.args)
																	);
																}
															),
																t(n, l));
														},
														N = (n) => {
															var l = le();
															t(n, l);
														};
													_(
														v,
														(n) => {
															a.storyContext.component ? n(F) : n(N, !1);
														},
														!0
													);
												}
												t(r, s);
											};
										_(
											S,
											(r) => {
												a.metaRenderSnippet ? r(C) : r(E, !1);
											},
											!0
										);
									}
									t(d, y);
								};
							_(
								x,
								(d) => {
									P(e.children) ? d(U) : d(W, !1);
								},
								!0
							);
						}
						t(c, u);
					};
				_(K, (c) => {
					P(e.template) ? c(O) : c(Q, !1);
				});
			}
			t(f, g);
		};
		_(H, (f) => {
			R(L) && f(J);
		});
	}
	(t(w, A), ae());
}
function ce(w) {
	return { Story: ve };
}
export { ce as d };
