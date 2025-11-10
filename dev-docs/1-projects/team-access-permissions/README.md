# Team Access & Permissions (Phase 1)

**Status**: 🚧 In Progress  
**Branch**: `feature/team-access-permissions`  
**Linear Project**: [Team Access & Permissions](https://linear.app/synergyos) <!-- Add Linear link after creating -->  
**Started**: November 10, 2025  
**Target Completion**: 3-4 days

---

## 👥 Team & Ownership

**Team**: Randy (Founder)

**Key Contributors**:
- Randy - Product decisions, validation, testing
- AI Assistant - Technical implementation, documentation

---

## 🎯 Outcome & Success Signals

**Outcome**: **{Enable secure delegation of team management while preventing unauthorized access}** (by AI → real outcome is not defined or linked yet)

### How We'll Know We Succeeded

**Leading Indicators** (Early signals):
- [ ] Team Leads actively manage their teams (add/remove members weekly)
- [ ] Reduced admin support tickets for "How do I add someone to my team?"
- [ ] Faster team member onboarding (Team Leads don't wait for admin)
- [ ] Team Leads report confidence in managing their team autonomously

**Lagging Indicators** (Outcome signals):
- [ ] Zero security incidents from incorrect access levels (6 months)
- [ ] 80%+ of team management done by Team Leads (not admins)
- [ ] Managers report 9/10+ confidence in delegating team management
- [ ] Team autonomy score increases (qualitative survey)

**⚠️ These are AI guesses - Validate with real users before treating as fact!**

**Validation Plan**:
1. Interview 3-5 managers: "What stops you from delegating team management today?"
2. Shadow Team Leads: Watch how they currently manage teams (if any system exists)
3. Test with 1 team first: Measure actual usage vs. assumptions

---

## 📋 Project Overview

Implement permission-based access control system for User Management, Team Management, and Organization Settings. Users can have multiple roles (e.g., Billing Admin + Team Lead), and permissions are resource-scoped (Team Leads only manage their own teams).

---

## 🎯 User Stories

**As an Admin**, I want to:
- ✅ Assign roles to users so they have appropriate access
- ✅ Create and manage any team
- ✅ Control organization settings

**As a Manager**, I want to:
- ✅ Create new teams
- ✅ Manage all teams in my organization
- ✅ Invite users and assign roles

**As a Team Lead**, I want to:
- ✅ Manage only my team's settings and members
- ❌ NOT be able to manage other teams

**As a Billing Admin**, I want to:
- ✅ Have billing access (Phase 2)
- ✅ Also be able to lead a team (multiple roles)

**As a Member**, I want to:
- ✅ View teams I'm part of
- ✅ See other team members

---

## 🏗️ Architecture At-a-Glance

### Key Concepts
- **Permission-Based**: Features check permissions, not roles (scalable)
- **Multi-Role**: Users can have multiple roles simultaneously
- **Resource-Scoped**: Team Lead only manages their teams (scope: "own")
- **Audit Trail**: All permission checks logged

### Database Changes
**6 New Tables**:
1. `roles` - Role definitions (Admin, Manager, Team Lead, Billing Admin, Member)
2. `permissions` - Permission definitions (teams.create, users.invite, etc.)
3. `rolePermissions` - Role → Permission mappings with scope
4. `userRoles` - User role assignments (many-to-many)
5. `resourceGuests` - Guest access (Phase 3 - not in this project)
6. `permissionAuditLog` - Complete audit trail

**No changes to existing tables!**

### Core Functions
- `userHasPermission()` - Check if user has permission
- `requirePermission()` - Enforce permission (throws if denied)
- `assignRole()` - Assign role to user
- `revokeRole()` - Revoke role from user
- `usePermissions()` - Frontend composable for permission gates

### Permissions (20 Total)
**User Management**: `users.invite`, `users.remove`, `users.roles.assign`, `users.roles.revoke`, `users.view`  
**Team Management**: `teams.create`, `teams.delete`, `teams.view`, `teams.settings.update`, `teams.members.add`, `teams.members.remove`, `teams.members.view`  
**Org Settings**: `org.settings.view`, `org.settings.update`, `org.delete`

---

## 📦 Vertical Slices

| # | Slice | Status | Linear | Est | Description |
|---|-------|--------|--------|-----|-------------|
| 1 | Database Foundation | ⏳ Todo | [SYOS-?] | 4h | Schema + seed data (roles, permissions, mappings) |
| 2 | Core Permission Functions | ⏳ Todo | [SYOS-?] | 4h | Permission checking logic (userHasPermission, requirePermission) |
| 3 | Role Management | ⏳ Todo | [SYOS-?] | 3h | Assign/revoke roles with audit logging |
| 4 | Team Management Protection | ⏳ Todo | [SYOS-?] | 4h | Protect team CRUD operations with permissions |
| 5 | User Management Protection | ⏳ Todo | [SYOS-?] | 3h | Protect user invite/remove with permissions |
| 6 | Frontend Permission System | ⏳ Todo | [SYOS-?] | 5h | Composable + UI permission gates |
| 7 | Testing & Documentation | ⏳ Todo | [SYOS-?] | 5h | Unit + integration + E2E tests, update docs |

**Total Estimate**: 28 hours (~3.5 days)

---

## ✅ Completion Criteria (Definition of Done)

### Functional Requirements
- [ ] All 6 database tables created and seeded
- [ ] Permission checking functions work correctly
- [ ] Multi-role permission resolution works (user with 2 roles gets both permissions)
- [ ] Resource-scoped permissions work (Team Lead only manages their team)
- [ ] Team management gated by permissions
- [ ] User management gated by permissions
- [ ] Org settings gated by permissions
- [ ] Frontend shows/hides UI based on permissions
- [ ] Audit log captures all permission checks

### Testing
- [ ] Unit tests: Permission checking logic
- [ ] Unit tests: Multi-role resolution
- [ ] Unit tests: Scope checking (all, own, assigned)
- [ ] Integration tests: Complete permission flow
- [ ] Integration tests: Role assignment/revocation
- [ ] E2E tests: Admin can create teams
- [ ] E2E tests: Team Lead can manage their team only
- [ ] E2E tests: UI permission gates work

### Documentation
- [ ] Architecture doc updated with implementation notes
- [ ] Pattern added to patterns/INDEX.md
- [ ] Code comments on complex logic
- [ ] Decision records for any architecture changes

### Code Quality
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] All tests passing
- [ ] No breaking changes to existing features

---

## 📚 Documentation

- **Architecture**: [rbac-architecture.md](../../rbac-architecture.md) - Complete system design
- **Quick Reference**: [rbac-quick-reference.md](../../rbac-quick-reference.md) - Developer cheat sheet
- **Visual Overview**: [rbac-visual-overview.md](../../rbac-visual-overview.md) - Diagrams
- **Implementation Roadmap**: [rbac-implementation-roadmap.md](../../rbac-implementation-roadmap.md) - Implementation guide
- **Vertical Slices**: [vertical-slices.md](./vertical-slices.md) - Detailed slice breakdown
- **Testing Checklist**: [testing-checklist.md](./testing-checklist.md) - Manual QA steps
- **Decisions**: [decisions/](./decisions/) - Architecture Decision Records

---

## 🎓 Key Design Decisions

1. **Permission-Based (Not Role-Based)**
   - Features check permissions, not roles directly
   - **Why**: Scalable - add new roles without code changes
   - **Example**: `if (userHasPermission("teams.create"))` not `if (user.role === "admin")`

2. **Multiple Roles Per User**
   - Users can have multiple roles simultaneously
   - **Why**: Real-world flexibility (Billing Admin + Team Lead)
   - **Implementation**: Many-to-many userRoles table

3. **Resource-Scoped Permissions**
   - Permissions have scope: all, own, assigned
   - **Why**: Team Lead only manages their teams
   - **Example**: teams.settings.update with scope "own"

4. **Medium Granularity**
   - Action-based permissions (teams.create, teams.delete)
   - **Why**: Balance between clarity and manageability
   - **Avoid**: Too broad ("teams.manage") or too granular ("teams.name.update")

5. **Audit Everything**
   - Log all permission checks and role changes
   - **Why**: Security, compliance, debugging
   - **Implementation**: permissionAuditLog table

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
- Permission checking logic
- Multi-role resolution
- Scope checking (all, own, assigned)
- Role assignment/revocation

### Integration Tests (Vitest)
- Complete permission check flow
- Database operations
- Audit logging

### E2E Tests (Playwright)
- User journeys (Admin creates team, Team Lead manages team)
- UI permission gates (buttons show/hide correctly)
- Error handling (permission denied messages)

### Manual Testing
See [testing-checklist.md](./testing-checklist.md)

---

## 🚀 What Happens After

### Pattern Extraction
After completing all slices:
1. Extract reusable patterns → `dev-docs/patterns/rbac-patterns.md`
2. Update `dev-docs/patterns/INDEX.md`
3. Add to Quick Diagnostic table if common issues found

### Archive Project
1. Move `dev-docs/1-projects/rbac-phase-1/` → `dev-docs/4-archive/`
2. Keep architecture docs in `dev-docs/` (permanent reference)
3. Update main architecture.md with "Implementation Complete" status

### Phase 2: Billing Permissions (Future)
- Add billing permissions
- Protect billing functions
- Update billing UI

### Phase 3: Guest Access (Future)
- Implement resourceGuests table
- Guest invitation system
- Sharing UI (like Notion)

---

## 📊 Progress Tracking

**Completed**: 0/7 slices  
**In Progress**: None  
**Next Up**: Slice 1 - Database Foundation

**Last Updated**: November 10, 2025

---

## 🔗 Related

- **Main Architecture**: [architecture.md](../../2-areas/architecture.md)
- **Product Vision**: [product-vision-and-plan.md](../../product-vision-and-plan.md)
- **Auth System**: [workos-convex-auth-architecture.md](../../2-areas/workos-convex-auth-architecture.md)


