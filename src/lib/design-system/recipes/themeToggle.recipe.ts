import { cva, type VariantProps } from 'class-variance-authority';

/**
 * ThemeToggle Recipe (CVA)
 *
 * Type-safe variant system for ThemeToggle component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: iconOnly, withLabel
 * - iconOnly: Icon button only (for navbar, compact spaces)
 * - withLabel: Icon + text label (for settings, detailed contexts)
 *
 * Premium micro-interactions:
 * - Smooth 200ms transitions on hover
 * - Visible hover background for clear feedback
 * - Rounded corners for polished look
 */
export const themeToggleRecipe = cva(
	// Base classes - applied to all theme toggles
	'inline-flex items-center justify-center rounded-button transition-colors duration-200',
	{
		variants: {
			variant: {
				iconOnly: 'size-icon-xl text-secondary hover:bg-hover hover:text-primary',
				withLabel: 'gap-button text-secondary hover:bg-hover hover:text-primary px-button py-button'
			}
		},
		defaultVariants: {
			variant: 'iconOnly'
		}
	}
);

export type ThemeToggleVariantProps = VariantProps<typeof themeToggleRecipe>;
