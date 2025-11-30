import { cva, type VariantProps } from 'class-variance-authority';

/**
 * KeyboardShortcut Recipe (CVA)
 *
 * Type-safe variant system for KeyboardShortcut component.
 * Displays keyboard shortcuts in a consistent, branded style.
 *
 * Sizes: sm, md
 * - sm: Compact badge style (default)
 * - md: Larger button style
 */
export const keyboardShortcutRecipe = cva(
	// Base classes - keyboard shortcut container
	'inline-flex items-center gap-fieldGroup',
	{
		variants: {},
		defaultVariants: {}
	}
);

/**
 * KeyboardShortcut Key Recipe
 *
 * Styles for individual key badges.
 */
export const keyboardShortcutKeyRecipe = cva(
	// Base classes - key badge styling
	'bg-base/50 rounded-badge font-code text-tertiary',
	{
		variants: {
			size: {
				sm: 'text-label px-badge py-badge',
				md: 'text-button px-2 py-1'
			}
		},
		defaultVariants: {
			size: 'sm'
		}
	}
);

/**
 * KeyboardShortcut Separator Recipe
 *
 * Styles for the "+" separator between keys.
 */
export const keyboardShortcutSeparatorRecipe = cva(
	// Base classes - separator styling
	'text-label text-tertiary',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type KeyboardShortcutVariantProps = VariantProps<typeof keyboardShortcutRecipe>;
export type KeyboardShortcutKeyVariantProps = VariantProps<typeof keyboardShortcutKeyRecipe>;
export type KeyboardShortcutSeparatorVariantProps = VariantProps<
	typeof keyboardShortcutSeparatorRecipe
>;
