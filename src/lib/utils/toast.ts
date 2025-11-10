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

import { toast as sonnerToast } from 'svelte-sonner';

/**
 * Show success toast
 * @param message - Success message to display
 * @param options - Optional toast configuration
 */
function success(message: string, options?: any) {
  return sonnerToast.success(message, {
    duration: 3000,
    ...options,
  });
}

/**
 * Show error toast
 * @param message - Error message to display
 * @param options - Optional toast configuration
 */
function error(message: string, options?: any) {
  return sonnerToast.error(message, {
    duration: 4000, // Errors stay slightly longer
    ...options,
  });
}

/**
 * Show info toast
 * @param message - Info message to display
 * @param options - Optional toast configuration
 */
function info(message: string, options?: any) {
  return sonnerToast.info(message, {
    duration: 3000,
    ...options,
  });
}

/**
 * Show warning toast
 * @param message - Warning message to display
 * @param options - Optional toast configuration
 */
function warning(message: string, options?: any) {
  return sonnerToast.warning(message, {
    duration: 3500,
    ...options,
  });
}

/**
 * Show loading toast
 * @param message - Loading message to display
 * @param options - Optional toast configuration (must include `id` for dismissal)
 */
function loading(message: string, options?: any) {
  return sonnerToast.loading(message, options);
}

/**
 * Show promise toast (auto-updates based on promise state)
 * @param promise - Promise to track
 * @param messages - Messages for loading, success, and error states
 */
function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: any
) {
  return sonnerToast.promise(promise, messages, options);
}

/**
 * Dismiss a toast by ID
 * @param toastId - Optional toast ID (dismisses all if not provided)
 */
function dismiss(toastId?: string | number) {
  return sonnerToast.dismiss(toastId);
}

/**
 * Show custom toast
 * @param message - Message to display
 * @param options - Optional toast configuration
 */
function custom(message: string, options?: any) {
  return sonnerToast(message, options);
}

export const toast = {
  success,
  error,
  info,
  warning,
  loading,
  promise,
  dismiss,
  custom,
};

