# AI Tools Compatibility - Business Rules & Decisions

**Feature**: "Works With AI Tools" section on dev-docs homepage  
**Status**: 🟡 In Validation  
**Owner**: Randy (Founder)  
**Last Updated**: November 8, 2025

---

## 🎯 Purpose

**Problem**: Developers don't know if their AI coding tools work with SynergyOS documentation.

**Solution**: Display "Works With" section showcasing compatible AI tools on homepage.

**Outcome**: Increased trust, reduced friction, higher GitHub stars and community adoption.

---

## 📋 Business Rules

### Rule 1: Only List Verified Compatible Tools
**Rule**: A tool can only be listed if we've verified it works with our docs.

**Why**: Credibility - We can't claim compatibility without testing.

**How to Verify**:
1. Test tool with our docs (local and GitHub)
2. Document what works (reading, understanding, suggesting edits)
3. Screenshot proof of functionality

**Exception**: Mark tools as "Experimental" if partially working.

---

### Rule 2: Prioritize Popular/Accessible Tools First
**Rule**: Order tools by popularity/accessibility, not alphabetically.

**Priority Tiers**:
1. **Tier 1** (Most Popular): Cursor AI, GitHub Copilot, Claude
2. **Tier 2** (No-Code): Lovable, Bolt.new, v0.dev
3. **Tier 3** (Emerging): Replit Agent, Warp, others

**Why**: Users care about what they already use.

---

### Rule 3: Link to Tool Documentation, Not Marketing Pages
**Rule**: Link to "How to use with GitHub repos" docs, not homepage.

**Good**: `https://cursor.sh/docs/github-integration`  
**Bad**: `https://cursor.sh/`

**Why**: Help users get started immediately.

---

### Rule 4: Update Section Quarterly
**Rule**: Review and update tool compatibility every 3 months.

**Why**: AI tools evolve rapidly - compatibility can break or improve.

**Owner**: Documentation team

---

### Rule 5: No Affiliate Links (Yet)
**Rule**: Use clean links, no affiliate tracking.

**Why**: Build in public = transparency. Affiliate links feel salesy.

**Exception**: If we join official partner programs, disclose clearly.

---

## 🔧 Technical Dependencies

### Dependency 1: LayerChart (Metrics Visualization)
**Package**: `layerchart` (Svelte chart library)
**Where**: `/src/lib/components/ai-tools/MetricsForecast.svelte`

**Requirements**:
```bash
npm install layerchart
```

**Chart Type**: Spline (smooth line chart)
**Data**: 90-day GitHub stars forecast
**Styling**: Use design tokens for colors

**Example**:
```svelte
<script>
  import { Chart, Svg, Spline } from 'layerchart';
  
  const forecast = [
    { day: 0, stars: 0 },
    { day: 30, stars: 30 },
    { day: 60, stars: 65 },
    { day: 90, stars: 100 }
  ];
</script>

<Chart data={forecast}>
  <Svg>
    <Spline />
  </Svg>
</Chart>
```

**See**: [LayerChart Documentation](https://layerchart.com/docs)

---

### Dependency 2: Bits UI Table (Feature Comparison)
**Package**: Already installed (project uses Bits UI)
**Where**: `/src/lib/components/ai-tools/ToolComparison.svelte`

**Requirements**:
```svelte
import * as Table from '$lib/components/ui/table';
```

**Data Structure**:
```typescript
type ToolFeature = {
  name: string;
  logo: string;
  readsGitHub: boolean;
  suggestsCode: boolean;
  autoUpdates: boolean;
  verified: boolean;
};
```

**Styling**: Use design tokens (bg-surface, border-base, etc.)

**See**: [Bits UI Documentation](https://www.bits-ui.com/docs)

---

### Dependency 3: Tool Logos
**Where**: `/static/images/ai-tools/` (to be created)

**Requirements**:
- SVG format (scalable, small file size)
- Dark/light mode variants (via CSS `fill: currentColor`)
- Consistent size: 64x64px

**Tools to Add**:
- `cursor-logo.svg` (Cursor AI)
- `claude-logo.svg` (Claude AI)
- `github-copilot-logo.svg` (if verified)

**Sources**:
- [Cursor Press Kit](https://cursor.sh/press)
- [Anthropic Brand Assets](https://www.anthropic.com)
- GitHub logo (already in project)

---

### Dependency 4: Metrics Data Service
**Where**: `/src/lib/services/metricsService.ts`

**Purpose**: Centralize current + predicted metrics

```typescript
export const currentMetrics = {
  githubStars: 0,
  contributors: 1,
  docsPages: 50
};

export const predictedMetrics = {
  day30: { stars: 30, contributors: 3 },
  day60: { stars: 65, contributors: 5 },
  day90: { stars: 100, contributors: 10 }
};

export function getForecast() {
  return [
    { day: 0, stars: currentMetrics.githubStars },
    { day: 30, stars: predictedMetrics.day30.stars },
    { day: 60, stars: predictedMetrics.day60.stars },
    { day: 90, stars: predictedMetrics.day90.stars }
  ];
}
```

**Why**: Single source of truth for metrics, easy to update

---

### Dependency 5: Analytics Tracking
**What to Track**:
- Section visibility (scroll depth)
- Chart interaction (hover, tooltip views)
- Tool link clicks (which tool is most popular?)
- GitHub star attribution (did they come from tool section?)

**Tool**: PostHog (already integrated)

**Events to Add**:
```typescript
// Section viewed
posthog.capture('ai_tools_section_viewed', {
  scroll_depth: '75%',
  time_on_section: 12
});

// Chart interacted
posthog.capture('metrics_forecast_viewed', {
  chart_type: 'spline',
  predicted_stars: 100
});

// Tool clicked
posthog.capture('ai_tool_link_clicked', {
  tool_name: 'Cursor AI',
  tool_category: 'code_editor'
});
```

---

## 🎨 Design Decisions

### Data-Driven Storytelling Section
**Decision**: Tool showcase + predicted metrics + growth chart

**Why**:
- ✅ Visual storytelling (logos + data = credibility)
- ✅ Bold predictions (Gary Vee style: "Here's what will happen")
- ✅ Links to our metrics (transparent, trackable)
- ❌ NOT just a list of tools (boring)

**Components**:
1. **Hero Statement**: Bold claim about AI + open docs
2. **Tool Cards**: Logos + quick descriptions (2-3 tools)
3. **Metrics Prediction Chart**: Growth forecast (LayerChart)
4. **Comparison Table**: Tool feature matrix (Bits UI)

---

### Layout: Data Visualization Focus
**Decision**: Vertical storytelling flow with data points

**Structure**:
```html
<section class="ai-tools-section">
  <!-- 1. Bold Statement -->
  <h2>AI Reads Our Docs Better Than Humans</h2>
  <p>Here's what happens when AI-first tools meet always-fresh documentation.</p>
  
  <!-- 2. Tool Cards (2-3 tools) -->
  <div class="tool-cards-grid">
    <ToolCard logo={cursor} name="Cursor AI" verified={true} />
    <ToolCard logo={claude} name="Claude AI" verified={true} />
  </div>
  
  <!-- 3. Metrics Prediction (LayerChart) -->
  <div class="metrics-forecast">
    <h3>Predicted Impact on Our Metrics</h3>
    <LayerChart data={githubStarsForecast} type="line" />
    <p>When AI can read our docs, adoption accelerates. Here's our 90-day forecast.</p>
  </div>
  
  <!-- 4. Feature Comparison (Bits UI Table) -->
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>Tool</Table.Head>
        <Table.Head>Reads Docs</Table.Head>
        <Table.Head>Suggests Code</Table.Head>
        <Table.Head>Auto-Updates</Table.Head>
      </Table.Row>
    </Table.Header>
  </Table.Root>
</section>
```

---

### Metrics to Predict (90-Day Forecast)
**Decision**: Show 3 key metrics with predicted impact

**Baseline (Current)**:
- GitHub Stars: 0
- Contributors: 1
- Docs Pages: 50+

**Predicted (90 days after launch)**:
- GitHub Stars: 100 (from AI tool users discovering us)
- Contributors: 5-10 (AI helps devs contribute faster)
- Docs Pages: 75+ (more patterns as usage grows)

**Chart Type**: Line chart showing growth trajectory (LayerChart Spline)

**Why These Metrics**:
- ✅ Trackable (we measure them already)
- ✅ Transparent (public on metrics page)
- ✅ Bold but believable (100 stars in 90 days = ~1/day)

---

### Section Placement: After "How It Works"
**Decision**: Between "How It Works" and "Stats Bar"

**Why**:
- ✅ Natural story: "Here's how it works" → "Here's who uses it" → "Here's the data"
- ✅ Above the fold (visible without scrolling)
- ✅ Data validates the "How It Works" claims

**Structure**:
```
1. Hero (AI-generated docs badge)
2. How It Works (3 cards)
3. **[NEW] AI-Powered Development** ← Data storytelling section
4. Stats Bar (current metrics - provides baseline)
5. Role-Based Navigation
6. Community Section
7. Footer
```

---

## 🚨 Edge Cases & Considerations

### Edge Case 1: Tool Stops Working
**Scenario**: Cursor AI breaks our docs after an update.

**Action**:
1. Add warning badge: "⚠️ Known issues with v1.2.3"
2. Link to GitHub issue tracking the problem
3. Remove from list if unfixable

---

### Edge Case 2: Competitor Tool Requests Inclusion
**Scenario**: Windsurf AI emails us: "Can you list us?"

**Action**:
1. Test their tool (Rule 1)
2. If compatible → Add (no favoritism)
3. If incompatible → Explain why, offer to revisit

**Policy**: Open to all tools (we don't pick winners)

---

### Edge Case 3: User Confusion (What Does "Works With" Mean?)
**Scenario**: User asks: "Does 'works with' mean integrated API or just reads docs?"

**Action**:
1. Add tooltip: "These tools can read and understand SynergyOS docs to help you build"
2. Link to FAQ (if needed)

---

## 📊 Success Metrics

### Leading Indicators (Week 1)
- Section scroll depth: >60% of homepage visitors see it
- Tool link CTR: >5% of visitors click a tool link
- Time on page: +10% average session duration

### Lagging Indicators (Month 1)
- GitHub stars: +20% from baseline
- Tool mentions in issues/discussions: >5 mentions
- User feedback: Positive sentiment in community

---

## 🔄 Iteration Plan

### Version 1.0 (MVP)
- [ ] List 4-5 verified tools
- [ ] Grid layout, design tokens
- [ ] Analytics tracking
- [ ] Ship, measure, learn

### Version 1.1 (If successful)
- [ ] Add testimonials ("I use Cursor with SynergyOS daily" - User X)
- [ ] Expand to 8-10 tools
- [ ] Add filter/tabs (Code vs. No-Code)

### Version 2.0 (Future)
- [ ] Tool-specific guides ("How to use Cursor with SynergyOS")
- [ ] Video tutorials
- [ ] Official partner program

---

## 🎯 Tools to Verify

### Code-First Tools
- [ ] **Cursor AI** - AI-powered VSCode fork
- [ ] **GitHub Copilot** - Microsoft's AI pair programmer
- [ ] **Claude AI** - Anthropic's conversational AI (via web or API)
- [ ] **Warp** - Modern terminal with AI commands

### No-Code Tools
- [ ] **Lovable** - Full-stack apps from prompts
- [ ] **Bolt.new** - StackBlitz AI app builder
- [ ] **v0.dev** - Vercel's UI generator
- [ ] **Replit Agent** - Autonomous coding agent

### Status Tracking
*(Updated as we test)*

| Tool | Compatible? | Notes | Verified Date |
|------|-------------|-------|---------------|
| Cursor AI | ⏳ Pending | Test: Clone repo, ask about patterns | Nov 8, 2025 |
| Claude AI | ⏳ Pending | Test: Upload docs, ask about tech stack | Nov 8, 2025 |
| Warp | ⏳ Pending | Test: Clone repo, use Warp AI | Nov 8, 2025 |
| Lovable | ⏳ Pending | Test: Import repo, read docs | Nov 8, 2025 |
| Bolt.new | ⏳ Pending | Test: Import repo, read docs | Nov 8, 2025 |
| v0.dev | ⏸️ Optional | Later if primary tools validated | - |
| Replit Agent | ⏸️ Optional | Later if primary tools validated | - |
| GitHub Copilot | ⏸️ Deferred | Requires paid account to test | - |

**Test Protocol**: See journey doc for full test steps

---

## 🔗 Related Documents

- [Journey Document](/ai-content-blog/ai-tools-compatibility-journey.md) - Blog post material
- [Validation Framework](/dev-docs/2-areas/validation-framework.md) - How we validate features
- [Homepage Component](/src/routes/dev-docs/+page.svelte) - Where this lives

---

## ✅ Next Steps

1. ✅ Business rules documented
2. ⏳ Run competitor analysis (Experiment 1)
3. ⏳ Test tool compatibility (Experiment 2)
4. ⏳ Make build/iterate/kill decision
5. ⏳ If validated, design + implement

---

**Status**: 🟡 Validation Phase  
**Last Updated**: November 8, 2025  
**Owner**: Randy (Founder)

