<script lang="ts">
	/**
	 * Secretary Selector Component
	 *
	 * Dropdown to view/change meeting secretary
	 * - Shows current secretary with badge
	 * - Lists all attendees (user type only)
	 * - Click to request secretary change
	 * - Current secretary gets confirmation dialog
	 */

	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { toast } from 'svelte-sonner';

	interface Attendee {
		_id: Id<'meetingAttendees'>;
		attendeeType: 'user' | 'role' | 'circle' | 'team';
		userId?: Id<'users'>;
		userName?: string;
	}

	interface Props {
		meetingId: Id<'meetings'>;
		sessionId: string;
		currentSecretaryId: Id<'users'>;
		currentSecretaryName: string;
		currentUserId: Id<'users'>;
		attendees: Attendee[];
	}

	const {
		meetingId,
		sessionId,
		currentSecretaryId,
		currentSecretaryName,
		currentUserId,
		attendees
	}: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	let isOpen = $state(false);

	// Filter to only user attendees
	const userAttendees = $derived(
		attendees.filter((a) => a.attendeeType === 'user' && a.userId) as (Attendee & {
			userId: Id<'users'>;
		})[]
	);

	async function handleSelectSecretary(newSecretaryId: Id<'users'>, newSecretaryName: string) {
		if (!convexClient) return;

		try {
			// Request secretary change - current secretary will get confirmation dialog
			await convexClient.mutation(api.meetings.requestSecretaryChange, {
				sessionId,
				meetingId,
				requestedForId: newSecretaryId
			});

			if (newSecretaryId === currentUserId) {
				toast.success('Request sent to current secretary');
			} else {
				toast.success(`Request sent to assign ${newSecretaryName} as secretary`);
			}

			isOpen = false;
		} catch (error) {
			console.error('Failed to request secretary change:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to request secretary change');
		}
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('[data-secretary-selector]')) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (browser && isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="relative" data-secretary-selector>
	<!-- Trigger Button -->
	<button
		onclick={toggleDropdown}
		class="flex items-center gap-2 rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		title="Click to view or change secretary"
	>
		<span>{currentSecretaryName}</span>
		<svg
			class="h-4 w-4 transition-transform {isOpen ? 'rotate-180' : ''}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			class="absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border border-border-base bg-elevated shadow-lg"
		>
			<div class="p-2">
				<div class="mb-2 px-3 py-2 text-xs font-medium text-text-tertiary">
					Request Secretary Change
				</div>

				<div class="space-y-1">
					{#each userAttendees as attendee (attendee._id)}
						{@const isCurrentSecretary = attendee.userId === currentSecretaryId}
						{@const isSelf = attendee.userId === currentUserId}

						<button
							onclick={() => handleSelectSecretary(attendee.userId, attendee.userName || 'Unknown')}
							disabled={isCurrentSecretary}
							class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors {isCurrentSecretary
								? 'cursor-default bg-accent-primary/10 text-accent-primary'
								: 'hover:bg-surface-hover cursor-pointer text-text-primary'}"
						>
							<span class="flex items-center gap-2">
								<!-- Avatar placeholder -->
								<div
									class="flex h-6 w-6 items-center justify-center rounded-full {isCurrentSecretary
										? 'bg-accent-primary text-white'
										: 'bg-surface-hover text-text-secondary'}"
								>
									{(attendee.userName || 'U')[0].toUpperCase()}
								</div>
								<span>
									{attendee.userName || 'Unknown'}
									{#if isSelf}
										<span class="text-text-tertiary">(You)</span>
									{/if}
								</span>
							</span>

							{#if isCurrentSecretary}
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{/if}
						</button>
					{/each}
				</div>

				<div class="mt-2 border-t border-border-base pt-2">
					<p class="px-3 text-xs text-text-tertiary">
						Click any attendee to request a secretary change. Current secretary will confirm.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
