import { cva, type VariantProps } from 'class-variance-authority';

/**
 * PanelBreadcrumbs Recipe (CVA)
 *
 * Type-safe variant system for PanelBreadcrumbs molecule component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Design Notes:
 * - Vertical breadcrumb bars on left side of panel
 * - Fixed width (48px) per breadcrumb (spacing-12 token)
 * - Hover states for interactivity
 * - Text styling with icon support
 */
export const panelBreadcrumbBarRecipe = cva(
	// Base classes - breadcrumb bar button (absolute to position relative to panel)
	'absolute top-0 bottom-0 w-[48px] flex items-center justify-center border-r border-subtle bg-surface transition-colors cursor-pointer hover:bg-subtle',
	{
		variants: {
			variant: {
				default: ''
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export const panelBreadcrumbTextRecipe = cva(
	// Breadcrumb text container
	'flex items-center gap-button text-label text-secondary rotate-[-90deg] whitespace-nowrap',
	{
		variants: {
			variant: {
				default: ''
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export const panelBreadcrumbIconRecipe = cva(
	// Breadcrumb icon styling
	'size-icon-sm inline-block text-secondary',
	{
		variants: {
			variant: {
				default: ''
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export type PanelBreadcrumbBarVariantProps = VariantProps<typeof panelBreadcrumbBarRecipe>;
export type PanelBreadcrumbTextVariantProps = VariantProps<typeof panelBreadcrumbTextRecipe>;
export type PanelBreadcrumbIconVariantProps = VariantProps<typeof panelBreadcrumbIconRecipe>;
