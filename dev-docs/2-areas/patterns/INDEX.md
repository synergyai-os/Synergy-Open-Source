# Pattern Index - Fast Lookup

> **For AI**: Load this file first. It points to exact line numbers in domain files. Load domain file only when needed.

---

## 🔴 CRITICAL Patterns (Fix Immediately)

| Symptom                                                                                           | Solution                                                                     | Details                                                             |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| Auth fails, `op://...` strings in browser                                                         | Use actual values in .env.local for PUBLIC\_ vars                            | [auth-deployment.md#L10](auth-deployment.md#L10)                    |
| Logout doesn't work, cookies persist                                                              | Match exact attributes when deleting cookies                                 | [auth-deployment.md#L160](auth-deployment.md#L160)                  |
| Build fails: "Could not load [deleted-file]"                                                      | Check all imports before deleting files                                      | [auth-deployment.md#L260](auth-deployment.md#L260)                  |
| Auth works but users not in Convex DB                                                             | Deploy Convex functions to correct environment                               | [auth-deployment.md#L510](auth-deployment.md#L510)                  |
| State not updating in UI                                                                          | Use `$state({})` + getters                                                   | [svelte-reactivity.md#L10](svelte-reactivity.md#L10)                |
| Map/Set mutations don't update UI (tag selection, shortcuts broken)                              | Use SvelteMap/SvelteSet from svelte/reactivity                               | [svelte-reactivity.md#L360](svelte-reactivity.md#L360)              |
| `undefined is not a valid Convex value`                                                           | Strip undefined from payloads                                                | [convex-integration.md#L10](convex-integration.md#L10)              |
| `Only actions can be defined in Node.js`                                                          | Separate "use node" files                                                    | [convex-integration.md#L50](convex-integration.md#L50)              |
| Composable receives stale values                                                                  | Pass functions `() => value`                                                 | [svelte-reactivity.md#L80](svelte-reactivity.md#L80)                |
| Component shows stale/old data                                                                    | Key on data, not ID                                                          | [svelte-reactivity.md#L140](svelte-reactivity.md#L140)              |
| `.ts` file: "Cannot assign to constant"                                                           | Rename to `.svelte.ts`                                                       | [svelte-reactivity.md#L180](svelte-reactivity.md#L180)              |
| 500 error with ProseMirror/Monaco                                                                 | Guard with `{#if browser}`                                                   | [svelte-reactivity.md#L400](svelte-reactivity.md#L400)              |
| Event listeners don't fire (no errors)                                                            | Browser check inside $effect                                                 | [svelte-reactivity.md#L500](svelte-reactivity.md#L500)              |
| Build fails: ENOENT file not found                                                                | Remove phantom dependencies                                                  | [svelte-reactivity.md#L550](svelte-reactivity.md#L550)              |
| Server crashes on startup / 500 on all routes                                                     | Remove top-level await in config                                             | [svelte-reactivity.md#L600](svelte-reactivity.md#L600)              |
| Page freezes, effect_update_depth_exceeded error                                                  | Use untrack() or plain vars in $effect                                       | [svelte-reactivity.md#L700](svelte-reactivity.md#L700)              |
| Component has custom CSS/hardcoded values                                                         | Use design tokens (app UI: px-inbox-header, marketing: py-marketing-section) | [ui-patterns.md#L780](ui-patterns.md#L780)                          |
| Navigation breaks in production with base path, ESLint no-navigation-without-resolve errors      | Use resolveRoute() for all goto() and href (except external/static files)    | [ui-patterns.md#L1870](ui-patterns.md#L1870)                        |
| TypeScript errors "Argument of type '[\"/settings/account\"]' is not assignable" with resolveRoute | Use wrapper function with type assertion for routes not in strict type manifest | [ui-patterns.md#L1920](ui-patterns.md#L1920)                        |
| Navbar/header stays white in dark mode                                                            | Remove non-existent CSS vars (--color-bg-base-rgb)                           | [ui-patterns.md#L828](ui-patterns.md#L828)                          |
| Scrollbar positioned at far right (outside padding)                                               | Use scrollable-outer + scrollable-inner utilities                            | [component-architecture.md#L180](../component-architecture.md#L180) |
| Raw markdown displayed instead of rendered HTML                                                   | Add Vite middleware to redirect .md URLs                                     | [ui-patterns.md#L1100](ui-patterns.md#L1100)                        |
| Parent directory links (../) return 404 in docs                                                   | Preserve ./ and ../ prefixes in link renderer                                | [ui-patterns.md#L1120](ui-patterns.md#L1120)                        |
| Documentation 404s from direct URL access or moved files                                         | Add redirect mapping in +page.server.ts for wrong paths                       | [ui-patterns.md#L4700](ui-patterns.md#L4700)                        |
| Vercel build: "Could not resolve \_generated/dataModel"                                           | Commit \_generated to git, separate deployments                              | [convex-integration.md#L540](convex-integration.md#L540)            |
| Deployment fails: "Could not resolve \_generated/dataModel" during bundling                       | Use import type for \_generated imports                                      | [convex-integration.md#L590](convex-integration.md#L590)            |
| Query returns empty, ArgumentValidationError for valid field                                      | Git conflicts block deployment, stale code running                           | [convex-integration.md#L640](convex-integration.md#L640)            |
| Code compiles but Bugbot finds logic bugs                                                         | Automated code review catches architectural mismatches                       | [convex-integration.md#L700](convex-integration.md#L700)            |
| Users logged out after 5 minutes, session doesn't persist                                         | Use app session TTL (30 days), not token expiry (5 min)                      | [auth-deployment.md#L610](auth-deployment.md#L610)                  |
| Query doesn't re-run when dependency changes, UI shows stale data                                 | Wrap conditional query in $derived                                           | [auth-deployment.md#L660](auth-deployment.md#L660)                  |
| "Not authenticated" in Convex, queries return empty                                               | Pass userId parameter + validate session                                     | [auth-deployment.md#L760](auth-deployment.md#L760)                  |
| `state_unsafe_mutation` error during component cleanup                                            | Wrap state mutations in untrack() in event handlers                          | [svelte-reactivity.md#L750](svelte-reactivity.md#L750)              |
| Account/workspace switch navigates but lands on wrong workspace                                   | Match function signature to call sites (silent param drop)                   | [auth-deployment.md#L810](auth-deployment.md#L810)                  |
| Switching accounts shows wrong workspaces, data from another account                              | Use account-specific localStorage keys `{key}_{userId}`                      | [auth-deployment.md#L860](auth-deployment.md#L860)                  |
| Tests fail with "can only be called in the browser" or Web Crypto undefined                       | Rename .test.ts → .svelte.test.ts for browser environment                    | [svelte-reactivity.md#L800](svelte-reactivity.md#L800)              |
| localStorage session data visible in DevTools, fails SOC 2 audit                                  | Use Web Crypto API (AES-256-GCM + PBKDF2)                                    | [auth-deployment.md#L960](auth-deployment.md#L960)                  |
| `Cannot call replaceState(...) before router is initialized` on page load                         | Try-catch guard around replaceState in $effect                               | [svelte-reactivity.md#L730](svelte-reactivity.md#L730)              |
| Manual org switches revert to URL param org, causing infinite loops                              | Read from window.location.search instead of $page.url.searchParams            | [svelte-reactivity.md#L740](svelte-reactivity.md#L740)              |
| Account switch takes 5+ seconds, query costs spike with many linked accounts                      | Add MAX_LINK_DEPTH=3 and MAX_TOTAL_ACCOUNTS=10 limits                        | [auth-deployment.md#L1010](auth-deployment.md#L1010)                |
| Logged-out linked accounts reappear after page reload, three-dot menu logout doesn't persist      | Unlink from database FIRST (Convex accountLinks), then localStorage          | [auth-deployment.md#L1050](auth-deployment.md#L1050)                |
| Database queries fail, userId is an object instead of string                                      | Destructure validateSessionAndGetUserId: const { userId } = await...         | [convex-integration.md#L850](convex-integration.md#L850)            |
| RBAC permission test fails with "Permission denied" even though permissions assigned              | Reuse same test session: destructure both userId and sessionId from createTestSession | [convex-integration.md#L1175](convex-integration.md#L1175)          |
| convex-test fails: "(intermediate value).glob is not a function"                                  | Create test.setup.ts with import.meta.glob() modules map                     | [convex-integration.md#L950](convex-integration.md#L950)            |
| Test insert fails: "Validator error: Missing required field X in object"                          | Include ALL schema fields in test helpers (firstName, updatedAt...)          | [convex-integration.md#L1000](convex-integration.md#L1000)          |
| TypeScript errors "Expected 2 arguments" or "Property 'sessionId' is missing"                     | Migrate from userId to sessionId parameter + destructure response            | [convex-integration.md#L1200](convex-integration.md#L1200)          |
| TypeScript errors "Type 'string' is not assignable to type 'Id<\"tableName\">'" or using `as any` | Use proper `Id<>` type assertions instead of `any`                           | [convex-integration.md#L1250](convex-integration.md#L1250)          |
| TypeScript errors "circularly references itself" or "Property does not exist on type '{}'"        | Use FunctionReference type assertions to break circular API refs             | [convex-integration.md#L1300](convex-integration.md#L1300)          |
| Using `makeFunctionReference()` with `as any` in frontend code                                    | Use `FunctionReference` type assertion instead of `any` for type safety      | [convex-integration.md#L1300](convex-integration.md#L1300)          |
| TypeScript error "Type 'string | null' is not assignable to 'string | undefined'" in interface migration | Match interface contract exactly: use `undefined` not `null` when interface expects undefined | [convex-integration.md#L3800](convex-integration.md#L3800)          |
| Hundreds of `any` types violating coding standards, ESLint no-explicit-any errors                 | Systematic elimination: create type files, narrow unions, use FunctionReference | [convex-integration.md#L1550](convex-integration.md#L1550)          |
| TypeScript errors "Argument of type '() => {...}                                                  | null' is not assignable" in useQuery                                         | Use conditional hook creation: `browser && getSessionId() ? useQuery(...) : null` | [convex-integration.md#L1350](convex-integration.md#L1350) |
| Query stuck in loading, hook never created when ID changes from null to value                   | Use $effect pattern with manual convexClient.query() (proven: useSelectedItem) | [convex-integration.md#L1355](convex-integration.md#L1355)          |
| Multiple related queries take 3-5 seconds, slow page load                                        | Use batch query to check multiple items at once (1 network call vs N)          | [convex-integration.md#L1360](convex-integration.md#L1360)          |
| UI elements appear 3-5 seconds after page load, missing data until hard refresh                 | Load critical data server-side in +layout.server.ts using ConvexHttpClient      | [convex-integration.md#L1390](convex-integration.md#L1390)          |
| Layout server loads data for disabled modules, wastes resources, prevents independent enablement | Check feature flags FIRST, conditionally load module-specific data only if enabled | [convex-integration.md#L1420](convex-integration.md#L1420)          |
| TypeScript errors "'X' is possibly 'null'" for nested property access                             | Use optional chaining for nested properties: `obj?.prop?.nested`             | [convex-integration.md#L1400](convex-integration.md#L1400)          |
| TypeScript errors "Property 'X' does not exist on type 'Y                                         | Z'" on union types                                                           | Use type assertion or type guard to narrow union type               | [convex-integration.md#L1450](convex-integration.md#L1450) |
| TypeScript error "',' expected" in RequestHandler export                                          | Use function syntax `};` not object literal `});` for direct assignment      | [convex-integration.md#L1500](convex-integration.md#L1500)          |
| Password accepted but WorkOS rejects with "password contains email"                               | Strip email aliases (+test) before validation, validate frontend + backend   | [auth-deployment.md#L1110](auth-deployment.md#L1110)                |
| ESLint require-each-key errors, DOM thrashing, list shows wrong data                              | Always use keys in {#each} blocks: (item._id), (item.href), or (index)      | [svelte-reactivity.md#L850](svelte-reactivity.md#L850)              |
| ESLint warnings `svelte/no-at-html-tags`, XSS vulnerabilities from user-generated content        | Sanitize HTML with DOMPurify before rendering with {@html}                   | [ui-patterns.md#L2000](ui-patterns.md#L2000)                         |
| TypeScript error: DOMPurify Config type mismatch between ESM/CJS definitions                       | Use type assertion with 'unknown' intermediate: `config as unknown as Parameters<...>[1]` | [ui-patterns.md#L2005](ui-patterns.md#L2005)                         |
| E2E test helper returns 404, .env.test variables not loaded                                       | Use vite dev --mode test flag (not webServer.env MODE)                       | [ci-cd.md#L280](ci-cd.md#L280)                                      |
| Playwright tests fail with "Session record not found", auth state conflicts                       | Separate authenticated/unauthenticated projects in playwright.config.ts      | [ci-cd.md#L290](ci-cd.md#L290)                                      |
| E2E tests fail with WorkOS "sso_required" error                                                    | Use WorkOS Test Identity Provider or bypass for E2E                          | [ci-cd.md#L310](ci-cd.md#L310)                                      |
| E2E test times out filling Bits UI PinInput (verification codes)                                  | Target hidden input [data-pin-input-input] not visual cells                  | [ui-patterns.md#L2750](ui-patterns.md#L2750)                        |
| E2E tests fail with 429, rate limit tests only register 1-2 attempts instead of 5                 | Use X-Test-ID header for isolated rate limit buckets                         | [ci-cd.md#L330](ci-cd.md#L330)                                      |
| Tests pass with --workers=1 but fail in parallel with "Expected: 429, Received: 401"               | Remove global beforeEach cleanup, rely on unique testIds for isolation      | [ci-cd.md#L340](ci-cd.md#L340)                                      |
| Feature flags visible to all users when no targeting rules configured                              | Default to false when no targeting rules, require explicit configuration   | [convex-integration.md#L1530](convex-integration.md#L1530)            |
| Feature flag needs organization-based targeting (multi-tenancy)                                    | Add allowedOrganizationIds field + org membership check                    | [feature-flags.md#L180](feature-flags.md#L180)                        |
| Admin sidebar visible to non-admin users, or error page shows sidebar                            | Separate checks: page load throws error, layout load returns boolean for conditional UI       | [ui-patterns.md#L4800](ui-patterns.md#L4800)            |
| Can't add more items after selecting - combobox trigger disappears                                 | Add "Add" button next to selected chips, use anchor element for positioning | [ui-patterns.md#L3120](ui-patterns.md#L3120)                            |
| Combobox doesn't allow multi-select, dropdown closes immediately, search doesn't work with backspace | Replace Combobox with custom dropdown using plain div + manual state management | [ui-patterns.md#L4520](ui-patterns.md#L4520)                            |
| Need polymorphic schema supporting multiple entity types (users/circles/teams)                     | Use union type discriminator + optional ID fields + validation              | [convex-integration.md#L1700](convex-integration.md#L1700)            |
| `$derived` values don't update in child components, props show as functions                      | Call `$derived` functions when passing as props: `organizations={orgs()}`  | [svelte-reactivity.md#L900](svelte-reactivity.md#L900)                  |
| `$derived` doesn't execute, returns function instead of value, reactivity breaks                  | Access getter properties without optional chaining: check existence first  | [svelte-reactivity.md#L910](svelte-reactivity.md#L910)                  |
| `state_snapshot_uncloneable` error when passing values to Convex queries                          | Extract primitives from `$derived` by calling function before passing       | [svelte-reactivity.md#L920](svelte-reactivity.md#L920)                  |
| Hydration error `$.get(...) is not a function` when accessing page data                          | Use function pattern `() => $page.data.sessionId` not `$derived($page.data.sessionId)` | [svelte-reactivity.md#L1600](svelte-reactivity.md#L1600)                  |
| `each_key_duplicate` error when multiple users belong to same organization                         | Use composite keys: `(${org.organizationId}-${account.userId})`             | [svelte-reactivity.md#L1460](svelte-reactivity.md#L1460)                |
| `ReferenceError: [variable] is not defined` accessing variable from try block                      | Declare variable before try block or move cleanup inside try                 | [svelte-reactivity.md#L1510](svelte-reactivity.md#L1510)                |
| UI shows actions users can't perform, buttons visible but disabled/error on click                 | Use `usePermissions` composable + owner bypass pattern for permission-based visibility | [ui-patterns.md#L3200](ui-patterns.md#L3200)            |
|| Buttons/dropdowns in modal panels don't work, clicks don't register                            | Use z-index stacking: backdrop z-40, panel z-50, dropdowns z-50 (don't use stopPropagation)  | [ui-patterns.md#L3650](ui-patterns.md#L3650)            |
| SVG text labels covered by child elements, root circle names appear behind sub-circles        | Use two-pass rendering: visual elements first, text labels second (sorted by depth descending) | [ui-patterns.md#L4000](ui-patterns.md#L4000)            |
| SVG text sizes don't reflect hierarchy, all labels same size regardless of depth            | Use depth-based multiplier: `3 - node.depth * 0.5` for root (3x) scaling down              | [ui-patterns.md#L4000](ui-patterns.md#L4000)            |
| SVG text backgrounds use hardcoded rgba colors, not theme-aware                             | Use design token colors: `oklch(37.2% 0.044 257.287 / 0.85)` instead of `rgba(0,0,0,0.7)` | [ui-patterns.md#L4000](ui-patterns.md#L4000)            |
| Modal/panel opens then immediately closes, backdrop click fires on trigger click               | Check if click target is backdrop: `if (e.target === e.currentTarget) handleClose()`          | [ui-patterns.md#L3950](ui-patterns.md#L3950)            |
| State shows open but element hidden, backdrop visible but panel missing, Tailwind classes ignored | Remove hardcoded properties from @utility - let conditional Tailwind classes control them      | [ui-patterns.md#L4100](ui-patterns.md#L4100)            |
| Panel positioned incorrectly, stacking panels misaligned, not flush to right edge              | Don't set both `left` and `right` - `left` overrides `right`. Use width calc instead          | [ui-patterns.md#L4150](ui-patterns.md#L4150)            |
| Content cut off or overlaps with breadcrumb/toolbar, scrollable content partially blocked      | Add padding to content equal to absolute element's width (use design token)                    | [ui-patterns.md#L4200](ui-patterns.md#L4200)            |
| ESC key goes back two levels instead of one when multiple panels are open                      | Check if current panel is topmost layer before handling ESC (use selectedId not data._id)     | [ui-patterns.md#L4250](ui-patterns.md#L4250)            |
| Admin access denied redirects instead of showing error page, custom +error.svelte never renders | Move admin checks from hooks to page loads, throw error() not redirect()                      | [ui-patterns.md#L4750](ui-patterns.md#L4750)            |
| Account switching shows "GET method not allowed" (405), switch fails                          | Use POST request with CSRF token via useAuthSession composable, not window.location.href     | [auth-deployment.md#L1120](auth-deployment.md#L1120)    |

## 🟡 IMPORTANT Patterns (Common Issues)

| Symptom                                                                       | Solution                                                              | Details                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Production auth fails with "Invalid redirect URI"                             | Use separate staging/production credentials                           | [auth-deployment.md#L60](auth-deployment.md#L60)           |
| Auth works on myapp.com but fails on www.myapp.com                            | Add both www and non-www to redirect URIs                             | [auth-deployment.md#L110](auth-deployment.md#L110)         |
| User auto-logs back in after logout                                           | Revoke session on auth provider                                       | [auth-deployment.md#L210](auth-deployment.md#L210)         |
| 403 Forbidden switching from Account C to B (A→B, B→C work)                   | Use BFS to find transitive links (A→B→C)                              | [auth-deployment.md#L910](auth-deployment.md#L910)         |
| Data doesn't update automatically                                             | Use `useQuery()` not manual                                           | [svelte-reactivity.md#L220](svelte-reactivity.md#L220)     |
| Widget disappears too early                                                   | Polling updates only, not completion                                  | [svelte-reactivity.md#L280](svelte-reactivity.md#L280)     |
| Duplicate timers / early dismissal                                            | Track timers with SvelteSet (reactive)                                | [svelte-reactivity.md#L340](svelte-reactivity.md#L340)     |
| Component doesn't update on route change                                      | Use $effect + $page.url.pathname                                      | [svelte-reactivity.md#L650](svelte-reactivity.md#L650)     |
| SVG text overlaps with packed child elements, roles cover circle names                       | Use SVG masking to exclude text areas from child element rendering    | [ui-patterns.md#L4000](ui-patterns.md#L4000)            |
| ESLint error: "Found mutable Date class. Use SvelteDate"                     | Use immutable timestamp arithmetic (getTime() + ms)                   | [svelte-reactivity.md#L1150](svelte-reactivity.md#L1150)   |
| Switch in dropdown broken                                                     | Use plain div wrapper                                                 | [ui-patterns.md#L10](ui-patterns.md#L10)                   |
| Conflicting keyboard shortcuts                                                | Check priority: dropdowns > inputs > component                        | [ui-patterns.md#L430](ui-patterns.md#L430)                 |
| J/K navigation blocked by auto-focused input                                  | Use autoFocus prop + Enter/ESC edit mode                              | [ui-patterns.md#L880](ui-patterns.md#L880)                 |
| ProseMirror "$ prefix reserved"                                               | Rename `$from` → `from`                                               | [svelte-reactivity.md#L450](svelte-reactivity.md#L450)     |
| Code blocks show plain text, no syntax colors                                 | Use prosemirror-highlight + lowlight                                  | [ui-patterns.md#L760](ui-patterns.md#L760)                 |
| Typing `-` or `1.` doesn't create lists                                       | Use addListNodes() from prosemirror-schema-list                       | [ui-patterns.md#L1150](ui-patterns.md#L1150)               |
| ProseMirror menu doesn't insert selection                                     | Capture range eagerly, pass as parameter                              | [ui-patterns.md#L1200](ui-patterns.md#L1200)               |
| Users logged out on browser close                                             | Set cookieConfig.maxAge                                               | [convex-integration.md#L100](convex-integration.md#L100)   |
| File not found in Convex                                                      | Use TypeScript imports                                                | [convex-integration.md#L140](convex-integration.md#L140)   |
| `InvalidConfig`: hyphens in filename                                          | Use camelCase names                                                   | [convex-integration.md#L140](convex-integration.md#L140)   |
| Redundant API paths (api.x.x)                                                 | File=noun, Function=verb                                              | [convex-integration.md#L190](convex-integration.md#L190)   |
| `.toLocaleDateString is not a function`                                       | Wrap Convex timestamps in new Date()                                  | [convex-integration.md#L490](convex-integration.md#L490)   |
| Custom JWT auth fails, cyclic import errors                                   | Convex requires OIDC, not raw JWT. Use userId parameter temporarily   | [convex-integration.md#L680](convex-integration.md#L680)   |
| After git stash: "Not authenticated" runtime errors                           | Backend/frontend out of sync. Re-add userId parameters                | [convex-integration.md#L690](convex-integration.md#L690)   |
| Production database empty after deployment                                    | Deployed to dev instead of production, need CONVEX_DEPLOY_KEY_PROD    | [convex-integration.md#L750](convex-integration.md#L750)   |
| Feature branches outdated after merge                                         | Merge main into branches before deleting merged branch                | [convex-integration.md#L800](convex-integration.md#L800)   |
| Unit tests pass but bugs slip through to production                           | Add integration tests with convex-test                                | [convex-integration.md#L900](convex-integration.md#L900)   |
| Test cleanup fails: "Delete on non-existent doc"                              | Check document exists before deleting in cleanup                      | [convex-integration.md#L1050](convex-integration.md#L1050) |
| `Module "convex-svelte" has no exported member 'useMutation'`                 | Use useConvexClient() + client.mutation() for imperative operations   | [convex-integration.md#L1650](convex-integration.md#L1650) |
| Content disappears when typing in editor, or editor loses focus on every update | Use role-based rendering: secretary uses local state, viewers use backend state with {#key} | [svelte-reactivity.md#L1200](svelte-reactivity.md#L1200)   |
| Entity creator not visible in member/attendee lists, dropdown shows empty after creation | Auto-add creator to associated table (meetingAttendees, teamMembers, etc.) | [convex-integration.md#L1700](convex-integration.md#L1700) |
| User isolation test fails - User 2 sees User 1's data                         | Use counter + timestamp for unique session IDs                        | [convex-integration.md#L1100](convex-integration.md#L1100) |
| Test fails: "Session not found" with getAuthUserId(ctx)                       | Use sessionId parameter pattern or skip test (convex-test limit)      | [convex-integration.md#L1150](convex-integration.md#L1150) |
| UI feature shows for manual entries but should only show for API-synced items | Check sync metadata field (lastSyncedAt), not just type or externalId | [convex-integration.md#L370](convex-integration.md#L370)   |
| Type annotations extremely long and hard to read with inline import() syntax | Use top-level imports: `import type { Doc } from '...'`                | [convex-integration.md#L1600](convex-integration.md#L1600) |
| Analytics events missing in PostHog                                           | Use server-side tracking                                              | [analytics.md#L10](analytics.md#L10)                       |
| ESLint errors in test files blocking CI                                       | Relax rules for test files (allow `any` types)                        | [ci-cd.md#L60](ci-cd.md#L60)                               |
| ESLint rule reports false positives for correct code, 50+ per-line disables   | Disable rule globally with documentation when rule has known limitations | [ci-cd.md#L70](ci-cd.md#L70)                               |
| ESLint warnings for unused Playwright test parameters (`page`, `request`)     | Use actual parameter names + ESLint disable comment (Playwright validates signatures) | [ci-cd.md#L80](ci-cd.md#L80)                               |
| CSS warnings from svelte-check (unused selectors, empty rulesets, @apply)    | Remove unused selectors, empty rulesets; replace @apply with design tokens | [ui-patterns.md#L950](ui-patterns.md#L950)                 |
| Playwright test fails: "did not expect test.use() here"                       | Move test.use() to describe level, not inside test                    | [ci-cd.md#L210](ci-cd.md#L210)                             |
| Cookies not cleared/shared in Playwright tests                                | Use page.request instead of request fixture                           | [ci-cd.md#L220](ci-cd.md#L220)                             |
| E2E test fails with "element not found" on empty data                         | Handle empty state gracefully, use .count() + conditional checks      | [ci-cd.md#L230](ci-cd.md#L230)                             |
| Logout in one tab doesn't invalidate other tabs                               | Test multi-tab session invalidation with context.newPage()            | [ci-cd.md#L240](ci-cd.md#L240)                             |
| CSRF validation tests return 200 instead of 400/403, security not detected   | Use isolated request context (playwright.request.newContext)          | [ci-cd.md#L245](ci-cd.md#L245)                             |
| Tests fail with 401/500 "Session not found" from prev tests                   | Skip gracefully if session invalid (test.skip())                      | [ci-cd.md#L260](ci-cd.md#L260)                             |
| E2E tests hit rate limits with "Too many requests" errors from external APIs  | Pass skipEmail parameter from SvelteKit server (don't set E2E_TEST_MODE in Convex env) | [ci-cd.md#L1320](ci-cd.md#L1320)                             |
| Verification emails not sent in production, E2E_TEST_MODE set in Convex env  | Pass skipEmail parameter from SvelteKit server instead of Convex env var | [ci-cd.md#L1320](ci-cd.md#L1320)                             |

## 🟢 REFERENCE Patterns (Best Practices)

| Topic                       | Pattern                                                     | Details                                                  |
| --------------------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| Card design                 | Use generous padding                                        | [ui-patterns.md#L60](ui-patterns.md#L60)                 |
| Admin pages cluttered, everything in one card, hard to scan | Single-column card layout with each section as its own card, consistent spacing | [ui-patterns.md#L4580](ui-patterns.md#L4580)                 |
| Feature flag descriptions vague, don't explain impact | Write descriptions with action verbs, specific routes, user impact, behavior details | [ui-patterns.md#L4640](ui-patterns.md#L4640)                 |
| Header alignment            | Fixed height with tokens                                    | [ui-patterns.md#L120](ui-patterns.md#L120)               |
| Edit mode toggle            | Separate view/edit states                                   | [ui-patterns.md#L170](ui-patterns.md#L170)               |
| Card removal (Tinder-like)  | Queue-based removal                                         | [ui-patterns.md#L220](ui-patterns.md#L220)               |
| Visual feedback             | Show overlay before action                                  | [ui-patterns.md#L280](ui-patterns.md#L280)               |
| Loading feels generic       | Contextual overlay + progressive stages + zero flash        | [ui-patterns.md#L1950](ui-patterns.md#L1950)             |
| Overlay below toasts        | Reusable overlay with z-[9999] + flow-based messages        | [ui-patterns.md#L2200](ui-patterns.md#L2200)             |
| Toast notifications         | svelte-sonner for user feedback                             | [ui-patterns.md#L1660](ui-patterns.md#L1660)             |
| Rate limit errors           | Red error box + live countdown timer                        | [ui-patterns.md#L2000](ui-patterns.md#L2000)             |
| Textarea auto-resize        | Remove h-full, use field-sizing                             | [ui-patterns.md#L330](ui-patterns.md#L330)               |
| Schedule non-blocking emails | Use ctx.scheduler.runAfter(0, ...) for async email sending | [convex-integration.md#L3365](convex-integration.md#L3365) |
| Command palette drama       | Dark overlay + blur + animation                             | [ui-patterns.md#L480](ui-patterns.md#L480)               |
| Command input design        | Icon + transparent + shortcuts                              | [ui-patterns.md#L530](ui-patterns.md#L530)               |
| N vs C keyboard shortcuts   | N=new, C=command center                                     | [ui-patterns.md#L580](ui-patterns.md#L580)               |
| Control panel system        | Toolbar/popover/embedded controls                           | [ui-patterns.md#L620](ui-patterns.md#L620)               |
| Atomic components           | Reusable KeyboardShortcut, FormInput                        | [ui-patterns.md#L680](ui-patterns.md#L680)               |
| ProseMirror integration     | Rich text with AI detection                                 | [ui-patterns.md#L730](ui-patterns.md#L730)               |
| Compact modal design        | Linear-style tight spacing, input-sized fields              | [ui-patterns.md#L830](ui-patterns.md#L830)               |
| Inline CRUD forms               | Add/edit/delete in list + hover actions + single $state | [ui-patterns.md#L2800](ui-patterns.md#L2800)             |
| Hierarchical ESC navigation | Blur input → refocus modal → close                          | [ui-patterns.md#L930](ui-patterns.md#L930)               |
| Premium animations          | Spring physics + staggered transitions                      | [ui-patterns.md#L1150](ui-patterns.md#L1150)             |
| Approval workflows          | Request table + pending status + real-time query for approver | [convex-integration.md#L1750](convex-integration.md#L1750) |
| Real-time presence tracking | Heartbeat mutation + lastSeenAt threshold + auto-cleanup | [convex-integration.md#L1800](convex-integration.md#L1800) |
| Navigation architecture     | Remove sidebar, add breadcrumbs + hub pages                 | [ui-patterns.md#L1260](ui-patterns.md#L1260)             |
| Sidebar feature flags       | Pass flag props, conditionally render nav links             | [feature-flags.md#L750](feature-flags.md#L750)           |
| Type safety for Convex      | Use shared type definitions                                 | [convex-integration.md#L240](convex-integration.md#L240) |
| Discriminated unions        | Type narrowing with discriminator                           | [convex-integration.md#L290](convex-integration.md#L290) |
| Enum to database strings    | Explicit conversion functions                               | [convex-integration.md#L340](convex-integration.md#L340) |
| Event naming                | snake_case + past tense                                     | [analytics.md#L60](analytics.md#L60)                     |
| Centralized config          | Single config.ts file                                       | [convex-integration.md#L390](convex-integration.md#L390) |
| Reusable entity tagging     | Helper + type-safe wrappers                                 | [convex-integration.md#L440](convex-integration.md#L440) |
| Lock dev server port        | strictPort: true to prevent drift                           | [auth-deployment.md#L310](auth-deployment.md#L310)       |
| User identity               | Dual ID system (userId + workosId) for provider flexibility | [auth-deployment.md#L360](auth-deployment.md#L360)       |
| Personal content ownership  | ownershipType='user' within org context (users always have orgs) | [auth-deployment.md#L410](auth-deployment.md#L410)       |
| Multi-account support       | Account linking for Slack-style switching                   | [auth-deployment.md#L460](auth-deployment.md#L460)       |
| Account linking direction   | Create bidirectional links for symmetry                     | [auth-deployment.md#L710](auth-deployment.md#L710)       |
| E2E testing for auth        | 4-layer defense (static + unit + E2E + CI/CD)               | [auth-deployment.md#L1060](auth-deployment.md#L1060)     |
| E2E test selectors          | Use text-based + emoji selectors (no data-testid)           | [ci-cd.md#L250](ci-cd.md#L250)                           |
| Playwright env vars         | Use npm scripts + webServer.env (no dotenv needed)          | [ci-cd.md#L270](ci-cd.md#L270)                           |
| Ticket writing for AI       | User stories + technical detail for parallel AI execution   | [ticket-writing.md](ticket-writing.md)                   |
| Split overlapping tickets   | Separate by technical boundary for parallel implementation  | [ticket-writing.md](ticket-writing.md)                   |
| AI-ready ticket structure   | Clear scope, files, patterns, success criteria              | [ticket-writing.md](ticket-writing.md)                   |
| Module API contracts        | Create interface for composables to enable loose coupling   | [modularity-refactoring-analysis.md#L84](../architecture/modularity-refactoring-analysis.md#L84) |
| Components depend on internal types, refactoring breaks dependent modules | Migrate to public API interfaces instead of ReturnType<typeof composable> | [convex-integration.md#L3650](convex-integration.md#L3650) |
| Incremental CI gates        | Enable lint/build first, defer type check to separate work  | [ci-cd.md#L10](ci-cd.md#L10)                             |
| Local CI testing            | npm scripts > shell scripts for consistency                 | [ci-cd.md#L110](ci-cd.md#L110)                           |
| Secret scanning             | TruffleHog with .secretsignore for safe patterns            | [ci-cd.md#L160](ci-cd.md#L160)                           |

---

## Quick Navigation

- **Authentication & Deployment** → [auth-deployment.md](auth-deployment.md)
- **Svelte 5 Reactivity** → [svelte-reactivity.md](svelte-reactivity.md)
- **Convex Integration** → [convex-integration.md](convex-integration.md)
- **UI/UX Patterns** → [ui-patterns.md](ui-patterns.md)
- **Analytics (PostHog)** → [analytics.md](analytics.md)
- **CI/CD & Tooling** → [ci-cd.md](ci-cd.md)
- **Ticket Writing** → [ticket-writing.md](ticket-writing.md)

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

````markdown
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
````

**Apply when**: When to use this pattern  
**Related**: #L[OTHER] (Description)

```

---

**Last Updated**: 2025-11-19
**Pattern Count**: 97
**Format Version**: 2.0
```

|| Email validation accepts invalid emails like `asdfasdf@asdfasdf` (no TLD)                        | Use regex `/^[^\s@]+@[^\s@]+\.[a-zA-Z0-9]{2,}$/` for TLD validation (frontend + backend) | [ui-patterns.md#L3300](ui-patterns.md#L3300)            |
|| Form errors only shown in toast, user doesn't know which field has problem                      | Set inline error state + display below input field (dual feedback: toast + inline)      | [ui-patterns.md#L3350](ui-patterns.md#L3350)            |
|| Organization owners can't perform actions even though they should have full access                | Check owner role first, bypass RBAC permission check if owner (implicit privileges)    | [convex-integration.md#L3300](convex-integration.md#L3300) |
|| Permission denied errors for basic operations like creating teams/circles                          | Use organization membership check instead of RBAC for basic CRUD (match existing patterns) | [convex-integration.md#L3400](convex-integration.md#L3400) |
|| User registers via invite link, verifies email, but redirected to `/invite` showing unauthenticated UI | Accept invite server-side after session establishment, redirect directly to organization | [convex-integration.md#L3500](convex-integration.md#L3500) |
|| User logs in from invite link, redirected back to `/invite` showing "Sign in" screen | Accept invite server-side in login handler before redirect, handle both org and team invites | [convex-integration.md#L3600](convex-integration.md#L3600) |
|| Redirecting to `/org/{organizationId}` results in 404 error                                     | Use query parameter pattern: `/org/circles?org={organizationId}`                        | [ui-patterns.md#L3400](ui-patterns.md#L3400)                |
|| Roles appear underneath child circles instead of alongside them in nested bubble chart          | Include roles as synthetic circle nodes in D3 hierarchy (pack alongside, not separate) | [ui-patterns.md#L3500](ui-patterns.md#L3500)                |
| Roles in nested bubble chart all appear same size, despite hierarchy depth                     | Scale role sizes based on parent depth with large baseSize values (D3 scales proportionally) | [ui-patterns.md#L3570](ui-patterns.md#L3570)                |
| Documentation shows wrong project name, outdated status, incorrect code references, broken links | Verify against implementation: project name, status, permission slugs, links, dates, language | [ui-patterns.md#L3730](ui-patterns.md#L3730)                |
