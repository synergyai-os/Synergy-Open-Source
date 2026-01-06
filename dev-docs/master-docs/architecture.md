# SynergyOS Architecture

> **⚠️ AI AGENT CONTRACT**
> 
> This document describes the **target architecture** for SynergyOS. The codebase may not yet fully align.
> 
> **Rules for AI agents:**
> 1. **Architecture.md is authoritative** — If code contradicts this doc, the code is wrong (or the doc needs updating)
> 2. **Validate before assuming** — When implementing, verify the pattern exists in codebase. If not, flag it.
> 3. **Stop on conflict** — If your task contradicts this doc, STOP and discuss with the human before proceeding
> 4. **Doc-first changes** — If we decide on a different approach, update this doc FIRST, then implement
> 5. **Check status markers** — Sections marked `🚧 BUILDING` or `📋 PLANNED` may not be implemented yet

**Single Source of Truth** for all architectural principles, coding standards, and design decisions.

**Version**: 4.4  
**Last Updated**: 2026-01-05  
**Optimization Target**: AI-native development with domain cohesion

> **⚠️ Important:** This document represents the **target architecture state**. While core patterns (domain cohesion, three-layer model, identity chain) are actively enforced, some sections document aspirational patterns we're working towards (e.g., full domain events implementation, complete DDD aggregate boundaries). Use this as the guide for new code, but expect the existing codebase to be in various stages of alignment.

---

## How to Use This Document

| If you're doing... | Read these sections |
|--------------------|---------------------|
| Any backend work | Quick Reference, Three-Layer Model, Core Domains |
| Frontend/Svelte work | Frontend Patterns (Svelte 5) |
| Auth/permissions work | Identity Architecture, Authority vs Access Control (RBAC) |
| New domain/feature | Directory Structure, Domain File Structure |
| Schema changes | Core Domains section, then run `npm run invariants:critical` |
| Debugging/fixing issues | Check `dev-docs/2-areas/patterns/INDEX.md` first |

---

## Quick Reference

### The 26 Principles

**Status:** ✅ ENFORCED (with exceptions noted below)

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
| 15 | Use `.svelte.ts` for reactive state, `.ts` for pure functions | Code review |
| **Domain Language** |||
| 16 | Use practitioner terminology: circles, roles, tensions, proposals, consent | Code review |
| 17 | Function and variable names match domain language | Code review |
| **Code Quality** |||
| 18 | Pure functions preferred where possible | Code review |
| 19 | Functions do one thing at appropriate abstraction level | Code review |
| 20 | Duplication tolerated twice, refactored on third | Boy Scout Rule |
| 21 | No hardcoded magic values — use constants or config | Linting |
| **Testing** |||
| 22 | Unit tests co-located: `{domain}.test.ts` next to source | Directory structure |
| 23 | Integration tests in `/tests/integration/` | Directory structure |
| 24 | Tests are independent — no test imports from another test | Code review |
| 25 | Core domains have full test coverage | CI gate |
| **Immutability** |||
| 26 | Organizational history is immutable and auditable | Schema design |

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

**Status:** 🚧 BUILDING (pattern established, no automated enforcement yet)

| Guideline | Enforcement |
|-----------|-------------|
| Query/mutation handlers ≤ 20 lines | Code review |
| Validation logic extracted to `rules.ts` | Code review |
| Repeated patterns (3x+) extracted to helpers | Code review |
| No inline type casts (`as unknown as`) — use type helpers | Linting |
| Auth/access via composed helpers (e.g., `withCircleAccess`) | Code review |
| Archive queries via a helper (e.g., `queryActive`), not branching | Code review |
| Domain files ~300 lines guideline; split only with reason (see Trade-off Guidance) | Code review |
| Error format consistent: `ERR_CODE: message` | Code review |

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

See **Identity Architecture** section for complete identity chain explanation.

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

**Status:** ✅ ENFORCED

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

**Status:** ✅ ENFORCED (ESLint rule `no-cross-module-imports`)

| Layer | Can Import From | Cannot Import From |
|-------|-----------------|-------------------|
| Infrastructure | Other infrastructure modules | Core, Features, Application |
| Core | Infrastructure, **other Core domains** | Features, Application |
| Features | Core, Infrastructure | Application, other Features* |
| Application | Features, Core, Infrastructure | — |

*Features should not depend on each other unless explicitly designed as dependencies.

> **Note:** Infrastructure modules may import from each other (horizontal sharing). Core domains may import from other core domains (e.g., `authority` imports from `circles`). The prohibition is on *upward* dependencies — infrastructure must never import from core or features.

### Bounded Contexts (DDD)

Architecture layers are **bounded contexts** — each has its own domain language, models, and responsibilities. Context boundaries are enforced through explicit interfaces (`index.ts` exports).

| Context | Ubiquitous Language | Model Ownership | Translation Points |
|---------|---------------------|-----------------|-------------------|
| **Infrastructure** | Sessions, authentication, permissions, RBAC roles | Auth primitives, access control | → Core via `userId` / `personId` resolution |
| **Core** | Circles, roles, authority, proposals, consent, people | Organizational truth | → Features via domain queries/mutations |
| **Features** | Meetings, projects, tasks, tensions, custom fields | Application concepts | → Core via composed operations |
| **Application** | Routes, pages, components, navigation | UI state, presentation | → Features/Core via Convex API |

**Context Boundaries:**

1. **Infrastructure ↔ Core**: Identity translation (`sessionId` → `userId` → `personId`)
2. **Core ↔ Features**: Domain composition (features call core, never modify core state directly)
3. **Features ↔ Application**: API boundary (Convex generated types, no direct imports)
4. **Within Core**: Explicit domain interfaces (e.g., `authority` imports from `circles/index.ts`)

**Why This Matters:**

- **Language clarity**: "Role" in Core means organizational role; "Role" in Infrastructure means RBAC permission set
- **Model integrity**: Each context owns its models — Features can't change Circle invariants
- **Evolution independence**: Contexts can refactor internally without breaking dependents
- **Testing boundaries**: Mock at context boundaries, not internal implementation

**Example — Context Translation:**

```typescript
// Infrastructure context: "Who is authenticated?"
const { userId } = await validateSessionAndGetUserId(ctx, sessionId);

// Core context: "Who is this person in the workspace?"
const person = await getPersonByUserAndWorkspace(ctx, userId, workspaceId);

// Features context: "Can this person create a meeting?"
const canCreate = await canCreateMeeting(ctx, person._id, circleId);
```

Each layer speaks its own language and translates at boundaries.

### Anti-Corruption Layer (DDD)

External systems (WorkOS, imports, webhooks) speak different languages than our domain. Anti-corruption layers translate external models to internal domain models, protecting domain integrity.

| External System | Anti-Corruption Layer | Internal Domain Model |
|-----------------|----------------------|----------------------|
| **WorkOS AuthKit** | `infrastructure/auth/` | `users` table, `sessionId` → `userId` resolution |
| **Org Structure Import** | `admin/orgStructureImport.ts` | `circles`, `roles`, `assignments` creation |
| **Readwise API** | `features/readwise/sync.ts` | `inboxItems`, normalized format |
| **PostHog Events** | `infrastructure/posthog.ts` | Domain events → analytics schema |

**Design Pattern:**

```typescript
// ❌ WRONG: External model leaks into domain
export const createCircle = mutation({
  handler: async (ctx, args) => {
    // Don't use external field names directly
    const circle = {
      name: args.team_name,        // External naming
      lead_id: args.manager_id     // External structure
    };
  }
});

// ✅ CORRECT: Translation layer protects domain
export const importOrgStructure = mutation({
  handler: async (ctx, args) => {
    // Anti-corruption layer translates external → internal
    const externalOrg = args.orgData;  // External format
    
    // Translation function (anti-corruption layer)
    const internalCircles = translateToCircles(externalOrg);
    
    // Domain uses its own language
    for (const circle of internalCircles) {
      await createCircle(ctx, {
        name: circle.name,
        leadAuthority: circle.leadAuthority,
        parentCircleId: circle.parentCircleId
      });
    }
  }
});

function translateToCircles(external: ExternalOrg): CircleInput[] {
  // This function is the anti-corruption layer
  return external.teams.map(team => ({
    name: team.team_name,           // External → Internal
    leadAuthority: mapTeamType(team.type),
    parentCircleId: team.parent_team_id
  }));
}
```

**Current Implementations:**

1. **Auth Integration** (`infrastructure/auth/`):
   - WorkOS concepts: organizations, sessions, users
   - Internal concepts: workspaces, sessionId, userId, personId
   - Translation: `validateSessionAndGetUserId()` bridges the gap

2. **Org Import** (`admin/orgStructureImport.ts`):
   - External: JSON with teams, managers, positions
   - Internal: circles, roles, assignments with governance invariants
   - Translation: Import functions validate and transform to domain models

3. **Readwise Sync** (`features/readwise/`):
   - External: Readwise highlights, books, articles
   - Internal: inbox items with normalized format
   - Translation: Sync functions normalize to SynergyOS schema

**Key Principle:** External changes don't force domain changes. If WorkOS changes their API, we update the anti-corruption layer — domain models stay stable.

### Screaming Architecture (Clean Architecture)

**Principle:** Directory structure reveals domain intent, not technical framework.

When you open `/convex/core/`, you see:
- `circles/` — Organizational units
- `roles/` — Authority distribution
- `proposals/` — Change mechanism
- `authority/` — Permission calculation

**Not:**
- `models/` — Technical category
- `controllers/` — Framework term
- `services/` — Generic label
- `utils/` — Where domain logic goes to die

**Why This Matters:**

```bash
# ✅ CORRECT: Architecture "screams" its purpose
/convex/core/circles/      # "This system is about circles"
/convex/core/proposals/    # "Proposals are first-class"
/convex/core/authority/    # "Authority is explicit"

# ❌ WRONG: Architecture "screams" technical concerns
/convex/models/            # "This system is about... databases?"
/convex/services/          # "This system is... service-oriented?"
```

**Test:** Can a domain expert (non-programmer) understand the system by reading folder names? If yes, architecture is screaming correctly.

**SynergyOS Example:** A Holacracy practitioner can navigate `/convex/core/` and immediately recognize: circles, roles, assignments, proposals, authority — the vocabulary of organizational governance.

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

**Status:** 📋 PLANNED (domain events designed but not implemented)

| System | Purpose | Status |
|--------|---------|--------|
| **PostHog** (`infrastructure/posthog.ts`) | Product analytics, telemetry | ✅ Implemented |
| **Domain events** | Internal pub/sub for decoupling | 📋 Planned, not implemented |

**Current approach:** Features call core domains directly. Domain events may be added when async workflows (notifications, webhooks) or feature decoupling becomes necessary.

#### Domain Events (Future Implementation)

**Status:** 📋 PLANNED

Domain events are **not currently implemented**. Features call core domains directly.

**When to add:**
- Async workflows needed (notifications, webhooks)
- Cross-feature decoupling required
- External integrations need event feed

**Design principles** (when implemented):
- Events use **past tense** domain language (`CircleCreated`, not `CreateCircle`)
- Event audit uses `personId`, not `userId`
- Event log for side effects, not event sourcing (state stays in tables)
- Emit after successful state change, not before

**Full design guidance**: See version 4.3 archived changes in `dev-docs/master-docs/architecture/decisions.md`

---

## Core Domains (10 Total)

**Status:** ✅ ENFORCED (9/10 domains fully implemented with tests; policies domain lacks tests)

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

### What's NOT Core

All migrations from CORE to Features are complete.

| Previous Location | New Location | Status | Tracking |
|-------------------|--------------|--------|----------|
| `core/circleItems/` | `features/customFields/` | ✅ DONE | SYOS-790 |

**circleItems** was workspace-level customization (custom fields on entities), not organizational truth. Successfully migrated to `features/customFields/` (December 2025).

### Aggregate Boundaries (DDD)

**Status:** 🚧 BUILDING (DDD pattern documented, partially implemented in practice)

Aggregates define consistency boundaries and transaction scope. Each aggregate root is responsible for maintaining invariants for itself and its child entities.

| Aggregate Root | Contains (Logically) | Consistency Boundary | Invariant Reference |
|----------------|---------------------|---------------------|-------------------|
| **Circle** | Roles, Policies | Circle-level invariants | GOV-01, GOV-04, ORG-* |
| **Proposal** | Objections, History entries | Proposal state machine | PROP-* |
| **Person** | Preferences, Profile | Person-level data integrity | IDENT-* |
| **Workspace** | Settings, Display Names | Workspace configuration | WS-*, ORG-01 |
| **Role** | Decision Rights, Purpose | Role definition consistency | GOV-02, GOV-03, ROLE-* |

**Design Principles:**

1. **Transactional Boundaries**: All modifications to an aggregate must go through the root entity
2. **Consistency Guarantees**: Invariants are enforced at aggregate boundaries — changes within an aggregate are atomic
3. **Cross-Aggregate References**: Use IDs only, never direct object references (already enforced by Convex schema)
4. **No Shared Children**: Child entities belong to exactly one aggregate (e.g., a Role belongs to one Circle)

**Example:** When creating a circle, the system automatically creates its Circle Lead role (GOV-01). This happens atomically within the Circle aggregate boundary — you cannot have a circle without its lead role.

**Implementation Note:** Convex mutations provide natural transactional boundaries. Each mutation handler operates on one aggregate at a time. Cross-aggregate operations require explicit coordination through multiple mutations or careful ordering within a single mutation.

---

## Identity Architecture

**Status:** ✅ ENFORCED (194 uses of auth helper, ESLint enforcement, widespread adoption)

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

### People Status Lifecycle

The `people` table uses a status field with four values representing the identity lifecycle:

| Status | Has `email` | Has `userId` | Can Log In | Purpose |
|--------|-------------|--------------|------------|---------|
| `placeholder` | ❌ | ❌ | ❌ | Planning entity — name only, represents future participant |
| `invited` | ✅ | ❌ | ❌ | Invited via email, awaiting signup |
| `active` | ❌ (use users.email) | ✅ | ✅ | Linked to auth identity, full access |
| `archived` | preserved | preserved | ❌ | Soft-deleted, kept for audit trail |

**Lifecycle transitions:**
```
placeholder → invited → active → archived
     ↓            ↓         ↓
     └────────────┴─────────┴──────→ archived (direct archive allowed)
```

**Placeholders** represent known future participants (new hires, consultants, board members) who should appear in the org chart and hold roles before they have system accounts. Key properties:

- Created with `displayName` only — no email, no userId
- Can be assigned to roles via `assignments` table
- Appear in org charts and authority displays
- Cannot log in or take actions (no session possible)
- Persist into active workspaces as a normal planning mechanism

**Timestamps:**
- `createdAt` — when the person record was created (all statuses)
- `invitedAt` — when invite was sent (only for `invited` status and beyond)
- `joinedAt` — when user accepted and linked their account (only for `active`)

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

**Status:** ✅ ENFORCED (full domain with calculator, policies, comprehensive tests)

### Core Responsibility: Organizational Truth

Core provides factual answers about organizational state:

```typescript
// Core answers these questions:
hasRole(person, circle, 'Facilitator')     // → true/false
isCircleLead(person, circle)               // → true/false
isCircleMember(person, circle)             // → true/false
getLeadAuthority(circle)                   // → 'decides' | 'facilitates' | 'convenes'
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

**Status:** ✅ ENFORCED (complete two-scope RBAC implementation with tests and docs)

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

SynergyOS follows the three-layer identity chain (see **Identity Architecture** for details), then applies access checks:

```
1. Session → User → Person (identity chain)
   See Identity Architecture section for resolution flow

2. Access Check (RBAC + Authority)
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

**Status:** ✅ ENFORCED (core patterns: auto-creation, templates, fields implemented; invariants 🚧 BUILDING)

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

Circles automatically create their lead role based on `leadAuthority` (GOV-01):

| Lead Authority | Lead Role Name | Authority Model | Auto-Created Structural Roles |
|----------------|----------------|-----------------|-------------------------------|
| `decides` | Circle Lead | Full (decides directly) | Secretary (optional) |
| `facilitates` | Team Lead | Facilitative (breaks ties) | Facilitator, Secretary |
| `convenes` | Steward | Convening (schedules only) | Secretary (optional) |

**Auto-creation triggers:**
1. **Circle creation** → System creates lead role from `roleTemplates` matching `leadAuthority`
2. **Lead authority change** → System transforms lead role (never deletes, GOV-04)

**Example:**
```typescript
// Creating 'decides' circle auto-creates:
{
  name: 'Circle Lead',
  roleType: 'circle_lead',
  purpose: 'Lead this circle toward its purpose with full decision authority',
  decisionRights: ['Decide all matters within circle scope', 'Assign roles within circle'],
  templateId: <decides Circle Lead template>
}
```

### Governance Fields vs Custom Fields

**Critical Distinction:** SynergyOS separates **governance-required fields** (stored in core schema) from **workspace-configurable fields** (stored in customFieldValues).

| Category | Fields | Storage | Rationale |
|----------|--------|---------|-----------|
| **Governance Fields** | `purpose`, `decisionRights` | Core table schema (`circles`, `circleRoles`) | Required by invariants (GOV-02, GOV-03). Part of organizational truth. Schema-level enforcement. |
| **Custom Fields** | `domain`, `strategy`, `accountabilities`, workspace-defined fields | `customFieldValues` table | Optional, workspace-configurable. No invariant requirements. Flexible per organization. |

**Why This Matters:**

1. **Invariant Enforcement**: GOV-02 requires every role has a purpose. Storing in schema allows Convex to enforce this structurally.
2. **Query Simplicity**: No joins required for fundamental governance data.
3. **Domain Integrity**: Purpose and decision rights are part of the governance vocabulary, not workspace customization.
4. **Clear Boundaries**: Custom fields are for *extensibility* (what each organization wants to track). Governance fields are *foundational* (what every organization must have).

**Anti-Pattern:** Storing invariant-required fields in a flexible system (customFieldValues) where they could theoretically be misconfigured or missing.

**Decision Record:** See DR-011 (Governance Fields in Core Schema).

### Role Templates System

System-level templates (10 total) define blueprints for auto-created roles:

**Template Structure:**
```typescript
{
  workspaceId: undefined,              // System-level (not workspace-specific)
  name: 'Circle Lead' | 'Team Lead' | 'Steward' | 'Facilitator' | 'Secretary',
  roleType: 'circle_lead' | 'structural',
  appliesTo: 'decides' | 'facilitates' | 'convenes',
  isCore: boolean,                     // true = required for governance, false = optional
  defaultPurpose: string,              // Default purpose text for this template
  defaultDecisionRights: string[],     // Default decision rights for this template
  description: string,
  createdByPersonId: undefined         // System template - no creator
}
```

**Key insight (SYOS-895):** Each `leadAuthority` gets its own lead template because authority models differ:
- `decides` → Circle Lead (full authority)
- `facilitates` → Team Lead (facilitative authority)
- `convenes` → Steward (convening authority only)

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
| GOV-08 | Lead authority is explicit, never null for active circles | critical |

For complete invariant definitions, see `convex/admin/invariants/INVARIANTS.md`.

### Schema Changes for Governance

**circles table:**
```typescript
{
  workspaceId: v.id('workspaces'),
  name: v.string(),
  slug: v.string(),
  purpose: v.string(),                   // GOVERNANCE FIELD — required (GOV-02 for circles)
  parentCircleId: v.optional(v.id('circles')),
  leadAuthority: v.optional(...),        // 'decides' | 'facilitates' | 'convenes'
  status: v.union(v.literal('draft'), v.literal('active')),
  // ... audit fields
}
```

**circleRoles table:**
```typescript
{
  circleId: v.id('circles'),
  workspaceId: v.id('workspaces'),
  name: v.string(),
  purpose: v.string(),                   // GOVERNANCE FIELD — required (GOV-02)
  decisionRights: v.array(v.string()),   // GOVERNANCE FIELD — required (GOV-03)
  roleType: v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom')),
  templateId: v.optional(v.id('roleTemplates')),
  // ... other fields
}
// Index: by_circle_roleType ['circleId', 'roleType']
```

**roleTemplates table:**
```typescript
{
  workspaceId: v.optional(v.id('workspaces')),  // undefined = system template
  name: v.string(),
  roleType: v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom')),
  appliesTo: v.union(v.literal('decides'), v.literal('facilitates'), v.literal('convenes')),
  isCore: v.boolean(),                   // true = required for governance
  defaultPurpose: v.string(),            // Template's default purpose
  defaultDecisionRights: v.array(v.string()),  // Template's default decision rights
  description: v.optional(v.string()),
  createdByPersonId: v.optional(v.id('people')),  // undefined for system templates
  // ... audit fields
}
```

**customFieldValues table:** (see `features/customFields/tables.ts`)
```typescript
{
  workspaceId: v.id('workspaces'),
  definitionId: v.id('customFieldDefinitions'),
  entityType: v.union(v.literal('circle'), v.literal('role'), ...),
  entityId: v.string(),                  // ID of the role/circle
  value: v.string(),                     // The actual value (one record per value)
  searchText: v.optional(v.string()),    // Indexed for search
  // ... audit fields
}
// Used for CUSTOM fields (domain, strategy, etc.), NOT governance fields (purpose, decisionRights)
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
| `tables.ts` | Table definitions | **REQUIRED** (unless calculation-only) | `defineTable()` calls, indexes |
| `schema.ts` | Types and aliases | OPTIONAL | Type exports, re-exports from tables.ts or constants.ts |
| `constants.ts` | Runtime constants | OPTIONAL | Const objects with derived types, enums |

**Note:** Calculation-only domains (e.g., `authority`) that compute values from other domains without storing data do not require `tables.ts`. These domains consist of pure calculation functions and queries that read from other domains.

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
  leadAuthority: v.optional(v.union(...)),
  // ...
}).index('by_workspace', ['workspaceId']);
```

**Example constants.ts:**
```typescript
export const LEAD_AUTHORITY = {
  DECIDES: 'decides',
  FACILITATES: 'facilitates',
  CONVENES: 'convenes'
} as const;

export type LeadAuthority = (typeof LEAD_AUTHORITY)[keyof typeof LEAD_AUTHORITY];
```

**Example schema.ts:**
```typescript
import type { Doc } from '../../_generated/dataModel';
export type CircleDoc = Doc<'circles'>;
// Re-export types from constants.ts (single source of truth)
export type { LeadAuthority } from './constants';
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

### Entity vs Value Object (DDD)

SynergyOS distinguishes between **entities** (have identity, tracked over time) and **value objects** (defined by attributes, immutable).

| Concept | Identity | Mutability | Stored In | Examples |
|---------|----------|------------|-----------|----------|
| **Entity** | Has `_id`, tracked over lifetime | Mutable (via mutations) | Database table | Circle, Role, Person, Proposal, Workspace |
| **Value Object** | No identity, defined by values | Immutable | Inline field or computed | Authority, Decision Rights, Custom Field Value |
| **Aggregate Root** | Entity that owns consistency boundary | Mutable (via mutations) | Database table | Circle (owns Roles), Proposal (owns Objections) |

**When to Use Each:**

| Use Entity If... | Use Value Object If... |
|------------------|------------------------|
| Must track it over time (audit, history) | Values completely define it |
| Has lifecycle (created, updated, archived) | No lifecycle — just data |
| Referenced by ID from other entities | Embedded in entity or computed |
| Users care about its identity ("the Finance circle") | Users care about its value ("red", "high priority") |

**SynergyOS Examples:**

```typescript
// ✅ Entity — Circle has identity and lifecycle
{
  _id: 'circle_123',           // Identity
  name: 'Engineering',         // Mutable attributes
  leadAuthority: 'facilitates',
  createdAt: 1234567890,       // Tracked over time
  createdByPersonId: 'person_456',
  archivedAt: null             // Lifecycle state
}

// ✅ Value Object — Authority is computed, no identity
{
  canApproveProposals: true,
  canAssignRoles: false,
  canModifyCircleStructure: false
}
// ^ No _id, no lifecycle, no table — just computed values

// ✅ Value Object — Decision Rights embedded in role
{
  roleId: 'role_789',
  decisionRights: [            // Embedded value object
    'Approve technical designs',
    'Hire engineering team'
  ]
}
// ^ Decision rights have no identity — they're attributes of the role

// ✅ Entity — Custom Field Definition has identity
{
  _id: 'fieldDef_456',
  systemKey: 'domain',             // Custom fields (not governance fields)
  label: 'Domain',
  entityType: 'circle',
  workspaceId: 'ws_123'
}
// ^ Tracked, has lifecycle, referenced by ID

// ✅ Value Object — Custom Field Value is data
{
  definitionId: 'fieldDef_456',
  entityId: 'circle_123',
  value: 'Technical infrastructure'
}
// ^ No separate identity — it's an attribute value
// NOTE: purpose and decisionRights are NOT custom fields — they're governance fields in core schema
```

**Implementation Patterns:**

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Table with `_id`** | Entity | `circles`, `roles`, `people`, `proposals` |
| **Inline object field** | Value object owned by entity | `displayNames` in workspace |
| **Computed/derived** | Value object calculated from entities | `Authority` computed from roles |
| **Embedded array** | Collection of value objects | `decisionRights: string[]` |

**Key Insight:** In Convex, all tables store entities (with `_id`). Value objects are either:
1. Inline fields (e.g., `displayNames: { circle: "Team", ... }`)
2. Computed values (e.g., `calculateAuthority()` returns value object)
3. Primitive arrays (e.g., `decisionRights: string[]`)

Value objects never have their own table unless they need to be queried independently — then they become entities.

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

### Function Naming Conventions

Function names use prefixes that encode explicit contracts about behavior. This follows Design by Contract (Pragmatic Programmer) — expectations are visible at the call site.

**Comprehensive Naming Table:**

| Prefix | Returns | Use When | Precondition | Postcondition | Throws On Violation |
|--------|---------|----------|--------------|---------------|---------------------|
| `get___` | `T` (non-null) | Lookup that must succeed | ID/key must reference existing entity | Returns entity (non-null) | `NOT_FOUND` error |
| `find___` | `T \| null` | Lookup that may return nothing | None | Returns entity or `null` | Never throws |
| `list___` | `T[]` (non-null) | Return a collection | None | Returns array (may be empty, never null) | Never throws |
| `is___` / `has___` / `can___` | `boolean` | State/existence/permission checks | None | Returns boolean | Never throws |
| `create___` | `Id` | Create entity, return ID | Valid input data | Returns new entity ID | `VALIDATION_*` error |
| `update___` | `void` or `T` | Modify existing entity | Entity exists | Entity modified | `NOT_FOUND` error |
| `archive___` / `restore___` | `void` | Soft delete / un-archive | Entity exists | Status changed | Domain-specific error |
| `require___` | `T` (non-null) | Fetch-or-throw validation | Validation condition must be true | Returns entity (non-null) | Domain-specific error |
| `ensure___` | `void` | Validate invariant | Invariant must hold | `void` | Domain-specific error |
| `validate___` | `void` or `T` | Validation helpers | Input provided | Validation complete | `VALIDATION_*` error |
| `map___` | `T` or `T[]` | Transform data structure | Input provided | Transformed output | Never throws |

**Key Principle:** Callers can trust the contract. If `getCircleById` returns, it's a valid circle — no null checks needed. If it doesn't exist, an exception was already thrown.

#### Template Naming Conventions

**Principle:** Name describes the function's interface, not one caller's use case.

| Pattern | When to Use | Examples |
|---------|-------------|----------|
| `*Template()` | Function operates on actual template entity | `findLeadRoleTemplate()`, `getSystemTemplateByRoleType()` |
| `*FromTemplate()` | Function transforms FROM a template TO something else | `updateLeadRolesFromTemplate()` |
| `create*()` | Generic helper that creates records from structured data | `createCustomFieldValues()` |

**Key Insight:** A function that accepts `Array<{ systemKey, values }>` and creates records is generic, regardless of whether callers sometimes pass `template.defaultFieldValues`. The function name should reflect its interface, not one use case.

**Example Usage:**

```typescript
// ✅ CORRECT: Contract is clear from name
const circle = await getCircleById(ctx, circleId);
// No null check needed — postcondition guarantees non-null

const maybeCircle = await findCircleById(ctx, circleId);
if (!maybeCircle) {
  // Precondition: none. Postcondition: may be null
}

// ✅ CORRECT: ensure___ validates invariants
await ensureCircleHasLead(ctx, circleId);  // Throws if GOV-01 violated

// ✅ CORRECT: require___ fetches or throws
const person = await requirePersonForUser(ctx, userId, workspaceId);
// Postcondition: person exists and is active

// ❌ WRONG: Inconsistent contract
async function getCircleById(ctx, id) {
  const circle = await ctx.db.get(id);
  return circle;  // Returns null — violates "get" contract
}
```

### Use Case Pattern (Clean Architecture)

**Formerly:** "Handler Pattern"

Each mutation/query handler is a **use case** — a single business operation with clear inputs, outputs, and orchestration logic.

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

### Comments Philosophy (Clean Code)

Comments should explain *why*, not *what*. Code should be self-explanatory through naming and structure. When you find yourself writing a comment to explain *what* code does, refactor the code instead.

| Situation | ❌ Don't | ✅ Do |
|-----------|----------|-------|
| **Complex logic** | Add comment explaining steps | Extract to well-named function |
| **Business rule** | Comment the constant/condition | Use domain constant with explicit name |
| **Workaround** | Explain the hack | Document why it's necessary (ticket reference) |
| **Public API** | Repeat function signature in words | Document contract, edge cases, examples |
| **Invariant** | State the requirement | Use assertion with invariant ID |

**When Comments ARE Appropriate:**

1. **Why decisions were made** — architectural trade-offs, performance considerations
2. **Workarounds for external issues** — with ticket/issue references
3. **Non-obvious business rules** — regulatory requirements, domain expertise
4. **TODOs with context** — what's incomplete and why
5. **Complex algorithms** — when the algorithm itself is the point (not common in CRUD apps)

**Examples:**

```typescript
// ❌ BAD: Comment explains what code does
// Get the circle by ID and check if it exists
const circle = await ctx.db.get(circleId);
if (!circle) {
  throw new Error('Circle not found');
}

// ✅ GOOD: Use well-named function (contract is clear)
const circle = await getCircleById(ctx, circleId);
// No comment needed — function name explains intent

// ❌ BAD: Comment repeats code
// Loop through all roles and find circle lead
for (const role of roles) {
  if (role.roleType === 'circle_lead') {
    return role;
  }
}

// ✅ GOOD: Extract to named function
const findCircleLead = (roles: Role[]) => 
  roles.find(r => r.roleType === 'circle_lead');

// ✅ GOOD: Comment explains WHY
// WorkOS requires email verification before account linking.
// We store invited status to track pending verifications (SYOS-123).
if (person.status === 'invited') {
  await sendVerificationEmail(person.email);
}

// ✅ GOOD: Document non-obvious invariant
// GOV-01: Every circle must have exactly one circle_lead role.
// This is enforced at creation and validated by invariant checks.
await ensureCircleHasLead(ctx, circleId);
```

**Refactoring Checklist:**

Before writing a comment, ask:
1. Can I rename this variable/function to be clearer?
2. Can I extract this logic to a well-named function?
3. Can I use a domain constant instead of a magic value?
4. Is this comment explaining *why* (keep) or *what* (refactor)?

**Exception:** Top-level domain module documentation (`README.md`) should have extensive comments explaining architecture, invariants, and usage patterns. These are architectural documentation, not code comments.

---

## Frontend Patterns (Svelte 5)

**Status:** ✅ ENFORCED (51 composables, runes in use, patterns followed; "thin components" is guideline)

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

### Composable Location Decision

| Location | When to Use | Examples |
|----------|-------------|----------|
| `src/lib/composables/` | Reusable across multiple modules | `useCustomFields` (used by org-chart, projects, etc.) |
| `src/lib/modules/{module}/composables/` | Specific to one module | `useOrgChart` (only used in org-chart module) |
| `src/lib/stores/` | App-wide singleton state | Theme preference, activity tracking |

**Key question:** "Will another module need this?" If yes → shared composable. If no → module composable.

**Example:** `useCustomFields.svelte.ts` was moved from `modules/org-chart/composables/` to `lib/composables/` because custom fields are used by circles, roles, projects, and tasks — not just org-chart.

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

### Stacked Navigation Pattern

For hierarchical panel navigation (drilling into circles → roles → documents), use the shared stacked navigation composables.

**Key files:**
- `src/lib/composables/useStackedNavigation.svelte.ts` - Main contract
- `src/lib/infrastructure/navigation/constants.ts` - Layer type mappings

**Pattern documentation:** See `dev-docs/master-docs/architecture/stacked-navigation.md`

**Core principle:** Selection is derived from stack, not separately managed. This eliminates sync bugs between navigation and selection state.

```typescript
// ✅ CORRECT: Derive selection from stack
const navigation = getStackedNavigation();
const selectedCircleId = $derived(navigation.getTopmostLayer('circle')?.id);

// ❌ WRONG: Separate selection state
let selectedCircleId = $state(null); // Can get out of sync!
```

### URL State (Query Params) for Shareable UI

Use query parameters for **shareable, reloadable UI state** within a feature (tabs, filters, selected subviews). Keep the feature route path clean and stable; use query params for view state.

**Rules:**

- **Use SvelteKit shallow routing helpers**: always use `pushState` / `replaceState` from `$app/navigation` for URL state updates (never `window.history.*`).
- **Relative URL only**: pass `pathname + search + hash` (not `.href`) to `pushState/replaceState`.
- **Namespaced keys**: avoid collisions by giving each feature/component a unique key (e.g. `circleTab`, `roleTab`).
- **Merge patches**: URL updaters must preserve unrelated params (patch the current URL, don’t reconstruct from stale `$page.url`).

**Shared primitive:** `src/lib/composables/useUrlSearchParamSync.svelte.ts`

**Example:** org-chart deep links combine stacked navigation + tab state:

`/w/<slug>/chart?nav=c:...&circleTab=members`

### Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| `$state` for values that never change | `const` or plain variable |
| `.svelte.ts` for pure calculations | `.ts` file in `utils/` |
| `$effect` to derive state from other state | `$derived` or `$derived.by` |
| Reactive logic embedded in components | Extract to composable |
| Giant components with 50+ line functions | Extract to `utils/` |
| Everything in one `.svelte.ts` file | Split reactive vs pure logic |
| Hardcode field names/categories in templates | Iterate over `customFields.fields` from DB |
| Managing navigation selection separately | Derive from stacked navigation composable |

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

**Status:** ✅ ENFORCED (103 uses of archivedAt across all core domains)

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

**Status:** ✅ ENFORCED (complete implementation with constants and transitions)

**Source of truth:** `convex/core/proposals/constants.ts`

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

## Core Invariants

**Source of truth:** `convex/admin/invariants/INVARIANTS.md`

### What Are Invariants?

Explicit, testable statements about what must be true for CORE to be sound. They define the minimum viable organizational truth.

### Summary by Domain

| Domain | Invariants | Critical Count |
|--------|------------|----------------|
| Identity Chain (IDENT-*) | 13 | 10 |
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
| **Total** | **86** | **64 critical** |

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

### Tracer Bullet Development (Pragmatic Programmer)

**Pattern:** Build end-to-end functionality quickly to validate architecture, then fill in the details.

A tracer bullet is a minimal but complete implementation that goes through all layers:
- Frontend: Component that calls the API
- Backend: Mutation/query that touches the database
- Schema: Table definition
- Tests: Basic happy path

**Why "Tracer Bullet":** Like tracer ammunition that shows where bullets are going, tracer code shows where the architecture is going.

**When to Use:**

| Use Tracer Bullet | Don't Use Tracer Bullet |
|-------------------|------------------------|
| New feature with architectural uncertainty | Well-understood CRUD operation |
| Cross-layer integration (frontend ↔ backend) | Single-layer change (UI only) |
| Need to validate approach before investing | Refactoring existing code |
| Spike to inform design decisions | Production-ready implementation |

**SynergyOS Examples:**

1. **Governance System (Early Days)**:
   - Tracer: Create circle → assign lead → approve proposal
   - Validated: Three-layer model, core domains, authority calculation
   - Then: Added invariants, validation, edge cases

2. **Custom Fields (SYOS-960)**:
   - Tracer: Define field → attach to circle → display value
   - Validated: Generic field system works across entity types
   - Then: Added categories, validation, search, field types

3. **Guest Access (SYOS-868)**:
   - Tracer: Create guest person → grant resource access → verify isolation
   - Validated: personId isolation works, no userId leakage
   - Then: Added expiry, RBAC bridge, audit logging

**Tracer Bullet ≠ Prototype:**

| Tracer Bullet | Throwaway Prototype |
|---------------|-------------------|
| Production code, minimal but complete | Exploratory, will be discarded |
| Goes through all layers | Might skip layers (e.g., UI mockup only) |
| Kept and expanded | Thrown away after learning |
| Tests architecture decisions | Tests ideas, UX, feasibility |

**Implementation Pattern:**

```typescript
// ✅ Tracer Bullet: Minimal but complete
export const createMeeting = mutation({
  args: { 
    sessionId: v.string(), 
    circleId: v.id('circles'),
    title: v.string() 
  },
  handler: async (ctx, args) => {
    // Complete flow, minimal logic
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    const person = await getPersonByUserAndWorkspace(ctx, userId, workspaceId);
    
    // Basic validation (tracer)
    if (!args.title) throw new Error('Title required');
    
    // Write to database (tracer)
    const meetingId = await ctx.db.insert('meetings', {
      circleId: args.circleId,
      title: args.title,
      createdByPersonId: person._id,
      createdAt: Date.now()
    });
    
    return meetingId;
  }
});

// Later: Fill in details
// - Add agenda item support
// - Add participant tracking
// - Add meeting templates
// - Add recurring meetings
```

**Key Principle:** Tracer bullets let you see if you're hitting the target before you load all your ammunition.

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

**Full decision records available in**: `dev-docs/master-docs/architecture/decisions.md`

**Quick Reference:**

| ID | Decision | Impact |
|----|----------|--------|
| DR-001 | Convex as Backend | Real-time sync, no REST API |
| DR-002 | Svelte 5 for Frontend | Runes system, excellent reactivity |
| DR-003 | Functions Only, No Classes | Pure functions, better composition |
| DR-004 | Three-Layer Architecture | Core/Features/Infrastructure separation |
| DR-005 | Domain Cohesion over Technical Purity | Organize by domain, not by tech concern |
| DR-006 | Separate users and people Domains | Auth vs workspace identity isolation |
| DR-007 | Authority Calculated, Not Stored | Computed from roles, no sync bugs |
| DR-008 | Soft Delete via archivedAt | Timestamp-based, preserves history |
| DR-009 | Feature Code Naming Convention | `convex/features/` vs `src/lib/modules/` |
| DR-010 | Two-Scope RBAC Model | `systemRoles` (userId) vs `workspaceRoles` (personId) |
| DR-011 | Governance Fields in Core Schema | `purpose`/`decisionRights` in core tables, not customFields |

---

## Version History

**Recent Changes (Last 5 Versions):**

| Version | Date | Changes |
|---------|------|---------|
| 4.5 | 2026-01-05 | **Architecture.md Cleanup (SYOS-1063).** Removed: Known Tech Debt section (→ Linear tickets SYOS-1065, SYOS-1066), Legacy Migration Status section (operational tracking). Moved: Decision Records detail to `decisions.md`, archived version history 3.9–2.0 to `decisions.md`. Condensed: Domain Events section to high-level overview (marked 📋 PLANNED). Result: ~193 lines removed, focus on architectural patterns over project tracking. |
| 4.4 | 2026-01-05 | **Governance Fields Doctrine.** Added: "Governance Fields vs Custom Fields" section establishing clear distinction between invariant-required fields (purpose, decisionRights → core schema) and workspace-configurable fields (domain, strategy → customFieldValues). Updated: Schema examples for circles, circleRoles, roleTemplates to show governance fields in core tables. Added: DR-011 (Governance Fields in Core Schema). **Reverses**: SYOS-960, SYOS-961 which moved these fields to customFieldValues. Rationale: Invariant-required fields should be schema-enforced, not stored in flexible systems. |
| 4.3 | 2026-01-05 | **DDD, Clean Code, Clean Architecture, and Pragmatic Programmer patterns.** Added: Aggregate Boundaries section with consistency boundary table (DDD); Design by Contract formalization with precondition/postcondition table (Pragmatic Programmer); Comments Philosophy section with Do/Don't table (Clean Code); Bounded Contexts table making layer boundaries explicit (DDD); Entity vs Value Object guidance with SynergyOS examples (DDD); Anti-Corruption Layer pattern for external integrations (DDD); Screaming Architecture note on domain-revealing directory structure (Clean Architecture); Tracer Bullet Development section with implementation guidance (Pragmatic Programmer); Expanded Domain Events design guidance with event structure, naming conventions, and migration path (DDD). Updated: Renamed "Handler Pattern" to "Use Case Pattern" (Clean Architecture). Implementation: SYOS-1058. |
| 4.2 | 2025-12-19 | **Composable Location Guidance.** Added: "Composable Location Decision" section with table distinguishing `src/lib/composables/` (shared) vs `src/lib/modules/{module}/composables/` (module-specific) vs `src/lib/stores/` (global state). Added anti-pattern: "Hardcode field names/categories in templates" → "Iterate over `customFields.fields` from DB". Implementation: SYOS-963, SYOS-964, SYOS-967. |
| 4.1 | 2025-12-19 | **Placeholder People.** Added: People Status Lifecycle section documenting the four-status model (`placeholder` → `invited` → `active` → `archived`), timestamp semantics (`createdAt`, `invitedAt`, `joinedAt`), placeholder capabilities and limitations. Supports SYOS-999 (Placeholder People feature). |

**For older versions (4.0 and earlier)**, see `dev-docs/master-docs/architecture/decisions.md`

---

*This document is the single source of truth. Update it when decisions change.*