/**
 * Edit Circle Composable
 *
 * Manages edit panel state for circles, including:
 * - Form state (name, purpose, circleType, decisionModel)
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
import type { CircleType, DecisionModel } from '$lib/infrastructure/organizational-model/constants';
import {
	CIRCLE_TYPES,
	DECISION_MODELS,
	getLeadAuthorityLevel,
	getAuthorityUI,
	getLeadLabel,
	type CircleType as CircleTypeType,
	type DecisionModel as DecisionModelType
} from '$lib/infrastructure/organizational-model/constants';

export interface CircleEditValues {
	name: string;
	purpose: string;
	circleType: CircleType;
	decisionModel: DecisionModel;
}

export interface UseEditCircleOptions {
	circleId: () => Id<'circles'> | null;
	sessionId: () => string | undefined;
	workspaceId: () => Id<'workspaces'> | undefined;
	/** Optional: If provided, enables direct save. If not provided or false, only proposal saves allowed. */
	canQuickEdit?: () => boolean;
}

export interface UseEditCircleReturn {
	// Reactive getters
	get isDirty(): boolean;
	get formValues(): CircleEditValues;
	get isLoading(): boolean;
	get isSaving(): boolean;
	get error(): string | null;

	// Actions
	loadCircle: () => Promise<void>;
	setField: <K extends keyof CircleEditValues>(field: K, value: CircleEditValues[K]) => void;
	saveDirectly: () => Promise<void>;
	saveAsProposal: (title: string, description: string) => Promise<Id<'circleProposals'> | null>;
	reset: () => void;
}

/**
 * Composable for editing circles
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useEditCircle } from './composables/useEditCircle.svelte';
 *
 *   const editCircle = useEditCircle({
 *     circleId: () => orgChart?.selectedCircleId ?? null,
 *     sessionId: () => $page.data.sessionId,
 *     workspaceId: () => $page.data.workspaceId,
 *     canQuickEdit: () => permission.canEdit
 *   });
 * </script>
 * ```
 */
export function useEditCircle(options: UseEditCircleOptions): UseEditCircleReturn {
	const getCircleId = options.circleId;
	const getSessionId = options.sessionId;
	const getWorkspaceId = options.workspaceId;
	const getCanQuickEdit = options.canQuickEdit ?? (() => false);

	const convexClient = browser ? useConvexClient() : null;

	const state = $state({
		// Form state
		name: '',
		purpose: '',
		circleType: CIRCLE_TYPES.HIERARCHY as CircleTypeType,
		decisionModel: DECISION_MODELS.MANAGER_DECIDES as DecisionModelType,
		// Original values (for dirty checking)
		originalValues: null as CircleEditValues | null,
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
			state.circleType !== state.originalValues.circleType ||
			state.decisionModel !== state.originalValues.decisionModel
		);
	});

	// Derived: Current form values
	const formValues = $derived({
		name: state.name,
		purpose: state.purpose,
		circleType: state.circleType,
		decisionModel: state.decisionModel
	});

	/**
	 * Load circle data and populate form
	 */
	async function loadCircle(): Promise<void> {
		const circleId = getCircleId();
		const sessionId = getSessionId();

		if (!circleId || !sessionId || !convexClient) {
			state.error = 'Missing required parameters';
			return;
		}

		state.isLoading = true;
		state.error = null;

		try {
			const circle = await convexClient.query(api.circles.get, {
				sessionId,
				circleId
			});

			invariant(circle, 'Circle not found');

			// Populate form with current values
			state.name = circle.name;
			state.purpose = circle.purpose || '';
			state.circleType = (circle.circleType || CIRCLE_TYPES.HIERARCHY) as CircleTypeType;
			state.decisionModel = (circle.decisionModel ||
				DECISION_MODELS.MANAGER_DECIDES) as DecisionModelType;

			// Store original values for dirty checking
			state.originalValues = {
				name: circle.name,
				purpose: circle.purpose || '',
				circleType: (circle.circleType || CIRCLE_TYPES.HIERARCHY) as CircleTypeType,
				decisionModel: (circle.decisionModel ||
					DECISION_MODELS.MANAGER_DECIDES) as DecisionModelType
			};
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load circle';
			state.error = message;
			console.error('[useEditCircle] Failed to load circle:', err);
		} finally {
			state.isLoading = false;
		}
	}

	/**
	 * Set a form field value
	 */
	function setField<K extends keyof CircleEditValues>(field: K, value: CircleEditValues[K]): void {
		state[field] = value;
	}

	/**
	 * Save changes directly (quick edit - requires permission)
	 */
	async function saveDirectly(): Promise<void> {
		const circleId = getCircleId();
		const sessionId = getSessionId();

		invariant(circleId && sessionId && convexClient, 'Missing required parameters');

		// Check if quick edit permission is provided and enabled
		if (!options.canQuickEdit || !getCanQuickEdit()) {
			invariant(false, 'You do not have permission to save directly');
		}

		state.isSaving = true;
		state.error = null;

		try {
			// Check if circle type changed (for authority change notification)
			const oldType = state.originalValues?.circleType ?? CIRCLE_TYPES.HIERARCHY;
			const newType = state.circleType;
			const oldAuthority = getLeadAuthorityLevel(oldType);
			const newAuthority = getLeadAuthorityLevel(newType);
			const authorityChanged = oldType !== newType && oldAuthority !== newAuthority;

			await convexClient.mutation(api.circles.updateInline, {
				sessionId,
				circleId,
				updates: {
					name: state.name.trim(),
					purpose: state.purpose || undefined,
					circleType: state.circleType,
					decisionModel: state.decisionModel
				}
			});

			// Update original values to reflect saved state
			state.originalValues = { ...formValues };

			// Show authority change notification if circle type changed
			if (authorityChanged) {
				const oldUI = getAuthorityUI(oldAuthority);
				const newUI = getAuthorityUI(newAuthority);
				const oldLabel = getLeadLabel(oldType);
				const newLabel = getLeadLabel(newType);

				toast.info(
					`Lead authority changed from ${oldUI.emoji} ${oldLabel} to ${newUI.emoji} ${newLabel}`,
					{
						description:
							'You may want to review role items to ensure they align with the new authority level.',
						duration: 5000
					}
				);
			} else {
				toast.success('Saved!');
			}
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
		const circleId = getCircleId();
		const sessionId = getSessionId();
		const workspaceId = getWorkspaceId();

		invariant(circleId && sessionId && workspaceId && convexClient, 'Missing required parameters');

		state.isSaving = true;
		state.error = null;

		try {
			const result = await convexClient.mutation(api.proposals.createFromDiff, {
				sessionId,
				workspaceId,
				entityType: 'circle',
				entityId: circleId,
				title: title.trim(),
				description: description.trim(),
				editedValues: {
					name: state.name.trim(),
					purpose: state.purpose || undefined,
					circleType: state.circleType,
					decisionModel: state.decisionModel
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
			state.circleType = state.originalValues.circleType;
			state.decisionModel = state.originalValues.decisionModel;
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
		loadCircle,
		setField,
		saveDirectly,
		saveAsProposal,
		reset
	};
}
