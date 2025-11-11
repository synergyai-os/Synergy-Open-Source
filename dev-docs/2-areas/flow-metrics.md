# Flow Metrics

**Purpose**: Measure how efficiently we turn ideas into shipped features, providing clear insight into velocity, efficiency, and time allocation.

---

## 📊 What Are Flow Metrics?

Flow Metrics are indicators that measure software development efficiency across five key dimensions:

### **1. Flow Velocity**
**What**: Number of completed work items in a period  
**Question**: "Is value delivery accelerating?"  
**Target**: Steady or increasing velocity  
**Example**: 15 tickets completed in Sprint 1 → 18 in Sprint 2 = +20% velocity

### **2. Flow Time**
**What**: Duration from work approval to completion (includes active + waiting time)  
**Question**: "How long does work take from start to finish?"  
**Target**: Shorter flow time  
**Example**: Average ticket takes 5 days from "Todo" → "Done"

### **3. Flow Efficiency**
**What**: Percentage of active work time vs total flow time  
**Question**: "How much time is spent waiting vs working?"  
**Target**: Higher efficiency  
**Formula**: `(Active Time / Flow Time) × 100`  
**Example**: 2 days active work / 5 days total = 40% efficiency

### **4. Flow Load**
**What**: Number of work items in progress (WIP)  
**Question**: "Are we overloaded or underutilized?"  
**Target**: Optimal WIP (not too high, not too low)  
**Example**: 8 tickets in progress across team of 3 = 2.7 WIP per person

### **5. Flow Distribution** ⭐
**What**: Mix of work types completed  
**Question**: "How is engineering time allocated?"  
**Target**: Balanced distribution aligned with business goals  
**Categories**:
- **Features**: New functionality, user value
- **Bugs**: Fixing broken behavior
- **Tech Debt**: Refactoring, cleanup, architecture improvements
- **Risk**: Security, compliance, critical fixes

**Example Distribution**:
```
Features:    60% (12/20 tickets) - Delivering new value
Bugs:        20% (4/20 tickets)  - Maintaining quality
Tech Debt:   15% (3/20 tickets)  - Improving system health
Risk:         5% (1/20 tickets)  - Managing security/compliance
```

---

## 🎯 Value of Flow Metrics

### **For Engineering**
- **Pinpoint bottlenecks**: See where work gets stuck
- **Optimize delivery**: Reduce wait times, improve throughput
- **Balance work types**: Ensure sustainable pace (not just features)

### **For Business**
- **Predictability**: Estimate delivery timelines with confidence
- **Quality vs Speed**: Understand trade-offs
- **Resource allocation**: See if team is overloaded

### **For Teams**
- **Transparency**: Everyone sees the same data
- **Continuous improvement**: Track changes over time
- **Celebrate wins**: Visualize velocity increases

---

## 🏷️ Linear Label System for Flow Metrics

### **Flow Distribution Categories** (Required)

Every ticket gets ONE:

| Label | Purpose | Example |
|-------|---------|---------|
| `feature` | New functionality | Multi-workspace support |
| `bug` | Fixing broken behavior | Auth not working |
| `tech-debt` | Refactoring, cleanup | Migrate to Svelte 5 |
| `risk` | Security, compliance | Fix XSS vulnerability |

**Why this matters**: Linear's Insights panel can filter by label → instant Flow Distribution charts.

---

### **Scope Labels** (Required)

Every ticket gets ONE OR MORE:

| Label | What It Covers |
|-------|----------------|
| `frontend` | UI, components, pages, Svelte |
| `backend` | Convex functions, mutations, queries |
| `ui` | Design system, tokens, components library |
| `auth` | Authentication, authorization, WorkOS |
| `workspace` | Multi-tenancy, organizations, teams |
| `analytics` | PostHog, tracking, metrics |
| `devops` | Deployment, CI/CD, infrastructure |
| `security` | Permissions, encryption, compliance |

**Why this matters**: Identify which areas consume most time, spot specialization needs.

---

### **Size Labels** (Required)

Every ticket gets ONE:

| Label | Time | When to Use |
|-------|------|-------------|
| `xs` | < 2h | Tiny tweak, copy change, config update |
| `s` | 2-4h | Small slice, single component, simple fix |
| `m` | 4-8h | Half day to full day, typical slice |
| `l` | 1-2 days | Large slice, multiple files, complex logic |
| `xl` | 2+ days | **Break this down!** Too large for one ticket |

**Why this matters**: Cycle time analysis, estimation accuracy, capacity planning.

**Best Practice**: If you create an `xl` ticket, immediately break it into smaller slices.

---

### **Optional Labels**

| Label | Purpose |
|-------|---------|
| `shaping` | Discovery, planning, research (not counted in velocity) |

---

## 📈 Tracking Flow Metrics in Linear

### **1. Use Cycles** (Time-Boxed Sprints)

```
Cycle 1: Nov 1-14 (2 weeks)
- 15 tickets completed
- Flow Velocity: 15
- Flow Distribution: 60% features, 30% bugs, 10% tech-debt
```

**Setup**: Linear → Team Settings → Cycles → Enable & Configure

---

### **2. Use Consistent Workflow Statuses**

**Recommended Flow**:
```
Backlog → Todo → In Progress → In Review → QA → Done
```

**Why**: Each status transition = measurable event for Flow Time.

---

### **3. Use Insights Panel** (Native Linear)

**Access**: `Cmd/Ctrl + Shift + I` in any view

**What You Get**:
- Velocity over time (chart)
- Cycle completion rate
- Issue count by status
- Labels distribution

---

### **4. Create Custom Views**

**Example Views**:

**"Features This Cycle"**:
```
Filter: label:feature AND cycle:"Current Cycle"
Sort: Created (oldest first)
```

**"Tech Debt Backlog"**:
```
Filter: label:tech-debt AND status:Backlog
Sort: Priority (highest first)
```

**"Bugs in Progress"**:
```
Filter: label:bug AND status:"In Progress"
```

---

### **5. Advanced Analytics** (External Tools)

For deeper insights, integrate with:

**Screenful** (recommended):
- Cumulative Flow Diagrams (CFD)
- Cycle reports
- Burndown charts
- Team velocity trends

**Setup**: https://screenful.com/linear

**What it adds**:
- Visual bottleneck identification (CFD shows where work piles up)
- Predictive analytics (forecast completion dates)
- Multi-cycle trends (see velocity over 6+ cycles)

---

## 🎯 Best Practices

### **1. Label Every Ticket Consistently**

**Bad**:
```
"Fix login bug" - no labels
```

**Good**:
```
"Fix login bug"
Labels: bug, auth, backend, s
```

---

### **2. Review Flow Distribution Monthly**

**Healthy Balance** (example):
```
Features:    50-60%  (delivering value)
Bugs:        20-30%  (maintaining quality)
Tech Debt:   10-20%  (improving system health)
Risk:         5-10%  (managing security/compliance)
```

**Warning Signs**:
- **>80% Features**: System health declining, tech debt building
- **>40% Bugs**: Quality issues, need to slow feature velocity
- **<5% Tech Debt**: Long-term system health at risk

---

### **3. Track Bottlenecks with Cumulative Flow Diagram**

**What to Look For**:
- **Widening bands**: Bottleneck (work piling up in that status)
- **Parallel bands**: Smooth flow
- **Gaps**: No work in progress (underutilized)

**Example**:
```
If "In Review" band keeps widening:
→ Code review is the bottleneck
→ Action: Add more reviewers, pair programming, async reviews
```

---

### **4. Use Retrospectives to Act on Metrics**

**Monthly Retro Agenda**:
1. **Review Flow Velocity**: Accelerating? Declining? Why?
2. **Review Flow Distribution**: Balanced? Too many bugs?
3. **Review Flow Time**: Getting faster? Slower? Where stuck?
4. **Action Items**: What to change next cycle?

---

### **5. Set Baselines, Then Optimize**

**First 3 Cycles**: Just measure (establish baseline)

**After Baseline**:
- Set targets (e.g., "Reduce avg flow time from 5 days to 3")
- Experiment with changes (e.g., "Limit WIP to 2 per person")
- Measure impact (did flow time improve?)

---

## 🚀 Getting Started

### **Week 1: Setup**
1. Enable cycles in Linear
2. Ensure all tickets have labels (type + scope + size)
3. Create custom views for common filters

### **Week 2-4: Baseline**
1. Complete one full cycle with consistent labeling
2. Review Insights panel
3. Note baseline metrics (velocity, distribution)

### **Month 2+: Optimize**
1. Identify bottlenecks from CFD
2. Experiment with process changes
3. Review impact in next cycle

---

## 📚 References

- [Flow Metrics Overview](https://getdx.com/blog/flow-metrics/)
- [Linear Insights Documentation](https://linear.app/docs/insights)
- [Automated Cycle Reports for Linear](https://screenful.com/blog/create-automated-cycle-reports-for-linear)
- [Developer Velocity Guide](https://uplevelteam.com/blog/measuring-developer-velocity)

---

**Last Updated**: 2025-11-10  
**Related**: [Linear Integration](./linear-integration.md), [Way of Working](./.cursor/rules/way-of-working.mdc)

