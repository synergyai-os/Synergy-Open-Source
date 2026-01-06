<script lang="ts">
	import Header from '$lib/modules/core/components/Header.svelte';
	import WaitlistForm from '$lib/modules/core/components/WaitlistForm.svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { resolveRoute } from '$lib/utils/navigation';

	let { data } = $props();

	// Detect motion preference
	let prefersReducedMotion = $state(false);

	// Get waitlist count
	const waitlistCountQuery = useQuery(api.features.waitlist.index.getWaitlistCount, () => ({}));
	const waitlistCount = $derived(waitlistCountQuery?.data ?? 0);

	onMount(() => {
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = mediaQuery.matches;
		}
	});

	// Real pain points - Stuck in delivery mode
	const painPoints = [
		{
			emoji: '🚚',
			title: 'Focused on Shipping, Not Impact',
			description:
				'Your team ships features on time, but nobody can answer: "What problem did this solve?" or "What outcome did we achieve?"'
		},
		{
			emoji: '📊',
			title: 'Stakeholders Ask the Wrong Questions',
			description:
				'"When will it ship?" instead of "What impact will it have?" Your tools reinforce deadlines, not outcomes.'
		},
		{
			emoji: '🔀',
			title: 'Context Scattered Everywhere',
			description:
				"Notion for docs, Linear for tasks, Slack for decisions. You own deliverables, but you don't own outcomes."
		},
		{
			emoji: '🔍',
			title: "Knowledge Lives in People's Heads",
			description:
				'New members ask: "Why did we build this?" Nobody remembers. Decisions aren\'t captured. Outcomes aren\'t tracked.'
		}
	];

	// Key differentiators
	const differentiators = [
		{
			emoji: '🔐',
			title: 'Privacy-First',
			description:
				'Self-hosted or cloud. Bring-your-own AI (OpenAI, Claude, local LLMs). Export your data anytime. Your data, your control.'
		},
		{
			emoji: '👥',
			title: 'Built by a Community',
			description:
				'Not a company selling software. A community of builders creating the tool we all need. Contribute ideas and feedback.'
		},
		{
			emoji: '📚',
			title: 'Learning in Public',
			description:
				"We're figuring out AI-era product development together. Transparent. No hidden mistakes. Follow the journey."
		},
		{
			emoji: '🎯',
			title: 'Outcome-Driven by Design',
			description:
				'Not just flexible—opinionated. Built-in frameworks for OKRs, discovery, and delivery. Guides you to work better.'
		}
	];
</script>

<svelte:head>
	<title>SynergyOS - The Product OS</title>
	<meta
		name="description"
		content="The platform product teams wish existed—integrating discovery, delivery, collaboration, and AI coaching. Privacy-first, community-driven."
	/>
</svelte:head>

<Header isAuthenticated={data.isAuthenticated} />

<div class="homepage-layout">
	<!-- Hero Section -->
	<section class="hero-section bg-surface">
		<div
			class="hero-content px-inbox-container max-w-readable mx-auto text-center"
			style="padding-block: var(--spacing-8);"
		>
			<!-- Social Proof Badges -->
			<div
				class="trust-badges"
				in:fly={{
					y: -20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				<div class="trust-badge">
					<span>🚀</span>
					<span>Built with AI</span>
				</div>
				<div class="trust-badge">
					<span>🔐</span>
					<span>Privacy-First</span>
				</div>
				<div class="trust-badge">
					<span>📤</span>
					<span>Export Anytime</span>
				</div>
			</div>

			<!-- Headline -->
			<h1
				class="hero-title text-primary"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 200,
					easing: quintOut
				}}
			>
				The <span class="gradient-text-enhanced">Product OS</span>
			</h1>

			<!-- Subheading -->
			<p
				class="hero-lead text-secondary"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 300,
					easing: quintOut
				}}
			>
				One platform for product teams. Outcome-driven by design. Integrates your tools. Built in
				the open by builders learning together. <strong class="text-primary">Join us.</strong>
			</p>

			<!-- Hero CTA -->
			<div
				class="hero-cta-group"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 400,
					easing: quintOut
				}}
			>
				<a href="#waitlist" class="cta-primary">
					<span>Build With Us</span>
					<span class="cta-badge">Join Builders</span>
				</a>
			</div>
		</div>
	</section>

	<!-- Pain Points Section -->
	<section class="pain-section bg-elevated">
		<div
			class="section-content px-inbox-container mx-auto max-w-5xl"
			style="padding-block: var(--spacing-8);"
		>
			<h2
				class="section-title text-primary text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				Product Teams Are Stuck in Delivery Mode
			</h2>
			<p
				class="section-lead text-secondary text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 150,
					easing: quintOut
				}}
			>
				Your tools reinforce the wrong behaviors—shipping features on deadlines, not solving
				problems with impact
			</p>

			<div class="pain-grid gap-inbox-list">
				{#each painPoints as pain, i (pain.title)}
					<div
						class="pain-card bg-surface"
						in:fly={{
							y: 30,
							duration: prefersReducedMotion ? 0 : 300,
							delay: prefersReducedMotion ? 0 : 200 + i * 100,
							easing: quintOut
						}}
					>
						<span class="pain-emoji">{pain.emoji}</span>
						<h3 class="pain-title text-primary">{pain.title}</h3>
						<p class="pain-description text-secondary">{pain.description}</p>
					</div>
				{/each}
			</div>

			<div
				class="pain-footer text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 500,
					easing: quintOut
				}}
			>
				<p class="text-secondary">
					Sound familiar? <a href="#waitlist" class="inline-cta">Let's fix this together</a>
				</p>
			</div>
		</div>
	</section>

	<!-- Vision Section -->
	<section class="vision-section bg-elevated">
		<div
			class="section-content px-inbox-container mx-auto max-w-4xl"
			style="padding-block: var(--spacing-8);"
		>
			<div class="vision-content">
				<!-- Title -->
				<div
					class="vision-header text-center"
					in:fly={{
						y: 20,
						duration: prefersReducedMotion ? 0 : 400,
						delay: prefersReducedMotion ? 0 : 100,
						easing: quintOut
					}}
				>
					<h2 class="section-title text-primary">Why We're Building This</h2>
				</div>

				<!-- Intro Statement -->
				<div
					class="vision-intro bg-surface"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 400,
						delay: prefersReducedMotion ? 0 : 200,
						easing: quintOut
					}}
				>
					<p class="vision-intro-text text-primary">
						We're building the product platform that should exist.
					</p>
					<p class="vision-intro-subtext text-secondary">
						In our daily work with product teams and clients, we see the same problem: existing
						tools reinforce delivery mode (features, deadlines) instead of outcome mode (problems,
						impact). So we're building what's missing—in the open, as a community.
					</p>
				</div>

				<!-- Two Reasons -->
				<div class="vision-grid">
					<div
						class="vision-card bg-elevated"
						in:fly={{
							y: 30,
							duration: prefersReducedMotion ? 0 : 400,
							delay: prefersReducedMotion ? 0 : 300,
							easing: quintOut
						}}
					>
						<div class="vision-card-number">01</div>
						<h3 class="vision-card-title text-primary">Solve Our Own Problem</h3>
						<p class="vision-card-description text-secondary">
							We work on products every day. We need a platform that creates alignment, tracks
							outcomes, and integrates our tools—Notion, Linear, Slack. It doesn't exist. So we're
							building it.
						</p>
					</div>

					<div
						class="vision-card bg-elevated"
						in:fly={{
							y: 30,
							duration: prefersReducedMotion ? 0 : 400,
							delay: prefersReducedMotion ? 0 : 400,
							easing: quintOut
						}}
					>
						<div class="vision-card-number">02</div>
						<h3 class="vision-card-title text-primary">Build a Community of Builders</h3>
						<p class="vision-card-description text-secondary">
							This isn't a solo project. We're learning AI-era product development together—in the
							open, transparently. Join us. Contribute. Shape what product tools should be.
						</p>
					</div>
				</div>

				<!-- CTA -->
				<div
					class="vision-footer text-center"
					in:fly={{
						y: 20,
						duration: prefersReducedMotion ? 0 : 400,
						delay: prefersReducedMotion ? 0 : 500,
						easing: quintOut
					}}
				>
					<p class="vision-cta text-secondary">
						If you work on products and want better tools—or you're a builder who wants to shape the
						future of product platforms—<strong class="text-primary"
							>join us. Build with us. Learn with us.</strong
						>
					</p>
					<a href="#waitlist" class="cta-button-secondary">Build With Us</a>
				</div>
			</div>
		</div>
	</section>

	<!-- What It Is Section -->
	<section class="what-section bg-surface">
		<div
			class="section-content px-inbox-container mx-auto max-w-4xl"
			style="padding-block: var(--spacing-8);"
		>
			<h2
				class="section-title text-primary text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				How We Solve This
			</h2>
			<p
				class="section-lead text-secondary text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 200,
					easing: quintOut
				}}
			>
				One platform. One source of truth. From discovery to delivery.
			</p>

			<div class="features-grid gap-inbox-list">
				<div
					class="feature-card bg-surface"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 300,
						delay: prefersReducedMotion ? 0 : 300,
						easing: quintOut
					}}
				>
					<h3 class="feature-title text-primary">🎯 Outcome Frameworks (Built In)</h3>
					<p class="feature-description text-secondary">
						OKRs, opportunity solution trees, continuous discovery. Not flexible—opinionated. We
						guide you to work better, not just differently.
					</p>
				</div>
				<div
					class="feature-card bg-surface"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 300,
						delay: prefersReducedMotion ? 0 : 400,
						easing: quintOut
					}}
				>
					<h3 class="feature-title text-primary">🔗 Integrate Your Tools</h3>
					<p class="feature-description text-secondary">
						Keep Notion, Linear, Slack. We don't replace them—we unify them. One view, no context
						switching. Your tools, smarter.
					</p>
				</div>
				<div
					class="feature-card bg-surface"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 300,
						delay: prefersReducedMotion ? 0 : 500,
						easing: quintOut
					}}
				>
					<h3 class="feature-title text-primary">📝 AI-Maintained Documentation</h3>
					<p class="feature-description text-secondary">
						Stop writing docs manually. AI captures decisions, builds glossaries, keeps context
						current. Always up-to-date, zero effort.
					</p>
				</div>
				<div
					class="feature-card bg-surface"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 300,
						delay: prefersReducedMotion ? 0 : 600,
						easing: quintOut
					}}
				>
					<h3 class="feature-title text-primary">📊 Impact Visibility</h3>
					<p class="feature-description text-secondary">
						Show stakeholders outcomes, not status theater. Auto-generated updates from real work.
						No more "postponed" with no clarity.
					</p>
				</div>
				<div
					class="feature-card bg-surface"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 300,
						delay: prefersReducedMotion ? 0 : 700,
						easing: quintOut
					}}
				>
					<h3 class="feature-title text-primary">⏱️ Realistic Estimates</h3>
					<p class="feature-description text-secondary">
						Track full scope—testing, feedback, staging, meetings. Learn from history. Stop working
						on tasks "knowing they'll likely change."
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- What Makes It Different Section -->
	<section class="differentiators-section bg-surface">
		<div
			class="section-content px-inbox-container mx-auto max-w-5xl"
			style="padding-block: var(--spacing-8);"
		>
			<h2
				class="section-title text-primary text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				What Makes It Different
			</h2>

			<div class="differentiators-grid gap-inbox-list">
				{#each differentiators as diff, i (diff.title)}
					<div
						class="differentiator-card bg-elevated"
						in:fly={{
							y: 30,
							duration: prefersReducedMotion ? 0 : 300,
							delay: prefersReducedMotion ? 0 : 200 + i * 100,
							easing: quintOut
						}}
					>
						<span class="differentiator-emoji">{diff.emoji}</span>
						<h3 class="differentiator-title text-primary">{diff.title}</h3>
						<p class="differentiator-description text-secondary">{diff.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Tech Stack Section -->
	<section class="tech-stack-section bg-surface">
		<div
			class="section-content px-inbox-container mx-auto max-w-6xl"
			style="padding-block: var(--spacing-8);"
		>
			<div
				class="tech-stack-header text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 400,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				<div class="tech-badge">
					<span>⚡</span>
					<span>Modern Stack</span>
				</div>
				<h2 class="section-title text-primary">Learn by Building</h2>
				<p class="section-lead text-secondary">
					Ship with cutting-edge tech you can't use at your day job.<br />
					Real features. Real production. Real learning.
				</p>
			</div>

			<div class="tech-showcase">
				<!-- SvelteKit - Featured -->
				<div
					class="tech-card-featured bg-elevated"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 400,
						delay: prefersReducedMotion ? 0 : 200,
						easing: quintOut
					}}
				>
					<div class="tech-card-content">
						<div class="tech-logo-large">
							<svg viewBox="0 0 98.1 118" xmlns="http://www.w3.org/2000/svg">
								<path
									fill="#ff3e00"
									d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.6 20.3 48.2 10.4l27.5-17.5c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.6-9-.5-18.2-5.7-25.5"
								/>
								<path
									fill="#fff"
									d="M40.9 103.9c-8.9 2.3-18.2-1.2-23.4-8.7-3.2-4.4-4.4-9.9-3.5-15.3.2-.9.4-1.7.6-2.6l.5-1.6 1.4 1c3.3 2.4 6.9 4.2 10.8 5.4l1 .3-.1 1c-.1 1.4.3 2.9 1.1 4.1 1.6 2.3 4.4 3.4 7.1 2.7.6-.2 1.2-.4 1.7-.7L65.5 72c1.4-.9 2.3-2.2 2.6-3.8.3-1.6-.1-3.3-1-4.6-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7l-10.5 6.7c-1.7 1.1-3.6 1.9-5.6 2.4-8.9 2.3-18.2-1.2-23.4-8.7-3.1-4.4-4.4-9.9-3.4-15.3.9-5.2 4.1-9.9 8.6-12.7l27.5-17.5c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.2.9-.4 1.7-.7 2.6l-.5 1.6-1.4-1c-3.3-2.4-6.9-4.2-10.8-5.4l-1-.3.1-1c.1-1.4-.3-2.9-1.1-4.1-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7L32.4 46.1c-1.4.9-2.3 2.2-2.6 3.8s.1 3.3 1 4.6c1.6 2.3 4.4 3.3 7.1 2.6.6-.2 1.2-.4 1.7-.7l10.5-6.7c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.9 5.2-4.1 9.9-8.6 12.7l-27.5 17.5c-1.7 1.1-3.6 1.9-5.6 2.5"
								/>
							</svg>
						</div>
						<div class="tech-card-info">
							<div class="tech-featured-badge">
								<span>🌟</span>
								<span>Can't Learn at Work</span>
							</div>
							<h3 class="tech-name-large text-primary">SvelteKit 5</h3>
							<p class="tech-description-large text-secondary">
								The modern framework everyone's talking about. Faster than React. Simpler than Vue.
								Ship real features and level up your resume.
							</p>
						</div>
					</div>
				</div>

				<!-- Other Technologies Grid -->
				<div class="tech-grid">
					<!-- Convex -->
					<div
						class="tech-card-compact bg-elevated"
						in:fly={{
							y: 30,
							duration: prefersReducedMotion ? 0 : 400,
							delay: prefersReducedMotion ? 0 : 300,
							easing: quintOut
						}}
					>
						<div class="tech-logo-compact">
							<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
								<rect width="120" height="120" fill="#FF5C35" rx="24" />
								<path
									d="M60 30L80 45V75L60 90L40 75V45L60 30Z"
									fill="white"
									stroke="white"
									stroke-width="4"
									stroke-linejoin="round"
								/>
							</svg>
						</div>
						<div class="tech-compact-info">
							<h4 class="tech-name-compact text-primary">Convex</h4>
							<p class="tech-description-compact text-secondary">Real-time backend magic</p>
						</div>
					</div>

					<!-- Tailwind CSS -->
					<div
						class="tech-card-compact bg-elevated"
						in:fly={{
							y: 30,
							duration: prefersReducedMotion ? 0 : 400,
							delay: prefersReducedMotion ? 0 : 400,
							easing: quintOut
						}}
					>
						<div class="tech-logo-compact">
							<svg viewBox="0 0 248 31" xmlns="http://www.w3.org/2000/svg">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M25.517 0C18.712 0 14.46 3.382 12.758 10.146c2.552-3.382 5.529-4.65 8.931-3.805 1.941.482 3.329 1.882 4.864 3.432 2.502 2.524 5.398 5.445 11.722 5.445 6.804 0 11.057-3.382 12.758-10.145-2.551 3.382-5.528 4.65-8.93 3.804-1.942-.482-3.33-1.882-4.865-3.431C34.736 2.92 31.841 0 25.517 0zM12.758 15.218C5.954 15.218 1.701 18.6 0 25.364c2.552-3.382 5.529-4.65 8.93-3.805 1.942.482 3.33 1.882 4.865 3.432 2.502 2.524 5.397 5.445 11.722 5.445 6.804 0 11.057-3.381 12.758-10.145-2.552 3.382-5.529 4.65-8.931 3.805-1.941-.483-3.329-1.883-4.864-3.432-2.502-2.524-5.398-5.446-11.722-5.446z"
									fill="#06B6D4"
								/>
							</svg>
						</div>
						<div class="tech-compact-info">
							<h4 class="tech-name-compact text-primary">Tailwind CSS 4</h4>
							<p class="tech-description-compact text-secondary">Design tokens system</p>
						</div>
					</div>

					<!-- TypeScript -->
					<div
						class="tech-card-compact bg-elevated"
						in:fly={{
							y: 30,
							duration: prefersReducedMotion ? 0 : 400,
							delay: prefersReducedMotion ? 0 : 500,
							easing: quintOut
						}}
					>
						<div class="tech-logo-compact">
							<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
								<rect width="128" height="128" fill="#3178C6" rx="6" />
								<path
									fill="#FFF"
									fill-rule="evenodd"
									d="M65.197 87.493a2.876 2.876 0 0 1-2.876-2.876V43.383a2.876 2.876 0 1 1 5.752 0v41.234a2.876 2.876 0 0 1-2.876 2.876zm15.697-13.788a1.92 1.92 0 0 1 1.92 1.92v5.052c.003 1.062.862 1.92 1.92 1.92 3.593 0 6.266-.862 8.02-2.586 1.753-1.724 2.63-4.23 2.63-7.518 0-2.876-.877-5.087-2.63-6.633-1.754-1.546-4.14-2.319-7.157-2.319h-5.482a1.92 1.92 0 0 1-1.92-1.92v-4.189a1.92 1.92 0 0 1 1.92-1.92h5.482c2.155 0 3.72-.577 4.695-1.731.975-1.154 1.462-2.72 1.462-4.695 0-1.975-.487-3.54-1.462-4.694-.975-1.154-2.54-1.731-4.695-1.731-1.058 0-1.917.858-1.92 1.92v5.052a1.92 1.92 0 0 1-1.92 1.92 1.92 1.92 0 0 1-1.92-1.92v-5.052c0-5.482 2.63-8.223 7.89-8.223 2.588 0 4.622.722 6.103 2.166 1.48 1.444 2.22 3.478 2.22 6.103 0 2.155-.433 3.897-1.298 5.226-.866 1.33-2.155 2.298-3.867 2.905v.144c1.712.577 3.001 1.545 3.867 2.905.865 1.36 1.298 3.072 1.298 5.138 0 2.876-.854 5.138-2.561 6.777-1.708 1.64-4.14 2.46-7.29 2.46a1.92 1.92 0 0 1-1.92-1.92v-5.052a1.92 1.92 0 0 1 1.92-1.92z"
								/>
							</svg>
						</div>
						<div class="tech-compact-info">
							<h4 class="tech-name-compact text-primary">TypeScript</h4>
							<p class="tech-description-compact text-secondary">Type-safe everywhere</p>
						</div>
					</div>

					<!-- WorkOS -->
					<div
						class="tech-card-compact bg-elevated"
						in:fly={{
							y: 30,
							duration: prefersReducedMotion ? 0 : 400,
							delay: prefersReducedMotion ? 0 : 600,
							easing: quintOut
						}}
					>
						<div class="tech-logo-compact tech-logo-text-compact">
							<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
								<rect width="120" height="40" fill="#6363F1" rx="8" />
								<text
									x="60"
									y="26"
									font-family="system-ui, -apple-system, sans-serif"
									font-size="18"
									font-weight="600"
									fill="white"
									text-anchor="middle"
								>
									WorkOS
								</text>
							</svg>
						</div>
						<div class="tech-compact-info">
							<h4 class="tech-name-compact text-primary">WorkOS</h4>
							<p class="tech-description-compact text-secondary">Enterprise auth, simple</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Where We Are Today Section -->
	<section class="status-section bg-elevated">
		<div
			class="section-content px-inbox-container mx-auto max-w-4xl"
			style="padding-block: var(--spacing-8);"
		>
			<h2
				class="section-title text-primary text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				Where We Are Today
			</h2>
			<p
				class="section-lead text-secondary text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 200,
					easing: quintOut
				}}
			>
				Transparent about where we are and where we're going
			</p>

			<div class="status-grid">
				<div
					class="status-card bg-surface"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 400,
						delay: prefersReducedMotion ? 0 : 300,
						easing: quintOut
					}}
				>
					<div class="status-badge status-building">Building</div>
					<h3 class="status-card-title text-primary">Current State</h3>
					<ul class="status-list text-secondary">
						<li>✅ Platform foundation (auth, database, deployment)</li>
						<li>✅ Basic knowledge capture (Readwise sync)</li>
						<li>⏳ Core discovery & delivery workflows (in progress)</li>
					</ul>
				</div>

				<div
					class="status-card bg-surface"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 400,
						delay: prefersReducedMotion ? 0 : 400,
						easing: quintOut
					}}
				>
					<div class="status-badge status-focus">Current Focus</div>
					<h3 class="status-card-title text-primary">What We're Working On</h3>
					<p class="status-description text-secondary">
						<strong>Getting our first real product team using SynergyOS.</strong> That's our outcome.
						Everything we build is shaped by working with them—capturing real pain points, testing solutions,
						building a tight feedback loop.
					</p>
					<p class="status-description text-secondary">
						The roadmap below guides us, but it will change based on what we learn.
					</p>
				</div>

				<div
					class="status-card status-join bg-surface"
					in:fly={{
						y: 30,
						duration: prefersReducedMotion ? 0 : 400,
						delay: prefersReducedMotion ? 0 : 500,
						easing: quintOut
					}}
				>
					<div class="status-badge status-next">Up Next (Flexible)</div>
					<h3 class="status-card-title text-primary">Roadmap Highlights</h3>
					<ul class="status-list text-secondary">
						<li>🎯 Outcome-driven roadmapping</li>
						<li>🔗 Tool integrations (Notion, Linear, Slack)</li>
						<li>🤖 AI assistant for context capture</li>
						<li>📊 Alignment dashboards</li>
					</ul>
				</div>
			</div>

			<!-- Disclaimer -->
			<div
				class="status-disclaimer text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 600,
					easing: quintOut
				}}
			>
				<p class="text-secondary">
					<strong>Want to be that first product team?</strong>
					<a href="#waitlist" class="inline-cta">Join the waitlist</a> and help shape what we build.
				</p>
			</div>
		</div>
	</section>

	<!-- Waitlist Section -->
	<section id="waitlist" class="waitlist-section">
		<div class="section-content px-inbox-container mx-auto max-w-3xl">
			<!-- Featured CTA Card -->
			<div
				class="waitlist-featured-card"
				in:fly={{
					y: 40,
					duration: prefersReducedMotion ? 0 : 500,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				<!-- Social Proof Bar -->
				<div class="social-proof-bar">
					<div class="social-proof-item">
						<span class="social-proof-icon">👥</span>
						<span class="social-proof-text"><strong>{waitlistCount}</strong> builders joined</span>
					</div>
					<div class="social-proof-item">
						<span class="social-proof-icon">🔒</span>
						<span class="social-proof-text"><strong>Privacy</strong> first</span>
					</div>
					<div class="social-proof-item">
						<span class="social-proof-icon">📤</span>
						<span class="social-proof-text"><strong>Export</strong> anytime</span>
					</div>
				</div>

				<!-- Main Content -->
				<div class="waitlist-content text-center">
					<div class="waitlist-badge">
						<span class="badge-icon">🛠️</span>
						<span class="badge-text">Builders Welcome</span>
					</div>

					<h2 class="waitlist-title text-primary">
						Ready to Build the Future of<br />Product Tools?
					</h2>
					<p class="waitlist-lead text-secondary">
						Join a community of builders learning together. Shape the product. Contribute code.
						Learn cutting-edge tech. Build in public.
					</p>

					<!-- Value Props -->
					<div class="value-props">
						<div class="value-prop">
							<span class="value-prop-icon">⚡</span>
							<span class="value-prop-text">Early access</span>
						</div>
						<div class="value-prop">
							<span class="value-prop-icon">💬</span>
							<span class="value-prop-text">Private community</span>
						</div>
						<div class="value-prop">
							<span class="value-prop-icon">🎓</span>
							<span class="value-prop-text">Learn modern stack</span>
						</div>
					</div>

					<!-- Form -->
					<div class="waitlist-form-wrapper">
						<WaitlistForm />
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer bg-surface">
		<div class="footer-content px-inbox-container py-header mx-auto max-w-5xl">
			<div class="footer-grid">
				<div class="footer-section">
					<h3 class="footer-title text-primary">SynergyOS</h3>
					<p class="footer-description text-secondary">
						The Product OS.<br />
						Built by builders, for builders.
					</p>
					<div class="footer-badges">
						<span class="footer-badge bg-elevated text-secondary">Privacy-First</span>
						<span class="footer-badge bg-elevated text-secondary">Export Anytime</span>
					</div>
				</div>

				<div class="footer-section">
					<h4 class="footer-heading text-secondary">Community</h4>
					<ul class="footer-links">
						<li>
							<a
								href="https://github.com/synergyai-os/Synergy-Open-Source"
								target="_blank"
								rel="noopener noreferrer"
								class="footer-link text-secondary">GitHub</a
							>
						</li>
						<li>
							<a
								href="https://github.com/synergyai-os/Synergy-Open-Source/issues"
								target="_blank"
								rel="noopener noreferrer"
								class="footer-link text-secondary">Report an Issue</a
							>
						</li>
						<li>
							<a href={resolveRoute('/CONTRIBUTING')} class="footer-link text-secondary"
								>Contribute</a
							>
						</li>
					</ul>
				</div>
			</div>

			<div class="footer-bottom">
				<p class="footer-copyright text-tertiary">
					Built with <span class="footer-heart">❤️</span> by builders, for builders.
				</p>
			</div>
		</div>
	</footer>
</div>

<style lang="postcss">
	/* Smooth scrolling for anchor links */
	:global(html) {
		scroll-behavior: smooth;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) {
			scroll-behavior: auto;
		}
	}

	.homepage-layout {
		min-height: 100vh;
		width: 100%;
	}

	/* Hero Section */
	.hero-section {
		padding: var(--spacing-20) 0 var(--spacing-32) 0;
		border-bottom: 1px solid var(--color-border-base);
		background: linear-gradient(
			180deg,
			color-mix(in oklch, var(--color-accent-primary) 1.5%, transparent) 0%,
			transparent 100%
		);
		position: relative;
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	/* Trust Badges */
	.trust-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		align-items: center;
	}

	.trust-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.875rem;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-base);
		border-radius: 2rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		transition: all 0.2s ease;
	}

	.trust-badge:hover {
		border-color: color-mix(in oklch, var(--color-accent-primary) 30%, transparent);
	}

	.trust-icon {
		flex-shrink: 0;
		color: var(--color-accent-primary);
	}

	.hero-title {
		font-size: 3.75rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.03em;
		margin: 0;
	}

	/* Token: --breakpoint-md (768px) from design-system.json */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.25rem;
		}
	}

	.gradient-text-enhanced {
		background: linear-gradient(
			135deg,
			var(--color-accent-primary) 0%,
			color-mix(in oklch, var(--color-accent-primary) 90%, cyan) 50%,
			color-mix(in oklch, var(--color-accent-primary) 80%, purple) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		background-size: 200% 200%;
		animation: gradient-shift 8s ease infinite;
	}

	@keyframes gradient-shift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gradient-text-enhanced {
			animation: none;
		}
	}

	.hero-lead {
		font-size: 1.25rem;
		line-height: 1.6;
		max-width: 42rem;
		margin: 0 auto;
	}

	/* Hero CTAs */
	.hero-cta-group {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		align-items: center;
	}

	.cta-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		background: var(--color-accent-primary);
		color: white;
		border-radius: 0.5rem;
		font-size: 1.0625rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.1),
			0 1px 2px rgba(0, 0, 0, 0.06);
	}

	.cta-primary:hover {
		background: var(--color-accent-hover);
		box-shadow: 0 4px 12px var(--color-accent-primary);
		transform: translateY(-1px);
	}

	.cta-primary:active {
		transform: translateY(0);
	}

	.cta-badge {
		padding: 0.25rem 0.625rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 0.25rem;
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.cta-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 2rem;
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.cta-secondary:hover {
		border-color: var(--color-accent-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.github-icon {
		flex-shrink: 0;
	}

	/* Pain Points Section */
	.pain-section {
		padding: var(--spacing-28) 0;
		border-bottom: 1px solid var(--color-border-base);
		background: var(--color-bg-surface);
	}

	.pain-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-8);
	}

	.pain-card {
		padding: var(--spacing-10);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		transition: all 0.2s ease;
	}

	.pain-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
		border-color: color-mix(in oklch, var(--color-accent-primary) 20%, transparent);
	}

	.pain-emoji {
		font-size: 2.5rem;
		display: block;
		margin-bottom: var(--spacing-6);
		opacity: 0.9;
	}

	.pain-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: var(--spacing-icon-gap-wide);
	}

	.pain-description {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--color-text-secondary);
	}

	.pain-footer {
		margin-top: var(--spacing-12);
		font-size: 1rem;
	}

	/* Vision Section */
	.vision-section {
		padding: var(--spacing-28) 0;
		border-bottom: 1px solid var(--color-border-base);
		background: linear-gradient(
			180deg,
			color-mix(in oklch, var(--color-accent-primary) 2%, transparent) 0%,
			transparent 50%,
			color-mix(in oklch, var(--color-accent-primary) 1%, transparent) 100%
		);
		position: relative;
	}

	.vision-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-12);
	}

	.vision-header {
		margin-bottom: var(--spacing-4);
	}

	.vision-intro {
		padding: var(--spacing-10);
		border: 1px solid color-mix(in oklch, var(--color-accent-primary) 15%, transparent);
		border-radius: 1.25rem;
		background: linear-gradient(
			135deg,
			color-mix(in oklch, var(--color-accent-primary) 3%, var(--color-bg-surface)) 0%,
			var(--color-bg-surface) 100%
		);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
		position: relative;
		overflow: hidden;
		text-align: center;
		max-width: 48rem;
		margin: 0 auto;
	}

	.vision-intro::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			var(--color-accent-primary) 50%,
			transparent 100%
		);
	}

	.vision-intro-text {
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.3;
		margin-bottom: var(--spacing-6);
		background: linear-gradient(
			135deg,
			var(--color-text-primary) 0%,
			color-mix(in oklch, var(--color-accent-primary) 70%, var(--color-text-primary)) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.vision-intro-subtext {
		font-size: 1.125rem;
		line-height: 1.7;
	}

	.vision-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: var(--spacing-8);
		max-width: 56rem;
		margin: 0 auto;
		width: 100%;
	}

	.vision-card {
		padding: var(--spacing-10);
		border: 1px solid color-mix(in oklch, var(--color-accent-primary) 10%, transparent);
		border-radius: 1.25rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
		background: var(--color-bg-elevated);
	}

	.vision-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			color-mix(in oklch, var(--color-accent-primary) 2%, transparent) 0%,
			transparent 50%
		);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.vision-card:hover::before {
		opacity: 1;
	}

	.vision-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
		border-color: color-mix(in oklch, var(--color-accent-primary) 30%, transparent);
	}

	.vision-card-number {
		font-size: 4rem;
		font-weight: 800;
		background: linear-gradient(
			135deg,
			var(--color-accent-primary) 0%,
			color-mix(in oklch, var(--color-accent-primary) 80%, cyan) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: var(--spacing-8);
		line-height: 1;
		position: relative;
		z-index: 1;
		letter-spacing: -0.03em;
	}

	.vision-card-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: var(--spacing-4);
		position: relative;
		z-index: 1;
	}

	.vision-card-description {
		font-size: 1rem;
		line-height: 1.8;
		position: relative;
		z-index: 1;
	}

	.vision-footer {
		max-width: 42rem;
		margin: 0 auto;
		padding-top: var(--spacing-12);
		text-align: center;
	}

	.vision-cta {
		font-size: 1.125rem;
		line-height: 1.8;
		margin-bottom: var(--spacing-8);
	}

	/* What It Is Section */
	.what-section {
		padding: var(--spacing-28) 0;
		border-bottom: 1px solid var(--color-border-base);
		background: var(--color-bg-surface);
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: -0.02em;
		margin-bottom: var(--spacing-6);
	}

	.section-lead {
		font-size: 1.125rem;
		line-height: 1.7;
		margin-bottom: var(--spacing-12);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--spacing-8);
	}

	.feature-card {
		padding: var(--spacing-10);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		transition: all 0.2s ease;
	}

	.feature-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
		border-color: color-mix(in oklch, var(--color-accent-primary) 20%, transparent);
	}

	.feature-title {
		font-size: 1.0625rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.feature-description {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--color-text-secondary);
	}

	/* Differentiators Section */
	.differentiators-section {
		padding: var(--spacing-28) 0;
		border-bottom: 1px solid var(--color-border-base);
		background: var(--color-bg-surface);
	}

	.differentiators-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-8);
	}

	.differentiator-card {
		padding: var(--spacing-10);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		transition: all 0.2s ease;
	}

	.differentiator-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
		border-color: color-mix(in oklch, var(--color-accent-primary) 20%, transparent);
	}

	.differentiator-emoji {
		font-size: 2.5rem;
		display: block;
		margin-bottom: var(--spacing-6);
		opacity: 0.9;
	}

	.differentiator-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: var(--spacing-4);
	}

	.differentiator-description {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--color-text-secondary);
	}

	/* Status Section (Where We Are Today) */
	.status-section {
		padding: var(--spacing-28) 0;
		border-bottom: 1px solid var(--color-border-base);
		background: linear-gradient(
			180deg,
			color-mix(in oklch, var(--color-accent-primary) 1.5%, transparent) 0%,
			transparent 100%
		);
	}

	.status-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-8);
		margin-top: var(--spacing-12);
	}

	.status-card {
		padding: var(--spacing-10);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		transition: all 0.2s ease;
	}

	.status-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
		border-color: color-mix(in oklch, var(--color-accent-primary) 20%, transparent);
	}

	.status-badge {
		display: inline-block;
		padding: 0.375rem 0.875rem;
		border-radius: 2rem;
		font-size: 0.8125rem;
		font-weight: 600;
		margin-bottom: 1.25rem;
	}

	.status-building {
		background: color-mix(in oklch, var(--color-accent-primary) 10%, transparent);
		color: var(--color-accent-primary);
	}

	.status-focus {
		background: color-mix(in oklch, orange 10%, transparent);
		color: color-mix(in oklch, orange 80%, black);
	}

	.status-next {
		background: color-mix(in oklch, var(--color-accent-primary) 10%, transparent);
		color: var(--color-accent-primary);
	}

	.status-card-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: var(--spacing-4);
	}

	.status-description {
		font-size: 0.9375rem;
		line-height: 1.7;
		margin-bottom: var(--spacing-4);
	}

	.status-description:last-child {
		margin-bottom: 0;
	}

	.status-disclaimer {
		margin-top: var(--spacing-12);
		padding-top: var(--spacing-8);
		border-top: 1px solid var(--color-border-base);
		font-size: 1rem;
	}

	.status-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-marketing-list-gap);
	}

	.status-list li {
		font-size: 0.9375rem;
		line-height: 1.6;
		padding-left: 0.25rem;
	}

	/* Token: --breakpoint-md (768px) from design-system.json */
	@media (max-width: 768px) {
		.status-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Tech Stack Section */
	.tech-stack-section {
		padding: var(--spacing-28) 0;
		border-bottom: 1px solid var(--color-border-base);
		background: linear-gradient(
			180deg,
			color-mix(in oklch, var(--color-accent-primary) 1.5%, transparent) 0%,
			transparent 100%
		);
	}

	.tech-stack-header {
		margin-bottom: var(--spacing-12);
	}

	.tech-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1.125rem;
		background: linear-gradient(135deg, rgba(255, 62, 0, 0.1), rgba(59, 130, 246, 0.1));
		border: 1px solid rgba(255, 62, 0, 0.3);
		border-radius: 2rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #ff3e00;
		margin-bottom: 1.5rem;
	}

	.tech-showcase {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-8);
	}

	/* Featured SvelteKit Card */
	.tech-card-featured {
		padding: var(--spacing-10);
		border: 2px solid var(--color-border-base);
		border-radius: 1rem;
		background: linear-gradient(135deg, rgba(255, 62, 0, 0.03), rgba(255, 62, 0, 0.01));
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.tech-card-featured::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #ff3e00, #ff8a00);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.tech-card-featured:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 32px rgba(255, 62, 0, 0.12);
		border-color: #ff3e00;
	}

	.tech-card-featured:hover::before {
		opacity: 1;
	}

	.tech-card-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-12);
	}

	.tech-logo-large {
		flex-shrink: 0;
		width: 120px;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}

	.tech-logo-large svg {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.tech-card-info {
		flex: 1;
	}

	.tech-featured-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.875rem;
		background: rgba(255, 62, 0, 0.1);
		border: 1px solid rgba(255, 62, 0, 0.2);
		border-radius: 2rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #ff3e00;
		margin-bottom: 1rem;
	}

	.tech-name-large {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		color: var(--color-text-primary);
	}

	.tech-description-large {
		font-size: 1.125rem;
		line-height: 1.7;
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Compact Tech Grid */
	.tech-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
	}

	.tech-card-compact {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 1.75rem;
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		transition: all 0.2s ease;
	}

	.tech-card-compact:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
		border-color: color-mix(in oklch, var(--color-accent-primary) 20%, transparent);
	}

	.tech-logo-compact {
		flex-shrink: 0;
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem;
		background: white;
		border-radius: 0.625rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
	}

	.tech-logo-compact svg {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.tech-logo-text-compact {
		width: 80px;
		max-width: none;
	}

	.tech-compact-info {
		flex: 1;
		min-width: 0;
	}

	.tech-name-compact {
		font-size: 1.0625rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		color: var(--color-text-primary);
	}

	.tech-description-compact {
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Waitlist Section - Featured CTA */
	.waitlist-section {
		padding: var(--spacing-32) 0;
		border-bottom: 1px solid var(--color-border-base);
		background: radial-gradient(
			ellipse 80% 50% at 50% 50%,
			color-mix(in oklch, var(--color-accent-primary) 8%, transparent) 0%,
			transparent 100%
		);
		position: relative;
		overflow: hidden;
	}

	/* Animated gradient background */
	.waitlist-section::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(
			circle at 50% 50%,
			color-mix(in oklch, var(--color-accent-primary) 3%, transparent) 0%,
			transparent 50%
		);
		animation: subtle-pulse 8s ease-in-out infinite;
		pointer-events: none;
	}

	@keyframes subtle-pulse {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.05);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.waitlist-section::before {
			animation: none;
		}
	}

	/* Featured Card */
	.waitlist-featured-card {
		background: var(--color-bg-elevated);
		border: 1px solid color-mix(in oklch, var(--color-accent-primary) 20%, transparent);
		border-radius: 1.5rem;
		padding: var(--spacing-10);
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.12),
			0 0 0 1px color-mix(in oklch, var(--color-accent-primary) 10%, transparent) inset;
		position: relative;
		overflow: hidden;
	}

	/* Gradient top border accent */
	.waitlist-featured-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			var(--color-accent-primary) 20%,
			color-mix(in oklch, var(--color-accent-primary) 80%, cyan) 50%,
			var(--color-accent-primary) 80%,
			transparent 100%
		);
	}

	/* Social Proof Bar */
	.social-proof-bar {
		display: flex;
		justify-content: center;
		gap: var(--spacing-6);
		flex-wrap: wrap;
		padding-bottom: var(--spacing-8);
		margin-bottom: var(--spacing-8);
		border-bottom: 1px solid color-mix(in oklch, var(--color-accent-primary) 10%, transparent);
	}

	.social-proof-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.social-proof-icon {
		font-size: 1.125rem;
	}

	.social-proof-text {
		color: var(--color-text-secondary);
	}

	.social-proof-text strong {
		color: var(--color-text-primary);
		font-weight: 700;
	}

	/* Main Content */
	.waitlist-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	.waitlist-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 1.25rem;
		background: linear-gradient(
			135deg,
			color-mix(in oklch, var(--color-accent-primary) 10%, var(--color-bg-elevated)) 0%,
			var(--color-bg-elevated) 100%
		);
		border: 1px solid color-mix(in oklch, var(--color-accent-primary) 30%, transparent);
		border-radius: 2rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-accent-primary);
		align-self: center;
		box-shadow: 0 4px 12px color-mix(in oklch, var(--color-accent-primary) 15%, transparent);
	}

	.badge-icon {
		font-size: 1.125rem;
	}

	.waitlist-title {
		font-size: 2.5rem;
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: -0.02em;
		margin: 0;
		background: linear-gradient(
			135deg,
			var(--color-text-primary) 0%,
			color-mix(in oklch, var(--color-accent-primary) 70%, var(--color-text-primary)) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.waitlist-lead {
		font-size: 1.125rem;
		line-height: 1.7;
		max-width: 36rem;
		margin: 0 auto;
	}

	/* Value Props */
	.value-props {
		display: flex;
		justify-content: center;
		gap: var(--spacing-6);
		flex-wrap: wrap;
		padding: var(--spacing-8) 0;
	}

	.value-prop {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: color-mix(in oklch, var(--color-accent-primary) 5%, var(--color-bg-surface));
		border: 1px solid color-mix(in oklch, var(--color-accent-primary) 15%, transparent);
		border-radius: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-primary);
		transition: all 0.2s ease;
	}

	.value-prop:hover {
		transform: translateY(-2px);
		border-color: color-mix(in oklch, var(--color-accent-primary) 30%, transparent);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.value-prop-icon {
		font-size: 1.25rem;
	}

	.waitlist-form-wrapper {
		margin-top: var(--spacing-4);
	}

	/* Responsive */
	/* Token: --breakpoint-md (768px) from design-system.json */
	@media (max-width: 768px) {
		.waitlist-title {
			font-size: 1.875rem;
		}

		.social-proof-bar {
			flex-direction: column;
			gap: 0.75rem;
			text-align: center;
		}

		.value-props {
			flex-direction: column;
			align-items: center;
		}

		.value-prop {
			width: 100%;
			max-width: 20rem;
			justify-content: center;
		}
	}

	/* Footer */
	/* CTA Buttons & Links */
	.inline-cta {
		color: var(--color-accent-primary);
		text-decoration: none;
		font-weight: 600;
		border-bottom: 1px solid color-mix(in oklch, var(--color-accent-primary) 30%, transparent);
		transition: all 0.2s ease;
	}

	.inline-cta:hover {
		border-bottom-color: var(--color-accent-primary);
	}

	.cta-button-secondary {
		display: inline-block;
		padding: 1rem 2.5rem;
		background: linear-gradient(
			135deg,
			var(--color-accent-primary) 0%,
			color-mix(in oklch, var(--color-accent-primary) 90%, cyan) 100%
		);
		color: white;
		border: none;
		border-radius: 0.75rem;
		font-size: 1.125rem;
		font-weight: 700;
		text-decoration: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 16px color-mix(in oklch, var(--color-accent-primary) 30%, transparent);
		position: relative;
		overflow: hidden;
	}

	.cta-button-secondary::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.2) 50%,
			transparent 100%
		);
		transition: left 0.5s ease;
	}

	.cta-button-secondary:hover::before {
		left: 100%;
	}

	.cta-button-secondary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px color-mix(in oklch, var(--color-accent-primary) 40%, transparent);
	}

	.footer {
		padding: var(--spacing-20) 0 var(--spacing-8) 0;
		background: var(--color-bg-surface);
	}

	.footer-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-8);
		margin-bottom: var(--spacing-12);
	}

	.footer-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
	}

	.footer-description {
		font-size: 0.875rem;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.footer-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.footer-badge {
		padding: 0.25rem 0.75rem;
		border: 1px solid var(--color-border-base);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.footer-heading {
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.footer-links {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.footer-link {
		font-size: 0.875rem;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-link:hover {
		color: var(--color-accent-primary) !important;
	}

	.footer-bottom {
		padding-top: 2rem;
		border-top: 1px solid var(--color-border-base);
		text-align: center;
	}

	.footer-copyright {
		font-size: 0.875rem;
	}

	.footer-heart {
		color: var(--color-accent-primary);
	}

	/* Responsive */
	/* Token: --breakpoint-md (768px) from design-system.json */
	@media (max-width: 768px) {
		.hero-section {
			padding: var(--spacing-12) 0 var(--spacing-20) 0;
		}

		.hero-title {
			font-size: 2.25rem;
		}

		.hero-lead {
			font-size: 1.0625rem;
		}

		.section-title {
			font-size: 1.75rem;
		}

		.trust-badges {
			gap: 0.5rem;
		}

		.trust-badge {
			font-size: 0.75rem;
			padding: 0.25rem 0.625rem;
		}

		.hero-cta-group {
			flex-direction: column;
			width: 100%;
		}

		.cta-primary,
		.cta-secondary {
			width: 100%;
			justify-content: center;
		}

		.pain-grid,
		.features-grid,
		.differentiators-grid {
			grid-template-columns: 1fr;
		}

		.tech-card-featured {
			padding: var(--spacing-8);
		}

		.tech-card-content {
			flex-direction: column;
			gap: var(--spacing-8);
			text-align: center;
		}

		.tech-logo-large {
			width: 96px;
			height: 96px;
		}

		.tech-name-large {
			font-size: 1.75rem;
		}

		.tech-description-large {
			font-size: 1rem;
		}

		.tech-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.tech-card-compact {
			padding: 1.5rem;
		}

		.tech-logo-compact {
			width: 48px;
			height: 48px;
		}

		.footer-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Accessibility: Respect reduced motion */
	@media (prefers-reduced-motion: reduce) {
		* {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
