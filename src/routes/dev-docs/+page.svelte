<script lang="ts">
	import { goto } from '$app/navigation';
	import MetricsForecast from '$lib/components/ai-tools/MetricsForecast.svelte';
	import ToolComparisonTable from '$lib/components/ai-tools/ToolComparisonTable.svelte';
	import { verifiedTools } from '$lib/services/metricsService';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	
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
			description: 'What we\'re building & why',
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
<nav class="docs-navbar">
	<div class="navbar-content">
		<div class="navbar-left">
			<a href="/dev-docs" class="navbar-logo">
				<span class="logo-icon">⚡</span>
				<span class="logo-text">SynergyOS Docs</span>
			</a>
		</div>
		<div class="navbar-right">
			<a href="/dev-docs/2-areas/patterns/INDEX" class="navbar-link">Patterns</a>
			<a href="/dev-docs/2-areas/metrics" class="navbar-link">Metrics</a>
			<a href="/marketing-docs/strategy/product-vision-2.0" class="navbar-link">Vision</a>
			<a href="/CONTRIBUTING" class="navbar-link">Contribute</a>
			<ThemeToggle />
			<a href="https://github.com/synergyai-os/Synergy-Open-Source" target="_blank" rel="noopener noreferrer" class="navbar-link navbar-link-icon">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
				</svg>
			</a>
		</div>
	</div>
</nav>

<div class="docs-home">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1 class="hero-title">
				<span class="gradient-text">SynergyOS</span> Documentation
			</h1>
			<p class="hero-description">
				The open-source Product OS for teams who want to accelerate the smart use of AI.
				Built in public, documented transparently, powered by community.
			</p>
			
			<!-- Quick Actions -->
			<div class="quick-actions">
				{#each quickActions as action}
					<a href={action.href} class="action-card action-card-{action.color}">
						<div class="action-icon">{action.icon}</div>
						<div class="action-content">
							<h3 class="action-title">{action.title}</h3>
							<p class="action-description">{action.description}</p>
						</div>
						{#if action.tag}
							<span class="action-tag">{action.tag}</span>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	</section>
	
	<!-- How It Works Section -->
	<section class="how-it-works">
		<div class="how-it-works-content">
			<h2 class="section-title">Documentation That Never Goes Stale</h2>
			<p class="section-description">
				We didn't write this documentation. AI did. It scans our codebase and generates fresh docs automatically.
			</p>
			
			<div class="how-grid">
				<div class="how-card">
					<div class="how-icon">⚡</div>
					<h3 class="how-title">Real-Time Scanning</h3>
					<p class="how-description">AI scans our codebase continuously, detecting every change</p>
				</div>
				<div class="how-card">
					<div class="how-icon">📝</div>
					<h3 class="how-title">Auto-Generated</h3>
					<p class="how-description">Docs are written by AI based on actual code, not human memory</p>
				</div>
				<div class="how-card">
					<div class="how-icon">🔄</div>
					<h3 class="how-title">Always Fresh</h3>
					<p class="how-description">Every code change triggers a doc update. Zero manual maintenance.</p>
				</div>
			</div>
			
			<a href="https://github.com/synergyai-os/Synergy-Open-Source" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-large">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
				</svg>
				⭐ Star on GitHub
			</a>
		</div>
	</section>
	
	<!-- AI Tools Section -->
	<section class="ai-tools-section">
		<div class="ai-tools-content">
			<h2 class="section-title">AI Reads Our Docs Better Than Humans</h2>
			<p class="section-description">
				Here's what happens when AI-first coding tools meet always-fresh documentation. 
				No setup. No config. Just point them at our GitHub repo.
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
					When AI can read your docs, adoption accelerates. Here's our 90-day forecast 
					after shipping this feature.
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
	
	<!-- Role-Based Navigation -->
	<section class="roles-section">
		<h2 class="section-title">Pick Your Role</h2>
		<p class="section-description">
			Find what you need based on what you do
		</p>
		
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
										<path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>
	
	<!-- Community Section -->
	<section class="community-section">
		<div class="community-content">
			<div class="community-text">
				<h2 class="section-title">Join the Community</h2>
				<p class="section-description">
					Built by developers, for developers. Open source, transparent metrics, and a marketplace where builders earn 80%.
				</p>
				<div class="community-actions">
					<a href="https://github.com/synergyai-os/Synergy-Open-Source" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
						</svg>
						Star on GitHub
					</a>
					<a href="/CONTRIBUTING" class="btn btn-secondary">
						📖 Contributing Guide
					</a>
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
					The open-source Product OS for teams who want to accelerate the smart use of AI. 
					Built in public with transparent metrics and AI-generated documentation.
				</p>
				<a href="https://github.com/synergyai-os/Synergy-Open-Source" target="_blank" rel="noopener noreferrer" class="btn btn-primary github-cta">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
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
					<li><a href="https://github.com/synergyai-os/Synergy-Open-Source/issues" target="_blank" rel="noopener noreferrer">Report an Issue</a></li>
				</ul>
			</div>
			
			<div class="footer-section">
				<h4 class="footer-heading">Community</h4>
				<ul class="footer-links">
					<li><a href="https://github.com/synergyai-os/Synergy-Open-Source" target="_blank" rel="noopener noreferrer">GitHub</a></li>
					<li><a href="https://github.com/synergyai-os/Synergy-Open-Source/discussions" target="_blank" rel="noopener noreferrer">Discussions</a></li>
					<li><a href="/dev-docs/2-areas/metrics">Public Metrics</a></li>
				</ul>
			</div>
		</div>
		
		<div class="footer-bottom">
			<p class="footer-copyright">
				© 2025 SynergyOS • Built in Public • Powered by AI
			</p>
		</div>
	</footer>
</div>

<style>
	/* Navbar */
	.docs-navbar {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--color-bg-surface);
		border-bottom: 1px solid var(--color-border-base);
	}
	
	.navbar-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem var(--spacing-content-padding);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.navbar-left {
		display: flex;
		align-items: center;
		gap: 2rem;
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
	
	.navbar-right {
		display: flex;
		align-items: center;
		gap: 2rem;
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
	
	/* Quick Actions */
	.quick-actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
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
	
	/* How It Works Section */
	.how-it-works {
		padding: 4rem var(--spacing-content-padding);
		border-bottom: 1px solid var(--color-border-base);
	}
	
	.how-it-works-content {
		max-width: 900px;
		margin: 0 auto;
		text-align: center;
	}
	
	.how-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin: 3rem 0;
	}
	
	.how-card {
		padding: 2rem 1.5rem;
		background-color: transparent !important;
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		transition: all 0.15s ease;
	}
	
	.how-card:hover {
		border-color: var(--color-text-secondary);
		background-color: var(--color-bg-hover) !important;
	}
	
	.how-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}
	
	.how-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.75rem;
	}
	
	.how-description {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin: 0;
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
	}
	
	.btn-secondary {
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border-color: var(--color-border-base);
	}
	
	.btn-secondary:hover {
		border-color: var(--color-accent-primary);
		background: var(--color-bg-hover-solid);
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
	
	/* Responsive */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}
		
		.hero-description {
			font-size: 1rem;
		}
		
		.ai-badge {
			font-size: 0.625rem;
			padding: 0.375rem 0.75rem;
		}
		
		.quick-actions {
			grid-template-columns: 1fr;
		}
		
		.how-grid {
			grid-template-columns: 1fr;
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

