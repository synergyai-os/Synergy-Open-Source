<script lang="ts" module>
	import { Slider as BitsSlider } from 'bits-ui';

	// Re-export all Slider sub-components
	// Usage: import * as Slider from '$lib/components/ui/Slider.svelte'
	// Then: <Slider.Root> <Slider.Range> <Slider.Thumb> ...

	export const Root = BitsSlider.Root;
	export const Range = BitsSlider.Range;
	export const Thumb = BitsSlider.Thumb;
	export const Tick = BitsSlider.Tick;
</script>

<!-- No default export - use module-level exports above -->
