# RBAC (Role-Based Access Control)

**Location:** `convex/infrastructure/rbac/`

**Purpose:** Control what system features users can access. RBAC is separate from organizational authority (what work you do in circles).

---

## Two Systems: RBAC vs Authority

SynergyOS has two complementary access control systems:

| System        | Question It Answers                  | Example                                   |
| ------------- | ------------------------------------ | ----------------------------------------- |
| **RBAC**      | "What buttons can you click?"        | Can access billing settings               |
| **Authority** | "What work are you accountable for?" | Can approve proposals in Marketing circle |

**Critical:** A "Finance Lead" organizational role does NOT automatically get billing access. RBAC and Authority are intentionally separate.

---

## Two-Scope Model

RBAC operates at two scopes with different identity models:

| Scope         | Table            | Identifier | Use Case                                                   |
| ------------- | ---------------- | ---------- | ---------------------------------------------------------- |
| **System**    | `systemRoles`    | `userId`   | Platform operations: admin console, developer tools        |
| **Workspace** | `workspaceRoles` | `personId` | Workspace operations: billing, settings, member management |

**Why two scopes?**

- Same user can have different roles in different workspaces
- Platform access (developer, support) is independent of any workspace
- Workspace isolation: `personId` prevents cross-workspace correlation

---

## Tables

### Role Assignment Tables

```typescript
// System-level — uses userId (global identity)
systemRoles {
  userId: Id<'users'>,
  role: string,           // 'platform_admin' | 'platform_manager' | 'developer' | 'support'
  grantedAt: number,
  grantedBy: Id<'users'>,
}

// Workspace-level — uses personId (workspace-scoped identity)
workspaceRoles {
  personId: Id<'people'>,
  role: string,           // 'billing_admin' | 'workspace_admin' | 'member'
  grantedAt: number,
  grantedByPersonId: Id<'people'>,
  sourceCircleRoleId?: Id<'assignments'>,  // For auto-assignment cleanup
}
```

### Permission Definition Tables

```typescript
// What capabilities exist
rbacPermissions {
  slug: string,           // 'billing.manage', 'users.view'
  category: string,       // 'billing', 'users', 'workspace'
  action: string,         // 'view', 'create', 'update', 'delete', 'manage'
  description: string,
}

// Named permission buckets
rbacRoles {
  name: string,           // 'billing_admin', 'workspace_admin'
  description: string,
}

// Which permissions belong to which role
rbacRolePermissions {
  roleId: Id<'rbacRoles'>,
  permissionId: Id<'rbacPermissions'>,
  scope: 'all' | 'own' | 'none',  // all=any, own=only owned resources, none=denied
}

// Audit log
rbacAuditLog {
  userId: Id<'users'>,
  action: string,
  resource: string,
  granted: boolean,
  timestamp: number,
}
```

---

## Helper Functions

### Role Checking (Simple)

Check if someone has a named role:

```typescript
import { hasSystemRole, hasWorkspaceRole } from '../infrastructure/rbac';

// System-level: "Is this user a developer?"
const isDev = await hasSystemRole(ctx, userId, 'developer');

// Workspace-level: "Is this person a billing admin?"
const isBillingAdmin = await hasWorkspaceRole(ctx, personId, 'billing_admin');
```

### Role Requiring (Throws on Failure)

For authorization checks that should block if missing:

```typescript
import { requireSystemRole, requireWorkspaceRole } from '../infrastructure/rbac';

// Throws AUTH_INSUFFICIENT_RBAC if not a platform_admin
await requireSystemRole(ctx, userId, 'platform_admin');

// Throws AUTH_INSUFFICIENT_RBAC if not a workspace_admin
await requireWorkspaceRole(ctx, personId, 'workspace_admin');
```

### Permission Checking (Granular) — PLANNED

For fine-grained capability checks:

```typescript
// NOT YET IMPLEMENTED — see SYOS-863

// System-level: "Can this user access admin console?"
const canAdmin = await hasSystemPermission(ctx, userId, 'admin.access');

// Workspace-level: "Can this person manage billing?"
const canBill = await hasWorkspacePermission(ctx, personId, 'billing.manage');
```

---

## Standard Roles

### System Roles

| Role               | Purpose                | Typical Permissions                   |
| ------------------ | ---------------------- | ------------------------------------- |
| `platform_admin`   | Full platform access   | Everything                            |
| `platform_manager` | Operational management | User management, workspace operations |
| `developer`        | Development access     | Feature flags, migrations, debugging  |
| `support`          | Customer support       | Read-only access, user lookup         |

### Workspace Roles

| Role              | Purpose                | Typical Permissions                 |
| ----------------- | ---------------------- | ----------------------------------- |
| `workspace_admin` | Full workspace control | All workspace operations            |
| `billing_admin`   | Billing management     | Billing settings, invoices, plans   |
| `member`          | Standard access        | View workspace content, participate |

---

## RoleTemplates → RBAC Bridge

Organizational roles can automatically grant workspace permissions.

### How It Works

1. User fills a circleRole (organizational assignment)
2. CircleRole has a roleTemplate with `rbacPermissions`
3. System auto-creates `workspaceRoles` record
4. `sourceCircleRoleId` tracks which assignment granted it
5. When user removed from circleRole → only that assignment's permissions revoked

### Example Flow

```
User fills "Circle Lead" in Engineering
    ↓
roleTemplate for "Circle Lead" has:
  rbacPermissions: [{ permissionSlug: 'users.change-roles', scope: 'all' }]
    ↓
System creates workspaceRoles record:
  { personId, role: 'org_designer', sourceCircleRoleId: assignmentId }
    ↓
User now has 'users.change-roles' permission in this workspace
```

### Current State

| Component                          | Status                                                      |
| ---------------------------------- | ----------------------------------------------------------- |
| Auto-assignment on circleRole fill | ✅ Working                                                  |
| Cleanup on circleRole removal      | ✅ Working                                                  |
| Uses `workspaceRoles` table        | ⚠️ Migration needed (currently uses deprecated `userRoles`) |
| `sourceCircleRoleId` tracking      | ⚠️ Migration needed                                         |

See SYOS-861 for migration status.

### Simplification

Permissions are **workspace-wide**, not circle-scoped:

- Circle Lead in Engineering gets workspace-level permissions
- NOT just "permissions within Engineering circle"
- This keeps the model simple and avoids complex scoping

---

## Authorization Check Pattern

Standard pattern for protected operations:

```typescript
export const sensitiveOperation = mutation({
  args: { sessionId: v.string(), workspaceId: v.id('workspaces'), ... },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

    // 2. Get workspace identity
    const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

    // 3. Check RBAC (system capability)
    await requireWorkspaceRole(ctx, person._id, 'workspace_admin');

    // 4. Check Authority (organizational permission) — if applicable
    // const authority = await calculateAuthority(ctx, person._id, circleId);
    // if (!authority.canApproveProposals) throw new Error('...');

    // 5. Perform operation
    // ...
  }
});
```

---

## Common Patterns

### Grant workspace role to new member

```typescript
await ctx.db.insert('workspaceRoles', {
	personId: newPerson._id,
	role: 'member',
	grantedAt: Date.now(),
	grantedByPersonId: adminPerson._id
});
```

### Check before showing UI element

```svelte
<script>
	const isAdmin = useWorkspaceRole('workspace_admin');
</script>

{#if isAdmin}
	<AdminPanel />
{/if}
```

### Require platform access

```typescript
// In admin endpoint
await requireSystemRole(ctx, userId, 'support'); // Minimum: support
// or
await requireSystemRole(ctx, userId, 'platform_admin'); // Full access only
```

---

## Troubleshooting

### "User should have access but doesn't"

1. Check `systemRoles` — do they have a system role?
2. Check `workspaceRoles` — do they have a workspace role for THIS workspace?
3. Check `people` — does their person record exist in this workspace?
4. Check `rbacRolePermissions` — does their role include the required permission?

### "Permission was auto-granted but shouldn't be"

1. Check `sourceCircleRoleId` — which assignment granted it?
2. Check roleTemplate — does it have unexpected `rbacPermissions`?
3. This is working as designed — update the roleTemplate if wrong

### "Permission wasn't revoked when user removed from circle"

1. Check `sourceCircleRoleId` — was it set correctly?
2. Check cleanup handler — is `handleUserCircleRoleRemoved` running?
3. Check for other assignments — user might fill same role in another circle

---

## Files

| File             | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `tables.ts`      | Table definitions                               |
| `queries.ts`     | Read operations (hasRole, listRoles)            |
| `mutations.ts`   | Write operations (grant, revoke)                |
| `helpers.ts`     | `hasSystemRole`, `hasWorkspaceRole`, `require*` |
| `permissions.ts` | Permission checking utilities                   |

---

## Related Documentation

- [Architecture: Authority vs RBAC](../../../architecture.md#authority-vs-access-control-rbac)
- [Architecture: Two-Scope Model](../../../architecture.md#rbac-scope-model)
- [Admin README](../../admin/README.md)
- [Core Roles Domain](../../core/roles/README.md)
