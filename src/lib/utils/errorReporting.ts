/**
 * Error Reporting Utilities
 *
 * Centralized error reporting to PostHog and other monitoring services.
 * Includes context enrichment, error categorization, and feature flag tracking.
 */

import { browser } from '$app/environment';

export interface ErrorContext {
	/** Component or function where error occurred */
	componentName?: string;
	/** Feature flag associated with the error */
	featureFlag?: string;
	/** Was this caught by an error boundary? */
	errorBoundary?: boolean;
	/** User action that triggered the error */
	userAction?: string;
	/** Additional context data */
	context?: Record<string, unknown>;
	/** Error severity level */
	severity?: 'low' | 'medium' | 'high' | 'critical';
	/** User ID (if available) */
	userId?: string;
}

export interface ErrorReport extends ErrorContext {
	error: Error;
}

/**
 * Report an error to PostHog and console
 */
export function reportError(report: ErrorReport): void {
	if (!browser) return;

	const {
		error,
		componentName,
		featureFlag,
		errorBoundary = false,
		userAction,
		context = {},
		severity = 'medium',
		userId: _userId
	} = report;

	// Build error properties
	const errorProperties = {
		// Error details
		error_message: error.message,
		error_name: error.name,
		error_stack: error.stack,

		// Context
		component_name: componentName,
		feature_flag: featureFlag,
		error_boundary: errorBoundary,
		user_action: userAction,
		severity,

		// Environment
		url: window.location.href,
		user_agent: navigator.userAgent,
		timestamp: new Date().toISOString(),

		// Additional context
		...context
	};

	// Report to PostHog
	try {
		// @ts-ignore - posthog may not be defined in types
		if (window.posthog) {
			// @ts-ignore
			window.posthog.capture('error_occurred', errorProperties);

			// If error boundary caught it, track separately
			if (errorBoundary) {
				// @ts-ignore
				window.posthog.capture('error_boundary_caught', {
					...errorProperties,
					recovered: true
				});
			}
		}
	} catch (e) {
		// Don't let error reporting crash the app
		console.error('Failed to report error to PostHog:', e);
	}

	// Console logging
	if (import.meta.env.DEV) {
		console.group(`🚨 Error Report [${severity}]`);
		console.error('Error:', error);
		console.log('Component:', componentName);
		console.log('Feature Flag:', featureFlag);
		console.log('Context:', context);
		console.groupEnd();
	}
}

/**
 * Report a feature flag evaluation
 * Useful for tracking which users see which features
 */
export function reportFeatureFlagCheck(
	flag: string,
	enabled: boolean,
	userId?: string,
	metadata?: Record<string, unknown>
): void {
	if (!browser) return;

	try {
		// @ts-ignore
		if (window.posthog) {
			// @ts-ignore
			window.posthog.capture('feature_flag_checked', {
				flag,
				enabled,
				user_id: userId,
				timestamp: new Date().toISOString(),
				...metadata
			});
		}
	} catch (e) {
		console.error('Failed to report feature flag check:', e);
	}
}

/**
 * Report feature usage
 * Track when a flagged feature is actually used
 */
export function reportFeatureUsed(
	feature: string,
	flag?: string,
	metadata?: Record<string, unknown>
): void {
	if (!browser) return;

	try {
		// @ts-ignore
		if (window.posthog) {
			// @ts-ignore
			window.posthog.capture('feature_used', {
				feature,
				feature_flag: flag,
				timestamp: new Date().toISOString(),
				...metadata
			});
		}
	} catch (e) {
		console.error('Failed to report feature usage:', e);
	}
}

/**
 * Report performance metrics
 * Track slow operations that might indicate issues
 */
export function reportPerformance(
	operation: string,
	durationMs: number,
	metadata?: Record<string, unknown>
): void {
	if (!browser) return;

	// Only report slow operations (> 1 second)
	if (durationMs < 1000) return;

	try {
		// @ts-ignore
		if (window.posthog) {
			// @ts-ignore
			window.posthog.capture('performance_metric', {
				operation,
				duration_ms: durationMs,
				duration_seconds: (durationMs / 1000).toFixed(2),
				is_slow: durationMs > 3000,
				timestamp: new Date().toISOString(),
				...metadata
			});
		}
	} catch (e) {
		console.error('Failed to report performance metric:', e);
	}
}

/**
 * Track user flow completion
 * Monitor if users complete multi-step processes
 */
export function reportFlowCompletion(
	flow: string,
	step: string,
	completed: boolean,
	metadata?: Record<string, unknown>
): void {
	if (!browser) return;

	try {
		// @ts-ignore
		if (window.posthog) {
			// @ts-ignore
			window.posthog.capture('flow_step', {
				flow,
				step,
				completed,
				timestamp: new Date().toISOString(),
				...metadata
			});
		}
	} catch (e) {
		console.error('Failed to report flow completion:', e);
	}
}

/**
 * Performance timing helper
 * Wraps async operations and reports timing
 *
 * @example
 * const result = await withTiming('sync_readwise', async () => {
 *   return await syncReadwise();
 * });
 */
export async function withTiming<T>(
	operation: string,
	fn: () => Promise<T>,
	metadata?: Record<string, unknown>
): Promise<T> {
	const start = performance.now();

	try {
		const result = await fn();
		const duration = performance.now() - start;

		reportPerformance(operation, duration, {
			...metadata,
			success: true
		});

		return result;
	} catch (error) {
		const duration = performance.now() - start;

		reportPerformance(operation, duration, {
			...metadata,
			success: false,
			error: error instanceof Error ? error.message : String(error)
		});

		throw error;
	}
}

/**
 * Error boundary helper for functional components
 * Use when you can't wrap with <ErrorBoundary> component
 *
 * @example
 * const result = await withErrorBoundary(
 *   async () => riskyOperation(),
 *   {
 *     componentName: 'SyncButton',
 *     featureFlag: 'sync_v2_rollout',
 *     onError: (err) => showToast('Sync failed')
 *   }
 * );
 */
export async function withErrorBoundary<T>(
	fn: () => Promise<T>,
	context: ErrorContext
): Promise<T | null> {
	try {
		return await fn();
	} catch (error) {
		reportError({
			error: error instanceof Error ? error : new Error(String(error)),
			...context
		});
		return null;
	}
}
