# CORE Documentation

**Purpose**: This document defines what documentation is actively used and maintained (CORE) vs historical/archived.

**Why**: AI agents only load CORE docs, preventing confusion from outdated docs and reducing token waste.

---

## What Makes a Document CORE?

**CORE documents are:**

1. **Currently referenced** - Linked in commands, rules, or actively used workflows
2. **Current/active** - Not superseded by newer versions (e.g., `product-vision-2.0.md` is CORE, `product-vision-and-plan.md` is ARCHIVE)
3. **Essential for development** - Patterns, standards, architecture, design tokens
4. **Maintained** - Actively updated, not historical snapshots

**ARCHIVE documents are:**

1. **Historical** - Old vision docs, completed assessments, superseded workflows
2. **Completed work** - Ticket docs, audit reports (keep latest only), summaries
3. **Redundant** - Meta-docs that just point to other docs
4. **Outdated features** - Docs for features not in app (e.g., "teams" when app has 0 teams)

---

## CORE Documentation List

### Essential (CORE)

**Product & Strategy:**
- `marketing-docs/strategy/product-vision-2.0.md` - **Current vision** ⭐
- `dev-docs/2-areas/product/product-principles.md` - Decision framework ⭐
- `marketing-docs/strategy/product-strategy.md` - Strategy
- `marketing-docs/README.md` - Marketing overview

**Architecture:**
- `dev-docs/2-areas/architecture/system-architecture.md` - **Complete architecture overview** ⭐ (Referenced in /start, /validate, /code-review)
- `dev-docs/2-areas/architecture/architecture.md` - Tech stack deep dive, quick start guides
- `dev-docs/2-areas/architecture/modularity-refactoring-analysis.md` - Module boundaries & refactoring ⭐ (Referenced in way-of-working.mdc)
- `dev-docs/2-areas/architecture/url-patterns.md` - URL design principles
- `dev-docs/2-areas/architecture/auth/workos-convex-auth-architecture.md` - Auth system
- `dev-docs/2-areas/architecture/multi-tenancy/multi-tenancy-migration.md` - Multi-tenancy plan
- `dev-docs/2-areas/architecture/audit-reports/SYOS-ARCHITECTURE-AUDIT-2025-02.md` - Latest audit (keep latest only)

**Design:**
- `dev-docs/2-areas/design/component-architecture.md` - Component strategy ⭐
- `dev-docs/2-areas/design/design-principles.md` - Visual philosophy ⭐
- `dev-docs/2-areas/design/design-tokens.md` - **Token reference** ⭐
- `dev-docs/2-areas/design/quick-start.md` - Quick reference guide ⭐ (SYOS-405 deliverable)
- `dev-docs/2-areas/design/migration-guide.md` - Migration guide (SYOS-405 deliverable)
- `dev-docs/2-areas/design/deprecation-policy.md` - Deprecation policy (SYOS-405 deliverable)
- `dev-docs/2-areas/design/audit-guide.md` - **Audit process** ⭐ (Active work SYOS-414)

**Patterns:**
- `dev-docs/2-areas/patterns/INDEX.md` - **Pattern lookup** ⭐ (Fast symptom → solution lookup)
- `dev-docs/2-areas/patterns/svelte-reactivity.md` - Svelte 5 runes
- `dev-docs/2-areas/patterns/convex-integration.md` - Convex patterns
- `dev-docs/2-areas/patterns/ui-patterns.md` - UI/UX patterns
- `dev-docs/2-areas/patterns/analytics.md` - PostHog tracking
- `dev-docs/2-areas/patterns/auth-deployment.md` - Auth deployment
- `dev-docs/2-areas/patterns/ci-cd.md` - CI/CD patterns
- `dev-docs/2-areas/patterns/feature-flags.md` - Feature flags

**Development:**
- `dev-docs/2-areas/development/coding-standards.md` - **Critical rules** ⭐ (Prevents linting errors)
- `dev-docs/2-areas/development/git-workflow.md` - Git workflow
- `dev-docs/2-areas/development/secrets-management.md` - Secrets
- `dev-docs/2-areas/development/ai-development-workflow-v2.md` - **User guide for AI workflow** ⭐ (Current workflow)
- `dev-docs/2-areas/development/composables-analysis.md` - Composables
- `dev-docs/2-areas/development/tools/linear-integration.md` - Linear
- `dev-docs/2-areas/development/tools/coderabbit-integration.md` - CodeRabbit

**Resources:**
- `dev-docs/3-resources/deployment/trunk-based-deployment-implementation-summary.md` - Deployment
- `dev-docs/3-resources/testing/` - Testing guides (if actively used)

**Commands & Rules:**
- `.cursor/commands/` - All command files (27 commands)
- `.cursor/rules/` - All rule files

**AI Docs:**
- `ai-docs/reference/README.md` - Reference system
- `ai-docs/tasks/README.md` - Task system

**Root Files:**
- `design-system-test.json` - Source of truth (token specs) ⭐

---

## Archive Organization

**Archive location**: `dev-docs/4-archive/`

**Archive subdirectories:**
- `tickets/` - Completed ticket docs (SYOS-XXX-*.md)
- `audit-reports/` - Completed audits (keep latest only)
- `historical/` - Historical vision/strategy docs
- `outdated-features/` - Docs for features not in app
- `old-workflows/` - Superseded workflows
- `design-system/` - Redundant design docs
- `architecture/` - Historical architecture docs
- `architecture/audit-reports/` - Old audit reports
- `tasks/` - Completed task documents (from ai-docs/tasks/)

---

## Maintenance

**Adding new docs:**
- If CORE → Add to this list with justification
- If ARCHIVE → Move to `dev-docs/4-archive/` with appropriate subdirectory

**Updating CORE list:**
- Review quarterly or when major changes occur
- Remove docs that become outdated
- Add docs that become essential

**Archive access:**
- Archive is hidden from AI via `.cursorignore`
- Archive is still accessible to humans (just not loaded by AI)

---

**Last Updated**: 2025-01-XX  
**Purpose**: Define CORE vs ARCHIVE documentation for AI agent context management  
**Status**: Active

