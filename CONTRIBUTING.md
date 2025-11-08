# Contributing to SynergyOS

Welcome! We're glad you're here. Whether you found us through a blog post about our 1.0 failure, stumbled across our code, or just care about knowledge retention systems, you're in the right place.

This is a side project built in public. We document our mistakes, share our patterns, and collaborate with both humans and AI. If that sounds interesting, read on.

---

## Meet Devon

**Our ideal contributor persona:**

Devon is a knowledge worker who reads 50+ articles per week but forgets most of them. They've tried Notion, Obsidian, and Roam, but nothing stuck.

They discovered SynergyOS through a blog post titled "How We Failed at 1.0 and Started Over" and thought, "Finally, someone being honest about product development."

Devon works with AI tools (Cursor, GitHub Copilot, Claude) daily. They appreciate documentation that says "we tried this, it failed, here's why" over docs that pretend everything was perfect from day one.

They value clear patterns over perfect code. They want to contribute because they see themselves in the project story.

**If you're like Devon, you're exactly who we're building for and with.**

---

## Core Values

Before contributing, read our [Core Values](CORE-VALUES.md). They explain how we make decisions, resolve conflicts, and collaborate.

Quick summary:
1. **Learning from Failure** - Document mistakes as much as wins
2. **Building in Public** - Share process, not just results
3. **Collaboration (Human + AI)** - Work with AI tools openly
4. **Quality Without Perfection** - Ship solutions, iterate continuously
5. **Knowledge That Sticks** - Practice the CODE framework we preach

---

## Commit Message Guidelines

We use **Conventional Commits** because they're readable by both humans and AI. Plus they make changelogs way easier.

### Format

```
type(scope): subject

Body (optional but encouraged)

Footer (optional)
```

### Types

- `feat:` - New feature (notes editor, sync system, keyboard shortcuts)
- `fix:` - Bug fix (broken navigation, sync errors, UI glitches)
- `docs:` - Documentation only (pattern updates, architecture docs, README)
- `refactor:` - Code improvement without changing behavior
- `style:` - Design token updates, UI polish, formatting
- `test:` - Test additions or fixes
- `chore:` - Maintenance (dependencies, config, cleanup)

### Scope

Optional but helpful. Indicates what part of the codebase changed:

- `inbox` - Universal inbox features
- `notes` - Note editor and management
- `flashcards` - Flashcard system
- `sync` - Readwise or other sync integrations
- `auth` - Authentication
- `ui` - UI components or design tokens
- `composables` - Svelte composables
- `docs` - Documentation

### Subject Line

- Use imperative mood ("add" not "added" or "adds")
- Keep it under 50 characters
- Capitalize first letter
- No period at the end
- Be specific but concise

### Body (Recommended)

This is where you add value. Explain:

- **WHY**: What problem did this solve? What were you trying to achieve?
- **JOURNEY**: What you tried first (if this is version 2+), why it failed, final solution
- **PATTERN**: Reference to pattern docs if you added/updated them (#L[NUMBER])
- **AI**: Credit Claude/Cursor if they contributed a good suggestion
- **Context**: Links to related issues, patterns, or discussions

Write for both humans and AI:
- Use semantic section labels (WHY, JOURNEY, PATTERN, AI)
- Short paragraphs and bullet points
- Be specific and honest about failures
- No corporate fluff or hand-waving
- Share the learning journey, not just the result

### Footer (Optional)

- Reference issues: `Closes #123` or `Relates to #456`
- Note breaking changes: `BREAKING CHANGE: API endpoint renamed`
- Credit collaborators: `Co-authored-by: Name <email>`

---

## Examples

### Good Commit Messages

**Basic feature:**
```
feat(inbox): add keyboard navigation with J/K shortcuts

WHY: Users expect Gmail-style navigation. Makes inbox way faster to process.

Implemented J (next) and K (previous) navigation in the inbox list.
This matches user expectations from Gmail, Linear, and other tools.

Uses the useKeyboardNavigation composable pattern we established
in dev-docs/patterns/svelte-reactivity.md.

AI: Claude suggested edge case handling for bottom of list (wraps to top now).
```

**Bug fix with context:**
```
fix(sync): prevent duplicate highlights from Readwise API

WHY: Users were seeing the same highlight twice in their inbox.

JOURNEY:
- First approach: Filter by highlight ID  
- Why it failed: Readwise returns duplicates with *different* IDs but identical content
- Final solution: Hash the content text and dedupe by hash instead

The Readwise API sometimes returns the same highlight with different
IDs during pagination. Content-based deduplication catches this edge case.

AI: Claude caught that empty highlights would collide - added minimum length check.

Closes #89
```

**Documentation update:**
```
docs(patterns): add Svelte 5 composables pattern after learning it the hard way

WHY: Tried multiple approaches before finding what actually works with Svelte 5 reactivity.

JOURNEY:
- First approach: Multiple $state variables
- Why it failed: Caused reactivity issues and component updates failed
- Final solution: Single $state object with getters (cleaner + works)

PATTERN:
- Added: "Single $state Object Pattern" (#L780)
- Documented in: dev-docs/patterns/svelte-reactivity.md
- Severity: 🔴 (Critical - common gotcha)
- Updated INDEX.md with new symptom entry

AI: Claude suggested the getter pattern after seeing our reactivity issues.
```

**Refactor with learning:**
```
refactor(composables): use single $state object pattern

WHY: Reactivity issues with component updates across multiple composables.

JOURNEY:
- First approach: Multiple $state variables (one per piece of state)
- Why it failed: Svelte 5 reactivity lost track of updates across variables
- Final solution: Single reactive source with getters

Replaced multiple $state variables with single state object + getters.
Svelte 5's reactivity works better with a single reactive source.

PATTERN:
- Applied: "Single $state Object Pattern" (#L780)
- Reference: dev-docs/patterns/svelte-reactivity.md
```

### Bad Commit Messages (Anti-Patterns)

❌ `fixed bug` - Too vague, no context, which bug?
❌ `Updated files` - What files? Why? What changed?
❌ `feat: added some new stuff to the app` - Not specific, no context
❌ `WIP` - Work-in-progress shouldn't be committed to main
❌ `fixes #123` - What was the bug? How did you fix it? Why did it happen?
❌ `[UI] Fixed stuff` - Missing type/scope format, too vague
❌ `docs: updated docs` - Circular description, adds no value
❌ Missing AI credit when Claude/Cursor contributed to the solution
❌ No JOURNEY when this was clearly iteration 2+ of solving the problem
❌ Missing pattern reference after updating dev-docs

---

## Contribution Workflow

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/SynergyOS.git
cd SynergyOS
npm install
```

**Optional: Set up commit message template**

This automatically loads our commit format when you run `git commit`:

```bash
git config commit.template .gitmessage
```

Now when you commit, your editor will open with the format pre-filled. Makes following the guidelines way easier.

### 2. Create a Branch

Use descriptive branch names:

```bash
git checkout -b feat/keyboard-shortcuts
git checkout -b fix/duplicate-highlights
git checkout -b docs/composables-pattern
```

### 3. Make Your Changes

- Follow existing code patterns (check `dev-docs/patterns/`)
- Use design tokens (check `dev-docs/design-tokens.md`)
- Write tests for critical paths
- Update docs if you added/changed patterns

### 4. Test Your Changes

```bash
# Run unit tests
npm run test:unit

# Run e2e tests
npm run test:e2e

# Start dev server and test manually
npm run dev
```

### 5. Commit with Context

Write a commit message that explains the why, not just the what.

```bash
git add .
git commit
# Use the format described above
```

### 6. Push & Create PR

```bash
git push origin feat/keyboard-shortcuts
```

Then create a Pull Request on GitHub with:
- **Title**: Same as commit subject (if single commit)
- **Description**: More context about the change
  - What problem does this solve?
  - How did you test it?
  - Any patterns or docs you added?
  - Screenshots (if UI change)

---

## Code Review Philosophy

When we review PRs, we're looking for:

1. **Does it work?** (Tested and functional)
2. **Does it align with our values?** (See CORE-VALUES.md)
3. **Can we maintain it?** (Clear code, documented patterns)
4. **Does it help users?** (Solves a real problem)

We review with **curiosity, not criticism**:
- "Why did you choose this approach?" (genuine question)
- "Have you considered X?" (collaborative suggestion)
- "This is great! Could we document it in patterns?" (positive + actionable)

### What We Look For

**Code:**
- Follows existing patterns (check `dev-docs/patterns/`)
- Uses design tokens (never hardcoded colors/spacing)
- Includes tests for critical paths
- Clear variable/function names

**Documentation:**
- Added/updated if patterns changed
- AI-optimized (clear headers, semantic structure)
- Explains why, not just what
- Includes examples

**Commits:**
- Follows conventional commits format
- Explains context in body
- References related issues/patterns

---

## Documentation Standards

We write docs for both humans and AI. Here's how:

### Structure

```markdown
# Clear Title

Brief intro explaining what this is about.

## Problem (if applicable)

What problem does this solve?

## Solution

How we solved it.

## Pattern (if applicable)

Reusable pattern others can follow.

## Examples

Real code examples.

## Gotchas

What to watch out for.
```

### Writing Style

- **Clear headers** - AI uses these for context
- **Short paragraphs** - Easier to scan
- **Bullet points** - For lists and steps
- **Code examples** - Show, don't just tell
- **No fluff** - Every sentence should add value

### Where Docs Live

- `/dev-docs/patterns/` - Reusable patterns by domain
- `/dev-docs/patterns/INDEX.md` - Quick pattern lookup
- `/dev-docs/architecture.md` - Tech stack and structure
- `/dev-docs/design-tokens.md` - UI token reference
- `README.md` - Project overview and getting started

### Adding New Patterns

If you discover a pattern worth sharing:

1. Add it to the appropriate domain file in `/dev-docs/patterns/`
2. Update `/dev-docs/patterns/INDEX.md` with symptom and solution
3. Include code examples
4. Explain what you tried first (if relevant)

---

## Development Setup

See the main [README.md](README.md) for full setup instructions.

Quick start:

```bash
# Install dependencies
npm install

# Start Convex backend
npx convex dev

# Start SvelteKit frontend (in another terminal)
npm run dev
```

### Key Commands

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Check code quality

### Project Structure

```
SynergyOS/
├── src/
│   ├── routes/           # SvelteKit routes
│   ├── lib/
│   │   ├── components/   # UI components
│   │   └── composables/  # Svelte 5 composables (.svelte.ts)
│   └── app.css           # Design token definitions
├── convex/               # Backend functions & schema
├── dev-docs/             # Development documentation
│   └── patterns/         # Reusable patterns by domain
└── .cursor/              # AI assistant commands
```

---

## Questions?

**Before opening an issue:**
1. Check `dev-docs/patterns/INDEX.md` for existing patterns
2. Search existing issues and discussions
3. Read the relevant docs in `/dev-docs`

**For bugs:** Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Your environment (browser, OS, etc.)

**For features:** Open a discussion first:
- What problem would this solve?
- How do you imagine it working?
- Any examples from other tools?

**For patterns/docs:** Open a PR directly:
- Add the pattern to the right file
- Update INDEX.md
- Explain what you learned

---

## First-Time Contributors

Welcome! Here's how to start:

1. **Read the README** - Understand what we're building
2. **Read CORE-VALUES.md** - Understand how we work
3. **Pick a "good first issue"** - We label them in GitHub
4. **Ask questions** - In discussions, not in your head
5. **Submit your PR** - Even if it's not perfect (we'll help)

We celebrate first-time contributions. Everyone started somewhere.

---

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers this project.

---

**Thank you for contributing to SynergyOS!**

Remember: We're all figuring this out together. Your contributions help us learn and build something useful. That's the Synergy in SynergyOS.

---

**Last Updated:** January 2025  
**Questions?** Open a discussion or check our [Core Values](CORE-VALUES.md)

