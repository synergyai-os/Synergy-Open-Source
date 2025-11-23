<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PanelBreadcrumbBar from './PanelBreadcrumbBar.svelte';

	const { Story } = defineMeta({
		component: PanelBreadcrumbBar,
		title: 'Modules/OrgChart/PanelBreadcrumbs',
		tags: ['autodocs']
	});
</script>

<Story
	name="Default"
	args={{
		layer: { name: 'Engineering Circle', id: 'circle-1' },
		onclick: () => console.log('Back clicked')
	}}
>
	{#snippet template(args)}
		<PanelBreadcrumbBar layer={args.layer} onclick={args.onclick} />
	{/snippet}
</Story>

<Story
	name="LongName"
	args={{
		layer: { name: 'Product Development Circle', id: 'circle-2' },
		onclick: () => console.log('Back clicked')
	}}
>
	{#snippet template(args)}
		<PanelBreadcrumbBar layer={args.layer} onclick={args.onclick} />
	{/snippet}
</Story>

<Story
	name="ShortName"
	args={{ layer: { name: 'Sales', id: 'circle-3' }, onclick: () => console.log('Back clicked') }}
>
	{#snippet template(args)}
		<PanelBreadcrumbBar layer={args.layer} onclick={args.onclick} />
	{/snippet}
</Story>
