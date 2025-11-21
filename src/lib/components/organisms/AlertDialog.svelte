<script lang="ts" module>
	import { AlertDialog as BitsAlertDialog } from 'bits-ui';

	// Re-export all AlertDialog sub-components
	// Usage: import * as AlertDialog from '$lib/components/ui/AlertDialog.svelte'
	// Then: <AlertDialog.Root> <AlertDialog.Trigger> <AlertDialog.Content class="p-modal"> ...

	export const Root = BitsAlertDialog.Root;
	export const Trigger = BitsAlertDialog.Trigger;
	export const Portal = BitsAlertDialog.Portal;
	export const Overlay = BitsAlertDialog.Overlay;
	export const Content = BitsAlertDialog.Content;
	export const Title = BitsAlertDialog.Title;
	export const Description = BitsAlertDialog.Description;
	export const Action = BitsAlertDialog.Action;
	export const Cancel = BitsAlertDialog.Cancel;
</script>

<!-- No default export - use module-level exports above -->
