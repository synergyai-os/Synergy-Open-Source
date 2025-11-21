# Product Principles

> **Single Source of Truth**: These principles guide every product decision, feature prioritization, and architectural choice. When in doubt, return to these principles.

---

## Core Principles (In Order of Priority)

### 1. 🔐 Privacy First

**Data ownership stays with users, always.**

- Self-hosted option always available
- Bring-your-own AI (no forced vendor lock-in)
- Offline-first architecture
- No data mining, no selling user data
- Transparent data handling

**Why This Comes First**: Trust is foundational. Without privacy, nothing else matters.

**In Practice**:

- ✅ Build self-hosted deployment path
- ✅ Make cloud-hosted version privacy-preserving
- ✅ Let users export data anytime
- ❌ Don't lock features behind cloud-only

---

### 2. 🎯 Outcomes Over Outputs

**We don't ship features—we achieve outcomes.**

- Focus on problems solved, not features shipped
- Measure impact, not velocity
- Validate before building (run experiments)
- Kill features that don't deliver outcomes

**Decision Framework**:

- **What outcome are we trying to achieve?**
- **How will we know we've achieved it?**
- **What's the smallest step to validate?**

**In Practice**:

- ✅ Define success signals before building
- ✅ Measure leading indicators (usage, retention)
- ✅ Run experiments (interviews, prototypes, wizard of oz)
- ❌ Don't build without validation
- ❌ Don't measure story points or velocity

**See**: [Validation Framework](../../.cursor/commands/validate.md)

---

### 3. 🌍 Open Source First

**Everything we build is open source. Transparency over proprietary control.**

- Community contributions are first-class citizens
- Builders can extend, customize, and integrate
- No vendor lock-in, ever
- Trust through transparency

**Why**: Open source aligns incentives—users, builders, and company all benefit from improvements.

**In Practice**:

- ✅ All code open source (repo public)
- ✅ Marketplace revenue share (80/20 split, builders keep 80%)
- ✅ Accept community contributions
- ✅ Document architecture decisions (ADRs)
- ❌ Don't build closed-source "pro" features

---

### 4. 🚀 Autonomy Over Control

**Empower teams to own outcomes, not tasks.**

- Value streams over projects
- Autonomous teams with clear outcomes
- Dependency-aware (surface blockers early)
- No timelines without validation

**Why**: Autonomous teams move faster, innovate more, and deliver better outcomes.

**In Practice**:

- ✅ Organize work by value streams (customer outcomes)
- ✅ Teams own end-to-end delivery
- ✅ Document dependencies, not deadlines
- ❌ Don't assign tasks without context
- ❌ Don't impose arbitrary deadlines

**See**: [Value Streams](value-streams/README.md)

---

### 5. 🤖 AI-Augmented, Human-Led

**AI accelerates execution, humans guide direction.**

- Context-aware AI (trained on company data)
- AI for speed, humans for judgment
- Privacy-preserving AI (self-hosted option)
- No generic ChatGPT responses

**Why**: AI makes teams faster, but humans make strategic decisions.

**In Practice**:

- ✅ Embed AI coaching in workflows
- ✅ Train on company data (glossaries, docs, decisions)
- ✅ Make AI suggestions transparent
- ❌ Don't let AI make final decisions
- ❌ Don't force users to use AI

---

## Decision Framework

### When Principles Conflict

**Priority Order**:

1. **Privacy** > Everything else
2. **Outcomes** > Outputs
3. **Open Source** > Proprietary
4. **Autonomy** > Control
5. **Speed** > Perfection

### Examples

**Conflict: "Should we add cloud-only feature for faster shipping?"**

- ❌ NO - Violates Privacy First (principle #1)
- ✅ Build self-hosted path, even if slower

**Conflict: "Should we ship feature without validation to hit deadline?"**

- ❌ NO - Violates Outcomes Over Outputs (principle #2)
- ✅ Validate first, even if misses deadline

**Conflict: "Should we close-source a feature to protect IP?"**

- ❌ NO - Violates Open Source First (principle #3)
- ✅ Keep open, compete on execution and trust

---

## Strategic Principles

### Partner-Funded Validation

- No VC funding, no external pressure
- First partner (Agency Partner) funds development
- Profitability unlocks investment in growth
- Community contributions accelerate progress

### Continuous Discovery

- Talk to users every week
- Build for observed problems, not feature requests
- Validate assumptions with experiments
- Ship small, learn fast, iterate

### Built in Public

- Work in public (GitHub, docs, community calls)
- Document decisions (ADRs, value streams)
- Share metrics openly (revenue, OKRs, AARRR)
- Accept feedback, change direction

---

## Anti-Patterns

### ❌ Don't

1. **Feature Factory Thinking**
   - Building outputs without measuring outcomes
   - Shipping features users don't use
   - Celebrating launches over impact

2. **Deadline-Driven Development**
   - Imposing timelines without validation
   - Cutting quality to hit arbitrary dates
   - Ignoring dependencies and blockers

3. **Closed Decision-Making**
   - Making decisions without explaining why
   - Hiding failures or learnings
   - Proprietary features over open source

4. **Vendor Lock-In**
   - Forcing cloud-only features
   - Making data export difficult
   - Locking users into our AI

5. **Generic Solutions**
   - Building for everyone, resonating with no one
   - Copying competitors without differentiation
   - Generic AI responses vs. context-aware coaching

### ✅ Do

1. **Outcome-Driven Development**
   - Define success signals before building
   - Validate with experiments (interviews, prototypes)
   - Kill features that don't deliver outcomes

2. **Dependency-Aware Planning**
   - Surface blockers early
   - Document what we need to unblock
   - Focus on clearing dependencies, not hitting dates

3. **Transparent Decision-Making**
   - Document why we built/killed features
   - Share metrics openly (wins and losses)
   - Accept community feedback

4. **Privacy-Preserving Growth**
   - Self-hosted option always available
   - Data export always easy
   - Bring-your-own AI supported

5. **Focused Solutions**
   - Build for product teams specifically
   - Compete on outcomes (not features)
   - Context-aware AI (not generic ChatGPT)

---

## Success Signals

### Leading Indicators (Early Signals)

- ✅ **They're using it**: Daily active users
- ✅ **They're saying yes**: Feature requests from users
- ✅ **They're coming back**: DAU/MAU ratio > 50%
- ✅ **Positive feedback**: "This changed how we work" testimonials
- ✅ **Community contributing**: PRs from community members
- ✅ **Word of mouth**: Unsolicited recommendations

### Lagging Indicators (Outcome Signals)

- ✅ **Revenue**: Paying customers cover costs
- ✅ **Retention**: < 5% monthly churn
- ✅ **Expansion**: Customers onboard additional teams
- ✅ **Community size**: 1,000+ GitHub stars, 100+ contributors
- ✅ **Marketplace**: 10+ builder-created apps

### Impact Signals (Long-Term)

- ✅ **Better decisions**: Teams using data to decide
- ✅ **Faster onboarding**: New members productive in days, not weeks
- ✅ **Higher velocity**: Teams ship outcomes faster
- ✅ **Reduced fragmentation**: One tool replacing 5-10 tools
- ✅ **AI adoption**: Teams using AI coaching daily

**See**: [Metrics Dashboard](metrics.md)

---

## For Contributors

### How to Use These Principles

**When building a feature:**

1. Read these principles first
2. Ask: "Which outcome does this achieve?"
3. Ask: "Does this violate any principles?"
4. If conflict → Follow priority order (Privacy > Outcomes > Open Source > Autonomy)

**When making a product decision:**

1. State the problem (not the solution)
2. Define success signals
3. Run cheapest/fastest experiment
4. Check principles (does this align?)
5. Document decision (ADR or value stream)

**When reviewing PRs:**

1. Does this achieve an outcome? (Not just ship code)
2. Does this respect privacy? (Self-hosted path?)
3. Is this open source? (No proprietary lock-in?)
4. Does this empower autonomy? (Not create dependencies?)

---

## Related

- **[Product Vision 2.0](../../marketing-docs/strategy/product-vision-2.0.md)** - What we're building
- **[Product Strategy](../../marketing-docs/strategy/product-strategy.md)** - Outcome-driven roadmap
- **[Value Streams](value-streams/README.md)** - How we organize work
- **[Validation Framework](../../.cursor/commands/validate.md)** - How we test assumptions
- **[Metrics Dashboard](metrics.md)** - What we measure
- **[Contributing Guidelines](../../CONTRIBUTING.md)** - How to contribute

---

## Philosophy

This is how **Champions League product teams** work:

- **Outcome-driven**: Measure impact, not velocity
- **Privacy-first**: Trust through transparency
- **Autonomous**: Teams own outcomes, not tasks
- **Open source**: Community-driven, no vendor lock-in
- **AI-augmented**: Human creativity + AI execution
- **Built in public**: Transparent decisions, shared learnings

---

**Last Updated**: November 8, 2025  
**Status**: 🟢 Active  
**Owner**: Randy (Founder)
