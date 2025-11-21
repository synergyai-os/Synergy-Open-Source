# test-manual

**Purpose**: Generate concise, actionable manual test instructions for current ticket.

---

## How It Works

1. **Analyze current ticket** - Read ticket description to understand what was implemented
2. **Identify test scenarios** - What needs validation?
3. **Generate test steps** - Concrete, numbered steps with localhost links
4. **Keep it short** - Maximum 10 steps, focus on critical paths only

---

## Test Instruction Format

**Structure:**

- **Title**: What feature/component is being tested
- **URL**: Direct link to test page (`http://127.0.0.1:5173/path`)
- **Steps**: Numbered, concrete actions
- **Expected**: What should happen (one line per step)

**Example:**

```markdown
## Test: Card Clickable Variant (SYOS-394)

**URL**: [http://127.0.0.1:5173/inbox](http://127.0.0.1:5173/inbox)

1. **Click inbox card** → Card opens detail view
2. **Tab to card** → Focus ring visible (blue ring)
3. **Press Enter** → Card opens detail view
4. **Press Space** → Card opens detail view
5. **Hover card** → Shadow increases (`shadow-card-hover`)
6. **Select card** → Border changes to `border-2 border-selected`
```

---

## Guidelines

- **Concrete actions**: "Click X" not "Interact with X"
- **Direct links**: Always include `http://127.0.0.1:5173/path`
- **One expectation per step**: Keep it simple
- **Critical paths only**: Skip edge cases unless ticket-specific
- **No explanations**: Just steps and expected results

---

**When invoked**: Generate test instructions based on current ticket context.

---

## Example Output

**Current Ticket**: SYOS-394 - Add Clickable Variant to Card Component

## Test: Card Clickable Variant

**URL**: [http://127.0.0.1:5173/inbox](http://127.0.0.1:5173/inbox)

1. **Click inbox card** → Card opens detail view in right panel
2. **Tab to card** → Focus ring visible (blue `ring-2 ring-accent-primary`)
3. **Press Enter** → Card opens detail view
4. **Press Space** → Card opens detail view
5. **Hover card** → Shadow increases (`shadow-card-hover`)
6. **Click card** → Selected state shows `border-2 border-selected`
