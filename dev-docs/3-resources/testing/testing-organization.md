# Test Organization Guide

**Where to put tests and why.**

---

## 📁 Current Structure (Clean & Organized)

```
Axon/
├── tests/              # Backend/Convex unit tests
│   └── convex/        # Convex function tests
│       └── readwiseUtils.test.ts
├── src/                # Frontend code
│   └── lib/
│       └── utils/
│           ├── filterInboxItems.ts
│           └── filterInboxItems.test.ts  # Co-located with source
├── e2e/                # End-to-end tests (separate)
│   ├── demo.test.ts
│   └── inbox-sync.test.ts
└── src/routes/
    └── page.svelte.spec.ts  # Component tests (co-located)
```

---

## 🎯 Organization Rules

### 1. **Convex/Backend Tests** → `tests/` folder

**Location**: `tests/convex/`

**Why**:

- Keeps `convex/` folder clean (only production code)
- Easy to find all backend tests in one place
- Matches backend code structure

**Example**:

```
convex/readwiseUtils.ts          # Source code
tests/convex/readwiseUtils.test.ts  # Test code
```

**Import pattern**:

```typescript
import { parseAuthorString } from '../../convex/readwiseUtils';
```

---

### 2. **Frontend Unit Tests** → Co-located with source

**Location**: Next to the source file

**Why**:

- Easy to find (test is right next to code)
- Common pattern in frontend projects
- Clear relationship between test and source

**Example**:

```
src/lib/utils/
  ├── filterInboxItems.ts
  └── filterInboxItems.test.ts
```

---

### 3. **E2E Tests** → `e2e/` folder

**Location**: `e2e/`

**Why**:

- Separate from unit tests (different tooling: Playwright)
- Different purpose (full workflows, not individual functions)
- Standard pattern (Playwright convention)

**Example**:

```
e2e/
  ├── demo.test.ts
  └── inbox-sync.test.ts
```

---

### 4. **Component Tests** → Co-located with component

**Location**: Next to Svelte component

**Why**:

- Component-specific tests belong with component
- Easy to find when working on component

**Example**:

```
src/routes/
  ├── +page.svelte
  └── page.svelte.spec.ts
```

---

## ✅ What This Gives You

1. **Clear separation**: Backend tests vs frontend tests vs E2E
2. **Easy to find**: Tests are predictable locations
3. **Clean codebase**: `convex/` folder stays production-only
4. **Standard patterns**: Follows common conventions

---

## 🚫 What We Avoided

### ❌ Tests in `convex/` folder

**Problem**: Mixes production code with test code
**Solution**: `tests/convex/` folder

### ❌ All tests in one `tests/` folder

**Problem**: Frontend tests should be co-located for easy discovery
**Solution**: Only backend tests in `tests/`, frontend co-located

### ❌ Tests scattered everywhere

**Problem**: Hard to find, no pattern
**Solution**: Clear rules for each type

---

## 📝 Quick Reference

| Test Type      | Location        | Pattern                        |
| -------------- | --------------- | ------------------------------ |
| Convex/Backend | `tests/convex/` | `tests/convex/[name].test.ts`  |
| Frontend Utils | Co-located      | `src/lib/utils/[name].test.ts` |
| Components     | Co-located      | `src/routes/[name].spec.ts`    |
| E2E            | `e2e/`          | `e2e/[name].test.ts`           |

---

## 🎯 Summary

**Backend tests** → `tests/` folder (keeps production code clean)  
**Frontend tests** → Co-located (easy to find)  
**E2E tests** → `e2e/` folder (different tooling)

**Result**: Clean, organized, easy to find tests.
