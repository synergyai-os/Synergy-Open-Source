<script lang="ts" module>
	import { Tabs as BitsTabs } from 'bits-ui';

	// Re-export all Tabs sub-components
	// Usage: import * as Tabs from '$lib/components/ui'
	// Then: <Tabs.Root> <Tabs.List> <Tabs.Trigger class="px-tab py-tab rounded-tab-item"> ...
	// See SYOS-392 for refactoring pattern

	export const Root = BitsTabs.Root;
	export const List = BitsTabs.List;
	export const Trigger = BitsTabs.Trigger;
	export const Content = BitsTabs.Content;
</script>

<!-- No default export - use module-level exports above -->
<!-- 
Example usage:
<Tabs.Root bind:value={activeTab}>
  <Tabs.List class="rounded-tab-container size-tab">
    <Tabs.Trigger value="overview" class="px-tab py-tab rounded-tab-item">
      Overview
    </Tabs.Trigger>
    <Tabs.Trigger value="analytics" class="px-tab py-tab rounded-tab-item">
      Analytics
    </Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">
    Overview content
  </Tabs.Content>
  <Tabs.Content value="analytics">
    Analytics content
  </Tabs.Content>
</Tabs.Root>
-->
