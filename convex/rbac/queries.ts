/**
 * RBAC Query Functions
 * 
 * Helper queries for retrieving roles and permissions data.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all roles
 */
export const getRoles = query({
  handler: async (ctx) => {
    return ctx.db.query("roles").collect();
  },
});

/**
 * Get all permissions
 */
export const getPermissions = query({
  handler: async (ctx) => {
    return ctx.db.query("permissions").collect();
  },
});

/**
 * Get permissions for a specific role
 */
export const getPermissionsForRole = query({
  args: { roleSlug: v.string() },
  handler: async (ctx, { roleSlug }) => {
    // Get role
    const role = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", roleSlug))
      .first();

    if (!role) {
      return null;
    }

    // Get role permissions
    const rolePermissions = await ctx.db
      .query("rolePermissions")
      .withIndex("by_role", (q) => q.eq("roleId", role._id))
      .collect();

    // Get permission details
    const permissions = await Promise.all(
      rolePermissions.map((rp) => ctx.db.get(rp.permissionId))
    );

    return {
      role,
      permissions: permissions.filter(Boolean).map((p, i) => ({
        ...p,
        scope: rolePermissions[i].scope,
      })),
    };
  },
});

