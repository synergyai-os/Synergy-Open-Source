/**
 * Convex Test Setup
 *
 * Provides modules glob for convex-test to locate all Convex functions
 */

// Export modules glob for convex-test
// Pattern: Match all .ts/.js files in convex/ folder (relative to this file)
export const modules = import.meta.glob('../../../convex/**/*.ts');
