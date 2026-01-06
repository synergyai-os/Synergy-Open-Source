import { cva, type VariantProps } from 'class-variance-authority';

/**
 * OrganizationItem Recipe (CVA)
 *
 * Type-safe variant system for OrganizationItem component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: active (boolean)
 * - active: true - Selected workspace (shows checkmark, selected state background)
 * - active: false - Unselected workspace (subtle hover state)
 *
 * Premium micro-interactions:
 * - Smooth 200ms transitions on hover
 * - Visible hover background for clear feedback
 * - Rounded corners for polished look
 */
export const organizationItemRecipe = cva(
	// Base classes - applied to all workspace items
	// Uses stack spacing: px-input (16px) horizontal, py-stack-item (8px) vertical
	// Rounded corners and clear hover state for premium feel
	'rounded-button px-input py-stack-item flex cursor-pointer items-center justify-between outline-none transition-all duration-200',
	{
		variants: {
			active: {
				// Active: Subtle brand-tinted background indicating selection
				true: 'bg-selected hover:bg-selected focus:bg-selected',
				// Inactive: Clean hover state using subtle background
				false: 'hover:bg-subtle focus:bg-subtle'
			}
		},
		defaultVariants: {
			active: false
		}
	}
);

export type OrganizationItemVariantProps = VariantProps<typeof organizationItemRecipe>;
