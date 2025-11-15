# Commit Message Format

**Purpose**: Optimized commit message format for GitHub list view display and Flow Metrics tracking.

**See**: `/save` command for when to use this format

---

## Format Template

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

---

## Key Optimization

**First body line is metadata** - this appears in GitHub list view preview!

Instead of raw markdown dividers showing in preview, you see useful data:

- `TYPE: docs | SCOPE: commands | SIZE: large | DAYS: 1 | IMPACT: high`

---

## Flow Distribution Categories

| Category       | Icon | When to Use                               | Subject Format                                       |
| -------------- | ---- | ----------------------------------------- | ---------------------------------------------------- |
| 🎯 [FEATURE]   | 🎯   | New user capability                       | `🎯 [FEATURE] power users process inbox 10x faster`  |
| 🐛 [BUGFIX]    | 🐛   | Fix broken functionality                  | `🐛 [BUGFIX] users see correct note immediately`     |
| 🔧 [TECH-DEBT] | 🔧   | Refactor, architecture, code quality      | `🔧 [TECH-DEBT] extract session logic to composable` |
| 📚 [DOCS]      | 📚   | Documentation, patterns                   | `📚 [DOCS] developers avoid Svelte 5 gotchas`        |
| 🔒 [RISK]      | 🔒   | Security, critical hotfix, data integrity | `🔒 [RISK] patch session token leak`                 |

**Character count:** `🎯 [FEATURE] ` = 13 characters → **37 chars for description**

---

## Complete Examples

### Feature Example

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
🔗 Linear: SYOS-123
```

### Bugfix Example

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
🔗 Linear: SYOS-123
```

### Documentation Example

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
🔗 Linear: SYOS-123
```

### Tech Debt Example

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
🔗 Linear: SYOS-123
```

### Risk/Critical Example

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
🔗 Linear: SYOS-123
```

---

## Teaching Notes

**Flow Distribution:** Categories show work balance. Track over time to see if you're building features vs fighting fires vs paying down debt.

**Subject Line:** Max 50 chars total. Remove redundant gitmoji/conventional type - just `[CATEGORY] outcome`. Leaves ~37 chars for description.

**Metadata Line:** First body line appears in GitHub preview. Put your key metrics there so list view shows useful data instead of dividers.

**User Stories:** "As a [who], I want [what], so that [why]". The "so that" explains outcome/value.

**Vertical Slicing:** Thin, end-to-end functionality. Build complete flows, not layers.

**Flow Metrics:** Turn git history into product analytics. Parseable format enables analysis.

**Emoji-First:** GitHub doesn't render tables/bold in commits. Emojis + CAPS labels work everywhere.

---

## Anti-Patterns

**Subject line too long:**

- ❌ `🎯 [FEATURE] ✨ feat(inbox): power users process inbox 10x faster...` (65 chars - truncated!)
- ✅ `🎯 [FEATURE] power users process inbox 10x faster` (50 chars - perfect!)

**Missing metadata line:**

- ❌ First body line is `━━━━━━` (preview shows useless divider)
- ✅ First body line is `TYPE: feature | SCOPE: inbox | SIZE: medium...` (preview shows data)

**Technical-focused (not outcome-focused):**

- ❌ `fix(notes): clear state on switch`
- ✅ `🐛 [BUGFIX] users see correct note immediately`

---

## Related

- **Command**: `/save` - When to use this format
- **Flow Metrics**: `dev-docs/2-areas/product/flow-metrics.md` - Understanding flow distribution
- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern documentation
