# Root Directory Status Map

**Visual Reference for Senior Architect**  
**Generated**: 2025-12-16

---

## Legend

| Symbol | Meaning              |
| ------ | -------------------- |
| ✅     | Correct as-is        |
| ⚠️     | Needs attention      |
| ❌     | Should be deleted    |
| 🔧     | Should be gitignored |
| 📁     | Consider moving      |

---

## Root Directory Map

```
/SynergyOS/
│
├── 📦 SOURCE CODE (Core - All Correct)
│   ├── convex/                      ✅ Backend (Convex DB + serverless)
│   ├── src/                         ✅ Frontend (SvelteKit + Svelte 5)
│   ├── scripts/                     ✅ Build/audit/dev tooling
│   ├── e2e/                         ✅ Playwright E2E tests
│   ├── tests/                       ✅ Vitest unit/integration tests
│   └── static/                      ✅ Public assets
│
├── 📚 DOCUMENTATION (Core - All Correct)
│   └── dev-docs/                    ✅ Architecture & design docs
│
├── 🔨 BUILD OUTPUTS (Should be gitignored)
│   ├── storybook-static/            ✅ Already gitignored (line 41)
│   ├── playwright-report/           ✅ Already gitignored (line 37)
│   ├── test-results/                ✅ Already gitignored (line 1, 36)
│   ├── www/                         🔧 NOT gitignored (should be)
│   └── node_modules/                ✅ Already gitignored
│
├── 📱 MOBILE (Core - Correct)
│   └── ios/                         ✅ Capacitor iOS native
│
├── ⚙️ CONFIGURATION FILES (All Correct - Root is appropriate)
│   ├── capacitor.config.ts          ✅ Mobile config
│   ├── chromatic.config.json        ✅ Visual testing
│   ├── eslint.config.js             ✅ Linting (ESLint 9 flat)
│   ├── mdsvex.config.js             ✅ Markdown processing
│   ├── package.json                 ✅ Dependencies & scripts
│   ├── package-lock.json            ✅ Lockfile
│   ├── playwright.config.ts         ✅ E2E test config
│   ├── style-dictionary.config.js   ✅ Token build pipeline
│   ├── svelte.config.js             ✅ SvelteKit config
│   ├── tailwind.config.ts           ✅ Tailwind CSS 4
│   ├── tsconfig.json                ✅ TypeScript compiler
│   ├── vercel.json                  ✅ Deployment config
│   ├── vite.config.ts               ✅ Bundler config
│   ├── vitest-setup-client.ts       ✅ Test setup (browser)
│   └── vitest-setup-server.ts       ✅ Test setup (server)
│
├── 🎨 DESIGN SYSTEM FILES
│   ├── design-tokens-base.json      ✅ Source (primitive tokens)
│   ├── design-tokens-semantic.json  ✅ Source (semantic tokens)
│   ├── tokens.json                  ⚠️ Investigate (generated or source?)
│   ├── design-system-checklist.json 📁 Keep but consider moving to dev-docs/
│   └── __design-system-snapshots__/ ✅ Partially gitignored (diffs only)
│
├── 🧪 TESTING
│   ├── eslint-rules/                ✅ Custom ESLint rules
│   └── testsprite_tests/            ⚠️ Orphaned? (TestSprite AI pilot Nov 2025)
│
├── ❌ TEMPORARY LOGS (Delete All)
│   ├── audit-report.json            ❌ Design system audit (Nov 21, 2025)
│   ├── build-storybook.log          ❌ Storybook build output
│   ├── ci-output.log                ❌ CI pipeline debug
│   ├── debug-storybook.log          ❌ Storybook debugging
│   ├── e2e-simplified-run.log       ❌ Playwright test run
│   ├── rate-limit-debug.log         ❌ Rate limit investigation
│   ├── test-detailed.log            ❌ Detailed test output
│   ├── test-output-syos-197.log     ❌ SYOS-197 test run
│   └── test-output.log              ❌ General test output
│
└── 📄 STANDARD FILES (Correct)
    ├── .gitignore                   ✅ Git ignore rules
    ├── LICENSE                      ✅ Open source license
    └── README.md                    ✅ Project documentation
```

---

## Status Breakdown

| Category      | Count    | Status                                 |
| ------------- | -------- | -------------------------------------- |
| Core Source   | 7 dirs   | ✅ All correct                         |
| Configuration | 15 files | ✅ All correct                         |
| Design System | 4 files  | ⚠️ 1 needs decision, 1 consider moving |
| Build Outputs | 5 dirs   | ⚠️ 1 needs gitignore                   |
| Logs/Reports  | 9 files  | ❌ All delete                          |
| Testing Tools | 1 dir    | ⚠️ Team decision needed                |

**Total Items Needing Attention**: 12 (9 logs to delete + 3 decisions)

---

## Current .gitignore Coverage

### ✅ Already Covered

```gitignore
test-results               # Line 1, 36
node_modules               # Line 2
.eslintcache              # Line 5
.output, .vercel, etc     # Lines 8-12
/.svelte-kit, /build      # Lines 12-13
.DS_Store                 # Line 16
.env.local                # Line 22-23
.convex                   # Line 30
playwright/.auth          # Line 35
playwright-report         # Line 37
e2e/.auth/*.json          # Line 38
storybook-static/         # Line 41
__design-system-snapshots__/*-diff.png  # Line 42-43
ai-docs/reference/**      # Line 48
```

### 🔧 Missing (Recommended Additions)

```gitignore
www/                      # SvelteKit build output
*.log                     # All log files
*-report.json            # Audit/test reports
testsprite_tests/tmp/    # TestSprite temp (if keeping)
testsprite_tests/**/*.pyc # Python bytecode
```

---

## File Size Estimates

| Category          | Approx Size    | Reclaimable?               |
| ----------------- | -------------- | -------------------------- |
| Logs              | ~5-50 MB       | ✅ Yes                     |
| www/              | ~20-50 MB      | ✅ Yes (rebuild on deploy) |
| storybook-static/ | ~30-100 MB     | ✅ Yes (rebuild as needed) |
| testsprite_tests/ | ~1-5 MB        | ⚠️ Decision needed         |
| node_modules/     | ~500 MB - 2 GB | ✅ Already gitignored      |

**Potential Cleanup**: 55-205 MB (logs + build artifacts)

---

## Package.json Script Usage

Scripts that generate root-level files:

| Script                        | Output             | Line |
| ----------------------------- | ------------------ | ---- |
| `npm run build`               | www/               | 14   |
| `npm run build-storybook`     | storybook-static/  | 37   |
| `npm run test:e2e`            | playwright-report/ | 28   |
| `npm run audit:design-system` | audit-report.json  | 45   |
| `npm run tokens:build`        | tokens.json (?)    | 63   |

---

## Directory Health Score

```
✅ Core Functionality:        100% (0 issues)
✅ Configuration:             100% (0 issues)
⚠️  Build Artifacts:           80% (1 not gitignored)
❌ Temporary Files:             0% (9 files present)
⚠️  Design System:             75% (2 need review)
⚠️  Testing Tools:             50% (1 orphaned directory)

Overall Root Health:          75% (Good, minor cleanup needed)
```

---

## Priority Actions

### 🔥 High Priority (5 min)

1. Delete 9 log files
2. Add `www/` to .gitignore

### ⚙️ Medium Priority (15 min)

3. Investigate tokens.json (generated or source?)
4. Decide on testsprite_tests/ (keep or archive?)

### 📋 Low Priority (Optional)

5. Move design-system-checklist.json to dev-docs/
6. Add `*.log` and `*-report.json` to .gitignore

---

## Questions Answered by This Analysis

**Q: Why is my root directory cluttered?**  
A: 9 temporary log files from debugging sessions (normal development artifact accumulation)

**Q: Are we committing build artifacts?**  
A: No, except `www/` is currently not gitignored (should be)

**Q: What's testsprite_tests/?**  
A: External testing tool (TestSprite AI) pilot from Nov 2025 - 20 Python test cases

**Q: Can I safely delete anything?**  
A: Yes, all `*.log` and `*-report.json` files are safe to delete

**Q: Are our config files organized correctly?**  
A: Yes, all 15 root config files are appropriate for their tools

---

For detailed analysis, see:

- **ROOT-FILES-ANALYSIS.md** - Full breakdown with rationale
- **ROOT-CLEANUP-SUMMARY.md** - Quick action guide
