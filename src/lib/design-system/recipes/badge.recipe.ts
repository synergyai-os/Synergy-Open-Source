import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Badge Recipe (CVA)
 *
 * Type-safe variant system for Badge component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: default, primary, success, warning, error
 * Sizes: sm, md, lg
 *
 * DESIGN SYSTEM EXCEPTION: Badge spacing (SYOS-585)
 *
 * Badge uses non-standard spacing values that don't fit the base scale:
 * - spacing.badge.x = 0.375rem (6px) - optimal for compact design
 * - spacing.badge.y = 0.125rem (2px) - optimal for compact design
 *
 * These values are hardcoded in recipe because they don't reference base tokens.
 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
 */
export const badgeRecipe = cva(
	// Base classes - applied to all badges
	'inline-flex items-center rounded-badge border font-body fontWeight-badge',
	{
		variants: {
			variant: {
				default: 'bg-tag text-tag border-base',
				primary: 'bg-accent-primary text-primary border-accent-primary',
				success: 'bg-success text-success border-base',
				warning: 'bg-warning text-warning border-base',
				error: 'bg-error text-error border-error'
			},
			size: {
				sm: 'px-[0.375rem] py-[0.125rem] fontSize-badge',
				md: 'px-[0.375rem] py-[0.125rem] fontSize-badge',
				lg: 'px-[0.375rem] py-[0.125rem] fontSize-badge'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md'
		}
	}
);

export type BadgeVariantProps = VariantProps<typeof badgeRecipe>;
