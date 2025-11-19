validate if its resolved correctly (within ticket scope/criteria). If yes. update /linear ticket

- NEVER update our ticket after finding a problem and making edits in our code. This requires a new round of validation by me and you.
- NEVER create an MD document. Keep everything inside the relevant ticket. if no ticket exists, return your feedback as a chat comment.

## Validation Checklist

### 1. Functional Validation

- ✅ Code works as specified (within ticket scope/criteria)
- ✅ No regressions introduced
- ✅ Edge cases handled appropriately

### 2. Modularity Validation ⭐ **MANDATORY**

**Reference**: [System Architecture - Modularity](dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system)

**Quick Checks** (if new module/feature added):

- [ ] **Feature Flag Created?** → New module has flag in `src/lib/featureFlags.ts` and `convex/featureFlags.ts`
- [ ] **Per-Org Enablement?** → Uses `allowedOrganizationIds` targeting (if applicable)
- [ ] **Loose Coupling?** → No direct imports from other modules' internals (`src/lib/components/[other-module]/`)
- [ ] **Module Boundaries?** → Uses shared utilities (`src/lib/utils/`, `src/lib/types/`) or documented APIs
- [ ] **Hardcoded Dependencies?** → Module doesn't assume another module is always enabled

**If violations found**: Document in ticket comment, mark ticket as needs work (don't mark as done).

**Common Violations**:

- ❌ New module without feature flag
- ❌ Direct imports: `import { X } from '../other-module/Component.svelte'`
- ❌ Missing per-org targeting for org-specific modules
- ❌ Module assumes another module exists without checking flag

**After validation, add a brief summary comment (2-3 sentences max) that explains what was done and why it matters in simple, non-technical terms.** This helps non-developers understand the value quickly.

Example format:

```
**Summary:** [What we did in 1 sentence]. [Why it matters in 1-2 sentences - focus on impact/value, not technical details].
```
