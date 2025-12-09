# task-template

Generate pre-coding technical analysis. Forces thinking through approaches before implementation.

**Use for**: Complex features, architectural decisions, multiple approaches possible.

**Workflow**: `/task-template` → Review → Implement

---

## Usage

```
/task-template [SYOS-XXX]
/task-template [description]
```

---

## Task Document Structure

### 1. Title & Goal

```markdown
# [Title]

**Goal**: [Clear outcome in one sentence]
```

### 2. Problem Analysis

- Current state (what exists)
- Pain points (what's wrong)
- User impact (why it matters)

**Investigate first:**
- Search codebase for existing implementations
- Check patterns (`dev-docs/2-areas/patterns/INDEX.md`)
- Understand dependencies

### 3. Approach Options (MANDATORY: 2-3 options)

**Don't jump to first solution.**

For each approach:

```markdown
### Approach A: [Name]

**How it works:** [Description]
**Pros:** [Benefits]
**Cons:** [Drawbacks]
**Complexity:** Low/Medium/High
**Dependencies:** [What's needed]
```

### 4. Recommendation

```markdown
## Recommendation

**Selected:** Approach [X]
**Reasoning:** [Why this over others]
**Trade-offs accepted:** [What we're giving up]
**Risk:** [What could go wrong]
```

### 5. Current State

```markdown
## Current State

**Existing code:**
- [file]: [what it does]

**Dependencies:**
- [library/module needed]

**Patterns:**
- [relevant pattern from INDEX.md]

**Constraints:**
- [technical limitation]
```

### 6. Architecture Validation

**Reference**: `dev-docs/master-docs/architecture.md`

```markdown
## Architecture Validation

| Aspect | Compliant? | Notes |
|--------|------------|-------|
| Domain cohesion (#1) | ✅/❌ | Code in correct domain? |
| Dependency flow (#5) | ✅/❌ | Only depends on allowed layers? |
| Auth before writes (#9) | ✅/❌ | Mutations check auth first? |
| Logic in Convex (#10) | ✅/❌ | Not in UI components? |
| Domain language (#15-16) | ✅/❌ | Using circles/roles/tensions? |
```

### 7. Design System Validation (if UI work)

**Reference**: `dev-docs/master-docs/design-system.md`

```markdown
## Design System Validation

| Aspect | Compliant? | Notes |
|--------|------------|-------|
| Using recipes | ✅/❌ | Not hardcoded classes? |
| Semantic tokens | ✅/❌ | Not Tailwind defaults? |
| Component location | ✅/❌ | Correct atomic level? |
```

### 8. Technical Requirements

```markdown
## Technical Requirements

**Components:** [New components to create]
**APIs:** [Backend functions needed]
**Data model:** [Schema changes]
**Testing:** [Test requirements]
```

### 9. Success Criteria

```markdown
## Success Criteria

**Functional:**
- [ ] [What works]

**Quality:**
- [ ] TypeScript compiles
- [ ] Tests pass
- [ ] Architecture compliant
```

### 10. Implementation Checklist

```markdown
## Implementation Checklist

- [ ] [Step 1]
- [ ] [Step 2]
- [ ] [Step 3]
- [ ] Run `/validate` when complete
```

---

## File Location

Save to: `ai-docs/tasks/[ticket-id]-[slug].md`

Examples:
- `ai-docs/tasks/SYOS-123-consent-workflow.md`
- `ai-docs/tasks/SYOS-456-fix-authority-calc.md`

---

## AI Instructions

1. **Get context** — Load ticket or use description
2. **Investigate** — Search codebase, check patterns
3. **Generate 2-3 approaches** — Don't skip this
4. **Validate architecture** — Check against principles
5. **Save file** — `ai-docs/tasks/`
6. **Present to user** — Highlight key decisions, wait for confirmation

---

## Example Output

```markdown
# Implement Consent Round for Proposals

**Goal**: Facilitators can run consent rounds where members raise objections that must be integrated.

## Problem Analysis

**Current state**: Proposals go directly from draft to approved without consent process.
**Pain points**: No mechanism for surfacing objections or integrating feedback.
**User impact**: Teams can't use consent-based decision making.

## Approach Options

### Approach A: State Machine in Proposal

**How it works:** Add consent states to proposal lifecycle
**Pros:** Simple, contained in proposals domain
**Cons:** Tight coupling
**Complexity:** Low

### Approach B: Separate Consent Module

**How it works:** Create consent feature that wraps proposals
**Pros:** Decoupled, reusable
**Cons:** More complexity, cross-domain coordination
**Complexity:** Medium

### Approach C: Event-Driven Consent

**How it works:** Proposals emit events, consent service listens
**Pros:** Fully decoupled
**Cons:** Overkill for current scale
**Complexity:** High

## Recommendation

**Selected:** Approach A
**Reasoning:** Consent is intrinsic to proposals, not a separate concern. Keeps domain cohesive.
**Trade-offs:** Less flexible if consent needed elsewhere later.
**Risk:** Low - can extract if needed.

## Architecture Validation

| Aspect | Compliant? | Notes |
|--------|------------|-------|
| Domain cohesion (#1) | ✅ | All in /convex/core/proposals/ |
| Dependency flow (#5) | ✅ | Core only |
| Auth before writes (#9) | ✅ | Will check facilitator authority |
| Logic in Convex (#10) | ✅ | State machine in Convex |
| Domain language (#15-16) | ✅ | Using "consent", "objection" |

## Technical Requirements

**APIs:**
- `startConsentRound` mutation
- `raiseObjection` mutation
- `integrateObjection` mutation
- `completeConsent` mutation

**Data model:**
- Add `consentStatus` to proposals
- Add `objections` table

**Testing:**
- Consent round lifecycle
- Objection blocking
- Integration flow

## Success Criteria

- [ ] Facilitator can start consent round
- [ ] Members can raise objections
- [ ] Objections block advancement
- [ ] Integration resolves objections
- [ ] Completed consent advances proposal

## Implementation Checklist

- [ ] Add consent states to proposal schema
- [ ] Create objections table
- [ ] Implement startConsentRound mutation
- [ ] Implement raiseObjection mutation
- [ ] Implement integrateObjection mutation
- [ ] Implement completeConsent mutation
- [ ] Add tests for each mutation
- [ ] Test full workflow
```

---

## Key Principles

1. **Think first** — Don't jump to implementation
2. **Multiple approaches** — Forces trade-off analysis
3. **Validate architecture** — Before coding, not after
4. **Document decisions** — Why this approach
5. **Clear success criteria** — Know when done