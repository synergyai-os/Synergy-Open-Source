# Vertical Slices - AI Documentation System

**Shape Up Methodology**: Each slice delivers end-to-end value that can be tested immediately.

---

## Slice 1: Fix Link Resolution (2h)

**Goal**: Make all relative markdown links directory-aware so they resolve correctly.

### Acceptance Criteria

- [ ] Links in `/dev-docs/2-areas/README.md` work correctly
- [ ] Subdirectory links work (e.g., `patterns/INDEX.md`)
- [ ] Parent directory links work (e.g., `../../architecture.md`)
- [ ] Hash fragments still work (e.g., `#L10` → `#l10`)
- [ ] External links unchanged (http/https)
- [ ] Absolute paths unchanged (starting with `/`)

### Implementation

**File**: `src/routes/dev-docs/[...path]/+page.svelte`

**Current Code**:

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

**New Code**:

```typescript
renderer.link = function ({ href, text, title }: any) {
	if (href && !href.startsWith('http') && !href.startsWith('/')) {
		if (href.includes('.md')) {
			const [path, hash] = href.split('#');
			const cleanPath = path.replace(/\.md$/, '');
			const cleanHash = hash ? `#${hash.toLowerCase()}` : '';

			// Make relative links explicit for browser resolution
			const finalPath =
				cleanPath.startsWith('./') || cleanPath.startsWith('../') ? cleanPath : './' + cleanPath;

			href = `${finalPath}${cleanHash}`;
		}
	}
	// ... build link HTML
};
```

### Test Plan

1. Navigate to `/dev-docs/2-areas`
2. Click "Product Vision & Plan" → should go to `/dev-docs/2-areas/product-vision-and-plan`
3. Click "Pattern Index" → should go to `/dev-docs/2-areas/patterns/INDEX`
4. Click any link with `#L10` → should scroll to line 10
5. Test from subdirectory (`/dev-docs/2-areas/patterns/INDEX`)
6. Click parent link (`../../architecture.md`) → should work

### Expected Result

All 20+ links in `/dev-docs/2-areas/README.md` work without 404 errors.

---

## Slice 2: Clean PARA Display (1h)

**Goal**: Strip "N-" prefix from all UI displays while keeping folder structure.

### Acceptance Criteria

- [ ] Breadcrumbs show "projects" not "1-projects"
- [ ] Page titles show "Areas" not "2-areas"
- [ ] Navigation menu shows clean names
- [ ] Folder structure unchanged in filesystem
- [ ] Actual URLs unchanged (paths stay same)

### Implementation

**File**: `src/routes/dev-docs/[...path]/+page.svelte`

**Add utility function**:

```typescript
function cleanParaName(name: string): string {
	return name.replace(/^\d+-/, '');
}
```

**Update displays**:

```typescript
// Breadcrumbs
const breadcrumbs = path.split('/').map((segment) => cleanParaName(segment));

// Page title
const pageTitle = cleanParaName(lastSegment);

// Folder listings
folders.map((f) => ({ ...f, displayName: cleanParaName(f.name) }));
```

**Files to Update**:

- `src/routes/dev-docs/[...path]/+page.svelte` - Main doc renderer
- Breadcrumb component (if separate)
- Navigation menu (if shows folder names)

### Test Plan

1. Navigate to `/dev-docs/1-projects`
2. Check breadcrumb shows "Documentation / Projects" (not "1 Projects")
3. Check page title shows "Projects" (not "1-projects")
4. Navigate through subdirectories
5. Verify folder structure unchanged in filesystem
6. Verify URLs still work with "1-projects" in path

### Expected Result

No "1-", "2-", "3-", "4-" visible anywhere in UI, but paths still work.

---

## Slice 3: Add Link Checker (2h)

**Goal**: Automated validation of all markdown links on every commit.

### Acceptance Criteria

- [ ] GitHub Action runs on every push
- [ ] Checks all `.md` files in `dev-docs/`
- [ ] Validates internal links (not external)
- [ ] Reports which links are broken
- [ ] Fails build if links broken
- [ ] Fast (< 30 seconds)

### Implementation

**File**: `.github/workflows/check-links.yml`

```yaml
name: Check Documentation Links

on:
  push:
    paths:
      - 'dev-docs/**/*.md'
      - 'src/routes/dev-docs/**'
  pull_request:
    paths:
      - 'dev-docs/**/*.md'
      - 'src/routes/dev-docs/**'

jobs:
  check-links:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Check Markdown Links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          use-quiet-mode: 'no'
          use-verbose-mode: 'yes'
          config-file: '.github/markdown-link-check-config.json'
          folder-path: 'dev-docs/'
```

**Config file**: `.github/markdown-link-check-config.json`

```json
{
	"ignorePatterns": [
		{
			"pattern": "^http"
		}
	],
	"replacementPatterns": [
		{
			"pattern": "\\.md$",
			"replacement": ""
		}
	],
	"aliveStatusCodes": [200, 206]
}
```

### Test Plan

1. Create intentionally broken link in test doc
2. Commit and push to branch
3. Verify GitHub Action runs
4. Verify build fails with clear error message
5. Fix link
6. Verify build passes
7. Test with various link types (relative, parent, subdirs)

### Expected Result

- Broken links caught immediately
- Clear error messages showing which files/links
- Build only passes when all links valid

---

## Dependencies Between Slices

**Slice 1 → Slice 2**: Independent (can be done in parallel)  
**Slice 1, 2 → Slice 3**: Link checker validates fixes from slices 1 & 2

**Recommended order**: 1 → 2 → 3 (sequential for validation)

---

## Post-Completion Checklist

After all slices complete:

- [ ] All links in dev-docs work
- [ ] PARA numbers invisible in UI
- [ ] Link checker passing
- [ ] Documentation updated
- [ ] Pattern extracted to `dev-docs/patterns/INDEX.md`
- [ ] Project archived to `dev-docs/4-archive/`

---

## Success Metrics

**Before**:

- ~20+ broken links in `/dev-docs/2-areas`
- Manual link checking required
- PARA numbers visible everywhere

**After**:

- 0 broken links
- Automated link validation
- Clean UI (no PARA numbers visible)

**Validation**: Randy clicks through docs and confirms all links work.
