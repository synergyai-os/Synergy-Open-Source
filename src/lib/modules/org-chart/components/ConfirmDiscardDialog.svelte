<script lang="ts">
	import * as AlertDialog from '$lib/components/organisms/AlertDialog.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Heading from '$lib/components/atoms/Heading.svelte';
	import Text from '$lib/components/atoms/Text.svelte';

	type Props = {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onConfirm: () => void;
	};

	let { open, onOpenChange, onConfirm }: Props = $props();

	function handleConfirm() {
		onConfirm();
		onOpenChange(false);
	}

	function handleCancel() {
		onOpenChange(false);
	}
</script>

<AlertDialog.Root {open} {onOpenChange}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay class="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm" />
		<AlertDialog.Content
			class="border-base p-modal rounded-card bg-elevated shadow-card fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 border"
		>
			<AlertDialog.Title>
				<Heading level={2}>Discard unsaved changes?</Heading>
			</AlertDialog.Title>
			<AlertDialog.Description>
				<Text variant="body" size="md" color="secondary" class="mb-section">
					You have unsaved changes. Are you sure you want to discard them?
				</Text>
			</AlertDialog.Description>
			<div class="gap-button flex justify-end">
				<AlertDialog.Cancel>
					<Button variant="outline" onclick={handleCancel}>Keep Editing</Button>
				</AlertDialog.Cancel>
				<AlertDialog.Action>
					<Button variant="destructive" onclick={handleConfirm}>Discard</Button>
				</AlertDialog.Action>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
