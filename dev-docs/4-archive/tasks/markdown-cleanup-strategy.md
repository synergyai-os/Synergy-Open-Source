# Markdown File Cleanup Strategy

**Goal**: Define CORE documentation files (what we actually need), archive everything else, and hide archive from AI agents to prevent confusion.

---

## Problem Analysis

### Current State

**262+ markdown files** scattered across the project:

1. **Root Level Clutter** (20+ files):
   - `SYOS-XXX-*.md` files (audit reports, validation docs, test guides)
   - `AUDIT-REPORT.md`, `BUTTON-AUDIT-REPORT.md`
   - `CI-LOCAL-TESTING.md`, `E2E-TEST-*.md`
   - `MEETINGS-DESIGN-SYSTEM-ALIGNMENT.md`
   - `PHASE1-CLEANUP-SUMMARY.md`
   - `RBAC-UI-IMPLEMENTATION.md`
   - `design-system-*.md` files (3 files)

2. **Well-Organized Areas**:
   - `dev-docs/` - PARA structure (1-projects, 2-areas, 3-resources, 4-archive)
   - `marketing-docs/` - Organized by topic (strategy, audience, go-to-market)
   - `ai-docs/` - Has reference/ and tasks/ folders

3. **Critical Issues**:
   - **Outdated docs mixed with current** - Example: "teams" docs exist but app has 0 teams
   - **AI can't distinguish** - Loads outdated vision/design docs thinking they're current
   - **Root level files** - Hard to find, unclear categorization
   - **No separation** - Active vs historical docs mixed together
   - **Token waste** - AI loads irrelevant outdated docs

### Pain Points

**For AI Agents**:

- ❌ **Can't tell current vs outdated** - Loads "teams" docs when app has 0 teams
- ❌ **Loads wrong vision docs** - Historical product-vision-and-plan.md vs current product-vision-2.0.md
- ❌ **Confusion between similar files** - workflow-v2 vs workflow, which is current?
- ❌ **No way to exclude** - Archive files still get loaded, wasting tokens

**For Developers**:

- ❌ Hard to find relevant documentation
- ❌ Unclear what's current vs historical
- ❌ Root directory clutter
- ❌ Maintenance burden - unclear where new docs belong

### User Impact

- **AI agents waste tokens** loading outdated/irrelevant docs
- **AI confusion** - References outdated features (teams, old vision)
- **Slower development** - Can't find current docs quickly
- **Maintenance burden** - Unclear what's actually needed

---

## Approach Options

### Approach A: Define CORE → Archive Rest → Hide Archive

**How it works**:

1. **Define CORE docs** - List only what we actually need (current vision, patterns, design tokens, etc.)
2. **Move everything else** → `dev-docs/4-archive/` (organized by category)
3. **Add archive to `.cursorignore`** - AI agents won't load archived docs
4. **Root level**: Only essential files (README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT)

**Pros**:

- ✅ **Prevents AI confusion** - Archive hidden, only CORE docs loaded
- ✅ **Clear separation** - CORE (active) vs ARCHIVE (historical)
- ✅ **No token waste** - AI doesn't load outdated docs
- ✅ **Simple rule** - If not in CORE list → Archive
- ✅ **Maintainable** - Easy to add new docs (CORE or archive?)

**Cons**:

- ❌ Need to carefully define CORE list (may miss something)
- ❌ Need to update references to archived files
- ❌ Requires `.cursorignore` file (new dependency)

**Complexity**: Medium (define CORE + migration + .cursorignore)

**Dependencies**:

- Define CORE documentation list
- Create `.cursorignore` file
- Update references to archived files

---

### Approach B: Categorize Everything (No Archive Separation)

**How it works**:

- Move files into PARA structure based on category
- Keep all files accessible (no hiding)
- Rely on clear naming/organization

**Pros**:

- ✅ Clear organization
- ✅ All docs accessible

**Cons**:

- ❌ AI still loads outdated docs (no way to exclude)
- ❌ Doesn't solve core problem (AI confusion)
- ❌ Still wastes tokens on irrelevant docs

**Complexity**: Medium-High

**Dependencies**: Categorization + reference updates

---

### Approach C: Delete Outdated Docs

**How it works**:

- Identify outdated docs
- Delete them (no archive)

**Pros**:

- ✅ Cleanest approach
- ✅ No maintenance burden

**Cons**:

- ❌ **Risky** - May delete something needed later
- ❌ **No history** - Can't reference past decisions
- ❌ **Loss of context** - Why did we make certain decisions?

**Complexity**: Low (but risky)

**Dependencies**: Careful review before deletion

---

## Recommendation

**Selected**: Approach A (Define CORE → Archive Rest → Hide Archive)

**Reasoning**:

1. **Solves core problem** - AI won't load outdated docs (archive hidden)
2. **Prevents confusion** - Example: Won't load "teams" docs when app has 0 teams
3. **Clear rule** - If not in CORE → Archive → Hidden from AI
4. **Maintainable** - Easy to add new docs (CORE or archive?)
5. **Preserves history** - Archive kept for reference, just hidden from AI
6. **Token efficient** - AI only loads what's actually needed

**Trade-offs accepted**:

- Need to carefully define CORE list (may need iteration)
- Need to create `.cursorignore` file
- Archive files still exist (just hidden from AI)

**Risk assessment**:

- **Low** - Archive preserved, can always move back to CORE if needed
- **Mitigation**: Start with conservative CORE list, expand if needed
- **Mitigation**: Document CORE criteria clearly

---

## Current State

### Existing Structure

**dev-docs/** (PARA system):

- `1-projects/` - Time-bound initiatives (29 files)
- `2-areas/` - Ongoing responsibilities (98 files)
- `3-resources/` - Reference material (24 files)
- `4-archive/` - Completed/deprecated (30 files)

**marketing-docs/** (Topic-based):

- `strategy/` - Product vision, strategy, roadmap
- `audience/` - Personas, success signals
- `go-to-market/` - Community, content, social
- `launch-plans/` - Actionable plans

**ai-docs/** (AI-specific):

- `reference/` - Working code examples
- `tasks/` - Pre-coding analysis documents

### Root Level Files to Move

**SYOS-XXX Files** (ticket-related):

- `SYOS-120-audit-report.md`
- `SYOS-253-TESTING-GUIDE.md`
- `SYOS-292-TEAM-REFERENCES-VERIFICATION.md`
- `SYOS-361-*.md` (4 files: cascade-test-procedure, CASCADE-VALIDATION-SUMMARY, hardcoded-value-audit, token-coverage-report)
- `SYOS-403-VALIDATION.md`

**Audit Reports**:

- `AUDIT-REPORT.md`
- `BUTTON-AUDIT-REPORT.md`

**Test/CI Documentation**:

- `CI-LOCAL-TESTING.md`
- `E2E-TEST-PARALLEL-WORK-ANALYSIS.md`
- `E2E-TEST-VALIDATION-RESULTS.md`

**Design System** (Root level):

- `design-system-test.json` - **KEEP IN ROOT** (source of truth - token specs) ⭐
- `design-system-audit-template.md` - **MOVE** → `dev-docs/2-areas/design/audit-guide.md` (active work SYOS-414)
- `design-system-daily-work-cheatsheet.md` - **ARCHIVE** (redundant with quick-start.md)
- `design-system-master-readme.md` - **ARCHIVE** (meta-doc, redundant with start.md)
- `design-system-checklist.json` - **ARCHIVE** (not actively used, use Linear tickets instead)

**Other**:

- `MEETINGS-DESIGN-SYSTEM-ALIGNMENT.md`
- `PHASE1-CLEANUP-SUMMARY.md`
- `RBAC-UI-IMPLEMENTATION.md`

### CORE Documentation (What We Actually Need)

**Based on `.cursor/rules/way-of-working.mdc` and active usage:**

**Essential (CORE)**:

- `marketing-docs/strategy/product-vision-2.0.md` - **Current vision** ⭐
- `dev-docs/2-areas/product/product-principles.md` - Decision framework ⭐
- `dev-docs/2-areas/patterns/INDEX.md` - **Pattern lookup** ⭐
- `dev-docs/2-areas/design/component-architecture.md` - Component strategy ⭐
- `dev-docs/2-areas/design/design-principles.md` - Visual philosophy ⭐
- `dev-docs/2-areas/architecture/system-architecture.md` - **Complete architecture overview** ⭐ (Referenced in /start, /validate, /code-review)
- `dev-docs/2-areas/architecture/architecture.md` - Tech stack deep dive, quick start guides
- `dev-docs/2-areas/architecture/modularity-refactoring-analysis.md` - Module boundaries & refactoring ⭐ (Referenced in way-of-working.mdc)
- `dev-docs/2-areas/design/design-tokens.md` - **Token reference** ⭐
- `dev-docs/2-areas/development/composables-analysis.md` - Composables

**Design Documentation (CORE)**:

- `dev-docs/2-areas/design/quick-start.md` - Quick reference guide ⭐ (SYOS-405 deliverable)
- `dev-docs/2-areas/design/migration-guide.md` - Migration guide (SYOS-405 deliverable)
- `dev-docs/2-areas/design/deprecation-policy.md` - Deprecation policy (SYOS-405 deliverable)
- `dev-docs/2-areas/design/audit-guide.md` - **Audit process** (moved from root: design-system-audit-template.md) ⭐ (Active work SYOS-414)

**Pattern Files (CORE)**:

- `dev-docs/2-areas/patterns/svelte-reactivity.md` - Svelte 5 runes
- `dev-docs/2-areas/patterns/convex-integration.md` - Convex patterns
- `dev-docs/2-areas/patterns/ui-patterns.md` - UI/UX patterns
- `dev-docs/2-areas/patterns/analytics.md` - PostHog tracking
- `dev-docs/2-areas/patterns/auth-deployment.md` - Auth deployment
- `dev-docs/2-areas/patterns/ci-cd.md` - CI/CD patterns
- `dev-docs/2-areas/patterns/feature-flags.md` - Feature flags

**Development (CORE)**:

- `dev-docs/2-areas/development/coding-standards.md` - **Critical rules** ⭐
- `dev-docs/2-areas/development/git-workflow.md` - Git workflow
- `dev-docs/2-areas/development/secrets-management.md` - Secrets
- `dev-docs/2-areas/development/ai-development-workflow-v2.md` - **User guide for AI workflow** ⭐ (Referenced in workflow)
- `dev-docs/2-areas/development/ai-development-workflow.md` - Technical workflow (AI-facing)
- `dev-docs/2-areas/development/tools/linear-integration.md` - Linear
- `dev-docs/2-areas/development/tools/coderabbit-integration.md` - CodeRabbit

**Resources (CORE)**:

- `dev-docs/3-resources/deployment/trunk-based-deployment-implementation-summary.md` - Deployment
- `dev-docs/3-resources/testing/` - Testing guides (if actively used)

**Commands & Rules (CORE)**:

- `.cursor/commands/` - All command files
- `.cursor/rules/` - All rule files

**Marketing (CORE)**:

- `marketing-docs/strategy/product-vision-2.0.md` - Current vision
- `marketing-docs/strategy/product-strategy.md` - Strategy
- `marketing-docs/README.md` - Marketing overview

**AI Docs (CORE)**:

- `ai-docs/reference/README.md` - Reference system
- `ai-docs/tasks/README.md` - Task system

**Archive Candidates** (Confirmed):

**Architecture (Historical)**:

- `dev-docs/2-areas/architecture/future-vision.md` - **ARCHIVE** (historical assessment)
- `dev-docs/2-areas/architecture/future-vision-assessment.md` - **ARCHIVE** (historical assessment)
- `dev-docs/2-areas/architecture/future-vision-final-assessment.md` - **ARCHIVE** (historical assessment)
- `dev-docs/2-areas/architecture/modularity-refactoring-summary.md` - **ARCHIVE** (completed work summary)
- `dev-docs/2-areas/architecture/outcome-pattern-library-strategy.md` - **ARCHIVE** (if superseded by current patterns)
- `dev-docs/2-areas/architecture/audit-reports/SYOS-ARCHITECTURE-AUDIT-2025-01.md` - **ARCHIVE** (old audit, keep latest only)

**Product**:

- `dev-docs/2-areas/product/product-vision-and-plan.md` - **HISTORICAL** (replaced by product-vision-2.0.md)

**Design System**:

- `design-system-master-readme.md` - **ARCHIVE** (meta-doc, redundant with start.md)
- `design-system-daily-work-cheatsheet.md` - **ARCHIVE** (redundant with quick-start.md)
- `design-system-checklist.json` - **ARCHIVE** (not actively used, use Linear tickets instead)

**General**:

- Any "teams" related docs (app has 0 teams)
- Old workflow docs (workflow vs workflow-v2)
- Completed ticket docs (SYOS-XXX files)
- Audit reports (completed audits - keep latest only)
- Old design system proposals (if superseded)
- **Completed task documents** (`ai-docs/tasks/*.md`) - Archive after validation completes

### Patterns & References

**Pattern Files**:

- `dev-docs/2-areas/patterns/INDEX.md` - Fast lookup (points to line numbers)
- Pattern files reference each other with line numbers

**Reference System**:

- `.cursor/rules/` - References file paths
- `.cursor/commands/` - References file paths
- Code comments may reference docs

**Constraints**:

- Must preserve line number references (INDEX.md uses `#L123` anchors)
- Must update `.cursor/rules` file paths if files move
- Must update `.cursor/commands` file paths if files move
- Archive files hidden from AI but still accessible to humans

---

## Technical Requirements

### CORE Documentation Criteria

**A file is CORE if**:

- ✅ **Actively referenced** - Used in `.cursor/rules/` or `.cursor/commands/`
- ✅ **Current vision/strategy** - Not superseded by newer version
- ✅ **Pattern/architecture** - Essential for development (patterns, design tokens, architecture)
- ✅ **Active project** - Currently being worked on (1-projects/)
- ✅ **Reference material** - Actively used (3-resources/)

**A file is ARCHIVE if**:

- ❌ **Historical** - Superseded by newer version (product-vision-and-plan.md → product-vision-2.0.md)
- ❌ **Outdated feature** - References features not in app (e.g., "teams" docs when app has 0 teams)
- ❌ **Completed work** - Ticket/work is done (SYOS-XXX files for completed tickets)
- ❌ **Old workflow** - Replaced by newer version (workflow.md → workflow-v2.md)
- ❌ **Audit reports** - Completed audits (historical record)
- ❌ **Old proposals** - Design proposals that were rejected or superseded

### Archive Organization

**4-archive/** structure:

```
dev-docs/4-archive/
  tickets/              # Completed ticket docs
    SYOS-XXX-*.md
  audit-reports/        # Completed audits
    AUDIT-REPORT.md
    BUTTON-AUDIT-REPORT.md
  historical/           # Historical vision/strategy docs
    product-vision-and-plan.md
  outdated-features/    # Docs for features not in app
    teams/              # Example: teams docs when app has 0 teams
  old-workflows/       # Superseded workflow docs
    ai-development-workflow.md  # If workflow-v2.md is current
  design-system/       # Redundant design system docs
    design-system-master-readme.md
    design-system-daily-work-cheatsheet.md
    design-system-checklist.json
  architecture/        # Historical architecture docs
    future-vision.md
    future-vision-assessment.md
    future-vision-final-assessment.md
    modularity-refactoring-summary.md
    outcome-pattern-library-strategy.md
    audit-reports/     # Old audit reports (keep latest only)
      SYOS-ARCHITECTURE-AUDIT-2025-01.md
  tasks/               # Completed task documents (from ai-docs/tasks/)
    [ticket-id]-*.md   # Pre-coding analysis docs (archived after validation)
  summaries/           # Completed project summaries
    PHASE1-CLEANUP-SUMMARY.md
```

### .cursorignore File

**Create `.cursorignore`** to hide archive from AI:

```
# Archive - Historical/outdated docs hidden from AI
dev-docs/4-archive/
```

**Why**: AI agents won't load archived docs, preventing confusion and token waste.

**Note**: Archive still accessible to humans (just hidden from AI context).

### Migration Steps

1. **Define CORE list**:
   - Review `.cursor/rules/way-of-working.mdc` for essential docs
   - List all actively referenced files
   - Identify current vs historical (product-vision-2.0.md vs product-vision-and-plan.md)
   - Create CORE documentation list

2. **Identify archive candidates**:
   - Review all markdown files
   - Check: Is it in CORE list? If not → Archive candidate
   - Check: Historical? Outdated feature? Completed work? → Archive
   - Create archive mapping (file → archive location)

3. **Find all references**:
   - Grep for file names in codebase
   - Check `.cursor/rules/` files
   - Check `.cursor/commands/` files
   - Check markdown files for links
   - Note: Archive files may have references (that's OK, just hidden from AI)

4. **Move files**:
   - Move root-level files → appropriate archive locations
   - Move outdated files from dev-docs → archive
   - Create archive subdirectories if needed
   - Preserve file names (or rename if needed)

5. **Create `.cursorignore`**:
   - Create `.cursorignore` file at root
   - Add `dev-docs/4-archive/` to ignore list
   - Test: AI shouldn't load archived files

6. **Update references** (if needed):
   - Update `.cursor/rules/` paths if files moved
   - Update `.cursor/commands/` paths if files moved
   - Note: Archive files can keep old references (humans can still access)

7. **Document CORE list**:
   - Create `dev-docs/CORE-DOCS.md` - List of CORE documentation
   - Document criteria (what makes a doc CORE?)
   - Update `dev-docs/README.md` with CORE vs ARCHIVE distinction

### New Folder Structure

```
dev-docs/
  1-projects/                 # Active projects (CORE)
    [ticket-id]/              # Active ticket work
  2-areas/                    # Ongoing responsibilities (CORE)
    patterns/                 # Pattern files (CORE)
    design/                   # Design docs (CORE)
    architecture/             # Architecture docs (CORE)
    development/              # Development guides (CORE)
    product/                  # Product docs (CORE)
  3-resources/                # Reference material (CORE if actively used)
    testing/                  # Testing guides
    deployment/               # Deployment guides
  4-archive/                  # Historical/outdated (HIDDEN FROM AI)
    tickets/                  # Completed tickets
      SYOS-XXX-*.md
    audit-reports/            # Audit reports
      AUDIT-REPORT.md
      BUTTON-AUDIT-REPORT.md
    historical/               # Historical vision/strategy
      product-vision-and-plan.md  # Replaced by product-vision-2.0.md
    outdated-features/        # Docs for features not in app
      teams/                  # Example: teams docs when app has 0 teams
    old-workflows/            # Superseded workflows
    design-system/            # Redundant design system docs
      design-system-master-readme.md
      design-system-daily-work-cheatsheet.md
      design-system-checklist.json
    summaries/                # Completed summaries
      PHASE1-CLEANUP-SUMMARY.md

.cursorignore                 # NEW: Hides archive from AI
  dev-docs/4-archive/

dev-docs/CORE-DOCS.md         # NEW: List of CORE documentation
```

### Files to Keep at Root

**Essential root files** (don't move):

- `README.md` - Project overview
- `LICENSE` - License file
- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` - Code of conduct
- `package.json`, `tsconfig.json`, etc. (config files)
- `design-system-test.json` - **Source of truth** (token specs) ⭐
- `design-system-test.json` - **Source of truth** (token specs) ⭐

---

## Success Criteria

### Functional

- ✅ **Zero root-level markdown files** (except README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT)
- ✅ **CORE list defined** - Clear list of essential docs
- ✅ **Archive organized** - All non-CORE docs in `dev-docs/4-archive/`
- ✅ **`.cursorignore` created** - Archive hidden from AI
- ✅ **CORE-DOCS.md created** - Documents what's CORE and why

### Performance

- ✅ **AI doesn't load archive** - `.cursorignore` prevents loading archived docs
- ✅ **Reduced token waste** - AI only loads CORE docs
- ✅ **No confusion** - AI won't reference outdated features (e.g., "teams" when app has 0 teams)
- ✅ **Faster discovery** - Clear CORE vs ARCHIVE separation

### UX

- ✅ **Clear organization** - CORE (active) vs ARCHIVE (historical)
- ✅ **Maintainable** - Clear criteria for CORE vs ARCHIVE
- ✅ **No confusion** - AI won't load outdated docs
- ✅ **History preserved** - Archive accessible to humans, just hidden from AI

### Quality

- ✅ **CORE-DOCS.md** - Documents CORE list and criteria
- ✅ **Documentation updated** - README files reflect CORE vs ARCHIVE
- ✅ **`.cursorignore` tested** - Verify AI doesn't load archived files
- ✅ **Criteria documented** - Clear rules for what's CORE vs ARCHIVE

---

## Implementation Checklist

### Phase 1: Define CORE Documentation

- [ ] **Review essential docs**:
  - [ ] Read `.cursor/rules/way-of-working.mdc` - List referenced files
  - [ ] Check `dev-docs/README.md` - List essential docs
  - [ ] Review `.cursor/commands/` - List referenced files
  - [ ] Create initial CORE list

- [ ] **Identify current vs historical**:
  - [ ] `product-vision-2.0.md` (CORE) vs `product-vision-and-plan.md` (ARCHIVE)
  - [ ] `workflow-v2.md` (CORE) vs `workflow.md` (ARCHIVE) - if applicable
  - [ ] Check for outdated features (e.g., "teams" docs when app has 0 teams)
  - [ ] Mark historical docs as ARCHIVE

- [ ] **Create CORE-DOCS.md**:
  - [ ] List all CORE documentation files
  - [ ] Document CORE criteria
  - [ ] Explain why each file is CORE
  - [ ] Save to `dev-docs/CORE-DOCS.md`

### Phase 2: Identify Archive Candidates

- [ ] **Review all markdown files**:
  - [ ] Check each file: Is it in CORE list?
  - [ ] If not in CORE → Archive candidate
  - [ ] Check: Historical? Outdated? Completed?
  - [ ] Create archive mapping (file → archive location)

- [ ] **Categorize archive files**:
  - [ ] Completed tickets → `4-archive/tickets/`
  - [ ] Audit reports → `4-archive/audit-reports/`
  - [ ] Historical vision → `4-archive/historical/`
  - [ ] Outdated features → `4-archive/outdated-features/`
  - [ ] Old workflows → `4-archive/old-workflows/`
  - [ ] Summaries → `4-archive/summaries/`

- [ ] **Root level files**:
  - [ ] Move all root-level `.md` files (except README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT)
  - [ ] **Design system files**:
    - [ ] Keep `design-system-test.json` in root (source of truth)
    - [ ] Move `design-system-audit-template.md` → `dev-docs/2-areas/design/audit-guide.md`
    - [ ] Archive `design-system-master-readme.md`, `design-system-daily-work-cheatsheet.md`, `design-system-checklist.json`
  - [ ] Categorize each file (CORE or ARCHIVE)
  - [ ] Create migration plan

### Phase 3: Create Archive Structure & Move Files

- [ ] **Create archive directories**:
  - [ ] `dev-docs/4-archive/tickets/`
  - [ ] `dev-docs/4-archive/audit-reports/`
  - [ ] `dev-docs/4-archive/historical/`
  - [ ] `dev-docs/4-archive/outdated-features/`
  - [ ] `dev-docs/4-archive/old-workflows/`
  - [ ] `dev-docs/4-archive/design-system/` (for redundant design docs)
  - [ ] `dev-docs/4-archive/architecture/` (for historical architecture docs)
  - [ ] `dev-docs/4-archive/architecture/audit-reports/` (for old audit reports)
  - [ ] `dev-docs/4-archive/tasks/` (for completed task documents)
  - [ ] `dev-docs/4-archive/summaries/`
  - [ ] `dev-docs/4-archive/design-system/` (for redundant design docs)

- [ ] **Move files**:
  - [ ] **Design system**: Move `design-system-audit-template.md` → `dev-docs/2-areas/design/audit-guide.md`
  - [ ] **Design system**: Archive `design-system-master-readme.md`, `design-system-daily-work-cheatsheet.md`, `design-system-checklist.json` → `dev-docs/4-archive/design-system/`
  - [ ] **Architecture**: Archive historical assessments → `dev-docs/4-archive/architecture/`
  - [ ] **Architecture**: Archive old audit reports (keep latest only) → `dev-docs/4-archive/architecture/audit-reports/`
  - [ ] Move other root-level files to archive
  - [ ] Move outdated files from dev-docs to archive
  - [ ] Preserve file names (or rename if needed)
  - [ ] Verify files moved correctly

### Phase 4: Create .cursorignore & Test

- [ ] **Create `.cursorignore`**:
  - [ ] Create file at root level
  - [ ] Add `dev-docs/4-archive/` to ignore list
  - [ ] Test: AI shouldn't load archived files

- [ ] **Test AI discovery**:
  - [ ] Test AI can find CORE docs
  - [ ] Verify AI doesn't load archived files
  - [ ] Confirm no confusion (e.g., doesn't load "teams" docs)

### Phase 5: Documentation & Cleanup

- [ ] **Update documentation**:
  - [ ] Update `dev-docs/README.md` with CORE vs ARCHIVE distinction
  - [ ] Document `.cursorignore` usage
  - [ ] Update any README files that reference moved files

- [ ] **Update references** (if needed):
  - [ ] Update `.cursor/rules/` paths if files moved
  - [ ] Update `.cursor/commands/` paths if files moved
  - [ ] Note: Archive files can keep old references (humans can access)

- [ ] **Verify**:
  - [ ] Root directory clean (only essential files)
  - [ ] CORE docs accessible
  - [ ] Archive organized
  - [ ] `.cursorignore` working
  - [ ] CORE-DOCS.md complete

---

## Additional Considerations

### Naming Conventions

**SYOS-XXX files**:

- Keep ticket ID in filename: `SYOS-XXX-description.md`
- Use kebab-case for description
- Examples: `SYOS-361-cascade-test-procedure.md`, `SYOS-403-VALIDATION.md`

**Audit reports**:

- Use descriptive names: `AUDIT-REPORT.md`, `BUTTON-AUDIT-REPORT.md`
- Add date if multiple versions: `AUDIT-REPORT-2025-01.md`

**Test guides**:

- Use descriptive names: `CI-LOCAL-TESTING.md`, `E2E-TEST-VALIDATION-RESULTS.md`

### CORE Documentation Criteria (Detailed)

**Must be CORE if**:

1. **Referenced in `.cursor/rules/`** - Essential for AI agents
2. **Referenced in `.cursor/commands/`** - Used by commands
3. **Pattern files** - `patterns/INDEX.md`, `patterns/*.md` (actively used)
4. **Design tokens** - `design-tokens.md` (MANDATORY for UI)
5. **Architecture** - `architecture.md` (tech stack, auth)
6. **Current vision** - `product-vision-2.0.md` (not historical)
7. **Active projects** - `1-projects/[active-ticket]/` (currently being worked on)
8. **Active resources** - `3-resources/` (if actively referenced)

**Must be ARCHIVE if**:

1. **Historical** - Superseded by newer version (product-vision-and-plan.md)
2. **Outdated feature** - References features not in app (teams docs when app has 0 teams)
3. **Completed work** - Ticket/work is done (SYOS-XXX files for completed tickets)
4. **Old workflow** - Replaced by newer version (workflow.md → workflow-v2.md)
5. **Audit reports** - Completed audits (historical record)
6. **Old proposals** - Design proposals that were rejected or superseded

### Future Maintenance

**Adding new docs**:

1. **Check**: Is it CORE or ARCHIVE?
   - CORE → Add to appropriate CORE location (1-projects, 2-areas, 3-resources)
   - ARCHIVE → Add to `dev-docs/4-archive/[category]/`
2. **Update CORE-DOCS.md** - If adding CORE doc, update the list
3. **Verify `.cursorignore`** - Archive files should be ignored by AI

**Reviewing CORE list**:

- Periodically review CORE-DOCS.md
- Move docs from CORE → ARCHIVE if they become outdated
- Move docs from ARCHIVE → CORE if they become relevant again

**Documentation**:

- `dev-docs/CORE-DOCS.md` - Single source of truth for CORE docs
- `dev-docs/README.md` - References CORE vs ARCHIVE distinction
- `.cursorignore` - Hides archive from AI

---

**Last Updated**: 2025-01-XX  
**Status**: Planning  
**Next Step**: Review and confirm approach before migration
