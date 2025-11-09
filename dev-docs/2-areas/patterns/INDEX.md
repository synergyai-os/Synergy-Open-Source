# Pattern Index - Fast Lookup

> **For AI**: Load this file first. It points to exact line numbers in domain files. Load domain file only when needed.

---

## 🔴 CRITICAL Patterns (Fix Immediately)

| Symptom | Solution | Details |
|---------|----------|---------|
| State not updating in UI | Use `$state({})` + getters | [svelte-reactivity.md#L10](svelte-reactivity.md#L10) |
| `undefined is not a valid Convex value` | Strip undefined from payloads | [convex-integration.md#L10](convex-integration.md#L10) |
| `Only actions can be defined in Node.js` | Separate "use node" files | [convex-integration.md#L50](convex-integration.md#L50) |
| Composable receives stale values | Pass functions `() => value` | [svelte-reactivity.md#L80](svelte-reactivity.md#L80) |
| Component shows stale/old data | Key on data, not ID | [svelte-reactivity.md#L140](svelte-reactivity.md#L140) |
| `.ts` file: "Cannot assign to constant" | Rename to `.svelte.ts` | [svelte-reactivity.md#L180](svelte-reactivity.md#L180) |
| 500 error with ProseMirror/Monaco | Guard with `{#if browser}` | [svelte-reactivity.md#L400](svelte-reactivity.md#L400) |
| Event listeners don't fire (no errors) | Browser check inside $effect | [svelte-reactivity.md#L500](svelte-reactivity.md#L500) |
| Build fails: ENOENT file not found | Remove phantom dependencies | [svelte-reactivity.md#L550](svelte-reactivity.md#L550) |
| Server crashes on startup / 500 on all routes | Remove top-level await in config | [svelte-reactivity.md#L600](svelte-reactivity.md#L600) |
| Page freezes, effect_update_depth_exceeded error | Use untrack() or plain vars in $effect | [svelte-reactivity.md#L700](svelte-reactivity.md#L700) |
| Component has custom CSS/hardcoded values | Use design tokens (bg-surface, px-inbox-header) | [ui-patterns.md#L780](ui-patterns.md#L780) |
| Navbar/header stays white in dark mode | Remove non-existent CSS vars (--color-bg-base-rgb) | [ui-patterns.md#L828](ui-patterns.md#L828) |
| Scrollbar positioned at far right (outside padding) | Use scrollable-outer + scrollable-inner utilities | [component-architecture.md#L180](../component-architecture.md#L180) |
| Raw markdown displayed instead of rendered HTML | Add Vite middleware to redirect .md URLs | [ui-patterns.md#L1100](ui-patterns.md#L1100) |
| Vercel build: "Could not resolve _generated/dataModel" | Commit _generated to git, separate deployments | [convex-integration.md#L540](convex-integration.md#L540) |

## 🟡 IMPORTANT Patterns (Common Issues)

| Symptom | Solution | Details |
|---------|----------|---------|
| Data doesn't update automatically | Use `useQuery()` not manual | [svelte-reactivity.md#L220](svelte-reactivity.md#L220) |
| Widget disappears too early | Polling updates only, not completion | [svelte-reactivity.md#L280](svelte-reactivity.md#L280) |
| Duplicate timers / early dismissal | Track timers with Set | [svelte-reactivity.md#L340](svelte-reactivity.md#L340) |
| Component doesn't update on route change | Use $effect + $page.url.pathname | [svelte-reactivity.md#L650](svelte-reactivity.md#L650) |
| Switch in dropdown broken | Use plain div wrapper | [ui-patterns.md#L10](ui-patterns.md#L10) |
| Conflicting keyboard shortcuts | Check priority: dropdowns > inputs > component | [ui-patterns.md#L430](ui-patterns.md#L430) |
| J/K navigation blocked by auto-focused input | Use autoFocus prop + Enter/ESC edit mode | [ui-patterns.md#L880](ui-patterns.md#L880) |
| ProseMirror "$ prefix reserved" | Rename `$from` → `from` | [svelte-reactivity.md#L450](svelte-reactivity.md#L450) |
| Code blocks show plain text, no syntax colors | Use prosemirror-highlight + lowlight | [ui-patterns.md#L760](ui-patterns.md#L760) |
| Typing `-` or `1.` doesn't create lists | Use addListNodes() from prosemirror-schema-list | [ui-patterns.md#L1150](ui-patterns.md#L1150) |
| ProseMirror menu doesn't insert selection | Capture range eagerly, pass as parameter | [ui-patterns.md#L1200](ui-patterns.md#L1200) |
| Users logged out on browser close | Set cookieConfig.maxAge | [convex-integration.md#L100](convex-integration.md#L100) |
| File not found in Convex | Use TypeScript imports | [convex-integration.md#L140](convex-integration.md#L140) |
| `InvalidConfig`: hyphens in filename | Use camelCase names | [convex-integration.md#L140](convex-integration.md#L140) |
| Redundant API paths (api.x.x) | File=noun, Function=verb | [convex-integration.md#L190](convex-integration.md#L190) |
| `.toLocaleDateString is not a function` | Wrap Convex timestamps in new Date() | [convex-integration.md#L490](convex-integration.md#L490) |
| Analytics events missing in PostHog | Use server-side tracking | [analytics.md#L10](analytics.md#L10) |

## 🟢 REFERENCE Patterns (Best Practices)

| Topic | Pattern | Details |
|-------|---------|---------|
| Card design | Use generous padding | [ui-patterns.md#L60](ui-patterns.md#L60) |
| Header alignment | Fixed height with tokens | [ui-patterns.md#L120](ui-patterns.md#L120) |
| Edit mode toggle | Separate view/edit states | [ui-patterns.md#L170](ui-patterns.md#L170) |
| Card removal (Tinder-like) | Queue-based removal | [ui-patterns.md#L220](ui-patterns.md#L220) |
| Visual feedback | Show overlay before action | [ui-patterns.md#L280](ui-patterns.md#L280) |
| Textarea auto-resize | Remove h-full, use field-sizing | [ui-patterns.md#L330](ui-patterns.md#L330) |
| Command palette drama | Dark overlay + blur + animation | [ui-patterns.md#L480](ui-patterns.md#L480) |
| Command input design | Icon + transparent + shortcuts | [ui-patterns.md#L530](ui-patterns.md#L530) |
| N vs C keyboard shortcuts | N=new, C=command center | [ui-patterns.md#L580](ui-patterns.md#L580) |
| Control panel system | Toolbar/popover/embedded controls | [ui-patterns.md#L620](ui-patterns.md#L620) |
| Atomic components | Reusable KeyboardShortcut, FormInput | [ui-patterns.md#L680](ui-patterns.md#L680) |
| ProseMirror integration | Rich text with AI detection | [ui-patterns.md#L730](ui-patterns.md#L730) |
| Compact modal design | Linear-style tight spacing, input-sized fields | [ui-patterns.md#L830](ui-patterns.md#L830) |
| Hierarchical ESC navigation | Blur input → refocus modal → close | [ui-patterns.md#L930](ui-patterns.md#L930) |
| Premium animations | Spring physics + staggered transitions | [ui-patterns.md#L1150](ui-patterns.md#L1150) |
| Navigation architecture | Remove sidebar, add breadcrumbs + hub pages | [ui-patterns.md#L1260](ui-patterns.md#L1260) |
| Type safety for Convex | Use shared type definitions | [convex-integration.md#L240](convex-integration.md#L240) |
| Discriminated unions | Type narrowing with discriminator | [convex-integration.md#L290](convex-integration.md#L290) |
| Enum to database strings | Explicit conversion functions | [convex-integration.md#L340](convex-integration.md#L340) |
| Event naming | snake_case + past tense | [analytics.md#L60](analytics.md#L60) |
| Centralized config | Single config.ts file | [convex-integration.md#L390](convex-integration.md#L390) |
| Reusable entity tagging | Helper + type-safe wrappers | [convex-integration.md#L440](convex-integration.md#L440) |

---

## Quick Navigation

- **Svelte 5 Reactivity** → [svelte-reactivity.md](svelte-reactivity.md)
- **Convex Integration** → [convex-integration.md](convex-integration.md)
- **UI/UX Patterns** → [ui-patterns.md](ui-patterns.md)
- **Analytics (PostHog)** → [analytics.md](analytics.md)

---

## How to Use This Index

1. **Scan symptom tables** above for your issue
2. **Load domain file** linked in Details column
3. **Jump to line number** (e.g., `#L10`) for immediate fix
4. **Apply pattern** with confidence (validated with Context7)

---

## Adding New Patterns

When using `/save` command:

1. **Add pattern to appropriate domain file** (svelte-reactivity.md, etc.)
2. **Use sequential line numbers** (L10, L50, L80, etc. - leave gaps for future inserts)
3. **Update this INDEX.md** with symptom → line number mapping
4. **Choose severity**: 🔴 Critical, 🟡 Important, 🟢 Reference
5. **Validate with Context7** if touching external library patterns

---

## Pattern Template (In Domain Files)

```markdown
## #L[NUMBER]: [Pattern Name] [🔴/🟡/🟢 SEVERITY]

**Symptom**: Brief one-line description  
**Root Cause**: Why it happens  
**Fix**: 

```[language]
// ❌ WRONG
wrong code

// ✅ CORRECT
correct code
```

**Apply when**: When to use this pattern  
**Related**: #L[OTHER] (Description)
```

---

**Last Updated**: 2025-11-09  
**Pattern Count**: 50  
**Format Version**: 2.0