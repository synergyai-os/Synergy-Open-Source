<script lang="ts">
	import { goto } from '$app/navigation';
	import MetricsForecast from '$lib/components/ai-tools/MetricsForecast.svelte';
	import ToolComparisonTable from '$lib/components/ai-tools/ToolComparisonTable.svelte';
	import { verifiedTools } from '$lib/services/metricsService';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut, elasticOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	// Animation state
	let heroVisible = false;
	let socialProofVisible = false;
	let communityVisible = false;

	// Navigation state
	let docsMenuOpen = false;
	let designMenuOpen = false;
	let aboutMenuOpen = false;
	let mobileMenuOpen = false;

	// Detect motion preference
	let prefersReducedMotion = false;

	// Count-up animation for social proof
	let contributorCount = 0;
	let starCount = 0;
	let docsCount = 0;

	const targetCounts = {
		contributors: 10,
		stars: 0,
		docs: 50
	};

	onMount(() => {
		// Check motion preference
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = mediaQuery.matches;
			mediaQuery.addEventListener('change', (e) => {
				prefersReducedMotion = e.matches;
			});
		}

		// Trigger entrance animations
		setTimeout(() => (heroVisible = true), 100);
		setTimeout(() => (socialProofVisible = true), 400);
		setTimeout(() => (communityVisible = true), 700);

		// Count-up animation for social proof
		animateCount('contributors', 0, targetCounts.contributors, 1200);
		animateCount('stars', 0, targetCounts.stars, 1200);
		animateCount('docs', 0, targetCounts.docs, 1200);

		// Close menus on escape key
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function animateCount(
		type: 'contributors' | 'stars' | 'docs',
		start: number,
		end: number,
		duration: number
	) {
		const startTime = performance.now();
		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = quintOut(progress);
			const current = Math.floor(start + (end - start) * eased);

			if (type === 'contributors') contributorCount = current;
			else if (type === 'stars') starCount = current;
			else if (type === 'docs') docsCount = current;

			if (progress < 1) requestAnimationFrame(animate);
		};
		requestAnimationFrame(animate);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			docsMenuOpen = false;
			designMenuOpen = false;
			aboutMenuOpen = false;
			mobileMenuOpen = false;
		}
	}

	function closeAllMenus() {
		docsMenuOpen = false;
		designMenuOpen = false;
		aboutMenuOpen = false;
	}

	// Navigation menu structure (10 items max - Miller's Law)
	const navGroups = [
		{
			id: 'docs',
			icon: '📚',
			label: 'Documentation',
			color: 'rgba(59, 130, 246, 0.1)', // Blue
			items: [
				{
					label: 'Patterns',
					href: '/dev-docs/2-areas/patterns/INDEX',
					description: 'Solved problems & debugging',
					badge: 'Most Used'
				},
				{
					label: 'Architecture',
					href: '/dev-docs/2-areas/architecture',
					description: 'System design & tech stack'
				},
				{
					label: 'All Docs',
					href: '/dev-docs/all',
					description: 'Browse all documentation',
					badge: 'Hub'
				}
			]
		},
		{
			id: 'design',
			icon: '🎨',
			label: 'Design',
			color: 'rgba(168, 85, 247, 0.1)', // Purple
			items: [
				{
					label: 'Design Tokens',
					href: '/dev-docs/2-areas/design-tokens',
					description: 'Colors, spacing, typography'
				},
				{
					label: 'UI Patterns',
					href: '/dev-docs/2-areas/patterns/ui-patterns',
					description: 'Layout, navigation, forms'
				},
				{
					label: 'Principles',
					href: '/dev-docs/2-areas/design-principles',
					description: 'Visual philosophy & UX'
				}
			]
		},
		{
			id: 'about',
			icon: '📊',
			label: 'About',
			color: 'rgba(34, 197, 94, 0.1)', // Green
			items: [
				{
					label: 'Product Vision',
					href: '/marketing-docs/strategy/product-vision-2.0',
					description: "What we're building & why"
				},
				{
					label: 'Metrics & OKRs',
					href: '/dev-docs/2-areas/metrics',
					description: 'Public metrics & success signals'
				},
				{ label: 'Contribute', href: '/CONTRIBUTING', description: 'Join the core team' }
			]
		}
	];

	// Quick action cards
	const quickActions = [
		{
			icon: '🐛',
			title: 'Debug an Issue',
			description: 'Find solutions in < 2 minutes',
			href: '/dev-docs/2-areas/patterns/INDEX',
			color: 'accent',
			tag: 'Most Used'
		},
		{
			icon: '📊',
			title: 'See Our Metrics',
			description: 'Public OKRs, revenue, community',
			href: '/dev-docs/2-areas/metrics',
			color: 'primary',
			tag: 'Updated Monthly'
		},
		{
			icon: '🚀',
			title: 'Product Vision',
			description: "What we're building & why",
			href: '/marketing-docs/strategy/product-vision-2.0',
			color: 'primary',
			tag: 'Start Here'
		}
	];

	// Role-based paths
	const roles = [
		{
			icon: '📊',
			title: 'Product Manager',
			description: 'Strategy, metrics, user journeys',
			links: [
				{ label: 'Product Vision 2.0', href: '/marketing-docs/strategy/product-vision-2.0' },
				{ label: 'Metrics & OKRs', href: '/dev-docs/2-areas/metrics' },
				{ label: 'Product Strategy', href: '/marketing-docs/strategy/product-strategy' }
			]
		},
		{
			icon: '🎨',
			title: 'Designer',
			description: 'Design tokens, components, patterns',
			links: [
				{ label: 'Design Tokens', href: '/dev-docs/2-areas/design-tokens' },
				{ label: 'UI Patterns', href: '/dev-docs/2-areas/patterns/ui-patterns' },
				{ label: 'Component Library', href: '/dev-docs/2-areas/component-library' }
			]
		},
		{
			icon: '🛠️',
			title: 'Engineer',
			description: 'Patterns, architecture, debugging',
			links: [
				{ label: 'Pattern Index', href: '/dev-docs/2-areas/patterns/INDEX' },
				{ label: 'Architecture', href: '/dev-docs/2-areas/architecture' },
				{ label: 'Svelte 5 Patterns', href: '/dev-docs/2-areas/patterns/svelte-reactivity' }
			]
		}
	];

	// Stats (live data from metrics)
	const stats = [
		{ label: 'Contributors', value: '1', target: '10+' },
		{ label: 'GitHub Stars', value: '0', target: '100' },
		{ label: 'Docs Pages', value: '50+', target: '100+' },
		{ label: 'Patterns', value: '48', target: '75+' }
	];
</script>

<svelte:head>
	<title>SynergyOS Documentation - The Open-Source Product OS</title>
</svelte:head>

<!-- Navbar -->
<nav class="docs-navbar" aria-label="Main navigation">
	<div class="navbar-content">
		<div class="navbar-left">
			<a href="/dev-docs" class="navbar-logo">
				<span class="logo-icon">⚡</span>
				<span class="logo-text">SynergyOS Docs</span>
			</a>
		</div>

		<!-- Desktop Navigation -->
		<div class="navbar-center navbar-desktop">
			{#each navGroups as group}
				<div class="nav-group">
					<button
						class="nav-group-trigger"
						onclick={() => {
							if (group.id === 'docs') {
								docsMenuOpen = !docsMenuOpen;
								designMenuOpen = false;
								aboutMenuOpen = false;
							} else if (group.id === 'design') {
								designMenuOpen = !designMenuOpen;
								docsMenuOpen = false;
								aboutMenuOpen = false;
							} else {
								aboutMenuOpen = !aboutMenuOpen;
								docsMenuOpen = false;
								designMenuOpen = false;
							}
						}}
						aria-expanded={group.id === 'docs'
							? docsMenuOpen
							: group.id === 'design'
								? designMenuOpen
								: aboutMenuOpen}
						aria-haspopup="true"
					>
						<span class="nav-group-icon">{group.icon}</span>
						<span class="nav-group-label">{group.label}</span>
						<svg
							class="nav-chevron"
							class:nav-chevron-open={group.id === 'docs'
								? docsMenuOpen
								: group.id === 'design'
									? designMenuOpen
									: aboutMenuOpen}
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="6 9 12 15 18 9"></polyline>
						</svg>
					</button>

					{#if (group.id === 'docs' && docsMenuOpen) || (group.id === 'design' && designMenuOpen) || (group.id === 'about' && aboutMenuOpen)}
						<div
							class="nav-dropdown"
							transition:slide={{ duration: prefersReducedMotion ? 0 : 200, easing: quintOut }}
						>
							{#each group.items as item}
								<a href={item.href} class="nav-dropdown-item" onclick={() => closeAllMenus()}>
									<div class="nav-dropdown-content">
										<span class="nav-dropdown-label">
											{item.label}
											{#if item.badge}
												<span class="nav-dropdown-badge">{item.badge}</span>
											{/if}
										</span>
										<span class="nav-dropdown-description">{item.description}</span>
									</div>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="navbar-right">
			<!-- Mobile Hamburger -->
			<button
				class="hamburger-button navbar-mobile"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Toggle mobile menu"
				aria-expanded={mobileMenuOpen}
			>
				<span class="hamburger-icon">≡</span>
			</button>

			<ThemeToggle />
			<a
				href="https://github.com/synergyai-os/Synergy-Open-Source"
				target="_blank"
				rel="noopener noreferrer"
				class="navbar-link navbar-link-icon"
				aria-label="View on GitHub"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
					/>
				</svg>
			</a>
		</div>
	</div>
</nav>

<!-- Mobile Menu Backdrop -->
{#if mobileMenuOpen}
	<div
		class="mobile-backdrop"
		transition:fade={{ duration: prefersReducedMotion ? 0 : 200 }}
		onclick={() => (mobileMenuOpen = false)}
		role="presentation"
	></div>
{/if}

<!-- Mobile Slide-in Menu -->
{#if mobileMenuOpen}
	<div
		class="mobile-menu"
		transition:fly={{ x: -300, duration: prefersReducedMotion ? 0 : 250, easing: quintOut }}
		aria-label="Mobile navigation menu"
	>
		<div class="mobile-menu-header">
			<h2 class="mobile-menu-title">Menu</h2>
			<button
				class="mobile-menu-close"
				onclick={() => (mobileMenuOpen = false)}
				aria-label="Close menu"
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>

		<div class="mobile-menu-content">
			{#each navGroups as group, groupIndex}
				<div
					class="mobile-menu-section"
					in:fly={{ y: 20, duration: 250, delay: groupIndex * 80, easing: quintOut }}
				>
					<h3 class="mobile-menu-section-title">
						<span
							class="mobile-section-icon-badge"
							style="background: {group.color || 'rgba(59, 130, 246, 0.1)'}"
						>
							{group.icon}
						</span>
						{group.label}
					</h3>
					<div class="mobile-menu-cards">
						{#each group.items as item, itemIndex}
							<a
								href={item.href}
								class="mobile-menu-card"
								onclick={() => (mobileMenuOpen = false)}
								in:fly={{
									y: 15,
									duration: 200,
									delay: groupIndex * 80 + itemIndex * 40,
									easing: quintOut
								}}
							>
								<div class="mobile-card-content">
									<div class="mobile-card-header">
										<h4 class="mobile-card-title">{item.label}</h4>
										{#if item.badge}
											<span class="mobile-card-badge">{item.badge}</span>
										{/if}
									</div>
									<p class="mobile-card-description">{item.description}</p>
								</div>
								<svg
									class="mobile-card-arrow"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<div class="docs-home">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<!-- Leading Badge -->
			{#if heroVisible}
				<div class="hero-badge" in:scale={{ duration: 400, start: 0.8, easing: elasticOut }}>
					<span class="badge-icon">🔥</span>
					<span class="badge-text">Built in Public • AI-Generated Docs</span>
				</div>
			{/if}

			{#if heroVisible}
				<h1 class="hero-title" in:fade={{ duration: 300, delay: 100 }}>
					<span class="gradient-text">SynergyOS</span> Documentation
				</h1>
			{/if}
			{#if heroVisible}
				<p class="hero-description" in:fly={{ y: 20, duration: 300, delay: 200, easing: quintOut }}>
					The open-source Product OS for teams who want to accelerate the smart use of AI. Built in
					public, documented transparently, powered by community.
				</p>
			{/if}

			<!-- Social Proof Band -->
			{#if socialProofVisible}
				<div class="social-proof-band" in:fly={{ y: 20, duration: 300, easing: quintOut }}>
					<div class="social-proof-item">
						<span class="social-proof-icon">👥</span>
						<span class="social-proof-text">{contributorCount}+ Contributors</span>
					</div>
					<div class="social-proof-divider">|</div>
					<div class="social-proof-item">
						<span class="social-proof-icon">⭐</span>
						<span class="social-proof-text">Target: 100 Stars</span>
					</div>
					<div class="social-proof-divider">|</div>
					<div class="social-proof-item">
						<span class="social-proof-icon">📝</span>
						<span class="social-proof-text">{docsCount}+ Docs Pages</span>
					</div>
					<div class="social-proof-divider">|</div>
					<div class="social-proof-item">
						<span class="social-proof-icon">🔄</span>
						<span class="social-proof-text">Updated Daily</span>
					</div>
				</div>
			{/if}

			<!-- Primary CTAs -->
			{#if socialProofVisible}
				<div class="hero-cta-group" in:fly={{ y: 20, duration: 300, delay: 100, easing: quintOut }}>
					<a
						href="https://github.com/synergyai-os/Synergy-Open-Source"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary btn-large cta-pulse"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
							/>
						</svg>
						⭐ Star on GitHub
					</a>
					<a
						href="https://github.com/synergyai-os/Synergy-Open-Source"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-secondary btn-large"
					>
						📖 Explore Docs
					</a>
				</div>
			{/if}

			<!-- Community CTA - Contribution Ladder -->
			{#if communityVisible}
				<div class="community-cta" in:fly={{ y: 30, duration: 350, easing: quintOut }}>
					<div class="community-cta-header">
						<h3 class="community-cta-title">🚀 Join the Core Team</h3>
						<p class="community-cta-subtitle">Build with us. Get recognized. Shape the future.</p>
					</div>
					<div class="contribution-ladder">
						<div class="ladder-step">
							<div class="ladder-step-badge">🎯</div>
							<div class="ladder-step-content">
								<div class="ladder-step-number">1 PR</div>
								<div class="ladder-step-reward">→ Contributor Badge</div>
							</div>
						</div>
						<div class="ladder-arrow">→</div>
						<div class="ladder-step ladder-step-highlight">
							<div class="ladder-step-badge">⚡</div>
							<div class="ladder-step-content">
								<div class="ladder-step-number">10 PRs</div>
								<div class="ladder-step-reward">→ Early Adopter Role</div>
								<div class="ladder-step-bonus">🔥 First 5 only: 10 PRs + 1 outcome = Core Team</div>
							</div>
						</div>
						<div class="ladder-arrow">→</div>
						<div class="ladder-step ladder-step-premium">
							<div class="ladder-step-badge">👑</div>
							<div class="ladder-step-content">
								<div class="ladder-step-number">100 PRs</div>
								<div class="ladder-step-reward">→ Official Core Team Member</div>
							</div>
						</div>
					</div>
					<a
						href="https://github.com/synergyai-os/Synergy-Open-Source/blob/main/CONTRIBUTING.md"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-accent btn-large community-cta-button"
					>
						🏗️ Start Building & Get Recognized
					</a>
				</div>
			{/if}

			<!-- Quick Actions - De-emphasized -->
			<div class="quick-actions-minimal">
				{#each quickActions as action}
					<a href={action.href} class="action-card-minimal">
						<span class="action-icon-minimal">{action.icon}</span>
						<span class="action-title-minimal">{action.title}</span>
						{#if action.tag}
							<span class="action-tag-minimal">{action.tag}</span>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- How It Works Section - Scannable, Visual-First -->
	<section class="how-it-works">
		<div class="how-it-works-content">
			<h2 class="section-title-large">Documentation That Never Goes Stale</h2>
			<p class="section-subtitle">
				We didn't write this documentation. AI did. It scans our codebase and generates fresh docs
				automatically.
			</p>

			<div class="how-grid-visual">
				<div class="how-card-visual">
					<div class="how-icon-large">⚡</div>
					<h3 class="how-title-bold">Real-Time Scanning</h3>
					<p class="how-text-minimal">AI scans our codebase continuously, detecting every change</p>
				</div>
				<div class="how-card-visual">
					<div class="how-icon-large">📝</div>
					<h3 class="how-title-bold">Auto-Generated</h3>
					<p class="how-text-minimal">
						Docs are written by AI based on actual code, not human memory
					</p>
				</div>
				<div class="how-card-visual">
					<div class="how-icon-large">🔄</div>
					<h3 class="how-title-bold">Always Fresh</h3>
					<p class="how-text-minimal">
						Every code change triggers a doc update. Zero manual maintenance.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Role-Based Navigation -->
	<section class="roles-section">
		<h2 class="section-title">Pick Your Role</h2>
		<p class="section-description">Find what you need based on what you do</p>

		<div class="roles-grid">
			{#each roles as role}
				<div class="role-card">
					<div class="role-icon">{role.icon}</div>
					<h3 class="role-title">{role.title}</h3>
					<p class="role-description">{role.description}</p>
					<ul class="role-links">
						{#each role.links as link}
							<li>
								<a href={link.href} class="role-link">
									{link.label}
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
										<path
											d="M6 4L10 8L6 12"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<!-- Stats Bar -->
	<section class="stats-bar">
		{#each stats as stat}
			<div class="stat">
				<div class="stat-value">{stat.value}</div>
				<div class="stat-label">{stat.label}</div>
				<div class="stat-target">Target: {stat.target}</div>
			</div>
		{/each}
	</section>

	<!-- AI Tools Section -->
	<section class="ai-tools-section">
		<div class="ai-tools-content">
			<h2 class="section-title">AI Reads Our Docs Better Than Humans</h2>
			<p class="section-description">
				Here's what happens when AI-first coding tools meet always-fresh documentation. No setup. No
				config. Just point them at our GitHub repo.
			</p>

			<!-- Verified Tools -->
			<div class="verified-tools">
				<h3 class="verified-title">Verified Compatible</h3>
				<div class="tool-cards-grid">
					{#each verifiedTools as tool}
						<a href={tool.url} target="_blank" rel="noopener noreferrer" class="ai-tool-card">
							<div class="tool-logo">{tool.logo}</div>
							<div class="tool-content">
								<h4 class="tool-name">{tool.name}</h4>
								<p class="tool-description">{tool.description}</p>
							</div>
							{#if tool.verified}
								<span class="verified-badge">✓ Verified</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>

			<!-- Metrics Forecast -->
			<div class="metrics-forecast">
				<h3 class="forecast-title">What We Predict Will Happen</h3>
				<p class="forecast-description">
					When AI can read your docs, adoption accelerates. Here's our 90-day forecast after
					shipping this feature.
				</p>

				<MetricsForecast />

				<div class="forecast-callout">
					<strong>Bold Claim:</strong> We'll hit 100 GitHub stars in 90 days.
					<a href="/dev-docs/2-areas/metrics" class="metrics-link">Track it live →</a>
				</div>
			</div>

			<!-- Tool Comparison -->
			<div class="tool-comparison">
				<h3 class="comparison-title">What These Tools Can Do</h3>
				<ToolComparisonTable />
			</div>
		</div>
	</section>

	<!-- Community Section -->
	<section class="community-section">
		<div class="community-content">
			<div class="community-text">
				<h2 class="section-title">Join the Community</h2>
				<p class="section-description">
					Built by developers, for developers. Open source, transparent metrics, and a marketplace
					where builders earn 80%.
				</p>
				<div class="community-actions">
					<a
						href="https://github.com/synergyai-os/Synergy-Open-Source"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
							/>
						</svg>
						Star on GitHub
					</a>
					<a href="/CONTRIBUTING" class="btn btn-secondary"> 📖 Contributing Guide </a>
				</div>
			</div>

			<div class="community-stats">
				<div class="stat-card">
					<div class="stat-card-icon">💰</div>
					<div class="stat-card-value">$0 MRR</div>
					<div class="stat-card-label">Pre-revenue</div>
					<a href="/dev-docs/2-areas/metrics" class="stat-card-link">View all metrics →</a>
				</div>
				<div class="stat-card">
					<div class="stat-card-icon">🎯</div>
					<div class="stat-card-value">48</div>
					<div class="stat-card-label">Patterns Documented</div>
					<a href="/dev-docs/2-areas/patterns/INDEX" class="stat-card-link">Browse patterns →</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer CTA -->
	<section class="footer-cta">
		<h2>Ready to dive in?</h2>
		<p>Choose your path and start exploring</p>
		<div class="footer-actions">
			<a href="/dev-docs/2-areas/patterns/INDEX" class="btn btn-large btn-primary">
				🐛 Debug Something
			</a>
			<a href="/marketing-docs/strategy/product-vision-2.0" class="btn btn-large btn-secondary">
				🚀 See the Vision
			</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="site-footer">
		<div class="footer-content">
			<div class="footer-section footer-about">
				<h3 class="footer-title">SynergyOS</h3>
				<p class="footer-description">
					The open-source Product OS for teams who want to accelerate the smart use of AI. Built in
					public with transparent metrics and AI-generated documentation.
				</p>
				<a
					href="https://github.com/synergyai-os/Synergy-Open-Source"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-primary github-cta"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
						/>
					</svg>
					⭐ Star on GitHub
				</a>
			</div>

			<div class="footer-section">
				<h4 class="footer-heading">Documentation</h4>
				<ul class="footer-links">
					<li><a href="/dev-docs/2-areas/patterns/INDEX">Pattern Index</a></li>
					<li><a href="/dev-docs/2-areas/metrics">Metrics & OKRs</a></li>
					<li><a href="/dev-docs/2-areas/architecture">Architecture</a></li>
					<li><a href="/dev-docs/2-areas/design-tokens">Design Tokens</a></li>
				</ul>
			</div>

			<div class="footer-section">
				<h4 class="footer-heading">Product</h4>
				<ul class="footer-links">
					<li><a href="/marketing-docs/strategy/product-vision-2.0">Product Vision</a></li>
					<li><a href="/marketing-docs/strategy/product-strategy">Product Strategy</a></li>
					<li><a href="/CONTRIBUTING">Contributing Guide</a></li>
					<li>
						<a
							href="https://github.com/synergyai-os/Synergy-Open-Source/issues"
							target="_blank"
							rel="noopener noreferrer">Report an Issue</a
						>
					</li>
				</ul>
			</div>

			<div class="footer-section">
				<h4 class="footer-heading">Community</h4>
				<ul class="footer-links">
					<li>
						<a
							href="https://github.com/synergyai-os/Synergy-Open-Source"
							target="_blank"
							rel="noopener noreferrer">GitHub</a
						>
					</li>
					<li>
						<a
							href="https://github.com/synergyai-os/Synergy-Open-Source/discussions"
							target="_blank"
							rel="noopener noreferrer">Discussions</a
						>
					</li>
					<li><a href="/dev-docs/2-areas/metrics">Public Metrics</a></li>
				</ul>
			</div>
		</div>

		<div class="footer-bottom">
			<p class="footer-copyright">© 2025 SynergyOS • Built in Public • Powered by AI</p>
		</div>
	</footer>
</div>

<style>
	/* Navbar */
	.docs-navbar {
		position: sticky;
		top: 0;
		z-index: 1000;
		background: var(--color-bg-elevated);
		border-bottom: 1px solid var(--color-border-base);
		backdrop-filter: blur(8px);
	}

	.navbar-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0.75rem var(--spacing-content-padding);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.navbar-left {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.navbar-center {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
		justify-content: center;
	}

	.navbar-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		font-weight: 600;
		font-size: 1.125rem;
		color: var(--color-text-primary);
		transition: opacity 0.15s ease;
	}

	.navbar-logo:hover {
		opacity: 0.8;
	}

	.logo-icon {
		font-size: 1.5rem;
	}

	/* Desktop Navigation Groups */
	.nav-group {
		position: relative;
	}

	.nav-group-trigger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 0.5rem;
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.nav-group-trigger:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-hover);
		border-color: var(--color-border-base);
	}

	.nav-group-trigger:focus-visible {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
	}

	.nav-group-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.nav-chevron {
		transition: transform 0.2s ease;
		opacity: 0.7;
	}

	.nav-chevron-open {
		transform: rotate(180deg);
	}

	/* Dropdown Menu */
	.nav-dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		min-width: 300px;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		padding: 0.5rem;
		overflow: hidden;
	}

	.nav-dropdown-item {
		display: flex;
		align-items: flex-start;
		padding: 0.75rem;
		border-radius: 0.5rem;
		text-decoration: none;
		transition: background 0.15s ease;
	}

	.nav-dropdown-item:hover {
		background: var(--color-bg-hover);
	}

	.nav-dropdown-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.nav-dropdown-label {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.nav-dropdown-badge {
		font-size: 0.625rem;
		padding: 0.25rem 0.5rem;
		background: var(--color-accent-primary);
		color: white;
		border-radius: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
	}

	.nav-dropdown-description {
		font-size: 0.8125rem;
		color: var(--color-text-tertiary);
		line-height: 1.4;
	}

	/* Mobile Navigation */
	.navbar-mobile {
		display: none;
	}

	.hamburger-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: transparent;
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.hamburger-button:hover {
		background: var(--color-bg-hover);
	}

	.hamburger-button:focus-visible {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
	}

	.hamburger-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	/* Mobile Menu Backdrop */
	.mobile-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1100;
	}

	/* Mobile Slide-in Menu */
	.mobile-menu {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 320px;
		max-width: 85vw;
		background: var(--color-bg-base);
		border-right: 1px solid var(--color-border-base);
		z-index: 1200;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.mobile-menu-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border-base);
	}

	.mobile-menu-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.mobile-menu-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: 0.375rem;
		transition: all 0.15s ease;
	}

	.mobile-menu-close:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.mobile-menu-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	/* Mobile Menu Sections */
	.mobile-menu-section {
		margin-bottom: 2rem;
	}

	.mobile-menu-section:last-child {
		margin-bottom: 0;
	}

	.mobile-menu-section-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-secondary);
		margin: 0 0 1rem 0;
		padding: 0 0.25rem;
	}

	.mobile-section-icon-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		font-size: 1rem;
		flex-shrink: 0;
	}

	/* Mobile Menu Cards */
	.mobile-menu-cards {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.mobile-menu-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		text-decoration: none;
		transition: all 0.2s ease;
		min-height: 4.5rem;
	}

	.mobile-menu-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
		border-color: var(--color-accent-primary);
		background: var(--color-bg-elevated);
	}

	.mobile-card-content {
		flex: 1;
		min-width: 0;
	}

	.mobile-card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
		flex-wrap: wrap;
	}

	.mobile-card-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.3;
	}

	.mobile-card-badge {
		font-size: 0.625rem;
		padding: 0.25rem 0.5rem;
		background: var(--color-accent-primary);
		color: white;
		border-radius: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
		line-height: 1;
	}

	.mobile-card-description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
		margin: 0;
	}

	.mobile-card-arrow {
		color: var(--color-accent-primary);
		flex-shrink: 0;
		opacity: 0;
		transform: translateX(-4px);
		transition: all 0.2s ease;
	}

	.mobile-menu-card:hover .mobile-card-arrow {
		opacity: 1;
		transform: translateX(0);
	}

	/* Touch devices - always show arrow */
	@media (hover: none) {
		.mobile-card-arrow {
			opacity: 0.5;
			transform: translateX(0);
		}

		.mobile-menu-card:active .mobile-card-arrow {
			opacity: 1;
		}
	}

	.navbar-right {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-shrink: 0;
	}

	.navbar-link {
		text-decoration: none;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		transition: color 0.15s ease;
	}

	.navbar-link:hover {
		color: var(--color-accent-primary);
	}

	.navbar-link-icon {
		display: flex;
		align-items: center;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: background 0.15s;
	}

	.navbar-link-icon:hover {
		background: var(--color-bg-hover);
	}

	/* Main Content */
	.docs-home {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0;
	}

	/* Hero Section */
	.hero {
		padding: 4rem var(--spacing-content-padding);
		text-align: center;
		border-bottom: 1px solid var(--color-border-base);
	}

	.hero-content {
		max-width: 900px;
		margin: 0 auto;
	}

	.hero-title {
		font-size: 2.5rem;
		font-weight: 600;
		line-height: 1.3;
		margin-bottom: 1rem;
		color: var(--color-text-primary);
		letter-spacing: -0.02em;
	}

	.gradient-text {
		color: var(--color-accent-primary);
	}

	.hero-description {
		font-size: 1.25rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		margin-bottom: 2rem;
	}

	/* Hero Badge */
	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: linear-gradient(
			135deg,
			var(--color-accent-primary),
			var(--color-accent-secondary, #667eea)
		);
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
		border-radius: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
		animation: badge-glow 3s ease-in-out infinite;
	}

	@keyframes badge-glow {
		0%,
		100% {
			box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
		}
		50% {
			box-shadow:
				0 4px 24px rgba(59, 130, 246, 0.6),
				0 0 40px rgba(59, 130, 246, 0.2);
		}
	}

	.badge-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.badge-text {
		line-height: 1;
	}

	/* Social Proof Band */
	.social-proof-band {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 1rem 1.5rem;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		margin-bottom: 2rem;
	}

	.social-proof-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.social-proof-icon {
		font-size: 1.125rem;
		line-height: 1;
	}

	.social-proof-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		white-space: nowrap;
	}

	.social-proof-divider {
		color: var(--color-border-base);
		font-weight: 300;
	}

	/* Hero CTA Group */
	.hero-cta-group {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 3rem;
	}

	.ai-badge {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: var(--color-accent-primary);
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		border-radius: 0.375rem;
		margin-bottom: 1.5rem;
	}

	/* Community CTA - Contribution Ladder */
	.community-cta {
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
		border: 2px solid var(--color-accent-primary);
		border-radius: 1rem;
		padding: 2rem;
		margin-bottom: 3rem;
	}

	.community-cta-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.community-cta-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
		letter-spacing: -0.01em;
	}

	.community-cta-subtitle {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.contribution-ladder {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}

	.ladder-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		background: var(--color-bg-base);
		border: 2px solid var(--color-border-base);
		border-radius: 0.75rem;
		min-width: 200px;
		transition: all 0.2s ease;
	}

	.ladder-step {
		position: relative;
		overflow: hidden;
	}

	.ladder-step::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(
			135deg,
			transparent 0%,
			rgba(255, 255, 255, 0.1) 45%,
			rgba(255, 255, 255, 0.3) 50%,
			rgba(255, 255, 255, 0.1) 55%,
			transparent 100%
		);
		transform: translateX(-100%) translateY(-100%) rotate(45deg);
		transition: transform 0.6s ease;
	}

	.ladder-step:hover {
		border-color: var(--color-accent-primary);
		transform: translateY(-4px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
	}

	.ladder-step:hover::before {
		transform: translateX(100%) translateY(100%) rotate(45deg);
	}

	.ladder-step-highlight {
		border-color: var(--color-accent-primary);
		background: rgba(59, 130, 246, 0.05);
	}

	.ladder-step-premium {
		border-color: #fbbf24;
		background: rgba(251, 191, 36, 0.05);
	}

	.ladder-step-badge {
		font-size: 2.5rem;
		line-height: 1;
	}

	.ladder-step-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.ladder-step-number {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.ladder-step-reward {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		text-align: center;
	}

	.ladder-step-bonus {
		font-size: 0.75rem;
		color: var(--color-accent-primary);
		text-align: center;
		margin-top: 0.5rem;
		padding: 0.5rem;
		background: rgba(59, 130, 246, 0.1);
		border-radius: 0.375rem;
		font-weight: 600;
	}

	.ladder-arrow {
		font-size: 1.5rem;
		color: var(--color-text-tertiary);
		font-weight: 700;
	}

	.community-cta-button {
		width: 100%;
		justify-content: center;
	}

	/* Quick Actions - Minimal */
	.quick-actions-minimal {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		flex-wrap: wrap;
		margin-top: 0;
	}

	.action-card-minimal {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		text-decoration: none;
		transition: all 0.15s ease;
		font-size: 0.875rem;
	}

	.action-card-minimal:hover {
		border-color: var(--color-accent-primary);
		background: var(--color-bg-hover);
	}

	.action-icon-minimal {
		font-size: 1.25rem;
		line-height: 1;
	}

	.action-title-minimal {
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.action-tag-minimal {
		font-size: 0.625rem;
		padding: 0.25rem 0.5rem;
		background: var(--color-accent-primary);
		color: white;
		border-radius: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
	}

	/* Quick Actions (Old) */
	.quick-actions {
		display: none;
	}

	.action-card {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		background-color: transparent !important;
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.action-card:hover {
		border-color: var(--color-text-secondary);
		background-color: var(--color-bg-hover) !important;
	}

	.action-card-accent {
		border-color: var(--color-accent-primary);
		background-color: oklch(from var(--color-accent-primary) l c h / 0.05) !important;
	}

	.action-card-accent:hover {
		background-color: oklch(from var(--color-accent-primary) l c h / 0.1) !important;
	}

	.action-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.action-content {
		flex: 1;
		text-align: left;
	}

	.action-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.25rem;
	}

	.action-description {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
		margin: 0;
	}

	.action-tag {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: var(--color-accent-primary);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* How It Works Section - Scannable, Visual-First */
	.how-it-works {
		padding: 5rem var(--spacing-content-padding);
		border-bottom: 1px solid var(--color-border-base);
		background: var(--color-bg-surface);
	}

	.how-it-works-content {
		max-width: 1100px;
		margin: 0 auto;
		text-align: center;
	}

	.section-title-large {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 1rem;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.section-subtitle {
		font-size: 1.125rem;
		color: var(--color-text-tertiary);
		margin-bottom: 4rem;
		font-weight: 400;
	}

	.how-grid-visual {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 3rem;
		margin: 0;
	}

	.how-card-visual {
		padding: 3rem 2rem;
		background-color: var(--color-bg-base) !important;
		border: 2px solid var(--color-border-base);
		border-radius: 1rem;
		transition: all 0.2s ease;
	}

	.how-card-visual:hover {
		border-color: var(--color-accent-primary);
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}

	.how-icon-large {
		font-size: 4.5rem;
		margin-bottom: 1.5rem;
		line-height: 1;
	}

	.how-title-bold {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 1rem;
		letter-spacing: -0.01em;
	}

	.how-text-minimal {
		font-size: 0.9375rem;
		color: var(--color-text-tertiary);
		line-height: 1.5;
		margin: 0;
		font-weight: 400;
	}

	/* AI Tools Section */
	.ai-tools-section {
		padding: 4rem var(--spacing-content-padding);
	}

	.ai-tools-content {
		max-width: 900px;
		margin: 0 auto;
	}

	.verified-tools {
		margin-top: 3rem;
	}

	.verified-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 1.5rem;
	}

	.tool-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.ai-tool-card {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		background-color: transparent !important;
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.ai-tool-card:hover {
		border-color: var(--color-text-secondary);
		background-color: var(--color-bg-hover) !important;
	}

	.tool-logo {
		font-size: 3rem;
		flex-shrink: 0;
	}

	.tool-content {
		flex: 1;
	}

	.tool-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.tool-description {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 0;
	}

	.verified-badge {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: var(--color-accent-primary);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 0.25rem;
	}

	.metrics-forecast {
		margin-top: 4rem;
	}

	.forecast-title,
	.comparison-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.75rem;
	}

	.forecast-description {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.forecast-callout {
		margin-top: 1.5rem;
		padding: 1rem 1.5rem;
		background: var(--color-bg-surface);
		border-left: 4px solid var(--color-accent-primary);
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		color: var(--color-text-primary);
	}

	.metrics-link {
		color: var(--color-accent-primary);
		text-decoration: none;
		font-weight: 600;
		margin-left: 0.5rem;
	}

	.metrics-link:hover {
		text-decoration: underline;
	}

	.tool-comparison {
		margin-top: 4rem;
	}

	/* Stats Bar */
	.stats-bar {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1px;
		background: var(--color-border-base);
		border-top: 1px solid var(--color-border-base);
		border-bottom: 1px solid var(--color-border-base);
	}

	.stat {
		padding: 2rem 1.5rem;
		background: var(--color-bg-base);
		text-align: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.stat-target {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	/* Roles Section */
	.roles-section {
		padding: 4rem var(--spacing-content-padding);
	}

	.section-title {
		font-size: 1.75rem;
		font-weight: 600;
		color: var(--color-text-primary);
		text-align: center;
		margin-bottom: 0.5rem;
		letter-spacing: -0.01em;
	}

	.section-description {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		text-align: center;
		margin-bottom: 3rem;
	}

	.roles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.role-card {
		padding: 2rem;
		background-color: transparent !important;
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		transition: all 0.15s ease;
	}

	.role-card:hover {
		border-color: var(--color-text-secondary);
		background-color: var(--color-bg-hover) !important;
	}

	.role-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.role-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.role-description {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
	}

	.role-links {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.role-links li {
		margin-bottom: 0.75rem;
	}

	.role-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		background: var(--color-bg-hover);
		border-radius: 0.5rem;
		color: var(--color-text-primary);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.15s ease;
	}

	.role-link:hover {
		background: var(--color-bg-hover-solid);
		color: var(--color-accent-primary);
	}

	.role-link svg {
		opacity: 0.5;
		transition: opacity 0.15s ease;
	}

	.role-link:hover svg {
		opacity: 1;
	}

	/* Community Section */
	.community-section {
		padding: 4rem var(--spacing-content-padding);
		border-top: 1px solid var(--color-border-base);
		border-bottom: 1px solid var(--color-border-base);
	}

	.community-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		align-items: center;
	}

	.community-text {
		max-width: 500px;
	}

	.community-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.community-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	.stat-card {
		padding: 1.5rem;
		background-color: transparent !important;
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
	}

	.stat-card-icon {
		font-size: 2rem;
		margin-bottom: 0.75rem;
	}

	.stat-card-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 0.25rem;
	}

	.stat-card-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: 0.75rem;
	}

	.stat-card-link {
		font-size: 0.875rem;
		color: var(--color-accent-primary);
		text-decoration: none;
		font-weight: 500;
	}

	.stat-card-link:hover {
		text-decoration: underline;
	}

	/* Footer CTA */
	.footer-cta {
		padding: 4rem var(--spacing-content-padding);
		text-align: center;
	}

	.footer-cta h2 {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.footer-cta p {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		margin-bottom: 2rem;
	}

	.footer-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		text-decoration: none;
		border-radius: 0.5rem;
		transition: all 0.15s ease;
		border: 2px solid transparent;
	}

	.btn-primary {
		background: var(--color-accent-primary);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
	}

	.btn-primary:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
	}

	.cta-pulse {
		animation: cta-pulse 2s ease-in-out infinite;
	}

	@keyframes cta-pulse {
		0%,
		100% {
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		}
		50% {
			box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
		}
	}

	.btn-secondary {
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border-color: var(--color-border-base);
	}

	.btn-secondary:hover {
		border-color: var(--color-accent-primary);
		background: var(--color-bg-hover-solid);
		transform: translateY(-2px);
	}

	.btn-secondary:active {
		transform: translateY(0);
	}

	.btn-accent {
		background: linear-gradient(135deg, var(--color-accent-primary), #667eea);
		color: white;
		border: none;
		font-weight: 600;
	}

	.btn-accent:hover {
		opacity: 0.9;
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
	}

	.btn-large {
		padding: 1rem 2rem;
		font-size: 1.0625rem;
	}

	/* Footer */
	.site-footer {
		background: var(--color-bg-surface);
		border-top: 2px solid var(--color-border-base);
		padding: 4rem var(--spacing-content-padding) 2rem;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr;
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.footer-section {
		display: flex;
		flex-direction: column;
	}

	.footer-about {
		max-width: 400px;
	}

	.footer-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 1rem;
	}

	.footer-description {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
	}

	.footer-heading {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
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
		gap: 0.75rem;
	}

	.footer-links a {
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: 0.9375rem;
		transition: color 0.15s ease;
	}

	.footer-links a:hover {
		color: var(--color-accent-primary);
	}

	.footer-bottom {
		max-width: 1200px;
		margin: 0 auto;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border-base);
		text-align: center;
	}

	.footer-copyright {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
		margin: 0;
	}

	.github-cta {
		margin-top: 0.5rem;
	}

	/* Smooth scroll */
	:global(html) {
		scroll-behavior: smooth;
	}

	/* Reduced motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		:global(*) {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}

		:global(html) {
			scroll-behavior: auto;
		}

		.hero-badge {
			animation: none;
		}

		.cta-pulse {
			animation: none;
		}

		.ladder-step::before {
			display: none;
		}
	}

	/* Responsive */
	@media (max-width: 768px) {
		/* Hide desktop nav, show mobile hamburger */
		.navbar-desktop {
			display: none;
		}

		.navbar-mobile {
			display: flex;
		}

		.navbar-content {
			padding: 0.75rem 1.5rem;
		}

		.hero-title {
			font-size: 2rem;
		}

		.hero-description {
			font-size: 1rem;
		}

		.hero-badge {
			font-size: 0.75rem;
			padding: 0.375rem 0.75rem;
		}

		.social-proof-band {
			gap: 0.75rem;
			padding: 0.75rem 1rem;
		}

		.social-proof-text {
			font-size: 0.75rem;
		}

		.hero-cta-group {
			flex-direction: column;
			width: 100%;
		}

		.hero-cta-group .btn {
			width: 100%;
		}

		.community-cta {
			padding: 1.5rem;
		}

		.community-cta-title {
			font-size: 1.5rem;
		}

		.contribution-ladder {
			flex-direction: column;
		}

		.ladder-arrow {
			transform: rotate(90deg);
		}

		.ladder-step {
			width: 100%;
			min-width: auto;
		}

		.quick-actions-minimal {
			flex-direction: column;
			gap: 1rem;
		}

		.action-card-minimal {
			width: 100%;
			justify-content: center;
		}

		.ai-badge {
			font-size: 0.625rem;
			padding: 0.375rem 0.75rem;
		}

		.quick-actions {
			grid-template-columns: 1fr;
		}

		.section-title-large {
			font-size: 1.75rem;
		}

		.section-subtitle {
			font-size: 1rem;
		}

		.how-grid-visual {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.how-card-visual {
			padding: 2rem 1.5rem;
		}

		.how-icon-large {
			font-size: 3.5rem;
		}

		.tool-cards-grid {
			grid-template-columns: 1fr;
		}

		.stats-bar {
			grid-template-columns: repeat(2, 1fr);
		}

		.roles-grid {
			grid-template-columns: 1fr;
		}

		.community-content {
			grid-template-columns: 1fr;
		}

		.community-stats {
			grid-template-columns: 1fr;
		}

		.footer-actions {
			flex-direction: column;
		}

		.footer-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
