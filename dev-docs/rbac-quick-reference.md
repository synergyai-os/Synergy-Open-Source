# RBAC Quick Reference Card

**📖 Full Documentation**: [rbac-architecture.md](rbac-architecture.md)

---

## 🎯 Quick Permission Check

```typescript
// In Convex functions
await requirePermission(ctx, userId, "teams.create", resourceId?, orgId);

// In Svelte components
if (permissions.can("teams.create")) {
  // Show button
}
```

---

## 👥 Roles at a Glance

| Role | Level | Key Abilities |
|------|-------|---------------|
| **Admin** | Org | Everything |
| **Manager** | Org | Create teams, manage all teams |
| **Team Lead** | Team | Manage only their team(s) |
| **Billing Admin** | Org | Billing only (can combine with other roles) |
| **Member** | Team | Regular user |
| **Guest** | Resource | Access specific shared resources |

---

## 🔑 Phase 1 Permissions

### User Management
- `users.invite` - Invite users
- `users.remove` - Remove users
- `users.roles.assign` - Assign roles
- `users.roles.revoke` - Revoke roles
- `users.view` - View users

### Team Management
- `teams.create` - Create teams
- `teams.delete` - Delete teams
- `teams.view` - View teams
- `teams.settings.update` - Update team settings
- `teams.members.add` - Add team members
- `teams.members.remove` - Remove team members
- `teams.members.view` - View team members

### Organization Settings
- `org.settings.view` - View org settings
- `org.settings.update` - Update org settings
- `org.delete` - Delete organization

---

## 🔍 Permission Scopes

| Scope | Meaning | Example |
|-------|---------|---------|
| `all` | Access to all resources | Admin can manage any team |
| `own` | Only resources you own | Team Lead manages their team only |
| `assigned` | Only assigned resources | Member sees teams they're in |
| `none` | Explicitly no access | - |

---

## 🚀 Common Patterns

### Pattern 1: Protect a Mutation

```typescript
export const deleteTeam = mutation({
  args: { userId: v.id("users"), teamId: v.id("teams"), orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.userId, "teams.delete", args.teamId, args.orgId);
    // ... perform deletion
  },
});
```

### Pattern 2: Frontend Permission Gate

```svelte
<script lang="ts">
  const permissions = usePermissions(() => userId, () => orgId);
</script>

{#if permissions.can("teams.create")}
  <button>Create Team</button>
{/if}
```

### Pattern 3: Multiple Roles

```typescript
// Sarah has BOTH roles - gets permissions from BOTH
userRoles: [
  { userId: "sarah", role: "billing_admin", orgId: "acme" },
  { userId: "sarah", role: "team_lead", orgId: "acme", teamId: "team_a" }
]

// Sarah can:
// 1. View billing (from billing_admin)
// 2. Manage Team A (from team_lead)
```

---

## 📊 Role-Permission Matrix

| Permission | Admin | Manager | Team Lead | Billing Admin | Member |
|------------|-------|---------|-----------|---------------|--------|
| `users.invite` | ✅ all | ✅ all | ❌ | ❌ | ❌ |
| `users.roles.assign` | ✅ all | ✅ all | ❌ | ❌ | ❌ |
| `teams.create` | ✅ all | ✅ all | ❌ | ❌ | ❌ |
| `teams.delete` | ✅ all | ✅ all | ❌ | ❌ | ❌ |
| `teams.settings.update` | ✅ all | ✅ all | ✅ own | ❌ | ❌ |
| `teams.members.add` | ✅ all | ✅ all | ✅ own | ❌ | ❌ |
| `teams.view` | ✅ all | ✅ all | ✅ own | ❌ | ✅ assigned |
| `org.settings.update` | ✅ all | ❌ | ❌ | ❌ | ❌ |
| `org.billing.view` | ✅ all | ❌ | ❌ | ✅ all | ❌ |
| `org.billing.update` | ✅ all | ❌ | ❌ | ✅ all | ❌ |

---

## 🗄️ Key Tables

### `userRoles` - User's assigned roles
```typescript
{
  userId: Id<"users">,
  role: "admin" | "manager" | "team_lead" | "billing_admin" | "member",
  organizationId: Id<"organizations">,
  teamId?: Id<"teams">,  // For team-level roles
  assignedBy: Id<"users">,
  assignedAt: number,
}
```

### `rolePermissions` - What each role can do
```typescript
{
  roleId: "team_lead",
  permissionId: "teams.settings.update",
  scope: "own" | "all" | "assigned" | "none",
}
```

---

## 🎓 Examples

### Example 1: Team Lead Updates Their Team

```typescript
// User: Sarah (team_lead of Team A)
// Action: Update Team A settings

await requirePermission(ctx, sarahId, "teams.settings.update", teamAId, orgId);

// ✅ ALLOWED because:
// 1. Sarah has team_lead role for Team A
// 2. team_lead has teams.settings.update permission with scope "own"
// 3. teamAId matches Sarah's team
```

### Example 2: Team Lead Tries to Update Other Team

```typescript
// User: Sarah (team_lead of Team A)
// Action: Update Team B settings

await requirePermission(ctx, sarahId, "teams.settings.update", teamBId, orgId);

// ❌ DENIED because:
// 1. Sarah has team_lead role for Team A (not Team B)
// 2. scope is "own" but teamBId doesn't match Sarah's team
```

### Example 3: User with Multiple Roles

```typescript
// User: Sarah (billing_admin + team_lead of Team A)
// Action: View billing

await requirePermission(ctx, sarahId, "org.billing.view", undefined, orgId);

// ✅ ALLOWED because:
// 1. Sarah has billing_admin role
// 2. billing_admin has org.billing.view permission
// 3. Even though team_lead doesn't have this, billing_admin does
```

---

## 🔧 Implementation Checklist

### Phase 1: Foundation
- [ ] Add database tables (roles, permissions, rolePermissions, userRoles, permissionAuditLog)
- [ ] Seed initial data (roles + permissions + mappings)
- [ ] Implement permission functions (userHasPermission, requirePermission)
- [ ] Create role management functions (assignRole, revokeRole)
- [ ] Protect existing Convex functions with permission checks
- [ ] Create frontend composable (usePermissions)
- [ ] Update UI with permission gates
- [ ] Write tests (unit + integration + E2E)

### Phase 2: Billing
- [ ] Add billing permissions
- [ ] Protect billing functions
- [ ] Update billing UI

### Phase 3: Guest Access
- [ ] Add resourceGuests table
- [ ] Implement guest invitation
- [ ] Build sharing UI

---

## 🚨 Common Mistakes to Avoid

1. ❌ **Don't check roles directly**
   ```typescript
   // BAD
   if (user.role === "admin") { ... }
   
   // GOOD
   if (await userHasPermission(ctx, userId, "teams.create")) { ... }
   ```

2. ❌ **Don't forget resource scope**
   ```typescript
   // BAD - Team lead can update ANY team
   await requirePermission(ctx, userId, "teams.settings.update");
   
   // GOOD - Team lead can only update THEIR team
   await requirePermission(ctx, userId, "teams.settings.update", teamId, orgId);
   ```

3. ❌ **Don't skip audit logging**
   ```typescript
   // Always log permission checks
   await ctx.db.insert("permissionAuditLog", { ... });
   ```

---

## 📚 Learn More

- **Full Architecture**: [rbac-architecture.md](rbac-architecture.md)
- **Database Schema**: See "Database Schema" section
- **Code Examples**: See "Implementation Patterns" section
- **Migration Plan**: See "Migration Plan" section

---

**Last Updated**: November 10, 2025
