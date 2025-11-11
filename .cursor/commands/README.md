# Cursor Commands

Custom AI commands for the SynergyOS project.

## Available Commands

### `/save` - Capture Knowledge & Commit

Workflow for documenting patterns and making commits that align with our brand.

**Updated**: November 8, 2025

**What changed:**

- Now uses **Conventional Commits** format (type(scope): subject)
- Requires **WHY** section explaining the problem/goal
- Includes **JOURNEY** for iteration 2+ solutions (what failed, why, final approach)
- Credits **AI collaboration** when Claude/Cursor contributed
- References **PATTERN** with line numbers when docs are updated
- Enforces brand voice: technical but human, learning from failure

**Why:**
Our old format was too terse. Didn't align with our brand (building in public, learning from failure, human + AI collaboration). New format tells the story, not just the what.

**Example commit using new format:**

```
fix(notes): clear note detail state on switch to prevent stale data

WHY: Switching between notes showed old content briefly before updating.
NoteDetail component wasn't clearing state on note ID change.

JOURNEY:
- First approach: Tried forcing re-render with key prop
- Why it failed: Still had race condition with async data load
- Final solution: Added explicit clear() call on note switch

PATTERN:
- Updated: "Component State Management" (#L450)
- Added edge case: clear() on reactive param change
- Documented in: dev-docs/patterns/svelte-reactivity.md
- Severity: 🟡 (Important - affects UX)

Caught while testing the Linear-style modal redesign.
```

See `/save` command for full workflow and more examples.

### `/root-cause` - Debug with Patterns

Quick lookup for known issues and their solutions.

**Status**: Not yet updated with new format
**Location**: `.cursor/commands/root-cause.md`

---

## Setup

### Git Commit Template (Optional but Recommended)

Set up the commit message template to auto-populate the format:

```bash
cd /Users/randyhereman/Coding/Axon
git config commit.template .gitmessage
```

Now `git commit` will open your editor with the format pre-filled.

### Reading Commands

AI assistants: These commands are loaded via the `.cursorrules` file. When you see `/save` or `/root-cause`, reference the corresponding markdown file in this directory.

---

## Philosophy

These commands exist because:

1. We build with AI openly (Cursor + Claude)
2. Onboarding new AI sessions should be fast
3. Knowledge capture should be systematic
4. Commit messages should tell stories, not just changelogs

Our brand is about **learning from failure** and **building in public**. These commands enforce that philosophy in our workflow.

---

**Last Updated**: November 8, 2025
**See also**:

- `CORE-VALUES.md` - Our values
- `CONTRIBUTING.md` - Contribution guidelines
- `.gitmessage` - Commit template
