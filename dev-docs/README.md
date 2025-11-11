# SynergyOS Developer Documentation

> **The Open-Source Product OS** | Built for product teams who want to accelerate the smart use of AI

---

## 🎯 What is SynergyOS?

**The Product OS** - An open-source, modular platform that integrates product discovery, delivery, and team collaboration with AI coaching trained on your company data. Think Holaspirit meets Notion meets ChatGPT, but privacy-first, community-driven, and built for product teams.

### What's Working Now

**Knowledge Foundation** (Built & Tested ✅):

- **Rich Notes** - ProseMirror editor with AI content detection, markdown export for blog
- **Flashcard Creation** - AI-powered flashcard generation from highlights/notes (Claude API)
- **Universal Inbox** - Collect and organize content from any source (Readwise integration ready)
- **Study System** - FSRS algorithm for spaced repetition (schema ready, UI in progress)

### What We're Building (Join Us 🚀)

**The Full Product OS** - Help us build it:

- **Product Discovery** - User research, opportunity trees, continuous discovery
- **Product Delivery** - OKRs, roadmaps, goal tracking, sprint planning
- **Team Collaboration** - Meetings, alignment, automated status reports
- **Knowledge Management** - Glossaries, docs, learning embedded in workflows
- **AI Coaching** - Context-aware AI trained on company data, not generic ChatGPT
- **Builder Marketplace** - Custom apps, workflows, integrations (80/20 revenue share)

**Want to contribute?** Check [Contributing Guidelines](../CONTRIBUTING.md) or visit the [GitHub repository](https://github.com/synergyai-os/Synergy-Open-Source)

### Why It's Different

- 🔓 **Privacy-First** - Self-hosted, cloud-hosted, or bring-your-own AI
- 🌍 **Open Source** - Community-driven, no vendor lock-in
- 🤖 **AI-Powered** - Context-aware coaching, not generic responses
- 📊 **Outcome-Driven** - [See our public metrics & OKRs →](2-areas/metrics)
- 🛠️ **Extensible** - Builder marketplace (80/20 revenue share, builders keep 80%)
- 💰 **Open Business** - Knowledge is free forever. [See how we make money →](2-areas/metrics#how-we-make-money-without-charging-for-knowledge)

---

## 🎯 Pick Your Path

### 🐛 I'm Debugging (Engineer)

**→ [Pattern Index](2-areas/patterns/INDEX)** - Symptom → Solution in < 2 min

### 🎨 I'm Designing (Designer)

**→ [Design Principles](2-areas/design-principles.md)** - Visual philosophy, accessibility, UX ⭐  
**→ [Component Architecture](2-areas/component-architecture)** - Tokens → Utilities → Patterns → Components  
**→ [Design Tokens](2-areas/design-tokens)** - Spacing, colors, typography ✅  
**→ [Component Library](2-areas/component-library)** _(Coming Soon)_

### 📊 I'm Planning (Product Manager)

**→ [Product Principles](2-areas/product-principles.md)** - How we make decisions ⭐  
**→ [Product Vision 2.0](../marketing-docs/strategy/product-vision-2.0.md)** - What we're building  
**→ [Metrics & Outcomes](2-areas/metrics)** - Public dashboard (revenue, OKRs, AARRR) 💰  
**→ [Product Strategy](../marketing-docs/strategy/product-strategy.md)** - Outcome-driven roadmap  
**→ [User Journeys](2-areas/user-journeys)** _(Coming Soon)_

### 🏗️ I'm Building (All Roles)

**→ [Architecture](2-areas/architecture.md)** - System overview + tech stack ✅
**→ [Git Workflow](2-areas/git-workflow.md)** - Git, GitHub, Vercel, IDE guide ⚡ **NEW**
**→ [CodeRabbit Integration](2-areas/coderabbit-integration.md)** - AI-powered PR reviews 🤖 **NEW**
**→ [Trunk-Based Deployment](3-resources/trunk-based-deployment-implementation-summary.md)** - Ship to production constantly ⚡
**→ [Navigation Philosophy](2-areas/navigation-philosophy.md)** - UX psychology + 10-item nav strategy 🧠
**→ [Data Models](2-areas/data-models)** _(Coming Soon)_

---

## ⚡ Quick Wins

| I need to...            | Go here                                                                                       | Time   |
| ----------------------- | --------------------------------------------------------------------------------------------- | ------ |
| Browse all docs         | [📚 All Docs Hub](/dev-docs/all) - Visual directory                                           | 1 min  |
| Fix a bug               | [Pattern Index 🔴](2-areas/patterns/INDEX#-critical-patterns-fix-immediately)                 | 2 min  |
| Understand Git workflow | [Git Workflow Guide](2-areas/git-workflow.md) / [Cheat Sheet](3-resources/git-cheat-sheet.md) | 5 min  |
| Get PR reviewed         | [CodeRabbit Integration 🤖](2-areas/coderabbit-integration.md) - AI-powered code reviews    | 2 min  |
| Deploy to production    | [Trunk-Based Deployment ⚡](3-resources/trunk-based-deployment-implementation-summary.md)     | 5 min  |
| Setup feature flags     | [Feature Flags Pattern](2-areas/patterns/feature-flags.md)                                    | 10 min |
| Setup secrets           | [Secrets Management 🔐](2-areas/secrets-management.md)                                        | 5 min  |
| See metrics/OKRs        | [Metrics Dashboard 💰](2-areas/metrics)                                                       | 3 min  |
| Find a component        | [Component Library](2-areas/component-library) _(Coming Soon)_                                | 3 min  |
| Check design system     | [Design Tokens](2-areas/design-tokens)                                                        | 5 min  |
| Understand vision       | [Product Vision 2.0](../marketing-docs/strategy/product-vision-2.0.md)                        | 10 min |

---

## 📂 PARA Organization

This documentation follows the [PARA system](https://fortelabs.com/blog/para/):

- **[1-projects/](1-projects/)** - Time-bound work with deadlines
- **[2-areas/](2-areas/)** - Ongoing responsibilities (architecture, design, patterns)
- **[3-resources/](3-resources/)** - Reference material (checklists, testing, mobile)
- **[4-archive/](4-archive/)** - Completed or deprecated content

### Key Areas

**Product & Strategy:**

- **[Product Vision 2.0](../marketing-docs/strategy/product-vision-2.0.md)** ⭐ **Current Vision**
- **[Product Vision (Original)](2-areas/product-vision-and-plan.md)** - Historical (CODE framework)
- **[Architecture](2-areas/architecture.md)** - Tech stack, auth, composables
- **[Multi-Tenancy](2-areas/multi-tenancy-migration.md)** - Org/team architecture

**Design & UI:**

- **[Design Tokens](2-areas/design-tokens.md)** 🎨 **MANDATORY** - Never hardcode
- **[Component Library](2-areas/component-library)** _(Coming Soon)_
- **[UI Patterns](2-areas/patterns/ui-patterns.md)** - Solved design problems
- **[Composables Analysis](2-areas/composables-analysis.md)** - Reusable logic

**Development & Patterns:**

- **[Pattern Index](2-areas/patterns/INDEX.md)** ⚡ **DEBUG HERE**
- **[Svelte 5 Reactivity](2-areas/patterns/svelte-reactivity.md)** - $state, $derived, $effect
- **[Convex Integration](2-areas/patterns/convex-integration.md)** - Queries, mutations, auth
- **[Analytics](2-areas/patterns/analytics.md)** - PostHog tracking

**Active Work:**

- **[Value Streams](2-areas/value-streams/)** - Outcome-driven initiatives
- **[Documentation System](2-areas/value-streams/documentation-system/)** - Living docs

---

## 🚀 Quick Start

### ⚡ Getting Started

**→ [Start Me Guide](2-areas/start-me.md)** - Get SynergyOS running locally in 5 minutes  
**→ [Secrets Management](2-areas/secrets-management.md)** - `.env.local` setup for secure development

---

### 👋 New to SynergyOS? (Pick your role)

**Product Manager:**

1. Read [Product Vision 2.0](../marketing-docs/strategy/product-vision-2.0.md) (10 min) ⭐
2. Review [Product Strategy](../marketing-docs/strategy/product-strategy.md) (15 min)
3. Check [Target Personas](../marketing-docs/audience/target-personas.md) (10 min)
4. Explore [User Journeys](2-areas/user-journeys) _(Coming Soon)_

**Designer:**

1. Review [Design Tokens](2-areas/design-tokens) (15 min) 🎨 **MANDATORY**
2. Explore [Component Library](2-areas/component-library) _(Coming Soon)_
3. Check [UI Patterns](2-areas/patterns/ui-patterns.md) (10 min)
4. Review [Interaction Patterns](2-areas/patterns/ui-patterns.md#L1150) (5 min)

**Engineer:**

1. Load [Pattern Index](2-areas/patterns/INDEX) (5 min) ⚡
2. Read [Trunk-Based Deployment](3-resources/trunk-based-deployment-implementation-summary.md) (10 min) **NEW**
3. Read [Architecture](2-areas/architecture) (20 min)
4. Review [Svelte 5 Patterns](2-areas/patterns/svelte-reactivity.md) (15 min)
5. Check [Convex Patterns](2-areas/patterns/convex-integration.md) (15 min)

### 🐛 Debugging Something?

1. **Load** [Pattern Index](2-areas/patterns/INDEX)
2. **Scan** symptom table (🔴 Critical, 🟡 Important, 🟢 Reference)
3. **Jump** to line number for immediate fix
4. **Apply** with 95%+ confidence

### 🤖 Starting a New Chat? (For AI)

1. Load `marketing-docs/strategy/product-vision-2.0.md` - Current vision
2. Load `dev-docs/2-areas/product-vision-and-plan.md` - Original vision (historical)
3. Reference `dev-docs/patterns/INDEX.md` - Known solutions
4. Check `dev-docs/design-tokens.md` - UI requirements
5. Use Context7 MCP - Latest library docs

---

## ⚠️ Critical Rules

### Design Tokens (MANDATORY)

**NEVER use hardcoded values:**

```svelte
<!-- ❌ WRONG -->
<div class="px-2 py-1.5 bg-gray-900 text-white">

<!-- ✅ CORRECT -->
<div class="px-nav-item py-nav-item bg-sidebar text-sidebar-primary">
```

**Why**: Tokens adapt to light/dark mode automatically. Change once in `src/app.css`, updates everywhere.

**Reference**: [design-tokens.md](2-areas/design-tokens.md) for complete token list.

### Svelte 5 Composables Pattern

- **Extension**: `.svelte.ts` (required for runes)
- **Location**: `src/lib/composables/`
- **Pattern**: Single `$state` object with getter returns
- **See**: [patterns/svelte-reactivity.md](2-areas/patterns/svelte-reactivity.md)

### Convex Integration

- **Queries**: Use `useQuery()` for reactive subscriptions
- **Actions**: Use "use node" in separate files
- **See**: [patterns/convex-integration.md](2-areas/patterns/convex-integration.md)

---

## 🛠️ Tech Stack

- **Frontend**: SvelteKit 5 + TypeScript + Svelte 5 Runes
- **UI**: Bits UI (headless) + Tailwind CSS 4 + Semantic Design Tokens
- **Backend**: Convex (real-time database & serverless functions)
- **Mobile**: Capacitor 7 (iOS)
- **AI**: Claude (via API)
- **Analytics**: PostHog

---

## 📁 Key Files

### Documentation

- `dev-docs/README.md` - You are here
- `dev-docs/2-areas/metrics.md` - **Public metrics & OKRs** (updated monthly)
- `dev-docs/2-areas/product-vision-and-plan.md` - Vision & roadmap
- `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- `dev-docs/2-areas/architecture.md` - Tech architecture
- `dev-docs/2-areas/design-tokens.md` - Token reference
- `dev-docs/2-areas/secrets-management.md` - `.env.local` & secret management
- `dev-docs/2-areas/posthog.md` - Analytics & AARRR tracking

### Code

- `src/lib/composables/` - Svelte 5 composables (`.svelte.ts`)
- `src/lib/components/` - UI components
- `src/app.css` - Design token definitions
- `convex/schema.ts` - Database schema

### Configuration

- `.cursor/commands/start.md` - Universal onboarding
- `.cursor/rules/way-of-working.mdc` - Project rules

---

## 💡 Best Practices

**Before Writing Code:**

1. Check `patterns/INDEX.md` for existing patterns
2. Use design tokens (never hardcode)
3. Follow composables pattern (`.svelte.ts`, single `$state`, getters)
4. Use Context7 for library docs

**When Debugging:**

1. Use `/root-cause` → Load `patterns/INDEX.md`
2. Scan symptom table → jump to line number
3. Use Context7 for verification
4. Only fix if 95%+ confident

**Common Mistakes:**

- Hardcoded values (use tokens)
- Missing `.svelte.ts` extension
- Multiple `$state` variables (use single object)
- Direct value access in composables (use function parameters)
- Manual queries (use `useQuery()`)

---

## 🤝 Contributing

### Workflow

1. **Investigate** - Understand current state, existing patterns
2. **Scope** - Define what's in/out
3. **Plan** - Outline approach, steps, issues
4. **Confirm** - Get user approval
5. **Build** - Implement in vertical slices
6. **Test** - Verify with real data
7. **Document** - Update patterns/INDEX.md

### Pattern Documentation

When you discover/solve something:

1. Add pattern to appropriate domain file (`patterns/svelte-reactivity.md`, etc.)
2. Update `patterns/INDEX.md` with symptom → line number mapping
3. Choose severity: 🔴 Critical, 🟡 Important, 🟢 Reference
4. Validate with Context7 if touching external libraries

---

## 📖 Additional Resources

- **Product Vision 2.0**: `/marketing-docs/strategy/product-vision-2.0.md`
- **Community Strategy**: `/marketing-docs/go-to-market/community-strategy.md`
- **Brand Identity**: `/marketing-docs/brand/identity.md`

---

## 🎯 Current Focus

**Foundation**: Technical foundation for Product OS

- ✅ SvelteKit 5 + Convex architecture
- ✅ Design token system
- ✅ Pattern documentation
- 🔄 Documentation system (MDX + PARA + TOC)
- 🔄 Multi-tenancy architecture (orgs & teams)

**Next (Product OS Features)**:

- Product discovery tools (opportunity trees, research)
- OKR & roadmap tracking
- Team collaboration features
- AI coaching with company context
- Builder marketplace (SDK + revenue share)

**See**:

- [Product Vision 2.0](../marketing-docs/strategy/product-vision-2.0.md) - What we're building
- [Product Strategy](../marketing-docs/strategy/product-strategy.md) - Outcome-driven roadmap
- [Marketplace Strategy](../marketing-docs/opportunities/marketplace-strategy.md) - Builder ecosystem

---

**Questions?** Open a GitHub discussion or check [patterns/INDEX.md](2-areas/patterns/INDEX.md) for common issues.

**Ready to build?** Start with [product-vision-and-plan.md](2-areas/product-vision-and-plan.md), then pick a task!
