# AI Development Workflow V2 - User Guide

> **Date**: November 20th, 2025  
> **Purpose**: Practical guide for using the improved AI development workflow  
> **Audience**: You (the developer), not AI agents  
> **Status**: Active workflow guide

---

## 🎯 What Changed? (Old vs New)

### Your Old Workflow

```
You: "I want to add image uploads to chat"
AI: [Implements immediately, may reinvent the wheel]
You: "That's not quite right, let me fix..."
AI: [More sloppy code]
```

**Problems:**
- ❌ AI jumps straight to implementation
- ❌ AI doesn't check existing patterns
- ❌ AI doesn't reference working examples
- ❌ AI creates new code instead of adapting existing
- ❌ You end up fixing "AI code slop"

### New Workflow (Brandon's System)

```
You: "I want to add image uploads to chat"
AI: [Checks patterns, loads reference code, thinks through approaches]
AI: [Adapts existing patterns, uses reference examples]
You: "Perfect! That's exactly what I wanted"
```

**Benefits:**
- ✅ AI researches first (patterns + reference code)
- ✅ AI thinks through approaches before coding
- ✅ AI adapts existing patterns instead of creating new
- ✅ AI uses working examples as reference
- ✅ Less "AI code slop" - better quality code

---

## 📋 Task-Specific Templates (Brandon's System) ✅ **IMPLEMENTED**

**Brandon's Key Insight:** Create templates for **every common task type** with specific instructions.

**All Templates Available:**

1. **`/bug-fix SYOS-XXX`** ✅ - Systematic bug fix workflow
   - Reproduces bug → Traces code path → Identifies root cause → Fixes → Tests
   - Ensures fix follows patterns and coding standards

2. **`/code-cleanup SYOS-XXX`** ✅ - Code cleanup workflow
   - Identifies dead code → Verifies unused → Removes safely → Tests
   - Prevents removing used code accidentally

3. **`/code-review SYOS-XXX`** ✅ - Senior engineer review workflow
   - Reviews patterns → Validates architecture → Checks quality → Suggests improvements
   - Acts as senior engineer review before merge

4. **`/task-template SYOS-XXX`** ✅ - Pre-coding analysis for complex features
   - Generates task doc with multiple approaches → You review → AI implements
   - Forces thinking before coding

**Why This Matters:** Each template has specific instructions tailored to that task type, preventing "AI code slop" and ensuring consistent, high-quality work.

---

## 🚀 Quick Start: When to Use What

### Scenario 1: Simple Bug Fix (< 30 min)

**Old Way:**
```
You: "/start SYOS-123"
AI: [Fixes bug]
```

**New Way (Same - No Change):**
```
You: "/start SYOS-123"
AI: [Checks patterns first → Fixes bug using existing patterns]
```

**What's Different:** AI automatically checks patterns first (no change needed from you)

---

### Scenario 2: Code Cleanup

**Old Way:**
```
You: "/start SYOS-123"
AI: [Removes code, might break things]
```

**New Way (Use Cleanup Template):**
```
You: "/code-cleanup SYOS-123"  ← NEW: Use code-cleanup template
AI: [Identifies dead code → Verifies unused → Removes safely → Tests]
```

**What's Different:** 
- Use `/code-cleanup` template for systematic cleanup
- AI verifies code is unused before removing (double-check)
- AI removes one at a time, tests after each
- Prevents accidentally removing used code

---

### Scenario 3: Complex Feature (Multiple Approaches Possible)

**Old Way:**
```
You: Scope in chat → Create /linear ticket → "/go"
AI: [Picks first approach, implements]
You: "Actually, that's not the best way..."
AI: [Refactors]
```

**New Way (NEW - Use Task Template):**
```
You: Scope in chat → Create /linear ticket → "/task-template SYOS-123"
AI: [Generates task doc with 3 approaches → Recommends best one]
You: Review → Confirm approach → "/go"
AI: [Implements using chosen approach]
```

**What's Different:** 
- Use `/task-template` BEFORE `/go` for complex features
- AI thinks through approaches first
- You review and confirm before implementation
- Less refactoring needed

---

## 📋 Decision Tree: When to Use Task Templates

**Use `/task-template` when:**
- ✅ **Complex features** - Architectural decisions needed
- ✅ **Multiple approaches** - 2-3 different ways to solve it
- ✅ **Uncertain approach** - Not sure which way is best
- ✅ **Need documentation** - Want to capture thinking process

**Skip `/task-template` when:**
- ✅ **Simple bug fixes** - Clear single fix
- ✅ **Straightforward features** - Obvious single approach
- ✅ **Quick tasks** - < 30 minutes

**Example:**

```
❌ DON'T use task template:
- "Fix typo in error message"
- "Add loading spinner to button"
- "Update API endpoint URL"

✅ DO use task template:
- "Add image uploads to chat" (multiple storage options)
- "Implement organization switching" (multiple state management approaches)
- "Add real-time notifications" (multiple implementation strategies)
```

---

## 🔍 How Reference Code Prevents "AI Code Slop"

### The Problem (Old Way)

**Without Reference Code:**
```
You: "Add image uploads to chat"
AI: [Guesses implementation]
AI: Creates new FileReader code
AI: Creates new upload handler
AI: Creates new preview component
→ Result: New code that may not follow best practices
```

### The Solution (New Way)

**With Reference Code:**
```
You: "Add image uploads to chat"
AI: [Finds "vercel-ai-sdk-chat" reference project]
AI: [Analyzes working implementation]
AI: [Adapts patterns to our codebase]
→ Result: Code based on proven patterns, adapted to our standards
```

**How It Works:**

1. **You add reference projects** to `ai-docs/reference/` (one-time setup)
   - Download working examples from GitHub, YouTube demos, etc.
   - Add to `ai-docs/reference/[project-name]/`
   - Create README explaining what it demonstrates

2. **AI automatically finds relevant projects** during `/start`
   - Matches ticket keywords to project READMEs
   - Loads reference project if relevant
   - Uses it during `/go` implementation

3. **AI adapts, doesn't copy**
   - Uses reference patterns as inspiration
   - Adapts to our design tokens, composables, Convex patterns
   - Documents what was adapted

**Example Setup:**

```
ai-docs/reference/
  /vercel-ai-sdk-chat/
    /src/
      ChatWindow.svelte      # Working chat with uploads
      ImageUpload.svelte     # Working upload component
    README.md                # "Demonstrates image uploads with Vercel AI SDK"
```

**When you create ticket:**
```
Ticket: "Add image uploads to chat"
AI: Finds "vercel-ai-sdk-chat" → Loads → Adapts → Implements
```

---

## 🎯 Your New Workflow (Step-by-Step)

### Step 1: Scope in Chat (Same as Before)

**No change needed:**
```
You: "I want to add image uploads to chat. Users should be able to upload images and see them inline with messages."
AI: [Investigates, asks clarifying questions]
You: [Clarifies scope]
```

---

### Step 2: Create Linear Ticket (Same as Before)

**No change needed:**
```
You: "Create /linear ticket"
AI: [Creates ticket with proper format]
```

**Ticket includes:**
- Context, Problem, Goals
- Technical Scope
- Success Criteria

---

### Step 3: Decide: Task Template or Go Straight to `/go`?

**Simple Feature (Skip Task Template):**
```
You: "/go"
AI: [Checks patterns → Checks reference code → Implements]
```

**Complex Feature (Use Task Template):**
```
You: "/task-template SYOS-123"
AI: [Generates task doc with 3 approaches]
AI: [Shows recommendation]
You: Review → "Approach B looks good, proceed"
You: "/go"
AI: [Implements using Approach B]
```

---

### Step 4: Handle Blockers & Decisions (NEW - Important!)

**What Happens:**
- AI may hit blockers (missing tokens, unclear requirements, etc.)
- AI will report progress and ask for decisions
- You provide guidance, AI continues

**Common Scenarios:**

**Scenario A: Missing Dependencies**
```
AI: "Missing design tokens: text-muted, text-warning"
You: "Create them: text-muted = gray-400, text-warning = yellow-500"
AI: [Creates tokens → Continues]
```

**Scenario B: Architectural Decision**
```
AI: "Should we use Convex file storage or Vercel Blob?"
You: "Use Vercel Blob - better performance"
AI: [Implements using Vercel Blob]
```

**Scenario C: Too Complex - Break Down**
```
AI: "Found 25 violations, 7 need new tokens"
You: "Break into subtasks: SYOS-420 (tokens), SYOS-421 (fixes)"
You: "/linear-subtickets SYOS-414"
AI: [Creates subtasks]
```

**Key Principle:** AI asks when it needs decisions. You provide guidance, AI continues.

---

### Step 5: Review & Validate (Same as Before)

**No change needed:**
```
You: "/validate"
AI: [Validates implementation]
```

**Note:** If AI made fixes after blockers, validate again after fixes complete.

---

### Step 6: Save Patterns (Same as Before)

**No change needed:**
```
You: "/save"
AI: [Updates patterns, considers rule building]
```

---

## 💡 Key Improvements Explained

### 1. Pattern-First Approach (Automatic)

**What it does:** AI checks `dev-docs/2-areas/patterns/INDEX.md` before implementing

**What you need to do:** Nothing - it's automatic

**Benefit:** AI uses existing solutions instead of reinventing

**Example:**
```
You: "/go"
AI: [Checks patterns → Finds "file upload" pattern → Uses it]
→ Result: Consistent with existing codebase
```

---

### 2. Reference Code System (Automatic)

**What it does:** AI checks `ai-docs/reference/` for working examples

**What you need to do:** 
- One-time: Add reference projects to `ai-docs/reference/`
- Ongoing: AI automatically finds and uses them

**Benefit:** AI adapts proven patterns instead of guessing

**Example:**
```
You: Add "vercel-ai-sdk-chat" to ai-docs/reference/
You: Create ticket "Add image uploads"
AI: [Finds reference → Adapts → Implements]
→ Result: Code based on working example
```

---

### 3. Task Templates (Optional - Use for Complex Features)

**What it does:** Forces AI to think through multiple approaches before coding

**What you need to do:** 
- Use `/task-template` for complex features
- Review generated task doc
- Confirm approach before `/go`

**Benefit:** Better decisions upfront, less refactoring

**Example:**
```
You: "/task-template SYOS-123"
AI: [Generates doc with 3 approaches]
AI: Recommends Approach B (Vercel Blob Storage)
You: Review → Confirm → "/go"
→ Result: Best approach chosen upfront
```

---

### 4. Iterative Rule Building (Automatic)

**What it does:** When AI makes a mistake, creates rules to prevent it happening again

**What you need to do:** Nothing - happens automatically during `/save`

**Benefit:** Fewer mistakes over time

**Example:**
```
AI: Makes mistake (uses `any` type)
You: "/save"
AI: [Creates rule "Never use `any` type"]
→ Result: Rule prevents future mistakes
```

---

## 🎬 Real-World Examples

### Example 1: Simple Bug Fix

**Your Workflow:**
```
1. Scope in chat: "Fix typo in error message"
2. Create /linear ticket: SYOS-123
3. "/go"
4. "/validate"
5. "/save"
```

**What AI Does Automatically:**
- Checks patterns (finds "error message" pattern)
- Uses existing error handling pattern
- Implements fix

**Result:** Consistent fix, no sloppy code

---

### Example 2: Code Cleanup

**Your Workflow:**
```
1. Scope in chat: "Remove unused imports after Svelte 5 migration"
2. Create /linear ticket: SYOS-124
3. "/code-cleanup SYOS-124"  ← NEW: Use code-cleanup template
4. "/validate"
5. "/save"
```

**What AI Does:**
- Identifies dead code (unused imports)
- Verifies unused (double-checks)
- Removes safely (one at a time, tests after each)
- Verifies no regressions

**Result:** Clean codebase, no accidental removals

---

### Example 3: Complex Feature (Multiple Approaches)

**Your Workflow:**
```
1. Scope in chat: "Add image uploads to chat"
2. Create /linear ticket: SYOS-125
3. "/task-template SYOS-125"  ← Use task-template for complex features
4. Review task doc → Confirm Approach B
5. "/go"
6. "/code-review SYOS-125"  ← NEW: Review before merge
7. "/validate"
8. "/save"
```

**What AI Does:**
- Generates task doc with 3 approaches:
  - Approach A: Direct Convex Storage
  - Approach B: Vercel Blob Storage (recommended)
  - Approach C: Base64 Inline
- You review and confirm Approach B
- AI implements using Approach B
- AI reviews code (patterns, architecture, quality)
- AI suggests improvements (if any)

**Result:** Best approach chosen upfront, code reviewed, less refactoring

---

### Example 4: Code Review Before Merge

**Your Workflow:**
```
1. Code implemented and ready
2. "/code-review SYOS-126"  ← NEW: Review before merge
3. Review AI's suggestions
4. Fix critical issues (if any)
5. Merge
```

**What AI Does:**
- Understands changes (reads ticket, reviews code)
- Checks patterns (verifies compliance)
- Validates architecture (modularity, coupling)
- Checks code quality (standards, best practices)
- Identifies issues (bugs, regressions)
- Suggests improvements (actionable feedback)
- Provides summary (overall assessment)

**Result:** Senior engineer review, catches issues before merge

---

### Example 5: AI Hits Blockers (Decision Needed)

**What Happens:**
```
You: "/go"
AI: [Checks patterns → Starts fixing violations]
AI: [Hits blocker: Missing design tokens]
AI: [Reports progress + asks for decision]
```

**AI Output:**
```
✅ Completed (3/25 violations)
⚠️ Blocked - Missing Design Tokens (7/25 violations)

Option A: Create missing tokens first
Option B: Fix what we can now, defer complex cases
Option C: Stop and get your guidance
```

**Your Response:**

**If you know the answer:**
```
You: "Option A - Create missing tokens first. Add text-muted, text-warning, text-priority-high to src/app.css"
AI: [Creates tokens → Continues fixing]
```

**If you need to think:**
```
You: "Let me check design-tokens.md first"
[You review existing tokens]
You: "Option A - Use text-tertiary for muted, text-error for urgent, create text-warning for medium"
AI: [Creates tokens → Continues fixing]
```

**If blocker is too complex:**
```
You: "Option C - Stop here. Let's break this into subtasks"
You: "/linear-subtickets SYOS-414"
AI: [Creates subtasks for token creation vs component fixes]
```

**Key Principle:** AI asks when it needs decisions. You provide guidance, AI continues.

**Result:** Clear decision points, no AI guessing, better outcomes

---

## 🔧 Setup: Adding Reference Projects

### One-Time Setup

**Step 1: Find Working Examples**
- GitHub repos with similar features
- YouTube demo projects
- Official library examples

**Step 2: Add to Reference Folder**
```
ai-docs/reference/
  /vercel-ai-sdk-chat/        # Image uploads example
  /svelte-5-composables/      # Composables patterns
  /convex-auth-patterns/      # Auth implementation
```

**Step 3: Create README in Each Project**
```markdown
# Project Name

**Source**: [GitHub URL or YouTube link]
**What it demonstrates**: Image uploads with Vercel AI SDK

**Key Patterns**:
- FileReader API for preview
- Base64 encoding for uploads
- Image preview component

**When to reference**: When adding image uploads to chat
```

**Step 4: Done!**
- AI automatically finds and uses reference projects
- No additional work needed

---

## 📊 When to Use Each Tool

### `/start` - Always Use First
- ✅ Onboard AI to task
- ✅ Load reference code (automatic)
- ✅ Investigate codebase

### Task-Specific Templates (Brandon's System) ⭐ **NEW**

**Use these for common task types:**

#### `/bug-fix` - Use for Bug Fixes
- ✅ Something is broken
- ✅ Need systematic investigation
- ✅ Want to ensure fix follows patterns
- **Workflow**: `/bug-fix SYOS-XXX` → Reproduce → Trace → Fix → Test

#### `/code-cleanup` - Use for Code Cleanup
- ✅ Tried multiple approaches, some code unused
- ✅ Want to remove dead code
- ✅ Need to clean up unused imports/files
- **Workflow**: `/code-cleanup SYOS-XXX` → Identify → Verify → Remove → Test

#### `/code-review` - Use for Code Reviews
- ✅ Code ready for review (before merge)
- ✅ Want senior engineer perspective
- ✅ Need architecture validation
- **Workflow**: `/code-review SYOS-XXX` → Review → Report → Suggest Improvements

#### `/task-template` - Use for Complex Features
- ✅ Multiple approaches possible
- ✅ Architectural decisions needed
- ✅ Want to document thinking
- **Workflow**: `/task-template SYOS-XXX` → Review → `/go` → Execute

### `/go` - Use After Confirmation
- ✅ After scoping in chat
- ✅ After task template (if used)
- ✅ Ready to implement

### `/validate` - Use After Implementation
- ✅ Verify functionality
- ✅ Check modularity
- ✅ Update ticket

### `/save` - Use After Validation
- ✅ Capture patterns
- ✅ Build rules (automatic)
- ✅ Document knowledge

---

## 🔍 Task-Specific Templates (Brandon's System) ✅ **IMPLEMENTED**

**Brandon's Key Insight:** Create templates for **every common task type** with specific instructions:

- ✅ **Bug Fix Template** (`/bug-fix`) - Systematic investigation → Fix → Test workflow
- ✅ **Code Cleanup Template** (`/code-cleanup`) - Identify → Verify → Remove → Test workflow
- ✅ **Code Review Template** (`/code-review`) - Senior engineer review process
- ✅ **New Feature Template** (`/task-template`) - Pre-coding analysis with multiple approaches

**All Templates Available:**

1. **`/bug-fix SYOS-XXX`** - Use when something is broken
   - Reproduces bug → Traces code path → Identifies root cause → Fixes → Tests
   - Ensures fix follows patterns and coding standards

2. **`/code-cleanup SYOS-XXX`** - Use when cleaning up unused code
   - Identifies dead code → Verifies unused → Removes safely → Tests
   - Prevents removing used code accidentally

3. **`/code-review SYOS-XXX`** - Use before merge
   - Reviews patterns → Validates architecture → Checks quality → Suggests improvements
   - Acts as senior engineer review

4. **`/task-template SYOS-XXX`** - Use for complex features
   - Generates task doc with multiple approaches → You review → AI implements
   - Forces thinking before coding

**Why This Matters:**
We use generic `/start` + `/go` for all tasks. This works, but Brandon's approach provides more leverage by tailoring instructions to each task type.

**Example - Bug Fix Template (Brandon's Approach):**
```
Template: "Bug Fix"
1. Reproduce the bug
2. Trace the code path
3. Identify root cause
4. Check patterns for similar fixes
5. Fix the bug
6. Test the fix
7. Document the fix
```

**Our Current Approach:**
```
You: "/start SYOS-123" (bug ticket)
AI: [Generic investigation → Fix]
```

**Future Enhancement Opportunity:**
Create task-specific templates that provide tailored instructions for each common task type. This would give AI more specific guidance and reduce "AI code slop" even further.

**For Now:** Generic workflow works well, but task-specific templates would be a valuable addition.

---

## 🎯 Key Takeaways

### What You Need to Do Differently

**Almost Nothing!** Most improvements are automatic:

1. **Pattern-First** - Automatic (AI checks patterns first)
2. **Reference Code** - Automatic (AI finds and uses references)
3. **Rule Building** - Automatic (happens during `/save`)

**Only New Step:**
- Use `/task-template` for complex features (optional)

### What You Get

**Better Code Quality:**
- AI uses existing patterns (consistent)
- AI adapts proven examples (reliable)
- AI thinks through approaches (better decisions)

**Less "AI Code Slop":**
- AI researches first (patterns + references)
- AI adapts instead of creating new
- AI follows established patterns

**Faster Development:**
- Less refactoring (better decisions upfront)
- Less fixing (rules prevent mistakes)
- More reuse (patterns + references)

---

## 🚦 Quick Reference

### Bug Fix Workflow
```
Scope → /linear → /bug-fix → /validate → /save
```

### Code Cleanup Workflow
```
Scope → /linear → /code-cleanup → /validate → /save
```

### Simple Feature Workflow
```
Scope → /linear → /go → /code-review → /validate → /save
```

### Complex Feature Workflow
```
Scope → /linear → /task-template → Review → /go → /code-review → /validate → /save
```

### What's Automatic
- ✅ Pattern checking (before implementation)
- ✅ Reference code loading (if relevant)
- ✅ Task-specific workflows (bug-fix, cleanup, review)
- ✅ Rule building (during /save)

### What's Optional
- ⚠️ Task templates (use for complex features only)

---

## ❓ FAQ

### Q: Do I need to create task documents manually?

**A:** No! Use `/task-template` command - AI generates it for you.

### Q: When should I use task templates?

**A:** Only for complex features with multiple approaches. Simple fixes don't need it.

### Q: How do I add reference projects?

**A:** One-time setup: Download working examples → Add to `ai-docs/reference/` → Create README. AI finds them automatically.

### Q: Do I need to change my workflow?

**A:** Almost no change! Just use `/task-template` for complex features (optional).

### Q: How does this prevent "AI code slop"?

**A:** AI researches first (patterns + references), thinks through approaches (task templates), and adapts existing patterns instead of creating new code.

### Q: What do I do when AI hits blockers?

**A:** AI will report progress and ask for decisions. Provide guidance:
- **If you know the answer**: Tell AI what to do
- **If you need to think**: Review relevant docs, then decide
- **If too complex**: Break into subtasks with `/linear-subtickets`

### Q: Should I validate after AI fixes blockers?

**A:** Yes! If AI made fixes after blockers, run `/validate` again to ensure everything works.

---

## 📚 Related Documentation

- **Task Templates**: `.cursor/commands/task-template.md` - Task template command
- **Reference Code**: `ai-docs/reference/README.md` - Reference code system
- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Linear Workflow**: `.cursor/commands/linear.md` - Ticket creation
- **Historical**: `dev-docs/4-archive/old-workflows/ai-development-workflow.md` - Previous version (archived)

---

**Last Updated**: November 20th, 2025  
**Purpose**: User guide for improved AI development workflow  
**Key Change**: Pattern-first, reference code, task templates prevent "AI code slop"

