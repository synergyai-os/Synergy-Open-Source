# Roadmap: Outcome-Driven Themes

> **Philosophy**: We don't ship features on deadlines. We achieve outcomes when they're validated. This roadmap shows **themes** and **outcomes**, not dates.

---

## How to Read This Roadmap

### Not Feature Lists

Traditional roadmaps list features with dates:

- ❌ "Ship OKR tracking by Q2"
- ❌ "Launch marketplace by end of year"

This creates pressure to ship outputs, not outcomes.

### Outcome Themes

We organize by **themes** with clear **outcomes** and **success signals**:

- ✅ "Enable teams to align on goals" → Success: Teams reference OKRs weekly
- ✅ "Build community of contributors" → Success: 100+ contributors within 12 months

### Sequencing, Not Dates

We show **order** (what depends on what), not **when**:

- **Current**: What we're actively working on
- **Next**: What we'll tackle once current themes are validated
- **Future**: Long-term vision, order TBD based on learnings

---

## Current Themes

### 🔄 Theme 1: Partner Validation

**Outcome**: Saprolab uses our platform daily and pays to sustain development.

**Why**: Without validation, we're building in a vacuum.

**Success Signals**:

- ✅ Saprolab team logs in daily
- ✅ Saprolab recommends it to ZDHC
- ✅ Revenue covers costs ($60/month minimum)
- ✅ Positive feedback from users

**What We're Building**:

- Multi-tenancy foundation (orgs & teams)
- Core workflows (alignment, meetings, glossaries)
- Stable, reliable infrastructure
- Permission system (data boundaries)

**Status**: 🔄 In Progress (building multi-tenancy)

---

### 🔄 Theme 2: Multi-Tenant Foundation

**Outcome**: Multiple organizations use the platform simultaneously with clear data boundaries.

**Why**: Without multi-tenancy, we can only serve one customer.

**Success Signals**:

- ✅ Saprolab + ZDHC on same infrastructure, separate data
- ✅ Permissions enforce boundaries (no data leaks)
- ✅ Performance doesn't degrade
- ✅ Self-service org creation

**What We're Building**:

- Organization & team schemas
- Role-based access control (RBAC)
- Data isolation & encryption
- Billing & usage tracking

**Status**: 🔄 In Progress (schema designed, implementing)

---

## Next Themes (After Validation)

### ⏳ Theme 3: Community Launch

**Outcome**: A thriving community of product people and developers contributing.

**Why**: Open source lives or dies by community.

**Success Signals**:

- ✅ 1,000+ GitHub stars within 12 months
- ✅ 100+ contributors
- ✅ Active Discord with daily discussions
- ✅ Bjorn and others contributing regularly
- ✅ Unsolicited blog posts/videos

**What We're Building**:

- Public GitHub repo with clear README
- Contribution guidelines (CONTRIBUTING.md)
- Starter issues for new contributors
- Community forum (Discord or Discourse)
- Journey blog (share progress, learnings)

**Dependencies**: Multi-tenancy validated (clean architecture for contributors)

---

### ⏳ Theme 4: Product Discovery Tools

**Outcome**: Teams conduct continuous discovery without switching tools.

**Why**: Discovery is where great products start.

**Success Signals**:

- ✅ Teams using it for user research
- ✅ Opportunity solution trees created weekly
- ✅ Research insights surface during planning
- ✅ Decision rationale captured and referenced

**What We're Building**:

- User research repository
- Opportunity solution trees (Teresa Torres)
- Assumption testing (experiment tracking)
- Outcome mapping (goals → opportunities → solutions)

**Dependencies**: Partner validation (real teams using it)

---

### ⏳ Theme 5: Product Delivery Tools

**Outcome**: Teams plan, track, and ship outcomes (not just features).

**Why**: Most roadmap tools focus on outputs. We focus on outcomes.

**Success Signals**:

- ✅ Roadmaps updated in real-time
- ✅ OKRs tracked and visible to everyone
- ✅ Teams reference goals when prioritizing
- ✅ Automated status reports save 5+ hours/week

**What We're Building**:

- Outcome-driven roadmaps
- OKR tracking (Objectives & Key Results)
- Sprint planning integrated with discovery
- Automated status reporting

**Dependencies**: Discovery tools (end-to-end workflow)

---

## Future Themes (Long-Term Vision)

### ⏳ Theme 6: AI Coaching with Company Data

**Outcome**: Teams get context-aware coaching trained on their data.

**Why**: Generic ChatGPT doesn't know your company.

**Success Signals**:

- ✅ Teams ask AI instead of searching docs
- ✅ AI suggestions referenced in planning
- ✅ Onboarding time reduced by 50%+
- ✅ Glossary terms surface automatically

**What We're Building**:

- Company data ingestion (docs, decisions, glossaries)
- Contextual AI queries (RAG)
- Proactive suggestions (workshops, planning)
- Learning capture (decisions, rationale)

**Dependencies**: Core workflows validated (need data to train on)

---

### ⏳ Theme 7: Automated Workflows

**Outcome**: Repetitive tasks (status updates, workshops, reports) are automated.

**Why**: Teams waste 30%+ of time on status theater.

**Success Signals**:

- ✅ Status reports auto-generated
- ✅ Workshop agendas created from strategy
- ✅ Meeting notes auto-generated and shared
- ✅ 10+ hours/week saved per team

**What We're Building**:

- Workshop generation from strategy/OKRs
- Automated meeting notes & action items
- Status report generation
- Calendar, Slack, email integrations

**Dependencies**: AI coaching (powers automation)

---

### ⏳ Theme 8: Builder Marketplace

**Outcome**: A thriving ecosystem of builders creating custom apps.

**Why**: We can't build everything. Marketplace enables customization at scale.

**Success Signals**:

- ✅ 10+ apps in marketplace
- ✅ 100+ installs per month
- ✅ Builders earning revenue
- ✅ Custom workflows shared by community

**What We're Building**:

- Plugin architecture (SDK for builders)
- Marketplace UI (browse, install, rate)
- Revenue sharing (builders get paid)
- Security & sandboxing

**Dependencies**: Core features validated (stable API)

---

## Dependency Map

```
Phase 1: Foundation
┌─────────────────────┐
│ Multi-Tenancy       │ ──┐
└─────────────────────┘   │
                          ├──> Validation Unlocks Next Phase
┌─────────────────────┐   │
│ Partner Validation  │ ──┘
└─────────────────────┘
         │
         │ Validated ✅
         ▼
Phase 2: Core Product
┌─────────────────────┐
│ Community Launch    │ ──> Grows in parallel
└─────────────────────┘
         │
         ├──> ┌─────────────────────┐
         │    │ Product Discovery   │
         │    └─────────────────────┘
         │              │
         │              ├──> End-to-end workflow
         │              ▼
         └──> ┌─────────────────────┐
              │ Product Delivery    │
              └─────────────────────┘
                        │
                        │ Core Validated ✅
                        ▼
Phase 3: Ecosystem
┌─────────────────────┐
│ AI Coaching         │ ──> Trains on core data
└─────────────────────┘
         │
         ├──> Powers automation
         ▼
┌─────────────────────┐
│ Automated Workflows │
└─────────────────────┘
         │
         ├──> Stable API ready
         ▼
┌─────────────────────┐
│ Builder Marketplace │ ──> Ecosystem scales
└─────────────────────┘
```

---

## Success Signals by Phase

### Phase 1: Foundation (Current)

**Goal**: Validate with first partner

| Signal                        | Target           | Why                |
| ----------------------------- | ---------------- | ------------------ |
| Daily active users (Saprolab) | 5+               | Proves utility     |
| Positive feedback             | 4/5 stars        | Proves value       |
| Revenue                       | Covers $60/month | Proves viability   |
| ZDHC onboarded                | 1 team           | Proves scalability |

**Outcome**: Saprolab validated, paying, and expanding to ZDHC.

---

### Phase 2: Core Product (Next)

**Goal**: Ship discovery & delivery tools that replace existing solutions

| Signal           | Target                        | Why                       |
| ---------------- | ----------------------------- | ------------------------- |
| Paying customers | 3+                            | Proves market need        |
| GitHub stars     | 1,000+                        | Proves community interest |
| Contributors     | 100+                          | Proves sustainability     |
| Feature adoption | 50%+ use discovery + delivery | Proves value              |
| Time saved       | 10+ hours/week/team           | Proves impact             |

**Outcome**: Core product validated, community growing, profitability reached.

---

### Phase 3: Ecosystem (Future)

**Goal**: Enable builders to extend the platform

| Signal              | Target                        | Why                   |
| ------------------- | ----------------------------- | --------------------- |
| Marketplace apps    | 10+                           | Proves extensibility  |
| App installs        | 100+/month                    | Proves demand         |
| Builder revenue     | $1K+/month earned by builders | Proves sustainability |
| Organizations using | 100+                          | Proves scale          |
| Community size      | 10,000+                       | Proves adoption       |

**Outcome**: Self-sustaining ecosystem, industry-standard platform.

---

## What We Won't Build

### Out of Scope (Intentionally)

These are **not** themes we'll pursue (unless community builds them):

- ❌ **CRM features**: Not Salesforce or HubSpot
- ❌ **Pure project management**: Not Asana or Monday
- ❌ **Generic collaboration**: Not Slack or Teams (we integrate)
- ❌ **File storage**: Not Google Drive or Dropbox
- ❌ **Video calls**: Not Zoom or Meet (we integrate)

**Why**: Focus on product workflows, not general-purpose tools.

---

## How We Decide What's Next

### When a Theme Is "Done"

A theme is complete when:

1. ✅ **Success signals achieved**: Measurable outcomes hit
2. ✅ **User validation**: Teams using it without prompting
3. ✅ **Stable & documented**: Ready for community contributions
4. ✅ **Learnings captured**: Know what worked, what didn't

### When We Reprioritize

We adjust priorities when:

- ❌ Success signals not achieved (need to pivot)
- ✅ Unexpected validation (accelerate theme)
- 💡 New insight (market need we didn't see)
- 🚀 Community momentum (high demand for feature)

### Decision Framework

For every theme, we ask:

1. **Does it achieve an outcome?** (not just ship a feature)
2. **Does it validate with Saprolab?** (real customer need)
3. **Does it enable community?** (platform, not one-off)
4. **Does it compound?** (value increases over time)
5. **Can we validate in 1-2 weeks?** (small, testable steps)

---

## Roadmap Anti-Patterns (What We Avoid)

### ❌ Feature Lists with Dates

**Bad**:

- Q1: Ship OKRs
- Q2: Launch marketplace
- Q3: Add AI coaching

**Why Bad**: Pressure to ship outputs, not validate outcomes.

---

### ❌ "Nice to Have" Features

**Bad**:

- Dark mode (nice to have)
- Custom themes (nice to have)
- Emoji reactions (nice to have)

**Why Bad**: Distracts from outcomes. Let community build these.

---

### ❌ "Competitive Feature Parity"

**Bad**:

- Holaspirit has X, we need X
- Notion has Y, we need Y

**Why Bad**: Copying ≠ differentiation. Focus on unique value.

---

### ❌ "Big Bang" Releases

**Bad**:

- Hold features until "v2.0 launch"

**Why Bad**: Delays validation, increases risk. Ship small, iterate.

---

## Outcome Review Cadence

### Weekly (Internal)

- Review current theme progress
- Identify blockers
- Celebrate small wins

### Monthly (with Saprolab)

- Review success signals
- Gather feedback
- Adjust priorities if needed

### Quarterly (Strategic)

- Review all themes
- Update sequencing based on learnings
- Communicate to community

---

## Transparency & Communication

### How We Share Progress

- **Public roadmap**: This doc (updated quarterly)
- **Journey blog**: Weekly updates on progress, learnings
- **Community calls**: Monthly Q&A with users and contributors
- **GitHub issues**: Tag issues by theme for visibility

### How Community Can Influence

- **Vote on priorities**: Community can signal what matters
- **Contribute**: PRs that align with themes prioritized
- **Build apps**: Marketplace extends without bloating core
- **Share learnings**: Use cases we didn't anticipate

---

## Long-Term Vision (3-5 Years)

### Year 1: Foundation & Validation

- ✅ Saprolab & ZDHC validated
- ✅ Multi-tenancy working
- ✅ Community launched (1,000+ stars)
- ✅ Core discovery & delivery tools shipped
- ✅ Profitability reached

### Year 2: Ecosystem & Scale

- ✅ AI coaching validated
- ✅ Automated workflows shipped
- ✅ Builder marketplace launched (10+ apps)
- ✅ 100+ organizations using it
- ✅ Training & consulting services

### Year 3-5: Industry Standard

- ✅ 10,000+ organizations
- ✅ Self-sustaining community
- ✅ 100+ marketplace apps
- ✅ Integrations with every major tool
- ✅ Conferences, events, ecosystem

---

## Questions We're Exploring

As we build, we're learning:

### Phase 1 Questions

- What workflows matter most to Saprolab?
- How do we make multi-tenancy simple and secure?
- What pricing model works for small teams vs. enterprises?

### Phase 2 Questions

- What discovery frameworks do teams actually use?
- How do we balance flexibility and opinionation?
- What makes community contributions sustainable?

### Phase 3 Questions

- How do we train AI on company data securely?
- What marketplace model works for builders?
- How do we scale without losing simplicity?

---

**Next Steps**:

- **Current Work**: Check [Product Strategy](./product-strategy.md) for detailed themes
- **Success Metrics**: Review [Success Signals](../audience/success-signals.md)
- **Launch**: See [1-Day Community Launch](../launch-plans/1-day-community-launch.md) to start
