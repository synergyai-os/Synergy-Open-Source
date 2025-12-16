# Admin Tooling

**Location:** `convex/admin/`

**Purpose:** Operational utilities for managing SynergyOS. These are NOT user-facing features — they're for platform operators, developers, and support staff.

---

## Who Uses This?

Admin access requires `systemRoles` membership:

| Role               | Access Level | Can Do                                                        |
| ------------------ | ------------ | ------------------------------------------------------------- |
| `platform_admin`   | Full         | Everything — user management, RBAC, settings, data operations |
| `platform_manager` | High         | User management, workspace operations, settings               |
| `developer`        | Medium       | Feature flags, migrations, seeding, debugging                 |
| `support`          | Read-only    | View users, diagnose issues, read audit logs                  |

**Security:** Admin endpoints check `systemRoles` before any operation. No workspace-level role grants admin access.

---

## Directory Structure

```
admin/
├── invariants/           # Data integrity validation
│   ├── INVARIANTS.md     # Invariant definitions (source of truth)
│   ├── identity.ts       # IDENT-* checks
│   ├── organization.ts   # ORG-* checks
│   ├── authority.ts      # AUTH-* checks
│   └── ...
│
├── migrations/           # Schema migration utilities
│   └── ...
│
├── rbac.ts              # Role and permission management
├── users.ts             # User lookup, management
├── settings.ts          # System configuration
├── analytics.ts         # Usage analytics queries
├── seedOrgChart.ts      # Development: seed org structure
└── seedRoleTemplates.ts # Development: seed role templates
```

---

## Capabilities

### Invariants (`invariants/`)

Data integrity checks that validate CORE is sound.

**Run all checks:**

```bash
npx convex run admin/invariants:runAllChecks
```

**Run specific category:**

```bash
npx convex run admin/invariants/identity:check
npx convex run admin/invariants/organization:check
npx convex run admin/invariants/authority:check
```

**When to run:**

- After schema changes
- After migrations
- Before declaring CORE stable
- When debugging data issues

See `invariants/INVARIANTS.md` for full invariant definitions.

---

### User Management (`users.ts`)

| Function            | Purpose                                       | Required Role    |
| ------------------- | --------------------------------------------- | ---------------- |
| `listUsers`         | List all users with filters                   | `support`        |
| `getUser`           | Get user details by ID or email               | `support`        |
| `getUserWorkspaces` | List workspaces a user belongs to             | `support`        |
| `impersonateUser`   | Generate impersonation session (audit logged) | `platform_admin` |
| `disableUser`       | Disable user account                          | `platform_admin` |
| `deleteUser`        | Hard delete user and all data                 | `platform_admin` |

**Example:**

```typescript
// Support looking up a user
const user = await ctx.runQuery(api.admin.users.getUser, {
	sessionId,
	email: 'user@example.com'
});
```

---

### RBAC Management (`rbac.ts`)

| Function             | Purpose                          | Required Role      |
| -------------------- | -------------------------------- | ------------------ |
| `listSystemRoles`    | List all system role assignments | `platform_manager` |
| `grantSystemRole`    | Assign system role to user       | `platform_admin`   |
| `revokeSystemRole`   | Remove system role from user     | `platform_admin`   |
| `listWorkspaceRoles` | List workspace role assignments  | `platform_manager` |
| `listPermissions`    | List all defined permissions     | `developer`        |

**Example:**

```typescript
// Grant developer access
await ctx.runMutation(api.admin.rbac.grantSystemRole, {
	sessionId,
	targetUserId: userId,
	role: 'developer'
});
```

---

### Settings (`settings.ts`)

System-wide configuration (not workspace-specific).

| Setting                | Purpose                         | Default |
| ---------------------- | ------------------------------- | ------- |
| `maintenanceMode`      | Disable all non-admin access    | `false` |
| `signupsEnabled`       | Allow new user registration     | `true`  |
| `maxWorkspacesPerUser` | Limit workspaces per user       | `10`    |
| `featureFlagsEnabled`  | Master switch for feature flags | `true`  |

**Example:**

```typescript
// Enable maintenance mode
await ctx.runMutation(api.admin.settings.update, {
	sessionId,
	setting: 'maintenanceMode',
	value: true
});
```

---

### Analytics (`analytics.ts`)

Usage analytics for platform health monitoring.

| Query                 | Returns                      |
| --------------------- | ---------------------------- |
| `getDailyActiveUsers` | DAU count and trend          |
| `getWorkspaceStats`   | Workspaces by size, activity |
| `getFeatureUsage`     | Usage counts per feature     |
| `getErrorRates`       | Error counts by type         |

**Note:** For product analytics (user behavior, funnels), use PostHog. Admin analytics are for operational metrics.

---

### Seeding (`seed*.ts`)

Development utilities for populating test data.

| Script              | Purpose                                   | Environment              |
| ------------------- | ----------------------------------------- | ------------------------ |
| `seedOrgChart`      | Create sample circles, roles, assignments | Development only         |
| `seedRoleTemplates` | Create default role templates             | Development + Production |

**Example:**

```bash
# Development only
npx convex run admin/seedOrgChart:seed
```

**Warning:** Seeding scripts should check environment and refuse to run in production (except for initial setup scripts like `seedRoleTemplates`).

---

### Migrations (`migrations/`)

Schema migration utilities.

**Pre-production:** Since we have zero users, most "migrations" are just schema deletions. No data preservation needed.

**Pattern:**

```typescript
// migrations/removeUserRoles.ts
export const run = internalMutation({
	handler: async (ctx) => {
		// 1. Verify preconditions
		// 2. Perform migration
		// 3. Validate postconditions
		// 4. Log completion
	}
});
```

---

## Security

### Authentication

All admin endpoints require:

1. Valid `sessionId` (active session)
2. `systemRoles` membership with appropriate role

```typescript
export const adminQuery = query({
  args: { sessionId: v.string(), ... },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    await requireSystemRole(ctx, userId, 'support');  // Minimum role

    // ... actual logic
  }
});
```

### Audit Logging

Sensitive operations are logged to `permissionAuditLog`:

| Operation           | Logged Data                      |
| ------------------- | -------------------------------- |
| Role grants/revokes | Who, what role, when             |
| User disable/delete | Who, target user, reason         |
| Impersonation       | Who, target user, duration       |
| Settings changes    | Who, what setting, old/new value |

### Rate Limiting

Admin endpoints are rate-limited to prevent abuse:

- Read operations: 100/minute
- Write operations: 20/minute
- Destructive operations: 5/minute

---

## Common Tasks

### "User can't access their workspace"

1. Look up user: `admin/users.getUser`
2. Check their workspaces: `admin/users.getUserWorkspaces`
3. Check their person record exists in that workspace
4. Check RBAC: `admin/rbac.listWorkspaceRoles` for that person

### "Need to add a developer"

1. User must have account (sign up first)
2. Grant system role: `admin/rbac.grantSystemRole` with `role: 'developer'`

### "Data looks corrupted"

1. Run invariants: `npx convex run admin/invariants:runAllChecks`
2. Check which invariants fail
3. Investigate specific domain

### "Need to disable a feature immediately"

Use feature flags, not admin:

```typescript
await updateFeatureFlag(ctx, { name: 'broken-feature', defaultEnabled: false });
```

---

## Related Documentation

- [Architecture: Admin section](../architecture.md)
- [RBAC README](./infrastructure/rbac/README.md)
- [Invariants definitions](./admin/invariants/INVARIANTS.md)
- [Feature Flags README](./infrastructure/featureFlags/README.md)
