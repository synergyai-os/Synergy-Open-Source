# SynergyOS Root Directory Analysis

**Document Purpose**: Explain root-level files and directories for architecture review  
**Date**: 2025-12-16  
**Status**: Current snapshot of workspace organization

---

## Executive Summary

This document catalogs all root-level files and directories in the SynergyOS workspace, explaining their purpose, whether they should be version-controlled, and recommendations for cleanup or reorganization.

**Key Findings**:

- 9 log files present (temporary debugging artifacts)
- 3 JSON configuration/tracking files (mixed purpose)
- 2 generated build directories (should be gitignored)
- 1 orphaned test directory (external testing tool)
- 1 empty design system directory (visual regression setup)

---

## 1. Log Files (Temporary Artifacts)

These are debugging outputs from various development activities. **All should be deleted** and are not tracked in git.

| File                       | Purpose                                     | Size Indicator       | Keep?     |
| -------------------------- | ------------------------------------------- | -------------------- | --------- |
| `audit-report.json`        | Design system compliance audit (2025-11-21) | 775 violations found | ❌ Delete |
| `build-storybook.log`      | Storybook build output                      | Build logs           | ❌ Delete |
| `ci-output.log`            | CI pipeline debug output                    | CI logs              | ❌ Delete |
| `debug-storybook.log`      | Storybook debugging session                 | Debug logs           | ❌ Delete |
| `e2e-simplified-run.log`   | Playwright E2E test run                     | Test logs            | ❌ Delete |
| `rate-limit-debug.log`     | Rate limiting investigation                 | Debug logs           | ❌ Delete |
| `test-detailed.log`        | Detailed test output                        | Test logs            | ❌ Delete |
| `test-output-syos-197.log` | Specific ticket test run (SYOS-197)         | Test logs            | ❌ Delete |
| `test-output.log`          | General test output                         | Test logs            | ❌ Delete |

### audit-report.json Detail

**Last Run**: 2025-11-21  
**Purpose**: Automated design system compliance checking  
**Key Metrics**:

- Token Coverage: 49%
- Total Violations: 775
- Files Scanned: 300
- Inline Styles: 20
- Raw Scale Values: 503

**Script**: `npm run audit:design-system` (see `package.json` line 45)

**Recommendation**: This is generated output. Should be deleted after review. The team should add `*.log` and `*-report.json` to `.gitignore` to prevent accidental commits.

---

## 2. Configuration & Tracking Files

### design-system-checklist.json ✅ Keep (Curated)

**Purpose**: Master checklist for design system maturity tracking  
**Type**: Curated documentation (not generated)  
**Last Updated**: 2024-11-20  
**Size**: 536 lines / 2,727 bytes

**Contents**:

- Project metadata (tech stack: Svelte 5, Tailwind CSS 4, TypeScript)
- Maturity level: `production_optimization`
- Phase tracking (Phases 1-3 complete, Phase 4 in progress)
- 3-tier token architecture documentation
- 4-layer component pattern definitions
- AI tool compliance rules
- Validation checklists for new components

**Used By**:

- AI agents for context on design system rules
- Developers for onboarding
- Audits for compliance tracking

**Recommendation**: **Keep and version-control**. This is a valuable single-source-of-truth for design system governance. Consider moving to `dev-docs/master-docs/` for better discoverability.

---

### tokens.json ⚠️ Investigate (Likely Generated)

**Purpose**: DTCG-compliant design token definitions  
**Type**: Likely generated from `design-tokens-semantic.json`  
**Size**: 2,728 lines / ~180KB

**Contents**:

- Full design token specification
- Color system (brand, neutral, status, accent, org chart, syntax)
- Typography system (font families, sizes, weights, line heights)
- Spacing system (0-96 scale + semantic aliases)
- Border radius, shadows, z-index, animation tokens
- Layout tokens (sidebar, header, container sizes)
- Breakpoints, opacity scale
- Sizing tokens (icon, avatar, button, input, toggle)

**Source Files**:

- `design-tokens-base.json` (primitive tokens)
- `design-tokens-semantic.json` (semantic tokens)

**Build Process**:

```bash
npm run tokens:build
# Runs: node scripts/build-tokens.js
```

**Recommendation**: **Verify if generated**. If this is output from `scripts/build-tokens.js`, add to `.gitignore`. If it's a source file, keep it but consider renaming to clarify its role (e.g., `design-tokens.dtcg.json`).

---

### design-tokens-base.json ✅ Keep (Source)

**Purpose**: Base primitive design tokens (source of truth)  
**Type**: Source file (hand-maintained)  
**Referenced By**: `tokens.json` and build pipeline

---

### design-tokens-semantic.json ✅ Keep (Source)

**Purpose**: Semantic design tokens (source of truth)  
**Type**: Source file (hand-maintained)  
**Referenced By**: `tokens.json` and build pipeline

---

## 3. Generated Build Directories

These are build outputs and should be gitignored (most already are).

### storybook-static/ ✅ Already Gitignored

**Purpose**: Storybook static build output  
**Generated By**: `npm run build-storybook` (line 37 in package.json)  
**Size**: Large (HTML, JS, CSS, assets)  
**Status**: ✅ Already in `.gitignore` (line 41)

**Used For**:

- Visual component documentation
- Chromatic visual regression testing
- Component playground for designers

**Recommendation**: Keep gitignored. Deploy to Vercel or Netlify for team access.

---

### playwright-report/ ⚠️ Should Be Gitignored

**Purpose**: Playwright E2E test results (HTML report)  
**Generated By**: `npm run test:e2e` (line 28 in package.json)  
**Contents**: `index.html`, `data/`, `trace/` folders

**Status**: ✅ Already in `.gitignore` (line 37 as `playwright-report`)

**Recommendation**: Keep gitignored. Safe to delete locally anytime.

---

### test-results/ ✅ Already Gitignored

**Purpose**: Playwright test artifacts (screenshots, videos, traces)  
**Generated By**: Playwright test runs  
**Status**: ✅ Already in `.gitignore` (lines 1 and 36)

**Recommendation**: Keep gitignored. Safe to delete locally anytime.

---

### www/ ⚠️ Should Be Gitignored

**Purpose**: SvelteKit production build output  
**Generated By**: `npm run build` (line 14 in package.json)  
**Contents**: `_app/` (JS chunks, CSS, entry points), `robots.txt`, `version.json`

**Status**: ❌ **NOT in `.gitignore`** (should be added)

**Build Process**:

```bash
npm run build
# Uses SvelteKit adapter-static or adapter-vercel
# Outputs to .svelte-kit/output or www/
```

**Recommendation**: **Add to `.gitignore`**:

```gitignore
# Add this line to .gitignore
www/
```

This is a deployment artifact and should never be committed. Vercel/deployment platforms rebuild this on each deploy.

---

## 4. Specialized Testing Directory

### testsprite_tests/ ⚠️ Orphaned External Tool

**Purpose**: TestSprite AI-generated test suite (external SaaS tool)  
**Type**: Python-based E2E test suite (not Playwright)  
**Created**: 2025-11-13  
**Size**: 29 files (20 Python scripts, 5 JSON configs, 3 markdown reports, 1 HTML report)

**Contents**:

- 20 test cases (TC001-TC020) covering:
  - Authentication (WorkOS integration)
  - Universal Inbox (real-time updates, keyboard nav)
  - Flashcards (FSRS algorithm)
  - Rich notes editor (Markdown, AI detection)
  - RBAC/permissions
  - Accessibility compliance
  - Security testing
  - Responsive design
- Test reports (HTML + Markdown)
- Configuration files (`standard_prd.json`, `testsprite_frontend_test_plan.json`)
- Temp directory with test results

**Tool**: TestSprite AI (testsprite.com) - Third-party testing platform

**Status**: ❌ **NOT in `.gitignore`**

**Used By**: Appears to be a one-time evaluation of TestSprite tool (Nov 2025)

**Recommendation**:

- If TestSprite is **actively used**: Keep directory, but move to `tests/testsprite/` for better organization
- If TestSprite was a **one-time trial**: Archive test reports to documentation, then delete directory
- Add to `.gitignore` if keeping:
  ```gitignore
  testsprite_tests/tmp/
  testsprite_tests/**/*.pyc
  ```

**Question for Team**: Is TestSprite part of your ongoing testing strategy, or was this a pilot evaluation?

---

## 5. Visual Regression Directory

### **design-system-snapshots**/ ✅ Partially Gitignored

**Purpose**: Chromatic/visual regression test snapshots  
**Type**: Image snapshot storage for design system components  
**Status**:

- Directory itself is committed (empty currently)
- Diff images are gitignored (line 42-43 in `.gitignore`)

**Gitignore Entries**:

```gitignore
__design-system-snapshots__/*-diff.png
__design-system-snapshots__/*-diff.png.snap
```

**Recommendation**: Keep as-is. The directory structure is tracked, but diff images are ephemeral. This is standard practice for visual regression tools.

---

## 6. Configuration Files (Root Level)

These are legitimate root-level configs and should stay:

| File                         | Purpose                           | Keep?   |
| ---------------------------- | --------------------------------- | ------- |
| `capacitor.config.ts`        | Capacitor (mobile) configuration  | ✅ Keep |
| `chromatic.config.json`      | Chromatic visual testing config   | ✅ Keep |
| `mdsvex.config.js`           | MDX/Svelte markdown processing    | ✅ Keep |
| `playwright.config.ts`       | Playwright E2E test configuration | ✅ Keep |
| `style-dictionary.config.js` | Token build pipeline config       | ✅ Keep |
| `svelte.config.js`           | SvelteKit project config          | ✅ Keep |
| `tailwind.config.ts`         | Tailwind CSS 4 configuration      | ✅ Keep |
| `tsconfig.json`              | TypeScript compiler config        | ✅ Keep |
| `vercel.json`                | Vercel deployment config          | ✅ Keep |
| `vite.config.ts`             | Vite bundler config               | ✅ Keep |
| `vitest-setup-client.ts`     | Vitest browser test setup         | ✅ Keep |
| `vitest-setup-server.ts`     | Vitest server test setup          | ✅ Keep |
| `eslint.config.js`           | ESLint 9 flat config              | ✅ Keep |
| `package.json`               | NPM dependencies & scripts        | ✅ Keep |
| `package-lock.json`          | NPM lockfile                      | ✅ Keep |

---

## 7. Source Directories (Expected)

| Directory       | Purpose                          | Status        |
| --------------- | -------------------------------- | ------------- |
| `convex/`       | Convex backend (DB + serverless) | ✅ Core       |
| `src/`          | SvelteKit frontend source        | ✅ Core       |
| `scripts/`      | Build/dev/audit scripts          | ✅ Core       |
| `e2e/`          | Playwright E2E tests             | ✅ Core       |
| `tests/`        | Vitest unit/integration tests    | ✅ Core       |
| `dev-docs/`     | Architecture & design docs       | ✅ Core       |
| `static/`       | Public assets                    | ✅ Core       |
| `ios/`          | Capacitor iOS native shell       | ✅ Core       |
| `eslint-rules/` | Custom ESLint rules              | ✅ Core       |
| `node_modules/` | NPM dependencies                 | ✅ Gitignored |

---

## Recommendations Summary

### Immediate Actions (Delete)

```bash
# Delete temporary log files
rm -f audit-report.json
rm -f build-storybook.log
rm -f ci-output.log
rm -f debug-storybook.log
rm -f e2e-simplified-run.log
rm -f rate-limit-debug.log
rm -f test-detailed.log
rm -f test-output-syos-197.log
rm -f test-output.log
```

### .gitignore Updates

```gitignore
# Add these lines to .gitignore

# Build outputs
www/

# Log files
*.log
*-report.json
audit-report.json

# TestSprite (if keeping directory)
testsprite_tests/tmp/
testsprite_tests/**/*.pyc
testsprite_tests/**/__pycache__/
```

### File Reorganization (Optional)

Consider moving for better discoverability:

```bash
# Move design system checklist to docs
mv design-system-checklist.json dev-docs/master-docs/design-system-checklist.json

# If keeping TestSprite, move to tests
mv testsprite_tests/ tests/testsprite/
```

### Investigate

1. **tokens.json**: Determine if this is generated or source. If generated, add to `.gitignore` and document the build process.

2. **testsprite_tests/**: Decide if this is an ongoing tool or a one-time pilot. If one-time:
   - Archive the reports to `dev-docs/archive/2025-11-testsprite-evaluation/`
   - Delete the directory
   - Add learnings to decision log

---

## Questions for Senior Architect

1. **TestSprite Strategy**: Is `testsprite_tests/` part of ongoing QA, or was it a pilot evaluation?

2. **Token Pipeline**: Should `tokens.json` be generated or hand-maintained? Current setup unclear.

3. **Design System Docs**: Should `design-system-checklist.json` move to `dev-docs/` for better organization?

4. **CI Logs**: Should the team add a `.cursorrules` entry to prevent AI agents from creating log files in root?

---

## Impact Assessment

**No Breaking Changes**: All recommendations are cleanup/organization improvements. No impact on:

- CI/CD pipelines
- Development workflow
- Production deployments
- Team collaboration

**Benefits**:

- Cleaner root directory (9 fewer files)
- Better .gitignore hygiene
- Clearer separation of source vs. generated files
- Easier onboarding for new developers

---

## Next Steps

1. **Review this document** with team leads
2. **Approve deletion** of log files
3. **Update .gitignore** with recommended entries
4. **Archive or delete** `testsprite_tests/` based on decision
5. **Clarify token.json status** (generated vs. source)
6. **Optional**: Reorganize design system checklist to docs

---

**Document Status**: Ready for architectural review  
**Action Required**: Team decision on TestSprite and tokens.json status  
**Risk Level**: Low (all recommendations are non-breaking cleanup)
