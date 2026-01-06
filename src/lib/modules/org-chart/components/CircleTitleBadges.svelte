<script lang="ts">
	import LeadAuthorityBadge from './LeadAuthorityBadge.svelte';
	import type { LeadAuthority } from '$lib/infrastructure/organizational-model/constants';

	interface Props {
		leadAuthority: LeadAuthority;
	}

	let { leadAuthority }: Props = $props();
</script>

<div class="gap-button flex items-center">
	<LeadAuthorityBadge {leadAuthority} />
</div>
