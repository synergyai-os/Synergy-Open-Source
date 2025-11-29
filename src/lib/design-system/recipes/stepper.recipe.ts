import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Stepper Recipe (CVA)
 *
 * Type-safe variant system for Stepper component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: default, compact
 * Step states: current, completed, pending, error
 * Step sizes: md, lg
 *
 * Design tokens used:
 * - spacing.header.gap → gap-header (12px)
 * - color.interactive.primary → bg-interactive-primary, border-interactive-primary
 * - color.text.inverse → text-inverse
 * - color.text.secondary → text-secondary
 * - color.border.default → border-default
 * - color.status.error → bg-status-error, border-status-error
 * - size.icon.md → size-icon-md (20px)
 * - size.icon.lg → size-icon-lg (24px)
 */
export const stepperRecipe = cva(
	// Base classes - applied to stepper container
	// No gap between cells - connectors handle spacing visually
	'flex items-start',
	{
		variants: {
			variant: {
				default: '',
				compact: ''
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

/**
 * Stepper Step Indicator Recipe
 *
 * Styles for individual step indicators (circles with numbers or checkmarks).
 */
export const stepperStepRecipe = cva(
	// Base classes - step indicator circle
	'flex items-center justify-center rounded-full border-2 transition-colors',
	{
		variants: {
			state: {
				current: 'bg-interactive-primary border-interactive-primary text-inverse',
				completed: 'bg-interactive-primary border-interactive-primary text-inverse',
				pending: 'bg-surface border-default text-secondary',
				error: 'bg-status-error border-status-error text-inverse'
			},
			size: {
				md: 'size-icon-md',
				lg: 'size-icon-lg',
				xl: 'size-icon-xl'
			}
		},
		defaultVariants: {
			state: 'pending',
			size: 'md'
		}
	}
);

/**
 * Stepper Connector Line Recipe
 *
 * Styles for the line connecting steps.
 * Each cell has its own connector segment.
 * - First cell: connector starts at circle center (50%), extends right
 * - Middle cells: connector spans full width
 * - Last cell: connector spans from left to circle center (50%)
 */
export const stepperConnectorRecipe = cva(
	// Base classes - connector line segment
	'absolute h-[2px] transition-colors',
	{
		variants: {
			position: {
				first: 'left-1/2 right-0', // Starts at center, extends right
				middle: 'left-0 right-0', // Full width
				last: 'left-0 right-1/2' // Ends at center
			},
			state: {
				completed: 'bg-interactive-primary', // Primary color for completed/active steps
				pending: 'bg-subtle' // Medium grey for pending steps
			},
			size: {
				md: 'top-[10px]', // Circle center for md (20px / 2)
				lg: 'top-[12px]', // Circle center for lg (24px / 2)
				xl: 'top-[20px]' // Circle center for xl (40px / 2)
			}
		},
		defaultVariants: {
			position: 'middle',
			state: 'pending',
			size: 'md'
		}
	}
);

/**
 * Stepper Step Button Recipe
 *
 * Styles for the clickable step button container.
 * Handles layout, disabled state, and opacity.
 *
 * Uses native button element (like NavItem uses native <a>) with recipe for stepper-specific
 * vertical layout (flex-col) for icon-above-label layout.
 * All styling is handled via recipe (no inline classes).
 *
 * Note: Opacity for disabled state is handled via inline style because CSS variables
 * don't work well with Tailwind's disabled: modifier. This is acceptable per
 * design system patterns for opacity handling.
 */
export const stepperStepButtonRecipe = cva(
	// Base classes - step button container
	// Reset button defaults and apply stepper-specific vertical layout
	'flex flex-col items-center gap-fieldGroup border-0 bg-transparent p-0 cursor-pointer disabled:cursor-not-allowed',
	{
		variants: {
			disabled: {
				true: '',
				false: ''
			}
		},
		defaultVariants: {
			disabled: false
		}
	}
);

export type StepperVariantProps = VariantProps<typeof stepperRecipe>;
export type StepperStepVariantProps = VariantProps<typeof stepperStepRecipe>;
export type StepperConnectorVariantProps = VariantProps<typeof stepperConnectorRecipe>;
export type StepperStepButtonVariantProps = VariantProps<typeof stepperStepButtonRecipe>;
