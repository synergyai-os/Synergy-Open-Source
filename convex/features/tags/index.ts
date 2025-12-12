/**
 * Entry wrapper for tags feature.
 * Public API preserved; handlers delegated to helper modules.
 */

export {
	listAllTags,
	listUserTags,
	listTagsForHighlight,
	listTagsForFlashcard,
	getTagItemCount
} from './queries';
export { createTag, createTagShare } from './lifecycle';
export {
	updateHighlightTagAssignments,
	updateFlashcardTagAssignments,
	archiveHighlightTagAssignment
} from './assignments';
export { getTagDescendantsForTags } from './hierarchy';
export { calculateTagTree } from './hierarchy';
export type { TagWithHierarchy } from './types';
