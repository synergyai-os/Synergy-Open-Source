<!-- 18fba564-2e7d-46d1-a191-da77ae6d14b7 95f488b3-f91c-498b-afec-f28db0033ee2 -->

# Documentation System Implementation Plan

## Structure Overview

```
/dev-docs/
  README.md                    ← Comprehensive entry point

  /1-projects/                 ← Time-bound initiatives (currently empty)

  /2-areas/                    ← Ongoing responsibilities (about us)
    /value-streams/            ← Active outcomes (moved from root)
    /patterns/                 ← Architecture patterns (moved from root)
    architecture.md
    design-tokens.md
    composables-analysis.md
    ...

  /3-resources/                ← External reference material
    (third-party guides, checklists not created by us)

  /4-archive/                  ← Deprecated/completed
    patterns-and-lessons-LEGACY.md
    ...
```

## Implementation: Vertical Slices

### Slice 1: Foundation Setup (2 hours)

**Goal**: MDX working with one test file

**Steps**:

1. Install mdsvex and dependencies
2. Configure `svelte.config.js` for MDX
3. Create `mdsvex.config.js` (syntax highlighting, rehype plugins)
4. Test route: `/dev-docs/test` → renders static `test.md` as MDX
5. **Integration test workflow**:
   - Press C → create note → save to inbox (Convex)
   - View note in inbox → edit note
   - Export note as MDX file (button in note editor)
   - View exported MDX at `/dev-docs/notes/[slug]`

6. Verify: Code blocks highlighted, headings linkable, components render

**Files**:

- `package.json` (add deps)
- `svelte.config.js` (add mdsvex preprocessor)
- `mdsvex.config.js` (new)
- `src/routes/dev-docs/test/+page.md` (static test)
- `src/routes/dev-docs/notes/[slug]/+page.md` (dynamic MDX from notes)
- `convex/notes.ts` (add `exportToMDX` mutation)

**Success**: Press C → create note → export → view as rendered MDX with syntax highlighting

**MDX Analysis**:

**Pros**: Interactive components, type-safe, reusable patterns, rich content

**Cons**: Security risk (JS execution), slower build, steeper learning curve, harder to migrate, search complexity

**Decision**: Use MDX - benefits outweigh costs for internal team docs with trusted authors

---

### Slice 2: PARA Migration (2 hours)

**Goal**: All existing docs organized in PARA structure

**Steps**:

1. Create PARA folders (`1-projects/`, `2-areas/`, `3-resources/`, `4-archive/`)
2. Move `value-streams/` → `2-areas/value-streams/`
3. Move `patterns/` → `2-areas/patterns/`
4. Move ongoing docs to `2-areas/` (architecture, design-tokens, etc.)
5. Move reference docs to `3-resources/` (production-checklist, testing-strategy)
6. Move legacy to `4-archive/`
7. Create comprehensive `README.md` (vision + quick-start + PARA navigation)
8. Update all internal links in moved files

**Files Affected**: 50+ markdown files

**Success**: All docs in correct PARA category, no broken links, README.md is entry point

---

### Slice 3: MDX Routes & Layout (3 hours)

**Goal**: SvelteKit routes render all /dev-docs/\* as web pages with nav

**Steps**:

1. Create route structure: `src/routes/dev-docs/[...path]/+page.ts`
2. Build `DocLayout.svelte` (3-column: sidebar, content, TOC)
3. Build `DocSidebar.svelte` (PARA sections, auto-generated from file structure)
4. Build `DocContent.svelte` (MDX wrapper with design tokens)
5. Use design tokens (bg-sidebar, text-primary, px-content, etc.)
6. Test: All existing docs accessible at `/dev-docs/*` URLs

**Key Components**:

- `src/lib/components/docs/DocLayout.svelte`
- `src/lib/components/docs/DocSidebar.svelte`
- `src/lib/components/docs/DocContent.svelte`
- `src/routes/dev-docs/[...path]/+page.ts` (dynamic route loader)

**Success**: Visit `/dev-docs/2-areas/architecture`, see full layout with working nav

---

### Slice 4: Table of Contents (1.5 hours)

**Goal**: Auto-generated TOC from MDX headings

**Steps**:

1. Extract headings from MDX (rehype-slug already installed)
2. Build `TableOfContents.svelte` component
3. Active heading highlight on scroll
4. Smooth scroll to heading on click
5. Mobile: Hide TOC, show as collapsible menu

**Key Files**:

- `src/lib/components/docs/TableOfContents.svelte`
- `mdsvex.config.js` (rehype-slug, rehype-autolink-headings)

**Success**: Click TOC link → smooth scroll to heading, active state updates

---

### Slice 5: Search (Cmd+K) (3 hours)

**Goal**: Fuzzy search across all docs, keyboard-driven

**Steps**:

1. Build search index at build time (extract all headings + content)
2. Use `fuse.js` for fuzzy search
3. Build `DocSearch.svelte` modal (Cmd+K to open)
4. Keyboard navigation (arrow keys, Enter to navigate)
5. Search results show: file path, heading, content snippet
6. Design tokens for modal styling

**Key Files**:

- `src/lib/components/docs/DocSearch.svelte`
- `src/lib/utils/buildSearchIndex.ts` (build-time script)
- `src/lib/stores/docSearch.svelte.ts` (search state)

**Success**: Press Cmd+K, type "design tokens", see results, press Enter → navigate to page

---

### Slice 6: Breadcrumbs & Meta (1 hour)

**Goal**: Navigation breadcrumbs, page metadata

**Steps**:

1. Build `Breadcrumbs.svelte` component
2. Extract metadata from MDX frontmatter (title, description, updated)
3. Display breadcrumbs: Home → Areas → Patterns → Index
4. Mobile: Compact breadcrumbs

**Key Files**:

- `src/lib/components/docs/Breadcrumbs.svelte`
- Update `DocLayout.svelte` to show breadcrumbs

**Success**: Every page shows breadcrumbs, click to navigate up hierarchy

---

### Slice 7: Mobile & Responsive (2 hours)

**Goal**: Perfect mobile experience

**Steps**:

1. Sidebar: Collapsible on mobile (hamburger menu)
2. TOC: Hidden on mobile, accessible via button
3. Search: Full-screen modal on mobile
4. Touch-friendly tap targets (44px minimum)
5. Test on iOS (Capacitor)

**Key Files**:

- Update all doc components with responsive design tokens
- Mobile breakpoints in `app.css`

**Success**: Test on iPhone, all features work, no horizontal scroll

---

### Slice 8: Polish & Sync (2 hours)

**Goal**: Production-ready, integrated with settings

**Steps**:

1. Add "Edit on GitHub" links
2. Settings toggle: Enable/disable docs module
3. Analytics: Track page views (PostHog)
4. Performance: Lazy load TOC, optimize search index
5. Documentation: Update README.md with usage instructions
6. Test: End-to-end walkthrough

**Key Files**:

- `src/routes/settings/+page.svelte` (add docs toggle)
- `convex/schema.ts` (add `docsEnabled` to userSettings)
- README.md (usage instructions)

**Success**: Settings toggle works, analytics tracking, fast load times

---

## Total Estimated Time: ~16 hours (2 work days)

## Key Decisions

**1. Entry Point**: `/dev-docs/README.md` (not `start.md` - standard convention)

**2. PARA Structure**:

- Projects: Time-bound initiatives (currently empty)
- Areas: Ongoing responsibilities (value-streams, patterns, architecture)
- Resources: External reference material
- Archive: Deprecated/completed

**3. Design Tokens**: All components use semantic tokens (bg-sidebar, text-primary, etc.)

**4. MDX vs Markdown**: MDX allows embedded Svelte components for interactive docs

**5. Search**: Build-time index (fast, no API calls), fuzzy search with fuse.js

**6. Mobile-First**: All features responsive, tested on Capacitor iOS

---

## Dependencies

- mdsvex (MDX for Svelte)
- rehype-slug (heading IDs)
- rehype-autolink-headings (clickable headings)
- shiki (syntax highlighting)
- fuse.js (fuzzy search)

---

## Success Criteria

- ✅ All docs accessible at `/dev-docs/*` URLs
- ✅ Cmd+K search works, finds content in <200ms
- ✅ Mobile responsive, tested on iOS
- ✅ Design tokens throughout (no hardcoded values)
- ✅ Cursor AI can reference with `@dev-docs/path`
- ✅ Settings toggle to enable/disable module
