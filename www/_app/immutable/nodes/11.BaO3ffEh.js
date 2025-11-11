import { f as L, e as X, a as $, t as z } from '../chunks/ClEwQIZJ.js';
import {
	p as G,
	t as j,
	j as e,
	T as n,
	a as H,
	s as a,
	c as t,
	V as s,
	r as o,
	X as I
} from '../chunks/kOT-I_MI.js';
import { s as J } from '../chunks/LC4C1fji.js';
import { i as K } from '../chunks/SF-wfan-.js';
import { c as O } from '../chunks/BLTX30nU.js';
import { r as u } from '../chunks/CxucRfwL.js';
import { b as c } from '../chunks/BHj6_6we.js';
import { u as Q } from '../chunks/-dmxCEhl.js';
import { g as W } from '../chunks/DbDA9aFy.js';
import { B as Y } from '../chunks/oOxICoJY.js';
var Z = L('<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"> </div>'),
	ee = L(
		'<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8"><div class="max-w-md w-full space-y-8"><div><h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2> <p class="mt-2 text-center text-sm text-gray-600">Already have an account? <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a></p></div> <form class="mt-8 space-y-6"><!> <div class="space-y-4"><div><label for="name" class="block text-sm font-medium text-gray-700">Full Name</label> <input id="name" name="name" type="text" autocomplete="name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="John Doe"/></div> <div><label for="email" class="block text-sm font-medium text-gray-700">Email address</label> <input id="email" name="email" type="email" autocomplete="email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="you@example.com"/></div> <div><label for="password" class="block text-sm font-medium text-gray-700">Password</label> <input id="password" name="password" type="password" autocomplete="new-password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="At least 8 characters"/> <p class="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p></div> <div><label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label> <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Confirm your password"/></div></div> <div><!></div></form></div></div>'
	);
function ce(M, N) {
	G(N, !0);
	const R = Q(),
		{ signIn: S } = R;
	let p = n(''),
		m = n(''),
		f = n(''),
		b = n(''),
		i = n(''),
		l = n(!1);
	async function T(r) {
		if ((r.preventDefault(), s(i, ''), e(m) !== e(f))) {
			s(i, 'Passwords do not match');
			return;
		}
		if (e(m).length < 8) {
			s(i, 'Password must be at least 8 characters long');
			return;
		}
		s(l, !0);
		try {
			(await S('password', { email: e(p), password: e(m), name: e(b), flow: 'signUp' }),
				await W('/'));
		} catch (d) {
			(s(i, d instanceof Error ? d.message : 'Failed to create account. Please try again.', !0),
				s(l, !1));
		}
	}
	var v = ee(),
		A = t(v),
		x = a(t(A), 2),
		B = t(x);
	{
		var U = (r) => {
			var d = Z(),
				q = t(d, !0);
			(o(d), j(() => J(q, e(i))), $(r, d));
		};
		K(B, (r) => {
			e(i) && r(U);
		});
	}
	var g = a(B, 2),
		y = t(g),
		w = a(t(y), 2);
	(u(w), o(y));
	var h = a(y, 2),
		_ = a(t(h), 2);
	(u(_), o(h));
	var P = a(h, 2),
		k = a(t(P), 2);
	(u(k), I(2), o(P));
	var D = a(P, 2),
		C = a(t(D), 2);
	(u(C), o(D), o(g));
	var E = a(g, 2),
		V = t(E);
	(O(
		V,
		() => Y,
		(r, d) => {
			d(r, {
				type: 'submit',
				get disabled() {
					return e(l);
				},
				class:
					'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
				children: (q, re) => {
					I();
					var F = z();
					(j(() => J(F, e(l) ? 'Creating account...' : 'Create account')), $(q, F));
				},
				$$slots: { default: !0 }
			});
		}
	),
		o(E),
		o(x),
		o(A),
		o(v),
		j(() => {
			((w.disabled = e(l)), (_.disabled = e(l)), (k.disabled = e(l)), (C.disabled = e(l)));
		}),
		X('submit', x, T),
		c(
			w,
			() => e(b),
			(r) => s(b, r)
		),
		c(
			_,
			() => e(p),
			(r) => s(p, r)
		),
		c(
			k,
			() => e(m),
			(r) => s(m, r)
		),
		c(
			C,
			() => e(f),
			(r) => s(f, r)
		),
		$(M, v),
		H());
}
export { ce as component };
