# Vision Migration: From Personal Tool to Organizational Platform

> **TL;DR**: We evolved from a personal knowledge management app (CODE framework) to an open-source organizational platform for product teams—embedding learning, AI coaching, product discovery, and delivery tools at the core.

---

## What Changed

### Before: Personal Knowledge Management
**Original Vision**:
- Personal inbox for collecting knowledge (Readwise integration)
- CODE framework (Collect → Organize → Distill → Express)
- Flashcard-based learning for individuals
- Private, encrypted personal knowledge base

**Target User**: Individual knowledge workers, students, learners

**Tech Stack**: SvelteKit + Convex + Capacitor (unchanged)

---

### After: Organizational Product Development Platform
**New Vision**:
- **Product discovery & delivery tools** for teams
- **Outcome-driven frameworks** (OKRs, goal setting)
- **AI coaching** trained on company data
- **Automated workshop generation** based on strategy
- **Team & knowledge organization** (Holaspirit replacement)
- **Builder marketplace** for custom apps
- **Privacy-first**: offline, self-hosted, or cloud
- **Open source**: community-driven, customizable

**Target User**: Product teams, software companies, non-profit tech teams (Saprolab, ZDHC)

**Tech Stack**: Same foundation, expanded scope

---

## Why the Pivot?

### The Realization
The original app proved:
1. **One developer + AI can build powerful tools** on a tiny budget ($60/month)
2. **The CODE framework applies to organizations**, not just individuals
3. **Knowledge management ≠ learning** — teams need context, workflows, and collaboration
4. **Existing tools suck** — Holaspirit, Notion, Jira are expensive, closed, and fragmented

### The Opportunity
- **Saprolab** (IT supplier building products for non-profits) needs this internally
- **ZDHC** (Saprolab's client) struggles with alignment, knowledge sharing, and product roadmaps
- **Product teams everywhere** face the same problems: too much created, not enough consumed, no glossary, unclear plans, disconnected tools

### The Constraint
- **Budget**: $60/month until we validate with partners
- **First partner**: Saprolab pays X, we reach profitability
- **Open source**: Community contributes, making it sustainable

---

## What Stays the Same

### Technical Foundation
- SvelteKit 5 + Svelte 5 Runes (reactive UI)
- Convex (real-time database, serverless functions)
- Capacitor (mobile support)
- Design token system (light/dark mode, themeable)
- PostHog analytics (privacy-friendly)

### Development Philosophy
- **Outcome-driven**: Ship outcomes, not features
- **Community-first**: Open source, customizable, extensible
- **AI-powered**: Built with AI, augmented by AI (Cursor, Claude)
- **Privacy-first**: Your data, your AI, your rules

### Core Patterns
- Svelte 5 composables (`.svelte.ts`)
- Design tokens (no hardcoded values)
- Real-time sync (Convex)
- Modular architecture (ready for multi-tenancy)

---

## What's New

### Expanded Scope

| Old                        | New                                             |
|----------------------------|-------------------------------------------------|
| Personal inbox             | Team knowledge hub                              |
| Individual flashcards      | AI coaching for teams                           |
| Readwise sync              | Product data sync (Jira, Notion, etc.)          |
| Private notes              | Shared glossaries, project plans, strategies    |
| Solo learning              | Collaborative workshops, meetings, alignment    |
| CODE framework (personal)  | Product discovery & delivery frameworks (teams) |

### New Capabilities
1. **Product Discovery Tools**
   - User research repositories
   - Opportunity solution trees
   - Outcome-driven roadmaps
   - Continuous discovery workflows

2. **Team Collaboration**
   - Built-in meetings (stand-ups, retros, planning)
   - Automated status reports
   - Real-time alignment dashboards
   - Shared glossaries & documentation

3. **AI Coaching**
   - Trained on company data (not generic ChatGPT)
   - Context-aware suggestions
   - Workshop facilitation
   - Decision support

4. **Builder Marketplace**
   - Community-built apps/modules
   - Custom workflows
   - Integration ecosystem
   - Open standards

5. **Privacy Options**
   - Offline-first (no internet required)
   - Self-hosted (your infrastructure)
   - Cloud-hosted (our managed service)
   - Bring-your-own AI (OpenAI, local LLMs, etc.)

---

## Migration Path

### Phase 1: Foundation (Current)
- ✅ SvelteKit + Convex working
- ✅ Authentication & encryption
- ✅ Inbox (personal knowledge)
- ✅ Flashcards (learning)
- ✅ Tagging system (organization)

### Phase 2: Multi-Tenancy (Next)
- 🔄 Organizations & teams schema
- 🔄 Permissions & access control
- 🔄 Shared workspaces
- 🔄 Collaborative features

### Phase 3: Product Tools (Future)
- ⏳ Roadmap management
- ⏳ User research repository
- ⏳ Goal/OKR tracking
- ⏳ Workshop templates

### Phase 4: AI Coaching (Future)
- ⏳ Company data ingestion
- ⏳ Context-aware AI coaching
- ⏳ Automated workshops
- ⏳ Decision support

### Phase 5: Marketplace (Future)
- ⏳ Plugin architecture
- ⏳ Community apps
- ⏳ Integration ecosystem

---

## How We Talk About It

### Externally
**For Saprolab/ZDHC**:
- "An open-source platform to replace Holaspirit with learning, product discovery, and AI coaching built in"
- "Built for product teams who want to align, collaborate, and build better products—without fragmented tools"

**For Community**:
- "The open-source Product OS for teams—embed learning, discovery, and delivery in one place"
- "Privacy-first, AI-powered, community-driven product development platform"

### Internally
**The Story**:
- One developer, AI, and a keyboard
- $60/month budget proves it's possible
- Saprolab validates the vision → we invest
- Open source ensures sustainability
- Community makes it unstoppable

**The Mission**:
Build the platform we wish existed—one that helps teams discover, align, and deliver better products with learning embedded at every step.

---

## What We Keep From the Original

### The CODE Framework
Still relevant, but **applied to teams**:
- **Collect**: Capture user research, feedback, ideas
- **Organize**: Structure with glossaries, taxonomies, roadmaps
- **Distill**: AI-powered insights, summaries, coaching
- **Express**: Ship outcomes, share learnings, iterate

### The Learning Philosophy
- **Learning takes too much effort** → Make it automatic (AI summaries, glossaries)
- **We create more than we consume** → AI helps distill signal from noise
- **Nobody knows the glossary** → Shared, searchable, context-aware
- **Project plans are inaccessible** → Real-time, visual, collaborative

### The Tech Bet
- **SvelteKit**: Fast, modern, flexible
- **Convex**: Real-time, scalable, serverless
- **Capacitor**: Mobile-ready
- **Open source**: Community-owned

---

## Success Signals

### Old Signals
- Daily active users (DAU)
- Flashcards reviewed
- Readwise sync frequency

### New Signals
- **Adoption**: Saprolab using it daily, ZDHC onboarded
- **Engagement**: Teams coming back, positive feedback
- **Community**: Developers contributing (Bjorn helping)
- **Revenue**: Saprolab paying, costs covered
- **Impact**: Better product decisions, clearer alignment

---

## Questions We Had to Answer

### Why open source?
- **Trust**: Teams need to trust their tools with sensitive data
- **Customization**: Every org has unique workflows
- **Sustainability**: Community contributions = less maintenance burden
- **Moat**: Open standards + community = hard to compete with

### Why not just build for ourselves?
- **Validation**: Saprolab/ZDHC validate the market need
- **Scale**: Open source = exponential reach
- **Impact**: Help more teams build better products

### Why AI coaching instead of just docs?
- **Context**: AI knows your company data, not generic advice
- **Proactive**: AI suggests next steps, doesn't wait for questions
- **Adaptive**: Learns from your team's patterns

### Why not use existing tools?
- **Fragmentation**: Notion + Jira + Slack + Loom = context switching hell
- **Cost**: Holaspirit is expensive, closed, inflexible
- **Privacy**: Most tools own your data, charge for access
- **Learning**: No tool embeds learning at the core

---

## What Doesn't Change

- **Developer**: Still one person building with AI
- **Budget**: Still $60/month until validated
- **Philosophy**: Outcome-driven, community-first, privacy-first
- **Tech**: Same stack, proven foundation
- **Approach**: Rapid iterations, validate, invest when successful

---

**The bottom line**: We're not abandoning what we built. We're **expanding its scope** to solve a bigger problem for more people—while staying true to our principles of open source, privacy, and community.

---

**Next Steps**:
1. Review **[Product Vision 2.0](./strategy/product-vision-2.0.md)** for the full vision
2. Check **[Product Strategy](./strategy/product-strategy.md)** for outcome-driven roadmap
3. Read **[Target Personas](./audience/target-personas.md)** to understand who we serve

