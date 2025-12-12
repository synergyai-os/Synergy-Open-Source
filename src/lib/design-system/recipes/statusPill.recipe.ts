import { cva, type VariantProps } from 'class-variance-authority';

/**
 * StatusPill Recipe (CVA)
 *
 * Type-safe variant system for StatusPill component.
 * Linear-style status pills with icon and label.
 *
 * Variants: backlog, todo, in_progress, done, cancelled
 * - backlog/todo/cancelled: Tertiary text (low emphasis)
 * - in_progress: Accent primary text (active)
 * - done: Success text (completed)
 *
 * States: default, readonly (disabled)
 */
export const statusPillRecipe = cva(
	// Base classes - applied to all status pills
	'inline-flex items-center gap-fieldGroup rounded-button bg-transparent px-2 py-1 font-normal text-button transition-colors hover:bg-hover-solid',
	{
		variants: {
			variant: {
				backlog: 'text-tertiary',
				todo: 'text-tertiary',
				in_progress: 'text-accent-primary',
				done: 'text-success',
				cancelled: 'text-tertiary'
			}
		},
		defaultVariants: {
			variant: 'backlog'
		}
	}
);

/**
 * StatusPill Icon Recipe
 *
 * Styles for the icon inside status pills.
 */
export const statusPillIconRecipe = cva(
	// Base classes - icon styling
	'text-body leading-none',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type StatusPillVariantProps = VariantProps<typeof statusPillRecipe>;
export type StatusPillIconVariantProps = VariantProps<typeof statusPillIconRecipe>;
