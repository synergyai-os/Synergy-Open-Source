import { cva, type VariantProps } from 'class-variance-authority';

/**
 * LoginBox Recipe (CVA)
 *
 * Type-safe variant system for LoginBox organism component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Design Notes:
 * - Generous radius (rounded-modal → xl → 16px) for modern feel
 * - Soft, diffused shadow (shadow-md) for floating card effect
 * - Elevated background for clear separation from page
 * - Subtle border for definition without harshness
 * - Entrance animation handled via Svelte `in:` transition in component
 *
 * Variants: default (only variant for now, keeping it simple)
 */
export const loginBoxRecipe = cva(
	// Base classes - applied to all login boxes
	// shadow-md provides a soft, diffused floating effect (Linear-inspired)
	'max-w-md rounded-modal border border-subtle bg-surface shadow-md card-padding',
	{
		variants: {
			variant: {
				default: ''
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export type LoginBoxVariantProps = VariantProps<typeof loginBoxRecipe>;
