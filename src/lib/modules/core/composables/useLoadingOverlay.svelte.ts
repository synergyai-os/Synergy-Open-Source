import { browser } from '$app/environment';
import type { LoadingFlow } from '$lib/components/atoms/LoadingOverlay.svelte';

export type UseLoadingOverlayReturn = ReturnType<typeof useLoadingOverlay>;

export function useLoadingOverlay() {
	const state = $state({
		show: false,
		flow: 'custom' as LoadingFlow,
		title: '',
		subtitle: '',
		customStages: [] as string[]
	});

	function showOverlay(config: {
		flow?: LoadingFlow;
		title?: string;
		subtitle?: string;
		customStages?: string[];
	}) {
		if (!browser) return;
		state.show = true;
		state.flow = config.flow ?? 'custom';
		state.title = config.title ?? '';
		state.subtitle = config.subtitle ?? '';
		state.customStages = config.customStages ?? [];
	}

	function hideOverlay() {
		if (!browser) return;
		state.show = false;
	}

	return {
		get show() {
			return state.show;
		},
		get flow() {
			return state.flow;
		},
		get title() {
			return state.title;
		},
		get subtitle() {
			return state.subtitle;
		},
		get customStages() {
			return state.customStages;
		},
		showOverlay,
		hideOverlay
	};
}
