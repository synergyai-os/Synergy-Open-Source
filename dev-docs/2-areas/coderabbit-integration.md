# CodeRabbit.ai Integration

> **AI-powered code review assistant** | Automatic PR reviews with Linear integration

---

## 🎯 What is CodeRabbit?

**CodeRabbit** is an AI-powered code review assistant that automatically reviews every pull request. It learns from your codebase patterns and provides contextual feedback aligned with your project's architecture and conventions.

### Key Benefits

- ✅ **Automatic PR Reviews** - Reviews every PR without manual intervention
- ✅ **Linear Integration** - Links PRs to Linear tickets (SYOS team)
- ✅ **Knowledge Base** - Learns from your codebase patterns over time
- ✅ **Path-Specific Rules** - Enforces design tokens, composables patterns, Convex patterns
- ✅ **Code Quality Tools** - ESLint, Markdownlint, Shellcheck, and more
- ✅ **Code Generation** - Suggests docstrings and unit tests

---

## Setup & Configuration

### Account Setup

1. **Sign up**: Visit [CodeRabbit.ai](https://coderabbit.ai) and connect your GitHub account
2. **Select Repository**: Choose `synergyai-os/Synergy-Open-Source`
3. **Configure**: The `.coderabbit.yaml` file is already configured

### Configuration File

**Location**: `.coderabbit.yaml` (repository root)

**Key Settings**:

- **Profile**: `chill` - Focuses on important issues, less noise
- **Linear Integration**: SYOS team (auto-comments, auto-labels)
- **Knowledge Base**: Enabled (learns from codebase)
- **Code Generation**: Docstrings and unit tests enabled

**Path-Specific Instructions**:

- **Composables** (`src/lib/composables/**`): Enforces Svelte 5 composables pattern
- **Svelte Components** (`src/lib/components/**`): Enforces design tokens, Bits UI
- **Convex Functions** (`convex/**`): Enforces Convex patterns, no browser APIs

---

## Linear Integration

### How It Works

1. **PR Created** → CodeRabbit reviews automatically
2. **Linear Ticket Reference** → Add `Closes SYOS-123` in PR description
3. **Auto-Comment** → CodeRabbit comments on Linear ticket
4. **Auto-Label** → CodeRabbit adds labels based on changes

### Usage

**In PR Description**:

```markdown
## Description
Adds user authentication flow.

Closes SYOS-15
```

**Result**:
- CodeRabbit reviews PR
- Comments on Linear ticket SYOS-15
- Adds relevant labels

---

## Workflow Integration

### Standard PR Workflow

1. **Create Branch** → `git checkout -b feature/my-feature`
2. **Make Changes** → Write code following patterns
3. **Push & Create PR** → `gh pr create`
4. **CodeRabbit Reviews** → Automatic review within minutes
5. **Address Feedback** → Push updates, CodeRabbit reviews incrementally
6. **Merge** → When ready

### What CodeRabbit Checks

**Code Quality**:
- ESLint violations
- TypeScript errors
- Code style consistency
- Security issues

**Pattern Compliance**:
- Design tokens usage (no hardcoded values)
- Composables pattern (single `$state` object)
- Convex patterns (no browser APIs)
- Component architecture (Tokens → Utilities → Patterns → Components)

**Documentation**:
- Missing docstrings
- Incomplete README updates
- Broken links

---

## SynergyOS-Specific Patterns

### Design Tokens

**✅ Correct**:
```svelte
<div class="bg-sidebar text-sidebar-primary px-nav-item py-nav-item">
```

**❌ Incorrect**:
```svelte
<div class="bg-gray-900 text-white px-2 py-1.5">
```

**Why**: Tokens adapt to light/dark mode automatically. Change once in `src/app.css`, updates everywhere.

**Reference**: `dev-docs/2-areas/design-tokens.md`

### Composables Pattern

**✅ Correct**:
```typescript
// src/lib/composables/useExample.svelte.ts
export function useExample() {
  const state = $state({ count: 0, error: null });
  return {
    get count() { return state.count; },
    get error() { return state.error; }
  };
}
```

**❌ Incorrect**:
```typescript
// Multiple $state variables
const count = $state(0);
const error = $state(null);
```

**Why**: Single `$state` object pattern is required for Svelte 5 runes.

**Reference**: `dev-docs/2-areas/patterns/svelte-reactivity.md`

### Convex Patterns

**✅ Correct**:
```typescript
// convex/myFunction.ts
import { query } from "./_generated/server";
import { getAuthUserId } from "./auth";

export const myQuery = query(async (ctx) => {
  const userId = await getAuthUserId(ctx);
  // ... use userId
});
```

**❌ Incorrect**:
```typescript
// Browser APIs don't work in Convex
const userId = localStorage.getItem("userId");
```

**Why**: Convex runs server-side, no browser APIs available.

**Reference**: `dev-docs/2-areas/patterns/convex-integration.md`

---

## Usage Examples

### Example 1: New Feature PR

**PR Description**:
```markdown
## Feature: Add User Profile Page

Adds user profile page with avatar upload.

Closes SYOS-42

## Changes
- New route: `/settings/profile`
- New component: `ProfileEditor.svelte`
- Convex mutation: `updateProfile`
```

**CodeRabbit Will**:
- Review code for design tokens usage
- Check composables pattern compliance
- Verify Convex patterns
- Comment on Linear ticket SYOS-42
- Suggest docstrings and unit tests

### Example 2: Bug Fix PR

**PR Description**:
```markdown
## Fix: Broken Link Resolution

Fixes relative markdown links in documentation.

Fixes SYOS-15
```

**CodeRabbit Will**:
- Review markdown files
- Check for broken links
- Verify documentation updates
- Comment on Linear ticket SYOS-15

---

## Commands

### Check CodeRabbit Status

```bash
# View CodeRabbit reviews for a PR
gh pr view <PR_NUMBER> --comments

# View CodeRabbit configuration
cat .coderabbit.yaml
```

### Update Configuration

1. Edit `.coderabbit.yaml`
2. Commit changes
3. CodeRabbit picks up new configuration automatically

---

## Knowledge Base

### How It Works

CodeRabbit learns from your codebase over time:

1. **First PR** → CodeRabbit reviews based on general patterns
2. **Subsequent PRs** → CodeRabbit learns your specific patterns
3. **Ongoing** → Reviews become more contextual and accurate

### What It Learns

- Design token usage patterns
- Composables structure
- Convex function patterns
- Component organization
- Documentation style

### Improving Reviews

**To help CodeRabbit learn faster**:

1. **Follow Patterns** - Consistent code helps CodeRabbit learn
2. **Document Decisions** - Comments help CodeRabbit understand intent
3. **Reference Docs** - Links to dev-docs help CodeRabbit understand context

---

## Troubleshooting

### CodeRabbit Not Reviewing PRs

**Check**:
1. Is `.coderabbit.yaml` in repository root?
2. Is CodeRabbit app installed in GitHub?
3. Is repository connected in CodeRabbit dashboard?

**Fix**:
1. Verify configuration file exists
2. Check GitHub App settings
3. Reconnect repository if needed

### Reviews Not Aligned with Patterns

**Check**:
1. Are path-specific instructions correct in `.coderabbit.yaml`?
2. Are pattern docs up to date?

**Fix**:
1. Update `.coderabbit.yaml` with correct patterns
2. Update pattern docs if patterns changed

### Linear Integration Not Working

**Check**:
1. Is Linear team name correct? (Should be `SYOS`)
2. Is Linear API key configured in CodeRabbit?

**Fix**:
1. Verify team name in `.coderabbit.yaml`
2. Check CodeRabbit dashboard → Integrations → Linear

---

## Best Practices

### For Developers

1. **Reference Linear Tickets** - Always add `Closes SYOS-XXX` in PR descriptions
2. **Follow Patterns** - Use design tokens, composables pattern, Convex patterns
3. **Review Feedback** - Address CodeRabbit suggestions when relevant
4. **Iterate** - Push updates, CodeRabbit reviews incrementally

### For Code Reviewers

1. **Trust CodeRabbit** - It catches common issues automatically
2. **Focus on Logic** - CodeRabbit handles style and patterns
3. **Verify Suggestions** - CodeRabbit is helpful but not always right
4. **Use Knowledge Base** - CodeRabbit learns from your reviews

---

## Resources

- **CodeRabbit Docs**: [docs.coderabbit.ai](https://docs.coderabbit.ai)
- **Configuration Reference**: `.coderabbit.yaml`
- **Pattern Docs**: `dev-docs/2-areas/patterns/`
- **Design Tokens**: `dev-docs/2-areas/design-tokens.md`
- **Composables**: `dev-docs/2-areas/patterns/svelte-reactivity.md`
- **Convex**: `dev-docs/2-areas/patterns/convex-integration.md`

---

## Next Steps

1. **Create Your First PR** → CodeRabbit will automatically review it
2. **Reference Linear Tickets** → Add `Closes SYOS-123` in PR descriptions
3. **Review Feedback** → CodeRabbit will provide suggestions
4. **Iterate** → Push updates and CodeRabbit reviews incrementally

The account is set up and ready. CodeRabbit will start learning from your first PR and improve over time.

