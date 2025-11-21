# Prevent Accidental Branch Switching & Work Loss

**Goal**: Implement safety gates to prevent accidental branch switching, ensure work stays on correct branch, and require explicit user confirmation before any destructive operations.

---

## Problem Analysis

### Current State

**What exists now:**

- `/branch` command exists but doesn't prevent switching
- Pre-commit hooks validate code but not branch state
- No git hooks preventing branch switching
- No safety checks before destructive operations (delete, reset, etc.)
- No work preservation checks before branch operations

**Pain Points:**

- ❌ **Branch switching happened somehow** - Work ended up on wrong branch
- ❌ **No confidence gates** - AI proceeded with destructive operations without confirmation
- ❌ **Fear of work loss** - User worried about losing time/money/work
- ❌ **No branch validation** - Can switch to any branch without checks
- ❌ **No work preservation** - Uncommitted changes can be lost during branch switch

**User Impact:**

- **High risk**: Losing hours/days of work due to accidental branch switch
- **Trust erosion**: AI proceeding without confirmation breaks trust
- **Time waste**: Recovering lost work takes significant time
- **Money loss**: Paid AI time wasted on recovery instead of progress

**Investigation:**

- ✅ Checked existing git hooks (none found in `.git/hooks/`)
- ✅ Reviewed `/branch` command (creates branches but doesn't prevent switching)
- ✅ Reviewed Context7 conventional branch patterns (validation hooks available)
- ✅ Checked pre-commit hook (validates code, not branch state)
- ✅ Reviewed workflow doc (no branch safety gates mentioned)

---

## Approach Options

### Approach A: Git Pre-Checkout Hook + AI Safety Gates

**How it works**:

- **Git hook**: `.git/hooks/pre-checkout` validates branch switch
  - Checks for uncommitted changes
  - Requires explicit confirmation for branch switch
  - Validates branch name matches ticket ID (if available)
- **AI safety gates**: Before any destructive operation:
  - Check current branch
  - Check for uncommitted changes
  - Show summary of what will happen
  - **REQUIRE user confirmation** before proceeding
  - Never proceed with `--force` or destructive operations without explicit "yes"

**Pros**:

- Prevents accidental switches at git level
- AI-level gates catch operations git hooks miss
- Works for both manual and AI-initiated operations
- Can validate branch naming conventions

**Cons**:

- Git hooks can be bypassed with `--no-verify`
- Requires maintaining hook scripts
- May slow down legitimate operations

**Complexity**: Medium

**Dependencies**:

- Git hooks infrastructure
- Hook installation script
- AI command modifications

---

### Approach B: AI-Only Safety Gates (No Git Hooks)

**How it works**:

- **AI safety checks**: Before ANY branch operation:
  - Always check current branch first
  - Always check for uncommitted changes
  - Always show what will happen
  - **ALWAYS require explicit confirmation** before:
    - Switching branches
    - Deleting branches
    - Resetting branches
    - Force operations
- **Work preservation**: Before branch switch:
  - Detect uncommitted changes
  - Offer to commit, stash, or abort
  - Never proceed without user choice

**Pros**:

- Simpler (no git hooks to maintain)
- Works for all AI operations
- Can provide better UX (explain what's happening)
- Easier to modify/update

**Cons**:

- Doesn't prevent manual git operations
- Relies on AI following rules (can be bypassed)
- Requires discipline in all commands

**Complexity**: Low-Medium

**Dependencies**:

- Command modifications
- Safety check patterns
- User confirmation workflow

---

### Approach C: Hybrid Approach (Git Hooks + AI Gates + Branch Validation)

**How it works**:

- **Git pre-checkout hook**: Basic validation
  - Check for uncommitted changes
  - Warn if switching away from feature branch with uncommitted work
- **Git pre-push hook**: Branch name validation
  - Enforce conventional branch naming
  - Require ticket ID in branch name (if not main)
- **AI safety gates**: Comprehensive checks
  - Always verify branch before operations
  - Always check for uncommitted changes
  - Always show summary before destructive operations
  - **REQUIRE explicit confirmation** (never assume "yes")
  - Preserve work automatically (commit or stash before switch)

**Pros**:

- Multiple layers of protection
- Prevents both manual and AI mistakes
- Validates branch naming automatically
- Comprehensive safety coverage

**Cons**:

- More complex to implement
- More hooks to maintain
- May feel restrictive for experienced users

**Complexity**: High

**Dependencies**:

- Git hooks infrastructure
- Hook installation/maintenance
- AI command modifications
- Branch naming validation

---

## Recommendation

**Selected**: Approach C (Hybrid Approach)

**Reasoning**:

- **Multiple safety layers** prevent different failure modes
- **Git hooks** catch manual operations AI might miss
- **AI gates** provide better UX and explanation
- **Branch validation** prevents wrong branch creation
- **Work preservation** automatic (commit/stash) prevents loss

**Trade-offs accepted**:

- More complexity (worth it for safety)
- Slightly slower operations (safety > speed)
- More maintenance (but prevents costly mistakes)

**Risk assessment**:

- **Low risk** - Standard git hook patterns, well-documented
- **High value** - Prevents work loss, builds trust
- **Reversible** - Can disable hooks if needed

---

## Current State

**Existing Code**:

- `.cursor/commands/branch.md` - Branch creation command (no safety gates)
- `.cursor/commands/start.md` - Onboarding command (no branch checks)
- `.husky/pre-commit` - Pre-commit hook (validates code, not branch)
- No git hooks in `.git/hooks/` (need to create)

**Dependencies**:

- Git hooks infrastructure (standard git feature)
- Husky (already installed for pre-commit)
- Context7 conventional branch patterns (reference available)

**Patterns**:

- Conventional Branch: `/websites/conventional-branch_github_io` (branch validation patterns)
- Git hooks: Standard git feature (pre-checkout, pre-push)
- Safety gates: Need to create pattern

**Constraints**:

- Must work with existing workflow
- Must not break legitimate operations
- Must be reversible (can disable if needed)
- Must preserve work (never lose uncommitted changes)

---

## Technical Requirements

### 1. Git Pre-Checkout Hook

**File**: `.git/hooks/pre-checkout`

**Functionality**:

- Check for uncommitted changes before branch switch
- If uncommitted changes exist:
  - Show warning with file list
  - Offer options: commit, stash, abort
  - Block switch until resolved
- Validate branch name matches ticket ID (if available in context)

**Implementation**:

```bash
#!/bin/sh
# Pre-checkout hook - Prevent accidental branch switching with uncommitted work

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  WARNING: You have uncommitted changes!"
  echo ""
  git status --short
  echo ""
  echo "Options:"
  echo "  1. Commit changes: git add . && git commit -m 'message'"
  echo "  2. Stash changes: git stash"
  echo "  3. Abort checkout: Press Ctrl+C"
  echo ""
  read -p "Continue anyway? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "❌ Checkout aborted. Resolve uncommitted changes first."
    exit 1
  fi
fi

exit 0
```

---

### 2. Git Pre-Push Hook

**File**: `.git/hooks/pre-push`

**Functionality**:

- Validate branch name follows conventions
- Require ticket ID in branch name (if not main/master)
- Block push if branch name invalid

**Implementation**:

```bash
#!/bin/sh
# Pre-push hook - Validate branch naming conventions

branch_name=$(git rev-parse --abbrev-ref HEAD)

# Skip validation for main branches
if [ "$branch_name" = "main" ] || [ "$branch_name" = "master" ]; then
  exit 0
fi

# Check for conventional prefix
if ! echo "$branch_name" | grep -qE '^(feature|fix|docs|chore)/'; then
  echo "❌ Invalid branch name: $branch_name"
  echo "Branch must start with: feature/, fix/, docs/, or chore/"
  exit 1
fi

# Check for ticket ID (SYOS-XXX)
if ! echo "$branch_name" | grep -qE 'SYOS-[0-9]+'; then
  echo "⚠️  WARNING: Branch name missing ticket ID (SYOS-XXX)"
  echo "Branch: $branch_name"
  echo ""
  read -p "Continue anyway? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "❌ Push aborted. Include ticket ID in branch name."
    exit 1
  fi
fi

exit 0
```

---

### 3. AI Safety Gate Pattern

**New Pattern**: `dev-docs/2-areas/patterns/branch-safety.md`

**Functionality**:

- **Before ANY branch operation**: Check current branch, check uncommitted changes
- **Before destructive operations**: Show summary, REQUIRE confirmation
- **Before branch switch**: Preserve work (commit or stash), show what will happen
- **Never assume**: Always ask, never proceed without explicit "yes"

**Pattern Structure**:

```markdown
# Branch Safety Gates Pattern

## Before Branch Operations

1. **Check Current State**:
   - Current branch: `git branch --show-current`
   - Uncommitted changes: `git status --short`
   - Unpushed commits: `git log origin/branch..HEAD`

2. **Show Summary**:
   - What branch you're on
   - What changes exist
   - What will happen

3. **Require Confirmation**:
   - Show options (commit, stash, abort)
   - Wait for explicit user choice
   - Never proceed without "yes"

## Before Destructive Operations

- Branch deletion
- Force push
- Hard reset
- Branch switching with uncommitted changes

**ALWAYS**: Show summary → Require confirmation → Never assume
```

---

### 4. Command Modifications

**Files to modify**:

- `.cursor/commands/start.md` - Add branch check before onboarding
- `.cursor/commands/branch.md` - Add safety gates before branch creation/switch
- `.cursor/commands/pr-close.md` - Add confirmation before branch deletion
- `.cursor/commands/go.md` - Add branch check before starting work

**Modifications**:

- **Before starting work**: Check current branch matches ticket ID
- **Before branch switch**: Check for uncommitted changes, require confirmation
- **Before branch delete**: Show what will be deleted, require confirmation
- **Before any destructive operation**: Show summary, REQUIRE explicit "yes"

---

### 5. Hook Installation Script

**File**: `scripts/install-git-hooks.sh`

**Functionality**:

- Install pre-checkout hook
- Install pre-push hook
- Make hooks executable
- Verify installation

**Implementation**:

```bash
#!/bin/bash
# Install git safety hooks

HOOKS_DIR=".git/hooks"

# Create hooks directory if needed
mkdir -p "$HOOKS_DIR"

# Copy hooks
cp scripts/git-hooks/pre-checkout "$HOOKS_DIR/pre-checkout"
cp scripts/git-hooks/pre-push "$HOOKS_DIR/pre-push"

# Make executable
chmod +x "$HOOKS_DIR/pre-checkout"
chmod +x "$HOOKS_DIR/pre-push"

echo "✅ Git safety hooks installed"
```

---

## Success Criteria

### Functional

- ✅ **Pre-checkout hook**: Blocks branch switch with uncommitted changes (unless confirmed)
- ✅ **Pre-push hook**: Validates branch naming conventions
- ✅ **AI safety gates**: Always check branch/status before operations
- ✅ **User confirmation**: Never proceed with destructive operations without explicit "yes"
- ✅ **Work preservation**: Uncommitted changes never lost during branch switch

### Safety

- ✅ **Zero work loss**: Uncommitted changes always preserved (commit or stash)
- ✅ **Explicit confirmation**: User must say "yes" before destructive operations
- ✅ **Branch validation**: Branch names must follow conventions
- ✅ **Ticket ID validation**: Feature branches must include ticket ID

### UX

- ✅ **Clear warnings**: User understands what will happen
- ✅ **Options presented**: User can choose commit, stash, or abort
- ✅ **Reversible**: Can disable hooks if needed (with warning)

---

## Implementation Checklist

### Phase 1: Git Hooks (Foundation)

- [ ] Create `.git/hooks/pre-checkout` hook
- [ ] Create `.git/hooks/pre-push` hook
- [ ] Create `scripts/git-hooks/` directory
- [ ] Create hook installation script
- [ ] Test hooks locally (try switching with uncommitted changes)
- [ ] Document hook behavior

### Phase 2: AI Safety Gates (Command Modifications)

- [ ] Modify `/start` command - Add branch check before onboarding
- [ ] Modify `/branch` command - Add safety gates before branch operations
- [ ] Modify `/go` command - Add branch verification before starting work
- [ ] Modify `/pr-close` command - Add confirmation before branch deletion
- [ ] Create branch safety pattern document

### Phase 3: Work Preservation (Automatic)

- [ ] Add auto-stash option before branch switch
- [ ] Add auto-commit option (with user confirmation)
- [ ] Add work recovery mechanism (if work lost)
- [ ] Test work preservation scenarios

### Phase 4: Branch Validation (Naming)

- [ ] Integrate branch name validation with ticket ID
- [ ] Add validation to pre-push hook
- [ ] Add validation to `/branch` command
- [ ] Test branch name validation

### Phase 5: Documentation & Testing

- [ ] Document safety gates in workflow doc
- [ ] Add examples of safety gates in action
- [ ] Test all scenarios (branch switch, delete, etc.)
- [ ] Update `/start` command to mention safety gates

---

## Risk Mitigation

### Risk: Hooks Too Restrictive

**Mitigation**:

- Hooks can be bypassed with `--no-verify` (documented)
- Hooks show clear options (commit, stash, abort)
- Can disable hooks if needed (with warning)

### Risk: Breaking Existing Workflow

**Mitigation**:

- Test hooks with existing workflow
- Provide clear error messages
- Document how to work with hooks

### Risk: AI Bypassing Safety Gates

**Mitigation**:

- Git hooks catch manual operations
- AI gates catch AI operations
- Multiple layers prevent bypass

---

## Testing Scenarios

### Scenario 1: Branch Switch with Uncommitted Changes

**Test**:

1. Make changes on branch A
2. Try to switch to branch B
3. **Expected**: Hook blocks, shows warning, requires confirmation

### Scenario 2: AI Branch Operation

**Test**:

1. AI tries to switch branches
2. AI checks for uncommitted changes
3. AI shows summary and requires confirmation
4. **Expected**: User must confirm before proceeding

### Scenario 3: Invalid Branch Name

**Test**:

1. Try to push branch without ticket ID
2. **Expected**: Pre-push hook blocks, shows error

### Scenario 4: Destructive Operation

**Test**:

1. AI tries to delete branch
2. AI shows what will be deleted
3. AI requires explicit confirmation
4. **Expected**: User must say "yes" before deletion

---

## Next Steps

1. **Create Linear ticket** for this work
2. **Review this task document** - Confirm approach
3. **Implement Phase 1** (Git hooks) - Foundation
4. **Test hooks** - Verify they work
5. **Implement Phase 2** (AI gates) - Command modifications
6. **Test safety gates** - Verify user confirmation works
7. **Document** - Update workflow docs with safety gates

---

**Priority**: HIGH (prevents work loss, builds trust)  
**Complexity**: Medium-High (multiple components)  
**Risk**: Low (reversible, well-tested patterns)
