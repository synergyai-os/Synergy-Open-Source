# save

Capture learnings from work session. Update patterns or Cursor rules.

**Key Principle**: One canonical pattern per concept. Merge before add.

---

## Document Hierarchy

```
Master Documents (rarely change, need review):
├── architecture.md          → 25 principles, structure, patterns
├── design-system.md         → Styling, tokens, recipes
└── governance-design.md     → Governance models, circle types

Working Documents (grow over time):
├── dev-docs/2-areas/patterns/   → Solved problems, indexed
└── .cursor/rules/               → Proactive constraints
```

**When to update what:**

| Learning Type | Update |
|---------------|--------|
| New architectural principle | `architecture.md` (rare, needs RFC for FROZEN domains) |
| New design system pattern | `design-system.md` (rare, needs review) |
| New governance pattern | `governance-design.md` (rare, needs review) |
| Solved a bug/problem | `dev-docs/2-areas/patterns/` (common) |
| Preventing repeated mistakes | `.cursor/rules/` (when 2+ occurrences) |

---

## Workflow

### 1. Analyze Session

**Frame as outcome:**
- WHO benefits? (user, developer, AI)
- WHAT value delivered?
- WHAT type of work?
  - 🎯 FEATURE - New capability
  - 🐛 BUGFIX - Fix broken functionality
  - 🔧 TECH-DEBT - Code quality
  - 📚 DOCS - Documentation
  - 🔒 RISK - Security, critical fix

### 2. Search First (MANDATORY)

**⛔ Never add pattern without searching.**

Run 3+ searches:

```bash
# By symptom
grep -r "error message" dev-docs/2-areas/patterns/

# By concept
grep -r "reactivity\|state" dev-docs/2-areas/patterns/

# By component
grep -r "NavItem\|Sidebar" dev-docs/2-areas/patterns/
```

**Decision tree:**

```
Found existing pattern?
├─ YES, one covers it → ENHANCE (add edge case, update example)
├─ YES, multiple similar → CONSOLIDATE into ONE canonical
├─ YES, but outdated → UPDATE with current approach
└─ NO, genuinely new → ADD new pattern
```

### 3. Update Patterns

**Location**: `dev-docs/2-areas/patterns/`

**Domain files:**
- `svelte-reactivity.md` - Svelte 5 patterns, composables
- `convex-integration.md` - Convex patterns, mutations, queries
- `ui-patterns.md` - UI/UX patterns, components
- `design-system-patterns.md` - Tokens, recipes, styling

**Pattern format:**

```markdown
## #L[NUMBER]: Pattern Name [🔴/🟡/🟢] 

**Keywords**: keyword1, keyword2, component-name

**Principle**: One-line generalizable lesson

**Symptom**: What triggers this pattern

**Root Cause**: Why the problem occurs

**Pattern**: Solution approach

**Implementation:**
```code
// Example
```

**Anti-Patterns**: What NOT to do

**Related**: #L[OTHER]
```

**Always update INDEX.md** with keyword and line reference.

### 4. Consider Rule Building

**When to create rule vs pattern:**

| Criteria | Action |
|----------|--------|
| Happened 2+ times | Create rule |
| Critical (breaks CI, security) | Create rule |
| Can be prevented proactively | Create rule |
| One-off fix | Pattern is sufficient |

**Rule location**: `.cursor/rules/[topic].mdc`

**Rule format:**
```markdown
---
globs: ["*.svelte", "*.ts"]  # or alwaysApply: true
---

# Rule Name

[Purpose]

## ✅ Do
[Good example]

## ❌ Don't
[Bad example]

## Why
[Reasoning]
```

### 5. Cleanup Duplicates

While updating, actively consolidate:

- **DELETE** fully redundant patterns
- **MARK SUPERSEDED** if replaced by better version
- **MERGE** similar patterns into canonical

**Goal**: Pattern count stays same or decreases.

---

## Checklist

Before saving:
- [ ] Searched 3+ variations
- [ ] Found ALL related patterns
- [ ] Decided: Enhance / Consolidate / Add
- [ ] If duplicates → Consolidated
- [ ] Pattern has Keywords field
- [ ] Updated INDEX.md
- [ ] Considered rule building

After saving:
- [ ] Pattern count same or decreased
- [ ] Report: "✅ Patterns updated. Count: X (was Y)"

---

## Quick Flow

```
1. Analyze → What type of work? What was learned?

2. Search → 3+ grep searches in dev-docs/2-areas/patterns/

3. Decide → Enhance existing / Consolidate / Add new

4. Update → Pattern file + INDEX.md

5. Consider rule → 2+ occurrences? Critical? → Create rule

6. Cleanup → Delete/merge duplicates

7. Report → Pattern count
```

---

## Related

- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` — Pattern index and lookup
- **Rules**: `.cursor/rules/` — Proactive constraints
- **Architecture**: `architecture.md` — 25 principles, identity model, auth patterns
- **Design System**: `design-system.md` — Tokens, recipes, styling patterns
- **Governance**: `governance-design.md` — Circle types, role templates

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-19 | Rewritten aligned with architecture.md v4.1. Uses `dev-docs/2-areas/patterns/` structure. |