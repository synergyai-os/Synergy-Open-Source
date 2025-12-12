import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Switch Recipe
 *
 * Styled components for Bits UI Switch with design tokens.
 */

export const switchRootRecipe = cva(
	// Base classes - Switch root container
	'relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2',
	{
		variants: {
			checked: {
				true: 'bg-accent-primary',
				false: '' // Background set via inline style: var(--color-component-toggle-off)
			},
			disabled: {
				true: 'opacity-50',
				false: ''
			}
		},
		defaultVariants: {
			checked: false,
			disabled: false
		}
	}
);

export const switchThumbRecipe = cva(
	// Base classes - Switch thumb (draggable handle)
	'pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type SwitchRootVariantProps = VariantProps<typeof switchRootRecipe>;
export type SwitchThumbVariantProps = VariantProps<typeof switchThumbRecipe>;
