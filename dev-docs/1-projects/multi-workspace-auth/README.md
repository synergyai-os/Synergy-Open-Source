# Multi-Workspace & Multi-Account Support

> **Status**: 🚧 In Progress  
> **Branch**: `feature/multi-workspace-auth`  
> **Linear Project**: [Auth & System Foundation](https://linear.app/younghumanclub/project/auth-and-system-foundation-498d3cff7ef0/overview)  
> **Started**: 2025-11-10  
> **Methodology**: Shape Up (Vertical Slices)

---

## 👋 Start Here

This project adds multi-workspace support to SynergyOS, enabling:
- **Personal workspaces** (private content)
- **Organizations** (SynergyAI, Saprolab, ZDHC, PurposePilot)
- **Teams** within organizations (future)
- **Fast workspace switching** (CMD+1/2/3, CMD+K)
- **Multi-account linking** (use different emails)

---

## 🎯 What We're Building

### User Stories

**As a solo user**, I can work in my private workspace where my content stays personal.

**As a team member**, I can belong to multiple organizations (work, client projects, side hustles).

**As a multi-org user**, I can switch workspaces instantly without logging out.

**As a content creator**, my notes stay isolated to the workspace I created them in.

---

## 📐 Architecture at a Glance

```
User: randyhereman@gmail.com
├─ 📁 Personal Workspace (organizationId = null)
│   └─ My flashcards, notes (ownershipType = "user")
│
├─ 🏢 SynergyAI (Organization)
│   ├─ Org glossary (ownershipType = "organization")
│   └─ 👥 Team: Product (future)
│
├─ 🏢 Saprolab (Organization)
│   └─ ZDHC project docs
│
└─ 🏢 ZDHC (Organization)
    └─ Regulatory compliance notes
```

**Key Design Principles:**
- `organizationId = null` → Personal workspace (clean, semantic)
- Content isolation via workspace filtering
- Session stores active workspace context
- Convex userId (permanent) + workosId (auth provider)

**Full Architecture**: See [architecture.md](./architecture.md)

---

## 🥖 Vertical Slices (Shape Up Style)

We're building this in **end-to-end slices** that work immediately:

| Slice | Goal | Status |
|-------|------|--------|
| **1** | Workspace Context & Indicator | 🚧 In Progress |
| **2** | Create First Organization | ⏳ Not Started |
| **3** | Switch Between Personal & One Org | ⏳ Not Started |
| **4** | Keyboard Shortcuts (CMD+1/2) | ⏳ Not Started |
| **5** | Multiple Organizations (4 total) | ⏳ Not Started |
| **6** | CMD+K Workspace Search | ⏳ Not Started |
| **7** | Account Linking (Stretch Goal) | ⏳ Not Started |

**Current Focus**: Slice 1 - Get workspace indicator showing "Private workspace"

**Detailed Breakdown**: See [vertical-slices.md](./vertical-slices.md)

---

## 🎫 Linear Tickets

All work is tracked in Linear:
- [View Project Board](https://linear.app/younghumanclub/project/auth-and-system-foundation-498d3cff7ef0/overview)
- Milestones map to vertical slices
- Each ticket is a complete end-to-end feature

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | 👈 You are here (project overview) |
| [architecture.md](./architecture.md) | Technical design & database schema |
| [vertical-slices.md](./vertical-slices.md) | Shape Up breakdown |
| [testing-checklist.md](./testing-checklist.md) | Manual QA steps |
| [decisions/](./decisions/) | Architecture Decision Records (ADRs) |

---

## 🔑 Key Decisions

| ADR | Decision | Rationale |
|-----|----------|-----------|
| [001](./decisions/001-workspace-context.md) | Store workspace in session cookie | Fast, persistent, server-accessible |
| [002](./decisions/002-keyboard-shortcuts.md) | CMD+1/2/3 for switching | Linear-style, muscle memory |
| [003](./decisions/003-session-strategy.md) | Single activeWorkspace field | Simple, scales to multi-account |

---

## 🧪 Testing Strategy

**Manual Testing (Randy):**
- Create orgs via UI
- Switch between workspaces
- Verify content isolation
- Test keyboard shortcuts

**Automated Testing (Future):**
- E2E tests for workspace switching
- Convex function tests for isolation

**Testing Checklist**: [testing-checklist.md](./testing-checklist.md)

---

## 🚀 Deployment Strategy

1. **Branch**: `feature/multi-workspace-auth`
2. **Development**: Local testing with dev Convex
3. **Preview**: Vercel preview deployment from branch
4. **Production**: Merge to main after QA passes

**Vercel Preview URL**: TBD (auto-generated on first push)

---

## 📦 Completion Criteria

### Definition of Done (DoD)

- [ ] All 7 vertical slices complete
- [ ] Randy can create 4 orgs (SynergyAI, Saprolab, ZDHC, PurposePilot)
- [ ] Workspace switching works (CMD+1/2/3/4/5)
- [ ] CMD+K workspace search works
- [ ] Content stays isolated per workspace
- [ ] No data leakage between workspaces
- [ ] All Linear tickets closed
- [ ] Documentation complete

### What Happens After

1. **Extract Reusable Patterns**
   - Move workspace patterns → `dev-docs/2-areas/`
   - Move keyboard shortcuts → `dev-docs/2-areas/patterns/`

2. **Extract Reference Materials**
   - Shape Up methodology notes → `dev-docs/3-resources/`
   - Linear workflow → `dev-docs/3-resources/`

3. **Archive Project**
   - Move `multi-workspace-auth/` → `dev-docs/4-archive/`
   - Keep for historical reference

---

## 🤝 Contributors

- **Randy Hereman** - Product Owner, Tester
- **Claude (AI)** - Implementation, Documentation
- **Linear** - Project tracking
- **GitHub** - Version control

---

## 📖 Related Documentation

- [Multi-Tenancy Migration](../../2-areas/multi-tenancy-migration.md) - Original multi-tenancy plan
- [WorkOS + Convex Auth Architecture](../../2-areas/workos-convex-auth-architecture.md) - Auth foundation
- [Product Vision & Plan](../../2-areas/product-vision-and-plan.md) - Overall product direction

---

**Last Updated**: 2025-11-10  
**Next Review**: After each slice completion

