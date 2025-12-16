# Proposals Domain Architecture Alignment Plan

**Date**: 2025-01-XX  
**Status**: Ready for Implementation  
**Reference**: `ARCHITECTURE-ALIGNMENT-ANALYSIS.md`

---

## Overview

This plan aligns the `convex/core/proposals` domain with the architecture patterns defined in `dev-docs/master-docs/architecture.md`. The main goal is to consolidate scattered functionality into the expected file structure while maintaining domain cohesion.

**Target Structure:**
```
proposals/
├── tables.ts          ✅ Already correct
├── schema.ts          ⚠️ Needs ProposalStatus type
├── constants.ts       🆕 Add for ProposalStatus enum
├── queries.ts         🔄 Move from proposalQueries.ts
├── mutations.ts       🔄 Consolidate from 3 files
├── rules.ts           🔄 Consolidate from 4 files
├── index.ts           ✅ Already correct structure
├── README.md          ✅ Already present
└── proposals.test.ts  🔄 Rename and consolidate tests
```

---

## Phase 1: Prepare Constants and Schema

### Step 1.1: Create `constants.ts`

**Action**: Create new file with `ProposalStatus` constant and derived type

**File**: `convex/core/proposals/constants.ts`

```typescript
/**
 * Proposal domain constants
 */

export const PROPOSAL_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_MEETING: 'in_meeting',
  OBJECTIONS: 'objections',
  INTEGRATED: 'integrated',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[keyof typeof PROPOSAL_STATUSES];

// State machine constants
export const TERMINAL_STATUSES: ProposalStatus[] = [
  PROPOSAL_STATUSES.APPROVED,
  PROPOSAL_STATUSES.REJECTED,
  PROPOSAL_STATUSES.WITHDRAWN,
];
```

**Rationale**: `ProposalStatus` is used at runtime (state machine, validation), so it belongs in `constants.ts` per architecture guidance (lines 894-936).

---

### Step 1.2: Update `schema.ts`

**Action**: Re-export `ProposalStatus` from constants, keep existing type aliases

**File**: `convex/core/proposals/schema.ts`

```typescript
import type { Doc } from '../../_generated/dataModel';

// Re-export types from constants.ts (single source of truth)
export type { ProposalStatus } from './constants';

// Type aliases
export type CircleProposalDoc = Doc<'circleProposals'>;
export type ProposalEvolutionDoc = Doc<'proposalEvolutions'>;
export type ProposalAttachmentDoc = Doc<'proposalAttachments'>;
export type ProposalObjectionDoc = Doc<'proposalObjections'>;
```

**Rationale**: `schema.ts` should re-export from `constants.ts` per architecture pattern (line 935).

---

### Step 1.3: Update `stateMachine.ts` to use constants

**Action**: Import `ProposalStatus` and constants from `constants.ts` instead of defining locally

**File**: `convex/core/proposals/stateMachine.ts`

**Changes**:
- Remove local `ProposalStatus` type definition
- Import from `./constants`
- Update `PROPOSAL_STATUSES` to use `PROPOSAL_STATUSES` from constants
- Update `TERMINAL_STATUSES` to use `TERMINAL_STATUSES` from constants

**Rationale**: Single source of truth for status values.

---

### Step 1.4: Delete `proposalTypes.ts`

**Action**: Delete file after migrating type to `constants.ts`

**Rationale**: No longer needed - type is in `constants.ts`, exported via `schema.ts`.

---

## Phase 2: Consolidate Queries

### Step 2.1: Move queries from `proposalQueries.ts` to `queries.ts`

**Action**: Copy all query implementations to `queries.ts`, update imports

**File**: `convex/core/proposals/queries.ts`

**Current State**: Just re-exports `proposalService.ts`

**Target State**: Contains all query implementations:
- `list` - List proposals with filters
- `get` - Get single proposal
- `getByAgendaItem` - Get proposal by agenda item
- `listByCircle` - List proposals for a circle
- `myListDrafts` - List current user's drafts
- `listForMeetingImport` - List proposals available for meeting import

**Changes**:
1. Copy all query functions from `proposalQueries.ts`
2. Update imports to use relative paths
3. Ensure all helper functions are imported correctly
4. Remove re-export of `proposalService`

**Rationale**: `queries.ts` should contain actual query implementations, not re-exports (architecture line 209).

---

### Step 2.2: Update `index.ts` if needed

**Action**: Verify `index.ts` exports from `queries.ts` correctly

**File**: `convex/core/proposals/index.ts`

**Current**: Already exports from `queries.ts` ✅

**No changes needed** - structure is correct.

---

### Step 2.3: Delete `proposalQueries.ts`

**Action**: Delete file after confirming all queries moved

**Rationale**: Queries now live in `queries.ts` per architecture.

---

## Phase 3: Consolidate Mutations

### Step 3.1: Move mutations from `proposalDrafts.ts` to `mutations.ts`

**Action**: Copy mutation exports to `mutations.ts`

**Mutations to move**:
- `create` - Create new proposal
- `addEvolution` - Add evolution to proposal
- `removeEvolution` - Remove evolution from proposal
- `withdraw` - Withdraw proposal
- `createFromDiff` - Create proposal from diff

**File**: `convex/core/proposals/mutations.ts`

**Current State**: Re-exports from `queries.ts` (wrong!)

**Target State**: Contains all mutation implementations

**Changes**:
1. Remove incorrect re-export from `queries.ts`
2. Copy mutation implementations from `proposalDrafts.ts`
3. Copy helper functions (e.g., `createProposalMutation`, `addProposalEvolutionMutation`)
4. Update imports

**Rationale**: Mutations should not be exported through queries (architecture line 210).

---

### Step 3.2: Move mutations from `proposalMeetings.ts` to `mutations.ts`

**Action**: Append meeting-related mutations to `mutations.ts`

**Mutations to move**:
- `submit` - Submit proposal to meeting
- `importToMeeting` - Import proposals to meeting
- `startProcessing` - Start processing proposal in meeting

**Changes**:
1. Copy mutation implementations
2. Copy helper functions (e.g., `submitProposalMutation`)
3. Ensure no naming conflicts
4. Update imports

---

### Step 3.3: Move mutations from `proposalDecision.ts` to `mutations.ts`

**Action**: Append decision mutations to `mutations.ts`

**Mutations to move**:
- `approve` - Approve proposal
- `reject` - Reject proposal

**Changes**:
1. Copy mutation implementations
2. Copy helper functions (e.g., `approveProposalMutation`, `rejectProposalMutation`)
3. Ensure no naming conflicts
4. Update imports

---

### Step 3.4: Extract helpers if `mutations.ts` exceeds 300 lines

**Action**: If file is too long, extract helper functions to internal helper file

**Pattern**: Follow `circles` domain pattern
- Create `proposalMutationsHelpers.ts` (internal, not exported)
- Keep mutation exports in `mutations.ts`
- Import helpers internally

**Rationale**: Architecture allows helper extraction for readability (line 32), but main file should remain primary implementation.

---

### Step 3.5: Delete mutation source files

**Action**: Delete after confirming all mutations moved:
- `proposalDrafts.ts`
- `proposalMeetings.ts`
- `proposalDecision.ts`

**Rationale**: Mutations now consolidated in `mutations.ts`.

---

## Phase 4: Consolidate Business Rules

### Step 4.1: Move state machine logic to `rules.ts`

**Action**: Copy state machine functions to `rules.ts`

**Functions to move from `stateMachine.ts`**:
- `isProposalStatus` - Type guard
- `isTerminalState` - Check if terminal state
- `canTransition` - Check if transition is valid
- `assertTransition` - Assert valid transition

**File**: `convex/core/proposals/rules.ts`

**Current State**: Re-exports `stateMachine` and `validation`, plus `requireProposal`

**Target State**: Contains all business rules

**Changes**:
1. Copy state machine functions
2. Import `ProposalStatus` and constants from `./constants`
3. Keep `VALID_TRANSITIONS` constant (or move to `constants.ts` if used elsewhere)
4. Remove re-export of `stateMachine`

**Rationale**: Business rules belong in `rules.ts` (architecture line 211).

---

### Step 4.2: Move validation logic to `rules.ts`

**Action**: Copy validation functions to `rules.ts`

**Functions to move from `validation.ts`**:
- `assertHasEvolutions` - Assert proposal has evolutions
- `assertNotTerminal` - Assert proposal not in terminal state

**Changes**:
1. Copy validation functions
2. Update imports
3. Remove re-export of `validation`

---

### Step 4.3: Move access control logic to `rules.ts`

**Action**: Copy access control functions to `rules.ts`

**Functions to move from `proposalAccess.ts`**:
- `ensureWorkspaceMembership` - Ensure person is workspace member
- `ensureUniqueCircleSlug` - Ensure circle slug is unique
- `getNextAgendaOrder` - Get next agenda item order

**Changes**:
1. Copy access control functions
2. Update imports
3. Consider if these are "rules" or "helpers" - if helpers, keep internal

**Note**: Access control functions might be better as internal helpers rather than exported rules. Evaluate based on usage.

---

### Step 4.4: Keep `requireProposal` in `rules.ts`

**Action**: Keep existing `requireProposal` function

**Rationale**: This is a business rule helper, belongs in `rules.ts`.

---

### Step 4.5: Extract helpers if `rules.ts` exceeds 300 lines

**Action**: If file is too long, extract helper functions to internal helper file

**Pattern**: Create `proposalRulesHelpers.ts` (internal, not exported)

**Rationale**: Maintain readability while keeping main file as primary.

---

### Step 4.6: Delete rule source files

**Action**: Delete after confirming all rules moved:
- `stateMachine.ts` (keep `stateMachine.test.ts` for now, will consolidate)
- `validation.ts`
- `proposalAccess.ts` (if all functions moved)

**Rationale**: Rules now consolidated in `rules.ts`.

---

## Phase 5: Fix Export Chain

### Step 5.1: Delete `proposalService.ts`

**Action**: Delete unnecessary re-export aggregator

**Rationale**: Creates unnecessary layer. `queries.ts` and `mutations.ts` should export directly.

---

### Step 5.2: Verify `index.ts` exports

**Action**: Ensure `index.ts` exports correctly

**File**: `convex/core/proposals/index.ts`

**Current**:
```typescript
export * from './schema';
export * from './queries';
export * from './mutations';
export * from './rules';
```

**Target**: Same structure ✅

**Rationale**: `index.ts` should export from main files directly (architecture line 212).

---

## Phase 6: Consolidate Tests

### Step 6.1: Rename `queries.test.ts` to `proposals.test.ts`

**Action**: Rename test file

**Rationale**: Co-located tests should be `{domain}.test.ts` (architecture line 214).

---

### Step 6.2: Move state machine tests to `proposals.test.ts`

**Action**: Copy tests from `stateMachine.test.ts` to `proposals.test.ts`

**Changes**:
1. Copy test cases
2. Update imports
3. Organize tests by category (queries, mutations, rules, state machine)

---

### Step 6.3: Delete `stateMachine.test.ts`

**Action**: Delete after confirming tests moved

**Rationale**: All domain tests should be in `proposals.test.ts`.

---

## Phase 7: Update Imports Across Codebase

### Step 7.1: Find all imports of proposal files

**Action**: Search for imports of deleted/moved files

**Files to search for**:
- `proposalQueries.ts`
- `proposalDrafts.ts`
- `proposalMeetings.ts`
- `proposalDecision.ts`
- `proposalService.ts`
- `proposalTypes.ts`
- `stateMachine.ts`
- `validation.ts`
- `proposalAccess.ts`

**Command**:
```bash
grep -r "from.*proposal" --include="*.ts" --include="*.svelte" .
```

---

### Step 7.2: Update imports

**Action**: Update all imports to use new structure

**Import Changes**:
- `proposalTypes` → `schema` or `constants`
- `proposalQueries` → `queries`
- `proposalDrafts`, `proposalMeetings`, `proposalDecision` → `mutations`
- `stateMachine`, `validation`, `proposalAccess` → `rules`
- `proposalService` → Remove (use direct imports)

---

### Step 7.3: Verify no broken imports

**Action**: Run type check and tests

**Commands**:
```bash
npm run check
npm run test:unit:server -- proposals
```

---

## Phase 8: Update Documentation

### Step 8.1: Update `README.md`

**Action**: Update file list in README to reflect new structure

**File**: `convex/core/proposals/README.md`

**Update**: Files section to match new structure:
- `tables.ts` - Table definitions
- `schema.ts` - Types and aliases
- `constants.ts` - Runtime constants
- `queries.ts` - Read operations
- `mutations.ts` - Write operations
- `rules.ts` - Business rules
- `index.ts` - Public exports
- `proposals.test.ts` - Co-located tests

---

## Verification Checklist

After completing all phases:

- [ ] `constants.ts` exists with `ProposalStatus`
- [ ] `schema.ts` re-exports from `constants.ts`
- [ ] `queries.ts` contains all query implementations (not re-exports)
- [ ] `mutations.ts` contains all mutation implementations (not re-exports)
- [ ] `rules.ts` contains all business rules (not just re-exports)
- [ ] `index.ts` exports from main files directly
- [ ] `proposals.test.ts` exists (renamed from `queries.test.ts`)
- [ ] All deleted files removed:
  - [ ] `proposalTypes.ts`
  - [ ] `proposalQueries.ts`
  - [ ] `proposalDrafts.ts`
  - [ ] `proposalMeetings.ts`
  - [ ] `proposalDecision.ts`
  - [ ] `proposalService.ts`
  - [ ] `stateMachine.ts`
  - [ ] `validation.ts`
  - [ ] `proposalAccess.ts` (if all functions moved)
  - [ ] `queries.test.ts` (renamed)
  - [ ] `stateMachine.test.ts` (consolidated)
- [ ] All imports updated across codebase
- [ ] `npm run check` passes
- [ ] `npm run test:unit:server -- proposals` passes
- [ ] `README.md` updated

---

## Risk Mitigation

### Potential Issues

1. **Circular imports**: Ensure `mutations.ts` doesn't import from `queries.ts` unnecessarily
2. **Large files**: If `mutations.ts` or `rules.ts` exceed 300 lines, extract helpers
3. **Breaking changes**: Update all imports before deleting files
4. **Test failures**: Run tests after each phase

### Rollback Plan

If issues arise:
1. Keep old files until verification complete
2. Use git branches for each phase
3. Test incrementally after each phase

---

## Estimated Effort

- **Phase 1** (Constants/Schema): 30 minutes
- **Phase 2** (Queries): 1 hour
- **Phase 3** (Mutations): 2 hours
- **Phase 4** (Rules): 1.5 hours
- **Phase 5** (Exports): 15 minutes
- **Phase 6** (Tests): 30 minutes
- **Phase 7** (Imports): 1 hour
- **Phase 8** (Docs): 15 minutes

**Total**: ~7 hours

---

## Success Criteria

✅ Domain structure matches architecture.md patterns  
✅ All mutations in `mutations.ts`  
✅ All queries in `queries.ts`  
✅ All rules in `rules.ts`  
✅ Clean export chain (no circular dependencies)  
✅ Tests pass  
✅ Type check passes  
✅ No broken imports

