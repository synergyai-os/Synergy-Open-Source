function u(t, n) {
	return t >= 0 && t < n.length;
}
function x(t, n, e) {
	const i = n.toLowerCase();
	if (i.endsWith(' ')) {
		const o = i.slice(0, -1);
		if (t.filter((s) => s.toLowerCase().startsWith(o)).length <= 1) return x(t, o, e);
		const r = e?.toLowerCase();
		if (r && r.startsWith(o) && r.charAt(o.length) === ' ' && n.trim() === o) return e;
		const h = t.filter((s) => s.toLowerCase().startsWith(i));
		if (h.length > 0) {
			const s = e ? t.indexOf(e) : -1;
			return f(h, Math.max(s, 0)).find((w) => w !== e) || e;
		}
	}
	const c = n.length > 1 && Array.from(n).every((o) => o === n[0]) ? n[0] : n,
		l = c.toLowerCase(),
		p = e ? t.indexOf(e) : -1;
	let a = f(t, Math.max(p, 0));
	c.length === 1 && (a = a.filter((o) => o !== e));
	const d = a.find((o) => o?.toLowerCase().startsWith(l));
	return d !== e ? d : void 0;
}
function f(t, n) {
	return t.map((e, i) => t[(n + i) % t.length]);
}
export { x as g, u as i };
