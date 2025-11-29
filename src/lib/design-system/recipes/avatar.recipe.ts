import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Avatar Recipe (CVA)
 *
 * Type-safe variant system for Avatar component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: default, brand
 * - default: Neutral gray for workspace/workspace avatars - professional, understated
 * - brand: Brand teal for primary CTAs and brand elements - matches login button
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
				// Default: Neutral gray for workspace/workspace avatars
				// Uses interactive-tertiary (neutral-700 in light, appropriate in dark)
				default: 'bg-interactive-tertiary text-inverse',
				// Brand: Uses brand teal color with inverse text for high contrast
				// Use for primary CTAs, main user avatar, or brand emphasis
				brand: 'bg-interactive-primary text-inverse'
			},
			size: {
				// WORKAROUND: size-avatar-* utilities don't exist - using CSS variables via inline styles
				// See Avatar.svelte for inline style implementation
				xxs: 'text-2xs', // 10px - Extra tiny for compact sidebar headers
				xs: 'text-xs', // 12px - Tiny
				sm: 'text-label', // 10px
				md: 'text-button', // 14px
				lg: 'text-body' // 16px
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md'
		}
	}
);

export type AvatarVariantProps = VariantProps<typeof avatarRecipe>;
