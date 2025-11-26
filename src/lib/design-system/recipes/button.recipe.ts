import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button Recipe (CVA)
 *
 * Type-safe variant system for Button component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: primary, secondary, outline, ghost, solid
 * - primary/secondary/outline: For text buttons (includes typography, shadows, lift effects)
 * - ghost/solid: For icon-only buttons (simplified, no typography/shadows/lift)
 * Sizes: sm, md, lg
 *
 * Note: iconOnly prop is handled separately in Button.svelte component
 * (iconOnly changes padding but not variant/size logic)
 * When using ghost/solid variants, iconOnly=true is recommended for proper styling
 *
 * DESIGN SYSTEM EXCEPTION: Button typography (SYOS-585)
 *
 * Button uses non-standard typography scale (14px) that's independent from spacing scale:
 * - typography.fontSize.button = 0.875rem (14px)
 *
 * This value is hardcoded in recipe because it doesn't reference base tokens.
 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
 */
export const buttonRecipe = cva(
	// Base classes - applied to all buttons
	// Premium micro-interactions: smooth transitions on all properties, subtle hover lift
	'inline-flex items-center justify-center rounded-button transition-all duration-200 ease-out',
	{
		variants: {
			variant: {
				// Primary: dark teal background → white text for WCAG 4.5:1 contrast
				// Hover: subtle lift effect with shadow increase
				primary:
					'font-body text-[0.875rem] font-medium bg-interactive-primary text-inverse shadow-sm hover:bg-interactive-primaryHover hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm disabled:opacity-disabled disabled:hover:translate-y-0 disabled:hover:shadow-sm',
				secondary:
					'font-body text-[0.875rem] font-medium bg-elevated border border-base text-primary shadow-sm hover:border-focus hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm disabled:opacity-disabled disabled:hover:translate-y-0',
				outline:
					'font-body text-[0.875rem] font-medium border border-base text-primary hover:bg-hover-solid hover:border-focus active:bg-active disabled:opacity-disabled disabled:hover:bg-elevated',
				// Ghost: transparent background, secondary text, hover shows background
				// Optimized for icon-only buttons (no typography, shadows, or lift effects)
				ghost:
					'text-secondary hover:bg-hover hover:text-primary disabled:opacity-disabled disabled:hover:bg-transparent disabled:hover:text-secondary cursor-pointer disabled:cursor-not-allowed',
				// Solid: surface background, primary text, hover shows hover overlay
				// Optimized for icon-only buttons (no typography, shadows, or lift effects)
				solid:
					'bg-surface text-primary hover:bg-hover disabled:opacity-disabled disabled:hover:bg-surface disabled:hover:text-primary cursor-pointer disabled:cursor-not-allowed'
			},
			size: {
				// WORKAROUND: px-2 (8px) hardcoded - no semantic token for small button padding - see missing-styles.md
				sm: 'px-2 py-nav-item gap-button text-sm',
				md: 'px-button py-button gap-button',
				lg: 'px-button py-button gap-button text-body'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md'
		}
	}
);

export type ButtonVariantProps = VariantProps<typeof buttonRecipe>;
