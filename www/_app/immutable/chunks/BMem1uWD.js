import { am as L, U as S, a1 as y, an as M, j as O, Y as U } from './kOT-I_MI.js';
import { s as N } from './CmDhudRb.js';
const V = Object.prototype.toString,
	Y = (e) => V.call(e) === '[object Error]',
	K = new Set([
		'network error',
		'Failed to fetch',
		'NetworkError when attempting to fetch resource.',
		'The Internet connection appears to be offline.',
		'Network request failed',
		'fetch failed',
		'terminated',
		' A network error occurred.',
		'Network connection lost'
	]);
function P(e) {
	if (!(e && Y(e) && e.name === 'TypeError' && typeof e.message == 'string')) return !1;
	const { message: a, stack: c } = e;
	return a === 'Load failed'
		? c === void 0 || '__sentry_captured__' in e
		: a.startsWith('error sending request for url')
			? !0
			: K.has(a);
}
const R = [500, 2e3],
	j = 100,
	v = '__convexAuthOAuthVerifier',
	x = '__convexAuthJWT',
	_ = '__convexAuthRefreshToken',
	C = '__convexAuthServerStateFetchTime',
	F = '$$_convexAuth';
function Q({
	client: e,
	getServerState: t,
	onChange: a,
	storage: c,
	storageNamespace: k,
	replaceURL: E,
	options: g
}) {
	const o = S({
			token: t?.()._state.token ?? null,
			refreshToken: t?.()._state.refreshToken ?? null,
			isLoading: t?.()._state.token === null,
			isRefreshingToken: !1
		}),
		h = U(() => o.token !== null),
		u = (r) => {
			g?.verbose &&
				(typeof e.logger == 'object'
					? e.logger.logVerbose(r)
					: console.log(`${new Date().toISOString()} ${r}`));
		},
		{ storageSet: m, storageGet: w, storageRemove: T } = q(c, k),
		d = async (r) => {
			const i = o.token !== null;
			let n;
			if (r.tokens === null)
				((o.token = null),
					(o.refreshToken = null),
					r.shouldStore && (await T(_), await T(x)),
					(n = null));
			else {
				const { token: l } = r.tokens;
				if (r.shouldStore) {
					const { refreshToken: s } = r.tokens;
					((o.token = l),
						(o.refreshToken = s),
						await m(x, l),
						await m(_, s),
						t && !o.isRefreshingToken && (await m(C, `${t()._timeFetched}`)));
				}
				n = l;
			}
			(i !== (n !== null) && (await a?.()), (o.isLoading = !1));
		};
	(y(() => {
		const r = async () => {
				if (t?.()._state) {
					const n = await w(C);
					if (!n || t()._timeFetched > +n) {
						const { token: s, refreshToken: f } = t()._state;
						(await m(C, t()._timeFetched.toString()),
							u(
								`Using server state tokens (newer than storage), null? ${s === null || f === null}`
							),
							await d({
								shouldStore: !0,
								tokens: s === null || f === null ? null : { token: s, refreshToken: f }
							}));
					} else (u('Using localStorage tokens (newer than server state)'), await i());
					return;
				}
				await i();
			},
			i = async () => {
				try {
					const [n, l] = await Promise.all([w(x), w(_)]);
					n && l
						? (u('Loaded tokens from storage'), await d({ shouldStore: !1, tokens: { token: n } }))
						: (u('No tokens in storage'), (o.isLoading = !1));
				} catch (n) {
					(console.error('Error loading tokens from storage:', n), (o.isLoading = !1));
				}
			};
		r();
	}),
		y(() => {
			(async () => {
				if (typeof window > 'u') return;
				const i = new URL(window.location.href),
					n = i.searchParams.get('code');
				if (n) {
					(u('found code in URL, removing'),
						i.searchParams.delete('code'),
						await E(i.pathname + i.search + (i.hash ? i.hash : '')));
					const l = await w(v);
					(await T(v), u(`verifying code, have verifier: ${!!l}`));
					try {
						const s = await b({ code: n, verifier: l ?? void 0 });
						if (s.tokens)
							(await d({ shouldStore: !0, tokens: s.tokens }),
								u('signed in with code from URL using tokens object'));
						else {
							(console.error('No valid tokens in auth response:', s), (o.isLoading = !1));
							return;
						}
						u('signed in with code from URL');
					} catch (s) {
						(console.error('Failed to verify code from URL:', s), (o.isLoading = !1));
					}
				}
			})();
		}),
		y(() => {
			if (typeof window > 'u') return;
			const r = (i) => {
				if (i.storageArea === c && i.key === A(x, k)) {
					const n = i.newValue;
					(u(`synced access token, is null: ${n === null}`),
						d({ shouldStore: !1, tokens: n === null ? null : { token: n } }));
				}
			};
			return (
				window.addEventListener('storage', r),
				() => window.removeEventListener('storage', r)
			);
		}),
		y(() => {
			if (typeof window > 'u') return;
			const r = (i) => {
				if (o.isRefreshingToken) {
					i.preventDefault();
					const n = 'Are you sure you want to leave? Your changes may not be saved.';
					return ((i.returnValue = n), n);
				}
			};
			return (
				window.addEventListener('beforeunload', r),
				() => window.removeEventListener('beforeunload', r)
			);
		}));
	const b = async (r) => {
		let i,
			n = 0;
		for (; n < R.length; )
			try {
				return await e.unauthenticatedCall(
					'auth:signIn',
					'code' in r ? { params: { code: r.code }, verifier: r.verifier } : r
				);
			} catch (l) {
				if (((i = l), !P(l))) break;
				const s = R[n] + j * Math.random();
				(n++,
					u(`verifyCode failed with network error, retry ${n} of ${R.length} in ${s}ms`),
					await new Promise((f) => setTimeout(f, s)));
			}
		throw i;
	};
	return {
		get isLoading() {
			return o.isLoading;
		},
		get isAuthenticated() {
			return O(h);
		},
		get token() {
			return o.token;
		},
		fetchAccessToken: async (r) => {
			const { forceRefreshToken: i = !1 } = r ?? {};
			if ((u(`fetchAccessToken forceRefreshToken=${i}`), o.token !== null && !i))
				return (u(`returning existing token, is null: ${o.token === null}`), o.token);
			const n = o.token;
			return await D(_, async () => {
				const l = o.token;
				if (l !== n) return (u(`returning synced token, is null: ${l === null}`), l);
				try {
					o.isRefreshingToken = !0;
					const s = await w(_);
					if (!s)
						return (
							u('no refresh token found in storage'),
							o.token !== null && (await d({ shouldStore: !0, tokens: null })),
							null
						);
					u('using refresh token to get new access token');
					const f = await b({ refreshToken: s });
					return f.tokens
						? (u(`retrieved tokens, is null: ${f.tokens.token === null}`),
							await d({ shouldStore: !0, tokens: f.tokens }),
							f.tokens.token)
						: (u('no tokens in refresh token response, clearing stored tokens'),
							await d({ shouldStore: !0, tokens: null }),
							null);
				} catch (s) {
					return (
						console.error('Failed to refresh token:', s),
						await d({ shouldStore: !0, tokens: null }),
						null
					);
				} finally {
					o.isRefreshingToken = !1;
				}
			});
		},
		signIn: async (r, i) => {
			u(`signIn provider=${r}`);
			try {
				const n = (await w(v)) ?? void 0;
				await T(v);
				const l = i instanceof FormData ? Object.fromEntries(i.entries()) : (i ?? {}),
					s = await e.authenticatedCall('auth:signIn', { provider: r, params: l, verifier: n });
				if (s.redirect !== void 0) {
					const f = new URL(s.redirect);
					return (
						s.verifier && (await m(v, s.verifier)),
						typeof window < 'u' && (window.location.href = f.toString()),
						{ signingIn: !1, redirect: f }
					);
				} else if (s.tokens !== void 0)
					return (
						u(`signed in and got tokens, is null: ${s.tokens === null}`),
						await d({ shouldStore: !0, tokens: s.tokens }),
						{ signingIn: s.tokens !== null }
					);
				return { signingIn: !1 };
			} catch (n) {
				throw (console.error('Failed to sign in:', n), n);
			}
		},
		signOut: async () => {
			u('signOut');
			try {
				await e.authenticatedCall('auth:signOut');
			} catch (r) {
				r instanceof Error && u(`signOut error (ignored): ${r.message}`);
			}
			(u('signed out, erasing tokens'), await d({ shouldStore: !0, tokens: null }));
		}
	};
}
function ee(e) {
	return (M(F, e), e);
}
function te() {
	return L(F);
}
function A(e, t) {
	return `${t}:${e}`;
}
function G() {
	const e = new Map();
	return {
		getItem: (t) => e.get(t) ?? null,
		setItem: (t, a) => {
			e.set(t, a);
		},
		removeItem: (t) => {
			e.delete(t);
		}
	};
}
function q(e, t) {
	const a = e ?? G(),
		c = t.replace(/[^a-zA-Z0-9]/g, '');
	return {
		storageSet: async (o, h) => {
			try {
				await a.setItem(A(o, c), h);
			} catch (u) {
				console.error(`Failed to set ${o} in storage:`, u);
			}
		},
		storageGet: async (o) => {
			try {
				return (await a.getItem(A(o, c))) ?? null;
			} catch (h) {
				return (console.error(`Failed to get ${o} from storage:`, h), null);
			}
		},
		storageRemove: async (o) => {
			try {
				await a.removeItem(A(o, c));
			} catch (h) {
				console.error(`Failed to remove ${o} from storage:`, h);
			}
		}
	};
}
async function D(e, t) {
	if (typeof window > 'u') return t();
	const a = window?.navigator?.locks;
	return a !== void 0 ? await a.request(e, t) : await H(e, t);
}
function p(e) {
	globalThis.__convexAuthMutexes === void 0 && (globalThis.__convexAuthMutexes = {});
	let t = globalThis.__convexAuthMutexes[e];
	return (
		t === void 0 && (globalThis.__convexAuthMutexes[e] = { currentlyRunning: null, waiting: [] }),
		(t = globalThis.__convexAuthMutexes[e]),
		t
	);
}
function $(e, t) {
	globalThis.__convexAuthMutexes[e] = t;
}
async function I(e, t) {
	const a = p(e);
	a.currentlyRunning === null
		? $(e, {
				currentlyRunning: t().finally(() => {
					const c = p(e).waiting.shift();
					((p(e).currentlyRunning = null),
						$(e, { ...p(e), currentlyRunning: c === void 0 ? null : I(e, c) }));
				}),
				waiting: []
			})
		: $(e, { ...a, waiting: [...a.waiting, t] });
}
async function H(e, t) {
	return new Promise((c, k) => {
		I(e, () =>
			t()
				.then((g) => c(g))
				.catch((g) => k(g))
		);
	});
}
const ne = (e, t) => {
	let a = null;
	try {
		a = L('$$_convexClient');
	} catch {}
	if (!a)
		try {
			N(e, t);
			try {
				a = L('$$_convexClient');
			} catch {}
		} catch (c) {
			console.warn('Failed to create Convex client:', c);
		}
	if (!a)
		throw new Error(
			'No ConvexClient was provided. Either pass one to setupConvexAuth or call setupConvex() first.'
		);
	return a;
};
export { ee as a, Q as c, te as g, ne as s };
