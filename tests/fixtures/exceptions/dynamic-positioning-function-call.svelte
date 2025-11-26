<!-- Test fixture: Dynamic positioning with function call (acceptable exception) -->
<!-- Expected: Should skip (acceptable exception) -->

<script lang="ts">
	function adjustedX() {
		return 100;
	}

	function adjustedY() {
		return 200;
	}
</script>

<div style="left: {adjustedX()}px; top: {adjustedY()}px;">
	<!-- ✅ Acceptable: Function call, not hardcoded multiplier -->
	Dynamic positioning
</div>

