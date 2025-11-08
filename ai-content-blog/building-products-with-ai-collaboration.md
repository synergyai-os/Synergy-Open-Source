---
title: "Building Products with AI: How Randy Ships Features in Hours, Not Weeks"
date: 2025-01-08
tags: ["BLOG", "Product Development", "AI Collaboration", "SynergyOS", "Building in Public"]
aiGenerated: false
slug: "building-products-with-ai-collaboration"
series: "Building in Public: The SYOS Journey"
---

# Building Products with AI: How Randy Ships Features in Hours, Not Weeks

## Welcome to the SYOS Journey

Hi, I'm Randy. I build products. Sometimes they work, sometimes they fail spectacularly (looking at you, Axon 1.0).

This blog series is about how I'm building **SynergyOS (SYOS)** — an open source knowledge retention platform — in public, with a small team, using modern tools including AI collaboration.

**What to expect from this series:**
- Real product decisions (and mistakes)
- How we build with teams in product-driven organizations
- Collaboration between humans and AI (not replacing, augmenting)
- Lessons from building for Saprolab, ZDHC, and other ambitious teams
- No fluff. No perfection. Just real building.

Think of this as watching over my shoulder while I work. Sometimes messy. Always honest.

Let's start with something I shipped yesterday: a rich note-taking system. Built in one session. Shipped to production. Here's how.

---

## The Feature: Notes That Don't Suck

**The Problem**: Our team had Readwise highlights and flashcards, but no way to capture quick thoughts, draft blog posts, or document decisions. We needed notes. Not just any notes — **rich notes** that work like Notion but integrate into our existing workflow.

**The Goal**: Build it fast, ship it clean, document the process.

**The Timeline**: One afternoon. Seriously.

---

## How We Build: Product Thinking First, Implementation Second

Here's the thing about building products with AI: **the AI doesn't decide what to build**. You do.

Before touching code, I asked:

1. **Who needs this?** Me (founder), our team (builders), future users (knowledge workers)
2. **What job does it do?** Capture thoughts, draft content, export to blog workflow
3. **What's the minimum?** Rich text, save/load, tag system, export to markdown
4. **What's the future?** Collaborative editing, AI suggestions, embeds (Miro, Figma)

This took 15 minutes. It saved hours of rework.

**Lesson**: AI accelerates execution. You still own the product vision.

---

## The Build: Pairing with AI Like a Senior Dev

I work with Claude (the AI) like I'd work with a senior developer:
- I explain the context
- I define the requirements
- I guide the architecture
- Claude writes the code
- I review, test, iterate

### Round 1: Schema & API

**Me**: "We need a `note` type in our Convex database. Include title, ProseMirror content (JSON), markdown version, AI-generated flag, and blog category. Make it part of our inbox system."

**Claude**: *Generates complete schema extension, API mutations, authentication checks*

**Result**: 15 minutes. Would've taken me 2 hours manually.

**What I Added**: Product context — "This needs to work with our existing tagging system and support future AI retrieval."

---

### Round 2: The Editor (Where Things Got Interesting)

**Me**: "Build a ProseMirror editor component in Svelte 5. Notion-like feel. SSR-safe."

**Claude**: *Generates editor with toolbar, formatting, history plugin*

**Problem**: Server crashes on page load. 

**Why**: ProseMirror is browser-only. Svelte 5 runs on server AND client. Mixing them = 💥

**The Fix**: Guard browser-only code. Add SSR placeholders. Test in production mindset.

**Result**: 1 hour (including 3 iterations and debugging).

**Lesson**: AI knows patterns, but edge cases need human debugging. This is where product experience matters — I've hit SSR issues before, so I knew where to look.

---

### Round 3: Atomic Design System

This is where building with teams shows up.

We don't just build "a button." We build **reusable components** that the whole team can use. Consistency scales, one-offs don't.

**Me**: "Create atomic components: KeyboardShortcut, FormInput, FormTextarea. Use our design token system (no hardcoded values)."

**Claude**: *Generates three clean components with semantic tokens*

**What I Added**:
- Documentation in `dev-docs/design-tokens.md`
- Usage patterns for the team
- Integration examples in existing modals

**Result**: 30 minutes. Now every form input looks consistent. Change the design once, updates everywhere.

**Lesson**: AI writes the component. You design the system.

---

### Round 4: AI Content Detection (The Product Decision)

Here's where human judgment matters.

**The Idea**: When you paste text, SYOS asks "Is this AI-generated?" and lets you tag it.

**Why?**: Transparency. Future AI retrieval. Trust in the content.

**The Question**: When do we show this menu? Always? Only on long pastes? User setting?

**My Call**: 
- Show on paste (if text > 50 words)
- Dismissible by clicking away
- Add a global setting to disable it
- Placeholder detection logic (improve later)

**Claude**: *Implements exactly that*

**Result**: 30 minutes for the feature, 5 minutes for the product decision.

**Lesson**: Implementation is fast. Product thinking is where you add value.

---

## What Broke (And How We Fixed It Fast)

Building fast means breaking things. Here's what failed:

### Bug 1: SSR 500 Errors
**Symptom**: Server crashes, no error message in browser  
**Diagnosis**: Client-only runes (`$state`) running on server  
**Fix**: Wrap in `if (browser)` checks  
**Time**: 20 minutes  
**Pattern Documented**: `dev-docs/patterns/svelte-reactivity.md#L400`

### Bug 2: ProseMirror `$from` Collision  
**Symptom**: Svelte error: "$ prefix is reserved"  
**Diagnosis**: ProseMirror uses `$from`, Svelte 5 reserves `$` for runes  
**Fix**: Rename in destructuring: `const { $from: from } = selection`  
**Time**: 10 minutes  
**Pattern Documented**: Same doc, line 450

### Bug 3: Permission Errors on macOS  
**Symptom**: Can't read `.env.local` file  
**Diagnosis**: macOS quarantine attributes  
**Fix**: `xattr -d com.apple.quarantine .env.local`  
**Time**: 5 minutes  

**Total Debug Time**: 35 minutes. Fast because we **document patterns as we go**.

Every bug becomes institutional knowledge. Next time (or next AI session), we don't repeat it.

---

## The Results: What We Shipped

In one afternoon:

✅ **Rich Note Editor** (ProseMirror, toolbar, auto-save)  
✅ **AI Content Detection** (contextual menu, user control)  
✅ **Atomic Components** (KeyboardShortcut, FormInput, FormTextarea)  
✅ **Blog Workflow** (tag "BLOG" → export to markdown)  
✅ **SSR-Safe** (no crashes, works on mobile)  
✅ **Pattern Documentation** (41 patterns, up from 38)  
✅ **First Blog Post** (this one — proving the system works)

**Total Active Time**: ~3.5 hours (including debugging, documentation, testing)

**Manual Estimate**: 14-16 hours minimum

**Speedup**: ~4x faster with AI collaboration

---

## How This Changes Product Development

### Old Way (Solo Developer):
1. Research ProseMirror docs (2 hours)
2. Set up schema, API, types (2 hours)
3. Build editor component (4 hours)
4. Debug SSR issues (2 hours)
5. Create atomic components (3 hours)
6. Write documentation (1 hour)
7. **Total**: 14 hours over 2-3 days

### New Way (Human + AI):
1. Define requirements (15 min)
2. Prompt AI for schema/API (15 min)
3. Prompt AI for editor (30 min)
4. Debug SSR issues together (30 min)
5. Prompt AI for components (20 min)
6. Document patterns (30 min)
7. Test in browser (30 min)
8. **Total**: 3.5 hours in one session

**The Difference**: AI handles implementation. You focus on product decisions, architecture, and edge cases.

---

## What AI Does Well (For Product Teams)

1. **Boilerplate**: Schema, types, CRUD operations — instant
2. **Known Patterns**: Components, hooks, standard setups — reliable
3. **Documentation**: Inline comments, README sections — consistent
4. **Iteration Speed**: "Change X to Y" → done in seconds
5. **Knowledge Retrieval**: "How did we solve SSR last time?" → checks docs

**For Teams**: Junior devs ship faster. Senior devs focus on architecture. Everyone documents as they go.

---

## What AI Struggles With (Where Humans Add Value)

1. **Product Decisions**: "Should this menu auto-dismiss?" — You decide.
2. **Architecture**: "Where should this composable live?" — You design the system.
3. **Edge Cases**: "What if SSR runs client-only code?" — You catch it.
4. **Context**: "How does this fit our existing patterns?" — You provide history.
5. **Priorities**: "Build this, not that, right now" — You own the roadmap.

**For Teams**: Product managers define scope. Engineers guide implementation. AI accelerates both.

---

## How We Document (So Teams Stay Aligned)

Every pattern we learn gets documented:

- `dev-docs/patterns/svelte-reactivity.md` — Svelte 5 gotchas
- `dev-docs/patterns/ui-patterns.md` — Design system patterns
- `dev-docs/patterns/INDEX.md` — Fast symptom → solution lookup

**Why This Matters for Teams**:
- New team members onboard faster
- AI sessions pick up where humans left off
- Mistakes don't repeat
- Knowledge compounds

This isn't "documentation for documentation's sake." It's institutional memory that makes the team faster.

---

## The 5-Minute Benchmark: A Brand Promise

Full transparency: I wrote the outline for this post. Claude wrote the first draft in 5 minutes. I'm publishing it with minimal edits.

**Why?**

Because this is the benchmark: **What can we create in 5 minutes with AI collaboration?**

- Is it perfect? No.
- Is it 80% there? Yes.
- Could I write this manually in 5 minutes? Not even close.

This is the future of product development:
- **Humans**: Vision, decisions, architecture, edge cases
- **AI**: Implementation, iteration, documentation, speed
- **Together**: 4x faster, better documented, more ambitious

---

## What's Next for SYOS

This note system is **Iteration 1**. Here's the roadmap (documented in `dev-docs/notes-iteration-roadmap.md`):

- **Iteration 2**: Advanced formatting (tables, code blocks, embeds)
- **Iteration 3**: Collaborative editing (real-time sync with team)
- **Iteration 4**: AI suggestions (auto-complete, tone, clarity)
- **Iteration 5**: Voice-to-text (capture thoughts on the go)
- **Iteration 6**: Mobile optimization (iOS native feel)
- **Iteration 7**: Plugin system (Miro boards, Figma files, Linear issues)
- **Iteration 8**: Export formats (Notion, Google Docs, PDF)

We're building this for teams like Saprolab and ZDHC — digital builders who need knowledge to flow, not get stuck in silos.

---

## For Product Teams Reading This

**If you're building products with small teams**, here's what this means:

1. **Ship 4x faster** with AI collaboration
2. **Document as you go** so knowledge compounds
3. **Focus on product decisions** (AI handles implementation)
4. **Build atomic systems** (reusable components, not one-offs)
5. **Test in production mindset** (SSR, mobile, edge cases)

**The tools**:
- Cursor (AI pair programming)
- Convex (real-time backend)
- SvelteKit 5 (modern frontend)
- ProseMirror (rich text that scales)
- Design tokens (consistency without micromanagement)

**The approach**:
- Product thinking first
- AI for acceleration
- Human for edge cases
- Documentation for compounding

**The result**: Features in hours, not weeks. Documented patterns. Scalable systems.

---

## Try It Yourself

Want to see this in action?

- **Repo**: [github.com/randyhereman/synergyos](https://github.com/randyhereman/synergyos) (coming soon)
- **Docs**: Check `dev-docs/patterns/` for our lessons learned
- **Follow along**: Building in public — mistakes, wins, and all

Got questions? Found a better way? Built something similar?

**Let's learn together. That's the Synergy in SynergyOS.**

---

**Written by**: Randy & SYOS (human + AI collaboration)  
**Time to Draft**: 5 minutes  
**Time to Edit**: 10 minutes  
**Total**: 15 minutes for a full blog post  
**Read Time**: 8 minutes  
**Vibe**: Product builder talking to product builders

---

## P.S. — The Meta Layer

This blog post was:
1. Written in the note editor we built yesterday
2. Tagged "BLOG" in our system
3. Exported to markdown automatically
4. Published without manual file creation

**The system works. Now let's see what else we can build.**

---

## P.P.S. — What to Expect from This Series

This is **post #2** in the SYOS journey. Here's what's coming:

- How we failed at Axon 1.0 (and what we learned)
- Building on $60/month (no VC needed)
- Mistakes I made with AI (and how you can avoid them)
- Product team challenges (alignment, onboarding, knowledge silos)
- Open source business models (community + managed service)
- Continuous discovery on a budget

**Follow along**: We're building a product OS for knowledge workers. In public. With AI. For teams.

**Randy & SYOS**

