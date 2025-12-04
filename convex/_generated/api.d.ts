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
import type * as cryptoActions from "../cryptoActions.js";
import type * as docs_doc404Tracking from "../docs/doc404Tracking.js";
import type * as email from "../email.js";
import type * as featureFlags from "../featureFlags.js";
import type * as flashcards from "../flashcards.js";
import type * as http from "../http.js";
import type * as inbox from "../inbox.js";
import type * as meetingAgendaItems from "../meetingAgendaItems.js";
import type * as meetingInvitations from "../meetingInvitations.js";
import type * as meetingPresence from "../meetingPresence.js";
import type * as meetingTemplates from "../meetingTemplates.js";
import type * as meetings from "../meetings.js";
import type * as notes from "../notes.js";
import type * as orgChartPermissions from "../orgChartPermissions.js";
import type * as orgChartTriggers from "../orgChartTriggers.js";
import type * as orgStructureImport from "../orgStructureImport.js";
import type * as orgVersionHistory from "../orgVersionHistory.js";
import type * as permissions from "../permissions.js";
import type * as posthog from "../posthog.js";
import type * as promptUtils from "../promptUtils.js";
import type * as prompts_flashcardGeneration from "../prompts/flashcardGeneration.js";
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
  cryptoActions: typeof cryptoActions;
  "docs/doc404Tracking": typeof docs_doc404Tracking;
  email: typeof email;
  featureFlags: typeof featureFlags;
  flashcards: typeof flashcards;
  http: typeof http;
  inbox: typeof inbox;
  meetingAgendaItems: typeof meetingAgendaItems;
  meetingInvitations: typeof meetingInvitations;
  meetingPresence: typeof meetingPresence;
  meetingTemplates: typeof meetingTemplates;
  meetings: typeof meetings;
  notes: typeof notes;
  orgChartPermissions: typeof orgChartPermissions;
  orgChartTriggers: typeof orgChartTriggers;
  orgStructureImport: typeof orgStructureImport;
  orgVersionHistory: typeof orgVersionHistory;
  permissions: typeof permissions;
  posthog: typeof posthog;
  promptUtils: typeof promptUtils;
  "prompts/flashcardGeneration": typeof prompts_flashcardGeneration;
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
