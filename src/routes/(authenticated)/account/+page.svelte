<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { UserProfile } from '$lib/infrastructure/users/components/UserProfile.svelte';
	import type { LinkedAccount } from '$lib/infrastructure/users/api';
	import type { UserProfile as UserProfileType } from '$lib/infrastructure/users/api';

	let { data } = $props();

	// Get current user from parent data
	const currentUser = $derived(data.user as UserProfileType | null);
	const linkedAccounts = $derived((data.linkedAccounts ?? []) as LinkedAccount[]);

	// Convex client for queries
	const convexClient = browser ? useConvexClient() : null;

	// Load full user profile
	let userProfile: UserProfileType | null = $state(null);

	onMount(async () => {
		if (!browser || !convexClient || !data.sessionId) return;

		try {
			// Load current user profile
			if (currentUser?.userId) {
				const profile = await convexClient.query(api.users.getUserById, {
					sessionId: data.sessionId,
					userId: currentUser.userId
				});
				userProfile = profile as UserProfileType | null;
			}
		} catch (error) {
			console.error('Failed to load user profile:', error);
		}
	});
</script>

<svelte:head>
	<title>Account - SynergyOS</title>
</svelte:head>

<div class="h-screen overflow-y-auto bg-base">
	<div class="px-inbox-container py-inbox-container mx-auto max-w-4xl">
		<!-- Page Title -->
		<h1 class="mb-content-section text-h1 font-bold text-primary">Account</h1>

		<div class="gap-settings-section flex flex-col">
			<!-- Profile Section -->
			<section class="border-base rounded-card border bg-elevated">
				<div class="px-inbox-card py-inbox-card">
					<h2 class="mb-content-padding text-body font-bold text-primary">Profile</h2>

					<div class="gap-settings-row flex flex-col">
						<div class="border-base px-settings-row py-settings-row border-b last:border-b-0">
							<div class="flex items-start gap-4">
								{#if userProfile}
									<UserProfile user={userProfile} showEmail={true} avatarSize="lg" />
								{:else if currentUser}
									<UserProfile user={currentUser} showEmail={true} avatarSize="lg" />
								{/if}
							</div>
						</div>

						<!-- Email -->
						<div class="border-base px-settings-row py-settings-row border-b last:border-b-0">
							<div class="gap-settings-row flex items-start justify-between">
								<div class="min-w-0 flex-1">
									<label class="mb-form-field-gap text-small block font-medium text-primary">
										Email
									</label>
									<p class="text-small text-secondary">
										{userProfile?.email ?? currentUser?.email ?? 'Not available'}
									</p>
								</div>
							</div>
						</div>

						<!-- Email Verification Status -->
						{#if userProfile?.emailVerified === false}
							<div class="border-base px-settings-row py-settings-row border-b last:border-b-0">
								<div class="gap-settings-row flex items-start justify-between">
									<div class="min-w-0 flex-1">
										<label class="mb-form-field-gap text-small block font-medium text-primary">
											Email Verification
										</label>
										<p class="text-small text-warning">
											Your email address has not been verified. Please check your inbox for a
											verification email.
										</p>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</section>

			<!-- Linked Accounts Section -->
			{#if linkedAccounts.length > 0}
				<section class="border-base rounded-card border bg-elevated">
					<div class="px-inbox-card py-inbox-card">
						<h2 class="mb-content-padding text-body font-bold text-primary">Linked Accounts</h2>

						<div class="gap-settings-row flex flex-col">
							{#each linkedAccounts as account (account.userId)}
								<div class="border-base px-settings-row py-settings-row border-b last:border-b-0">
									<div class="gap-settings-row flex items-start justify-between">
										<div class="min-w-0 flex-1">
											<label class="mb-form-field-gap text-small block font-medium text-primary">
												{account.name ?? account.email ?? 'Linked Account'}
											</label>
											<p class="text-small text-secondary">
												{account.email ?? 'No email available'}
												{#if account.linkType}
													<span class="ml-2 text-tertiary">({account.linkType})</span>
												{/if}
											</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</section>
			{/if}

			<!-- Security Section -->
			<section class="border-base rounded-card border bg-elevated">
				<div class="px-inbox-card py-inbox-card">
					<h2 class="mb-content-padding text-body font-bold text-primary">Security</h2>

					<div class="gap-settings-row flex flex-col">
						<!-- Password Management -->
						<div class="border-base px-settings-row py-settings-row border-b last:border-b-0">
							<div class="gap-settings-row flex items-start justify-between">
								<div class="min-w-0 flex-1">
									<label class="mb-form-field-gap text-small block font-medium text-primary">
										Password
									</label>
									<p class="text-small text-secondary">
										Manage your password and authentication settings through WorkOS.
									</p>
								</div>
								<div class="flex flex-shrink-0 items-center">
									<a
										href="https://dashboard.workos.com/"
										target="_blank"
										rel="noopener noreferrer"
										class="text-small hover:text-accent-hover text-accent-primary underline transition-colors"
									>
										Manage Password
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</div>
