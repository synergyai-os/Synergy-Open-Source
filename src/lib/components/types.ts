/**
 * Shared TypeScript types for UI components
 *
 * Used by Bits UI wrappers and atomic components
 */

import type { Snippet } from 'svelte';

// Common Size Types
export type Size = 'sm' | 'md' | 'lg' | 'xl';

// Common Variant Types
export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

// Component-Specific Types
export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'noPadding';

export type DialogVariant = 'default' | 'wide' | 'fullscreen';

export type AccordionVariant = 'default';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type TextVariant = 'body' | 'label' | 'caption';
export type TextSize = 'sm' | 'base' | 'lg';

// Utility Types
export type WithChildren<T = Record<string, never>> = T & { children: Snippet };
