import { cva } from 'class-variance-authority';

/**
 * Loading Component Recipe
 *
 * CVA recipe for Loading component size variants.
 * Maps size prop to icon utility classes (design tokens).
 *
 * Variants:
 * - sm: 16px (icon-sm)
 * - md: 20px (icon-md)
 * - lg: 24px (icon-lg)
 */
export const loadingRecipe = cva(['animate-spin', 'text-accent-primary'], {
	variants: {
		size: {
			sm: ['icon-sm'],
			md: ['icon-md'],
			lg: ['icon-lg']
		}
	},
	defaultVariants: {
		size: 'md'
	}
});

