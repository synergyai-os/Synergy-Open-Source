/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as blogExport from "../blogExport.js";
import type * as cryptoActions from "../cryptoActions.js";
import type * as email from "../email.js";
import type * as featureFlags from "../featureFlags.js";
import type * as flashcards from "../flashcards.js";
import type * as http from "../http.js";
import type * as inbox from "../inbox.js";
import type * as notes from "../notes.js";
import type * as organizationSettings from "../organizationSettings.js";
import type * as organizations from "../organizations.js";
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
import type * as settings from "../settings.js";
import type * as syncReadwise from "../syncReadwise.js";
import type * as syncReadwiseMutations from "../syncReadwiseMutations.js";
import type * as tags from "../tags.js";
import type * as teams from "../teams.js";
import type * as testReadwiseApi from "../testReadwiseApi.js";
import type * as users from "../users.js";
import type * as validateApiKeys from "../validateApiKeys.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  blogExport: typeof blogExport;
  cryptoActions: typeof cryptoActions;
  email: typeof email;
  featureFlags: typeof featureFlags;
  flashcards: typeof flashcards;
  http: typeof http;
  inbox: typeof inbox;
  notes: typeof notes;
  organizationSettings: typeof organizationSettings;
  organizations: typeof organizations;
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
  settings: typeof settings;
  syncReadwise: typeof syncReadwise;
  syncReadwiseMutations: typeof syncReadwiseMutations;
  tags: typeof tags;
  teams: typeof teams;
  testReadwiseApi: typeof testReadwiseApi;
  users: typeof users;
  validateApiKeys: typeof validateApiKeys;
  waitlist: typeof waitlist;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
