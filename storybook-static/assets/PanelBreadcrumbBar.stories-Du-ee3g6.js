import {
	p as b,
	f as g,
	i as B,
	b as v,
	c as k,
	E as h,
	j as N,
	e as _,
	a as C,
	n as i,
	s as f,
	d as m
} from './iframe-DYn7RqBV.js';
import { c as P, i as S } from './create-runtime-stories-2rm03jka.js';
import { d as x } from './index-QxUtaCdU.js';
import { s as $ } from './attributes-D2XuSyo_.js';
import './preload-helper-PPVm8Dsz.js';
import './class-BLXIZATI.js';
import './style-MviLiK55.js';
var D = g(
	'<button type="button" class="panel-breadcrumb-bar hover:panel-breadcrumb-bar-hover"><span class="panel-breadcrumb-text"> </span></button>'
);
function s(n, a) {
	b(a, !0);
	var e = D();
	e.__click = function (...c) {
		a.onclick?.apply(this, c);
	};
	var o = _(e),
		l = _(o);
	(B(() => {
		($(e, 'aria-label', `Go back to ${a.layer.name ?? ''}`), N(l, a.layer.name));
	}),
		v(n, e),
		k());
}
h(['click']);
s.__docgen = {
	data: [
		{
			name: 'layer',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'type', type: 'object', text: 'NavigationLayer' },
			static: !1,
			readonly: !1
		},
		{
			name: 'onclick',
			visibility: 'public',
			keywords: [{ name: 'required', description: '' }],
			kind: 'let',
			type: { kind: 'function', text: '() => void' },
			static: !1,
			readonly: !1
		}
	],
	name: 'PanelBreadcrumbBar.svelte'
};
const L = { component: s, title: 'Modules/OrgChart/PanelBreadcrumbBar', tags: ['autodocs'] },
	{ Story: d } = x();
var w = g('<!> <!> <!>', 1);
function y(n, a) {
	(b(a, !1), S());
	var e = w(),
		o = C(e);
	d(o, {
		name: 'Default',
		args: {
			layer: { name: 'Engineering Circle', id: 'circle-1' },
			onclick: () => console.log('Back clicked')
		},
		template: (t, r = i) => {
			s(t, m(r));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<PanelBreadcrumbBar {...args} />' } }
	});
	var l = f(o, 2);
	d(l, {
		name: 'LongName',
		args: {
			layer: { name: 'Product Development Circle', id: 'circle-2' },
			onclick: () => console.log('Back clicked')
		},
		template: (t, r = i) => {
			s(t, m(r));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<PanelBreadcrumbBar {...args} />' } }
	});
	var c = f(l, 2);
	(d(c, {
		name: 'ShortName',
		args: { layer: { name: 'Sales', id: 'circle-3' }, onclick: () => console.log('Back clicked') },
		template: (t, r = i) => {
			s(t, m(r));
		},
		$$slots: { template: !0 },
		parameters: { __svelteCsf: { rawCode: '<PanelBreadcrumbBar {...args} />' } }
	}),
		v(n, e),
		k());
}
y.__docgen = { data: [], name: 'PanelBreadcrumbBar.stories.svelte' };
const p = P(y, L),
	z = ['Default', 'LongName', 'ShortName'],
	A = { ...p.Default, tags: ['svelte-csf-v5'] },
	F = { ...p.LongName, tags: ['svelte-csf-v5'] },
	H = { ...p.ShortName, tags: ['svelte-csf-v5'] };
export { A as Default, F as LongName, H as ShortName, z as __namedExportsOrder, L as default };
