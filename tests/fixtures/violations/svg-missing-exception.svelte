<!-- Test fixture: SVG with hardcoded dimensions but no SYOS-522 exception -->
<!-- Expected: Should flag missing SYOS-522 exception comment -->

<script lang="ts">
	// Missing SYOS-522 exception comment
	type Props = {
		size?: 'sm' | 'md' | 'lg';
	};

	let { size = 'md' }: Props = $props();
</script>

<svg width="16px" height="16px">
	<circle cx="8" cy="8" r="6" />
</svg>
