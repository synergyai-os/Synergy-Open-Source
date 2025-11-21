# Cursor Rules - Best Practices

**Purpose**: Guidelines for creating and optimizing Cursor rules for AI agents.

---

## 📊 Optimization Summary

**Before**: `working-with-linear.mdc` was 540 lines with `alwaysApply: true`

- **Problem**: 540 lines included in EVERY chat context
- **Waste**: Most chats don't need Linear workflow details
- **Impact**: Consumes context tokens unnecessarily

**After**: Optimized structure

- **Rule**: 84 lines (84% reduction) - Only critical rules
- **Command**: 366 lines - Loaded only when `/linear` invoked
- **Total**: Same content, better organization

---

## 🎯 Rules vs Commands

### Rules (`.cursor/rules/*.mdc`)

**Use for:**

- ✅ Critical rules that MUST be followed always
- ✅ Universal constraints (coding standards, security)
- ✅ Short, actionable guidelines (< 100 lines)

**Configuration:**

```yaml
---
alwaysApply: true # Include in every chat
---
# OR
---
description: apply when working with PostHog
globs: ['**/*posthog*', '**/analytics/**']
---
# OR
---
description: apply when working with Linear tickets
globs: ['**/*linear*', '.cursor/commands/linear.md']
---
```

**Best Practices:**

- Keep rules SHORT (< 100 lines)
- Only include CRITICAL rules
- Use `globs` to scope when possible
- Move detailed reference to commands

### Commands (`.cursor/commands/*.md`)

**Use for:**

- ✅ Detailed workflows and references
- ✅ Step-by-step guides
- ✅ Examples and templates
- ✅ Loaded only when invoked (e.g., `/linear`)

**Best Practices:**

- Can be longer (300-500 lines OK)
- Include complete examples
- Reference from rules when needed

---

## 📋 Current Rules Structure

### `way-of-working.mdc` (~174 lines)

- **Purpose**: Project overview, tech stack, essential patterns
- **Why rule**: Universal context needed for all work
- **Status**: ✅ Appropriate size

### `working-with-linear.mdc` (84 lines)

- **Purpose**: Critical Linear rules (Project ID required, Assign user)
- **Why rule**: Must be enforced before creating tickets
- **Status**: ✅ Optimized (was 540 lines)

### `posthog-integration.mdc` (~26 lines)

- **Purpose**: PostHog-specific rules (API keys, feature flags)
- **Why rule**: Security constraint (never hallucinate API keys)
- **Status**: ✅ Appropriate size

---

## 🚀 Optimization Strategy

### Step 1: Identify Critical vs Reference

**Critical (Rule):**

- Must be enforced always
- Short, actionable
- Prevents errors

**Reference (Command):**

- Detailed examples
- Complete workflows
- Loaded on demand

### Step 2: Split Content

**Before:**

```
rule.mdc (540 lines, alwaysApply: true)
├── Critical rules (50 lines)
├── Constants (100 lines)
├── Examples (200 lines)
└── Workflows (190 lines)
```

**After:**

```
rule.mdc (84 lines, alwaysApply: true)
└── Critical rules only

command.md (366 lines, manual invoke)
├── Constants
├── Examples
└── Workflows
```

### Step 3: Use Globs When Possible

**Instead of `alwaysApply: true`:**

```yaml
---
description: apply when working with Linear
globs: ['**/*linear*', '.cursor/commands/linear.md']
---
```

**Benefits:**

- Only loaded when relevant
- Saves context tokens
- More targeted application

---

## ✅ Rule Creation Checklist

**Before creating a rule:**

- [ ] Is this CRITICAL and must be enforced always?
- [ ] Can it be < 100 lines?
- [ ] Is it actionable (not just reference)?
- [ ] Can detailed examples go in a command instead?

**If yes to all → Create rule**

**If no → Create command or doc**

---

## 📚 Examples

### ✅ Good Rule (Short, Critical)

```markdown
---
alwaysApply: true
---

# Critical Rule

**NEVER do X without Y**

**ALWAYS do Z**

**Validation**: Check X before Y
```

### ✅ Good Command (Detailed Reference)

```markdown
# Command Name

**Purpose**: Complete reference for [topic]

## Constants

[Detailed constants]

## Examples

[Complete examples]

## Workflows

[Step-by-step guides]
```

---

## 🔍 Current Optimization Status

| File                      | Type    | Lines | Status            |
| ------------------------- | ------- | ----- | ----------------- |
| `way-of-working.mdc`      | Rule    | ~174  | ✅ Appropriate    |
| `working-with-linear.mdc` | Rule    | 84    | ✅ Optimized      |
| `posthog-integration.mdc` | Rule    | ~26   | ✅ Appropriate    |
| `linear.md`               | Command | 366   | ✅ Reference only |

**Total Rule Context**: ~284 lines (down from 740+)

---

## 🎨 Design System Resources

**Quick Reference** (for daily work):

- `dev-docs/2-areas/design/design-tokens.md` - Complete token reference + governance rules

**Comprehensive Guides** (for deep understanding):

- `./design-system-checklist.json` - Machine-readable current state checklist (repo root)
- `dev-docs/2-areas/design/audit-guide.md` - Systematic audit guide

**Atomic Design Structure** (SYOS-405 - in progress):

```
src/lib/components/
├── primitives/     # Layer 1: Bits UI wrappers (Dialog, Accordion, etc.)
├── atoms/          # Layer 2: Styled components (Button, Input, Card, Badge)
├── molecules/      # Layer 3: Composites (FormField, SearchBar)
└── organisms/      # Layer 4: Complex sections (Header, Sidebar)
```

**Note**: During migration (SYOS-405), both `$lib/components/ui` and `$lib/components/atoms` imports work. Gradually move to atomic structure.

---

## 📖 References

- **Cursor Docs**: [Rules for AI](https://docs.cursor.com/context/rules-for-ai)
- **Best Practices**: Keep rules focused and short
- **Commands**: Use for detailed workflows

---

**Last Updated**: 2025-11-13  
**Purpose**: Guide for creating optimized Cursor rules
