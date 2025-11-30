<script lang="ts">
	import Avatar from '$lib/components/atoms/Avatar.svelte';
	import type { UserProfile } from '../api';

	type Props = {
		user: UserProfile | null | undefined;
		variant?: 'default' | 'brand';
		size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
		class?: string;
	};

	let { user, variant = 'default', size = 'md', class: className = '' }: Props = $props();

	/**
	 * Generate initials from user name or email
	 */
	function getInitials(user: UserProfile | null | undefined): string {
		if (!user) return '?';

		// Prefer name field if available
		if (user.name) {
			return (
				user.name
					.trim()
					.split(/\s+/)
					.filter(Boolean)
					.slice(0, 2)
					.map((part) => part[0]?.toUpperCase() ?? '')
					.join('') || user.name.slice(0, 2).toUpperCase()
			);
		}

		// Fall back to firstName + lastName
		if (user.firstName || user.lastName) {
			const first = user.firstName?.[0]?.toUpperCase() ?? '';
			const last = user.lastName?.[0]?.toUpperCase() ?? '';
			return first + last || '?';
		}

		// Fall back to email initials
		if (user.email) {
			return user.email.slice(0, 2).toUpperCase();
		}

		return '?';
	}

	const initials = $derived(getInitials(user));
	const imageUrl = $derived(user?.profileImageUrl);

	// Size mapping (matches Avatar.svelte)
	const sizeMap = {
		xxs: '1.25rem', // 20px
		xs: '1.5rem', // 24px
		sm: '2rem', // 32px
		md: '2.5rem', // 40px
		lg: '3rem' // 48px
	};
	const imageSize = $derived(sizeMap[size]);
</script>

{#if imageUrl}
	<img
		src={imageUrl}
		alt={user?.name || user?.email || 'User'}
		class="rounded-avatar {className}"
		style="width: {imageSize}; height: {imageSize};"
	/>
{:else}
	<Avatar {initials} {variant} {size} class={className} />
{/if}
