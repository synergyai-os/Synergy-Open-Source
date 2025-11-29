<!-- Test fixture: Hardcoded multiplier in dynamic positioning -->
<!-- Expected: Should flag hardcoded multiplier (48) -->

<script lang="ts">
	let items = $state([1, 2, 3, 4, 5]);
</script>

{#each items as item, index}
	<div style="left: {index * 48}px;">
		<!-- ❌ Violation: Hardcoded multiplier 48 -->
		Item {index}
	</div>
{/each}
