import { cva, type VariantProps } from 'class-variance-authority';

export const textRecipe = cva(
	// Base classes - applied to all text
	'font-body',
	{
		variants: {
			variant: {
				body: 'text-primary',
				label: 'text-[0.625rem] text-secondary', // 10px - EXCEPTION: typography.fontSize.label
				caption: 'text-[0.625rem] text-tertiary' // 10px - EXCEPTION: typography.fontSize.label
			},
			size: {
				sm: 'text-sm', // 14px - matches typography.fontSize.sm (0.875rem)
				base: 'text-base', // 16px - matches typography.fontSize.base (1rem)
				lg: 'text-lg' // 18px - matches typography.fontSize.lg (1.125rem)
			},
			color: {
				default: '',
				secondary: 'text-secondary',
				tertiary: 'text-tertiary',
				error: 'text-error',
				warning: 'text-warning',
				success: 'text-success',
				info: 'text-info'
			}
		},
		defaultVariants: {
			variant: 'body',
			size: 'base',
			color: 'default'
		}
	}
);

export type TextVariantProps = VariantProps<typeof textRecipe>;
