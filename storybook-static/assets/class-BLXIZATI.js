function j(r) {
	var t,
		i,
		f = '';
	if (typeof r == 'string' || typeof r == 'number') f += r;
	else if (typeof r == 'object')
		if (Array.isArray(r)) {
			var u = r.length;
			for (t = 0; t < u; t++) r[t] && (i = j(r[t])) && (f && (f += ' '), (f += i));
		} else for (i in r) r[i] && (f && (f += ' '), (f += i));
	return f;
}
function L() {
	for (var r, t, i = 0, f = '', u = arguments.length; i < u; i++)
		(r = arguments[i]) && (t = j(r)) && (f && (f += ' '), (f += t));
	return f;
}
function C(r) {
	return typeof r == 'object' ? L(r) : (r ?? '');
}
const p = [
	...` 	
\r\f \v\uFEFF`
];
function S(r, t, i) {
	var f = r == null ? '' : '' + r;
	if (i) {
		for (var u in i)
			if (i[u]) f = f ? f + ' ' + u : u;
			else if (f.length)
				for (var g = u.length, n = 0; (n = f.indexOf(u, n)) >= 0; ) {
					var a = n + g;
					(n === 0 || p.includes(f[n - 1])) && (a === f.length || p.includes(f[a]))
						? (f = (n === 0 ? '' : f.substring(0, n)) + f.substring(a + 1))
						: (n = a);
				}
	}
	return f === '' ? null : f;
}
function A(r, t = !1) {
	var i = t ? ' !important;' : ';',
		f = '';
	for (var u in r) {
		var g = r[u];
		g != null && g !== '' && (f += ' ' + u + ': ' + g + i);
	}
	return f;
}
function c(r) {
	return r[0] !== '-' || r[1] !== '-' ? r.toLowerCase() : r;
}
function $(r, t) {
	if (t) {
		var i = '',
			f,
			u;
		if ((Array.isArray(t) ? ((f = t[0]), (u = t[1])) : (f = t), r)) {
			r = String(r)
				.replaceAll(/\s*\/\*.*?\*\/\s*/g, '')
				.trim();
			var g = !1,
				n = 0,
				a = !1,
				h = [];
			(f && h.push(...Object.keys(f).map(c)), u && h.push(...Object.keys(u).map(c)));
			var s = 0,
				b = -1;
			const v = r.length;
			for (var o = 0; o < v; o++) {
				var l = r[o];
				if (
					(a
						? l === '/' && r[o - 1] === '*' && (a = !1)
						: g
							? g === l && (g = !1)
							: l === '/' && r[o + 1] === '*'
								? (a = !0)
								: l === '"' || l === "'"
									? (g = l)
									: l === '('
										? n++
										: l === ')' && n--,
					!a && g === !1 && n === 0)
				) {
					if (l === ':' && b === -1) b = o;
					else if (l === ';' || o === v - 1) {
						if (b !== -1) {
							var N = c(r.substring(s, b).trim());
							if (!h.includes(N)) {
								l !== ';' && o++;
								var O = r.substring(s, o).trim();
								i += ' ' + O + ';';
							}
						}
						((s = o + 1), (b = -1));
					}
				}
			}
		}
		return (f && (i += A(f)), u && (i += A(u, !0)), (i = i.trim()), i === '' ? null : i);
	}
	return r == null ? null : String(r);
}
function q(r, t, i, f, u, g) {
	var n = r.__className;
	if (n !== i || n === void 0) {
		var a = S(i, f, g);
		(a == null ? r.removeAttribute('class') : t ? (r.className = a) : r.setAttribute('class', a),
			(r.__className = i));
	} else if (g && u !== g)
		for (var h in g) {
			var s = !!g[h];
			(u == null || s !== !!u[h]) && r.classList.toggle(h, s);
		}
	return g;
}
export { L as a, C as c, q as s, $ as t };
