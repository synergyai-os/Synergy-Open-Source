import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Dialog Recipe (CVA)
 *
 * Type-safe variant system for Dialog/Modal components.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants:
 * - size: sm, md, lg (dialog width)
 *
 * Components:
 * - dialogOverlayRecipe: Backdrop overlay
 * - dialogContentRecipe: Dialog container
 * - dialogHeaderRecipe: Header section with title/description
 * - dialogBodyRecipe: Scrollable body content
 * - dialogFooterRecipe: Footer with action buttons
 * - dialogTitleRecipe: Title typography
 * - dialogDescriptionRecipe: Description typography
 *
 * Note: Uses gap-content (12px) for spacing between dialog sections.
 * The component uses flex-col with gaps rather than margins for consistency.
 */

/**
 * Dialog Overlay - Dark backdrop behind dialog
 */
export const dialogOverlayRecipe = cva(
	// Base overlay styling
	'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm'
);

/**
 * Dialog Content - Main dialog container
 *
 * Fixed positioning centered on screen with scrollable overflow.
 * Uses gap-modal (36px) for spacious visual hierarchy between header, body, and footer.
 * Uses px-modal (24px), pt-modal (16px), and pb-modal (24px) for padding.
 */
export const dialogContentRecipe = cva(
	// Base classes - positioned, styled, scrollable, with gap for internal spacing
	'fixed top-[50%] left-[50%] z-[100] flex -translate-x-1/2 -translate-y-1/2 flex-col gap-modal overflow-y-auto rounded-modal border border-base bg-elevated px-modal pt-modal pb-modal shadow-modal',
	{
		variants: {
			size: {
				sm: 'max-h-[85vh] w-[min(100%,90vw)] max-w-sm',
				md: 'max-h-[90vh] w-[min(100%,90vw)] max-w-lg',
				lg: 'max-h-[90vh] w-[min(100%,90vw)] max-w-2xl'
			}
		},
		defaultVariants: {
			size: 'md'
		}
	}
);

/**
 * Dialog Header - Title row with close button
 */
export const dialogHeaderRecipe = cva(
	// Flex layout with vertical centering for title + close button alignment
	'flex items-center justify-between gap-header'
);

/**
 * Dialog Title - Heading typography
 */
export const dialogTitleRecipe = cva(
	// Semantic heading style with primary text color
	'text-heading3 leading-heading3 font-heading3 text-primary'
);

/**
 * Dialog Description - Subtitle typography
 */
export const dialogDescriptionRecipe = cva(
	// Body text with secondary color for less emphasis
	'text-body text-secondary'
);

/**
 * Dialog Body - Scrollable content area
 */
export const dialogBodyRecipe = cva(
	// Flex-grow for available space, scrollable
	'flex-1 overflow-y-auto'
);

/**
 * Dialog Footer - Action buttons container
 *
 * Button layout aligned to the right with standard button gap.
 */
export const dialogFooterRecipe = cva(
	// Flex layout for buttons, no divider
	'flex justify-end gap-button'
);

export type DialogOverlayVariantProps = VariantProps<typeof dialogOverlayRecipe>;
export type DialogContentVariantProps = VariantProps<typeof dialogContentRecipe>;
export type DialogHeaderVariantProps = VariantProps<typeof dialogHeaderRecipe>;
export type DialogTitleVariantProps = VariantProps<typeof dialogTitleRecipe>;
export type DialogDescriptionVariantProps = VariantProps<typeof dialogDescriptionRecipe>;
export type DialogBodyVariantProps = VariantProps<typeof dialogBodyRecipe>;
export type DialogFooterVariantProps = VariantProps<typeof dialogFooterRecipe>;
