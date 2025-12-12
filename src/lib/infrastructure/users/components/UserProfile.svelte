<script lang="ts">
	import UserAvatar from './UserAvatar.svelte';
	import type { UserProfile } from '../api';

	type Props = {
		user: UserProfile | null | undefined;
		showEmail?: boolean;
		avatarSize?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
		class?: string;
	};

	let { user, showEmail = true, avatarSize = 'md', class: className = '' }: Props = $props();

	const displayName = $derived(
		user?.name ||
			(user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
			user?.firstName ||
			user?.lastName ||
			user?.email ||
			'Unknown User'
	);
</script>

<div class="gap-button flex items-center {className}">
	<UserAvatar {user} size={avatarSize} />
	<div class="flex flex-col">
		<span class="text-body text-primary font-medium">{displayName}</span>
		{#if showEmail && user?.email}
			<span class="text-label text-secondary">{user.email}</span>
		{/if}
	</div>
</div>
