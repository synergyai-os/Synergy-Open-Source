<script lang="ts">
	/**
	 * TabbedPanel Component
	 *
	 * Generic molecule component that provides a reusable tabbed panel structure.
	 * Can be used in detail panels, settings pages, and other views that need tabs.
	 *
	 * Features:
	 * - Generic tabs configuration via props
	 * - Tab counts displayed in parentheses (optional)
	 * - Uses Bits UI Tabs with existing tab recipes
	 * - Content passed via snippet that receives tabId parameter
	 * - Sticky header with horizontal scroll
	 *
	 * Usage:
	 * <TabbedPanel
	 *   tabs={[
	 *     { id: 'overview', label: 'Overview' },
	 *     { id: 'members', label: 'Members', showCount: true },
	 *     { id: 'settings', label: 'Settings' },
	 *   ]}
	 *   bind:activeTab={activeTab}
	 *   tabCounts={{ members: 3 }}
	 * >
	 *   {#snippet content(tabId)}
	 *     {#if tabId === 'overview'}
	 *       <CircleOverview {circle} />
	 *     {:else if tabId === 'members'}
	 *       <EmptyState icon="users" title="No members yet" />
	 *     {/if}
	 *   {/snippet}
	 * </TabbedPanel>
	 */

	import type { Snippet } from 'svelte';
	import * as Tabs from '../atoms/Tabs.svelte';
	import {
		tabsListRecipe,
		tabsTriggerRecipe,
		tabsContentRecipe
	} from '../../design-system/recipes';
	import { useUrlSearchParamSync } from '../../composables/useUrlSearchParamSync.svelte';

	interface Tab {
		id: string;
		label: string;
		showCount?: boolean;
	}

	interface Props {
		tabs: Tab[];
		activeTab: string;
		/**
		 * Optional: when provided, the active tab is synced to/from the URL query string.
		 * Use a unique key per TabbedPanel instance on a page (e.g. "circleTab", "roleTab").
		 */
		urlParam?: string;
		/**
		 * Whether tab changes create browser history entries ("push") or update in place ("replace").
		 * Default: "replace".
		 */
		urlHistoryMode?: 'push' | 'replace';
		/**
		 * When true, removes the param from the URL when activeTab is the default tab.
		 * Default: true.
		 */
		clearUrlWhenDefault?: boolean;
		/**
		 * Optional callback fired when a tab trigger is clicked.
		 * Most consumers can rely on `bind:activeTab` alone.
		 */
		onTabChange?: (tab: string) => void;
		tabCounts?: Record<string, number>;
		content: Snippet<[string]>; // Receives tabId parameter
	}

	const noop = (_tab: string) => {};

	let {
		tabs,
		activeTab = $bindable(),
		urlParam,
		urlHistoryMode = 'replace',
		clearUrlWhenDefault = true,
		onTabChange = noop,
		tabCounts = {},
		content
	}: Props = $props();

	const defaultTabId = $derived.by(() => tabs[0]?.id ?? activeTab);

	function isValidTabId(tabId: string): boolean {
		return tabs.some((t) => t.id === tabId);
	}

	// Keep activeTab valid if tabs change dynamically
	$effect(() => {
		if (tabs.length === 0) return;
		if (!isValidTabId(activeTab)) {
			activeTab = defaultTabId;
		}
	});

	// Optional URL sync for the active tab (initialized once)
	if (urlParam) {
		useUrlSearchParamSync<string>({
			param: urlParam,
			historyMode: urlHistoryMode,
			isReady: () => tabs.length > 0,
			getValue: () => activeTab,
			setValue: (value) => {
				activeTab = value;
			},
			parse: (raw) => {
				if (!raw) return null;
				return isValidTabId(raw) ? raw : null;
			},
			serialize: (value) => {
				if (clearUrlWhenDefault && value === defaultTabId) return null;
				return value;
			}
		});
	}

	// Get count for a tab (default 0)
	function getCount(tabId: string): number {
		return tabCounts[tabId] ?? 0;
	}
</script>

<Tabs.Root bind:value={activeTab}>
	<!-- Navigation Tabs - Sticky at top -->
	<div class="bg-surface px-page sticky top-0 z-10">
		<Tabs.List class={[tabsListRecipe(), 'gap-form flex flex-shrink-0 overflow-x-auto']}>
			{#each tabs as tab (tab.id)}
				<Tabs.Trigger
					value={tab.id}
					class={[tabsTriggerRecipe({ active: activeTab === tab.id }), 'flex-shrink-0']}
					onclick={() => onTabChange(tab.id)}
				>
					{#if tab.showCount}
						<span class="gap-button flex items-center">
							<span>{tab.label}</span>
							{#if getCount(tab.id) > 0}
								<span class="text-label text-tertiary">({getCount(tab.id)})</span>
							{/if}
						</span>
					{:else}
						{tab.label}
					{/if}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</div>

	<!-- Tab Content -->
	<div class="px-page py-page flex-1 overflow-y-auto">
		{#each tabs as tab (tab.id)}
			<Tabs.Content value={tab.id} class={tabsContentRecipe()}>
				{@render content(tab.id)}
			</Tabs.Content>
		{/each}
	</div>
</Tabs.Root>
