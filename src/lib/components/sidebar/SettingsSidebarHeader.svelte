<script lang="ts">
	type Props = {
		onBack?: () => void;
	};

	let { onBack }: Props = $props();
</script>

<!-- Sticky Header with Back Button -->
<div class="sticky top-0 z-10 bg-sidebar border-b border-sidebar px-header py-system-header flex items-center justify-between flex-shrink-0">
	<div class="flex items-center gap-icon">
		<button
			type="button"
			onclick={() => onBack?.()}
			class="flex items-center gap-icon text-sidebar-secondary hover:text-sidebar-primary transition-colors group"
		>
			<!-- Back Arrow Icon -->
			<svg
				class="w-4 h-4 flex-shrink-0"
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
			<span class="font-medium text-sm">Back</span>
		</button>
	</div>
</div>

