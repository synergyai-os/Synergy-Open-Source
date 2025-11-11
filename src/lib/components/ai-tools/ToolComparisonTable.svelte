<script lang="ts">
	import { verifiedTools } from '$lib/services/metricsService';
</script>

<div class="tool-comparison-table">
	<table class="comparison-table">
		<thead>
			<tr>
				<th class="text-left">Tool</th>
				<th class="text-center">Reads GitHub</th>
				<th class="text-center">Suggests Code</th>
				<th class="text-center">Auto-Updates</th>
				<th class="text-center">Verified</th>
			</tr>
		</thead>
		<tbody>
			{#each verifiedTools as tool}
				<tr>
					<td class="tool-name">
						<span class="tool-logo">{tool.logo}</span>
						<span class="tool-text">{tool.name}</span>
					</td>
					<td class="text-center">
						{#if tool.readsGitHub}
							<span class="check">✓</span>
						{:else}
							<span class="cross">✗</span>
						{/if}
					</td>
					<td class="text-center">
						{#if tool.suggestsCode}
							<span class="check">✓</span>
						{:else}
							<span class="cross">✗</span>
						{/if}
					</td>
					<td class="text-center">
						{#if tool.autoUpdates}
							<span class="check">✓</span>
						{:else}
							<span class="cross">✗</span>
						{/if}
					</td>
					<td class="text-center">
						{#if tool.verified}
							<span class="verified-badge">✓ Verified</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.tool-comparison-table {
		width: 100%;
		overflow-x: auto;
	}

	.comparison-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
	}

	thead {
		background: var(--color-bg-surface);
		border-bottom: 1px solid var(--color-border-base);
	}

	th {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 1rem;
		font-size: 0.9375rem;
		color: var(--color-text-primary);
		border-top: 1px solid var(--color-border-base);
	}

	.tool-name {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.tool-logo {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.tool-text {
		font-weight: 500;
	}

	.text-center {
		text-align: center;
	}

	.text-left {
		text-align: left;
	}

	.check {
		color: var(--color-accent-primary);
		font-weight: 600;
		font-size: 1.125rem;
	}

	.cross {
		color: var(--color-text-tertiary);
		font-size: 1.125rem;
	}

	.verified-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: var(--color-accent-primary);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 0.25rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		th,
		td {
			padding: 0.75rem 0.5rem;
			font-size: 0.8125rem;
		}

		.tool-logo {
			font-size: 1.25rem;
		}
	}
</style>
