# save

**Purpose**: Capture knowledge, update Linear tickets, and commit work.

---

# 🚨🚨🚨 CRITICAL: Linear Ticket Required 🚨🚨🚨

## ⛔ **DO NOT PROCEED WITHOUT LINEAR TICKET ID**

**BEFORE doing ANYTHING (analyzing, updating patterns, committing):**

### Step 1: Check for Linear Ticket ID

**Look in the conversation for:**
- "SYOS-123" or "SYOS-XXX" format
- "ticket SYOS-123"
- "Linear ticket"
- Any mention of a Linear issue ID

### Step 2: Decision

**IF NO TICKET ID FOUND:**
```
❌ STOP IMMEDIATELY - I cannot save work without a Linear ticket ID.

Please provide:
- Linear ticket ID (e.g., SYOS-123)
- OR say "create new ticket" and I'll help you create one

Once I have a ticket ID, I'll proceed with saving.
```

**IF TICKET ID FOUND:**

1. **Get ticket details** using `mcp_Linear_get_issue({ id: 'SYOS-123' })`
2. **Check project ID** (REQUIRED unless user explicitly says "no"):
   - If missing → Ask user: "Ticket SYOS-123 has no project ID. Which project should this belong to? (Say 'no project' to skip)"
   - If user says "no project" → Continue (only exception)
   - If user provides project → Get/create project → Update ticket with `projectId`
   - If project ID exists → Continue
3. **Check assignee** (ALWAYS set to Randy):
   - If missing or not Randy → Update ticket with `assigneeId: 'c7c555a2-895a-48b6-ae24-d4147d44b1d5'`
4. **Check estimate** (ALWAYS numeric):
   - If missing or label (like "m") → Convert to numeric (m=3, s=2, l=4, etc.) and update ticket
   - Use `estimate: 0-5` (numeric, not label)
   - Default to `2` (s) if cannot determine

**DO NOT:**
- ❌ Analyze work (until ticket validated)
- ❌ Update patterns (until ticket validated)
- ❌ Commit changes (until ticket validated)
- ❌ Do ANY work (until ticket validated)

**ONLY AFTER ticket validated → Continue below**

---

## ✅ If Ticket ID Present - Continue with Save Workflow

---

## For AI Assistants

**Tool usage strategy:**

1. **Batch parallel operations** - Read multiple files simultaneously when independent
2. **Use grep first** - Search patterns before reading full files
3. **Stage all files once** - Single `git add` for all changed files
4. **Commit with multi-line message** - Use `-m` multiple times for body paragraphs
5. **Never push to main** - Commit locally only (user will push when ready)

**Project Info:**

- **Production Domain**: `www.synergyos.ai` (always use www prefix, not synergyos.dev or synergyos.ai)
- **GitHub Repo**: `synergyai-os/Synergy-Open-Source`

**🎯 Pattern Files Location:**

- **INDEX**: `dev-docs/2-areas/patterns/INDEX.md` (symptom lookup table)
- **Domain Files** (add patterns here):
  - `dev-docs/2-areas/patterns/svelte-reactivity.md`
  - `dev-docs/2-areas/patterns/convex-integration.md`
  - `dev-docs/2-areas/patterns/ui-patterns.md`
  - `dev-docs/2-areas/patterns/analytics.md`
  - `dev-docs/2-areas/patterns/auth-deployment.md`

**⚠️ DON'T read `patterns-and-lessons.md`** - it's just a redirect file. Go directly to the files above.

**Key workflow:**

- Step 0: **🚨 Check for Linear ticket ID** (STOP if missing)
- Step 1: Analyze as user story + capture flow metrics + determine flow distribution
- Step 2: **Update Linear ticket** (acceptance criteria, files changed, commits list)
- Step 3: Use `grep` to search `dev-docs/2-areas/patterns/INDEX.md` and domain files in parallel
- Step 4: Use `search_replace` to update domain files + INDEX.md
- Step 5: Stage → commit with optimized format (include `Linear: SYOS-123`) → show `git log -1 --stat`
- Step 6: Report status (don't push to GitHub)

---

## Workflow

### 0. 🚨 Validate & Update Linear Ticket (DO THIS FIRST)

**Before analyzing or committing, validate and update the Linear ticket:**

1. **Get ticket ID from conversation** (e.g., SYOS-123)

2. **Get ticket details** to check current state:
   ```typescript
   const ticket = await mcp_Linear_get_issue({ id: 'SYOS-123' });
   
   // Check project ID
   if (!ticket.projectId) {
     // Ask user for project (only continue if they say "no project")
     // If user provides project → Update ticket with projectId
   }
   
   // Check assignee (ALWAYS set to Randy)
   const RANDY_USER_ID = 'c7c555a2-895a-48b6-ae24-d4147d44b1d5';
   if (!ticket.assignee || ticket.assignee.id !== RANDY_USER_ID) {
     // Update ticket with assigneeId
   }
   
   // Check estimate (convert labels to numeric)
   const ESTIMATES = { none: 0, xs: 1, s: 2, m: 3, l: 4, xl: 5 };
   let estimate = ticket.estimate;
   if (!estimate || typeof estimate === 'string') {
     // Convert label to numeric (e.g., "m" → 3)
     estimate = ESTIMATES[estimate as keyof typeof ESTIMATES] || 2; // Default to "s"
     // Update ticket with numeric estimate
   }
   ```

3. **Update ticket with completion status** (preserve projectId, assigneeId, estimate):
   ```typescript
   // Constants from /linear command
   const RANDY_USER_ID = 'c7c555a2-895a-48b6-ae24-d4147d44b1d5';
   const ESTIMATES = { none: 0, xs: 1, s: 2, m: 3, l: 4, xl: 5 };
   
   // Get ticket details first (from step 2)
   const ticket = await mcp_Linear_get_issue({ id: 'SYOS-123' });
   
   // Ensure project ID (REQUIRED unless user explicitly says "no project")
   let projectId = ticket.projectId;
   if (!projectId) {
     // Ask user: "Ticket SYOS-123 has no project ID. Which project should this belong to? (Say 'no project' to skip)"
     // If user says "no project" → Continue with projectId = null/undefined
     // If user provides project name → Get/create project → projectId = project.id
     // If user doesn't respond → STOP (project ID is required)
   }
   
   // Ensure assignee is Randy (ALWAYS)
   const assigneeId = RANDY_USER_ID;
   
   // Ensure estimate is numeric (convert labels)
   let estimate = ticket.estimate;
   if (!estimate || typeof estimate === 'string') {
     estimate = ESTIMATES[estimate as keyof typeof ESTIMATES] || 2; // Default to "s" (2)
   }
   
   // Update ticket with completion status (preserve projectId, assigneeId, estimate)
   await mcp_Linear_update_issue({
     id: 'SYOS-123',
     projectId: projectId, // ✅ Preserve or set from user
     assigneeId: assigneeId, // ✅ ALWAYS Randy
     estimate: estimate, // ✅ Numeric (0-5)
     description: `
     **Acceptance Criteria** (AI checks these off when complete):
     - [x] Requirement 1 ← Completed
     - [x] Requirement 2 ← Completed
     - [ ] Requirement 3 ← Still pending
     
     **Files Changed** (AI updates with ✅ when done):
     - ✅ path/to/file.ts - What changed
     - ✅ path/to/component.svelte - What changed
     
     **Implementation Notes** (AI adds as work progresses):
     - Key decision: Used composable pattern
     - Edge case: Handled null values
     
     **Commits** (AI adds when committing):
     - [commit-hash] - Description
     `
   });
   ```

4. **Add completion comment**:
   ```typescript
   await mcp_Linear_create_comment({
     issueId: 'SYOS-123',
     body: '✅ Ready for review - [Brief description of what shipped] | Commit: [hash]'
   });
   ```

5. **Mark ticket as "In Review"** (preserve projectId, assigneeId, estimate):
   ```typescript
   await mcp_Linear_update_issue({
     id: 'SYOS-123',
     projectId: projectId, // ✅ Preserve from step 2
     assigneeId: RANDY_USER_ID, // ✅ ALWAYS Randy
     estimate: estimate, // ✅ Numeric (preserve from step 2)
     state: 'In Review' // Human will mark "Done" after testing
   });
   ```

**See**: `/linear` command for complete ticket update workflow

---

### 1. Analyze Session - Frame as User Story + Flow Metrics

**Think outcome-driven, not output-driven:**

- **WHO** benefits from this change? (user, developer, contributor, AI assistant)
- **WHAT VALUE** was delivered? (faster workflow, less errors, better UX)
- **WHAT SLICE** was completed? (thin, end-to-end functionality that provides value)

**Flow Distribution - Categorize the work** (for Linear tracking):

- **🎯 [FEATURE]** - New capability for users
- **🐛 [BUGFIX]** - Fix broken functionality
- **🔧 [TECH-DEBT]** - Code quality, refactoring, architecture
- **📚 [DOCS]** - Documentation, patterns, guides
- **🔒 [RISK]** - Security, critical hotfixes, data integrity

**⚠️ Linear Integration:**

- **Ticket ID MUST be in conversation** (checked in Step 0)
- **Update ticket BEFORE committing** (Step 0 workflow)
- **Commit message MUST include**: `Linear: SYOS-123`
- **Flow Distribution label**: Already set when ticket was created (`feature`, `bug`, `tech-debt`, or `risk`)

**See**: `/linear` command for complete Linear workflow and constants

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
- **Scope**: inbox | notes | flashcards | sync | auth | ui | composables | docs | commands
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

**🔍 Search Strategy (use grep tool in parallel):**

1. **Search INDEX**: `grep` in `dev-docs/2-areas/patterns/INDEX.md` for symptom keywords
2. **Search domain files**: `grep` in `dev-docs/2-areas/patterns/*.md` for related patterns
3. **Check line numbers**: Found patterns reference exact line numbers (e.g., #L810)

**Decision tree:**

- **Exact match exists** → Update existing pattern (add edge case, enhance example)
- **Similar pattern exists** → Add new pattern + link to related (#L references)
- **Nothing found** → Create new pattern in appropriate domain file

### 3. Update Patterns ⭐ DO THIS FIRST

**⚠️ CRITICAL**: Always update patterns BEFORE committing code changes!

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
   - Svelte 5 reactivity → `dev-docs/2-areas/patterns/svelte-reactivity.md`
   - Convex integration → `dev-docs/2-areas/patterns/convex-integration.md`
   - UI/UX → `dev-docs/2-areas/patterns/ui-patterns.md`
   - PostHog → `dev-docs/2-areas/patterns/analytics.md`

2. Add pattern with **next line number** (gaps of 30-50):

   ````markdown
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
   ````

   **Apply when**: When to use
   **Related**: #L[OTHER] (Description)

   ```

   ```

3. **Validate with Context7** (if library-specific):
   - Svelte 5: `/sveltejs/svelte`
   - Convex: `/get-convex/convex-backend`

4. **Update `dev-docs/2-areas/patterns/INDEX.md`**:
   - Add symptom → line number in appropriate severity table
   - Choose severity: 🔴 Critical (breaks functionality), 🟡 Important (common issue), 🟢 Reference (best practice)

### 4. Commit

**⚠️ CRITICAL**: Commit message MUST include `Linear: SYOS-123` (use ticket ID from conversation)

Use **optimized format** for GitHub list view display.

#### Format Template

```
[ICON CATEGORY] outcome-focused description (max 50 chars)

TYPE: X | SCOPE: Y | SIZE: Z | DAYS: N | IMPACT: I

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 USER STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 AS A: [who]
🎯 I CAN NOW: [what]
💡 SO THAT: [why]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SLICE COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1-2 sentences describing the end-to-end functionality delivered]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧭 JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 TRIED: [first approach]
⚠️ BECAUSE: [why it didn't work]
✅ SOLUTION: [what actually worked]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 PATTERN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 TYPE: Added | Updated | Applied
📝 NAME: "Pattern Name" (#L[NUMBER])
📁 FILE: dev-docs/2-areas/patterns/[domain].md
🟢 SEVERITY: Critical | Important | Reference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FLOW METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏷️ TYPE: feature | bugfix | tech-debt | docs
📦 SIZE: small | medium | large
⏱️ DAYS: [number]
⚡ ACTIVE: [number] hours
🚧 BLOCKED: [number] hours
📁 FILES: [number]
💥 IMPACT: high | medium | low

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI: [collaboration notes]
🔗 Linear: SYOS-123
```

**📖 KEY OPTIMIZATION:**

**First body line is metadata** - this appears in GitHub list view preview!

Instead of raw markdown dividers showing in preview, you see useful data:

- `TYPE: docs | SCOPE: commands | SIZE: large | DAYS: 1 | IMPACT: high`

#### Flow Distribution Categories

| Category       | Icon | When to Use                               | Subject Format                                       |
| -------------- | ---- | ----------------------------------------- | ---------------------------------------------------- |
| 🎯 [FEATURE]   | 🎯   | New user capability                       | `🎯 [FEATURE] power users process inbox 10x faster`  |
| 🐛 [BUGFIX]    | 🐛   | Fix broken functionality                  | `🐛 [BUGFIX] users see correct note immediately`     |
| 🔧 [TECH-DEBT] | 🔧   | Refactor, architecture, code quality      | `🔧 [TECH-DEBT] extract session logic to composable` |
| 📚 [DOCS]      | 📚   | Documentation, patterns                   | `📚 [DOCS] developers avoid Svelte 5 gotchas`        |
| 🔒 [RISK]      | 🔒   | Security, critical hotfix, data integrity | `🔒 [RISK] patch session token leak`                 |

**Character count:** `🎯 [FEATURE] ` = 13 characters → **37 chars for description**

#### Complete Examples

**Feature Example:**

```
🎯 [FEATURE] power users process inbox 10x faster

TYPE: feature | SCOPE: inbox | SIZE: medium | DAYS: 2 | IMPACT: high

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 USER STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 AS A: power user processing dozens of inbox items daily
🎯 I CAN NOW: navigate with J/K shortcuts (like Gmail, Linear)
💡 SO THAT: I can fly through my inbox without touching the mouse

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SLICE COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full keyboard navigation: J moves down, K moves up, wraps at boundaries,
respects focus context. Power users can now fly through inbox.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧭 JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 TRIED: Simple event listeners on component mount
⚠️ BECAUSE: Fired during typing, broke modal shortcuts
✅ SOLUTION: Context-aware composable with focus checks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 PATTERN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🆕 TYPE: Added
📝 NAME: "Context-Aware Keyboard Shortcuts" (#L320)
📁 FILE: dev-docs/2-areas/patterns/ui-patterns.md
🟢 SEVERITY: Reference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FLOW METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏷️ TYPE: feature
📦 SIZE: medium
⏱️ DAYS: 2
⚡ ACTIVE: 8 hours
🚧 BLOCKED: 0 hours
📁 FILES: 5
💥 IMPACT: high

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI: Claude suggested circular navigation at list boundaries
🔗 CLOSES: #67
```

**Bugfix Example:**

```
🐛 [BUGFIX] users see correct note immediately

TYPE: bugfix | SCOPE: notes | SIZE: small | DAYS: 1 | IMPACT: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 USER STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 AS A: user browsing notes
🎯 I CAN NOW: see correct content instantly when switching
💡 SO THAT: I'm not confused by stale data flashing briefly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SLICE COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Note switching now clears previous state before loading new content.
The jarring flash of old content is gone. Smooth transitions achieved.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧭 JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 TRIED: Force re-render with key prop
⚠️ BECAUSE: Race condition with async data load
✅ SOLUTION: Explicit clear() call on note switch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 PATTERN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 TYPE: Updated
📝 NAME: "Component State Management" (#L450)
📁 FILE: dev-docs/2-areas/patterns/svelte-reactivity.md
🟡 SEVERITY: Important

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FLOW METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏷️ TYPE: bugfix
📦 SIZE: small
⏱️ DAYS: 1
⚡ ACTIVE: 3 hours
🚧 BLOCKED: 0 hours
📁 FILES: 2
💥 IMPACT: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Caught while testing Linear-style modal redesign
```

**Documentation Example:**

```
📚 [DOCS] developers avoid Svelte 5 gotchas

TYPE: docs | SCOPE: patterns | SIZE: medium | DAYS: 1 | IMPACT: high

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 USER STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 AS A: developer new to Svelte 5
🎯 I CAN NOW: use the correct $state pattern
💡 SO THAT: my components update reactively without mysterious bugs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SLICE COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documented the single $state object pattern after hitting the gotcha
ourselves. Developers can avoid hours of debugging. We suffered so you
don't have to. 😅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧭 JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 TRIED: Multiple $state variables (seemed cleaner)
⚠️ BECAUSE: Svelte 5 lost track of updates across variables
✅ SOLUTION: Single $state object with getters (actually cleaner!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 PATTERN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🆕 TYPE: Added
📝 NAME: "Single $state Object Pattern" (#L780)
📁 FILE: dev-docs/2-areas/patterns/svelte-reactivity.md
🔴 SEVERITY: Critical

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FLOW METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏷️ TYPE: docs
📦 SIZE: medium
⏱️ DAYS: 1
⚡ ACTIVE: 4 hours
🚧 BLOCKED: 0 hours
📁 FILES: 2
💥 IMPACT: high

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI: Claude suggested the getter pattern and caught edge cases
📚 Updated INDEX.md with symptom entry
```

**Tech Debt Example:**

```
🔧 [TECH-DEBT] extract session logic to composable

TYPE: tech-debt | SCOPE: auth | SIZE: small | DAYS: 1 | IMPACT: low

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 USER STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 AS A: developer maintaining auth code
🎯 I CAN NOW: reuse session logic across components
💡 SO THAT: auth code is DRY and easier to test

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SLICE COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extracted duplicated session management into useSession composable.
Reduced auth code by 40%, improved testability.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧭 JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 TRIED: Extract to utility functions
⚠️ BECAUSE: Lost reactivity when session changed
✅ SOLUTION: Svelte composable with $state

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FLOW METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏷️ TYPE: tech-debt
📦 SIZE: small
⏱️ DAYS: 1
⚡ ACTIVE: 3 hours
🚧 BLOCKED: 0 hours
📁 FILES: 4
💥 IMPACT: low

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI: Suggested composable pattern over utility functions
```

**Risk/Critical Example:**

```
🔒 [RISK] patch session token leak

TYPE: bugfix | SCOPE: auth | SIZE: small | DAYS: 0.5 | IMPACT: high

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 USER STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 AS A: user with sensitive data
🎯 I CAN NOW: trust that my session tokens aren't exposed
💡 SO THAT: my account remains secure

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SLICE COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session tokens were logged in dev console. Removed console.log statements,
added secure flag to cookies. Security vulnerability patched.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧭 JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 TRIED: Just removed console.log
⚠️ BECAUSE: Tokens still visible in network tab
✅ SOLUTION: Secure + HttpOnly cookie flags + no logging

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FLOW METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏷️ TYPE: bugfix
📦 SIZE: small
⏱️ DAYS: 0.5
⚡ ACTIVE: 2 hours
🚧 BLOCKED: 0 hours
📁 FILES: 3
💥 IMPACT: high

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 CRITICAL: Security issue - fast tracked
```

**📖 Teaching Notes:**

**Flow Distribution:** Categories show work balance. Track over time to see if you're building features vs fighting fires vs paying down debt.

**Subject Line:** Max 50 chars total. Remove redundant gitmoji/conventional type - just `[CATEGORY] outcome`. Leaves ~37 chars for description.

**Metadata Line:** First body line appears in GitHub preview. Put your key metrics there so list view shows useful data instead of dividers.

**User Stories:** "As a [who], I want [what], so that [why]". The "so that" explains outcome/value.

**Vertical Slicing:** Thin, end-to-end functionality. Build complete flows, not layers.

**Flow Metrics:** Turn git history into product analytics. Parseable format enables analysis.

**Emoji-First:** GitHub doesn't render tables/bold in commits. Emojis + CAPS labels work everywhere.

#### Anti-Patterns

**Subject line too long:**

- ❌ `🎯 [FEATURE] ✨ feat(inbox): power users process inbox 10x faster...` (65 chars - truncated!)
- ✅ `🎯 [FEATURE] power users process inbox 10x faster` (50 chars - perfect!)

**Missing metadata line:**

- ❌ First body line is `━━━━━━` (preview shows useless divider)
- ✅ First body line is `TYPE: feature | SCOPE: inbox | SIZE: medium...` (preview shows data)

**Technical-focused (not outcome-focused):**

- ❌ `fix(notes): clear state on switch`
- ✅ `🐛 [BUGFIX] users see correct note immediately`

**Do NOT push to main** - proceed to step 5.

### 5. Create Pull Request

After successful commit on feature branch:

**If on feature branch:**

- Push feature branch: `git push origin feature/[branch-name]`
- Create PR to main via GitHub UI or CLI
- Wait for review and approval before merging

**If on main branch:**

- Create feature branch first: `git checkout -b feature/[descriptive-name]`
- Then push and create PR

**⚠️ Never push directly to main** - Always use PR workflow for review and CI checks

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

- [ ] **🚨 Linear ticket ID present** in conversation (SYOS-XXX format)
- [ ] **Got ticket details** using `mcp_Linear_get_issue({ id: 'SYOS-123' })`
- [ ] **Project ID validated** (asked user if missing, only continue if they say "no project")
- [ ] **Assignee set to Randy** (`assigneeId: 'c7c555a2-895a-48b6-ae24-d4147d44b1d5'`)
- [ ] **Estimate is numeric** (converted labels like "m" → 3, default to 2 if missing)
- [ ] **Updated Linear ticket** (acceptance criteria, files changed, commits list, comment)
- [ ] **Marked ticket "In Review"** (preserving projectId, assigneeId, estimate)
- [ ] ⚠️ Did NOT read `patterns-and-lessons.md` (it's just a redirect!)
- [ ] Searched `dev-docs/2-areas/patterns/INDEX.md` for existing patterns (grep tool)
- [ ] Searched domain files (svelte-reactivity.md, convex-integration.md, etc.) in parallel
- [ ] Decided: update existing pattern or create new
- [ ] Updated domain file with pattern/enhancement (search_replace)
- [ ] Validated with Context7 (if library-specific)
- [ ] Updated `dev-docs/2-areas/patterns/INDEX.md` symptom table with line number reference
- [ ] Chose correct severity (🔴 Critical | 🟡 Important | 🟢 Reference)
- [ ] Determined flow distribution category (FEATURE | BUGFIX | TECH-DEBT | DOCS | RISK)

**Commit Message:**

- [ ] Subject: [ICON CATEGORY] outcome (max 50 chars)
- [ ] First body line: TYPE | SCOPE | SIZE | DAYS | IMPACT (metadata for preview)
- [ ] USER STORY section with 👤🎯💡 format
- [ ] Described SLICE (end-to-end functionality delivered)
- [ ] Added JOURNEY if iteration 2+ (🛑⚠️✅ format)
- [ ] Created PATTERN section if applicable
- [ ] Filled FLOW METRICS section (7 data points)
- [ ] Credited AI collaboration if applicable
- [ ] **Added Linear ticket reference**: `Linear: SYOS-123` (REQUIRED)

**After Commit:**

- [ ] Showed commit with `git log -1 --stat`
- [ ] Verified on feature branch (not main)
- [ ] Pushed feature branch: `git push origin feature/[branch-name]`
- [ ] Created PR to main (or prompted user to create PR)

---

## Anti-Patterns

- ❌ Don't read `patterns-and-lessons.md` - it's just a redirect! Use domain files instead
- ❌ Don't duplicate patterns - search INDEX.md and domain files first
- ❌ Don't change existing line numbers - keep them stable (#L10, #L50, etc.)
- ❌ Don't skip Context7 validation for library patterns (Svelte 5, Convex, etc.)
- ❌ Don't commit code before capturing knowledge in patterns
- ❌ Don't add to Critical (🔴) unless it breaks functionality
- ❌ Don't push to GitHub - user will push when ready
- ❌ Don't use multiple git add commands - batch all files with `git add -A`
- ❌ Don't skip flow distribution category (FEATURE | BUGFIX | TECH-DEBT | DOCS | RISK)
- ❌ Don't skip metadata line (first body line shows in GitHub preview)
- ❌ Don't exceed 50 chars in subject line (gets truncated)
- ❌ Don't use tables/bold in commit messages - they don't render on GitHub
- ❌ Don't include redundant gitmoji + conventional type in subject ([FEATURE] not ✨feat:)

---

## Quick AI Workflow

```
0. 🚨 Check for Linear ticket ID (STOP if missing)
   - Look for SYOS-XXX in conversation
   - If missing → STOP and ask for ticket ID

1. Validate & Update Linear ticket FIRST (before committing):
   - Get ticket details: mcp_Linear_get_issue({ id: 'SYOS-123' })
   - Check project ID: If missing → Ask user (only continue if they say "no project")
   - Check assignee: If missing/not Randy → Set to Randy (c7c555a2-895a-48b6-ae24-d4147d44b1d5)
   - Check estimate: If missing/label → Convert to numeric (m=3, s=2, l=4, default=2)
   - Update acceptance criteria (check off completed items)
   - Update files changed (add ✅ emoji)
   - Add implementation notes
   - Add commit hash to commits list
   - Add completion comment
   - Mark ticket "In Review" (preserving projectId, assigneeId, estimate)

2. Analyze → Frame as user story + flow metrics + distribution
   - WHO benefits? WHAT VALUE? WHAT SLICE?
   - Category: FEATURE | BUGFIX | TECH-DEBT | DOCS | RISK
   - Type, scope, size, days, hours, blocked, files, impact

3. Search patterns (use grep, batch parallel reads):
   - INDEX: dev-docs/2-areas/patterns/INDEX.md
   - Domain files: svelte-reactivity.md, convex-integration.md, ui-patterns.md,
     analytics.md, auth-deployment.md
   - ⚠️ DON'T read patterns-and-lessons.md (it's just a redirect)

4. Update patterns (before committing code):
   - Add/update domain file with search_replace
   - Update INDEX.md symptom table
   - Use line numbers for references (#L810)

5. Commit with optimized format:
   Subject: [ICON CATEGORY] outcome (max 50 chars)
   Line 1: TYPE: X | SCOPE: Y | SIZE: Z | DAYS: N | IMPACT: I
   Body: USER STORY (👤🎯💡) + SLICE + JOURNEY (🛑⚠️✅) + PATTERN + FLOW METRICS
   Footer: Linear: SYOS-123 (REQUIRED)

6. Report status (DON'T push to GitHub):
   → Show: git log -1 --stat
   → Confirm: "✅ Committed locally. Linear ticket updated. Ready when you want to push."
```

**End message format:**

- Always: "✅ Committed [N] files. Not pushed to GitHub (as requested)."
- Show git log output for review
- Keep it short - user wants concise confirmations
