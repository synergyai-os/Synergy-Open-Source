# SynergyOS Architecture

**Single Source of Truth** for all architectural principles, coding standards, and design decisions.

**Version**: 3.0  
**Last Updated**: 2025-12-12  
**Optimization Target**: AI-native development with domain cohesion

---

## Quick Reference

### The 25 Principles

| # | Principle | Enforcement |
|---|-----------|-------------|
| **Foundation** |||
| 1 | Core domains are foundational and complete (tables + queries + mutations + rules) | Directory structure |
| 2 | Core domains: users, people, circles, roles, assignments, proposals, policies, authority, history, workspaces | Code review |
| 3 | Circle Lead authority implemented at core level | Tests |
| 4 | Authority is calculated from roles, never stored on users | Tests |
| **Dependencies** |||
| 5 | `infrastructure/ ← core/ ← features/` — never reversed | Imports |
| 6 | Domains communicate through explicit interfaces (`index.ts` exports) | Code review |
| 7 | No circular dependencies between domains | Linting |
| **Convex Patterns** |||
| 8 | Queries are pure reads with reactive subscriptions | Code review |
| 9 | Mutations validate authorization BEFORE writing | Tests |
| 10 | All business logic lives in Convex, not Svelte | Code review |
| 11 | Zero classes anywhere — functions only | Linting |
| **Svelte Patterns** |||
| 12 | Components are thin and presentational | Code review |
| 13 | Components delegate to Convex for all logic | Code review |
| 14 | Svelte 5 runes used correctly ($state, $derived, $effect) | Code review |
| **Domain Language** |||
| 15 | Use practitioner terminology: circles, roles, tensions, proposals, consent | Code review |
| 16 | Function and variable names match domain language | Code review |
| **Code Quality** |||
| 17 | Pure functions preferred where possible | Code review |
| 18 | Functions do one thing at appropriate abstraction level | Code review |
| 19 | Duplication tolerated twice, refactored on third | Boy Scout Rule |
| 20 | No hardcoded magic values — use constants or config | Linting |
| **Testing** |||
| 21 | Unit tests co-located: `{domain}.test.ts` next to source | Directory structure |
| 22 | Integration tests in `/tests/integration/` | Directory structure |
| 23 | Tests are independent — no test imports from another test | Code review |
| 24 | Core domains have full test coverage | CI gate |
| **Immutability** |||
| 25 | Organizational history is immutable and auditable | Schema design |

### Code Hygiene

| # | Principle | Enforcement |
|---|-----------|-------------|
| 26 | Query/mutation handlers ≤ 20 lines | Code review |
| 27 | Validation logic extracted to `rules.ts` | Code review |
| 28 | Repeated patterns (3x+) extracted to helpers | Code review |
| 29 | No inline type casts (`as unknown as`) — use type helpers | Linting |
| 30 | Auth/access via composed helpers (e.g., `withCircleAccess`) | Code review |
| 31 | Archive queries via a helper (e.g., `queryActive`), not branching | Code review |
| 32 | Domain files ≤ 300 lines; split if larger | CI gate |
| 33 | Error format consistent: `ERR_CODE: message` | Code review |

### AI Development Rules (No Judgment Calls)

| Task | Location |
|------|----------|
| Add circle query | `/convex/core/circles/queries.ts` |
| Add circle mutation | `/convex/core/circles/mutations.ts` |
| Add circle business rule | `/convex/core/circles/rules.ts` |
| Add circle table definition | `/convex/core/circles/tables.ts` |
| Add circle types/aliases | `/convex/core/circles/schema.ts` |
| Add circle test | `/convex/core/circles/circles.test.ts` |
| Add meeting feature | `/convex/features/meetings/` |
| Add auth infrastructure | `/convex/infrastructure/auth/` |
| Working on circles | **Only look in `/convex/core/circles/`** |

### Terminology (Always Use)

| ✅ Correct | ❌ Never Use |
|-----------|-------------|
| Circle | Team |
| Role | Job, Position |
| Proposal | Ticket, Request |
| Tension | Issue, Problem |
| Consent | Approval, Sign-off |
| Circle Lead | Manager, Boss |
| Person | Member, User (in workspace context) |
| Authority | Permission |
| Workspace | Organization |

### Convex Auth Quick Reference

| Task | Rule |
|------|------|
| Add/modify public endpoint | Require `sessionId` in args; derive actor via `validateSessionAndGetUserId(ctx, sessionId)` before any DB access |
| Target user parameter | Use whitelisted identifiers only: `memberUserId`, `assigneeUserId`, `targetUserId`, `inviteeUserId`, `ownerUserId`, `candidateUserId` |

### Document Selection for AI

| Task | Read First |
|------|------------|
| Backend logic, domain code, structure | This document (architecture.md) |
| UI component, styling, tokens | design-system.md |
| Permission/access control logic | rbac/rbac-architecture.md |
| Invariant definitions | convex/admin/invariants/INVARIANTS.md |

---

## Core Philosophy: CORE

**C - Consent-Based Architecture**  
Every significant organizational change flows through consent processes. The system enforces consent at the code level — it cannot be bypassed. Proposals are first-class domain objects.

**O - Organizational Truth**  
Single source of truth for organizational structure. Circles, roles, and authorities are never duplicated or inconsistent. All views (org charts, authority maps) derive from canonical structure.

**R - Role-Based Authority**  
Authority comes from roles, not people or hierarchy. The system calculates permissions based on roles filled. Authority is computed, explicit, and auditable — never implicit or stored.

**E - Evolvable Governance**  
Governance structure is mutable through the system's own processes. You can change decision-making, circle organization, and roles — through consent. The system is self-hosting: it governs its own evolution.

---

## Architecture Layers

### Three-Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│  Application Layer (Svelte routes, UI)                      │
│  /src/routes/, /src/lib/components/                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────────┐
│  Features Layer                                             │
│  /convex/features/ (meetings, tensions, projects, inbox)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────────┐
│  Core Layer                                                 │
│  /convex/core/ (circles, roles, authority, proposals...)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────────┐
│  Infrastructure Layer                                       │
│  /convex/infrastructure/ (auth, events, rbac)               │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rules

| Layer | Can Import From | Cannot Import From |
|-------|-----------------|-------------------|
| Infrastructure | Nothing | Core, Features, Application |
| Core | Infrastructure | Features, Application |
| Features | Core, Infrastructure | Application, other Features* |
| Application | Features, Core, Infrastructure | — |

*Features should not depend on each other unless explicitly designed as dependencies.

### Directory Structure

```
/convex/
├── core/                           # Foundational domains (10 total)
│   ├── circles/
│   │   ├── tables.ts               # Table definitions (REQUIRED)
│   │   ├── schema.ts               # Types/aliases (OPTIONAL)
│   │   ├── queries.ts              # Read operations
│   │   ├── mutations.ts            # Write operations
│   │   ├── rules.ts                # Business rules (pure + contextual)
│   │   ├── index.ts                # Public exports only
│   │   ├── README.md               # AI-friendly documentation
│   │   └── circles.test.ts         # Co-located tests
│   ├── roles/
│   ├── people/
│   ├── users/
│   ├── assignments/
│   ├── proposals/
│   ├── policies/
│   ├── authority/
│   ├── history/
│   └── workspaces/
│
├── features/                       # Application features (compose core)
│   ├── meetings/
│   ├── inbox/
│   ├── projects/
│   ├── tasks/
│   └── ...
│
├── infrastructure/                 # Cross-cutting concerns
│   ├── auth/
│   ├── rbac/
│   └── events/
│
├── admin/                          # Operational tooling
│   ├── invariants/                 # Data integrity checks
│   └── migrations/
│
└── schema.ts                       # Main schema registration

/src/
├── lib/
│   ├── components/
│   │   ├── atoms/                  # Single elements (Button, Badge)
│   │   ├── molecules/              # Combined atoms (FormField)
│   │   └── organisms/              # Complex sections (Dialog)
│   ├── modules/[module]/
│   │   ├── components/             # Feature-specific components
│   │   └── composables/            # Feature-specific logic
│   └── composables/                # Shared UI logic (.svelte.ts)
└── routes/                         # SvelteKit routes (thin)

/tests/
└── integration/                    # Cross-domain workflow tests

/e2e/                               # End-to-end tests
```

---

## Core Domains (10 Total)

These domains form the kernel — the minimum viable organizational truth.

### Domain Status Classifications

| Status | Meaning | Change Process |
|--------|---------|----------------|
| **FROZEN** | Organizational truth — foundational, rarely changes | RFC ticket + 1 week cooling + migration plan |
| **STABLE** | Supporting infrastructure — can evolve carefully | Document reasoning in ticket, careful implementation |

### The 10 Core Domains

| Domain | Status | Purpose | Key Identifier |
|--------|--------|---------|----------------|
| **users** | FROZEN | Global auth identity | `userId` |
| **people** | FROZEN | Workspace-scoped org identity | `personId` |
| **circles** | FROZEN | Organizational units | `circleId` |
| **roles** | FROZEN | Authority distribution units | `roleId` |
| **assignments** | FROZEN | Person filling role in circle | `personId` + `roleId` + `circleId` |
| **authority** | FROZEN | Permission calculation | Input: `personId` + `circleId` |
| **history** | FROZEN | Immutable audit log | `changedByPersonId` |
| **workspaces** | STABLE | Multi-tenant container | `workspaceId` |
| **proposals** | STABLE | Change mechanism | `createdByPersonId` |
| **policies** | STABLE | Circle-level rules | `circleId` |

### Why FROZEN vs STABLE?

**FROZEN domains (7)** — Organizational truth:
- **users + people**: Identity chain (`sessionId → userId → personId`) is foundational
- **circles + roles + assignments**: Organizational structure — the nouns of the system
- **authority**: The USP calculation layer — what makes SynergyOS different
- **history**: Immutable by definition — you can't change history without destroying trust

**STABLE domains (3)** — Can evolve:
- **workspaces**: Infrastructure (tenant separation), needs room for billing, enterprise features
- **proposals + policies**: Governance mechanism — *how* we implement may evolve

### What's NOT Core

| Current Location | Target | Tracking |
|------------------|--------|----------|
| `core/circleItems/` | `features/customFields/` | SYOS-790 |

**circleItems** is workspace-level customization (custom fields on entities), not organizational truth. Migration pending.

---

## Identity Architecture

### The Three-Layer Identity Chain

SynergyOS uses a deliberate three-layer identity model for security and workspace isolation:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          IDENTITY CHAIN                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   sessionId ──────► userId ──────► personId ──────► workspaceId     │
│       │                │                │                │          │
│       │                │                │                └── "Which org?"
│       │                │                │                            │
│       │                │                └── "Who in THIS workspace?" │
│       │                │                                             │
│       │                └── "Which human logged in?"                  │
│       │                                                              │
│       └── "Which browser session?"                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Identity Layer Definitions

| Layer | Identifier | Scope | Purpose |
|-------|------------|-------|---------|
| **Session** | `sessionId` | Browser/device | Current login session, rotates on logout |
| **User** | `userId` | Global (1 per human) | Authentication identity, stored in `users` table |
| **Person** | `personId` | Per workspace | Organizational identity, stored in `people` table |

### The Rule

- **`userId`** = auth/login identity (global, exactly 1 per human)
- **`personId`** = organizational identity (scoped, 1 per workspace per user)
- **All workspace operations use `personId`, not `userId`**

### Two Separate Domains

| Domain | Folder | Table | Purpose |
|--------|--------|-------|---------|
| **users** | `core/users/` | `users` | Global auth identity |
| **people** | `core/people/` | `people` | Workspace-scoped org identity |

These are **two distinct domains** with different tables and purposes. Do not confuse them.

### Security & Privacy Rationale

**Why this design?**

| Concern | Solution |
|---------|----------|
| **Workspace isolation** | Using `personId` ensures all workspace data references local identities only |
| **Cross-workspace correlation** | Requires explicit join through `people.userId` — a deliberate act, not an accident |
| **Audit trail integrity** | All `changedByPersonId`, `createdByPersonId` fields reference the workspace-scoped identity |
| **Data portability** | Workspaces can be exported without exposing global user data |
| **Multi-workspace users** | Same human has separate `personId` per workspace — data stays isolated |

**The invariant (XDOM-01):** No `userId` references in core domain tables (except `users`, `people`, `workspaceMembers`). All `createdBy`/`updatedBy` audit fields use `personId`.

### Identity Resolution Flow

```typescript
// 1. Session → User (auth layer)
const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

// 2. User → Person (workspace layer)  
const person = await getPersonByUserAndWorkspace(ctx, userId, workspaceId);
const personId = person._id;

// 3. All workspace operations use personId
await ctx.db.patch(circleId, { 
  updatedByPersonId: personId,  // ✅ Correct
  // updatedByUserId: userId    // ❌ Never do this
});
```

### Identity Helper Functions

| Function | Returns | Use When |
|----------|---------|----------|
| `getPersonById(ctx, personId)` | Person (throws if not found) | You have a personId |
| `getPersonByUserAndWorkspace(ctx, userId, workspaceId)` | Person (throws if not found) | Resolving user to person |
| `findPersonByUserAndWorkspace(ctx, userId, workspaceId)` | Person \| null | Checking if person exists |
| `getMyPerson(ctx, sessionId, workspaceId)` | Person (throws if not found) | Getting current user's person |
| `validateSessionAndGetUserId(ctx, sessionId)` | `{ userId, session }` | Auth validation |

---

## Authority Architecture

### Core Responsibility: Organizational Truth

Core provides factual answers about organizational state:

```typescript
// Core answers these questions:
hasRole(person, circle, 'Facilitator')     // → true/false
isCircleLead(person, circle)               // → true/false
isCircleMember(person, circle)             // → true/false
getCircleType(circle)                      // → 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid'
calculateAuthority(person, circle)         // → Authority object
```

### Authority Calculation

```typescript
calculateAuthority(personId, circleId) → Authority {
  canApproveProposals: boolean;
  canAssignRoles: boolean;
  canModifyCircleStructure: boolean;
  canFacilitate: boolean;
  canRaiseObjections: boolean;
  // ... based on role + circle type
}
```

### Core Owns Foundational Permissions

| Permission | Why It's Core |
|------------|---------------|
| canApproveProposals | Defines governance process |
| canAssignRoles | Defines authority distribution |
| canModifyCircleStructure | Defines org evolution |
| canRaiseObjections | Defines consent process |

### Features Compose Core Primitives

Features build domain-specific permissions from core:

| Feature | Action | Composed From |
|---------|--------|---------------|
| Meetings | canFacilitate | `isCircleLead OR hasRole('Facilitator')` |
| Projects | canAssignTask | `isCircleMember AND (isTaskOwner OR isCircleLead)` |
| Tensions | canProcessTension | `isCircleMember` |

---

## Authority vs Access Control (RBAC)

SynergyOS has two complementary systems that are intentionally separate:

### The Two Systems

| System | What It Controls | Who Manages It | How It Changes |
|--------|------------------|----------------|----------------|
| **Organizational Authority** | *What work you do* — accountabilities, domains, decision rights within circles | Circle Leads, org designers via proposals | Frequently, through consent process |
| **Access Control (RBAC)** | *What system features you can access* — billing, workspace settings, invite users, delete data | Workspace admins | Rarely, requires explicit admin action |

### Why Both Are Needed

**Organizational roles** define *domain authority*:
- "Dev Lead can approve technical decisions in this circle"
- "Facilitator can run governance meetings"
- These are *organizational accountabilities* — what you're responsible for

**RBAC** defines *system capabilities*:
- "Admin can change billing settings"
- "Member can view workspace content"
- "Guest can only see specific resources they're invited to"
- These are *application features* — what buttons you can click

### Critical Security Boundary

A user-created "Finance Lead" organizational role does NOT automatically get billing access. That would be a security hole.

The *workspace admin* (RBAC role) decides who can access system features, regardless of their organizational role.

### Key Principle

> Organizational roles define *domain authority* (what you're accountable for).
> RBAC defines *system capabilities* (what features you can use).
> They are intentionally separate to maintain security boundaries.

For RBAC implementation details, see `rbac/rbac-architecture.md`.

### Authorization Check Flow

1. **Get authenticated user** — If missing → throw `AUTH_REQUIRED`
2. **Check RBAC capability** (system-level) — If false → throw `AUTHZ_INSUFFICIENT_RBAC`
3. **Check Authority** (domain-level) — If false → throw domain-specific error
4. **Both must pass** — order matters for clarity

---

## File Structure Patterns

### Domain File Structure

Each core domain follows this structure:

```
domain/
├── tables.ts       # REQUIRED - Table definitions for convex/schema.ts
├── schema.ts       # OPTIONAL - Types, aliases, re-exports
├── queries.ts      # Read operations
├── mutations.ts    # Write operations
├── rules.ts        # Business rules (pure + contextual)
├── index.ts        # Public exports only
├── README.md       # AI-friendly documentation
└── domain.test.ts  # Co-located tests
```

### tables.ts vs schema.ts

| File | Purpose | Required | Contents |
|------|---------|----------|----------|
| `tables.ts` | Table definitions | **REQUIRED** | `defineTable()` calls, indexes |
| `schema.ts` | Types and aliases | OPTIONAL | Type exports, re-exports from tables.ts |

**Example tables.ts:**
```typescript
export const circlesTable = defineTable({
  workspaceId: v.id('workspaces'),
  name: v.string(),
  parentCircleId: v.optional(v.id('circles')),
  circleType: v.optional(v.union(...)),
  // ...
}).index('by_workspace', ['workspaceId']);
```

**Example schema.ts:**
```typescript
import type { Doc } from '../../_generated/dataModel';
export type CircleDoc = Doc<'circles'>;
export type CircleType = 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid';
```

### Schema Registration

The main `convex/schema.ts` imports tables directly from domain `tables.ts` files:

```typescript
import { circlesTable } from './core/circles/tables';
import { peopleTable } from './core/people/tables';
// ...

export default defineSchema({
  circles: circlesTable,
  people: peopleTable,
  // ...
});
```

---

## Code Standards

### Function Types (In Order of Preference)

| Type | When to Use | Example |
|------|-------------|---------|
| **Pure Functions** | Calculations, transformations | `calculateAuthority(roles)` |
| **Convex Queries** | Reads with reactivity | `getCircleById(ctx, id)` |
| **Convex Mutations** | Writes with validation | `createProposal(ctx, data)` |
| **Rule Functions** | Business logic (pure or contextual) | `canApproveProposal(ctx, person, circle)` |
| **Helper Functions** | Small reusable utilities | `formatCircleName(name)` |
| **Component Functions** | UI logic only | `toggleDropdown()` |

### Function Prefixes

| Prefix | Returns | Use When |
|--------|---------|----------|
| `get___` | `T` (throws if missing) | Lookup that must succeed |
| `find___` | `T \| null` | Lookup that may return nothing |
| `list___` | `T[]` (non-null) | Return a collection |
| `is___` / `has___` / `can___` | `boolean` | State/existence/permission checks |
| `create___` | `Id` | Create entity, return ID |
| `update___` | `void` or `T` | Modify existing entity |
| `archive___` / `restore___` | `void` | Soft delete / un-archive |
| `require___` | `T` (throws if invalid) | Fetch-or-throw validation |
| `ensure___` | `void` (throws if invalid) | Validate condition |
| `validate___` | `void` or `T` | Validation helpers |

### Handler Pattern (Thin Orchestration)

Keep handlers as orchestration only. Target ≤20 lines.

```typescript
export const approve = mutation({
  args: { sessionId: v.string(), proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    const person = await requirePersonForUser(ctx, userId, workspaceId);
    const proposal = await requireProposal(ctx, args.proposalId);

    assertCanApprove(person, proposal);
    validateProposalState(proposal, "pending");

    const updated = await transitionProposal(ctx, proposal, "approved", person._id);
    await emitProposalApproved(ctx, updated);

    return updated._id;
  },
});
```

### Convex Auth Pattern (Public Endpoints)

- **Session requirement**: Accept `sessionId` in args and immediately derive the actor with `validateSessionAndGetUserId(ctx, sessionId)` before any DB access
- **Blocked patterns**: Do not accept `userId` in public args. Do not use legacy helpers
- **Target identifier whitelist** (when another user is the *target* of the action):
  - `memberUserId`: circle/workspace membership operations
  - `assigneeUserId`: task/proposal assignment targets
  - `targetUserId`: general "target this other user" lookups
  - `inviteeUserId`: invitation flows
  - `ownerUserId`: record/workspace ownership fields
  - `candidateUserId`: recruiting or pipeline candidates

### Actor vs Target Pattern

| Concept | Source | Variable Name |
|---------|--------|---------------|
| **Actor** (who is doing the action) | Derived from `sessionId` | `actorUserId` or `userId` inside handler |
| **Target** (who the action is about) | Passed in args | Use whitelisted name |

```typescript
export const getUserRoles = query({
  args: {
    sessionId: v.string(),           // Actor identified via session
    targetUserId: v.id('users'),     // Target user to look up
  },
  handler: async (ctx, args) => {
    const { userId: actorUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    const roles = await getRolesForUser(ctx, args.targetUserId);
    return roles;
  }
});
```

---

## Soft Delete Pattern

Entities use soft delete via `archivedAt` timestamp, not status change.

| Field | Purpose |
|-------|---------|
| `archivedAt` | Timestamp when deleted (null = active) |
| `archivedByPersonId` | Who deleted it |
| `status` | Lifecycle state (`draft`, `active`) — NOT deletion |

**Invariants:**
- If `archivedByPersonId` is set, `archivedAt` must also be set
- Archived entities are never hard-deleted (XDOM-04)

---

## Proposal State Machine

**Source of truth:** `convex/core/proposals/stateMachine.ts`

### States

| State | Description |
|-------|-------------|
| `draft` | Proposal being written, not yet submitted |
| `submitted` | Submitted to a meeting, awaiting processing |
| `in_meeting` | Being actively discussed in a meeting |
| `objections` | Objections raised, needs integration |
| `integrated` | Objections addressed, ready for final decision |
| `approved` | **Terminal** — Proposal accepted |
| `rejected` | **Terminal** — Proposal declined |
| `withdrawn` | **Terminal** — Proposer withdrew |

### Valid Transitions

```typescript
const VALID_TRANSITIONS = {
  draft: ['submitted', 'withdrawn'],
  submitted: ['in_meeting', 'withdrawn'],
  in_meeting: ['objections', 'integrated', 'approved', 'rejected', 'withdrawn'],
  objections: ['integrated', 'rejected', 'withdrawn'],
  integrated: ['approved', 'rejected', 'withdrawn'],
  approved: [],   // terminal
  rejected: [],   // terminal
  withdrawn: []   // terminal
};
```

---

## Legacy Migration Status

### Active Migrations

| Legacy Table | Replacement | Status | Tracking |
|--------------|-------------|--------|----------|
| `userCircleRoles` | `assignments` | Migration in progress | SYOS-809 |
| `workspaceMembers` | `people` | Still actively used | Needs evaluation |
| `workspaceInvites` | TBD | Still actively used | Needs evaluation |

### Code Markers

Legacy tables are marked in `convex/schema.ts`:

```typescript
// legacy - replaced by `assignments` table (SYOS-809)
userCircleRoles: userCircleRolesTable,
```

### Invariants

During migration, both old and new invariants are checked:
- `ASSIGN-*` — New assignments table invariants
- `UCROLE-*` — Legacy userCircleRoles invariants (retire after migration)

---

## Core Invariants

**Source of truth:** `convex/admin/invariants/INVARIANTS.md`

### What Are Invariants?

Explicit, testable statements about what must be true for CORE to be sound. They define the minimum viable organizational truth.

### Summary by Domain

| Domain | Invariants | Critical Count |
|--------|------------|----------------|
| Identity Chain (IDENT-*) | 9 | 7 |
| Organizational Structure (ORG-*) | 9 | 8 |
| Circle Membership (CMEM-*) | 4 | 3 |
| Role Definitions (ROLE-*) | 6 | 4 |
| Assignments (ASSIGN-*) | 6 | 5 |
| Legacy Assignments (UCROLE-*) | 4 | 3 |
| Authority (AUTH-*) | 4 | 4 |
| Proposals (PROP-*) | 6 | 5 |
| History (HIST-*) | 4 | 1 |
| Workspaces (WS-*) | 5 | 4 |
| Cross-Domain (XDOM-*) | 5 | 3 |
| **Total** | **62** | **47 critical** |

### Running Invariant Checks

```bash
# Run all invariant checks
npx convex run admin/invariants:runAllChecks

# Run specific category
npx convex run admin/invariants/identity:check
npx convex run admin/invariants/organization:check
npx convex run admin/invariants/authority:check
```

### Severity Levels

| Severity | Meaning |
|----------|---------|
| **critical** | System cannot function correctly — blocks production use |
| **warning** | System works but has data quality issues — should fix before production |

---

## Error Codes

**Source of truth:** `convex/infrastructure/errors/codes.ts`

**Format:** `ERR_CODE: message`

**Core codes:**
- `AUTH_REQUIRED` — Authentication required
- `AUTH_INVALID_TOKEN` — Invalid session token
- `AUTHZ_NOT_CIRCLE_MEMBER` — Not a circle member
- `AUTHZ_NOT_CIRCLE_LEAD` — Not a Circle Lead
- `AUTHZ_INSUFFICIENT_RBAC` — Missing RBAC capability
- `PROPOSAL_INVALID_STATE` — Invalid proposal state transition
- `PROPOSAL_NOT_FOUND` — Proposal not found
- `VALIDATION_REQUIRED_FIELD` — Required field missing
- `VALIDATION_INVALID_FORMAT` — Invalid format

---

## Testing Strategy

### Testing Pyramid

```
          ╱╲
         ╱E2E╲           5-10 smoke tests
        ╱──────╲
       ╱  BDD   ╲        30-75 scenarios
      ╱──────────╲
     ╱Integration ╲      Cross-domain workflows
    ╱──────────────╲
   ╱   Unit Tests   ╲    Core domain logic
  ╱══════════════════╲
```

### Coverage Requirements

| Layer | Coverage | Rationale |
|-------|----------|-----------|
| Core domains | 100% | Foundation must be solid |
| Features | 80%+ | Key workflows covered |
| Infrastructure | 90%+ | Auth/events are critical |

### Required Test Cases Per Mutation

| Case | What to Assert |
|------|----------------|
| Success | Returns expected ID/data; DB state correct |
| Unauthorized (no auth) | Throws `AUTH_REQUIRED` |
| Unauthorized (wrong role) | Throws appropriate `AUTHZ_*` code |
| Invalid input | Throws `VALIDATION_*` code |
| Business rule violation | Throws domain-specific error |

---

## Common AI Mistakes

| Mistake | Why It Happens | Correct Approach |
|---------|----------------|------------------|
| Auth check after DB read | "Check if exists first" | Auth before any DB access |
| Creating new type instead of reusing | Doesn't search existing | Search `schema.ts` and domain types first |
| Putting validation in component | Quick client-side check | All validation in mutation handler |
| Using "team" in code/comments | Common industry term | Always use "circle" |
| Exporting internal helpers directly | Seems useful | Export only via `index.ts` contract |
| Feature importing another feature | Direct path works | Use core, events, or manifest |
| Passing `userId` in public args | "Caller already knows user" | Add `sessionId` arg, derive actor |
| Confusing `users` and `people` domains | Similar concepts | `users` = auth, `people` = workspace |

---

## Decision Records

### DR-001: Convex as Backend
**Status**: Accepted  
**Decision**: Use Convex instead of traditional REST API + database.
**Rationale**: Real-time sync eliminates manual state management.

### DR-002: Svelte 5 for Frontend
**Status**: Accepted  
**Decision**: Use Svelte 5 with runes system.
**Rationale**: Excellent reactivity, natural fit with Convex.

### DR-003: Functions Only, No Classes
**Status**: Accepted  
**Decision**: Zero classes in codebase — pure functions only.
**Rationale**: Functions compose better, easier to test.

### DR-004: Three-Layer Architecture
**Status**: Accepted  
**Decision**: Organize code into Core/Features/Infrastructure layers.
**Rationale**: Clear dependencies, enables independent evolution.

### DR-005: Domain Cohesion over Technical Purity
**Status**: Accepted  
**Decision**: Organize by domain, not by technical concern.
**Rationale**: "Working on circles" means one directory.

### DR-006: Separate users and people Domains
**Status**: Accepted  
**Decision**: Two distinct domains for auth vs workspace identity.
**Rationale**: Security isolation, prevents cross-workspace correlation.

### DR-007: Authority Calculated, Not Stored
**Status**: Accepted  
**Decision**: Authority is computed from roles, not stored.
**Rationale**: Single source of truth, no sync bugs.

### DR-008: Soft Delete via archivedAt
**Status**: Accepted  
**Decision**: Use `archivedAt` timestamp, not status field or hard delete.
**Rationale**: Preserves history, enables audit trails.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2025-12-12 | Complete rewrite. Single source of truth. Consolidated from architecture.md + synergyos-core-architecture.md. Added: explicit file patterns (tables.ts vs schema.ts), legacy migration status, soft delete pattern, identity helpers table, users vs people clarification. |
| 2.3 | 2025-12-11 | Added FROZEN/STABLE classification, Identity Chain section, Core Invariants reference. |
| 2.2 | 2025-12-09 | Documented Convex public auth pattern, target ID whitelist. |
| 2.0 | 2025-12-06 | Domain cohesion model. AI-native optimization. |

---

*This document is the single source of truth. Update it when decisions change.*
