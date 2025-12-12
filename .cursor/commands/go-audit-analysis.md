# `/go` Command Audit & Refactoring Analysis

**Date**: 2025-11-24  
**Purpose**: Analyze `/go` command usage patterns and recommend refactoring strategy  
**Status**: Analysis Complete - Recommendations Ready

---

## 🎯 Executive Summary

**Current State**: `/go` command is ~995 lines and handles too many different use-cases, violating single-responsibility principle.

**Recommendation**: Extract common task-specific workflows into dedicated commands, keep `/go` as fallback for truly generic implementation.

**Impact**: Better AI guidance, fewer mistakes, clearer workflows, aligns with Brandon's task-specific template system.

---

## 📊 Current `/go` Command Analysis

### Current Size & Complexity

- **Lines**: ~995 lines
- **Sections**: 8 major workflow steps + 4 specialized subsections
- **Use Cases Handled**:
  1. Generic feature implementation
  2. Recipe creation (section 6.4 - embedded)
  3. Component creation (implicit)
  4. Bug fixes (overlaps with `/bug-fix`)
  5. UI/design system work
  6. Backend/Convex work
  7. Mixed frontend/backend features

### Problem: Too Many Responsibilities

**Current `/go` handles**:
- ✅ Pattern checking (good - should stay)
- ✅ Design token validation (good - should stay)
- ✅ Recipe system patterns (good - but recipe creation should use `/create-recipe`)
- ✅ Reference code checking (good - should stay)
- ✅ Svelte MCP validation (good - should stay)
- ✅ Context7 usage (good - should stay)
- ✅ Implementation (good - core responsibility)
- ❌ **Recipe creation workflow** (section 6.4) → Should use `/create-recipe`
- ❌ **Recipe validation** (section 6.4.5) → Should use `/create-recipe`
- ❌ **Component creation patterns** (implicit) → Should have `/create-component`

**Result**: AI agents get confused about which workflow to follow, leading to:
- Skipping recipe-specific validation steps
- Not following component creation best practices
- Inconsistent implementations

---

## 🔍 Comparison with Existing Task-Specific Commands

### ✅ Already Extracted (Good Examples)

| Command | Purpose | Lines | Status |
|---------|---------|-------|--------|
| `/bug-fix` | Systematic bug investigation & fix | 945 | ✅ Complete |
| `/code-cleanup` | Dead code removal workflow | 387 | ✅ Complete |
| `/code-review` | Senior engineer review | 571 | ✅ Complete |
| `/create-recipe` | Recipe creation workflow | 450 | ✅ Complete |
| `/task-template` | Pre-coding analysis | 382 | ✅ Complete |
| `/svelte-validate` | Svelte code validation | 514 | ✅ Complete |

### ❌ Still Embedded in `/go` (Should Extract)

| Use Case | Current Location | Should Be |
|----------|-----------------|-----------|
| Recipe creation | Section 6.4 in `/go` | `/create-recipe` (already exists!) |
| Component creation | Implicit in `/go` | `/create-component` (NEW) |
| Design system component | Implicit in `/go` | `/create-component` (with design system flag) |
| Feature implementation | Core `/go` | Keep in `/go` (fallback) |

---

## 🎯 Recommended Refactoring Strategy

### Phase 1: Extract Component Creation (HIGH PRIORITY)

**Why**: Component creation has specific patterns (layer classification, Storybook stories, recipe integration) that `/go` doesn't enforce well.

**New Command**: `/create-component`

**Purpose**: Create new Svelte components following design system patterns.

**Workflow**:
1. Determine component layer (1-4) using decision tree
2. Check if recipe needed (CSS component → use recipe, SVG → manual tokens)
3. Create component file structure
4. If recipe needed → Call `/create-recipe` workflow
5. Create Storybook stories (with correct title hierarchy)
6. Validate (Svelte MCP, ESLint, recipes if applicable)

**Benefits**:
- Enforces component architecture patterns
- Ensures Storybook stories are created correctly
- Integrates with recipe system automatically
- Clear guidance for AI agents

---

### Phase 2: Update `/go` to Reference Specific Commands (MEDIUM PRIORITY)

**Current Problem**: `/go` has recipe creation workflow embedded (section 6.4).

**Solution**: Remove recipe creation workflow, add decision tree that routes to `/create-recipe`.

**Changes**:
1. **Remove** section 6.4 (Recipe Validation) from `/go`
2. **Add** decision tree at start:
   ```
   Q: Is this creating a recipe?
   → Yes: Use /create-recipe SYOS-XXX
   
   Q: Is this creating a new component?
   → Yes: Use /create-component SYOS-XXX
   
   Q: Is this fixing a bug?
   → Yes: Use /bug-fix SYOS-XXX
   
   Q: Is this generic feature implementation?
   → Yes: Continue with /go workflow
   ```
3. **Keep** core implementation workflow (patterns, tokens, reference code, Svelte validation, implementation, ESLint)

**Result**: `/go` becomes ~700 lines (down from 995), focused on generic implementation.

---

### Phase 3: Create Component Creation Command (HIGH PRIORITY)

**New Command**: `/create-component`

**Structure** (similar to `/create-recipe`):

```markdown
# Create Component Command

**Purpose**: Create new Svelte components following design system patterns.

**When to use**: User requests "create component [name]" or needs new UI component.

## STEP 0: Decision Tree

Q: Is this a CSS component or SVG component?
→ CSS: Use recipe system (call /create-recipe workflow)
→ SVG: Use manual tokens with SYOS-522 exception

## STEP 1: Determine Component Layer

Use decision tree from component-architecture.md:
- Layer 1: Primitive (unstyled, accessibility only)
- Layer 2: Styled component (design system atom)
- Layer 3: Composite (2-3 styled components)
- Layer 4: Feature-specific (domain logic)

## STEP 2: Check Recipe Requirements

If CSS component:
- Check if recipe exists
- If not → Use /create-recipe workflow
- If exists → Import and use

If SVG component:
- Add SYOS-522 exception comment
- Use manual token approach

## STEP 3: Create Component File

Location based on layer:
- Layer 1-2: `src/lib/components/ui/primitives/` or `src/lib/components/ui/`
- Layer 3: `src/lib/components/ui/` (molecules/organisms)
- Layer 4: `src/lib/components/[module]/`

## STEP 4: Create Storybook Stories

Title hierarchy:
- Design System: `'Design System/Atoms/[Component]'`
- Module-specific: `'Modules/[ModuleName]/[Component]'`

## STEP 5: Validate

- Svelte MCP validation (mandatory)
- ESLint validation (mandatory)
- Recipe validation (if recipe created)
- Visual check in Storybook

## STEP 6: Integration

- Export from barrel file
- Update module API (if Layer 4)
- Document component usage
```

**Estimated Size**: ~400-500 lines (similar to `/create-recipe`)

---

## 📋 Decision Tree: When to Use What

### Current (Confusing)

```
User: "Create a badge component"
AI: Uses /go → Tries to figure out recipe creation → May skip steps
```

### Proposed (Clear)

```
User: "Create a badge component"
AI: Uses /create-component → Automatically calls /create-recipe → Follows all steps
```

### Complete Decision Tree

```
Q: What type of task?

├─ Creating Recipe
│  └─ → Use /create-recipe SYOS-XXX
│
├─ Creating Component
│  └─ → Use /create-component SYOS-XXX
│     └─ If CSS component → Calls /create-recipe automatically
│
├─ Fixing Bug
│  └─ → Use /bug-fix SYOS-XXX
│
├─ Code Cleanup
│  └─ → Use /code-cleanup SYOS-XXX
│
├─ Code Review
│  └─ → Use /code-review SYOS-XXX
│
├─ Complex Feature (Multiple Approaches)
│  └─ → Use /task-template SYOS-XXX → Review → /go
│
└─ Generic Feature Implementation
   └─ → Use /go SYOS-XXX (fallback for everything else)
```

---

## 🎯 Benefits of Refactoring

### 1. Clearer AI Guidance

**Before**: AI sees `/go` with 995 lines, tries to handle everything, may skip recipe-specific steps.

**After**: AI sees `/create-component`, follows component-specific workflow, automatically calls `/create-recipe` when needed.

### 2. Better Pattern Enforcement

**Before**: Recipe creation patterns embedded in `/go` (easy to miss).

**After**: Recipe creation has dedicated command with mandatory validation steps.

### 3. Aligns with Brandon's System

**Before**: Generic `/go` for everything (violates task-specific template principle).

**After**: Task-specific commands for common workflows (matches Brandon's approach).

### 4. Easier Maintenance

**Before**: Recipe validation logic in `/go` (section 6.4) + `/create-recipe` (duplication risk).

**After**: Recipe logic only in `/create-recipe`, `/go` references it (single source of truth).

### 5. Better User Experience

**Before**: User says "create badge component" → AI uses `/go` → May miss steps.

**After**: User says "create badge component" → AI uses `/create-component` → Follows complete workflow → Calls `/create-recipe` automatically → All steps completed.

---

## 📊 Impact Analysis

### Command Size Changes

| Command | Before | After | Change |
|---------|--------|-------|--------|
| `/go` | 995 lines | ~700 lines | -295 lines (-30%) |
| `/create-component` | N/A | ~450 lines | +450 lines (NEW) |
| `/create-recipe` | 450 lines | 450 lines | No change |

**Net Change**: +155 lines total (worth it for clarity and maintainability)

### Workflow Clarity

**Before**: 1 generic command (`/go`) handles 7+ use cases.

**After**: 8 specialized commands handle specific use cases, `/go` is fallback.

**Result**: Clearer guidance, fewer mistakes, better pattern enforcement.

---

## 🚀 Implementation Plan

### Step 1: Create `/create-component` Command (HIGH PRIORITY)

**Why First**: Component creation is most common use case after generic features.

**Tasks**:
1. Create `.cursor/commands/create-component.md`
2. Define component creation workflow
3. Integrate with `/create-recipe` (call it when CSS component needs recipe)
4. Add Storybook story creation patterns
5. Add validation steps (Svelte MCP, ESLint, recipes)

**Estimated Time**: 2-3 hours

### Step 2: Update `/go` to Reference Specific Commands (MEDIUM PRIORITY)

**Why Second**: Reduces `/go` complexity, routes to correct commands.

**Tasks**:
1. Add decision tree at start of `/go`
2. Remove section 6.4 (Recipe Validation) - reference `/create-recipe` instead
3. Remove recipe-specific validation steps
4. Keep core implementation workflow (patterns, tokens, reference code, Svelte validation, implementation, ESLint)
5. Update documentation to reference `/create-component` for component creation

**Estimated Time**: 1-2 hours

### Step 3: Update Workflow Documentation (LOW PRIORITY)

**Why Third**: Ensures users and AI agents know when to use what.

**Tasks**:
1. Update `ai-development-workflow-v2.md` with new decision tree
2. Add `/create-component` to quick reference
3. Update examples to show component creation workflow
4. Document integration between `/create-component` and `/create-recipe`

**Estimated Time**: 1 hour

---

## ⚠️ Risks & Mitigations

### Risk 1: Command Proliferation

**Risk**: Too many commands, hard to remember which to use.

**Mitigation**: 
- Clear decision tree in each command
- `/go` as fallback for everything else
- Documentation with examples

### Risk 2: Breaking Existing Workflows

**Risk**: Users/AI agents already using `/go` for component creation.

**Mitigation**:
- Keep `/go` working (just add decision tree that routes)
- Gradual migration (document new commands, keep `/go` as fallback)
- Update examples in workflow docs

### Risk 3: Duplication Between Commands

**Risk**: Same patterns in `/go` and `/create-component`.

**Mitigation**:
- Reference shared patterns (don't duplicate)
- `/create-component` calls `/create-recipe` (don't duplicate recipe logic)
- Keep common workflow steps in `/go`, reference from specialized commands

---

## ✅ Recommendations Summary

### Immediate Actions (This Week)

1. ✅ **Create `/create-component` command** - Extract component creation workflow
2. ✅ **Update `/go` decision tree** - Route to specific commands
3. ✅ **Remove recipe section from `/go`** - Reference `/create-recipe` instead

### Future Enhancements (Next Sprint)

1. Consider `/create-feature` for feature modules (if pattern emerges)
2. Consider `/create-composable` for composables (if pattern emerges)
3. Monitor command usage, extract more if needed

### Keep `/go` As Fallback

**Purpose**: Generic implementation workflow for everything that doesn't fit specialized commands.

**When to use**:
- Generic feature implementation (not component, not recipe, not bug fix)
- Mixed frontend/backend work
- Refactoring existing code
- Everything else that doesn't have a specialized command

---

## 📚 References

- **Brandon's System**: `ai-development-workflow-v2.md` - Task-specific templates prevent "AI code slop"
- **Component Architecture**: `dev-docs/2-areas/component-architecture.md` - Layer classification
- **Recipe System**: `dev-docs/2-areas/patterns/recipe-system.md` - Recipe patterns
- **Existing Commands**: `.cursor/commands/README.md` - Command optimization strategy

---

**Last Updated**: 2025-11-24  
**Status**: Analysis Complete - Ready for Implementation  
**Next Step**: Create `/create-component` command (Step 1)

