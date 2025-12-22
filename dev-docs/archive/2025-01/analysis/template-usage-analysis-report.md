# Template Usage Analysis Report

**Date**: 2025-01-27  
**Purpose**: Identify all uses of "template" terminology and determine which are template-specific vs generic

---

## Executive Summary

This report analyzes all uses of "template" terminology in the codebase to identify:

1. **Legitimate template usage** - Actual template entities (roleTemplates, meetingTemplates)
2. **Misleading template terminology** - Functions/parameters that use "template" but aren't template-specific
3. **Recommendations** - Suggested renames for clarity

---

## 1. Legitimate Template Entities ✅

These are correctly named as they represent actual template entities in the database:

### 1.1 Role Templates (`roleTemplates` table)

**What it is**: Database table storing reusable role templates (Circle Lead, Secretary, Facilitator, etc.)

**Why it's called template**: These ARE actual templates - reusable blueprints for creating roles

**Files**:

- `convex/core/roles/tables.ts` - Table definition
- `convex/admin/seed/roleTemplates.ts` - Seeding logic
- `convex/core/roles/templates/` - Template CRUD operations

**Usage**: ✅ **KEEP** - Correctly named

**Key fields**:

- `defaultFieldValues` - Array of `{ systemKey, values }` used when creating roles from template
- `appliesTo` - Which circle types this template applies to
- `roleType` - Type of role (circle_lead, structural, custom)

---

### 1.2 Meeting Templates (`meetingTemplates` table)

**What it is**: Database table storing reusable meeting structure templates (Governance, Weekly Tactical, etc.)

**Why it's called template**: These ARE actual templates - reusable blueprints for creating meetings

**Files**:

- `convex/features/meetings/tables.ts` - Table definition
- `convex/admin/seed/meetingTemplates.ts` - Seeding logic
- `convex/features/meetings/helpers/templates/` - Template CRUD operations

**Usage**: ✅ **KEEP** - Correctly named

---

### 1.3 Template ID References (`templateId`)

**What it is**: Foreign key field referencing `roleTemplates` or `meetingTemplates`

**Why it's called template**: Correctly references actual template entities

**Usage**: ✅ **KEEP** - Correctly named

**Examples**:

- `circleRoles.templateId` → references `roleTemplates`
- `meetings.templateId` → references `meetingTemplates`

---

## 2. Template-Specific Functions ✅

These functions are correctly named as they operate on actual templates:

### 2.1 Role Template Functions

| Function                               | Location                                    | Purpose                                 | Verdict     |
| -------------------------------------- | ------------------------------------------- | --------------------------------------- | ----------- |
| `findLeadRoleTemplate()`               | `convex/core/roles/templates/rules.ts:20`   | Finds Lead role template for workspace  | ✅ **KEEP** |
| `updateLeadRolesFromTemplate()`        | `convex/core/roles/templates/rules.ts:50`   | Updates roles FROM a template           | ✅ **KEEP** |
| `getSystemTemplateByRoleType()`        | `convex/core/circles/autoCreateRoles.ts:27` | Gets role template by roleType          | ✅ **KEEP** |
| `getAllSystemTemplatesForCircleType()` | `convex/core/circles/autoCreateRoles.ts:67` | Gets all role templates for circle type | ✅ **KEEP** |
| `isLeadTemplate()`                     | `convex/core/roles/rules.ts:116`            | Checks if template is Lead template     | ✅ **KEEP** |

### 2.2 Meeting Template Functions

| Function                   | Location                                                        | Purpose                         | Verdict     |
| -------------------------- | --------------------------------------------------------------- | ------------------------------- | ----------- |
| `listMeetingsByTemplate()` | `convex/features/meetings/helpers/queries/listByTemplate.ts:22` | Lists meetings by template ID   | ✅ **KEEP** |
| `seedMeetingTemplates()`   | `convex/admin/seed/meetingTemplates.ts:29`                      | Seeds default meeting templates | ✅ **KEEP** |

---

## 3. Misleading Template Terminology ❌

These use "template" but aren't template-specific:

### 3.1 `createCustomFieldValuesFromTemplate()` ⚠️ **MISLEADING**

**Location**: `convex/infrastructure/customFields/helpers.ts:223`

**What it does**: Creates `customFieldValues` records from an array of field values

**Why it's misleading**:

- Function name suggests it requires a template, but it doesn't
- It just takes structured field values (`Array<{ systemKey, values }>`)
- Used for BOTH template-based AND manual role creation

**Current usage**:

1. ✅ Template-based: `convex/core/circles/autoCreateRoles.ts:192` - Creates roles from `roleTemplates`
2. ❌ Manual creation: `convex/core/roles/mutations.ts:587` - Creates roles manually with `args.fieldValues`

**Evidence from code**:

```typescript
// Used for manual role creation (NOT from template)
await createCustomFieldValuesFromTemplate(ctx, {
	workspaceId,
	entityType: 'role',
	entityId: roleId,
	templateDefaultFieldValues: args.fieldValues, // ← Just field values, not from template!
	createdByPersonId: personId,
	workspacePhase: workspace?.phase
});
```

**Recommendation**:

- **Rename to**: `createCustomFieldValues()`
- **Parameter rename**: `templateDefaultFieldValues` → `fieldValues`
- **Reason**: Function is generic - it just creates custom field values from structured data, regardless of source

---

### 3.2 `templateDefaultFieldValues` Parameter ⚠️ **MISLEADING**

**Location**: Parameter in `createCustomFieldValuesFromTemplate()`

**What it is**: Array of `{ systemKey: string; values: string[] }`

**Why it's misleading**:

- Name suggests values come from a template, but they can come from anywhere
- Used for manual role creation where no template is involved

**Recommendation**:

- **Rename to**: `fieldValues`
- **Reason**: More accurate - these are just field values, not necessarily template defaults

---

### 3.3 `SystemFieldDefinitionTemplate` Interface ✅ **CORRECT**

**Location**: `convex/features/customFields/constants.ts:21`

**What it is**: TypeScript interface defining the structure for seeding system field definitions

**Why it's called template**: ✅ Correctly named - it's a template/blueprint for creating field definitions during seeding

**Usage**: ✅ **KEEP** - Correctly named

**Note**: This is a TypeScript type template, not a database entity template. The naming is appropriate for a type definition that serves as a template for seeding.

---

## 4. Template-Related Comments & Documentation

### 4.1 Comments Using "Template" Terminology

**Location**: `convex/infrastructure/customFields/helpers.ts:203-221`

**Current comment**:

```typescript
/**
 * Create customFieldValues from template defaultFieldValues
 *
 * This helper is used when core domains (roles, circles) create entities from templates.
 * ...
 * @param args.templateDefaultFieldValues - Array of { systemKey, values } from template
 */
```

**Issue**: Comment says "from templates" but function is also used for manual creation

**Recommendation**: Update comment to reflect both use cases:

```typescript
/**
 * Create customFieldValues from structured field values
 *
 * This helper creates customFieldValues records from an array of field values.
 * Used both when:
 * - Creating entities from templates (roleTemplates.defaultFieldValues)
 * - Creating entities manually (user-provided fieldValues)
 * ...
 * @param args.fieldValues - Array of { systemKey, values } to create
 */
```

---

## 5. Summary of Recommendations

### 5.1 High Priority Renames

| Current Name                            | Suggested Name              | Location                                            | Reason                                               |
| --------------------------------------- | --------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| `createCustomFieldValuesFromTemplate()` | `createCustomFieldValues()` | `convex/infrastructure/customFields/helpers.ts:223` | Not template-specific - used for manual creation too |
| `templateDefaultFieldValues` parameter  | `fieldValues`               | Same function                                       | More accurate - values can come from anywhere        |

### 5.2 Files Requiring Updates

If renaming `createCustomFieldValuesFromTemplate()`:

1. **Function definition**: `convex/infrastructure/customFields/helpers.ts:223`
2. **Export**: `convex/infrastructure/customFields/index.ts:7`
3. **Import & usage**: `convex/core/roles/mutations.ts:35,587`
4. **Import & usage**: `convex/core/circles/autoCreateRoles.ts:17,192,323,411`

**Total call sites**: 4 locations across 2 files

---

## 6. Impact Analysis

### 6.1 Breaking Changes

**If renaming `createCustomFieldValuesFromTemplate()`**:

- ✅ **Low risk** - Only used internally (not exported to frontend)
- ✅ **Easy to update** - Only 4 call sites
- ✅ **Clear benefit** - More accurate naming improves code clarity

### 6.2 Migration Strategy

1. **Step 1**: Create new function `createCustomFieldValues()` with new parameter name
2. **Step 2**: Update all call sites to use new function
3. **Step 3**: Remove old function `createCustomFieldValuesFromTemplate()`
4. **Step 4**: Update comments/documentation

**Estimated effort**: Low (4 call sites, straightforward rename)

---

## 7. Additional Findings

### 7.1 Template-Related Patterns

**Pattern**: Functions that operate on templates use "template" correctly:

- `find*Template()` - Finds template entities ✅
- `update*FromTemplate()` - Updates entities from templates ✅
- `get*Template()` - Gets template entities ✅

**Pattern**: Generic helpers should NOT use "template" unless template-specific:

- `createCustomFieldValues()` - Generic helper ✅ (after rename)
- `createCustomFieldValuesFromTemplate()` - Misleading ❌ (current)

### 7.2 Template vs Non-Template Usage

**Template-based creation** (uses actual `roleTemplates`):

- `convex/core/circles/autoCreateRoles.ts:192` - Creates roles from `template.defaultFieldValues`
- `convex/core/circles/autoCreateRoles.ts:323` - Creates roles from `targetTemplate.defaultFieldValues`
- `convex/core/circles/autoCreateRoles.ts:411` - Creates roles from `template.defaultFieldValues`

**Manual creation** (no template involved):

- `convex/core/roles/mutations.ts:587` - Creates roles with `args.fieldValues` (user-provided)

**Key insight**: The same helper function is used for both cases, proving it's not template-specific.

---

## 8. Conclusion

### 8.1 Correctly Named (Keep As-Is)

- ✅ `roleTemplates` table and related functions
- ✅ `meetingTemplates` table and related functions
- ✅ `templateId` foreign key fields
- ✅ Template-specific functions (`find*Template`, `update*FromTemplate`, etc.)
- ✅ `SystemFieldDefinitionTemplate` interface

### 8.2 Should Be Renamed

- ❌ `createCustomFieldValuesFromTemplate()` → `createCustomFieldValues()`
- ❌ `templateDefaultFieldValues` parameter → `fieldValues`

### 8.3 Benefits of Renaming

1. **Clarity**: Function name accurately reflects what it does (creates field values, not necessarily from templates)
2. **Accuracy**: Parameter name doesn't imply template requirement
3. **Consistency**: Aligns with actual usage (both template and non-template cases)
4. **Maintainability**: Future developers won't be confused about template requirement

---

## Appendix: Complete List of Template References

### Database Tables

- `roleTemplates` ✅ Correct
- `meetingTemplates` ✅ Correct
- `meetingTemplateSteps` ✅ Correct

### Function Names

- `createCustomFieldValuesFromTemplate()` ❌ Should rename
- `findLeadRoleTemplate()` ✅ Correct
- `updateLeadRolesFromTemplate()` ✅ Correct
- `getSystemTemplateByRoleType()` ✅ Correct
- `getAllSystemTemplatesForCircleType()` ✅ Correct
- `isLeadTemplate()` ✅ Correct
- `listMeetingsByTemplate()` ✅ Correct
- `seedMeetingTemplates()` ✅ Correct

### Parameter Names

- `templateDefaultFieldValues` ❌ Should rename
- `templateId` ✅ Correct

### Type Names

- `SystemFieldDefinitionTemplate` ✅ Correct
- `RoleTemplate` ✅ Correct
- `MeetingTemplate` ✅ Correct

---

**Report Generated**: 2025-01-27  
**Analysis Scope**: All uses of "template" in `convex/` directory  
**Next Steps**: Review recommendations and plan rename if approved

