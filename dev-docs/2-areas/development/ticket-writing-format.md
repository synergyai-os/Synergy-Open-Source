# Linear Ticket Writing Format

**Purpose**: Complete ticket writing format template (Marty Cagan + Shape Up).

**See**: `.cursor/commands/start.md` for Linear constants and ticket creation workflow

---

## 📝 Required Structure

```markdown
## Context

[1-2 sentences: Why this work matters]

**Why this matters**: [User outcome or business value]

---

## Problem

[Root causes - what's broken or missing]

---

## Goals

**Outcome**: [What success looks like - business outcome, not output]  
**User Impact**: [How users benefit]  
**Success Metrics**:

- [Measurable criteria 1]
- [Measurable criteria 2]

---

## Technical Scope

**What to build:**

- [Specific module 1] - [What it does]
- [Specific module 2] - [What it does]

**Files to modify:**

- `path/to/file1.ts` - [What changes]
- `path/to/file2.ts` - [What changes]

---

## Subtasks (Priority Order)

**🔴 URGENT (Ship First)**

- TICKET-1: [Title] (URGENT) - [Why urgent]

**🟠 HIGH (Ship Week 1)**

- TICKET-2: [Title] (HIGH) - [Impact]

**🟡 MEDIUM (Ship Week 2)**

- TICKET-3: [Title] (MEDIUM) - [Nice to have]

---

## Non-Goals

- ❌ TypeScript strict mode (separate track)
- ❌ Performance optimization (separate concern)

---

## Dependencies

**Requires**: [What must be done first - specific ticket IDs]  
**Blocks**: [What waits for this]  
**Parallel**: [CLEARLY STATE if agents can work in parallel]

---

## Success Criteria

- [Testable criterion 1] ✅
- [Testable criterion 2] ✅
```

---

## ⚠️ Parallel Work Warning

**State clearly at top of ticket if agents CAN work in parallel:**

```markdown
## ⚠️ PARALLEL WORK WARNING

**This ticket CAN be worked on by multiple agents simultaneously:**
- Agent 1: Backend (convex/ functions)
- Agent 2: Frontend (src/lib/components/)
- Agent 3: Tests (tests/ directory)

**Boundaries:**
- No shared files
- Clear technical separation
- Independent shipping

**OR**

**This ticket CANNOT be worked on in parallel:**
- Sequential dependencies (Slice 1 → Slice 2 → Slice 3)
- Shared files that would cause conflicts
```

---

**Last Updated**: 2025-11-13  
**Purpose**: Ticket writing format template for Linear tickets

