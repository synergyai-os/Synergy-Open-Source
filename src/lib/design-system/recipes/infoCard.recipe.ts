import { cva, type VariantProps } from 'class-variance-authority';

/**
 * InfoCard Recipe (CVA)
 *
 * Type-safe variant system for InfoCard component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: info, warning, success, error
 */
export const infoCardRecipe = cva(
	// Base classes - applied to all info cards
	'flex items-start gap-fieldGroup rounded-card border px-input py-input',
	{
		variants: {
			variant: {
				// Status backgrounds are light in both light/dark modes, so we need dark text always
				// Use CSS variable for neutral-900 (always dark) instead of text-primary (white in dark mode)
				// Border color maintains visual distinction for each variant
				info: 'bg-status-infoLight border-info [color:var(--color-neutral-900)]',
				warning: 'bg-status-warningLight border-warning [color:var(--color-neutral-900)]',
				success: 'bg-status-successLight border-success [color:var(--color-neutral-900)]',
				error: 'bg-status-errorLight border-error [color:var(--color-neutral-900)]'
			}
		},
		defaultVariants: {
			variant: 'info'
		}
	}
);

export type InfoCardVariantProps = VariantProps<typeof infoCardRecipe>;
