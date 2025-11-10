import { i as S, a2 as T, h as A } from './kOT-I_MI.js';
import { B } from './Bzct2AeO.js';
function M(r, u, ...i) {
	var f = new B(r);
	S(() => {
		const t = u() ?? null;
		f.ensure(t, t && ((n) => t(n, ...i)));
	}, T);
}
function j(r) {
	var u,
		i,
		f = '';
	if (typeof r == 'string' || typeof r == 'number') f += r;
	else if (typeof r == 'object')
		if (Array.isArray(r)) {
			var t = r.length;
			for (u = 0; u < t; u++) r[u] && (i = j(r[u])) && (f && (f += ' '), (f += i));
		} else for (i in r) r[i] && (f && (f += ' '), (f += i));
	return f;
}
function C() {
	for (var r, u, i = 0, f = '', t = arguments.length; i < t; i++)
		(r = arguments[i]) && (u = j(r)) && (f && (f += ' '), (f += u));
	return f;
}
function P(r) {
	return typeof r == 'object' ? C(r) : (r ?? '');
}
const v = [
	...` 	
\r\f \v\uFEFF`
];
function F(r, u, i) {
	var f = r == null ? '' : '' + r;
	if ((u && (f = f ? f + ' ' + u : u), i)) {
		for (var t in i)
			if (i[t]) f = f ? f + ' ' + t : t;
			else if (f.length)
				for (var n = t.length, a = 0; (a = f.indexOf(t, a)) >= 0; ) {
					var g = a + n;
					(a === 0 || v.includes(f[a - 1])) && (g === f.length || v.includes(f[g]))
						? (f = (a === 0 ? '' : f.substring(0, a)) + f.substring(g + 1))
						: (a = g);
				}
	}
	return f === '' ? null : f;
}
function N(r, u = !1) {
	var i = u ? ' !important;' : ';',
		f = '';
	for (var t in r) {
		var n = r[t];
		n != null && n !== '' && (f += ' ' + t + ': ' + n + i);
	}
	return f;
}
function p(r) {
	return r[0] !== '-' || r[1] !== '-' ? r.toLowerCase() : r;
}
function $(r, u) {
	if (u) {
		var i = '',
			f,
			t;
		if ((Array.isArray(u) ? ((f = u[0]), (t = u[1])) : (f = u), r)) {
			r = String(r)
				.replaceAll(/\s*\/\*.*?\*\/\s*/g, '')
				.trim();
			var n = !1,
				a = 0,
				g = !1,
				l = [];
			(f && l.push(...Object.keys(f).map(p)), t && l.push(...Object.keys(t).map(p)));
			var c = 0,
				b = -1;
			const h = r.length;
			for (var s = 0; s < h; s++) {
				var o = r[s];
				if (
					(g
						? o === '/' && r[s - 1] === '*' && (g = !1)
						: n
							? n === o && (n = !1)
							: o === '/' && r[s + 1] === '*'
								? (g = !0)
								: o === '"' || o === "'"
									? (n = o)
									: o === '('
										? a++
										: o === ')' && a--,
					!g && n === !1 && a === 0)
				) {
					if (o === ':' && b === -1) b = s;
					else if (o === ';' || s === h - 1) {
						if (b !== -1) {
							var E = p(r.substring(c, b).trim());
							if (!l.includes(E)) {
								o !== ';' && s++;
								var O = r.substring(c, s).trim();
								i += ' ' + O + ';';
							}
						}
						((c = s + 1), (b = -1));
					}
				}
			}
		}
		return (f && (i += N(f)), t && (i += N(t, !0)), (i = i.trim()), i === '' ? null : i);
	}
	return r == null ? null : String(r);
}
function e(r, u, i, f, t, n) {
	var a = r.__className;
	if (A || a !== i || a === void 0) {
		var g = F(i, f, n);
		((!A || g !== r.getAttribute('class')) &&
			(g == null ? r.removeAttribute('class') : u ? (r.className = g) : r.setAttribute('class', g)),
			(r.__className = i));
	} else if (n && t !== n)
		for (var l in n) {
			var c = !!n[l];
			(t == null || c !== !!t[l]) && r.classList.toggle(l, c);
		}
	return n;
}
export { M as a, C as b, P as c, e as s, $ as t };
