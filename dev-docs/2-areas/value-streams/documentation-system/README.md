# Value Stream: Documentation System

> **Outcome**: Product teams can find and maintain living documentation at the speed of thought, with AI as a first-class collaborator.

---

## Overview

This value stream delivers an **AI-native documentation system** that integrates seamlessly with Cursor AI and lives inside SynergyOS. No more scattered wikis, stale Confluence pages, or documentation that developers ignore.

---

## User Outcome (Not Project Goal)

### Before (Pain)

- Onboarding takes 2 weeks (reading scattered docs)
- Cursor AI can't find architecture decisions
- Documentation lives in 5 different tools
- Docs are stale within days of writing
- Contributors don't know where to start

### After (Outcome)

- Onboarding takes 3 days (clear path, AI-guided)
- Cursor AI finds any doc with `@reference`
- Everything lives in SynergyOS (one source of truth)
- Docs stay current (live with code)
- Contributors find "good first issues" instantly

---

## Success Signals

### Leading Indicators (What we can control)

- ✅ All pattern docs have `@` references
- ✅ Cmd+K search finds docs in <1 second
- ✅ 95% of architecture decisions documented in value streams
- ✅ Contributors can find "getting started" in <30 seconds

### Lagging Indicators (What we measure)

- 🎯 **Onboarding time**: < 3 days (from 2 weeks)
- 🎯 **AI findability**: Cursor finds docs 95% of time
- 🎯 **Contribution rate**: 100+ contributors in 12 months
- 🎯 **Doc freshness**: 90%+ updated in last 30 days

### Impact (Why it matters)

- Faster onboarding = more contributors
- AI-navigable docs = faster development
- Living documentation = better product decisions
- Clear value streams = autonomous teams

---

## Team

**Owner**: Randy Hereman (Founder)  
**Contributors**: Open source community  
**AI Partner**: Claude (Cursor AI)  
**Stakeholders**: All SynergyOS contributors, early adopters (Saprolab, ZDHC)

---

## Tech Stack

### Framework

- **SvelteKit 5**: Routes, layouts, SSR
- **MDX via mdsvex**: Markdown + components
- **Design Tokens**: Semantic theming (light/dark)

### Content

- **Source**: `/dev-docs`, `/marketing-docs`, `/value-streams`
- **Format**: MDX (Markdown + Svelte components)
- **Structure**: Value stream folders + route-based pages

### Features

- **AI Navigation**: `@reference` patterns for Cursor
- **Human Search**: Cmd+K quick search
- **Sidebar**: Auto-generated from folder structure
- **TOC**: Table of contents for long docs
- **Mobile**: Responsive, touch-friendly

### Integrations

- **Cursor AI**: Native `@` references
- **GitHub**: Contribution tracking, PRs
- **PostHog**: Privacy-friendly analytics

---

## Architecture

### Route Structure

```
/community              → Marketing/community docs
  /vision               → Product Vision 2.0
  /personas             → Target personas
  /contribute           → Contribution guide

/docs                   → Developer documentation
  /quick-start          → Getting started
  /architecture         → Tech architecture
  /patterns             → Design patterns
  /value-streams        → Value stream docs

/value-streams          → Living value stream docs
  /documentation-system → This stream
  /auth-multi-tenancy   → Auth stream
  /inbox-collection     → Inbox stream
```

### Component Architecture

```
Sidebar.svelte          → Navigation (design tokens)
TableOfContents.svelte  → Page TOC (auto-generated)
DocLayout.svelte        → Shared layout (sidebar + content)
SearchModal.svelte      → Cmd+K search
CodeBlock.svelte        → Syntax highlighting (Shiki)
```

### Data Flow

1. MDX files in `/dev-docs` or `/value-streams`
2. SvelteKit routes render MDX as pages
3. Sidebar auto-generates from folder structure
4. Search indexes all docs on build
5. Cursor AI can reference with `@`

---

## Key Decisions

### Why MDX (not a separate docs site)?

- **Lives with code**: Docs update with PRs
- **Component-rich**: Embed live demos, diagrams
- **Version controlled**: Git tracks all changes
- **No sync issues**: Docs can't drift from code

### Why value stream organization?

- **Outcome-focused**: Clear user value
- **Team autonomy**: Each stream independent
- **Dependency-aware**: Surface blockers early
- **Scalable**: Add streams without coordination

### Why design tokens (not Tailwind classes)?

- **Consistency**: One source of truth for styles
- **Themeable**: Light/dark mode automatic
- **Maintainable**: Change once, update everywhere
- **Professional**: No hardcoded colors/spacing

### Why in-app (not external docs)?

- **Unified experience**: No context switching
- **Real-time**: Docs update with app
- **Self-hostable**: Everything in one repo
- **Offline-capable**: Works without internet

---

## Dependencies

### Blockers (External)

- ❌ **None** - All tech in place, ready to build

### Enablers (Internal)

- ✅ **Design tokens**: Semantic system ready (`src/app.css`)
- ✅ **SvelteKit 5**: Modern routing, layouts
- ✅ **Component library**: Sidebar, modals, navigation

### Nice-to-Have (Future)

- 🔄 **AI summarization**: Auto-generate doc summaries
- 🔄 **Version comparison**: Track doc changes over time
- 🔄 **Contribution metrics**: Show contributor progress (100+ commits)

---

## Getting Started (For Contributors)

### 1. Read the Context

- [Press Release](../../PRESS-RELEASE-DOCS-FEATURE.md) - Why this matters
- [Architecture](./ARCHITECTURE.md) - Technical details
- [Dependencies](./DEPENDENCIES.md) - What we need

### 2. Run Locally

```bash
npm install
npm run dev
# Visit http://localhost:5173/docs
```

### 3. Make Your First Contribution

- Find a `good first issue` on GitHub
- Read `/dev-docs/patterns/INDEX.md` for patterns
- Submit a PR (no permission needed)

### 4. Ask Questions

- Discord: `#development` channel
- GitHub: Open a discussion
- Community calls: Monthly Q&A

---

## Roadmap (Outcome-Based, No Dates)

### Phase 1: Foundation ✅

- ✅ Design token system
- ✅ Existing docs in `/dev-docs`
- ✅ Markdown structure proven

### Phase 2: In-App Docs (Current)

- 🔄 MDX setup (mdsvex)
- 🔄 Route structure (`/community`, `/docs`)
- 🔄 Sidebar component (design tokens)
- 🔄 Content migration (MDX format)

### Phase 3: AI Navigation (Next)

- ⏳ `@reference` system for Cursor
- ⏳ Cmd+K search (human)
- ⏳ Auto-generated TOC
- ⏳ Mobile optimization

### Phase 4: Living Docs (Future)

- ⏳ GitHub integration (show contributor progress)
- ⏳ Auto-update from code comments
- ⏳ Version comparison
- ⏳ AI-generated summaries

---

## Metrics Dashboard (How We Track Progress)

| Metric          | Current | Target | Status         |
| --------------- | ------- | ------ | -------------- |
| Onboarding time | 2 weeks | 3 days | 🔄 In progress |
| AI findability  | 40%     | 95%    | 🔄 In progress |
| Contributors    | 5       | 100    | 🔄 In progress |
| Doc freshness   | 60%     | 90%    | 🔄 In progress |

---

## References

- [Press Release](../../PRESS-RELEASE-DOCS-FEATURE.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical deep dive
- [DEPENDENCIES.md](./DEPENDENCIES.md) - What we need to succeed
- [Fumadocs](https://fumadocs.dev/) - UX inspiration
- [Product Model](https://www.svpg.com/product-model/) - How we work

---

**Status**: 🔄 In progress  
**Last Updated**: November 8, 2025  
**Next Milestone**: MDX setup + route structure  
**Contribution Opportunity**: High (many good first issues)
