<script lang="ts">
	import { Chart, Svg, Axis, Spline } from 'layerchart';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { getGitHubStarsForecast } from '$lib/services/metricsService';

	const data = getGitHubStarsForecast();
</script>

<div class="metrics-forecast-container">
	<Chart
		{data}
		x="day"
		xScale={scaleBand().padding(0.4)}
		y="stars"
		yScale={scaleLinear()}
		yDomain={[0, 120]}
		yNice
		padding={{ left: 16, bottom: 24 }}
	>
		<Svg>
			<Axis placement="left" grid rule />
			<Axis
				placement="bottom"
				format={(d) => {
					const point = data.find((p) => p.day === d);
					return point?.label || `Day ${d}`;
				}}
				rule
			/>
			<Spline class="stroke-accent-primary" strokeWidth={3} />
		</Svg>
	</Chart>

	<div class="chart-legend">
		<span class="legend-label">📈 Predicted GitHub Stars Growth</span>
	</div>
</div>

<style>
	.metrics-forecast-container {
		width: 100%;
		height: 300px;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.metrics-forecast-container :global(.stroke-accent-primary) {
		stroke: var(--color-accent-primary);
	}

	.chart-legend {
		margin-top: 1rem;
		text-align: center;
	}

	.legend-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}
</style>
