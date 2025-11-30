import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Tabs Recipe
 *
 * Styled components for Bits UI Tabs with design tokens.
 */

export const tabsRootRecipe = cva(
	// Base classes - Tabs root container
	'',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const tabsListRecipe = cva(
	// Base classes - Tabs list container
	'inline-flex items-center justify-center',
	{
		variants: {},
		defaultVariants: {}
	}
);

export const tabsTriggerRecipe = cva(
	// Base classes - Tab trigger button
	'inline-flex items-center justify-center px-button-sm-x py-button-sm-y text-button text-secondary transition-colors rounded-button hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			active: {
				true: 'text-primary bg-surface border-b-2 border-accent-primary',
				false: ''
			}
		},
		defaultVariants: {
			active: false
		}
	}
);

export const tabsContentRecipe = cva(
	// Base classes - Tab content panel
	'mt-section focus:outline-none',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type TabsRootVariantProps = VariantProps<typeof tabsRootRecipe>;
export type TabsListVariantProps = VariantProps<typeof tabsListRecipe>;
export type TabsTriggerVariantProps = VariantProps<typeof tabsTriggerRecipe>;
export type TabsContentVariantProps = VariantProps<typeof tabsContentRecipe>;
