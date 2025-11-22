import {
	p as D,
	f as y,
	a as R,
	n as l,
	s as a,
	b as C,
	c as T,
	d,
	e as B
} from './iframe-DYn7RqBV.js';
import { c as I, i as h } from './create-runtime-stories-2rm03jka.js';
import { d as E } from './index-QxUtaCdU.js';
import { S as e } from './StatusPill-DGMja1Ui.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
const M = {
		component: e,
		title: 'Design System/Atoms/StatusPill',
		tags: ['autodocs'],
		argTypes: {
			status: {
				control: { type: 'select' },
				options: ['backlog', 'todo', 'in_progress', 'done', 'cancelled']
			},
			readonly: { control: { type: 'boolean' } }
		}
	},
	{ Story: o } = E();
var O = y('<div class="flex flex-col gap-2"><!> <!> <!> <!> <!></div>'),
	j = y('<!> <!> <!> <!> <!> <!> <!>', 1);
function k(b, w) {
	(D(w, !1), h());
	var c = j(),
		p = R(c);
	o(p, {
		name: 'Backlog',
		args: { status: 'backlog', readonly: !1 },
		template: (s, t = l) => {
			e(s, d(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<StatusPill {...args} />' } }
	});
	var _ = a(p, 2);
	o(_, {
		name: 'Todo',
		args: { status: 'todo', readonly: !1 },
		template: (s, t = l) => {
			e(s, d(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<StatusPill {...args} />' } }
	});
	var m = a(_, 2);
	o(m, {
		name: 'InProgress',
		args: { status: 'in_progress', readonly: !1 },
		template: (s, t = l) => {
			e(s, d(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<StatusPill {...args} />' } }
	});
	var u = a(m, 2);
	o(u, {
		name: 'Done',
		args: { status: 'done', readonly: !1 },
		template: (s, t = l) => {
			e(s, d(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<StatusPill {...args} />' } }
	});
	var i = a(u, 2);
	o(i, {
		name: 'Cancelled',
		args: { status: 'cancelled', readonly: !1 },
		template: (s, t = l) => {
			e(s, d(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<StatusPill {...args} />' } }
	});
	var g = a(i, 2);
	o(g, {
		name: 'Readonly',
		args: { status: 'in_progress', readonly: !0 },
		template: (s, t = l) => {
			e(s, d(t));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<StatusPill {...args} />' } }
	});
	var x = a(g, 2);
	(o(x, {
		name: 'AllStatuses',
		args: {},
		template: (s, t = l) => {
			var v = O(),
				f = B(v);
			e(f, { status: 'backlog' });
			var S = a(f, 2);
			e(S, { status: 'todo' });
			var $ = a(S, 2);
			e($, { status: 'in_progress' });
			var P = a($, 2);
			e(P, { status: 'done' });
			var A = a(P, 2);
			(e(A, { status: 'cancelled' }), C(s, v));
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<div class="flex flex-col gap-2">
	<StatusPill status="backlog" />
	<StatusPill status="todo" />
	<StatusPill status="in_progress" />
	<StatusPill status="done" />
	<StatusPill status="cancelled" />
</div>`
			}
		}
	}),
		C(b, c),
		T());
}
k.__docgen = { data: [], name: 'StatusPill.stories.svelte' };
const r = I(k, M),
	K = ['Backlog', 'Todo', 'InProgress', 'Done', 'Cancelled', 'Readonly', 'AllStatuses'],
	L = { ...r.Backlog, tags: ['svelte-csf-v5'] },
	N = { ...r.Todo, tags: ['svelte-csf-v5'] },
	Q = { ...r.InProgress, tags: ['svelte-csf-v5'] },
	U = { ...r.Done, tags: ['svelte-csf-v5'] },
	V = { ...r.Cancelled, tags: ['svelte-csf-v5'] },
	W = { ...r.Readonly, tags: ['svelte-csf-v5'] },
	X = { ...r.AllStatuses, tags: ['svelte-csf-v5'] };
export {
	X as AllStatuses,
	L as Backlog,
	V as Cancelled,
	U as Done,
	Q as InProgress,
	W as Readonly,
	N as Todo,
	K as __namedExportsOrder,
	M as default
};
