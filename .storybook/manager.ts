import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

// Source: design-system.json color values
// Converted from oklch to hex for Storybook compatibility (polished library doesn't support oklch)
// NOTE: Using create() directly (not spreading themes.dark) to avoid polished color manipulation issues
const synergyOSTheme = create({
	base: 'dark', // Match SynergyOS default dark mode

	// Brand
	brandTitle: 'SynergyOS Design System',
	brandUrl: 'https://synergyos.ai',
	brandImage: '/logo-placeholder.svg', // Logo from static folder (served via staticDirs)
	brandTarget: '_self' as const,

	// Colors (converted from design-system.json oklch to hex)
	// Primary accent: blue-600 for selected states
	colorPrimary: '#2563eb', // oklch(55.4% 0.218 251.813) --color-accent-primary
	// Secondary accent: blue-700 for hover states
	colorSecondary: '#1d4ed8', // oklch(49.2% 0.218 251.813) --color-accent-hover

	// UI (dark mode values from design-system.json)
	appBg: '#111827', // oklch(20% 0.002 247.839) --color-bg-base (gray-900)
	appContentBg: '#374151', // oklch(31.4% 0.044 257.287) --color-bg-elevated (gray-750)
	appPreviewBg: '#374151', // Same as appContentBg for consistency
	appBorderColor: '#1f2937', // oklch(27.9% 0.041 260.031) --color-border-base (gray-800) - solid hex format
	appBorderRadius: 14, // --border-radius-card (14px)

	// Typography (from design-system.json)
	fontBase: '"Inter", system-ui, sans-serif', // --font-sans
	fontCode: '"JetBrains Mono", monospace', // --font-mono

	// Text colors (dark mode from design-system.json)
	textColor: '#ffffff', // oklch(98.5% 0.002 247.839) --color-text-primary (white)
	textInverseColor: '#111827', // oklch(20% 0.002 247.839) --color-bg-base (gray-900)
	textMutedColor: '#9ca3af', // Additional muted text color for Storybook UI

	// Bar colors (toolbar, sidebar)
	barTextColor: '#d1d5db', // oklch(70.4% 0.04 256.788) --color-text-secondary (gray-300)
	barSelectedColor: '#2563eb', // oklch(55.4% 0.218 251.813) --color-accent-primary
	barHoverColor: '#1d4ed8', // oklch(49.2% 0.218 251.813) --color-accent-hover
	barBg: '#1f2937', // oklch(27.9% 0.041 260.031) --color-bg-surface (gray-800)

	// Form colors
	inputBg: '#374151', // oklch(31.4% 0.044 257.287) --color-bg-elevated
	inputBorder: '#4b5563', // oklch(37.2% 0.044 257.287) --color-border-elevated (gray-700) - solid hex format
	inputTextColor: '#ffffff', // oklch(98.5% 0.002 247.839) --color-text-primary
	inputBorderRadius: 2 // --border-radius-input (2px)
});

addons.setConfig({
	theme: synergyOSTheme,
	panelPosition: 'bottom',
	enableShortcuts: true,
	showToolbar: true,
	sidebar: {
		showRoots: true // Show category roots (Docs, Atoms, Molecules, Organisms)
	}
});
