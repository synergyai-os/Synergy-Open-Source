<script lang="ts">
	type Props = {
		onBack?: () => void;
	};

	let { onBack }: Props = $props();
</script>

<!-- Sticky Header with Back Button -->
<div
	class="h-system-header border-sidebar bg-sidebar px-header py-system-header sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b"
>
	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={() => onBack?.()}
			class="group text-sidebar-secondary hover:text-sidebar-primary flex items-center gap-2 transition-colors"
		>
			<!-- Back Arrow Icon -->
			<svg
				class="icon-sm flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			<span class="text-sm font-medium">Back</span>
		</button>
	</div>
</div>
