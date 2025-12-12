<!-- Test fixture: CSS variable with hardcoded px (mixed case) -->
<!-- Expected: Should flag hardcoded px, but CSS variable part is OK -->

<div style="border: 2px solid var(--color-border-base);">
	<!-- ⚠️ Edge case: CSS variable (OK) but hardcoded 2px is violation -->
</div>
