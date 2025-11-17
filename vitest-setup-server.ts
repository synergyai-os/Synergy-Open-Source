/**
 * Vitest Setup for Server Tests
 *
 * Handles unhandled rejections from Convex Test scheduled functions.
 * This is a known limitation - scheduled functions can't be tested directly.
 */

// Suppress unhandled rejections from Convex Test scheduled functions
// These occur when mutations schedule functions (e.g., ctx.scheduler.runAfter)
// but Convex Test doesn't support scheduled functions properly
process.on('unhandledRejection', (reason) => {
	// Check if this is the known scheduled functions error
	if (
		reason instanceof Error &&
		reason.message.includes('Write outside of transaction') &&
		reason.message.includes('_scheduled_functions')
	) {
		// Suppress this specific error - it's a known Convex Test limitation
		// Tests still pass correctly, this is just a warning
		return;
	}

	// Re-throw other unhandled rejections
	throw reason;
});
