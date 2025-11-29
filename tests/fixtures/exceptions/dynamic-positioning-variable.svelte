<!-- Test fixture: Dynamic positioning with variable (acceptable exception) -->
<!-- Expected: Should skip (acceptable exception) -->

<script lang="ts">
	let position = $state({ top: 100, left: 200 });
</script>

<div style="top: {position.top}px; left: {position.left}px;">
	<!-- ✅ Acceptable: Variable reference, not hardcoded multiplier -->
	Dynamic positioning
</div>
