import { cva, type VariantProps } from 'class-variance-authority';

/**
 * NavItem Recipe (CVA)
 *
 * Type-safe variant system for NavItem component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: default, active
 * Collapsed: true, false
 *
 * DESIGN SYSTEM EXCEPTION: Navigation item spacing (SYOS-585)
 *
 * Navigation items use non-standard vertical padding (6px) that doesn't fit the base scale:
 * - spacing.nav.item.y = 0.375rem (6px) - optimal for compact navigation design
 *
 * This value is hardcoded as py-[0.375rem] because it doesn't reference base tokens.
 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
 *
 * WORKAROUND: Sidebar color utilities missing - see missing-styles.md
 * Currently using Tailwind classes that match design tokens:
 * - text-sidebar-secondary → text-secondary (semantic token)
 * - text-sidebar-primary → text-primary (semantic token)
 * - bg-sidebar-hover → bg-hover (semantic token)
 * - bg-sidebar-active → bg-active (semantic token)
 */
export const navItemRecipe = cva(
	// Base classes - applied to all menu items
	'group relative flex items-center gap-button rounded-button transition-all duration-150 text-sm',
	{
		variants: {
			state: {
				default: 'text-secondary hover:bg-hover hover:text-primary',
				active: 'bg-active text-primary'
			},
			collapsed: {
				false: 'px-2 py-[0.375rem]',
				true: 'justify-center px-2 py-[0.375rem]'
			}
		},
		defaultVariants: {
			state: 'default',
			collapsed: false
		}
	}
);

export type NavItemVariantProps = VariantProps<typeof navItemRecipe>;

