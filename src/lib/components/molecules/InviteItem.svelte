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

<div class="rounded-button px-input py-stack-item mx-1 {className}">
	<div class="gap-fieldGroup flex items-start">
		<Avatar
			initials={invite.organizationName.slice(0, 2).toUpperCase()}
			size="sm"
			variant="default"
			class="flex-shrink-0"
		/>
		<div class="min-w-0 flex-1">
			<div class="gap-header flex items-center justify-between">
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
			<div class="gap-header mt-fieldGroup flex">
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
