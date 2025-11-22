# Branch Safety Gates Pattern

**Purpose**: Prevent accidental branch switching, work loss, and ensure explicit user confirmation before destructive operations.

**Status**: Active pattern (implemented in SYOS-430)

---

## #L10: Explicit Confirmation Before Branch Operations [🔴 CRITICAL]

**Symptom**: AI proceeds with branch operations without showing summary or asking for confirmation, risking work loss  
**Root Cause**: Missing explicit confirmation step in branch workflow  
**Fix**:

**Before ANY branch operation, ALWAYS:**

1. **Show Summary** (MANDATORY):
   - Current branch name
   - List of uncommitted changes (files modified/added/deleted)
   - What will happen (step-by-step)
   - Which option will be used (if multiple options exist)

2. **Present Options** (if uncommitted changes exist):
   - **Option A**: Move changes to new branch, then commit (recommended)
   - **Option B**: Stash changes, create clean branch, then apply
   - **Option C**: Abort branch creation

3. **Require Explicit Confirmation** (MANDATORY):
   - Show: "Proceed with Option A? (yes/no)"
   - **WAIT for user response**
   - **NEVER proceed without explicit "yes"**
   - **NEVER assume user wants to proceed**

**Example Summary Format:**

```
📋 Summary:
   - Current branch: main
   - Uncommitted changes: 2 files
     • Modified: .cursor/commands/branch.md
     • Untracked: ai-docs/tasks/SYOS-430-branch-safety-gates.md
   - Action: Create feature/design-system-v1-completed
   - What will happen:
     1. Create branch from current state (changes come with you)
     2. Switch to new branch
     3. Commit changes on new branch
     4. Verify main is clean

Options:
   A) Move changes to new branch, then commit (recommended)
   B) Stash changes, create clean branch, then apply
   C) Abort branch creation

Which option? (A/B/C or yes/no for Option A)
```

**⚠️ CRITICAL RULES:**

- ❌ **NEVER proceed** without showing summary
- ❌ **NEVER proceed** without presenting options (if changes exist)
- ❌ **NEVER proceed** without explicit user confirmation
- ❌ **NEVER assume** user wants to proceed ("yes" is implicit)
- ✅ **ALWAYS wait** for user response before executing any branch operations
- ✅ **ALWAYS show** what will happen before doing it

**Apply when**: Any branch operation (create, switch, delete, reset)  
**Related**: `/branch` command, `/pr-close` command  
**See**: `.cursor/commands/branch.md` for complete workflow

---

## #L50: Git Pre-Checkout Hook Pattern [🟡 IMPORTANT]

**Symptom**: Manual git checkout bypasses AI safety checks, can lose uncommitted work  
**Root Cause**: No git-level protection against accidental branch switching  
**Fix**:

**Install pre-checkout hook** (blocks branch switch with uncommitted changes):

```bash
# Install hooks
./scripts/install-git-hooks.sh

# Hook location: .git/hooks/pre-checkout
# Hook source: scripts/git-hooks/pre-checkout
```

**Hook Behavior**:

- Checks for uncommitted changes before branch switch
- Shows warning with file list if changes exist
- Offers options: commit, stash, abort
- Requires explicit "yes" to proceed
- Blocks checkout until resolved or confirmed

**Bypass (not recommended)**:

```bash
git checkout --no-verify branch-name
```

**Apply when**: Setting up new development environment, preventing manual git mistakes  
**Related**: #L10 (Explicit confirmation), `/branch` command  
**See**: `scripts/git-hooks/pre-checkout` for implementation

---

## #L100: Git Pre-Push Hook Pattern [🟡 IMPORTANT]

**Symptom**: Branches pushed without following naming conventions, missing ticket IDs  
**Root Cause**: No validation of branch names before push  
**Fix**:

**Install pre-push hook** (validates branch naming conventions):

```bash
# Install hooks
./scripts/install-git-hooks.sh

# Hook location: .git/hooks/pre-push
# Hook source: scripts/git-hooks/pre-push
```

**Hook Behavior**:

- Validates branch name follows conventions (feature/, fix/, docs/, chore/)
- Checks for ticket ID (SYOS-XXX) - warns but allows override
- Skips validation for main/master branches
- Blocks push if branch name invalid
- Allows override with explicit "yes" for missing ticket ID (project-based branches)

**Bypass (not recommended)**:

```bash
git push --no-verify
```

**Apply when**: Enforcing branch naming conventions, preventing wrong branch names  
**Related**: #L10 (Explicit confirmation), `/branch` command  
**See**: `scripts/git-hooks/pre-push` for implementation

---

## #L150: Branch Verification Before Work [🟡 IMPORTANT]

**Symptom**: Work committed to wrong branch, causing merge conflicts and confusion  
**Root Cause**: No verification that current branch matches ticket being worked on  
**Fix**:

**Before starting work (in `/start` and `/go` commands):**

1. **Check current branch**:

   ```bash
   git branch --show-current
   ```

2. **Extract ticket ID from branch name** (if ticket-based branch):
   - Pattern: `feature/SYOS-XXX-description` or `fix/SYOS-XXX-description`
   - Extract: `SYOS-XXX` from branch name

3. **Compare ticket ID**:
   - If branch contains ticket ID → Compare with current ticket ID
   - If match → ✅ Continue with work
   - If mismatch → ⚠️ Warn user

4. **If branch doesn't match ticket**:

   ```
   ⚠️ Warning: You're on branch [branch-name] but working on ticket SYOS-XXX
   
   Current branch: [branch-name]
   Ticket ID: SYOS-XXX
   
   Options:
   1. Switch to correct branch: Use /branch command to create feature/SYOS-XXX-description
   2. Continue anyway: If this is intentional (e.g., project-based branch)
   
   Proceed? (yes/no)
   ```

**Apply when**: Starting work on a ticket, before implementing changes  
**Related**: #L10 (Explicit confirmation), `/start` command, `/go` command  
**See**: `.cursor/commands/start.md` and `.cursor/commands/go.md` for implementation

---

## #L200: Confirmation Before Branch Deletion [🟡 IMPORTANT]

**Symptom**: Branch deleted accidentally, work lost (even though merged)  
**Root Cause**: No explicit confirmation before destructive branch deletion  
**Fix**:

**Before deleting branch (in `/pr-close` command):**

1. **Show Summary**:

   ```
   📋 Branch Deletion Summary:
      - Branch to delete: [branch-name]
      - PR status: Merged ✅
      - Extra commits: [count] (if any)
      - Extra commits in PR: [yes/no] (if any)
      
      What will happen:
      1. Local branch [branch-name] will be deleted
      2. Remote branch already deleted (verified)
      3. Work is safe (merged to main)
      
      ⚠️ This action cannot be undone (though branch can be recreated from main if needed)
   ```

2. **Require Explicit Confirmation**:

   ```
   Delete local branch [branch-name]? (yes/no)
   ```

3. **Wait for user response**:
   - If "yes" → Proceed with deletion
   - If "no" → Abort deletion, keep branch

**⚠️ CRITICAL RULES:**

- ❌ **NEVER proceed** without showing summary
- ❌ **NEVER proceed** without explicit user confirmation
- ❌ **NEVER assume** user wants to delete
- ✅ **ALWAYS wait** for user response before deleting

**Apply when**: Cleaning up after merged PR, deleting local branches  
**Related**: #L10 (Explicit confirmation), `/pr-close` command  
**See**: `.cursor/commands/pr-close.md` for implementation

---

## Safety Gate Principles

**Core Principles**:

1. **Never Assume** - Always wait for explicit user confirmation
2. **Show Summary** - User must understand what will happen before AI acts
3. **Present Options** - When multiple approaches exist, let user choose
4. **Multiple Layers** - Git hooks + AI gates provide comprehensive protection
5. **Work Preservation** - Never lose uncommitted changes (commit or stash)

**Why**: Prevents work loss, builds trust, ensures user control, reduces mistakes

**Apply when**: Any destructive or potentially risky operation (branch switch, delete, reset, force operations)

---

## Implementation Checklist

**For AI Agents**:

- [ ] Show summary before branch operations
- [ ] Present options when uncommitted changes exist
- [ ] Require explicit confirmation (wait for "yes")
- [ ] Never proceed without user response
- [ ] Verify branch matches ticket before starting work
- [ ] Confirm before branch deletion

**For Developers**:

- [ ] Install git hooks: `./scripts/install-git-hooks.sh`
- [ ] Verify hooks installed: `ls -la .git/hooks/pre-checkout .git/hooks/pre-push`
- [ ] Test hooks: Try switching branch with uncommitted changes
- [ ] Understand bypass options (--no-verify) but avoid using them

---

## Related Patterns

- **Git Workflow**: `dev-docs/2-areas/development/git-workflow.md` - Complete git workflow guide
- **Branch Command**: `.cursor/commands/branch.md` - Branch creation workflow with safety gates
- **PR Close Command**: `.cursor/commands/pr-close.md` - Post-merge cleanup with confirmation
- **Start Command**: `.cursor/commands/start.md` - Onboarding with branch verification
- **Go Command**: `.cursor/commands/go.md` - Implementation with branch verification

---

**Last Updated**: 2025-01-21  
**Pattern Status**: Active (implemented in SYOS-430)  
**Related Ticket**: SYOS-430 - Prevent Accidental Branch Switching & Work Loss - Safety Gates

