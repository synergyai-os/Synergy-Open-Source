<script lang="ts">
	import { Avatar, Text, Button } from '$lib/components/atoms';

	type Props = {
		invite: {
			inviteId: string;
			organizationName: string;
			role: string;
			invitedBy: string;
			code: string;
		};
		onAccept?: (code: string) => void;
		onDecline?: (inviteId: string) => void;
		onClose?: () => void;
		class?: string;
	};

	let { invite, onAccept, onDecline, onClose, class: className = '' }: Props = $props();
</script>

<div class="mx-1 rounded-button px-input py-stack-item {className}">
	<div class="flex items-start gap-fieldGroup">
		<Avatar
			initials={invite.organizationName.slice(0, 2).toUpperCase()}
			size="sm"
			variant="default"
			class="flex-shrink-0"
		/>
		<div class="min-w-0 flex-1">
			<div class="flex items-center justify-between gap-header">
				<Text variant="body" size="sm" color="default" as="span" class="truncate font-medium">
					{invite.organizationName}
				</Text>
				<Text variant="label" size="sm" color="tertiary" as="span">
					{invite.role}
				</Text>
			</div>
			<Text variant="label" size="sm" color="secondary" as="p" class="truncate">
				Invited by {invite.invitedBy}
			</Text>
			<div class="flex gap-header mt-fieldGroup">
				<Button
					variant="solid"
					size="sm"
					onclick={() => {
						onAccept?.(invite.code);
						onClose?.();
					}}
				>
					Accept
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						onDecline?.(invite.inviteId);
						onClose?.();
					}}
				>
					Decline
				</Button>
			</div>
		</div>
	</div>
</div>
