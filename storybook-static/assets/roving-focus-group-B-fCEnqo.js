import { A as l, a as f, b as h, c as d, E as S, H as A } from './kbd-constants-Duhtze-4.js';
import { i as R } from './is-DtD5rb4o.js';
import { ab as v, aC as T, a8 as C, v as K } from './iframe-DYn7RqBV.js';
import {
	j as W,
	B as I,
	k as z,
	b as B,
	l as F,
	t as O,
	n as E,
	o as D
} from './create-id-CD7dpc57.js';
function n(e) {
	let t = v(T(e));
	return {
		[I]: !0,
		[W]: !0,
		get current() {
			return K(t);
		},
		set current(r) {
			C(t, r, !0);
		}
	};
}
n.from = z;
n.with = B;
n.flatten = F;
n.readonly = O;
n.isBox = E;
n.isWritableBox = D;
function w(e) {
	return window.getComputedStyle(e).getPropertyValue('direction');
}
function H(e = 'ltr', t = 'horizontal') {
	return { horizontal: e === 'rtl' ? h : f, vertical: d }[t];
}
function P(e = 'ltr', t = 'horizontal') {
	return { horizontal: e === 'rtl' ? f : h, vertical: l }[t];
}
function _(e = 'ltr', t = 'horizontal') {
	return (
		['ltr', 'rtl'].includes(e) || (e = 'ltr'),
		['horizontal', 'vertical'].includes(t) || (t = 'horizontal'),
		{ nextKey: H(e, t), prevKey: P(e, t) }
	);
}
class M {
	#t;
	#e = n(null);
	constructor(t) {
		this.#t = t;
	}
	getCandidateNodes() {
		return this.#t.rootNode.current
			? this.#t.candidateSelector
				? Array.from(this.#t.rootNode.current.querySelectorAll(this.#t.candidateSelector))
				: this.#t.candidateAttr
					? Array.from(
							this.#t.rootNode.current.querySelectorAll(
								`[${this.#t.candidateAttr}]:not([data-disabled])`
							)
						)
					: []
			: [];
	}
	focusFirstCandidate() {
		const t = this.getCandidateNodes();
		t.length && t[0]?.focus();
	}
	handleKeydown(t, r, c = !1) {
		const y = this.#t.rootNode.current;
		if (!y || !t) return;
		const o = this.getCandidateNodes();
		if (!o.length) return;
		const a = o.indexOf(t),
			b = w(y),
			{ nextKey: m, prevKey: x } = _(b, this.#t.orientation.current),
			p = this.#t.loop.current,
			u = { [m]: a + 1, [x]: a - 1, [A]: 0, [S]: o.length - 1 };
		if (c) {
			const g = m === d ? f : d,
				N = x === l ? h : l;
			((u[g] = a + 1), (u[N] = a - 1));
		}
		let i = u[r.key];
		if (i === void 0) return;
		(r.preventDefault(), i < 0 && p ? (i = o.length - 1) : i === o.length && p && (i = 0));
		const s = o[i];
		if (s) return (s.focus(), (this.#e.current = s.id), this.#t.onCandidateFocus?.(s), s);
	}
	getTabIndex(t) {
		const r = this.getCandidateNodes(),
			c = this.#e.current !== null;
		return t && !c && r[0] === t
			? ((this.#e.current = t.id), 0)
			: t?.id === this.#e.current
				? 0
				: -1;
	}
	setCurrentTabStopId(t) {
		this.#e.current = t;
	}
	focusCurrentTabStop() {
		const t = this.#e.current;
		if (!t) return;
		const r = this.#t.rootNode.current?.querySelector(`#${t}`);
		!r || !R(r) || r.focus();
	}
}
export { M as R };
