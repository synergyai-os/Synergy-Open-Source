# `openModal('createWorkspace')` Dataflow Investigation Report

**Generated**: 2025-01-XX  
**Purpose**: Trace all usages of `openModal('createWorkspace')` and document the complete dataflow from UI trigger to backend mutation.

---

## Executive Summary

The `openModal('createWorkspace')` function is part of the **Workspaces Module** infrastructure layer. It manages modal state reactively using Svelte 5's `$state` rune and triggers a centralized dialog component that handles workspace creation. The complete flow spans from UI components → composable state → modal component → mutation → Convex backend → database.

---

## 1. Source of Truth: Modal State Definition

### Location

`src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts`

### Implementation

```72:77:src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts
	// Modal state (simple local state, no need to extract)
	const state = $state({
		modals: {
			createWorkspace: false,
			joinOrganization: false
		}
	});
```

### Modal Control Functions

```255:261:src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts
	function openModal(key: ModalKey) {
		state.modals[key] = true;
	}

	function closeModal(key: ModalKey) {
		state.modals[key] = false;
	}
```

**Key Points**:

- Modal state is stored in a reactive `$state` object
- `ModalKey` type is `'createWorkspace' | 'joinOrganization'`
- State is accessed via getter in the returned API object

### API Exposure

```301:303:src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts
		get modals() {
			return state.modals;
		},
```

```319:321:src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts
		setActiveWorkspace,
		openModal,
		closeModal,
```

The `openModal` function is exposed as part of the `WorkspacesModuleAPI` interface.

---

## 2. Context Provision: Where Workspaces Module is Initialized

### Primary Initialization Point

`src/routes/(authenticated)/+layout.svelte`

```49:60:src/routes/(authenticated)/+layout.svelte
	// Initialize workspaces composable with sessionId and server-side preloaded data
	// Returns WorkspacesModuleAPI interface (enables loose coupling - see SYOS-295)
	const workspaces = useWorkspaces({
		userId: () => data.user?.userId,
		sessionId: () => data.sessionId,
		orgFromUrl: () => null, // Path-based routing, no query params
		// Server-side preloaded data for instant workspace menu rendering
		// Cast unknown[] to proper types (server-side data is typed as unknown[] for safety)
		initialOrganizations: data.workspaces as unknown as WorkspaceSummary[],
		initialOrganizationInvites: data.workspaceInvites as unknown as WorkspaceInvite[]
	});
	setContext('workspaces', workspaces);
```

**Additional Context Set Locations**:

- `src/routes/(authenticated)/w/[slug]/+layout.svelte` (line 70)
- `src/routes/(authenticated)/onboarding/+layout.svelte` (line 28)

---

## 3. Usage Points: Where `openModal('createWorkspace')` is Called

### 3.1 Sidebar Component (2 locations)

**File**: `src/lib/modules/core/components/Sidebar.svelte`

**Location 1** (Line 526):

```525:527:src/lib/modules/core/components/Sidebar.svelte
				onCreateWorkspace={() => {
					workspaces?.openModal('createWorkspace');
				}}
```

**Location 2** (Line 907):

```906:908:src/lib/modules/core/components/Sidebar.svelte
			onCreateWorkspace={() => {
				workspaces?.openModal('createWorkspace');
			}}
```

**Context**: Both instances pass `onCreateWorkspace` prop to `SidebarHeader` component. The Sidebar component accesses workspaces via `getContext('workspaces')`.

### 3.2 AppTopBar Component

**File**: `src/lib/modules/core/components/AppTopBar.svelte`

**Location** (Line 85):

```85:86:src/lib/modules/core/components/AppTopBar.svelte
				onCreateOrganization={() => workspaces?.openModal('createWorkspace')}
				onJoinOrganization={() => workspaces?.openModal('joinOrganization')}
```

**Context**: Passed to `WorkspaceSwitcher` component as `onCreateOrganization` prop.

### 3.3 WorkspaceSwitcher Component (Indirect)

**File**: `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte`

**Flow**: The `WorkspaceSwitcher` receives `onCreateOrganization` prop and calls it when user clicks "Create workspace" in the dropdown menu. This prop is wired to `openModal('createWorkspace')` in parent components.

**Note**: `SidebarHeader.svelte` currently uses a **local dialog** instead of calling `openModal('createWorkspace')`:

```140:142:src/lib/modules/core/components/SidebarHeader.svelte
				onCreateOrganization={() => {
					showCreateWorkspaceDialog = true;
				}}
```

This is an **inconsistency** - `SidebarHeader` should use the centralized modal system.

---

## 4. Modal Rendering: Where the Dialog is Displayed

### Component Location

`src/lib/infrastructure/workspaces/components/WorkspaceModals.svelte`

### Modal State Binding

```33:36:src/lib/infrastructure/workspaces/components/WorkspaceModals.svelte
<Dialog.Root
	open={workspaces.modals.createWorkspace}
	onOpenChange={(value) => !value && workspaces.closeModal('createWorkspace')}
>
```

**Key Points**:

- Uses Bits UI `Dialog.Root` component
- Reactively watches `workspaces.modals.createWorkspace` (Svelte 5 reactivity)
- Automatically closes modal when user clicks outside or presses Escape
- Calls `closeModal('createWorkspace')` when dialog closes

### Form Submission Handler

```19:25:src/lib/infrastructure/workspaces/components/WorkspaceModals.svelte
	async function submitCreateOrganization() {
		await workspaces.createWorkspace({ name: organizationName });
		// Only clear if modal closed (success)
		if (!workspaces.modals.createWorkspace) {
			organizationName = '';
		}
	}
```

**Flow**:

1. User enters workspace name in form
2. Form submission calls `workspaces.createWorkspace({ name: ... })`
3. On success, modal is closed (via `closeModal` in mutation handler)
4. Form field is cleared only if modal closed successfully

### Rendering Location

**File**: `src/routes/(authenticated)/+layout.svelte`

```878:884:src/routes/(authenticated)/+layout.svelte
		<!-- Organization Modals (Create/Join Org, Create/Join Team) -->
		{#if workspaces}
			<WorkspaceModals
				{workspaces}
				activeOrganizationName={workspaces.activeWorkspace?.name ?? null}
			/>
		{/if}
```

**Key Points**:

- Rendered at the layout level (global scope)
- Only renders if `workspaces` context exists
- Single instance handles both `createWorkspace` and `joinOrganization` modals

---

## 5. Mutation Flow: Frontend → Backend

### 5.1 Frontend Mutation Handler

**File**: `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts`

**Function**: `createWorkspace`

```61:142:src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts
	async function createWorkspace(payload: { name: string }) {
		if (!convexClient) return;
		const trimmed = payload.name.trim();
		if (!trimmed) return;

		const userId = getUserId();
		invariant(userId, 'User ID is required. Please log in again.');

		loadingState.createWorkspace = true;

		// Show loading overlay
		let loadingOverlay: UseLoadingOverlayReturn | null = null;
		try {
			loadingOverlay = getContext<UseLoadingOverlayReturn>('loadingOverlay');
			if (loadingOverlay) {
				loadingOverlay.showOverlay({
					flow: 'workspace-creation',
					subtitle: trimmed
				});
			}
		} catch {
			// Context not available, continue without overlay
		}

		try {
			// Get sessionId
			const sessionId = getSessionId();
			invariant(sessionId, 'Session ID not available');

			const result = await convexClient.mutation(api.core.workspaces.index.createWorkspace, {
				name: trimmed,
				sessionId
			});

			if (result?.workspaceId) {
				// Switch to new workspace (overlay will persist during switch)
				setActiveWorkspace(result.workspaceId);

				// Show success toast
				if (browser) {
					toast.success(`${trimmed} created successfully!`);

					// Track analytics
					if (posthog) {
						posthog.capture(AnalyticsEventName.ORGANIZATION_CREATED, {
							workspaceId: result.workspaceId,
							organizationName: trimmed
						});
					}
				}

				// Close modal on success
				closeModal('createWorkspace');

				// Hide overlay after a short delay (workspace switch overlay will take over)
				if (loadingOverlay && browser) {
					setTimeout(() => {
						loadingOverlay?.hideOverlay();
					}, 500);
				}
			}
		} catch (error) {
			console.error('Failed to create workspace:', error);

			// Hide overlay on error
			if (loadingOverlay) {
				loadingOverlay.hideOverlay();
			}

			// Show error toast (only in browser context, e.g., when called from modal)
			// When called from onboarding page, the page will handle error display
			if (browser) {
				toast.error('Failed to create workspace. Please try again.');
			}

			// Keep modal open on error so user can retry
			// Re-throw error so callers (like onboarding page) can catch and handle it
			throw error;
		} finally {
			loadingState.createWorkspace = false;
		}
	}
```

**Key Steps**:

1. Validates input (trims name, checks userId/sessionId)
2. Sets loading state (`loadingState.createWorkspace = true`)
3. Shows loading overlay (if available)
4. Calls Convex mutation: `api.core.workspaces.index.createWorkspace`
5. On success:
   - Switches to new workspace (`setActiveWorkspace`)
   - Shows success toast
   - Tracks analytics event
   - Closes modal (`closeModal('createWorkspace')`)
   - Hides loading overlay
6. On error:
   - Hides loading overlay
   - Shows error toast
   - Keeps modal open for retry
   - Re-throws error for caller handling

### 5.2 Convex Backend Mutation

**File**: `convex/core/workspaces/lifecycle.ts`

**Mutation Definition**:

```150:159:convex/core/workspaces/lifecycle.ts
export const createWorkspace = mutation({
	args: {
		name: v.string(),
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return createWorkspaceFlow(ctx, { name: args.name, userId });
	}
});
```

**Internal Flow Function**:

```224:281:convex/core/workspaces/lifecycle.ts
async function createWorkspaceFlow(
	ctx: MutationCtx,
	args: { name: string; userId: Id<'users'> }
): Promise<{ workspaceId: Id<'workspaces'>; slug: string }> {
	const trimmedName = args.name.trim();
	if (!trimmedName) {
		throw createError(ErrorCodes.WORKSPACE_NAME_REQUIRED, 'Organization name is required');
	}

	const slugBase = slugifyName(trimmedName);
	ensureSlugNotReserved(slugBase, 'workspace name', trimmedName);

	const slug = await ensureUniqueWorkspaceSlug(ctx, slugBase);
	const now = Date.now();

	const workspaceId = await ctx.db.insert('workspaces', {
		name: trimmedName,
		slug,
		createdAt: now,
		updatedAt: now,
		plan: 'starter',
		phase: 'design' // Start in design phase - no governance overhead
	});

	// Create people record (organizational identity) - SYOS-814 Phase 1
	const user = await ctx.db.get(args.userId);
	if (!user) {
		throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found');
	}
	const userEmail = findUserEmailField(user);
	const userName = findUserNameField(user);
	const displayName = userName || userEmail?.split('@')[0] || 'Unknown';

	const personId = await ctx.db.insert('people', {
		workspaceId,
		userId: args.userId,
		displayName,
		email: undefined, // Email comes from user lookup, not stored per people/README.md
		workspaceRole: 'owner',
		status: 'active',
		invitedAt: now,
		invitedBy: undefined, // Self-created workspace, no inviter
		joinedAt: now,
		// Onboarding will be completed at the final step (/onboarding/complete)
		// when completeWorkspaceSetup is called
		onboardingCompletedAt: undefined,
		archivedAt: undefined,
		archivedBy: undefined
	});

	// Note: Root circle is NOT created here - it will be created in onboarding step 3
	// when the user chooses circle type. This ensures the circle is created complete
	// (with type) and avoids violating GOV-08 (circle type must be explicit).
	// All workspace seeding (custom fields, meeting templates, roles) happens when
	// the root circle is created with type in step 3.

	return { workspaceId, slug };
}
```

**Backend Steps**:

1. Validates session and extracts userId
2. Trims workspace name
3. Generates slug from name (slugify)
4. Ensures slug is not reserved
5. Ensures slug is unique (adds suffix if needed)
6. Inserts workspace record:
   - `name`, `slug`, `plan: 'starter'`, `phase: 'design'`
   - Timestamps (`createdAt`, `updatedAt`)
7. Creates `people` record for creator:
   - Links to workspace and user
   - Sets `workspaceRole: 'owner'`
   - Sets `status: 'active'`
8. Returns `{ workspaceId, slug }`

**Note**: Root circle is **NOT** created here. It's created during onboarding step 3 when user chooses circle type.

### 5.3 API Export

**File**: `convex/core/workspaces/index.ts`

```1:7:convex/core/workspaces/index.ts
export { listWorkspaces, findBySlug, findById, getAliasBySlug } from './queries';
export {
	createWorkspace,
	recordOrganizationSwitch,
	updateSlug,
	updateDisplayNames
} from './lifecycle';
```

The mutation is exported from the workspace module index and accessible via `api.core.workspaces.index.createWorkspace`.

---

## 6. Complete Dataflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ UI TRIGGER POINTS                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Sidebar.svelte (line 526, 907)                                │
│    └─> onCreateWorkspace={() =>                                │
│          workspaces?.openModal('createWorkspace')}             │
│                                                                 │
│  AppTopBar.svelte (line 85)                                    │
│    └─> onCreateOrganization={() =>                            │
│          workspaces?.openModal('createWorkspace')}             │
│                                                                 │
│  WorkspaceSwitcher.svelte (via prop)                           │
│    └─> onCreateOrganization prop → openModal                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ CONTEXT ACCESS                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Components access via:                                         │
│    const workspaces = getContext<WorkspacesModuleAPI>('workspaces') │
│                                                                 │
│  Context provided in:                                           │
│    - src/routes/(authenticated)/+layout.svelte (line 60)       │
│    - src/routes/(authenticated)/w/[slug]/+layout.svelte        │
│    - src/routes/(authenticated)/onboarding/+layout.svelte       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE UPDATE                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  useWorkspaces.svelte.ts (line 255-257)                        │
│    function openModal(key: ModalKey) {                         │
│      state.modals[key] = true;  // Reactive $state update      │
│    }                                                            │
│                                                                 │
│  State object:                                                 │
│    const state = $state({                                      │
│      modals: {                                                 │
│        createWorkspace: false → true                            │
│      }                                                          │
│    });                                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ MODAL RENDERING                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WorkspaceModals.svelte (line 33-35)                           │
│    <Dialog.Root                                                 │
│      open={workspaces.modals.createWorkspace}  // Reactive     │
│      onOpenChange={(value) =>                                  │
│        !value && workspaces.closeModal('createWorkspace')}     │
│    >                                                            │
│                                                                 │
│  Rendered in:                                                   │
│    src/routes/(authenticated)/+layout.svelte (line 880)       │
│      <WorkspaceModals {workspaces} />                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ USER SUBMITS FORM                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WorkspaceModals.svelte (line 19-25)                           │
│    async function submitCreateOrganization() {                  │
│      await workspaces.createWorkspace({                         │
│        name: organizationName                                   │
│      });                                                        │
│    }                                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND MUTATION HANDLER                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  useWorkspaceMutations.svelte.ts (line 61-142)                 │
│    async function createWorkspace(payload) {                   │
│      1. Validate input                                         │
│      2. Set loading state                                       │
│      3. Show loading overlay                                    │
│      4. Call Convex mutation                                    │
│         await convexClient.mutation(                            │
│           api.core.workspaces.index.createWorkspace,            │
│           { name, sessionId }                                   │
│         )                                                       │
│      5. On success:                                            │
│         - Switch to new workspace                              │
│         - Show toast                                            │
│         - Track analytics                                       │
│         - Close modal                                           │
│      6. On error:                                              │
│         - Show error toast                                     │
│         - Keep modal open                                       │
│    }                                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ CONVEX BACKEND MUTATION                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  convex/core/workspaces/lifecycle.ts (line 150-159)            │
│    export const createWorkspace = mutation({                    │
│      args: { name: v.string(), sessionId: v.string() },        │
│      handler: async (ctx, args) => {                            │
│        const { userId } = await                                │
│          validateSessionAndGetUserId(ctx, args.sessionId);      │
│        return createWorkspaceFlow(ctx, { name, userId });       │
│      }                                                          │
│    });                                                          │
│                                                                 │
│  createWorkspaceFlow (line 224-281):                           │
│    1. Validate name                                             │
│    2. Generate slug                                             │
│    3. Ensure slug uniqueness                                    │
│    4. Insert workspace record                                   │
│    5. Create people record (owner)                             │
│    6. Return { workspaceId, slug }                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Convex Database:                                               │
│    - workspaces table: New workspace record                    │
│    - people table: New person record (owner)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE & UI UPDATE                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend receives:                                             │
│    { workspaceId: Id<'workspaces'>, slug: string }             │
│                                                                 │
│  UI Updates:                                                    │
│    1. setActiveWorkspace(workspaceId) →                        │
│       - Updates activeWorkspaceId state                        │
│       - Triggers navigation to /w/[slug]/inbox                  │
│    2. closeModal('createWorkspace') →                          │
│       - Sets state.modals.createWorkspace = false              │
│       - Modal closes reactively                                │
│    3. Toast notification displayed                             │
│    4. Analytics event tracked                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Key Files Reference

### Frontend Files

| File                                                                            | Purpose                                       | Key Lines                        |
| ------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------- |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts`         | Modal state definition & `openModal` function | 72-77, 255-257, 301-303, 319-321 |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` | Frontend mutation handler                     | 61-142                           |
| `src/lib/infrastructure/workspaces/components/WorkspaceModals.svelte`           | Modal UI component                            | 19-25, 33-36                     |
| `src/lib/infrastructure/workspaces/api.ts`                                      | TypeScript interface definitions              | 16, 22, 80, 127, 140             |
| `src/lib/modules/core/components/Sidebar.svelte`                                | Usage point #1                                | 525-527, 906-908                 |
| `src/lib/modules/core/components/AppTopBar.svelte`                              | Usage point #2                                | 85                               |
| `src/lib/modules/core/components/SidebarHeader.svelte`                          | **Inconsistency**: Uses local dialog instead  | 140-142                          |
| `src/routes/(authenticated)/+layout.svelte`                                     | Context provision & modal rendering           | 49-60, 878-884                   |

### Backend Files

| File                                  | Purpose                    | Key Lines        |
| ------------------------------------- | -------------------------- | ---------------- |
| `convex/core/workspaces/lifecycle.ts` | Convex mutation definition | 150-159, 224-281 |
| `convex/core/workspaces/index.ts`     | API export                 | 1-7              |

---

## 8. Inconsistencies & Issues

### 8.1 SidebarHeader Uses Local Dialog

**Issue**: `SidebarHeader.svelte` uses a local `StandardDialog` instead of the centralized modal system.

**Current Implementation**:

```140:142:src/lib/modules/core/components/SidebarHeader.svelte
				onCreateOrganization={() => {
					showCreateWorkspaceDialog = true;
				}}
```

**Expected Implementation**:

```typescript
onCreateOrganization={() => workspaces?.openModal('createWorkspace')}
```

**Impact**:

- Duplicate dialog UI code
- Inconsistent user experience
- Modal state not managed centrally

**Recommendation**: Refactor `SidebarHeader` to use `workspaces?.openModal('createWorkspace')` and remove the local `StandardDialog` (lines 178-205).

---

## 9. Testing References

### Test Files

| File                                                                                          | Purpose                           |
| --------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------- |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts`      | Integration tests for modal state | Line 201: `composable.openModal('createWorkspace')` |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.characterization.svelte.test.ts` | Characterization tests            | Line 106, 137                                       |

---

## 10. Related Patterns

### Modal State Management Pattern

The workspaces module uses a **centralized modal state pattern**:

1. **Single source of truth**: Modal state in `useWorkspaces` composable
2. **Reactive updates**: Svelte 5 `$state` rune for reactivity
3. **API interface**: Exposed via `WorkspacesModuleAPI` interface
4. **Global rendering**: Single `WorkspaceModals` component in layout
5. **Consistent API**: `openModal(key)` / `closeModal(key)` pattern

### Similar Patterns in Codebase

- **Circles module**: Uses similar pattern with `useCircles` composable
  - File: `src/lib/infrastructure/organizational-model/composables/useCircles.svelte.ts`
  - Line 147: `openModal: (modal: ModalKey) => { ... }`

---

## 11. Summary

### Dataflow Summary

1. **Trigger**: User clicks "Create workspace" in UI (Sidebar, AppTopBar, or WorkspaceSwitcher)
2. **State Update**: `openModal('createWorkspace')` sets `state.modals.createWorkspace = true`
3. **Reactive Rendering**: `WorkspaceModals` component reactively shows dialog
4. **User Input**: User enters workspace name and submits form
5. **Frontend Mutation**: `createWorkspace({ name })` handler:
   - Validates input
   - Shows loading overlay
   - Calls Convex mutation
6. **Backend Processing**: Convex mutation:
   - Validates session
   - Creates workspace record
   - Creates people record (owner)
   - Returns `{ workspaceId, slug }`
7. **Success Handling**: Frontend:
   - Switches to new workspace
   - Closes modal
   - Shows success toast
   - Tracks analytics
8. **Navigation**: Automatic navigation to `/w/[slug]/inbox`

### Key Architectural Decisions

- **Centralized Modal State**: Single source of truth prevents state synchronization issues
- **Reactive State Management**: Svelte 5 `$state` ensures UI updates automatically
- **API Interface Pattern**: `WorkspacesModuleAPI` enables loose coupling
- **Global Modal Rendering**: Single modal component in layout simplifies state management
- **Session-Based Auth**: All mutations use `sessionId` for security (never trust client `userId`)

---

## Appendix: Type Definitions

### ModalKey Type

```typescript
type ModalKey = 'createWorkspace' | 'joinOrganization';
```

**Defined in**:

- `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` (line 48)
- `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` (line 21)
- `src/lib/infrastructure/workspaces/api.ts` (line 16)

### WorkspacesModuleAPI Interface

```typescript
export interface WorkspacesModuleAPI {
	get modals(): ModalState;
	openModal(key: ModalKey): void;
	closeModal(key: ModalKey): void;
	createWorkspace(payload: { name: string }): Promise<void>;
	// ... other methods
}
```

**Defined in**: `src/lib/infrastructure/workspaces/api.ts`

---

**End of Report**
