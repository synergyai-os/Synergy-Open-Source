/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_analytics from "../admin/analytics.js";
import type * as admin_cleanupDuplicateRoles from "../admin/cleanupDuplicateRoles.js";
import type * as admin_migrateAddCoreRoles from "../admin/migrateAddCoreRoles.js";
import type * as admin_migrateCirclesToWorkspaces from "../admin/migrateCirclesToWorkspaces.js";
import type * as admin_migrateDefaultCategories from "../admin/migrateDefaultCategories.js";
import type * as admin_migrateOrgChartSoftDelete from "../admin/migrateOrgChartSoftDelete.js";
import type * as admin_migrateRootCircles from "../admin/migrateRootCircles.js";
import type * as admin_migrateVersionHistory from "../admin/migrateVersionHistory.js";
import type * as admin_rbac from "../admin/rbac.js";
import type * as admin_seedRoleTemplates from "../admin/seedRoleTemplates.js";
import type * as admin_settings from "../admin/settings.js";
import type * as admin_users from "../admin/users.js";
import type * as admin_validateRoleTemplates from "../admin/validateRoleTemplates.js";
import type * as auth from "../auth.js";
import type * as authSessions from "../authSessions.js";
import type * as blogExport from "../blogExport.js";
import type * as circleItems from "../circleItems.js";
import type * as circleRoles from "../circleRoles.js";
import type * as circles from "../circles.js";
import type * as core_assignments_index from "../core/assignments/index.js";
import type * as core_assignments_mutations from "../core/assignments/mutations.js";
import type * as core_assignments_queries from "../core/assignments/queries.js";
import type * as core_assignments_rules from "../core/assignments/rules.js";
import type * as core_authority_calculator from "../core/authority/calculator.js";
import type * as core_authority_index from "../core/authority/index.js";
import type * as core_authority_mutations from "../core/authority/mutations.js";
import type * as core_authority_queries from "../core/authority/queries.js";
import type * as core_authority_rules from "../core/authority/rules.js";
import type * as core_circles_index from "../core/circles/index.js";
import type * as core_circles_mutations from "../core/circles/mutations.js";
import type * as core_circles_queries from "../core/circles/queries.js";
import type * as core_circles_rules from "../core/circles/rules.js";
import type * as core_circles_slug from "../core/circles/slug.js";
import type * as core_circles_validation from "../core/circles/validation.js";
import type * as core_index from "../core/index.js";
import type * as core_people_index from "../core/people/index.js";
import type * as core_people_mutations from "../core/people/mutations.js";
import type * as core_people_queries from "../core/people/queries.js";
import type * as core_people_rules from "../core/people/rules.js";
import type * as core_policies_index from "../core/policies/index.js";
import type * as core_policies_mutations from "../core/policies/mutations.js";
import type * as core_policies_queries from "../core/policies/queries.js";
import type * as core_policies_rules from "../core/policies/rules.js";
import type * as core_proposals_index from "../core/proposals/index.js";
import type * as core_proposals_mutations from "../core/proposals/mutations.js";
import type * as core_proposals_queries from "../core/proposals/queries.js";
import type * as core_proposals_rules from "../core/proposals/rules.js";
import type * as core_proposals_stateMachine from "../core/proposals/stateMachine.js";
import type * as core_proposals_validation from "../core/proposals/validation.js";
import type * as core_roles_detection from "../core/roles/detection.js";
import type * as core_roles_index from "../core/roles/index.js";
import type * as core_roles_lead from "../core/roles/lead.js";
import type * as core_roles_mutations from "../core/roles/mutations.js";
import type * as core_roles_queries from "../core/roles/queries.js";
import type * as core_roles_rules from "../core/roles/rules.js";
import type * as core_roles_validation from "../core/roles/validation.js";
import type * as cryptoActions from "../cryptoActions.js";
import type * as docs_doc404Tracking from "../docs/doc404Tracking.js";
import type * as email from "../email.js";
import type * as featureFlags from "../featureFlags.js";
import type * as features_flashcards_index from "../features/flashcards/index.js";
import type * as features_inbox_index from "../features/inbox/index.js";
import type * as features_meetings_agendaItems from "../features/meetings/agendaItems.js";
import type * as features_meetings_index from "../features/meetings/index.js";
import type * as features_meetings_invitations from "../features/meetings/invitations.js";
import type * as features_meetings_meetings from "../features/meetings/meetings.js";
import type * as features_meetings_presence from "../features/meetings/presence.js";
import type * as features_meetings_templates from "../features/meetings/templates.js";
import type * as features_notes_index from "../features/notes/index.js";
import type * as features_tags_index from "../features/tags/index.js";
import type * as features_tasks_index from "../features/tasks/index.js";
import type * as features_workspaces_index from "../features/workspaces/index.js";
import type * as flashcards from "../flashcards.js";
import type * as http from "../http.js";
import type * as inbox from "../inbox.js";
import type * as infrastructure_access_withCircleAccess from "../infrastructure/access/withCircleAccess.js";
import type * as infrastructure_auth from "../infrastructure/auth.js";
import type * as infrastructure_auth_helpers from "../infrastructure/auth/helpers.js";
import type * as infrastructure_authSessions from "../infrastructure/authSessions.js";
import type * as infrastructure_db_withActiveFilter from "../infrastructure/db/withActiveFilter.js";
import type * as infrastructure_email from "../infrastructure/email.js";
import type * as infrastructure_errors_codes from "../infrastructure/errors/codes.js";
import type * as infrastructure_featureFlags from "../infrastructure/featureFlags.js";
import type * as infrastructure_http from "../infrastructure/http.js";
import type * as infrastructure_posthog from "../infrastructure/posthog.js";
import type * as infrastructure_sessionValidation from "../infrastructure/sessionValidation.js";
import type * as infrastructure_types_prosemirror from "../infrastructure/types/prosemirror.js";
import type * as modules_meetings_agendaItems from "../modules/meetings/agendaItems.js";
import type * as modules_meetings_index from "../modules/meetings/index.js";
import type * as modules_meetings_invitations from "../modules/meetings/invitations.js";
import type * as modules_meetings_meetings from "../modules/meetings/meetings.js";
import type * as modules_meetings_presence from "../modules/meetings/presence.js";
import type * as modules_meetings_templates from "../modules/meetings/templates.js";
import type * as notes from "../notes.js";
import type * as orgChartPermissions from "../orgChartPermissions.js";
import type * as orgChartTriggers from "../orgChartTriggers.js";
import type * as orgStructureImport from "../orgStructureImport.js";
import type * as orgVersionHistory from "../orgVersionHistory.js";
import type * as permissions from "../permissions.js";
import type * as posthog from "../posthog.js";
import type * as promptUtils from "../promptUtils.js";
import type * as prompts_flashcardGeneration from "../prompts/flashcardGeneration.js";
import type * as proposals from "../proposals.js";
import type * as rbac_permissions from "../rbac/permissions.js";
import type * as rbac_queries from "../rbac/queries.js";
import type * as rbac_roles from "../rbac/roles.js";
import type * as rbac_seedRBAC from "../rbac/seedRBAC.js";
import type * as rbac_setupAdmin from "../rbac/setupAdmin.js";
import type * as readwiseApi from "../readwiseApi.js";
import type * as readwiseCleanup from "../readwiseCleanup.js";
import type * as readwiseUtils from "../readwiseUtils.js";
import type * as roleTemplates from "../roleTemplates.js";
import type * as seedOrgChart from "../seedOrgChart.js";
import type * as sessionValidation from "../sessionValidation.js";
import type * as settings from "../settings.js";
import type * as syncReadwise from "../syncReadwise.js";
import type * as syncReadwiseMutations from "../syncReadwiseMutations.js";
import type * as tags from "../tags.js";
import type * as tasks from "../tasks.js";
import type * as testReadwiseApi from "../testReadwiseApi.js";
import type * as users from "../users.js";
import type * as validateApiKeys from "../validateApiKeys.js";
import type * as verification from "../verification.js";
import type * as waitlist from "../waitlist.js";
import type * as workspaceAliases from "../workspaceAliases.js";
import type * as workspaceRoles from "../workspaceRoles.js";
import type * as workspaceSettings from "../workspaceSettings.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/analytics": typeof admin_analytics;
  "admin/cleanupDuplicateRoles": typeof admin_cleanupDuplicateRoles;
  "admin/migrateAddCoreRoles": typeof admin_migrateAddCoreRoles;
  "admin/migrateCirclesToWorkspaces": typeof admin_migrateCirclesToWorkspaces;
  "admin/migrateDefaultCategories": typeof admin_migrateDefaultCategories;
  "admin/migrateOrgChartSoftDelete": typeof admin_migrateOrgChartSoftDelete;
  "admin/migrateRootCircles": typeof admin_migrateRootCircles;
  "admin/migrateVersionHistory": typeof admin_migrateVersionHistory;
  "admin/rbac": typeof admin_rbac;
  "admin/seedRoleTemplates": typeof admin_seedRoleTemplates;
  "admin/settings": typeof admin_settings;
  "admin/users": typeof admin_users;
  "admin/validateRoleTemplates": typeof admin_validateRoleTemplates;
  auth: typeof auth;
  authSessions: typeof authSessions;
  blogExport: typeof blogExport;
  circleItems: typeof circleItems;
  circleRoles: typeof circleRoles;
  circles: typeof circles;
  "core/assignments/index": typeof core_assignments_index;
  "core/assignments/mutations": typeof core_assignments_mutations;
  "core/assignments/queries": typeof core_assignments_queries;
  "core/assignments/rules": typeof core_assignments_rules;
  "core/authority/calculator": typeof core_authority_calculator;
  "core/authority/index": typeof core_authority_index;
  "core/authority/mutations": typeof core_authority_mutations;
  "core/authority/queries": typeof core_authority_queries;
  "core/authority/rules": typeof core_authority_rules;
  "core/circles/index": typeof core_circles_index;
  "core/circles/mutations": typeof core_circles_mutations;
  "core/circles/queries": typeof core_circles_queries;
  "core/circles/rules": typeof core_circles_rules;
  "core/circles/slug": typeof core_circles_slug;
  "core/circles/validation": typeof core_circles_validation;
  "core/index": typeof core_index;
  "core/people/index": typeof core_people_index;
  "core/people/mutations": typeof core_people_mutations;
  "core/people/queries": typeof core_people_queries;
  "core/people/rules": typeof core_people_rules;
  "core/policies/index": typeof core_policies_index;
  "core/policies/mutations": typeof core_policies_mutations;
  "core/policies/queries": typeof core_policies_queries;
  "core/policies/rules": typeof core_policies_rules;
  "core/proposals/index": typeof core_proposals_index;
  "core/proposals/mutations": typeof core_proposals_mutations;
  "core/proposals/queries": typeof core_proposals_queries;
  "core/proposals/rules": typeof core_proposals_rules;
  "core/proposals/stateMachine": typeof core_proposals_stateMachine;
  "core/proposals/validation": typeof core_proposals_validation;
  "core/roles/detection": typeof core_roles_detection;
  "core/roles/index": typeof core_roles_index;
  "core/roles/lead": typeof core_roles_lead;
  "core/roles/mutations": typeof core_roles_mutations;
  "core/roles/queries": typeof core_roles_queries;
  "core/roles/rules": typeof core_roles_rules;
  "core/roles/validation": typeof core_roles_validation;
  cryptoActions: typeof cryptoActions;
  "docs/doc404Tracking": typeof docs_doc404Tracking;
  email: typeof email;
  featureFlags: typeof featureFlags;
  "features/flashcards/index": typeof features_flashcards_index;
  "features/inbox/index": typeof features_inbox_index;
  "features/meetings/agendaItems": typeof features_meetings_agendaItems;
  "features/meetings/index": typeof features_meetings_index;
  "features/meetings/invitations": typeof features_meetings_invitations;
  "features/meetings/meetings": typeof features_meetings_meetings;
  "features/meetings/presence": typeof features_meetings_presence;
  "features/meetings/templates": typeof features_meetings_templates;
  "features/notes/index": typeof features_notes_index;
  "features/tags/index": typeof features_tags_index;
  "features/tasks/index": typeof features_tasks_index;
  "features/workspaces/index": typeof features_workspaces_index;
  flashcards: typeof flashcards;
  http: typeof http;
  inbox: typeof inbox;
  "infrastructure/access/withCircleAccess": typeof infrastructure_access_withCircleAccess;
  "infrastructure/auth": typeof infrastructure_auth;
  "infrastructure/auth/helpers": typeof infrastructure_auth_helpers;
  "infrastructure/authSessions": typeof infrastructure_authSessions;
  "infrastructure/db/withActiveFilter": typeof infrastructure_db_withActiveFilter;
  "infrastructure/email": typeof infrastructure_email;
  "infrastructure/errors/codes": typeof infrastructure_errors_codes;
  "infrastructure/featureFlags": typeof infrastructure_featureFlags;
  "infrastructure/http": typeof infrastructure_http;
  "infrastructure/posthog": typeof infrastructure_posthog;
  "infrastructure/sessionValidation": typeof infrastructure_sessionValidation;
  "infrastructure/types/prosemirror": typeof infrastructure_types_prosemirror;
  "modules/meetings/agendaItems": typeof modules_meetings_agendaItems;
  "modules/meetings/index": typeof modules_meetings_index;
  "modules/meetings/invitations": typeof modules_meetings_invitations;
  "modules/meetings/meetings": typeof modules_meetings_meetings;
  "modules/meetings/presence": typeof modules_meetings_presence;
  "modules/meetings/templates": typeof modules_meetings_templates;
  notes: typeof notes;
  orgChartPermissions: typeof orgChartPermissions;
  orgChartTriggers: typeof orgChartTriggers;
  orgStructureImport: typeof orgStructureImport;
  orgVersionHistory: typeof orgVersionHistory;
  permissions: typeof permissions;
  posthog: typeof posthog;
  promptUtils: typeof promptUtils;
  "prompts/flashcardGeneration": typeof prompts_flashcardGeneration;
  proposals: typeof proposals;
  "rbac/permissions": typeof rbac_permissions;
  "rbac/queries": typeof rbac_queries;
  "rbac/roles": typeof rbac_roles;
  "rbac/seedRBAC": typeof rbac_seedRBAC;
  "rbac/setupAdmin": typeof rbac_setupAdmin;
  readwiseApi: typeof readwiseApi;
  readwiseCleanup: typeof readwiseCleanup;
  readwiseUtils: typeof readwiseUtils;
  roleTemplates: typeof roleTemplates;
  seedOrgChart: typeof seedOrgChart;
  sessionValidation: typeof sessionValidation;
  settings: typeof settings;
  syncReadwise: typeof syncReadwise;
  syncReadwiseMutations: typeof syncReadwiseMutations;
  tags: typeof tags;
  tasks: typeof tasks;
  testReadwiseApi: typeof testReadwiseApi;
  users: typeof users;
  validateApiKeys: typeof validateApiKeys;
  verification: typeof verification;
  waitlist: typeof waitlist;
  workspaceAliases: typeof workspaceAliases;
  workspaceRoles: typeof workspaceRoles;
  workspaceSettings: typeof workspaceSettings;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
