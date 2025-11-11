/**
 * Metrics Service
 * Centralized source of truth for current and predicted metrics
 */

export const currentMetrics = {
	githubStars: 0,
	contributors: 1,
	docsPages: 50,
	patterns: 48
};

export const predictedMetrics = {
	day30: {
		stars: 30,
		contributors: 3,
		reasoning: 'Early adopters from AI tool communities discover SynergyOS'
	},
	day60: {
		stars: 65,
		contributors: 5,
		reasoning: 'Word spreads, more devs contribute patterns as they use the system'
	},
	day90: {
		stars: 100,
		contributors: 10,
		reasoning: 'Network effects kick in - AI tools make contributing easier'
	}
};

export interface ForecastDataPoint {
	day: number;
	stars: number;
	label?: string;
}

export function getGitHubStarsForecast(): ForecastDataPoint[] {
	return [
		{ day: 0, stars: currentMetrics.githubStars, label: 'Today' },
		{ day: 30, stars: predictedMetrics.day30.stars, label: 'Month 1' },
		{ day: 60, stars: predictedMetrics.day60.stars, label: 'Month 2' },
		{ day: 90, stars: predictedMetrics.day90.stars, label: 'Month 3' }
	];
}

export function getContributorsForecast(): ForecastDataPoint[] {
	return [
		{ day: 0, stars: currentMetrics.contributors, label: 'Today' },
		{ day: 30, stars: predictedMetrics.day30.contributors, label: 'Month 1' },
		{ day: 60, stars: predictedMetrics.day60.contributors, label: 'Month 2' },
		{ day: 90, stars: predictedMetrics.day90.contributors, label: 'Month 3' }
	];
}

/**
 * Tool compatibility matrix
 */
export interface AITool {
	name: string;
	logo: string; // emoji or path to SVG
	description: string;
	readsGitHub: boolean;
	suggestsCode: boolean;
	autoUpdates: boolean;
	verified: boolean;
	url: string;
}

export const verifiedTools: AITool[] = [
	{
		name: 'Cursor AI',
		logo: '🎯',
		description: 'AI IDE that reads our patterns and suggests code instantly',
		readsGitHub: true,
		suggestsCode: true,
		autoUpdates: true,
		verified: true,
		url: 'https://cursor.sh'
	},
	{
		name: 'Claude AI',
		logo: '🤖',
		description: 'Upload our docs, ask questions, get grounded answers',
		readsGitHub: true,
		suggestsCode: true,
		autoUpdates: true,
		verified: true,
		url: 'https://claude.ai'
	}
];
