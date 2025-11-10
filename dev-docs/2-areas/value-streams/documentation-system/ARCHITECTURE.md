# Architecture: Documentation System

> **Design Principle**: Build for Human + AI collaboration. Documentation should be as easy to navigate with `@` references as it is to browse with Cmd+K.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        SynergyOS App                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  /community  │  │    /docs     │  │/value-streams│      │
│  │  Marketing   │  │  Developer   │  │   Living     │      │
│  │    Docs      │  │    Docs      │  │    Docs      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │   DocLayout     │                        │
│                  │  (Shared UI)    │                        │
│                  └────────┬────────┘                        │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐              │
│         │                 │                 │              │
│    ┌────▼─────┐    ┌─────▼──────┐    ┌────▼──────┐        │
│    │ Sidebar  │    │   Content  │    │    TOC    │        │
│    │          │    │   (MDX)    │    │           │        │
│    └──────────┘    └────────────┘    └───────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────▼────┐          ┌────▼─────┐        ┌────▼─────┐
    │ Cursor  │          │  Human   │        │ GitHub   │
    │   AI    │          │  Search  │        │   PRs    │
    │   (@)   │          │ (Cmd+K)  │        │          │
    └─────────┘          └──────────┘        └──────────┘
```

---

## Key Architectural Decisions

### 1. MDX (Not Plain Markdown)

**Decision**: Use MDX via `mdsvex` for content authoring

**Rationale**:

- **Component embedding**: Live demos, diagrams, interactive elements
- **Type-safe**: TypeScript support for props
- **Svelte-native**: Works seamlessly with SvelteKit
- **Portable**: Can export to plain Markdown if needed

**Trade-offs**:

- ✅ Rich content (components, charts, interactive)
- ✅ Type-safe authoring
- ❌ Slightly more complex than Markdown
- ❌ Requires build step

---

### 2. File-Based Routing (Not CMS)

**Decision**: Use SvelteKit's file-based routing for docs

**Rationale**:

- **Version controlled**: All docs in Git
- **Lives with code**: Can't drift from implementation
- **No sync issues**: No separate CMS to maintain
- **Offline-capable**: Works without internet
- **Self-hostable**: Everything in one repo

**Trade-offs**:

- ✅ Version control (Git)
- ✅ No CMS complexity
- ✅ Lives with code
- ❌ Non-developers need to learn Git (acceptable for open source)

---

### 3. Design Tokens (Not Tailwind Classes)

**Decision**: Use semantic design tokens from `src/app.css`

**Rationale**:

- **Consistency**: One source of truth
- **Themeable**: Light/dark mode automatic
- **Maintainable**: Change once, update everywhere
- **Professional**: No magic numbers

**Implementation**:

```svelte
<!-- ❌ Hardcoded -->
<aside class="bg-gray-900 text-white px-4 py-2">

<!-- ✅ Design Tokens -->
<aside class="bg-sidebar text-sidebar-primary px-nav-item py-nav-item">
```

**Trade-offs**:

- ✅ Consistency across app
- ✅ Easy theming
- ✅ No hardcoded values
- ❌ Requires learning token system (one-time cost)

---

### 4. Value Stream Organization (Not Feature Folders)

**Decision**: Organize docs by value streams (outcomes), not features

**Rationale**:

- **Outcome-focused**: Clear user value
- **Team autonomy**: Each stream owned by independent team
- **Dependency-aware**: Surface blockers early
- **Scalable**: Add streams without coordination

**Structure**:

```
/value-streams/
  /documentation-system/      ← This stream
    README.md                  ← Outcome, team, success signals
    ARCHITECTURE.md            ← This file
    DEPENDENCIES.md            ← Blockers, enablers

  /auth-multi-tenancy/         ← Another stream
    README.md
    ARCHITECTURE.md
    DEPENDENCIES.md
```

**Trade-offs**:

- ✅ Clear ownership
- ✅ Outcome-driven
- ✅ No coordination overhead
- ❌ Requires mindset shift from "projects" to "outcomes"

---

## Component Architecture

### DocLayout Component

**Purpose**: Shared layout for all documentation pages

**Structure**:

```svelte
<DocLayout>
	<Sidebar slot="sidebar" />
	<slot />
	<!-- MDX content -->
	<TableOfContents slot="toc" />
</DocLayout>
```

**Responsibilities**:

- Responsive layout (mobile: stacked, desktop: 3-column)
- Design tokens for consistency
- Dark mode support
- Keyboard navigation (Cmd+K)

---

### Sidebar Component

**Purpose**: Navigation tree for documentation sections

**Features**:

- Auto-generated from folder structure
- Active link highlighting
- Collapsible sections
- Search integration (Cmd+K)

**Design Tokens**:

```css
bg-sidebar              /* Background */
text-sidebar-primary    /* Active link */
text-sidebar-secondary  /* Inactive link */
px-nav-item            /* Horizontal spacing */
py-nav-item            /* Vertical spacing */
gap-icon               /* Icon spacing */
```

---

### TableOfContents Component

**Purpose**: In-page navigation for long docs

**Features**:

- Auto-generated from headings (h2, h3)
- Scroll-spy (highlights current section)
- Smooth scrolling
- Mobile: hidden, desktop: visible

**Implementation**:

```typescript
// Parse headings from MDX
const headings = parseHeadings(content);

// Generate TOC links
{#each headings as { id, text, level }}
  <a href="#{id}" class="toc-link" class:active={current === id}>
    {text}
  </a>
{/each}
```

---

### SearchModal Component

**Purpose**: Fast navigation via Cmd+K

**Features**:

- Fuzzy search across all docs
- Keyboard shortcuts (Cmd+K, /, Esc)
- Recent searches
- Jump to heading within doc

**Tech**:

- Fuse.js (fuzzy search)
- Index built at build time
- Client-side search (fast, offline)

---

## Data Flow

### 1. Authoring (Developer)

```
1. Developer writes MDX in /value-streams/stream-name/README.md
2. Git commit/push
3. CI/CD builds site
4. Docs live at /value-streams/stream-name
```

### 2. Reading (Human)

```
1. User visits /docs
2. Clicks sidebar link
3. SvelteKit SSR renders MDX → HTML
4. Client hydrates (interactive)
5. User can search (Cmd+K) or navigate (sidebar)
```

### 3. AI Navigation (Cursor)

```
1. Developer types @value-streams/documentation-system
2. Cursor AI finds README.md in that folder
3. AI reads content, provides context
4. Developer gets answer without leaving editor
```

---

## Integration Points

### Cursor AI Integration

**How It Works**:

- Cursor scans workspace for markdown files
- Developer references with `@filename` or `@folder/filename`
- AI loads content, uses as context

**Best Practices**:

- Clear file names (`README.md`, `ARCHITECTURE.md`, `DEPENDENCIES.md`)
- Consistent structure (every value stream has same files)
- Rich metadata (frontmatter with title, description)

**Example**:

```typescript
// In Cursor chat
"@value-streams/documentation-system what's the architecture?";

// Cursor loads ARCHITECTURE.md, provides answer
```

---

### GitHub Integration

**Features**:

- PRs update docs automatically
- Contributor tracking (100+ commits milestone)
- Issue templates for doc improvements
- Auto-deploy on merge to main

**Workflow**:

```
1. Contributor forks repo
2. Edits MDX file
3. Opens PR
4. Review + merge
5. Auto-deploy to production
```

---

### PostHog Analytics (Privacy-Friendly)

**What We Track**:

- Page views (which docs are read)
- Search queries (what users look for)
- Time on page (doc quality signal)

**What We DON'T Track**:

- Personal information
- IP addresses (anonymized)
- Session recordings on docs (privacy-first)

---

## Performance Considerations

### Build Time

**Challenge**: Large docs = slow builds

**Solution**:

- Incremental builds (only changed files)
- Parallel MDX processing
- Cached syntax highlighting (Shiki)

**Target**: < 30s full build, < 5s incremental

---

### Runtime Performance

**Challenge**: Large docs = slow page loads

**Solution**:

- SSR (server-side rendering)
- Code splitting (lazy load components)
- Image optimization (responsive images)
- Prefetch on hover (instant navigation)

**Target**:

- Time to First Byte (TTFB): < 200ms
- Largest Contentful Paint (LCP): < 1s
- First Input Delay (FID): < 100ms

---

### Search Performance

**Challenge**: Client-side search = large index

**Solution**:

- Compressed index (gzip)
- Web Worker (non-blocking)
- Debounced search (wait for typing pause)

**Target**: Search results in < 100ms

---

## Security Considerations

### Content Injection

**Risk**: MDX = JavaScript execution

**Mitigation**:

- All content in Git (version controlled)
- PR reviews required (no direct commits)
- No user-generated MDX (contributors only)

---

### XSS (Cross-Site Scripting)

**Risk**: Malicious links or scripts in docs

**Mitigation**:

- MDX sanitization (strip dangerous tags)
- CSP headers (Content Security Policy)
- Trusted contributors only

---

## Scalability

### Content Scale

**Current**: ~20 docs  
**Target**: 200+ docs  
**Plan**:

- Folder structure scales infinitely
- Sidebar uses virtual scrolling (large trees)
- Search index compressed (< 500KB)

---

### Contributor Scale

**Current**: 1-5 contributors  
**Target**: 100+ contributors  
**Plan**:

- Clear contribution guidelines
- Automated PR checks (linting, formatting)
- Maintainer team (approve PRs)

---

## Future Enhancements

### Phase 1 (Current)

- ✅ MDX setup
- ✅ Basic routing
- ✅ Design token styling

### Phase 2 (Next 3 months)

- 🔄 Cmd+K search
- 🔄 AI navigation (`@` references)
- 🔄 Auto-generated TOC

### Phase 3 (6+ months)

- ⏳ Version comparison (track doc changes)
- ⏳ AI summarization (auto-generate summaries)
- ⏳ Contributor dashboard (track 100+ commits)
- ⏳ Multi-language support (i18n)

---

## References

- [mdsvex](https://mdsvex.pngwn.io/) - MDX for Svelte
- [SvelteKit Routing](https://kit.svelte.dev/docs/routing) - File-based routes
- [Design Tokens](../../design-tokens.md) - Our token system
- [Fumadocs](https://fumadocs.dev/) - UX inspiration
- [Team Topologies](https://teamtopologies.com/) - Value stream thinking

---

**Last Updated**: November 8, 2025  
**Next Review**: When we add AI summarization
