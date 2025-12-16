# SynergyOS Architecture

**Single Source of Truth** for all architectural principles, coding standards, and design decisions.

**Version**: 4.0  
**Last Updated**: 2025-12-16  
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
| **Svelte Patterns** (see "Frontend Patterns" section for details) |||
| 12 | Components are thin and presentational | Code review |
| 13 | Components delegate to Convex for all logic | Code review |
| 14 | Svelte 5 runes used correctly ($state, $derived, $effect) | Code review |
| 14a | Use `.svelte.ts` for reactive state, `.ts` for pure functions | Code review |
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

### Trade-off Guidance (Even-Over Statements)

When principles conflict, use these priorities:

| Prioritize This... | Even Over... | Rationale |
|-------------------|--------------|-----------|
| **Domain cohesion** (one folder = one domain) | File line limits | 400-line file in the right place beats 8 files scattered |
| **Explicit boundaries** (index.ts exports) | DRY across domains | Duplication within a domain is fine; leaky abstractions aren't |
| **Working code** (npm run check passes) | Perfect structure | Ship, then refactor. Don't block on architecture purity |
| **Readability** (can a new reader follow?) | Clever abstractions | Boring code > clever code |
| **8-file domain structure** | Arbitrary extraction | Split when you have a *reason*, not when you hit a number |

### The 300-Line Guideline (Clarified)

**Intent:** Files over 300 lines *may* indicate a need to split. It's a smell, not a rule.

**When to split:**
- File has multiple unrelated responsibilities
- You're scrolling constantly to find things
- Tests for the file are hard to organize

**When NOT to split:**
- Domain is cohesive and the file is 400 lines
- Splitting would create circular imports
- Splitting would scatter related logic across files

**The test:** Can you name the new file something meaningful? If it would be `helpers2.ts` or `mutations-part2.ts`, don't split.

**Anti-pattern:** Mechanical file splitting to meet a line count. This violates domain cohesion and creates navigation overhead.

### Code Hygiene

| # | Principle | Enforcement |
|---|-----------|-------------|
| 26 | Query/mutation handlers ≤ 20 lines | Code review |
| 27 | Validation logic extracted to `rules.ts` | Code review |
| 28 | Repeated patterns (3x+) extracted to helpers | Code review |
| 29 | No inline type casts (`as unknown as`) — use type helpers | Linting |
| 30 | Auth/access via composed helpers (e.g., `withCircleAccess`) | Code review |
| 31 | Archive queries via a helper (e.g., `queryActive`), not branching | Code review |
| 32 | Domain files ~300 lines guideline; split only with reason (see Trade-off Guidance) | Code review |
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
| Svelte 5 patterns, composables, `.svelte.ts` vs `.ts` | This document → "Frontend Patterns (Svelte 5)" section |
| Governance models, circle types, role templates | dev-docs/master-docs/architecture/governance-design.md |
| Permission/access control logic | convex/infrastructure/rbac/README.md |
| Invariant definitions | convex/admin/invariants/INVARIANTS.md |
| Feature flags | convex/infrastructure/featureFlags/README.md |
| Admin operations | convex/admin/README.md |

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
┌─────────────────────────────────────────────────────────────────┐
│  Application Layer (Svelte routes, UI)                          │
│  /src/routes/, /src/lib/components/                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────────────┐
│  Features Layer                                                 │
│  /convex/features/ (meetings, tensions, projects, inbox,        │
│                     customFields, tasks, flashcards, tags)      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────────────┐
│  Core Layer                                                     │
│  /convex/core/ (circles, roles, authority, proposals...)        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────────────┐
│  Infrastructure Layer                                           │
│  /convex/infrastructure/ (auth, rbac, access, featureFlags)     │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Rules

| Layer | Can Import From | Cannot Import From |
|-------|-----------------|-------------------|
| Infrastructure | Other infrastructure modules | Core, Features, Application |
| Core | Infrastructure, **other Core domains** | Features, Application |
| Features | Core, Infrastructure | Application, other Features* |
| Application | Features, Core, Infrastructure | — |

*Features should not depend on each other unless explicitly designed as dependencies.

> **Note:** Infrastructure modules may import from each other (horizontal sharing). Core domains may import from other core domains (e.g., `authority` imports from `circles`). The prohibition is on *upward* dependencies — infrastructure must never import from core or features.

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
│   ├── customFields/
│   └── ...
│
├── infrastructure/                 # Cross-cutting concerns
│   ├── auth/                       # Session management, identity
│   ├── rbac/                       # Access control (system + workspace scopes)
│   ├── access/                     # Composed access helpers
│   └── featureFlags/               # Feature flag system
│
├── admin/                          # Operational tooling
│   ├── invariants/                 # Data integrity checks
│   ├── migrations/                 # Schema migrations
│   └── [utilities]                 # RBAC admin, user management, seeding
│
└── schema.ts                       # Main schema registration

/src/
├── lib/
│   ├── components/
│   │   ├── atoms/                  # Single elements (Button, Badge)
│   │   ├── molecules/              # Combined atoms (FormField)
│   │   └── organisms/              # Complex sections (Dialog)
│   ├── modules/[module]/           # Frontend feature modules
│   │   ├── manifest.ts             # Registration, dependencies
│   │   ├── api.ts                  # Type-safe public interface
│   │   ├── components/             # Feature-specific components
│   │   └── composables/            # Feature-specific logic
│   └── composables/                # Shared UI logic (.svelte.ts)
└── routes/                         # SvelteKit routes (thin)

/tests/
└── integration/                    # Cross-domain workflow tests

/e2e/                               # End-to-end tests
```

### Frontend/Backend Relationship

Frontend modules (`src/lib/modules/`) consume backend features (`convex/features/`) through Convex's generated API.

| Aspect | Pattern |
|--------|---------|
| Coupling | Loose — via typed API contracts |
| Cardinality | N:M — frontend modules can compose multiple backend features |
| Discovery | Frontend: manifest registry. Backend: Convex automatic |

**Example:** The `meetings` frontend module consumes:
- `convex/features/meetings/` (primary)
- `convex/core/circles/` (to show circle context)
- `convex/core/proposals/` (for proposal agenda items)

**Naming rationale:** Frontend uses "modules" (pluggable units with registry, manifests, contracts). Backend uses "features" (architecture layer naming convention).

### Frontend/Backend Constant Sync

**Types**: Frontend imports from `convex/_generated/dataModel` (automatic type sync)

**Constants**: Frontend maintains its own copy in `src/lib/infrastructure/organizational-model/constants.ts` (manual sync required)

**When modifying constants:**
1. Update `convex/core/{domain}/constants.ts` (backend source of truth)
2. Update `src/lib/infrastructure/organizational-model/constants.ts` (frontend copy)
3. Both must match exactly — values, keys, and types

**Rationale**: Pre-production phase doesn't justify build complexity for shared constants. Types sync automatically via Convex generation. Constants require manual sync until shared package infrastructure is justified.

### Legacy Compatibility Layers

_No legacy compatibility layers remain. All code uses `convex/features/` directly._

### Analytics vs. Domain Events

| System | Purpose | Status |
|--------|---------|--------|
| **PostHog** (`infrastructure/posthog.ts`) | Product analytics, telemetry | ✅ Implemented |
| **Domain events** | Internal pub/sub for decoupling | ⏸️ Planned, not implemented |

**Current approach:** Features call core domains directly. Domain events may be added when async workflows (notifications, webhooks) or feature decoupling becomes necessary.

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
| **policies** | STABLE | Circle-level rules (scaffolded, not yet implemented) | `circleId` |

### Why FROZEN vs STABLE?

**FROZEN domains (7)** — Organizational truth:
- **users + people**: Identity chain (`sessionId → userId → personId`) is foundational
- **circles + roles + assignments**: Organizational structure — the nouns of the system
- **authority**: The USP calculation layer — what makes SynergyOS different
- **history**: Immutable by definition — you can't change history without destroying trust

**STABLE domains (3)** — Can evolve:
- **workspaces**: Infrastructure (tenant separation), needs room for billing, enterprise features
- **proposals + policies**: Governance mechanism — *how* we implement may evolve

> **Note:** The `policies` domain is currently scaffolded (placeholder files exist) but not implemented. We haven't defined the policies data model yet. Implementation will happen when we scope governance customization features.

### What's NOT Core

All migrations from CORE to Features are complete.

| Previous Location | New Location | Status | Tracking |
|-------------------|--------------|--------|----------|
| `core/circleItems/` | `features/customFields/` | ✅ DONE | SYOS-790 |

**circleItems** was workspace-level customization (custom fields on entities), not organizational truth. Successfully migrated to `features/customFields/` (December 2025).

---

## Identity Architecture

### The Three-Layer Identity Chain

SynergyOS uses a deliberate three-layer identity model for security and workspace isolation:

```
┌───────────────────────────────────────────────────────────────────────┐
│                          IDENTITY CHAIN                               │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   sessionId ──────► userId ──────► personId ──────► workspaceId       │
│       │                │                │                │            │
│       │                │                │                └── "Which org?"
│       │                │                │                              │
│       │                │                └── "Who in THIS workspace?"   │
│       │                │                                               │
│       │                └── "Which human logged in?"                    │
│       │                                                                │
│       └── "Which browser session?"                                     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
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

**The invariant (XDOM-01):** No `userId` references in core domain tables (except `users`, `people`). All `createdBy`/`updatedBy` audit fields use `personId`.

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

### Guest Access Model

Guests are external users with limited workspace access (e.g., consultants, advisors).

#### Identity Model

Guests are `people` records with `isGuest: true`:

| Field | Purpose |
|-------|---------|
| `isGuest` | `true` = limited access guest |
| `guestExpiry` | When guest access expires (timestamp) |

**Key principle:** Guests ARE people — they can energize roles, participate in circles, and receive RBAC permissions through normal flows.

#### Access Mechanisms

| Access Type | Mechanism | Check |
|-------------|-----------|-------|
| **View specific resource** | `resourceGuests` entry | `hasResourceGuestAccess(personId, type, id)` |
| **Role in circle** | `assignments` entry | Normal authority calculation |
| **RBAC permission** | Role template → `workspaceRoles` | `hasWorkspaceRole(personId, role)` |

#### Security Model

Guests can ONLY access:
1. Resources explicitly listed in `resourceGuests` for their `personId`
2. Circles/roles they're assigned to via `assignments`
3. Nothing else — workspace isolation via `personId`

#### `resourceGuests` Table

Grants view access to specific resources without role assignment:

```typescript
resourceGuests: {
  personId: Id<'people'>,           // The guest (must have isGuest: true)
  resourceType: string,              // 'circles' | 'proposals' | 'documents'
  resourceId: string,                // Specific resource ID
  grantedByPersonId: Id<'people'>,  // Who granted access
  grantedAt: number,                 // When granted
  expiresAt?: number,                // Optional expiry
}
```

**Presence = access:** No permission levels — if record exists and not expired, guest can view.

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

### RBAC Scope Model

RBAC operates at two scopes with different identity models:

| Scope | Table | Identifier | Use Case |
|-------|-------|------------|----------|
| **System** | `systemRoles` | `userId` | Platform operations: admin console, developer access, support tools |
| **Workspace** | `workspaceRoles` | `personId` | Org operations: billing admin, workspace admin, member permissions |

**Why two scopes?**
- Same user can have different RBAC roles in different workspaces
- Platform-level access (developer, support) is independent of any workspace
- Workspace isolation: `personId` prevents accidental cross-workspace correlation

**Table Definitions (infrastructure/rbac/tables.ts):**
```typescript
// System-level — uses userId (global identity)
export const systemRolesTable = defineTable({
  userId: v.id('users'),
  role: v.string(),  // 'platform_admin' | 'platform_manager' | 'developer' | 'support'
  grantedAt: v.number(),
  grantedBy: v.optional(v.id('users')),
}).index('by_user', ['userId']).index('by_role', ['role']);

// Workspace-level — uses personId (workspace-scoped identity)
export const workspaceRolesTable = defineTable({
  personId: v.id('people'),
  role: v.string(),  // 'billing_admin' | 'workspace_admin' | 'member'
  grantedAt: v.number(),
  grantedByPersonId: v.optional(v.id('people')),
  sourceCircleRoleId: v.optional(v.id('assignments')),  // For auto-assignment cleanup
}).index('by_person', ['personId']).index('by_role', ['role']).index('by_source_role', ['sourceCircleRoleId']);
```

### RBAC Permission Infrastructure

In addition to role assignment, RBAC includes a permission definition system:

| Table | Purpose | Status |
|-------|---------|--------|
| `rbacPermissions` | Defines capabilities (e.g., 'users.view', 'billing.manage') | ✅ Active |
| `rbacRoles` | Named RBAC permission buckets | ✅ Active |
| `rbacRolePermissions` | Links roles to permissions with scope (all/own/none) | ✅ Active |
| `rbacAuditLog` | Audit logging for permission checks | ✅ Active |
| `resourceGuests` | Guest view access to specific resources (uses `personId`) | ✅ Schema ready |

### RBAC Helper Functions

| Function | Scope | Identifier | Use When |
|----------|-------|------------|----------|
| `hasSystemRole(userId, role)` | System | `userId` | Check platform-wide role |
| `hasWorkspaceRole(personId, role)` | Workspace | `personId` | Check workspace-scoped role |
| `requireSystemRole(userId, role)` | System | `userId` | Throw if missing platform role |
| `requireWorkspaceRole(personId, role)` | Workspace | `personId` | Throw if missing workspace role |

> **Note:** Role helpers are implemented (SYOS-791). Permission helpers (`hasSystemPermission`, `hasWorkspacePermission`) are planned.

**Design principle:** Two scopes = two functions. Always explicit, never ambiguous.

For RBAC implementation details, see `convex/infrastructure/rbac/README.md`.

### RoleTemplates → RBAC Bridge

Organizational roles (circleRoles) can automatically grant workspace permissions:

**How it works:**
1. User fills a circleRole that has a template with `rbacPermissions`
2. System auto-creates `workspaceRoles` record
3. `sourceCircleRoleId` tracks which assignment granted the permission
4. When user removed from circleRole, only that assignment's permissions are revoked

**Current state:** Working, but uses deprecated `userRoles`. Migration to `workspaceRoles` pending.

**Simplification:** Permissions are workspace-wide (not circle-scoped). Circle Lead in Engineering gets workspace-level permissions, not just Engineering-scoped.

### Authorization Flow

SynergyOS has a three-step authorization pattern:

```
1. Session → User (auth)
   validateSessionAndGetUserId(ctx, sessionId) → userId

2. User → Person (workspace context)  
   getPersonByUserAndWorkspace(ctx, userId, workspaceId) → personId

3. Access Check (RBAC + Authority)
   - RBAC: hasWorkspaceRole(personId, role) — system capabilities
   - Authority: calculateAuthority(personId, circleId) — organizational permissions
```

### Composed Access Helpers

For common patterns, use composed helpers from `infrastructure/access/`:

| Helper | What It Does | Use When |
|--------|--------------|----------|
| `withCircleAccess(handler)` | Session → Circle → Workspace membership check | Circle-scoped operations |
| `getUserWorkspaceIds(userId)` | Get all workspaces user can access | Workspace listing |
| `getUserCircleIds(userId)` | Get all circles user can access | Circle listing |

**Example:**
```typescript
// Instead of manual checks:
export const updateCircle = mutation({
  args: { sessionId: v.string(), circleId: v.id('circles'), ... },
  handler: withCircleAccess(async (ctx, args, { userId, circle }) => {
    // userId and circle already validated
    // Handler only runs if user has workspace membership
  })
});
```

---

## Governance Foundation

**Design Reference:** `dev-docs/master-docs/architecture/governance-design.md`

SynergyOS implements a three-layer governance model that supports multiple decision-making modes while maintaining consistent organizational truth.

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Invariants Over Configuration** | Every circle has one lead role (invariant); what they call that role (configuration) |
| **Decision Rights as First-Class** | Roles must define explicit decision rights — required, not optional (GOV-03) |
| **Progressive Adoption** | Mixed governance models within same workspace (Engineering = hierarchy, Product = empowered_team) |
| **Design Before Activation** | Workspaces start in `design` phase for free experimentation, activate when ready |

### Workspace Lifecycle

Workspaces have two phases that control governance enforcement:

| Phase | History Tracked | Validation Enforced | Governance Required | Transition |
|-------|-----------------|---------------------|---------------------|------------|
| `design` | ❌ No | ❌ Minimal | ❌ No | Can activate (one-way) |
| `active` | ✅ Yes | ✅ Yes | ✅ Per circle type | Cannot revert |

**Design Phase:**
- Workspace creator gets RBAC role `org_designer`
- Free create/modify/delete of circles, roles, assignments
- No proposal approval, no history logging
- Schema-level invariants still enforced (referential integrity)

**Activation Requirements:**
- Workspace has exactly one root circle (ORG-01)
- Root circle type ≠ guild (ORG-10)
- Every circle has `roleType: 'circle_lead'` (GOV-01)
- Every role has `purpose` and ≥1 `decisionRight` (GOV-02, GOV-03)

**Activation is one-way:** `design` → `active` only. Once activated, audit trail must be continuous.

### Role Auto-Creation

Circles automatically create their lead role based on `circleType` (GOV-01):

| Circle Type | Lead Role Name | Lead Authority | Auto-Created Structural Roles |
|-------------|----------------|----------------|-------------------------------|
| `hierarchy` | Circle Lead | Full (decides directly) | Secretary (optional) |
| `empowered_team` | Team Lead | Facilitative (breaks ties) | Facilitator, Secretary |
| `guild` | Steward | Convening (schedules only) | Secretary (optional) |
| `hybrid` | Circle Lead | Full + Consent | Facilitator, Secretary |

**Auto-creation triggers:**
1. **Circle creation** → System creates lead role from `roleTemplates` matching `circleType`
2. **Circle type change** → System transforms lead role (never deletes, GOV-04)

**Example:**
```typescript
// Creating hierarchy circle auto-creates:
{
  name: 'Circle Lead',
  roleType: 'circle_lead',
  purpose: 'Lead this circle toward its purpose with full decision authority',
  decisionRights: ['Decide all matters within circle scope', 'Assign roles within circle'],
  templateId: <hierarchy Circle Lead template>
}
```

### Role Templates System

System-level templates (10 total) define blueprints for auto-created roles:

**Template Structure:**
```typescript
{
  workspaceId: undefined,              // System-level (not workspace-specific)
  name: 'Circle Lead' | 'Team Lead' | 'Steward' | 'Facilitator' | 'Secretary',
  roleType: 'circle_lead' | 'structural',
  appliesTo: 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid',
  isCore: boolean,                     // true = required for governance, false = optional
  defaultPurpose: string,
  defaultDecisionRights: string[],
  description: string,
  createdByPersonId: undefined         // System template - no creator
}
```

**Key insight (SYOS-895):** Each `circleType` gets its own lead template because authority models differ:
- `hierarchy` → Circle Lead (full authority)
- `empowered_team` → Team Lead (facilitative authority)
- `guild` → Steward (convening authority only)
- `hybrid` → Circle Lead (full + consent process)

### Governance Invariants (GOV-*)

| ID | Invariant | Severity |
|----|-----------|----------|
| GOV-01 | Every circle has exactly one role with `roleType: 'circle_lead'` | critical |
| GOV-02 | Every role has a `purpose` (non-empty string) | critical |
| GOV-03 | Every role has at least one `decisionRight` | critical |
| GOV-04 | Circle lead role cannot be deleted while circle exists | critical |
| GOV-05 | Role assignments are traceable (who assigned, when) | warning |
| GOV-06 | Governance changes create history records (when phase = 'active') | warning |
| GOV-07 | Person can fill 0-N roles; role can have 0-N people | critical |
| GOV-08 | Circle type is explicit, never null for active circles | critical |

For complete invariant definitions, see `convex/admin/invariants/INVARIANTS.md`.

### Schema Changes for Governance

**circleRoles table:**
```typescript
{
  roleType: v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom')),  // required
  purpose: v.string(),                   // now required (was optional)
  decisionRights: v.array(v.string()),   // new field, min 1 validated in mutations
  // ... other fields
}
// New index: by_circle_roleType ['circleId', 'roleType']
```

**roleTemplates table:**
```typescript
{
  workspaceId: v.optional(v.id('workspaces')),  // undefined = system template
  name: v.string(),
  roleType: v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom')),
  appliesTo: v.union(v.literal('hierarchy'), v.literal('empowered_team'), v.literal('guild'), v.literal('hybrid')),
  isCore: v.boolean(),                   // true = required for governance
  defaultPurpose: v.string(),
  defaultDecisionRights: v.array(v.string()),
  description: v.optional(v.string()),
  createdByPersonId: v.optional(v.id('people')),  // undefined for system templates
  // ... audit fields
}
```

**workspaces table:**
```typescript
{
  phase: v.optional(v.union(v.literal('design'), v.literal('active'))),  // default 'design'
  displayNames: v.optional(v.object({
    circle: v.optional(v.string()),           // Default: "Circle"
    circleLead: v.optional(v.string()),       // Default: "Circle Lead"
    facilitator: v.optional(v.string()),      // Default: "Facilitator"
    secretary: v.optional(v.string()),        // Default: "Secretary"
    tension: v.optional(v.string()),          // Default: "Tension"
    proposal: v.optional(v.string()),         // Default: "Proposal"
  })),
  // ... other fields
}
```

**Display names** are cosmetic only — they change UI labels but not behavior. A workspace can call circles "Teams" and circle leads "Managers" without changing how the system works.

---

## Feature Flags

SynergyOS uses feature flags for trunk-based development — all code ships to production, features are enabled via flags.

| Location | Purpose |
|----------|---------|
| `infrastructure/featureFlags/` | Flag management, targeting, evaluation |
| `featureFlags` table | Flag definitions and state |

**Pattern:** Check flags before enabling features. Remove flags after full rollout.

See `convex/infrastructure/featureFlags/README.md` for detailed usage.

---

## File Structure Patterns

### Domain File Structure

Each core domain follows this structure:

```
domain/
├── tables.ts       # REQUIRED - Table definitions for convex/schema.ts
├── schema.ts       # OPTIONAL - Types, aliases, re-exports
├── constants.ts    # OPTIONAL - Runtime constants with derived types
├── queries.ts      # Read operations
├── mutations.ts    # Write operations
├── rules.ts        # Business rules (pure + contextual)
├── index.ts        # Public exports only
├── README.md       # AI-friendly documentation
└── domain.test.ts  # Co-located tests
```

### tables.ts vs schema.ts vs constants.ts

| File | Purpose | Required | Contents |
|------|---------|----------|----------|
| `tables.ts` | Table definitions | **REQUIRED** | `defineTable()` calls, indexes |
| `schema.ts` | Types and aliases | OPTIONAL | Type exports, re-exports from tables.ts or constants.ts |
| `constants.ts` | Runtime constants | OPTIONAL | Const objects with derived types, enums |

**When to use `constants.ts`:**
- Domain has enum-like values used at runtime (iteration, validation, mapping)
- Values need to be referenced by name (autocomplete, refactoring)
- Multiple files in the domain reference the same string literals

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

**Example constants.ts:**
```typescript
export const CIRCLE_TYPES = {
  HIERARCHY: 'hierarchy',
  EMPOWERED_TEAM: 'empowered_team',
  GUILD: 'guild',
  HYBRID: 'hybrid'
} as const;

export type CircleType = (typeof CIRCLE_TYPES)[keyof typeof CIRCLE_TYPES];
```

**Example schema.ts:**
```typescript
import type { Doc } from '../../_generated/dataModel';
export type CircleDoc = Doc<'circles'>;
// Re-export types from constants.ts (single source of truth)
export type { CircleType, DecisionModel } from './constants';
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

## Frontend Patterns (Svelte 5)

Svelte 5 with runes is our frontend framework. Components delegate to Convex for business logic, but frontend-specific reactive coordination requires understanding when to use `.svelte.ts` composables vs pure `.ts` utilities.

### File Type Decision

| Need | File Type | Location |
|------|-----------|----------|
| Shared reactive state across components | `.svelte.ts` | `composables/` |
| Derived/computed values from reactive state | `.svelte.ts` | `composables/` |
| Side effects that react to state changes | `.svelte.ts` | `composables/` |
| Pure transformation `(input) → output` | `.ts` | `utils/` |
| Business rules, validation, calculations | `.ts` | `utils/` |
| Constants, types, interfaces | `.ts` | Domain root or `types/` |

**Key insight:** `.svelte.ts` files can use runes (`$state`, `$derived`, `$effect`). Regular `.ts` files cannot.

### The Three-File Pattern

```
src/lib/modules/{module}/
├── composables/useFeature.svelte.ts  → Reactive coordination
├── utils/featureCalculations.ts      → Pure functions
└── components/Feature.svelte         → Thin wiring layer
```

### Composables Pattern (`.svelte.ts`)

Composables encapsulate reactive state and expose it to components:

```typescript
// useOrgChart.svelte.ts
export function useOrgChart(circles: Circle[]) {
  // Reactive state
  let selectedCircleId = $state<Id<'circles'> | null>(null);
  let zoomLevel = $state(1.0);
  
  // Derived values (automatically update when dependencies change)
  const selectedCircle = $derived(
    circles.find(c => c._id === selectedCircleId)
  );
  const isZoomedIn = $derived(zoomLevel > 1.5);
  
  // Actions (mutate state)
  function selectCircle(id: Id<'circles'>) {
    selectedCircleId = id;
  }
  
  return {
    // Expose state via getters (read-only where possible)
    get selectedCircleId() { return selectedCircleId; },
    get selectedCircle() { return selectedCircle; },
    get isZoomedIn() { return isZoomedIn; },
    // Actions
    selectCircle,
  };
}
```

### Global State (`src/lib/stores/`)

App-wide reactive state lives in `src/lib/stores/`:
- `theme.svelte.ts` - Theme preference
- `activityTracker.svelte.ts` - User activity detection

These are distinct from module composables (feature-scoped) and shared composables (reusable utilities).

### Exporting State Across Modules

State declared with `$state` cannot be directly exported if reassigned. Use one of these patterns:

```typescript
// ✅ Pattern 1: Export object with state properties
export const counter = $state({ count: 0 });

export function increment() {
  counter.count += 1;
}

// ✅ Pattern 2: Export getter function
let count = $state(0);

export function getCount() {
  return count;
}

export function increment() {
  count += 1;
}

// ❌ Cannot do this — reassigned state can't be exported
export let count = $state(0);
export function increment() {
  count += 1;  // Reassignment breaks cross-module reactivity
}
```

### Why Pure Functions (`.ts`) Are Preferred

Pure functions are preferred when reactivity isn't needed:

| Benefit | Explanation |
|---------|-------------|
| **Testable** | No Svelte runtime needed for unit tests |
| **Portable** | Could move to server, worker, or different framework |
| **Predictable** | Same input always produces same output |
| **Debuggable** | No hidden reactive dependencies |

```typescript
// ✅ Pure function — use .ts
function calculateBounds(nodes: Node[]): Bounds {
  // Math, no reactive state
  return { minX, minY, maxX, maxY };
}

// ✅ Reactive state — use .svelte.ts  
let zoom = $state(1.0);
const shouldShowLabels = $derived(zoom > 1.5);
```

### Component Wiring

Components wire composables and utilities together:

```svelte
<script lang="ts">
  // Composable for reactive state
  import { useOrgChart } from '../composables/useOrgChart.svelte';
  
  // Pure utilities for calculations
  import { calculateBounds } from '../utils/orgChartLayout';
  import { shouldShowLabel } from '../utils/orgChartVisibility';
  
  let { circles } = $props();
  
  // Wire composable (reactive coordination)
  const orgChart = useOrgChart(circles);
  
  // Use pure functions with reactive inputs via $derived
  const bounds = $derived(calculateBounds(circles));
</script>

<div>
  {#if orgChart.selectedCircle}
    <CircleDetail circle={orgChart.selectedCircle} />
  {/if}
</div>
```

### `$derived` vs `$derived.by`

Use `$derived(expression)` for simple, single-expression derivations:

```typescript
// ✅ Simple expression — use $derived
const doubled = $derived(count * 2);
const isSelected = $derived(selectedId === item._id);
const fullName = $derived(`${firstName} ${lastName}`);
```

Use `$derived.by(() => { ... })` when you need multiple statements:

```typescript
// ✅ Complex logic — use $derived.by
const total = $derived.by(() => {
  let sum = 0;
  for (const item of items) {
    if (item.active) {
      sum += item.value;
    }
  }
  return sum;
});

const sortedItems = $derived.by(() => {
  const filtered = items.filter(i => i.visible);
  return filtered.toSorted((a, b) => a.name.localeCompare(b.name));
});
```

**Key insight:** `$derived(expression)` is equivalent to `$derived.by(() => expression)`. Use the simpler form when possible.

### `$derived` vs `$effect` — The Critical Distinction

> `$effect` is best considered an escape hatch — useful for things like analytics and direct DOM manipulation — rather than a tool you should use frequently.
> — Svelte 5 Documentation

**Use `$derived` for computed values:**

```svelte
<script>
  let count = $state(0);
  
  // ✅ CORRECT: Use $derived for computed values
  let doubled = $derived(count * 2);
  
  // ❌ WRONG: Don't use $effect to sync state
  let doubled = $state();
  $effect(() => {
    doubled = count * 2;  // Anti-pattern!
  });
</script>
```

**Use `$effect` only for side effects:**

```typescript
// ✅ Legitimate $effect uses:
$effect(() => {
  // Canvas drawing
  context.fillRect(0, 0, size, size);
});

$effect(() => {
  // Analytics tracking
  trackEvent('page_view', { page: currentPage });
});

$effect(() => {
  // Third-party library integration
  chart.update(data);
  return () => chart.destroy();  // Teardown function
});
```

### Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| `$state` for values that never change | `const` or plain variable |
| `.svelte.ts` for pure calculations | `.ts` file in `utils/` |
| `$effect` to derive state from other state | `$derived` or `$derived.by` |
| Reactive logic embedded in components | Extract to composable |
| Giant components with 50+ line functions | Extract to `utils/` |
| Everything in one `.svelte.ts` file | Split reactive vs pure logic |

### Deep Reactivity Notes

`$state` creates deeply reactive proxies for objects and arrays:

```typescript
let todos = $state([
  { done: false, text: 'add more todos' }
]);

// ✅ This triggers updates (proxy intercepts)
todos[0].done = true;
todos.push({ done: false, text: 'new' });

// ⚠️ Destructuring breaks reactivity
let { done, text } = todos[0];  // done/text are NOT reactive
```

For non-reactive objects (performance optimization), use `$state.raw`:

```typescript
let largeDataset = $state.raw(fetchedData);
// Can only be replaced, not mutated
largeDataset = newData;  // ✅ Works
largeDataset[0].value = 1;  // ❌ No effect
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

### Completed Migrations

| Legacy Table/Domain | Replacement | Status | Tracking |
|---------------------|-------------|--------|----------|
| `circleItems/circleItemCategories` | `customFieldDefinitions/customFieldValues` | ✅ DONE | SYOS-790 |
| `workspaceMembers` | `people` | ✅ Complete (SYOS-814) | Table removed |

### Active Migrations

| Legacy Table | Replacement | Status | Tracking |
|--------------|-------------|--------|----------|
| `userCircleRoles` | `assignments` | Migration in progress | SYOS-809, SYOS-815 |
| `userRoles` | `systemRoles` + `workspaceRoles` | ✅ Tables created, delete legacy | SYOS-791 |
| `workspaceInvites` | TBD | Still actively used | Needs evaluation |

### Tables to Delete (Pre-Production)

Since we're wiping all data before production, these tables can be deleted from schema without migration:

| Table | Reason | Blocked By |
|-------|--------|------------|
| `userRoles` | Replaced by `systemRoles` + `workspaceRoles` | Nothing — delete now |
| `userCircleRoles` | Replaced by `assignments` | SYOS-815 completion |

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
| Identity Chain (IDENT-*) | 11 | 9 |
| Organizational Structure (ORG-*) | 10 | 9 |
| Circle Membership (CMEM-*) | 4 | 3 |
| Role Definitions (ROLE-*) | 6 | 4 |
| Assignments (ASSIGN-*) | 6 | 5 |
| Legacy Assignments (UCROLE-*) | 4 | 3 |
| Authority (AUTH-*) | 4 | 4 |
| Governance (GOV-*) | 8 | 6 |
| Proposals (PROP-*) | 6 | 5 |
| History (HIST-*) | 4 | 1 |
| Workspaces (WS-*) | 5 | 4 |
| Guest Access (GUEST-*) | 5 | 3 |
| RBAC (RBAC-*) | 6 | 4 |
| Cross-Domain (XDOM-*) | 5 | 3 |
| **Total** | **84** | **63 critical** |

### Running Invariant Checks

```bash
# Run all invariant checks
npx convex run admin/invariants:runAllChecks

# Run specific category
npx convex run admin/invariants/identity:check
npx convex run admin/invariants/organization:check
npx convex run admin/invariants/authority:check
```

### Schema-Level Validation

Invariants XDOM-01 and XDOM-02 are additionally enforced at the **schema level** via ESLint:

- **Rule**: `synergyos/no-userid-in-audit-fields`
- **Location**: `eslint-rules/no-userid-in-audit-fields.js`
- **Runs**: `npm run lint` (CI pipeline)
- **Purpose**: Catches schema violations before they create bad data
- **Details**: See `SYOS-842-VIOLATIONS.md` and `convex/admin/invariants/INVARIANTS.md`

### Severity Levels

| Severity | Meaning |
|----------|---------|
| **critical** | System cannot function correctly — blocks production use |
| **warning** | System works but has data quality issues — should fix before production |

---

## Error Codes

**Source of truth:** `convex/infrastructure/errors/codes.ts`

**Error Creation:** Use `createError(code, userMessage, technicalDetails?)` function (follows Principle #11: functions only, no classes)

**Structured Error Format:** `SYNERGYOS_ERROR|CODE|USER_MESSAGE|TECHNICAL_DETAILS`

**Legacy Format (still supported):** `ERR_CODE: message`

**Key Features:**
- **User-friendly messages**: Separate user-facing message from technical details
- **Auto-logging**: Technical details automatically logged when error is created
- **Serialization-safe**: Pipe-delimited format survives Convex boundary crossing
- **No regex dependency**: Direct extraction of user message via `parseConvexError()`

**Example:**
```typescript
throw createError(
  ErrorCodes.WORKSPACE_SLUG_RESERVED,
  "The name 'admin' is not available. Please choose a different workspace name.",
  `Slug 'admin' is in reserved list. Attempted by user ${userId}`
);
```

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

**See also:** `dev-docs/2-areas/patterns/error-handling-improvements.md` for detailed error handling patterns

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

## Known Tech Debt

**Last Updated**: 2025-12-13

Documented issues that need resolution before production readiness.

### Critical Invariant Failures (Pre-existing)

| Invariant | Issue | Impact | Tracking |
|-----------|-------|--------|----------|
| AUTH-01 | 2 active circles missing Circle Lead assignment | Low (test data) | Known issue |
| AUTH-02 | 2 workspaces missing Circle Lead on root circle | Low (test data) | Known issue |

These failures exist in test/development workspaces and do not affect production-ready functionality.

### Pending Cleanups

| Item | Description | Priority | Tracking |
|------|-------------|----------|----------|
| `userCircleRoles` migration | Migrate remaining usage to `assignments` table | High | SYOS-809, SYOS-815 |
| `userRoles` deletion | Delete deprecated table from schema | High | Post-SYOS-791 |
| RoleTemplates bridge | Migrate from `userRoles` to `workspaceRoles` | Medium | New ticket needed |
| Test file updates | Some unit tests need `people` table mocking (after SYOS-814 migration) | Medium | — |
| Projects/Tasks audit fields | Migrate `createdBy` to `createdByPersonId` in projects and tasks tables | Medium | TBD |
| Workspaces domain restructure | Consolidate workspaces-related code | Low | SYOS-843 |
| `policies` domain implementation | Scaffold exists, no tables.ts, not implemented | Low | Deferred until governance customization scoped |

### Current Validation Status (2025-12-13)

| Check | Result | Notes |
|-------|--------|-------|
| `npm run check` | ✅ Pass | 0 errors, 0 warnings |
| `npm run lint` | ✅ Pass | 0 errors, 10 warnings (unused vars) |
| `npm run invariants:critical` | ⚠️ 45/47 | AUTH-01, AUTH-02 pre-existing |
| `npm run test:unit:server` | ⚠️ 451/461 | Test infrastructure issues (mocking) |
| Integration tests | ✅ Pass | All core workflows verified |

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

### DR-009: Feature Code Naming Convention
**Status**: Accepted  
**Date**: 2025-12-13  
**Decision**: Backend uses `convex/features/`, frontend uses `src/lib/modules/`.
**Rationale**: Frontend "modules" reflects module system (registry, manifests). Backend "features" follows architecture layer naming. Different names for different systems is intentional.

### DR-010: Two-Scope RBAC Model
**Status**: Accepted  
**Date**: 2025-12-13  
**Decision**: RBAC split into `systemRoles` (userId) and `workspaceRoles` (personId).
**Rationale**: Same user can have different workspace roles. Platform access is independent of workspace. Workspace isolation via personId.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 4.0 | 2025-12-16 | **Frontend Patterns section.** Added comprehensive Svelte 5 patterns documentation covering: `.svelte.ts` vs `.ts` file type decision matrix, composables pattern with code examples, state export patterns across modules, `$derived` vs `$derived.by` usage guidance, `$derived` vs `$effect` distinction (with official Svelte quote), deep reactivity notes, and anti-patterns table. Cross-referenced from Document Selection table. Addresses gap where backend (Convex) had extensive documentation but frontend (Svelte) had only three principles. |
| 3.9 | 2025-01-XX | Error handling improvements. Updated: Error Codes section to document structured error format (`SYNERGYOS_ERROR|CODE|USER_MESSAGE|TECHNICAL_DETAILS`), `createError()` function usage, auto-logging, and serialization-safe design. Follows Principle #11 (functions only, no classes). See `dev-docs/2-areas/patterns/error-handling-improvements.md` for details. |
| 3.8 | 2025-12-15 | Constants pattern documentation. Added: `constants.ts` as OPTIONAL file in domain structure, tables.ts vs schema.ts vs constants.ts comparison, Frontend/Backend Constant Sync section. Updated: Domain File Structure to include constants.ts, schema.ts examples to show re-export pattern from constants.ts. Rationale: Separation of runtime constants (for iteration/validation) vs compile-time types. |
| 3.7 | 2025-12-15 | Governance Foundation implementation. Added: Governance Foundation section (workspace lifecycle, role auto-creation, governance invariants GOV-01 through GOV-08, schema changes for circleRoles/roleTemplates/workspaces). Updated: Core Invariants summary (83 total, 62 critical), Document Selection table (added governance-design.md). Cross-referenced governance-design.md throughout. Implementation: SYOS-884, SYOS-885, SYOS-886, SYOS-887, SYOS-888, SYOS-895. |
| 3.6 | 2025-12-14 | Added Guest Access Model section documenting guest identity model, access mechanisms, security model, and `resourceGuests` table schema. Updated RBAC Permission Infrastructure table to mark `resourceGuests` as "Schema ready". Implementation: SYOS-868, SYOS-874, SYOS-875, SYOS-876. |
| 3.5 | 2025-12-13 | Architecture gap resolution. Added: Frontend/Backend relationship section, Legacy Compatibility Layers, Analytics vs Domain Events, Feature Flags section, RBAC Permission Infrastructure, RoleTemplates→RBAC Bridge, Composed Access Helpers, DR-009 and DR-010. Updated: Dependency rules (infrastructure can import infrastructure), Directory structure (removed events/, added access/, featureFlags/), RBAC section (sourceCircleRoleId, permission helpers), Document Selection table, Known Tech Debt. |
| 3.4 | 2025-12-13 | Fixed cross-references, added SYOS-791 to active migrations, added implementation note to RBAC helpers. |
| 3.3 | 2025-12-13 | Added Trade-off Guidance (Even-Over Statements) section clarifying priority when principles conflict. Updated Principle #32 from hard rule to guideline with clarification. Added "The 300-Line Guideline (Clarified)" section with when to split/not split guidance and anti-pattern documentation. |
| 3.2 | 2025-12-13 | Added RBAC Scope Model subsection documenting two-scope model (systemRoles vs workspaceRoles) with table definitions and helper function signatures. |
| 3.1 | 2025-12-13 | Post-781 confidence check (SYOS-850). Marked circleItems→customFields migration DONE. Added Completed Migrations table. Added Known Tech Debt section with invariant status and validation results. Updated features list. |
| 3.0 | 2025-12-12 | Complete rewrite. Single source of truth. Consolidated from architecture.md + synergyos-core-architecture.md. Added: explicit file patterns (tables.ts vs schema.ts), legacy migration status, soft delete pattern, identity helpers table, users vs people clarification. |
| 2.3 | 2025-12-11 | Added FROZEN/STABLE classification, Identity Chain section, Core Invariants reference. |
| 2.2 | 2025-12-09 | Documented Convex public auth pattern, target ID whitelist. |
| 2.0 | 2025-12-06 | Domain cohesion model. AI-native optimization. |

---

*This document is the single source of truth. Update it when decisions change.*