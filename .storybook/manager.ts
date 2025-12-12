import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

// Source: design-system.json color values
// Converted from oklch to hex for Storybook compatibility (polished library doesn't support oklch)
// NOTE: Using create() directly (not spreading themes.dark) to avoid polished color manipulation issues

// Brand colors (same for both themes)
const brandConfig = {
	brandTitle: 'SynergyOS Design System',
	brandUrl: 'https://synergyos.ai',
	brandImage: '/logo-placeholder.svg', // Logo from static folder (served via staticDirs)
	brandTarget: '_self' as const,
	colorPrimary: '#2563eb', // oklch(55.4% 0.218 251.813) --color-accent-primary
	colorSecondary: '#1d4ed8' // oklch(49.2% 0.218 251.813) --color-accent-hover
};

// Typography (same for both themes)
const typographyConfig = {
	fontBase: '"Inter", system-ui, sans-serif', // --font-sans
	fontCode: '"JetBrains Mono", monospace', // --font-mono
	appBorderRadius: 14, // --border-radius-card (14px)
	inputBorderRadius: 2 // --border-radius-input (2px)
};

// Light theme - using light mode design tokens
const lightTheme = create({
	base: 'light',
	...brandConfig,
	...typographyConfig,

	// UI (light mode values from design-system.json)
	appBg: '#ffffff', // oklch(100% 0 0) --color-bg-base (neutral-0)
	appContentBg: '#f9fafb', // oklch(98% 0.002 264) --color-bg-subtle (neutral-50)
	appPreviewBg: '#ffffff', // Same as appBg for consistency
	appBorderColor: '#e5e7eb', // oklch(92% 0.006 264) --color-border-base (neutral-200)

	// Text colors (light mode)
	textColor: '#111827', // oklch(20% 0.02 264) --color-text-primary (neutral-900)
	textInverseColor: '#ffffff', // oklch(100% 0 0) --color-bg-base (neutral-0)
	textMutedColor: '#6b7280', // oklch(45% 0.025 264) --color-text-secondary (neutral-600)

	// Bar colors (toolbar, sidebar)
	barTextColor: '#374151', // oklch(31.4% 0.044 257.287) --color-text-secondary (neutral-700)
	barSelectedColor: '#2563eb', // oklch(55.4% 0.218 251.813) --color-accent-primary
	barHoverColor: '#1d4ed8', // oklch(49.2% 0.218 251.813) --color-accent-hover
	barBg: '#ffffff', // oklch(100% 0 0) --color-bg-surface (neutral-0)

	// Form colors
	inputBg: '#ffffff', // oklch(100% 0 0) --color-bg-elevated
	inputBorder: '#d1d5db', // oklch(85% 0.01 264) --color-border-elevated (neutral-300)
	inputTextColor: '#111827' // oklch(20% 0.02 264) --color-text-primary
});

// Dark theme - lightened backgrounds for better contrast
const darkTheme = create({
	base: 'dark',
	...brandConfig,
	...typographyConfig,

	// UI (dark mode values - lightened from original)
	// Changed from neutral-950 (#111827) to neutral-800 for better contrast
	appBg: '#1f2937', // oklch(27.9% 0.041 260.031) --color-bg-base (neutral-800, lighter than before)
	// Changed from gray-750 (#374151) to neutral-800 for better contrast
	appContentBg: '#374151', // oklch(31.4% 0.044 257.287) --color-bg-elevated (neutral-800)
	appPreviewBg: '#374151', // Same as appContentBg for consistency
	appBorderColor: '#4b5563', // oklch(37.2% 0.044 257.287) --color-border-base (neutral-700, lighter)

	// Text colors (dark mode)
	textColor: '#ffffff', // oklch(98.5% 0.002 247.839) --color-text-primary (white)
	textInverseColor: '#1f2937', // oklch(27.9% 0.041 260.031) --color-bg-base (neutral-800)
	textMutedColor: '#9ca3af', // oklch(70% 0.015 264) --color-text-muted (neutral-400)

	// Bar colors (toolbar, sidebar)
	barTextColor: '#d1d5db', // oklch(70.4% 0.04 256.788) --color-text-secondary (neutral-300)
	barSelectedColor: '#2563eb', // oklch(55.4% 0.218 251.813) --color-accent-primary
	barHoverColor: '#1d4ed8', // oklch(49.2% 0.218 251.813) --color-accent-hover
	barBg: '#374151', // oklch(31.4% 0.044 257.287) --color-bg-surface (neutral-800, lighter)

	// Form colors
	inputBg: '#4b5563', // oklch(37.2% 0.044 257.287) --color-bg-elevated (neutral-700, lighter)
	inputBorder: '#6b7280', // oklch(45% 0.025 264) --color-border-elevated (neutral-600, lighter)
	inputTextColor: '#ffffff' // oklch(98.5% 0.002 247.839) --color-text-primary
});

// Set initial theme
addons.setConfig({
	theme: lightTheme, // Default to light theme (matches preview.ts initialGlobals)
	panelPosition: 'bottom',
	enableShortcuts: true,
	showToolbar: true,
	sidebar: {
		showRoots: true // Show category roots (Docs, Atoms, Molecules, Organisms)
	}
});

// Listen for theme changes from addon-themes and update manager UI theme
// This syncs the Storybook UI (sidebar/toolbar) with the story content theme
addons.register('theme-switcher', () => {
	const channel = addons.getChannel();

	// Listen for globals updates (theme changes)
	channel.on('updateGlobals', ({ globals }: { globals: { theme?: string } }) => {
		if (globals.theme === 'light' || globals.theme === 'dark') {
			addons.setConfig({
				theme: globals.theme === 'light' ? lightTheme : darkTheme
			});
		}
	});
});

// Export themes for use with addon-themes
export { lightTheme, darkTheme };
