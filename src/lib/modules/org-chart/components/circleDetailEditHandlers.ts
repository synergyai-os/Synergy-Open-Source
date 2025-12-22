/**
 * Edit mode handlers for CircleDetailPanel
 * Extracted to reduce component size
 */

import type { ConvexClient } from 'convex/browser';
import type { Id } from '$lib/convex/_generated/dataModel';
import type { UseOrgChart } from '../composables/useOrgChart.svelte';
import type { UseEditCircleReturn } from '../composables/useEditCircle.svelte';
import { api } from '$lib/convex';
import { toast } from '$lib/utils/toast';

export function createEditHandlers(params: {
	editCircle: UseEditCircleReturn;
	orgChart: UseOrgChart | null;
	circle: () => any;
	getSessionId: () => string | null | undefined;
	workspaceId: () => Id<'workspaces'> | undefined;
	convexClient: ConvexClient | null;
	isEditMode: () => boolean;
	setEditMode: (value: boolean) => void;
	setShowDiscardDialog: (value: boolean) => void;
}) {
	const {
		editCircle,
		orgChart,
		circle,
		getSessionId,
		workspaceId,
		convexClient,
		setEditMode,
		setShowDiscardDialog
	} = params;

	function handleEditClick() {
		const c = circle();
		if (!c) return;
		setEditMode(true);
		editCircle.loadCircle();
	}

	function handleCancelEdit() {
		if (editCircle.isDirty) {
			setShowDiscardDialog(true);
		} else {
			setEditMode(false);
			editCircle.reset();
		}
	}

	function handleConfirmDiscard() {
		editCircle.reset();
		setEditMode(false);
		setShowDiscardDialog(false);
	}

	async function handleSaveDirectly() {
		await editCircle.saveDirectly();
		setEditMode(false);
		// Refresh circle data by re-selecting
		const c = circle();
		if (orgChart && c) {
			orgChart.selectCircle(c.circleId, { skipStackPush: true });
		}
	}

	async function handleAutoApprove() {
		const wsId = workspaceId();
		const c = circle();
		const sessionId = getSessionId();
		if (!convexClient || !c || !sessionId || !wsId) return;

		try {
			await convexClient.mutation(api.core.proposals.index.saveAndApprove, {
				sessionId,
				workspaceId: wsId,
				entityType: 'circle',
				entityId: c.circleId,
				title: `Update ${editCircle.formValues.name}`,
				description: 'Proposed changes to circle',
				editedValues: {
					name: editCircle.formValues.name,
					purpose: editCircle.formValues.purpose || undefined,
					circleType: editCircle.formValues.circleType,
					decisionModel: editCircle.formValues.decisionModel
				}
			});

			toast.success('Changes saved and auto-approved');
			setEditMode(false);

			// Refresh circle data by re-selecting
			if (orgChart) {
				orgChart.selectCircle(c.circleId, { skipStackPush: true });
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to save changes';
			toast.error(message);
			console.error('[CircleDetailPanel] Auto-approve failed:', err);
		}
	}

	async function handleProposeChange() {
		const c = circle();
		if (!c) return;

		try {
			await editCircle.saveAsProposal(
				`Update ${editCircle.formValues.name}`,
				'Proposed changes to circle'
			);

			toast.success('Proposal created. It will be reviewed in the next governance meeting.');
			setEditMode(false);

			// Refresh circle data by re-selecting
			if (orgChart) {
				orgChart.selectCircle(c.circleId, { skipStackPush: true });
			}
		} catch (err) {
			// Error is already handled in editCircle.saveAsProposal
			console.error('[CircleDetailPanel] Propose change failed:', err);
		}
	}

	return {
		handleEditClick,
		handleCancelEdit,
		handleConfirmDiscard,
		handleSaveDirectly,
		handleAutoApprove,
		handleProposeChange
	};
}
