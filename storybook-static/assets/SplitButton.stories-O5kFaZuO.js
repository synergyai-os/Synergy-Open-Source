import { p as y, f, a as k, n as r, s as c, b as _, c as b, d as a } from './iframe-DYn7RqBV.js';
import { c as u, i as x } from './create-runtime-stories-2rm03jka.js';
import { d as C } from './index-QxUtaCdU.js';
import { S as e } from './SplitButton-DPEFMT_j.js';
import './preload-helper-PPVm8Dsz.js';
import './each-DHv61wEY.js';
import './class-BLXIZATI.js';
import './Button-2sxpTgAx.js';
import './attributes-D2XuSyo_.js';
import './style-MviLiK55.js';
import './this-Hz0nHxQJ.js';
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
import './watch.svelte-CYSsdG2H.js';
import './previous.svelte-BRBO0xyC.js';
import './dom-context.svelte-Cee2qr-t.js';
import './create-id-CD7dpc57.js';
import './noop-DX6rZLP_.js';
import './FormInput-CwvyCBJx.js';
import './input-XwGP8Xvd.js';
import './FormTextarea-DT7j-4wT.js';
/* empty css                                                  */ import './IconButton-BjKeipeo.js';
import './LoadingOverlay-Bob-KG3J.js';
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
const E = {
		component: e,
		title: 'Design System/Atoms/SplitButton',
		tags: ['autodocs'],
		argTypes: { variant: { control: { type: 'select' }, options: ['primary', 'secondary'] } }
	},
	{ Story: l } = C();
var O = f('<!> <!> <!>', 1);
function d(S, g) {
	(y(g, !1), x());
	var i = O(),
		s = k(i);
	l(s, {
		name: 'Primary',
		args: { primaryLabel: 'Save', variant: 'primary' },
		template: (o, t = r) => {
			e(
				o,
				a(t, {
					primaryOnclick: () => console.log('Primary clicked'),
					dropdownItems: [
						{ label: 'Save as Draft', onclick: () => console.log('Save as Draft') },
						{ label: 'Save and Publish', onclick: () => console.log('Save and Publish') },
						{ label: 'Save Template', onclick: () => console.log('Save Template') }
					]
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<SplitButton
	{...args}
	primaryOnclick={() => console.log('Primary clicked')}
	dropdownItems={[
		{ label: 'Save as Draft', onclick: () => console.log('Save as Draft') },
		{ label: 'Save and Publish', onclick: () => console.log('Save and Publish') },
		{ label: 'Save Template', onclick: () => console.log('Save Template') }
	]}
/>`
			}
		}
	});
	var p = c(s, 2);
	l(p, {
		name: 'Secondary',
		args: { primaryLabel: 'Export', variant: 'secondary' },
		template: (o, t = r) => {
			e(
				o,
				a(t, {
					primaryOnclick: () => console.log('Export clicked'),
					dropdownItems: [
						{ label: 'Export as PDF', onclick: () => console.log('Export as PDF') },
						{ label: 'Export as CSV', onclick: () => console.log('Export as CSV') },
						{ label: 'Export as JSON', onclick: () => console.log('Export as JSON') }
					]
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<SplitButton
	{...args}
	primaryOnclick={() => console.log('Export clicked')}
	dropdownItems={[
		{ label: 'Export as PDF', onclick: () => console.log('Export as PDF') },
		{ label: 'Export as CSV', onclick: () => console.log('Export as CSV') },
		{ label: 'Export as JSON', onclick: () => console.log('Export as JSON') }
	]}
/>`
			}
		}
	});
	var v = c(p, 2);
	(l(v, {
		name: 'Single Option',
		args: { primaryLabel: 'Create', variant: 'primary' },
		template: (o, t = r) => {
			e(
				o,
				a(t, {
					primaryOnclick: () => console.log('Create clicked'),
					dropdownItems: [
						{ label: 'Create from Template', onclick: () => console.log('Create from Template') }
					]
				})
			);
		},
		$$slots: { template: !0 },
		parameters: {
			__svelteCsf: {
				rawCode: `<SplitButton
	{...args}
	primaryOnclick={() => console.log('Create clicked')}
	dropdownItems={[{ label: 'Create from Template', onclick: () => console.log('Create from Template') }]}
/>`
			}
		}
	}),
		_(S, i),
		b());
}
d.__docgen = { data: [], name: 'SplitButton.stories.svelte' };
const n = u(d, E),
	yo = ['Primary', 'Secondary', 'SingleOption'],
	fo = { ...n.Primary, tags: ['svelte-csf-v5'] },
	ko = { ...n.Secondary, tags: ['svelte-csf-v5'] },
	_o = { ...n.SingleOption, tags: ['svelte-csf-v5'] };
export {
	fo as Primary,
	ko as Secondary,
	_o as SingleOption,
	yo as __namedExportsOrder,
	E as default
};
