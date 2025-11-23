<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: CreateCircleModal uses Dialog from bits-ui which should work,
	// but component may have other dependencies. Testing with mock data.
	import CreateCircleModal from './circles/CreateCircleModal.svelte';

	const { Story } = defineMeta({
		component: CreateCircleModal,
		title: 'Modules/OrgChart/CreateCircleModal',
		tags: ['autodocs']
	});

	// Mock composable - CreateCircleModal only needs these props
	const mockCircles = {
		modals: { createCircle: true },
		loading: { createCircle: false },
		closeModal: (modal) => {
			console.log('Close modal:', modal);
			// Update mock state
			if (modal === 'createCircle') {
				mockCircles.modals.createCircle = false;
			}
		},
		createCircle: async (data) => {
			console.log('Create circle:', data);
			// Simulate loading
			mockCircles.loading.createCircle = true;
			await new Promise((resolve) => setTimeout(resolve, 500));
			mockCircles.loading.createCircle = false;
			mockCircles.modals.createCircle = false;
			return Promise.resolve();
		}
	};
</script>

<Story name="Default" args={{ circles: mockCircles }}>
	{#snippet template(args)}
		<CreateCircleModal circles={args.circles} />
	{/snippet}
</Story>

<Story
	name="WithParentCircles"
	args={{
		circles: mockCircles,
		availableCircles: [
			{ circleId: '1', name: 'Engineering' },
			{ circleId: '2', name: 'Product' }
		]
	}}
>
	{#snippet template(args)}
		<CreateCircleModal circles={args.circles} availableCircles={args.availableCircles} />
	{/snippet}
</Story>
