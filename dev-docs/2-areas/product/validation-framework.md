# Validation Framework

> **Build the right thing** - Validate before building, measure while building, iterate after building

**Last Updated**: November 8, 2025  
**Owner**: Product Team

---

## 🎯 Purpose

**Problem**: Building features customers don't want wastes time, money, and momentum.

**Solution**: Systematically validate hypotheses before committing resources.

**Outcome**: Higher confidence, faster learning, better product-market fit.

---

## 📊 Validation Confidence Levels

### 🔴 Low Confidence (0-30%)

**Indicators:**

- Assumptions based on intuition
- No customer conversations
- Unclear problem/solution fit
- No data/evidence

**Action**: **DO NOT BUILD YET**  
Run experiments to increase confidence.

---

### 🟡 Medium Confidence (31-70%)

**Indicators:**

- Some customer validation
- Limited data/evidence
- Problem understood, solution unclear
- Mixed feedback

**Action**: **BUILD MVP/PROTOTYPE**  
Test with real users, gather feedback, iterate.

---

### 🟢 High Confidence (71-100%)

**Indicators:**

- Multiple customer validations
- Strong data/evidence
- Problem + solution validated
- Willingness to pay confirmed

**Action**: **BUILD PRODUCTION FEATURE**  
Commit resources, ship quality, measure adoption.

---

## 🧪 The 5-Step Validation Process

### Step 1: State the Hypothesis

**Format**: "We believe [target users] have [problem] because [evidence]. If we build [solution], they will [behavior change] which will result in [business outcome]."

**Example:**

> "We believe **product teams** have difficulty tracking OKRs across multiple tools because **3 out of 5 pilot customers mentioned this pain point**. If we build **integrated OKR tracking**, they will **consolidate tools** which will result in **increased retention and upsell opportunities**."

**Components:**

- **Who**: Target users (personas)
- **What**: Problem to solve
- **Why**: Evidence/assumptions
- **Solution**: What we'll build
- **Behavior**: Expected user action
- **Outcome**: Business impact

---

### Step 2: Identify Riskiest Assumptions

**What could make this fail?**

**Categories:**

1. **Desirability**: Do users want this?
2. **Feasibility**: Can we build it?
3. **Viability**: Will it make money?
4. **Usability**: Can users actually use it?

**Example (OKR Tracking):**

- 🔴 **Desirability**: Teams actually want to track OKRs (not just say they do)
- 🟡 **Feasibility**: Real-time sync across teams is technically possible
- 🟡 **Viability**: Teams will pay $20-50/user/month for this
- 🟢 **Usability**: OKR interface is intuitive (we have patterns from competitors)

**Action**: Focus on the **reddest/yellowest** assumptions first.

---

### Step 3: Design Experiments

**How can we test this assumption with minimal effort?**

#### Experiment Types (Ordered by Speed/Cost)

##### 1. **Customer Interviews** (Fastest, Cheapest)

**What**: Talk to 5-10 target users  
**Time**: 1-2 days  
**Cost**: Free  
**Confidence**: 🟡 Medium (qualitative)

**Questions to Ask:**

- "Tell me about the last time you [struggled with X]"
- "How are you solving this today?"
- "If we built [solution], would you use it?"
- "Would you pay for this? How much?"

---

##### 2. **Landing Page Test** (Fast, Cheap)

**What**: Create a landing page describing the feature, measure sign-ups  
**Time**: 1-3 days  
**Cost**: $0-50 (hosting)  
**Confidence**: 🟡 Medium (intent, not action)

**What to Measure:**

- Page views
- Email sign-ups
- Click-through rate on "Get Early Access"

**Success Threshold**: >30% CTR = strong interest

---

##### 3. **Prototype/Mockup Test** (Moderate, Low Cost)

**What**: Create clickable prototype (Figma), test with 5 users  
**Time**: 2-5 days  
**Cost**: $0 (Figma free tier)  
**Confidence**: 🟢 High (usability)

**What to Test:**

- Can users complete core tasks?
- Do they understand the interface?
- Do they express excitement/willingness to pay?

**Success Threshold**: 4/5 users complete task successfully

---

##### 4. **Wizard of Oz MVP** (Moderate, Low Cost)

**What**: Fake the feature with manual work behind the scenes  
**Time**: 3-7 days  
**Cost**: Your time  
**Confidence**: 🟢 High (real behavior)

**Example (OKR Tracking):**

- User enters OKRs in Google Sheet
- You manually update dashboard daily
- Measure: Do they use it daily? Do they ask for more features?

**Success Threshold**: >50% daily usage after 2 weeks

---

##### 5. **Beta/Pilot Program** (Slow, Medium Cost)

**What**: Build minimal version, invite 5-10 pilot customers  
**Time**: 2-4 weeks  
**Cost**: Development time  
**Confidence**: 🟢 High (real usage)

**What to Measure:**

- Activation rate (% who set up)
- Usage frequency (daily/weekly)
- Feature requests (what's missing?)
- Willingness to pay (convert to paid)

**Success Threshold**: >70% activation, >50% weekly usage

---

##### 6. **Pre-Order/Paid Pilot** (Slow, Highest Confidence)

**What**: Charge before building, deliver when ready  
**Time**: 1-2 weeks (sales) + build time  
**Cost**: Your time + development  
**Confidence**: 🟢 Highest (money talks)

**What to Measure:**

- # of customers willing to pre-pay
- Total revenue committed

**Success Threshold**: 3+ customers, $180+ MRR committed

---

### Step 4: Run the Experiment

**Execution Checklist:**

- [ ] Define success criteria (before running)
- [ ] Set time limit (1-7 days typical)
- [ ] Recruit participants (target users only)
- [ ] Document everything (notes, recordings, screenshots)
- [ ] Measure quantitative data (clicks, sign-ups, usage)
- [ ] Gather qualitative feedback (quotes, reactions)

**Anti-Patterns:**

- ❌ Running experiments without clear success criteria
- ❌ Talking to friends/family (not target users)
- ❌ Ignoring negative feedback (confirmation bias)
- ❌ Running for too long (analysis paralysis)

---

### Step 5: Analyze & Decide

**What did we learn?**

#### Option A: **Validated (🟢 High Confidence)**

**Indicators:**

- Success criteria met or exceeded
- Strong positive feedback
- Willingness to pay confirmed
- Repeatable/scalable

**Decision**: **Build it** (commit resources)

---

#### Option B: **Partially Validated (🟡 Medium Confidence)**

**Indicators:**

- Some success criteria met
- Mixed feedback
- Unclear willingness to pay
- Needs refinement

**Decision**: **Iterate** (run another experiment)

---

#### Option C: **Invalidated (🔴 Low Confidence)**

**Indicators:**

- Success criteria not met
- Negative feedback
- No willingness to pay
- Not a real problem

**Decision**: **Pivot or kill** (don't build)

---

## 📋 Validation Checklist (Per Feature)

Use this for every feature before building:

### Pre-Validation

- [ ] Hypothesis stated clearly
- [ ] Riskiest assumptions identified
- [ ] Experiment designed
- [ ] Success criteria defined
- [ ] Time limit set (1-7 days)

### During Validation

- [ ] Experiment executed
- [ ] Target users recruited (5-10 minimum)
- [ ] Data collected (quantitative + qualitative)
- [ ] Negative feedback documented (not ignored)

### Post-Validation

- [ ] Results analyzed
- [ ] Confidence level assigned (🔴🟡🟢)
- [ ] Decision made (build/iterate/kill)
- [ ] Learning documented (for future reference)

---

## 🎯 Real Examples: SynergyOS

### Example 1: OKR Tracking Feature

**Step 1: Hypothesis**

> "We believe **product teams using SynergyOS** struggle to track OKRs separately from their workflow tools because **3 pilot customers mentioned this pain**. If we build **integrated OKR tracking**, they will **consolidate tools** which will result in **increased retention and $20-50/user/month upsell**."

**Step 2: Riskiest Assumptions**

1. 🔴 Teams actually track OKRs (not just say they want to)
2. 🔴 They'll pay for OKR tracking (vs. using free Google Sheets)
3. 🟡 Integration with existing workflows is easy (no major friction)

**Step 3: Experiment Design**

- **Type**: Customer Interviews + Mockup Test
- **Time**: 3 days
- **Participants**: 5 product managers (target users)
- **Success Criteria**: 4/5 say "yes, I'd pay for this"

**Step 4: Execution**

- Interviewed 5 PMs
- Showed Figma mockup
- Asked: "Would you pay $30/user/month for this?"

**Step 5: Results**

- ✅ 5/5 said they track OKRs quarterly
- ✅ 4/5 said they'd pay $20-50/user/month
- ⚠️ 3/5 said current tools are "good enough"
- ❌ 2/5 said price too high for incremental improvement

**Confidence**: 🟡 Medium (desirability validated, viability unclear)

**Decision**: **Iterate** - Run pre-order pilot at $20/user/month (lower price point)

---

### Example 2: Documentation as Product Feature

**Step 1: Hypothesis**

> "We believe **all teams using SynergyOS** need to document knowledge (glossaries, specs, decisions) because **we're building it ourselves and it's valuable**. If we build **documentation features with templates**, they will **adopt quickly** which will result in **differentiation vs. competitors**."

**Step 2: Riskiest Assumptions**

1. 🟡 Teams actually document (vs. just discuss verbally)
2. 🟢 We can build it (already built for ourselves)
3. 🟡 Templates add enough value (vs. blank docs)
4. 🔴 It's a differentiator (vs. commodity feature)

**Step 3: Experiment Design**

- **Type**: Wizard of Oz MVP
- **Time**: 2 weeks
- **Participants**: Internal team + 1 pilot customer
- **Success Criteria**: >50% daily usage, 10+ docs created

**Step 4: Execution**

- Built basic doc system (MDX rendering)
- Used internally for dev-docs + marketing-docs
- Invited pilot customer to test

**Step 5: Results**

- ✅ Internal team uses daily (100% adoption)
- ✅ 50+ docs created in 2 weeks
- ✅ Pilot customer requested templates
- ✅ Feedback: "This is way better than Notion for product docs"

**Confidence**: 🟢 High (internal validation + external interest)

**Decision**: **Build it** - Ship as product feature, create template library

**See**: [Documentation as Product](./value-streams/documentation-as-product.md)

---

## 🚫 Common Validation Mistakes

### Mistake 1: "Build it and they will come"

**Problem**: Assuming if you build a great feature, customers will use it.  
**Reality**: Customers don't care about features, they care about outcomes.  
**Fix**: Validate the **problem** first, solution second.

---

### Mistake 2: "We already know what users want"

**Problem**: Building based on assumptions, not evidence.  
**Reality**: Users say one thing, do another (revealed preferences).  
**Fix**: Watch what they **do**, not what they **say**.

---

### Mistake 3: "Let's just build a quick MVP"

**Problem**: "Quick MVP" becomes a 3-month project.  
**Reality**: MVPs are still expensive (time, opportunity cost).  
**Fix**: Run **experiments** before building MVP.

---

### Mistake 4: "We need more data before deciding"

**Problem**: Analysis paralysis, never building anything.  
**Reality**: 80% confidence is enough, 100% is impossible.  
**Fix**: Set **time limits** on experiments (1-7 days).

---

### Mistake 5: "Everyone loves our demo!"

**Problem**: Demos are fake, usage is real.  
**Reality**: Users are polite, won't tell you it sucks in person.  
**Fix**: Measure **behavior** (usage, payments), not opinions.

---

## 📊 Validation Metrics Dashboard

**Track across all experiments:**

| Metric                      | Current | Target     | Status |
| --------------------------- | ------- | ---------- | ------ |
| **Experiments Run**         | 5       | 20/quarter | 🟡     |
| **Avg Time per Experiment** | 3 days  | <5 days    | ✅     |
| **Validation Rate**         | 60%     | >70%       | 🟡     |
| **Features Killed**         | 2       | >30%       | ✅     |
| **Customer Interviews**     | 15      | 50/quarter | 🔴     |

**See**: [Metrics Dashboard](./metrics.md)

---

## 🎓 Resources

### Books

- **"The Lean Startup"** - Eric Ries (build-measure-learn)
- **"The Mom Test"** - Rob Fitzpatrick (customer interviews)
- **"Testing Business Ideas"** - David Bland (experiment design)
- **"Continuous Discovery Habits"** - Teresa Torres (product discovery)

### Tools

- **Figma** - Mockups and prototypes
- **Google Forms** - Surveys and sign-ups
- **Loom** - Record user tests
- **PostHog** - Analytics and session replay
- **Typeform** - Landing page tests

### Templates

- Customer interview script (coming soon)
- Experiment canvas (coming soon)
- Validation checklist (see above)

---

## ✅ Next Steps

**For Every New Feature:**

1. State hypothesis (use template above)
2. Identify riskiest assumption
3. Design cheapest experiment to test it
4. Run experiment (1-7 days max)
5. Decide: build/iterate/kill

**For Current Features:**

1. Review existing features (are they used?)
2. Run experiments to improve (A/B tests, user interviews)
3. Kill features with <30% adoption

**For This Framework:**

1. Use it for next feature (try it)
2. Refine based on results (iterate)
3. Share learnings with team (documentation)

---

## 📞 Questions?

- **Discord**: [Join our community](https://discord.gg/synergyos)
- **Product Lead**: Randy (founder)

---

**Remember**: Validation isn't about being "right"—it's about **learning fast and building the right thing.**

**See Also**:

- [Product Vision 2.0](../../marketing-docs/strategy/product-vision-2.0.md) - What we're building
- [Product Strategy](../../marketing-docs/strategy/product-strategy.md) - How we'll get there
- [Metrics Dashboard](./metrics.md) - Success metrics

---

**Status**: 🟢 Active  
**Last Review**: November 8, 2025  
**Owner**: Randy (Founder)
