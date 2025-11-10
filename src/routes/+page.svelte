<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import WaitlistForm from '$lib/components/WaitlistForm.svelte';
	import { fly, fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	let { data } = $props();

	// Detect motion preference
	let prefersReducedMotion = $state(false);

	onMount(() => {
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = mediaQuery.matches;
		}
	});

	// Pain points data
	const painPoints = [
		{
			emoji: '💸',
			title: '$50-200/user/month',
			description: "10 tools that don't talk to each other. Holaspirit alone was bleeding us dry."
		},
		{
			emoji: '🔒',
			title: 'Vendor Lock-In',
			description: "Your data trapped in someone else's database. Export? Good luck with that."
		},
		{
			emoji: '🤖',
			title: 'AI Feels Like Hype',
			description: "Generic ChatGPT doesn't know your company. You need AI trained on YOUR data."
		}
	];

	// Stats data (honest numbers)
	const stats = [
		{ value: '12', label: 'GitHub Stars (so far)' },
		{ value: '45', label: 'Docs Pages (AI-readable)' },
		{ value: '3', label: 'Core Contributors' },
		{ value: '12', label: "Open PRs (we're shipping)" }
	];
</script>

<svelte:head>
	<title>SynergyOS - The Product OS Built by Builders</title>
	<meta
		name="description"
		content="Open source Product OS. Built with AI, for builders who want control over their data."
	/>
</svelte:head>

<Header isAuthenticated={data.isAuthenticated} />

<div class="homepage-layout">
	<!-- Hero Section -->
	<section class="hero-section bg-surface">
		<div
			class="hero-content mx-auto max-w-readable px-inbox-container py-readable-quote text-center"
		>
			<!-- Badge -->
			<div
				class="badge"
				in:fly={{
					y: -20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				<span class="badge-icon">🤖</span>
				<span class="badge-text">Co-built with Claude Sonnet 4.5</span>
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
				The Product OS we built<br />
				<span class="gradient-text">because Holaspirit cost too much</span>
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
				Open source. AI-augmented. Built by builders, for builders.<br />
				No subscriptions. No vendor lock-in. Just code.
			</p>

			<!-- CTAs -->
			<div
				class="cta-group"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 400,
					easing: quintOut
				}}
			>
				<a href="#waitlist" class="cta-primary"> Join the Waitlist </a>
				<a
					href="https://github.com/synergyai-os/Synergy-Open-Source"
					target="_blank"
					rel="noopener noreferrer"
					class="cta-secondary"
				>
					<svg class="github-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
						/>
					</svg>
					<span>Star on GitHub</span>
					<span class="star-count">12</span>
				</a>
			</div>

			<!-- Quick Links -->
			<div
				class="quick-links"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 500,
					easing: quintOut
				}}
			>
				<a href="/dev-docs" class="quick-link text-secondary">📚 Read the Docs</a>
				<span class="quick-link-separator text-tertiary">·</span>
				<a href="/login" class="quick-link text-tertiary">🔒 Login (Coming Soon)</a>
			</div>
		</div>
	</section>

	<!-- Pain Points Section -->
	<section class="pain-section bg-elevated">
		<div class="section-content mx-auto max-w-5xl px-inbox-container py-readable-quote">
			<h2
				class="section-title text-center text-primary"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				Sound Familiar?
			</h2>

			<div class="pain-grid gap-inbox-list">
				{#each painPoints as pain, i}
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
		</div>
	</section>

	<!-- Solution Section -->
	<section class="solution-section bg-surface">
		<div class="section-content mx-auto max-w-3xl px-inbox-container py-readable-quote">
			<div
				class="solution-content"
				in:fly={{
					y: 30,
					duration: prefersReducedMotion ? 0 : 400,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				<span class="eyebrow text-accent-primary">We Felt It Too</span>
				<h2 class="section-title text-primary">So We Started Building</h2>
				<p class="solution-lead text-secondary">
					Daily. With AI as our copilot, not our boss. In the open. With real code solving real
					pain.
				</p>

				<ul class="feature-list">
					<li class="feature-item">
						<svg
							class="feature-icon"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						<div class="feature-text">
							<strong class="text-primary">Self-Host or Cloud</strong>
							<p class="text-secondary">Your data. Your infrastructure. Your choice.</p>
						</div>
					</li>
					<li class="feature-item">
						<svg
							class="feature-icon"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						<div class="feature-text">
							<strong class="text-primary">Fork It, Extend It</strong>
							<p class="text-secondary">100% open source. No black boxes. Just code.</p>
						</div>
					</li>
					<li class="feature-item">
						<svg
							class="feature-icon"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						<div class="feature-text">
							<strong class="text-primary">AI-Augmented</strong>
							<p class="text-secondary">Built 10x faster with Claude. You can too.</p>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Build in Public Section -->
	<section class="stats-section bg-elevated">
		<div class="section-content mx-auto max-w-5xl px-inbox-container py-readable-quote">
			<h2
				class="section-title text-center text-primary"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				Built in Public
			</h2>
			<p
				class="section-lead text-center text-secondary"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 200,
					easing: quintOut
				}}
			>
				We're not finished. We're not polished. But it works—for us.
			</p>

			<div class="stats-grid gap-icon">
				{#each stats as stat, i}
					<div
						class="stat-card bg-surface"
						in:scale={{
							duration: prefersReducedMotion ? 0 : 300,
							delay: prefersReducedMotion ? 0 : 300 + i * 80,
							start: 0.9,
							easing: quintOut
						}}
					>
						<div class="stat-value text-accent-primary">{stat.value}</div>
						<div class="stat-label text-secondary">{stat.label}</div>
					</div>
				{/each}
			</div>

			<!-- Cost Comparison -->
			<div
				class="cost-comparison"
				in:fly={{
					y: 30,
					duration: prefersReducedMotion ? 0 : 400,
					delay: prefersReducedMotion ? 0 : 600,
					easing: quintOut
				}}
			>
				<h3 class="cost-title text-primary">Not Another SaaS</h3>
				<div class="cost-table">
					<div class="cost-row strike">
						<span class="cost-name text-secondary">❌ Holaspirit</span>
						<span class="cost-price text-secondary">$15-30/user/month</span>
					</div>
					<div class="cost-row strike">
						<span class="cost-name text-secondary">❌ Notion</span>
						<span class="cost-price text-secondary">$10-18/user/month</span>
					</div>
					<div class="cost-row strike">
						<span class="cost-name text-secondary">❌ Jira</span>
						<span class="cost-price text-secondary">$7-14/user/month</span>
					</div>
					<div class="cost-row highlight">
						<span class="cost-name text-primary">✅ SynergyOS</span>
						<span class="cost-price text-accent-primary">Free (self-host) or fair pricing</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA Section - Combined -->
	<section id="join" class="final-cta-section bg-surface">
		<div class="section-content mx-auto max-w-5xl px-inbox-container py-readable-quote">
			<!-- Main Header -->
			<div
				class="mb-12 text-center"
				in:fly={{
					y: 30,
					duration: prefersReducedMotion ? 0 : 400,
					delay: prefersReducedMotion ? 0 : 100,
					easing: quintOut
				}}
			>
				<h2 class="section-title mb-4 text-primary">Join the Movement</h2>
				<p class="section-lead text-secondary">
					Don't want another SaaS subscription?<br />
					Want control over your data?<br />
					Want to build, not just use?
				</p>
			</div>

			<!-- Two-Column Layout -->
			<div class="join-grid">
				<!-- Left: Join Core Team -->
				<div
					class="join-section"
					in:fly={{
						x: -30,
						duration: prefersReducedMotion ? 0 : 400,
						delay: prefersReducedMotion ? 0 : 200,
						easing: quintOut
					}}
				>
					<div class="core-team-card">
						<h3 class="join-heading text-primary">🚀 Join the Core Team</h3>
						<p class="join-subheading text-secondary">
							Build with us. Get recognized. Shape the future.
						</p>

						<!-- Contribution Ladder -->
						<div class="contribution-ladder">
							<div class="ladder-step">
								<div class="ladder-badge">🎯</div>
								<div class="ladder-content">
									<div class="ladder-number text-primary">1 PR</div>
									<div class="ladder-reward text-secondary">→ Contributor Badge</div>
								</div>
							</div>

							<div class="ladder-arrow text-tertiary">→</div>

							<div class="ladder-step ladder-step-highlight">
								<div class="ladder-badge">⚡</div>
								<div class="ladder-content">
									<div class="ladder-number text-primary">10 PRs</div>
									<div class="ladder-reward text-secondary">→ Early Adopter Role</div>
								</div>
								<div class="ladder-bonus">🔥 First 5 only: 10 PRs + 1 outcome = Core Team</div>
							</div>

							<div class="ladder-arrow text-tertiary">→</div>

							<div class="ladder-step ladder-step-premium">
								<div class="ladder-badge">👑</div>
								<div class="ladder-content">
									<div class="ladder-number text-primary">100 PRs</div>
									<div class="ladder-reward text-secondary">→ Official Core Team Member</div>
								</div>
							</div>
						</div>

						<a
							href="https://github.com/synergyai-os/Synergy-Open-Source"
							target="_blank"
							rel="noopener noreferrer"
							class="action-button action-button-accent"
						>
							🏗️ Start Building & Get Recognized
						</a>
					</div>
				</div>

				<!-- Right: Waitlist -->
				<div
					id="waitlist"
					class="join-section"
					in:fly={{
						x: 30,
						duration: prefersReducedMotion ? 0 : 400,
						delay: prefersReducedMotion ? 0 : 200,
						easing: quintOut
					}}
				>
					<div class="waitlist-card">
						<h3 class="join-heading text-primary">📬 Join the Waitlist</h3>
						<p class="join-subheading text-secondary">
							Don't want another SaaS subscription?<br />Want control over your data?<br />Want to
							build, not just use?
						</p>

						<WaitlistForm />
					</div>
				</div>
			</div>

			<!-- Bottom Links -->
			<div
				class="cta-links mt-8 text-center"
				in:fly={{
					y: 20,
					duration: prefersReducedMotion ? 0 : 300,
					delay: prefersReducedMotion ? 0 : 400,
					easing: quintOut
				}}
			>
				<a href="/dev-docs" class="cta-link text-secondary">📚 Read the Docs</a>
				<span class="cta-link-separator text-tertiary">·</span>
				<a
					href="https://github.com/synergyai-os/Synergy-Open-Source"
					target="_blank"
					rel="noopener noreferrer"
					class="cta-link text-secondary">💻 Explore the Code</a
				>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer bg-elevated">
		<div class="footer-content mx-auto max-w-5xl px-inbox-container py-header">
			<div class="footer-grid">
				<div class="footer-section">
					<h3 class="footer-title text-primary">SynergyOS</h3>
					<p class="footer-description text-secondary">
						Open source Product OS.<br />
						Built with AI, for builders.
					</p>
					<div class="footer-badges">
						<span class="footer-badge bg-surface text-secondary">100% Open Source</span>
						<span class="footer-badge bg-surface text-secondary">Self-Hostable</span>
					</div>
				</div>

				<div class="footer-section">
					<h4 class="footer-heading text-secondary">Resources</h4>
					<ul class="footer-links">
						<li><a href="/dev-docs" class="footer-link text-secondary">Documentation</a></li>
						<li>
							<a
								href="https://github.com/synergyai-os/Synergy-Open-Source"
								target="_blank"
								rel="noopener noreferrer"
								class="footer-link text-secondary">GitHub</a
							>
						</li>
						<li>
							<a href="/dev-docs/2-areas/patterns/INDEX" class="footer-link text-secondary"
								>Patterns</a
							>
						</li>
					</ul>
				</div>

				<div class="footer-section">
					<h4 class="footer-heading text-secondary">Community</h4>
					<ul class="footer-links">
						<li>
							<a
								href="https://github.com/synergyai-os/Synergy-Open-Source/issues"
								target="_blank"
								rel="noopener noreferrer"
								class="footer-link text-secondary">Report an Issue</a
							>
						</li>
						<li><a href="/CONTRIBUTING" class="footer-link text-secondary">Contribute</a></li>
						<li><a href="/dev-docs" class="footer-link text-secondary">Start Building</a></li>
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
	.homepage-layout {
		min-height: 100vh;
		width: 100%;
	}

	/* Hero Section */
	.hero-section {
		padding: 4rem 0 6rem 0;
		border-bottom: 1px solid var(--color-border-base);
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 2rem;
		font-size: 0.875rem;
		font-weight: 500;
		align-self: center;
	}

	.badge-icon {
		font-size: 1.25rem;
	}

	.hero-title {
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.gradient-text {
		background: linear-gradient(
			135deg,
			var(--color-accent-primary),
			var(--color-accent-secondary, var(--color-accent-primary))
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-lead {
		font-size: 1.25rem;
		line-height: 1.6;
	}

	.cta-group {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
	}

	.cta-primary {
		padding: 1rem 2rem;
		background: var(--color-accent-primary);
		color: white;
		border-radius: 0.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.cta-primary:hover {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(var(--color-accent-primary-rgb, 59, 130, 246), 0.3);
	}

	.cta-secondary {
		display: flex;
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
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	}

	.star-count {
		padding: 0.25rem 0.5rem;
		background: var(--color-accent-primary);
		color: white;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}

	.quick-links {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		align-items: center;
		font-size: 0.875rem;
	}

	.quick-link {
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.quick-link:hover {
		color: var(--color-accent-primary) !important;
	}

	/* Pain Points Section */
	.pain-section {
		padding: 4rem 0;
		border-bottom: 1px solid var(--color-border-base);
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: -0.02em;
		margin-bottom: 3rem;
	}

	.pain-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.pain-card {
		padding: 2rem;
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		transition: all 0.2s ease;
	}

	.pain-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
		border-color: var(--color-accent-primary);
	}

	.pain-emoji {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
	}

	.pain-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.pain-description {
		font-size: 1rem;
		line-height: 1.6;
	}

	/* Solution Section */
	.solution-section {
		padding: 4rem 0;
		border-bottom: 1px solid var(--color-border-base);
	}

	.solution-content {
		text-align: center;
	}

	.eyebrow {
		display: inline-block;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.solution-lead {
		font-size: 1.125rem;
		line-height: 1.7;
		margin-bottom: 2.5rem;
	}

	.feature-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		text-align: left;
	}

	.feature-item {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.feature-icon {
		flex-shrink: 0;
		color: var(--color-accent-primary);
	}

	.feature-text strong {
		display: block;
		font-size: 1.125rem;
		margin-bottom: 0.25rem;
	}

	.feature-text p {
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
	}

	/* Stats Section */
	.stats-section {
		padding: 4rem 0;
		border-bottom: 1px solid var(--color-border-base);
	}

	.section-lead {
		font-size: 1.125rem;
		margin-bottom: 3rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1.5rem;
		margin-bottom: 4rem;
	}

	.stat-card {
		padding: 2rem 1.5rem;
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		text-align: center;
		transition: all 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
		border-color: var(--color-accent-primary);
	}

	.stat-value {
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.875rem;
		line-height: 1.4;
	}

	/* Cost Comparison */
	.cost-comparison {
		max-width: 32rem;
		margin: 0 auto;
	}

	.cost-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.cost-table {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.cost-row {
		display: flex;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
	}

	.cost-row.strike {
		opacity: 0.7;
	}

	.cost-row.strike .cost-name,
	.cost-row.strike .cost-price {
		text-decoration: line-through;
	}

	.cost-row.highlight {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 1px var(--color-accent-primary);
	}

	.cost-name,
	.cost-price {
		font-size: 1rem;
		font-weight: 500;
	}

	/* Final CTA Section */
	.final-cta-section {
		padding: 5rem 0 4rem 0;
		border-bottom: 1px solid var(--color-border-base);
	}

	/* Join Grid - Two Columns */
	.join-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.join-section {
		display: flex;
		flex-direction: column;
	}

	.core-team-card,
	.waitlist-card {
		flex: 1;
		padding: 2rem;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05));
		border: 2px solid var(--color-accent-primary);
		border-radius: 1rem;
		display: flex;
		flex-direction: column;
	}

	.waitlist-card {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(59, 130, 246, 0.05));
		border-color: var(--color-border-elevated);
	}

	.join-heading {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		letter-spacing: -0.01em;
	}

	.join-subheading {
		font-size: 0.9375rem;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	/* Contribution Ladder */
	.contribution-ladder {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}

	.ladder-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--color-bg-base);
		border: 2px solid var(--color-border-base);
		border-radius: 0.75rem;
		min-width: 140px;
		flex: 1;
		transition: all 0.2s ease;
	}

	.ladder-step:hover {
		border-color: var(--color-accent-primary);
		transform: translateY(-4px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
	}

	.ladder-step-highlight {
		border-color: var(--color-accent-primary);
		background: rgba(59, 130, 246, 0.05);
	}

	.ladder-step-premium {
		border-color: #fbbf24;
		background: rgba(251, 191, 36, 0.05);
	}

	.ladder-badge {
		font-size: 2rem;
		line-height: 1;
	}

	.ladder-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		text-align: center;
	}

	.ladder-number {
		font-size: 1rem;
		font-weight: 700;
	}

	.ladder-reward {
		font-size: 0.8125rem;
		text-align: center;
	}

	.ladder-bonus {
		font-size: 0.6875rem;
		color: var(--color-accent-primary);
		text-align: center;
		margin-top: 0.5rem;
		padding: 0.375rem 0.5rem;
		background: rgba(59, 130, 246, 0.1);
		border-radius: 0.375rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.ladder-arrow {
		font-size: 1.25rem;
		font-weight: 700;
	}

	/* Action Button */
	.action-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
		margin-top: auto;
	}

	.action-button-accent {
		background: linear-gradient(135deg, var(--color-accent-primary), #667eea);
		color: white;
		border: none;
	}

	.action-button-accent:hover {
		opacity: 0.9;
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
	}

	.waitlist-container {
		margin: 3rem 0 2rem 0;
	}

	.cta-links {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		align-items: center;
		font-size: 0.875rem;
	}

	.cta-link {
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.cta-link:hover {
		color: var(--color-accent-primary) !important;
	}

	/* Footer */
	.footer {
		padding: 3rem 0 2rem 0;
	}

	.footer-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
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
	@media (max-width: 768px) {
		.hero-section {
			padding: 3rem 0 4rem 0;
		}

		.hero-title {
			font-size: 2rem;
		}

		.hero-lead {
			font-size: 1.125rem;
		}

		.section-title {
			font-size: 1.75rem;
		}

		.pain-grid {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.footer-grid {
			grid-template-columns: 1fr;
		}

		/* Mobile: Stack Join Grid */
		.join-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.contribution-ladder {
			flex-direction: column;
			gap: 0.75rem;
		}

		.ladder-arrow {
			transform: rotate(90deg);
		}

		.ladder-step {
			width: 100%;
			min-width: auto;
		}

		.join-heading {
			font-size: 1.25rem;
		}

		.join-subheading {
			font-size: 0.875rem;
		}

		.core-team-card,
		.waitlist-card {
			padding: 1.5rem;
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
