# SynergyOS Developer Documentation

> **OS = Open Source** | Knowledge retention platform using the CODE framework

---

## 🎯 Pick Your Path

### 🐛 I'm Debugging (Engineer)
**→ [Pattern Index](2-areas/patterns/INDEX)** - Symptom → Solution in < 2 min

### 🎨 I'm Designing (Designer)
**→ [Component Library](2-areas/component-library)** - Visual specs + usage *(Coming Soon)*  
**→ [Design Tokens](2-areas/design-tokens)** - Spacing, colors, typography ✅

### 📊 I'm Planning (Product Manager)
**→ [User Journeys](2-areas/user-journeys)** - Step-by-step flows *(Coming Soon)*  
**→ [Product Vision](2-areas/product-vision-and-plan)** - What we're building ✅

### 🏗️ I'm Building (All Roles)
**→ [Architecture](2-areas/architecture)** - System overview + tech stack ✅  
**→ [Data Models](2-areas/data-models)** - Schema + relationships *(Coming Soon)*

---

## ⚡ Quick Wins

| I need to... | Go here | Time |
|-------------|---------|------|
| Fix a bug | [Pattern Index 🔴 Critical](2-areas/patterns/INDEX#-critical-patterns-fix-immediately) | 2 min |
| Find a component | [Component Library](2-areas/component-library) *(Coming Soon)* | 3 min |
| Understand user flow | [User Journeys](2-areas/user-journeys) *(Coming Soon)* | 10 min |
| Check design system | [Design Tokens](2-areas/design-tokens) | 5 min |
| Understand CODE | [Product Vision](2-areas/product-vision-and-plan#L13) | 5 min |

---

## 🧩 For Product Managers

### User & Business
- **[Product Vision & Strategy](2-areas/product-vision-and-plan)** - What we're building & why ⭐
- **[User Journeys](2-areas/user-journeys/)** *(Coming Soon)*
  - Collect highlights from Readwise
  - Review & organize inbox
  - Generate flashcards with AI
  - Study with spaced repetition
- **[Data Flows](2-areas/data-flows/)** *(Coming Soon)*
  - Readwise sync pipeline
  - AI flashcard generation
  - End-to-end data movement

### Features & Roadmap
- **[Value Streams](2-areas/value-streams/)** - Active initiatives
- **[Development Phases](2-areas/product-vision-and-plan#L96)** - Roadmap progress
- **[Multi-Tenancy Vision](2-areas/multi-tenancy-migration.md)** - Future org/team features

---

## 🎨 For Designers

### Design System
- **[Design Tokens](2-areas/design-tokens)** ⭐ **MANDATORY** - Never hardcode values
- **[Component Library](2-areas/component-library/)** *(Coming Soon)*
  - Buttons, forms, cards
  - Modals, navigation, layouts
  - Usage examples + code
- **[Interaction Patterns](2-areas/patterns/ui-patterns.md#L1150)** - Animations & micro-interactions
- **[Accessibility](3-resources/accessibility.md)** *(Coming Soon)* - WCAG guidelines

### User Flows
- **[User Journeys](2-areas/user-journeys/)** *(Coming Soon)* - Visual flows with UI screenshots
- **[UI/UX Patterns](2-areas/patterns/ui-patterns.md)** - Solved design problems
- **[Composables Analysis](2-areas/composables-analysis.md)** - Reusable UI logic

---

## 🛠️ For Engineers

### Architecture & Patterns
- **[Architecture Overview](2-areas/architecture.md)** - Tech stack + system design ⭐
- **[Pattern Index](2-areas/patterns/INDEX.md)** ⚡ **DEBUG HERE** - Symptom lookup
  - [Svelte 5 Reactivity](2-areas/patterns/svelte-reactivity.md) - $state, $derived, $effect
  - [Convex Integration](2-areas/patterns/convex-integration.md) - Queries, mutations, auth
  - [UI/UX Patterns](2-areas/patterns/ui-patterns.md) - Design tokens, layouts
  - [Analytics](2-areas/patterns/analytics.md) - PostHog tracking

### Data & APIs
- **[Data Models](2-areas/data-models/)** *(Coming Soon)*
  - Schema overview
  - Inbox item types (discriminated unions)
  - Flashcard model
  - User & auth
- **[API Reference](2-areas/api-reference/)** *(Coming Soon)*
  - Queries (read)
  - Mutations (write)
  - Actions (AI, sync)
- **[Data Flows](2-areas/data-flows/)** *(Coming Soon)* - Visual architecture diagrams

### Development
- **[Architecture Decisions (ADRs)](2-areas/architecture-decisions/)** *(Coming Soon)*
  - Why Convex?
  - Why Svelte 5?
  - Semantic token approach
- **[Testing Strategy](3-resources/testing-strategy.md)** - Vitest + Playwright
- **[Performance Guidelines](3-resources/performance.md)** *(Coming Soon)*

---

## 📂 PARA Organization

This documentation follows the [PARA system](https://fortelabs.com/blog/para/):

- **[1-projects/](1-projects/)** - Time-bound work with deadlines
- **[2-areas/](2-areas/)** - Ongoing responsibilities (architecture, design, patterns)
- **[3-resources/](3-resources/)** - Reference material (checklists, testing, mobile)
- **[4-archive/](4-archive/)** - Completed or deprecated content

---

## 🔥 Most Used Documentation

1. **[Pattern Index](2-areas/patterns/INDEX)** (Daily) - Symptom → Solution
2. **[Design Tokens](2-areas/design-tokens)** (Daily) - UI implementation
3. **[Product Vision](2-areas/product-vision-and-plan)** (Weekly) - Context & direction
4. **[Architecture](2-areas/architecture)** (Weekly) - System understanding

---

## 🚀 Quick Start

### 👋 New to SynergyOS? (Pick your role)

**Product Manager:**
1. Read [Product Vision](2-areas/product-vision-and-plan) (10 min)
2. Explore [CODE Framework](2-areas/product-vision-and-plan#L13) (5 min)
3. Review [Current Phase](2-areas/product-vision-and-plan#L96) (5 min)
4. Check [User Journeys](2-areas/user-journeys) *(Coming Soon)*

**Designer:**
1. Review [Design Tokens](2-areas/design-tokens) (15 min) 🎨 **MANDATORY**
2. Explore [Component Library](2-areas/component-library) *(Coming Soon)*
3. Check [UI Patterns](2-areas/patterns/ui-patterns.md) (10 min)
4. Review [Interaction Patterns](2-areas/patterns/ui-patterns.md#L1150) (5 min)

**Engineer:**
1. Load [Pattern Index](2-areas/patterns/INDEX) (5 min) ⚡
2. Read [Architecture](2-areas/architecture) (20 min)
3. Review [Svelte 5 Patterns](2-areas/patterns/svelte-reactivity.md) (15 min)
4. Check [Convex Patterns](2-areas/patterns/convex-integration.md) (15 min)

### 🐛 Debugging Something?

1. **Load** [Pattern Index](2-areas/patterns/INDEX)
2. **Scan** symptom table (🔴 Critical, 🟡 Important, 🟢 Reference)
3. **Jump** to line number for immediate fix
4. **Apply** with 95%+ confidence

### 🤖 Starting a New Chat? (For AI)

1. Load `dev-docs/product-vision-and-plan.md` - Current state
2. Reference `dev-docs/patterns/INDEX.md` - Known solutions
3. Check `dev-docs/design-tokens.md` - UI requirements
4. Use Context7 MCP - Latest library docs

---

## ⚠️ Critical Rules

### 🎨 Design Tokens (MANDATORY for UI)

**NEVER use hardcoded values:**

```svelte
<!-- ❌ WRONG -->
<div class="px-2 py-1.5 bg-gray-900 text-white">

<!-- ✅ CORRECT -->
<div class="px-nav-item py-nav-item bg-sidebar text-sidebar-primary">
```

**Why**: Tokens adapt to light/dark mode automatically. Change once, updates everywhere.

**Full Reference**: [design-tokens.md](2-areas/design-tokens.md)

### 🧩 Svelte 5 Composables

```typescript
// ❌ WRONG - Multiple $state variables
let isOpen = $state(false);
let data = $state(null);

// ✅ CORRECT - Single $state object with getters
const state = $state({ isOpen: false, data: null });
return {
  get isOpen() { return state.isOpen; },
  get data() { return state.data; }
};
```

**Full Pattern**: [svelte-reactivity.md#L10](2-areas/patterns/svelte-reactivity.md#L10)

### 🔌 Convex Integration

```typescript
// ❌ WRONG - Manual data fetching
const data = await client.query(api.items.list);

// ✅ CORRECT - Reactive subscriptions
const data = useQuery(api.items.list, () => ({ filter: 'all' }));
```

**Full Pattern**: [convex-integration.md#L10](2-areas/patterns/convex-integration.md#L10)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | SvelteKit 5 + TypeScript | App framework + type safety |
| **UI** | Bits UI + Tailwind CSS 4 | Headless components + utility styles |
| **Styling** | Semantic Design Tokens | Light/dark mode + consistency |
| **Backend** | Convex | Real-time database + serverless functions |
| **Mobile** | Capacitor 7 | iOS native wrapper |
| **AI** | Claude (Anthropic) | Flashcard generation |
| **Analytics** | PostHog | Product analytics |

**Full Details**: [architecture.md](2-areas/architecture.md)

---

## 💡 Best Practices

### Before Writing Code

- [ ] Check [Pattern Index](2-areas/patterns/INDEX) for existing solutions
- [ ] Use [Design Tokens](2-areas/design-tokens) (never hardcode)
- [ ] Follow [Composables Pattern](2-areas/patterns/svelte-reactivity.md#L10)
- [ ] Use Context7 for library documentation

### When Debugging

1. Use `/root-cause` command
2. Load [Pattern Index](2-areas/patterns/INDEX)
3. Scan symptom table by severity
4. Jump to line number
5. Apply fix if 95%+ confident

### Common Mistakes

| Mistake | Correct Approach |
|---------|-----------------|
| Hardcoded `px-2` | Use token: `px-nav-item` |
| File named `useData.ts` | Rename to `useData.svelte.ts` |
| Multiple `$state` vars | Single `$state` object |
| `const data = await query()` | `const data = useQuery()` |
| No browser check in `$effect` | `if (!browser) return;` |

---

## 🤝 Contributing

### Development Workflow

1. **Investigate** - Understand current state + patterns
2. **Scope** - Define what's in/out
3. **Plan** - Outline approach + steps
4. **Confirm** - Get user approval
5. **Build** - Implement in vertical slices
6. **Test** - Verify with real data
7. **Document** - Update patterns/INDEX

### Pattern Documentation

When you solve a problem:

1. Add to domain file ([svelte-reactivity.md](2-areas/patterns/svelte-reactivity.md), etc.)
2. Update [Pattern Index](2-areas/patterns/INDEX.md) with symptom → line number
3. Choose severity: 🔴 Critical, 🟡 Important, 🟢 Reference
4. Validate with Context7 if touching external libraries

**Template**:
```markdown
## #L[NUMBER]: [Pattern Name] [🔴/🟡/🟢]

**Symptom**: One-line description  
**Root Cause**: Why it happens  
**Fix**: Code example (❌ wrong, ✅ correct)  
**Apply when**: When to use  
**Related**: Other patterns
```

---

## 📊 Documentation Roadmap

### ✅ Available Now

- Pattern Index (symptom → solution)
- Design token system
- Architecture overview
- Svelte 5 patterns
- Convex integration patterns
- Product vision

### 🔄 In Progress

- Component library documentation
- User journey maps
- Data flow diagrams

### 📋 Coming Soon

- API reference documentation
- Data model documentation
- Architecture decision records (ADRs)
- Accessibility guidelines
- Performance optimization guide

**See**: [VALIDATION-PRODUCT-TRIO.md](VALIDATION-PRODUCT-TRIO.md) for full gap analysis

---

## 📖 Additional Resources

### External Documentation
- **SvelteKit 5**: Use Context7 MCP for latest docs
- **Convex**: [docs.convex.dev](https://docs.convex.dev)
- **Bits UI**: [bits-ui.com](https://bits-ui.com)
- **PostHog**: [posthog.com/docs](https://posthog.com/docs)

### Marketing & Strategy
- **Product Vision 2.0**: `/marketing-docs/strategy/product-vision-2.0.md`
- **Community Strategy**: `/marketing-docs/go-to-market/community-strategy.md`
- **Brand Identity**: `/marketing-docs/brand/identity.md`

---

## 🎯 Current Focus

**Phase 2B**: Rich Note-Taking System (In Progress)
- ✅ ProseMirror editor with AI detection
- ✅ Blog export workflow (markdown)
- 🔄 Documentation system (MDX + PARA + TOC)

**Next**: Phase 2A (Tagging Integration)

**See**: [product-vision-and-plan.md](2-areas/product-vision-and-plan.md) for full roadmap

---

## 📈 Documentation Stats

- **48 Patterns** documented with line-number lookup
- **4 Domain areas** (Svelte, Convex, UI, Analytics)
- **PARA organized** for maximum findability
- **AI-optimized** with symptom tables + exact line refs
- **3 Roles supported** (PM, Designer, Engineer)

---

**Questions?** Check [Pattern Index](2-areas/patterns/INDEX) or open a GitHub discussion.

**Ready to build?** Pick your role above and start with the recommended path!


