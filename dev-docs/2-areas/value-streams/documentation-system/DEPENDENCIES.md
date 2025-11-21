# Dependencies: Documentation System

> **Philosophy**: Surface dependencies early. Autonomous teams need to know what's blocking them and what they're blocking.

---

## Blockers (What's Slowing Us Down)

### None Currently ✅

All dependencies are in place:

- ✅ SvelteKit 5 installed and working
- ✅ Design token system complete
- ✅ Component library ready
- ✅ Hosting infrastructure (Vercel/self-hosted)

**Status**: Ready to build

---

## Enablers (What We Have)

### 1. Design Token System ✅

**What**: Semantic tokens in `src/app.css`

**Why It Matters**: Consistent styling, themeable, maintainable

**Example**:

```css
@theme {
	--color-sidebar: #1e1e1e;
	--color-sidebar-primary: #ffffff;
	--spacing-nav-item: 0.75rem;
}
```

**Status**: Complete, documented in `/dev-docs/design-tokens.md`

---

### 2. SvelteKit 5 ✅

**What**: Modern web framework with file-based routing

**Why It Matters**: MDX routes map directly to URLs

**Example**:

```
/src/routes/docs/+page.svelte     → /docs
/src/routes/docs/[slug]/+page.svelte → /docs/architecture
```

**Status**: Installed, working in production

---

### 3. Component Library ✅

**What**: Reusable UI components (Sidebar, Modal, etc.)

**Why It Matters**: Don't rebuild from scratch

**Available**:

- `Sidebar.svelte` - Existing sidebar (can adapt for docs)
- `Modal.svelte` - For Cmd+K search
- `Button.svelte` - Consistent buttons

**Status**: Ready to reuse/adapt

---

### 4. Convex (Real-Time Database) ✅

**What**: Backend for tracking contributor progress

**Why It Matters**: Show "100+ commits" milestone

**Use Case**:

- Track GitHub commits
- Display contributor leaderboard
- Show progress toward 100+ commits

**Status**: Installed, auth working

---

### 5. PostHog (Analytics) ✅

**What**: Privacy-friendly analytics

**Why It Matters**: Track which docs are read, improve popular ones

**Metrics**:

- Page views per doc
- Time on page
- Search queries

**Status**: Installed, working

---

## Dependencies to Add

### 1. mdsvex (MDX for Svelte)

**What**: Preprocessor for MDX files

**Why**: Enables Markdown + Svelte components

**Installation**:

```bash
npm install -D mdsvex
```

**Configuration**:

```javascript
// svelte.config.js
import { mdsvex } from 'mdsvex';

export default {
	preprocess: [mdsvex(), vitePreprocess()],
	extensions: ['.svelte', '.md', '.svx']
};
```

**Status**: ⏳ Pending (first step)

---

### 2. Rehype Plugins (Heading Anchors)

**What**: Auto-generate heading IDs for links

**Why**: Deep linking, table of contents

**Plugins**:

- `rehype-slug` - Adds IDs to headings
- `rehype-autolink-headings` - Adds anchor links

**Installation**:

```bash
npm install -D rehype-slug rehype-autolink-headings
```

**Status**: ⏳ Pending

---

### 3. Shiki (Syntax Highlighting)

**What**: Fast, accurate code highlighting

**Why**: Beautiful code blocks (like VS Code)

**Installation**:

```bash
npm install -D shiki
```

**Configuration**:

```javascript
// mdsvex.config.js
import { getHighlighter } from 'shiki';

export default {
	highlight: {
		highlighter: async (code, lang) => {
			const highlighter = await getHighlighter({ theme: 'nord' });
			return highlighter.codeToHtml(code, { lang });
		}
	}
};
```

**Status**: ⏳ Pending

---

### 4. Fuse.js (Fuzzy Search)

**What**: Client-side fuzzy search

**Why**: Fast Cmd+K search (no server needed)

**Installation**:

```bash
npm install fuse.js
```

**Usage**:

```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(docs, {
	keys: ['title', 'content'],
	threshold: 0.3
});

const results = fuse.search(query);
```

**Status**: ⏳ Pending (Phase 2)

---

## What We're Blocking

### 1. Community Growth

**Who**: Open source contributors

**What**: Clear onboarding docs

**Impact**: Without good docs, contributors can't get started

**Status**: This value stream unblocks community growth

---

### 2. Partner Onboarding (Agency Partner, Client)

**Who**: First paying customers

**What**: Product documentation, API docs

**Impact**: Can't onboard customers without docs

**Status**: This value stream unblocks revenue

---

### 3. AI Development Speed

**Who**: Internal development (Randy + AI)

**What**: Cursor AI needs structured docs to reference

**Impact**: Faster development with AI-navigable docs

**Status**: This value stream unblocks AI-assisted development

---

## External Dependencies

### 1. GitHub API (Contributor Tracking)

**What**: Track commits, PRs, issues

**Why**: Show contributor progress (100+ commits milestone)

**Rate Limits**: 5,000 requests/hour (authenticated)

**Risk**: Low (well within limits)

**Mitigation**: Cache contributor data, update hourly

---

### 2. Vercel/Hosting (Deployment)

**What**: Deploy docs on merge to main

**Why**: Auto-deploy keeps docs current

**Risk**: Low (proven platform)

**Mitigation**: Self-hosted option available

---

## Internal Dependencies

### None

This value stream is **independent**:

- No waiting on other teams
- No shared resources
- No coordination overhead

**This is by design** - autonomous teams ship faster.

---

## Risks & Mitigations

### Risk: MDX Complexity

**Risk**: Contributors find MDX harder than Markdown

**Likelihood**: Medium  
**Impact**: Medium (slows contributions)

**Mitigation**:

- Provide templates
- Clear examples
- AI assistant for MDX authoring

---

### Risk: Build Time

**Risk**: Large docs = slow builds (> 1 minute)

**Likelihood**: Medium (as docs grow)  
**Impact**: Low (annoying, not blocking)

**Mitigation**:

- Incremental builds
- Parallel processing
- Cached syntax highlighting

---

### Risk: Search Index Size

**Risk**: Client-side search index > 1MB

**Likelihood**: Low (with 200+ docs)  
**Impact**: Medium (slow page loads)

**Mitigation**:

- Compress index (gzip)
- Lazy load search (only when opened)
- Server-side search fallback (future)

---

### Risk: Stale Documentation

**Risk**: Docs drift from code reality

**Likelihood**: High (all docs go stale eventually)  
**Impact**: High (breaks trust)

**Mitigation**:

- Docs live with code (same repo)
- PRs require doc updates
- Automated checks (broken links, outdated examples)
- Community reports stale docs (GitHub issues)

---

## Decision Log

### Why Not Use Confluence/Notion?

**Considered**: Confluence, Notion, GitBook

**Rejected Because**:

- Not version controlled (can't track changes)
- Not AI-navigable (Cursor can't reference)
- Not self-hostable (vendor lock-in)
- Not integrated (separate tool to maintain)

**Decision**: Build in-app with MDX

---

### Why Not Use Docusaurus/Nextra?

**Considered**: Docusaurus (React), Nextra (Next.js), VitePress (Vue)

**Rejected Because**:

- Different framework (React/Vue vs. Svelte)
- Separate deployment (not in-app)
- Overkill (too many features we don't need)

**Decision**: Lightweight MDX setup in SvelteKit

---

### Why Not Use a CMS (Sanity, Contentful)?

**Considered**: Headless CMS for content management

**Rejected Because**:

- Extra complexity (another service)
- Not version controlled (Git > CMS)
- Not free (costs scale with users)
- Slower (network requests)

**Decision**: File-based (Git, no CMS)

---

## Timeline (Outcome-Based, No Dates)

### Phase 1: Foundation (Complete) ✅

- ✅ Design tokens
- ✅ SvelteKit setup
- ✅ Existing docs in `/dev-docs`

### Phase 2: MDX Setup (Current) 🔄

- Install mdsvex, rehype, shiki
- Create route structure
- Build components
- Migrate content

**Blocker**: None  
**Estimated Effort**: 1-2 days  
**Risk**: Low

### Phase 3: AI Navigation (Next) ⏳

- `@` reference system
- Cmd+K search
- GitHub integration

**Blocker**: Phase 2 complete  
**Estimated Effort**: 2-3 days  
**Risk**: Low

### Phase 4: Living Docs (Future) ⏳

- Auto-update from code
- Version comparison
- AI summarization

**Blocker**: Phase 3 complete  
**Estimated Effort**: 1-2 weeks  
**Risk**: Medium (AI integration complexity)

---

## Success Criteria

### Phase 2 Success (MDX Setup)

- ✅ `/docs` route works
- ✅ Sidebar navigates docs
- ✅ Design tokens applied
- ✅ Mobile responsive
- ✅ First 5 docs migrated

### Phase 3 Success (AI Navigation)

- ✅ Cursor AI can reference docs with `@`
- ✅ Cmd+K search works
- ✅ Search finds docs in < 100ms
- ✅ All docs migrated

### Phase 4 Success (Living Docs)

- ✅ GitHub shows contributor progress
- ✅ Docs update automatically from code comments
- ✅ AI summarizes long docs
- ✅ 90%+ docs updated in last 30 days

---

## Questions to Answer

### Open Questions

- **Search Strategy**: Client-side (fast, offline) or server-side (smaller bundle)?
  - _Leaning_: Client-side (simpler, faster, offline-capable)
- **Contributor Dashboard**: Convex query or GitHub API?
  - _Leaning_: GitHub API (source of truth), cached in Convex

- **Versioning**: Show "last updated" or full version history?
  - _Leaning_: "Last updated" for now, full history later

---

## References

- [Press Release](../../PRESS-RELEASE-DOCS-FEATURE.md)
- [README](./README.md) - Value stream overview
- [ARCHITECTURE](./ARCHITECTURE.md) - Technical details
- [Team Topologies](https://teamtopologies.com/) - Dependency mapping
- [Continuous Discovery](https://www.producttalk.org/) - Outcome-driven development

---

**Last Updated**: November 8, 2025  
**Next Review**: After Phase 2 complete  
**Contact**: Randy Hereman (Founder)
