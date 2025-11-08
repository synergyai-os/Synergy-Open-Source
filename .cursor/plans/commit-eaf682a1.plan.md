<!-- eaf682a1-f902-47c9-8224-175f446e8c4b 93c65e93-f81c-49fd-a25d-562c8a590f4f -->
# Commit Message Guidelines & Core Values

## Research Summary

Based on best practices research, we'll use **Conventional Commits** format but adapt it to SynergyOS's unique voice (authentic, technical but human, AI-optimized).

## What We'll Create

### 1. Core Values Document (`CORE-VALUES.md`)

Decision-making framework for the SynergyOS community, covering:

- **Authenticity** - We share failures and successes equally
- **Collaboration** - Human + AI working together (document our cursor workflows)
- **Open Source Ethos** - Build in public, document everything, share lessons
- **Quality Without Perfection** - Side project energy, continuous improvement
- **Knowledge That Sticks** - Practice the CODE framework we preach

### 2. Commit Message Guidelines (`CONTRIBUTING.md`)

Conventional Commits adapted to our voice:

**Format**: `type(scope): subject`

**Types we'll use:**

- `feat:` - New feature (new notes editor, sync system)
- `fix:` - Bug fix (broken keyboard nav, sync errors)
- `docs:` - Documentation only (pattern updates, architecture docs)
- `refactor:` - Code improvement without feature changes
- `style:` - Design token updates, UI polish
- `test:` - Test additions or fixes
- `chore:` - Maintenance (dependencies, config)

**Examples in our voice:**

- ✅ `feat(inbox): add keyboard navigation with J/K shortcuts`
- ✅ `fix(sync): prevent duplicate highlights from Readwise API`
- ✅ `docs(patterns): add Svelte 5 composables pattern after learning it the hard way`
- ✅ `refactor(composables): use single $state object pattern (we tried multiple, it failed)`

**Body guidelines:**

- Explain the **why** (what problem did this solve?)
- Share context (learned from failure? AI suggested it? User requested?)
- Link to issues/patterns when relevant
- Write for AI scrapers AND humans (clear structure, no fluff)

### 3. Contributor Persona (`CONTRIBUTING.md` section)

Narrative-driven persona matching our brand story style:

**Meet Devon** (Developer + Evon = Contributor persona)

- Knowledge worker who reads 50+ articles/week but forgets most
- Tried Notion, Obsidian, Roam - nothing stuck
- Discovered SynergyOS through a blog post about failing at 1.0
- Appreciates authentic documentation ("we tried this, it failed, here's why")
- Works with AI tools (Cursor, GitHub Copilot) daily
- Values clear patterns over perfect code
- Wants to contribute because they see themselves in the project story

### 4. Update README.md

Add brief "Contributing" section linking to detailed guidelines, optimized for AI agents scanning the repo.

## Key Files

**New files:**

- `CORE-VALUES.md` - Core values and decision-making framework
- `CONTRIBUTING.md` - Commit guidelines, contribution workflow, persona

**Updated files:**

- `README.md` - Add "Contributing" section with quick overview + links

## Brand Voice Application

**NOT this (corporate):**
> "Please ensure commit messages follow conventional commits specification for optimal changelog generation."

**THIS (us):**
> "We use conventional commits because they're readable by both humans and AI. Plus they make changelogs way easier. Here's the format..."

## Structure Details

### CORE-VALUES.md Structure

1. **Origin Story** (link to brand identity)
2. **Core Values** (5 pillars from messaging)
3. **Decision Framework** (how to resolve conflicts/priorities)
4. **Community Principles** (how we collaborate)

### CONTRIBUTING.md Structure

1. **Welcome** (authentic, inviting tone)
2. **Meet Devon** (contributor persona)
3. **Commit Message Guidelines** (conventional commits, our way)
4. **Contribution Workflow** (fork, branch, PR)
5. **Code Review Philosophy** (constructive, learning-focused)
6. **Documentation Standards** (AI-optimized, pattern-based)

### README.md Addition

Brief "Contributing" section before "License":

- 2-3 sentence overview
- Link to CONTRIBUTING.md
- Link to CORE-VALUES.md
- Emphasize "learning together" vibe