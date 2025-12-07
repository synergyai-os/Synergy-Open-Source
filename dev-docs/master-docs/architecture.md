# SynergyOS Architecture

**Single Source of Truth** for all architectural principles, coding standards, and design decisions.

**Version**: 2.0  
**Last Updated**: 2025-12-06  
**Optimization Target**: AI-native development with domain cohesion

---

## Quick Reference

**Note:** Code Hygiene rules (Principles 26–33) are enforceable standards. Apply them to all Convex domain files alongside the core architecture principles.

### The 25 Principles

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
| 2.0 | 2025-12-06 | Consolidated from 3 docs. Domain cohesion model. AI-native optimization. |
| 1.x | 2025-12 | Original drafts (superseded) |

---

*This document is the single source of truth. Update it when decisions change.*