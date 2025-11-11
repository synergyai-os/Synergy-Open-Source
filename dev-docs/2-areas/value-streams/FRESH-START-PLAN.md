# Fresh Start Plan: Documentation System

> **If we started from scratch today, here's exactly what we'd do.**

---

## Day 1: Strategic Foundation (2 hours)

### 1. Write Press Release (30 min)

- ✅ Done: [PRESS-RELEASE-DOCS-FEATURE.md](../PRESS-RELEASE-DOCS-FEATURE.md)
- **Output**: Clear customer value, why it matters

### 2. Create Value Stream Structure (15 min)

```bash
mkdir -p dev-docs/value-streams/documentation-system
cd dev-docs/value-streams/documentation-system
touch README.md ARCHITECTURE.md DEPENDENCIES.md
```

### 3. Fill Templates (1 hour)

- ✅ Done: All three files created
- **Use**: [HOW-TO-DOCUMENT.md](./HOW-TO-DOCUMENT.md) templates

### 4. Review & Share (15 min)

- Post in Discord/Slack
- Add to GitHub
- Get feedback from team

---

## Day 2: Technical Setup (3 hours)

### 1. Install Dependencies (10 min)

```bash
npm install --save-dev mdsvex rehype-slug rehype-autolink-headings shiki fuse.js
```

### 2. Configure MDX (20 min)

- ✅ Done: `mdsvex.config.js`
- ✅ Done: `svelte.config.js` updated

### 3. Create Base Components (2 hours)

**File**: `src/lib/components/docs/DocLayout.svelte`

```svelte
<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import TableOfContents from './TableOfContents.svelte';
</script>

<div class="docs-layout">
	<aside class="bg-sidebar text-sidebar-primary">
		<Sidebar />
	</aside>

	<main class="bg-primary text-primary">
		<slot />
	</main>

	<aside class="toc">
		<TableOfContents />
	</aside>
</div>

<style>
	.docs-layout {
		display: grid;
		grid-template-columns: 240px 1fr 200px;
		gap: var(--spacing-content);
	}

	@media (max-width: 768px) {
		.docs-layout {
			grid-template-columns: 1fr;
		}
		.toc {
			display: none;
		}
	}
</style>
```

**File**: `src/lib/components/docs/Sidebar.svelte`

```svelte
<script lang="ts">
	const sections = [
		{
			title: 'Getting Started',
			items: [
				{ title: 'Quick Start', href: '/docs/quick-start' },
				{ title: 'Installation', href: '/docs/installation' }
			]
		},
		{
			title: 'Value Streams',
			items: [{ title: 'Documentation System', href: '/value-streams/documentation-system' }]
		}
	];
</script>

<nav class="px-nav-item py-nav-item">
	{#each sections as section}
		<div class="section">
			<h3 class="text-sidebar-secondary">{section.title}</h3>
			{#each section.items as item}
				<a href={item.href} class="nav-link">
					{item.title}
				</a>
			{/each}
		</div>
	{/each}
</nav>
```

**File**: `src/lib/components/docs/TableOfContents.svelte`

```svelte
<script lang="ts">
	// Auto-generated from MDX headings
	export let headings: { id: string; text: string; level: number }[] = [];
</script>

<nav class="toc">
	<h4>On This Page</h4>
	{#each headings as heading}
		<a href="#{heading.id}" class="toc-link level-{heading.level}">
			{heading.text}
		</a>
	{/each}
</nav>
```

### 4. Test Setup (30 min)

```bash
npm run dev
# Visit /docs in your browser (default: http://localhost:5173/docs)
```

---

## Day 3: Content Migration (4 hours)

### 1. Create Route Structure (30 min)

```bash
mkdir -p src/routes/docs
mkdir -p src/routes/community
mkdir -p src/routes/value-streams/documentation-system
```

### 2. Migrate Dev Docs (2 hours)

**File**: `src/routes/docs/+page.md`

```markdown
---
layout: docs
title: Developer Documentation
---

# Welcome to SynergyOS Docs

Quick links:

- [Quick Start](/docs/quick-start)
- [Architecture](/docs/architecture)
- [Patterns](/docs/patterns)
```

**Convert existing docs**:

```bash
# Copy and convert to MDX
cp dev-docs/QUICK-START.md src/routes/docs/quick-start/+page.md
cp dev-docs/architecture.md src/routes/docs/architecture/+page.md
```

### 3. Migrate Community Docs (1 hour)

```bash
cp marketing-docs/strategy/product-vision-2.0.md src/routes/community/vision/+page.md
cp marketing-docs/audience/target-personas.md src/routes/community/personas/+page.md
```

### 4. Test Navigation (30 min)

- Click through all pages
- Check mobile responsiveness
- Verify design tokens applied

---

## Day 4: AI Navigation (2 hours)

### 1. Add Frontmatter (30 min)

**Every MDX file needs**:

```markdown
---
title: 'Page Title'
description: 'Page description'
reference: '@docs/quick-start' # For Cursor AI
---
```

### 2. Create Reference Index (1 hour)

**File**: `src/lib/config/docs-references.ts`

```typescript
export const references = {
	'@docs/quick-start': '/docs/quick-start',
	'@docs/architecture': '/docs/architecture',
	'@value-streams/documentation-system': '/value-streams/documentation-system'
};
```

### 3. Test Cursor Integration (30 min)

- Open Cursor
- Type `@docs/quick-start` in chat
- Verify AI finds and reads the doc

---

## Day 5: Search & Polish (3 hours)

### 1. Add Cmd+K Search (2 hours)

**File**: `src/lib/components/docs/SearchModal.svelte`

```svelte
<script lang="ts">
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';

	let isOpen = $state(false);
	let query = $state('');
	let results = $state([]);

	// Index all docs
	const docs: Doc[] = []; // Load from build
	const fuse = new Fuse(docs, {
		keys: ['title', 'content'],
		threshold: 0.3
	});

	$effect(() => {
		if (query) {
			results = fuse.search(query);
		}
	});

	// Keyboard shortcut
	onMount(() => {
		window.addEventListener('keydown', (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				isOpen = !isOpen;
			}
		});
	});
</script>

{#if isOpen}
	<div class="modal">
		<input bind:value={query} placeholder="Search docs..." />
		{#each results as result}
			<a href={result.item.href}>{result.item.title}</a>
		{/each}
	</div>
{/if}
```

### 2. Add Meta Tags (30 min)

**File**: `src/routes/docs/+layout.svelte`

```svelte
<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.data.title} | SynergyOS Docs</title>
	<meta name="description" content={$page.data.description} />
	<meta property="og:title" content={$page.data.title} />
</svelte:head>

<slot />
```

### 3. Mobile Testing (30 min)

- Test on mobile
- Fix responsive issues
- Verify touch navigation works

---

## Day 6: Launch (1 hour)

### 1. Final Checks

- ✅ All links work
- ✅ Mobile responsive
- ✅ Design tokens applied
- ✅ Search works
- ✅ AI can reference docs

### 2. Deploy

```bash
git add .
git commit -m "feat: add documentation system"
git push
```

### 3. Announce

- Post in Discord
- Tweet about it
- Update README

---

## Total Time: ~15 hours (2 work days)

### Day 1-2: Foundation & Setup (5 hours)

### Day 3-4: Content & AI (6 hours)

### Day 5-6: Polish & Launch (4 hours)

---

## Success Checklist

- ✅ Value stream documented (README, ARCHITECTURE, DEPENDENCIES)
- ✅ MDX setup working
- ✅ Routes created (`/docs`, `/community`, `/value-streams`)
- ✅ Components built (DocLayout, Sidebar, TOC)
- ✅ Content migrated (dev-docs, marketing-docs)
- ✅ AI navigation working (`@` references)
- ✅ Search working (Cmd+K)
- ✅ Mobile responsive
- ✅ Design tokens applied
- ✅ Deployed

---

## What We Have Now

✅ **Strategic docs**: Press release, value stream structure  
✅ **Technical setup**: MDX config, SvelteKit config  
⏳ **Need to build**: Routes, components, content migration

**Next Step**: Run `npm install` then start Day 2, Step 3 (Create Base Components)

---

## Quick Commands

```bash
# Install deps
npm install --save-dev mdsvex rehype-slug rehype-autolink-headings shiki fuse.js

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Ready to start?** Pick up at Day 2, Step 3 and follow this plan sequentially.
