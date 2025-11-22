import {
	aR as X,
	aB as q,
	G as b,
	aS as A,
	u as G,
	aT as L,
	v as l,
	aU as z,
	aV as H,
	aW as J,
	z as _,
	aC as g,
	x as h,
	y as j,
	ab as p,
	a8 as d,
	p as v,
	F as P,
	a as R,
	a9 as T,
	b as U,
	c as D,
	aX as Z,
	aY as N,
	aG as Q,
	aH as $
} from './iframe-DYn7RqBV.js';
function ve(e = !1) {
	const t = X,
		r = t.l.u;
	if (!r) return;
	let n = () => z(t.s);
	if (e) {
		let s = 0,
			i = {};
		const c = H(() => {
			let o = !1;
			const a = t.s;
			for (const u in a) a[u] !== i[u] && ((i[u] = a[u]), (o = !0));
			return (o && s++, s);
		});
		n = () => l(c);
	}
	(r.b.length &&
		q(() => {
			(w(t, n), A(r.b));
		}),
		b(() => {
			const s = G(() => r.m.map(L));
			return () => {
				for (const i of s) typeof i == 'function' && i();
			};
		}),
		r.a.length &&
			b(() => {
				(w(t, n), A(r.a));
			}));
}
function w(e, t) {
	if (e.l.s) for (const r of e.l.s) l(r);
	t();
}
J();
var K = Object.create,
	F = Object.defineProperty,
	V = Object.getOwnPropertyDescriptor,
	ee = Object.getOwnPropertyNames,
	te = Object.getPrototypeOf,
	re = Object.prototype.hasOwnProperty,
	ne = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports),
	se = (e, t, r, n) => {
		if ((t && typeof t == 'object') || typeof t == 'function')
			for (let s of ee(t))
				!re.call(e, s) &&
					s !== r &&
					F(e, s, { get: () => t[s], enumerable: !(n = V(t, s)) || n.enumerable });
		return e;
	},
	oe = (e, t, r) => (
		(r = e != null ? K(te(e)) : {}),
		se(!e || !e.__esModule ? F(r, 'default', { value: e, enumerable: !0 }) : r, e)
	),
	ae = ne((e) => {
		(Object.defineProperty(e, '__esModule', { value: !0 }),
			(e.isEqual = (function () {
				var t = Object.prototype.toString,
					r = Object.getPrototypeOf,
					n = Object.getOwnPropertySymbols
						? function (s) {
								return Object.keys(s).concat(Object.getOwnPropertySymbols(s));
							}
						: Object.keys;
				return function (s, i) {
					return (function c(o, a, u) {
						var y,
							m,
							f,
							E = t.call(o),
							W = t.call(a);
						if (o === a) return !0;
						if (o == null || a == null) return !1;
						if (u.indexOf(o) > -1 && u.indexOf(a) > -1) return !0;
						if (
							(u.push(o, a),
							E != W ||
								((y = n(o)),
								(m = n(a)),
								y.length != m.length ||
									y.some(function (C) {
										return !c(o[C], a[C], u);
									})))
						)
							return !1;
						switch (E.slice(8, -1)) {
							case 'Symbol':
								return o.valueOf() == a.valueOf();
							case 'Date':
							case 'Number':
								return +o == +a || (+o != +o && +a != +a);
							case 'RegExp':
							case 'Function':
							case 'String':
							case 'Boolean':
								return '' + o == '' + a;
							case 'Set':
							case 'Map':
								((y = o.entries()), (m = a.entries()));
								do if (!c((f = y.next()).value, m.next().value, u)) return !1;
								while (!f.done);
								return !0;
							case 'ArrayBuffer':
								((o = new Uint8Array(o)), (a = new Uint8Array(a)));
							case 'DataView':
								((o = new Uint8Array(o.buffer)), (a = new Uint8Array(a.buffer)));
							case 'Float32Array':
							case 'Float64Array':
							case 'Int8Array':
							case 'Int16Array':
							case 'Int32Array':
							case 'Uint8Array':
							case 'Uint16Array':
							case 'Uint32Array':
							case 'Uint8ClampedArray':
							case 'Arguments':
							case 'Array':
								if (o.length != a.length) return !1;
								for (f = 0; f < o.length; f++)
									if ((f in o || f in a) && (f in o != f in a || !c(o[f], a[f], u))) return !1;
								return !0;
							case 'Object':
								return c(r(o), r(a), u);
							default:
								return !1;
						}
					})(s, i, []);
				};
			})()));
	});
oe(ae());
var ie = (e) =>
	e
		.toLowerCase()
		.replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '-')
		.replace(/-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
const ce = (e) =>
		e
			.split('-')
			.map((t) => t.charAt(0).toUpperCase() + t.slice(1))
			.join(''),
	ue = (e) => ie(e.replace(/([A-Z])/g, ' $1').trim()),
	fe = (e) => ce(ue(e)),
	x = 'storybook-stories-extractor-context';
function I(e) {
	let t = g(e.isExtracting),
		r = g(e.register);
	return {
		get isExtracting() {
			return t;
		},
		get register() {
			return r;
		}
	};
}
function le(e) {
	const { stories: t } = e,
		r = I({
			isExtracting: !0,
			register: (n) => {
				t.set(n.exportName ?? fe(n.name), n);
			}
		});
	_(x, r);
}
function Pe() {
	return (h(x) || _(x, I({ isExtracting: !1, register: () => {} })), j(x));
}
const S = 'storybook-story-renderer-context';
function ge(e) {
	let t = p(g(e.currentStoryExportName)),
		r = p(g(e.args)),
		n = p(g(e.storyContext)),
		s = p(g(e.metaRenderSnippet));
	function i(c) {
		(d(t, c.currentStoryExportName, !0),
			d(r, c.args, !0),
			d(n, c.storyContext, !0),
			d(s, c.metaRenderSnippet, !0));
	}
	return {
		get args() {
			return l(r);
		},
		get storyContext() {
			return l(n);
		},
		get currentStoryExportName() {
			return l(t);
		},
		get metaRenderSnippet() {
			return l(s);
		},
		set: i
	};
}
function ye() {
	const e = ge({ currentStoryExportName: void 0, args: {}, storyContext: {} });
	_(S, e);
}
function me() {
	return (h(S) || ye(), j(S));
}
function pe(e, t) {
	(v(t, !0), le(t.repository()));
	var r = P(),
		n = R(r);
	(T(
		n,
		() => t.Stories,
		(s, i) => {
			i(s, {});
		}
	),
		U(e, r),
		D());
}
function O(e) {
	return e === '__proto__';
}
function de(e) {
	switch (typeof e) {
		case 'number':
		case 'symbol':
			return !1;
		case 'string':
			return e.includes('.') || e.includes('[') || e.includes(']');
	}
}
function M(e) {
	return typeof e == 'string' || typeof e == 'symbol'
		? e
		: Object.is(e?.valueOf?.(), -0)
			? '-0'
			: String(e);
}
function k(e) {
	if (e == null) return '';
	if (typeof e == 'string') return e;
	if (Array.isArray(e)) return e.map(k).join(',');
	const t = String(e);
	return t === '0' && Object.is(Number(e), -0) ? '-0' : t;
}
function xe(e) {
	if (Array.isArray(e)) return e.map(M);
	if (typeof e == 'symbol') return [e];
	e = k(e);
	const t = [],
		r = e.length;
	if (r === 0) return t;
	let n = 0,
		s = '',
		i = '',
		c = !1;
	for (e.charCodeAt(0) === 46 && (t.push(''), n++); n < r; ) {
		const o = e[n];
		(i
			? o === '\\' && n + 1 < r
				? (n++, (s += e[n]))
				: o === i
					? (i = '')
					: (s += o)
			: c
				? o === '"' || o === "'"
					? (i = o)
					: o === ']'
						? ((c = !1), t.push(s), (s = ''))
						: (s += o)
				: o === '['
					? ((c = !0), s && (t.push(s), (s = '')))
					: o === '.'
						? s && (t.push(s), (s = ''))
						: (s += o),
			n++);
	}
	return (s && t.push(s), t);
}
function B(e, t, r) {
	if (e == null) return r;
	switch (typeof t) {
		case 'string': {
			if (O(t)) return r;
			const n = e[t];
			return n === void 0 ? (de(t) ? B(e, xe(t), r) : r) : n;
		}
		case 'number':
		case 'symbol': {
			typeof t == 'number' && (t = M(t));
			const n = e[t];
			return n === void 0 ? r : n;
		}
		default: {
			if (Array.isArray(t)) return be(e, t, r);
			if ((Object.is(t?.valueOf(), -0) ? (t = '-0') : (t = String(t)), O(t))) return r;
			const n = e[t];
			return n === void 0 ? r : n;
		}
	}
}
function be(e, t, r) {
	if (t.length === 0) return r;
	let n = e;
	for (let s = 0; s < t.length; s++) {
		if (n == null || O(t[s])) return r;
		n = n[t[s]];
	}
	return n === void 0 ? r : n;
}
const { addons: Se } = __STORYBOOK_MODULE_PREVIEW_API__,
	Oe = Se.getChannel(),
	_e = (e) => {
		const { storyContext: t } = e;
		if (Ee(t)) return;
		const r = Ce({ code: t.parameters.__svelteCsf.rawCode, args: e.args });
		setTimeout(() => {
			Oe.emit(Z, { id: t.id, args: t.unmappedArgs, source: r });
		});
	},
	Ee = (e) => {
		const t = e?.parameters.docs?.source,
			r = e?.parameters.__isArgsStory;
		return e?.parameters.__svelteCsf?.rawCode
			? t?.type === N.DYNAMIC
				? !1
				: !r || t?.code || t?.type === N.CODE
			: !0;
	},
	Ce = ({ code: e, args: t }) => {
		const r = Object.entries(t ?? {})
			.map(([i, c]) => Ne(i, c))
			.filter((i) => i);
		let n = r.join(' ');
		return (
			n.length > 50 &&
				(n = `
  ${r.join(`
  `)}
`),
			e.replaceAll('{...args}', n).replace(/args(?:[\w\d_$.?[\]"'])+/g, (i) => {
				const c = i.replaceAll('?', ''),
					o = B({ args: t }, c);
				return Y(o);
			})
		);
	},
	Ae = (e) => {
		const t = e.getMockName?.() ?? e.name;
		return t && t !== 'spy' ? t : '() => {}';
	},
	Y = (e) =>
		typeof e == 'object' && e[Symbol.for('svelte.snippet')]
			? 'snippet'
			: typeof e == 'function'
				? Ae(e)
				: JSON.stringify(e, null, 1)
						?.replace(/\n/g, '')
						.replace(new RegExp('(?<!\\s)([}\\]])$'), ' $1'),
	Ne = (e, t) => {
		if (t == null) return null;
		if (t === !0) return e;
		const r = Y(t);
		return typeof t == 'string' ? `${e}=${r}` : `${e}={${r}}`;
	};
function we(e, t) {
	v(t, !0);
	const r = me();
	(b(() => {
		r.set({
			currentStoryExportName: t.exportName,
			args: t.args,
			storyContext: t.storyContext,
			metaRenderSnippet: t.metaRenderSnippet
		});
	}),
		b(() => {
			_e({ args: t.args, storyContext: t.storyContext });
		}));
	var n = P(),
		s = R(n);
	(T(
		s,
		() => t.Stories,
		(i, c) => {
			c(i, {});
		}
	),
		U(e, n),
		D());
}
const he = document.createDocumentFragment
		? () => document.createDocumentFragment()
		: () => document.createElement('div'),
	Re = (e, t) => {
		const r = { stories: new Map() };
		try {
			const s = Q(pe, { target: he(), props: { Stories: e, repository: () => r } });
			$(s);
		} catch (s) {
			console.error(`Error in mounting stories ${s.toString()}`, s);
		}
		const n = {};
		for (const [s, i] of r.stories) {
			const c = {
					...i,
					render: (a, u) => ({
						Component: we,
						props: {
							exportName: s,
							Stories: e,
							storyContext: u,
							args: a,
							metaRenderSnippet: t.render
						}
					})
				},
				o = t.play ?? i.play;
			(o &&
				(c.play = (a) => {
					const u = a.playFunction?.__play;
					return u ? u(a) : o(a);
				}),
				(n[s] = c));
		}
		return (
			t.parameters || (t.parameters = {}),
			t.parameters.controls || (t.parameters.controls = {}),
			(t.parameters.controls.disableSaveFromUI = !0),
			n
		);
	};
export { me as a, Re as c, ve as i, fe as s, Pe as u };
