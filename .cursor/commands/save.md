# save

**Purpose**: Capture knowledge and commit work.

---

## For AI Assistants

**Tool usage strategy:**
1. **Batch parallel operations** - Read multiple files simultaneously when independent
2. **Use grep first** - Search patterns before reading full files
3. **Stage all files once** - Single `git add` for all changed files
4. **Commit with multi-line message** - Use `-m` multiple times for body paragraphs
5. **Ask before pushing** - Always prompt "Push to GitHub? (Y/N)" after commit

**Key workflow:**
- Step 1: Analyze as user story + capture flow metrics data
- Step 2: Use `grep` to search INDEX.md and domain files in parallel
- Step 3: Use `search_replace` or `write` for updates
- Step 4: Stage → commit with visual format → show `git log -1 --stat`
- Step 5: Prompt user, then push if Y

---

## Workflow

### 1. Analyze Session - Frame as User Story + Flow Metrics

**Think outcome-driven, not output-driven:**

- **WHO** benefits from this change? (user, developer, contributor, AI assistant)
- **WHAT VALUE** was delivered? (faster workflow, less errors, better UX)
- **WHAT SLICE** was completed? (thin, end-to-end functionality that provides value)

**User Story Format:**
```
As a [user type]
I can now [capability]
So that [outcome/value]
```

**Vertical Slice Thinking:**
- What end-to-end flow works now that didn't before?
- What pain point was removed?
- What new capability can users access?

**Flow Metrics Capture:**
- **Type**: feature | bugfix | tech-debt | docs | refactor
- **Size**: small (<4h) | medium (4-16h) | large (>16h)
- **Flow Days**: Total days from start to done
- **Active Hours**: Actual coding/thinking time
- **Blocked Hours**: Time waiting for something
- **Files Changed**: Count from git stat
- **Impact**: high | medium | low (value/risk assessment)

**Pattern Learning:**
- What patterns emerged while building this slice?
- What mistakes were avoided (or made and fixed)?

### 2. Audit Existing Patterns

**Search `dev-docs/patterns/INDEX.md`**:
1. Scan symptom tables for matches
2. Grep domain files for keywords
3. Check Related links in found patterns

**Decision**:
- **Exact match exists**: Update existing pattern (add edge case, enhance example)
- **Similar exists**: Add new pattern + link to related
- **Nothing found**: Create new pattern

### 3. Update Patterns ⭐ DO THIS FIRST

#### If Updating Existing Pattern:

1. Open domain file (svelte-reactivity.md, etc.)
2. Find pattern by line number (#L10, #L50, etc.)
3. Enhance:
   - Add edge case to Root Cause
   - Add example to Fix section
   - Update Related links
4. **Don't change line numbers** (keep L10, L50 stable)

#### If Adding New Pattern:

1. Choose domain file:
   - Svelte 5 reactivity → `svelte-reactivity.md`
   - Convex integration → `convex-integration.md`
   - UI/UX → `ui-patterns.md`
   - PostHog → `analytics.md`

2. Add pattern with **next line number** (gaps of 30-50):
   ```markdown
   ## #L[NUMBER]: Pattern Name [🔴/🟡/🟢 SEVERITY]

   **Symptom**: One-line description
   **Root Cause**: One-line cause
   **Fix**: 

   ```[language]
   // ❌ WRONG
   wrong code

   // ✅ CORRECT
   correct code
   ```

   **Apply when**: When to use
   **Related**: #L[OTHER] (Description)
   ```

3. **Validate with Context7** (if library-specific):
   - Svelte 5: `/sveltejs/svelte`
   - Convex: `/get-convex/convex-backend`

4. **Update INDEX.md**:
   - Add symptom → line number in appropriate severity table
   - Choose severity: 🔴 Critical (breaks functionality), 🟡 Important (common issue), 🟢 Reference (best practice)

### 4. Commit

Use **Gitmoji + Tables + Conventional Commits** format with outcome focus.

#### Format Template

```
🎯 type(scope): [what users can now do]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📖 USER STORY                                                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

| Role | Capability | Value |
|------|------------|-------|
| **As a** [who] | **I can now** [what] | **So that** [why] |

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ SLICE COMPLETED                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

[1-2 sentences describing the end-to-end functionality delivered]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🧭 JOURNEY                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

| Step | What Happened | Result |
|------|---------------|--------|
| 🔴 **Tried** | [first approach] | ❌ Failed |
| ⚠️ **Because** | [why it didn't work] | 💡 Learned |
| ✅ **Solution** | [what actually worked] | 🎉 Shipped |

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📐 PATTERN                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

| Property | Value |
|----------|-------|
| **Type** | 🆕 Added / 🔄 Updated / ✓ Applied |
| **Name** | "Pattern Name" (#L[NUMBER]) |
| **File** | `dev-docs/patterns/[domain].md` |
| **Severity** | 🔴 Critical / 🟡 Important / 🟢 Reference |

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📊 FLOW METRICS                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

| Metric | Value | Metric | Value |
|--------|-------|--------|-------|
| 🏷️ **Type** | feature / bugfix / tech-debt / docs / refactor | 📦 **Size** | small / medium / large |
| ⏱️ **Flow Days** | [number] | ⚡ **Active Hours** | [number] |
| 🚧 **Blocked Hours** | [number] | 📁 **Files Changed** | [number] |
| 💥 **Impact** | high / medium / low | | |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 **AI:** [collaboration notes]
🔗 **Closes:** #[issue]
```

#### Gitmoji Guide (Subject Line)

Use at start of subject line for visual context:

| Gitmoji | Code | When to Use |
|---------|------|-------------|
| ✨ | `:sparkles:` | New feature |
| 🐛 | `:bug:` | Bug fix |
| 📝 | `:memo:` | Documentation |
| 🎨 | `:art:` | Improve structure/format |
| ⚡️ | `:zap:` | Performance improvement |
| ♻️ | `:recycle:` | Refactor code |
| 💄 | `:lipstick:` | UI/style updates |
| 🔒️ | `:lock:` | Security fix |
| 🚑️ | `:ambulance:` | Critical hotfix |
| 💡 | `:bulb:` | Add comments |
| ✅ | `:white_check_mark:` | Add tests |

#### Type & Scope

**Types:**
- `feat:` - New feature (use ✨)
- `fix:` - Bug fix (use 🐛)
- `docs:` - Documentation/patterns (use 📝)
- `refactor:` - Code improvement (use ♻️)
- `style:` - Design tokens, UI polish (use 💄)
- `test:` - Test additions (use ✅)
- `chore:` - Maintenance (use 🔧)

**Scopes:**
- `inbox`, `notes`, `flashcards`, `sync`, `auth`, `ui`, `composables`, `docs`, `commands`

#### Complete Example

```
✨ feat(inbox): power users process inbox 10x faster with keyboard nav

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📖 USER STORY                                                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

| Role | Capability | Value |
|------|------------|-------|
| **As a** power user processing dozens of inbox items | **I can now** navigate with J/K shortcuts (Gmail/Linear style) | **So that** I can fly through my inbox without touching the mouse |

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ SLICE COMPLETED                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Full keyboard navigation: **J** moves down, **K** moves up, wraps at 
boundaries, respects focus context. Power users can now fly through inbox.

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🧭 JOURNEY                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

| Step | What Happened | Result |
|------|---------------|--------|
| 🔴 **Tried** | Simple event listeners on mount | ❌ Failed |
| ⚠️ **Because** | Fired during typing, broke modals | 💡 Learned |
| ✅ **Solution** | Context-aware composable with focus checks | 🎉 Shipped |

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📐 PATTERN                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

| Property | Value |
|----------|-------|
| **Type** | 🆕 Added |
| **Name** | "Context-Aware Keyboard Shortcuts" (#L320) |
| **File** | `dev-docs/patterns/ui-patterns.md` |
| **Severity** | 🟢 Reference |

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📊 FLOW METRICS                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

| Metric | Value | Metric | Value |
|--------|-------|--------|-------|
| 🏷️ **Type** | feature | 📦 **Size** | medium |
| ⏱️ **Flow Days** | 2 | ⚡ **Active Hours** | 8 |
| 🚧 **Blocked Hours** | 0 | 📁 **Files Changed** | 5 |
| 💥 **Impact** | high | | |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 **AI:** Claude suggested circular navigation at list boundaries
🔗 **Closes:** #67
```

**📖 Teaching Notes:**

**User Stories:** "As a [who], I want [what], so that [why]". The "so that" explains outcome/value, keeping us focused on user value over outputs.

**Vertical Slicing:** Thin, end-to-end functionality that delivers value. Build one complete flow (UI → logic → data) instead of layers.

**Flow Metrics:** Turn git history into product analytics. Track velocity, cycle time, efficiency, and distribution to spot patterns and improve.

**Gitmoji:** Visual commit icons make git history scannable and fun. Align with our brand: dramatic but funny, technical but human.

#### Anti-Patterns

**Technical-focused (not outcome-focused):**
- ❌ `fix(notes): clear state on switch` → ✅ `🐛 fix(notes): users see correct note immediately`
- ❌ `feat: added keyboard shortcuts` → ✅ `✨ feat: power users process inbox 10x faster`
- ❌ `docs: updated patterns` → ✅ `📝 docs: developers avoid Svelte 5 gotchas`

**Missing visual elements:**
- ❌ No gitmoji in subject line
- ❌ Plain text instead of tables
- ❌ Missing flow metrics section
- ❌ No journey table showing learning

**Missing context:**
- ❌ `Fixed bug` - Which bug? What value delivered?
- ❌ `Updated files` - What capability enabled?
- ❌ Missing USER STORY when change impacts users
- ❌ Missing SLICE explanation

**Do NOT push yet** - proceed to step 5.

### 5. Push to GitHub

After successful commit, ask user:

**"Push to GitHub? (Y/N)"**

- **Y** → Run `git push` with `['all']` permissions
- **N** → Done. Commit stays local.

Keep response concise. Show push result or "Staying local" confirmation.

---

## Pattern Severity Guide

- **🔴 CRITICAL**: Causes errors, blocks work, breaks functionality
  - Example: State not updating, undefined Convex errors
  
- **🟡 IMPORTANT**: Common issues, significant UX impact
  - Example: Dropdowns broken, sessions expire, analytics missing
  
- **🟢 REFERENCE**: Best practices, optimizations, nice-to-have
  - Example: Card spacing, naming conventions, type patterns

---

## Checklist

**Before Committing:**
- [ ] Searched INDEX.md for existing patterns (grep tool)
- [ ] Decided: update existing or create new
- [ ] Updated domain file with pattern/enhancement (search_replace)
- [ ] Validated with Context7 (if library-specific)
- [ ] Updated INDEX.md symptom table
- [ ] Chose correct severity (🔴🟡🟢)

**Commit Message:**
- [ ] Used gitmoji + conventional commit format
- [ ] Created USER STORY table with role/capability/value
- [ ] Described SLICE (end-to-end functionality delivered)
- [ ] Added JOURNEY table if iteration 2+ (tried/because/solution)
- [ ] Created PATTERN table if applicable (type/name/file/severity)
- [ ] Filled FLOW METRICS table (8 data points)
- [ ] Credited AI collaboration if applicable
- [ ] Added issue reference if applicable (Closes #123)

**After Commit:**
- [ ] Showed commit with `git log -1 --stat`
- [ ] Asked user: "Push to GitHub? (Y/N)"
- [ ] Executed user's choice (push or stay local)

---

## Anti-Patterns

- ❌ Don't duplicate patterns - search first
- ❌ Don't change line numbers - keep them stable
- ❌ Don't skip Context7 validation for library patterns
- ❌ Don't commit before capturing knowledge
- ❌ Don't add to Critical unless it breaks functionality
- ❌ Don't push without asking user first
- ❌ Don't use multiple git add commands - batch all files
- ❌ Don't skip gitmoji - makes history scannable
- ❌ Don't skip flow metrics - we need data for analysis

---

## Quick AI Workflow

```
1. Analyze → Frame as user story + capture flow metrics
   - WHO benefits? WHAT VALUE? WHAT SLICE?
   - Type, size, days, hours, blocked, files, impact
   
2. grep INDEX.md → Check existing patterns

3. Update patterns → search_replace domain files + INDEX.md

4. Commit with visual format:
   - Gitmoji + subject (outcome-focused)
   - USER STORY table
   - SLICE description
   - JOURNEY table (if iteration 2+)
   - PATTERN table (if applicable)
   - FLOW METRICS table (always)
   - AI credit + issue close
   
5. Ask: "Push to GitHub? (Y/N)"
   → Y: git push (requires ['all'] permissions)
   → N: "✅ Committed locally. Not pushed."
```

**End message format:**
- If pushed: "✅ Pushed to GitHub. Commit [hash]"
- If not pushed: "✅ Committed locally. Not pushed."

Keep it short. User wants concise confirmations.
