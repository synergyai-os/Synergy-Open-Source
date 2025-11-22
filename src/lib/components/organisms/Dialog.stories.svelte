<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Dialog from './Dialog.svelte';
	import DialogContent from './Dialog.svelte';
	import Button from '../atoms/Button.svelte';

	const { Story } = defineMeta({
		component: Dialog.Root,
		title: 'Design System/Organisms/Dialog',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'wide', 'fullscreen']
			}
		}
	});
</script>

<Story name="Default" args={{ open: false, variant: 'default' }}>
	{#snippet template(args)}
		<Dialog.Root open={args.open}>
			<Dialog.Trigger>
				<Button>Open Dialog</Button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
				<DialogContent variant={args.variant}>
					<Dialog.Title>Dialog Title</Dialog.Title>
					<Dialog.Description>Dialog description goes here.</Dialog.Description>
					<p class="text-primary">Dialog content</p>
					<div class="mt-4 flex gap-2">
						<Dialog.Close>
							<Button variant="outline">Cancel</Button>
						</Dialog.Close>
						<Dialog.Close>
							<Button>Confirm</Button>
						</Dialog.Close>
					</div>
				</DialogContent>
			</Dialog.Portal>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="Wide" args={{ open: false, variant: 'wide' }}>
	{#snippet template(args)}
		<Dialog.Root open={args.open}>
			<Dialog.Trigger>
				<Button>Open Wide Dialog</Button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
				<DialogContent variant={args.variant}>
					<Dialog.Title>Wide Dialog</Dialog.Title>
					<Dialog.Description>This is a wide dialog variant.</Dialog.Description>
					<p class="text-primary">More content here...</p>
					<div class="mt-4 flex gap-2">
						<Dialog.Close>
							<Button>Close</Button>
						</Dialog.Close>
					</div>
				</DialogContent>
			</Dialog.Portal>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="Fullscreen" args={{ open: false, variant: 'fullscreen' }}>
	{#snippet template(args)}
		<Dialog.Root open={args.open}>
			<Dialog.Trigger>
				<Button>Open Fullscreen Dialog</Button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
				<DialogContent variant={args.variant}>
					<Dialog.Title>Fullscreen Dialog</Dialog.Title>
					<Dialog.Description>This is a fullscreen dialog variant.</Dialog.Description>
					<p class="text-primary">Fullscreen content...</p>
					<div class="mt-4 flex gap-2">
						<Dialog.Close>
							<Button>Close</Button>
						</Dialog.Close>
					</div>
				</DialogContent>
			</Dialog.Portal>
		</Dialog.Root>
	{/snippet}
</Story>
