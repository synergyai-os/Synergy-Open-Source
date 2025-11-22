import {
	p as ee,
	h as xe,
	f as z,
	m as b,
	i as U,
	b as g,
	c as te,
	s as o,
	e as m,
	g as B,
	v as n,
	w as _,
	j as k,
	t as K,
	a as Ce,
	n as D,
	M as $,
	d as N
} from './iframe-DYn7RqBV.js';
import { c as Ae, i as be } from './create-runtime-stories-2rm03jka.js';
import { d as ke } from './index-QxUtaCdU.js';
import { e as Se } from './each-DHv61wEY.js';
import { s as X } from './attributes-D2XuSyo_.js';
import { s as Me } from './style-MviLiK55.js';
import { B as W } from './Button-2sxpTgAx.js';
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
function we(a, t) {
	const v = new Date(),
		u = new Date(a.startTime),
		y = new Date(a.startTime + a.duration * 60 * 1e3),
		d = (r) => {
			const c = r.getFullYear(),
				i = String(r.getMonth() + 1).padStart(2, '0'),
				M = String(r.getDate()).padStart(2, '0'),
				P = String(r.getHours()).padStart(2, '0'),
				L = String(r.getMinutes()).padStart(2, '0'),
				j = String(r.getSeconds()).padStart(2, '0');
			return `${c}${i}${M}T${P}${L}${j}`;
		},
		S = `${a._id}@synergyos.ai`;
	let p = '';
	if (a.recurrence) {
		const r = a.recurrence.frequency.toUpperCase(),
			c = a.recurrence.interval;
		if (
			((p = `FREQ=${r};INTERVAL=${c}`),
			a.recurrence.frequency === 'weekly' && a.recurrence.daysOfWeek)
		) {
			const i = a.recurrence.daysOfWeek
				.map((M) => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][M])
				.join(',');
			p += `;BYDAY=${i}`;
		}
		if (a.recurrence.endDate) {
			const i = new Date(a.recurrence.endDate);
			p += `;UNTIL=${d(i)}Z`;
		}
	}
	const I = [
			t ? `Organization: ${t}` : '',
			`Visibility: ${a.visibility}`,
			'',
			'Powered by SynergyOS - www.synergyos.ai'
		]
			.filter(Boolean)
			.join('\\n'),
		s = [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//SynergyOS//Meetings//EN',
			'CALSCALE:GREGORIAN',
			'METHOD:PUBLISH',
			'BEGIN:VEVENT',
			`UID:${S}`,
			`DTSTAMP:${d(v)}Z`,
			`DTSTART:${d(u)}`,
			`DTEND:${d(y)}`,
			`SUMMARY:${a.title}`,
			`DESCRIPTION:${I}`,
			'STATUS:CONFIRMED',
			'TRANSP:OPAQUE'
		];
	return (
		p && s.push(`RRULE:${p}`),
		s.push('END:VEVENT', 'END:VCALENDAR'),
		s.join(`\r
`)
	);
}
function De(a, t) {
	const v = we(a, t),
		u = new Blob([v], { type: 'text/calendar;charset=utf-8' }),
		y = URL.createObjectURL(u),
		d = document.createElement('a');
	((d.href = y),
		(d.download = `${a.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`),
		document.body.appendChild(d),
		d.click(),
		document.body.removeChild(d),
		URL.revokeObjectURL(y));
}
var $e = B(
		'<svg class="icon-sm text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>'
	),
	Ne = B(
		'<svg class="icon-sm text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>'
	),
	Ee = z(
		'<div class="flex items-center gap-icon"><svg class="icon-sm text-text-tertiary" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg> <span class="text-body-sm text-text-secondary"> </span></div>'
	),
	Re = z(
		'<div class="flex size-avatar-sm items-center justify-center rounded-avatar text-label font-medium text-primary"> </div>'
	),
	Te = z(
		'<div class="bg-surface-tertiary flex size-avatar-sm items-center justify-center rounded-avatar text-label font-medium text-text-secondary"> </div>'
	),
	ze = z('<div class="flex items-center gap-icon"><!> <!></div>'),
	Oe = B(
		'<svg class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>'
	),
	Ie = B(
		'<svg class="icon-md" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>'
	),
	Pe = z(
		'<div class="group hover:bg-surface-hover flex gap-meeting-card border-b border-border-base py-card transition-colors-token"><div class="flex w-meeting-date-badge flex-col items-center justify-start pt-meeting-card"><div class="text-body-sm text-text-tertiary"> </div> <div class="text-h2 font-medium text-text-primary"> </div></div> <div class="space-y-meeting-card flex-1 py-card"><div class="flex items-center gap-icon"><!> <h3 class="text-body font-medium text-text-primary"> </h3> <!></div> <div class="text-body-sm text-text-secondary"> </div> <!> <!></div> <div class="flex items-center gap-icon py-card"><!> <!> <!> <!></div></div>'
	);
function h(a, t) {
	ee(t, !0);
	let v = xe(t, 'attendeeAvatars', 19, () => []);
	const u = _(() => new Date(t.meeting.startTime)),
		y = _(() => n(u).getDate()),
		d = _(() => n(u).toLocaleDateString('en-US', { weekday: 'short' }).replace('.', '')),
		S = _(() =>
			n(u).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: !0 })
		),
		p = _(() => new Date(t.meeting.startTime + t.meeting.duration * 60 * 1e3)),
		I = _(() =>
			n(p).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: !0 })
		),
		s = _(() => t.meeting.visibility === 'private'),
		r = _(() => !!t.meeting.recurrence);
	function c(e) {
		return e
			.split(' ')
			.map((l) => l[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
	function i() {
		De(t.meeting, t.organizationName);
	}
	var M = Pe(),
		P = m(M),
		L = m(P),
		j = m(L),
		ae = o(L, 2),
		ie = m(ae),
		V = o(P, 2),
		H = m(V),
		q = m(H);
	{
		var ne = (e) => {
			var l = $e();
			g(e, l);
		};
		b(q, (e) => {
			n(s) && e(ne);
		});
	}
	var F = o(q, 2),
		oe = m(F),
		se = o(F, 2);
	{
		var ce = (e) => {
			var l = Ne();
			g(e, l);
		};
		b(se, (e) => {
			n(r) && e(ce);
		});
	}
	var G = o(H, 2),
		le = m(G),
		Y = o(G, 2);
	{
		var de = (e) => {
			var l = Ee(),
				f = o(m(l), 2),
				x = m(f);
			(U(() => k(x, t.circleName)), g(e, l));
		};
		b(Y, (e) => {
			t.circleName && e(de);
		});
	}
	var me = o(Y, 2);
	{
		var ve = (e) => {
			var l = ze(),
				f = m(l);
			Se(
				f,
				17,
				() => v().slice(0, 6),
				(C) => C.name,
				(C, A) => {
					var w = Re(),
						_e = m(w);
					(U(
						(he) => {
							(Me(w, `background-color: ${n(A).color ?? ''}`), X(w, 'title', n(A).name), k(_e, he));
						},
						[() => c(n(A).name)]
					),
						g(C, w));
				}
			);
			var x = o(f, 2);
			{
				var ye = (C) => {
					var A = Te(),
						w = m(A);
					(U(() => {
						(X(A, 'title', `${v().length - 6} more`), k(w, `+${v().length - 6}`));
					}),
						g(C, A));
				};
				b(x, (C) => {
					v().length > 6 && C(ye);
				});
			}
			g(e, l);
		};
		b(me, (e) => {
			v().length > 0 && e(ve);
		});
	}
	var ge = o(V, 2),
		J = m(ge);
	W(J, {
		variant: 'outline',
		iconOnly: !0,
		ariaLabel: 'Download calendar event',
		onclick: i,
		children: (e, l) => {
			var f = Oe();
			g(e, f);
		},
		$$slots: { default: !0 }
	});
	var Q = o(J, 2);
	{
		var ue = (e) => {
			W(e, {
				variant: 'outline',
				get onclick() {
					return t.onAddAgendaItem;
				},
				children: (l, f) => {
					var x = K('+ Add agenda item');
					g(l, x);
				},
				$$slots: { default: !0 }
			});
		};
		b(Q, (e) => {
			t.onAddAgendaItem && e(ue);
		});
	}
	var Z = o(Q, 2);
	{
		var pe = (e) => {
			W(e, {
				variant: 'primary',
				get onclick() {
					return t.onStart;
				},
				children: (l, f) => {
					var x = K('Start');
					g(l, x);
				},
				$$slots: { default: !0 }
			});
		};
		b(Z, (e) => {
			t.onStart && e(pe);
		});
	}
	var fe = o(Z, 2);
	(W(fe, {
		variant: 'outline',
		iconOnly: !0,
		ariaLabel: 'More options',
		class: '!border-0 text-text-tertiary hover:text-text-secondary',
		children: (e, l) => {
			var f = Ie();
			g(e, f);
		},
		$$slots: { default: !0 }
	}),
		U(() => {
			(k(j, n(d)), k(ie, n(y)), k(oe, t.meeting.title), k(le, `${n(S) ?? ''} - ${n(I) ?? ''}`));
		}),
		g(a, M),
		te());
}
h.__docgen = {
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
			name: 'organizationName',
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
	name: 'MeetingCard.svelte'
};
const Le = { component: h, title: 'Modules/Meetings/MeetingCard', tags: ['autodocs'] },
	{ Story: E } = ke(),
	T = {
		_id: 'meeting-1',
		title: 'Engineering Standup',
		startTime: Date.now() + 1440 * 60 * 1e3,
		duration: 30,
		visibility: 'public',
		circleId: 'circle-1',
		attendeeCount: 5
	},
	Ue = { ...T, _id: 'meeting-2', title: 'Private Planning Session', visibility: 'private' },
	We = {
		...T,
		_id: 'meeting-3',
		title: 'Weekly Team Sync',
		recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [1] }
	},
	R = [
		{ name: 'John Doe', color: '#3b82f6' },
		{ name: 'Jane Smith', color: '#10b981' },
		{ name: 'Bob Johnson', color: '#f59e0b' },
		{ name: 'Alice Brown', color: '#ef4444' },
		{ name: 'Charlie Wilson', color: '#8b5cf6' },
		{ name: 'Diana Davis', color: '#ec4899' },
		{ name: 'Eve Miller', color: '#06b6d4' }
	];
var Be = z('<!> <!> <!> <!> <!> <!>', 1);
function re(a, t) {
	(ee(t, !1), be());
	var v = Be(),
		u = Ce(v);
	{
		const s = (c, i = D) => {
			h(c, N(i));
		};
		let r = $(() => ({
			meeting: T,
			circleName: 'Engineering Circle',
			organizationName: 'Acme Corp',
			attendeeAvatars: R.slice(0, 3)
		}));
		E(u, {
			name: 'Default',
			get args() {
				return n(r);
			},
			template: s,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<MeetingCard {...args} />' } }
		});
	}
	var y = o(u, 2);
	{
		const s = (c, i = D) => {
			h(c, N(i));
		};
		let r = $(() => ({
			meeting: T,
			circleName: 'Engineering Circle',
			organizationName: 'Acme Corp',
			attendeeAvatars: R
		}));
		E(y, {
			name: 'WithManyAttendees',
			get args() {
				return n(r);
			},
			template: s,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<MeetingCard {...args} />' } }
		});
	}
	var d = o(y, 2);
	{
		const s = (c, i = D) => {
			h(c, N(i));
		};
		let r = $(() => ({
			meeting: Ue,
			circleName: 'Engineering Circle',
			organizationName: 'Acme Corp',
			attendeeAvatars: R.slice(0, 2)
		}));
		E(d, {
			name: 'Private',
			get args() {
				return n(r);
			},
			template: s,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<MeetingCard {...args} />' } }
		});
	}
	var S = o(d, 2);
	{
		const s = (c, i = D) => {
			h(c, N(i));
		};
		let r = $(() => ({
			meeting: We,
			circleName: 'Engineering Circle',
			organizationName: 'Acme Corp',
			attendeeAvatars: R.slice(0, 4)
		}));
		E(S, {
			name: 'Recurring',
			get args() {
				return n(r);
			},
			template: s,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<MeetingCard {...args} />' } }
		});
	}
	var p = o(S, 2);
	{
		const s = (c, i = D) => {
			h(c, N(i));
		};
		let r = $(() => ({
			meeting: T,
			circleName: 'Engineering Circle',
			organizationName: 'Acme Corp',
			attendeeAvatars: R.slice(0, 3),
			onStart: () => console.log('Start clicked'),
			onAddAgendaItem: () => console.log('Add agenda item clicked')
		}));
		E(p, {
			name: 'WithActions',
			get args() {
				return n(r);
			},
			template: s,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<MeetingCard {...args} />' } }
		});
	}
	var I = o(p, 2);
	{
		const s = (c, i = D) => {
			h(c, N(i));
		};
		let r = $(() => ({
			meeting: T,
			organizationName: 'Acme Corp',
			attendeeAvatars: R.slice(0, 2)
		}));
		E(I, {
			name: 'NoCircle',
			get args() {
				return n(r);
			},
			template: s,
			$$slots: { template: !0 },
			parameters: { __svelteCsf: { rawCode: '<MeetingCard {...args} />' } }
		});
	}
	(g(a, v), te());
}
re.__docgen = { data: [], name: 'MeetingCard.stories.svelte' };
const O = Ae(re, Le),
	Et = ['Default', 'WithManyAttendees', 'Private', 'Recurring', 'WithActions', 'NoCircle'],
	Rt = { ...O.Default, tags: ['svelte-csf-v5'] },
	Tt = { ...O.WithManyAttendees, tags: ['svelte-csf-v5'] },
	zt = { ...O.Private, tags: ['svelte-csf-v5'] },
	Ot = { ...O.Recurring, tags: ['svelte-csf-v5'] },
	It = { ...O.WithActions, tags: ['svelte-csf-v5'] },
	Pt = { ...O.NoCircle, tags: ['svelte-csf-v5'] };
export {
	Rt as Default,
	Pt as NoCircle,
	zt as Private,
	Ot as Recurring,
	It as WithActions,
	Tt as WithManyAttendees,
	Et as __namedExportsOrder,
	Le as default
};
