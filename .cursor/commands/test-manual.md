# test-manual

**Purpose**: Generate concise, actionable manual test instructions for current ticket.

---

## How It Works

1. **Analyze current ticket** - Read ticket description to understand what was implemented
2. **Identify test scenarios** - What needs validation?
3. **Generate test steps** - Concrete, numbered steps with specific values and file locations
4. **Keep it short** - Maximum 3 test scenarios, maximum 5 steps per test

---

## Test Instruction Format

**Structure:**

- **Title**: What feature/component is being tested
- **URL**: Direct link to test page (`http://127.0.0.1:5173/path`)
- **Steps**: Numbered, concrete actions with specific values
- **Expected**: Exact values/properties to verify (use "change X see Y change" format)

**Format Pattern:**

- **For UI changes**: "Change X → See Y change"
- **For code changes**: "Edit file X line Y: change Z → See W change"
- **For DevTools checks**: "Inspect element X → Check property Y → Should show value Z"

**Example:**

```markdown
## Test: Cascade Behavior (SYOS-431)

**URL**: [http://127.0.0.1:5173/inbox](http://127.0.0.1:5173/inbox)

1. **Edit `src/styles/tokens/spacing.css` line 19** → Change `--spacing-2: 0.5rem;` to `--spacing-2: 1rem;` → Save file
2. **Refresh page** → Nav items, buttons, cards should have **16px padding** (was 8px)
3. **Revert change** → Change back to `--spacing-2: 0.5rem;` → Refresh → Spacing returns to **8px**
```

---

## Guidelines

### Critical Rules

- **Specific values**: Always include exact pixel values, CSS properties, file paths, line numbers
- **"Change X see Y change" format**: Every step should follow this pattern
- **DevTools specifics**: Specify exact tab (Elements, Styles, Console), what to inspect, what value to see
- **File locations**: For code changes, include exact file path and line number
- **Concrete actions**: "Click X" not "Interact with X"
- **Direct links**: Always include `http://127.0.0.1:5173/path`
- **One expectation per step**: Keep it simple
- **Maximum 3 tests**: Focus on critical paths only
- **No explanations**: Just steps and expected results

### What to Include

✅ **DO Include:**

- Exact file paths and line numbers for code changes
- Specific pixel values or CSS properties to verify
- DevTools tab names and inspection steps
- Exact element selectors or text to find
- Before/after values ("was X, now Y")

❌ **DON'T Include:**

- Vague descriptions like "Visual check" or "Verify spacing"
- Abstract steps without specific values
- Explanations or context (just steps)
- More than 3 test scenarios
- More than 5 steps per test

---

**When invoked**: Generate test instructions based on current ticket context.

---

## Example Output

**Current Ticket**: SYOS-431 - Refactor Semantic Tokens to Reference Base Scale

## Test 1: Verify Cascade Behavior

**URL**: [http://127.0.0.1:5173/inbox](http://127.0.0.1:5173/inbox)

1. **Edit `src/styles/tokens/spacing.css` line 19** → Change `--spacing-2: 0.5rem;` to `--spacing-2: 1rem;` → Save file
2. **Refresh page** → Nav items, buttons, cards should have **16px padding** (was 8px) → All elements using `var(--spacing-2)` increased
3. **Revert change** → Change back to `--spacing-2: 0.5rem;` → Refresh → Spacing returns to **8px**

## Test 2: Verify Token References in DevTools

**URL**: [http://127.0.0.1:5173/inbox](http://127.0.0.1:5173/inbox)

1. **Open DevTools** → Elements tab → Select sidebar nav item → Check Styles panel
2. **Find `padding-left`** → Should show `var(--spacing-nav-item-x)` → Click to expand → Should resolve to `var(--spacing-2)` (not `0.5rem`)
3. **Select inbox card** → Check `padding` → Should show `var(--spacing-inbox-card-x)` → Expands to `var(--spacing-3)` (not `0.75rem`)

## Test 3: Visual Regression Check

**URL**: [http://127.0.0.1:5173/inbox](http://127.0.0.1:5173/inbox)

1. **Check sidebar nav items** → Spacing between icon and text should be **8px** (unchanged)
2. **Check inbox cards** → Padding inside cards should be **12px** (unchanged)
3. **Toggle dark mode** → All spacing should remain identical in dark mode
