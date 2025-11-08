# How to Document a Value Stream

> **When to Use This**: Every time you start a new feature/value stream, create this structure first. It keeps teams autonomous and unblocks champions-league development.

---

## Quick Start

1. **Write the press release first** (working backwards from customer value)
2. **Create the value stream folder** (`/dev-docs/value-streams/stream-name/`)
3. **Use the templates below** (copy/paste, fill in)
4. **Share with team** (Discord, GitHub, start building)

---

## Folder Structure

```
/dev-docs/value-streams/
  /your-stream-name/
    README.md           ← Start here (outcome, team, success)
    ARCHITECTURE.md     ← Technical decisions, patterns
    DEPENDENCIES.md     ← Blockers, enablers, risks
    DECISIONS.md        ← ADRs (optional, for big decisions)
```

---

## Template: README.md

```markdown
# Value Stream: [Name]

> **Outcome**: [One sentence user outcome - what value does this deliver?]

---

## Overview

[2-3 paragraphs explaining what this is and why it matters]

---

## User Outcome (Not Project Goal)

### Before (Pain)
- [Pain point 1]
- [Pain point 2]
- [Pain point 3]

### After (Outcome)
- [Outcome 1 - measurable]
- [Outcome 2 - measurable]
- [Outcome 3 - measurable]

---

## Success Signals

### Leading Indicators (What we can control)
- ✅ [Thing we can do daily]
- ✅ [Thing we can do daily]

### Lagging Indicators (What we measure)
- 🎯 **[Metric]**: [Target] (from [Current])
- 🎯 **[Metric]**: [Target] (from [Current])

### Impact (Why it matters)
- [Business impact]
- [User impact]
- [Team impact]

---

## Team

**Owner**: [Name]  
**Contributors**: [Names or "Open source community"]  
**Stakeholders**: [Who cares about this?]

---

## Tech Stack

### Framework
- **[Framework]**: [Why]

### Key Libraries
- **[Library]**: [What it does]

### Integrations
- **[Service]**: [How we use it]

---

## Architecture

[High-level diagram or bullet points showing data flow]

---

## Key Decisions

### Why [Decision X]?
- **Rationale**: [Why we chose this]
- **Trade-offs**: [What we gained/lost]
- **Alternatives Considered**: [What we rejected and why]

---

## Dependencies

### Blockers (External)
- ❌ [What's blocking us that we can't control]

### Enablers (Internal)
- ✅ [What we have that enables this]

### Nice-to-Have (Future)
- 🔄 [What would make this better]

---

## Getting Started (For Contributors)

### 1. Read the Context
- [Link to press release if exists]
- [Link to ARCHITECTURE.md]

### 2. Run Locally
```bash
[Commands to run]
```

### 3. Make Your First Contribution
- [Where to start]

---

## Roadmap (Outcome-Based, No Dates)

### Phase 1: Foundation
- ✅ [Done]
- ✅ [Done]

### Phase 2: [Phase Name] (Current)
- 🔄 [In progress]
- 🔄 [In progress]

### Phase 3: [Phase Name] (Next)
- ⏳ [Planned]

---

## Metrics Dashboard

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| [Metric 1] | [Now] | [Goal] | 🔄 |
| [Metric 2] | [Now] | [Goal] | 🔄 |

---

**Status**: 🔄 In progress  
**Last Updated**: [Date]  
**Next Milestone**: [What's next]  
**Contribution Opportunity**: [High/Medium/Low]
```

---

## Template: ARCHITECTURE.md

```markdown
# Architecture: [Value Stream Name]

> **Design Principle**: [Core architectural principle for this stream]

---

## System Overview

```
[ASCII diagram or description of components and data flow]
```

---

## Key Architectural Decisions

### 1. [Decision Name]

**Decision**: [What we decided]

**Rationale**:
- [Reason 1]
- [Reason 2]

**Trade-offs**:
- ✅ [Benefit]
- ❌ [Cost]

---

### 2. [Next Decision]

[Same format]

---

## Component Architecture

### [Component Name]

**Purpose**: [What it does]

**Responsibilities**:
- [Responsibility 1]
- [Responsibility 2]

**Design Tokens** (if UI):
```css
[Relevant tokens]
```

---

## Data Flow

### [Scenario 1]
```
1. [Step 1]
2. [Step 2]
3. [Step 3]
```

---

## Integration Points

### [External System]

**How It Works**:
- [Integration detail]

**Best Practices**:
- [Practice 1]

---

## Performance Considerations

### [Performance Area]

**Challenge**: [What could be slow]

**Solution**: [How we handle it]

**Target**: [Measurable performance goal]

---

## Security Considerations

### [Security Risk]

**Risk**: [What could go wrong]

**Mitigation**: [How we prevent it]

---

## Scalability

**Current**: [Current scale]  
**Target**: [Target scale]  
**Plan**: [How we'll scale]

---

## Future Enhancements

### Phase N (Timeline)
- [Enhancement 1]
- [Enhancement 2]

---

**Last Updated**: [Date]  
**Next Review**: [When to revisit this]
```

---

## Template: DEPENDENCIES.md

```markdown
# Dependencies: [Value Stream Name]

> **Philosophy**: Surface dependencies early. Autonomous teams need to know what's blocking them.

---

## Blockers (What's Slowing Us Down)

### [Blocker Name]

**What**: [Description]

**Impact**: [How it blocks us]

**Owner**: [Who can unblock]

**Status**: [Status]

---

## Enablers (What We Have)

### [Enabler Name] ✅

**What**: [Description]

**Why It Matters**: [Impact]

**Status**: [Status]

---

## Dependencies to Add

### [Dependency Name]

**What**: [What we need]

**Why**: [Why we need it]

**Installation**:
```bash
[How to add it]
```

**Status**: ⏳ Pending

---

## What We're Blocking

### [Team/Stream Name]

**Who**: [Who's blocked]

**What**: [What they need from us]

**Impact**: [How it affects them]

**Status**: [Status]

---

## External Dependencies

### [Service/API Name]

**What**: [What we depend on]

**Why**: [Why we use it]

**Risk**: [Risk level and why]

**Mitigation**: [How we reduce risk]

---

## Risks & Mitigations

### Risk: [Risk Name]

**Risk**: [Description]

**Likelihood**: [High/Medium/Low]  
**Impact**: [High/Medium/Low]

**Mitigation**: [How we handle it]

---

## Decision Log

### Why Not [Alternative]?

**Considered**: [What we considered]

**Rejected Because**: [Why we said no]

**Decision**: [What we chose]

---

## Timeline (Outcome-Based, No Dates)

### Phase 1: [Phase Name] (Status)
- [Item]

**Blocker**: [What's blocking or "None"]  
**Estimated Effort**: [Rough estimate]  
**Risk**: [Risk level]

---

## Success Criteria

### Phase N Success
- ✅ [Criteria 1]
- ✅ [Criteria 2]

---

## Questions to Answer

### Open Questions
- **[Question]**: [Current thinking]

---

**Last Updated**: [Date]  
**Next Review**: [When]  
**Contact**: [Owner]
```

---

## Example: Real Usage

See `/dev-docs/value-streams/documentation-system/` for a complete example:
- [README.md](./documentation-system/README.md) - Full value stream overview
- [ARCHITECTURE.md](./documentation-system/ARCHITECTURE.md) - Technical decisions
- [DEPENDENCIES.md](./documentation-system/DEPENDENCIES.md) - Blockers and risks

---

## Best Practices

### ✅ Do This
- **Write press release first** (working backwards)
- **Focus on outcomes** (not features)
- **Document dependencies** (surface blockers early)
- **Update as you learn** (living documentation)
- **Be specific** (measurable success signals)

### ❌ Don't Do This
- Don't write features without outcomes
- Don't hide dependencies (transparency wins)
- Don't set timelines without knowing blockers
- Don't write once and forget (update regularly)
- Don't overcomplicate (simple > complex)

---

## When to Create a New Value Stream

**Create when**:
- ✅ Independent team can own it end-to-end
- ✅ Clear user outcome (not just "ship feature")
- ✅ Measurable success signals
- ✅ Can ship without coordinating with other teams

**Don't create when**:
- ❌ Small feature (part of existing stream)
- ❌ Unclear outcome (needs more discovery)
- ❌ Requires tight coordination (bundle with related stream)

---

## Quick Reference

**Starting fresh?**
1. Copy templates above
2. Fill in outcome and success signals
3. Document dependencies
4. Ship and iterate

**Adding to existing stream?**
1. Update README with new outcome
2. Add architectural decisions if needed
3. Update dependencies
4. Keep it current

---

**Questions?** Open a GitHub discussion or ask in Discord #development channel.

