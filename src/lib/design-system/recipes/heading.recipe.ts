import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Heading Recipe (CVA)
 *
 * Type-safe variant system for Heading component.
 * Uses design tokens for all styling via utility classes.
 *
 * Typography utilities:
 * - text-{size}: font-size from design tokens
 * - font-{weight}: font-weight from design tokens
 * - leading-{height}: line-height from design tokens
 * - tracking-{spacing}: letter-spacing from design tokens
 */
export const headingRecipe = cva('font-heading', {
	variants: {
		level: {
			1: 'text-4xl font-bold leading-tight tracking-tight',
			2: 'text-3xl font-semibold leading-tight',
			3: 'text-2xl font-semibold leading-snug',
			4: 'text-xl font-medium leading-snug',
			5: 'text-sm font-semibold leading-normal',
			6: 'text-sm font-medium leading-normal'
		},
		color: {
			primary: 'text-primary',
			secondary: 'text-secondary',
			tertiary: 'text-tertiary'
		}
	},
	defaultVariants: {
		level: 1,
		color: 'primary'
	}
});

export type HeadingVariantProps = VariantProps<typeof headingRecipe>;
