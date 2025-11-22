import {
	p as K,
	h as ue,
	f as T,
	m as b,
	i as D,
	b as m,
	c as Q,
	s as r,
	e as d,
	v as e,
	w as c,
	j as p,
	g as X,
	t as _e,
	a as ye,
	n as k,
	M as A,
	d as C
} from './iframe-DYn7RqBV.js';
import { c as xe, i as he } from './create-runtime-stories-2rm03jka.js';
import { d as be } from './index-QxUtaCdU.js';
import { e as ke } from './each-DHv61wEY.js';
import { s as F } from './attributes-D2XuSyo_.js';
import { s as Ae } from './style-MviLiK55.js';
import { B as G } from './Button-2sxpTgAx.js';
import './Card-BkEjQl_7.js';
import './Badge-Bhcc4KqB.js';
import './Chip-D9RR8mAy.js';
import './Icon-nf143nWr.js';
import './Text-D3pLiP_j.js';
import './Heading-C09xnpWF.js';
import './Avatar-v8gaQbw7.js';
import './Loading-D_6SL4r8.js';
import './KeyboardShortcut-CeSHTUfy.js';
import './StatusPill-DGMja1Ui.js';
import './PinInput-qBurm280.js';
import './FormInput-CwvyCBJx.js';
import './FormTextarea-DT7j-4wT.js';
/* empty css                                                  */ import './IconButton-BjKeipeo.js';
import './LoadingOverlay-Bob-KG3J.js';
import './SplitButton-DPEFMT_j.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './this-Hz0nHxQJ.js';
import './watch.svelte-CYSsdG2H.js';
import './previous.svelte-BRBO0xyC.js';
import './dom-context.svelte-Cee2qr-t.js';
import './create-id-CD7dpc57.js';
import './noop-DX6rZLP_.js';
import './input-XwGP8Xvd.js';
import './is-using-keyboard.svelte-qppEaaQk.js';
import './is-DtD5rb4o.js';
import './context-DWcBTeuX.js';
import './kbd-constants-Duhtze-4.js';
import './arrays-C786ZheV.js';
import './roving-focus-group-B-fCEnqo.js';
import './use-id-C09Eugg1.js';
import './popper-layer-force-mount-B5n7-529.js';
import './is-BGFdVicR.js';
import './portal-c1AsCbfc.js';
var Ce = X(
		'<svg class="icon-sm flex-shrink-0 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>'
	),
	Me = T(
		'<div class="flex items-center gap-icon"><svg class="icon-sm flex-shrink-0 text-text-tertiary" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg> <span class="text-body-sm text-text-secondary"> </span></div>'
	),
	we = T(
		'<div class="flex size-meeting-avatar-md items-center justify-center rounded-avatar text-label font-medium text-primary"> </div>'
	),
	Se = T(
		'<div class="bg-surface-tertiary flex size-meeting-avatar-md items-center justify-center rounded-avatar text-label font-medium text-text-secondary"> </div>'
	),
	Te = T('<div class="flex items-center gap-inbox-icon"><!> <!></div>'),
	Pe = X(
		'<svg class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add agenda item',
		1
	),
	De = T(
		'<div class="group flex w-full max-w-meeting-today-card flex-col gap-inbox-list rounded-card border border-border-base bg-surface px-card py-card shadow-card transition-default hover:shadow-card-hover"><div class="text-body-sm flex items-center gap-icon"><div class="font-medium text-text-tertiary"> </div> <div class="text-text-secondary"> </div></div> <div class="flex items-center gap-icon"><!> <h3 class="font-semibold text-text-primary"> </h3></div> <div class="text-body-sm font-medium text-text-secondary"> </div> <!> <!> <div class="mt-content-section flex flex-col gap-button-group"><!> <!></div></div>'
	);
function f(z, a) {
	K(a, !0);
	let v = ue(a, 'attendeeAvatars', 19, () => []);
	const $ = c(() => a.meeting.startedAt !== void 0 && a.meeting.closedAt === void 0),
		N = c(() => (e($) ? 'Join meeting' : 'Start')),
		u = c(() => new Date(a.meeting.startTime)),
		I = c(() => e(u).toLocaleDateString('en-US', { month: 'short' }).replace('.', '')),
		W = c(() => e(u).getDate()),
		j = c(() => e(u).toLocaleDateString('en-US', { weekday: 'long' })),
		i = c(() =>
			e(u).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: !0 })
		),
		n = c(() => new Date(a.meeting.startTime + a.meeting.duration * 60 * 1e3)),
		o = c(() =>
			e(n).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: !0 })
		),
		s = c(() => a.meeting.visibility === 'private');
	function Z(t) {
		return t
			.split(' ')
			.map((l) => l[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
	var E = De(),
		J = d(E),
		L = d(J),
		ee = d(L),
		te = r(L, 2),
		ae = d(te),
		U = r(J, 2),
		H = d(U);
	{
		var re = (t) => {
			var l = Ce();
			m(t, l);
		};
		b(H, (t) => {
			e(s) && t(re);
		});
	}
	var ie = r(H, 2),
		ne = d(ie),
		O = r(U, 2),
		oe = d(O),
		q = r(O, 2);
	{
		var se = (t) => {
			var l = Me(),
				x = r(d(l), 2),
				g = d(x);
			(D(() => p(g, a.circleName)), m(t, l));
		};
		b(q, (t) => {
			a.circleName && t(se);
		});
	}
	var V = r(q, 2);
	{
		var le = (t) => {
			var l = Te(),
				x = d(l);
			ke(
				x,
				17,
				() => v().slice(0, 6),
				(_) => _.name,
				(_, y) => {
					var h = we(),
						pe = d(h);
					(D(
						(fe) => {
							(Ae(h, `background-color: ${e(y).color ?? ''}`), F(h, 'title', e(y).name), p(pe, fe));
						},
						[() => Z(e(y).name)]
					),
						m(_, h));
				}
			);
			var g = r(x, 2);
			{
				var ge = (_) => {
					var y = Se(),
						h = d(y);
					(D(() => {
						(F(y, 'title', `${v().length - 6} more`), p(h, `+${v().length - 6}`));
					}),
						m(_, y));
				};
				b(g, (_) => {
					v().length > 6 && _(ge);
				});
			}
			m(t, l);
		};
		b(V, (t) => {
			v().length > 0 && t(le);
		});
	}
	var de = r(V, 2),
		R = d(de);
	{
		var ce = (t) => {
			G(t, {
				variant: 'outline',
				get onclick() {
					return a.onAddAgendaItem;
				},
				children: (l, x) => {
					var g = Pe();
					m(l, g);
				},
				$$slots: { default: !0 }
			});
		};
		b(R, (t) => {
			a.onAddAgendaItem && t(ce);
		});
	}
	var me = r(R, 2);
	{
		var ve = (t) => {
			G(t, {
				variant: 'primary',
				get onclick() {
					return a.onStart;
				},
				class: 'shadow-card',
				children: (l, x) => {
					var g = _e();
					(D(() => p(g, e(N))), m(l, g));
				},
				$$slots: { default: !0 }
			});
		};
		b(me, (t) => {
			a.onStart && t(ve);
		});
	}
	(D(() => {
		(p(ee, `${e(I) ?? ''}. ${e(W) ?? ''}`),
			p(ae, e(j)),
			p(ne, a.meeting.title),
			p(oe, `${e(i) ?? ''} - ${e(o) ?? ''}`));
	}),
		m(z, E),
		Q());
}
f.__docgen = {
	data: [
		{
			name: 'meeting',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'object', text: 'Meeting' },
			static: !1,
			readonly: !1
		},
		{
			name: 'circleName',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'string', text: 'string' },
			static: !1,
			readonly: !1
		},
		{
			name: 'attendeeAvatars',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'type', type: 'array', text: '{ name: string; color: string; }[]' },
			static: !1,
			readonly: !1,
			defaultValue: '[]'
		},
		{
			name: 'onStart',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
			static: !1,
			readonly: !1
		},
		{
			name: 'onAddAgendaItem',
			visibility: 'public',
			keywords: [],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
			static: !1,
			readonly: !1
		}
	],
	name: 'TodayMeetingCard.svelte'
};
const $e = { component: f, title: 'Modules/Meetings/TodayMeetingCard', tags: ['autodocs'] },
	{ Story: M } = be(),
	B = new Date();
B.setHours(14, 0, 0, 0);
const S = {
		title: 'Engineering Standup',
		startTime: B.getTime(),
		duration: 30,
		visibility: 'public'
	},
	Ne = { ...S, title: 'Active Team Sync', startedAt: B.getTime() - 900 * 1e3 },
	Ie = { ...S, title: 'Private Planning Session', visibility: 'private' },
	w = [
		{ name: 'John Doe', color: '#3b82f6' },
		{ name: 'Jane Smith', color: '#10b981' },
		{ name: 'Bob Johnson', color: '#f59e0b' },
		{ name: 'Alice Brown', color: '#ef4444' },
		{ name: 'Charlie Wilson', color: '#8b5cf6' },
		{ name: 'Diana Davis', color: '#ec4899' }
	];
var We = T('<!> <!> <!> <!> <!> <!>', 1);
function Y(z, a) {
	(K(a, !1), he());
	var v = We(),
		$ = ye(v);
	{
		const i = (o, s = k) => {
			f(o, C(s));
		};
		let n = A(() => ({
			meeting: S,
			circleName: 'Engineering Circle',
			attendeeAvatars: w.slice(0, 3)
		}));
		M($, {
			name: 'Default',
			get args() {
				return e(n);
			},
			template: i,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<TodayMeetingCard {...args} />' } }
		});
	}
	var N = r($, 2);
	{
		const i = (o, s = k) => {
			f(o, C(s));
		};
		let n = A(() => ({
			meeting: Ne,
			circleName: 'Engineering Circle',
			attendeeAvatars: w.slice(0, 4),
			onStart: () => console.log('Join clicked')
		}));
		M(N, {
			name: 'InProgress',
			get args() {
				return e(n);
			},
			template: i,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<TodayMeetingCard {...args} />' } }
		});
	}
	var u = r(N, 2);
	{
		const i = (o, s = k) => {
			f(o, C(s));
		};
		let n = A(() => ({
			meeting: Ie,
			circleName: 'Engineering Circle',
			attendeeAvatars: w.slice(0, 2)
		}));
		M(u, {
			name: 'Private',
			get args() {
				return e(n);
			},
			template: i,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<TodayMeetingCard {...args} />' } }
		});
	}
	var I = r(u, 2);
	{
		const i = (o, s = k) => {
			f(o, C(s));
		};
		let n = A(() => ({ meeting: S, circleName: 'Engineering Circle', attendeeAvatars: w }));
		M(I, {
			name: 'WithManyAttendees',
			get args() {
				return e(n);
			},
			template: i,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<TodayMeetingCard {...args} />' } }
		});
	}
	var W = r(I, 2);
	{
		const i = (o, s = k) => {
			f(o, C(s));
		};
		let n = A(() => ({
			meeting: S,
			circleName: 'Engineering Circle',
			attendeeAvatars: w.slice(0, 3),
			onStart: () => console.log('Start clicked'),
			onAddAgendaItem: () => console.log('Add agenda item clicked')
		}));
		M(W, {
			name: 'WithActions',
			get args() {
				return e(n);
			},
			template: i,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<TodayMeetingCard {...args} />' } }
		});
	}
	var j = r(W, 2);
	{
		const i = (o, s = k) => {
			f(o, C(s));
		};
		let n = A(() => ({ meeting: S, attendeeAvatars: w.slice(0, 2) }));
		M(j, {
			name: 'NoCircle',
			get args() {
				return e(n);
			},
			template: i,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<TodayMeetingCard {...args} />' } }
		});
	}
	(m(z, v), Q());
}
Y.__docgen = { data: [], name: 'TodayMeetingCard.stories.svelte' };
const P = xe(Y, $e),
	Ct = ['Default', 'InProgress', 'Private', 'WithManyAttendees', 'WithActions', 'NoCircle'],
	Mt = { ...P.Default, tags: ['svelte-csf-v5'] },
	wt = { ...P.InProgress, tags: ['svelte-csf-v5'] },
	St = { ...P.Private, tags: ['svelte-csf-v5'] },
	Tt = { ...P.WithManyAttendees, tags: ['svelte-csf-v5'] },
	Pt = { ...P.WithActions, tags: ['svelte-csf-v5'] },
	Dt = { ...P.NoCircle, tags: ['svelte-csf-v5'] };
export {
	Mt as Default,
	wt as InProgress,
	Dt as NoCircle,
	St as Private,
	Pt as WithActions,
	Tt as WithManyAttendees,
	Ct as __namedExportsOrder,
	$e as default
};
