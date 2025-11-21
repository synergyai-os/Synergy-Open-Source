# CodeRabbit.ai Integration

> **AI-powered code review assistant** | CLI reviews + Automatic PR reviews with Linear integration

---

## 🎯 What is CodeRabbit?

**CodeRabbit** is an AI-powered code review assistant available in two forms:

1. **CLI Tool** - Review code locally before committing (terminal-based)
2. **PR Reviews** - Automatic reviews on every pull request (web-based)

Both tools learn from your codebase patterns and provide contextual feedback aligned with your project's architecture and conventions.

### Key Benefits

- ✅ **CLI Reviews** - Review uncommitted changes locally before PRs
- ✅ **Automatic PR Reviews** - Reviews every PR without manual intervention
- ✅ **Linear Integration** - Links PRs to Linear tickets (SYOS team)
- ✅ **Knowledge Base** - Learns from your codebase patterns over time
- ✅ **Path-Specific Rules** - Enforces design tokens, composables patterns, Convex patterns
- ✅ **Code Quality Tools** - ESLint, Markdownlint, Shellcheck, and more
- ✅ **Code Generation** - Suggests docstrings and unit tests
- ✅ **AI Agent Integration** - Works seamlessly with Cursor, Claude, Gemini CLI

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

## CodeRabbit CLI

### Installation

**Quick Install**:

```bash
# Run the installation script
./scripts/install-coderabbit-cli.sh

# Or install manually
curl -fsSL https://cli.coderabbit.ai/install.sh | sh
```

**Verify Installation**:

```bash
coderabbit --version
```

### Usage

**Important**: CodeRabbit CLI reviews **only your changes** (diffs), not the entire codebase. It compares your modifications against the last commit or base branch.

**Review Uncommitted Changes**:

```bash
# Review all uncommitted changes (staged + unstaged)
# Only reviews files you've modified, not the entire codebase
npm run review

# Review only staged changes
npm run review:staged

# Plain output (for AI agents like Cursor)
npm run review:plain
```

**Direct CLI Commands**:

```bash
# Review all uncommitted changes (default)
# Compares against last commit - only shows diffs
coderabbit review

# Review only staged files
coderabbit review --staged

# Plain output (no formatting, AI-agent friendly)
coderabbit review --plain

# Review specific files
coderabbit review src/lib/components/MyComponent.svelte

# Review type options
coderabbit review --type uncommitted  # Only uncommitted changes
coderabbit review --type committed    # Only committed changes
coderabbit review --type all          # All changes (default)
```

### CLI Workflow Integration

**Before Committing**:

```bash
# 1. Make your changes
git add .

# 2. Review staged changes
npm run review:staged

# 3. Fix issues, then commit
git commit -m "feat: add new feature"
```

**With AI Coding Assistants**:

The `--plain` flag makes CodeRabbit CLI output compatible with AI agents:

```bash
# Use in Cursor, Claude Code, Gemini CLI workflows
npm run review:plain
```

CodeRabbit CLI provides:
- **Line-by-line review** - Each changed line gets senior developer attention
- **Diff-based reviews** - Only reviews your modifications, not entire codebase
- **One-click fixes** - Fix bugs directly in CLI
- **Context-aware** - Understands your codebase patterns (uses `.coderabbit.yaml`)
- **Pre-commit feedback** - Catch issues before PR creation

**What Gets Reviewed**:
- ✅ Only files you've modified
- ✅ Only the lines you changed (diffs)
- ✅ Compared against last commit or base branch

**What Doesn't Get Reviewed**:
- ❌ Files you haven't touched
- ❌ The entire codebase
- ❌ Unchanged code

### CLI vs PR Reviews

| Feature | CLI | PR Reviews |
|---------|-----|------------|
| **When** | Before committing | After PR creation |
| **What** | Uncommitted changes | Committed PR changes |
| **Speed** | Instant feedback | Minutes after PR |
| **Integration** | Terminal, AI agents | GitHub, Linear |
| **Use Case** | Local development | Team collaboration |

**Best Practice**: Use CLI for local development, PR reviews for team collaboration.

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

### Standard Development Workflow (CLI + PR)

1. **Create Branch** → `git checkout -b feature/my-feature`
2. **Make Changes** → Write code following patterns
3. **Review Locally** → `npm run review:staged` (catch issues early)
4. **Fix Issues** → Address CLI feedback before committing
5. **Commit** → `git commit -m "feat: add feature"`
6. **Push & Create PR** → `gh pr create`
7. **CodeRabbit PR Reviews** → Automatic review within minutes
8. **Address Feedback** → Push updates, CodeRabbit reviews incrementally
9. **Merge** → When ready

### CLI-First Workflow

For faster iteration:

```bash
# 1. Make changes
# ... edit files ...

# 2. Stage changes
git add .

# 3. Review before committing
npm run review:staged

# 4. Fix any issues, then commit
git commit -m "feat: add feature"
```

**Benefits**:
- Catch issues before PR creation
- Reduce PR review cycles
- Faster development iteration

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
		get count() {
			return state.count;
		},
		get error() {
			return state.error;
		}
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
import { query } from './_generated/server';
import { getAuthUserId } from './auth';

export const myQuery = query(async (ctx) => {
	const userId = await getAuthUserId(ctx);
	// ... use userId
});
```

**❌ Incorrect**:

```typescript
// Browser APIs don't work in Convex
const userId = localStorage.getItem('userId');
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

### CLI Commands

```bash
# Review uncommitted changes
npm run review

# Review only staged changes
npm run review:staged

# Plain output (AI agent compatible)
npm run review:plain

# Direct CLI commands
coderabbit review
coderabbit review --staged
coderabbit review --plain
```

### PR Review Commands

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

1. **Use CLI Before Committing** - Run `npm run review:staged` before commits
2. **Reference Linear Tickets** - Always add `Closes SYOS-XXX` in PR descriptions
3. **Follow Patterns** - Use design tokens, composables pattern, Convex patterns
4. **Review Feedback** - Address CodeRabbit suggestions when relevant
5. **Iterate** - Push updates, CodeRabbit reviews incrementally

### CLI Best Practices

- **Review Before Committing** - Catch issues early with CLI
- **Use Staged Reviews** - Review only what you're committing
- **Fix Issues Locally** - Address CLI feedback before PR creation
- **Use Plain Output** - For AI agent integration workflows

### For Code Reviewers

1. **Trust CodeRabbit** - It catches common issues automatically
2. **Focus on Logic** - CodeRabbit handles style and patterns
3. **Verify Suggestions** - CodeRabbit is helpful but not always right
4. **Use Knowledge Base** - CodeRabbit learns from your reviews

---

## Resources

- **CodeRabbit CLI**: [cli.coderabbit.ai](https://www.coderabbit.ai/cli)
- **CodeRabbit Docs**: [docs.coderabbit.ai](https://docs.coderabbit.ai)
- **Configuration Reference**: `.coderabbit.yaml`
- **Installation Script**: `scripts/install-coderabbit-cli.sh`
- **Pattern Docs**: `dev-docs/2-areas/patterns/`
- **Design Tokens**: `dev-docs/2-areas/design-tokens.md`
- **Composables**: `dev-docs/2-areas/patterns/svelte-reactivity.md`
- **Convex**: `dev-docs/2-areas/patterns/convex-integration.md`

---

## Next Steps

### Getting Started with CLI

1. **Install CLI** → Run `./scripts/install-coderabbit-cli.sh`
2. **Review Your Changes** → Run `npm run review:staged` before committing
3. **Fix Issues** → Address CLI feedback locally
4. **Commit** → Create commits with confidence

### Getting Started with PR Reviews

1. **Create Your First PR** → CodeRabbit will automatically review it
2. **Reference Linear Tickets** → Add `Closes SYOS-123` in PR descriptions
3. **Review Feedback** → CodeRabbit will provide suggestions
4. **Iterate** → Push updates and CodeRabbit reviews incrementally

The account is set up and ready. CodeRabbit CLI and PR reviews will start learning from your codebase and improve over time.
