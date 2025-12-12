import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Card Recipe (CVA)
 *
 * Type-safe variant system for Card component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: default, elevated, premium, outlined
 * Padding: sm, md, lg
 *
 * Premium variant: Soft, diffused shadow with subtle border (LoginBox style)
 * - shadow-md: Multi-layered soft shadow for floating effect
 * - border-subtle: Soft border for definition without harshness
 * - bg-surface: Surface background for clear separation
 * - rounded-modal: Generous radius (16px) for modern feel
 */
export const cardRecipe = cva(
	// Base classes - applied to all cards
	'rounded-card bg-elevated',
	{
		variants: {
			variant: {
				default: 'border border-base',
				elevated: 'shadow-card hover:shadow-card-hover transition-shadow',
				premium: 'shadow-md border border-subtle bg-surface rounded-modal',
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
