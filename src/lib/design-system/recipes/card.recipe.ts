import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Card Recipe (CVA)
 *
 * Type-safe variant system for Card component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: default, elevated, outlined
 * Padding: sm, md, lg
 */
export const cardRecipe = cva(
	// Base classes - applied to all cards
	'rounded-card bg-elevated',
	{
		variants: {
			variant: {
				default: 'border border-base',
				elevated: 'shadow-card hover:shadow-card-hover transition-shadow',
				outlined: 'border-2 border-elevated'
			},
			padding: {
				sm: 'card-compact',
				md: 'px-card-padding py-card-padding',
				lg: 'marketing-card-padding'
			}
		},
		defaultVariants: {
			variant: 'default',
			padding: 'md'
		}
	}
);

export type CardVariantProps = VariantProps<typeof cardRecipe>;
