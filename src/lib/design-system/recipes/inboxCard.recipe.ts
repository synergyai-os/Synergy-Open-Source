import { cva, type VariantProps } from 'class-variance-authority';

/**
 * InboxCard Recipe (CVA)
 *
 * Type-safe variant system for InboxCard component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: selected, unselected
 */
export const inboxCardRecipe = cva(
	// Base classes - styling variants only (layout handled in component)
	// Override Card's bg-elevated with bg-surface to match container background
	// Cards match container (bg-surface) and use borders for visual separation
	'bg-surface',
	{
		variants: {
			selected: {
				true: 'border-2 border-focus bg-selected',
				false: 'border border-default hover:bg-hover hover:border-focus'
			}
		},
		defaultVariants: {
			selected: false
		}
	}
);

export type InboxCardVariantProps = VariantProps<typeof inboxCardRecipe>;
