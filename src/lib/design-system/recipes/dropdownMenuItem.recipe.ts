import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Dropdown Menu Item Recipe (CVA)
 *
 * Type-safe variant system for dropdown menu items.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Used across: WorkspaceSwitcher, AccountMenu, and other dropdown menus.
 *
 * Premium micro-interactions:
 * - Smooth 200ms transition
 * - Rounded corners with inset spacing (mx-1)
 * - Subtle hover/focus states
 */
export const dropdownMenuItemRecipe = cva(
	// Base classes - consistent menu item styling
	'rounded-button px-input py-stack-item hover:bg-subtle focus:bg-subtle mx-1 cursor-pointer transition-all duration-200 outline-none',
	{
		variants: {
			variant: {
				default: '',
				destructive: 'text-error hover:bg-status-error-bg focus:bg-status-error-bg'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export type DropdownMenuItemVariantProps = VariantProps<typeof dropdownMenuItemRecipe>;

