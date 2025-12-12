/**
 * Projects Module API Contract
 *
 * Public interface for the Projects module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { Id } from '$lib/convex';

/**
 * Task data structure
 */
export interface Task {
	_id: Id<'tasks'>;
	_creationTime: number;
	workspaceId: Id<'workspaces'>;
	meetingId?: Id<'meetings'>;
	agendaItemId?: Id<'meetingAgendaItems'>;
	projectId?: Id<'projects'>;
	circleId?: Id<'circles'>;
	assigneeType: 'user' | 'role';
	assigneeUserId?: Id<'users'>;
	assigneeRoleId?: Id<'circleRoles'>;
	description: string;
	dueDate?: number;
	status: 'todo' | 'in-progress' | 'done';
	createdAt: number;
	createdBy: Id<'users'>;
	updatedAt?: number;
}

/**
 * Project data structure
 */
export interface Project {
	_id: Id<'projects'>;
	_creationTime: number;
	workspaceId: Id<'workspaces'>;
	circleId?: Id<'circles'>;
	name: string;
	description?: string;
	externalTool?: 'linear' | 'notion' | 'asana' | 'jira' | 'trello';
	externalProjectId?: string;
	syncStatus?: 'synced' | 'pending' | 'error';
	lastSyncedAt?: number;
	externalUrl?: string;
	createdAt: number;
	createdBy: Id<'users'>;
	updatedAt: number;
}

/**
 * Options for useTasks composable
 */
export interface UseTasksOptions {
	agendaItemId: () => Id<'meetingAgendaItems'>;
	sessionId: () => string | undefined;
	workspaceId: () => Id<'workspaces'>;
	circleId?: () => Id<'circles'> | undefined;
}

/**
 * Return type for useTasks composable
 */
export interface UseTasksReturn {
	/**
	 * Tasks for the specified agenda item
	 */
	get tasks(): Task[];

	/**
	 * Workspace members (for user assignment)
	 */
	get members(): Array<{
		personId?: Id<'people'>;
		userId: Id<'users'>;
		email: string;
		name: string;
		role: string;
		joinedAt: number;
	}>;

	/**
	 * Circle roles (for role assignment)
	 */
	get roles(): Array<{
		roleId: Id<'circleRoles'>;
		circleId: Id<'circles'>;
		name: string;
		purpose: string | undefined;
		fillerCount: number;
		createdAt: number;
	}>;

	/**
	 * Whether queries are currently loading
	 */
	get isLoading(): boolean;
}

/**
 * Options for useTaskForm composable
 */
export interface UseTaskFormOptions {
	sessionId: () => string;
	workspaceId: () => Id<'workspaces'>;
	meetingId: () => Id<'meetings'>;
	agendaItemId: () => Id<'meetingAgendaItems'>;
	circleId?: () => Id<'circles'> | undefined;
	members: () => UseTasksReturn['members'];
	roles: () => UseTasksReturn['roles'];
	readonly?: () => boolean;
}

/**
 * Return type for useTaskForm composable
 */
export interface UseTaskFormReturn {
	get isAdding(): boolean;
	set isAdding(value: boolean);
	get description(): string;
	set description(value: string);
	get assigneeType(): 'user' | 'role';
	set assigneeType(value: 'user' | 'role');
	get assigneePersonId(): Id<'people'> | null;
	set assigneePersonId(value: Id<'people'> | null);
	get assigneeRoleId(): Id<'circleRoles'> | null;
	set assigneeRoleId(value: Id<'circleRoles'> | null);
	get dueDate(): number | null;
	set dueDate(value: number | null);

	startAdding: () => void;
	resetForm: () => void;
	handleCreate: () => Promise<void>;
	handleToggleStatus: (
		id: Id<'tasks'>,
		currentStatus: 'todo' | 'in-progress' | 'done'
	) => Promise<void>;
	handleDelete: (id: Id<'tasks'>) => Promise<void>;

	// Utility functions
	formatDate: (timestamp: number) => string;
	getAssigneeName: (item: Task) => string;
	getInitials: (name: string) => string;
	handleDueDateChange: (e: Event) => void;
	timestampToDateInput: (timestamp: number | null) => string;
}

/**
 * Public API contract for the Projects module
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Usage Pattern:**
 * ```typescript
 * import type { ProjectsModuleAPI } from '$lib/modules/projects/api';
 *
 * // In component:
 * const projects = getContext<ProjectsModuleAPI>('projects');
 * const tasks = projects.useTasks({ ... });
 * ```
 *
 * **Migration Path:**
 * - Phase 1 (Current): Direct import still works (backward compatible)
 * - Phase 2 (Future): Use dependency injection via context
 * - Phase 3 (Future): Module registry provides APIs
 */
export interface ProjectsModuleAPI {
	// ===== Public Composables =====

	/**
	 * Composable for managing tasks
	 *
	 * Provides reactive access to tasks for an agenda item, along with
	 * workspace members and circle roles for assignment.
	 *
	 * @param options - Configuration options
	 * @returns Reactive tasks data and loading state
	 */
	useTasks(options: UseTasksOptions): UseTasksReturn;

	/**
	 * Composable for managing task form state
	 *
	 * Provides form state management and business logic for creating,
	 * updating, and deleting tasks.
	 *
	 * @param options - Configuration options
	 * @returns Task form state and actions
	 */
	useTaskForm(options: UseTaskFormOptions): UseTaskFormReturn;
}
