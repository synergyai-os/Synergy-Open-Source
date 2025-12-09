/**
 * Edit Role Composable
 *
 * Manages edit panel state for roles, including:
 * - Form state (name, purpose)
 * - Dirty tracking (compare current vs original values)
 * - Save actions (direct save vs save as proposal)
 * - Loading and error states
 *
 * Pattern: Follows Svelte 5 composable patterns with function parameters for reactivity
 */

import { browser } from '$app/environment';
import { useConvexClient } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { toast } from '$lib/utils/toast';
import { invariant } from '$lib/utils/invariant';

export interface RoleEditValues {
	name: string;
	purpose: string;
	representsToParent: boolean;
}

export interface UseEditRoleOptions {
	roleId: () => Id<'circleRoles'> | null;
	sessionId: () => string | undefined;
	workspaceId: () => Id<'workspaces'> | undefined;
	canQuickEdit: () => boolean;
}

export interface UseEditRoleReturn {
	// Reactive getters
	get isDirty(): boolean;
	get formValues(): RoleEditValues;
	get isLoading(): boolean;
	get isSaving(): boolean;
	get error(): string | null;

	// Actions
	loadRole: () => Promise<void>;
	setField: <K extends keyof RoleEditValues>(field: K, value: RoleEditValues[K]) => void;
	saveDirectly: () => Promise<void>;
	saveAsProposal: (title: string, description: string) => Promise<Id<'circleProposals'> | null>;
	reset: () => void;
}

/**
 * Composable for editing roles
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useEditRole } from './composables/useEditRole.svelte';
 *
 *   const editRole = useEditRole({
 *     roleId: () => orgChart?.selectedRoleId ?? null,
 *     sessionId: () => $page.data.sessionId,
 *     workspaceId: () => $page.data.workspaceId,
 *     canQuickEdit: () => permission.canEdit
 *   });
 * </script>
 * ```
 */
export function useEditRole(options: UseEditRoleOptions): UseEditRoleReturn {
	const getRoleId = options.roleId;
	const getSessionId = options.sessionId;
	const getWorkspaceId = options.workspaceId;
	const getCanQuickEdit = options.canQuickEdit;

	const convexClient = browser ? useConvexClient() : null;

	const state = $state({
		// Form state
		name: '',
		purpose: '',
		representsToParent: false,
		// Original values (for dirty checking)
		originalValues: null as RoleEditValues | null,
		// UI state
		isLoading: false,
		isSaving: false,
		error: null as string | null
	});

	// Derived: Check if form has unsaved changes
	const isDirty = $derived.by(() => {
		if (!state.originalValues) return false;

		return (
			state.name !== state.originalValues.name ||
			state.purpose !== state.originalValues.purpose ||
			state.representsToParent !== state.originalValues.representsToParent
		);
	});

	// Derived: Current form values
	const formValues = $derived({
		name: state.name,
		purpose: state.purpose,
		representsToParent: state.representsToParent
	});

	/**
	 * Load role data and populate form
	 */
	async function loadRole(): Promise<void> {
		const roleId = getRoleId();
		const sessionId = getSessionId();

		if (!roleId || !sessionId || !convexClient) {
			state.error = 'Missing required parameters';
			return;
		}

		state.isLoading = true;
		state.error = null;

		try {
			const role = await convexClient.query(api.circleRoles.get, {
				sessionId,
				roleId
			});

			invariant(role, 'Role not found');

			// Populate form with current values
			state.name = role.name;
			state.purpose = role.purpose || '';
			state.representsToParent = role.representsToParent ?? false;

			// Store original values for dirty checking
			state.originalValues = {
				name: role.name,
				purpose: role.purpose || '',
				representsToParent: role.representsToParent ?? false
			};
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load role';
			state.error = message;
			console.error('[useEditRole] Failed to load role:', err);
		} finally {
			state.isLoading = false;
		}
	}

	/**
	 * Set a form field value
	 */
	function setField<K extends keyof RoleEditValues>(field: K, value: RoleEditValues[K]): void {
		state[field] = value;
	}

	/**
	 * Save changes directly (quick edit - requires permission)
	 */
	async function saveDirectly(): Promise<void> {
		const roleId = getRoleId();
		const sessionId = getSessionId();

		invariant(roleId && sessionId && convexClient, 'Missing required parameters');

		if (!getCanQuickEdit()) {
			invariant(false, 'You do not have permission to save directly');
		}

		state.isSaving = true;
		state.error = null;

		try {
			await convexClient.mutation(api.circleRoles.updateInline, {
				sessionId,
				circleRoleId: roleId,
				updates: {
					name: state.name.trim(),
					purpose: state.purpose || undefined,
					representsToParent: state.representsToParent
				}
			});

			// Update original values to reflect saved state
			state.originalValues = { ...formValues };

			toast.success('Saved!');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to save changes';
			state.error = message;
			toast.error(message);
			throw err;
		} finally {
			state.isSaving = false;
		}
	}

	/**
	 * Save changes as a proposal
	 */
	async function saveAsProposal(
		title: string,
		description: string
	): Promise<Id<'circleProposals'> | null> {
		const roleId = getRoleId();
		const sessionId = getSessionId();
		const workspaceId = getWorkspaceId();

		invariant(roleId && sessionId && workspaceId && convexClient, 'Missing required parameters');

		state.isSaving = true;
		state.error = null;

		try {
			const result = await convexClient.mutation(api.proposals.createFromDiff, {
				sessionId,
				workspaceId,
				entityType: 'role',
				entityId: roleId,
				title: title.trim(),
				description: description.trim(),
				editedValues: {
					name: state.name.trim(),
					purpose: state.purpose || undefined,
					representsToParent: state.representsToParent
				}
			});

			toast.success('Proposal created!');
			return result.proposalId;
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to create proposal';
			state.error = message;
			toast.error(message);
			throw err;
		} finally {
			state.isSaving = false;
		}
	}

	/**
	 * Reset form to original values
	 */
	function reset(): void {
		if (state.originalValues) {
			state.name = state.originalValues.name;
			state.purpose = state.originalValues.purpose;
			state.representsToParent = state.originalValues.representsToParent;
		}
		state.error = null;
	}

	return {
		get isDirty() {
			return isDirty;
		},
		get formValues() {
			return formValues;
		},
		get isLoading() {
			return state.isLoading;
		},
		get isSaving() {
			return state.isSaving;
		},
		get error() {
			return state.error;
		},
		loadRole,
		setField,
		saveDirectly,
		saveAsProposal,
		reset
	};
}
