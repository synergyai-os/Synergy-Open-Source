# Navigation Philosophy

> **Core Belief**: Navigation should be invisible until needed, then delightful when used.

---

## 🎯 Goal

Create a navigation system that:

1. **Reduces cognitive load** (fewer decisions = faster action)
2. **Enables discovery** (beautiful hub pages, not boring lists)
3. **Supports all user types** (newcomers, regulars, power users)
4. **Feels delightful** (fast, smooth, purposeful)

---

## 🧠 UX Psychology Foundations

### Miller's Law: 7±2 Items in Working Memory

**Problem**: Showing 19+ nav items overwhelms users.  
**Solution**: Limit top-level navigation to **10 items maximum**.  
**Research**: George Miller, "The Magical Number Seven, Plus or Minus Two" (1956)

### Hick's Law: Decision Time Increases with Choices

**Problem**: More options = slower decisions = frustrated users.  
**Solution**: Progressive disclosure - show primary actions first, secondary actions on demand.  
**Formula**: `T = b × log₂(n + 1)` where T = reaction time, n = number of choices

### Progressive Disclosure

**Problem**: Users don't need to see everything at once.  
**Solution**: Hub pages reveal related content when users are ready to explore.  
**Example**: Instead of 19 nav items, show 10 + beautiful hub pages for discovery.

### Fitts's Law: Bigger Targets = Easier Clicks

**Problem**: Many small nav items are hard to click (especially on mobile).  
**Solution**: Fewer items = bigger touch targets = easier interaction.  
**Formula**: `T = a + b × log₂(D/W + 1)` where D = distance, W = width

### Doherty Threshold: <400ms Feels Instantaneous

**Problem**: Slow interactions feel sluggish.  
**Solution**: All animations 200-300ms, interactions feel snappy.  
**Research**: IBM 1982 - productivity soars when computer responds in <400ms

---

## 🏗️ Architecture: Hub Pages + Command Palette

### Three-Tier Navigation System

```
┌─────────────────────────────────────────────────────────┐
│ Tier 1: Top-Level Nav (10 items max)                   │
│ ─────────────────────────────────────────────────────── │
│ • Quick Start                                           │
│ • Patterns                                              │
│ • All Docs (hub page)                                   │
│ • Design System                                         │
│ • Metrics                                               │
│ • Vision                                                │
│ • Contribute                                            │
│ • Search (Cmd+K)                                        │
│ • [Theme Toggle]                                        │
│ • [GitHub]                                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Tier 2: Hub Pages (visual grids, scannable)            │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│  📚 All Docs Hub                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 🔍 Pat's │ │ 🎨 Design│ │ 📊 Metrics│ │ 🚀 Vision│ │
│  │ Solved   │ │ System   │ │ Public   │ │ What we │ │
│  │ problems │ │ Tokens   │ │ OKRs     │ │ build   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                         │
│  [Visual grid continues with ALL pages...]             │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Tier 3: Command Palette (power users)                  │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│  🔍 Search docs... (Cmd+K)                              │
│  ───────────────────────────────────────────────────   │
│  > design tok                                           │
│                                                         │
│  📖 Design Tokens                     2-areas/          │
│  🎨 Component Architecture            2-areas/          │
│  🔍 Pattern Index                     2-areas/patterns/ │
│  📊 Metrics Dashboard                 2-areas/          │
│                                                         │
│  [Fuzzy search through ALL pages]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📐 Design Principles (Applied to Navigation)

### 1. Clarity Over Decoration

**How**: Clean, purposeful nav items. No decoration for decoration's sake.

- ✅ Clear labels ("Quick Start", not "Get Started Quickly With Our System")
- ✅ Meaningful icons (📚 = docs, 🔍 = search)
- ❌ No excessive hover effects or animations

### 2. Accessible by Default

**How**: Keyboard-first, screen reader friendly, motion-aware.

- ✅ Tab navigation, Escape to close
- ✅ ARIA labels and roles
- ✅ Respect `prefers-reduced-motion`
- ✅ 44x44px touch targets on mobile

### 3. Consistent Over Novel

**How**: Same patterns across breakpoints and contexts.

- ✅ Desktop dropdowns use same structure as mobile menu
- ✅ Grouped navigation consistent everywhere
- ✅ Predictable interactions (no surprises)

### 4. Performance is Design

**How**: Fast animations, lazy-loaded menus, instant feedback.

- ✅ 200ms dropdowns, 250ms mobile menu
- ✅ Menus only render when open (conditional rendering)
- ✅ CSS transitions over JavaScript

### 5. Mobile-First, Desktop-Enhanced

**How**: Mobile hamburger menu, desktop gets grouped dropdowns.

- ✅ Progressive disclosure on mobile (collapsed by default)
- ✅ Direct access on desktop (hover to see groups)
- ✅ Touch-friendly spacing and targets

---

## 🎨 Component Patterns

### Top-Level Navigation Items (10 max)

**Decision Framework**: "Should this be in the top nav?"

- ✅ **YES** if: High usage (>50% of users need it) OR critical task (onboarding, search)
- ❌ **NO** if: Niche audience OR discoverable via hub page OR infrequent use

**Examples**:

- ✅ Quick Start - Critical onboarding task
- ✅ Patterns - High usage (engineers debug daily)
- ✅ Search (Cmd+K) - Universal need
- ❌ Composables Analysis - Niche, lives in Architecture hub
- ❌ Multi-Tenancy Migration - One-time task, lives in Resources hub

### Hub Pages (Beautiful Discovery)

**Purpose**: Turn boring lists into delightful visual grids.

**Structure**:

```svelte
<section class="hub-page">
  <h1>📚 Category Name</h1>
  <p class="hub-description">What you'll find here</p>

  <SearchBar />

  <div class="hub-grid">
    <HubCard
      icon="🔍"
      title="Page Name"
      description="What this page helps you do"
      href="/path"
      badge="Most Used" {/* optional */}
    />
    <!-- More cards... -->
  </div>
</section>
```

**Visual Design**:

- **Grid**: 3 columns desktop, 2 tablet, 1 mobile
- **Cards**: Icon, title, description, optional badge
- **Hover**: Subtle lift, border color change
- **Animations**: Staggered entrance, 200-300ms

### Command Palette (Power Users)

**Trigger**: Cmd+K (Mac) / Ctrl+K (Windows)

**Features**:

- Fuzzy search (typo-tolerant)
- Keyboard navigation (↑↓ arrows, Enter to select)
- Recent pages (last 5 visited)
- Contextual actions (e.g., "Create new pattern")

**Why This Matters**:

- Power users skip nav entirely
- Faster than clicking through hub pages
- Accessible from anywhere in app

---

## 🚀 User Journeys

### Newcomer (First Visit)

**Goal**: Get started quickly without overwhelm.

**Journey**:

1. Lands on homepage → sees clear "⚡ Quick Start" in nav
2. Clicks Quick Start → guided onboarding (5 minutes)
3. Explores "📚 All Docs" hub page → discovers related content

**Success**: Onboarded without cognitive overload.

---

### Regular User (Engineer)

**Goal**: Find patterns to solve a bug quickly.

**Journey**:

1. Clicks "🔍 Patterns" in nav → Pattern Index
2. Scans symptom table → jumps to solution (< 2 min)
3. Fixes bug → back to work

**Success**: No friction, fast task completion.

---

### Power User (Daily User)

**Goal**: Jump directly to any page without clicking.

**Journey**:

1. Presses Cmd+K anywhere in app
2. Types "design tok" → sees "Design Tokens" result
3. Hits Enter → lands on page

**Success**: Bypasses nav entirely, instant access.

---

### Explorer (Designer)

**Goal**: Browse design-related resources.

**Journey**:

1. Clicks "📚 All Docs" in nav → hub page
2. Sees visual grid of cards → clicks "🎨 Design System"
3. Lands on Design System hub → browses Tokens, Components, Patterns

**Success**: Discovers related content serendipitously.

---

## 📊 Success Metrics

### Leading Indicators (Early Signals)

- ✅ **Navigation time**: < 5 seconds to find any page
- ✅ **Decision time**: < 2 seconds to choose nav item
- ✅ **Hub page engagement**: >30% of users explore hub pages
- ✅ **Cmd+K adoption**: >20% of power users use search

### Lagging Indicators (Outcome Signals)

- ✅ **Task completion**: >90% find what they're looking for
- ✅ **Return rate**: Users come back (not bouncing)
- ✅ **Satisfaction**: "Easy to navigate" testimonials

### Monitoring

- **PostHog**: Track nav clicks, hub page views, search usage
- **Session Replays**: Watch users navigate, identify friction
- **Feedback**: Direct user interviews

---

## ⚠️ Anti-Patterns

### ❌ Don't

1. **List All Pages in Nav**
   - Violates Miller's Law (>7 items)
   - Slows decision-making
   - Feels overwhelming

2. **Hide Critical Features in Menus**
   - Don't bury "Quick Start" in a dropdown
   - Primary tasks should be directly accessible

3. **Inconsistent Grouping**
   - Don't change nav structure per page
   - Users learn once, apply everywhere

4. **Slow Animations**
   - > 400ms feels sluggish
   - Users get frustrated

5. **Mystery Meat Navigation**
   - Icons without labels confuse users
   - Always pair icon + text

### ✅ Do

1. **Limit Top-Level to 10 Items**
   - Faster decisions, less cognitive load
   - Use hub pages for discovery

2. **Make Primary Tasks Obvious**
   - "Quick Start", "Patterns", "Search" directly visible
   - No hunting for common actions

3. **Provide Multiple Paths**
   - Nav bar for browsing
   - Hub pages for discovery
   - Cmd+K for direct access

4. **Test with Real Users**
   - Watch them navigate
   - Measure time-to-task
   - Iterate based on friction points

5. **Measure Everything**
   - Track which nav items are used
   - Kill unused items
   - Prioritize high-usage paths

---

## 🔄 Iteration Strategy

### Phase 1: Reduce to 10 Items (Current)

- Audit all pages
- Categorize by usage and importance
- Move low-usage pages to hub pages
- Launch reduced nav

**Success Signal**: Users complete tasks faster (measure in PostHog)

### Phase 2: Build Hub Pages

- Create visual grids for each category
- Add search bars to hub pages
- Staggered entrance animations
- Test with 5 users

**Success Signal**: >30% explore hub pages, positive feedback

### Phase 3: Add Command Palette

- Implement Cmd+K search
- Fuzzy search through all pages
- Keyboard navigation
- Track adoption

**Success Signal**: >20% of power users use Cmd+K

### Phase 4: Continuous Optimization

- Monitor PostHog analytics
- A/B test nav variations
- User interviews every quarter
- Kill low-usage items

---

## 🎓 Further Reading

### UX Psychology

- **Miller's Law**: [Magical Number Seven](https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two)
- **Hick's Law**: [Choice & Reaction Time](https://lawsofux.com/hicks-law/)
- **Progressive Disclosure**: [Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)

### Design Inspiration

- **Stripe Docs**: Minimal nav + Cmd+K search
- **Vercel**: Hub pages for discovery
- **GitHub**: Clear categories, fast search
- **Tailwind CSS**: Clean nav + excellent search

### Implementation Guides

- **[Design Principles](design-principles.md)** - Visual philosophy
- **[Product Principles](product-principles.md)** - Decision framework
- **[UI Patterns](patterns/ui-patterns.md)** - Solved design problems

---

## 📝 Contributing

Found a nav friction point? Propose an improvement:

1. Document the problem (what's confusing?)
2. Test with 3 users (validate it's real)
3. Propose solution (backed by UX psychology)
4. A/B test (measure impact)
5. Update this doc (share learnings)

---

**Last Updated**: November 9, 2025  
**Status**: 🟢 Active  
**Owner**: Randy (Founder)
