# Contributing to SynergyOS

> **Thank you for considering contributing to SynergyOS!** 🎉

We're building the open-source Product OS for teams—and we need your help. Whether you're a developer, designer, product manager, or writer, there's a place for you here.

---

## 🌟 Ways to Contribute

### 1. **Code Contributions**

- Fix bugs (check [good first issues](https://github.com/synergyai-os/Synergy-Open-Source/labels/good%20first%20issue))
- Build features (see [roadmap](./dev-docs/2-areas/metrics.md#-current-okrs-q4-2025))
- Improve performance
- Add tests

### 2. **Documentation**

- Improve existing docs
- Create tutorials
- Add examples
- Fix typos

### 3. **Design**

- UI/UX improvements
- Design components
- Create templates
- Refine design tokens

### 4. **Product**

- Suggest features
- Report bugs
- Share use cases
- Test beta features

### 5. **Community**

- Answer questions in Discord
- Write blog posts
- Create videos
- Share on social media

---

## 🚀 Getting Started

### 0. **Read Product Principles** ⭐

Before contributing, read our [Product Principles](./dev-docs/2-areas/product-principles.md) to understand:

- How we make decisions (Privacy First, Outcomes Over Outputs, etc.)
- What we value (Open Source, Autonomy, AI-Augmented)
- How to align your contribution with our vision

### 1. **Set Up Your Environment**

```bash
# Clone the repo
git clone https://github.com/synergyai-os/Synergy-Open-Source.git
cd Synergy-Open-Source

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Convex deployment URL and other secrets

# Run development server
npm run dev

# Open http://localhost:5173
```

**See**: [Architecture Docs](./dev-docs/2-areas/architecture.md) for detailed setup

---

### 2. **Find Something to Work On**

**Good First Issues:**
Browse [good first issues](https://github.com/synergyai-os/Synergy-Open-Source/labels/good%20first%20issue) - these are perfect for new contributors!

**Current Priorities:**
Check [Metrics & OKRs](./dev-docs/2-areas/metrics.md) to see what we're focusing on this quarter.

**Ask the Community:**
Join [Discord](https://discord.gg/synergyos) and ask in #contributors what needs help.

---

### 3. **Before You Code**

1. **Comment on the issue** - Let others know you're working on it
2. **Ask questions** - Clarify requirements in the issue or Discord
3. **Check patterns** - Review [Pattern Index](./dev-docs/2-areas/patterns/INDEX.md) for existing solutions

---

## 📋 Contribution Workflow

### 1. **Fork & Branch**

```bash
# Fork the repo on GitHub, then:
git checkout -b feature/your-feature-name

# Use conventional branch names:
# - feature/add-okr-tracking
# - fix/sidebar-navigation-bug
# - docs/update-contributing-guide
```

---

### 2. **Follow Our Patterns**

**Before writing code, check:**

- [Product Principles](./dev-docs/2-areas/product-principles.md) - Decision-making framework ⭐
- [Design Principles](./dev-docs/2-areas/design-principles.md) - Visual philosophy, accessibility (for UI work) ⭐
- [Design Tokens](./dev-docs/2-areas/design-tokens.md) - **NEVER hardcode values**
- [Svelte 5 Patterns](./dev-docs/2-areas/patterns/svelte-reactivity.md) - Composables, $state, $effect
- [Convex Patterns](./dev-docs/2-areas/patterns/convex-integration.md) - Queries, mutations, auth
- [UI Patterns](./dev-docs/2-areas/patterns/ui-patterns.md) - Components, layouts

**Example: Using Design Tokens**

```svelte
<!-- ❌ WRONG: Hardcoded values -->
<div class="px-2 py-1.5 bg-gray-900 text-white">

<!-- ✅ CORRECT: Design tokens -->
<div class="px-nav-item py-nav-item bg-sidebar text-sidebar-primary">
```

---

### 3. **Write Quality Code**

**Code Style:**

- TypeScript for all new code
- Use `$state`, `$derived`, `$effect` (Svelte 5 runes)
- Single `$state` object per composable
- Design tokens for all spacing/colors
- Comments for complex logic

**Testing:**

- Add tests for new features
- Run `npm test` before committing
- Ensure existing tests pass

**Linting:**

```bash
npm run lint        # Check for issues
npm run format      # Auto-fix formatting
```

---

### 4. **Commit Your Changes**

**Use Conventional Commits:**

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(docs): add contributing guide"
git commit -m "fix(sidebar): navigation active state bug"
git commit -m "docs(readme): update installation steps"
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance (deps, config)

---

### 5. **Push & Create PR**

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# - Use a clear title
# - Reference the issue (e.g., "Closes #123")
# - Add screenshots for UI changes
# - Explain what changed and why
```

**PR Template:**

```markdown
## What Changed

Brief description of your changes.

## Why

Why this change is needed.

## Screenshots (if UI changes)

Before/after screenshots.

## Checklist

- [ ] Tests added/updated
- [ ] Docs updated
- [ ] Design tokens used (no hardcoded values)
- [ ] Patterns followed
- [ ] Linter passed

Closes #<issue-number>
```

---

### 6. **Code Review**

- **Respond to feedback** - Address comments constructively
- **Make requested changes** - Push updates to your branch
- **Be patient** - Reviews may take 1-3 days
- **Ask questions** - If feedback is unclear, ask!

---

## 🎨 Design Contributions

### Design System

**Before designing:**

1. **Read [Design Principles](./dev-docs/2-areas/design-principles.md)** ⭐ - Visual philosophy, accessibility, UX
2. Review [Component Architecture](./dev-docs/2-areas/component-architecture.md) - How components are built
3. Review [Design Tokens](./dev-docs/2-areas/design-tokens.md) - Available spacing, colors, typography
4. Check existing [UI Patterns](./dev-docs/2-areas/patterns/ui-patterns.md) - Solved design problems
5. See [Component Library](./dev-docs/2-areas/component-library) (when available)

**Design Tools:**

- Figma (preferred)
- Share files in Discord #design channel
- Export assets as SVG

**Design Principles Summary** (see full doc for details):

- **Clarity Over Decoration** - Every element serves a purpose
- **Accessible by Default** - WCAG AA minimum (AAA where possible)
- **Consistent Over Novel** - Reuse patterns, not one-offs
- **Performance is Design** - Fast feels better than pretty
- **Mobile-First, Desktop-Enhanced** - Design for constraints

---

## 📖 Documentation Contributions

### Types of Docs

**Dev Docs** (`/dev-docs`):

- Technical patterns
- Architecture decisions
- API references
- Setup guides

**Marketing Docs** (`/marketing-docs`):

- Product vision
- User guides
- Case studies
- Blog posts

### Writing Style

- **Clear & concise** - Get to the point
- **Examples first** - Show, don't just tell
- **Scannable** - Use headings, lists, tables
- **Actionable** - What should the reader do?

**Format:**

- Use Markdown (`.md`) or MDX (`.mdx`)
- Add to PARA structure (`1-projects`, `2-areas`, `3-resources`, `4-archive`)
- Update sidebar in `DocSidebar.svelte` if adding new section

---

## 🐛 Bug Reports

**Good Bug Reports Include:**

1. **Clear title** - "Sidebar navigation not working on mobile"
2. **Steps to reproduce** - Numbered list of actions
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - Browser, OS, version
6. **Screenshots** - Visual evidence helps!

**Template:**

```markdown
### Description

Brief description of the bug.

### Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

### Expected Behavior

What you expected to happen.

### Actual Behavior

What actually happened.

### Environment

- OS: macOS 14.1
- Browser: Chrome 120
- Version: main branch (commit abc123)

### Screenshots

[Attach screenshots]
```

---

## 💡 Feature Requests

**Good Feature Requests Include:**

1. **Problem statement** - What problem does this solve?
2. **Proposed solution** - How would it work?
3. **Alternatives** - What else did you consider?
4. **Use case** - Who needs this? Why?

**Template:**

```markdown
### Problem

Describe the problem this feature solves.

### Proposed Solution

How would this feature work?

### Alternatives Considered

What other solutions did you think about?

### Use Case

Who needs this? Example scenarios.

### Success Metrics

How do we know if this is successful?
```

---

## 🤝 Community Guidelines

### Code of Conduct

**We are committed to:**

- **Respect** - Treat everyone with respect
- **Inclusivity** - Welcome all backgrounds
- **Collaboration** - Work together constructively
- **Transparency** - Open communication

**We do not tolerate:**

- Harassment or discrimination
- Spam or self-promotion
- Trolling or inflammatory comments
- Sharing private information

**Enforcement:**
Violations will result in warnings, temporary bans, or permanent bans depending on severity.

---

### Communication Channels

**Discord** (preferred):

- #general - General discussion
- #contributors - Contributor chat
- #design - Design discussions
- #help - Get help
- #showcase - Share what you built

**GitHub Issues**:

- Bug reports
- Feature requests
- Documentation issues

**GitHub Discussions**:

- Questions & answers
- Ideas & brainstorming
- Show & tell

---

## 🏆 Recognition

### Contributors

All contributors are recognized in:

- [README.md](./README.md) - Contributors section
- Release notes - Feature credits
- Blog posts - Contributor spotlights

### Marketplace Builders

Build something awesome? Earn revenue!

- **80/20 split** - You keep 80%, we take 20%
- **Featured** - Best apps showcased
- **Support** - We help you succeed

**See**: [Marketplace Strategy](./marketing-docs/opportunities/marketplace-strategy.md)

---

## 📊 Success Metrics

**We track:**

- Contributions (PRs merged)
- Contributors (new + returning)
- Community size (Discord, GitHub stars)
- Marketplace apps (built by community)

**Current Metrics**: [See Metrics Dashboard](./dev-docs/2-areas/metrics.md)

---

## 🎯 Priorities (Q4 2025)

**Current Focus:**

1. **Multi-tenancy** - Orgs & teams (in progress)
2. **Saprolab validation** - First paying customer
3. **Community launch** - Public repo, Discord, blog
4. **Core features** - OKRs, roadmaps, AI coaching

**See**: [Metrics & OKRs](./dev-docs/2-areas/metrics.md) for full roadmap

---

## 🚀 Fast Track for Contributors

**Want to make a big impact fast?**

### High-Priority Areas

1. **Documentation as Product** - Help build doc templates, components
   - [Value Stream Doc](./dev-docs/2-areas/value-streams/documentation-as-product.md)

2. **Component Library** - Document existing UI components
   - [Component Library](./dev-docs/2-areas/component-library)

3. **User Journeys** - Create step-by-step guides
   - [User Journeys](./dev-docs/2-areas/user-journeys)

4. **Testing** - Add test coverage
   - [Testing Strategy](./dev-docs/3-resources/testing-strategy.md)

5. **Mobile Polish** - Improve responsive design
   - [Mobile Strategy](./dev-docs/3-resources/mobile-strategy.md)

---

## 📖 Resources

**For Contributors:**

- [Architecture](./dev-docs/2-areas/architecture.md) - Tech stack overview
- [Pattern Index](./dev-docs/2-areas/patterns/INDEX.md) - Common solutions
- [Design Tokens](./dev-docs/2-areas/design-tokens.md) - UI system
- [Metrics](./dev-docs/2-areas/metrics.md) - OKRs & progress

**For Product People:**

- [Product Vision 2.0](./marketing-docs/strategy/product-vision-2.0.md) - What we're building
- [Product Strategy](./marketing-docs/strategy/product-strategy.md) - How we'll get there
- [Target Personas](./marketing-docs/audience/target-personas.md) - Who we serve

**For Builders:**

- [Marketplace Strategy](./marketing-docs/opportunities/marketplace-strategy.md) - Builder ecosystem
- [SDK Docs](./dev-docs/2-areas/marketplace-sdk.md) (coming soon)

---

## ❓ Questions?

- **Discord**: [Join our community](https://discord.gg/synergyos)
- **GitHub Discussions**: [Ask here](https://github.com/synergyai-os/Synergy-Open-Source/discussions)
- **Email**: randy@synergyos.ai

---

**Thank you for contributing!** 🎉

Every contribution—big or small—helps us build the Product OS that teams deserve.

**Let's build something amazing together.** 🚀
