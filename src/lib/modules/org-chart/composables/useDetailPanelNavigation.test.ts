/**
 * Unit Tests for useDetailPanelNavigation Composable
 *
 * Tests navigation handling for detail panels (CircleDetailPanel and RoleDetailPanel).
 * Validates:
 * - Unsaved changes detection
 * - Edit mode handling
 * - Navigation stack manipulation
 * - Layer-specific routing (circle vs role)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDetailPanelNavigation } from './useDetailPanelNavigation.svelte';
import type { UseOrgChart } from './useOrgChart.svelte';
import type { Id } from '$lib/convex';

/**
 * Create mock orgChart instance with minimal required API
 */
function createMockOrgChart(): UseOrgChart {
	return {
		navigationStack: {
			currentLayer: null,
			previousLayer: null,
			depth: 0,
			stack: [],
			push: vi.fn(),
			pop: vi.fn(),
			jumpTo: vi.fn(),
			clear: vi.fn(),
			getLayer: vi.fn()
		},
		selectCircle: vi.fn(),
		selectRole: vi.fn()
	} as unknown as UseOrgChart;
}

describe('useDetailPanelNavigation - handleClose', () => {
	let mockOrgChart: UseOrgChart;
	let mockIsEditMode: () => boolean;
	let mockIsDirty: () => boolean;
	let mockOnShowDiscardDialog: ReturnType<typeof vi.fn>;
	let mockResetEditMode: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockOrgChart = createMockOrgChart();
		mockIsEditMode = () => false;
		mockIsDirty = () => false;
		mockOnShowDiscardDialog = vi.fn();
		mockResetEditMode = vi.fn();
		vi.clearAllMocks();
	});

	it('should show discard dialog when in edit mode with unsaved changes', () => {
		mockIsEditMode = () => true;
		mockIsDirty = () => true;

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleClose();

		// Should show discard dialog
		expect(mockOnShowDiscardDialog).toHaveBeenCalledOnce();
		// Should NOT reset edit mode
		expect(mockResetEditMode).not.toHaveBeenCalled();
		// Should NOT navigate
		expect(mockOrgChart.navigationStack.pop).not.toHaveBeenCalled();
	});

	it('should reset edit mode when in edit mode without unsaved changes', () => {
		mockIsEditMode = () => true;
		mockIsDirty = () => false;
		mockOrgChart.navigationStack.previousLayer = null; // No previous layer

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleClose();

		// Should reset edit mode
		expect(mockResetEditMode).toHaveBeenCalledOnce();
		// Should NOT show discard dialog
		expect(mockOnShowDiscardDialog).not.toHaveBeenCalled();
		// Should navigate (pop and close)
		expect(mockOrgChart.navigationStack.pop).toHaveBeenCalledOnce();
		expect(mockOrgChart.selectCircle).toHaveBeenCalledWith(null);
	});

	it('should navigate back to previous circle layer', () => {
		const circleId = 'circle-123' as Id<'circles'>;
		mockOrgChart.navigationStack.previousLayer = {
			type: 'circle',
			id: circleId,
			name: 'Parent Circle',
			zIndex: 60
		};

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleClose();

		// Should pop current layer
		expect(mockOrgChart.navigationStack.pop).toHaveBeenCalledOnce();
		// Should select previous circle WITHOUT pushing to stack
		expect(mockOrgChart.selectCircle).toHaveBeenCalledWith(circleId, { skipStackPush: true });
	});

	it('should navigate back to previous role layer', () => {
		const roleId = 'role-456' as Id<'circleRoles'>;
		mockOrgChart.navigationStack.previousLayer = {
			type: 'role',
			id: roleId,
			name: 'Parent Role',
			zIndex: 60
		};

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleClose();

		// Should pop current layer
		expect(mockOrgChart.navigationStack.pop).toHaveBeenCalledOnce();
		// Should select previous role WITHOUT pushing to stack
		expect(mockOrgChart.selectRole).toHaveBeenCalledWith(roleId, 'circle-panel', {
			skipStackPush: true
		});
	});

	it('should close all panels when no previous layer exists', () => {
		mockOrgChart.navigationStack.previousLayer = null;

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleClose();

		// Should pop current layer
		expect(mockOrgChart.navigationStack.pop).toHaveBeenCalledOnce();
		// Should close circle panel (which closes everything)
		expect(mockOrgChart.selectCircle).toHaveBeenCalledWith(null);
	});

	it('should do nothing when orgChart is null', () => {
		const navigation = useDetailPanelNavigation({
			orgChart: () => null,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleClose();

		// Should not call any handlers
		expect(mockOnShowDiscardDialog).not.toHaveBeenCalled();
		expect(mockResetEditMode).not.toHaveBeenCalled();
	});
});

describe('useDetailPanelNavigation - handleBreadcrumbClick', () => {
	let mockOrgChart: UseOrgChart;
	let mockIsEditMode: () => boolean;
	let mockIsDirty: () => boolean;
	let mockOnShowDiscardDialog: ReturnType<typeof vi.fn>;
	let mockResetEditMode: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockOrgChart = createMockOrgChart();
		mockIsEditMode = () => false;
		mockIsDirty = () => false;
		mockOnShowDiscardDialog = vi.fn();
		mockResetEditMode = vi.fn();
		vi.clearAllMocks();
	});

	it('should show discard dialog when in edit mode with unsaved changes', () => {
		mockIsEditMode = () => true;
		mockIsDirty = () => true;

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleBreadcrumbClick(0);

		// Should show discard dialog
		expect(mockOnShowDiscardDialog).toHaveBeenCalledOnce();
		// Should NOT reset edit mode
		expect(mockResetEditMode).not.toHaveBeenCalled();
		// Should NOT navigate
		expect(mockOrgChart.navigationStack.jumpTo).not.toHaveBeenCalled();
	});

	it('should reset edit mode when in edit mode without unsaved changes', () => {
		mockIsEditMode = () => true;
		mockIsDirty = () => false;

		const circleId = 'circle-123' as Id<'circles'>;
		vi.mocked(mockOrgChart.navigationStack.getLayer).mockReturnValue({
			type: 'circle',
			id: circleId,
			name: 'Target Circle',
			zIndex: 60
		});

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleBreadcrumbClick(0);

		// Should reset edit mode
		expect(mockResetEditMode).toHaveBeenCalledOnce();
		// Should NOT show discard dialog
		expect(mockOnShowDiscardDialog).not.toHaveBeenCalled();
		// Should navigate (jumpTo and select)
		expect(mockOrgChart.navigationStack.jumpTo).toHaveBeenCalledWith(0);
		expect(mockOrgChart.selectCircle).toHaveBeenCalledWith(circleId, { skipStackPush: true });
	});

	it('should jump to circle layer at specified index', () => {
		const circleId = 'circle-789' as Id<'circles'>;
		vi.mocked(mockOrgChart.navigationStack.getLayer).mockReturnValue({
			type: 'circle',
			id: circleId,
			name: 'Target Circle',
			zIndex: 60
		});

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleBreadcrumbClick(1);

		// Should get layer at index 1
		expect(mockOrgChart.navigationStack.getLayer).toHaveBeenCalledWith(1);
		// Should jump to that layer
		expect(mockOrgChart.navigationStack.jumpTo).toHaveBeenCalledWith(1);
		// Should select circle WITHOUT pushing to stack
		expect(mockOrgChart.selectCircle).toHaveBeenCalledWith(circleId, { skipStackPush: true });
	});

	it('should jump to role layer at specified index', () => {
		const roleId = 'role-101' as Id<'circleRoles'>;
		vi.mocked(mockOrgChart.navigationStack.getLayer).mockReturnValue({
			type: 'role',
			id: roleId,
			name: 'Target Role',
			zIndex: 70
		});

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleBreadcrumbClick(2);

		// Should get layer at index 2
		expect(mockOrgChart.navigationStack.getLayer).toHaveBeenCalledWith(2);
		// Should jump to that layer
		expect(mockOrgChart.navigationStack.jumpTo).toHaveBeenCalledWith(2);
		// Should select role WITHOUT pushing to stack
		expect(mockOrgChart.selectRole).toHaveBeenCalledWith(roleId, 'circle-panel', {
			skipStackPush: true
		});
	});

	it('should do nothing when target layer does not exist', () => {
		vi.mocked(mockOrgChart.navigationStack.getLayer).mockReturnValue(null);

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleBreadcrumbClick(999);

		// Should get layer at index 999
		expect(mockOrgChart.navigationStack.getLayer).toHaveBeenCalledWith(999);
		// Should NOT jump or navigate
		expect(mockOrgChart.navigationStack.jumpTo).not.toHaveBeenCalled();
		expect(mockOrgChart.selectCircle).not.toHaveBeenCalled();
		expect(mockOrgChart.selectRole).not.toHaveBeenCalled();
	});

	it('should do nothing when orgChart is null', () => {
		const navigation = useDetailPanelNavigation({
			orgChart: () => null,
			isEditMode: mockIsEditMode,
			isDirty: mockIsDirty,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		navigation.handleBreadcrumbClick(0);

		// Should not call any handlers
		expect(mockOnShowDiscardDialog).not.toHaveBeenCalled();
		expect(mockResetEditMode).not.toHaveBeenCalled();
	});
});

describe('useDetailPanelNavigation - Edge Cases', () => {
	it('should handle unknown layer types gracefully (do nothing)', () => {
		const mockOrgChart = createMockOrgChart();
		mockOrgChart.navigationStack.previousLayer = {
			type: 'unknown-layer-type',
			id: 'unknown-id',
			name: 'Unknown',
			zIndex: 60
		};

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: () => false,
			isDirty: () => false,
			onShowDiscardDialog: vi.fn(),
			resetEditMode: vi.fn()
		});

		navigation.handleClose();

		// Should pop current layer
		expect(mockOrgChart.navigationStack.pop).toHaveBeenCalledOnce();
		// Should NOT select circle or role (unknown type)
		expect(mockOrgChart.selectCircle).not.toHaveBeenCalled();
		expect(mockOrgChart.selectRole).not.toHaveBeenCalled();
	});

	it('should handle rapid consecutive close calls correctly', () => {
		const mockOrgChart = createMockOrgChart();
		mockOrgChart.navigationStack.previousLayer = null;

		const mockOnShowDiscardDialog = vi.fn();
		const mockResetEditMode = vi.fn();

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: () => false,
			isDirty: () => false,
			onShowDiscardDialog: mockOnShowDiscardDialog,
			resetEditMode: mockResetEditMode
		});

		// Call close multiple times
		navigation.handleClose();
		navigation.handleClose();
		navigation.handleClose();

		// Each call should attempt to pop and close
		expect(mockOrgChart.navigationStack.pop).toHaveBeenCalledTimes(3);
		expect(mockOrgChart.selectCircle).toHaveBeenCalledTimes(3);
	});

	it('should handle breadcrumb click to same layer (no-op after initial jump)', () => {
		const mockOrgChart = createMockOrgChart();
		const circleId = 'circle-current' as Id<'circles'>;

		vi.mocked(mockOrgChart.navigationStack.getLayer).mockReturnValue({
			type: 'circle',
			id: circleId,
			name: 'Current Circle',
			zIndex: 60
		});

		const navigation = useDetailPanelNavigation({
			orgChart: () => mockOrgChart,
			isEditMode: () => false,
			isDirty: () => false,
			onShowDiscardDialog: vi.fn(),
			resetEditMode: vi.fn()
		});

		// Click current layer (index 0)
		navigation.handleBreadcrumbClick(0);

		// Should still navigate (re-open same panel)
		expect(mockOrgChart.navigationStack.jumpTo).toHaveBeenCalledWith(0);
		expect(mockOrgChart.selectCircle).toHaveBeenCalledWith(circleId, { skipStackPush: true });
	});
});
