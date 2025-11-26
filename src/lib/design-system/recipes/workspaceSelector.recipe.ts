import { cva, type VariantProps } from 'class-variance-authority';

/**
 * WorkspaceSelector Recipe (CVA)
 *
 * Type-safe variant system for WorkspaceSelector component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Handles styling only (transitions, colors) - layout classes are in component.
 *
 * Premium micro-interactions:
 * - Smooth 200ms transition on opacity
 */
export const workspaceSelectorRecipe = cva(
	// Base classes - styling only (transitions)
	'transition-opacity duration-300',
	{
		variants: {},
		defaultVariants: {}
	}
);

export type WorkspaceSelectorVariantProps = VariantProps<typeof workspaceSelectorRecipe>;
