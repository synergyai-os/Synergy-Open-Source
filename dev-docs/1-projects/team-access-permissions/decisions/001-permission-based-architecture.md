# ADR 001: Permission-Based Access Control Architecture

**Date**: November 10, 2025  
**Status**: ✅ Accepted  
**Deciders**: Randy (Product), AI Assistant (Technical)

---

## Context

We need a role management system that:

1. Allows users to have multiple roles (e.g., Billing Admin + Team Lead)
2. Supports resource-scoped permissions (Team Lead only manages their teams)
3. Scales easily when adding new roles
4. Supports future guest access (like Notion/Google Docs)
5. Provides complete audit trail

---

## Decision

We will implement a **Permission-Based Access Control (PBAC)** system where:

1. **Features check permissions, not roles**
   - Code: `if (userHasPermission("teams.create"))` ✅
   - NOT: `if (user.role === "admin")` ❌

2. **Users can have multiple roles simultaneously**
   - Many-to-many relationship via `userRoles` table
   - Permissions aggregated from all roles

3. **Permissions have scopes**
   - `all` - Access to all resources
   - `own` - Access only to owned resources
   - `assigned` - Access only to assigned resources

4. **Medium granularity for permissions**
   - Action-based: `teams.create`, `teams.delete`, `teams.settings.update`
   - NOT too broad: `teams.manage`
   - NOT too granular: `teams.name.update`, `teams.description.update`

5. **Complete audit logging**
   - All permission checks logged to `permissionAuditLog`
   - All role assignments/revocations logged

---

## Rationale

### Why Permission-Based (Not Role-Based)?

**Problem with role-checking:**

```typescript
// ❌ BAD: Checking roles directly
if (user.role === 'admin' || user.role === 'manager') {
	allowCreateTeam();
}
// Adding new role requires changing code everywhere!
```

**Solution with permission-checking:**

```typescript
// ✅ GOOD: Checking permissions
if (userHasPermission(user, 'teams.create')) {
	allowCreateTeam();
}
// Add new role by just assigning permissions in database!
```

**Benefits:**

- **Scalable**: Add new roles without code changes
- **Maintainable**: Permission logic in one place
- **Flexible**: Combine roles to create custom access patterns
- **Future-proof**: Easy to add guest access, temporary permissions, etc.

### Why Multiple Roles?

**Real-world scenario:**

- Sarah manages billing (Billing Admin)
- Sarah also leads Team A (Team Lead)
- She needs permissions from BOTH roles

**Alternative considered: Single role with all permissions**

- Problem: Creates role explosion ("Billing Admin + Team Lead", "Billing Admin + Team Lead + X")
- Problem: Doesn't scale (n × m role combinations)

**Our approach:**

- Users can have multiple roles
- Permissions aggregated (union of all roles)
- If ANY role grants permission → ALLOW

### Why Resource-Scoped Permissions?

**User story:**

- Team Leads should manage only THEIR teams
- NOT all teams in the organization

**Implementation:**

```typescript
// Permission with scope
rolePermissions: {
  roleId: "team_lead",
  permissionId: "teams.settings.update",
  scope: "own"  // ← Only their teams
}

// Permission check with resource ID
userHasPermission(userId, "teams.settings.update", teamId)
// Checks: Is user team lead of THIS specific team?
```

**Benefits:**

- **Security**: Team Leads can't access other teams
- **Principle of least privilege**: Users have minimum necessary access
- **Clear intent**: Scope makes permissions explicit

### Why Medium Granularity?

**Too broad:**

```typescript
'teams.manage'; // What does this include? Unclear!
```

**Too granular:**

```typescript
'teams.name.update';
'teams.description.update';
'teams.slug.update';
// Too many permissions = management nightmare!
```

**Just right:**

```typescript
'teams.settings.update'; // Clear: All team settings
'teams.create'; // Clear: Create team action
'teams.delete'; // Clear: Delete team action
```

**Benefits:**

- **Clear intent**: Each permission has obvious meaning
- **Manageable**: ~20 permissions instead of 100+
- **Flexible**: Can add more granular permissions later if needed

### Why Audit Logging?

**Requirements:**

- Security: Track who did what
- Compliance: Demonstrate access controls
- Debugging: Investigate why user can/can't do something

**Implementation:**

- Log ALL permission checks (granted and denied)
- Log ALL role assignments and revocations
- Include: who, what, when, resource, result

**Benefits:**

- **Security**: Detect unauthorized access attempts
- **Compliance**: Audit trail for regulators
- **Debugging**: See exactly why permission was granted/denied
- **Analytics**: Understand how permissions are used

---

## Consequences

### Positive

✅ **Scalability**: Add roles without code changes  
✅ **Flexibility**: Users can have multiple roles  
✅ **Security**: Resource-scoped permissions  
✅ **Maintainability**: Permission logic centralized  
✅ **Auditability**: Complete access trail  
✅ **Future-proof**: Easy to add guest access, temporary permissions

### Negative

❌ **Complexity**: More tables (6 new) vs simple role field  
❌ **Performance**: Permission checks query multiple tables  
❌ **Learning curve**: Developers must understand permission system

### Mitigations

**Complexity mitigation:**

- Comprehensive documentation (rbac-architecture.md)
- Quick reference guide (rbac-quick-reference.md)
- Clear code examples and patterns

**Performance mitigation:**

- Database indexes on userRoles and rolePermissions
- Cache user permissions in memory (future optimization)
- Permission checks typically < 100ms (acceptable)

**Learning curve mitigation:**

- Visual diagrams (rbac-visual-overview.md)
- Code examples in docs
- Helper functions (`requirePermission()` is easy to use)

---

## Alternatives Considered

### Alternative 1: Direct Role Checking

**Approach**: Features check user role directly

```typescript
if (user.role === "admin") { ... }
```

**Why rejected:**

- Not scalable (code changes everywhere when adding roles)
- Can't have multiple roles
- No resource scoping

---

### Alternative 2: Single Role with All Permissions

**Approach**: Create combined roles like "Billing Admin + Team Lead"

**Why rejected:**

- Role explosion (n × m combinations)
- Hard to maintain (which combinations to support?)
- Not flexible (user can't have 3+ roles)

---

### Alternative 3: Attribute-Based Access Control (ABAC)

**Approach**: Dynamic policies based on user attributes, resource attributes, environment

**Why rejected:**

- Too complex for current needs
- Harder to understand and debug
- RBAC sufficient for our use cases
- Can add ABAC later if needed (not mutually exclusive)

---

### Alternative 4: Fine-Grained Permissions

**Approach**: Very granular permissions (teams.name.update, teams.description.update)

**Why rejected:**

- Too many permissions to manage (100+)
- Unclear where to draw the line (how granular is too granular?)
- Can add more granularity later if specific need arises

---

## Implementation Notes

### Phase 1 (Current Project)

- User & Team Management
- Organization Settings
- 20 permissions total
- 6 roles (Admin, Manager, Team Lead, Billing Admin, Member, Guest)

### Phase 2 (Future)

- Billing permissions (use existing structure)
- 4 additional permissions

### Phase 3 (Future)

- Guest access (resource-specific sharing)
- `resourceGuests` table
- Time-bound access

### Future Optimizations

- Cache user permissions in memory
- Precompute common permission checks
- Add permission hierarchy (if needed)
- Add conditional permissions (time-based, IP-based)

---

## References

- **NIST RBAC Standard**: [csrc.nist.gov](https://csrc.nist.gov/projects/role-based-access-control)
- **Azure RBAC Best Practices**: [Microsoft Docs](https://learn.microsoft.com/en-us/azure/role-based-access-control/best-practices)
- **Cerbos RBAC Guide**: [cerbos.dev](https://www.cerbos.dev/blog/role-based-access-control-best-practices)

---

## Related Documents

- **Architecture**: [rbac-architecture.md](../../../2-areas/rbac/rbac-architecture.md)
- **Quick Reference**: [rbac-quick-reference.md](../../../2-areas/rbac/rbac-quick-reference.md)
- **Visual Overview**: [rbac-visual-overview.md](../../../2-areas/rbac/rbac-visual-overview.md)
- **Project README**: [README.md](../README.md)

---

**This decision is accepted and ready for implementation.**
