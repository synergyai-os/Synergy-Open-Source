import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Badge Recipe (CVA)
 *
 * Type-safe variant system for Badge component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: default, primary, success, warning, error
 * Sizes: sm, md, lg
 */
export const badgeRecipe = cva(
	// Base classes - applied to all badges
	'inline-flex items-center rounded-badge border font-body fontWeight-badge leading-none',
	{
		variants: {
			variant: {
				default: 'bg-tag text-tag border-base',
				primary: 'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
				success: 'bg-success text-success border-base',
				warning: 'bg-warning text-warning border-base',
				error: 'bg-error text-error border-error'
			},
			size: {
				sm: 'px-badge-sm py-badge-sm text-2xs',
				md: 'px-badge-md py-badge-md text-xs',
				lg: 'px-badge-lg py-badge-lg text-sm'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md'
		}
	}
);

export type BadgeVariantProps = VariantProps<typeof badgeRecipe>;
