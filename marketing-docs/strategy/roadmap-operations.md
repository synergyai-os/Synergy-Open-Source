# Roadmap Operations: Tracking Progress & Learning

> **Purpose**: Operational tools for tracking roadmap health, measuring success signals, capturing validated learning, and conducting quarterly reviews. This document complements the [Product Roadmap](./roadmap.md) with actionable tracking mechanisms.

> **Starting Point**: [Product Vision 2.0](./product-vision-2.0.md) - Strategic vision and success signals framework ⭐

> **See Also**: [Success Signals](../audience/success-signals.md) - Complete success signal definitions and measurement framework ⭐

---

## How This Document Works

This document provides **operational tools** to:

1. **Track Roadmap Health** - Monitor progress on active themes
2. **Measure Success Signals** - Quantify how we're achieving outcomes
3. **Capture Validated Learning** - Document what we learn from each theme
4. **Conduct Quarterly Reviews** - Structured process for roadmap evolution

**This is NOT strategy** - Strategy lives in [Product Roadmap](./roadmap.md) and [Product Vision 2.0](./product-vision-2.0.md).

**This IS operations** - Tools to execute, track, and learn from the roadmap.

---

## Roadmap Health Dashboard

**Last Updated**: 2025-11-19  
**Next Review**: 2026-02-19 (Quarterly)

### NOW Themes Status

| Theme | Success Signals | Progress | Health | Last Updated |
|-------|----------------|----------|--------|--------------|
| Partner Validation | 2/4 achieved | 50% | 🟡 On Track | [Date] |
| Multi-Tenant Foundation | 1/4 achieved | 25% | 🟢 In Progress | [Date] |

**Health Legend**:
- 🟢 **In Progress** - Active work, no blockers
- 🟡 **On Track** - Progressing, minor risks
- 🟠 **At Risk** - Blockers or delays emerging
- 🔴 **Blocked** - Critical blockers, needs intervention
- ✅ **Complete** - Success signals achieved, theme complete

### Theme Movement History

**Purpose**: Track how themes move between time horizons based on validated learning.

| Date | Theme | Movement | Reason | Validated Learning |
|------|-------|----------|--------|-------------------|
| [Date] | Community Launch | Later → Next | Unexpected validation from early adopters | Community demand higher than expected |
| [Date] | Partner Validation | Next → Now | Dependencies met (Agency Partner committed) | First partner secured |

**How to Use**:
- Document every theme movement (Now ↔ Next ↔ Later)
- Capture the validated learning that triggered the move
- Review quarterly to identify patterns

### Success Signal Tracking (Current Quarter)

**Purpose**: Track progress on success signals for active themes.

#### Theme: Partner Validation

**Success Signals**:
- ✅ **Agency Partner team logs in daily (5+ active users)** - **ACHIEVED** ([Date])
  - Measurement: Convex analytics dashboard
  - Current: 7 active users/day average
  - Status: ✅ Exceeded target
  
- ⏳ **Agency Partner recommends to Client** - **IN PROGRESS**
  - Measurement: Unsolicited recommendation (tracked via conversations)
  - Current: Mentioned in 2 conversations, not yet formal recommendation
  - Status: ⏳ On track, expected [Date]
  
- ❌ **Revenue covers costs ($60/month minimum)** - **NOT YET**
  - Measurement: Stripe billing dashboard
  - Current: $0/month (still in validation phase)
  - Status: ❌ Waiting for pricing agreement
  
- ⏳ **Positive feedback ("This changed how we work")** - **GATHERING**
  - Measurement: User interviews, feedback forms
  - Current: 3/5 users gave positive feedback, 2 neutral
  - Status: ⏳ Need 1 more strong positive signal

**Overall Progress**: 2/4 achieved (50%) - 🟡 On Track

#### Theme: Multi-Tenant Foundation

**Success Signals**:
- ✅ **Agency Partner + Client on same infrastructure** - **ACHIEVED** ([Date])
  - Measurement: Infrastructure deployment logs
  - Current: Both orgs deployed successfully
  - Status: ✅ Complete
  
- ⏳ **Permissions enforce boundaries** - **TESTING**
  - Measurement: Security audit, penetration testing
  - Current: Initial tests passed, comprehensive audit scheduled
  - Status: ⏳ In progress
  
- ❌ **Performance doesn't degrade** - **NOT YET**
  - Measurement: Performance monitoring (response times, query latency)
  - Current: Baseline established, monitoring active
  - Status: ❌ Need 2 weeks of stable performance data
  
- ❌ **Self-service org creation** - **NOT YET**
  - Measurement: Feature completion, user testing
  - Current: UI built, backend in progress
  - Status: ❌ 60% complete, expected [Date]

**Overall Progress**: 1/4 achieved (25%) - 🟢 In Progress

### Roadmap Health Metrics

**Purpose**: High-level metrics showing overall roadmap health.

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Themes in "Now" | 2 | 2-3 | ✅ Healthy |
| Themes with blockers | 0 | < 1 | ✅ Healthy |
| Success signal achievement rate | 37.5% (3/8) | 50%+ | 🟡 Below target |
| Themes moved this quarter | 1 | 1-2 | ✅ Healthy |
| Validated learning captured | 3 | 4+ | 🟡 Below target |

**Health Score**: 🟡 **75/100** - On track, but need to accelerate learning capture

---

## Validated Learning Log

**Purpose**: Capture what we learn from each theme—what worked, what didn't, and how it changes our roadmap.

### How to Use This Log

1. **After each theme milestone** (success signal achieved or failed)
2. **During quarterly reviews** (consolidate learnings)
3. **Before moving themes** (document why we're moving them)

### Learning Log Entries

#### Theme: Partner Validation

**Date**: [Date]  
**Status**: 🟡 In Progress (2/4 success signals achieved)

**What We Learned**:

**✅ Validated Assumptions**:
- ✅ Agency Partner values customization over features (validated)
  - Evidence: Requested workflow customization, not new features
  - Impact: Prioritize customization tools over feature expansion
  
- ✅ Teams adopt workflows faster when AI-guided (validated)
  - Evidence: Users completed onboarding 2x faster with AI coach
  - Impact: Accelerate AI Coaching theme (moved from "Later" to "Next")

**❌ Invalidated Assumptions**:
- ❌ Initial pricing too high → adjusted to $10/user/month (pivoted)
  - Evidence: Agency Partner hesitated at $25/user/month, accepted $10/user/month
  - Impact: Revised pricing model across all tiers

**🔄 Changed Approaches**:
- **Pricing Model**: Usage-based → Per-user (learned teams prefer predictable costs)
- **Onboarding**: Manual → AI-guided (learned teams need guidance, not documentation)
- **Feature Priority**: Advanced features → Simplicity first (learned teams want core workflows stable)

**Impact on Roadmap**:
- ✅ Accelerated AI Coaching theme (moved from "Later" to "Next")
- ✅ Deprioritized advanced features (teams want simplicity first)
- ✅ Added "Customization Tools" as new theme in "Next"

**Would We Do It Again?**: ✅ Yes - Validation approach worked, pricing pivot was necessary

---

#### Theme: Multi-Tenant Foundation

**Date**: [Date]  
**Status**: 🟢 In Progress (1/4 success signals achieved)

**What We Learned**:

**✅ Validated Assumptions**:
- ✅ Organizations want data isolation (validated)
  - Evidence: Both Agency Partner and Client requested strict data boundaries
  - Impact: Confirmed security-first approach

**⏳ Assumptions Being Tested**:
- ⏳ Self-service org creation is critical (testing)
  - Evidence: Agency Partner wants to create Client org themselves
  - Impact: Prioritizing self-service flow

**Impact on Roadmap**:
- ✅ Confirmed security-first architecture approach
- ⏳ Self-service org creation moved up in priority

**Would We Do It Again?**: ✅ Yes - Architecture decisions validated

---

### Learning Patterns (Quarterly Review)

**Purpose**: Identify patterns across themes to inform future roadmap decisions.

**Patterns Identified**:
1. **Teams prefer simplicity over features** (appeared in 2/2 themes)
   - Action: Prioritize core workflows, deprioritize advanced features
   
2. **AI guidance accelerates adoption** (appeared in 1/2 themes)
   - Action: Continue investing in AI Coaching theme

3. **Pricing sensitivity higher than expected** (appeared in 1/2 themes)
   - Action: Review pricing strategy, consider freemium model

**Questions to Explore**:
- Will pricing sensitivity continue as we add more value?
- How much customization do teams actually need vs. want?
- What's the minimum viable AI coaching that delivers value?

---

## Success Signal Measurement Guide

**Purpose**: Define exactly how to measure each success signal for active themes.

> **See**: [Success Signals](../audience/success-signals.md) - Complete framework with leading/lagging/impact indicators ⭐

### How to Use This Guide

1. **For each success signal** in a theme, define:
   - **Data source**: Where the data comes from
   - **Metric**: What we're measuring
   - **Target**: What success looks like
   - **Frequency**: How often we check
   - **Tool**: What tool/dashboard we use

2. **Update quarterly** as we learn better ways to measure

### Measurement Definitions

#### Theme: Partner Validation

**Success Signal**: Agency Partner team logs in daily (5+ active users)

**Measurement**:
- **Data Source**: Convex analytics (user login events)
- **Metric**: Daily active users (DAU) for Agency Partner organization
- **Target**: 5+ unique users per day (averaged over 7 days)
- **Frequency**: Weekly review (every Monday)
- **Tool**: Convex dashboard query: `analytics/dau-by-org`
- **Owner**: [Name] (Product Manager)

**Success Signal**: Agency Partner recommends to Client (unsolicited)

**Measurement**:
- **Data Source**: Conversations, email threads, meeting notes
- **Metric**: Unsolicited recommendation (not prompted by us)
- **Target**: Agency Partner mentions platform to Client without us asking
- **Frequency**: Real-time (track as it happens)
- **Tool**: CRM notes, conversation logs
- **Owner**: [Name] (Account Manager)

**Success Signal**: Revenue covers costs ($60/month minimum)

**Measurement**:
- **Data Source**: Stripe billing dashboard
- **Metric**: Monthly recurring revenue (MRR)
- **Target**: $60/month minimum
- **Frequency**: Monthly review (first Monday of month)
- **Tool**: Stripe dashboard → Revenue → MRR
- **Owner**: [Name] (Finance/Founder)

**Success Signal**: Positive feedback ("This changed how we work")

**Measurement**:
- **Data Source**: User interviews, feedback forms, NPS surveys
- **Metric**: Qualitative feedback score (1-5) + specific quotes
- **Target**: 4/5 users give positive feedback OR specific quote "This changed how we work"
- **Frequency**: Bi-weekly (every 2 weeks)
- **Tool**: Typeform feedback form, user interview notes
- **Owner**: [Name] (Product Manager)

---

#### Theme: Multi-Tenant Foundation

**Success Signal**: Agency Partner + Client on same infrastructure

**Measurement**:
- **Data Source**: Infrastructure deployment logs, Convex dashboard
- **Metric**: Both organizations deployed and accessible
- **Target**: Both orgs can log in and use platform independently
- **Frequency**: One-time validation (then ongoing monitoring)
- **Tool**: Convex dashboard → Organizations → List
- **Owner**: [Name] (Engineering Lead)

**Success Signal**: Permissions enforce boundaries

**Measurement**:
- **Data Source**: Security audit, penetration testing, automated tests
- **Metric**: Zero cross-org data access violations
- **Target**: Security audit passes, penetration test passes, automated tests pass
- **Frequency**: One-time audit (then ongoing automated tests)
- **Tool**: Security audit report, automated test suite
- **Owner**: [Name] (Security Lead/Engineering Lead)

**Success Signal**: Performance doesn't degrade

**Measurement**:
- **Data Source**: Performance monitoring (Convex metrics, response times)
- **Metric**: Response time p95 < 500ms (same as single-tenant baseline)
- **Target**: No degradation vs. single-tenant performance
- **Frequency**: Weekly review (every Monday)
- **Tool**: Convex dashboard → Performance → Response Times
- **Owner**: [Name] (Engineering Lead)

**Success Signal**: Self-service org creation

**Measurement**:
- **Data Source**: Feature completion, user testing
- **Metric**: User can create org without engineering support
- **Target**: Feature complete + 3 users successfully create orgs
- **Frequency**: One-time validation (then ongoing monitoring)
- **Tool**: Feature flag, user testing sessions
- **Owner**: [Name] (Product Manager)

---

## Quarterly Roadmap Review Template

**Purpose**: Structured process for reviewing and evolving the roadmap every quarter.

**Review Date**: [Date]  
**Reviewers**: [Names/Roles]  
**Next Review**: [Date]

### 1. NOW Themes Review

**Purpose**: Assess progress on active themes, decide if they should move or stay.

#### Theme: Partner Validation

**Success Signals Achieved**: 2/4 (50%)

**On Track?**: ✅ Yes / ❌ No
- **Reasoning**: [Why yes/no]

**Action Needed**: 
- [ ] [Specific action item]
- [ ] [Specific action item]

**Move to Complete?**: ✅ Yes / ❌ No
- **Reasoning**: [Why yes/no]

**Move to Next/Later?**: ✅ Yes / ❌ No
- **If yes, which**: Next / Later
- **Reasoning**: [Why move]

---

#### Theme: Multi-Tenant Foundation

**Success Signals Achieved**: 1/4 (25%)

**On Track?**: ✅ Yes / ❌ No
- **Reasoning**: [Why yes/no]

**Action Needed**: 
- [ ] [Specific action item]
- [ ] [Specific action item]

**Move to Complete?**: ✅ Yes / ❌ No
- **Reasoning**: [Why yes/no]

**Move to Next/Later?**: ✅ Yes / ❌ No
- **If yes, which**: Next / Later
- **Reasoning**: [Why move]

---

### 2. Theme Movement Decisions

**Purpose**: Decide which themes move between time horizons based on validated learning.

#### Next → Now (Promote Themes)

**Themes to Promote**:
- [ ] **Theme 3: Community Launch**
  - **Dependencies Met?**: ✅ Yes / ❌ No
  - **Validated Learning**: [What validated this need]
  - **Success Signals Ready?**: ✅ Yes / ❌ No
  
- [ ] **Theme 4: Product Discovery**
  - **Dependencies Met?**: ✅ Yes / ❌ No
  - **Validated Learning**: [What validated this need]
  - **Success Signals Ready?**: ✅ Yes / ❌ No

**Decision**: [Which themes to promote and why]

---

#### Next → Later (Deprioritize Themes)

**Themes to Deprioritize**:
- [ ] **[Theme Name]**
  - **Reason**: [Why deprioritize]
  - **Validated Learning**: [What we learned]
  - **Future Consideration**: [When might we revisit]

**Decision**: [Which themes to deprioritize and why]

---

#### Later → Next (Accelerate Themes)

**Themes to Accelerate**:
- [ ] **[Theme Name]**
  - **Reason**: [Why accelerate]
  - **Validated Learning**: [What validated this need]
  - **Dependencies**: [What must be true first]

**Decision**: [Which themes to accelerate and why]

---

### 3. New Themes Added

**Purpose**: Document new themes added based on validated learning.

**New Themes**:
- [ ] **[Theme Name]**
  - **Why Added**: [What validated this need]
  - **Validated Learning**: [Specific learning that triggered this]
  - **Time Horizon**: Now / Next / Later
  - **Success Signals**: [Draft success signals]

**Decision**: [Which new themes to add and why]

---

### 4. Assumptions Validated/Invalidated

**Purpose**: Track which assumptions were validated or invalidated this quarter.

**Validated Assumptions**:
- ✅ **Assumption**: "Teams want outcome-driven tools"
  - **Evidence**: Agency Partner data shows 80% adoption of OKR tracking
  - **Impact**: Continue investing in outcome-driven features
  
- ✅ **Assumption**: "AI guidance accelerates adoption"
  - **Evidence**: Users completed onboarding 2x faster with AI coach
  - **Impact**: Accelerate AI Coaching theme

**Invalidated Assumptions**:
- ❌ **Assumption**: "Teams will self-host"
  - **Evidence**: 60% choose cloud hosting, only 40% self-host
  - **Impact**: Prioritize cloud hosting features, deprioritize self-host tooling

**Impact on Roadmap**: [How validated/invalidated assumptions change roadmap priorities]

---

### 5. Roadmap Changes Summary

**What Changed**:
- [List all changes: theme movements, new themes, deprioritized themes]

**Why Changed**:
- [Rationale for changes based on validated learning]

**Impact**:
- **For Stakeholders**: [What this means for investors, users, community]
- **For Team**: [What this means for engineering, product, design]
- **For Vision**: [How this aligns with Product Vision 2.0]

---

### 6. Next Quarter Priorities

**Purpose**: Set clear priorities for the next quarter based on this review.

**Top 3 Priorities**:
1. **[Priority 1]** - [Why this matters]
2. **[Priority 2]** - [Why this matters]
3. **[Priority 3]** - [Why this matters]

**Success Criteria**: [How we'll know we succeeded next quarter]

---

## Roadmap Operations Checklist

**Use this checklist for ongoing roadmap operations:**

### Weekly (Every Monday)

- [ ] Update Roadmap Health Dashboard
- [ ] Review success signal progress for active themes
- [ ] Document any new validated learning
- [ ] Check for blockers or risks

### Monthly (First Monday of Month)

- [ ] Review all success signal measurements
- [ ] Update Success Signal Measurement Guide if needed
- [ ] Consolidate validated learning log entries
- [ ] Review theme movement history

### Quarterly (First Monday of Quarter)

- [ ] Conduct full Quarterly Roadmap Review
- [ ] Update Roadmap Health Dashboard with quarterly metrics
- [ ] Consolidate Validated Learning Log
- [ ] Update Success Signal Measurement Guide
- [ ] Communicate roadmap changes to stakeholders
- [ ] Update [Product Roadmap](./roadmap.md) with theme movements

---

## Linking to Product Vision

**This document operationalizes**:
- ✅ [Product Vision 2.0](./product-vision-2.0.md) - Success signals framework
- ✅ [Product Roadmap](./roadmap.md) - Theme tracking and evolution
- ✅ [Success Signals](../audience/success-signals.md) - Measurement definitions

**This document enables**:
- ✅ Outcome-driven roadmap execution
- ✅ Validated learning capture
- ✅ Data-driven roadmap evolution
- ✅ Stakeholder transparency

---

**Last Updated**: 2025-11-19  
**Next Review**: 2026-02-19 (Quarterly)  
**Owner**: Product & Architecture Team

**See Also**:
- [Product Roadmap](./roadmap.md) - Outcome-driven roadmap themes this document tracks ⭐
- [Product Vision 2.0](./product-vision-2.0.md) - Strategic vision and success signals framework
- [Future Vision & Architecture](../../dev-docs/2-areas/architecture/future-vision.md) - Executive vision document with roadmap overview
- [Success Signals](../audience/success-signals.md) - Complete success signal definitions and measurement framework

