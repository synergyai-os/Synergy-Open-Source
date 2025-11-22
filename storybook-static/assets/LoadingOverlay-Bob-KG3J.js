import {
	a7 as W,
	aJ as Q,
	au as H,
	aK as X,
	aL as Z,
	l as $,
	u as tt,
	aM as et,
	aN as at,
	aO as it,
	aP as Y,
	aQ as rt,
	q as st,
	n as C,
	p as nt,
	h as N,
	aB as ot,
	G as j,
	ab as F,
	aC as ct,
	F as lt,
	a as ut,
	m as ft,
	b as G,
	c as dt,
	v as i,
	w as I,
	a8 as S,
	f as gt,
	s as P,
	e as O,
	i as pt,
	j as q
} from './iframe-DYn7RqBV.js';
const vt = () => performance.now(),
	b = { tick: (e) => requestAnimationFrame(e), now: () => vt(), tasks: new Set() };
function B() {
	const e = b.now();
	(b.tasks.forEach((t) => {
		t.c(e) || (b.tasks.delete(t), t.f());
	}),
		b.tasks.size !== 0 && b.tick(B));
}
function yt(e) {
	let t;
	return (
		b.tasks.size === 0 && b.tick(B),
		{
			promise: new Promise((n) => {
				b.tasks.add((t = { c: e, f: n }));
			}),
			abort() {
				b.tasks.delete(t);
			}
		}
	);
}
function R(e, t) {
	Y(() => {
		e.dispatchEvent(new CustomEvent(t));
	});
}
function wt(e) {
	if (e === 'float') return 'cssFloat';
	if (e === 'offset') return 'cssOffset';
	if (e.startsWith('--')) return e;
	const t = e.split('-');
	return t.length === 1
		? t[0]
		: t[0] +
				t
					.slice(1)
					.map((n) => n[0].toUpperCase() + n.slice(1))
					.join('');
}
function z(e) {
	const t = {},
		n = e.split(';');
	for (const r of n) {
		const [o, s] = r.split(':');
		if (!o || s === void 0) break;
		const u = wt(o.trim());
		t[u] = s.trim();
	}
	return t;
}
const kt = (e) => e;
function D(e, t, n, r) {
	var o = (e & at) !== 0,
		s = (e & it) !== 0,
		u = o && s,
		v = (e & et) !== 0,
		E = u ? 'both' : o ? 'in' : 'out',
		p,
		y = t.inert,
		_ = t.style.overflow,
		g,
		l;
	function k() {
		return Y(() => (p ??= n()(t, r?.() ?? {}, { direction: E })));
	}
	var c = {
			is_global: v,
			in() {
				if (((t.inert = y), !o)) {
					(l?.abort(), l?.reset?.());
					return;
				}
				(s || g?.abort(),
					R(t, 'introstart'),
					(g = V(t, k(), l, 1, () => {
						(R(t, 'introend'), g?.abort(), (g = p = void 0), (t.style.overflow = _));
					})));
			},
			out(T) {
				if (!s) {
					(T?.(), (p = void 0));
					return;
				}
				((t.inert = !0),
					R(t, 'outrostart'),
					(l = V(t, k(), g, 0, () => {
						(R(t, 'outroend'), T?.());
					})));
			},
			stop: () => {
				(g?.abort(), l?.abort());
			}
		},
		f = W;
	if (((f.transitions ??= []).push(c), o && Q)) {
		var h = v;
		if (!h) {
			for (var d = f.parent; d && (d.f & H) !== 0; ) for (; (d = d.parent) && (d.f & X) === 0; );
			h = !d || (d.f & Z) !== 0;
		}
		h &&
			$(() => {
				tt(() => c.in());
			});
	}
}
function V(e, t, n, r, o) {
	var s = r === 1;
	if (rt(t)) {
		var u,
			v = !1;
		return (
			st(() => {
				if (!v) {
					var f = t({ direction: s ? 'in' : 'out' });
					u = V(e, f, n, r, o);
				}
			}),
			{
				abort: () => {
					((v = !0), u?.abort());
				},
				deactivate: () => u.deactivate(),
				reset: () => u.reset(),
				t: () => u.t()
			}
		);
	}
	if ((n?.deactivate(), !t?.duration))
		return (o(), { abort: C, deactivate: C, reset: C, t: () => r });
	const { delay: E = 0, css: p, tick: y, easing: _ = kt } = t;
	var g = [];
	if (s && n === void 0 && (y && y(0, 1), p)) {
		var l = z(p(0, 1));
		g.push(l, l);
	}
	var k = () => 1 - r,
		c = e.animate(g, { duration: E, fill: 'forwards' });
	return (
		(c.onfinish = () => {
			c.cancel();
			var f = n?.t() ?? 1 - r;
			n?.abort();
			var h = r - f,
				d = t.duration * Math.abs(h),
				T = [];
			if (d > 0) {
				var a = !1;
				if (p)
					for (var m = Math.ceil(d / 16.666666666666668), L = 0; L <= m; L += 1) {
						var w = f + h * _(L / m),
							A = z(p(w, 1 - w));
						(T.push(A), (a ||= A.overflow === 'hidden'));
					}
				(a && (e.style.overflow = 'hidden'),
					(k = () => {
						var x = c.currentTime;
						return f + h * _(x / d);
					}),
					y &&
						yt(() => {
							if (c.playState !== 'running') return !1;
							var x = k();
							return (y(x, 1 - x), !0);
						}));
			}
			((c = e.animate(T, { duration: d, fill: 'forwards' })),
				(c.onfinish = () => {
					((k = () => r), y?.(r, 1 - r), o());
				}));
		}),
		{
			abort: () => {
				c && (c.cancel(), (c.effect = null), (c.onfinish = C));
			},
			deactivate: () => {
				o = C;
			},
			reset: () => {
				r === 0 && y?.(1, 0);
			},
			t: () => k()
		}
	);
}
const ht = (e) => e;
function M(e, { delay: t = 0, duration: n = 400, easing: r = ht } = {}) {
	const o = +getComputedStyle(e).opacity;
	return { delay: t, duration: n, easing: r, css: (s) => `opacity: ${s * o}` };
}
var mt = gt(
	'<div class="via-base fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-accent-primary/10 to-accent-primary/5 backdrop-blur-xl"><div class="flex flex-col items-center gap-content-section"><div class="relative size-avatar-lg"><div class="absolute inset-0 animate-spin rounded-avatar border-4 border-border-base border-t-accent-primary svelte-17ssqbh"></div></div> <div class="max-w-md text-center"><h2 class="text-h1 font-semibold text-primary"> </h2></div> <div class="text-center"><p class="text-button text-secondary"> </p></div></div></div>'
);
function bt(e, t) {
	nt(t, !0);
	let n = N(t, 'show', 3, !1),
		r = N(t, 'flow', 3, 'custom'),
		o = N(t, 'title', 3, ''),
		s = N(t, 'subtitle', 3, ''),
		u = N(t, 'customStages', 19, () => []),
		v = F(0);
	const E = {
			'account-registration': {
				title: (a) => `Setting up ${a}'s account`,
				stages: ['Creating your account', 'Setting up your workspace', 'Almost ready...']
			},
			'account-linking': {
				title: (a) => `Linking ${a} to SynergyOS`,
				stages: ['Authenticating account', 'Linking accounts', 'Preparing workspace']
			},
			'workspace-creation': {
				title: (a) => `Creating ${a}`,
				stages: ['Setting up workspace', 'Configuring permissions', 'Preparing workspace']
			},
			'workspace-switching': {
				title: (a) =>
					a === 'account'
						? 'Switching account'
						: a === 'workspace'
							? 'Loading workspace'
							: `Loading ${a}`,
				stages: []
			},
			'workspace-joining': {
				title: (a) => `Joining ${a}`,
				stages: ['Validating invite', 'Setting up permissions', 'Preparing workspace']
			},
			onboarding: {
				title: (a) => `Welcome to SynergyOS, ${a}!`,
				stages: ['Setting up your workspace', 'Loading workspace context', 'Almost ready...']
			},
			custom: { title: (a) => o() || 'Loading...', stages: u().length > 0 ? u() : ['Loading...'] }
		},
		p = I(() => E[r()]),
		y = I(() => {
			const a = o() || i(p).title(s() || 'workspace');
			return (
				console.log('📝 [LOADING OVERLAY] Computing displayTitle', {
					flow: r(),
					title: o(),
					subtitle: s(),
					subtitleType: typeof s(),
					subtitleLength: s()?.length,
					computedTitle: a,
					configTitleFn: i(p).title.toString()
				}),
				a
			);
		});
	let _ = F(void 0),
		g = F(void 0);
	const l = I(() =>
		u().length > 0
			? u()
			: r() === 'workspace-switching'
				? s() === 'account'
					? ['Authenticating account', 'Loading account data']
					: ['Gathering workspace data', 'Preparing workspace']
				: i(p).stages
	);
	ot(() => {
		n() && (i(g) !== r() || i(_) !== s()) && (S(v, 0), S(g, r()), S(_, s()));
	});
	const k = I(() => i(l)[Math.min(i(v), i(l).length - 1)]);
	j(() => {
		console.log('🎨 [LOADING OVERLAY] Component state', {
			show: n(),
			flow: r(),
			subtitle: s(),
			displayTitle: i(y),
			currentStageText: i(k)
		});
	});
	let c = F(!1),
		f = F(ct([]));
	j(() => {
		if (!n()) {
			(i(c) && (i(f).forEach(clearTimeout), S(f, [], !0)), S(c, !1));
			return;
		}
		const a = !i(c),
			m = i(_) !== s() || i(g) !== r();
		(a || m) &&
			(i(f).forEach(clearTimeout),
			S(f, [], !0),
			S(c, !0),
			console.log('🔄 [LOADING OVERLAY] Stage progression', {
				flow: r(),
				subtitle: s(),
				stagesCount: i(l).length,
				stages: i(l),
				stageIndex: i(v),
				reason: a ? 'overlay-shown' : 'subtitle-flow-changed'
			}),
			i(l).forEach((L, w) => {
				if (w === 0) return;
				const A = w * 1500,
					x = setTimeout(() => {
						(console.log(`⏭️ [LOADING OVERLAY] Advancing to stage ${w}`, {
							stageText: i(l)[w],
							allStages: i(l),
							currentStage: i(v)
						}),
							S(v, w, !0));
					}, A);
				i(f).push(x);
			}));
	});
	var h = lt(),
		d = ut(h);
	{
		var T = (a) => {
			var m = mt(),
				L = O(m),
				w = P(O(L), 2),
				A = O(w),
				x = O(A),
				J = P(w, 2),
				K = O(J),
				U = O(K);
			(pt(() => {
				(q(x, i(y)), q(U, i(k)));
			}),
				D(
					1,
					m,
					() => M,
					() => ({ duration: 0 })
				),
				D(
					2,
					m,
					() => M,
					() => ({ duration: 300 })
				),
				G(a, m));
		};
		ft(d, (a) => {
			n() && a(T);
		});
	}
	(G(e, h), dt());
}
bt.__docgen = {
	data: [
		{
			name: 'show',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'boolean', text: 'boolean' },
			static: !1,
			readonly: !1,
			defaultValue: 'false'
		},
		{
			name: 'flow',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{
						kind: 'const',
						type: 'string',
						value: 'account-registration',
						text: '"account-registration"'
					},
					{ kind: 'const', type: 'string', value: 'account-linking', text: '"account-linking"' },
					{
						kind: 'const',
						type: 'string',
						value: 'workspace-creation',
						text: '"workspace-creation"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'workspace-switching',
						text: '"workspace-switching"'
					},
					{
						kind: 'const',
						type: 'string',
						value: 'workspace-joining',
						text: '"workspace-joining"'
					},
					{ kind: 'const', type: 'string', value: 'onboarding', text: '"onboarding"' },
					{ kind: 'const', type: 'string', value: 'custom', text: '"custom"' }
				],
				text: '"account-registration" | "account-linking" | "workspace-creation" | "workspace-switching" | "workspace-joining" | "onboarding" | "custom"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '...'
		},
		{
			name: 'title',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1,
			defaultValue: '""'
		},
		{
			name: 'subtitle',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1,
			defaultValue: '""'
		},
		{
			name: 'customStages',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'array', text: 'string[]' },
			static: !1,
			readonly: !1,
			defaultValue: '...'
		}
	],
	name: 'LoadingOverlay.svelte'
};
export { bt as L };
