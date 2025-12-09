# SynergyOS Architecture

**Single Source of Truth** for all architectural principles, coding standards, and design decisions.

**Version**: 2.1  
**Last Updated**: 2025-12-07  
**Optimization Target**: AI-native development with domain cohesion

---

## Quick Reference

**Note:** Code Hygiene rules (Principles 26–33) are enforceable standards. Apply them to all Convex domain files alongside the core architecture principles. Legacy numbering is preserved for existing references; new principles use semantic IDs to avoid renumbering drift.

### The 25 Principles *(see Appendix E for enforcement definitions)*

| # | Principle | Enforcement |
|---|-----------|-------------|
| **Foundation** |||
| 1 | Core domains are foundational and complete (schema + queries + mutations + rules) | Directory structure |
| 2 | Core domains: circles, roles, people, assignments, proposals, policies, authority | Code review |
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

### Semantic ID Convention

| Prefix | Domain | Examples |
|--------|--------|----------|
| `core-` | Core domain principles | `core-complete`, `core-domains` |
| `dep-` | Dependency rules | `dep-layer-direction`, `dep-no-circular` |
| `cvx-` | Convex patterns | `cvx-queries-pure`, `cvx-auth-before-write` |
| `svelte-` | Svelte patterns | `svelte-thin-components`, `svelte-runes` |
| `lang-` | Domain language | `lang-terminology`, `lang-naming` |
| `quality-` | Code quality | `quality-pure-functions`, `quality-no-magic` |
| `test-` | Testing | `test-colocated`, `test-independent` |
| `hygiene-` | Code hygiene | `hygiene-handler-thin`, `hygiene-file-size` |
| `authz-` | Authorization | `authz-rbac-check`, `authz-authority-check` |
| `err-` | Error handling | `err-code-format`, `err-codes-central` |

### AI Development Rules (No Judgment Calls)

| Task | Location |
|------|----------|
| Add circle query | `/convex/core/circles/queries.ts` |
| Add circle mutation | `/convex/core/circles/mutations.ts` |
| Add circle business rule | `/convex/core/circles/rules.ts` |
| Add circle schema/type | `/convex/core/circles/schema.ts` |
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
| Person | Member, User |
| Authority | Permission |
| Workspace | Organization |

### Document Selection for AI

| Task | Read First |
|------|------------|
| Backend logic, domain code, structure | This document (ARCHITECTURE.md) |
| UI component, styling, tokens | DESIGN-SYSTEM.md |
| Auth changes | workos-convex-auth-architecture.md |
| Permission/access control logic | rbac/rbac-architecture.md |

### Related Documentation

| Document | Use When |
|----------|----------|
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | Implementing UI components, styling, tokens, recipes |
| [RBAC Architecture](./rbac/rbac-architecture.md) | Working on access control features |
| [WorkOS Auth](./workos-convex-auth-architecture.md) | Working on authentication |

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
│  /convex/features/ (meetings, tensions, projects)           │
└──────────────────────────┬──────────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────────┐
│  Core Layer                                                 │
│  /convex/core/ (circles, roles, authority, proposals...)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────────┐
│  Infrastructure Layer                                       │
│  /convex/infrastructure/ (auth, events)                     │
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
├── core/                           # Foundational domains (COMPLETE)
│   ├── circles/
│   │   ├── schema.ts               # Convex schema definitions
│   │   ├── queries.ts              # Read operations (ctx.db)
│   │   ├── mutations.ts            # Write operations (ctx.db)
│   │   ├── rules.ts                # Business rules (pure OR contextual)
│   │   ├── index.ts                # Public exports only
│   │   └── circles.test.ts         # All tests for this domain
│   ├── roles/
│   ├── people/
│   ├── assignments/
│   ├── proposals/
│   ├── policies/
│   └── authority/
│
├── features/                       # Application features (compose core)
│   ├── meetings/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── rules.ts
│   │   ├── index.ts
│   │   └── meetings.test.ts
│   ├── tensions/
│   └── projects/
│
└── infrastructure/                 # Cross-cutting concerns
    ├── auth/
    └── events/

/src/
├── lib/
│   ├── components/
│   │   ├── ui/                     # Styled components (shared)
│   │   │   └── primitives/         # Unstyled base components
│   │   └── [feature]/              # Feature-specific components
│   └── composables/                # Shared UI logic (.svelte.ts)
└── routes/                         # SvelteKit routes (thin)

/tests/
└── integration/                    # Cross-domain workflow tests

/e2e/                               # End-to-end tests
```

### Core Domains (The Seven Pillars)

These domains form the kernel. Everything else builds on top:

| Domain | Purpose | Key Responsibilities |
|--------|---------|---------------------|
| **Circles** | Organizational containers | Hierarchy, membership, types |
| **Roles** | Authority distribution units | Definition, accountabilities, domains |
| **People** | Humans in the system | Identity, profile |
| **Assignments** | People filling roles | Role ↔ Person mapping, terms |
| **Proposals** | Change mechanism | Lifecycle, consent tracking |
| **Policies** | Constraints within circles | Rules, permissions by circle |
| **Authority** | Permission calculation | Derives authority from roles |

**Circle Lead Authority** belongs in core — it's the bootstrap mechanism that makes self-management practical.

---

## Authority Architecture

### Core Responsibility: Organizational Truth

Core provides factual answers about organizational state:

```typescript
// Core answers these questions:
hasRole(person, circle, 'Facilitator')     // → true/false
isCircleLead(person, circle)               // → true/false
isCircleMember(person, circle)             // → true/false
getCircleType(circle)                      // → 'hierarchy' | 'empowered_team' | 'guild'
calculateAuthority(person, circle)         // → Authority object
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

### Decision Boundary

**Ask**: "Is this about organizational structure or feature behavior?"

| If... | Then... |
|-------|---------|
| Rule defines WHO has authority in the org | Core |
| Rule defines WHAT you can do in a feature | Feature (compose from core) |
| Rule affects consent/proposals/governance | Core |
| Rule is specific to one module's workflow | Feature |

### Anti-Patterns

| ❌ Anti-Pattern | Why It's Wrong |
|----------------|----------------|
| Feature defines its own role checks | Duplicates core, will drift |
| Feature hardcodes user IDs | Bypasses authority model |
| Core includes feature-specific logic | Core becomes bloated |
| Feature queries DB directly for roles | Breaks single source of truth |

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

### Where They Interact

Organizational roles and RBAC can be *explicitly mapped* by workspace admins:
- Workspace admin can say "Circle Leads get `circle.members.invite` permission"
- But this is a workspace-level policy, not inherent to the Circle Lead role
- This keeps security explicit while allowing flexibility

### Key Principle

> Organizational roles define *domain authority* (what you're accountable for).
> RBAC defines *system capabilities* (what features you can use).
> They are intentionally separate to maintain security boundaries.

For RBAC implementation details, see [RBAC Architecture](./rbac/rbac-architecture.md).

### Authorization Check Flow

1. **Get authenticated user**
   - If missing → throw `AUTH_REQUIRED: Authentication required`.
2. **Check RBAC capability** (system-level)
   - Call `hasCapability(user, requiredCapability)`.
   - If false → throw `AUTHZ_INSUFFICIENT_RBAC: Missing {capability}`.
3. **Check Authority** (domain-level)
   - Call the domain rule (e.g., `isCircleLead`, `isCircleMember`, `hasRole`, `canApproveProposal`).
   - If false → throw domain-specific error (e.g., `AUTHZ_NOT_CIRCLE_LEAD`).
4. **Both must pass** — order matters for clarity.
   - RBAC failure → system configuration issue.
   - Authority failure → organizational structure issue.

---

## Code Standards
See also: [Code Style Notes](./code-style-notes.md) for supplementary readability guidance.

### Function Types (In Order of Preference)

| Type | When to Use | Example |
|------|-------------|---------|
| **Pure Functions** | Calculations, transformations | `calculateAuthority(roles)` |
| **Convex Queries** | Reads with reactivity | `getCircleById(ctx, id)` |
| **Convex Mutations** | Writes with validation | `createProposal(ctx, data)` |
| **Rule Functions** | Business logic (pure or contextual) | `canApproveProposal(ctx, person, circle)` |
| **Helper Functions** | Small reusable utilities | `formatCircleName(name)` |
| **Component Functions** | UI logic only | `toggleDropdown()` |

### Decision Tree

```
Need to read data?              → Convex Query (queries.ts)
Need to write data?             → Convex Mutation (mutations.ts)
Business rule or validation?    → Rule Function (rules.ts)
Calculate without side effects? → Pure Function (rules.ts or helpers.ts)
UI-specific logic?              → Component Function (in .svelte)
```

### Code Examples

```typescript
// ✅ DO: Types + Functions
type Circle = { 
  _id: Id<"circles">; 
  name: string; 
  parentId?: Id<"circles">; 
};

function canAddRole(circle: Circle, person: Person): boolean {
  // Pure calculation
}

// ❌ DON'T: Classes
class Circle {
  constructor(public name: string) {}
  canAddRole() { ... }
}
```

```typescript
// ✅ DO: Business logic in Convex
// /convex/core/circles/mutations.ts
export const create = mutation({
  args: { name: v.string(), parentId: v.optional(v.id("circles")) },
  handler: async (ctx, args) => {
    // Validation here
    if (args.name.length < 2) throw new Error("Name too short");
    // Authorization here
    const canCreate = await canCreateCircle(ctx, ctx.auth.userId);
    if (!canCreate) throw new Error("Not authorized");
    // Then write
    return ctx.db.insert("circles", args);
  },
});

// ❌ DON'T: Business logic in components
<script lang="ts">
  function validateAndSave() {
    if (name.length < 2) { ... } // Wrong place!
  }
</script>
```

### Handler Pattern (Thin Orchestration)

Keep handlers as orchestration only. Auth, validation, rule checks, writes, and audit live in helpers. Target ≤20 lines in the handler body by extracting helpers.

```typescript
export const approve = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const proposal = await requireProposal(ctx, args.proposalId);

    assertCanApprove(user, proposal);
    validateProposalState(proposal, "pending");

    const updated = await transitionProposal(ctx, proposal, "approved", user);
    await emitProposalApproved(ctx, updated);

    return updated._id;
  },
});
```

**Helper location**: Auth helpers (`requireAuth`, `requirePerson`) live in `convex/infrastructure/auth/helpers.ts`. See Appendix C for error codes these helpers throw.
Domain fetchers like `requireProposal`, `requireCircle`, `requirePerson` live in each domain’s `rules.ts`.

**Auth guard (CI + local)**: `npm run guard:auth` blocks legacy helpers (`getAuthUserId`, `getUserIdFromSession`) and public queries/mutations/actions that accept `userId` in `args`. Known debt is tracked in `scripts/auth-guard-baseline.json`—burn entries down when refactoring. Always pass `sessionId` and call `validateSessionAndGetUserId(ctx, sessionId)` in handlers.

### Svelte 5 Patterns

```typescript
// ✅ Correct rune usage
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log(`Count changed to ${count}`);
});

// ✅ Props are readonly
let { circleId, onUpdate } = $props();

// ✅ Component delegates to Convex
<script lang="ts">
  import { useQuery, useMutation } from "convex-svelte";
  import { api } from "$convex/_generated/api";
  
  const circles = useQuery(api.core.circles.queries.list);
  const createCircle = useMutation(api.core.circles.mutations.create);
</script>
```

### Module API Pattern (Cross-Feature Communication)

When features need to expose functionality:

```typescript
// Feature defines its API
interface MeetingsModuleAPI {
  useAgenda: () => AgendaState;
  useTimer: () => TimerState;
}

// Provider sets context
setContext('feature:meetings', createMeetingsAPI());

// Consumer retrieves from context
const meetings = getContext<MeetingsModuleAPI>('feature:meetings');
```

**Context key naming**: `'feature:meetings'`, `'feature:projects'`

---

## Frontend Architecture

### Directory Structure

```
src/lib/
├── components/
│   ├── atoms/              # Single elements (Button, Badge, Input)
│   ├── molecules/          # Combined atoms (FormField, SearchBar)
│   └── organisms/          # Complex sections (Dialog, Header)
├── modules/[module]/
│   ├── components/         # Feature-specific components
│   └── composables/        # Feature-specific logic (.svelte.ts)
├── infrastructure/
│   └── [area]/             # Cross-cutting (auth, analytics, rbac)
└── composables/            # Shared UI logic (.svelte.ts)
```

### Component Location Rules

| Component Type | Location | Can Import From |
|----------------|----------|-----------------|
| Atom | `components/atoms/` | Nothing (base level) |
| Molecule | `components/molecules/` | Atoms only |
| Organism | `components/organisms/` | Atoms, Molecules |
| Feature | `modules/[module]/components/` | Atoms, Molecules, Organisms |
| Infrastructure | `infrastructure/[area]/` | Atoms, Molecules |

**Critical rule**: Feature components MUST NOT cross module boundaries.

```typescript
// ✅ CORRECT: Import from shared components
import { Button, Card } from '$lib/components/atoms';
import { FormField } from '$lib/components/molecules';

// ❌ WRONG: Cross-module import
import { InboxCard } from '$lib/modules/inbox/components'; // From meetings module
```

### Styling Rule (Critical)

All component styling MUST use the recipe system:

```typescript
// ✅ CORRECT: Use recipe
import { buttonRecipe } from '$lib/design-system/recipes';
const classes = buttonRecipe({ variant: 'primary', size: 'md' });

// ❌ WRONG: Direct utility classes for variants
const classes = variant === 'primary' ? 'bg-blue-500' : 'bg-gray-100';

// ❌ WRONG: Hardcoded values
<div class="px-4 py-2 bg-gray-100">  // Should use tokens
```

**Why**: Direct utility classes bypass the design system and cause visual drift. When a design token changes, components using recipes update automatically. Hardcoded values don't.

### Function Prefixes (all functions)

| Prefix | Returns | Use When |
| -- | -- | -- |
| **Lookups** |  |  |
| `find___` | `T \| null` | Lookup that may return nothing |
| `get___` | `T` (throws if missing) | Lookup that must succeed |
| `list___` | `T[]` (non-null) | Return a collection |
| **Boolean checks** |  |  |
| `is___` / `has___` / `can___` | `boolean` | State/existence/permission checks |
| **Mutations** |  |  |
| `create___` | `Id` | Create entity, return ID |
| `update___` | `void` or `T` | Modify existing entity |
| `archive___` / `restore___` | `void` | Soft delete / un-archive |
| **State transitions** |  |  |
| `start___` / `close___` / `advance___` / `submit___` / `approve___` / `reject___` / `withdraw___` | `void` or domain type | Move between states |
| **Collections** |  |  |
| `add___` / `remove___` / `assign___` | `void` or `Id` | Manage membership/collection items |
| **Invitations** |  |  |
| `accept___` / `decline___` / `resend___` | `void` or `Id` | Invitation flows |
| **Status updates** |  |  |
| `mark___` / `set___` | `void` or `T` | Update status/flags/fields |
| **Import/export** |  |  |
| `import___` / `record___` | `T` or `void` | Import data or record events |
| **Transform/utilities** |  |  |
| `normalize___` / `slugify___` / `calculate___` / `count___` / `describe___` / `seed___` / `reorder___` | `T` | Data transforms, counts, seeds, ordering |
| `parse___` | `T` | String → structured data |
| `fetch___` | `T` | External API call |
| **Validation & context** |  |  |
| `require___` | `T` (throws if invalid/missing) | Fetch-or-throw/validate and return |
| `ensure___` | `void` (throws if invalid) | Validate condition, no return value |
| `validate___` / `assert___` | `void` or `T` | Validation/assertion helpers |
| `with___` | callback result | Setup context, then run callback |
| **Modifier** |  |  |
| `my___` | Combines with any base | Scope to authenticated user (e.g., `myListDrafts`) |

Unknown prefixes (e.g., `delete___`, `upsert___`) are not allowed. AI rule reference: `.cursor/rules/naming-conventions.mdc`. Keep this table and the linter (`scripts/lint-naming`) in sync.

### Non-Function Naming

| Type | Convention | Example |
|------|------------|---------|
| Svelte component | PascalCase | `CircleCard.svelte` |
| Composable | `use` prefix, camelCase | `useCircleForm.svelte.ts` |
| Recipe | `{name}Recipe`, camelCase | `buttonRecipe.ts` |
| Context creator | `create{Name}Context` | `createAuthContext.ts` |
| Convex query | Verb, camelCase | `getCircleById`, `listCircles` |
| Convex mutation | Verb, camelCase | `createCircle`, `approveProposal` |
| Rule function | `can` / `is` prefix | `canApproveProposal`, `isCircleLead` |
| Error code | SCREAMING_SNAKE | `AUTH_REQUIRED` |
| Type | PascalCase | `Circle`, `ProposalState` |
| Constant | SCREAMING_SNAKE | `MAX_CIRCLE_DEPTH` |

For recipe implementation patterns, token usage, and styling details, see [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md).

### Composables Pattern

Use `.svelte.ts` files for reusable UI logic:

```typescript
// useCircleForm.svelte.ts
export function useCircleForm(initialData: Circle | null) {
  const state = $state({
    name: initialData?.name ?? '',
    isDirty: false
  });

  return {
    get name() { return state.name; },
    get isDirty() { return state.isDirty; },
    setName(value: string) {
      state.name = value;
      state.isDirty = true;
    }
  };
}
```

**Location**:
- Shared composables → `src/lib/composables/`
- Feature-specific → `src/lib/modules/[module]/composables/`

---

## Testing Strategy

### Testing Pyramid

```
          ╱╲
         ╱E2E╲           5-10 smoke tests (critical paths)
        ╱──────╲
       ╱  BDD   ╲        30-75 scenarios (user journeys)
      ╱──────────╲
     ╱Integration ╲      Cross-domain workflows
    ╱──────────────╲
   ╱   Unit Tests   ╲    Core domain logic (highest volume)
  ╱══════════════════╲
```

### Test Location (Co-located)

| Test Type | Location | Naming |
|-----------|----------|--------|
| Unit tests | Next to source | `{domain}.test.ts` |
| Integration | `/tests/integration/` | `{workflow}.test.ts` |
| E2E | `/e2e/` | `{flow}.spec.ts` |
| BDD features | `/features/` | `{domain}.feature` |

**Why co-located unit tests:**
- Proximity = visibility (missing tests are obvious)
- Refactoring stays atomic (move module, tests move with it)
- Discourages test interdependence
- Simple import paths

**Example:**
```
convex/core/circles/
├── schema.ts
├── queries.ts
├── mutations.ts
├── rules.ts
├── index.ts
└── circles.test.ts      ← Tests ALL of the above
```

### Coverage Requirements

| Layer | Coverage | Rationale |
|-------|----------|-----------|
| Core domains | 100% | Foundation must be solid |
| Features | 80%+ | Key workflows covered |
| Infrastructure | 90%+ | Auth/events are critical |

### Test Quality Rules

1. **Tests are independent** — no test depends on another
2. **Behavior-focused** — test scenarios, not implementation
3. **Fast feedback** — unit tests run in seconds
4. **No cross-test imports** — each test file is standalone

### Minimum Viable Testing (Before Every Push)

```bash
npm run check          # Type safety (2 seconds)
npm run test           # Unit tests (30 seconds)
# Manual smoke test    # 5 minutes
```

**Definition of Done**: Would you be comfortable having a neutral facilitator demo it to an executive board without you in the room?

### Required Test Cases

**Per Mutation**

| Case | What to Assert |
|------|----------------|
| Success | Returns expected ID/data; DB state correct |
| Unauthorized (no auth) | Throws `AUTH_REQUIRED` |
| Unauthorized (wrong role/RBAC) | Throws appropriate `AUTHZ_*` code |
| Invalid input | Throws `VALIDATION_*` code |
| Business rule violation | Throws domain-specific error (e.g., `PROPOSAL_INVALID_STATE`) |

**Per Query**

| Case | What to Assert |
|------|----------------|
| Success | Returns expected shape |
| Unauthorized | Throws `AUTH_REQUIRED` or returns filtered/empty |
| Not found / missing input | Returns null/empty (not error) |

---

## Development Workflow

### Trunk-Based Development

- Single branch: `main`
- Small, frequent commits
- Feature flags hide incomplete work
- Deploy frequently

### Commit Discipline

```bash
# ✅ Good: Separate refactoring from features
git commit -m "refactor: extract authority calculator"
git commit -m "feat: add Circle Lead approval flow"

# ❌ Bad: Mixed concerns
git commit -m "Add approval and refactor authority"
```

### Refactoring Rules

- **Boy Scout Rule**: Leave code cleaner than you found it
- **Rule of Three**: Tolerate duplication twice, refactor on third
- **Separate commits**: Refactoring commits separate from feature commits

---

## Configuration Standards

### Environment Variables

```typescript
// ✅ RIGHT: Single source, derived values
const APP_URL = requireEnv('PUBLIC_APP_URL');
const WORKOS_REDIRECT_URI = `${APP_URL}/auth/callback`;

// ❌ WRONG: Multiple independent configs
const redirectUri = env.WORKOS_REDIRECT_URI;
const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
```

### Rules

1. Environment-specific values in env vars
2. Required config validated at startup (fail fast)
3. Derived values computed from single source
4. No silent fallbacks to development values in production

---

## Red Flags (Audit Patterns)

Search for these during code review:

| Red Flag | Violation | Detection |
|----------|-----------|-----------|
| Business logic in UI | Principle 10, 12 | `grep -rn "ctx.db" src/` |
| Core importing features | Principle 5 | `grep -r "from.*features" convex/core/` |
| Classes in codebase | Principle 11 | `grep -rn "^class " convex/ src/` |
| Handler > 20 lines | Principle 26 | Line count in `queries.ts`/`mutations.ts` |
| Inline type cast | Principle 29 | `grep -rn "as unknown as" convex/` |
| File > 300 lines | Principle 32 | `wc -l convex/**/*.ts` |
| Implicit authority | Principle 4 | `grep -rn "role ===" convex/` |
| Wrong terminology | Principle 15 | `grep -rin "\"team\"" convex/ src/` |
| Tests in wrong location | Principle 21 | Unit tests not next to source |
| Test interdependencies | Principle 23 | `grep -r "import.*\.test"` |
| Hardcoded fallbacks | Config rules | `grep -rn "\|\| 'http://localhost"` |

---

## Decision Records

### DR-001: Convex as Backend

**Status**: Accepted  
**Date**: 2025-12-06

**Decision**: Use Convex instead of traditional REST API + database.

**Rationale**: Real-time sync eliminates manual state management. Queries provide reactive subscriptions. Mutations handle validation and business logic. Reduces boilerplate significantly.

**Consequences**: Business logic must live in Convex functions. Frontend becomes purely presentational. Testing focuses on Convex functions.

---

### DR-002: Svelte 5 for Frontend

**Status**: Accepted  
**Date**: 2025-12-06

**Decision**: Use Svelte 5 with runes system.

**Rationale**: Excellent reactivity with runes. No virtual DOM overhead. Composables pattern for reusable logic. Natural fit with Convex reactive queries.

**Consequences**: Components must be thin (presentation only). Business logic stays in Convex. Use composables for shared UI logic.

---

### DR-003: Functions Only, No Classes

**Status**: Accepted  
**Date**: 2025-12-06

**Decision**: Zero classes in codebase — pure functions only.

**Rationale**: Functions compose better than classes. Easier to test. Aligns with Convex + Svelte functional approach.

**Consequences**: Use types for data structures, functions for behavior. Pure functions for calculations. Service functions for orchestration.

---

### DR-004: Three-Layer Architecture

**Status**: Accepted  
**Date**: 2025-12-06

**Decision**: Organize code into Core/Features/Infrastructure layers with explicit dependencies.

**Rationale**: Core must be stable before building features. Prevents spaghetti dependencies. Enables independent evolution. Clear boundaries for testing.

**Consequences**: Core cannot import from features. Features compose core. Clear dependency direction.

---

### DR-005: Trunk-Based Development

**Status**: Accepted  
**Date**: 2025-12-06

**Decision**: Single main branch, feature flags for incomplete work.

**Rationale**: Reduces merge conflicts. Faster feedback loop. Simpler for solo/small team.

**Consequences**: Small, frequent commits. Feature flags hide incomplete work. Deploy frequently.

---

### DR-006: Domain Language Enforcement

**Status**: Accepted  
**Date**: 2025-12-06

**Decision**: Code must use practitioner terminology (circles, roles, proposals, etc.).

**Rationale**: Reduces cognitive load. Code matches how users think. Ubiquitous language principle from DDD.

**Consequences**: Enforce in code reviews. Update legacy terms. Document for new contributors.

---

### DR-007: Authority Calculated, Not Stored

**Status**: Accepted  
**Date**: 2025-12-06

**Decision**: Authority is computed from roles, not stored as user attributes.

**Rationale**: Single source of truth (roles). No synchronization bugs. Easier to test. Audit trail through role assignments.

**Consequences**: Authority calculator is critical core component. Must be highly tested.

---

### DR-008: Co-located Unit Tests

**Status**: Accepted  
**Date**: 2025-12-06

**Decision**: Unit tests live next to their source files (`circles.test.ts` next to `circles/`).

**Rationale**: Proximity = visibility. Refactoring stays atomic. Discourages test interdependence. Simple imports.

**Consequences**: Integration tests remain in `/tests/integration/`. E2E in `/e2e/`.

---

### DR-009: Domain Cohesion over Technical Purity

**Status**: Accepted  
**Date**: 2025-12-06

**Decision**: Organize by domain, not by technical concern (pure vs. impure). Core domains include schema, queries, mutations, and rules together.

**Rationale**: Domain cohesion reduces cognitive load. "Working on circles" means one directory. Eliminates judgment calls for AI development. Purity is a function property, not a location property.

**Consequences**: No separate "pure logic" layer. Business rules in `rules.ts` can be pure or contextual. Everything about a domain lives together.

**Alternatives Rejected**:
- Separate `/core/` (pure) and `/modules/` (DB) — fragments domains
- Purity as organizational principle — requires judgment calls

---

## Reference Appendices

### A. Rules Scope Definition

- **Pure rules**: No `ctx` access; `(args) =>` signature; live in `rules.ts`.
- **Contextual rules**: Require `ctx`/`ctx.db`; `(ctx, ...args) =>` signature; live in `rules.ts`; imported by queries/mutations.
- **Location**: All business rules (pure or contextual) live in the domain’s `rules.ts`. Queries/mutations call them; components never do.

**Examples**

```typescript
// rules.ts — Pure rule
export function isValidCircleName(name: string): boolean {
  return name.length >= 2 && name.length <= 100;
}
```

```typescript
// rules.ts — Contextual rule
export async function canApproveProposal(
  ctx: QueryCtx,
  userId: Id<"people">,
  proposal: Doc<"proposals">
): Promise<boolean> {
  const circle = await ctx.db.get(proposal.circleId);
  if (!circle) return false;
  return isCircleLead(ctx, userId, circle._id);
}
```

**Entity fetchers**: Functions like `requireProposal`, `requireCircle` that fetch-or-throw belong in the domain’s `rules.ts` alongside validation rules. Pattern: `require{Entity}(ctx, id)` → returns entity or throws `{ENTITY}_NOT_FOUND`.

### B. Proposal State Machine

| From | To | Triggered By | Guard Rule |
|------|----|--------------|------------|
| draft | pending | Proposer | `canSubmitProposal(ctx, user, proposal)` |
| draft | withdrawn | Proposer | `canWithdrawProposal(ctx, user, proposal)` |
| pending | approved | Circle Lead | `canApproveProposal(ctx, user, proposal)` |
| pending | objected | Any Circle Member | `canRaiseObjection(ctx, user, proposal)` |
| pending | withdrawn | Proposer | `canWithdrawProposal(ctx, user, proposal)` |
| objected | pending | Proposer (after addressing) | `canResubmitProposal(ctx, user, proposal)` |
| objected | withdrawn | Proposer | `canWithdrawProposal(ctx, user, proposal)` |
| approved | enacted | System/Lead (on enactment) | `canEnactProposal(ctx, user, proposal)` |

Terminal states: `enacted`, `withdrawn` (no outgoing transitions).

### C. Error Codes

- Source of truth: `convex/infrastructure/errors/codes.ts`.
- Format: `ERR_CODE: message` (e.g., `AUTH_REQUIRED: Authentication required`).
- Add new codes to the file **before** using them in handlers or rules.
- Seeded codes: `AUTH_REQUIRED`, `AUTH_INVALID_TOKEN`, `AUTHZ_NOT_CIRCLE_MEMBER`, `AUTHZ_NOT_CIRCLE_LEAD`, `AUTHZ_INSUFFICIENT_RBAC`, `PROPOSAL_INVALID_STATE`, `PROPOSAL_NOT_FOUND`, `VALIDATION_REQUIRED_FIELD`, `VALIDATION_INVALID_FORMAT`.

### D. Feature Dependency Decision Tree

1. Prefer no feature-to-feature imports.
2. If two features need the same behavior, consider lifting to core (if domain-wide) or infrastructure (if cross-cutting).
3. Otherwise use events: feature emits, other feature reacts.
4. If direct dependency is unavoidable, declare an explicit `feature.manifest.ts` contract and import only via that contract.

### E. Enforcement Legend

| Enforcement | Meaning |
|-------------|---------|
| CI gate | Automated, blocks merge |
| Lint rule | Automated, warns or blocks |
| AI pre-commit | Planned, not implemented |
| Manual review | Human catches this |

### F. Common AI Mistakes

| Mistake | Why It Happens | Correct Approach |
|---------|----------------|------------------|
| Auth check after DB read | “Check if exists first” | Auth before any DB access |
| Creating new type instead of reusing | Doesn’t search existing | Search `schema.ts` and domain types first |
| Putting validation in component | Quick client-side check | All validation in mutation handler |
| Using "team" in code/comments | Common industry term | Always use "circle" |
| Exporting internal helpers directly | Seems useful | Export only via `index.ts` contract |
| Feature importing another feature | Direct path works | Use core, events, or manifest |

### G. Architecture Evolution Triggers

Update this document when:
- A new domain is added to core.
- A pattern is used 3+ times and should be canonical.
- A decision record is needed for a non-obvious choice.
- An AI agent repeats the same mistake (add to Common Mistakes).

### H. Module Export Contract (`index.ts`)

Each domain’s `index.ts` defines its public API. Only export:

- Types needed by consumers
- Rule functions needed by other domains
- (Queries and mutations are accessed via `api.*`; no need to re-export)

Never export:
- Schema definitions
- Internal helpers
- Domain-internal constants

Example:

```typescript
// convex/core/circles/index.ts

export type { Circle, CircleType } from './schema';
export { isCircleLead, isCircleMember, canCreateCircle } from './rules';
// Queries/mutations are consumed via api.core.circles.*
```

---

## Checklist: Before Every Commit

```markdown
## Before Writing Code
- [ ] Which domain does this belong to?
- [ ] Am I using correct terminology? (circles, roles, tensions, proposals)
- [ ] Will this create a dependency? → Verify direction

## While Writing Code  
- [ ] Functions only, no classes
- [ ] Functions do one thing
- [ ] Authorization checked BEFORE data writes
- [ ] No hardcoded magic values

## Before Committing
- [ ] Unit test co-located? (`domain.test.ts`)
- [ ] Tests independent?
- [ ] Domain language correct?
- [ ] No business logic in components?
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1 | 2025-12-07 | Added appendices A-H, error codes file, auth helpers, proposal state machine, semantic ID convention. AI-native refinements. |
| 2.0 | 2025-12-06 | Consolidated from 3 docs. Domain cohesion model. AI-native optimization. |
| 1.x | 2025-12 | Original drafts (superseded) |

---

*This document is the single source of truth. Update it when decisions change.*