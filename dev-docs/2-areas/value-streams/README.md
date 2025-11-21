# Value Streams

> **Philosophy**: We organize work by **value streams** (customer outcomes), not projects. Each value stream is owned by an autonomous team focused on delivering measurable outcomes.

---

## What is a Value Stream?

A **value stream** is the sequence of activities required to deliver value to a customer. In SynergyOS:

- **Outcome-focused**: Clear user outcome (not "ship feature X")
- **Team-owned**: Independent team with full autonomy
- **Dependency-aware**: Documents what blocks progress
- **Measurable**: Success signals, not story points

---

## Value Stream Structure

Each value stream has its own folder with:

```
/value-streams/
  /stream-name/
    README.md              # Overview, outcome, team, tech
    ARCHITECTURE.md        # Technical decisions, patterns
    DEPENDENCIES.md        # What blocks us, what we need
    OUTCOMES.md            # Success signals, metrics
    DECISIONS.md           # ADRs (Architecture Decision Records)
```

---

## Active Value Streams

### 1. [Documentation System](./documentation-system/)

**Outcome**: Product teams can find and maintain living documentation at the speed of thought  
**Team**: Core (Randy + AI)  
**Status**: In progress  
**Success Signal**: Onboarding time < 3 days, Cursor AI finds docs 95% of time

### 2. [Authentication & Multi-Tenancy](./auth-multi-tenancy/)

**Outcome**: Organizations can safely share knowledge with their teams  
**Team**: Core (Randy + AI)  
**Status**: Foundation complete, multi-tenancy next  
**Success Signal**: Agency Partner onboards Client with zero security concerns

### 3. [Inbox & Knowledge Collection](./inbox-collection/)

**Outcome**: Users effortlessly capture knowledge from any source  
**Team**: Core (Randy + AI)  
**Status**: Complete (Readwise sync working)  
**Success Signal**: 90%+ of highlights synced, zero manual effort

---

## How We Use Value Streams

### For Planning

- **No timelines**: Focus on outcomes, not deadlines
- **Clear dependencies**: Document what blocks progress
- **Autonomous teams**: Teams own their stream end-to-end

### For Development

- **Work in public**: All streams documented, open source
- **AI-navigable**: Reference with `@value-streams/stream-name`
- **Living docs**: Update as you learn, not quarterly

### For Contributors

- **Pick a stream**: Find the outcome you care about
- **Understand context**: Read README → ARCHITECTURE → DEPENDENCIES
- **Start contributing**: No permission needed, PRs welcome

---

## Creating a New Value Stream

1. **Write the outcome** (user-focused, measurable)
2. **Define success signals** (how you know you've won)
3. **Create folder** (`/value-streams/stream-name/`)
4. **Document dependencies** (what's blocking you?)
5. **Share with team** (Discord, GitHub, community calls)

---

## Anti-Patterns

❌ **Project thinking**: "Ship feature X by date Y"  
✅ **Outcome thinking**: "Enable teams to find docs instantly"

❌ **Siloed knowledge**: Docs in Notion, code in GitHub, decisions in Slack  
✅ **Centralized knowledge**: Everything in value stream folder

❌ **Feature factories**: Shipping outputs, not outcomes  
✅ **Product teams**: Validating outcomes, iterating fast

❌ **Timelines without dependencies**: "We'll ship in 2 weeks" (ignoring blockers)  
✅ **Dependency-aware**: "Blocked on X, can unblock with Y"

---

## Philosophy

This is how **Champions League product teams** work:

- **Autonomous**: Teams own outcomes, not tasks
- **Outcome-driven**: Measure impact, not velocity
- **Dependency-aware**: Surface blockers early
- **Built in public**: Open source, transparent decisions
- **AI-augmented**: Human creativity + AI execution

---

## References

- [Product Vision 2.0](../../marketing-docs/strategy/product-vision-2.0.md)
- [Product Strategy](../../marketing-docs/strategy/product-strategy.md)
- [Team Topologies](https://teamtopologies.com/) (inspiration for value streams)
- [Continuous Discovery Habits](https://www.producttalk.org/) (outcome-driven product development)

---

**Next Steps**: Pick a value stream, read the README, start contributing. No permission needed.
