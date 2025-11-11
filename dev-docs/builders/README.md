# builders/

**Strategic plans and implementation guides for major features**

---

## What Goes in builders/?

**Builder Plans** are detailed implementation plans for significant features, refactorings, or system changes. They provide:

- Clear problem statements
- Step-by-step implementation plans
- Success metrics and rollout strategies
- Risk mitigation
- Time estimates

**Examples:**

- Navigation redesigns
- Major refactorings
- New system architectures
- Feature rollouts

**Not Builder Plans:**

- Quick fixes or bug fixes → Just make a PR
- Small features → Document in patterns/
- Ongoing documentation → 2-areas/
- Reference material → 3-resources/

---

## Available Plans

### Active Plans

- [10-Item Navigation Redesign](plans/10-item-navigation-redesign.md) - Reduce nav from 19+ to 10 items using hub pages + Cmd+K search

### Template

Use this structure for new plans:

1. **Problem Statement** - What are we solving?
2. **Solution Overview** - High-level approach
3. **Implementation Plan** - Detailed steps with time estimates
4. **Success Metrics** - How do we know it worked?
5. **Risks & Mitigations** - What could go wrong?
6. **Rollout Plan** - How do we ship it?

---

## When to Create a Builder Plan

**Create a plan if:**

- ✅ Change affects >5 files
- ✅ Requires >4 hours of work
- ✅ Impacts user experience significantly
- ✅ Needs team alignment or approval
- ✅ Has multiple phases or dependencies

**Skip the plan if:**

- ❌ Simple bug fix
- ❌ Small refactoring (1-2 files)
- ❌ Already documented in patterns/
- ❌ Quick iteration (<1 hour)

---

**Created**: November 9, 2025  
**Owner**: Randy (Founder)
