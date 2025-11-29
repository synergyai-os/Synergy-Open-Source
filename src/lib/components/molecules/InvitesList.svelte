<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Text } from '$lib/components/atoms';
	import InviteItem from './InviteItem.svelte';

	type WorkspaceInvite = {
		inviteId: string;
		organizationName: string;
		role: string;
		invitedBy: string;
		code: string;
	};

	type Props = {
		invites: WorkspaceInvite[];
		onAccept?: (code: string) => void;
		onDecline?: (inviteId: string) => void;
		onClose?: () => void;
		class?: string;
	};

	let { invites, onAccept, onDecline, onClose, class: className = '' }: Props = $props();
</script>

{#if invites.length > 0}
	<DropdownMenu.Separator class="border-base my-stack-divider border-t" />
	<div class="px-input py-stack-header">
		<Text
			variant="label"
			size="sm"
			color="tertiary"
			as="p"
			class="font-semibold tracking-wide uppercase"
		>
			Organization invites
		</Text>
	</div>
	{#each invites as invite (invite.inviteId)}
		<InviteItem {invite} {onAccept} {onDecline} {onClose} class={className} />
	{/each}
{/if}
