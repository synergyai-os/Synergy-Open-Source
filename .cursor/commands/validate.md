# /Axon/validate - Feature Validation Workflow

**Purpose**: Validate product hypotheses before building to increase confidence and avoid waste.

**When to use**: Before starting any new feature, experiment, or major change.

---

## 🎯 What This Command Does

This command guides you through the 5-step validation process to systematically test assumptions and increase confidence before building.

**Output**: A validated hypothesis with confidence level (🔴🟡🟢) and a clear decision (build/iterate/kill).

---

## 📋 Workflow

### Step 1: Load Validation Framework

**AI Action**:

```
Load: dev-docs/2-areas/validation-framework.md
Load: dev-docs/2-areas/confidentiality-guidelines.md (CRITICAL: Check before sharing)
```

---

### Step 2: State the Hypothesis

**AI Prompt to User**:

> "What feature or idea do you want to validate?"

**AI Task**:

- Extract: Who (target users), What (problem), Why (evidence), Solution, Behavior change, Business outcome
- Format as hypothesis statement (see validation-framework.md template)
- **CRITICAL**: Check for client-sensitive information (see confidentiality-guidelines.md)
- Replace specific client names with generic descriptors if needed

**Example Output**:

> "We believe **[target users]** have **[problem]** because **[evidence]**. If we build **[solution]**, they will **[behavior]** which will result in **[business outcome]**."

---

### Step 3: Identify Riskiest Assumptions

**AI Task**:

- List assumptions in 4 categories: Desirability, Feasibility, Viability, Usability
- Assign confidence level to each (🔴 Low, 🟡 Medium, 🟢 High)
- Identify the reddest/yellowest assumption to test first

**Example Output**:

```
Assumptions:
1. 🔴 Desirability: Users actually want this (not just say they do)
2. 🟡 Feasibility: Technically possible with our stack
3. 🟢 Viability: Business model makes sense
4. 🟢 Usability: UI patterns exist (competitors have solved this)

RISKIEST: Desirability (test this first)
```

---

### Step 4: Design Experiment

**AI Task**:

- Suggest 2-3 experiment types from validation-framework.md (ordered by speed/cost)
- For each: Time estimate, Cost, Confidence level gained
- Recommend the fastest/cheapest experiment that addresses the riskiest assumption

**Example Output**:

```
Experiment Options:
1. Customer Interviews (5 users) - 2 days, $0, 🟡 Medium confidence
2. Landing Page Test - 3 days, $50, 🟡 Medium confidence
3. Figma Prototype + User Testing - 5 days, $0, 🟢 High confidence

RECOMMENDED: Option 1 (fastest way to test desirability)
```

---

### Step 5: Define Success Criteria

**AI Task**:

- Based on experiment type, suggest specific success metrics
- Define threshold for success (e.g., "4/5 users say yes")
- Set time limit (1-7 days)

**Example Output**:

```
Success Criteria:
- Metric: # of users who say "yes, I'd pay for this"
- Threshold: 4/5 users (80%)
- Time Limit: 2 days (complete by [date])

If met → 🟢 High confidence → Build it
If not met → 🔴 Low confidence → Pivot or kill
```

---

### Step 6: Create Experiment Plan

**AI Task**:

- Generate experiment plan document (markdown format)
- Include: Hypothesis, assumptions, experiment design, success criteria, execution checklist
- Save to: `dev-docs/1-projects/experiments/[feature-name]-validation.md`
- **CRITICAL**: Scan for client-sensitive information before saving

**Example Output**:

```markdown
# [Feature Name] Validation Experiment

## Hypothesis

[Formatted hypothesis from Step 2]

## Riskiest Assumption

[From Step 3]

## Experiment Design

**Type**: Customer Interviews
**Time**: 2 days
**Cost**: $0
**Participants**: 5 product managers

## Success Criteria

- 4/5 users say "yes, I'd pay for this"
- Time limit: 2 days

## Execution Checklist

- [ ] Recruit 5 target users
- [ ] Prepare interview script
- [ ] Run interviews (record + take notes)
- [ ] Document feedback
- [ ] Analyze results
- [ ] Make decision (build/iterate/kill)

## Results

[Fill in after experiment]

## Decision

[Fill in after analysis]
```

---

## 🛡️ Confidentiality Checks (CRITICAL)

**AI Must**:

1. **Before sharing any plan**: Scan for client names, pricing details, unreleased features
2. **Replace sensitive info**: Use generic descriptors (see confidentiality-guidelines.md)
3. **Flag for approval**: If testimonials/case studies needed, note approval required

**Examples**:

- ❌ "Saprolab wants feature X" → ✅ "A design agency pilot requested feature X"
- ❌ "ZDHC pays $80/month" → ✅ "Pilot customers pay $60-100/month"

**Approval Needed**:

- Using specific client names → Get written approval first
- Sharing pricing details → Confirm with leadership
- Discussing unreleased features → Wait for announcement

---

## 📊 Validation Confidence Levels

**🔴 Low (0-30%)**: DO NOT BUILD YET (run experiments)  
**🟡 Medium (31-70%)**: BUILD MVP/PROTOTYPE (test with users)  
**🟢 High (71-100%)**: BUILD PRODUCTION FEATURE (commit resources)

---

## ✅ Success Indicators

**This command is successful when**:

1. Hypothesis clearly stated
2. Riskiest assumption identified
3. Experiment designed (fastest/cheapest)
4. Success criteria defined
5. Experiment plan created and saved
6. Confidentiality checked (no leaks)

---

## 🎯 Examples (Real Features)

### Example 1: Documentation as Product

**Input**: "Should we build documentation features for customers?"

**Output**:

- Hypothesis: Teams need to document knowledge (glossaries, specs)
- Riskiest Assumption: 🟡 Teams actually document (vs. verbal)
- Experiment: Wizard of Oz (use it ourselves first)
- Success Criteria: >50% daily usage, 10+ docs created
- Results: ✅ 100% internal adoption, 50+ docs, pilot customer interest
- Decision: 🟢 BUILD IT - High confidence

**See**: [Documentation as Product](../../dev-docs/2-areas/value-streams/documentation-as-product.md)

---

### Example 2: OKR Tracking Feature

**Input**: "Pilot customers want OKR tracking"

**Output**:

- Hypothesis: Teams struggle to track OKRs separately
- Riskiest Assumption: 🔴 They'll pay for OKR tracking (vs. free Google Sheets)
- Experiment: Customer Interviews + Mockup Test
- Success Criteria: 4/5 say "yes, I'd pay $20-50/user"
- Results: 🟡 4/5 interested, but price concerns
- Decision: 🟡 ITERATE - Run pre-order pilot at lower price

---

## 🚫 Anti-Patterns

**Don't**:

- ❌ Skip validation ("we already know users want this")
- ❌ Build without experiments ("let's just try it")
- ❌ Ignore negative feedback (confirmation bias)
- ❌ Share client-sensitive information (breach of trust)
- ❌ Validation takes > 1 week (analysis paralysis)

**Do**:

- ✅ State hypothesis clearly
- ✅ Test cheapest/fastest experiment first
- ✅ Set time limits (1-7 days)
- ✅ Check confidentiality before sharing
- ✅ Document learnings (for future reference)

---

## 📖 Related

- **[Validation Framework](../../dev-docs/2-areas/validation-framework.md)** - Full methodology
- **[Confidentiality Guidelines](../../dev-docs/2-areas/confidentiality-guidelines.md)** - Client privacy rules
- **[Product Strategy](../../marketing-docs/strategy/product-strategy.md)** - What we're building
- **[Metrics Dashboard](../../dev-docs/2-areas/metrics.md)** - Success metrics

---

## 🎓 AI Instructions

When `/Axon/validate` is called:

1. **Load frameworks**:

   ```
   Load: dev-docs/2-areas/validation-framework.md
   Load: dev-docs/2-areas/confidentiality-guidelines.md
   ```

2. **Ask user**: "What feature or idea do you want to validate?"

3. **Extract hypothesis**:
   - Who, What, Why, Solution, Behavior, Outcome
   - Check for client-sensitive info (replace if needed)

4. **Identify assumptions**:
   - List 4 categories (Desirability, Feasibility, Viability, Usability)
   - Assign confidence (🔴🟡🟢)
   - Highlight riskiest

5. **Suggest experiments**:
   - 2-3 options (ordered by speed/cost)
   - Recommend fastest/cheapest

6. **Define success criteria**:
   - Metric, threshold, time limit

7. **Create experiment plan**:
   - Save to `dev-docs/1-projects/experiments/[feature-name]-validation.md`
   - Scan for confidentiality issues

8. **Confirm with user**:
   - Show plan, ask for approval
   - Offer to adjust if needed

---

**Status**: 🟢 Active  
**Last Updated**: November 8, 2025  
**Owner**: Randy (Founder)
