/**
 * Svelte Sonner Toast Types
 *
 * Type definitions for svelte-sonner toast notifications.
 * Based on svelte-sonner API: https://github.com/wobsoriano/svelte-sonner
 */

/**
 * Toast ID (returned by toast functions)
 */
export type ToastId = string | number;

/**
 * Toast options
 */
export interface ToastOptions {
	id?: ToastId;
	description?: string;
	duration?: number | typeof Number.POSITIVE_INFINITY;
	icon?: unknown; // Svelte component or element
	unstyled?: boolean;
	classes?: {
		toast?: string;
		title?: string;
		description?: string;
		actionButton?: string;
		cancelButton?: string;
		closeButton?: string;
		error?: string;
		success?: string;
		warning?: string;
		info?: string;
	};
	style?: string;
	class?: string;
	descriptionClass?: string;
	onDismiss?: (toast: { id: ToastId }) => void;
	onAutoClose?: (toast: { id: ToastId }) => void;
	action?: {
		label: string;
		onClick: () => void;
	};
	cancel?: {
		label: string;
		onClick?: () => void;
	};
}

/**
 * Promise toast messages
 */
export interface PromiseToastMessages<T> {
	loading: string;
	success: string | ((data: T) => string);
	error: string | ((error: unknown) => string);
}

/**
 * Sonner toast API interface
 */
export interface SonnerToast {
	(message: string, options?: ToastOptions): ToastId;
	success(message: string, options?: ToastOptions): ToastId;
	error(message: string, options?: ToastOptions): ToastId;
	info(message: string, options?: ToastOptions): ToastId;
	warning(message: string, options?: ToastOptions): ToastId;
	loading(message: string, options?: ToastOptions): ToastId;
	promise<T>(
		promise: Promise<T>,
		messages: PromiseToastMessages<T>,
		options?: ToastOptions
	): Promise<T>;
	dismiss(toastId?: ToastId): void;
	custom(component: unknown, options?: ToastOptions): ToastId;
}
