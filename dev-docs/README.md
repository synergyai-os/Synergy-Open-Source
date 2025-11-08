# SynergyOS Developer Documentation

> **OS = Open Source** | Knowledge retention platform using the CODE framework

---

## 🎯 What is SynergyOS?

SynergyOS helps you **collect, organize, distill, and express** knowledge from diverse sources into actionable learning tools (flashcards, rich notes, templates, frameworks). Built as an open-source project with AI collaboration, designed for teams building Champions League products.

### CODE Framework

**Collect → Organise → Distill → Express**

1. **Collect**: Gather information from multiple sources (Readwise, notes, photos)
2. **Organise**: Review and categorize in a universal inbox
3. **Distill**: Extract key insights (AI-powered flashcard generation)
4. **Express**: Study and use the distilled content

---

## 🗂️ Documentation Structure (PARA)

This documentation follows the **PARA method**: Projects, Areas, Resources, Archive.

### 1-projects/
*Time-bound initiatives with specific outcomes and deadlines*

Currently empty - active value streams live in `2-areas/value-streams/`

### 2-areas/
*Ongoing responsibilities and domains we maintain*

**Core Areas:**
- **[product-vision-and-plan.md](2-areas/product-vision-and-plan.md)** - Product vision, strategy, roadmap ⭐ **START HERE**
- **[architecture.md](2-areas/architecture.md)** - Tech stack, auth, composables
- **[design-tokens.md](2-areas/design-tokens.md)** - Design system reference 🎨 **MANDATORY**
- **[composables-analysis.md](2-areas/composables-analysis.md)** - Svelte 5 composables patterns

**Value Streams:**
- **[value-streams/](2-areas/value-streams/)** - Outcome-driven development streams
  - [Documentation System](2-areas/value-streams/documentation-system/) - Living docs, AI-navigable
  - [Fresh Start Plan](2-areas/value-streams/FRESH-START-PLAN.md) - Step-by-step implementation

**Patterns:**
- **[patterns/INDEX.md](2-areas/patterns/INDEX.md)** - Fast pattern lookup ⚡ **DEBUG HERE**
- [patterns/svelte-reactivity.md](2-areas/patterns/svelte-reactivity.md) - Svelte 5 runes, $state, $derived
- [patterns/convex-integration.md](2-areas/patterns/convex-integration.md) - Convex auth, queries, mutations
- [patterns/ui-patterns.md](2-areas/patterns/ui-patterns.md) - UI/UX, design tokens, layout
- [patterns/analytics.md](2-areas/patterns/analytics.md) - PostHog server-side tracking

**Infrastructure:**
- [activity-tracker.md](2-areas/activity-tracker.md) - Global progress tracking
- [posthog.md](2-areas/posthog.md) - Analytics setup
- [theme-sync.md](2-areas/theme-sync.md) - Theme synchronization
- [multi-tenancy-migration.md](2-areas/multi-tenancy-migration.md) - Future org/team architecture

### 3-resources/
*Reference material, checklists, external guides*

- [production-checklist.md](3-resources/production-checklist.md) - Pre-launch checklist
- [testing-strategy.md](3-resources/testing-strategy.md) - Testing approach
- [mobile-strategy.md](3-resources/mobile-strategy.md) - Capacitor iOS setup
- [ENCRYPTION-SETUP.md](3-resources/ENCRYPTION-SETUP.md) - API key encryption

### 4-archive/
*Deprecated, completed, or superseded documentation*

Historical analysis docs, legacy patterns, refactoring notes.

---

## 🚀 Quick Start

### For New Contributors

1. **Read [product-vision-and-plan.md](2-areas/product-vision-and-plan.md)** - Understand what we're building
2. **Read [patterns/INDEX.md](2-areas/patterns/INDEX.md)** - Common issues and solutions
3. **Check [design-tokens.md](2-areas/design-tokens.md)** - NEVER hardcode values
4. **Pick a task** from value streams or product plan
5. **Use Context7** for library documentation (faster than web search)

### For Debugging

1. Load **[patterns/INDEX.md](2-areas/patterns/INDEX.md)** - Symptom table
2. Find your symptom → jump to line number
3. Apply fix with 95%+ confidence
4. Use Context7 to verify library patterns

### For New Chat Sessions (AI)

1. **Load** `dev-docs/product-vision-and-plan.md` - Current state
2. **Reference** `dev-docs/patterns/INDEX.md` - Known solutions
3. **Check** `dev-docs/design-tokens.md` - UI requirements
4. **Use** Context7 MCP - Latest library docs

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
- `dev-docs/2-areas/product-vision-and-plan.md` - Vision & roadmap
- `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- `dev-docs/2-areas/architecture.md` - Tech architecture
- `dev-docs/2-areas/design-tokens.md` - Token reference

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

**Phase 2B**: Rich Note-Taking System (In Progress)
- ✅ ProseMirror editor with AI detection
- ✅ Blog workflow (export to markdown)
- 🔄 Documentation system (MDX + PARA)

**Next**: Complete Phase 2A (Tagging Integration)

See [product-vision-and-plan.md](2-areas/product-vision-and-plan.md) for full roadmap.

---

**Questions?** Open a GitHub discussion or check [patterns/INDEX.md](2-areas/patterns/INDEX.md) for common issues.

**Ready to build?** Start with [product-vision-and-plan.md](2-areas/product-vision-and-plan.md), then pick a task!

