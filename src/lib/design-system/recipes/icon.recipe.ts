import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Icon Recipe (CVA)
 *
 * Type-safe variant system for Icon component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: size, color
 */
export const iconRecipe = cva(
	// Base classes - applied to all icons
	// Icons in flex containers should maintain their size (don't shrink)
	'inline-flex items-center justify-center flex-shrink-0',
	{
		variants: {
			size: {
				sm: 'size-icon-sm',
				md: 'size-icon-md',
				lg: 'size-icon-lg',
				xl: 'size-icon-xl',
				xxl: 'size-icon-xxl'
			},
			color: {
				default: 'text-primary',
				primary: 'text-brand',
				secondary: 'text-secondary',
				tertiary: 'text-tertiary',
				error: 'text-error',
				warning: 'text-warning',
				success: 'text-success',
				info: 'text-info'
			}
		},
		defaultVariants: {
			size: 'md',
			color: 'default'
		}
	}
);

export type IconVariantProps = VariantProps<typeof iconRecipe>;
