# AI Documentation System

> **Status**: 🚧 In Progress  
> **Branch**: `feature/ai-docs-system`  
> **Linear Project**: [AI Documentation System](https://linear.app/younghumanclub) <!-- Will update after creation -->  
> **Started**: November 10, 2025  
> **Target Completion**: 1 day (5 hours)

---

## 👥 Team & Ownership

**Team**: Randy (Founder)

**Key Contributors**:

- Randy - Product decisions, validation, testing
- AI Assistant - Technical implementation, documentation

---

## 🎯 Outcome & Success Signals

**Outcome**: **Enable effortless navigation and maintenance of documentation without manual link fixing or naming conflicts** (by AI → real outcome is not defined or linked yet)

### How We'll Know We Succeeded

**Leading Indicators** (Early signals):

- [ ] Randy can rename/move files without breaking links
- [ ] Navigation shows clean names everywhere (no "1-", "2-" visible)
- [ ] AI can find docs without path confusion
- [ ] Link checker catches breaks before deploy
- [ ] All 20+ broken links in `/dev-docs/2-areas` now work

**Lagging Indicators** (Outcome signals):

- [ ] Zero broken links for 30 days
- [ ] Doc maintenance time < 5min/week (vs current baseline)
- [ ] New contributors understand structure immediately
- [ ] No "where is this file?" questions from team

**⚠️ These are AI guesses - Validate with real usage!**

**Validation Plan**:

1. Test all links in `/dev-docs/2-areas/README.md` after Slice 1
2. Track time spent fixing links over next 2 weeks
3. Interview Randy: "Has this reduced documentation friction?"

---

## 📋 Project Overview

Fix broken links in dev-docs and clean up PARA numbering display while keeping organizational benefits.

### User Stories

**As Randy**, I want to:

- ✅ Click any link in dev-docs and have it work
- ✅ See clean names ("Projects" not "1-projects") everywhere
- ✅ Move/rename files without manually updating all references
- ✅ Get automated alerts when links break

**As AI Assistant**, I want to:

- ✅ Find documentation without path confusion
- ✅ Reference docs using clean names
- ✅ Trust that links in docs are accurate

**As Future Contributors**, I want to:

- ✅ Understand folder structure intuitively
- ✅ Add new docs without breaking existing links
- ✅ See clear navigation without technical artifacts

---

## 🏗️ Architecture At-a-Glance

### Current Problems

**Problem 1: Broken Relative Links**

```markdown
<!-- In /dev-docs/2-areas/README.md -->

[Product Vision](product-vision-and-plan.md)

<!-- Current renderer strips .md -->

→ href="product-vision-and-plan"

<!-- Browser resolves relative to current page -->

→ /dev-docs/product-vision-and-plan ❌ (missing /2-areas/)
```

**Problem 2: PARA Numbers Show in UI**

- URLs: `/dev-docs/1-projects`
- Breadcrumbs: "1 Projects"
- Page titles: Mix of both

**Problem 3: No Link Validation**

- Broken links go unnoticed
- Manual checking required
- Breaks accumulate over time

### Solutions

**Solution 1: Directory-Aware Link Resolution**

```typescript
// Make relative links explicit
if (
	!href.startsWith('http') &&
	!href.startsWith('/') &&
	!href.startsWith('./') &&
	!href.startsWith('../')
) {
	href = './' + href; // Browser resolves correctly!
}
```

**Solution 2: Clean PARA Display**

```typescript
// Strip "N-" prefix in all UI displays
displayName = folderName.replace(/^\d+-/, '');
// "1-projects" → "projects"
// "2-areas" → "areas"
```

**Solution 3: Automated Link Checking**

```yaml
# GitHub Action checks all .md files
- Validates internal links
- Fails build if broken
- Reports which links failed
```

---

## 📦 Vertical Slices

| #   | Slice               | Status  | Linear   | Est | Description                              |
| --- | ------------------- | ------- | -------- | --- | ---------------------------------------- |
| 1   | Fix Link Resolution | ⏳ Todo | [SYOS-?] | 2h  | Make markdown renderer directory-aware   |
| 2   | Clean PARA Display  | ⏳ Todo | [SYOS-?] | 1h  | Strip "N-" from breadcrumbs, titles, nav |
| 3   | Add Link Checker    | ⏳ Todo | [SYOS-?] | 2h  | GitHub Action for automated validation   |

**Total Estimate**: 5 hours (~1 day)

**Detailed Breakdown**: See [vertical-slices.md](./vertical-slices.md)

---

## ✅ Completion Criteria (Definition of Done)

### Functional Requirements

- [ ] All links in `/dev-docs/2-areas/README.md` work correctly
- [ ] Subdirectory links work (e.g., `patterns/INDEX.md`)
- [ ] Parent directory links work (e.g., `../../rbac-architecture.md`)
- [ ] Hash fragments work (e.g., `#L10` → `#l10`)
- [ ] No "1-", "2-", "3-", "4-" visible in:
  - [ ] Navigation menu
  - [ ] Breadcrumbs
  - [ ] Page titles
  - [ ] URLs (display - actual paths stay same)

### Testing

- [ ] Manual: Click all links in `/dev-docs/2-areas/README.md`
- [ ] Manual: Test patterns links with line numbers
- [ ] Manual: Test relative paths in subdirectories
- [ ] Automated: Link checker passes on sample docs
- [ ] Automated: Link checker fails on intentionally broken link

### Documentation

- [ ] Architecture decision recorded
- [ ] Pattern added to `dev-docs/patterns/INDEX.md`
- [ ] This README updated with results

### Code Quality

- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] All tests passing
- [ ] No breaking changes to existing navigation

---

## 📚 Documentation

| Document                                       | Purpose                            |
| ---------------------------------------------- | ---------------------------------- |
| [README.md](./README.md)                       | 👈 You are here (project overview) |
| [vertical-slices.md](./vertical-slices.md)     | Detailed slice breakdown           |
| [testing-checklist.md](./testing-checklist.md) | Manual QA steps                    |
| [decisions/](./decisions/)                     | Architecture Decision Records      |

---

## 🔑 Key Design Decisions

### 1. Keep PARA Folder Structure

**Decision**: Keep `1-projects/`, `2-areas/`, etc. in filesystem  
**Rationale**: PARA provides clear organization, just hide numbers in UI  
**Alternative**: Rename folders (rejected: too disruptive, breaks bookmarks)

### 2. Directory-Aware Link Resolution

**Decision**: Prepend `./` to relative links without protocol/leading slash  
**Rationale**: Browser's native resolution handles all edge cases correctly  
**Alternative**: Path rewriting (rejected: complex, error-prone)

### 3. Automated Link Checking

**Decision**: GitHub Action on every commit  
**Rationale**: Catches breaks immediately, prevents accumulation  
**Alternative**: Manual checking (rejected: doesn't scale)

---

## 🧪 Testing Strategy

### Manual Testing

- Click every link in updated README files
- Test navigation from different starting points
- Verify PARA numbers don't show in UI
- Test hash fragments work

### Automated Testing

- Link checker validates all .md files
- CI fails on broken links
- Test with intentionally broken link

**Testing Checklist**: [testing-checklist.md](./testing-checklist.md)

---

## 🚀 What Happens After

### Pattern Extraction

After completing all slices:

1. Extract reusable patterns → `dev-docs/patterns/ui-patterns.md`
2. Update `dev-docs/patterns/INDEX.md`
3. Document link resolution pattern for future reference

### Archive Project

1. Move `dev-docs/1-projects/ai-docs-system/` → `dev-docs/4-archive/`
2. Keep architecture decisions accessible
3. Link from main architecture.md

---

## 📊 Progress Tracking

**Completed**: 0/3 slices  
**In Progress**: None  
**Next Up**: Slice 1 - Fix Link Resolution

**Last Updated**: November 10, 2025

---

## 🔗 Related

- **Architecture**: [architecture.md](../../2-areas/architecture.md)
- **Product Principles**: [product-principles.md](../../2-areas/product-principles.md)
- **Patterns Index**: [patterns/INDEX.md](../../2-areas/patterns/INDEX.md)
