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
	import { Button, Text, Icon, Avatar } from '$lib/components/atoms';

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
	<Button
		variant="primary"
		size="sm"
		onclick={toggleDropdown}
		title="Click to view or change secretary"
	>
		<span>{currentSecretaryName}</span>
		<svg
			class="icon-sm transition-transform {isOpen ? 'rotate-180' : ''}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</Button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			class="border-border-base absolute top-full right-0 z-50 rounded-card border bg-elevated shadow-card"
			style="margin-top: var(--spacing-2); width: 16rem;"
		>
			<div class="p-menu-md">
				<div class="px-header mb-fieldGroup py-stack-sectionHeader">
					<Text variant="label" color="tertiary" as="span" class="font-medium">
						Request Secretary Change
					</Text>
				</div>

				<div class="space-y-meeting-avatar-gap">
					{#each userAttendees as attendee (attendee._id)}
						{@const isCurrentSecretary = attendee.userId === currentSecretaryId}
						{@const isSelf = attendee.userId === currentUserId}

						<button
							onclick={() => handleSelectSecretary(attendee.userId, attendee.userName || 'Unknown')}
							disabled={isCurrentSecretary}
							class="text-body-sm px-header flex w-full items-center justify-between rounded-button text-left transition-colors {isCurrentSecretary
								? 'bg-accent-primary/10 text-accent-primary cursor-default'
								: 'text-text-primary cursor-pointer hover:bg-subtle'}"
							style="padding-block: var(--spacing-2);"
						>
							<span class="p-menu-md flex items-center gap-fieldGroup">
								<!-- Avatar placeholder -->
								<Avatar
									initials={(attendee.userName || 'U')[0].toUpperCase()}
									size="sm"
									variant={isCurrentSecretary ? 'brand' : 'default'}
								/>
								<span>
									{attendee.userName || 'Unknown'}
									{#if isSelf}
										<Text variant="body" size="sm" color="tertiary" as="span">(You)</Text>
									{/if}
								</span>
							</span>

							{#if isCurrentSecretary}
								<Icon type="check" size="sm" />
							{/if}
						</button>
					{/each}
				</div>

				<div class="mt-meeting-card border-border-base pt-meeting-card border-t">
					<Text variant="label" color="tertiary" as="p" class="px-header">
						Click any attendee to request a secretary change. Current secretary will confirm.
					</Text>
				</div>
			</div>
		</div>
	{/if}
</div>
