/**
 * Atomic UI Components - Linear Style
 *
 * Reusable, composable UI elements following pattern: ui-patterns.md#L680
 * All components are UI-only with stubbed functionality for independent development
 *
 * @deprecated Use atomic imports instead:
 * - import { Button } from '$lib/components/atoms';
 * - import { MetadataBar } from '$lib/components/molecules';
 * - import * as Dialog from '$lib/components/organisms';
 *
 * This barrel export is maintained for backward compatibility during migration.
 * Will be removed in v2.0.
 */

// Re-export from atomic structure for backward compatibility
export * from '../atoms';
export * from '../molecules';
export * from '../organisms';

// Export types
export type * from './types';
