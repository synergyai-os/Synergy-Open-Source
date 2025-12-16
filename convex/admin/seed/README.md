# Seed Infrastructure

Clean seed infrastructure for governance foundation per `governance-design.md`.

## Structure

```
/convex/admin/seed/
├── index.ts              # Main entry point - seedDatabase()
├── roleTemplates.ts      # System role templates (Circle Lead, Steward, etc.)
├── customFieldDefinitions.ts  # System custom field definitions
├── meetingTemplates.ts   # Meeting templates seeding (workspace-scoped)
├── workspaceSeed.ts      # Workspace seeding orchestration
├── bootstrap.ts          # Minimum viable workspace setup
└── README.md             # This file
```

## Usage

### Seed Everything (Templates + Demo Workspace)

```bash
npx convex run admin/seed/index:seedDatabase --arg includeDemo=true
```

### Seed Role Templates Only

```bash
npx convex run admin/seed/index:seedDatabase
# or
npx convex run admin/seed/index:seedRoleTemplatesOnly
```

## What Gets Created

### System Role Templates

Per `governance-design.md` §6.3, creates **10 system-level templates** (one for each circle type combination):

#### Hierarchy Circle Type

| Template    | roleType      | isCore | Purpose                                                 |
| ----------- | ------------- | ------ | ------------------------------------------------------- |
| Circle Lead | `circle_lead` | true   | Lead circle toward purpose with full decision authority |
| Secretary   | `structural`  | false  | Maintain circle records and schedule meetings           |

#### Empowered Team Circle Type

| Template    | roleType      | isCore | Purpose                                              |
| ----------- | ------------- | ------ | ---------------------------------------------------- |
| Team Lead   | `circle_lead` | true   | Facilitate team decisions and break ties when needed |
| Facilitator | `structural`  | false  | Facilitate governance and tactical meetings          |
| Secretary   | `structural`  | false  | Maintain circle records and schedule meetings        |

#### Guild Circle Type

| Template  | roleType      | isCore | Purpose                                       |
| --------- | ------------- | ------ | --------------------------------------------- |
| Steward   | `circle_lead` | true   | Convene and coordinate guild activities       |
| Secretary | `structural`  | false  | Maintain circle records and schedule meetings |

#### Hybrid Circle Type

| Template    | roleType      | isCore | Purpose                                       |
| ----------- | ------------- | ------ | --------------------------------------------- |
| Circle Lead | `circle_lead` | true   | Lead using consent-based decision making      |
| Facilitator | `structural`  | false  | Facilitate governance and tactical meetings   |
| Secretary   | `structural`  | false  | Maintain circle records and schedule meetings |

**Key Points:**

- Templates are system-level (`workspaceId = undefined`) and have no creator (`createdByPersonId = undefined`)
- Templates are uniquely identified by `roleType` + `appliesTo` (not just name)
- Each circle type has its own lead template with appropriate authority model
- The seed script is **dynamic** - you can modify `SYSTEM_TEMPLATES` array and it will work correctly

### Demo Workspace (Optional)

If `includeDemo=true`:

- Creates workspace named "Demo Workspace" with slug `demo`
- Creates root circle named "Company"
- Creates Circle Lead role with:
  - Purpose: "Lead this circle toward its purpose" (GOV-02)
  - Decision rights: ["Assign roles within circle"] (GOV-03)
- Workspace starts in `design` phase (no governance overhead)

## Idempotency

All seed functions are idempotent:

- Checks for existing templates by `name` + `roleType` + `appliesTo` + `archivedAt`
- Safe to run multiple times
- Skips existing records and reports counts
- Templates are uniquely identified by the combination of all three fields (name, roleType, appliesTo)

## When to Use

- **Initial setup:** Fresh database after deployment
- **Testing:** Reset to clean state (delete all data first)
- **Development:** Populate templates after schema changes

## Schema Requirements

Requires schema from SYOS-886 (Schema Updates for Governance):

- `roleTemplates`: `roleType`, `appliesTo`, `defaultPurpose`, `defaultDecisionRights`, `isCore`
- `circleRoles`: `roleType`, `purpose`, `decisionRights`, `templateId`
- `workspaces`: `phase`, `displayNames`

**Template Uniqueness:**

- Templates are uniquely identified by `name` + `roleType` + `appliesTo` combination
- Multiple templates can share the same name across different circle types (e.g., "Circle Lead" exists for both hierarchy and hybrid)
- Multiple templates can share the same `roleType` + `appliesTo` but have different names (e.g., "Facilitator" and "Secretary" are both `structural` for `empowered_team`)
- The seed script checks for exact matches on all three fields to ensure idempotency
- Note: `getSystemTemplateByRoleType()` in `circleCoreRoles.ts` queries by `roleType` + `appliesTo` only (returns first match), but the seed script needs to check for specific templates by name

### System Custom Field Definitions

Per SYOS-790, creates **14 system field definitions** (6 for circles, 8 for roles):

#### Circle Fields

| Field            | systemKey          | Order |
| ---------------- | ------------------ | ----- |
| Purpose          | `purpose`          | 0     |
| Domains          | `domains`          | 1     |
| Accountabilities | `accountabilities` | 2     |
| Policies         | `policies`         | 3     |
| Decision Rights  | `decision_rights`  | 4     |
| Notes            | `notes`            | 5     |

#### Role Fields (Matching Role & Decision Rights Charter)

| Field            | systemKey          | Order | Description                                                                |
| ---------------- | ------------------ | ----- | -------------------------------------------------------------------------- |
| Role Purpose     | `purpose`          | 0     | Why does this role exist? What impact does it have if successful?          |
| Accountabilities | `accountabilities` | 1     | What ongoing activities does this role do?                                 |
| Steering Metrics | `steering_metrics` | 2     | What can we measure to know if this role is succeeding?                    |
| Decision Rights  | `decision_rights`  | 3     | What decision rights does the role need? What can it decide alone?         |
| Role Filling     | `role_filling`     | 4     | How will the role be filled? And for how long? (e.g., quarterly elections) |
| Domains          | `domains`          | 5     | Areas of authority and control for this role                               |
| Policies         | `policies`         | 6     | Rules and constraints that apply to this role                              |
| Notes            | `notes`            | 7     | Additional notes and context for this role                                 |

**Note:** Role Holder(s) is tracked via the `assignments` table (personId + roleId + circleId), not as a custom field.

**Key Points:**

- Definitions are workspace-scoped (created per workspace)
- Role fields match the Role & Decision Rights Charter structure
- Seeded automatically when circle type is first set (onboarding step 3)
- Idempotent - safe to call multiple times
- System fields cannot be deleted, only archived
- Field names can be customized per workspace

**When Seeded:**

Custom field definitions are seeded when a circle's `circleType` is set for the first time (during onboarding step 3), matching the pattern used for role creation. This defers field definition creation until after the user has chosen their governance model.

### Meeting Templates

Per workspace seeding, creates **2 default meeting templates**:

- **Governance**: Holacracy governance meeting (3 steps: check-in, agenda, closing)
- **Weekly Tactical**: Operational meeting (6 steps: check-in, checklists, metrics, projects, agenda, closing)

**Key Points:**

- Templates are workspace-scoped (created per workspace)
- Generic templates that work for any circle type
- Seeded automatically when root circle type is set (onboarding step 3)
- Idempotent - safe to call multiple times
- Templates can be edited/deleted by users with appropriate permissions

**When Seeded:**

Meeting templates are seeded when the root circle's `circleType` is set for the first time (during onboarding step 3), along with custom field definitions. This consolidates all workspace seeding to happen when the root circle is created complete.

**Seeding Flow:**

1. User creates workspace (step 1) → workspace + person created, root circle created incomplete
2. User customizes terminology (step 2) → display names updated
3. User sets root circle type (step 3) → triggers:
   - Custom field definitions seeding
   - Meeting templates seeding
   - Core roles creation
   - All workspace resources now seeded

## Related

- `governance-design.md` - Governance specification
- `convex/infrastructure/rbac/seedRBAC.ts` - RBAC seed (separate concern)
- `convex/features/meetings/helpers/templates/seed.ts` - Legacy wrapper (deprecated, calls admin/seed)
- `convex/features/customFields/` - Custom fields feature implementation
