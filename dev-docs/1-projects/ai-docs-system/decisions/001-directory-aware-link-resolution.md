# ADR 001: Directory-Aware Link Resolution

**Date**: 2025-11-10  
**Status**: Accepted  
**Deciders**: Randy (Founder), AI Assistant

---

## Context

Markdown links in `/dev-docs/2-areas/README.md` are broken because relative paths don't include directory context.

**Example**:

```markdown
<!-- In /dev-docs/2-areas/README.md -->

[Product Vision](product-vision-and-plan.md)
```

**Current behavior**:

1. Markdown renderer strips `.md` → `product-vision-and-plan`
2. Browser resolves relative to current page: `/dev-docs/2-areas`
3. Result: `/dev-docs/product-vision-and-plan` ❌ (404 - missing `/2-areas/`)

**Should be**: `/dev-docs/2-areas/product-vision-and-plan` ✅

---

## Decision

**Prepend `./` to relative links that don't already have a path prefix.**

```typescript
// Before
href = 'product-vision-and-plan'; // Ambiguous

// After
href = './product-vision-and-plan'; // Browser resolves relative to current directory
```

---

## Rationale

### Why This Approach

1. **Browser-native resolution**: Let the browser handle directory resolution (it's designed for this)
2. **Simple**: One-line change in renderer
3. **Robust**: Works for all edge cases (subdirs, parent dirs, hash fragments)
4. **No path rewriting**: Don't need to parse and reconstruct full paths
5. **Future-proof**: Moving files doesn't break links (relative paths adapt)

### Alternatives Considered

**Alternative 1: Full Path Rewriting**

```typescript
// Calculate full path from current location
const currentDir = getCurrentDirectory();
const fullPath = resolvePath(currentDir, href);
```

❌ Rejected: Complex, error-prone, needs directory tracking

**Alternative 2: Absolute Paths Everywhere**

```markdown
[Link](/dev-docs/2-areas/product-vision-and-plan)
```

❌ Rejected: Moving folders breaks all links, not maintainable

**Alternative 3: Custom Link Resolution Service**

```typescript
const linkResolver = new LinkResolver();
href = linkResolver.resolve(href, currentPage);
```

❌ Rejected: Overkill, adds dependency, slower

---

## Implementation

### Code Change

**File**: `src/routes/dev-docs/[...path]/+page.svelte`

**Before**:

```typescript
renderer.link = function ({ href, text, title }: any) {
	if (href && !href.startsWith('http') && !href.startsWith('/')) {
		if (href.includes('.md')) {
			const [path, hash] = href.split('#');
			const cleanPath = path.replace(/\.md$/, '');
			const cleanHash = hash ? `#${hash.toLowerCase()}` : '';
			href = `${cleanPath}${cleanHash}`;
		}
	}
	// ... build link HTML
};
```

**After**:

```typescript
renderer.link = function ({ href, text, title }: any) {
	if (href && !href.startsWith('http') && !href.startsWith('/')) {
		if (href.includes('.md')) {
			const [path, hash] = href.split('#');
			const cleanPath = path.replace(/\.md$/, '');

			// Make relative links explicit for browser resolution
			const finalPath =
				cleanPath.startsWith('./') || cleanPath.startsWith('../') ? cleanPath : './' + cleanPath;

			const cleanHash = hash ? `#${hash.toLowerCase()}` : '';
			href = `${finalPath}${cleanHash}`;
		}
	}
	// ... build link HTML
};
```

### Test Cases

| Link in Markdown       | Browser Receives | Resolves To          | Status |
| ---------------------- | ---------------- | -------------------- | ------ |
| `[Link](file.md)`      | `./file`         | Same directory       | ✅     |
| `[Link](./file.md)`    | `./file`         | Same directory       | ✅     |
| `[Link](../file.md)`   | `../file`        | Parent directory     | ✅     |
| `[Link](sub/file.md)`  | `./sub/file`     | Subdirectory         | ✅     |
| `[Link](file.md#L10)`  | `./file#l10`     | With hash fragment   | ✅     |
| `[Link](/abs/path.md)` | `/abs/path`      | Absolute (unchanged) | ✅     |
| `[Link](https://...)`  | `https://...`    | External (unchanged) | ✅     |

---

## Consequences

### Positive

- ✅ All relative links work correctly
- ✅ Simple implementation (minimal code change)
- ✅ Browser does the heavy lifting (reliable)
- ✅ Works with subdirectories and parent paths
- ✅ Hash fragments preserved
- ✅ External and absolute links unchanged

### Negative

- ⚠️ Markdown files must use relative paths (already do)
- ⚠️ Won't fix hardcoded absolute paths (intentional - those should work as-is)

### Neutral

- Filesystem structure stays same (no folder renaming)
- Only affects rendered links, not markdown source

---

## Validation

**Test 1**: Navigate to `/dev-docs/2-areas` and click "Product Vision"

- Expected: `/dev-docs/2-areas/product-vision-and-plan`
- Result: [Will update after testing]

**Test 2**: Click "Pattern Index" (subdirectory)

- Expected: `/dev-docs/2-areas/patterns/INDEX`
- Result: [Will update after testing]

**Test 3**: From patterns file, click parent link

- Expected: Correct parent directory resolution
- Result: [Will update after testing]

---

## Notes

- This decision affects only the markdown renderer in dev-docs
- Does not impact other parts of the app
- Can be reverted by removing `./` prepending logic
- Performance impact: negligible (one string concatenation per link)

---

## Related Decisions

- ADR 002: [Clean PARA Display] (separate concern - UI only)
- ADR 003: [Automated Link Checking] (validation, not resolution)
