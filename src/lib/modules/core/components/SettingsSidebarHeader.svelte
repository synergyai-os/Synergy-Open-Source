<script lang="ts">
	type Props = {
		onBack?: () => void;
	};

	let { onBack }: Props = $props();
</script>

<!-- Sticky Header with Back Button -->
<div
	class="sticky top-0 z-10 flex h-system-header flex-shrink-0 items-center justify-between border-b border-sidebar bg-sidebar px-header py-system-header"
>
	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={() => onBack?.()}
			class="group flex items-center gap-2 text-sidebar-secondary transition-colors hover:text-sidebar-primary"
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
