/**
 * Toast Notification Utility
 *
 * Reusable toast helper using svelte-sonner for consistent user feedback
 * across the application.
 *
 * Usage:
 * ```typescript
 * import { toast } from '$lib/utils/toast';
 *
 * toast.success('Organization created!');
 * toast.error('Failed to save changes');
 * toast.loading('Syncing...', { id: 'sync-toast' });
 * toast.promise(saveData(), {
 *   loading: 'Saving...',
 *   success: 'Saved successfully!',
 *   error: 'Failed to save'
 * });
 * ```
 *
 * Design Principles:
 * - Uses design tokens for consistent styling
 * - Accessible by default (ARIA labels, keyboard dismissible)
 * - Auto-dismisses after 3s (customizable)
 * - Positioned top-right for minimal disruption
 *
 * See: dev-docs/2-areas/patterns/ui-patterns.md for patterns
 */

import { browser } from '$app/environment';
import type { ToastId, ToastOptions, PromiseToastMessages } from '$lib/types/sonner';

// Lazy-load svelte-sonner only on client side to avoid SSR issues
// Use unknown type since svelte-sonner's toast has a more flexible signature
// than our SonnerToast interface (accepts AnyComponent, not just string)
let sonnerToast: unknown = null;

if (browser) {
	import('svelte-sonner').then((module) => {
		sonnerToast = module.toast;
	});
}

// No-op fallback for SSR
const noOp = () => {};
const getSonner = () =>
	sonnerToast || {
		success: noOp,
		error: noOp,
		info: noOp,
		warning: noOp,
		loading: noOp,
		promise: noOp,
		dismiss: noOp
	};

/**
 * Show success toast
 * @param message - Success message to display
 * @param options - Optional toast configuration
 */
function success(message: string, options?: ToastOptions): ToastId | undefined {
	const toast = getSonner() as {
		success?: (message: string, options?: ToastOptions) => ToastId | undefined;
		error?: (message: string, options?: ToastOptions) => ToastId | undefined;
		info?: (message: string, options?: ToastOptions) => ToastId | undefined;
		warning?: (message: string, options?: ToastOptions) => ToastId | undefined;
		loading?: (message: string, options?: ToastOptions) => ToastId | undefined;
		promise?: <T>(
			promise: Promise<T>,
			messages: PromiseToastMessages<T>,
			options?: ToastOptions
		) => Promise<T>;
		dismiss?: (toastId?: ToastId) => void;
	};
	const result = toast.success?.(message, {
		duration: 3000,
		...options
	});
	return result as ToastId | undefined;
}

/**
 * Show error toast
 * @param message - Error message to display
 * @param options - Optional toast configuration
 */
function error(message: string, options?: ToastOptions): ToastId | undefined {
	const toast = getSonner() as {
		error?: (message: string, options?: ToastOptions) => ToastId | undefined;
	};
	const result = toast.error?.(message, {
		duration: 4000, // Errors stay slightly longer
		...options
	});
	return result as ToastId | undefined;
}

/**
 * Show info toast
 * @param message - Info message to display
 * @param options - Optional toast configuration
 */
function info(message: string, options?: ToastOptions): ToastId | undefined {
	const toast = getSonner() as {
		info?: (message: string, options?: ToastOptions) => ToastId | undefined;
	};
	const result = toast.info?.(message, {
		duration: 3000,
		...options
	});
	return result as ToastId | undefined;
}

/**
 * Show warning toast
 * @param message - Warning message to display
 * @param options - Optional toast configuration
 */
function warning(message: string, options?: ToastOptions): ToastId | undefined {
	const toast = getSonner() as {
		warning?: (message: string, options?: ToastOptions) => ToastId | undefined;
	};
	const result = toast.warning?.(message, {
		duration: 3500,
		...options
	});
	return result as ToastId | undefined;
}

/**
 * Show loading toast
 * @param message - Loading message to display
 * @param options - Optional toast configuration (must include `id` for dismissal)
 */
function loading(message: string, options?: ToastOptions): ToastId | undefined {
	const toast = getSonner() as {
		loading?: (message: string, options?: ToastOptions) => ToastId | undefined;
	};
	const result = toast.loading?.(message, options);
	return result as ToastId | undefined;
}

/**
 * Show promise toast (auto-updates based on promise state)
 * @param promise - Promise to track
 * @param messages - Messages for loading, success, and error states
 */
function promise<T>(
	promise: Promise<T>,
	messages: PromiseToastMessages<T>,
	options?: ToastOptions
) {
	const toast = getSonner() as {
		promise?: <T>(
			promise: Promise<T>,
			messages: PromiseToastMessages<T>,
			options?: ToastOptions
		) => Promise<T>;
	};
	return toast.promise?.(promise, messages, options);
}

/**
 * Dismiss a toast by ID
 * @param toastId - Optional toast ID (dismisses all if not provided)
 */
function dismiss(toastId?: string | number) {
	const toast = getSonner() as {
		dismiss?: (toastId?: ToastId) => void;
	};
	return toast.dismiss?.(toastId);
}

/**
 * Show custom toast
 * @param message - Message to display
 * @param options - Optional toast configuration
 */
function custom(message: string, options?: ToastOptions): ToastId | undefined {
	if (!browser || !sonnerToast) return undefined;
	const toast = sonnerToast as (message: string, options?: ToastOptions) => ToastId | undefined;
	const result = toast(message, options);
	return result as ToastId | undefined;
}

export const toast = {
	success,
	error,
	info,
	warning,
	loading,
	promise,
	dismiss,
	custom
};
