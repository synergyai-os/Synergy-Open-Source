import {
	p as y,
	h as c,
	f as k,
	i as f,
	b as x,
	c as v,
	s as _,
	e as o,
	E as m,
	v as n,
	w as h,
	j as r
} from './iframe-DYn7RqBV.js';
import { s as w } from './class-BLXIZATI.js';
var C = k(
	'<button type="button"><span class="text-body leading-none"> </span> <span> </span></button>'
);
function P(d, e) {
	y(e, !0);
	let l = c(e, 'status', 3, 'backlog'),
		s = c(e, 'readonly', 3, !1);
	const p = {
			backlog: { icon: '○', label: 'Backlog', color: 'text-tertiary' },
			todo: { icon: '○', label: 'Todo', color: 'text-tertiary' },
			in_progress: { icon: '◐', label: 'In Progress', color: 'text-accent-primary' },
			done: { icon: '●', label: 'Done', color: 'text-success' },
			cancelled: { icon: '✕', label: 'Cancelled', color: 'text-tertiary' }
		},
		a = h(() => p[l()]);
	var t = C();
	t.__click = () => !s() && e.onChange?.(l());
	var i = o(t),
		b = o(i),
		u = _(i, 2),
		g = o(u);
	(f(() => {
		(w(
			t,
			1,
			`inline-flex items-center gap-icon-wide rounded-button bg-transparent px-section py-section text-button font-normal transition-colors hover:bg-hover-solid ${n(a).color ?? ''}`
		),
			(t.disabled = s()),
			r(b, n(a).icon),
			r(g, n(a).label));
	}),
		x(d, t),
		v());
}
m(['click']);
P.__docgen = {
	data: [
		{
			name: 'status',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'union',
				type: [
					{ kind: 'const', type: 'string', value: 'backlog', text: '"backlog"' },
					{ kind: 'const', type: 'string', value: 'todo', text: '"todo"' },
					{ kind: 'const', type: 'string', value: 'in_progress', text: '"in_progress"' },
					{ kind: 'const', type: 'string', value: 'done', text: '"done"' },
					{ kind: 'const', type: 'string', value: 'cancelled', text: '"cancelled"' }
				],
				text: '"backlog" | "todo" | "in_progress" | "done" | "cancelled"'
			},
			static: !1,
			readonly: !1,
			defaultValue: '"backlog"'
		},
		{
			name: 'onChange',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: {
				kind: 'function',
				text: '(status: "backlog" | "todo" | "in_progress" | "done" | "cancelled") => void'
			},
			static: !1,
			readonly: !1
		},
		{
			name: 'readonly',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'boolean', text: 'boolean' },
			static: !1,
			readonly: !1,
			defaultValue: 'false'
		}
	],
	name: 'StatusPill.svelte'
};
export { P as S };
