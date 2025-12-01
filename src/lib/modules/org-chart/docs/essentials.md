# Org Chart Module - Essentials

> **Note**: This document describes the **future state** of the org chart system. It serves as the source of truth for understanding how the system should work once fully implemented. See `ai-docs/tasks/org-chart-future-state-implementation.md` for implementation details.

## User Types

- **System Admin** - Global administrator with full system access
  - Can manage all users, workspaces, and system settings
  - Has access across all workspaces
  - Can create and modify system-level configurations

- **Workspace Admin** - Administrator for a specific workspace
  - Can manage workspace settings, members, and permissions
  - Can configure core roles and organizational structure settings
  - Has full access within their workspace scope

- **Workspace User** - Standard member of a workspace
  - Can view and participate in organizational structure
  - Can be assigned to roles within circles
  - Access is limited to their workspace and assigned circles
  - Permissions are controlled via RBAC

## Glossary

| Term                     | Definition                                                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Circle**               | A work unit within a workspace, organized hierarchically. All circles descend from the root circle.                                                                           |
| **Circle Item**          | A draggable content item within a circle category (e.g., a specific domain or accountability). Stored as DB records for ordering, and vectorized for AI/RAG access.           |
| **Circle Item Category** | A container for circle items (e.g., "Domains", "Accountabilities"). Workspace admin can customize which categories exist.                                                     |
| **Circle Lead**          | A must-have role that every circle requires (default setup). Workspace admin can configure this requirement.                                                                  |
| **Circle Member**        | A user who belongs to a circle. Many-to-many relationship between users and circles.                                                                                          |
| **Circle Role**          | An organizational role within a circle (e.g., "Circle Lead", "Facilitator"). Belongs to a specific circle. NOT RBAC permissions - these define who does what work.            |
| **Core Role**            | A role that is automatically created in existing and future circles based on role templates marked as core.                                                                   |
| **Purpose**              | Role-level description text explaining what the role does (e.g., "Leads the circle and facilitates meetings").                                                                |
| **Root Circle**          | The top-level circle created automatically with each workspace. Identified by `parentCircleId = null`. Can be renamed but never archived or deleted.                          |
| **Scope**                | Member-level text field clarifying a user's specific responsibility within a role assignment. Multiple users can have the same role with different scopes.                    |
| **Sub-circle**           | A circle created within another circle. All circles except the root circle are sub-circles with a parent circle.                                                              |
| **User Circle Role**     | Many-to-many assignment of users to circle roles. Users can fill multiple roles across different circles. Roles can have multiple users filling them.                         |
| **Version History**      | Complete audit trail of all changes to organizational elements (roles, circles, domains, purpose, etc.). Enables traceability, AI analysis, and future visual timeline views. |
| **Workspace**            | A workspace that users belong to. Contains circles, roles, and members.                                                                                                       |

## Data Entities

### Core Entities (from Core Module)

- **Users** - System users (from Core module)
- **Workspaces** - Workspaces users belong to (from Core module)

### Org Chart Entities

- **Circles** - Work workspace units, hierarchical structure
  - A workspace always starts with a root circle (has `parentCircleId = null`)
  - Only one root circle per workspace; created automatically on workspace creation
  - Root circle can be renamed but never archived or deleted
  - Within the root circle, users create sub-circles
  - All circles except the root circle are sub-circles with a parent circle (`parentCircleId` is set)
  - Sub-circles can be nested infinitely deep (sub-circles can have their own sub-circles)
  - Has `name`, `slug`, optional `purpose`, `parentCircleId`, `createdAt`, `updatedAt`, `archivedAt`, `archivedBy`
  - Uses soft delete (`archivedAt`) to maintain version history

- **Circle Item Categories** - Customizable category containers for circles and roles
  - Default categories for circles: Purpose, Domains, Accountabilities, Policies, Decision Rights, Notes
  - Default categories for roles: Purpose, Domains, Accountabilities
  - Workspace admin can add, remove, rename, and reorder categories
  - Categories are created automatically on workspace creation with default setup
  - Has `entityType` (circle/role), `name`, `order`, `workspaceId`

- **Circle Items** - Content items within categories
  - Belong to a specific circle/role and category
  - Draggable for user-defined ordering
  - Has `content` (text), `order`, `categoryId`, `entityId`, `entityType`
  - Vectorized for AI/RAG access (future: embedding field)

- **Circle Members** - Many-to-many relationship between users and circles
  - Users can belong to multiple circles
  - Tracks `joinedAt`, `addedBy`, `archivedAt`, `archivedBy` (when user leaves circle)
  - Indexed by circle, user, and circle+user combination

- **Circle Roles** - Organizational roles within circles
  - Belong to a specific circle (`circleId`)
  - Examples: "Circle Lead", "Dev Lead", "Facilitator"
  - Has `name`, optional `purpose`, `createdAt`, `updatedAt`, `archivedAt`, `archivedBy`
  - Linked to role templates via `templateId` (for core roles)
  - **Note**: These are NOT RBAC permissions - they define organizational accountabilities
  - **Circle Lead Requirement**: Every circle must have a "Circle Lead" role (default setup, configurable by workspace admin)
  - **Core Roles**: Automatically created from role templates marked as core

- **User Circle Roles** - Many-to-many assignments of users to circle roles
  - Users can fill multiple roles (across different circles)
  - Roles can have multiple users filling them
  - Tracks `assignedAt`, `assignedBy`, `updatedAt`, `archivedAt`, `archivedBy`
  - **Scope Field**: Member-level text clarifying user's specific responsibility within the role assignment

## Relationships

### Users & Circles

- Users ↔ Circles: Many-to-many via `circleMembers` (users can belong to multiple circles)
- Circles: Self-referential hierarchy via `parentCircleId` (parent/child relationships)
  - Root circle: The initial circle created with the workspace (has no parent, `parentCircleId` is null)
  - Sub-circles: All other circles are sub-circles created within the root circle or within other sub-circles
  - Sub-circles can be nested infinitely deep (sub-circles can have their own sub-circles)

### Circle Roles & Assignments

- Circle → Circle Roles: One-to-many (roles belong to a specific circle via `circleId`)
- Users ↔ Circle Roles: Many-to-many via `userCircleRoles`
  - Users can fill multiple roles (across different circles)
  - Roles can have multiple users filling them
  - Each assignment tracks who assigned it (`assignedBy`) and when (`assignedAt`)

### Workspace Context

- Circle → Workspace: Many-to-one (required, via `workspaceId`)
- Circle Role → Circle: Many-to-one (required, via `circleId`)
- User Circle Role → User: Many-to-one (required, via `userId`)
- User Circle Role → Circle Role: Many-to-one (required, via `circleRoleId`)

## Constraints & Edge Cases

### Root Circle

- **Creation**: Automatically created when a workspace is created
- **Identification**: `parentCircleId = null` (only one per workspace)
- **Protection**: Can be renamed, but cannot be archived or deleted
- **Default Name**: "General Circle" (or workspace name)

### Circle Lead Requirement

- **Default Behavior**: Every circle must have a "Circle Lead" role
- **Configuration**: Workspace admin can configure this requirement via workspace settings
- **Enforcement**: System automatically creates Circle Lead role when circle is created (if required)
- **Deletion Protection**: Circle Lead role cannot be deleted if marked as required
- **Assignment Protection**: Last Circle Lead assignment cannot be removed if role is required

### Core Roles

- **Concept**: Roles that are automatically created in existing and future circles
- **Based On**: Role templates - workspace-level or system-level templates
- **Configuration**: Workspace admin configures which role templates are core roles
- **Auto-Creation**: When a circle is created, all core role templates automatically create roles in that circle
- **Required Roles**: Some roles (like Circle Lead) can be marked as required and cannot be deleted

### Scope Field

- **Purpose**: Member-level text clarifying a user's specific responsibility within a role assignment
- **Use Case**: Multiple users can have the same role with different scopes
  - Example: 2 "Circle Lead" roles where one handles "technical strategy" and the other handles "matching people with roles"
- **Storage**: Optional text field on `userCircleRoles` table
- **Display**: Shown in role cards and member lists when viewing role assignments

### Data Retention & Cascade Behavior

- **All Deletions**: Use soft delete (`archivedAt` timestamp) to maintain complete version history
- **Root Circle**: Cannot be archived or deleted (protected)
- **Circle archival**: Sets `archivedAt` on circle → cascades to archive all roles in that circle
- **Role archival**: Sets `archivedAt` on role → cascades to archive all user assignments to that role
- **Assignment archival**: Sets `archivedAt` - preserves assignment history
- **Member removal**: Sets `archivedAt` on `circleMembers` - preserves membership history
- **Workspace deletion**: Cascade soft delete - all circles, roles, and assignments archived
- **Task references**: Tasks referencing archived roles keep the reference (for history) but display as "role archived"
- **Rationale**: Soft deletes preserve complete audit trail for version history, AI analysis, and restoration

### List Query Defaults

- **Archived filtering**: All list queries (circles, roles, members) exclude archived records by default
- **Include archived**: Optional `includeArchived` parameter to show archived records when needed

## UI Components

### Circle Detail View

- **Roles List**: Shows all roles in the circle (using `RoleCard` component)
- **Sub-Circles List**: Shows all child circles (sub-circles) within the circle
- **Members List**: Shows all members of the circle
- **Note**: Roles and Sub-Circles are displayed in the same view (CircleDetailPanel)

### Role Card Component

- **Purpose**: Displays role information in list views
- **States**: Unselected (default), Selected (highlighted), Hover
- **Content**: Role name, purpose (or filler count), actions (edit, menu)
- **Future States**: Expandable (shows assigned members), With Scope (shows member scope text)

## Additional Entities

### Role Templates

- **Purpose**: Reusable role definitions that can be marked as core roles
- **Workspace-Level**: Templates created by workspace admin for their workspace
- **System-Level**: Templates with `workspaceId` absent/undefined (available to all workspaces)
- **Core Flag**: Templates marked as core automatically create roles in all circles
- **Required Flag**: Templates marked as required cannot be deleted and create required roles

### Workspace Org Settings

- **Purpose**: Workspace-level configuration for org chart behavior
- **Settings**: Require Circle Lead role, core role template IDs, version history retention, etc.
- **Defaults**: System provides sensible defaults, workspace admin can override

### Circle/Role Item Categories

- **Purpose**: Define what categories of content circles and roles can have
- **Default Setup**: Created on workspace creation with predefined categories
- **Circle Defaults**: Purpose, Domains, Accountabilities, Policies, Decision Rights, Notes
- **Role Defaults**: Purpose, Domains, Accountabilities
- **Customization**: Workspace admin can add, remove, rename, and reorder categories

### Circle/Role Items

- **Purpose**: Individual content items within categories
- **Features**: User-defined ordering (drag/drop), vectorized for AI/RAG access
- **Storage**: Each item is a DB record for ordering and AI indexing
- **Future**: Embedding field for semantic search and AI analysis

### Version History

- **Purpose**: Complete audit trail of all organizational changes
- **Tracking**: All changes to circles, roles, assignments, members, items tracked automatically
- **Information Captured**: Who, when, what changed (before/after values)
- **Type-Safe Storage**: Uses discriminated unions per entity type (not generic `any`)
- **Restoration**: Ability to restore any previous version
- **AI Analysis**: Enables AI to analyze organizational evolution and provide insights
- **Visual Timeline**: Future enhancement - slide left/right to see org chart evolution over time
