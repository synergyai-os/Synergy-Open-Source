# Documentation Audit & Cleanup Plan

**Date:** 2025-01-27  
**Total Markdown Files:** 186 (excluding node_modules, test-results, etc.)  
**Goal:** Reduce to ~50 ACTIVE docs that AI agents should read

---

## Classification Framework

| Category    | Criteria                                                      | Count | Action                              |
| ----------- | ------------------------------------------------------------- | ----- | ----------------------------------- |
| **ACTIVE**  | Referenced in architecture.md, used by AI, currently accurate | ~50   | Keep in place                       |
| **ARCHIVE** | Historical value (decisions, investigations), but outdated    | ~80   | Move to `dev-docs/archive/YYYY-MM/` |
| **DELETE**  | Superseded, wrong, duplicate, or one-off notes                | ~56   | Delete                              |

---

## ACTIVE (Keep in Place)

### Source of Truth (dev-docs/master-docs/)

**These are the ONLY docs AI agents should read for architecture/design decisions.**

```
dev-docs/master-docs/
├── architecture.md                    ✅ ACTIVE
├── architecture/
│   ├── circle-types.md                ✅ ACTIVE
│   ├── governance-design.md           ✅ ACTIVE
│   └── url-strategy.md                ✅ ACTIVE
├── code-style-notes.md                ✅ ACTIVE
├── design-system.md                   ✅ ACTIVE
├── global-business-rules.md          ✅ ACTIVE
├── product-strategy.md                ✅ ACTIVE
├── product-vision.md                  ✅ ACTIVE
└── target-personas.md                 ✅ ACTIVE
```

### Patterns (dev-docs/2-areas/patterns/)

**Referenced in architecture.md → ACTIVE**

```
dev-docs/2-areas/patterns/
├── INDEX.md                           ✅ ACTIVE
├── architecture-modularity.md          ✅ ACTIVE
├── atoms-no-class-props.md            ✅ ACTIVE
├── convex-integration.md              ✅ ACTIVE
├── design-system-patterns.md          ✅ ACTIVE
├── error-handling-improvements.md     ✅ ACTIVE
├── patterns-and-lessons.md            ✅ ACTIVE
├── svelte-reactivity.md               ✅ ACTIVE
└── ui-patterns.md                     ✅ ACTIVE
```

### Cursor Commands (.cursor/commands/)

**Used by Cursor IDE → ACTIVE**

```
.cursor/commands/*.md                  ✅ ACTIVE (29 files)
.cursor/SHORTCUTS.md                   ✅ ACTIVE
```

### Domain READMEs (AI-friendly documentation)

**Referenced in architecture.md → ACTIVE**

```
convex/core/*/README.md                ✅ ACTIVE (9 files)
convex/features/*/README.md            ✅ ACTIVE (9 files)
convex/infrastructure/*/README.md      ✅ ACTIVE (3 files)
convex/admin/README.md                 ✅ ACTIVE
src/lib/modules/*/README.md            ✅ ACTIVE (7 files)
src/lib/infrastructure/rbac/docs/essentials.md  ✅ ACTIVE
```

### GitHub Templates

```
.github/ISSUE_TEMPLATE/*.md            ✅ ACTIVE (2 files)
.github/pull_request_template.md       ✅ ACTIVE
.github/SECURITY.md                    ✅ ACTIVE
```

### Root README

```
README.md                              ✅ ACTIVE
```

### Technical Design (may be ACTIVE if referenced)

```
dev-docs/technical-design/
├── architectural-validation-system.md  ⚠️ REVIEW (may be archive)
├── locale-preferences-analysis.md      ⚠️ REVIEW (may be archive)
└── operating-modes-customizable-labels.md  ⚠️ REVIEW (may be archive)
```

### Module-Specific Active Docs

```
src/lib/modules/org-chart/COLOR_STRATEGY.md  ✅ ACTIVE (referenced in patterns/INDEX.md)
src/lib/modules/meetings/docs/essentials.md   ✅ ACTIVE (domain docs)
src/lib/modules/org-chart/docs/essentials.md ✅ ACTIVE (domain docs)
```

---

## ARCHIVE (Move to dev-docs/archive/2025-01/)

### Root-Level Analysis Files

**These were one-time investigations → ARCHIVE**

```
./CONVEX-ARCHITECTURE-ALIGNMENT-ANALYSIS.md  → archive/
./CORE-ARCHITECTURE-GAP-ANALYSIS.md          → archive/
./FEATURE-FLAGS-ANALYSIS.md                  → archive/
./IMPLEMENTATION-STATE-RESEARCH.md           → archive/
./INVARIANTS-IMPLEMENTATION-ANALYSIS.md      → archive/
./LEGACY-FILES-AUDIT.md                      → archive/
./ONBOARDING-STATE-MANAGEMENT-PROPOSAL.md    → archive/
./ORG-CHART-SIZING-SOLUTION.md                → archive/
./PRE-COMMIT-DIAGNOSTIC.md                   → archive/
./SEED-SCRIPTS-ANALYSIS.md                   → archive/
./WORKSPACE-INITIALIZATION-RESEARCH.md       → archive/
```

### Ticket-Specific Docs

**Completed tickets → ARCHIVE**

```
./SYOS-636-IMPLEMENTATION-SUMMARY.md          → archive/
./SYOS-636-QUICK-START.md                    → archive/
./SYOS-842-VIOLATIONS.md                     → archive/
./convex/admin/SYOS-839-DECISIONS.md         → archive/
```

### Draft Documentation (dev-docs/draft_claude/)

**Draft work → ARCHIVE**

```
dev-docs/draft_claude/                       → archive/ (entire directory, 12 files)
```

### Domain-Specific Analysis Files

**One-time alignment work → ARCHIVE**

```
convex/core/circles/ARCHITECTURE-ALIGNMENT-ANALYSIS.md    → archive/
convex/core/circles/ARCHITECTURE-ALIGNMENT-PLAN.md        → archive/
convex/core/circles/CONSTANTS-ANALYSIS.md                 → archive/
convex/core/circles/CONSTANTS-MIGRATION.md                → archive/
convex/core/circles/ESLINT-VIOLATIONS-REPORT.md          → archive/
convex/core/circles/FINAL-REVIEW.md                       → archive/
convex/core/circles/PHASE-1-COMPLETE.md                   → archive/
convex/core/circles/PHASE-2-COMPLETE.md                   → archive/
convex/core/proposals/ARCHITECTURE-ALIGNMENT-ANALYSIS.md  → archive/
convex/core/proposals/ARCHITECTURE-ALIGNMENT-PLAN.md     → archive/
convex/core/roles/ARCHITECTURE-ALIGNMENT-ANALYSIS.md     → archive/
convex/core/users/ARCHITECTURE-ALIGNMENT-ANALYSIS.md      → archive/
convex/core/users/ARCHITECTURE-ALIGNMENT-PLAN.md          → archive/
```

### AI Documentation (ai-docs/)

**Historical audits → ARCHIVE**

```
ai-docs/audits/architecture-baseline.md      → archive/
ai-docs/audits/naming-baseline.md            → archive/
ai-docs/lessons-learned/patterns-and-lessons.md  → archive/ (duplicate of patterns/)
ai-docs/reference/ANALYSIS-mem-ai-documentation-system.md  → archive/
ai-docs/reference/ANALYSIS-save-command-pattern-documentation.md  → archive/
```

### Module Implementation Plans

**Completed work → ARCHIVE**

```
src/lib/modules/meetings/docs/architecture_audit.md      → archive/
src/lib/modules/meetings/docs/implementation-plan.md     → archive/
src/lib/modules/org-chart/DESIGN_SYSTEM_FIX_PLAN.md      → archive/
src/lib/modules/org-chart/components/import/COMPONENT_STRUCTURE.md  → archive/
src/lib/modules/org-chart/components/import/TEST_PLAN.md  → archive/
src/lib/modules/org-chart/docs/EDIT_CIRCLE_IMPLEMENTATION.md  → archive/
```

### Scripts & Migration Docs

**Completed migrations → ARCHIVE**

```
scripts/REFACTOR-ORGS-TO-WORKSPACES.md       → archive/
scripts/validate-phase2c.md                  → archive/
scripts/tests/bug-catalog-analysis.md        → archive/
scripts/tests/bug-catalog-summary.md         → archive/
```

### Admin & Invariants

**Historical logs → ARCHIVE**

```
convex/admin/LEGACY-CLEANUP.md               → archive/
convex/admin/RESET-WORKSPACE.md              → archive/
convex/admin/invariants/VIOLATIONS-LOG.md    → archive/
```

### Other Module Docs (Review)

```
src/lib/modules/meetings/docs/business-logic.md   ⚠️ REVIEW (may be active if referenced)
src/lib/modules/meetings/docs/nice-to-have.md    → archive/
src/lib/modules/meetings/docs/templates.md        ⚠️ REVIEW (may be active if referenced)
src/lib/modules/meetings/docs/views.md             ⚠️ REVIEW (may be active if referenced)
src/lib/modules/org-chart/navigation-control.md  ⚠️ REVIEW (may be active if referenced)
```

---

## DELETE (Remove entirely)

### Duplicate/Redundant Content

```
dev-docs/2-areas/patterns/patterns-and-lessons.md  ❌ DELETE (duplicate of ai-docs version)
```

### Test/CI Files

```
.ci-test.md                              ❌ DELETE (test file)
```

### Temporary/One-off Files

```
e2e/README.md                            ❌ DELETE (if empty/minimal)
tests/convex/integration/README.md       ❌ DELETE (if empty/minimal)
src/routes/dev-docs/test/+page.md       ❌ DELETE (test route)
```

### Seed Scripts (if not needed)

```
convex/admin/seed/README.md              ⚠️ REVIEW (may keep if actively used)
```

---

## Recommended Directory Structure After Cleanup

```
/dev-docs/
├── master-docs/              # ACTIVE - AI reads these (10 files)
│   ├── architecture.md
│   ├── architecture/
│   ├── design-system.md
│   ├── product-*.md
│   └── ...
│
├── 2-areas/                  # ACTIVE - Patterns (9 files)
│   └── patterns/
│
├── archive/                   # ARCHIVE - Historical docs
│   ├── 2025-01/
│   │   ├── analysis/         # Root-level analysis files
│   │   ├── tickets/          # SYOS-* files
│   │   ├── drafts/           # draft_claude/
│   │   ├── domain-alignment/ # Domain ARCHITECTURE-ALIGNMENT-*.md
│   │   └── implementation/   # Implementation plans
│   └── ...
│
└── technical-design/         # REVIEW - May archive if not referenced
    └── ...
```

---

## Action Plan

### Phase 1: Create Archive Structure

```bash
mkdir -p dev-docs/archive/2025-01/{analysis,tickets,drafts,domain-alignment,implementation,ai-docs,modules}
```

### Phase 2: Move Archive Files

Move all files marked → archive/ to their respective subdirectories

### Phase 3: Delete Files

Delete all files marked ❌ DELETE

### Phase 4: Review & Verify

- Check that architecture.md still references correct paths
- Verify no broken links
- Confirm AI context only includes master-docs/

### Phase 5: Update AI Project Context

- Remove archived directories from Claude project context
- Keep only: `dev-docs/master-docs/`, `dev-docs/2-areas/patterns/`, domain READMEs

---

## Expected Results

- **Before:** 186 markdown files
- **After:** ~50 ACTIVE files
- **Archived:** ~80 files (preserved for history)
- **Deleted:** ~56 files (redundant/obsolete)

**Key Benefit:** AI agents will only see accurate, current documentation, reducing confusion and errors.
