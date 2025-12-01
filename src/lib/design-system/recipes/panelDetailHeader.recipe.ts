import { cva, type VariantProps } from 'class-variance-authority';

/**
 * PanelDetailHeader Recipe (CVA)
 *
 * Type-safe variant system for Panel Detail Header components.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Panel detail headers are used in detail panels (CircleDetailHeader, RoleDetailHeader)
 * to display panel titles with action buttons and dividers.
 *
 * Styling:
 * - Border: border-b border-base for visual separation
 * - Background: bg-surface for consistent surface appearance
 * - Padding: px-panelDetailHeader (16px horizontal), py-panelDetailHeader (36px vertical)
 * - Height: Fixed at 2.5rem (40px) via inline style (layout, not styling)
 */
export const panelDetailHeaderRecipe = cva(
	// Base classes - applied to all panel detail headers
	'border-base flex flex-shrink-0 items-center justify-between border-b bg-surface px-panelDetailHeader py-panelDetailHeader',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type PanelDetailHeaderVariantProps = VariantProps<typeof panelDetailHeaderRecipe>;
