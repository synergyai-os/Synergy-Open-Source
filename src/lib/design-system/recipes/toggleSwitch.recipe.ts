import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Toggle Switch Recipe (CVA)
 *
 * Type-safe variant system for ToggleSwitch component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: checked, disabled
 * - checked: Controls background color (on/off state)
 * - disabled: Controls opacity and cursor
 *
 * Note: Toggle switch dimensions and thumb transforms use inline styles
 * since these values are specific to this component and lack semantic tokens.
 * Background colors use inline styles with CSS variables since
 * bg-component-toggle-off/on utilities are not available.
 */
export const toggleSwitchRecipe = cva(
	// Base classes - applied to all toggle switches
	'relative inline-flex items-center rounded-avatar transition-colors cursor-pointer',
	{
		variants: {
			checked: {
				true: '',
				false: ''
			},
			disabled: {
				true: 'cursor-not-allowed',
				false: 'cursor-pointer'
			}
		},
		defaultVariants: {
			checked: false,
			disabled: false
		}
	}
);

/**
 * Toggle Switch Thumb Recipe
 * Styles for the inner thumb element that slides
 */
export const toggleSwitchThumbRecipe = cva(
	// Base classes - applied to all thumbs
	'inline-block rounded-avatar bg-elevated transition-transform',
	{
		variants: {
			checked: {
				true: '',
				false: ''
			}
		},
		defaultVariants: {
			checked: false
		}
	}
);

export type ToggleSwitchVariantProps = VariantProps<typeof toggleSwitchRecipe>;
export type ToggleSwitchThumbVariantProps = VariantProps<typeof toggleSwitchThumbRecipe>;
