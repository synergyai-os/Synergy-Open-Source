<script lang="ts" module>
	import { Accordion as BitsAccordion } from 'bits-ui';

	// Re-export all Accordion sub-components
	// Usage: import * as Accordion from '$lib/components/ui/Accordion.svelte'
	// Then: <Accordion.Root> <Accordion.Item> <Accordion.Trigger class="px-accordion py-accordion"> ...

	export const Root = BitsAccordion.Root;
	export const Item = BitsAccordion.Item;
	export const Header = BitsAccordion.Header;
	export const Trigger = BitsAccordion.Trigger;
	export const Content = BitsAccordion.Content;
</script>

<!-- No default export - use module-level exports above -->
<!-- 
Example usage:
<Accordion.Root>
  <Accordion.Item value="item-1">
    <Accordion.Header>
      <Accordion.Trigger class="flex w-full items-center justify-between px-accordion py-accordion hover:bg-hover-solid border-b border-base">
        Trigger text
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content class="px-accordion py-accordion gap-accordion flex flex-col">
      Content here
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
-->
