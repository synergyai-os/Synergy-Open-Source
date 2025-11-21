# Legacy Code Cleanup Guide

**How to identify and safely remove unused code from SynergyOS**

**Reference**: `dev-docs/3-resources/legacy-code-cleanup-guide.md`

---

## 🎯 Goal

Identify code that:

- ✅ **Is actually used** → Keep it
- ⚠️ **Is test/demo code** → Mark clearly or move to `dev-docs/4-archive/`
- ❌ **Is completely unused** → Safe to remove

---

## 📋 Quick Analysis Commands

### Find Potentially Unused Components

```bash
# Run the analysis script
./scripts/find-unused-components.sh
```

### Check Specific Component Usage

```bash
# Check if component is imported anywhere
grep -r "ComponentName" src/ --include="*.svelte" --include="*.ts" --include="*.js"
```

### Find Unused Convex Functions

```bash
# List all Convex functions
grep -r "export const" convex/ --include="*.ts" | grep -v ".test.ts" | grep -v "_generated"

# Check which ones are called in frontend
grep -r "api\." src/ --include="*.svelte" --include="*.ts" | grep -o "api\.[a-zA-Z]*\.[a-zA-Z]*" | sort -u
```

### Check Test/Demo Routes

```bash
# See all routes
find src/routes -name "+page.svelte" -o -name "+page.server.ts" | sort

# Check if test routes are linked in navigation
grep -r "test\|demo" src/lib/components/Sidebar.svelte src/lib/components/Header.svelte 2>/dev/null || echo "Not found in navigation"
```

---

## ✅ Current Status (2025-11-12)

### Components That ARE Used (Keep)

**Core Components:**

- `inbox/*` - All inbox components are actively used
- `flashcards/*` - Flashcard components are used
- `notes/*` - Note editor components are used
- `organizations/*` - Organization components are used
- `permissions/*` - Permission components are used
- `ui/*` - UI components are used (31+ files import from ui/)

**Layout Components:**

- `Sidebar.svelte` - Used in layout
- `Header.svelte` - Used in layout (`src/lib/modules/core/components/Header.svelte`)
- `Loading.svelte` - Used in multiple places (`src/lib/components/ui/Loading.svelte`)
- `ErrorBoundary.svelte` - Used for error handling (`src/lib/components/ui/ErrorBoundary.svelte`)
- `GlobalActivityTracker.svelte` - Used in layout
- `ActivityCard.svelte` - Used by GlobalActivityTracker (`src/lib/modules/core/components/ActivityCard.svelte`)
- `HubCard.svelte` - Used in `/dev-docs/all` page (`src/lib/modules/core/components/HubCard.svelte`)
- `WaitlistForm.svelte` - Used in homepage (`/`) (`src/lib/modules/core/components/WaitlistForm.svelte`)

---

### ⚠️ Test/Demo Routes (Investigate)

**Found test/demo routes:**

1. `src/routes/(authenticated)/test/claude/+page.svelte` - Claude API test page
2. `src/routes/(authenticated)/test/readwise/+page.svelte` - Readwise test page
3. `src/routes/(authenticated)/demo-control-panel/+page.svelte` - ControlPanel demo

**Status:** These are test/demo pages. **Not linked in navigation** (Sidebar/Header).

**Recommendation:**

- If actively used for testing → Keep, but add clear comments
- If reference only → Move to `dev-docs/3-resources/demos/`
- If no longer needed → Archive or remove

---

### ⚠️ Components That Need Investigation

**1. AI Tools Components:**

- `src/lib/components/ai-tools/MetricsForecast.svelte`
- `src/lib/components/ai-tools/ToolComparisonTable.svelte`

**Status:** Only referenced in `src/routes/dev-docs/+page.svelte` (documentation page)

**Decision:** If these are just documentation examples, consider:

- Moving to `dev-docs/3-resources/examples/`
- Or adding clear comments: `<!-- DOCUMENTATION EXAMPLE: Not used in production -->`

---

## 🛠️ Analysis Script

Create `scripts/find-unused-components.sh`:

```bash
#!/bin/bash
# Find potentially unused Svelte components

echo "🔍 Checking for unused components..."
echo ""

# Find all components
find src/lib/components -name "*.svelte" -type f | while read component; do
    filename=$(basename "$component" .svelte)
    component_path=$(echo "$component" | sed 's|src/lib/components/||')

    # Skip index files
    if [[ "$filename" == "index" ]]; then
        continue
    fi

    # Check if component is imported (case-insensitive)
    if ! grep -riq "$filename" src/ --include="*.svelte" --include="*.ts" --include="*.js" 2>/dev/null; then
        echo "⚠️  Potentially unused: $component_path"
    fi
done

echo ""
echo "✅ Analysis complete!"
echo ""
echo "⚠️  Note: Some components might be used dynamically or in routes."
echo "    Always verify manually before deleting!"
```

---

## ✅ Safe Removal Process

### Before Removing Code:

- [ ] **Verify it's not imported** - Use grep to check all imports
- [ ] **Check dynamic imports** - Some code might be loaded dynamically
- [ ] **Check route files** - Routes might use components not visible in imports
- [ ] **Check test files** - Tests might reference the code
- [ ] **Check documentation** - Docs might reference it
- [ ] **Git history** - Check when it was last modified (might indicate usage)
- [ ] **Search for string references** - Component names might be referenced as strings

### Safe Removal Steps:

1. **Create a branch:**

   ```bash
   git checkout -b cleanup/remove-unused-code
   ```

2. **Move to archive first** (don't delete immediately):

   ```bash
   # Move unused components to archive
   mkdir -p dev-docs/4-archive/unused-components/
   mv src/lib/components/UnusedComponent.svelte dev-docs/4-archive/unused-components/
   ```

3. **Test thoroughly:**

   ```bash
   npm run build
   npm run test
   npm run test:e2e
   ```

4. **If everything works, commit:**

   ```bash
   git add .
   git commit -m "chore: remove unused ComponentName"
   ```

5. **If something breaks, restore:**
   ```bash
   git restore dev-docs/4-archive/unused-components/UnusedComponent.svelte
   mv dev-docs/4-archive/unused-components/UnusedComponent.svelte src/lib/components/
   ```

---

## 📊 Findings Summary

**Total Components:** 81 Svelte components

**Status Breakdown:**

- ✅ **Actively Used:** ~75 components (core features)
- ⚠️ **Test/Demo:** 3 routes (test/claude, test/readwise, demo-control-panel)
- ⚠️ **Documentation Examples:** 2 components (ai-tools/\*)
- ❌ **Potentially Unused:** 0 confirmed (all checked components are used)

---

## 🎯 Recommended Actions

### Immediate (Low Risk):

1. **Mark test/demo routes clearly:**
   - Add comment headers: `<!-- TEST ROUTE: Remove if not needed -->`
   - Consider moving to `dev-docs/3-resources/demos/` if reference only

2. **Document AI tools components:**
   - Add comments: `<!-- DOCUMENTATION EXAMPLE: Not used in production -->`
   - Or move to `dev-docs/3-resources/examples/`

### Short-term (Medium Risk):

1. **Verify test routes are needed:**
   - Check if developers actively use `/test/claude` and `/test/readwise`
   - If not, archive or remove

2. **Review demo-control-panel:**
   - Check if this is still needed for component development
   - If not, archive

### Long-term (Higher Risk):

1. **Systematic component audit:**
   - Run analysis script monthly
   - Document findings in this file
   - Create tickets for cleanup sprints

2. **Add linting rules:**
   - Consider adding `eslint-plugin-unused-imports`
   - Add pre-commit hook to catch unused imports

---

## 📝 Documentation

**When you find unused code:**

1. **Document it here** - Add to "Components That Need Investigation" section
2. **Add a TODO comment** - `// TODO: Verify if still needed (last used: YYYY-MM-DD)`
3. **Create a cleanup ticket** - Track in Linear

**When you remove code:**

1. **Update this guide** - Remove from investigation list
2. **Add to git commit message** - `chore: remove unused ComponentName (verified unused since YYYY-MM-DD)`
3. **Update component index** - If component was exported from index.ts

---

## 🔗 Related Resources

- **Ticket Writing Guide**: `dev-docs/2-areas/patterns/ticket-writing.md`
- **SvelteKit Project Structure**: [Official Docs](https://kit.svelte.dev/docs/project-structure)
- **TypeScript Unused Code**: `tsconfig.json` - `noUnusedLocals` and `noUnusedParameters`

---

## 📊 Last Updated

**Date:** 2025-11-12  
**Next Review:** 2025-12-12 (monthly)

**Status:**

- ✅ Initial analysis complete
- ⚠️ Test/demo routes identified (3 routes)
- ⚠️ Documentation examples identified (2 components)
- 🔄 Ongoing monitoring recommended
