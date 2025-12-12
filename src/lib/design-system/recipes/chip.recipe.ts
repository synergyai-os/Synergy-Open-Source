import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Chip Recipe (CVA)
 *
 * Type-safe variant system for Chip component.
 * Material UI-style removable filter pills.
 *
 * Variants: default, primary
 * - default: Subtle tag background with border
 * - primary: Brand-colored background
 *
 * DESIGN SYSTEM EXCEPTION: Chip spacing and border radius (SYOS-585)
 *
 * Chip uses non-standard values that don't fit the base scale:
 * - spacing.chip.y = 0.125rem (2px) - optimal for compact design
 * - borderRadius.chip = 9999px (full) - pill shape
 *
 * These values are hardcoded because they don't reference base tokens.
 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
 */
export const chipRecipe = cva(
	// Base classes - applied to all chips
	// Compact Linear-style design with pill shape
	'inline-flex items-center gap-chip rounded-full text-chip transition-colors-token px-chip py-[0.125rem]',
	{
		variants: {
			variant: {
				// Default: Subtle tag background with border - less prominent
				default: 'bg-tag/50 text-tag border border-base/50',
				// Primary: Brand-colored background for emphasis
				primary: 'bg-accent-primary/80 text-primary'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

/**
 * Chip Close Button Recipe
 *
 * Styles for the remove button inside chips.
 * Compact but still accessible.
 *
 * DESIGN SYSTEM EXCEPTION: Chip close button padding (SYOS-585)
 * - spacing.chip.close.padding = 0.125rem (2px) - compact close button
 */
export const chipCloseButtonRecipe = cva(
	// Base classes - remove button
	'p-[0.125rem] rounded-full transition-colors-token hover:bg-hover-solid focus:outline-none focus:ring-1 focus:ring-accent-primary flex items-center justify-center -mr-chip-close',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type ChipVariantProps = VariantProps<typeof chipRecipe>;
export type ChipCloseButtonVariantProps = VariantProps<typeof chipCloseButtonRecipe>;
