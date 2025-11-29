/**
 * Flashcards Module Manifest
 *
 * Flashcards module provides spaced repetition learning functionality:
 * - Flashcard creation from highlights
 * - Flashcard review and study sessions
 * - FSRS (Free Spaced Repetition Scheduler) algorithm integration
 * - Collection-based workspace
 *
 * This module is always enabled (no feature flag required).
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';
import type { FlashcardsModuleAPI } from './api';

/**
 * Flashcards module manifest
 *
 * **Dependencies**: ['core']
 *   - 'core': Uses CoreModuleAPI for TagSelector component and tagging functionality via useTagging composable
 * **Feature Flag**: null (always enabled)
 * **API**: FlashcardsModuleAPI (currently minimal, ready for future expansion)
 */
export const flashcardsModule: ModuleManifest = {
	name: 'flashcards',
	version: '1.0.0',
	dependencies: ['core'],
	featureFlag: null, // Always enabled
	api: undefined as FlashcardsModuleAPI | undefined // Type reference for API contract
};
