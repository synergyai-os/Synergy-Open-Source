import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Avatar Recipe (CVA)
 *
 * Type-safe variant system for Avatar component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: default, brand
 * - default: Uses accent color (fallback to interactive-primary if accent doesn't exist)
 * - brand: Uses brand/interactive-primary color with inverse text for high contrast
 *
 * Sizes: sm, md, lg
 *
 * DESIGN SYSTEM EXCEPTION: Avatar border radius (SYOS-585)
 *
 * Avatar uses full border radius (circle) which is a special value:
 * - borderRadius.avatar = 9999px (full) - perfect circle shape
 *
 * This value is hardcoded as rounded-full because it doesn't reference base tokens.
 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
 */
export const avatarRecipe = cva(
	// Base classes - applied to all avatars
	// Always rounded-full for perfect circle, flex centering for initials
	'flex flex-shrink-0 items-center justify-center rounded-full font-semibold',
	{
		variants: {
			variant: {
				// Default: Uses interactive-primary (brand color) for consistency
				// Note: bg-accent-primary doesn't exist, so using bg-interactive-primary
				default: 'bg-interactive-primary text-inverse',
				// Brand: Explicitly uses brand color with inverse text for high contrast
				brand: 'bg-interactive-primary text-inverse'
			},
			size: {
				// WORKAROUND: size-avatar-* utilities don't exist - using CSS variables via inline styles
				// See Avatar.svelte for inline style implementation
				sm: 'text-label',
				md: 'text-button',
				lg: 'text-body'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md'
		}
	}
);

export type AvatarVariantProps = VariantProps<typeof avatarRecipe>;

